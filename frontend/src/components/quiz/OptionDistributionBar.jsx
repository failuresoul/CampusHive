import React from 'react';

/**
 * OptionDistributionBar
 * 
 * Renders a horizontal bar chart showing how many students chose each option
 * for a single quiz question. The correct answer is highlighted in green.
 *
 * Props:
 *   options     - Array of { optionId, optionText, count, isCorrect }
 *   totalResponses - Total number of responses for this question
 */
const OptionDistributionBar = ({ options = [], totalResponses = 0 }) => {
  const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  return (
    <div className="flex flex-col gap-3">
      {options.map((option, idx) => {
        const percentage = totalResponses > 0
          ? Math.round((option.count / totalResponses) * 100)
          : 0;

        const isCorrect = option.isCorrect;

        return (
          <div key={option.optionId || idx} className="group">
            {/* Option label + text */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                  isCorrect
                    ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500/30'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {optionLabels[idx] || idx + 1}
                </span>
                <span className={`text-sm font-medium truncate ${
                  isCorrect ? 'text-emerald-800' : 'text-gray-700'
                }`}>
                  {option.optionText}
                </span>
                {isCorrect && (
                  <span className="flex-shrink-0 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ✓ Correct
                  </span>
                )}
              </div>
              <div className="flex-shrink-0 ml-3 flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">{option.count}</span>
                <span className="text-xs font-semibold text-gray-400">({percentage}%)</span>
              </div>
            </div>

            {/* Bar */}
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  isCorrect
                    ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                    : 'bg-gradient-to-r from-gray-300 to-gray-400'
                }`}
                style={{ width: `${Math.max(percentage, 0)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OptionDistributionBar;
