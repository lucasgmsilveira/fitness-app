import { useState } from 'react';
import { Palette, RotateCcw } from 'lucide-react';
import {
  ACCENT_PRESETS,
  DEFAULT_APPEARANCE,
  FONT_SIZE_MAP,
  loadAppearanceSettings,
  saveAppearanceSettings,
  type AccentPreset,
  type AppearanceSettings,
  type ContrastMode,
  type DensityMode,
  type FontScale,
} from '../../utils/appearance';
import { Card } from '../../components/ui/Card';

const FONT_OPTIONS: Array<{ id: FontScale; label: string; hint: string }> = [
  { id: 'compact', label: 'Menor', hint: '15px' },
  { id: 'normal', label: 'Normal', hint: '16px' },
  { id: 'large', label: 'Grande', hint: '18px' },
  { id: 'xlarge', label: 'Extra', hint: '20px' },
];

export function AppearancePanel() {
  const [settings, setSettings] = useState<AppearanceSettings>(() =>
    loadAppearanceSettings()
  );

  function update(patch: Partial<AppearanceSettings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveAppearanceSettings(next);
  }

  function handleReset() {
    const next = { ...DEFAULT_APPEARANCE };
    setSettings(next);
    saveAppearanceSettings(next);
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-[#F4F4F6] flex items-center gap-2">
            <Palette className="w-4 h-4 text-[var(--accent-primary)]" />
            Aparência e Leitura
          </h2>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            Ajuste tamanho da fonte, cor de destaque, contraste e espaçamento neste aparelho.
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-xs text-[#9CA3AF] hover:text-white shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Padrão
        </button>
      </div>

      {/* Tamanho da fonte */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-[#D1D5DB]">Tamanho da fonte</span>
          <span className="text-[#9CA3AF] tabular-nums">
            Base {FONT_SIZE_MAP[settings.fontScale]}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {FONT_OPTIONS.map((opt) => {
            const active = settings.fontScale === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => update({ fontScale: opt.id })}
                className={`py-2 px-1 rounded-xl border text-center transition-colors ${
                  active
                    ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-soft)] text-[#F4F4F6]'
                    : 'border-[#2C2C35] bg-[#1E1E24] text-[#9CA3AF] hover:text-white'
                }`}
              >
                <span className="block text-xs font-semibold">{opt.label}</span>
                <span className="block text-[0.75rem] opacity-75">{opt.hint}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cor de destaque */}
      <div className="space-y-1.5">
        <span className="block text-xs font-medium text-[#D1D5DB]">Cor de destaque</span>
        <div className="grid grid-cols-5 gap-2">
          {(Object.keys(ACCENT_PRESETS) as AccentPreset[]).map((key) => {
            const preset = ACCENT_PRESETS[key];
            const active = settings.accent === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => update({ accent: key })}
                className={`py-2 px-1 rounded-xl border flex flex-col items-center gap-1.5 transition-colors ${
                  active
                    ? 'border-[#F4F4F6] bg-[#25252E]'
                    : 'border-[#2C2C35] bg-[#1E1E24] hover:border-[#3D3D4A]'
                }`}
              >
                <span
                  className="w-5 h-5 rounded-full border border-white/20"
                  style={{ backgroundColor: preset.hex }}
                />
                <span className="text-[0.75rem] text-[#D1D5DB]">{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contraste e espaçamento */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <span className="block text-xs font-medium text-[#D1D5DB]">Contraste</span>
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#1E1E24] border border-[#2C2C35]">
            {(
              [
                ['standard', 'Padrão'],
                ['high', 'Alto'],
              ] as Array<[ContrastMode, string]>
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => update({ contrast: id })}
                className={`py-1.5 rounded-lg text-xs font-semibold ${
                  settings.contrast === id
                    ? 'bg-[#2E2E39] text-[#F4F4F6]'
                    : 'text-[#9CA3AF]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="block text-xs font-medium text-[#D1D5DB]">Espaçamento</span>
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#1E1E24] border border-[#2C2C35]">
            {(
              [
                ['comfortable', 'Confort.'],
                ['compact', 'Compacto'],
              ] as Array<[DensityMode, string]>
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => update({ density: id })}
                className={`py-1.5 rounded-lg text-xs font-semibold ${
                  settings.density === id
                    ? 'bg-[#2E2E39] text-[#F4F4F6]'
                    : 'text-[#9CA3AF]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Prévia rápida */}
      <div className="rounded-xl bg-[#1E1E24] border border-[#2C2C35] p-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#F4F4F6]">Prévia de leitura</p>
          <p className="text-xs text-[#9CA3AF]">
            Exemplo de subtítulo e números: 3×10 · 80 kg
          </p>
        </div>
        <span
          className="px-3 py-1.5 rounded-xl text-xs font-bold shrink-0"
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: 'var(--accent-primary-fg)',
          }}
        >
          Destaque
        </span>
      </div>
    </Card>
  );
}
