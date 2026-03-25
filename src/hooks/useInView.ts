import { useCallback, useEffect, useState } from 'react'

type UseInViewOptions = {
  rootMargin?: string
  threshold?: number
  once?: boolean
}

export function useInView<T extends HTMLElement = HTMLElement>(options: UseInViewOptions = {}) {
  const { rootMargin = '0px 0px -8% 0px', threshold = 0.08, once = true } = options
  const [node, setNode] = useState<T | null>(null)
  const [isInView, setIsInView] = useState(() => typeof IntersectionObserver === 'undefined')

  const ref = useCallback((el: T | null) => {
    setNode(el)
  }, [])

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || !node) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setIsInView(false)
        }
      },
      { rootMargin, threshold },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [node, once, rootMargin, threshold])

  return { ref, isInView }
}
