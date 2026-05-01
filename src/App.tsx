import React from 'react';
import Journal from './components/Journal';
import ProfileGate from './components/ProfileGate';
import ReminderBanner from './components/ReminderBanner';
import RuleBook from './components/RuleBook';
import Sidebar, { View } from './components/Sidebar';
import Stats from './components/Stats';
import TradeForm from './components/TradeForm';
import { defaultRules } from './data/defaults';
import { Trade, TradingRule, UserProfile } from './types';
import { compressScreenshotDataUrl } from './utils/image';
import { loadJournalData, loadProfile, saveProfile, saveRulesToDb, saveTradesToDb } from './utils/storage';

export default function App() {
  const [activeView, setActiveView] = React.useState<View>('stats');
  const [rules, setRules] = React.useState<TradingRule[]>(defaultRules);
  const [trades, setTrades] = React.useState<Trade[]>([]);
  const [editingTrade, setEditingTrade] = React.useState<Trade | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(() => loadProfile());
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    loadJournalData()
      .then((data) => {
        setRules(data.rules);
        setTrades(data.trades);
      })
      .finally(() => setLoaded(true));
  }, []);

  React.useEffect(() => {
    if (loaded) {
      void saveRulesToDb(rules);
    }
  }, [loaded, rules]);

  React.useEffect(() => {
    if (loaded) {
      void saveTradesToDb(trades);
    }
  }, [loaded, trades]);

  const addTrade = (trade: Trade) => {
    setTrades((current) => {
      const exists = current.some((item) => item.id === trade.id);
      return exists ? current.map((item) => (item.id === trade.id ? trade : item)) : [trade, ...current];
    });
    setEditingTrade(null);
    setActiveView('journal');
  };

  const deleteTrade = (tradeId: string) => {
    setTrades((current) => current.filter((trade) => trade.id !== tradeId));
    if (editingTrade?.id === tradeId) {
      setEditingTrade(null);
    }
  };

  const startEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
    setActiveView('add');
  };

  const navigate = (view: View) => {
    setEditingTrade(null);
    setActiveView(view);
  };

  const updateProfile = (nextProfile: UserProfile) => {
    setProfile(nextProfile);
    saveProfile(nextProfile);
  };

  const exportBackup = () => {
    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      trades,
      rules
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `trading-journal-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const backup = JSON.parse(String(reader.result)) as { trades?: Trade[]; rules?: TradingRule[] };
        if (!Array.isArray(backup.trades) || !Array.isArray(backup.rules)) {
          throw new Error('Invalid backup');
        }
        const confirmed = window.confirm('Importing this backup will replace your current trades and rules. Continue?');
        if (!confirmed) return;
        setTrades(backup.trades);
        setRules(backup.rules);
        setEditingTrade(null);
        setActiveView('stats');
        window.alert('Backup imported successfully.');
      } catch {
        window.alert('This backup file could not be imported.');
      }
    };
    reader.readAsText(file);
  };

  const optimizeScreenshots = async () => {
    const tradesWithScreenshots = trades.filter((trade) => trade.screenshot);
    if (tradesWithScreenshots.length === 0) {
      window.alert('No screenshots found to optimize.');
      return;
    }

    const confirmed = window.confirm(`Optimize ${tradesWithScreenshots.length} saved screenshot(s)? This will replace large screenshots with compressed versions.`);
    if (!confirmed) return;

    let optimizedCount = 0;
    const optimizedTrades = await Promise.all(
      trades.map(async (trade) => {
        if (!trade.screenshot) return trade;
        try {
          const compressed = await compressScreenshotDataUrl(trade.screenshot);
          if (compressed.length < trade.screenshot.length) {
            optimizedCount += 1;
            return { ...trade, screenshot: compressed };
          }
        } catch {
          return trade;
        }
        return trade;
      })
    );

    setTrades(optimizedTrades);
    window.alert(optimizedCount ? `Optimized ${optimizedCount} screenshot(s).` : 'Screenshots are already optimized.');
  };

  if (!profile) {
    return <ProfileGate onSave={updateProfile} />;
  }

  return (
    <div className="min-h-screen bg-paper text-ink lg:flex">
      <Sidebar activeView={activeView} onNavigate={navigate} profile={profile} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {loaded && <ReminderBanner name={profile.name} />}
          {!loaded && <div className="panel p-8 text-center font-semibold text-stone-600">Loading journal...</div>}
          {loaded && activeView === 'rules' && <RuleBook rules={rules} onChange={setRules} />}
          {loaded && activeView === 'add' && (
            <TradeForm
              trades={trades}
              rules={rules}
              editingTrade={editingTrade}
              onSave={addTrade}
              onCancelEdit={() => setEditingTrade(null)}
            />
          )}
          {loaded && activeView === 'journal' && <Journal trades={trades} onDelete={deleteTrade} onEdit={startEditTrade} />}
          {loaded && activeView === 'stats' && (
            <Stats
              trades={trades}
              onExportBackup={exportBackup}
              onImportBackup={importBackup}
              onOptimizeScreenshots={optimizeScreenshots}
            />
          )}
        </div>
      </main>
    </div>
  );
}
