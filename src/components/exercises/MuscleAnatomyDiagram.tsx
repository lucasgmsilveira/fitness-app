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

        {/* Grupos musculares */}
        {groups.map((grp) => {
          const isPrimary = primarySet.has(grp.id);
          const isSecondary = !isPrimary && secondarySet.has(grp.id);
          const isFocused = focusedMuscle === grp.id;
          const isActive = isPrimary || isSecondary;

          const fill = isPrimary
            ? '#F97316'
            : isSecondary
              ? '#38BDF8'
              : '#282B38';
          const fillOpacity = isPrimary
            ? isFocused
              ? 0.98
              : 0.86
            : isSecondary
              ? isFocused
                ? 0.85
                : 0.55
              : 0.85;
          const stroke = isFocused
            ? '#FDE047'
            : isPrimary
              ? '#FDBA74'
              : isSecondary
                ? '#7DD3FC'
                : '#353848';
          const strokeWidth = isFocused ? 2.1 : isActive ? 1.2 : 0.7;

          return (
            <g
              key={grp.id}
              className={onSelectMuscle ? 'cursor-pointer' : undefined}
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
            <span className="w-2.5 h-2.5 rounded-full bg-[#F97316] ring-1 ring-[#FDBA74]/60" />
            Principal (Agonista)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]/70 ring-1 ring-[#7DD3FC]/60" />
            Secundário / Estabilizador
          </span>
        </div>

        {focusedDef && (
          <span className="text-[0.75rem] font-medium text-[#FDE047] bg-yellow-500/10 border border-yellow-400/30 px-2 py-0.5 rounded-lg">
            {focusedDef.name} · {focusedRole}
          </span>
        )}
      </div>
    </div>
  );
}
