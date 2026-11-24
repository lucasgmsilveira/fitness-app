import { useEffect, useId, useRef, useState } from 'react';
import { Eye, Pause, Play } from 'lucide-react';
import {
  interpolateFrontPose,
  interpolateSidePose,
  type ActiveBodyRegion,
  type AnimationView,
  type ApparatusConfig,
  type ApparatusPreset,
  type ExerciseAnimationSpec,
  type FrontPose,
  type FrontViewSpec,
  type GripType,
  type LoadStyle,
  type Point2D,
  type SidePose,
  type SideViewSpec,
} from '../../data/animations/types';

const ACTIVE_FILL = '#D95353';
const ACTIVE_ACCENT = '#E56B6B';

const GRIP_LABELS: Record<GripType, string> = {
  pronated: 'Pronada',
  supinated: 'Supinada',
  neutral: 'Neutra',
  open: 'Aberta',
  mixed: 'Mista',
};

interface ExerciseExecutionSceneProps {
  spec: ExerciseAnimationSpec;
  view?: AnimationView;
  progress: number;
  label?: string;
  compact?: boolean;
}

function midPoint(a: Point2D, b: Point2D): Point2D {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function subSegment(a: Point2D, b: Point2D, f0: number, f1: number): [Point2D, Point2D] {
  return [
    { x: a.x + (b.x - a.x) * f0, y: a.y + (b.y - a.y) * f0 },
    { x: a.x + (b.x - a.x) * f1, y: a.y + (b.y - a.y) * f1 },
  ];
}

function resolveFrontCableTargets(
  pose: FrontPose,
  cfg: ApparatusConfig,
  exerciseId: string,
  ax: number,
  ay: number
): Point2D[] {
  if (cfg.cableHand === 'left') return [pose.leftHand];
  if (cfg.cableHand === 'right') return [pose.rightHand];
  if (cfg.cableHand === 'both') {
    const handDist = Math.hypot(
      pose.leftHand.x - pose.rightHand.x,
      pose.leftHand.y - pose.rightHand.y
    );
    return handDist < 20
      ? [midPoint(pose.leftHand, pose.rightHand)]
      : [pose.leftHand, pose.rightHand];
  }
  if (exerciseId === 'ex-elevacao-lateral-cabo') {
    return [pose.rightHand];
  }
  const leftDist = Math.hypot(pose.leftHand.x - ax, pose.leftHand.y - ay);
  const rightDist = Math.hypot(pose.rightHand.x - ax, pose.rightHand.y - ay);
  return leftDist <= rightDist ? [pose.leftHand] : [pose.rightHand];
}

function resolveSideCableTargets(pose: SidePose, cfg: ApparatusConfig): Point2D[] {
  if (cfg.cableHand === 'far') return [pose.farHand];
  if (cfg.cableHand === 'both') return [pose.farHand, pose.nearHand];
  return [pose.nearHand];
}

function Limb({
  a,
  b,
  width,
  fill,
  stroke,
  highlight = false,
  highlightOpacity = 0.75,
}: {
  a: Point2D;
  b: Point2D;
  width: number;
  fill: string;
  stroke: string;
  highlight?: boolean;
  highlightOpacity?: number;
}) {
  const length = Math.hypot(b.x - a.x, b.y - a.y);
  const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
  // Local axes follow the bone. The muscle belly narrows towards the distal joint.
  return (
    <g transform={`translate(${a.x} ${a.y}) rotate(${angle})`}>
      <g transform={`scale(${Math.max(1, length)} ${width})`}>
        <path
          d="M0 -.4 C.18 -.61 .42 -.72 .66 -.46 S.88 -.31 1 -.29
             C1.08 -.23 1.08 .21 1 .29 C.81 .32 .64 .31 .45 .49
             C.27 .62 .09 .58 0 .4 Q-.11 0 0 -.4Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="1.1"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M.04 -.24 C.21 -.56 .47 -.59 .73 -.32
             C.52 -.34 .29 -.03 .04 -.24Z"
          fill={highlight ? ACTIVE_ACCENT : '#DCE6F8'}
          opacity={highlight ? highlightOpacity : 0.19}
        />
        {highlight && (
          <path
            d="M.08 .13 Q.35 -.18 .79 -.18 Q.38 .53 .08 .32Z"
            fill={ACTIVE_FILL}
            opacity={highlightOpacity}
          />
        )}
      </g>
    </g>
  );
}

function SideTorso({
  shoulder,
  hip,
  faceDir,
  activeSet,
  highlightOpacity,
}: {
  shoulder: Point2D;
  hip: Point2D;
  faceDir: 1 | -1;
  activeSet: Set<ActiveBodyRegion>;
  highlightOpacity: number;
}) {
  const length = Math.max(1, Math.hypot(hip.x - shoulder.x, hip.y - shoulder.y));
  const angle = (Math.atan2(hip.y - shoulder.y, hip.x - shoulder.x) * 180) / Math.PI;
  const torsoDepth = 22;

  // In this local frame (+x from shoulder -> hip), local -y is always the anterior (chest/abs)
  // side matching Head's `facing` across upright, inclined, supine and prone poses.
  return (
    <g transform={`translate(${shoulder.x} ${shoulder.y}) rotate(${angle})`}>
      <g transform={`scale(${length} ${torsoDepth * faceDir})`}>
        {/* Base anatomical side torso */}
        <path
          d="M0 -.34 C.16 -.62 .36 -.61 .50 -.45 C.66 -.35 .84 -.37 .98 -.34
             C1.09 -.25 1.11 .28 .98 .45 C.80 .50 .64 .29 .46 .35
             C.28 .44 .12 .46 0 .34 Q-.10 0 0 -.34Z"
          fill="#3E465B"
          stroke="#808BA4"
          strokeWidth="1.15"
          vectorEffect="non-scaling-stroke"
        />
        {/* Subtle anterior ribcage shading */}
        <path
          d="M.08 -.28 C.20 -.54 .38 -.54 .48 -.40 C.38 -.22 .22 -.14 .08 -.28Z"
          fill={activeSet.has('chest') ? ACTIVE_FILL : '#56617A'}
          opacity={activeSet.has('chest') ? highlightOpacity : 0.65}
        />
        {/* Abdomen / obliques */}
        {(activeSet.has('abs') || activeSet.has('obliques')) && (
          <path
            d="M.44 -.38 C.60 -.32 .76 -.33 .86 -.30 L.84 -.04 C.68 -.05 .52 -.08 .43 -.12Z"
            fill={activeSet.has('abs') ? ACTIVE_FILL : ACTIVE_ACCENT}
            opacity={highlightOpacity}
          />
        )}
        {/* Upper back / lats / traps */}
        {(activeSet.has('lats') || activeSet.has('upper-back') || activeSet.has('traps')) && (
          <path
            d="M.06 .06 C.20 .04 .42 .05 .58 .12 C.52 .30 .30 .41 .08 .33Z"
            fill={ACTIVE_FILL}
            opacity={highlightOpacity}
          />
        )}
        {/* Lower back */}
        {activeSet.has('lower-back') && (
          <path
            d="M.54 .08 C.66 .07 .78 .10 .84 .16 C.80 .33 .68 .37 .54 .28Z"
            fill={ACTIVE_FILL}
            opacity={highlightOpacity}
          />
        )}
        {/* Pelvis / shorts band */}
        <path
          d="M.77 -.34 Q.86 .04 .77 .38 L.98 .45 C1.11 .28 1.09 -.25 .98 -.34Z"
          fill="#2D3548"
        />
        {/* Glutes highlight */}
        {activeSet.has('glutes') && (
          <path
            d="M.79 .06 C.92 .04 1.06 .14 1.04 .34 C.98 .49 .82 .48 .76 .34Z"
            fill={ACTIVE_FILL}
            opacity={highlightOpacity}
          />
        )}
      </g>
    </g>
  );
}

function Head({ head, neck, facing }: { head: Point2D; neck: Point2D; facing?: number }) {
  const tilt = (Math.atan2(head.x - neck.x, neck.y - head.y) * 180) / Math.PI;
  const scale = 1.24;
  return (
    <g>
      <path
        d={`M${neck.x} ${neck.y} L${head.x} ${head.y}`}
        stroke="#827F82"
        strokeWidth="7.8"
        strokeLinecap="round"
      />
      <g
        transform={`translate(${head.x} ${head.y}) rotate(${tilt}) scale(${(facing ?? 1) * scale} ${scale})`}
      >
        {facing === undefined ? (
          <>
            <path
              d="M-8 -3 C-9 -14.5 9 -14.5 8 -3 Q10 -5 9 0 Q9 3 7.5 3
                 Q6.7 8.8 2 10.6 Q0 11.4 -2 10.6 Q-6.7 8.8 -7.5 3 Q-9 3 -9 0 Q-10 -5 -8 -3Z"
              fill="#BFACA2"
              stroke="#D1C2BA"
              strokeWidth=".65"
            />
            <path
              d="M-8.4 -.7 C-11.6 -15 11.6 -15 8.4 -.7 L7 -5 Q0 -7.8 -7 -5Z"
              fill="#353B47"
            />
            {[-1, 1].map((side) => (
              <g key={side} transform={`scale(${side} 1)`}>
                <path d="M2 -2 Q4 -3 6 -2" fill="none" stroke="#675C5B" strokeWidth=".75" />
                <ellipse cx="4" cy="-.4" rx="1.05" ry=".82" fill="#333844" />
              </g>
            ))}
            <path
              d="M0 0 L-.7 3 1 3 M-2 5.8 Q0 6.8 2 5.8"
              fill="none"
              stroke="#896E65"
              strokeWidth=".85"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            <path
              d="M-8 3 C-12.5 -12.5 5.8 -15.2 8 -5.8 L8 -2 10.4 1.6 8.2 2.4
                 Q8.8 3.9 7.4 4.6 Q7.8 8.6 3.8 9.8 L0 9.8 -5 6.8Z"
              fill="#BFACA2"
              stroke="#D1C2BA"
              strokeWidth=".65"
            />
            <path
              d="M-8 3.8 C-13.5 -12.5 2 -15.2 7 -8.8 L8 -5.8 Q4 -6.8 1 -5.8 L-2 -.2 -5 0 -5 4.8Z"
              fill="#353B47"
            />
            <path
              d="M-4 1 Q-6 -2 -6 1 Q-6 4 -4 4 M4 -2 Q6 -3 7 -2 M6 4.8 L7.8 4.8"
              fill="none"
              stroke="#886E67"
              strokeWidth=".75"
            />
            <circle cx="6.2" cy="-.5" r=".88" fill="#333844" />
          </>
        )}
      </g>
    </g>
  );
}

function HandGrip({
  elbow,
  hand,
  grip,
  role,
  dimmed = false,
}: {
  elbow: Point2D;
  hand: Point2D;
  grip: GripType;
  role: 'left' | 'right' | 'near' | 'far';
  dimmed?: boolean;
}) {
  const angle = (Math.atan2(hand.y - elbow.y, hand.x - elbow.x) * 180) / Math.PI;
  const effectiveGrip: Exclude<GripType, 'mixed'> =
    grip === 'mixed' ? (role === 'left' || role === 'near' ? 'supinated' : 'pronated') : grip;

  const skinFill = dimmed ? '#736867' : '#C9B5AA';
  const palmFill = dimmed ? '#827674' : '#DECBC0';
  const lineStroke = dimmed ? '#4D4545' : '#6F5D55';
  const mirrorY = role === 'left' ? -1 : 1;

  return (
    <g
      transform={`translate(${hand.x} ${hand.y}) rotate(${angle}) scale(1 ${mirrorY})`}
      opacity={dimmed ? 0.78 : 1}
    >
      {effectiveGrip === 'open' && (
        <>
          <ellipse cx="1.8" cy="0" rx="5.2" ry="3.2" fill={skinFill} stroke={lineStroke} strokeWidth="0.9" />
          <line x1="2.5" y1="-1.6" x2="6.2" y2="-1.6" stroke={lineStroke} strokeWidth="0.7" strokeLinecap="round" />
          <line x1="2.8" y1="0" x2="6.6" y2="0" stroke={lineStroke} strokeWidth="0.7" strokeLinecap="round" />
          <line x1="2.5" y1="1.6" x2="6.0" y2="1.6" stroke={lineStroke} strokeWidth="0.7" strokeLinecap="round" />
          <path d="M-1 -2.2 Q1.5 -4.4 3.4 -3.2" fill="none" stroke={skinFill} strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}

      {effectiveGrip === 'pronated' && (
        <>
          {/* Dorsum of hand facing outward/upward, knuckles visible, thumb tucked medially */}
          <rect
            x="-3.6"
            y="-4.2"
            width="7.8"
            height="8.4"
            rx="2.6"
            fill={skinFill}
            stroke={lineStroke}
            strokeWidth="0.95"
          />
          {/* Knuckle ridge across back of hand */}
          <line x1="1.6" y1="-3.1" x2="1.6" y2="3.1" stroke={lineStroke} strokeWidth="0.9" strokeLinecap="round" />
          <circle cx="1.6" cy="-2.1" r="0.75" fill={lineStroke} />
          <circle cx="1.6" cy="0" r="0.75" fill={lineStroke} />
          <circle cx="1.6" cy="2.1" r="0.75" fill={lineStroke} />
          {/* Subtle tucked thumb on inner edge */}
          <path d="M-1.5 3.6 Q1 5.2 2.8 4" fill="none" stroke={skinFill} strokeWidth="1.9" strokeLinecap="round" />
          <path d="M-1.5 3.6 Q1 5.2 2.8 4" fill="none" stroke={lineStroke} strokeWidth="0.65" strokeLinecap="round" />
        </>
      )}

      {effectiveGrip === 'supinated' && (
        <>
          {/* Palm & curled fingers facing outward/upward, thumb extended laterally */}
          <rect
            x="-3.4"
            y="-4.3"
            width="7.6"
            height="8.6"
            rx="2.8"
            fill={palmFill}
            stroke={lineStroke}
            strokeWidth="0.95"
          />
          {/* Curled finger segments wrapping over handle */}
          <rect x="0.2" y="-3.5" width="3.5" height="2.1" rx="0.9" fill={skinFill} stroke={lineStroke} strokeWidth="0.7" />
          <rect x="0.4" y="-1.1" width="3.7" height="2.2" rx="0.9" fill={skinFill} stroke={lineStroke} strokeWidth="0.7" />
          <rect x="0.2" y="1.4" width="3.5" height="2.1" rx="0.9" fill={skinFill} stroke={lineStroke} strokeWidth="0.7" />
          {/* Outward-pointing lateral thumb */}
          <path d="M-1.8 -3.6 Q0.5 -6.2 3.2 -4.8" fill="none" stroke={palmFill} strokeWidth="2.1" strokeLinecap="round" />
          <path d="M-1.8 -3.6 Q0.5 -6.2 3.2 -4.8" fill="none" stroke={lineStroke} strokeWidth="0.7" strokeLinecap="round" />
        </>
      )}

      {effectiveGrip === 'neutral' && (
        <>
          {/* Radial/thumb-up fist edge: prominent thumb along upper edge + wrapped fingers */}
          <ellipse cx="0.6" cy="0.3" rx="4.2" ry="3.8" fill={skinFill} stroke={lineStroke} strokeWidth="0.95" />
          {/* Wrapped finger lines on lower/side edge */}
          <path d="M-0.4 1.6 Q2.2 2.2 4 1.2" fill="none" stroke={lineStroke} strokeWidth="0.75" strokeLinecap="round" />
          <path d="M-0.2 3.1 Q2 3.6 3.5 2.7" fill="none" stroke={lineStroke} strokeWidth="0.75" strokeLinecap="round" />
          {/* Prominent thumb ridge along top/radial side */}
          <path
            d="M-2.2 -2.4 Q1.2 -5.0 4.5 -2.6"
            fill="none"
            stroke={palmFill}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M-2.2 -2.4 Q1.2 -5.0 4.5 -2.6"
            fill="none"
            stroke={lineStroke}
            strokeWidth="0.75"
            strokeLinecap="round"
          />
        </>
      )}
    </g>
  );
}

function renderDumbbellEndOn(cx: number, cy: number, dimmed = false) {
  return (
    <g opacity={dimmed ? 0.65 : 1}>
      <circle cx={cx} cy={cy} r="7.2" fill="#2A303E" stroke="#CBD5E1" strokeWidth="1.4" />
      <circle cx={cx} cy={cy} r="4.6" fill="#1E2330" stroke="#64748B" strokeWidth="0.8" />
      <circle cx={cx} cy={cy} r="2.1" fill="#E2E8F0" />
    </g>
  );
}

function renderDumbbellBroadside(
  elbow: Point2D,
  hand: Point2D,
  orientation: 'horizontal' | 'perp-forearm',
  dimmed = false
) {
  let angle = 0;
  if (orientation === 'perp-forearm') {
    angle = (Math.atan2(hand.y - elbow.y, hand.x - elbow.x) * 180) / Math.PI + 90;
  }
  return (
    <g transform={`translate(${hand.x} ${hand.y}) rotate(${angle})`} opacity={dimmed ? 0.65 : 1}>
      {/* Steel handle bar */}
      <rect x="-10" y="-1.7" width="20" height="3.4" rx="1.4" fill="#CBD5E1" stroke="#18181B" strokeWidth="0.8" />
      {/* Left & right weight plates */}
      <rect x="-12.5" y="-6.2" width="4.8" height="12.4" rx="1.6" fill="#2A303E" stroke="#E2E8F0" strokeWidth="1.1" />
      <rect x="7.7" y="-6.2" width="4.8" height="12.4" rx="1.6" fill="#2A303E" stroke="#E2E8F0" strokeWidth="1.1" />
    </g>
  );
}

function renderSideApparatus(
  preset: ApparatusPreset,
  pose: SidePose,
  viewSpec: SideViewSpec
) {
  const cfg = viewSpec.apparatusConfig ?? {};
  switch (preset) {
    case 'none':
      return null;
    case 'mat':
      return (
        <rect
          x="42"
          y="181"
          width="236"
          height="9"
          rx="4.5"
          fill="#1D222D"
          stroke="#353E52"
          strokeWidth="1.2"
        />
      );
    case 'flat-bench': {
      const bx = cfg.benchX ?? 66;
      const by = cfg.benchY ?? 144;
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <line x1={bx + 22} y1={by + 10} x2={bx + 22} y2="190" strokeWidth="4" strokeLinecap="round" />
          <line x1={bx + 128} y1={by + 10} x2={bx + 128} y2="190" strokeWidth="4" strokeLinecap="round" />
          <rect x={bx} y={by} width="144" height="10" rx="5" fill="#232836" />
        </g>
      );
    }
    case 'incline-bench': {
      const bx = cfg.benchX ?? 124;
      const by = cfg.benchY ?? 144;
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <line x1={bx - 22} y1={by + 4} x2={bx - 30} y2="190" strokeWidth="4" strokeLinecap="round" />
          <line x1={bx + 42} y1={by + 10} x2={bx + 48} y2="190" strokeWidth="4" strokeLinecap="round" />
          {/* Encosto inclinado */}
          <line
            x1={bx - 36}
            y1={by - 58}
            x2={bx + 12}
            y2={by + 4}
            stroke="#232836"
            strokeWidth="11"
            strokeLinecap="round"
          />
          <line
            x1={bx - 36}
            y1={by - 58}
            x2={bx + 12}
            y2={by + 4}
            stroke="#3E465C"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          {/* Assento */}
          <rect x={bx + 8} y={by + 2} width="46" height="9" rx="4" fill="#232836" />
        </g>
      );
    }
    case 'chest-press-machine': {
      const sx = cfg.seatX ?? 108;
      const sy = cfg.seatY ?? 144;
      const px = cfg.pivotX ?? 138;
      const py = cfg.pivotY ?? 44;
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <rect x={sx - 16} y="76" width="12" height="114" rx="4" fill="#1B1F2A" />
          <rect x="218" y="42" width="20" height="148" rx="4" fill="#1B1F2A" />
          <rect x={sx - 6} y={sy - 60} width="10" height="62" rx="4" fill="#252B3B" />
          <rect x={sx} y={sy} width="46" height="10" rx="4" fill="#252B3B" />
          <line x1={sx + 18} y1={sy + 10} x2={sx + 18} y2="190" strokeWidth="4" />
          <line
            x1={px}
            y1={py}
            x2={pose.nearHand.x}
            y2={pose.nearHand.y}
            stroke="#59637D"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx={px} cy={py} r="4.5" fill="#7A869E" stroke="none" />
          <circle cx={px} cy={py} r="1.8" fill="#CBD5E1" stroke="none" />
        </g>
      );
    }
    case 'peck-deck': {
      const hasFrontChestPad = cfg.padX !== undefined;
      const sx = cfg.seatX ?? 116;
      const sy = cfg.seatY ?? 140;
      const px = cfg.pivotX ?? (hasFrontChestPad ? sx + 16 : 138);
      const py = cfg.pivotY ?? 44;
      const seatLeft = hasFrontChestPad ? sx - 22 : sx;
      return (
        <g stroke="#394052" strokeWidth="1.4">
          {/* Coluna estrutural e topo */}
          <rect
            x={hasFrontChestPad ? (cfg.padX ?? sx + 12) + 8 : sx - 18}
            y="36"
            width="14"
            height="154"
            rx="4"
            fill="#1B1F2A"
          />
          <rect
            x={hasFrontChestPad ? px - 6 : sx - 12}
            y="36"
            width="54"
            height="8"
            rx="3"
            fill="#1B1F2A"
          />
          {/* Encosto traseiro (crucifixo) ou apoio frontal de peito (voador invertido) */}
          {hasFrontChestPad ? (
            <rect
              x={(cfg.padX ?? sx + 12) - 4}
              y={(cfg.padY ?? sy - 36) - 28}
              width="10"
              height="56"
              rx="4"
              fill="#252B3B"
            />
          ) : (
            <rect x={sx - 4} y={sy - 64} width="10" height="64" rx="4" fill="#252B3B" />
          )}
          {/* Assento */}
          <rect x={seatLeft} y={sy} width="46" height="10" rx="4" fill="#252B3B" />
          <line x1={seatLeft + 22} y1={sy + 10} x2={seatLeft + 22} y2="190" strokeWidth="4" />
          {/* Alavanca distante + próxima */}
          <line
            x1={px}
            y1={py}
            x2={pose.farHand.x}
            y2={pose.farHand.y}
            stroke="#444C63"
            strokeWidth="2.8"
            strokeLinecap="round"
            opacity="0.7"
          />
          <line
            x1={px}
            y1={py}
            x2={pose.nearHand.x}
            y2={pose.nearHand.y}
            stroke="#59637D"
            strokeWidth="3.4"
            strokeLinecap="round"
          />
          <rect
            x={pose.nearHand.x - 3}
            y={pose.nearHand.y - 10}
            width="6"
            height="20"
            rx="3"
            fill="#475569"
          />
          <circle cx={px} cy={py} r="4.5" fill="#7A869E" stroke="none" />
          <circle cx={px} cy={py} r="1.8" fill="#CBD5E1" stroke="none" />
        </g>
      );
    }
    case 'dual-cable-high': {
      const ax = cfg.anchorX ?? 82;
      const ay = cfg.anchorY ?? 36;
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <rect
            x={ax < 160 ? ax - 14 : ax + 2}
            y="22"
            width="14"
            height="168"
            rx="4"
            fill="#1B1F2A"
          />
          <circle cx={ax} cy={ay} r="4.5" fill="#6B7280" stroke="none" />
          <line
            x1={ax}
            y1={ay}
            x2={pose.farHand.x}
            y2={pose.farHand.y}
            stroke="#64748B"
            strokeWidth="1.5"
            opacity="0.7"
          />
          <line
            x1={ax}
            y1={ay}
            x2={pose.nearHand.x}
            y2={pose.nearHand.y}
            stroke="#94A3B8"
            strokeWidth="1.8"
          />
        </g>
      );
    }
    case 'lat-pulldown': {
      const ax = cfg.anchorX ?? Math.round((pose.nearHand.x + pose.farHand.x) / 2);
      const ay = cfg.anchorY ?? 24;
      const sx = cfg.seatX ?? 140;
      const sy = cfg.seatY ?? 140;
      const seatLeft = sx - 22;
      const towerX = ax < 160 ? 52 : 244;
      return (
        <g stroke="#394052" strokeWidth="1.4">
          {/* Torre + braço superior */}
          <rect x={towerX} y="18" width="14" height="172" rx="4" fill="#1B1F2A" />
          <line
            x1={towerX + 7}
            y1="22"
            x2={ax}
            y2={ay}
            stroke="#252B3B"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <circle cx={ax} cy={ay} r="4.5" fill="#6B7280" stroke="none" />
          {/* Cabo até as mãos */}
          <line
            x1={ax}
            y1={ay}
            x2={pose.nearHand.x}
            y2={pose.nearHand.y}
            stroke="#94A3B8"
            strokeWidth="1.8"
          />
          {/* Assento e apoio de coxas */}
          <rect x={seatLeft} y={sy} width="48" height="10" rx="4" fill="#252B3B" />
          <line x1={sx} y1={sy + 10} x2={sx} y2="190" strokeWidth="4" />
          <rect x={cfg.padX ?? sx + 22} y={cfg.padY ?? sy - 14} width="20" height="8" rx="4" fill="#475569" />
        </g>
      );
    }
    case 'shoulder-press-machine': {
      const sx = cfg.seatX ?? 132;
      const sy = cfg.seatY ?? 144;
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <rect x={sx - 16} y="48" width="12" height="142" rx="4" fill="#1B1F2A" />
          <rect x={sx - 4} y={sy - 62} width="10" height="64" rx="4" fill="#252B3B" />
          <rect x={sx} y={sy} width="44" height="10" rx="4" fill="#252B3B" />
          <line x1={sx + 18} y1={sy + 10} x2={sx + 18} y2="190" strokeWidth="4" />
          {/* Braço articulado até a mão */}
          <line
            x1={sx - 14}
            y1={pose.nearHand.y}
            x2={pose.nearHand.x}
            y2={pose.nearHand.y}
            stroke="#59637D"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx={pose.nearHand.x} cy={pose.nearHand.y} r="4.2" fill="#9CA3AF" stroke="none" />
        </g>
      );
    }
    case 'chest-supported-row':
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <line x1="126" y1="152" x2="120" y2="190" strokeWidth="4" />
          <line x1="194" y1="152" x2="202" y2="190" strokeWidth="4" />
          {/* Apoio de peito inclinado */}
          <line
            x1="196"
            y1="92"
            x2="162"
            y2="146"
            stroke="#252B3B"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Assento */}
          <rect x="126" y="144" width="44" height="10" rx="4" fill="#252B3B" />
          {viewSpec.load === 'none' && (
            <line
              x1={cfg.pivotX ?? 252}
              y1={cfg.pivotY ?? 72}
              x2={pose.nearHand.x}
              y2={pose.nearHand.y}
              stroke="#59637D"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
          )}
        </g>
      );
    case 'seated-cable-row': {
      const ax = cfg.anchorX ?? 52;
      const ay = cfg.anchorY ?? 134;
      const targets = resolveSideCableTargets(pose, cfg);
      return (
        <g stroke="#394052" strokeWidth="1.4">
          {/* Torre de polia e apoio de pé */}
          <rect x="38" y="34" width="16" height="156" rx="4" fill="#1B1F2A" />
          <line x1="78" y1="146" x2="88" y2="188" stroke="#4B5368" strokeWidth="6" strokeLinecap="round" />
          {/* Banco comprido */}
          <rect x="148" y="158" width="66" height="10" rx="4" fill="#252B3B" />
          <line x1="162" y1="168" x2="162" y2="190" strokeWidth="4" />
          <line x1="202" y1="168" x2="202" y2="190" strokeWidth="4" />
          <circle cx={ax} cy={ay} r="4.5" fill="#6B7280" stroke="none" />
          {targets.map((pt, idx) => (
            <line
              key={idx}
              x1={ax}
              y1={ay}
              x2={pt.x}
              y2={pt.y}
              stroke="#94A3B8"
              strokeWidth="1.8"
            />
          ))}
        </g>
      );
    }
    case 'cable-single': {
      const ax = cfg.anchorX ?? 234;
      const ay = cfg.anchorY ?? 28;
      const targets = resolveSideCableTargets(pose, cfg);
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <rect
            x={ax < 160 ? ax - 14 : ax + 2}
            y="22"
            width="14"
            height="168"
            rx="4"
            fill="#1B1F2A"
          />
          <circle cx={ax} cy={ay} r="4.5" fill="#6B7280" stroke="none" />
          {targets.map((pt, idx) => (
            <line
              key={idx}
              x1={ax}
              y1={ay}
              x2={pt.x}
              y2={pt.y}
              stroke="#94A3B8"
              strokeWidth="1.8"
            />
          ))}
        </g>
      );
    }
    case 'preacher-bench':
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <line x1="112" y1="150" x2="108" y2="190" strokeWidth="4" />
          <line x1="176" y1="126" x2="182" y2="190" strokeWidth="4" />
          <rect x="98" y="144" width="44" height="9" rx="4" fill="#252B3B" />
          {/* Almofada Scott inclinada */}
          <line
            x1="150"
            y1="100"
            x2="178"
            y2="132"
            stroke="#252B3B"
            strokeWidth="12"
            strokeLinecap="round"
          />
        </g>
      );
    case 'leg-press-45': {
      const foot = pose.nearFoot;
      const dx = 18;
      const dy = 18;
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <line x1="142" y1="168" x2="256" y2="54" stroke="#2D3343" strokeWidth="5" strokeLinecap="round" />
          <line x1="70" y1="152" x2="64" y2="190" strokeWidth="4" />
          <line x1="138" y1="172" x2="142" y2="190" strokeWidth="4" />
          <line x1="56" y1="120" x2="106" y2="168" stroke="#252B3B" strokeWidth="11" strokeLinecap="round" />
          <rect x="104" y="164" width="42" height="10" rx="4" fill="#252B3B" />
          <line
            x1={foot.x - dx + 10}
            y1={foot.y - dy - 4}
            x2={foot.x + dx + 6}
            y2={foot.y + dy + 6}
            stroke="#64748B"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </g>
      );
    }
    case 'bulgarian-bench': {
      const bx = cfg.benchX ?? 66;
      const by = cfg.benchY ?? 148;
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <rect x={bx} y={by} width="46" height="10" rx="4" fill="#252B3B" />
          <line x1={bx + 10} y1={by + 10} x2={bx + 10} y2="190" strokeWidth="4" />
          <line x1={bx + 38} y1={by + 10} x2={bx + 38} y2="190" strokeWidth="4" />
        </g>
      );
    }
    case 'leg-extension': {
      const px = cfg.pivotX ?? 166;
      const py = cfg.pivotY ?? 144;
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <rect x="98" y="80" width="10" height="62" rx="4" fill="#252B3B" />
          <rect x="102" y="142" width="66" height="10" rx="4" fill="#252B3B" />
          <line x1="112" y1="152" x2="112" y2="190" strokeWidth="4" />
          <line x1="164" y1="152" x2="164" y2="190" strokeWidth="4" />
          <line
            x1={px}
            y1={py}
            x2={pose.nearFoot.x}
            y2={pose.nearFoot.y - 6}
            stroke="#59637D"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx={px} cy={py} r="4.5" fill="#7A869E" stroke="none" />
          <circle cx={px} cy={py} r="1.8" fill="#CBD5E1" stroke="none" />
          <circle cx={pose.nearFoot.x + 2} cy={pose.nearFoot.y - 6} r="6.5" fill="#475569" />
        </g>
      );
    }
    case 'seated-leg-curl': {
      const px = cfg.pivotX ?? 168;
      const py = cfg.pivotY ?? 144;
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <rect x="98" y="80" width="10" height="62" rx="4" fill="#252B3B" />
          <rect x="102" y="142" width="66" height="10" rx="4" fill="#252B3B" />
          <line x1="112" y1="152" x2="112" y2="190" strokeWidth="4" />
          <line x1="164" y1="152" x2="164" y2="190" strokeWidth="4" />
          <rect x="148" y="128" width="22" height="8" rx="4" fill="#475569" />
          <line
            x1={px}
            y1={py}
            x2={pose.nearFoot.x}
            y2={pose.nearFoot.y + 4}
            stroke="#59637D"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx={px} cy={py} r="4.5" fill="#7A869E" stroke="none" />
          <circle cx={px} cy={py} r="1.8" fill="#CBD5E1" stroke="none" />
          <circle cx={pose.nearFoot.x} cy={pose.nearFoot.y + 6} r="6.5" fill="#475569" />
        </g>
      );
    }
    case 'lying-leg-curl': {
      const px = cfg.pivotX ?? 194;
      const py = cfg.pivotY ?? 138;
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <rect x="78" y="138" width="122" height="10" rx="4" fill="#252B3B" />
          <line x1="92" y1="148" x2="90" y2="190" strokeWidth="4" />
          <line x1="186" y1="148" x2="188" y2="190" strokeWidth="4" />
          <line
            x1={px}
            y1={py}
            x2={pose.nearFoot.x}
            y2={pose.nearFoot.y - 4}
            stroke="#59637D"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx={px} cy={py} r="4.5" fill="#7A869E" stroke="none" />
          <circle cx={px} cy={py} r="1.8" fill="#CBD5E1" stroke="none" />
          <circle cx={pose.nearFoot.x} cy={pose.nearFoot.y - 6} r="6.5" fill="#475569" />
        </g>
      );
    }
    case 'hip-thrust-bench': {
      const bx = cfg.benchX ?? 82;
      const by = cfg.benchY ?? 136;
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <rect x={bx} y={by} width="48" height="12" rx="4" fill="#252B3B" />
          <line x1={bx + 10} y1={by + 12} x2={bx + 6} y2="190" strokeWidth="4" />
          <line x1={bx + 38} y1={by + 12} x2={bx + 40} y2="190" strokeWidth="4" />
        </g>
      );
    }
    case 'hip-abductor': {
      const sx = cfg.seatX ?? 108;
      const sy = cfg.seatY ?? 136;
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <rect x={sx - 6} y={sy - 66} width="10" height="66" rx="4" fill="#252B3B" />
          <rect x={sx} y={sy} width="52" height="10" rx="4" fill="#252B3B" />
          <line x1={sx + 10} y1={sy + 10} x2={sx + 10} y2="190" strokeWidth="4" />
          <line x1={sx + 44} y1={sy + 10} x2={sx + 44} y2="190" strokeWidth="4" />
          {/* Apoio externo na coxa */}
          <rect
            x={pose.nearKnee.x - 10}
            y={pose.nearKnee.y - 8}
            width="16"
            height="10"
            rx="4"
            fill="#475569"
          />
          <line
            x1={sx + 44}
            y1={sy + 6}
            x2={pose.nearKnee.x - 2}
            y2={pose.nearKnee.y - 3}
            stroke="#59637D"
            strokeWidth="3"
          />
        </g>
      );
    }
    case 'hip-adductor': {
      const sx = cfg.seatX ?? 108;
      const sy = cfg.seatY ?? 136;
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <rect x={sx - 6} y={sy - 66} width="10" height="66" rx="4" fill="#252B3B" />
          <rect x={sx} y={sy} width="52" height="10" rx="4" fill="#252B3B" />
          <line x1={sx + 10} y1={sy + 10} x2={sx + 10} y2="190" strokeWidth="4" />
          <line x1={sx + 44} y1={sy + 10} x2={sx + 44} y2="190" strokeWidth="4" />
          {/* Apoio interno na face medial da coxa */}
          <rect
            x={pose.nearKnee.x - 12}
            y={pose.nearKnee.y - 5}
            width="16"
            height="10"
            rx="4"
            fill="#3B4559"
            stroke="#94A3B8"
            strokeDasharray="2.5 2"
          />
          <line
            x1={sx + 44}
            y1={sy + 6}
            x2={pose.nearKnee.x - 4}
            y2={pose.nearKnee.y}
            stroke="#59637D"
            strokeWidth="3"
          />
        </g>
      );
    }
    case 'seated-calf':
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <rect x="102" y="140" width="44" height="10" rx="4" fill="#252B3B" />
          <line x1="112" y1="150" x2="112" y2="190" strokeWidth="4" />
          <rect x="166" y="182" width="24" height="8" rx="3" fill="#334155" />
          <rect
            x={pose.nearKnee.x - 10}
            y={pose.nearKnee.y - 12}
            width="22"
            height="9"
            rx="4"
            fill="#475569"
          />
          <line
            x1="152"
            y1="190"
            x2={pose.nearKnee.x}
            y2={pose.nearKnee.y - 8}
            stroke="#59637D"
            strokeWidth="3.2"
          />
        </g>
      );
    case 'standing-calf':
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <rect x="140" y="182" width="28" height="8" rx="3" fill="#334155" />
          <rect x="128" y="42" width="12" height="148" rx="4" fill="#1B1F2A" />
          <rect
            x={pose.shoulder.x - 10}
            y={pose.shoulder.y - 14}
            width="22"
            height="9"
            rx="4"
            fill="#475569"
          />
        </g>
      );
    default: {
      const _exhaustive: never = preset;
      return _exhaustive;
    }
  }
}

