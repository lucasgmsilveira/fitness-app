import { useRef, useState } from 'react';
import { CheckCircle2, Download, FileJson, Upload } from 'lucide-react';
import { db } from '../../db/database';
import {
  downloadBackupFile,
  exportBackup,
  parseAndValidateBackup,
  restoreBackup,
  type BackupSummary,
} from '../../db/backup';
import type { BackupPayload } from '../../db/types';
import { Card } from '../../components/ui/Card';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

interface BackupRestorePanelProps {
  counts: {
    routines: number;
    sessions: number;
    exercises: number;
    foods: number;
    meals: number;
    checkins: number;
  };
  lastBackupAt?: string;
}

export function BackupRestorePanel({ counts, lastBackupAt }: BackupRestorePanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMsg, setStatusMsg] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null);
  const [pendingRestore, setPendingRestore] = useState<{
    payload: BackupPayload;
    summary: BackupSummary;
  } | null>(null);
  const [restoring, setRestoring] = useState(false);

  async function handleExport() {
    setStatusMsg(null);
    const payload = await exportBackup(db);
    const filename = downloadBackupFile(payload);
    setStatusMsg({
      tone: 'ok',
      text: `Backup exportado: ${filename}. Envie este arquivo para seu computador ou celular quando quiser transferir os dados.`,
    });
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setStatusMsg(null);
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const text = await file.text();
    const result = parseAndValidateBackup(text);
    if (!result.ok) {
      setStatusMsg({ tone: 'err', text: result.error });
      return;
    }

    setPendingRestore({ payload: result.payload, summary: result.summary });
  }

  async function confirmRestore() {
    if (!pendingRestore) return;
    setRestoring(true);
    try {
      await restoreBackup(db, pendingRestore.payload);
      setPendingRestore(null);
      setStatusMsg({
        tone: 'ok',
        text: 'Backup restaurado com sucesso! Todos os dados locais foram atualizados.',
      });
    } finally {
      setRestoring(false);
    }
  }

  const formattedLastBackup = lastBackupAt
    ? new Date(lastBackupAt).toLocaleString('pt-BR')
    : 'Ainda não realizado';

  return (
    <Card className="space-y-3.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-[#F4F4F6] flex items-center gap-2">
            <FileJson className="w-4 h-4 text-[#F97316]" />
            Backup e Transferência (JSON)
          </h2>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            Todos os dados ficam salvos apenas neste dispositivo (IndexedDB). Exporte para fazer backup ou transferir entre celular e computador.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center rounded-xl bg-[#1E1E24] p-2.5">
        <div>
          <p className="text-sm font-bold tabular-nums">{counts.routines}</p>
          <p className="text-[0.75rem] text-[#9CA3AF]">Rotinas</p>
        </div>
        <div>
          <p className="text-sm font-bold tabular-nums">{counts.sessions}</p>
          <p className="text-[0.75rem] text-[#9CA3AF]">Treinos</p>
        </div>
        <div>
          <p className="text-sm font-bold tabular-nums">{counts.meals}</p>
          <p className="text-[0.75rem] text-[#9CA3AF]">Refeições</p>
        </div>
      </div>

      <p className="text-[0.8125rem] text-[#9CA3AF]">
        Último backup neste aparelho: <span className="text-[#D1D5DB]">{formattedLastBackup}</span>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => void handleExport()}
          className="py-2.5 px-4 rounded-xl bg-[#84CC16] hover:bg-lime-400 text-black text-xs font-bold inline-flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Exportar Dados (.json)
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="py-2.5 px-4 rounded-xl bg-[#1E1E24] hover:bg-[#272730] border border-[#2C2C35] text-xs font-semibold text-[#F4F4F6] inline-flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4 text-[#F97316]" />
          Importar / Restaurar (.json)
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={(e) => void handleFileChange(e)}
          className="hidden"
        />
      </div>

      {statusMsg && (
        <div
          className={`rounded-xl p-3 text-xs flex items-start gap-2 ${
            statusMsg.tone === 'ok'
              ? 'bg-[#84CC16]/10 border border-[#84CC16]/30 text-[#84CC16]'
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}
        >
          {statusMsg.tone === 'ok' && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <ConfirmDialog
        open={pendingRestore !== null}
        onClose={() => setPendingRestore(null)}
        onConfirm={confirmRestore}
        loading={restoring}
        title="Substituir dados atuais pelo backup?"
        confirmLabel="Confirmar Restauração"
        description={
          pendingRestore
            ? `Esta ação substituirá TODOS os dados atuais deste navegador pelo conteúdo do arquivo selecionado.\n\nData do backup: ${new Date(
                pendingRestore.summary.exportedAt
              ).toLocaleString('pt-BR')}\n• ${pendingRestore.summary.routinesCount} rotinas\n• ${
                pendingRestore.summary.workoutSessionsCount
              } treinos registrados\n• ${pendingRestore.summary.exercisesCount} exercícios\n• ${
                pendingRestore.summary.foodsCount
              } alimentos\n• ${pendingRestore.summary.mealEntriesCount} registros de refeição\n• ${
                pendingRestore.summary.dailyCheckinsCount
              } check-ins diários`
            : ''
        }
      />
    </Card>
  );
}
