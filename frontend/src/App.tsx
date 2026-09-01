import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { GameStateProvider } from './context/GameStateContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RootRedirect } from './routes/RootRedirect';
import { Login } from './pages/Login';
import { CountryDashboard } from './pages/CountryDashboard';
import { TradingCenterDashboard } from './pages/TradingCenterDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { RankingsPage } from './pages/RankingsPage';
import { NotFound } from './pages/NotFound';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <GameStateProvider>
            <Routes>
              {/* Public Entry Routes */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<Login />} />

              {/* Authenticated Application Layout */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route
                  path="/country"
                  element={
                    <ProtectedRoute allowedRoles={['country']}>
                      <CountryDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trading-center"
                  element={
                    <ProtectedRoute allowedRoles={['trading_center']}>
                      <TradingCenterDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rankings"
                  element={
                    <ProtectedRoute allowedRoles={['ranking', 'admin']}>
                      <RankingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </GameStateProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
