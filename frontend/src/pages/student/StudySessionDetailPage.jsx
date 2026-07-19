import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  FileText,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  getStudySessionDetails, 
  rsvpToSession, 
  cancelRsvp 
} from '../../services/studyCircleService';
import RsvpButton from '../../components/studycircle/RsvpButton';
import ParticipantList from '../../components/studycircle/ParticipantList';

const StudySessionDetailPage = () => {
  const { id } = useParams();
  const { token } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);
  
  // RSVP Interaction States
  const [hasRsvpd, setHasRsvpd] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpError, setRsvpError] = useState(null);
  
  // Simulation Controls for Testing
  const [simulateFull, setSimulateFull] = useState(false);

  // SEO: Title & Meta Description
  useEffect(() => {
    document.title = 'Study Session Details | CampusHive';
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', 'View details and RSVP to join student-led collaborative review groups and study sessions.');
  }, []);

  // Fetch session details on mount
  useEffect(() => {
    const loadSessionDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getStudySessionDetails(id, token);
        setSession(data);
        setHasRsvpd(data.hasRsvpd);
      } catch (err) {
        console.error('Failed to load study session details:', err);
        const errMsg = err.response?.data?.message || 'Failed to load study session details. It may have been deleted.';
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    };

    if (token && id) {
      loadSessionDetails();
    }
  }, [id, token]);

  const handleRsvp = async () => {
    setRsvpLoading(true);
    setRsvpError(null);
    try {
      // TODO: connect to POST /api/study-sessions/:id/rsvp in Story 5 (Done!)
      await rsvpToSession(id, token);
      setHasRsvpd(true);
      
      // Reload session details to sync participants and counts with server
      const updatedData = await getStudySessionDetails(id, token);
      setSession(updatedData);
    } catch (err) {
      console.error('Error during RSVP:', err);
      const errMsg = err.response?.data?.message || 'Failed to complete RSVP. Please try again.';
      setRsvpError(errMsg);
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleCancelRsvp = async () => {
    setRsvpLoading(true);
    setRsvpError(null);
    try {
      // TODO: connect to DELETE /api/study-sessions/:id/rsvp in Story 5 (Done!)
      await cancelRsvp(id, token);
      setHasRsvpd(false);
      
      // Reload session details to sync participants and counts with server
      const updatedData = await getStudySessionDetails(id, token);
      setSession(updatedData);
    } catch (err) {
      console.error('Error cancelling RSVP:', err);
      const errMsg = err.response?.data?.message || 'Failed to cancel RSVP. Please try again.';
      setRsvpError(errMsg);
    } finally {
      setRsvpLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/6 mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-10 bg-gray-200 rounded w-3/4"></div>
            <div className="h-5 bg-gray-200 rounded w-1/4"></div>
            <div className="h-40 bg-gray-100 rounded-2xl"></div>
          </div>
          <div className="space-y-6">
            <div className="h-28 bg-gray-150 rounded-2xl"></div>
            <div className="h-48 bg-gray-150 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full border border-gray-100 shadow-xl text-center">
          <AlertCircle className="h-12 w-12 text-rose-650 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Error Loading Session</h1>
          <p className="text-gray-500 mb-6 text-sm">{error}</p>
          <Link
            to="/student/study-sessions"
            className="inline-flex justify-center items-center px-6 py-3 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all shadow-md"
          >
            Back to Study Sessions
          </Link>
        </div>
      </div>
    );
  }

  // Compute attendance status
  const currentParticipants = session.rsvpCount;
  const max = simulateFull ? currentParticipants : session.maxParticipants;
  const isFull = max ? (currentParticipants >= max) : false;

  const formattedDate = new Date(session.sessionDateTime).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTime = new Date(session.sessionDateTime).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link 
            to="/student/study-sessions" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
            id="back-to-browse-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Study Sessions
          </Link>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Details Panel (Left Column) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Title Block */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                {session.course ? session.course.code : 'General'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-3 mb-2">
                {session.title}
              </h1>
              <p className="text-gray-500 text-sm font-medium">
                {session.course ? session.course.title : ''}
              </p>
            </div>

            {/* Timing & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex gap-4">
                <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">Date & Time</span>
                  <span className="block text-sm font-bold text-gray-800 mt-1">{formattedDate}</span>
                  <span className="block text-xs text-gray-500 mt-0.5">{formattedTime}</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex gap-4">
                <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">Location</span>
                  <span className="block text-sm font-bold text-gray-800 mt-1">{session.location}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-amber-500" />
                Description
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {session.description || 'No description provided.'}
              </p>
            </div>
            
          </div>

          {/* Action & RSVP Panel (Right Column) */}
          <div className="space-y-6">
            
            {/* RSVP Summary Box */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              {/* Organized by */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="h-9 w-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 text-sm font-bold shrink-0">
                  {session.creator ? session.creator.name[0] : 'U'}
                </div>
                <div>
                  <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Organizer</span>
                  <span className="block text-xs font-bold text-gray-700">{session.creator ? session.creator.name : 'Unknown'}</span>
                </div>
              </div>

              {/* Attendance Capacity Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-semibold text-gray-600">Current RSVP list</span>
                  <span className="text-xs font-bold text-gray-400">
                    {currentParticipants} {max ? `/ ${max}` : ''} attending
                  </span>
                </div>
                {/* Progress bar */}
                {max && (
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (currentParticipants / max) * 100)}%` }}
                    />
                  </div>
                )}
              </div>

              {/* RSVP Error Alert Banner */}
              {rsvpError && (
                <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-100 flex items-start gap-2.5 text-rose-800 text-xs animate-slide-up" id="rsvp-error-banner">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>{rsvpError}</div>
                </div>
              )}

              {/* RSVP Action Button */}
              <RsvpButton
                hasRsvpd={hasRsvpd}
                isFull={isFull}
                isLoading={rsvpLoading}
                onRsvp={handleRsvp}
                onCancel={handleCancelRsvp}
              />
            </div>

            {/* Attendees List */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                Attendees
              </h2>
              <ParticipantList participants={session.participants} />
            </div>

            {/* Test Simulation Panel */}
            <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Reviewer Controls
              </h3>
              <p className="text-xs text-amber-700 leading-relaxed mb-4">
                Use these controls to simulate various database scenarios for checking acceptance criteria.
              </p>
              <label className="flex items-center gap-2.5 text-xs text-gray-700 font-semibold cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={simulateFull}
                  onChange={(e) => setSimulateFull(e.target.checked)}
                  className="rounded border-amber-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                  id="simulate-full-checkbox"
                />
                Simulate Session is Full
              </label>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default StudySessionDetailPage;
