import { useEffect, useMemo, useState } from 'react';
import { Activity } from 'lucide-react';
import { db } from '../../db/database';
import type { DailyCheckin } from '../../db/types';
import { formatDateBr, getLocalDateString } from '../../utils/date';
import { Card } from '../../components/ui/Card';

interface LumbarCheckinPanelProps {
  checkins: DailyCheckin[];
}

export function LumbarCheckinPanel({ checkins }: LumbarCheckinPanelProps) {
  const [date, setDate] = useState(() => getLocalDateString());
  const [score, setScore] = useState<number>(0);
  const [note, setNote] = useState('');
  const [savedFeedback, setSavedFeedback] = useState(false);

  const existing = useMemo(() => checkins.find((c) => c.date === date), [checkins, date]);

  useEffect(() => {
    setScore(existing?.lumbarScore ?? 0);
    setNote(existing?.stiffnessNote ?? '');
  }, [existing]);

  const recent = useMemo(
    () =>
      checkins
        .filter((c) => c.lumbarScore !== null && c.lumbarScore !== undefined)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 5),
    [checkins]
  );

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await db.dailyCheckins.put({
      ...existing,
      date,
      lumbarScore: score,
      stiffnessNote: note.trim() || undefined,
      updatedAt: new Date().toISOString(),
    });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  }

  return (
    <Card className="space-y-3.5">
      <div>
        <h2 className="text-sm font-bold text-[#F4F4F6] flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#F43F5E]" />
          Check-in Diário — Bem-estar / Lombar (24–48h)
        </h2>
        <p className="text-xs text-[#9CA3AF] mt-0.5">
          Acompanhe como o corpo responde no dia seguinte aos treinos (0 = sem desconforto, 10 = desconforto alto).
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-3">
        <div>
          <label className="block text-[0.8125rem] text-[#9CA3AF] mb-1">Data</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-xs text-[#F4F4F6]"
          />
        </div>

        <div className="grid grid-cols-11 gap-1">
          {Array.from({ length: 11 }, (_, n) => {
            const active = score === n;
            const tone =
              n <= 2
                ? 'border-[#84CC16] bg-[#84CC16]/20 text-[#84CC16]'
                : n <= 5
                  ? 'border-[#F97316] bg-[#F97316]/20 text-[#F97316]'
                  : 'border-red-500 bg-red-500/20 text-red-400';
            return (
              <button
                key={n}
                type="button"
                onClick={() => setScore(n)}
                className={`py-1.5 rounded-lg text-xs font-semibold border ${
                  active
                    ? tone
                    : 'bg-[#1E1E24] border-[#2C2C35] text-[#9CA3AF] hover:text-white'
                }`}
              >
                {n}
              </button>
            );
          })}
        </div>

        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Nota opcional (ex: rigidez matinal leve, sem sintomas...)"
          className="w-full px-3 py-2 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-xs text-[#F4F4F6]"
        />

        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-[#F43F5E]/20 hover:bg-[#F43F5E]/30 border border-[#F43F5E]/40 text-rose-300 text-xs font-semibold"
        >
          {savedFeedback ? 'Check-in salvo!' : 'Salvar Check-in'}
        </button>
      </form>

      {recent.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-[#25252C]">
          <p className="text-[0.8125rem] font-semibold text-[#9CA3AF]">Últimos check-ins</p>
          {recent.map((item) => (
            <div
              key={item.date}
              className="flex items-center justify-between gap-2 text-xs py-1 px-2.5 rounded-lg bg-[#1E1E24]"
            >
              <span className="text-[#9CA3AF] shrink-0">{formatDateBr(item.date)}</span>
              <span className="text-[#D1D5DB] truncate">{item.stiffnessNote || '—'}</span>
              <span className="font-bold tabular-nums shrink-0">{item.lumbarScore}/10</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
