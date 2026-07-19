import React, { useState, useEffect } from 'react';

const QuizWaitingRoom = ({ quiz, onBeginQuiz }) => {
  const [studentsJoined, setStudentsJoined] = useState(0);

  // Simulate students joining over time
  useEffect(() => {
    const interval = setInterval(() => {
      setStudentsJoined(prev => {
        // Randomly add 0-3 students
        const joined = Math.floor(Math.random() * 4);
        return prev + joined;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (!quiz) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-4xl mx-auto mt-8">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Waiting Room is Open</h2>
        <p className="text-gray-500">Students can now join the quiz session.</p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-12 mb-12">
        {/* Mock join info */}
        <div className="bg-indigo-50 border-2 border-indigo-100 rounded-2xl p-8 text-center flex-1 max-w-sm">
          <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-2">Join Code</p>
          <p className="text-6xl font-black text-indigo-700 tracking-wider font-mono">X7K-9P2</p>
          <p className="text-sm text-indigo-600 mt-4 font-medium">campushive.edu/join</p>
        </div>

        {/* Real-time counter mock */}
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="relative">
            <svg className="w-32 h-32 text-gray-100 absolute inset-0 -z-10 transform scale-150" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle></svg>
            <div className="w-32 h-32 rounded-full border-4 border-indigo-500 flex items-center justify-center bg-white shadow-lg relative">
              {studentsJoined > 0 && (
                <span className="absolute top-0 right-0 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                </span>
              )}
              <span className="text-5xl font-bold text-gray-900">{studentsJoined}</span>
            </div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700 text-center">
            Students Connected
          </p>
        </div>
      </div>

      <div className="border-t pt-8 flex justify-between items-center">
        <button 
          onClick={() => window.location.reload()}
          className="text-gray-500 hover:text-gray-700 font-medium"
        >
          Cancel Session
        </button>
        
        <button
          onClick={onBeginQuiz}
          disabled={studentsJoined === 0}
          className="px-8 py-3 bg-green-600 text-white rounded-lg text-lg font-bold hover:bg-green-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          Begin First Question
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>
    </div>
  );
};

export default QuizWaitingRoom;
