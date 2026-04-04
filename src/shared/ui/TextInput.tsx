import type { InputHTMLAttributes } from 'react'

type Props = {
  label: string
  error?: string | null
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'className'>

function TextInput({ id, label, error, type = 'text', ...rest }: Props) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-arc-text">
        {label}
      </label>
      <div className={`group arc-input-shell ${error ? 'error' : ''}`.trim()}>
        <div className="arc-input-focus-line" aria-hidden>
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/65 to-transparent" />
        </div>
        <input
          id={id}
          type={type}
          className="arc-input-element"
          {...rest}
        />
      </div>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  )
}

export default TextInput

