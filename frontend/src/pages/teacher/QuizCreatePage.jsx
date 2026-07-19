import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QuizQuestionEditor from '../../components/teacher/QuizQuestionEditor';
import { createQuiz } from '../../services/quizService';
import { useAuth } from '../../context/AuthContext';

const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

const defaultQuestion = () => ({
  id: generateId(),
  text: '',
  options: ['', '', '', ''],
  correctAnswerIndex: null,
});

const QuizCreatePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [title, setTitle] = useState('');
  const [timeLimit, setTimeLimit] = useState(30);
  const [questions, setQuestions] = useState([defaultQuestion()]);
  
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleAddQuestion = () => {
    setQuestions([...questions, defaultQuestion()]);
  };

  const handleRemoveQuestion = (indexToRemove) => {
    if (questions.length <= 1) return; // Must have at least 1 question
    setQuestions(questions.filter((_, idx) => idx !== indexToRemove));
    
    // Clear errors for removed question to prevent ghost errors
    const newErrors = { ...errors };
    delete newErrors[`q_${indexToRemove}`];
    // We would ideally re-index errors, but for simplicity, we validate on save anyway.
    setErrors(newErrors);
  };

  const handleMoveQuestion = (index, direction) => {
    const newQuestions = [...questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newQuestions.length) return;

    // Swap
    [newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]];
    setQuestions(newQuestions);
  };

  const handleQuestionChange = (index, updatedQuestion) => {
    const newQuestions = [...questions];
    newQuestions[index] = updatedQuestion;
    setQuestions(newQuestions);
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!title.trim()) {
      newErrors.title = 'Quiz title is required.';
      isValid = false;
    }

    if (!timeLimit || timeLimit <= 0) {
      newErrors.timeLimit = 'Time limit must be a positive number.';
      isValid = false;
    }

    questions.forEach((q, index) => {
      const qErrors = {};
      if (!q.text.trim()) {
        qErrors.text = 'Question text is required.';
        isValid = false;
      }
      
      q.options.forEach((opt, optIdx) => {
        if (!opt.trim()) {
          qErrors[`option${optIdx}`] = 'Option cannot be empty.';
          isValid = false;
        }
      });

      if (q.correctAnswerIndex === null || q.correctAnswerIndex === undefined) {
        qErrors.correctAnswer = 'Please select the correct answer.';
        isValid = false;
      }

      if (Object.keys(qErrors).length > 0) {
        newErrors[`q_${index}`] = qErrors;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      // Scroll to top to show title error if exists
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    const payload = {
      title,
      timeLimit: parseInt(timeLimit, 10),
      questions
    };

    try {
      await createQuiz(courseId, payload, token);
      setIsSaving(false);
      setSaveSuccess(true);
      
      setTimeout(() => {
        // Navigate back to course dashboard or quizzes list
        navigate(`/teacher/dashboard`); 
      }, 1500);
    } catch (error) {
      console.error('Save quiz error:', error);
      setIsSaving(false);
      setErrors({ ...errors, serverError: error.message || 'Failed to save quiz. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <button 
              onClick={() => navigate(-1)}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center mb-2"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Create Live Quiz</h1>
            <p className="text-sm text-gray-500 mt-1">
              Add questions and configure settings for your students.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save as Draft'
              )}
            </button>
          </div>
        </div>

        {errors.serverError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center shadow-sm">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {errors.serverError}
          </div>
        )}

        {saveSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center shadow-sm">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            Quiz saved successfully! (Note: Launching happens in a later story)
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">Quiz Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quiz Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Midterm Review, Week 3 Check-in"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.title ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Limit (seconds) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="5"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.timeLimit ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.timeLimit && <p className="mt-1 text-sm text-red-600">{errors.timeLimit}</p>}
            </div>
          </div>
        </div>

        <div className="mb-6 flex justify-between items-end pb-2 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Questions</h2>
            <p className="text-sm text-gray-500 mt-1">Add multiple choice questions for your students.</p>
          </div>
          <div className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            Total: {questions.length}
          </div>
        </div>

        <div className="space-y-4">
          {questions.map((q, index) => (
            <QuizQuestionEditor
              key={q.id}
              index={index}
              totalQuestions={questions.length}
              question={q}
              error={errors[`q_${index}`]}
              onChange={(updated) => handleQuestionChange(index, updated)}
              onRemove={() => handleRemoveQuestion(index)}
              onMoveUp={() => handleMoveQuestion(index, 'up')}
              onMoveDown={() => handleMoveQuestion(index, 'down')}
            />
          ))}
        </div>

        <button
          onClick={handleAddQuestion}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 font-medium hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center mb-12"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Add Another Question
        </button>

      </div>
    </div>
  );
};

export default QuizCreatePage;
