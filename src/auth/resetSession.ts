const RESET_SESSION_KEY = 'arc-reset'

type ResetSession = {
  email: string
  reset_token: string
  expires_at: number
}

export const setResetSession = (value: ResetSession | null): void => {
  try {
    if (!value) {
      sessionStorage.removeItem(RESET_SESSION_KEY)
      return
    }
    sessionStorage.setItem(RESET_SESSION_KEY, JSON.stringify(value))
  } catch {
    // ignore
  }
}

export const getResetSession = (): ResetSession | null => {
  try {
    const raw = sessionStorage.getItem(RESET_SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<ResetSession>
    if (!parsed.email || !parsed.reset_token || !parsed.expires_at) return null
    if (Date.now() > parsed.expires_at) return null
    return {
      email: parsed.email,
      reset_token: parsed.reset_token,
      expires_at: parsed.expires_at,
    }
  } catch {
    return null
  }
}

