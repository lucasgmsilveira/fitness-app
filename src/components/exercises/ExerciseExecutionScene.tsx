import { useEffect, useId, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import {
  interpolateFrontPose,
  interpolateSidePose,
  type ActiveBodyRegion,
  type ApparatusPreset,
  type ExerciseAnimationSpec,
  type FrontPose,
  type LoadStyle,
  type Point2D,
  type SidePose,
} from '../../data/exerciseAnimations';

interface ExerciseExecutionSceneProps {
  spec: ExerciseAnimationSpec;
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
  const angle = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
  // Local axes follow the bone. The muscle belly narrows towards the distal joint.
  return (
    <g transform={`translate(${a.x} ${a.y}) rotate(${angle})`}>
      <g transform={`scale(${Math.max(1, length)} ${width})`}>
        <path d="M0 -.4 C.18 -.61 .42 -.72 .66 -.46 S.88 -.31 1 -.29
                 C1.08 -.23 1.08 .21 1 .29 C.81 .32 .64 .31 .45 .49
                 C.27 .62 .09 .58 0 .4 Q-.11 0 0 -.4Z"
          fill={fill} stroke={stroke} strokeWidth="1.1" vectorEffect="non-scaling-stroke" />
        <path d="M.04 -.24 C.21 -.56 .47 -.59 .73 -.32
                 C.52 -.34 .29 -.03 .04 -.24Z"
          fill={highlight ? '#FB923C' : '#DCE6F8'} opacity={highlight ? highlightOpacity : 0.19} />
        {highlight && <path d="M.08 .13 Q.35 -.18 .79 -.18 Q.38 .53 .08 .32Z"
          fill="#F97316" opacity={highlightOpacity} />}
      </g>
    </g>
  );
}

function Head({ head, neck, facing }: { head: Point2D; neck: Point2D; facing?: number }) {
  const tilt = Math.atan2(head.x - neck.x, neck.y - head.y) * 180 / Math.PI;
  return (
    <g>
      <path d={`M${neck.x} ${neck.y} L${head.x} ${head.y}`} stroke="#827F82" strokeWidth="7" strokeLinecap="round" />
      <g transform={`translate(${head.x} ${head.y}) rotate(${tilt}) scale(${facing ?? 1} 1)`}>
        {facing === undefined ? (
          <>
            <path d="M-8 -3 C-9 -15 9 -15 8 -3 Q10 -5 9 0 Q9 3 7.5 3
                     Q6.7 9 2 11 Q0 12 -2 11 Q-6.7 9 -7.5 3 Q-9 3 -9 0 Q-10 -5 -8 -3Z"
              fill="#BFACA2" stroke="#D1C2BA" strokeWidth=".7" />
            <path d="M-8.4 -.7 C-12 -16 12 -16 8.4 -.7 L7 -5 Q0 -8 -7 -5Z" fill="#353B47" />
            {[-1, 1].map(side => (
              <g key={side} transform={`scale(${side} 1)`}>
                <path d="M2 -2 Q4 -3 6 -2" fill="none" stroke="#675C5B" strokeWidth=".8" />
                <ellipse cx="4" cy="-.4" rx="1.1" ry=".85" fill="#333844" />
              </g>
            ))}
            <path d="M0 0 L-.7 3 1 3 M-2 6 Q0 7 2 6" fill="none" stroke="#896E65" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M-8 3 C-13 -13 6 -16 8 -6 L8 -2 10.6 1.7 8.2 2.5
                     Q9 4 7.5 4.7 Q8 9 4 10 L0 10 -5 7Z" fill="#BFACA2" stroke="#D1C2BA" strokeWidth=".7" />
            <path d="M-8 4 C-14 -13 2 -16 7 -9 L8 -6 Q4 -7 1 -6 L-2 -.2 -5 0 -5 5Z" fill="#353B47" />
            <path d="M-4 1 Q-6 -2 -6 1 Q-6 4 -4 4 M4 -2 Q6 -3 7 -2 M6 5 L8 5" fill="none" stroke="#886E67" strokeWidth=".8" />
            <circle cx="6.3" cy="-.5" r=".9" fill="#333844" />
          </>
        )}
      </g>
    </g>
  );
}

function renderSideApparatus(
  preset: ApparatusPreset,
  pose: SidePose,
  spec: ExerciseAnimationSpec
) {
  const cfg = spec.apparatusConfig ?? {};
  switch (preset) {
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
    case 'flat-bench':
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <line x1="88" y1="154" x2="88" y2="190" strokeWidth="4" strokeLinecap="round" />
          <line x1="194" y1="154" x2="194" y2="190" strokeWidth="4" strokeLinecap="round" />
          <rect x="66" y="144" width="144" height="10" rx="5" fill="#232836" />
        </g>
      );
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
    case 'chest-press-machine':
      return (
        <g stroke="#394052" strokeWidth="1.4">
          {/* Estrutura */}
          <rect x="92" y="76" width="12" height="114" rx="4" fill="#1B1F2A" />
          <rect x="218" y="42" width="20" height="148" rx="4" fill="#1B1F2A" />
          {/* Encosto e assento */}
          <rect x="102" y="84" width="10" height="62" rx="4" fill="#252B3B" />
          <rect x="108" y="144" width="46" height="10" rx="4" fill="#252B3B" />
          <line x1="126" y1="154" x2="126" y2="190" strokeWidth="4" />
          {/* Braço da alavanca conectado às mãos */}
          <line
            x1="138"
            y1="44"
            x2={pose.nearHand.x}
            y2={pose.nearHand.y}
            stroke="#59637D"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="138" cy="44" r="4.5" fill="#F97316" stroke="none" />
        </g>
      );
    case 'shoulder-press-machine':
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <rect x="116" y="48" width="12" height="142" rx="4" fill="#1B1F2A" />
          <rect x="128" y="82" width="10" height="64" rx="4" fill="#252B3B" />
          <rect x="132" y="144" width="44" height="10" rx="4" fill="#252B3B" />
          {/* Braço articulado até a mão */}
          <line
            x1="118"
            y1={pose.nearHand.y}
            x2={pose.nearHand.x}
            y2={pose.nearHand.y}
            stroke="#59637D"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx={pose.nearHand.x} cy={pose.nearHand.y} r="4.5" fill="#9CA3AF" stroke="none" />
        </g>
      );
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
          {spec.load === 'none' && (
            <line
              x1="252"
              y1="72"
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
          {/* Cabo dinâmico */}
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
    case 'cable-single': {
      const ax = cfg.anchorX ?? 234;
      const ay = cfg.anchorY ?? 28;
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
            x2={pose.nearHand.x}
            y2={pose.nearHand.y}
            stroke="#94A3B8"
            strokeWidth="1.8"
          />
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
      // Plataforma móvel acompanhando os pés em ângulo de 45°
      const dx = 18;
      const dy = 18;
      return (
        <g stroke="#394052" strokeWidth="1.4">
          {/* Trilho 45° */}
          <line x1="142" y1="168" x2="256" y2="54" stroke="#2D3343" strokeWidth="5" strokeLinecap="round" />
          {/* Base do banco */}
          <line x1="70" y1="152" x2="64" y2="190" strokeWidth="4" />
          <line x1="138" y1="172" x2="142" y2="190" strokeWidth="4" />
          {/* Encosto inclinado + assento */}
          <line x1="56" y1="120" x2="106" y2="168" stroke="#252B3B" strokeWidth="11" strokeLinecap="round" />
          <rect x="104" y="164" width="42" height="10" rx="4" fill="#252B3B" />
          {/* Plataforma móvel */}
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
    case 'bulgarian-bench':
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <rect x="66" y="148" width="46" height="10" rx="4" fill="#252B3B" />
          <line x1="76" y1="158" x2="76" y2="190" strokeWidth="4" />
          <line x1="104" y1="158" x2="104" y2="190" strokeWidth="4" />
        </g>
      );
    case 'leg-extension': {
      const px = cfg.pivotX ?? 166;
      const py = cfg.pivotY ?? 144;
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <rect x="98" y="80" width="10" height="62" rx="4" fill="#252B3B" />
          <rect x="102" y="142" width="66" height="10" rx="4" fill="#252B3B" />
          <line x1="112" y1="152" x2="112" y2="190" strokeWidth="4" />
          <line x1="164" y1="152" x2="164" y2="190" strokeWidth="4" />
          {/* Braço da alavanca + rolo na canela */}
          <line
            x1={px}
            y1={py}
            x2={pose.nearFoot.x}
            y2={pose.nearFoot.y - 6}
            stroke="#59637D"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx={px} cy={py} r="4.5" fill="#F97316" stroke="none" />
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
          {/* Almofada superior sobre coxa */}
          <rect x="148" y="128" width="22" height="8" rx="4" fill="#475569" />
          {/* Braço da alavanca + rolo posterior */}
          <line
            x1={px}
            y1={py}
            x2={pose.nearFoot.x}
            y2={pose.nearFoot.y + 4}
            stroke="#59637D"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx={px} cy={py} r="4.5" fill="#F97316" stroke="none" />
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
          <circle cx={px} cy={py} r="4.5" fill="#F97316" stroke="none" />
          <circle cx={pose.nearFoot.x} cy={pose.nearFoot.y - 6} r="6.5" fill="#475569" />
        </g>
      );
    }
    case 'hip-thrust-bench':
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <rect x="82" y="136" width="48" height="12" rx="4" fill="#252B3B" />
          <line x1="92" y1="148" x2="88" y2="190" strokeWidth="4" />
          <line x1="120" y1="148" x2="122" y2="190" strokeWidth="4" />
        </g>
      );
    case 'seated-calf':
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <rect x="102" y="140" width="44" height="10" rx="4" fill="#252B3B" />
          <line x1="112" y1="150" x2="112" y2="190" strokeWidth="4" />
          <rect x="166" y="182" width="24" height="8" rx="3" fill="#334155" />
          {/* Apoio sobre o joelho */}
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
          {/* Apoio nos ombros */}
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
    default:
      return null;
  }
}

