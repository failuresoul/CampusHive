import React from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

const RsvpButton = ({ hasRsvpd, isFull, isLoading, onRsvp, onCancel }) => {
  if (isLoading) {
    return (
      <button
        disabled
        className="w-full flex items-center justify-center gap-2 py-3 px-5 border border-transparent rounded-xl text-sm font-semibold text-gray-500 bg-gray-100 cursor-not-allowed transition-all"
        id="rsvp-loading-btn"
      >
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        Updating RSVP...
      </button>
    );
  }

  if (hasRsvpd) {
    return (
      <button
        onClick={onCancel}
        className="w-full flex items-center justify-center gap-2 py-3 px-5 border border-rose-200 rounded-xl text-sm font-semibold text-rose-700 bg-rose-50/50 hover:bg-rose-50 hover:border-rose-300 active:scale-[0.98] transition-all shadow-sm"
        id="cancel-rsvp-btn"
      >
        <XCircle className="w-4.5 h-4.5" />
        Cancel RSVP
      </button>
    );
  }

  if (isFull) {
    return (
      <button
        disabled
        className="w-full flex items-center justify-center gap-2 py-3 px-5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-400 bg-gray-50 cursor-not-allowed transition-all"
        id="rsvp-full-btn"
      >
        Session is Full
      </button>
    );
  }

  return (
    <button
      onClick={onRsvp}
      className="w-full flex items-center justify-center gap-2 py-3 px-5 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-[0.98] transition-all shadow-md shadow-amber-500/10"
      id="rsvp-btn"
    >
      <CheckCircle2 className="w-4.5 h-4.5" />
      RSVP to Attend
    </button>
  );
};

export default RsvpButton;
