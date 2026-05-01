import { StorageReport, Trade, TradingRule } from '../types';
import { defaultRules } from '../data/defaults';

const TRADES_KEY = 'disciplineJournal.trades';
const RULES_KEY = 'disciplineJournal.rules';

const read = <T,>(key: string, fallback: T): T => {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
};

export const loadTrades = (): Trade[] => read<Trade[]>(TRADES_KEY, []);
export const loadRules = (): TradingRule[] => read<TradingRule[]>(RULES_KEY, defaultRules);

export const saveTrades = (trades: Trade[]) => {
  localStorage.setItem(TRADES_KEY, JSON.stringify(trades));
};

export const saveRules = (rules: TradingRule[]) => {
  localStorage.setItem(RULES_KEY, JSON.stringify(rules));
};

const dataUrlBytes = (value?: string) => {
  if (!value) return 0;
  const base64 = value.includes(',') ? value.split(',')[1] : value;
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor((base64.length * 3) / 4) - padding);
};

export const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

export const getStorageReport = (trades: Trade[]): StorageReport => {
  const tradeDataBytes = new Blob([JSON.stringify(trades)]).size;
  const screenshotBytes = trades.reduce((sum, trade) => sum + dataUrlBytes(trade.screenshot), 0);
  const averageTradeBytes = trades.length ? Math.ceil(tradeDataBytes / trades.length) : 0;
  const localStorageBudget = 5 * 1024 * 1024;
  const remainingBytes = Math.max(0, localStorageBudget - tradeDataBytes);
  const percentUsed = Math.min(100, Number(((tradeDataBytes / localStorageBudget) * 100).toFixed(1)));
  const estimatedCapacity = averageTradeBytes ? Math.floor(localStorageBudget / averageTradeBytes) : 0;
  const estimatedRemainingEntries = averageTradeBytes ? Math.max(0, Math.floor(remainingBytes / averageTradeBytes)) : 0;

  return {
    storageLimitBytes: localStorageBudget,
    tradeDataBytes,
    remainingBytes,
    percentUsed,
    screenshotBytes,
    averageTradeBytes,
    estimatedCapacity,
    estimatedRemainingEntries
  };
};