function renderFrontApparatus(
  preset: ApparatusPreset,
  pose: FrontPose,
  spec: ExerciseAnimationSpec
) {
  const cfg = spec.apparatusConfig ?? {};
  switch (preset) {
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
    case 'flat-bench':
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <rect x="142" y="114" width="36" height="62" rx="6" fill="#252B3B" />
          <line x1="160" y1="176" x2="160" y2="190" strokeWidth="4" />
        </g>
      );
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
    case 'peck-deck':
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <rect x="142" y="62" width="36" height="76" rx="6" fill="#252B3B" />
          <rect x="136" y="136" width="48" height="10" rx="4" fill="#252B3B" />
          <line x1="160" y1="146" x2="160" y2="190" strokeWidth="4" />
          {/* Alavancas articuladas até as mãos */}
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
    case 'dual-cable-high':
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <rect x="34" y="22" width="14" height="168" rx="4" fill="#1B1F2A" />
          <rect x="272" y="22" width="14" height="168" rx="4" fill="#1B1F2A" />
          <circle cx="48" cy="36" r="4.5" fill="#6B7280" stroke="none" />
          <circle cx="272" cy="36" r="4.5" fill="#6B7280" stroke="none" />
          <line x1="48" y1="36" x2={pose.leftHand.x} y2={pose.leftHand.y} stroke="#94A3B8" strokeWidth="1.7" />
          <line x1="272" y1="36" x2={pose.rightHand.x} y2={pose.rightHand.y} stroke="#94A3B8" strokeWidth="1.7" />
        </g>
      );
    case 'lat-pulldown': {
      const centerBar = midPoint(pose.leftHand, pose.rightHand);
      return (
        <g stroke="#394052" strokeWidth="1.4">
          {/* Estrutura superior */}
          <rect x="76" y="16" width="168" height="8" rx="3" fill="#1B1F2A" />
          <line x1="160" y1="24" x2={centerBar.x} y2={centerBar.y} stroke="#94A3B8" strokeWidth="1.8" />
          {/* Banco e apoio de coxas */}
          <rect x="136" y="140" width="48" height="10" rx="4" fill="#252B3B" />
          <rect x="130" y="128" width="60" height="8" rx="4" fill="#475569" />
          <line x1="160" y1="150" x2="160" y2="190" strokeWidth="4" />
        </g>
      );
    }
    case 'cable-single': {
      const ax = cfg.anchorX ?? 52;
      const ay = cfg.anchorY ?? 112;
      const targetHand =
        Math.hypot(pose.leftHand.x - ax, pose.leftHand.y - ay) <
        Math.hypot(pose.rightHand.x - ax, pose.rightHand.y - ay)
          ? pose.leftHand
          : pose.rightHand;
      // Para Pallof press usar a mão mais próxima da polia; para elevação lateral no cabo usar a mão direita se polia à esquerda e cruzada
      const cableHand =
        spec.exerciseId === 'ex-elevacao-lateral-cabo' ? pose.rightHand : targetHand;
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
          <line x1={ax} y1={ay} x2={cableHand.x} y2={cableHand.y} stroke="#94A3B8" strokeWidth="1.7" />
        </g>
      );
    }
    case 'hip-abductor':
      return (
        <g stroke="#394052" strokeWidth="1.4">
          <rect x="142" y="64" width="36" height="68" rx="6" fill="#252B3B" />
          <rect x="136" y="130" width="48" height="10" rx="4" fill="#252B3B" />
          <line x1="160" y1="140" x2="160" y2="190" strokeWidth="4" />
          {/* Almofadas laterais nas coxas */}
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
          {/* Almofadas internas nas coxas */}
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
    default:
      return null;
  }
}

