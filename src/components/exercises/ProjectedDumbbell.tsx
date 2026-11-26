import type { ReactNode } from 'react';
import type { Point2D } from '../../data/animations/types';
import type { ProjectedAxis } from '../../data/animations/executionGeometry';

export function ProjectedDumbbell({ hand, axis, dimmed, children }: {
  hand: Point2D;
  axis: ProjectedAxis;
  dimmed?: boolean;
  children?: ReactNode;
}) {
  const span = Math.hypot(axis.x, axis.y);
  const angle = Math.atan2(axis.y, axis.x) * 180 / Math.PI;
  const transform = `translate(${hand.x} ${hand.y}) rotate(${angle})`;
  const nearEnd = axis.towardCamera >= 0 ? 1 : -1;
  const faceRadius = 6.3 * Math.abs(axis.towardCamera);
  function plate(end: number) {
    const center = end * 10.4 * span;
    const cap = center + nearEnd * 2.4 * span;
    return (
      <g>
        <rect x={center - 2.4 * span - faceRadius} y="-6.3" width={4.8 * span + 2 * faceRadius}
          height="12.6" rx={Math.max(1.2, faceRadius)} fill="#303849" stroke="#B9C4D6" strokeWidth="1.1" />
        {faceRadius > 0.3 && <>
          <ellipse cx={cap} rx={faceRadius} ry="6.3" fill="#282F3E" stroke="#D4DEEB" strokeWidth="1" />
          <ellipse cx={cap} rx={faceRadius * 0.37} ry="2.35" fill="#AEBBCD" />
        </>}
      </g>
    );
  }
  return (
    <g opacity={dimmed ? 0.65 : 1} data-load="dumbbell">
      <g transform={transform}>
        {plate(-nearEnd)}
        <path d={`M${-10 * span} 0 H${10 * span}`} stroke="#C6D1DF" strokeWidth="3.3" />
      </g>
      {children}
      <g transform={transform}>{plate(nearEnd)}</g>
    </g>
  );
}
