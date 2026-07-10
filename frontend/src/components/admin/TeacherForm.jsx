import React, { useState, useCallback } from 'react';
import {
  Loader2,
  RotateCcw,
  UserPlus,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Lock,
  Copy,
  Check,
  GraduationCap,
  Mail,
  Building2,
  BadgeCheck,
} from 'lucide-react';

// Shared / Auth components
import InputField from '../auth/InputField';
import SelectField from '../shared/SelectField';

// Context + Service
import { useAuth } from '../../context/AuthContext';
import { registerTeacher } from '../../services/teacherService';

// Utilities
import { generatePassword } from '../../utils/passwordGenerator';

// ─── Static option lists ──────────────────────────────────────────────────────

/** Must stay in sync with the department list used in StudentForm */
const DEPARTMENT_OPTIONS = [
  { value: 'CSE', label: 'Computer Science & Engineering (CSE)' },
  { value: 'EEE', label: 'Electrical & Electronic Engineering (EEE)' },
  { value: 'ME',  label: 'Mechanical Engineering (ME)' },
  { value: 'CE',  label: 'Civil Engineering (CE)' },
  { value: 'BBA', label: 'Business Administration (BBA)' },
  { value: 'ENG', label: 'English (ENG)' },
];

const DESIGNATION_OPTIONS = [
  { value: 'Lecturer',             label: 'Lecturer' },
  { value: 'Assistant Professor',  label: 'Assistant Professor' },
  { value: 'Associate Professor',  label: 'Associate Professor' },
  { value: 'Professor',            label: 'Professor' },
];

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(data) {
  const errors = {};

  if (!data.name.trim()) {
    errors.name = 'Full name is required.';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Full name must be at least 2 characters.';
  }

  if (!data.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!data.department) {
    errors.department = 'Please select a department.';
  }

  if (!data.designation) {
    errors.designation = 'Please select a designation.';
  }

  if (data.phone.trim()) {
    if (!/^\+?[0-9]{7,15}$/.test(data.phone.replace(/[\s\-()]/g, ''))) {
      errors.phone = 'Please enter a valid phone number (7–15 digits).';
    }
  }

  if (!data.password) {
    errors.password = 'A temporary password is required.';
  } else if (data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
}

// ─── Initial form state ───────────────────────────────────────────────────────

const buildInitialState = () => ({
  name:        '',
  email:       '',
  department:  '',
  designation: '',
  phone:       '',
  password:    generatePassword(),
});

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
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
}

// ─── Copy-to-clipboard button ─────────────────────────────────────────────────

function CopyButton({ value, label }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API blocked — silently ignore
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md text-indigo-600 hover:bg-indigo-50 border border-indigo-200 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      aria-label={`Copy ${label}`}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-500" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          Copy
        </>
      )}
    </button>
  );
}

// ─── Credential Card (shown after successful registration) ────────────────────

