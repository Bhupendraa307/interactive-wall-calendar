import React, { useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DayCell from './DayCell'
import { DAY_NAMES } from '../utils/calendarData'

/**
 * CalendarGrid — 7-col grid with Framer Motion slide + stagger animation.
 * Supports drag-to-select via mouse events bubbling from DayCell.
 */
export default function CalendarGrid({
  calendarDays, currentYear, currentMonth, selectedDate,
  getDayStatus, hasNote, getEventColors,
  handleDayClick, setHoverDate,
  handleDragStart, handleDragEnter, handleDragEnd,
  direction, monthKey,
  accentColor, onDayDoubleClick,
}) {
  const gridRef = useRef(null)

  const handleKeyDown = useCallback((e, day) => {
    const cells = gridRef.current?.querySelectorAll('[role="button"]')
    if (!cells) return
    const arr = Array.from(cells)
    const idx = arr.indexOf(document.activeElement)
    if (idx === -1) return
    let next = -1
    if (e.key === 'ArrowRight') next = idx + 1
    else if (e.key === 'ArrowLeft')  next = idx - 1
    else if (e.key === 'ArrowDown')  next = idx + 7
    else if (e.key === 'ArrowUp')    next = idx - 7
    if (next >= 0 && next < arr.length) { e.preventDefault(); arr[next].focus() }
  }, [])

  const variants = {
    enter:  (dir) => ({ x: dir === 'next' ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (dir) => ({ x: dir === 'next' ? -50 : 50, opacity: 0 }),
  }

  return (
    <div
      className="overflow-hidden select-none min-w-0"
      onMouseLeave={() => {
        setHoverDate(null)
        handleDragEnd()
      }}
      onMouseUp={handleDragEnd}
    >
      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map((name, i) => (
          <div
            key={name}
            className={[
              'text-center text-[9px] sm:text-[10px] font-mono uppercase tracking-widest py-1',
              i === 0 ? 'text-rose-400 dark:text-rose-500'
                : i === 6 ? 'text-orange-400 dark:text-orange-500'
                : 'text-stone-400 dark:text-stone-600',
            ].join(' ')}
          >
            {name}
          </div>
        ))}
      </div>

      {/* Animated month grid */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={monthKey}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="grid grid-cols-7 gap-y-1 gap-x-0.5"
          ref={gridRef}
        >
          {calendarDays.map((day, idx) => {
            const status      = getDayStatus(day)
            const noteExists  = day ? hasNote(currentYear, currentMonth, day) : false
            const evtColors   = day ? getEventColors(currentYear, currentMonth, day) : []
            // Stagger delay: only real days, skip empties
            const realIdx     = day ? calendarDays.filter((d, i) => d && i <= idx).length - 1 : 0
            const delay       = day ? Math.min(realIdx * 0.02, 0.3) : 0

            return (
              <DayCell
                key={day ? `day-${day}` : `empty-${idx}`}
                day={day}
                month={currentMonth}
                {...status}
                isFocused={day && selectedDate === day}
                hasNote={noteExists}
                eventColors={evtColors}
                accentColor={accentColor}
                animationDelay={delay}
                onClick={handleDayClick}
                onDoubleClick={onDayDoubleClick}
                onMouseEnter={(d) => {
                  setHoverDate(new Date(currentYear, currentMonth, d))
                  handleDragEnter(d)
                }}
                onMouseDown={handleDragStart}
                onMouseUp={(d) => {
                  handleDragEnter(d)
                  handleDragEnd()
                }}
                onKeyDown={handleKeyDown}
              />
            )
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