function renderFrontApparatus(
  preset: ApparatusPreset,
  pose: FrontPose,
  viewSpec: FrontViewSpec,
  exerciseId: string
) {
  const cfg = viewSpec.apparatusConfig ?? {};
  switch (preset) {
    case 'none':
      return null;
    case 'mat':
      return (
        <rect
          x="42"
          y="181"
          width="236"
          height="9"
          rx="4.5"
          fill="#1D222D"
          stroke="#353E52"
          strokeWidth="1.2"
        />
      );
    case 'flat-bench': {
      const bx = cfg.benchX ?? 160;
      const by = cfg.benchY ?? 114;
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <rect x={bx - 18} y={by} width="36" height="62" rx="6" fill="#252B3B" />
          <line x1={bx} y1={by + 62} x2={bx} y2="190" strokeWidth="4" />
        </g>
      );
    }
    case 'incline-bench': {
      const bx = cfg.benchX ?? 160;
      const by = cfg.benchY ?? 146;
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <rect x={bx - 16} y="68" width="32" height="74" rx="6" fill="#252B3B" />
          <rect x={bx - 22} y={by - 4} width="44" height="10" rx="4" fill="#252B3B" />
          <line x1={bx} y1={by + 6} x2={bx} y2="190" strokeWidth="4" />
        </g>
      );
    }
    case 'chest-press-machine': {
      const sx = cfg.seatX ?? 160;
      const sy = cfg.seatY ?? 136;
      return (
        <g stroke="#394052" strokeWidth="1.4">
          {/* Estrutura lateral e encosto */}
          <rect x="78" y="34" width="12" height="156" rx="4" fill="#1B1F2A" />
          <rect x="230" y="34" width="12" height="156" rx="4" fill="#1B1F2A" />
          <rect x={sx - 18} y="64" width="36" height="72" rx="6" fill="#252B3B" />
          <rect x={sx - 24} y={sy} width="48" height="10" rx="4" fill="#252B3B" />
          <line x1={sx} y1={sy + 10} x2={sx} y2="190" strokeWidth="4" />
          {/* Alavancas convergentes até as mãos */}
          <line
            x1="90"
            y1="52"
            x2={pose.leftHand.x}
            y2={pose.leftHand.y}
            stroke="#59637D"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <line
            x1="230"
            y1="52"
            x2={pose.rightHand.x}
            y2={pose.rightHand.y}
            stroke="#59637D"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <rect x={pose.leftHand.x - 8} y={pose.leftHand.y - 2.5} width="16" height="5" rx="2" fill="#475569" />
          <rect x={pose.rightHand.x - 8} y={pose.rightHand.y - 2.5} width="16" height="5" rx="2" fill="#475569" />
        </g>
      );
    }
    case 'peck-deck':
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <rect x="142" y="62" width="36" height="76" rx="6" fill="#252B3B" />
          <rect x="136" y="136" width="48" height="10" rx="4" fill="#252B3B" />
          <line x1="160" y1="146" x2="160" y2="190" strokeWidth="4" />
          <line
            x1="138"
            y1="44"
            x2={pose.leftHand.x}
            y2={pose.leftHand.y}
            stroke="#59637D"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1="182"
            y1="44"
            x2={pose.rightHand.x}
            y2={pose.rightHand.y}
            stroke="#59637D"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <rect
            x={pose.leftHand.x - 3}
            y={pose.leftHand.y - 10}
            width="6"
            height="20"
            rx="3"
            fill="#475569"
          />
          <rect
            x={pose.rightHand.x - 3}
            y={pose.rightHand.y - 10}
            width="6"
            height="20"
            rx="3"
            fill="#475569"
          />
        </g>
      );
    case 'dual-cable-high': {
      const ay = cfg.anchorY ?? 36;
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <rect x="34" y="22" width="14" height="168" rx="4" fill="#1B1F2A" />
          <rect x="272" y="22" width="14" height="168" rx="4" fill="#1B1F2A" />
          <circle cx="48" cy={ay} r="4.5" fill="#6B7280" stroke="none" />
          <circle cx="272" cy={ay} r="4.5" fill="#6B7280" stroke="none" />
          <line x1="48" y1={ay} x2={pose.leftHand.x} y2={pose.leftHand.y} stroke="#94A3B8" strokeWidth="1.7" />
          <line x1="272" y1={ay} x2={pose.rightHand.x} y2={pose.rightHand.y} stroke="#94A3B8" strokeWidth="1.7" />
        </g>
      );
    }
    case 'lat-pulldown': {
      const centerBar = midPoint(pose.leftHand, pose.rightHand);
      const ax = cfg.anchorX ?? 160;
      const ay = cfg.anchorY ?? 24;
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <rect x="76" y="16" width="168" height="8" rx="3" fill="#1B1F2A" />
          <line x1={ax} y1={ay} x2={centerBar.x} y2={centerBar.y} stroke="#94A3B8" strokeWidth="1.8" />
          <rect x="136" y="140" width="48" height="10" rx="4" fill="#252B3B" />
          <rect x="130" y="128" width="60" height="8" rx="4" fill="#475569" />
          <line x1="160" y1="150" x2="160" y2="190" strokeWidth="4" />
        </g>
      );
    }
    case 'chest-supported-row': {
      const sx = cfg.seatX ?? 160;
      const sy = cfg.seatY ?? 138;
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <rect x={sx - 16} y="66" width="32" height="60" rx="6" fill="#252B3B" />
          <rect x={sx - 24} y={sy} width="48" height="10" rx="4" fill="#252B3B" />
          <line x1={sx - 12} y1={sy + 10} x2={sx - 16} y2="190" strokeWidth="4" />
          <line x1={sx + 12} y1={sy + 10} x2={sx + 16} y2="190" strokeWidth="4" />
          {viewSpec.load === 'none' && (
            <>
              <line
                x1="104"
                y1="48"
                x2={pose.leftHand.x}
                y2={pose.leftHand.y}
                stroke="#59637D"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <line
                x1="216"
                y1="48"
                x2={pose.rightHand.x}
                y2={pose.rightHand.y}
                stroke="#59637D"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </>
          )}
        </g>
      );
    }
    case 'seated-cable-row': {
      const ax = cfg.anchorX ?? 160;
      const ay = cfg.anchorY ?? 126;
      const targets =
        cfg.cableHand === 'left'
          ? [pose.leftHand]
          : cfg.cableHand === 'right'
            ? [pose.rightHand]
            : [midPoint(pose.leftHand, pose.rightHand)];
      return (
        <g stroke="#394052" strokeWidth="1.4">
          {/* Banco e apoios de pé */}
          <rect x="136" y="140" width="48" height="11" rx="4" fill="#252B3B" />
          <line x1="160" y1="151" x2="160" y2="190" strokeWidth="4" />
          <rect x="122" y="178" width="22" height="8" rx="3" fill="#334155" />
          <rect x="176" y="178" width="22" height="8" rx="3" fill="#334155" />
          {/* Roldana frontal + cabo */}
          <circle cx={ax} cy={ay} r="5.5" fill="#1B1F2A" stroke="#64748B" strokeWidth="1.5" />
          <circle cx={ax} cy={ay} r="2" fill="#94A3B8" stroke="none" />
          {targets.map((pt, idx) => (
            <line
              key={idx}
              x1={ax}
              y1={ay}
              x2={pt.x}
              y2={pt.y}
              stroke="#94A3B8"
              strokeWidth="1.8"
            />
          ))}
        </g>
      );
    }
    case 'cable-single': {
      const ax = cfg.anchorX ?? 52;
      const ay = cfg.anchorY ?? 112;
      const isCenteredTower = Math.abs(ax - 160) < 16;
      const towerX = isCenteredTower ? ax - 7 : ax < 160 ? ax - 14 : ax + 2;
      const targets =
        viewSpec.load === 'rope'
          ? [
              {
                x: (pose.leftHand.x + pose.rightHand.x) / 2,
                y: Math.min(pose.leftHand.y, pose.rightHand.y) - 14,
              },
            ]
          : resolveFrontCableTargets(pose, cfg, exerciseId, ax, ay);
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <rect
            x={towerX}
            y="22"
            width="14"
            height="168"
            rx="4"
            fill="#1B1F2A"
          />
          <circle cx={ax} cy={ay} r="4.5" fill="#6B7280" stroke="none" />
          {targets.map((pt, idx) => (
            <line
              key={idx}
              x1={ax}
              y1={ay}
              x2={pt.x}
              y2={pt.y}
              stroke="#94A3B8"
              strokeWidth="1.7"
            />
          ))}
        </g>
      );
    }
    case 'shoulder-press-machine': {
      const sx = cfg.seatX ?? 160;
      const sy = cfg.seatY ?? 138;
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <rect x="82" y="32" width="12" height="158" rx="4" fill="#1B1F2A" />
          <rect x="226" y="32" width="12" height="158" rx="4" fill="#1B1F2A" />
          <rect x={sx - 18} y="68" width="36" height="68" rx="6" fill="#252B3B" />
          <rect x={sx - 24} y={sy} width="48" height="10" rx="4" fill="#252B3B" />
          <line x1={sx} y1={sy + 10} x2={sx} y2="190" strokeWidth="4" />
          {/* Alavancas laterais ligadas às mãos */}
          <line
            x1="94"
            y1={pose.leftHand.y}
            x2={pose.leftHand.x}
            y2={pose.leftHand.y}
            stroke="#59637D"
            strokeWidth="3.4"
            strokeLinecap="round"
          />
          <line
            x1="226"
            y1={pose.rightHand.y}
            x2={pose.rightHand.x}
            y2={pose.rightHand.y}
            stroke="#59637D"
            strokeWidth="3.4"
            strokeLinecap="round"
          />
        </g>
      );
    }
    case 'preacher-bench': {
      const bx = cfg.benchX ?? 160;
      const by = cfg.benchY ?? 104;
      return (
        <g stroke="#394052" strokeWidth="1.4">
          {/* Assento atrás */}
          <rect x={bx - 24} y="142" width="48" height="10" rx="4" fill="#1F2432" />
          {/* Almofada larga Scott */}
          <rect x={bx - 46} y={by} width="92" height="28" rx="7" fill="#252B3B" />
          <line x1={bx - 30} y1={by + 28} x2={bx - 34} y2="190" strokeWidth="4" />
          <line x1={bx + 30} y1={by + 28} x2={bx + 34} y2="190" strokeWidth="4" />
        </g>
      );
    }
    case 'leg-press-45':
      return (
        <g stroke="#394052" strokeWidth="1.4">
          {/* Trilhos laterais e encosto ficam atrás do corpo; plataforma móvel vai em primeiro plano */}
          <rect x="78" y="34" width="10" height="156" rx="4" fill="#1B1F2A" />
          <rect x="232" y="34" width="10" height="156" rx="4" fill="#1B1F2A" />
          <rect x="132" y="88" width="56" height="68" rx="7" fill="#252B3B" />
        </g>
      );
    case 'bulgarian-bench': {
      const bx = cfg.benchX ?? 160;
      const by = cfg.benchY ?? 150;
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <rect x={bx - 36} y={by} width="72" height="10" rx="4" fill="#252B3B" />
          <line x1={bx - 26} y1={by + 10} x2={bx - 26} y2="190" strokeWidth="4" />
          <line x1={bx + 26} y1={by + 10} x2={bx + 26} y2="190" strokeWidth="4" />
        </g>
      );
    }
    case 'leg-extension': {
      const rollerY = (pose.leftFoot.y + pose.rightFoot.y) / 2 - 4;
      const leftX = Math.min(pose.leftFoot.x, pose.rightFoot.x) - 18;
      const rightX = Math.max(pose.leftFoot.x, pose.rightFoot.x) + 18;
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <rect x="140" y="62" width="40" height="66" rx="6" fill="#252B3B" />
          <rect x="130" y="128" width="60" height="10" rx="4" fill="#252B3B" />
          <line x1="142" y1="138" x2="142" y2="190" strokeWidth="4" />
          <line x1="178" y1="138" x2="178" y2="190" strokeWidth="4" />
          {/* Rolo frontal sobre canelas */}
          <rect
            x={leftX}
            y={rollerY - 5}
            width={Math.max(44, rightX - leftX)}
            height="10"
            rx="5"
            fill="#475569"
          />
        </g>
      );
    }
    case 'seated-leg-curl': {
      const thighPadY = (pose.leftKnee.y + pose.rightKnee.y) / 2 - 12;
      const rollerY = (pose.leftFoot.y + pose.rightFoot.y) / 2 + 2;
      const leftX = Math.min(pose.leftFoot.x, pose.rightFoot.x) - 18;
      const rightX = Math.max(pose.leftFoot.x, pose.rightFoot.x) + 18;
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <rect x="140" y="62" width="40" height="66" rx="6" fill="#252B3B" />
          <rect x="130" y="128" width="60" height="10" rx="4" fill="#252B3B" />
          <line x1="142" y1="138" x2="142" y2="190" strokeWidth="4" />
          <line x1="178" y1="138" x2="178" y2="190" strokeWidth="4" />
          {/* Trava sobre as coxas */}
          <rect x="122" y={thighPadY} width="76" height="8" rx="4" fill="#475569" />
          {/* Rolo posterior nos tornozelos */}
          <rect
            x={leftX}
            y={rollerY - 5}
            width={Math.max(44, rightX - leftX)}
            height="10"
            rx="5"
            fill="#475569"
          />
        </g>
      );
    }
    case 'lying-leg-curl': {
      const rollerY = (pose.leftFoot.y + pose.rightFoot.y) / 2 - 4;
      const leftX = Math.min(pose.leftFoot.x, pose.rightFoot.x) - 18;
      const rightX = Math.max(pose.leftFoot.x, pose.rightFoot.x) + 18;
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <rect x="124" y="132" width="72" height="14" rx="5" fill="#252B3B" />
          <line x1="134" y1="146" x2="132" y2="190" strokeWidth="4" />
          <line x1="186" y1="146" x2="188" y2="190" strokeWidth="4" />
          <rect
            x={leftX}
            y={rollerY - 5}
            width={Math.max(44, rightX - leftX)}
            height="10"
            rx="5"
            fill="#475569"
          />
        </g>
      );
    }
    case 'hip-thrust-bench': {
      const bx = cfg.benchX ?? 160;
      const by = cfg.benchY ?? 108;
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <rect x={bx - 56} y={by} width="112" height="16" rx="5" fill="#252B3B" />
          <line x1={bx - 46} y1={by + 16} x2={bx - 46} y2="190" strokeWidth="4" />
          <line x1={bx + 46} y1={by + 16} x2={bx + 46} y2="190" strokeWidth="4" />
        </g>
      );
    }
    case 'hip-abductor':
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <rect x="142" y="64" width="36" height="68" rx="6" fill="#252B3B" />
          <rect x="136" y="130" width="48" height="10" rx="4" fill="#252B3B" />
          <line x1="160" y1="140" x2="160" y2="190" strokeWidth="4" />
          <rect
            x={pose.leftKnee.x - 10}
            y={pose.leftKnee.y - 12}
            width="7"
            height="24"
            rx="3"
            fill="#475569"
          />
          <rect
            x={pose.rightKnee.x + 3}
            y={pose.rightKnee.y - 12}
            width="7"
            height="24"
            rx="3"
            fill="#475569"
          />
        </g>
      );
    case 'hip-adductor':
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <rect x="142" y="64" width="36" height="68" rx="6" fill="#252B3B" />
          <rect x="136" y="130" width="48" height="10" rx="4" fill="#252B3B" />
          <line x1="160" y1="140" x2="160" y2="190" strokeWidth="4" />
          <rect
            x={pose.leftKnee.x + 4}
            y={pose.leftKnee.y - 12}
            width="7"
            height="24"
            rx="3"
            fill="#475569"
          />
          <rect
            x={pose.rightKnee.x - 11}
            y={pose.rightKnee.y - 12}
            width="7"
            height="24"
            rx="3"
            fill="#475569"
          />
        </g>
      );
    case 'seated-calf':
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <rect x="132" y="134" width="56" height="10" rx="4" fill="#252B3B" />
          <line x1="160" y1="144" x2="160" y2="190" strokeWidth="4" />
          {/* Degrau de apoio dos pés */}
          <rect x="122" y="181" width="76" height="9" rx="3" fill="#334155" />
          {/* Almofadas sobre os joelhos */}
          <rect x={pose.leftKnee.x - 11} y={pose.leftKnee.y - 13} width="22" height="9" rx="4" fill="#475569" />
          <rect x={pose.rightKnee.x - 11} y={pose.rightKnee.y - 13} width="22" height="9" rx="4" fill="#475569" />
          <line
            x1={pose.leftKnee.x}
            y1={pose.leftKnee.y - 9}
            x2={pose.rightKnee.x}
            y2={pose.rightKnee.y - 9}
            stroke="#59637D"
            strokeWidth="3.2"
          />
        </g>
      );
    case 'standing-calf':
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <rect x="108" y="34" width="10" height="156" rx="4" fill="#1B1F2A" />
          <rect x="202" y="34" width="10" height="156" rx="4" fill="#1B1F2A" />
          <rect x="122" y="181" width="76" height="9" rx="3" fill="#334155" />
          {/* Apoios de ombro */}
          <rect
            x={pose.leftShoulder.x - 9}
            y={pose.leftShoulder.y - 13}
            width="18"
            height="9"
            rx="4"
            fill="#475569"
          />
          <rect
            x={pose.rightShoulder.x - 9}
            y={pose.rightShoulder.y - 13}
            width="18"
            height="9"
            rx="4"
            fill="#475569"
          />
          <line
            x1={pose.leftShoulder.x}
            y1={pose.leftShoulder.y - 9}
            x2={pose.rightShoulder.x}
            y2={pose.rightShoulder.y - 9}
            stroke="#59637D"
            strokeWidth="3.2"
          />
        </g>
      );
    default: {
      const _exhaustive: never = preset;
      return _exhaustive;
    }
  }
}

