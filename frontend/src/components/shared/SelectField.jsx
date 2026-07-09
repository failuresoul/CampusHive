import React from 'react';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * SelectField
 * A styled <select> wrapper that matches the existing InputField design.
 *
 * Props:
 *   label       – visible label text
 *   id          – ties the <label> to the <select>
 *   options     – array of { value, label } objects
 *   error       – validation error string (shown in red below the field)
 *   placeholder – first disabled option (default: "Select an option")
 *   className   – optional extra wrapper classes
 *   ...props    – passed directly to <select> (value, onChange, disabled, etc.)
 */
const SelectField = React.forwardRef(
  ({ label, id, options = [], error, placeholder = 'Select an option', className, ...props }, ref) => {
    return (
      <div className={cn('w-full', className)}>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={id}
            className={cn(
              'input-field appearance-none pr-10 cursor-pointer',
              error && 'input-error',
              // Dim colour when the placeholder (empty value) is selected
              !props.value && 'text-gray-400'
            )}
            {...props}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="text-gray-900">
                {opt.label}
              </option>
            ))}
          </select>

          {/* Custom chevron icon */}
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>

        {error && (
          <p className="mt-1.5 text-sm text-red-600 animate-fade-in" id={`${id}-error`} role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

SelectField.displayName = 'SelectField';

export default SelectField;
