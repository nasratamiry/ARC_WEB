import { type ReactNode } from 'react'

const iconBase = 'h-4 w-4'

export function MailIcon({ className = '' }: { className?: string }): ReactNode {
  return (
    <svg className={`${iconBase} ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6.5C4 5.12 5.12 4 6.5 4H17.5C18.88 4 20 5.12 20 6.5V17.5C20 18.88 18.88 20 17.5 20H6.5C5.12 20 4 18.88 4 17.5V6.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M5.5 7.5L12 12L18.5 7.5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

export function LockIcon({ className = '' }: { className?: string }): ReactNode {
  return (
    <svg className={`${iconBase} ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 11V8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8V11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6 11H18C19.1046 11 20 11.8954 20 13V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V13C4 11.8954 4.89543 11 6 11Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M12 15V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function PhoneIcon({ className = '' }: { className?: string }): ReactNode {
  return (
    <svg className={`${iconBase} ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7.5 4H10L11.5 8L10 9.5C10.8 11.2 12.3 12.7 14 13.5L15.5 12L19.5 13.5V16C19.5 17.1 18.6 18 17.5 18C10 18 6 14 6 6.5C6 5.4 6.9 4.5 8 4.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function UserIcon({ className = '' }: { className?: string }): ReactNode {
  return (
    <svg className={`${iconBase} ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 21C20 17.134 16.4183 14 12 14C7.58172 14 4 17.134 4 21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function KeyIcon({ className = '' }: { className?: string }): ReactNode {
  return (
    <svg className={`${iconBase} ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 2L15 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 13.5L9 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 10L12 8L7 13V16H10L15 11L14 10Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M16.5 7.5C17.3284 6.67157 18.6716 6.67157 19.5 7.5C20.3284 8.32843 20.3284 9.67157 19.5 10.5C18.6716 11.3284 17.3284 11.3284 16.5 10.5C15.6716 9.67157 15.6716 8.32843 16.5 7.5Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  )
}

