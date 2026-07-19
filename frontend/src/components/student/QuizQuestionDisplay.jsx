import React, { useState, useEffect } from 'react';

const QuizQuestionDisplay = ({ question, isLocked }) => {
  const [selectedOptionId, setSelectedOptionId] = useState(null);

  // Reset local selection when the question changes
  useEffect(() => {
    setSelectedOptionId(null);
  }, [question?.id]);

  if (!question) return null;

  const handleSelect = (optionId) => {
    if (isLocked) return;
    setSelectedOptionId(optionId);
    // Real submission logic to be added in Story 7
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-10 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
          {question.text}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {question.options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          
          let baseClasses = "relative w-full p-6 rounded-2xl border-2 text-left transition-all duration-200 focus:outline-none flex items-center shadow-sm";
          let stateClasses = "border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md text-gray-700";
          
          if (isSelected) {
            stateClasses = "border-indigo-600 bg-indigo-50 shadow-indigo-500/20 text-indigo-900";
          }
          
          if (isLocked) {
            baseClasses += " cursor-not-allowed opacity-80";
            if (isSelected) {
              stateClasses = "border-gray-400 bg-gray-100 text-gray-800";
            } else {
              stateClasses = "border-gray-200 bg-white text-gray-400";
            }
          } else {
            baseClasses += " cursor-pointer";
          }

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              disabled={isLocked}
              className={`${baseClasses} ${stateClasses}`}
            >
              <div className={`w-6 h-6 rounded-full border-2 mr-4 flex-shrink-0 flex items-center justify-center transition-colors ${isSelected ? 'border-indigo-600' : 'border-gray-300'}`}>
                {isSelected && <div className="w-3 h-3 rounded-full bg-indigo-600" />}
              </div>
              <span className="text-lg font-medium">{option.optionText}</span>
            </button>
          );
        })}
      </div>

      {isLocked && (
        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center text-gray-600 font-medium">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Time's up! Waiting for the next question...
        </div>
      )}
    </div>
  );
};

export default QuizQuestionDisplay;