function renderSideLoad(load: LoadStyle, pose: SidePose, viewSpec: SideViewSpec) {
  const grip = viewSpec.grip;
  const cfg = viewSpec.apparatusConfig ?? {};
  const isNeutral = grip === 'neutral';

  switch (load) {
    case 'none':
      return null;
    case 'dumbbells':
      return (
        <g>
          {isNeutral
            ? renderDumbbellBroadside(pose.farElbow, pose.farHand, 'perp-forearm', true)
            : renderDumbbellEndOn(pose.farHand.x, pose.farHand.y, true)}
          {isNeutral
            ? renderDumbbellBroadside(pose.nearElbow, pose.nearHand, 'perp-forearm', false)
            : renderDumbbellEndOn(pose.nearHand.x, pose.nearHand.y, false)}
        </g>
      );
    case 'dumbbell-near':
      return isNeutral
        ? renderDumbbellBroadside(pose.nearElbow, pose.nearHand, 'perp-forearm', false)
        : renderDumbbellEndOn(pose.nearHand.x, pose.nearHand.y, false);
    case 'bar-wide': {
      const handMid = midPoint(pose.farHand, pose.nearHand);
      return (
        <g>
          <line
            x1={pose.farHand.x}
            y1={pose.farHand.y}
            x2={pose.nearHand.x}
            y2={pose.nearHand.y}
            stroke="#CBD5E1"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx={handMid.x} cy={handMid.y} r="4.6" fill="#E5E7EB" stroke="#18181B" strokeWidth="1.2" />
          <circle cx={handMid.x} cy={handMid.y} r="1.6" fill="#334155" />
        </g>
      );
    }
    case 'v-bar':
      return (
        <g>
          <path
            d={`M ${pose.nearHand.x - 6} ${pose.nearHand.y - 6} L ${pose.nearHand.x + 2} ${pose.nearHand.y} L ${pose.nearHand.x - 6} ${pose.nearHand.y + 6}`}
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x={pose.nearHand.x - 2.5}
            y={pose.nearHand.y - 7}
            width="5"
            height="14"
            rx="2"
            fill="#E2E8F0"
            stroke="#18181B"
            strokeWidth="1"
          />
        </g>
      );
    case 'rope': {
      const dx = pose.nearHand.x - pose.nearElbow.x;
      const dy = pose.nearHand.y - pose.nearElbow.y;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      return (
        <g>
          <line
            x1={pose.nearHand.x - ux * 6}
            y1={pose.nearHand.y - uy * 6}
            x2={pose.nearHand.x + ux * 8}
            y2={pose.nearHand.y + uy * 8}
            stroke="#D6D3D1"
            strokeWidth="4.2"
            strokeLinecap="round"
            strokeDasharray="3 1.5"
          />
          <circle
            cx={pose.nearHand.x + ux * 9}
            cy={pose.nearHand.y + uy * 9}
            r="3.6"
            fill="#1F2430"
            stroke="#94A3B8"
            strokeWidth="1.1"
          />
        </g>
      );
    }
    case 'cable-handle': {
      const targets =
        viewSpec.apparatus === 'dual-cable-high' || cfg.cableHand === 'both'
          ? [pose.farHand, pose.nearHand]
          : resolveSideCableTargets(pose, cfg);
      return (
        <g>
          {targets.map((pt, idx) => (
            <g key={idx} opacity={targets.length > 1 && idx === 0 ? 0.65 : 1}>
              <polygon
                points={`${pt.x - 6},${pt.y - 5} ${pt.x + 4},${pt.y} ${pt.x - 6},${pt.y + 5}`}
                fill="none"
                stroke="#94A3B8"
                strokeWidth="1.4"
              />
              {isNeutral ? (
                <rect x={pt.x - 2} y={pt.y - 6.5} width="4" height="13" rx="1.8" fill="#E5E7EB" stroke="#18181B" strokeWidth="1" />
              ) : (
                <rect x={pt.x - 6} y={pt.y - 2} width="12" height="4" rx="1.8" fill="#E5E7EB" stroke="#18181B" strokeWidth="1" />
              )}
            </g>
          ))}
        </g>
      );
    }
    case 'hip-barbell':
      return (
        <g>
          <circle
            cx={pose.hip.x + 2}
            cy={pose.hip.y - 8}
            r="12"
            fill="#2B3140"
            stroke="#E5E7EB"
            strokeWidth="2"
          />
          <circle cx={pose.hip.x + 2} cy={pose.hip.y - 8} r="5.5" fill="#1E2330" stroke="#64748B" strokeWidth="1" />
          <circle cx={pose.hip.x + 2} cy={pose.hip.y - 8} r="2.6" fill="#E5E7EB" />
        </g>
      );
    default: {
      const _exhaustive: never = load;
      return _exhaustive;
    }
  }
}

