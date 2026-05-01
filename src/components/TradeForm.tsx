import React from 'react';
import { AlertTriangle, ImagePlus, Save } from 'lucide-react';
import { mistakeTags } from '../data/defaults';
import { evaluateTrade, getConsecutiveInvalidTrades } from '../utils/discipline';
import { compressScreenshot } from '../utils/image';
import { EmotionalState, Trade, TradeDraft, TradeResult, TradingRule, TradingSession, Trend } from '../types';

interface TradeFormProps {
  trades: Trade[];
  rules: TradingRule[];
  editingTrade?: Trade | null;
  onSave: (trade: Trade) => void;
  onCancelEdit?: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

const initialDraft = (): TradeDraft => ({
  pair: '',
  date: today(),
  session: 'London',
  emotionalState: 'Calm',
  checklist: {
    assetSelection: false,
    higherTimeframeTrend: 'None',
    lowerTimeframeTrend: 'None',
    poiIdentified: false,
    convictionLevel: 5,
    riskAmount: 1,
    riskMode: 'percent'
  },
  ruleCompliance: {},
  result: 'TP',
  notes: '',
  mistakes: []
});

const draftFromTrade = (trade: Trade): TradeDraft => ({
  pair: trade.pair,
  date: trade.date,
  session: trade.session ?? 'London',
  emotionalState: trade.emotionalState ?? 'Calm',
  checklist: trade.checklist,
  ruleCompliance: trade.ruleCompliance ?? {},
  result: trade.result,
  notes: trade.notes,
  mistakes: trade.mistakes,
  screenshot: trade.screenshot
});

const trends: Trend[] = ['Bullish', 'Bearish', 'None'];
const results: TradeResult[] = ['TP', 'SL', 'BE'];
const pairs = ['XAU/USD', 'EUR/USD', 'BTC/USD'];
const sessions: TradingSession[] = ['Asia', 'London', 'New York', 'Overlap'];
const emotionalStates: EmotionalState[] = ['Calm', 'Excited', 'Fearful', 'Revenge', 'Bored'];

export default function TradeForm({ trades, rules, editingTrade, onSave, onCancelEdit }: TradeFormProps) {
  const [draft, setDraft] = React.useState<TradeDraft>(() => (editingTrade ? draftFromTrade(editingTrade) : initialDraft()));
  const [screenshotStatus, setScreenshotStatus] = React.useState('');
  const evaluation = evaluateTrade(draft, rules);
  const consecutiveInvalid = getConsecutiveInvalidTrades(trades);

  React.useEffect(() => {
    setDraft(editingTrade ? draftFromTrade(editingTrade) : initialDraft());
  }, [editingTrade]);

  const updateChecklist = <K extends keyof TradeDraft['checklist']>(key: K, value: TradeDraft['checklist'][K]) => {
    setDraft({ ...draft, checklist: { ...draft.checklist, [key]: value } });
  };

  const toggleMistake = (tag: string) => {
    const mistakes = draft.mistakes.includes(tag)
      ? draft.mistakes.filter((item) => item !== tag)
      : [...draft.mistakes, tag];
    setDraft({ ...draft, mistakes });
  };

  const handleScreenshot = async (file?: File) => {
    if (!file) return;
    setScreenshotStatus('Compressing screenshot...');
    try {
      const screenshot = await compressScreenshot(file);
      setDraft((current) => ({ ...current, screenshot }));
      setScreenshotStatus('Screenshot compressed and attached');
    } catch {
      setScreenshotStatus('Could not attach screenshot');
    }
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!evaluation.valid) {
      const confirmed = window.confirm(`This trade breaks required discipline checks:\n\n${evaluation.warnings.join('\n')}\n\nSave as invalid?`);
      if (!confirmed) return;
    }

    onSave({
      ...draft,
      id: editingTrade?.id ?? crypto.randomUUID(),
      pair: draft.pair.trim().toUpperCase(),
      disciplineScore: evaluation.disciplineScore,
      valid: evaluation.valid,
      warnings: evaluation.warnings,
      createdAt: editingTrade?.createdAt ?? new Date().toISOString()
    });
    setDraft(initialDraft());
  };

