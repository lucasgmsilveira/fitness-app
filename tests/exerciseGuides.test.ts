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
  type Point2D,
  type SidePose,
} from '../src/data/exerciseAnimations';

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
}

describe('Guias visuais de músculos e execução de exercícios (100% offline)', () => {
  it('cobre 100% dos exercícios do catálogo inicial com guias e animações válidas', () => {
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
      expect(anim.activeHighlights.length).toBeGreaterThan(0);
      expect(anim.motionArrows.length).toBeGreaterThan(0);

      if (anim.view === 'side') {
        validateSidePose(anim.start, `${ex.id}.start`);
        if (anim.mid) validateSidePose(anim.mid, `${ex.id}.mid`);
        validateSidePose(anim.end, `${ex.id}.end`);

        for (const t of [0, 0.25, 0.5, 0.75, 1]) {
          validateSidePose(interpolateSidePose(anim.start, anim.mid, anim.end, t), `${ex.id}@${t}`);
        }
      } else {
        validateFrontPose(anim.start, `${ex.id}.start`);
        if (anim.mid) validateFrontPose(anim.mid, `${ex.id}.mid`);
        validateFrontPose(anim.end, `${ex.id}.end`);

        for (const t of [0, 0.25, 0.5, 0.75, 1]) {
          validateFrontPose(interpolateFrontPose(anim.start, anim.mid, anim.end, t), `${ex.id}@${t}`);
        }
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
      'src/components/exercises/MuscleAnatomyDiagram.tsx',
      'src/components/exercises/ExerciseExecutionScene.tsx',
      'src/components/exercises/ExerciseVisualGuideModal.tsx',
    ];

    for (const rel of filesToCheck) {
      const content = readFileSync(resolve(process.cwd(), rel), 'utf8');
      expect(content).not.toMatch(/https?:\/\//i);
    }
  });
});
