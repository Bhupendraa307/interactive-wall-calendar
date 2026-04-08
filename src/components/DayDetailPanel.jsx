import React from 'react'
import { EVENT_COLORS } from '../hooks/useEvents'

/**
 * DayDetailPanel — shows selected date's events + note inline.
 * Extracted from InteractiveWallCalendar to keep the root component lean.
 */
export default function DayDetailPanel({
  selectedDate, currentYear, currentMonth,
  selectedDateEvents, selectedDateNote,
  monthlyMemo, memoEditing, monthlyMemoDraft,
  onClearDate, onEditNote,
  onEditMonthlyMemo, onSaveMemo, onCancelMemo,
  onMemoChange, onOpenEvent,
  accentColor,
}) {
  const dateLabel = selectedDate
    ? `${selectedDate} ${new Date(currentYear, currentMonth, selectedDate)
        .toLocaleString(undefined, { month: 'long', year: 'numeric' })}`
    : null

  return (
    <div className="mt-2 rounded-2xl border border-stone-200/70 dark:border-stone-700/70 bg-stone-50/90 dark:bg-stone-800/90 p-4 shadow-inner flex-shrink-0">

      {/* Monthly memo */}
      <div className="mb-3 pb-3 border-b border-stone-200/60 dark:border-stone-700/60">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-[0.2em] text-stone-400 mb-1">Monthly memo</p>
            <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-300 line-clamp-2">
              {monthlyMemo || 'Add a general note for this month…'}
            </p>
          </div>
          <button
            type="button"
            onClick={onEditMonthlyMemo}
            className="rounded-full border border-stone-200 dark:border-stone-700 px-3 py-1.5 text-[11px] font-medium text-stone-600 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors flex-shrink-0"
          >
            {monthlyMemo ? 'Edit' : 'Add'}
          </button>
        </div>

        {memoEditing && (
          <div className="mt-3 space-y-2">
            <textarea
              value={monthlyMemoDraft}
              onChange={e => onMemoChange(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-3 text-sm text-stone-800 dark:text-stone-100 focus:outline-none resize-none transition-shadow"
              placeholder="Write your monthly memo…"
              onFocus={e => { e.target.style.boxShadow = `0 0 0 2px ${accentColor}40` }}
              onBlur={e  => { e.target.style.boxShadow = 'none' }}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onSaveMemo}
                className="rounded-full px-4 py-1.5 text-xs font-medium text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: accentColor }}
              >
                Save
              </button>
              <button
                type="button"
                onClick={onCancelMemo}
                className="rounded-full border border-stone-200 dark:border-stone-700 px-4 py-1.5 text-xs text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selected day detail */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div>
          <p className="text-[9px] uppercase tracking-[0.2em] text-stone-400">Selected</p>
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 leading-tight">
            {dateLabel ?? 'Click a date to view details'}
          </h3>
        </div>
        {selectedDate && (
          <button
            onClick={onClearDate}
            className="text-[10px] text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 px-2 py-0.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex-shrink-0"
          >
            ×
          </button>
        )}
      </div>

      {selectedDate ? (
        <div className="space-y-2 max-h-48 overflow-y-auto text-xs">

          {/* Day note row */}
          <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2.5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-2">
                {selectedDateNote || 'No note yet.'}
              </p>
              <button
                type="button"
                onClick={onEditNote}
                className="text-[10px] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 px-2 py-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex-shrink-0"
              >
                Edit note
              </button>
            </div>
          </div>

          {/* Events rows */}
          {selectedDateEvents.length > 0 ? (
            selectedDateEvents.map(evt => {
              const color = EVENT_COLORS.find(c => c.id === evt.color)?.bg || accentColor
              return (
                <button
                  key={evt.id}
                  type="button"
                  onClick={() => onOpenEvent(evt)}
                  className="w-full text-left rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2.5 hover:border-stone-300 dark:hover:border-stone-600 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className="font-medium text-stone-800 dark:text-stone-100 truncate">{evt.title}</span>
                    {evt.time && <span className="text-stone-400 font-mono ml-auto flex-shrink-0">{evt.time}</span>}
                  </div>
                </button>
              )
            })
          ) : (
            <p className="text-stone-400 dark:text-stone-600 italic px-1">No events — double-click to add.</p>
          )}
        </div>
      ) : (
        <p className="text-xs text-stone-400 dark:text-stone-600 italic">Click any calendar day to inspect details here.</p>
      )}
    </div>
  )
}
