import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  BookOpen, 
  Users, 
  FileText, 
  Tag, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';

const StudySessionForm = ({ courses, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    title: '',
    courseId: '',
    dateTime: '',
    location: '',
    description: '',
    maxParticipants: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Helper to check if a date is in the future
  const isFutureDate = (dateStr) => {
    if (!dateStr) return false;
    const selectedDate = new Date(dateStr);
    const now = new Date();
    return selectedDate > now;
  };

  // Field validation
  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'title':
        if (!value.trim()) {
          error = 'Title is required';
        } else if (value.trim().length < 5) {
          error = 'Title must be at least 5 characters long';
        }
        break;
      case 'courseId':
        if (!value) {
          error = 'Please select a course';
        }
        break;
      case 'dateTime':
        if (!value) {
          error = 'Date and time are required';
        } else if (!isFutureDate(value)) {
          error = 'Date and time must be in the future';
        }
        break;
      case 'location':
        if (!value.trim()) {
          error = 'Location is required';
        }
        break;
      case 'maxParticipants':
        if (value !== '') {
          const num = Number(value);
          if (isNaN(num) || num <= 0 || !Number.isInteger(num)) {
            error = 'Max participants must be a positive whole number';
          }
        }
        break;
      default:
        break;
    }
    return error;
  };

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  // Handle Input Blur
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);

    // If no errors, submit
    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    }
  };

  // Get current date string in format YYYY-MM-DDTHH:MM for min attribute
  const getMinDateTimeString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Title */}
      <div>
        <label htmlFor="session-title" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Tag className="w-4 h-4 text-amber-500" />
          Session Title <span className="text-rose-500 font-bold">*</span>
        </label>
        <div className="relative rounded-xl shadow-sm">
          <input
            type="text"
            id="session-title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
            placeholder="e.g., Midterm review for CSE-3106"
            className={`block w-full rounded-xl border px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
              errors.title && touched.title
                ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/20'
                : 'border-gray-200 focus:ring-amber-500 focus:border-amber-500 hover:border-gray-300'
            }`}
          />
        </div>
        {errors.title && touched.title && (
          <p className="mt-2 text-sm text-rose-600 flex items-center gap-1.5 animate-slide-up" id="error-title">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errors.title}
          </p>
        )}
      </div>

      {/* Course & Date/Time Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Course */}
        <div>
          <label htmlFor="session-course" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-500" />
            Course <span className="text-rose-500 font-bold">*</span>
          </label>
          <div className="relative">
            <select
              id="session-course"
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
              className={`block w-full rounded-xl border px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 transition-all appearance-none bg-white ${
                errors.courseId && touched.courseId
                  ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/20'
                  : 'border-gray-200 focus:ring-amber-500 focus:border-amber-500 hover:border-gray-300'
              }`}
            >
              <option value="">Select a Course</option>
              {courses.map((course) => (
                <option key={course.id || course._id} value={course.id || course._id}>
                  {course.code ? `${course.code} - ${course.name}` : course.name}
                </option>
              ))}
            </select>
            {/* Custom arrow for dropdown */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
          {errors.courseId && touched.courseId && (
            <p className="mt-2 text-sm text-rose-600 flex items-center gap-1.5 animate-slide-up" id="error-courseId">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errors.courseId}
            </p>
          )}
        </div>

        {/* Date & Time */}
        <div>
          <label htmlFor="session-datetime" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-500" />
            Date & Time <span className="text-rose-500 font-bold">*</span>
          </label>
          <input
            type="datetime-local"
            id="session-datetime"
            name="dateTime"
            min={getMinDateTimeString()}
            value={formData.dateTime}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
            className={`block w-full rounded-xl border px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 transition-all ${
              errors.dateTime && touched.dateTime
                ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/20'
                : 'border-gray-200 focus:ring-amber-500 focus:border-amber-500 hover:border-gray-300'
            }`}
          />
          {errors.dateTime && touched.dateTime && (
            <p className="mt-2 text-sm text-rose-600 flex items-center gap-1.5 animate-slide-up" id="error-dateTime">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errors.dateTime}
            </p>
          )}
        </div>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="session-location" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-amber-500" />
          Location <span className="text-rose-500 font-bold">*</span>
        </label>
        <input
          type="text"
          id="session-location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isLoading}
          placeholder="e.g., Library Room 204 or Online (Zoom link in description)"
          className={`block w-full rounded-xl border px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
            errors.location && touched.location
              ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/20'
              : 'border-gray-200 focus:ring-amber-500 focus:border-amber-500 hover:border-gray-300'
          }`}
        />
        {errors.location && touched.location && (
          <p className="mt-2 text-sm text-rose-600 flex items-center gap-1.5 animate-slide-up" id="error-location">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errors.location}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="session-description" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-500" />
          Description <span className="text-gray-400 text-xs font-normal">(Optional)</span>
        </label>
        <textarea
          id="session-description"
          name="description"
          rows="4"
          value={formData.description}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="Tell other students what you plan to cover, topics you want to discuss, or any preparation needed..."
          className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 hover:border-gray-300 transition-all resize-none"
        />
      </div>

      {/* Max Participants */}
      <div>
        <label htmlFor="session-max-participants" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-500" />
          Max Participants <span className="text-gray-400 text-xs font-normal">(Optional, leave blank for unlimited)</span>
        </label>
        <input
          type="number"
          id="session-max-participants"
          name="maxParticipants"
          min="1"
          value={formData.maxParticipants}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isLoading}
          placeholder="e.g., 5"
          className={`block w-full rounded-xl border px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
            errors.maxParticipants && touched.maxParticipants
              ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/20'
              : 'border-gray-200 focus:ring-amber-500 focus:border-amber-500 hover:border-gray-300'
          }`}
        />
        {errors.maxParticipants && touched.maxParticipants && (
          <p className="mt-2 text-sm text-rose-600 flex items-center gap-1.5 animate-slide-up" id="error-maxParticipants">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errors.maxParticipants}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          id="submit-session-btn"
          disabled={isLoading}
          className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl active:scale-[0.98] transition-all ${
            isLoading 
              ? 'bg-amber-400 cursor-not-allowed opacity-80' 
              : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/20'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating Session...
            </>
          ) : (
            'Post Study Session'
          )}
        </button>
      </div>
    </form>
  );
};

export default StudySessionForm;
