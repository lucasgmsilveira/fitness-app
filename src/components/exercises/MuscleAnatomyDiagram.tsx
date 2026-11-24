import {
  BACK_BODY_SILHOUETTE,
  BACK_MUSCLE_PATHS,
  FRONT_BODY_SILHOUETTE,
  FRONT_MUSCLE_PATHS,
  MUSCLE_DEFINITIONS,
  type MuscleId,
  type MusclePathGroup,
} from '../../data/muscleAnatomy';

interface MuscleAnatomyDiagramProps {
  primaryMuscles: MuscleId[];
  secondaryMuscles: MuscleId[];
  focusedMuscle?: MuscleId | null;
  onSelectMuscle?: (muscle: MuscleId | null) => void;
  compact?: boolean;
}

interface BodyViewSvgProps {
  label: string;
  silhouette: string[];
  groups: MusclePathGroup[];
  primarySet: Set<MuscleId>;
  secondarySet: Set<MuscleId>;
  focusedMuscle?: MuscleId | null;
  onSelectMuscle?: (muscle: MuscleId | null) => void;
  heightClass: string;
}

function BodyViewSvg({
  label,
  silhouette,
  groups,
  primarySet,
  secondarySet,
  focusedMuscle,
  onSelectMuscle,
  heightClass,
}: BodyViewSvgProps) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-[#101014] border border-[#24242E] p-2.5">
      <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-[#9CA3AF]">
        {label}
      </span>

      <svg
        viewBox="0 0 200 420"
        className={`w-full ${heightClass} select-none`}
        role="img"
        aria-label={`Diagrama muscular — vista ${label.toLowerCase()}`}
      >
        {/* Linha central sutil de referência anatômica */}
        <line
          x1="100"
          y1="66"
          x2="100"
          y2="390"
          stroke="#1D1E26"
          strokeWidth="1"
          strokeDasharray="3 4"
        />

        {/* Silhueta base */}
        {silhouette.map((d, idx) => (
          <path
            key={idx}
            d={d}
            fill="#1D1F28"
            stroke="#404456"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        ))}

        {/* Grupos musculares (músculo focado renderizado por último para o contorno ficar acima) */}
        {[...groups]
          .sort((a, b) =>
            a.id === focusedMuscle ? 1 : b.id === focusedMuscle ? -1 : 0,
          )
          .map((grp) => {
            const isPrimary = primarySet.has(grp.id);
            const isSecondary = !isPrimary && secondarySet.has(grp.id);
            const isFocused = focusedMuscle === grp.id;
            const isActive = isPrimary || isSecondary;

            const fill = isPrimary
              ? '#D95353'
              : isSecondary
                ? '#F0A458'
                : '#282B38';
            const fillOpacity = isPrimary
              ? isFocused
                ? 0.98
                : 0.88
              : isSecondary
                ? isFocused
                  ? 0.86
                  : 0.62
                : isFocused
                  ? 0.92
                  : 0.85;
            const stroke = isFocused
              ? '#38BDF8'
              : isPrimary
                ? '#F29B9B'
                : isSecondary
                  ? '#FAD1A3'
                  : '#353848';
            const strokeWidth = isFocused ? 2.4 : isActive ? 1.2 : 0.7;

            return (
              <g
                key={grp.id}
                className={onSelectMuscle ? 'cursor-pointer' : undefined}
                style={
                  isFocused
                    ? { filter: 'drop-shadow(0 0 2.5px rgba(56, 189, 248, 0.55))' }
                    : undefined
                }
                onClick={
                  onSelectMuscle
                    ? () => onSelectMuscle(isFocused ? null : grp.id)
                    : undefined
                }
              >
                <title>{MUSCLE_DEFINITIONS[grp.id].name}</title>
                {grp.paths.map((d, pathIdx) => (
                  <path
                    key={pathIdx}
                    d={d}
                    fill={fill}
                    fillOpacity={fillOpacity}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    strokeLinejoin="round"
                  />
                ))}
              </g>
            );
          })}
      </svg>
    </div>
  );
}

export function MuscleAnatomyDiagram({
  primaryMuscles,
  secondaryMuscles,
  focusedMuscle = null,
  onSelectMuscle,
  compact = false,
}: MuscleAnatomyDiagramProps) {
  const primarySet = new Set(primaryMuscles);
  const secondarySet = new Set(secondaryMuscles);
  const heightClass = compact ? 'max-h-52' : 'max-h-64 sm:max-h-72';

  const focusedDef = focusedMuscle ? MUSCLE_DEFINITIONS[focusedMuscle] : null;
  const focusedRole = focusedMuscle
    ? primarySet.has(focusedMuscle)
      ? 'Principal'
      : secondarySet.has(focusedMuscle)
        ? 'Secundário / Estabilizador'
        : 'Região anatômica'
    : null;

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-2 gap-2.5">
        <BodyViewSvg
          label="Frente"
          silhouette={FRONT_BODY_SILHOUETTE}
          groups={FRONT_MUSCLE_PATHS}
          primarySet={primarySet}
          secondarySet={secondarySet}
          focusedMuscle={focusedMuscle}
          onSelectMuscle={onSelectMuscle}
          heightClass={heightClass}
        />
        <BodyViewSvg
          label="Costas"
          silhouette={BACK_BODY_SILHOUETTE}
          groups={BACK_MUSCLE_PATHS}
          primarySet={primarySet}
          secondarySet={secondarySet}
          focusedMuscle={focusedMuscle}
          onSelectMuscle={onSelectMuscle}
          heightClass={heightClass}
        />
      </div>

      {/* Legenda e destaque selecionado */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex flex-wrap items-center gap-3 text-[0.75rem] text-[#D1D5DB]">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D95353] ring-1 ring-[#F29B9B]/70" />
            Principal (Agonista)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F0A458]/80 ring-1 ring-[#FAD1A3]/65" />
            Secundário / Estabilizador
          </span>
        </div>

        {focusedDef && (
          <span className="text-[0.75rem] font-medium text-[#7DD3FC] bg-[#38BDF8]/12 border border-[#38BDF8]/40 px-2 py-0.5 rounded-lg">
            {focusedDef.name} · {focusedRole}
          </span>
        )}
      </div>
    </div>
  );
}
