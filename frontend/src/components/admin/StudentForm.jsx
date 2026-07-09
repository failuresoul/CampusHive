import React, { useState } from 'react';
import { Loader2, RotateCcw, UserPlus, Hash, CheckCircle2, AlertCircle } from 'lucide-react';

// Shared / Auth components
import InputField from '../auth/InputField';
import SelectField from '../shared/SelectField';
import DatePickerField from '../shared/DatePickerField';

// ─── Static option lists ──────────────────────────────────────────────────────

const DEPARTMENT_OPTIONS = [
  { value: 'CSE',  label: 'Computer Science & Engineering (CSE)' },
  { value: 'EEE',  label: 'Electrical & Electronic Engineering (EEE)' },
  { value: 'ME',   label: 'Mechanical Engineering (ME)' },
  { value: 'CE',   label: 'Civil Engineering (CE)' },
  { value: 'BBA',  label: 'Business Administration (BBA)' },
  { value: 'ENG',  label: 'English (ENG)' },
];

const BATCH_OPTIONS = [
  { value: '2020-2021', label: '2020–2021' },
  { value: '2021-2022', label: '2021–2022' },
  { value: '2022-2023', label: '2022–2023' },
  { value: '2023-2024', label: '2023–2024' },
  { value: '2024-2025', label: '2024–2025' },
  { value: '2025-2026', label: '2025–2026' },
];

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * Validates the student form fields.
 * @param {Object} data – current form state
 * @returns {{ errors: Object, isValid: boolean }}
 */
