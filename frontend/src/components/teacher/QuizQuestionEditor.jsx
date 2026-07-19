import React from 'react';

const QuizQuestionEditor = ({ 
  question, 
  index, 
  totalQuestions, 
  onChange, 
  onRemove, 
  onMoveUp, 
  onMoveDown,
  error 
}) => {
  const handleTextChange = (e) => {
    onChange({ ...question, text: e.target.value });
  };

  const handleOptionChange = (optionIndex, value) => {
    const newOptions = [...question.options];
    newOptions[optionIndex] = value;
    onChange({ ...question, options: newOptions });
  };

  const handleCorrectAnswerChange = (optionIndex) => {
    onChange({ ...question, correctAnswerIndex: optionIndex });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-bold">
            {index + 1}
          </span>
          Question {index + 1}
        </h3>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className={`p-1.5 rounded-md ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100 hover:text-indigo-600'}`}
            title="Move Up"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === totalQuestions - 1}
            className={`p-1.5 rounded-md ${index === totalQuestions - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100 hover:text-indigo-600'}`}
            title="Move Down"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded-md ml-2"
            title="Remove Question"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question Text <span className="text-red-500">*</span>
          </label>
          <textarea
            value={question.text}
            onChange={handleTextChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${error?.text ? 'border-red-300' : 'border-gray-300'}`}
            rows="3"
            placeholder="Enter your question here..."
          ></textarea>
          {error?.text && <p className="mt-1 text-sm text-red-600">{error.text}</p>}
        </div>

        {/* Options */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Options & Correct Answer <span className="text-red-500">*</span>
          </label>
          {error?.correctAnswer && <p className="mb-2 text-sm text-red-600">{error.correctAnswer}</p>}
          
          <div className="space-y-3">
            {question.options.map((option, optIndex) => (
              <div key={optIndex} className="flex items-center space-x-3">
                <input
                  type="radio"
                  name={`correct-answer-${question.id}`}
                  checked={question.correctAnswerIndex === optIndex}
                  onChange={() => handleCorrectAnswerChange(optIndex)}
                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(optIndex, e.target.value)}
                    placeholder={`Option ${optIndex + 1}`}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${error?.[`option${optIndex}`] ? 'border-red-300' : 'border-gray-300'}`}
                  />
                  {error?.[`option${optIndex}`] && (
                    <p className="mt-1 text-xs text-red-600">{error[`option${optIndex}`]}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizQuestionEditor;
