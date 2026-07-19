import React from 'react';
import { User } from 'lucide-react';

const ParticipantList = ({ participants = [] }) => {
  // Helper to extract initials
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  if (participants.length === 0) {
    return (
      <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <User className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-xs text-gray-500 font-medium">No attendees yet.</p>
        <p className="text-[10px] text-gray-400 mt-0.5">Be the first to RSVP and join!</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-150 border border-gray-100 rounded-xl overflow-hidden shadow-sm" id="participants-list-ul">
      {participants.map((participant, index) => (
        <li 
          key={index} 
          className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50/50 transition-colors"
        >
          {/* Avatar initial badge */}
          <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 text-xs font-bold shrink-0">
            {getInitials(participant.name)}
          </div>
          <span className="text-sm font-semibold text-gray-800">
            {participant.name}
          </span>
        </li>
      ))}
    </ul>
  );
};

export default ParticipantList;
