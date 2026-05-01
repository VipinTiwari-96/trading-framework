import React from 'react';
import { LogIn } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileGateProps {
  onSave: (profile: UserProfile) => void;
}

export default function ProfileGate({ onSave }: ProfileGateProps) {
  const [name, setName] = React.useState('');

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;

    onSave({
      name: cleanName,
      createdAt: new Date().toISOString()
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper p-4">
      <form onSubmit={submit} className="panel w-full max-w-md p-6">
        <p className="label">Welcome</p>
        <h1 className="mt-1 text-2xl font-black text-ink">Set up your trading desk</h1>
        <p className="mt-3 text-sm text-stone-600">
          Enter your name so the journal can greet you and keep the reminders personal.
        </p>
        <label className="mt-6 block space-y-1">
          <span className="label">Trader name</span>
          <input
            className="field"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            autoFocus
          />
        </label>
        <button type="submit" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-forest px-4 py-3 font-bold text-white">
          <LogIn size={18} />
          Enter Journal
        </button>
      </form>
    </main>
  );
}
