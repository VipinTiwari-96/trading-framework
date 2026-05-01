import React from 'react';
import { Calendar, Edit3, Filter, ShieldAlert, ShieldCheck, Trash2 } from 'lucide-react';
import { JournalFilters, Trade, TradeResult } from '../types';

interface JournalProps {
  trades: Trade[];
  onDelete: (tradeId: string) => void;
  onEdit: (trade: Trade) => void;
}

const resultOptions: JournalFilters['result'][] = ['All', 'TP', 'SL', 'BE'];

export default function Journal({ trades, onDelete, onEdit }: JournalProps) {
  const [filters, setFilters] = React.useState<JournalFilters>({ pair: '', result: 'All', fromDate: '', toDate: '' });

  const deleteTrade = (trade: Trade) => {
    const confirmed = window.confirm(`Delete ${trade.pair} from ${trade.date}? This cannot be undone.`);
    if (confirmed) {
      onDelete(trade.id);
    }
  };

  const visibleTrades = trades.filter((trade) => {
    const pairMatch = trade.pair.toLowerCase().includes(filters.pair.toLowerCase());
    const resultMatch = filters.result === 'All' || trade.result === filters.result;
    const fromMatch = !filters.fromDate || trade.date >= filters.fromDate;
    const toMatch = !filters.toDate || trade.date <= filters.toDate;
    return pairMatch && resultMatch && fromMatch && toMatch;
  });

  return (
    <section className="space-y-5">
      <div>
        <p className="label">Trade Journal</p>
        <h2 className="mt-1 text-2xl font-bold text-ink">Evidence over memory</h2>
      </div>

      <div className="panel p-4">
        <div className="mb-3 flex items-center gap-2 font-bold text-ink">
          <Filter size={18} />
          Filters
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <input className="field" placeholder="Pair" value={filters.pair} onChange={(event) => setFilters({ ...filters, pair: event.target.value })} />
          <select className="field" value={filters.result} onChange={(event) => setFilters({ ...filters, result: event.target.value as 'All' | TradeResult })}>
            {resultOptions.map((result) => (
              <option key={result}>{result}</option>
            ))}
          </select>
          <input className="field" type="date" value={filters.fromDate} onChange={(event) => setFilters({ ...filters, fromDate: event.target.value })} />
          <input className="field" type="date" value={filters.toDate} onChange={(event) => setFilters({ ...filters, toDate: event.target.value })} />
        </div>
      </div>

      <div className="grid gap-4">
        {visibleTrades.length === 0 && <div className="panel p-8 text-center text-stone-500">No trades match these filters.</div>}
        {visibleTrades.map((trade) => (
          <article key={trade.id} className="panel p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-black text-ink">{trade.pair}</h3>
                  <span className={`rounded-md px-2 py-1 text-xs font-bold ${trade.result === 'TP' ? 'bg-mint text-forest' : trade.result === 'SL' ? 'bg-red-50 text-red-700' : 'bg-stone-100 text-stone-600'}`}>{trade.result}</span>
                  <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold ${trade.valid ? 'bg-mint text-forest' : 'bg-red-50 text-red-700'}`}>
                    {trade.valid ? <ShieldCheck size={13} /> : <ShieldAlert size={13} />}
                    {trade.valid ? 'Valid' : 'Invalid'}
                  </span>
                </div>
                <p className="mt-2 flex items-center gap-2 text-sm text-stone-500">
                  <Calendar size={15} />
                  {trade.date}
                </p>
              </div>
              <div className="flex items-start justify-between gap-4 md:block md:text-right">
                <div>
                  <p className="label">Discipline</p>
                  <p className="text-3xl font-black text-forest">{trade.disciplineScore}%</p>
                </div>
                <div className="flex gap-2 md:mt-3 md:justify-end">
                  <button
                    type="button"
                    onClick={() => onEdit(trade)}
                    className="rounded-md border border-stone-300 p-2 text-stone-500 transition hover:border-forest hover:bg-mint hover:text-forest"
                    title="Edit trade"
                    aria-label={`Edit ${trade.pair} trade`}
                  >
                    <Edit3 size={17} />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteTrade(trade)}
                    className="rounded-md border border-stone-300 p-2 text-stone-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    title="Delete trade"
                    aria-label={`Delete ${trade.pair} trade`}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-stone-600">
              <span className="rounded-md bg-stone-100 px-2 py-1">{trade.session ?? 'Session not set'}</span>
              <span className="rounded-md bg-stone-100 px-2 py-1">{trade.emotionalState ?? 'Emotion not set'}</span>
            </div>
            {trade.notes && <p className="mt-4 rounded-md bg-stone-50 p-3 text-sm text-stone-700">{trade.notes}</p>}
            {trade.mistakes.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {trade.mistakes.map((mistake) => (
                  <span key={mistake} className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">{mistake}</span>
                ))}
              </div>
            )}
            {trade.screenshot && <img src={trade.screenshot} alt={`${trade.pair} trade screenshot`} className="mt-4 max-h-72 rounded-md border border-stone-200 object-contain" />}
          </article>
        ))}
      </div>
    </section>
  );
}
