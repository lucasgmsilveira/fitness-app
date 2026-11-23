import { Pause, Play, RotateCcw, Timer, X } from 'lucide-react';
import { formatDuration } from '../../utils/date';

interface RestTimerBarProps {
  remainingSec: number;
  totalSec: number;
  running: boolean;
  onToggleRun: () => void;
  onAdjust: (deltaSec: number) => void;
  onResetPreset: (seconds: number) => void;
  onDismiss: () => void;
}

export function RestTimerBar({
  remainingSec,
  totalSec,
  running,
  onToggleRun,
  onAdjust,
  onResetPreset,
  onDismiss,
}: RestTimerBarProps) {
  const pct = totalSec > 0 ? Math.min(100, Math.max(0, (remainingSec / totalSec) * 100)) : 0;

  return (
    <div className="rounded-2xl bg-[#16161A] border border-[#F97316]/40 p-3 space-y-2.5 shadow-lg">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-[#F97316]" />
          <span className="text-xs font-medium text-[#D1D5DB]">Descanso</span>
          <span className="text-lg font-bold tabular-nums text-[#F4F4F6]">
            {formatDuration(remainingSec)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onAdjust(-15)}
            className="px-2 py-1 rounded-lg bg-[#1E1E24] text-xs text-[#D1D5DB] hover:bg-[#2A2A33]"
          >
            -15s
          </button>
          <button
            type="button"
            onClick={() => onAdjust(15)}
            className="px-2 py-1 rounded-lg bg-[#1E1E24] text-xs text-[#D1D5DB] hover:bg-[#2A2A33]"
          >
            +15s
          </button>
          <button
            type="button"
            onClick={onToggleRun}
            aria-label={running ? 'Pausar descanso' : 'Retomar descanso'}
            className="p-1.5 rounded-lg bg-[#F97316] text-black hover:bg-orange-400"
          >
            {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => onResetPreset(totalSec || 90)}
            aria-label="Reiniciar descanso"
            className="p-1.5 rounded-lg bg-[#1E1E24] text-[#9CA3AF] hover:text-white"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Fechar timer"
            className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="h-1.5 w-full rounded-full bg-[#25252C] overflow-hidden">
        <div
          className="h-full bg-[#F97316] transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center gap-1.5">
        {[60, 90, 120, 180].map((sec) => (
          <button
            key={sec}
            type="button"
            onClick={() => onResetPreset(sec)}
            className={`flex-1 py-1 rounded-lg text-[0.8125rem] font-medium border transition-colors ${
              totalSec === sec
                ? 'bg-[#F97316]/15 text-[#F97316] border-[#F97316]/40'
                : 'bg-[#1E1E24] text-[#9CA3AF] border-transparent hover:text-[#F4F4F6]'
            }`}
          >
            {sec}s
          </button>
        ))}
      </div>
    </div>
  );
}
