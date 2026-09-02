import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { GameStatus, Round, Country, Resource } from '../types/api';
import { gameApi } from '../api/game';
import { roundsApi } from '../api/rounds';
import { referenceApi } from '../api/reference';
import { useAuth } from './AuthContext';

interface GameStateContextType {
  gameStatus: GameStatus | null;
  activeRound: Round | null;
  allRounds: Round[];
  countries: Country[];
  resources: Resource[];
  countriesMap: Record<number, Country>;
  resourcesMap: Record<number, Resource>;
  isLoadingState: boolean;
  refreshGameState: () => Promise<void>;
  refreshReferenceData: () => Promise<void>;
  getCountryName: (id: number | null | undefined) => string;
  getResourceName: (id: number | null | undefined) => string;
  getResourceBaseValue: (id: number | null | undefined) => number;
}

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

export const GameStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [gameStatus, setGameStatus] = useState<GameStatus | null>(null);
  const [activeRound, setActiveRound] = useState<Round | null>(null);
  const [allRounds, setAllRounds] = useState<Round[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoadingState, setIsLoadingState] = useState(false);

  const refreshReferenceData = useCallback(async () => {
    try {
      const [cList, resList] = await Promise.all([
        referenceApi.getCountries(),
        referenceApi.getResources(),
      ]);
      setCountries(cList);
      setResources(resList);
    } catch (err) {
      console.error('Error fetching reference data:', err);
    }
  }, []);

  const refreshGameState = useCallback(async () => {
    try {
      setIsLoadingState(true);

      // Fetch game status (might 404 if not started)
      try {
        const gStatus = await gameApi.getStatus();
        setGameStatus(gStatus);
      } catch {
        setGameStatus({ is_started: false, is_finished: false });
      }

      // Fetch rounds
      try {
        const rList = await roundsApi.getRounds();
        setAllRounds(rList);
        const active = rList.find((r) => r.is_active) || null;
        setActiveRound(active);
      } catch (err) {
        console.error('Error fetching rounds:', err);
      }
    } finally {
      setIsLoadingState(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    refreshReferenceData();
    refreshGameState();

    // Gentle polling every 20 seconds if active, paused when tab is in background
    const interval = setInterval(() => {
      if (!document.hidden) {
        refreshGameState();
      }
    }, 20000);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshGameState();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, refreshGameState, refreshReferenceData]);

  const countriesMap = React.useMemo(() => {
    const map: Record<number, Country> = {};
    countries.forEach((c) => {
      map[c.id] = c;
    });
    return map;
  }, [countries]);

  const resourcesMap = React.useMemo(() => {
    const map: Record<number, Resource> = {};
    resources.forEach((r) => {
      map[r.id] = r;
    });
    return map;
  }, [resources]);

  const getCountryName = (id: number | null | undefined): string => {
    if (!id) return 'Unknown Country';
    return countriesMap[id]?.name || `Country #${id}`;
  };

  const getResourceName = (id: number | null | undefined): string => {
    if (!id) return 'Unknown Resource';
    return resourcesMap[id]?.name || `Resource #${id}`;
  };

  const getResourceBaseValue = (id: number | null | undefined): number => {
    if (!id) return 0;
    const val = resourcesMap[id]?.base_value;
    return val ? Number(val) : 0;
  };

  const value: GameStateContextType = {
    gameStatus,
    activeRound,
    allRounds,
    countries,
    resources,
    countriesMap,
    resourcesMap,
    isLoadingState,
    refreshGameState,
    refreshReferenceData,
    getCountryName,
    getResourceName,
    getResourceBaseValue,
  };

  return <GameStateContext.Provider value={value}>{children}</GameStateContext.Provider>;
};

export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
};