function renderSideLoad(load: LoadStyle, pose: SidePose) {
  switch (load) {
    case 'dumbbells':
      return (
        <g fill="#E5E7EB" stroke="#18181B" strokeWidth="1.2">
          <rect x={pose.farHand.x - 7} y={pose.farHand.y - 3.5} width="14" height="7" rx="2.5" opacity="0.7" />
          <rect x={pose.nearHand.x - 8} y={pose.nearHand.y - 4} width="16" height="8" rx="2.5" />
        </g>
      );
    case 'dumbbell-near':
      return (
        <g fill="#E5E7EB" stroke="#18181B" strokeWidth="1.2">
          <rect x={pose.nearHand.x - 8} y={pose.nearHand.y - 4} width="16" height="8" rx="2.5" />
        </g>
      );
    case 'v-bar':
    case 'rope':
    case 'cable-handle':
      return (
        <circle
          cx={pose.nearHand.x}
          cy={pose.nearHand.y}
          r="4.5"
          fill="#E5E7EB"
          stroke="#18181B"
          strokeWidth="1.2"
        />
      );
    case 'hip-barbell':
      return (
        <g>
          <circle
            cx={pose.hip.x + 2}
            cy={pose.hip.y - 8}
            r="10"
            fill="#374151"
            stroke="#E5E7EB"
            strokeWidth="2"
          />
          <circle cx={pose.hip.x + 2} cy={pose.hip.y - 8} r="3" fill="#E5E7EB" />
        </g>
      );
    default:
      return null;
  }
}

