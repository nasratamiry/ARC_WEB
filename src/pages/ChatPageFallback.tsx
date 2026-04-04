/** Lightweight shell while the chat route chunk loads (matches main chat grid height). */
export default function ChatPageFallback() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-4 px-3 py-2 sm:gap-5 sm:px-4 sm:py-3 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:px-6">
      <div
        className="h-[calc(100dvh-11.5rem)] animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
        aria-hidden
      />
      <div
        className="h-[calc(100dvh-11.5rem)] animate-pulse rounded-2xl border border-slate-200 bg-[#f8fafc]"
        aria-hidden
      />
    </div>
  )
}
