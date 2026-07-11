import React, { useState } from 'react';
import { Loader2, RotateCcw, BookOpen, CheckCircle2, AlertCircle } from 'lucide-react';
import InputField from '../auth/InputField';
import SelectField from '../shared/SelectField';

// ─── Static Department Options ────────────────────────────────────────────────
const DEPARTMENT_OPTIONS = [
  { value: 'CSE',  label: 'Computer Science & Engineering (CSE)' },
  { value: 'EEE',  label: 'Electrical & Electronic Engineering (EEE)' },
  { value: 'ME',   label: 'Mechanical Engineering (ME)' },
  { value: 'CE',   label: 'Civil Engineering (CE)' },
  { value: 'BBA',  label: 'Business Administration (BBA)' },
  { value: 'ENG',  label: 'English (ENG)' },
];

// ─── Validation ───────────────────────────────────────────────────────────────
function validate(data) {
  const errors = {};

  // Course Code: e.g. "CSE-3106"
  const codePattern = /^[A-Z]{2,5}-\d{3,4}$/;
  if (!data.code.trim()) {
    errors.code = 'Course code is required.';
  } else if (!codePattern.test(data.code.trim().toUpperCase())) {
    errors.code = 'Invalid course code pattern. Must be like CSE-3106 or MAT-101.';
  }

  // Course Title
  if (!data.title.trim()) {
    errors.title = 'Course title is required.';
  }

  // Department
  if (!data.department) {
    errors.department = 'Department is required.';
  }

  // Credit Hours (1 to 5)
  if (!data.creditHours) {
    errors.creditHours = 'Credit hours is required.';
  } else {
    const credits = Number(data.creditHours);
    if (isNaN(credits) || credits < 1 || credits > 5) {
      errors.creditHours = 'Credit hours must be a number between 1 and 5.';
    }
  }

  // Semester/Batch applicability
  if (!data.applicability.trim()) {
    errors.applicability = 'Semester/Batch applicability is required.';
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
}

// ─── Initial Form State ───────────────────────────────────────────────────────
const INITIAL_STATE = {
  code: '',
  title: '',
  department: '',
  creditHours: '',
  applicability: '',
  description: '',
};

// ─── Inline Toast Component ───────────────────────────────────────────────────
function Toast({ type, message, onDismiss }) {
  if (!message) return null;

  const isSuccess = type === 'success';
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 rounded-xl border text-sm animate-slide-up ${
        isSuccess
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : 'bg-red-50 border-red-200 text-red-800'
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
      ) : (
        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
      )}
      <p className="flex-1">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="text-current opacity-60 hover:opacity-100 transition-opacity focus:outline-none ml-2"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}

// ─── Main CourseForm ──────────────────────────────────────────────────────────
const CourseForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear per-field error on user interaction
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_STATE);
    setErrors({});
    setToast({ type: '', message: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setToast({ type: '', message: '' });

    const { errors: newErrors, isValid } = validate(formData);
    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    // TODO: connect to POST /api/courses in Story 11
    console.log('Form submitted successfully. Payload:', {
      code: formData.code.trim().toUpperCase(),
      title: formData.title.trim(),
      department: formData.department,
      creditHours: Number(formData.creditHours),
      applicability: formData.applicability.trim(),
      description: formData.description.trim(),
    });

    // Simulate backend response delay
    setTimeout(() => {
      setIsLoading(false);
      setToast({
        type: 'success',
        message: 'Course created successfully (Simulated)!',
      });
      setFormData(INITIAL_STATE);
      setErrors({});
      onSuccess?.();
    }, 1500);
  };

  return (
    <form
      id="create-course-form"
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6"
      aria-label="Create Course Form"
    >
      {/* Toast Notification */}
      <Toast
        type={toast.type}
        message={toast.message}
        onDismiss={() => setToast({ type: '', message: '' })}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Course Code */}
        <InputField
          label="Course Code"
          id="course-code"
          name="code"
          type="text"
          placeholder="e.g. CSE-3106"
          value={formData.code}
          onChange={handleChange}
          error={errors.code}
          disabled={isLoading}
          aria-required="true"
          aria-describedby={errors.code ? 'course-code-error' : undefined}
        />

        {/* Course Title */}
        <InputField
          label="Course Title"
          id="course-title"
          name="title"
          type="text"
          placeholder="e.g. Software Engineering"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          disabled={isLoading}
          aria-required="true"
          aria-describedby={errors.title ? 'course-title-error' : undefined}
        />

        {/* Department Select Dropdown */}
        <SelectField
          label="Department"
          id="course-department"
          name="department"
          options={DEPARTMENT_OPTIONS}
          placeholder="Select department"
          value={formData.department}
          onChange={handleChange}
          error={errors.department}
          disabled={isLoading}
          aria-required="true"
          aria-describedby={errors.department ? 'course-department-error' : undefined}
        />

        {/* Credit Hours */}
        <InputField
          label="Credit Hours"
          id="course-credits"
          name="creditHours"
          type="number"
          min="1"
          max="5"
          placeholder="e.g. 3"
          value={formData.creditHours}
          onChange={handleChange}
          error={errors.creditHours}
          disabled={isLoading}
          aria-required="true"
          aria-describedby={errors.creditHours ? 'course-credits-error' : undefined}
        />

        {/* Semester / Batch Applicability */}
        <InputField
          label="Semester / Batch Applicability"
          id="course-applicability"
          name="applicability"
          type="text"
          placeholder="e.g. 2023-2024"
          value={formData.applicability}
          onChange={handleChange}
          error={errors.applicability}
          disabled={isLoading}
          aria-required="true"
          aria-describedby={errors.applicability ? 'course-applicability-error' : undefined}
          className="sm:col-span-2"
        />

        {/* Course Description */}
        <div className="w-full sm:col-span-2">
          <label htmlFor="course-description" className="block text-sm font-medium text-gray-700 mb-1.5">
            Description <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="course-description"
            name="description"
            rows="4"
            placeholder="Provide a brief description of the course content, prerequisites, and learning objectives..."
            value={formData.description}
            onChange={handleChange}
            disabled={isLoading}
            className="input-field min-h-[100px] py-2 resize-none"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2 border-t border-gray-100">
        <button
          id="course-form-cancel-btn"
          type="button"
          onClick={onCancel ?? handleReset}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 flex-1 sm:flex-none sm:min-w-[140px] px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          {onCancel ? 'Cancel' : 'Reset Form'}
        </button>

        <button
          id="course-form-submit-btn"
          type="submit"
          disabled={isLoading}
          className="flex items-center justify-center gap-2 flex-1 sm:flex-none sm:min-w-[160px] px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Creating…
            </>
          ) : (
            <>
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              Create Course
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default CourseForm;
