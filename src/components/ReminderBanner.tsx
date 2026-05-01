import React from 'react';
import { Sparkles } from 'lucide-react';
import { tradingReminders } from '../data/reminders';

interface ReminderBannerProps {
  name: string;
}

export default function ReminderBanner({ name }: ReminderBannerProps) {
  const [index, setIndex] = React.useState(() => new Date().getDate() % tradingReminders.length);

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % tradingReminders.length);
    }, 45000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-amber-700">Good to see you, {name}</p>
          <p className="mt-2 border-l-4 border-amberline pl-3 text-xl font-black italic leading-snug text-amber-950">
            {tradingReminders[index]}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIndex((current) => (current + 1) % tradingReminders.length)}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-amber-300 bg-white px-3 py-2 text-sm font-bold text-amber-800"
        >
          <Sparkles size={16} />
          Next Reminder
        </button>
      </div>
    </div>
  );
}
