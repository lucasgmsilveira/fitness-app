interface CalorieRingProps {
  consumed: number;
  target: number;
}

export function CalorieRing({ consumed, target }: CalorieRingProps) {
  const safeTarget = Math.max(1, target);
  const ratio = Math.min(1, Math.max(0, consumed / safeTarget));
  const diff = Math.round(target - consumed);
  const isOver = diff < 0;

  const size = 148;
  const strokeWidth = 11;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - ratio);

  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <div className="flex-1 text-center">
        <p className="text-xl font-bold tabular-nums text-[#F4F4F6]">
          {Math.round(consumed)}
        </p>
        <p className="text-xs text-[#9CA3AF]">consumidas</p>
      </div>

      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          aria-label={`Calorias: ${Math.round(consumed)} de ${Math.round(target)}`}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#27272F"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={isOver ? '#EF4444' : '#F97316'}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
          <span
            className={`text-2xl font-bold tabular-nums leading-none ${
              isOver ? 'text-red-400' : 'text-[#F97316]'
            }`}
          >
            {Math.abs(diff)}
          </span>
          <span className="text-[11px] text-[#9CA3AF] mt-1 leading-tight">
            {isOver ? 'kcal acima' : 'kcal restantes'}
          </span>
        </div>
      </div>

      <div className="flex-1 text-center">
        <p className="text-xl font-bold tabular-nums text-[#F4F4F6]">
          {Math.round(target)}
        </p>
        <p className="text-xs text-[#9CA3AF]">meta</p>
      </div>
    </div>
  );
}
