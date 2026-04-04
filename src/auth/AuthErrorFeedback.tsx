import { ApiError } from '../services/api'
import { Button } from '../shared/ui'

type Props = {
  error: ApiError | null
  fallbackMessage?: string | null
  onRetry?: () => void
  retryDisabled?: boolean
}

const getDebugLabel = (error: ApiError): 'Network Error' | 'Server Error' | 'Auth Error' => {
  if (error.kind === 'network' || error.kind === 'timeout') return 'Network Error'
  if (error.kind === 'auth') return 'Auth Error'
  return 'Server Error'
}

function AuthErrorFeedback({ error, fallbackMessage = null, onRetry, retryDisabled = false }: Props) {
  if (!error && !fallbackMessage) return null

  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-700" role="alert">
      {error?.message ?? fallbackMessage}

      {import.meta.env.DEV && error ? (
        <div className="mt-2 inline-flex rounded-full border border-red-300/60 bg-white/60 px-2 py-0.5 text-[11px] font-semibold text-red-700">
          {getDebugLabel(error)}
        </div>
      ) : null}

      {error?.canRetry && onRetry ? (
        <div className="mt-3">
          <Button type="button" variant="secondary" size="sm" onClick={onRetry} disabled={retryDisabled}>
            Retry
          </Button>
        </div>
      ) : null}
    </div>
  )
}

export default AuthErrorFeedback
