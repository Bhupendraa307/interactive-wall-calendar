import React from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, StickyNote, Sparkles, Download } from 'lucide-react'
import { EVENT_COLORS } from '../hooks/useEvents'
import { MONTH_NAMES } from '../utils/calendarData'

/**
 * StatsPanel — shows month stats: events count by category, notes, range.
 */
export default function StatsPanel({
  currentYear, currentMonth,
  monthEvents, rangeDays,
  notesCount, onExport, accentColor,
}) {
  // Count events per color category
  const byColor = EVENT_COLORS.map(c => ({
    ...c,
    count: monthEvents.filter(e => e.color === c.id).length,
  })).filter(c => c.count > 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-800/50 dark:to-stone-900/50 rounded-2xl p-4 border border-stone-200/50 dark:border-stone-700/50 shadow-sm"
    >
      <div className="flex items-center justify-between gap-2 mb-4">
        <p className="font-mono text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-widest">
          {MONTH_NAMES[currentMonth].slice(0,3)} {currentYear}
        </p>
        <button
          onClick={onExport}
          title="Export month as text file"
          className="flex items-center gap-1.5 text-[10px] font-mono text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-all duration-200 px-2 py-1 rounded-lg hover:bg-white dark:hover:bg-stone-700 hover:scale-105 active:scale-95"
          aria-label="Export calendar month"
        >
          <Download size={12} />
          Export
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { icon: Sparkles,    label: 'Events',  value: monthEvents.length, color: accentColor },
          { icon: StickyNote,  label: 'Notes',   value: notesCount,         color: '#f59e0b' },
          { icon: CalendarDays,label: 'Selected',value: rangeDays || 0,     color: '#10b981' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div
            key={label}
            className="bg-gradient-to-br from-white to-stone-50 dark:from-stone-700 dark:to-stone-800 rounded-xl p-2.5 sm:p-3 text-center border border-stone-200 dark:border-stone-700 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Icon size={15} className="mx-auto mb-2" style={{ color }} />
            <p className="font-mono text-lg sm:text-xl font-bold text-stone-800 dark:text-stone-100 leading-none">{value}</p>
            <p className="text-[9px] text-stone-500 dark:text-stone-400 font-mono uppercase tracking-wider mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Category breakdown */}
      {byColor.length > 0 && (
        <div className="space-y-1.5">
          {byColor.map(c => (
            <div key={c.id} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.bg }} />
              <div className="flex-1 bg-stone-100 dark:bg-stone-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(c.count / monthEvents.length) * 100}%`,
                    backgroundColor: c.bg,
                  }}
                />
              </div>
              <span className="font-mono text-[10px] text-stone-400 w-3 text-right">{c.count}</span>
            </div>
          ))}
        </div>
      )}

      {monthEvents.length === 0 && notesCount === 0 && (
        <p className="text-xs text-stone-400 dark:text-stone-600 text-center font-body italic py-1">
          Double-click any day to add events
        </p>
      )}
    </motion.div>
  )
}
