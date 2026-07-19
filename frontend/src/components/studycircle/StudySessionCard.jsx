import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, User, Users, ChevronRight } from 'lucide-react';

const StudySessionCard = ({ session }) => {
  const { id, title, course, creator, location, sessionDateTime, maxParticipants, rsvpCount } = session;

  const formattedDate = new Date(sessionDateTime).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = new Date(sessionDateTime).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const isPast = new Date(sessionDateTime) < new Date();

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-amber-200 transition-all flex flex-col justify-between ${isPast ? 'opacity-75 bg-gray-50/50' : ''}`}>
      <div>
        {/* Course Code badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
            {course ? course.code : 'General'}
          </span>
          {isPast && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
              Past Session
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-2 hover:text-amber-600 transition-colors">
          <Link to={`/student/study-sessions/${id}`} id={`session-card-title-${id}`}>
            {title}
          </Link>
        </h3>

        {/* Course Title */}
        <p className="text-sm text-gray-500 mb-4 line-clamp-1">
          {course ? course.title : ''}
        </p>

        {/* Info Grid */}
        <div className="space-y-2.5 text-sm text-gray-600 mb-5">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
            <span>{formattedDate} at {formattedTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="line-clamp-1">{location}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400 shrink-0" />
            <span>Organized by <strong className="font-semibold text-gray-700">{creator ? creator.name : 'Unknown'}</strong></span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-gray-50 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1.5 text-sm text-gray-700">
          <Users className="w-4.5 h-4.5 text-amber-500 shrink-0" />
          <span>
            <strong className="font-semibold text-gray-900">{rsvpCount}</strong>
            {maxParticipants ? ` / ${maxParticipants}` : ''} going
          </span>
        </div>
        <Link
          to={`/student/study-sessions/${id}`}
          className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors uppercase tracking-wider"
          id={`view-details-link-${id}`}
        >
          View Details
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default StudySessionCard;