function renderFrontLoad(
  load: LoadStyle,
  pose: FrontPose,
  viewSpec: FrontViewSpec,
  exerciseId: string
) {
  const grip = viewSpec.grip;
  const cfg = viewSpec.apparatusConfig ?? {};
  const isNeutral = grip === 'neutral';

  switch (load) {
    case 'none':
      return null;
    case 'dumbbells':
      return (
        <g>
          {isNeutral ? (
            <>
              {renderDumbbellEndOn(pose.leftHand.x, pose.leftHand.y)}
              {renderDumbbellEndOn(pose.rightHand.x, pose.rightHand.y)}
            </>
          ) : (
            <>
              {renderDumbbellBroadside(pose.leftElbow, pose.leftHand, 'horizontal')}
              {renderDumbbellBroadside(pose.rightElbow, pose.rightHand, 'horizontal')}
            </>
          )}
        </g>
      );
    case 'dumbbell-near': {
      const targetHand = cfg.cableHand === 'left' ? pose.leftHand : pose.rightHand;
      const targetElbow = cfg.cableHand === 'left' ? pose.leftElbow : pose.rightElbow;
      return isNeutral
        ? renderDumbbellEndOn(targetHand.x, targetHand.y)
        : renderDumbbellBroadside(targetElbow, targetHand, 'horizontal');
    }
    case 'bar-wide': {
      const dx = pose.rightHand.x - pose.leftHand.x;
      const dy = pose.rightHand.y - pose.leftHand.y;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const x1 = pose.leftHand.x - ux * 20;
      const y1 = pose.leftHand.y - uy * 20;
      const x2 = pose.rightHand.x + ux * 20;
      const y2 = pose.rightHand.y + uy * 20;
      return (
        <g>
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#E5E7EB"
            strokeWidth="4.4"
            strokeLinecap="round"
          />
          <circle cx={x1} cy={y1} r="2.6" fill="#94A3B8" />
          <circle cx={x2} cy={y2} r="2.6" fill="#94A3B8" />
        </g>
      );
    }
    case 'v-bar': {
      const apex = midPoint(pose.leftHand, pose.rightHand);
      return (
        <g>
          <path
            d={`M ${pose.leftHand.x} ${pose.leftHand.y} L ${apex.x} ${apex.y - 10} L ${pose.rightHand.x} ${pose.rightHand.y}`}
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x={pose.leftHand.x - 2.5} y={pose.leftHand.y - 6.5} width="5" height="13" rx="2" fill="#E2E8F0" stroke="#18181B" strokeWidth="1" />
          <rect x={pose.rightHand.x - 2.5} y={pose.rightHand.y - 6.5} width="5" height="13" rx="2" fill="#E2E8F0" stroke="#18181B" strokeWidth="1" />
        </g>
      );
    }
    case 'rope': {
      const apex = midPoint(pose.leftHand, pose.rightHand);
      const topY = Math.min(pose.leftHand.y, pose.rightHand.y) - 14;
      return (
        <g>
          <path
            d={`M ${pose.leftHand.x} ${pose.leftHand.y + 5} Q ${pose.leftHand.x + 4} ${topY + 6} ${apex.x} ${topY} Q ${pose.rightHand.x - 4} ${topY + 6} ${pose.rightHand.x} ${pose.rightHand.y + 5}`}
            fill="none"
            stroke="#D6D3D1"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="3.5 1.5"
          />
          <circle cx={pose.leftHand.x} cy={pose.leftHand.y + 6} r="3.6" fill="#1F2430" stroke="#94A3B8" strokeWidth="1.1" />
          <circle cx={pose.rightHand.x} cy={pose.rightHand.y + 6} r="3.6" fill="#1F2430" stroke="#94A3B8" strokeWidth="1.1" />
        </g>
      );
    }
    case 'cable-handle': {
      let targets: Point2D[] = [pose.leftHand, pose.rightHand];
      if (viewSpec.apparatus === 'cable-single') {
        const ax = cfg.anchorX ?? 52;
        const ay = cfg.anchorY ?? 112;
        targets = resolveFrontCableTargets(pose, cfg, exerciseId, ax, ay);
      } else if (viewSpec.apparatus === 'seated-cable-row') {
        if (cfg.cableHand === 'left') targets = [pose.leftHand];
        else if (cfg.cableHand === 'right') targets = [pose.rightHand];
      }
      return (
        <g>
          {targets.map((pt, idx) => (
            <g key={idx}>
              {isNeutral ? (
                <rect x={pt.x - 2.2} y={pt.y - 6.5} width="4.4" height="13" rx="2" fill="#E5E7EB" stroke="#18181B" strokeWidth="1" />
              ) : (
                <rect x={pt.x - 6.5} y={pt.y - 2.2} width="13" height="4.4" rx="2" fill="#E5E7EB" stroke="#18181B" strokeWidth="1" />
              )}
            </g>
          ))}
        </g>
      );
    }
    case 'hip-barbell': {
      const hipMid = midPoint(pose.leftHip, pose.rightHip);
      const y = hipMid.y - 4;
      return (
        <g>
          <line x1="88" y1={y} x2="232" y2={y} stroke="#CBD5E1" strokeWidth="4" strokeLinecap="round" />
          {/* Almofada central sobre o quadril */}
          <rect x={hipMid.x - 24} y={y - 5.5} width="48" height="11" rx="5" fill="#334155" stroke="#64748B" strokeWidth="1.2" />
          {/* Anilhas laterais */}
          <rect x="82" y={y - 16} width="9" height="32" rx="2.5" fill="#2A303E" stroke="#E2E8F0" strokeWidth="1.2" />
          <rect x="229" y={y - 16} width="9" height="32" rx="2.5" fill="#2A303E" stroke="#E2E8F0" strokeWidth="1.2" />
        </g>
      );
    }
    default: {
      const _exhaustive: never = load;
      return _exhaustive;
    }
  }
}

