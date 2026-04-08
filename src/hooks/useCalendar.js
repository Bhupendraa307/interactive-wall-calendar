import { useState, useCallback, useMemo, useRef, useEffect } from 'react'

/**
 * Core calendar logic hook.
 * Handles month navigation, date range selection (click OR drag), hover preview.
 */
export function useCalendar() {
  const today = useMemo(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() }
  }, [])

  const [currentYear, setCurrentYear]   = useState(today.year)
  const [currentMonth, setCurrentMonth] = useState(today.month)
  const [rangeStart, setRangeStart]     = useState(null)
  const [rangeEnd, setRangeEnd]         = useState(null)
  const [hoverDate, setHoverDate]       = useState(null)
  const [isDragging, setIsDragging]     = useState(false)
  const dragOrigin                      = useRef(null)
  const isMouseDown                     = useRef(false)
  const didDragMove                     = useRef(false)
  const ignoreNextClick                 = useRef(false)

  const calendarDays = useMemo(() => {
    const firstDay    = new Date(currentYear, currentMonth, 1).getDay()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const days = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let d = 1; d <= daysInMonth; d++) days.push(d)
    return days
  }, [currentYear, currentMonth])

  const prevMonth = useCallback(() => {
    setCurrentMonth(m => {
      if (m === 0) { setCurrentYear(y => y - 1); return 11 }
      return m - 1
    })
  }, [])

  const nextMonth = useCallback(() => {
    setCurrentMonth(m => {
      if (m === 11) { setCurrentYear(y => y + 1); return 0 }
      return m + 1
    })
  }, [])

  const goToToday = useCallback(() => {
    setCurrentYear(today.year)
    setCurrentMonth(today.month)
  }, [today])

  const goToDate = useCallback((date) => {
    setCurrentYear(date.getFullYear())
    setCurrentMonth(date.getMonth())
  }, [])

  const handleDayClick = useCallback((day) => {
    if (!day) return
    if (ignoreNextClick.current) {
      ignoreNextClick.current = false
      return
    }
    const clicked = new Date(currentYear, currentMonth, day)
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(clicked); setRangeEnd(null); setHoverDate(null)
    } else {
      // Ignore accidental second click on the same start day (e.g. double-click),
      // so the range can still be extended to another end date.
      if (clicked.getTime() === rangeStart.getTime()) return
      if (clicked < rangeStart) {
        setRangeEnd(rangeStart); setRangeStart(clicked)
      } else {
        setRangeEnd(clicked)
      }
      setHoverDate(null)
    }
  }, [currentYear, currentMonth, rangeStart, rangeEnd])

  const handleDragStart = useCallback((day) => {
    if (!day) return
    const d = new Date(currentYear, currentMonth, day)
    dragOrigin.current = d
    isMouseDown.current = true
    didDragMove.current = false
  }, [currentYear, currentMonth])

  const handleDragEnter = useCallback((day) => {
    if (!day || !isMouseDown.current || !dragOrigin.current) return
    const d = new Date(currentYear, currentMonth, day)
    if (d.getTime() === dragOrigin.current.getTime()) return
    didDragMove.current = true
    setIsDragging(true)
    if (d < dragOrigin.current) {
      setRangeStart(d); setRangeEnd(dragOrigin.current)
    } else {
      setRangeStart(dragOrigin.current); setRangeEnd(d)
    }
  }, [currentYear, currentMonth])

  const handleDragEnd = useCallback(() => {
    if (didDragMove.current) ignoreNextClick.current = true
    isMouseDown.current = false
    didDragMove.current = false
    setIsDragging(false)
    dragOrigin.current = null
  }, [])

  useEffect(() => {
    const resetDrag = () => {
      isMouseDown.current = false
      setIsDragging(false)
      dragOrigin.current = null
      didDragMove.current = false
    }

    window.addEventListener('mouseup', resetDrag)
    window.addEventListener('pointerup', resetDrag)
    window.addEventListener('blur', resetDrag)

    return () => {
      window.removeEventListener('mouseup', resetDrag)
      window.removeEventListener('pointerup', resetDrag)
      window.removeEventListener('blur', resetDrag)
    }
  }, [])

  const getDayStatus = useCallback((day) => {
    if (!day) return {}
    const d = new Date(currentYear, currentMonth, day)
    const isToday = (day === today.day && currentMonth === today.month && currentYear === today.year)
    const effectiveEnd   = rangeEnd || (rangeStart && hoverDate) || null
    const effectiveStart = rangeStart
    let isStart = false, isEnd = false, isInRange = false

    if (effectiveStart && effectiveEnd) {
      const sameMonthSelection =
        effectiveStart.getFullYear() === currentYear &&
        effectiveStart.getMonth() === currentMonth &&
        effectiveEnd.getFullYear() === currentYear &&
        effectiveEnd.getMonth() === currentMonth

      if (sameMonthSelection) {
        const loDay = Math.min(effectiveStart.getDate(), effectiveEnd.getDate())
        const hiDay = Math.max(effectiveStart.getDate(), effectiveEnd.getDate())
        isStart   = day === loDay
        isEnd     = day === hiDay
        isInRange = day > loDay && day < hiDay
      } else {
        const lo = effectiveStart < effectiveEnd ? effectiveStart : effectiveEnd
        const hi = effectiveStart < effectiveEnd ? effectiveEnd   : effectiveStart
        isStart   = d.getTime() === lo.getTime()
        isEnd     = d.getTime() === hi.getTime()
        isInRange = d > lo && d < hi
      }
    } else if (effectiveStart) {
      isStart = d.getTime() === effectiveStart.getTime()
    }

    const dow = d.getDay()
    return {
      isToday, isStart, isEnd, isInRange,
      isWeekend: dow === 0 || dow === 6,
      isSunday: dow === 0,
      isSaturday: dow === 6,
    }
  }, [currentYear, currentMonth, today, rangeStart, rangeEnd, hoverDate])

  const clearRange = useCallback(() => {
    setRangeStart(null); setRangeEnd(null); setHoverDate(null)
  }, [])

  const rangeDays = useMemo(() => {
    if (!rangeStart || !rangeEnd) return rangeStart ? 1 : 0
    return Math.round(Math.abs((rangeEnd - rangeStart) / 86400000)) + 1
  }, [rangeStart, rangeEnd])

  return {
    currentYear, currentMonth, calendarDays,
    rangeStart, rangeEnd, rangeDays,
    hoverDate, setHoverDate, isDragging,
    prevMonth, nextMonth, goToToday, goToDate,
    handleDayClick, handleDragStart, handleDragEnter, handleDragEnd,
    getDayStatus, clearRange, today,
  }
}
