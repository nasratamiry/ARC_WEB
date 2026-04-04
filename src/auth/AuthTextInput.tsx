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

      <div className={`group arc-input-shell ${error ? 'error' : ''}`.trim()}>
        {icon ? (
          <span className="absolute left-4 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-slate-400 transition-colors duration-300 group-focus-within:text-primary" aria-hidden>
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
          className={`arc-input-element ${
            icon ? 'pl-10' : ''
          }`}
        />
      </div>

      {error ? <p className="mt-2 text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  )
}

export default AuthTextInput

