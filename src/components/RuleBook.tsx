import { Plus, Trash2 } from 'lucide-react';
import { RuleCategory, TradingRule } from '../types';

interface RuleBookProps {
  rules: TradingRule[];
  onChange: (rules: TradingRule[]) => void;
}

const categories: RuleCategory[] = ['Entry Rules', 'Risk Management Rules', 'Trade Management Rules', 'Psychology Rules'];

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

  return (
    <section className="space-y-5">
      <div>
        <p className="label">Rule Book</p>
        <h2 className="mt-1 text-2xl font-bold text-ink">Your non-negotiables</h2>
      </div>
      {categories.map((category) => (
        <div key={category} className="panel p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-bold text-ink">{category}</h3>
            <button
              type="button"
              onClick={() => onChange([...rules, newRule(category)])}
              className="inline-flex items-center gap-2 rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white"
            >
              <Plus size={16} />
              Add
            </button>
          </div>
          <div className="space-y-3">
            {rules
              .filter((rule) => rule.category === category)
              .map((rule) => (
                <article key={rule.id} className="rounded-md border border-stone-200 p-3">
                  <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                    <input
                      className="field font-semibold"
                      value={rule.title}
                      onChange={(event) => updateRule({ ...rule, title: event.target.value })}
                    />
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-sm font-medium text-stone-600">
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
                    className="field mt-3 min-h-20"
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
