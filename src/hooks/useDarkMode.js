import { useState, useEffect } from 'react'

/**
 * Dark mode hook — persists preference in localStorage and applies
 * the 'dark' class to document.documentElement for Tailwind dark mode.
 */
export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('calendar_dark_mode')
    if (stored !== null) return stored === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('calendar_dark_mode', String(isDark))
  }, [isDark])

  const toggle = () => setIsDark(d => !d)

  return { isDark, toggle }
}
