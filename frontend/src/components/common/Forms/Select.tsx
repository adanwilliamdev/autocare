"use client"

import { forwardRef, SelectHTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  required?: boolean
  options: SelectOption[]
  placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, required, className, options, placeholder, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-graphite-700">
          {label} {required && <span className="text-rust-500">*</span>}
        </label>
        <select
          ref={ref}
          className={clsx(
            'input-field',
            error && 'border-rust-400 focus:ring-rust-400/40 focus:border-rust-400',
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="text-sm text-rust-500">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select
