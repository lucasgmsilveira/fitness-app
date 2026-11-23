export type FontScale = 'compact' | 'normal' | 'large' | 'xlarge';
export type AccentPreset = 'orange' | 'lime' | 'sky' | 'rose' | 'violet';
export type ContrastMode = 'standard' | 'high';
export type DensityMode = 'compact' | 'comfortable';

export interface AppearanceSettings {
  fontScale: FontScale;
  accent: AccentPreset;
  contrast: ContrastMode;
  density: DensityMode;
}

export const APPEARANCE_STORAGE_KEY = 'gymlog-appearance-v1';

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  fontScale: 'large',
  accent: 'orange',
  contrast: 'standard',
  density: 'comfortable',
};

export const FONT_SIZE_MAP: Record<FontScale, string> = {
  compact: '15px',
  normal: '16px',
  large: '18px',
  xlarge: '20px',
};

export const ACCENT_PRESETS: Record<
  AccentPreset,
  { label: string; hex: string; soft: string; fg: string }
> = {
  orange: {
    label: 'Laranja',
    hex: '#F97316',
    soft: 'rgba(249, 115, 22, 0.16)',
    fg: '#000000',
  },
  lime: {
    label: 'Verde',
    hex: '#84CC16',
    soft: 'rgba(132, 204, 22, 0.16)',
    fg: '#000000',
  },
  sky: {
    label: 'Azul',
    hex: '#38BDF8',
    soft: 'rgba(56, 189, 248, 0.16)',
    fg: '#000000',
  },
  rose: {
    label: 'Rosa',
    hex: '#F43F5E',
    soft: 'rgba(244, 63, 94, 0.16)',
    fg: '#FFFFFF',
  },
  violet: {
    label: 'Roxo',
    hex: '#A855F7',
    soft: 'rgba(168, 85, 247, 0.16)',
    fg: '#FFFFFF',
  },
};

function isValidFontScale(v: unknown): v is FontScale {
  return v === 'compact' || v === 'normal' || v === 'large' || v === 'xlarge';
}

function isValidAccent(v: unknown): v is AccentPreset {
  return v === 'orange' || v === 'lime' || v === 'sky' || v === 'rose' || v === 'violet';
}

function isValidContrast(v: unknown): v is ContrastMode {
  return v === 'standard' || v === 'high';
}

function isValidDensity(v: unknown): v is DensityMode {
  return v === 'compact' || v === 'comfortable';
}

export function loadAppearanceSettings(): AppearanceSettings {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { ...DEFAULT_APPEARANCE };
  }
  try {
    const raw = window.localStorage.getItem(APPEARANCE_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_APPEARANCE };
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      fontScale: isValidFontScale(parsed.fontScale)
        ? parsed.fontScale
        : DEFAULT_APPEARANCE.fontScale,
      accent: isValidAccent(parsed.accent) ? parsed.accent : DEFAULT_APPEARANCE.accent,
      contrast: isValidContrast(parsed.contrast)
        ? parsed.contrast
        : DEFAULT_APPEARANCE.contrast,
      density: isValidDensity(parsed.density)
        ? parsed.density
        : DEFAULT_APPEARANCE.density,
    };
  } catch {
    return { ...DEFAULT_APPEARANCE };
  }
}

export function applyAppearanceSettings(settings: AppearanceSettings): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.fontSize = FONT_SIZE_MAP[settings.fontScale];
  root.dataset.accent = settings.accent;
  root.dataset.contrast = settings.contrast;
  root.dataset.density = settings.density;

  const preset = ACCENT_PRESETS[settings.accent];
  root.style.setProperty('--accent-primary', preset.hex);
  root.style.setProperty('--accent-primary-soft', preset.soft);
  root.style.setProperty('--accent-primary-fg', preset.fg);
}

export function saveAppearanceSettings(settings: AppearanceSettings): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(settings));
  }
  applyAppearanceSettings(settings);
}
