import React, { useState, useEffect } from 'react';

// Default initial mock data for live leaderboard
const defaultMockData = [
  { studentId: 'stu-1', name: 'Alice Smith', score: 980, rank: 1, prevRank: 1 },
  { studentId: 'stu-2', name: 'Bob Johnson', score: 890, rank: 2, prevRank: 3 },
  { studentId: 'stu-3', name: 'Charlie Brown', score: 880, rank: 3, prevRank: 2 },
  { studentId: 'stu-4', name: 'David Lee', score: 750, rank: 4, prevRank: 4 },
  { studentId: 'stu-5', name: 'Emma Watson', score: 710, rank: 5, prevRank: 6 },
  { studentId: 'stu-6', name: 'Frank Miller', score: 680, rank: 6, prevRank: 5 },
  { studentId: 'stu-7', name: 'Grace Hopper', score: 620, rank: 7, prevRank: 7 },
  { studentId: 'stu-8', name: 'Henry Ford', score: 580, rank: 8, prevRank: 8 },
  { studentId: 'stu-9', name: 'Ivy League', score: 540, rank: 9, prevRank: 9 },
  { studentId: 'stu-10', name: 'Jack Daniels', score: 510, rank: 10, prevRank: 11 },
  { studentId: 'stu-student', name: 'Student User (You)', score: 480, rank: 11, prevRank: 10 }
];

// Simulated updated mock data showing rank changes (e.g. Student User jumps to 2nd place)
const simulatedUpdatedData = [
  { studentId: 'stu-1', name: 'Alice Smith', score: 1050, rank: 1, prevRank: 1 },
  { studentId: 'stu-student', name: 'Student User (You)', score: 990, rank: 2, prevRank: 11 },
  { studentId: 'stu-2', name: 'Bob Johnson', score: 890, rank: 3, prevRank: 2 },
  { studentId: 'stu-3', name: 'Charlie Brown', score: 880, rank: 4, prevRank: 3 },
  { studentId: 'stu-4', name: 'David Lee', score: 750, rank: 5, prevRank: 4 },
  { studentId: 'stu-5', name: 'Emma Watson', score: 710, rank: 6, prevRank: 5 },
  { studentId: 'stu-6', name: 'Frank Miller', score: 680, rank: 7, prevRank: 6 },
  { studentId: 'stu-7', name: 'Grace Hopper', score: 620, rank: 8, prevRank: 7 },
  { studentId: 'stu-8', name: 'Henry Ford', score: 580, rank: 9, prevRank: 8 },
  { studentId: 'stu-9', name: 'Ivy League', score: 540, rank: 10, prevRank: 9 },
  { studentId: 'stu-10', name: 'Jack Daniels', score: 510, rank: 11, prevRank: 10 }
];

const LiveLeaderboard = ({ 
  leaderboardData, 
  currentStudentId = 'stu-student', 
  isCompact = false,
  isTeacherView = false,
  socket = null 
}) => {
  const [data, setData] = useState(defaultMockData);
  const [isSimulated, setIsSimulated] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);

  // TODO: Connect to the 'leaderboard-update' socket event broadcast by Story 9's Leaderboard Calculation API
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

  // Sync with prop data if provided by parent context
  useEffect(() => {
    if (leaderboardData && Array.isArray(leaderboardData) && leaderboardData.length > 0) {
      setData(leaderboardData);
    }
  }, [leaderboardData]);

  // Toggle simulated rank changes in development mode
  const handleToggleSimulation = () => {
    if (isSimulated) {
      setData(defaultMockData);
    } else {
      setData(simulatedUpdatedData);
    }
    setIsSimulated(!isSimulated);
  };

  const limitCount = isCompact ? 5 : 10;
  
  // Map 'stu-student' in mock data to currentStudentId dynamically
  const mappedData = data.map(item => {
    if (item.studentId === 'stu-student' && currentStudentId) {
      return { ...item, studentId: currentStudentId };
    }
    return item;
  });

  const topPerformers = mappedData.slice(0, limitCount);
  
  // Find current student in the entire dataset
  const currentStudentEntry = mappedData.find(item => item.studentId === currentStudentId);
  const isStudentInTopN = currentStudentEntry 
    ? topPerformers.some(item => item.studentId === currentStudentId)
    : false;

  // Helper to render rank change indicator
  const renderChangeIndicator = (item) => {
    const prev = item.prevRank || item.rank;
    const curr = item.rank;
    const diff = prev - curr; // positive is rank up (e.g. 5 -> 3)

    if (diff > 0) {
      return (
        <span className="inline-flex items-center text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full ml-2">
          ▲ {diff}
        </span>
      );
    } else if (diff < 0) {
      return (
        <span className="inline-flex items-center text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full ml-2">
          ▼ {Math.abs(diff)}
        </span>
      );
    }
    return (
      <span className="text-gray-400 text-xs font-semibold px-2 py-0.5 ml-2">•</span>
    );
  };

  // Helper to render rank badges / styling
  const renderRankBadge = (rank) => {
    if (rank === 1) return <span className="text-2xl">🥇</span>;
    if (rank === 2) return <span className="text-2xl">🥈</span>;
    if (rank === 3) return <span className="text-2xl">🥉</span>;
    return <span className="text-gray-500 font-mono font-bold text-sm">#{rank}</span>;
  };

  const renderRow = (item, isPinned = false) => {
    const isSelf = item.studentId === currentStudentId;
    
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
              {renderChangeIndicator(item)}
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

  return (
    <div className="w-full bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-indigo-950 p-6 text-white flex justify-between items-center">
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
        <button 
          onClick={() => setShowDevTools(!showDevTools)}
          className="text-2xs font-extrabold uppercase tracking-widest text-indigo-300 hover:text-white transition-colors bg-indigo-950/60 hover:bg-indigo-900/80 px-3 py-1.5 rounded-lg border border-indigo-800/30"
        >
          {showDevTools ? 'Hide Sim' : 'Dev Sim'}
        </button>
      </div>

      {/* Dev Simulation Panel */}
      {showDevTools && (
        <div className="bg-amber-50 border-b border-amber-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-300">
          <div className="text-amber-800 text-xs font-medium">
            💡 <strong>Dev Simulator:</strong> Swap mock scores to test sorting, animations, and pinned row logic.
          </div>
          <button 
            onClick={handleToggleSimulation}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors shadow-sm self-start sm:self-center"
          >
            {isSimulated ? 'Reset Mock Leaderboard' : 'Simulate Score/Rank Jump'}
          </button>
        </div>
      )}

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
        <span>Showing Top {limitCount} players</span>
        <span>Total Participants: {data.length}</span>
      </div>
    </div>
  );
};

export default LiveLeaderboard;
