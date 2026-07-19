import React, { useState, useEffect } from 'react';

const LiveLeaderboard = ({ 
  leaderboardData, 
  currentStudentId, 
  isCompact = false,
  isTeacherView = false,
  socket = null 
}) => {
  const [data, setData] = useState([]);

  // Listen for real-time leaderboard-update broadcasts from the server (Story 9)
  useEffect(() => {
    if (socket) {
      const handleLeaderboardUpdate = (updatedData) => {
        if (updatedData && Array.isArray(updatedData)) {
          setData(updatedData);
        }
      };

      socket.on('leaderboard-update', handleLeaderboardUpdate);

      return () => {
        socket.off('leaderboard-update', handleLeaderboardUpdate);
      };
    }
  }, [socket]);

  // Sync with prop data if provided (e.g. from REST fallback on reconnect)
  useEffect(() => {
    if (leaderboardData && Array.isArray(leaderboardData) && leaderboardData.length > 0) {
      setData(leaderboardData);
    }
  }, [leaderboardData]);

  const limitCount = isCompact ? 5 : 10;
  const topPerformers = data.slice(0, limitCount);
  
  // Find current student in the entire dataset
  const currentStudentEntry = currentStudentId
    ? data.find(item => item.studentId === currentStudentId)
    : null;
  const isStudentInTopN = currentStudentEntry 
    ? topPerformers.some(item => item.studentId === currentStudentId)
    : false;

  // Helper to render rank badges / styling
  const renderRankBadge = (rank) => {
    if (rank === 1) return <span className="text-2xl">🥇</span>;
    if (rank === 2) return <span className="text-2xl">🥈</span>;
    if (rank === 3) return <span className="text-2xl">🥉</span>;
    return <span className="text-gray-500 font-mono font-bold text-sm">#{rank}</span>;
  };

  const renderRow = (item, isPinned = false) => {
    const isSelf = currentStudentId && item.studentId === currentStudentId;
    
    return (
      <div 
        key={item.studentId + (isPinned ? '-pinned' : '')}
        className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
          isSelf 
            ? 'bg-indigo-50 border-indigo-200 shadow-sm ring-2 ring-indigo-500/20' 
            : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 border border-gray-100 shadow-inner">
            {renderRankBadge(item.rank)}
          </div>
          <div>
            <span className={`text-base font-bold flex items-center ${isSelf ? 'text-indigo-900' : 'text-gray-800'}`}>
              {item.name}
              {isSelf && (
                <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full ml-2">
                  YOU
                </span>
              )}
            </span>
            <span className="text-xs text-gray-400 font-medium">Student ID: {item.studentId.substring(0, 8)}</span>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-lg font-black tracking-tight ${isSelf ? 'text-indigo-700' : 'text-gray-900'}`}>
            {item.score}
          </span>
          <span className="text-2xs text-gray-400 block font-bold uppercase tracking-wider">points</span>
        </div>
      </div>
    );
  };

  // Empty state — no leaderboard data yet
  if (data.length === 0) {
    return (
      <div className="w-full bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-indigo-950 p-6 text-white">
          <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
            🏆 Live Leaderboard
            {isCompact && (
              <span className="text-xs font-bold text-indigo-300 bg-indigo-950/50 px-2.5 py-0.5 rounded-full border border-indigo-800/40">
                COMPACT
              </span>
            )}
          </h3>
          <p className="text-xs text-gray-300 mt-1">Real-time ranking during live quiz session</p>
        </div>
        <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center bg-gray-50/50 min-h-[200px]">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl">📊</span>
          </div>
          <h4 className="text-lg font-bold text-gray-700 mb-1">Awaiting first results…</h4>
          <p className="text-sm text-gray-400 max-w-xs">
            The leaderboard will appear here after the first question is answered and scored.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-indigo-950 p-6 text-white">
        <div>
          <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
            🏆 Live Leaderboard
            {isCompact && (
              <span className="text-xs font-bold text-indigo-300 bg-indigo-950/50 px-2.5 py-0.5 rounded-full border border-indigo-800/40">
                COMPACT
              </span>
            )}
          </h3>
          <p className="text-xs text-gray-300 mt-1">Real-time ranking during live quiz session</p>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="p-4 sm:p-6 flex flex-col gap-3 max-h-[480px] overflow-y-auto bg-gray-50/50">
        {topPerformers.map(item => renderRow(item))}

        {/* Pin student user if not in top N */}
        {!isTeacherView && currentStudentEntry && !isStudentInTopN && (
          <>
            <div className="relative my-2 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dashed border-gray-300"></div>
              </div>
              <span className="relative bg-gray-50 px-3 text-2xs font-extrabold text-gray-400 uppercase tracking-widest">
                Your Position
              </span>
            </div>
            {renderRow(currentStudentEntry, true)}
          </>
        )}
      </div>

      {/* Footer statistics */}
      <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex justify-between items-center text-xs text-gray-400 font-semibold">
        <span>Showing Top {Math.min(limitCount, data.length)} players</span>
        <span>Total Participants: {data.length}</span>
      </div>
    </div>
  );
};

export default LiveLeaderboard;
