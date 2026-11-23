import { useState } from 'react';
import { formatShortDateBr } from '../../utils/date';

export interface TrendPoint {
  date: string;
  value: number;
  extra?: string;
}

interface TrendLineChartProps {
  points: TrendPoint[];
  unit: string;
  color?: string;
  minFloor?: number;
  maxCeil?: number;
  emptyText?: string;
}

export function TrendLineChart({
  points,
  unit,
  color = '#EF4444',
  minFloor,
  maxCeil,
  emptyText = 'Sem registros suficientes para exibir o gráfico.',
}: TrendLineChartProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (points.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-xs text-[#9CA3AF] text-center px-4">
        {emptyText}
      </div>
    );
  }

  const width = 340;
  const height = 156;
  const padLeft = 36;
  const padRight = 14;
  const padTop = 14;
  const padBottom = 26;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const rawValues = points.map((p) => p.value);
  let minVal = Math.min(...rawValues);
  let maxVal = Math.max(...rawValues);
  if (minFloor !== undefined) minVal = Math.min(minVal, minFloor);
  if (maxCeil !== undefined) maxVal = Math.max(maxVal, maxCeil);

  if (minVal === maxVal) {
    minVal = Math.max(0, minVal - 2);
    maxVal = maxVal + 2;
  } else {
    const margin = (maxVal - minVal) * 0.15;
    if (minFloor === undefined) minVal = Math.max(0, minVal - margin);
    if (maxCeil === undefined) maxVal = maxVal + margin;
  }

  const coords = points.map((p, idx) => {
    const x =
      points.length === 1
        ? padLeft + plotW / 2
        : padLeft + (idx / (points.length - 1)) * plotW;
    const ratio = (p.value - minVal) / (maxVal - minVal || 1);
    const y = padTop + plotH - ratio * plotH;
    return { x, y, point: p };
  });

  const pathD = coords
    .map((c, idx) => `${idx === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(' ');

  const midVal = (minVal + maxVal) / 2;
  const ticks = [maxVal, midVal, minVal];

  const activeIdx =
    selectedIndex !== null && selectedIndex < coords.length
      ? selectedIndex
      : coords.length - 1;
  const active = coords[activeIdx];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#9CA3AF]">
          {formatShortDateBr(active.point.date)}
          {active.point.extra ? ` · ${active.point.extra}` : ''}
        </span>
        <span className="font-semibold text-[#F4F4F6] tabular-nums">
          {Number.isInteger(active.point.value)
            ? active.point.value
            : active.point.value.toFixed(1)}{' '}
          {unit}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-40 overflow-visible select-none"
        role="img"
        aria-label="Gráfico de evolução"
      >
        {ticks.map((val, i) => {
          const y = padTop + (i / 2) * plotH;
          return (
            <g key={i}>
              <line
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                stroke="#25252C"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={padLeft - 6}
                y={y + 4}
                textAnchor="end"
                fill="#9CA3AF"
                fontSize="10"
              >
                {val >= 100 ? Math.round(val) : val.toFixed(1).replace(/\.0$/, '')}
              </text>
            </g>
          );
        })}

        {coords.length > 1 && (
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {coords.map((c, idx) => {
          const isSelected = idx === activeIdx;
          return (
            <g
              key={c.point.date + idx}
              onClick={() => setSelectedIndex(idx)}
              className="cursor-pointer"
            >
              <circle cx={c.x} cy={c.y} r={12} fill="transparent" />
              <circle
                cx={c.x}
                cy={c.y}
                r={isSelected ? 4.5 : 3}
                fill={isSelected ? '#F4F4F6' : color}
                stroke={color}
                strokeWidth={isSelected ? 2 : 0}
              />
            </g>
          );
        })}

        {coords.length > 0 && (
          <>
            <text
              x={coords[0].x}
              y={height - 6}
              textAnchor={coords.length === 1 ? 'middle' : 'start'}
              fill="#9CA3AF"
              fontSize="10"
            >
              {formatShortDateBr(coords[0].point.date)}
            </text>
            {coords.length > 1 && (
              <text
                x={coords[coords.length - 1].x}
                y={height - 6}
                textAnchor="end"
                fill="#9CA3AF"
                fontSize="10"
              >
                {formatShortDateBr(coords[coords.length - 1].point.date)}
              </text>
            )}
          </>
        )}
      </svg>
    </div>
  );
}
