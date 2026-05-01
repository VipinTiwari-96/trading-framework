import { BarChart3, BookOpen, ClipboardPenLine, ListChecks } from 'lucide-react';

export type View = 'rules' | 'add' | 'journal' | 'stats';

interface SidebarProps {
  activeView: View;
  onNavigate: (view: View) => void;
}

const items = [
  { view: 'rules' as const, label: 'Rule Book', icon: BookOpen },
  { view: 'add' as const, label: 'Add Trade', icon: ClipboardPenLine },
  { view: 'journal' as const, label: 'Journal', icon: ListChecks },
  { view: 'stats' as const, label: 'Stats', icon: BarChart3 }
];

export default function Sidebar({ activeView, onNavigate }: SidebarProps) {
  return (
    <aside className="border-b border-stone-200 bg-white lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col gap-6 p-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-forest">Discipline Desk</p>
          <h1 className="mt-1 text-xl font-bold text-ink">Trading Journal</h1>
        </div>
        <nav className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.view;
            return (
              <button
                key={item.view}
                type="button"
                onClick={() => onNavigate(item.view)}
                className={`flex items-center gap-3 rounded-md px-3 py-3 text-left text-sm font-semibold transition ${
                  active ? 'bg-forest text-white' : 'text-stone-600 hover:bg-mint hover:text-forest'
                }`}
                title={item.label}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