export function ExerciseExecutionScene({
  spec,
  view,
  progress,
  label,
  compact = false,
}: ExerciseExecutionSceneProps) {
  const arrowId = useId();
  const activeView: AnimationView = view ?? spec.defaultView;
  const activeSet = new Set<ActiveBodyRegion>(spec.activeHighlights);
  const highlightOpacity = 0.52 + 0.43 * progress;

  if (activeView === 'side') {
    const viewSpec = spec.side;
    const pose = interpolateSidePose(viewSpec.start, viewSpec.mid, viewSpec.end, progress);
    const faceDir = pose.faceDir ?? 1;
    const upperArm = subSegment(pose.shoulder, pose.nearElbow, 0.15, 0.85);

    return (
      <div className="relative rounded-2xl bg-[#101014] border border-[#24242E] overflow-hidden">
        {label && (
          <div className="px-2.5 py-1.5 bg-[#14141A] border-b border-[#22222C] text-[0.7rem] font-semibold text-[#D1D5DB]">
            {label}
          </div>
        )}
        <svg
          viewBox="0 0 320 220"
          className={`w-full ${compact ? 'h-40' : 'h-52 sm:h-56'} block select-none`}
          role="img"
          aria-label={label ? `${label} (vista lateral)` : 'Ilustração lateral de execução do exercício'}
        >
          <defs>
            <marker
              id={arrowId}
              viewBox="0 0 10 10"
              refX="7"
              refY="5"
              markerWidth="5.5"
              markerHeight="5.5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#84CC16" />
            </marker>
          </defs>

          {/* Solo sutil */}
          <line x1="20" y1="190" x2="300" y2="190" stroke="#262834" strokeWidth="2" />

          {/* Aparelho */}
          {renderSideApparatus(viewSpec.apparatus, pose, viewSpec)}

          {/* Membros distantes (profundidade) */}
          <Limb a={pose.hip} b={pose.farKnee} width={11} fill="#252836" stroke="#181A22" />
          <Limb a={pose.farKnee} b={pose.farFoot} width={8.5} fill="#252836" stroke="#181A22" />
          <Limb a={pose.shoulder} b={pose.farElbow} width={8.5} fill="#252836" stroke="#181A22" />
          <Limb a={pose.farElbow} b={pose.farHand} width={7} fill="#252836" stroke="#181A22" />
          <HandGrip elbow={pose.farElbow} hand={pose.farHand} grip={viewSpec.grip} role="far" dimmed />

          {/* Perna próxima */}
          <Limb
            a={pose.hip}
            b={pose.nearKnee}
            width={12.5}
            fill="#3B4054"
            stroke="#78809A"
            highlight={activeSet.has('quads') || activeSet.has('hamstrings') || activeSet.has('adductors')}
            highlightOpacity={highlightOpacity}
          />
          <Limb
            a={pose.nearKnee}
            b={pose.nearFoot}
            width={9.5}
            fill="#3B4054"
            stroke="#78809A"
            highlight={activeSet.has('calves')}
            highlightOpacity={highlightOpacity}
          />
          <circle cx={pose.nearFoot.x} cy={pose.nearFoot.y} r="4.5" fill="#4B526B" />

          {/* Tronco anatômico lateral */}
          <SideTorso
            shoulder={pose.shoulder}
            hip={pose.hip}
            faceDir={faceDir}
            activeSet={activeSet}
            highlightOpacity={highlightOpacity}
          />

          {/* Pescoço e Cabeça */}
          <Limb a={pose.shoulder} b={pose.neck} width={7.2} fill="#373C4F" stroke="#78809A" />
          <Head head={pose.head} neck={pose.neck} facing={faceDir} />

          {/* Braço próximo */}
          <Limb
            a={pose.shoulder}
            b={pose.nearElbow}
            width={9.5}
            fill="#434960"
            stroke="#8B93B0"
            highlight={activeSet.has('biceps') || activeSet.has('triceps')}
            highlightOpacity={highlightOpacity}
          />
          {activeSet.has('shoulders') && (
            <circle
              cx={pose.shoulder.x}
              cy={pose.shoulder.y}
              r="7"
              fill={ACTIVE_FILL}
              fillOpacity={highlightOpacity}
            />
          )}
          {(activeSet.has('biceps') || activeSet.has('triceps')) && (
            <line
              x1={upperArm[0].x}
              y1={upperArm[0].y}
              x2={upperArm[1].x}
              y2={upperArm[1].y}
              stroke={ACTIVE_FILL}
              strokeOpacity={highlightOpacity}
              strokeWidth="6.2"
              strokeLinecap="round"
            />
          )}
          <Limb
            a={pose.nearElbow}
            b={pose.nearHand}
            width={7.8}
            fill="#434960"
            stroke="#8B93B0"
            highlight={activeSet.has('forearms')}
            highlightOpacity={highlightOpacity}
          />

          {/* Carga + Mão/Pegada */}
          {renderSideLoad(viewSpec.load, pose, viewSpec)}
          <HandGrip elbow={pose.nearElbow} hand={pose.nearHand} grip={viewSpec.grip} role="near" />

          {/* Setas de movimento */}
          {viewSpec.motionArrows.map((d, idx) => (
            <path
              key={idx}
              d={d}
              fill="none"
              stroke="#84CC16"
              strokeWidth="2.1"
              strokeDasharray="4 3"
              strokeLinecap="round"
              markerEnd={`url(#${arrowId})`}
            />
          ))}
        </svg>

        {viewSpec.gripNote && (
          <div className="px-2.5 py-1.5 bg-[#14141A] border-t border-[#22222C] flex items-center gap-2 text-[0.7rem] text-[#C4C9D4]">
            <span className="px-1.5 py-0.5 rounded bg-[#1E2230] border border-[#2E3448] text-[0.62rem] font-semibold uppercase tracking-wide text-[#E2E8F0] shrink-0">
              {GRIP_LABELS[viewSpec.grip]}
            </span>
            <span className="leading-snug">{viewSpec.gripNote}</span>
          </div>
        )}
      </div>
    );
  }

  // Vista Frontal
  const viewSpec = spec.front;
  const pose = interpolateFrontPose(viewSpec.start, viewSpec.mid, viewSpec.end, progress);
  const shoulderMid = midPoint(pose.leftShoulder, pose.rightShoulder);
  const hipMid = midPoint(pose.leftHip, pose.rightHip);
  const isLegPressFront = viewSpec.apparatus === 'leg-press-45';
  const showForegroundRopeCable =
    viewSpec.apparatus === 'cable-single' && viewSpec.load === 'rope';
  const cfg = viewSpec.apparatusConfig ?? {};
  // Place the illustration in the plane of the torso, including the side plank.
  const torsoTransform = `matrix(${(pose.rightShoulder.x - pose.leftShoulder.x) / 40}
    ${(pose.rightShoulder.y - pose.leftShoulder.y) / 40}
    ${(hipMid.x - shoulderMid.x) / 50} ${(hipMid.y - shoulderMid.y) / 50}
    ${shoulderMid.x} ${shoulderMid.y})`;

  const frontLegs = (
    <g>
      <Limb
        a={pose.leftHip}
        b={pose.leftKnee}
        width={11.5}
        fill="#3B4054"
        stroke="#78809A"
        highlight={activeSet.has('quads') || activeSet.has('hamstrings')}
        highlightOpacity={highlightOpacity}
      />
      <Limb
        a={pose.rightHip}
        b={pose.rightKnee}
        width={11.5}
        fill="#3B4054"
        stroke="#78809A"
        highlight={activeSet.has('quads') || activeSet.has('hamstrings')}
        highlightOpacity={highlightOpacity}
      />
      {activeSet.has('adductors') && (
        <>
          <line
            x1={pose.leftHip.x + 4}
            y1={pose.leftHip.y + 4}
            x2={pose.leftKnee.x + 3}
            y2={pose.leftKnee.y - 4}
            stroke={ACTIVE_FILL}
            strokeOpacity={highlightOpacity}
            strokeWidth="6.5"
            strokeLinecap="round"
          />
          <line
            x1={pose.rightHip.x - 4}
            y1={pose.rightHip.y + 4}
            x2={pose.rightKnee.x - 3}
            y2={pose.rightKnee.y - 4}
            stroke={ACTIVE_FILL}
            strokeOpacity={highlightOpacity}
            strokeWidth="6.5"
            strokeLinecap="round"
          />
        </>
      )}
      <Limb
        a={pose.leftKnee}
        b={pose.leftFoot}
        width={9}
        fill="#3B4054"
        stroke="#78809A"
        highlight={activeSet.has('calves')}
        highlightOpacity={highlightOpacity}
      />
      <Limb
        a={pose.rightKnee}
        b={pose.rightFoot}
        width={9}
        fill="#3B4054"
        stroke="#78809A"
        highlight={activeSet.has('calves')}
        highlightOpacity={highlightOpacity}
      />
      {!isLegPressFront && (
        <>
          <circle cx={pose.leftFoot.x} cy={pose.leftFoot.y} r="4.2" fill="#4B526B" />
          <circle cx={pose.rightFoot.x} cy={pose.rightFoot.y} r="4.2" fill="#4B526B" />
        </>
      )}
    </g>
  );

  const legPressFootMid = midPoint(pose.leftFoot, pose.rightFoot);
  const legPressSledY = Math.min(168, Math.max(46, legPressFootMid.y - 5));

  return (
    <div className="relative rounded-2xl bg-[#101014] border border-[#24242E] overflow-hidden">
      {label && (
        <div className="px-2.5 py-1.5 bg-[#14141A] border-b border-[#22222C] text-[0.7rem] font-semibold text-[#D1D5DB]">
          {label}
        </div>
      )}
      <svg
        viewBox="0 0 320 220"
        className={`w-full ${compact ? 'h-40' : 'h-52 sm:h-56'} block select-none`}
        role="img"
        aria-label={label ? `${label} (vista frontal)` : 'Ilustração frontal de execução do exercício'}
      >
        <defs>
          <marker
            id={arrowId}
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerWidth="5.5"
            markerHeight="5.5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#84CC16" />
          </marker>
        </defs>

        <line x1="20" y1="190" x2="300" y2="190" stroke="#262834" strokeWidth="2" />

        {renderFrontApparatus(viewSpec.apparatus, pose, viewSpec, spec.exerciseId)}

        {/* Pernas (atrás do tronco por padrão; na frente do tronco no Leg Press 45°) */}
        {!isLegPressFront && frontLegs}

        {/* Tronco frontal anatômico (pelve alinhada em y≈52 para preservar proporção das pernas) */}
        <g transform={torsoTransform}>
          <path
            d="M-20 0 Q-12 -1.5 -5.5 -4.5 Q0 -2 5.5 -4.5 Q12 -1.5 20 0
               Q21.5 9 15.5 23 Q12 31.5 13 40 L14.5 47.5
               Q7 52.2 0 52.2 Q-7 52.2 -14.5 47.5
               L-13 40 Q-12 31.5 -15.5 23 Q-21.5 9 -20 0Z"
            fill="#495369"
            stroke="#8996AA"
            strokeWidth="1.1"
          />
          {(activeSet.has('traps') || activeSet.has('upper-back')) && (
            <path
              d="M-14 -0.5 Q-6 -4.5 0 -2 Q6 -4.5 14 -0.5 L11 4.5 Q0 2.5 -11 4.5Z"
              fill={ACTIVE_FILL}
              opacity={highlightOpacity}
            />
          )}
          {[-1, 1].map((side) => (
            <g key={side} transform={`scale(${side} 1)`}>
              <path
                d="M1.2 4 Q10.5 0.5 16.8 4.5 L15.5 13.5 Q9.5 18.5 1.8 14.5Z"
                fill={activeSet.has('chest') ? ACTIVE_FILL : '#627085'}
                opacity={activeSet.has('chest') ? highlightOpacity : 0.8}
              />
              <path
                d="M16.5 13 Q16.5 23 11.2 33.5 L9 28 11 17Z"
                fill={activeSet.has('lats') || activeSet.has('upper-back') ? ACTIVE_FILL : '#374257'}
                opacity={activeSet.has('lats') || activeSet.has('upper-back') ? highlightOpacity : 0.8}
              />
              <path
                d="M1.2 18.5 Q6 17.5 8.8 20.5 Q7.2 31.5 5.2 37.5 L1.2 39.5Z"
                fill={activeSet.has('abs') ? ACTIVE_FILL : '#536074'}
                opacity={activeSet.has('abs') ? highlightOpacity : 1}
              />
              {activeSet.has('obliques') && (
                <path
                  d="M11.8 21.5 L9.2 37.5 6.2 39.5 Q6.8 30 11.8 21.5Z"
                  fill={ACTIVE_ACCENT}
                  opacity={highlightOpacity}
                />
              )}
            </g>
          ))}
          {activeSet.has('lower-back') && (
            <path
              d="M-8 31 Q0 29 8 31 L7 38.5 Q0 40.5 -7 38.5Z"
              fill={ACTIVE_FILL}
              opacity={highlightOpacity * 0.78}
            />
          )}
          <path
            d="M-13.2 40 Q0 44 13.2 40 L14.5 47.5 Q7 52.2 0 52.2 Q-7 52.2 -14.5 47.5Z"
            fill="#333D51"
          />
        </g>
        {activeSet.has('glutes') && (
          <>
            <circle cx={pose.leftHip.x - 2} cy={pose.leftHip.y} r="7" fill={ACTIVE_FILL} fillOpacity={highlightOpacity} />
            <circle cx={pose.rightHip.x + 2} cy={pose.rightHip.y} r="7" fill={ACTIVE_FILL} fillOpacity={highlightOpacity} />
          </>
        )}

        {/* Pescoço e Cabeça */}
        <Limb a={shoulderMid} b={pose.neck} width={7.4} fill="#373C4F" stroke="#78809A" />
        <Head head={pose.head} neck={pose.neck} />

        {/* Braços */}
        <Limb
          a={pose.leftShoulder}
          b={pose.leftElbow}
          width={9}
          fill="#434960"
          stroke="#8B93B0"
          highlight={activeSet.has('biceps') || activeSet.has('triceps')}
          highlightOpacity={highlightOpacity}
        />
        <Limb
          a={pose.rightShoulder}
          b={pose.rightElbow}
          width={9}
          fill="#434960"
          stroke="#8B93B0"
          highlight={activeSet.has('biceps') || activeSet.has('triceps')}
          highlightOpacity={highlightOpacity}
        />
        {activeSet.has('shoulders') && (
          <>
            <circle cx={pose.leftShoulder.x} cy={pose.leftShoulder.y} r="6.5" fill={ACTIVE_FILL} fillOpacity={highlightOpacity} />
            <circle cx={pose.rightShoulder.x} cy={pose.rightShoulder.y} r="6.5" fill={ACTIVE_FILL} fillOpacity={highlightOpacity} />
          </>
        )}
        <Limb
          a={pose.leftElbow}
          b={pose.leftHand}
          width={7.5}
          fill="#434960"
          stroke="#8B93B0"
          highlight={activeSet.has('forearms')}
          highlightOpacity={highlightOpacity}
        />
        <Limb
          a={pose.rightElbow}
          b={pose.rightHand}
          width={7.5}
          fill="#434960"
          stroke="#8B93B0"
          highlight={activeSet.has('forearms')}
          highlightOpacity={highlightOpacity}
        />

        {/* Primeiro plano do Leg Press 45°: pernas à frente do tronco + plataforma móvel sob os pés */}
        {isLegPressFront && (
          <g>
            {frontLegs}
            <line x1="88" y1={legPressSledY} x2="102" y2={legPressSledY} stroke="#64748B" strokeWidth="4" />
            <line x1="218" y1={legPressSledY} x2="232" y2={legPressSledY} stroke="#64748B" strokeWidth="4" />
            <rect
              x="102"
              y={legPressSledY - 5.5}
              width="116"
              height="11"
              rx="4"
              fill="#3F4B60"
              stroke="#94A3B8"
              strokeWidth="1.4"
            />
            <rect
              x={pose.leftFoot.x - 7}
              y={pose.leftFoot.y - 4.5}
              width="14"
              height="9"
              rx="3"
              fill="#64748B"
              stroke="#CBD5E1"
              strokeWidth="1"
            />
            <rect
              x={pose.rightFoot.x - 7}
              y={pose.rightFoot.y - 4.5}
              width="14"
              height="9"
              rx="3"
              fill="#64748B"
              stroke="#CBD5E1"
              strokeWidth="1"
            />
          </g>
        )}

        {/* Cabo da polia em primeiro plano para corda frontal (ex.: tríceps polia / face pull) */}
        {showForegroundRopeCable && (
          <g>
            <line
              x1={cfg.anchorX ?? 160}
              y1={cfg.anchorY ?? 24}
              x2={(pose.leftHand.x + pose.rightHand.x) / 2}
              y2={Math.min(pose.leftHand.y, pose.rightHand.y) - 14}
              stroke="#94A3B8"
              strokeWidth="1.9"
            />
            <circle
              cx={(pose.leftHand.x + pose.rightHand.x) / 2}
              cy={Math.min(pose.leftHand.y, pose.rightHand.y) - 14}
              r="2.6"
              fill="#CBD5E1"
              stroke="#18181B"
              strokeWidth="0.9"
            />
          </g>
        )}

        {/* Carga + Mãos/Pegada */}
        {renderFrontLoad(viewSpec.load, pose, viewSpec, spec.exerciseId)}
        <HandGrip elbow={pose.leftElbow} hand={pose.leftHand} grip={viewSpec.grip} role="left" />
        <HandGrip elbow={pose.rightElbow} hand={pose.rightHand} grip={viewSpec.grip} role="right" />

        {/* Setas de movimento */}
        {viewSpec.motionArrows.map((d, idx) => (
          <path
            key={idx}
            d={d}
            fill="none"
            stroke="#84CC16"
            strokeWidth="2.1"
            strokeDasharray="4 3"
            strokeLinecap="round"
            markerEnd={`url(#${arrowId})`}
          />
        ))}
      </svg>

      {viewSpec.gripNote && (
        <div className="px-2.5 py-1.5 bg-[#14141A] border-t border-[#22222C] flex items-center gap-2 text-[0.7rem] text-[#C4C9D4]">
          <span className="px-1.5 py-0.5 rounded bg-[#1E2230] border border-[#2E3448] text-[0.62rem] font-semibold uppercase tracking-wide text-[#E2E8F0] shrink-0">
            {GRIP_LABELS[viewSpec.grip]}
          </span>
          <span className="leading-snug">{viewSpec.gripNote}</span>
        </div>
      )}
    </div>
  );
}

