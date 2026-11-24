import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { INITIAL_EXERCISES } from '../src/db/seed';
import { MUSCLE_GROUPS, type Exercise } from '../src/db/types';
import {
  BACK_MUSCLE_PATHS,
  FRONT_MUSCLE_PATHS,
  MUSCLE_DEFINITIONS,
} from '../src/data/muscleAnatomy';
import { EXERCISE_GUIDES, getExerciseGuide } from '../src/data/exerciseGuides';
import {
  EXERCISE_ANIMATIONS,
  interpolateFrontPose,
  interpolateSidePose,
  type FrontPose,
  type GripType,
  type Point2D,
  type SidePose,
} from '../src/data/exerciseAnimations';

const VALID_GRIPS: ReadonlySet<GripType> = new Set([
  'pronated',
  'supinated',
  'neutral',
  'open',
  'mixed',
]);

function dist(a: Point2D, b: Point2D): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function midPoint(a: Point2D, b: Point2D): Point2D {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function assertPointInBounds(p: Point2D, label: string) {
  expect(Number.isFinite(p.x), `${label}.x finito`).toBe(true);
  expect(Number.isFinite(p.y), `${label}.y finito`).toBe(true);
  expect(p.x, `${label}.x >= 0`).toBeGreaterThanOrEqual(0);
  expect(p.x, `${label}.x <= 320`).toBeLessThanOrEqual(320);
  expect(p.y, `${label}.y >= 0`).toBeGreaterThanOrEqual(0);
  expect(p.y, `${label}.y <= 220`).toBeLessThanOrEqual(220);
}

function validateSidePose(pose: SidePose, prefix: string) {
  const keys: (keyof Omit<SidePose, 'faceDir'>)[] = [
    'head',
    'neck',
    'shoulder',
    'hip',
    'farElbow',
    'farHand',
    'nearElbow',
    'nearHand',
    'farKnee',
    'farFoot',
    'nearKnee',
    'nearFoot',
  ];
  for (const k of keys) {
    assertPointInBounds(pose[k], `${prefix}.${k}`);
  }
  expect(pose.head.y, `${prefix}.head.y >= 16 (sem corte no topo)`).toBeGreaterThanOrEqual(16);
}

function validateFrontPose(pose: FrontPose, prefix: string) {
  const keys: (keyof FrontPose)[] = [
    'head',
    'neck',
    'leftShoulder',
    'rightShoulder',
    'leftHip',
    'rightHip',
    'leftElbow',
    'rightElbow',
    'leftHand',
    'rightHand',
    'leftKnee',
    'rightKnee',
    'leftFoot',
    'rightFoot',
  ];
  for (const k of keys) {
    assertPointInBounds(pose[k], `${prefix}.${k}`);
  }
  expect(pose.head.y, `${prefix}.head.y >= 16 (sem corte no topo)`).toBeGreaterThanOrEqual(16);
}

function sideBoneLengths(pose: SidePose) {
  return {
    torso: dist(pose.shoulder, pose.hip),
    nearThigh: dist(pose.hip, pose.nearKnee),
    nearShin: dist(pose.nearKnee, pose.nearFoot),
    farThigh: dist(pose.hip, pose.farKnee),
    farShin: dist(pose.farKnee, pose.farFoot),
    nearUpperArm: dist(pose.shoulder, pose.nearElbow),
    nearForearm: dist(pose.nearElbow, pose.nearHand),
    farUpperArm: dist(pose.shoulder, pose.farElbow),
    farForearm: dist(pose.farElbow, pose.farHand),
  };
}

function frontBoneLengths(pose: FrontPose) {
  const shoulderMid = midPoint(pose.leftShoulder, pose.rightShoulder);
  const hipMid = midPoint(pose.leftHip, pose.rightHip);
  return {
    torso: dist(shoulderMid, hipMid),
    leftThigh: dist(pose.leftHip, pose.leftKnee),
    leftShin: dist(pose.leftKnee, pose.leftFoot),
    rightThigh: dist(pose.rightHip, pose.rightKnee),
    rightShin: dist(pose.rightKnee, pose.rightFoot),
    leftUpperArm: dist(pose.leftShoulder, pose.leftElbow),
    leftForearm: dist(pose.leftElbow, pose.leftHand),
    rightUpperArm: dist(pose.rightShoulder, pose.rightElbow),
    rightForearm: dist(pose.rightElbow, pose.rightHand),
  };
}

function assertSegmentStability(
  startLen: number,
  endLen: number,
  label: string,
  maxDeltaRatio = 0.4
) {
  const maxLen = Math.max(startLen, endLen);
  const minLen = Math.min(startLen, endLen);
  expect(maxLen, `${label} deve ter comprimento positivo`).toBeGreaterThan(2);
  const deltaRatio = (maxLen - minLen) / maxLen;
  expect(
    deltaRatio,
    `${label} variou ${(deltaRatio * 100).toFixed(1)}% (start=${startLen.toFixed(1)}, end=${endLen.toFixed(1)})`
  ).toBeLessThanOrEqual(maxDeltaRatio);
}

describe('Guias visuais de músculos e execução de exercícios (100% offline)', () => {
  it('cobre 100% dos exercícios do catálogo inicial com guias e vistas ortogonais (side + front) válidas', () => {
    expect(INITIAL_EXERCISES.length).toBeGreaterThanOrEqual(41);
    expect(EXERCISE_GUIDES['ex-remada-convergente-unilateral']).toBeDefined();
    expect(EXERCISE_GUIDES['ex-triceps-testa-halter']).toBeDefined();
    expect(EXERCISE_GUIDES['ex-cadeira-adutora']).toBeDefined();
    expect(EXERCISE_ANIMATIONS['ex-remada-convergente-unilateral']).toBeDefined();
    expect(EXERCISE_ANIMATIONS['ex-triceps-testa-halter']).toBeDefined();
    expect(EXERCISE_ANIMATIONS['ex-cadeira-adutora']).toBeDefined();

    const svgMappedMuscles = new Set([
      ...FRONT_MUSCLE_PATHS.map((g) => g.id),
      ...BACK_MUSCLE_PATHS.map((g) => g.id),
    ]);

    for (const ex of INITIAL_EXERCISES) {
      const guide = EXERCISE_GUIDES[ex.id];
      expect(guide, `Guia ausente para ${ex.id}`).toBeDefined();
      expect(guide.primaryMuscles.length, `${ex.id} precisa de músculo primário`).toBeGreaterThan(0);
      expect(guide.executionSteps.length, `${ex.id} precisa de passos de execução`).toBeGreaterThanOrEqual(3);
      expect(guide.postureCues.length, `${ex.id} precisa de dicas posturais`).toBeGreaterThanOrEqual(2);
      expect(guide.breathing.trim().length).toBeGreaterThan(5);

      const primarySet = new Set(guide.primaryMuscles);
      for (const m of guide.primaryMuscles) {
        expect(MUSCLE_DEFINITIONS[m], `Músculo desconhecido: ${m}`).toBeDefined();
        expect(svgMappedMuscles.has(m), `Músculo ${m} sem path SVG`).toBe(true);
      }
      for (const m of guide.secondaryMuscles) {
        expect(MUSCLE_DEFINITIONS[m], `Músculo desconhecido: ${m}`).toBeDefined();
        expect(svgMappedMuscles.has(m), `Músculo ${m} sem path SVG`).toBe(true);
        expect(primarySet.has(m), `Músculo ${m} duplicado entre primário e secundário em ${ex.id}`).toBe(
          false
        );
      }

      const anim = EXERCISE_ANIMATIONS[ex.id];
      expect(anim, `Animação ausente para ${ex.id}`).toBeDefined();
      expect(anim.exerciseId, `${ex.id} exerciseId consistente`).toBe(ex.id);
      expect(['side', 'front'], `${ex.id} defaultView válido`).toContain(anim.defaultView);
      expect(anim.activeHighlights.length, `${ex.id} precisa de activeHighlights`).toBeGreaterThan(0);

      // Vista lateral obrigatória
      expect(anim.side, `${ex.id} precisa de vista lateral (side)`).toBeDefined();
      expect(anim.side.motionArrows.length, `${ex.id}.side precisa de setas`).toBeGreaterThan(0);
      expect(VALID_GRIPS.has(anim.side.grip), `${ex.id}.side grip inválido: ${anim.side.grip}`).toBe(true);
      expect(anim.side.gripNote.trim().length, `${ex.id}.side precisa de gripNote`).toBeGreaterThan(5);

      validateSidePose(anim.side.start, `${ex.id}.side.start`);
      if (anim.side.mid) validateSidePose(anim.side.mid, `${ex.id}.side.mid`);
      validateSidePose(anim.side.end, `${ex.id}.side.end`);
      for (const t of [0, 0.25, 0.5, 0.75, 1]) {
        validateSidePose(
          interpolateSidePose(anim.side.start, anim.side.mid, anim.side.end, t),
          `${ex.id}.side@${t}`
        );
      }

      // Vista frontal obrigatória
      expect(anim.front, `${ex.id} precisa de vista frontal (front)`).toBeDefined();
      expect(anim.front.motionArrows.length, `${ex.id}.front precisa de setas`).toBeGreaterThan(0);
      expect(VALID_GRIPS.has(anim.front.grip), `${ex.id}.front grip inválido: ${anim.front.grip}`).toBe(true);
      expect(anim.front.gripNote.trim().length, `${ex.id}.front precisa de gripNote`).toBeGreaterThan(5);

      validateFrontPose(anim.front.start, `${ex.id}.front.start`);
      if (anim.front.mid) validateFrontPose(anim.front.mid, `${ex.id}.front.mid`);
      validateFrontPose(anim.front.end, `${ex.id}.front.end`);
      for (const t of [0, 0.25, 0.5, 0.75, 1]) {
        validateFrontPose(
          interpolateFrontPose(anim.front.start, anim.front.mid, anim.front.end, t),
          `${ex.id}.front@${t}`
        );
      }
    }
  });

  it('mantém proporções anatômicas realistas em exercícios em pé (pernas > tronco, cabeça sem corte e ombros proporcionais)', () => {
    let checkedStandingSide = 0;
    let checkedStandingFront = 0;

    for (const ex of INITIAL_EXERCISES) {
      const anim = EXERCISE_ANIMATIONS[ex.id];

      // Side standing checks
      const sideStart = anim.side.start;
      const sideStartSpan = Math.abs(Math.max(sideStart.nearFoot.y, sideStart.farFoot.y) - sideStart.head.y);
      if (sideStartSpan > 130) {
        checkedStandingSide += 1;
        for (const [label, pose] of [
          ['start', anim.side.start],
          ['end', anim.side.end],
        ] as const) {
          expect(pose.head.y, `${ex.id}.side.${label}.head.y >= 22`).toBeGreaterThanOrEqual(22);
          const poseSpan = Math.abs(Math.max(pose.nearFoot.y, pose.farFoot.y) - pose.head.y);
          if (poseSpan > 135) {
            const torso = dist(pose.shoulder, pose.hip);
            const nearLeg = dist(pose.hip, pose.nearKnee) + dist(pose.nearKnee, pose.nearFoot);
            const farLeg = dist(pose.hip, pose.farKnee) + dist(pose.farKnee, pose.farFoot);
            const legLen = Math.max(nearLeg, farLeg);
            const ratio = legLen / torso;
            expect(
              ratio,
              `${ex.id}.side.${label} razão perna/tronco=${ratio.toFixed(2)} (perna=${legLen.toFixed(1)}, tronco=${torso.toFixed(1)})`
            ).toBeGreaterThanOrEqual(1.45);
            expect(
              ratio,
              `${ex.id}.side.${label} razão perna/tronco=${ratio.toFixed(2)} (perna=${legLen.toFixed(1)}, tronco=${torso.toFixed(1)})`
            ).toBeLessThanOrEqual(2.05);
          }
        }
      }

      // Front standing checks
      const frontStart = anim.front.start;
      const frontStartSpan = Math.abs(Math.max(frontStart.leftFoot.y, frontStart.rightFoot.y) - frontStart.head.y);
      if (frontStartSpan > 130) {
        checkedStandingFront += 1;
        for (const [label, pose] of [
          ['start', anim.front.start],
          ['end', anim.front.end],
        ] as const) {
          expect(pose.head.y, `${ex.id}.front.${label}.head.y >= 22`).toBeGreaterThanOrEqual(22);
          const shoulderWidth = dist(pose.leftShoulder, pose.rightShoulder);
          expect(
            shoulderWidth,
            `${ex.id}.front.${label} largura ombros=${shoulderWidth.toFixed(1)}`
          ).toBeGreaterThanOrEqual(24);
          expect(
            shoulderWidth,
            `${ex.id}.front.${label} largura ombros=${shoulderWidth.toFixed(1)}`
          ).toBeLessThanOrEqual(52);

          // Verifica razão perna/tronco quando o atleta está ereto (evita falso positivo no fundo de agachamentos em projeção frontal)
          const poseSpan = Math.abs(Math.max(pose.leftFoot.y, pose.rightFoot.y) - pose.head.y);
          if (poseSpan > 135) {
            const shoulderMid = midPoint(pose.leftShoulder, pose.rightShoulder);
            const hipMid = midPoint(pose.leftHip, pose.rightHip);
            const torso = dist(shoulderMid, hipMid);
            const leftLeg = dist(pose.leftHip, pose.leftKnee) + dist(pose.leftKnee, pose.leftFoot);
            const rightLeg = dist(pose.rightHip, pose.rightKnee) + dist(pose.rightKnee, pose.rightFoot);
            const legLen = Math.max(leftLeg, rightLeg);
            const ratio = legLen / torso;
            expect(
              ratio,
              `${ex.id}.front.${label} razão perna/tronco=${ratio.toFixed(2)} (perna=${legLen.toFixed(1)}, tronco=${torso.toFixed(1)})`
            ).toBeGreaterThanOrEqual(1.45);
            expect(
              ratio,
              `${ex.id}.front.${label} razão perna/tronco=${ratio.toFixed(2)} (perna=${legLen.toFixed(1)}, tronco=${torso.toFixed(1)})`
            ).toBeLessThanOrEqual(2.05);
          }
        }
      }
    }

    expect(checkedStandingSide).toBeGreaterThanOrEqual(9);
    expect(checkedStandingFront).toBeGreaterThanOrEqual(9);

    // Regressão explícita: Elevação Lateral deve ter pernas claramente mais longas que o tronco
    const elevLat = EXERCISE_ANIMATIONS['ex-elevacao-lateral'];
    const elevFrontShoulder = midPoint(elevLat.front.start.leftShoulder, elevLat.front.start.rightShoulder);
    const elevFrontHip = midPoint(elevLat.front.start.leftHip, elevLat.front.start.rightHip);
    const elevFrontTorso = dist(elevFrontShoulder, elevFrontHip);
    const elevFrontLeg =
      dist(elevLat.front.start.leftHip, elevLat.front.start.leftKnee) +
      dist(elevLat.front.start.leftKnee, elevLat.front.start.leftFoot);
    expect(elevFrontLeg / elevFrontTorso).toBeGreaterThanOrEqual(1.6);
    expect(elevLat.front.start.head.y).toBeGreaterThanOrEqual(26);
    expect(elevLat.side.start.head.y).toBeGreaterThanOrEqual(26);
  });

  it('mantém estabilidade dos segmentos ósseos entre início e fim sem distorção excessiva', () => {
    for (const ex of INITIAL_EXERCISES) {
      const anim = EXERCISE_ANIMATIONS[ex.id];

      const s0 = sideBoneLengths(anim.side.start);
      const s1 = sideBoneLengths(anim.side.end);
      for (const seg of Object.keys(s0) as (keyof typeof s0)[]) {
        assertSegmentStability(s0[seg], s1[seg], `${ex.id}.side.${seg}`, 0.4);
      }

      const f0 = frontBoneLengths(anim.front.start);
      const f1 = frontBoneLengths(anim.front.end);
      for (const seg of Object.keys(f0) as (keyof typeof f0)[]) {
        assertSegmentStability(f0[seg], f1[seg], `${ex.id}.front.${seg}`, 0.4);
      }
    }
  });

  it('fornece fallback seguro por grupo muscular para exercícios personalizados', () => {
    for (const grp of MUSCLE_GROUPS) {
      const customEx: Exercise = {
        id: `ex-custom-${grp}`,
        name: `Exercício Custom ${grp}`,
        muscleGroup: grp,
        equipment: 'Livre',
        defaultRestSec: 60,
        isCustom: true,
        createdAt: '2026-11-23T00:00:00.000Z',
      };
      const { guide, isFallback } = getExerciseGuide(customEx);
      expect(isFallback).toBe(true);
      expect(guide.primaryMuscles.length).toBeGreaterThan(0);
      expect(guide.executionSteps.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('não contém links ou URLs externas nos dados e componentes de guia visual', () => {
    const filesToCheck = [
      'src/data/muscleAnatomy.ts',
      'src/data/exerciseGuides.ts',
      'src/data/exerciseAnimations.ts',
      'src/data/animations/types.ts',
      'src/data/animations/coreChest.ts',
      'src/data/animations/backShoulders.ts',
      'src/data/animations/armsLegs.ts',
      'src/components/exercises/MuscleAnatomyDiagram.tsx',
      'src/components/exercises/ExerciseExecutionScene.tsx',
      'src/components/exercises/ExerciseVisualGuideModal.tsx',
    ];

    for (const rel of filesToCheck) {
      const content = readFileSync(resolve(process.cwd(), rel), 'utf8');
      expect(content, `URL externa encontrada em ${rel}`).not.toMatch(/https?:\/\//i);
    }
  });
});
