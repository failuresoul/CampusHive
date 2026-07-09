import React from 'react';
import { Calendar } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * DatePickerField
 * A styled date <input type="date"> wrapper that matches the existing
 * InputField design system.
 *
 * Props:
 *   label     – visible label text
 *   id        – ties the <label> to the <input>
 *   error     – validation error string (shown in red below the field)
 *   className – optional extra wrapper classes
 *   min/max   – optional ISO date strings for range restriction
 *   ...props  – passed directly to <input> (value, onChange, disabled, etc.)
 */
const DatePickerField = React.forwardRef(
  ({ label, id, error, className, ...props }, ref) => {
    return (
      <div className={cn('w-full', className)}>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type="date"
            className={cn(
              'input-field pr-10',
              // Show placeholder colour when no value is selected
              !props.value && 'text-gray-400',
              error && 'input-error'
            )}
            {...props}
          />
          {/* Calendar icon – decorative, pointer-events disabled */}
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
            <Calendar className="h-4 w-4" aria-hidden="true" />
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

DatePickerField.displayName = 'DatePickerField';

export default DatePickerField;