interface ExerciseExecutionPlayerProps {
  spec: ExerciseAnimationSpec;
  phaseLabels: { start: string; end: string };
}

export function ExerciseExecutionPlayer({
  spec,
  phaseLabels,
}: ExerciseExecutionPlayerProps) {
  const [viewMode, setViewMode] = useState<'animated' | 'phases'>('animated');
  const [activeView, setActiveView] = useState<AnimationView>(spec.defaultView);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<0.5 | 1>(1);
  const [progress, setProgress] = useState(0);

  const cyclePhase = useRef(0);

  useEffect(() => {
    setActiveView(spec.defaultView);
  }, [spec.exerciseId, spec.defaultView]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setPlaying(false);
    }
  }, []);

  useEffect(() => {
    if (viewMode !== 'animated' || !playing) return;
    let rafId = 0;
    let lastTime = performance.now();
    let phase = cyclePhase.current;
    const cycleMs = 3200;

    const tick = (now: number) => {
      const dt = Math.min(100, now - lastTime);
      lastTime = now;
      phase = (phase + (dt * speed) / cycleMs) % 1;
      cyclePhase.current = phase;
      // Vai (0->1) com breve pausa no pico e volta (1->0)
      let p: number;
      if (phase < 0.36) {
        p = phase / 0.36;
      } else if (phase < 0.46) {
        p = 1;
      } else if (phase < 0.92) {
        p = 1 - (phase - 0.46) / 0.46;
      } else {
        p = 0;
      }
      setProgress(p);
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [viewMode, playing, speed]);

  return (
    <div className="space-y-2.5">
      {/* Controles de Modo (Animação vs Fases) + Vista Ortogonal (Lateral vs Frontal) */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex p-0.5 rounded-xl bg-[#101014] border border-[#25252C]">
          <button
            type="button"
            onClick={() => setViewMode('animated')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              viewMode === 'animated'
                ? 'bg-[#25252C] text-[#F4F4F6]'
                : 'text-[#9CA3AF] hover:text-[#F4F4F6]'
            }`}
          >
            Animação
          </button>
          <button
            type="button"
            onClick={() => setViewMode('phases')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              viewMode === 'phases'
                ? 'bg-[#25252C] text-[#F4F4F6]'
                : 'text-[#9CA3AF] hover:text-[#F4F4F6]'
            }`}
          >
            Fases (2 imagens)
          </button>
        </div>

        {/* Alternador de vista ortogonal */}
        <div
          role="group"
          aria-label="Ângulo de visualização"
          className="inline-flex items-center p-0.5 rounded-xl bg-[#101014] border border-[#25252C]"
        >
          <span className="pl-2 pr-1 text-[#6B7280]" aria-hidden="true">
            <Eye className="w-3.5 h-3.5" />
          </span>
          <button
            type="button"
            aria-pressed={activeView === 'side'}
            onClick={() => setActiveView('side')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              activeView === 'side'
                ? 'bg-[#25252C] text-[#F4F4F6]'
                : 'text-[#9CA3AF] hover:text-[#F4F4F6]'
            }`}
          >
            Vista Lateral
          </button>
          <button
            type="button"
            aria-pressed={activeView === 'front'}
            onClick={() => setActiveView('front')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              activeView === 'front'
                ? 'bg-[#25252C] text-[#F4F4F6]'
                : 'text-[#9CA3AF] hover:text-[#F4F4F6]'
            }`}
          >
            Vista Frontal
          </button>
        </div>
      </div>

      {viewMode === 'animated' && (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setPlaying((prev) => !prev)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1E1E24] border border-[#2C2C35] text-xs font-semibold text-[#F4F4F6] hover:border-[#84CC16]/60"
          >
            {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {playing ? 'Pausar' : 'Reproduzir'}
          </button>
          <button
            type="button"
            onClick={() => setSpeed((s) => (s === 1 ? 0.5 : 1))}
            title="Alternar velocidade"
            className="px-2 py-1 rounded-lg bg-[#1E1E24] border border-[#2C2C35] text-xs font-semibold text-[#9CA3AF] hover:text-white tabular-nums"
          >
            {speed === 1 ? '1×' : '0.5×'}
          </button>
        </div>
      )}

      {viewMode === 'animated' ? (
        <div className="space-y-1.5">
          <ExerciseExecutionScene
            spec={spec}
            view={activeView}
            progress={progress}
            label={progress < 0.5 ? phaseLabels.start : phaseLabels.end}
          />
          <div className="flex items-center gap-2 px-1">
            <span className="text-[0.7rem] text-[#9CA3AF] shrink-0">Início</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(progress * 100)}
              onChange={(e) => {
                setPlaying(false);
                const position = Number(e.target.value) / 100;
                cyclePhase.current = position * 0.36;
                setProgress(position);
              }}
              aria-label="Posição da execução"
              className="w-full accent-[#D95353] h-1.5 bg-[#25252C] rounded-lg cursor-pointer"
            />
            <span className="text-[0.7rem] text-[#9CA3AF] shrink-0">Contração</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <ExerciseExecutionScene
            spec={spec}
            view={activeView}
            progress={0}
            label={`1. ${phaseLabels.start}`}
            compact
          />
          <ExerciseExecutionScene
            spec={spec}
            view={activeView}
            progress={1}
            label={`2. ${phaseLabels.end}`}
            compact
          />
        </div>
      )}
    </div>
  );
}
