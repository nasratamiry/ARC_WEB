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
      <input
        id={id}
        type={type}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-arc-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/40 ${
          error ? 'border-red-400' : 'border-arc-border'
        }`}
        {...rest}
      />
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  )
}

export default TextInput

