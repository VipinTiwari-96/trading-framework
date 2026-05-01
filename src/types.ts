export type Trend = 'Bullish' | 'Bearish' | 'None';
export type TradeResult = 'TP' | 'SL' | 'BE';
export type RiskMode = 'percent' | 'fixed';
export type TradingSession = 'Asia' | 'London' | 'New York' | 'Overlap';
export type EmotionalState = 'Calm' | 'Excited' | 'Fearful' | 'Revenge' | 'Bored';
export type RuleCategory = 'Entry Rules' | 'Risk Management Rules' | 'Trade Management Rules' | 'Psychology Rules';

export interface TradingRule {
  id: string;
  category: RuleCategory;
  title: string;
  description: string;
  required: boolean;
}

export interface PreTradeChecklist {
  assetSelection: boolean;
  higherTimeframeTrend: Trend;
  lowerTimeframeTrend: Trend;
  poiIdentified: boolean;
  convictionLevel: number;
  riskAmount: number;
  riskMode: RiskMode;
}

export interface Trade {
  id: string;
  pair: string;
  date: string;
  session: TradingSession;
  emotionalState: EmotionalState;
  checklist: PreTradeChecklist;
  ruleCompliance: Record<string, boolean>;
  result: TradeResult;
  notes: string;
  disciplineScore: number;
  valid: boolean;
  warnings: string[];
  mistakes: string[];
  screenshot?: string;
  createdAt: string;
}

export interface TradeDraft {
  pair: string;
  date: string;
  session: TradingSession;
  emotionalState: EmotionalState;
  checklist: PreTradeChecklist;
  ruleCompliance: Record<string, boolean>;
  result: TradeResult;
  notes: string;
  mistakes: string[];
  screenshot?: string;
}

export interface JournalFilters {
  pair: string;
  result: 'All' | TradeResult;
  fromDate: string;
  toDate: string;
}

export interface Analytics {
  totalTrades: number;
  winRate: number;
  averageRisk: number;
  ruleFollowingPercentage: number;
  invalidTrades: number;
  todayTrades: number;
  todayInvalidTrades: number;
}

export interface StorageReport {
  storageLimitBytes: number;
  tradeDataBytes: number;
  remainingBytes: number;
  percentUsed: number;
  screenshotBytes: number;
  averageTradeBytes: number;
  estimatedCapacity: number;
  estimatedRemainingEntries: number;
}
