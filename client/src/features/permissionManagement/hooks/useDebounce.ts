import { useState, useEffect } from 'react'

// Returns a version of `value` that only updates after `delay` ms of inactivity.
// Used to avoid firing a search API call on every keystroke.
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])

  return debounced
}
