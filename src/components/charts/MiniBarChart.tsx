import type { WeeklyFrequencyPoint } from '../../utils/workoutStats';

interface MiniBarChartProps {
  data: WeeklyFrequencyPoint[];
}

export function MiniBarChart({ data }: MiniBarChartProps) {
  const maxCount = Math.max(4, ...data.map((d) => d.count));

  return (
    <div className="pt-2">
      <div className="grid grid-cols-6 gap-2 items-end h-32">
        {data.map((item) => {
          const pct = Math.round((item.count / maxCount) * 100);
          return (
            <div key={item.weekStart} className="flex flex-col items-center gap-1.5 h-full justify-end">
              <span className="text-[0.8125rem] font-semibold text-[#F4F4F6] tabular-nums">
                {item.count}
              </span>
              <div className="w-full max-w-8 h-20 bg-[#1E1E24] rounded-lg flex items-end overflow-hidden p-0.5">
                <div
                  className="w-full rounded-md bg-[#84CC16] transition-all duration-300"
                  style={{ height: `${Math.max(item.count > 0 ? 12 : 0, pct)}%` }}
                />
              </div>
              <span className="text-[0.75rem] text-[#9CA3AF] tabular-nums">{item.label}</span>
            </div>
          );
        })}
      </div>
      <p className="text-[0.8125rem] text-[#9CA3AF] text-center mt-2">
        Sessões concluídas por semana (início na segunda-feira)
      </p>
    </div>
  );
}
