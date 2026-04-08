import React from 'react'
import { ChevronLeft, ChevronRight, Sun, Moon, Trash2 } from 'lucide-react'
import { MONTH_NAMES } from '../utils/calendarData'

export default function CalendarHeader({
  currentYear, currentMonth,
  onPrev, onNext, onToday,
  onClearRange, hasRange,
  isDark, onToggleDark,
  accentColor,
  isCurrentMonth,
}) {
  return (
    <div className="flex items-center justify-between px-1 sm:px-2 py-3 md:px-1 md:py-3 gap-2">
      <button
        onClick={onPrev}
        aria-label="Previous month"
        className="w-9 h-9 sm:w-10 sm:h-10 md:w-8 md:h-8 flex items-center justify-center rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-all duration-200 hover:scale-110 active:scale-95 text-stone-500 dark:text-stone-400"
      >
        <ChevronLeft size={20} className="md:w-5 md:h-5" />
      </button>

      {/* Center: month name + year + today button */}
      <div className="text-center min-w-0 flex-1">
        <h3 className="font-display text-lg sm:text-xl font-semibold text-stone-800 dark:text-stone-100 leading-tight truncate">
          {MONTH_NAMES[currentMonth]}
        </h3>
        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
          <p className="font-mono text-xs text-stone-400 dark:text-stone-500 tracking-widest">
            {currentYear}
          </p>
          <button
            onClick={onToday}
            title={isCurrentMonth ? 'Reset to today' : 'Back to today'}
            className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded-full transition-colors"
            style={{
              color: accentColor,
              backgroundColor: `${accentColor}18`,
            }}
          >
            {isCurrentMonth ? 'This month' : 'Today'}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-0.5 sm:gap-1">
        {hasRange && (
          <button onClick={onClearRange} title="Clear selection"
            className="w-9 h-9 sm:w-10 sm:h-10 md:w-8 md:h-8 flex items-center justify-center rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all duration-200 hover:scale-110 active:scale-95 text-rose-400"
          >
            <Trash2 size={16} className="md:w-4 md:h-4" />
          </button>
        )}
        <button onClick={onToggleDark}
          aria-label={isDark ? 'Light mode' : 'Dark mode'}
          className="w-9 h-9 sm:w-10 sm:h-10 md:w-8 md:h-8 flex items-center justify-center rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-all duration-200 hover:scale-110 active:scale-95 text-stone-500 dark:text-stone-400"
        >
          {isDark ? <Sun size={18} className="md:w-4 md:h-4" /> : <Moon size={18} className="md:w-4 md:h-4" />}
        </button>
        <button onClick={onNext} aria-label="Next month"
          className="w-9 h-9 sm:w-10 sm:h-10 md:w-8 md:h-8 flex items-center justify-center rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-all duration-200 hover:scale-110 active:scale-95 text-stone-500 dark:text-stone-400"
        >
          <ChevronRight size={20} className="md:w-5 md:h-5" />
        </button>
      </div>
    </div>
  )
}