  return (
    <section className="space-y-5">
      <div>
        <p className="label">Add Trade</p>
        <h2 className="mt-1 text-2xl font-bold text-ink">{editingTrade ? 'Edit the trade record' : 'Log the decision before the outcome owns it'}</h2>
      </div>

      {consecutiveInvalid >= 2 && (
        <div className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 shrink-0" size={18} />
          <p>You have {consecutiveInvalid} invalid trades in a row. Slow down and review the rule book before another entry.</p>
        </div>
      )}

      <form onSubmit={submit} className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <div className="panel p-4">
            <h3 className="mb-4 font-bold text-ink">Trade Details</h3>
            <div className="grid gap-4 md:grid-cols-5">
              <label className="space-y-1">
                <span className="label">Pair</span>
                <select className="field" value={draft.pair} onChange={(event) => setDraft({ ...draft, pair: event.target.value })}>
                  <option value="">Select pair</option>
                  {pairs.map((pair) => (
                    <option key={pair} value={pair}>
                      {pair}
                    </option>
                  ))}
                </select>
              </label>
              <SelectField label="Session" value={draft.session} options={sessions} onChange={(value) => setDraft({ ...draft, session: value })} />
              <SelectField label="Emotion" value={draft.emotionalState} options={emotionalStates} onChange={(value) => setDraft({ ...draft, emotionalState: value })} />
              <label className="space-y-1">
                <span className="label">Date</span>
                <input className="field" type="date" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} />
              </label>
              <label className="space-y-1">
                <span className="label">Result</span>
                <select className="field" value={draft.result} onChange={(event) => setDraft({ ...draft, result: event.target.value as TradeResult })}>
                  {results.map((result) => (
                    <option key={result}>{result}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="panel p-4">
            <h3 className="mb-4 font-bold text-ink">Rule Book Confirmation</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {rules.map((rule) => (
                <label key={rule.id} className="rounded-md border border-stone-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-ink">{rule.title}</p>
                      <p className="mt-1 text-xs font-semibold text-stone-500">{rule.category}{rule.required ? ' - Required' : ' - Optional'}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(draft.ruleCompliance[rule.id])}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          ruleCompliance: { ...draft.ruleCompliance, [rule.id]: event.target.checked }
                        })
                      }
                      className="mt-1 h-5 w-5 accent-forest"
                    />
                  </div>
                  {rule.description && <p className="mt-2 text-sm text-stone-600">{rule.description}</p>}
                </label>
              ))}
            </div>
          </div>

          <div className="panel p-4">
            <h3 className="mb-4 font-bold text-ink">Pre-Trade Checklist</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <CheckField label="Asset Selection" checked={draft.checklist.assetSelection} onChange={(value) => updateChecklist('assetSelection', value)} />
              <CheckField label="POI Identified" checked={draft.checklist.poiIdentified} onChange={(value) => updateChecklist('poiIdentified', value)} />
              <SelectField label="Higher Timeframe Trend" value={draft.checklist.higherTimeframeTrend} options={trends} onChange={(value) => updateChecklist('higherTimeframeTrend', value)} />
              <SelectField label="Lower Timeframe Trend" value={draft.checklist.lowerTimeframeTrend} options={trends} onChange={(value) => updateChecklist('lowerTimeframeTrend', value)} />
              <label className="space-y-1">
                <span className="label">Conviction Level: {draft.checklist.convictionLevel}</span>
                <input className="w-full accent-forest" type="range" min="1" max="10" value={draft.checklist.convictionLevel} onChange={(event) => updateChecklist('convictionLevel', Number(event.target.value))} />
              </label>
              <div className="grid grid-cols-[1fr_120px] gap-2">
                <label className="space-y-1">
                  <span className="label">Risk Amount</span>
                  <input className="field" type="number" min="0" step="0.1" value={draft.checklist.riskAmount} onChange={(event) => updateChecklist('riskAmount', Number(event.target.value))} />
                </label>
                <label className="space-y-1">
                  <span className="label">Mode</span>
                  <select className="field" value={draft.checklist.riskMode} onChange={(event) => updateChecklist('riskMode', event.target.value as 'percent' | 'fixed')}>
                    <option value="percent">%</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </label>
              </div>
            </div>
          </div>

          <div className="panel p-4">
            <h3 className="mb-4 font-bold text-ink">Post-Trade Review</h3>
            <textarea className="field min-h-28" value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} placeholder="What went right or wrong?" />
            <div className="mt-4 flex flex-wrap gap-2">
              {mistakeTags.map((tag) => (
                <button key={tag} type="button" onClick={() => toggleMistake(tag)} className={`rounded-md border px-3 py-2 text-sm font-semibold ${draft.mistakes.includes(tag) ? 'border-forest bg-mint text-forest' : 'border-stone-300 text-stone-600'}`}>
                  {tag}
                </button>
              ))}
            </div>
            <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-md border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-600">
              <ImagePlus size={16} />
              Screenshot
              <input className="hidden" type="file" accept="image/*" onChange={(event) => handleScreenshot(event.target.files?.[0])} />
            </label>
            {screenshotStatus && <p className="mt-2 text-sm font-semibold text-stone-500">{screenshotStatus}</p>}
          </div>
        </div>

        <aside className="panel h-fit p-4">
          <p className="label">Discipline Score</p>
          <div className="mt-2 text-5xl font-black text-forest">{evaluation.disciplineScore}%</div>
          <p className={`mt-2 text-sm font-semibold ${evaluation.valid ? 'text-forest' : 'text-red-600'}`}>{evaluation.valid ? 'Valid trade' : 'Invalid unless saved with warning'}</p>
          {evaluation.warnings.length > 0 && (
            <ul className="mt-4 space-y-2 text-sm text-stone-700">
              {evaluation.warnings.map((warning) => (
                <li key={warning} className="rounded-md bg-red-50 px-3 py-2 text-red-700">{warning}</li>
              ))}
            </ul>
          )}
          <button type="submit" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-forest px-4 py-3 font-bold text-white">
            <Save size={18} />
            {editingTrade ? 'Update Trade' : 'Save Trade'}
          </button>
          {editingTrade && (
            <button type="button" onClick={onCancelEdit} className="mt-3 w-full rounded-md border border-stone-300 px-4 py-3 font-bold text-stone-600">
              Cancel Edit
            </button>
          )}
        </aside>
      </form>
    </section>
  );
}

function CheckField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-md border border-stone-200 px-3 py-3">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 accent-forest" />
    </label>
  );
}

function SelectField<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: T[]; onChange: (value: T) => void }) {
  return (
    <label className="space-y-1">
      <span className="label">{label}</span>
      <select className="field" value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
