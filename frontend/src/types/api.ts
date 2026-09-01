// ==========================================
// AUTH & USERS
// ==========================================

export type UserRole = 'admin' | 'trading_center' | 'country' | 'ranking';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  role: UserRole;
  country_id: number | null;
}

export interface UserCreateRequest {
  username: string;
  password: string;
  role: UserRole;
  country_id?: number | null;
}

export interface UserResponse {
  id: number;
  username: string;
  role: UserRole;
  country_id: number | null;
}

// ==========================================
// COUNTRIES & INVENTORIES
// ==========================================

export interface Country {
  id: number;
  name: string;
  username: string;
  money: number | string;
}

export interface CountryCreateRequest {
  name: string;
  username: string;
  password: string;
  money: number;
}

export interface Resource {
  id: number;
  name: string;
  base_value: number | string;
}

export interface ResourceCreateRequest {
  name: string;
  base_value: number;
}

export interface InventoryItem {
  id?: number;
  country_id?: number;
  resource_id: number;
  quantity: number;
  // Augmented for UI
  resource_name?: string;
  base_value?: number;
  current_unit_value?: number;
  total_value?: number;
}

export interface ImportObjective {
  id?: number;
  country_id?: number;
  resource_id: number;
  required_quantity: number;
  imported_quantity: number;
  // Augmented for UI
  resource_name?: string;
}

// ==========================================
// GAME & ROUNDS
// ==========================================

export interface GameStatus {
  id?: number;
  is_started: boolean;
  is_finished: boolean;
}

export interface Round {
  id: number;
  round_number: number;
  is_active: boolean;
  duration_minutes?: number;
  ends_at_timestamp?: number | null;
}

export interface Crisis {
  id?: number;
  round_id?: number;
  resource_id: number;
  value_modifier: number;
  // Augmented for UI
  resource_name?: string;
}

export interface CrisisCreateRequest {
  round_id: number;
  resource_id: number;
  value_modifier: number;
}

// ==========================================
// TRADES
// ==========================================

export type TradeType = 'money' | 'resource';
export type TradeStatus = 'pending' | 'completed' | 'rejected' | 'failed';

export interface TradeCreateRequest {
  round_id: number;
  import_country_id: number;
  export_country_id: number;
  resource_id: number;
  quantity: number;
  price: number;
  trade_type: TradeType;
  payment_resource_id?: number | null;
  payment_quantity?: number | null;
}

export interface Trade {
  id: number;
  round_id: number;
  import_country_id: number;
  import_country_name?: string | null;
  export_country_id: number;
  export_country_name?: string | null;
  resource_id: number;
  resource_name?: string | null;
  quantity: number;
  price: number | string;
  trade_type: TradeType;
  payment_resource_id?: number | null;
  payment_resource_name?: string | null;
  payment_quantity?: number | null;
  status: TradeStatus;
}

// ==========================================
// RANKINGS
// ==========================================

export interface LiveRanking {
  country_id: number;
  country_name: string;
  money: number | string;
  score: number;
  rank: number;
}

export interface FinalRanking {
  id: number;
  country_id: number;
  country_name: string;
  final_money: number | string;
  score: number | string;
  rank: number;
}

// ==========================================
// DASHBOARDS
// ==========================================

export interface CountryDashboardData {
  country: {
    id: number;
    name: string;
    money: number | string;
  };
  active_round: {
    id: number;
    round_number: number;
    is_active?: boolean;
    duration_minutes?: number;
    ends_at_timestamp?: number | null;
  } | null;
  inventory: Array<{
    resource_id: number;
    quantity: number;
  }>;
  objectives: Array<{
    resource_id: number;
    required_quantity: number;
    imported_quantity: number;
  }>;
  crises: Array<{
    resource_id: number;
    value_modifier: number;
  }>;
  trades: Array<{
    id: number;
    round_id: number;
    import_country_id: number;
    export_country_id: number;
    resource_id: number;
    quantity: number;
    price: number | string;
    trade_type: TradeType;
    status: TradeStatus;
  }>;
}

export interface CountryIntel {
  money: number;
  stockpiles: Array<{ resource_id: number; quantity: number }>;
  objectives: Array<{ resource_id: number; required_quantity: number; imported_quantity: number }>;
}

export interface TradingCenterDashboardData {
  active_round: {
    id: number;
    round_number: number;
    is_active?: boolean;
    duration_minutes?: number;
    ends_at_timestamp?: number | null;
  } | null;
  crises: Array<{
    id?: number;
    resource_id: number;
    value_modifier: number;
  }>;
  pending_trades: Array<Trade>;
  recent_completed_trades: Array<Trade>;
  countries_intel?: Record<number, CountryIntel>;
}

export interface AdminDashboardData {
  game: {
    id: number;
    is_started: boolean;
    is_finished: boolean;
  } | null;
  active_round: {
    id: number;
    round_number: number;
    is_active?: boolean;
    duration_minutes?: number;
    ends_at_timestamp?: number | null;
  } | null;
  countries: Array<{
    id: number;
    name: string;
    money: number | string;
  }>;
  crises: Array<{
    id: number;
    resource_id: number;
    value_modifier: number;
  }>;
  pending_trades: Array<Trade>;
  rankings?: Array<LiveRanking>;
}

export interface DirectTradeCreate {
  round_id: number;
  export_country_id: number;
  import_country_id: number;
  resource_id: number;
  quantity: number;
  price?: number;
  trade_type: 'money' | 'resource';
  payment_resource_id?: number | null;
  payment_quantity?: number | null;
}

