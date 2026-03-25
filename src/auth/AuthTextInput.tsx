import { type ReactNode } from 'react'

type Props = {
  id: string
  label: string
  type?: 'text' | 'email' | 'password'
  value: string
  placeholder?: string
  error?: string | null
  icon?: ReactNode
  autoComplete?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  maxLength?: number
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
}

function AuthTextInput({
  id,
  label,
  type = 'text',
  value,
  placeholder,
  error,
  icon,
  autoComplete,
  inputMode,
  maxLength,
  onChange,
  required,
}: Props) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-arc-text">
        {label}
      </label>

      <div className={`relative rounded-xl border bg-white px-4 py-0.5 shadow-[0_10px_40px_-20px_rgba(0,34,51,0.08)] transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/35 ${error ? 'border-red-400' : 'border-arc-border'}`}>
        {icon ? (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" aria-hidden>
            {icon}
          </span>
        ) : null}

        <input
          id={id}
          name={id}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          onChange={onChange}
          required={required}
          className={`h-12 w-full bg-transparent text-sm text-arc-text outline-none ${
            icon ? 'pl-9' : ''
          }`}
        />
      </div>

      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </div>
  )
}

export default AuthTextInput

