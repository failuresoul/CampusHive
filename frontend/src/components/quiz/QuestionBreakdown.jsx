import React, { useState } from 'react';

/**
 * QuestionBreakdown
 * 
 * Per-question result breakdown for the student results page.
 * Shows question text, the student's answer, correct answer, and points earned.
 *
 * Props:
 *   questions - Array of {
 *     questionIndex, questionText, options,
 *     selectedOptionId, correctOptionId, isCorrect, pointsEarned
 *   }
 */
const QuestionBreakdown = ({ questions = [] }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (idx) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  if (questions.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8 text-sm font-medium">
        No question data available.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {questions.map((q, idx) => {
        const isExpanded = expandedIndex === idx;

        return (
          <div
            key={q.questionIndex ?? idx}
            className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
              q.isCorrect
                ? 'border-emerald-200 bg-emerald-50/30'
                : q.selectedOptionId === null
                  ? 'border-yellow-200 bg-yellow-50/30'
                  : 'border-red-200 bg-red-50/30'
            }`}
          >
            {/* Header — always visible */}
            <button
              onClick={() => toggleExpand(idx)}
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left group"
              id={`question-breakdown-${idx}`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Status icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                  q.isCorrect
                    ? 'bg-emerald-100'
                    : q.selectedOptionId === null
                      ? 'bg-yellow-100'
                      : 'bg-red-100'
                }`}>
                  {q.isCorrect ? '✓' : q.selectedOptionId === null ? '⌛' : '✗'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-gray-400">
                      Q{(q.questionIndex ?? idx) + 1}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      q.isCorrect
                        ? 'text-emerald-700 bg-emerald-100'
                        : q.selectedOptionId === null
                          ? 'text-yellow-700 bg-yellow-100'
                          : 'text-red-700 bg-red-100'
                    }`}>
                      {q.isCorrect ? 'Correct' : q.selectedOptionId === null ? 'Unanswered' : 'Incorrect'}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-gray-800 mt-1 truncate">
                    {q.questionText}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                <div className="text-right">
                  <span className={`text-lg font-black ${
                    q.isCorrect ? 'text-emerald-600' : 'text-gray-400'
                  }`}>
                    +{q.pointsEarned}
                  </span>
                  <span className="text-2xs text-gray-400 block font-bold uppercase tracking-wider">pts</span>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Expanded detail — options list */}
            {isExpanded && (
              <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
                <div className="border-t border-gray-200/60 pt-4 flex flex-col gap-2">
                  {(q.options || []).map((opt, optIdx) => {
                    const isSelected = opt.optionId === q.selectedOptionId;
                    const isCorrectOption = opt.optionId === q.correctOptionId;
                    const optionLabels = ['A', 'B', 'C', 'D'];

                    let borderClass = 'border-gray-200 bg-white';
                    if (isCorrectOption) borderClass = 'border-emerald-300 bg-emerald-50 ring-1 ring-emerald-200';
                    else if (isSelected && !q.isCorrect) borderClass = 'border-red-300 bg-red-50 ring-1 ring-red-200';

                    return (
                      <div
                        key={opt.optionId || optIdx}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${borderClass}`}
                      >
                        <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                          isCorrectOption
                            ? 'bg-emerald-200 text-emerald-800'
                            : isSelected
                              ? 'bg-red-200 text-red-800'
                              : 'bg-gray-100 text-gray-500'
                        }`}>
                          {optionLabels[optIdx] || optIdx + 1}
                        </span>
                        <span className={`text-sm font-medium flex-1 ${
                          isCorrectOption ? 'text-emerald-800' : isSelected ? 'text-red-800' : 'text-gray-700'
                        }`}>
                          {opt.optionText}
                        </span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {isSelected && (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              q.isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                            }`}>
                              Your answer
                            </span>
                          )}
                          {isCorrectOption && !isSelected && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                              Correct
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default QuestionBreakdown;
