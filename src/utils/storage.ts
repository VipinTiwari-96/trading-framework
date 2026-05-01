import { StorageReport, Trade, TradingRule } from '../types';
import { defaultRules } from '../data/defaults';

const TRADES_KEY = 'disciplineJournal.trades';
const RULES_KEY = 'disciplineJournal.rules';
const DB_NAME = 'disciplineJournalDb';
const DB_VERSION = 1;
const STORE_NAME = 'journal';

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

const openDatabase = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const readFromDb = async <T,>(key: string, fallback: T): Promise<T> => {
  const db = await openDatabase();
  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);

    request.onsuccess = () => resolve((request.result as T | undefined) ?? fallback);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
  });
};

const writeToDb = async <T,>(key: string, value: T): Promise<void> => {
  const db = await openDatabase();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(value, key);

    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
  });
};

export const loadJournalData = async () => {
  const storedTrades = await readFromDb<Trade[] | null>(TRADES_KEY, null);
  const storedRules = await readFromDb<TradingRule[] | null>(RULES_KEY, null);

  const migratedTrades = storedTrades ?? loadTrades();
  const migratedRules = storedRules ?? loadRules();

  if (!storedTrades) {
    await writeToDb(TRADES_KEY, migratedTrades);
  }

  if (!storedRules) {
    await writeToDb(RULES_KEY, migratedRules);
  }

  return { trades: migratedTrades, rules: migratedRules };
};

export const saveTradesToDb = (trades: Trade[]) => writeToDb(TRADES_KEY, trades);
export const saveRulesToDb = (rules: TradingRule[]) => writeToDb(RULES_KEY, rules);

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

export const getStorageReport = (trades: Trade[], storageLimitBytes = 5 * 1024 * 1024): StorageReport => {
  const tradeDataBytes = new Blob([JSON.stringify(trades)]).size;
  const screenshotBytes = trades.reduce((sum, trade) => sum + dataUrlBytes(trade.screenshot), 0);
  const averageTradeBytes = trades.length ? Math.ceil(tradeDataBytes / trades.length) : 0;
  const remainingBytes = Math.max(0, storageLimitBytes - tradeDataBytes);
  const percentUsed = Math.min(100, Number(((tradeDataBytes / storageLimitBytes) * 100).toFixed(1)));
  const estimatedCapacity = averageTradeBytes ? Math.floor(storageLimitBytes / averageTradeBytes) : 0;
  const estimatedRemainingEntries = averageTradeBytes ? Math.max(0, Math.floor(remainingBytes / averageTradeBytes)) : 0;

  return {
    storageLimitBytes,
    tradeDataBytes,
    remainingBytes,
    percentUsed,
    screenshotBytes,
    averageTradeBytes,
    estimatedCapacity,
    estimatedRemainingEntries
  };
};