function validate(data) {
  const errors = {};

  // Full name
  if (!data.name.trim()) {
    errors.name = 'Full name is required.';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Full name must be at least 2 characters.';
  }

  // Email
  if (!data.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  // Date of birth (required)
  if (!data.dob) {
    errors.dob = 'Date of birth is required.';
  }

  // Department
  if (!data.department) {
    errors.department = 'Please select a department / program.';
  }

  // Batch / Session
  if (!data.batch) {
    errors.batch = 'Please select a batch / session.';
  }

  // Phone – optional but validated if provided
  if (data.phone.trim()) {
    // Accepts formats: +8801XXXXXXXXX, 01XXXXXXXXX, or international +XX…
    if (!/^\+?[0-9]{7,15}$/.test(data.phone.replace(/[\s\-()]/g, ''))) {
      errors.phone = 'Please enter a valid phone number (7–15 digits).';
    }
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
}

// ─── Initial form state ───────────────────────────────────────────────────────

const INITIAL_STATE = {
  name: '',
  email: '',
  dob: '',
  department: '',
  batch: '',
  phone: '',
};

// ─── Toast Banner ─────────────────────────────────────────────────────────────

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

// ─── Main StudentForm ─────────────────────────────────────────────────────────

/**
 * StudentForm
 *
 * A production-ready form for registering a new student.
 * All fields are validated client-side; submission is stubbed until
 * Story 2 (roll number generation) and the backend POST /api/students
 * endpoint are available.
 *
 * Expected payload shape (for Story 2 & Story 4 backend integration):
 * {
 *   name:       string   // student's full name
 *   email:      string   // used as login credential
 *   dob:        string   // ISO date string "YYYY-MM-DD"
 *   department: string   // e.g. "CSE" | "EEE" | "ME" | "CE" | "BBA" | "ENG"
 *   batch:      string   // e.g. "2023-2024"
 *   phone:      string   // optional; digits only after stripping formatting
 * }
 * Roll number will be added by the backend (Story 2) upon creation.
 */
const StudentForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [errors, setErrors]     = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast]       = useState({ type: '', message: '' });

  // ── Handlers ───────────────────────────────────────────────────────────────

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToast({ type: '', message: '' });

    const { errors: newErrors, isValid } = validate(formData);
    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      // ─────────────────────────────────────────────────────────────────────
      // TODO: connect to POST /api/students once Story 2 (roll number) and
      //       the backend (Story 4) are ready.
      //
      // Payload shape:
      //   { name, email, dob, department, batch, phone }
      // ─────────────────────────────────────────────────────────────────────

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // eslint-disable-next-line no-console
      console.log('[StudentForm] Form submitted (stub). Payload:', {
        name:       formData.name.trim(),
        email:      formData.email.trim().toLowerCase(),
        dob:        formData.dob,
        department: formData.department,
        batch:      formData.batch,
        phone:      formData.phone.trim(),
      });

      setToast({
        type: 'success',
        message:
          'Student registered successfully! (Stub — no backend call was made. Roll number will be assigned in Story 2.)',
      });

      // Optionally notify parent and reset
      onSuccess?.();
      setFormData(INITIAL_STATE);
      setErrors({});
    } catch (err) {
      setToast({
        type: 'error',
        message: err?.message ?? 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <form
      id="add-student-form"
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6"
      aria-label="Add Student Form"
    >
      {/* Toast / Banner */}
      <Toast
        type={toast.type}
        message={toast.message}
        onDismiss={() => setToast({ type: '', message: '' })}
      />

      {/* ── Section: Personal Information ─────────────────────────────── */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Full Name"
            id="student-name"
            name="name"
            type="text"
            placeholder="e.g. Ayesha Rahman"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            disabled={isLoading}
            autoComplete="name"
            aria-required="true"
            aria-describedby={errors.name ? 'student-name-error' : undefined}
            className="sm:col-span-2"
          />

          <InputField
            label="Email Address"
            id="student-email"
            name="email"
            type="email"
            placeholder="e.g. ayesha@university.edu"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            disabled={isLoading}
            autoComplete="email"
            aria-required="true"
            aria-describedby={errors.email ? 'student-email-error' : undefined}
          />

          <DatePickerField
            label="Date of Birth"
            id="student-dob"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            error={errors.dob}
            disabled={isLoading}
            max={new Date().toISOString().split('T')[0]}
            aria-required="true"
            aria-describedby={errors.dob ? 'student-dob-error' : undefined}
          />

          <InputField
            label={
              <span>
                Phone Number{' '}
                <span className="text-gray-400 font-normal">(optional)</span>
              </span>
            }
            id="student-phone"
            name="phone"
            type="tel"
            placeholder="e.g. 01712345678"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            disabled={isLoading}
            autoComplete="tel"
            aria-describedby={errors.phone ? 'student-phone-error' : undefined}
          />
        </div>
      </div>

      {/* ── Section: Academic Information ─────────────────────────────── */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          Academic Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label="Department / Program"
            id="student-department"
            name="department"
            options={DEPARTMENT_OPTIONS}
            placeholder="Select department"
            value={formData.department}
            onChange={handleChange}
            error={errors.department}
            disabled={isLoading}
            aria-required="true"
            aria-describedby={errors.department ? 'student-department-error' : undefined}
          />

          <SelectField
            label="Batch / Session"
            id="student-batch"
            name="batch"
            options={BATCH_OPTIONS}
            placeholder="Select batch"
            value={formData.batch}
            onChange={handleChange}
            error={errors.batch}
            disabled={isLoading}
            aria-required="true"
            aria-describedby={errors.batch ? 'student-batch-error' : undefined}
          />
        </div>
      </div>

      {/* ── Roll Number (read-only) ─────────────────────────────────────── */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          System Generated
        </h3>
        <div className="relative">
          <label
            htmlFor="student-roll"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Roll Number
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-300">
              <Hash className="h-4 w-4" aria-hidden="true" />
            </span>
            <input
              id="student-roll"
              name="rollNumber"
              type="text"
              readOnly
              disabled
              value=""
              placeholder="Will be generated automatically"
              className="input-field pl-9 bg-gray-50 text-gray-400 cursor-not-allowed select-none"
              aria-readonly="true"
              aria-label="Roll number — will be auto-generated by the system"
            />
          </div>
          <p className="mt-1.5 text-xs text-gray-400 flex items-center gap-1">
            <span
              className="inline-block h-2 w-2 rounded-full bg-amber-400 animate-pulse"
              aria-hidden="true"
            />
            Auto-assigned upon registration (Story 2)
          </p>
        </div>
      </div>

      {/* ── Actions ────────────────────────────────────────────────────── */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2 border-t border-gray-100">
        {/* Cancel / Reset */}
        <button
          id="student-form-reset-btn"
          type="button"
          onClick={onCancel ?? handleReset}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 flex-1 sm:flex-none sm:min-w-[140px] px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          {onCancel ? 'Cancel' : 'Reset Form'}
        </button>

        {/* Submit */}
        <button
          id="student-form-submit-btn"
          type="submit"
          disabled={isLoading}
          className="flex items-center justify-center gap-2 flex-1 sm:flex-none sm:min-w-[160px] px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Registering…
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Register Student
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default StudentForm;
