import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'wall_calendar_events'

export const EVENT_COLORS = [
  { id: 'indigo',  label: 'Work',     bg: '#6366f1', light: '#eef2ff' },
  { id: 'rose',    label: 'Personal', bg: '#f43f5e', light: '#fff1f2' },
  { id: 'amber',   label: 'Travel',   bg: '#f59e0b', light: '#fffbeb' },
  { id: 'emerald', label: 'Health',   bg: '#10b981', light: '#ecfdf5' },
  { id: 'sky',     label: 'Social',   bg: '#0ea5e9', light: '#f0f9ff' },
  { id: 'violet',  label: 'Other',    bg: '#8b5cf6', light: '#f5f3ff' },
]

// Pure helper — defined outside hook so it is never recreated
const makeKey = (year, month, day) =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

/**
 * useEvents — CRUD for per-date events, persisted in localStorage.
 * Each event: { id, date (YYYY-MM-DD), title, color, note, time }
 */
export function useEvents() {
  const [events, setEvents] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
    } catch {}
  }, [events])

  const getEventsForDay = useCallback(
    (year, month, day) => events.filter(e => e.date === makeKey(year, month, day)),
    [events]
  )

  const getEventsForMonth = useCallback((year, month) => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}-`
    return events.filter(e => e.date.startsWith(prefix))
  }, [events])

  const addEvent = useCallback((year, month, day, { title, color, note, time }) => {
    const newEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      date: makeKey(year, month, day),
      title: title.trim(),
      color: color || EVENT_COLORS[0].id,
      note: note || '',
      time: time || '',
      createdAt: new Date().toISOString(),
    }
    setEvents(prev => [...prev, newEvent])
    return newEvent
  }, [])

  const updateEvent = useCallback((id, updates) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e))
  }, [])

  const deleteEvent = useCallback((id) => {
    setEvents(prev => prev.filter(e => e.id !== id))
  }, [])

  const hasEvents = useCallback(
    (year, month, day) => events.some(e => e.date === makeKey(year, month, day)),
    [events]
  )

  const exportMonth = useCallback((year, month, notes) => {
    const monthEvents = events.filter(e =>
      e.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}-`)
    )
    const MONTHS = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ]
    let text = `=== ${MONTHS[month]} ${year} ===\n\n`

    if (monthEvents.length === 0 && Object.keys(notes).length === 0) {
      text += 'No events or notes this month.\n'
    } else {
      const byDay = {}
      monthEvents.forEach(e => {
        const day = parseInt(e.date.split('-')[2], 10)
        if (!byDay[day]) byDay[day] = []
        byDay[day].push(e)
      })
      Object.keys(notes).forEach(key => {
        if (key.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)) {
          const day = parseInt(key.split('-')[2], 10)
          if (!byDay[day]) byDay[day] = []
        }
      })

      const days = [...new Set(Object.keys(byDay).map(Number))].sort((a, b) => a - b)
      days.forEach(day => {
        text += `--- ${day} ${MONTHS[month]} ---\n`
        const noteKey = makeKey(year, month, day)
        if (notes[noteKey]) text += `Note: ${notes[noteKey]}\n`
        ;(byDay[day] || []).forEach(e => {
          const colorLabel = EVENT_COLORS.find(c => c.id === e.color)?.label || e.color
          const timeStr = e.time ? ` @ ${e.time}` : ''
          text += `[${colorLabel}]${timeStr} ${e.title}${e.note ? ` — ${e.note}` : ''}\n`
        })
        text += '\n'
      })
    }

    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `calendar-${year}-${String(month + 1).padStart(2, '0')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }, [events])

  return {
    events,
    getEventsForDay,
    getEventsForMonth,
    addEvent,
    updateEvent,
    deleteEvent,
    hasEvents,
    exportMonth,
  }
}
