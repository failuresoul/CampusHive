import React, { useEffect } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

/**
 * ConfirmDialog
 *
 * A reusable modal dialog for confirmation actions.
 *
 * Props:
 *   isOpen      - Control visibility (boolean)
 *   title       - Header text
 *   message     - Main content/warning message
 *   onConfirm   - Callback when confirm button is clicked
 *   onCancel    - Callback when cancel/close is clicked
 *   confirmText - Custom label for the confirmation button
 *   cancelText  - Custom label for the cancel button
 *   isLoading   - Displays a spinner and disables actions during request execution
 */
const ConfirmDialog = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
}) => {
  // Support closing with Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  // Prevent scrolling behind modal when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      {/* Backdrop click handler */}
      <div
        className="absolute inset-0 cursor-default"
        onClick={() => {
          if (!isLoading) onCancel();
        }}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full overflow-hidden animate-slide-up">
        {/* Body */}
        <div className="p-6 flex items-start gap-4">
          <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3
              id="confirm-dialog-title"
              className="text-lg font-bold text-gray-900"
            >
              {title}
            </h3>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="bg-gray-50 px-6 py-4 flex flex-row-reverse gap-3 border-t border-gray-100">
          <button
            type="button"
            id="confirm-dialog-submit"
            onClick={onConfirm}
            disabled={isLoading}
            className="inline-flex justify-center items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-75 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-sm transition-colors min-w-[90px] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
          <button
            type="button"
            id="confirm-dialog-cancel"
            onClick={onCancel}
            disabled={isLoading}
            className="inline-flex justify-center items-center px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
