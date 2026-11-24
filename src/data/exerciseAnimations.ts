import type { ExerciseAnimationSpec } from './animations/types';
import { CORE_CHEST_ANIMATIONS } from './animations/coreChest';
import { BACK_SHOULDERS_ANIMATIONS } from './animations/backShoulders';
import { ARMS_LEGS_ANIMATIONS } from './animations/armsLegs';

export * from './animations/types';

// Coordenadas padronizadas em viewBox 0 0 320 220 (chão padrão em y = 190)
export const EXERCISE_ANIMATIONS: Record<string, ExerciseAnimationSpec> = {
  ...CORE_CHEST_ANIMATIONS,
  ...BACK_SHOULDERS_ANIMATIONS,
  ...ARMS_LEGS_ANIMATIONS,
};
