import React, { useState } from 'react';
import { X, Send, MessageSquare, AlertCircle } from 'lucide-react';

const ClaimDialog = ({ isOpen, onClose, onConfirm, type, isLoading }) => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const isLostType = type === 'lost';
  const titleText = isLostType ? 'I Found This Item' : 'Claim This Item';
  const labelText = isLostType
    ? 'Provide details about where/when you found it and its current location:'
    : 'Provide details to verify this item is yours:';
  const placeholderText = isLostType
    ? 'e.g., I found it on the 3rd floor of the library yesterday around 2 PM. It is currently at the security desk.'
    : 'e.g., The phone has a scratch on the top left corner and a red protective case. The lock screen wallpaper is a picture of a cat.';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please provide a message.');
      return;
    }
    if (message.trim().length < 10) {
      setError('Please provide a more detailed message (minimum 10 characters).');
      return;
    }
    setError('');
    onConfirm(message.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={isLoading ? null : onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-150 overflow-hidden z-10 transform transition-all animate-slide-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-amber-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-950">{titleText}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="claim-message" className="block text-sm font-semibold text-gray-700 mb-2">
                {labelText}
              </label>
              <textarea
                id="claim-message"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (error) setError('');
                }}
                placeholder={placeholderText}
                rows={5}
                maxLength={500}
                disabled={isLoading}
                className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-sm placeholder-gray-400 ${
                  error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                }`}
              />
              <div className="flex justify-between items-center mt-1.5">
                <span className="text-xs text-gray-400 font-medium">
                  {message.length}/500 characters
                </span>
                {error && (
                  <div className="flex items-center gap-1 text-xs text-red-600 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5 flex gap-3 text-xs text-amber-800">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Note on Safety & Privacy</span>
                Your name and role will be shared with the reporter, but your direct contact details (phone, email) are kept private. Contact happens via in-app message/claim requests.
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4.5 py-2 text-sm font-bold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Claim</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClaimDialog;
