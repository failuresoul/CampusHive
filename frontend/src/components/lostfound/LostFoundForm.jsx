import React, { useState } from 'react';
import { Info, Loader2, CheckCircle2 } from 'lucide-react';
import SelectField from '../shared/SelectField';
import DatePickerField from '../shared/DatePickerField';
import PhotoUploadPreview from './PhotoUploadPreview';

const CATEGORY_OPTIONS = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'books', label: 'Books' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'id_cards', label: 'ID/Cards' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'other', label: 'Other' },
];

const LostFoundForm = ({ onCancel }) => {
  // Form State
  const [type, setType] = useState('lost'); // 'lost' or 'found'
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  
  // Image State
  const [file, setFile] = useState(null);
  const [imageError, setImageError] = useState(null);

  // Validation / UI States
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Item title is required.';
    }

    if (!category) {
      newErrors.category = 'Please select a category.';
    }

    if (!location.trim()) {
      newErrors.location = `Location where the item was ${type === 'lost' ? 'lost' : 'found'} is required.`;
    }

    if (!date) {
      newErrors.date = 'Date is required.';
    } else if (new Date(date) > new Date()) {
      newErrors.date = 'Date cannot be in the future.';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required.';
    }

    if (imageError) {
      newErrors.image = imageError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Prepare report data
    const reportData = {
      type,
      title,
      category,
      location,
      date,
      description,
      photo: file, // File object reference or null
      submittedAt: new Date().toISOString()
    };

    // TODO: connect to POST /api/lost-found-items in Story 2 (multipart/form-data for the photo)
    console.log('Submitted Lost/Found Item Report:', reportData);

    // Simulate submission loading state for 1.5 seconds
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  const handleReset = () => {
    setType('lost');
    setTitle('');
    setCategory('');
    setLocation('');
    setDate('');
    setDescription('');
    setFile(null);
    setImageError(null);
    setErrors({});
    setIsSuccess(false);
  };

  if (isSuccess) {
    return (
      <div className="text-center py-10 px-4 animate-slide-up">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted!</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Your {type === 'lost' ? 'lost item' : 'found item'} report has been successfully posted. Other users can now search for it and contact you.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
          >
            Post Another Report
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type Toggle Selector */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          What would you like to report?
        </label>
        <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1.5 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setType('lost');
              setErrors((prev) => ({ ...prev, location: '' })); // clear type-specific error if toggled
            }}
            className={`py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${
              type === 'lost'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            I Lost Something
          </button>
          <button
            type="button"
            onClick={() => {
              setType('found');
              setErrors((prev) => ({ ...prev, location: '' })); // clear type-specific error if toggled
            }}
            className={`py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${
              type === 'found'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            I Found Something
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Item Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Item Name/Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
            }}
            className={`input-field ${errors.title ? 'input-error' : ''}`}
            placeholder="e.g. Red Water Bottle, Black Leather Wallet"
            disabled={isSubmitting}
          />
          {errors.title && (
            <p className="mt-1.5 text-sm text-red-600 animate-fade-in" id="title-error" role="alert">
              {errors.title}
            </p>
          )}
        </div>

        {/* Category */}
        <SelectField
          label="Category *"
          id="category"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            if (errors.category) setErrors((prev) => ({ ...prev, category: '' }));
          }}
          options={CATEGORY_OPTIONS}
          error={errors.category}
          placeholder="Select a category"
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-1.5">
            {type === 'lost' ? 'Where was it lost?' : 'Where was it found?'} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              if (errors.location) setErrors((prev) => ({ ...prev, location: '' }));
            }}
            className={`input-field ${errors.location ? 'input-error' : ''}`}
            placeholder={type === 'lost' ? 'e.g. Science Library, Room 302' : 'e.g. Student Center Cafeteria'}
            disabled={isSubmitting}
          />
          {errors.location && (
            <p className="mt-1.5 text-sm text-red-600 animate-fade-in" id="location-error" role="alert">
              {errors.location}
            </p>
          )}
        </div>

        {/* Date */}
        <DatePickerField
          label={type === 'lost' ? 'When was it lost? *' : 'When was it found? *'}
          id="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            if (errors.date) setErrors((prev) => ({ ...prev, date: '' }));
          }}
          max={today}
          error={errors.date}
          disabled={isSubmitting}
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
          }}
          className={`input-field resize-none ${errors.description ? 'input-error' : ''}`}
          placeholder={
            type === 'lost'
              ? 'Provide details such as color, brand, size, key distinguishing features, or contents (for bags/wallets).'
              : 'Provide details like color, brand, and general state. Note: you can omit some details (e.g. exact contents) to verify ownership when claimants reach out.'
          }
          disabled={isSubmitting}
        />
        {errors.description && (
          <p className="mt-1.5 text-sm text-red-600 animate-fade-in" id="description-error" role="alert">
            {errors.description}
          </p>
        )}
      </div>

      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Item Photo <span className="text-gray-400 font-normal">(Optional but recommended)</span>
        </label>
        <PhotoUploadPreview
          file={file}
          setFile={(newFile) => {
            setFile(newFile);
            if (errors.image) setErrors((prev) => ({ ...prev, image: '' }));
          }}
          error={imageError}
          setError={setImageError}
        />
      </div>

      {/* Contact preference info block */}
      <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-primary-850">
          <p className="font-semibold mb-0.5 text-primary-900">Contact Preference</p>
          <p className="text-primary-700 leading-relaxed">
            Other campus members will contact you directly through the platform messaging system. Your personal email and phone number are kept private.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-4 border-t border-gray-200 flex flex-col-reverse sm:flex-row justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto min-w-[140px] px-6 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm hover:shadow transition-all duration-200 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Posting...</span>
            </>
          ) : (
            <span>Post Report</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default LostFoundForm;
