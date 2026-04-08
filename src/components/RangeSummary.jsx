import React from 'react'
import { CalendarRange, X } from 'lucide-react'
import { MONTH_NAMES } from '../utils/calendarData'

export default function RangeSummary({ rangeStart, rangeEnd, onClear, accentColor, onCreateRangeEvent }) {
  if (!rangeStart) return null

  const fmt = (d) => `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)}`
  const days = rangeEnd
    ? Math.round(Math.abs((rangeEnd - rangeStart) / 86400000)) + 1
    : null

  return (
    <div
      className="flex flex-col gap-3 px-4 py-3 rounded-2xl text-xs font-mono border shadow-md transition-all duration-300"
      style={{
        backgroundColor: accentColor ? `${accentColor}10` : '#6366f110',
        borderColor: accentColor ? `${accentColor}30` : '#6366f130',
        borderLeft: `3px solid ${accentColor || '#6366f1'}`,
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <CalendarRange size={14} style={{ color: accentColor }} className="shrink-0" />
        <span className="text-stone-700 dark:text-stone-300">
          <span className="font-semibold">{fmt(rangeStart)}</span>
          {rangeEnd && rangeEnd.getTime() !== rangeStart.getTime() && (
            <> {'->'} <span className="font-semibold">{fmt(rangeEnd)}</span></>
          )}
          {days && days > 1 && <span className="opacity-60 ml-1.5">({days}d)</span>}
          {!rangeEnd && <span className="opacity-50 italic ml-1.5 text-[10px]">{'->'} select end</span>}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {onCreateRangeEvent && rangeEnd && (
          <button
            type="button"
            onClick={onCreateRangeEvent}
            className="rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-4 py-2 text-[11px] font-semibold hover:shadow-lg hover:from-indigo-500 hover:to-indigo-400 active:scale-95 transition-all duration-200"
            aria-label="Add event to selected range"
          >
            Add event
          </button>
        )}
        <button 
          onClick={onClear} 
          className="text-stone-400 hover:text-rose-500 dark:hover:text-rose-400 transition-all duration-200 hover:scale-110 active:scale-95 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20"
          aria-label="Clear range selection"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  )
}
