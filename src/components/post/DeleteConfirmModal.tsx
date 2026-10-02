import React, { useState } from 'react';
import { Trash2, AlertTriangle, Loader2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Delete',
  onConfirm,
  onClose
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirm();
      onClose();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in text-white select-none">
      <div className="relative w-full max-w-sm bg-zinc-950/95 border border-rose-500/20 rounded-3xl shadow-[0_25px_60px_rgba(244,63,94,0.15)] overflow-hidden p-6 text-center space-y-4">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1.5px] bg-gradient-to-r from-transparent via-rose-500 to-transparent"></div>

        {/* Danger Icon Orb */}
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400 shadow-lg shadow-rose-500/10">
          <Trash2 className="w-7 h-7" />
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">{description}</p>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>{confirmLabel}</span>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full py-2.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};