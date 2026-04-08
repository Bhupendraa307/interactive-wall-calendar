import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'wall_calendar_notes'

/**
 * Notes hook — reads/writes per-date notes to localStorage.
 * Key format: "YYYY-MM-DD"
 */
export function useNotes() {
  const [notes, setNotes] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  })

  // Sync to localStorage whenever notes change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
    } catch {
      // localStorage might be unavailable (private browsing quota etc.)
    }
  }, [notes])

  // Format a date into storage key
  const makeKey = useCallback((year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }, [])

  const getNote = useCallback((year, month, day) => {
    return notes[makeKey(year, month, day)] || ''
  }, [notes, makeKey])

  const makeMonthKey = useCallback((year, month) => {
    return `${year}-${String(month + 1).padStart(2, '0')}`
  }, [])

  const getMonthNote = useCallback((year, month) => {
    return notes[makeMonthKey(year, month)] || ''
  }, [notes, makeMonthKey])

  const setNote = useCallback((year, month, day, text) => {
    const key = makeKey(year, month, day)
    setNotes(prev => {
      if (!text.trim()) {
        const next = { ...prev }
        delete next[key]
        return next
      }
      return { ...prev, [key]: text }
    })
  }, [makeKey])

  const setMonthNote = useCallback((year, month, text) => {
    const key = makeMonthKey(year, month)
    setNotes(prev => {
      if (!text.trim()) {
        const next = { ...prev }
        delete next[key]
        return next
      }
      return { ...prev, [key]: text }
    })
  }, [makeMonthKey])

  const hasNote = useCallback((year, month, day) => {
    return !!notes[makeKey(year, month, day)]
  }, [notes, makeKey])

  const clearAllNotes = useCallback(() => {
    setNotes({})
  }, [])

  return { notes, getNote, setNote, hasNote, clearAllNotes, getMonthNote, setMonthNote }
}
