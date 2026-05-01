import { ElementType } from 'react';
import { AlertTriangle, Brain, CheckCircle2, Plus, ShieldCheck, Target, Trash2 } from 'lucide-react';
import { RuleCategory, TradingRule } from '../types';

interface RuleBookProps {
  rules: TradingRule[];
  onChange: (rules: TradingRule[]) => void;
}

const categoryMeta: Record<RuleCategory, { focus: string; cue: string; tone: string }> = {
  'Entry Rules': {
    focus: 'Only enter when the setup earns attention.',
    cue: 'No setup, no trade.',
    tone: 'border-forest bg-mint'
  },
  'Risk Management Rules': {
    focus: 'Protect capital before thinking about profit.',
    cue: 'Risk is chosen before emotion arrives.',
    tone: 'border-amber-300 bg-amber-50'
  },
  'Trade Management Rules': {
    focus: 'Manage the position from rules, not impulse.',
    cue: 'Follow the plan after entry too.',
    tone: 'border-sky-200 bg-sky-50'
  },
  'Psychology Rules': {
    focus: 'Guard the mind that places the trade.',
    cue: 'If the mind is noisy, stand aside.',
    tone: 'border-red-200 bg-red-50'
  }
};

const categories = Object.keys(categoryMeta) as RuleCategory[];

const newRule = (category: RuleCategory): TradingRule => ({
  id: crypto.randomUUID(),
  category,
  title: 'New rule',
  description: '',
  required: false
});

export default function RuleBook({ rules, onChange }: RuleBookProps) {
  const updateRule = (updated: TradingRule) => onChange(rules.map((rule) => (rule.id === updated.id ? updated : rule)));
  const deleteRule = (id: string) => onChange(rules.filter((rule) => rule.id !== id));
  const requiredCount = rules.filter((rule) => rule.required).length;

  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-forest bg-white p-5 shadow-sm">
        <div className="grid gap-5 lg:grid-cols-[1fr_280px] lg:items-center">
          <div>
            <p className="label">Rule Book</p>
            <h2 className="mt-1 text-3xl font-black text-ink">Your discipline contract</h2>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-stone-600">
              Rules are written before pressure arrives. Required rules become checkpoints in every trade, so the app rewards process and flags broken discipline.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md bg-mint p-3">
              <p className="label">Total Rules</p>
              <p className="mt-1 text-3xl font-black text-forest">{rules.length}</p>
            </div>
            <div className="rounded-md bg-amber-50 p-3">
              <p className="label">Required</p>
              <p className="mt-1 text-3xl font-black text-amber-700">{requiredCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <PsychCue icon={Brain} title="Pause" text="Read the rule before touching the trade." />
        <PsychCue icon={Target} title="Commit" text="Required means the trade must answer to it." />
        <PsychCue icon={ShieldCheck} title="Protect" text="Your edge is behavior repeated cleanly." />
      </div>

      {categories.map((category) => (
        <div key={category} className={`rounded-lg border p-4 shadow-sm ${categoryMeta[category].tone}`}>
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 className="text-xl font-black text-ink">{category}</h3>
              <p className="mt-1 text-sm font-semibold text-stone-700">{categoryMeta[category].focus}</p>
              <p className="mt-2 inline-flex rounded-md bg-white px-2 py-1 text-xs font-black uppercase tracking-wide text-stone-600">
                {categoryMeta[category].cue}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onChange([...rules, newRule(category)])}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white"
            >
              <Plus size={16} />
              Add
            </button>
          </div>
          <div className="space-y-3">
            {rules
              .filter((rule) => rule.category === category)
              .map((rule) => (
                <article key={rule.id} className={`rounded-md border bg-white p-4 shadow-sm ${rule.required ? 'border-amber-300 ring-2 ring-amber-100' : 'border-stone-200'}`}>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-black uppercase tracking-wide ${rule.required ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-600'}`}>
                      {rule.required ? <AlertTriangle size={13} /> : <CheckCircle2 size={13} />}
                      {rule.required ? 'Required checkpoint' : 'Guiding rule'}
                    </span>
                  </div>
                  <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                    <input
                      className="field text-base font-black"
                      value={rule.title}
                      onChange={(event) => updateRule({ ...rule, title: event.target.value })}
                    />
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 rounded-md border border-stone-200 px-3 py-2 text-sm font-bold text-stone-700">
                        <input
                          type="checkbox"
                          checked={rule.required}
                          onChange={(event) => updateRule({ ...rule, required: event.target.checked })}
                        />
                        Required
                      </label>
                      <button
                        type="button"
                        onClick={() => deleteRule(rule.id)}
                        className="rounded-md border border-stone-300 p-2 text-stone-500 hover:border-red-200 hover:text-red-600"
                        title="Delete rule"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <textarea
                    className="field mt-3 min-h-24 leading-6"
                    value={rule.description}
                    onChange={(event) => updateRule({ ...rule, description: event.target.value })}
                    placeholder="Describe the rule clearly enough to hold future-you accountable."
                  />
                </article>
              ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function PsychCue({ icon: Icon, title, text }: { icon: ElementType; title: string; text: string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <Icon className="text-forest" size={20} />
      <p className="mt-3 text-sm font-black uppercase tracking-wide text-ink">{title}</p>
      <p className="mt-1 text-sm font-medium leading-6 text-stone-600">{text}</p>
    </div>
  );
}
