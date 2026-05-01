import React from 'react';
import Journal from './components/Journal';
import RuleBook from './components/RuleBook';
import Sidebar, { View } from './components/Sidebar';
import Stats from './components/Stats';
import TradeForm from './components/TradeForm';
import { Trade, TradingRule } from './types';
import { loadRules, loadTrades, saveRules, saveTrades } from './utils/storage';

export default function App() {
  const [activeView, setActiveView] = React.useState<View>('stats');
  const [rules, setRules] = React.useState<TradingRule[]>(() => loadRules());
  const [trades, setTrades] = React.useState<Trade[]>(() => loadTrades());
  const [editingTrade, setEditingTrade] = React.useState<Trade | null>(null);

  React.useEffect(() => {
    saveRules(rules);
  }, [rules]);

  React.useEffect(() => {
    saveTrades(trades);
  }, [trades]);

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

  return (
    <div className="min-h-screen bg-paper text-ink lg:flex">
      <Sidebar activeView={activeView} onNavigate={navigate} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {activeView === 'rules' && <RuleBook rules={rules} onChange={setRules} />}
          {activeView === 'add' && (
            <TradeForm
              trades={trades}
              rules={rules}
              editingTrade={editingTrade}
              onSave={addTrade}
              onCancelEdit={() => setEditingTrade(null)}
            />
          )}
          {activeView === 'journal' && <Journal trades={trades} onDelete={deleteTrade} onEdit={startEditTrade} />}
          {activeView === 'stats' && <Stats trades={trades} />}
        </div>
      </main>
    </div>
  );
}
