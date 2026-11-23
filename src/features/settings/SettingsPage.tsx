import { useState } from 'react';
import { RotateCcw, Smartphone } from 'lucide-react';
import { db } from '../../db/database';
import { resetDatabase } from '../../db/seed';
import type { DailyCheckin, WorkoutSession } from '../../db/types';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { BackupRestorePanel } from './BackupRestorePanel';
import { BodyMetricsPanel } from './BodyMetricsPanel';
import { LumbarCheckinPanel } from './LumbarCheckinPanel';

interface SettingsPageProps {
  counts: {
    routines: number;
    sessions: number;
    exercises: number;
    foods: number;
    meals: number;
    checkins: number;
  };
  checkins: DailyCheckin[];
  sessions: WorkoutSession[];
  lastBackupAt?: string;
}

export function SettingsPage({
  counts,
  checkins,
  sessions,
  lastBackupAt,
}: SettingsPageProps) {
  const [resetMode, setResetMode] = useState<'seed' | 'empty' | null>(null);

  const isStandalone =
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(display-mode: standalone)').matches ||
      ('standalone' in window.navigator &&
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true));

  async function handleReset() {
    if (!resetMode) return;
    await resetDatabase(db, resetMode === 'seed');
    setResetMode(null);
  }

  return (
    <AppShell title="Ajustes & Evolução" subtitle="Backup JSON, medidas, check-in e manutenção">
      <BackupRestorePanel
        counts={{
          ...counts,
          sessions: sessions.filter((s) => s.status === 'completed').length,
        }}
        lastBackupAt={lastBackupAt}
      />

      <BodyMetricsPanel checkins={checkins} />

      <LumbarCheckinPanel checkins={checkins} />

      <Card className="space-y-2.5">
        <h2 className="text-sm font-bold text-[#F4F4F6] flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-[#84CC16]" />
          Instalação no Android (PWA Offline)
        </h2>
        <p className="text-xs text-[#9CA3AF] leading-relaxed">
          Status atual:{' '}
          <span className="text-[#F4F4F6] font-medium">
            {isStandalone ? 'Executando como App instalado' : 'Executando no navegador'}
          </span>
          . No Android, abra o link no Chrome, toque no menu (⋮) e selecione{' '}
          <strong className="text-[#F4F4F6]">Adicionar à tela inicial → Instalar</strong>.
          Após o primeiro carregamento, os dados e telas funcionam sem internet.
        </p>
      </Card>

      <Card className="space-y-3 border-red-900/40">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-red-400" />
          <h2 className="text-sm font-bold text-[#F4F4F6]">Manutenção Local</h2>
        </div>
        <p className="text-xs text-[#9CA3AF]">
          Exporte um backup JSON antes de limpar ou reiniciar os dados locais.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setResetMode('seed')}
            className="py-2 px-3 rounded-xl bg-[#1E1E24] border border-[#2C2C35] text-xs font-medium text-[#D1D5DB] hover:border-red-500/40"
          >
            Restaurar catálogo padrão
          </button>
          <button
            type="button"
            onClick={() => setResetMode('empty')}
            className="py-2 px-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-medium text-red-400 hover:bg-red-500/20"
          >
            Zerar todos os dados
          </button>
        </div>
      </Card>

      <ConfirmDialog
        open={resetMode !== null}
        onClose={() => setResetMode(null)}
        onConfirm={handleReset}
        title={resetMode === 'seed' ? 'Restaurar catálogo padrão?' : 'Zerar todos os dados?'}
        description={
          resetMode === 'seed'
            ? 'Isso apagará seus treinos, refeições e check-ins atuais e recriará apenas os exercícios, rotinas e alimentos iniciais.'
            : 'Isso apagará permanentemente todos os dados locais do aplicativo neste navegador (rotinas, treinos, alimentos, refeições e medidas).'
        }
        confirmLabel="Confirmar"
      />
    </AppShell>
  );
}
