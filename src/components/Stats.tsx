import React from 'react';
import { AlertTriangle, BarChart3, CheckCircle2, Database, Percent, Target, Wallet } from 'lucide-react';
import { getAnalytics } from '../utils/discipline';
import { formatBytes, getStorageReport } from '../utils/storage';
import { Trade } from '../types';

interface StatsProps {
  trades: Trade[];
}

export default function Stats({ trades }: StatsProps) {
  const analytics = getAnalytics(trades);
  const storage = getStorageReport(trades);
  const recent = trades.slice(0, 5);

  return (
    <section className="space-y-5">
      <div>
        <p className="label">Analytics Dashboard</p>
        <h2 className="mt-1 text-2xl font-bold text-ink">Measure the behavior, not just the P&L</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric icon={BarChart3} label="Total Trades" value={analytics.totalTrades} />
        <Metric icon={Target} label="Win Rate" value={`${analytics.winRate}%`} />
        <Metric icon={Wallet} label="Average Risk" value={analytics.averageRisk} />
        <Metric icon={Percent} label="Rule-Following" value={`${analytics.ruleFollowingPercentage}%`} />
        <Metric icon={AlertTriangle} label="Invalid Trades" value={analytics.invalidTrades} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="panel p-4">
          <h3 className="mb-4 font-bold text-ink">Recent Discipline</h3>
          <div className="space-y-3">
            {recent.length === 0 && <p className="text-sm text-stone-500">No trades logged yet.</p>}
            {recent.map((trade) => (
              <div key={trade.id} className="grid gap-2 rounded-md border border-stone-200 p-3 md:grid-cols-[120px_1fr_80px] md:items-center">
                <div className="font-bold text-ink">{trade.pair}</div>
                <div className="h-3 overflow-hidden rounded-full bg-stone-100">
                  <div className={`h-full ${trade.valid ? 'bg-forest' : 'bg-amberline'}`} style={{ width: `${trade.disciplineScore}%` }} />
                </div>
                <div className="text-sm font-black text-forest md:text-right">{trade.disciplineScore}%</div>
              </div>
            ))}
          </div>
        </div>
        <div className="panel p-4">
          <h3 className="mb-4 font-bold text-ink">Daily Summary</h3>
          <div className="space-y-3 text-sm">
            <SummaryRow label="Trades today" value={analytics.todayTrades} />
            <SummaryRow label="Invalid today" value={analytics.todayInvalidTrades} />
            <SummaryRow label="Valid today" value={analytics.todayTrades - analytics.todayInvalidTrades} />
          </div>
          <div className="mt-5 flex items-start gap-3 rounded-md bg-mint p-3 text-sm text-forest">
            <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
            <p>Keep the journal honest: invalid trades are useful data when they are recorded clearly.</p>
          </div>
        </div>
      </div>

      <div className="panel p-4">
        <div className="mb-4 flex items-center gap-2 font-bold text-ink">
          <Database size={18} />
          Storage Estimate
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <StorageStat label="Storage used" value={formatBytes(storage.tradeDataBytes)} />
          <StorageStat label="Storage remaining" value={formatBytes(storage.remainingBytes)} />
          <StorageStat label="Storage limit" value={formatBytes(storage.storageLimitBytes)} />
          <StorageStat label="Used percentage" value={`${storage.percentUsed}%`} />
          <StorageStat label="Screenshots inside trades" value={formatBytes(storage.screenshotBytes)} />
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-stone-100">
          <div className="h-full bg-forest" style={{ width: `${storage.percentUsed}%` }} />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <StorageStat label="Average per trade" value={formatBytes(storage.averageTradeBytes)} />
          <StorageStat label="Estimated total entries" value={storage.estimatedCapacity || '-'} />
          <StorageStat label="Estimated remaining entries" value={storage.estimatedRemainingEntries || '-'} />
        </div>
        <p className="mt-3 text-sm text-stone-500">
          Estimate uses a typical 5 MB localStorage limit. Large screenshots are the main storage cost.
        </p>
      </div>
    </section>
  );
}

function Metric({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="metric">
      <Icon className="text-forest" size={20} />
      <p className="label mt-4">{label}</p>
      <p className="mt-1 text-3xl font-black text-ink">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-stone-200 px-3 py-2">
      <span className="font-semibold text-stone-600">{label}</span>
      <span className="font-black text-ink">{value}</span>
    </div>
  );
}

function StorageStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-stone-200 p-3">
      <p className="label">{label}</p>
      <p className="mt-1 text-xl font-black text-ink">{value}</p>
    </div>
  );
}
