import React from 'react'
import { motion } from 'framer-motion'
import { getHoliday } from '../utils/calendarData'
import { EVENT_COLORS } from '../hooks/useEvents'

/**
 * DayCell — a single day in the calendar grid.
 * Supports: today, range start/end/in-between, weekend styling,
 * holiday tooltip, note dot, event color dots, drag selection.
 */
export default function DayCell({
  day, month,
  isToday, isStart, isEnd, isInRange, isWeekend, isSunday,
  isFocused,
  hasNote, eventColors,
  onClick, onDoubleClick,
  onMouseEnter,
  onMouseDown, onMouseUp,
  onKeyDown,
  accentColor,
  animationDelay,
}) {
  if (!day) return <div className="h-10 sm:h-11 md:h-12" aria-hidden="true" />

  const withAlpha = (color, alpha) => {
    if (!color) return `rgba(99, 102, 241, ${alpha})`
    if (color.startsWith('#')) {
      const hex = color.slice(1)
      const normalized = hex.length === 3
        ? hex.split('').map(ch => ch + ch).join('')
        : hex.length >= 6 ? hex.slice(0, 6) : '6366f1'
      const r = parseInt(normalized.slice(0, 2), 16)
      const g = parseInt(normalized.slice(2, 4), 16)
      const b = parseInt(normalized.slice(4, 6), 16)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }
    const rgb = color.match(/rgba?\(([^)]+)\)/i)
    if (rgb) {
      const parts = rgb[1].split(',').map(v => Number.parseFloat(v.trim()))
      if (parts.length >= 3 && parts.slice(0, 3).every(n => Number.isFinite(n))) {
        return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`
      }
    }
    return `rgba(99, 102, 241, ${alpha})`
  }

  const holiday    = getHoliday(month, day)
  const isSelected = isStart || isEnd
  const eventCount  = eventColors?.length || 0

  const labelParts = [
    `${day}`,
    holiday && `${holiday}`,
    isToday && 'Today',
    eventCount > 0 && `${eventCount} event${eventCount > 1 ? 's' : ''}`,
    hasNote && 'Note added',
    isSelected && 'Selected',
  ].filter(Boolean)

  const ariaLabel = labelParts.join(', ')

  // ── Styling ──────────────────────────────────────────────────────────────
  let containerStyle = {}
  let containerClass = [
    'relative h-10 sm:h-11 md:h-10 flex flex-col items-center justify-center gap-0.5',
    'rounded-lg cursor-pointer select-none',
    'transition-all duration-200 ease-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 group',
  ].join(' ')

  let numberClass = 'relative z-10 font-mono text-[11px] sm:text-xs md:text-sm leading-none font-medium'

  if (isSelected) {
    containerStyle.backgroundColor = accentColor || '#6366f1'
    containerStyle.boxShadow       = `0 4px 16px ${withAlpha(accentColor, 0.31)}`
    containerClass += ' text-white scale-105'
  } else if (isInRange) {
    containerStyle.backgroundColor = withAlpha(accentColor, 0.18)
    containerClass += ' rounded-none text-stone-800 dark:text-stone-100'
    if (isStart) containerClass += ' rounded-l-xl'
    if (isEnd)   containerClass += ' rounded-r-xl'
  } else if (isFocused) {
    containerStyle.boxShadow = `inset 0 0 0 2px ${accentColor || '#6366f1'}`
    containerStyle.backgroundColor = withAlpha(accentColor, 0.08)
    containerClass += ' font-semibold'
  } else if (isToday) {
    containerStyle.boxShadow    = `inset 0 0 0 2px ${accentColor || '#6366f1'}`
    containerStyle.color        = accentColor || '#6366f1'
    containerClass += ' font-bold'
  } else if (isSunday) {
    containerClass += ' text-rose-500 dark:text-rose-400'
  } else if (isWeekend) {
    containerClass += ' text-orange-500 dark:text-orange-400'
  } else {
    containerClass += ' text-stone-700 dark:text-stone-300'
  }

  if (!isSelected && !isInRange) {
    containerClass += ' hover:bg-stone-100 dark:hover:bg-stone-800 hover:scale-105 active:scale-95 transition-all duration-200'
  }

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={containerClass}
      style={containerStyle}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, duration: 0.2, ease: 'easeOut' }}
      onClick={() => onClick(day)}
      onDoubleClick={() => onDoubleClick(day)}
      onMouseEnter={() => onMouseEnter(day)}
      onMouseDown={(e) => { e.preventDefault(); onMouseDown(day) }}
      onMouseUp={(e) => { e.preventDefault(); onMouseUp(day) }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(day) }
        else onKeyDown(e, day)
      }}
    >
      {/* Day number */}
      <span className={numberClass}>{day}</span>

      {/* Event + note dots row */}
      {(eventColors?.length > 0 || hasNote) && (
        <div className="flex gap-0.5 items-center justify-center z-10">
          {(eventColors || []).slice(0, 3).map((colorId, i) => {
            const color = EVENT_COLORS.find(c => c.id === colorId)
            return (
              <span
                key={i}
                className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full"
                style={{ backgroundColor: color?.bg || accentColor }}
              />
            )
          })}
          {hasNote && (
            <span
              className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full opacity-70"
              style={{ backgroundColor: isSelected ? 'white' : (accentColor || '#6366f1') }}
            />
          )}
        </div>
      )}

      {/* Holiday amber dot */}
      {holiday && (
        <>
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
          {/* Tooltip */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none
                          opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <div className="bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900
                            text-xs px-2.5 py-1 rounded-lg whitespace-nowrap shadow-xl font-body">
              Holiday: {holiday}
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2
                            border-4 border-transparent border-t-stone-900 dark:border-t-stone-100" />
          </div>
        </>
      )}
    </motion.div>
  )
}
