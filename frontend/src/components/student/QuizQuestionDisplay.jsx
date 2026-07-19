import React from 'react';

const QuizQuestionDisplay = ({ question, isLocked, onSubmitAnswer, revealData, submittedOptionId }) => {
  if (!question) return null;

  const handleSelect = (optionId) => {
    if (isLocked || submittedOptionId) return;
    if (onSubmitAnswer) {
      onSubmitAnswer(optionId);
    }
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
          const isSelected = submittedOptionId === option.id;
          const isCorrectOption = revealData && option.id === revealData.correctOptionId;
          const isIncorrectSelection = revealData && isSelected && !revealData.isCorrect;

          let baseClasses = "relative w-full p-6 rounded-2xl border-2 text-left transition-all duration-200 focus:outline-none flex items-center shadow-sm";
          let stateClasses = "border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md text-gray-700";
          let radioCircleClass = "border-gray-300";
          let radioDot = null;

          if (revealData) {
            baseClasses += " cursor-not-allowed";
            if (isCorrectOption) {
              stateClasses = "border-green-600 bg-green-50 text-green-950 shadow-green-100";
              radioCircleClass = "border-green-600 bg-green-600";
              radioDot = <span className="text-white text-xs font-black flex items-center justify-center">✓</span>;
            } else if (isIncorrectSelection) {
              stateClasses = "border-red-600 bg-red-50 text-red-950 shadow-red-100";
              radioCircleClass = "border-red-600 bg-red-600";
              radioDot = <span className="text-white text-xs font-black flex items-center justify-center">✗</span>;
            } else {
              stateClasses = "border-gray-100 bg-gray-50 text-gray-400 opacity-60";
              radioCircleClass = "border-gray-200";
            }
          } else if (submittedOptionId) {
            baseClasses += " cursor-not-allowed";
            if (isSelected) {
              stateClasses = "border-indigo-600 bg-indigo-50 text-indigo-950 shadow-indigo-100";
              radioCircleClass = "border-indigo-600";
              radioDot = <div className="w-3 h-3 rounded-full bg-indigo-600" />;
            } else {
              stateClasses = "border-gray-100 bg-gray-50 text-gray-400 opacity-60";
              radioCircleClass = "border-gray-200";
            }
          } else {
            // Not submitted yet
            if (isLocked) {
              baseClasses += " cursor-not-allowed opacity-80";
              stateClasses = "border-gray-200 bg-white text-gray-400";
              radioCircleClass = "border-gray-200";
            } else {
              baseClasses += " cursor-pointer";
              stateClasses = "border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md text-gray-700";
              radioCircleClass = "border-gray-300";
            }
          }

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              disabled={isLocked || !!submittedOptionId}
              className={`${baseClasses} ${stateClasses}`}
            >
              <div className={`w-6 h-6 rounded-full border-2 mr-4 flex-shrink-0 flex items-center justify-center transition-colors ${radioCircleClass}`}>
                {radioDot}
              </div>
              <span className="text-lg font-medium">{option.optionText}</span>
            </button>
          );
        })}
      </div>

      {isLocked && !revealData && !submittedOptionId && (
        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center text-gray-600 font-medium">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Time's up! Waiting for the next question...
        </div>
      )}
    </div>
  );
};

export default QuizQuestionDisplay;
