import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  FileText,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import RsvpButton from '../../components/studycircle/RsvpButton';
import ParticipantList from '../../components/studycircle/ParticipantList';

const StudySessionDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  
  // RSVP Simulation States
  const [hasRsvpd, setHasRsvpd] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  
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

  // Simulate loading session details on mount
  useEffect(() => {
    const loadSessionDetails = async () => {
      setLoading(true);
      // Simulate 600ms latency
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Mock session details based on story requirements
      setSession({
        id: id || 'test-session-uuid',
        title: 'Midterm review for CSE-3106',
        description: 'We will review chapters 1 to 4, specifically focusing on Database Normalization (1NF, 2NF, 3NF, BCNF) and Entity-Relationship Diagrams. Please bring your laptops and past question papers if you have any.',
        location: 'Library Room 204',
        sessionDateTime: new Date(Date.now() + 172800000).toISOString(), // 2 days in future
        maxParticipants: 10,
        rsvpCount: 4,
        creator: {
          name: 'Jane Doe'
        },
        course: {
          code: 'CSE-3106',
          title: 'Database Management Systems'
        },
        participants: [
          { name: 'Alice Smith' },
          { name: 'Bob Johnson' },
          { name: 'Charlie Brown' },
          { name: 'Diana Prince' }
        ]
      });
      setLoading(false);
    };

    loadSessionDetails();
  }, [id]);

  // TODO: connect to POST /api/study-sessions/:id/rsvp and DELETE /api/study-sessions/:id/rsvp in Story 5
  
  const handleRsvp = async () => {
    setRsvpLoading(true);
    // Simulate 800ms API latency
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setHasRsvpd(true);
    setSession(prev => ({
      ...prev,
      rsvpCount: prev.rsvpCount + 1,
      participants: [...prev.participants, { name: user?.name || 'My Test Account' }]
    }));
    setRsvpLoading(false);
  };

  const handleCancelRsvp = async () => {
    setRsvpLoading(true);
    // Simulate 800ms API latency
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setHasRsvpd(false);
    setSession(prev => ({
      ...prev,
      rsvpCount: prev.rsvpCount - 1,
      participants: prev.participants.filter(p => p.name !== (user?.name || 'My Test Account'))
    }));
    setRsvpLoading(false);
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

  // Compute attendance status
  const currentParticipants = session.rsvpCount;
  // If simulation check is active, set max to equal the current count so it shows "Full"
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
                {session.course.code}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-3 mb-2">
                {session.title}
              </h1>
              <p className="text-gray-500 text-sm font-medium">
                {session.course.title}
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
                  {session.creator.name[0]}
                </div>
                <div>
                  <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Organizer</span>
                  <span className="block text-xs font-bold text-gray-700">{session.creator.name}</span>
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