function CredentialCard({ teacher, tempPassword, onRegisterAnother }) {
  return (
    <div className="space-y-6 animate-slide-up" role="region" aria-label="Registration successful">
      {/* Success header */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
        <CheckCircle2 className="h-6 w-6 text-emerald-500 flex-shrink-0" />
        <div>
          <p className="font-semibold text-emerald-800">Teacher registered successfully!</p>
          <p className="text-xs text-emerald-600 mt-0.5">
            Share the credentials below with the teacher so they can log in.
          </p>
        </div>
      </div>

      {/* Credential details */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Login Credentials to Share
          </h3>
        </div>

        <div className="divide-y divide-gray-100">
          {/* Name */}
          <div className="flex items-center gap-3 px-4 py-3">
            <GraduationCap className="h-4 w-4 text-indigo-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400">Full Name</p>
              <p className="text-sm font-medium text-gray-900 truncate">{teacher.name}</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-3 px-4 py-3">
            <Mail className="h-4 w-4 text-indigo-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400">Login Email</p>
              <p className="text-sm font-medium text-gray-900 truncate">{teacher.email}</p>
            </div>
            <CopyButton value={teacher.email} label="email" />
          </div>

          {/* Temp password */}
          <div className="flex items-center gap-3 px-4 py-3 bg-amber-50">
            <Lock className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-amber-600 font-medium">Temporary Password</p>
              <p className="text-sm font-mono font-semibold text-amber-900 tracking-wider break-all">
                {tempPassword}
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                ⚠ Share securely — the teacher must change this on first login.
              </p>
            </div>
            <CopyButton value={tempPassword} label="password" />
          </div>

          {/* Department + Designation */}
          <div className="flex items-center gap-3 px-4 py-3">
            <Building2 className="h-4 w-4 text-indigo-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400">Department · Designation</p>
              <p className="text-sm font-medium text-gray-900">
                {teacher.department} · {teacher.designation}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          id="teacher-register-another-btn"
          type="button"
          onClick={onRegisterAnother}
          className="flex items-center justify-center gap-2 flex-1 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-all duration-200"
        >
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          Register Another Teacher
        </button>
      </div>
    </div>
  );
}

// ─── Password field with regenerate button ────────────────────────────────────

function PasswordField({ value, onChange, onRegenerate, error, disabled }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full sm:col-span-2">
      <label
        htmlFor="teacher-password"
        className="block text-sm font-medium text-gray-700 mb-1.5"
      >
        Temporary Password
      </label>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
            <Lock className="h-4 w-4" aria-hidden="true" />
          </span>
          <input
            id="teacher-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={value}
            onChange={onChange}
            disabled={disabled}
            autoComplete="new-password"
            aria-required="true"
            aria-describedby={error ? 'teacher-password-error' : 'teacher-password-hint'}
            className={`input-field pl-9 pr-10 font-mono tracking-wide ${
              error ? 'input-error' : ''
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-2 flex items-center px-1 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>

        <button
          id="teacher-password-regen-btn"
          type="button"
          onClick={onRegenerate}
          disabled={disabled}
          title="Generate a new password"
          className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex-shrink-0"
          aria-label="Regenerate suggested password"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Regenerate</span>
        </button>
      </div>

      {error ? (
        <p id="teacher-password-error" className="mt-1.5 text-sm text-red-600 animate-fade-in" role="alert">
          {error}
        </p>
      ) : (
        <p id="teacher-password-hint" className="mt-1.5 text-xs text-gray-400">
          Auto-generated strong password. You may edit it or click <strong>Regenerate</strong> for a
          new suggestion. The teacher will use this to log in initially.
        </p>
      )}
    </div>
  );
}

// ─── Main TeacherForm ─────────────────────────────────────────────────────────

/**
 * TeacherForm
 *
 * Registration form for adding a new teacher (admin-only).
 * On successful submission, replaces the form with a CredentialCard
 * showing the teacher's login email and temporary password for the admin
 * to share out-of-band. A "Register Another" button resets the form.
 *
 * Wired to POST /api/teachers (Story 8).
 */
const TeacherForm = ({ onSuccess, onCancel }) => {
  const { token } = useAuth();

  const [formData, setFormData]   = useState(buildInitialState);
  const [errors, setErrors]       = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState('');

  // Credential card state — set after a successful API call
  const [confirmed, setConfirmed] = useState(null); // { teacher, tempPassword }

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleRegenerate = useCallback(() => {
    const newPassword = generatePassword();
    setFormData((prev) => ({ ...prev, password: newPassword }));
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: '' }));
    }
  }, [errors.password]);

  const handleReset = () => {
    setFormData(buildInitialState());
    setErrors({});
    setErrorBanner('');
    setConfirmed(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorBanner('');

    const { errors: newErrors, isValid } = validate(formData);
    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name:        formData.name.trim(),
        email:       formData.email.trim().toLowerCase(),
        department:  formData.department,
        designation: formData.designation,
        phone:       formData.phone.trim(),
        password:    formData.password,
      };

      const teacher = await registerTeacher(payload, token);

      // Store confirmed data — switches to the CredentialCard view
      setConfirmed({ teacher, tempPassword: formData.password });
      onSuccess?.();
    } catch (err) {
      const responseData = err?.response?.data;

      // Field-level errors from the server (validation / duplicate email)
      if (responseData?.errors && typeof responseData.errors === 'object') {
        setErrors((prev) => ({ ...prev, ...responseData.errors }));
      }

      // Banner message for anything not tied to a single field
      const bannerMsg =
        responseData?.message ||
        err?.message ||
        'Something went wrong. Please try again.';

      // Only show the banner when there are no field-level errors to surface
      if (!responseData?.errors) {
        setErrorBanner(bannerMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Credential card view ──────────────────────────────────────────────────

  if (confirmed) {
    return (
      <CredentialCard
        teacher={confirmed.teacher}
        tempPassword={confirmed.tempPassword}
        onRegisterAnother={handleReset}
      />
    );
  }

  // ── Form view ─────────────────────────────────────────────────────────────

  return (
    <form
      id="add-teacher-form"
      onSubmit={handleSubmit}
      noValidate
      className="space-y-8"
      aria-label="Add Teacher Form"
    >
      {/* Error banner */}
      <Toast
        type="error"
        message={errorBanner}
        onDismiss={() => setErrorBanner('')}
      />

      {/* ── Section: Personal Information ─────────────────────────────── */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Full Name"
            id="teacher-name"
            name="name"
            type="text"
            placeholder="e.g. Dr. Karim Hossain"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            disabled={isLoading}
            autoComplete="name"
            aria-required="true"
            aria-describedby={errors.name ? 'teacher-name-error' : undefined}
            className="sm:col-span-2"
          />

          <InputField
            label="Email Address"
            id="teacher-email"
            name="email"
            type="email"
            placeholder="e.g. karim@university.edu"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            disabled={isLoading}
            autoComplete="email"
            aria-required="true"
            aria-describedby={errors.email ? 'teacher-email-error' : undefined}
          />

          <InputField
            label={
              <span>
                Phone Number{' '}
                <span className="text-gray-400 font-normal">(optional)</span>
              </span>
            }
            id="teacher-phone"
            name="phone"
            type="tel"
            placeholder="e.g. 01712345678"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            disabled={isLoading}
            autoComplete="tel"
            aria-describedby={errors.phone ? 'teacher-phone-error' : undefined}
          />
        </div>
      </div>

      {/* ── Section: Academic Information ──────────────────────────────── */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          Academic Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label="Department"
            id="teacher-department"
            name="department"
            options={DEPARTMENT_OPTIONS}
            placeholder="Select department"
            value={formData.department}
            onChange={handleChange}
            error={errors.department}
            disabled={isLoading}
            aria-required="true"
            aria-describedby={errors.department ? 'teacher-department-error' : undefined}
          />

          <SelectField
            label="Designation"
            id="teacher-designation"
            name="designation"
            options={DESIGNATION_OPTIONS}
            placeholder="Select designation"
            value={formData.designation}
            onChange={handleChange}
            error={errors.designation}
            disabled={isLoading}
            aria-required="true"
            aria-describedby={errors.designation ? 'teacher-designation-error' : undefined}
          />
        </div>
      </div>

      {/* ── Section: Login Credentials ──────────────────────────────────── */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          Login Credentials
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PasswordField
            value={formData.password}
            onChange={handleChange}
            onRegenerate={handleRegenerate}
            error={errors.password}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* ── Actions ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2 border-t border-gray-100">
        <button
          id="teacher-form-reset-btn"
          type="button"
          onClick={onCancel ?? handleReset}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 flex-1 sm:flex-none sm:min-w-[140px] px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          {onCancel ? 'Cancel' : 'Reset Form'}
        </button>

        <button
          id="teacher-form-submit-btn"
          type="submit"
          disabled={isLoading}
          className="flex items-center justify-center gap-2 flex-1 sm:flex-none sm:min-w-[180px] px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Registering…
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Register Teacher
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default TeacherForm;