function renderFrontLoad(load: LoadStyle, pose: FrontPose) {
  switch (load) {
    case 'dumbbells':
      return (
        <g fill="#E5E7EB" stroke="#18181B" strokeWidth="1.2">
          <rect x={pose.leftHand.x - 8} y={pose.leftHand.y - 3.5} width="16" height="7" rx="2.5" />
          <rect x={pose.rightHand.x - 8} y={pose.rightHand.y - 3.5} width="16" height="7" rx="2.5" />
        </g>
      );
    case 'bar-wide': {
      const dx = pose.rightHand.x - pose.leftHand.x;
      const dy = pose.rightHand.y - pose.leftHand.y;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      return (
        <line
          x1={pose.leftHand.x - ux * 16}
          y1={pose.leftHand.y - uy * 16}
          x2={pose.rightHand.x + ux * 16}
          y2={pose.rightHand.y + uy * 16}
          stroke="#E5E7EB"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
      );
    }
    case 'v-bar':
      return (
        <path
          d={`M ${pose.leftHand.x} ${pose.leftHand.y} L ${(pose.leftHand.x + pose.rightHand.x) / 2} ${(pose.leftHand.y + pose.rightHand.y) / 2 - 8} L ${pose.rightHand.x} ${pose.rightHand.y}`}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    case 'cable-handle':
      return (
        <g fill="#E5E7EB" stroke="#18181B" strokeWidth="1.2">
          <circle cx={pose.leftHand.x} cy={pose.leftHand.y} r="4" />
          <circle cx={pose.rightHand.x} cy={pose.rightHand.y} r="4" />
        </g>
      );
    default:
      return null;
  }
}

export function ExerciseExecutionScene({
  spec,
  progress,
  label,
  compact = false,
}: ExerciseExecutionSceneProps) {
  const arrowId = useId();
  const activeSet = new Set<ActiveBodyRegion>(spec.activeHighlights);
  const highlightOpacity = 0.52 + 0.43 * progress;

  if (spec.view === 'side') {
    const pose = interpolateSidePose(spec.start, spec.mid, spec.end, progress);
    const faceDir = pose.faceDir ?? 1;
    const chestCenter = subSegment(pose.hip, pose.shoulder, 0.56, 0.88);
    const absCenter = subSegment(pose.hip, pose.shoulder, 0.14, 0.56);
    const latsCenter = subSegment(pose.hip, pose.shoulder, 0.45, 0.85);
    const upperArm = subSegment(pose.shoulder, pose.nearElbow, 0.15, 0.85);

    return (
      <div className="relative rounded-2xl bg-[#101014] border border-[#24242E] overflow-hidden">
        {label && (
          <span className="absolute top-2 left-2.5 z-10 px-2 py-0.5 rounded-md bg-[#18181F]/90 border border-[#2A2A35] text-[0.7rem] font-semibold text-[#D1D5DB]">
            {label}
          </span>
        )}
        <svg
          viewBox="0 0 320 220"
          className={`w-full ${compact ? 'h-40' : 'h-52 sm:h-56'} block select-none`}
          role="img"
          aria-label={label ?? 'Ilustração de execução do exercício'}
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
          {renderSideApparatus(spec.apparatus, pose, spec)}

          {/* Membros distantes (profundidade) */}
          <Limb a={pose.hip} b={pose.farKnee} width={11} fill="#252836" stroke="#181A22" />
          <Limb a={pose.farKnee} b={pose.farFoot} width={8.5} fill="#252836" stroke="#181A22" />
          <Limb a={pose.shoulder} b={pose.farElbow} width={8.5} fill="#252836" stroke="#181A22" />
          <Limb a={pose.farElbow} b={pose.farHand} width={7} fill="#252836" stroke="#181A22" />

          {/* Perna próxima */}
          <Limb
            a={pose.hip}
            b={pose.nearKnee}
            width={12.5}
            fill="#3B4054"
            stroke="#78809A"
            highlight={activeSet.has('quads') || activeSet.has('hamstrings')}
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

          {/* Tronco + Pelvis */}
          <Limb
            a={pose.shoulder}
            b={pose.hip}
            width={23}
            fill="#373C4F"
            stroke="#78809A"
          />
          {activeSet.has('chest') && (
            <line
              x1={chestCenter[0].x}
              y1={chestCenter[0].y}
              x2={chestCenter[1].x}
              y2={chestCenter[1].y}
              stroke="#F97316"
              strokeOpacity={highlightOpacity}
              strokeWidth="10"
              strokeLinecap="round"
            />
          )}
          {(activeSet.has('abs') || activeSet.has('obliques')) && (
            <line
              x1={absCenter[0].x}
              y1={absCenter[0].y}
              x2={absCenter[1].x}
              y2={absCenter[1].y}
              stroke="#F97316"
              strokeOpacity={highlightOpacity}
              strokeWidth="9.5"
              strokeLinecap="round"
            />
          )}
          {(activeSet.has('lats') || activeSet.has('upper-back') || activeSet.has('traps')) && (
            <line
              x1={latsCenter[0].x}
              y1={latsCenter[0].y}
              x2={latsCenter[1].x}
              y2={latsCenter[1].y}
              stroke="#F97316"
              strokeOpacity={highlightOpacity}
              strokeWidth="10"
              strokeLinecap="round"
            />
          )}
          {activeSet.has('lower-back') && (
            <circle
              cx={pose.hip.x + (pose.shoulder.x - pose.hip.x) * 0.28}
              cy={pose.hip.y + (pose.shoulder.y - pose.hip.y) * 0.28}
              r="7.5"
              fill="#F97316"
              fillOpacity={highlightOpacity}
            />
          )}
          {activeSet.has('glutes') && (
            <circle
              cx={pose.hip.x}
              cy={pose.hip.y}
              r="9"
              fill="#F97316"
              fillOpacity={highlightOpacity}
            />
          )}

          {/* Pescoço e Cabeça */}
          <Limb a={pose.shoulder} b={pose.neck} width={7} fill="#373C4F" stroke="#78809A" />
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
              fill="#F97316"
              fillOpacity={highlightOpacity}
            />
          )}
          {(activeSet.has('biceps') || activeSet.has('triceps')) && (
            <line
              x1={upperArm[0].x}
              y1={upperArm[0].y}
              x2={upperArm[1].x}
              y2={upperArm[1].y}
              stroke="#F97316"
              strokeOpacity={highlightOpacity}
              strokeWidth="6.5"
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
          <circle cx={pose.nearHand.x} cy={pose.nearHand.y} r="3.5" fill="#9CA3AF" />

          {/* Carga */}
          {renderSideLoad(spec.load, pose)}

          {/* Setas de movimento */}
          {spec.motionArrows.map((d, idx) => (
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
      </div>
    );
  }

  // Vista Frontal
  const pose = interpolateFrontPose(spec.start, spec.mid, spec.end, progress);
  const shoulderMid = midPoint(pose.leftShoulder, pose.rightShoulder);
  const hipMid = midPoint(pose.leftHip, pose.rightHip);
  // Place the illustration in the plane of the torso, including the side plank.
  const torsoTransform = `matrix(${(pose.rightShoulder.x - pose.leftShoulder.x) / 40}
    ${(pose.rightShoulder.y - pose.leftShoulder.y) / 40}
    ${(hipMid.x - shoulderMid.x) / 50} ${(hipMid.y - shoulderMid.y) / 50}
    ${shoulderMid.x} ${shoulderMid.y})`;

  return (
    <div className="relative rounded-2xl bg-[#101014] border border-[#24242E] overflow-hidden">
      {label && (
        <span className="absolute top-2 left-2.5 z-10 px-2 py-0.5 rounded-md bg-[#18181F]/90 border border-[#2A2A35] text-[0.7rem] font-semibold text-[#D1D5DB]">
          {label}
        </span>
      )}
      <svg
        viewBox="0 0 320 220"
        className={`w-full ${compact ? 'h-40' : 'h-52 sm:h-56'} block select-none`}
        role="img"
        aria-label={label ?? 'Ilustração frontal de execução do exercício'}
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

        {renderFrontApparatus(spec.apparatus, pose, spec)}

        {/* Pernas */}
        <Limb
          a={pose.leftHip}
          b={pose.leftKnee}
          width={11.5}
          fill="#3B4054"
          stroke="#78809A"
          highlight={activeSet.has('quads')}
          highlightOpacity={highlightOpacity}
        />
        <Limb
          a={pose.rightHip}
          b={pose.rightKnee}
          width={11.5}
          fill="#3B4054"
          stroke="#78809A"
          highlight={activeSet.has('quads')}
          highlightOpacity={highlightOpacity}
        />
        {activeSet.has('adductors') && (
          <>
            <line
              x1={pose.leftHip.x + 4}
              y1={pose.leftHip.y + 4}
              x2={pose.leftKnee.x + 3}
              y2={pose.leftKnee.y - 4}
              stroke="#F97316"
              strokeOpacity={highlightOpacity}
              strokeWidth="6.5"
              strokeLinecap="round"
            />
            <line
              x1={pose.rightHip.x - 4}
              y1={pose.rightHip.y + 4}
              x2={pose.rightKnee.x - 3}
              y2={pose.rightKnee.y - 4}
              stroke="#F97316"
              strokeOpacity={highlightOpacity}
              strokeWidth="6.5"
              strokeLinecap="round"
            />
          </>
        )}
        <Limb a={pose.leftKnee} b={pose.leftFoot} width={9} fill="#3B4054" stroke="#78809A" />
        <Limb a={pose.rightKnee} b={pose.rightFoot} width={9} fill="#3B4054" stroke="#78809A" />
        <circle cx={pose.leftFoot.x} cy={pose.leftFoot.y} r="4.2" fill="#4B526B" />
        <circle cx={pose.rightFoot.x} cy={pose.rightFoot.y} r="4.2" fill="#4B526B" />

        <g transform={torsoTransform}>
          <path d="M-20 0 Q-12 -1 -5 -4 Q0 -1 5 -4 Q12 -1 20 0
                   Q22 10 16 24 Q12 33 14 42 L15 50 Q0 59 -15 50
                   L-14 42 Q-12 33 -16 24 Q-22 10 -20 0Z"
            fill="#495369" stroke="#8996AA" strokeWidth="1.1" />
          {[-1, 1].map(side => (
            <g key={side} transform={`scale(${side} 1)`}>
              <path d="M1 4 Q11 0 17 4 L16 13 Q10 19 2 15Z"
                fill={activeSet.has('chest') ? '#F97316' : '#627085'} opacity={activeSet.has('chest') ? highlightOpacity : 0.8} />
              <path d="M17 14 Q17 24 11 35 L9 29 11 18Z"
                fill={activeSet.has('lats') ? '#F97316' : '#374257'} opacity={activeSet.has('lats') ? highlightOpacity : 0.8} />
              <path d="M1 19 Q6 18 9 21 Q7 33 5 39 L1 42Z"
                fill={activeSet.has('abs') ? '#F97316' : '#536074'} opacity={activeSet.has('abs') ? highlightOpacity : 1} />
              {activeSet.has('obliques') && <path d="M12 22 L9 39 6 42 Q6 31 12 22Z" fill="#FB923C" opacity={highlightOpacity} />}
            </g>
          ))}
          <path d="M-14 42 Q0 47 14 42 L15 50 Q0 59 -15 50Z" fill="#333D51" />
        </g>
        {activeSet.has('glutes') && (
          <>
            <circle cx={pose.leftHip.x - 2} cy={pose.leftHip.y} r="7" fill="#F97316" fillOpacity={highlightOpacity} />
            <circle cx={pose.rightHip.x + 2} cy={pose.rightHip.y} r="7" fill="#F97316" fillOpacity={highlightOpacity} />
          </>
        )}

        {/* Pescoço e Cabeça */}
        <Limb a={shoulderMid} b={pose.neck} width={7} fill="#373C4F" stroke="#78809A" />
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
            <circle cx={pose.leftShoulder.x} cy={pose.leftShoulder.y} r="6.5" fill="#F97316" fillOpacity={highlightOpacity} />
            <circle cx={pose.rightShoulder.x} cy={pose.rightShoulder.y} r="6.5" fill="#F97316" fillOpacity={highlightOpacity} />
          </>
        )}
        <Limb a={pose.leftElbow} b={pose.leftHand} width={7.5} fill="#434960" stroke="#8B93B0" />
        <Limb a={pose.rightElbow} b={pose.rightHand} width={7.5} fill="#434960" stroke="#8B93B0" />

        {/* Carga */}
        {renderFrontLoad(spec.load, pose)}

        {/* Setas de movimento */}
        {spec.motionArrows.map((d, idx) => (
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
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<0.5 | 1>(1);
  const [progress, setProgress] = useState(0);

  const cyclePhase = useRef(0);

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
      {/* Alternar Animação vs Imagens estáticas (Fases) */}
      <div className="flex items-center justify-between gap-2">
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

        {viewMode === 'animated' && (
          <div className="flex items-center gap-1.5">
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
      </div>

      {viewMode === 'animated' ? (
        <div className="space-y-1.5">
          <ExerciseExecutionScene
            spec={spec}
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
              className="w-full accent-[#F97316] h-1.5 bg-[#25252C] rounded-lg cursor-pointer"
            />
            <span className="text-[0.7rem] text-[#9CA3AF] shrink-0">Contração</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <ExerciseExecutionScene
            spec={spec}
            progress={0}
            label={`1. ${phaseLabels.start}`}
            compact
          />
          <ExerciseExecutionScene
            spec={spec}
            progress={1}
            label={`2. ${phaseLabels.end}`}
            compact
          />
        </div>
      )}
    </div>
  );
}
