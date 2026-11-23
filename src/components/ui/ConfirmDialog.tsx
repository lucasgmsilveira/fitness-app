import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  const confirmClasses =
    variant === 'danger'
      ? 'bg-red-600 hover:bg-red-500 text-white'
      : 'bg-[#F97316] hover:bg-orange-400 text-black font-semibold';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      maxWidthClass="sm:max-w-md"
      footer={
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl text-sm font-medium bg-[#1E1E24] text-[#F4F4F6] hover:bg-[#2A2A32] transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => void onConfirm()}
            disabled={loading}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${confirmClasses}`}
          >
            {loading ? 'Processando...' : confirmLabel}
          </button>
        </div>
      }
    >
      <div className="flex items-start gap-3">
        {variant === 'danger' && (
          <div className="shrink-0 w-10 h-10 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        )}
        <p className="text-sm text-[#D1D5DB] leading-relaxed whitespace-pre-line">
          {description}
        </p>
      </div>
    </Modal>
  );
}
