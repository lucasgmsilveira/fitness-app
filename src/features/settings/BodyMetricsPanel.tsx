import { useEffect, useMemo, useState } from 'react';
import { Scale } from 'lucide-react';
import { db } from '../../db/database';
import type { DailyCheckin } from '../../db/types';
import { formatDateBr, getLocalDateString } from '../../utils/date';
import { Card } from '../../components/ui/Card';

interface BodyMetricsPanelProps {
  checkins: DailyCheckin[];
}

export function BodyMetricsPanel({ checkins }: BodyMetricsPanelProps) {
  const [date, setDate] = useState(() => getLocalDateString());
  const [weightKg, setWeightKg] = useState('');
  const [waistCm, setWaistCm] = useState('');
  const [chestCm, setChestCm] = useState('');
  const [armCm, setArmCm] = useState('');
  const [thighCm, setThighCm] = useState('');
  const [savedFeedback, setSavedFeedback] = useState(false);

  const existingForDate = useMemo(
    () => checkins.find((c) => c.date === date),
    [checkins, date]
  );

  useEffect(() => {
    setWeightKg(existingForDate?.weightKg != null ? String(existingForDate.weightKg) : '');
    setWaistCm(existingForDate?.waistCm != null ? String(existingForDate.waistCm) : '');
    setChestCm(existingForDate?.chestCm != null ? String(existingForDate.chestCm) : '');
    setArmCm(existingForDate?.armCm != null ? String(existingForDate.armCm) : '');
    setThighCm(existingForDate?.thighCm != null ? String(existingForDate.thighCm) : '');
  }, [existingForDate]);

  const recentRecords = useMemo(
    () =>
      checkins
        .filter(
          (c) =>
            c.weightKg != null ||
            c.waistCm != null ||
            c.chestCm != null ||
            c.armCm != null ||
            c.thighCm != null
        )
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 6),
    [checkins]
  );

  function parseOptional(val: string): number | null {
    if (val.trim() === '') return null;
    const num = Number(val);
    return Number.isFinite(num) && num > 0 ? Math.round(num * 10) / 10 : null;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await db.dailyCheckins.put({
      ...existingForDate,
      date,
      weightKg: parseOptional(weightKg),
      waistCm: parseOptional(waistCm),
      chestCm: parseOptional(chestCm),
      armCm: parseOptional(armCm),
      thighCm: parseOptional(thighCm),
      updatedAt: new Date().toISOString(),
    });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  }

  return (
    <Card className="space-y-3.5">
      <div>
        <h2 className="text-sm font-bold text-[#F4F4F6] flex items-center gap-2">
          <Scale className="w-4 h-4 text-sky-400" />
          Peso Corporal e Medidas
        </h2>
        <p className="text-xs text-[#9CA3AF] mt-0.5">
          Registre seu peso e medidas opcionais para acompanhar a evolução ao longo das semanas.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-3">
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[0.8125rem] text-[#9CA3AF] mb-1">Data</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-xs text-[#F4F4F6]"
            />
          </div>
          <div>
            <label className="block text-[0.8125rem] text-[#9CA3AF] mb-1">Peso (kg)</label>
            <input
              type="number"
              step="0.1"
              min={0}
              placeholder="Ex: 72.5"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-xs font-semibold text-[#F4F4F6]"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <div>
            <label className="block text-[0.75rem] text-[#9CA3AF] mb-1">Cintura (cm)</label>
            <input
              type="number"
              step="0.5"
              value={waistCm}
              onChange={(e) => setWaistCm(e.target.value)}
              className="w-full px-2 py-2 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-xs text-[#F4F4F6]"
            />
          </div>
          <div>
            <label className="block text-[0.75rem] text-[#9CA3AF] mb-1">Peito (cm)</label>
            <input
              type="number"
              step="0.5"
              value={chestCm}
              onChange={(e) => setChestCm(e.target.value)}
              className="w-full px-2 py-2 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-xs text-[#F4F4F6]"
            />
          </div>
          <div>
            <label className="block text-[0.75rem] text-[#9CA3AF] mb-1">Braço (cm)</label>
            <input
              type="number"
              step="0.5"
              value={armCm}
              onChange={(e) => setArmCm(e.target.value)}
              className="w-full px-2 py-2 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-xs text-[#F4F4F6]"
            />
          </div>
          <div>
            <label className="block text-[0.75rem] text-[#9CA3AF] mb-1">Coxa (cm)</label>
            <input
              type="number"
              step="0.5"
              value={thighCm}
              onChange={(e) => setThighCm(e.target.value)}
              className="w-full px-2 py-2 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-xs text-[#F4F4F6]"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-xs font-semibold"
        >
          {savedFeedback ? 'Registro salvo!' : 'Salvar Peso / Medidas'}
        </button>
      </form>

      {recentRecords.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-[#25252C]">
          <p className="text-[0.8125rem] font-semibold text-[#9CA3AF]">Registros recentes</p>
          {recentRecords.map((item) => (
            <div
              key={item.date}
              className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-[#1E1E24]"
            >
              <span className="text-[#9CA3AF]">{formatDateBr(item.date)}</span>
              <span className="text-[#F4F4F6] tabular-nums">
                {item.weightKg != null ? `${item.weightKg} kg` : '—'}
                {item.waistCm != null ? ` · Cint. ${item.waistCm}cm` : ''}
                {item.armCm != null ? ` · Braço ${item.armCm}cm` : ''}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
