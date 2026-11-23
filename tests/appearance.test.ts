import { describe, expect, it } from 'vitest';
import {
  DEFAULT_APPEARANCE,
  FONT_SIZE_MAP,
  loadAppearanceSettings,
} from '../src/utils/appearance';

describe('Preferências visuais e tamanho de fonte', () => {
  it('inicia com tamanho de fonte ampliado (18px) por padrão', () => {
    expect(DEFAULT_APPEARANCE.fontScale).toBe('large');
    expect(FONT_SIZE_MAP[DEFAULT_APPEARANCE.fontScale]).toBe('18px');
    expect(loadAppearanceSettings()).toEqual(DEFAULT_APPEARANCE);
  });
});
