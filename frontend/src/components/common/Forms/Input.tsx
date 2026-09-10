import { forwardRef, InputHTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  required?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, required, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-graphite-700">
          {label} {required && <span className="text-rust-500">*</span>}
        </label>
        <input
          ref={ref}
          className={clsx(
            'input-field',
            error && 'border-rust-400 focus:ring-rust-400/40 focus:border-rust-400',
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-rust-500">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input