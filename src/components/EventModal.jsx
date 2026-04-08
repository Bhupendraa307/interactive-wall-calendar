import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Plus, Calendar, Clock } from 'lucide-react'
import { MONTH_NAMES } from '../utils/calendarData'
import { EVENT_COLORS } from '../hooks/useEvents'

/**
 * EventModal — add/edit events (single day or range) + day note.
 * New: optional time field per event.
 */
export default function EventModal({
  day, year, month,
  rangeStart, rangeEnd,
  events,
  initialEvent,
  getNote, setNote,
  onAddEvent, onAddRangeEvents, onUpdateEvent, onDeleteEvent,
  onInteractionReset,
  onClose,
  accentColor,
}) {
  const [title, setTitle]               = useState('')
  const [selectedColor, setSelectedColor] = useState(EVENT_COLORS[0].id)
  const [eventNote, setEventNote]       = useState('')
  const [eventTime, setEventTime]       = useState('')
  const [dayNote, setDayNote]           = useState('')
  const [editingId, setEditingId]       = useState(null)
  const titleRef = useRef(null)

  const isRangeMode = Boolean(rangeStart && rangeEnd)
  const rangeDays   = isRangeMode
    ? Math.round(Math.abs((rangeEnd - rangeStart) / 86400000)) + 1
    : null
  const fmt = (d) => `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
  const rangeLabel  = isRangeMode
    ? `${fmt(rangeStart)} → ${fmt(rangeEnd)}${rangeDays ? ` (${rangeDays} days)` : ''}`
    : ''
  const dateLabel   = day ? `${day} ${MONTH_NAMES[month]} ${year}` : ''
  const headerTitle = isRangeMode ? rangeLabel : dateLabel

  // Load day note
  useEffect(() => {
    if (day) {
      setDayNote(getNote(year, month, day))
      setTimeout(() => titleRef.current?.focus(), 150)
    }
  }, [day, year, month, getNote])

  // Pre-fill form when editing existing event
  useEffect(() => {
    if (initialEvent && day) {
      setEditingId(initialEvent.id)
      setTitle(initialEvent.title)
      setSelectedColor(initialEvent.color)
      setEventNote(initialEvent.note || '')
      setEventTime(initialEvent.time || '')
      titleRef.current?.focus()
    } else if (day) {
      setEditingId(null)
      setTitle('')
      setSelectedColor(EVENT_COLORS[0].id)
      setEventNote('')
      setEventTime('')
    } else if (isRangeMode) {
      setEditingId(null)
      setTitle('')
      setEventNote('')
      setEventTime('')
      setSelectedColor(EVENT_COLORS[0].id)
      setDayNote('')
      setTimeout(() => titleRef.current?.focus(), 150)
    }
  }, [initialEvent, day, isRangeMode])

  const resetForm = () => {
    setTitle('')
    setEventNote('')
    setEventTime('')
    setSelectedColor(EVENT_COLORS[0].id)
    setEditingId(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    const payload = { title, color: selectedColor, note: eventNote, time: eventTime }
    if (isRangeMode) {
      const start = Math.min(rangeStart.getDate(), rangeEnd.getDate())
      const end   = Math.max(rangeStart.getDate(), rangeEnd.getDate())
      onAddRangeEvents(start, end, payload)
    } else if (editingId) {
      onUpdateEvent(editingId, payload)
    } else {
      onAddEvent(year, month, day, payload)
    }
    resetForm()
  }

  const handleEdit = (evt) => {
    setEditingId(evt.id)
    setTitle(evt.title)
    setSelectedColor(evt.color)
    setEventNote(evt.note || '')
    setEventTime(evt.time || '')
    titleRef.current?.focus()
  }

  const handleSaveNote = () => {
    if (day) setNote(year, month, day, dayNote)
  }

  const colorObj = EVENT_COLORS.find(c => c.id === selectedColor)
  const isOpen   = Boolean(day || isRangeMode)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-2 sm:p-4"
          >
            <div className="w-full max-w-lg overflow-hidden bg-white dark:bg-stone-900 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] border border-stone-200/50 dark:border-stone-700/50">

              {/* Header */}
              <div
                className="flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-stone-800"
                style={{ borderTopWidth: 4, borderTopColor: accentColor }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl" style={{ backgroundColor: `${accentColor}18` }}>
                    <Calendar size={15} style={{ color: accentColor }} />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-stone-400 uppercase tracking-widest">
                      {isRangeMode ? 'Range events' : 'Events'}
                    </p>
                    <h3 className="font-display font-semibold text-stone-800 dark:text-stone-100 text-base leading-tight">
                      {headerTitle}
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">

                {/* Existing events list */}
                <div className="px-5 pt-4">
                  {isRangeMode ? (
                    <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-4 text-sm">
                      <p className="font-medium text-indigo-700 dark:text-indigo-300">Range event mode</p>
                      <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1">
                        This event will be added to every day in the selected range.
                      </p>
                    </div>
                  ) : events.length > 0 ? (
                    <div className="space-y-2">
                      {events.map(evt => {
                        const c = EVENT_COLORS.find(x => x.id === evt.color) || EVENT_COLORS[0]
                        return (
                          <motion.div
                            key={evt.id}
                            className="flex items-start gap-3 p-3 rounded-xl group"
                            style={{ backgroundColor: c.light }}
                          >
                            <div className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: c.bg }} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-stone-800 truncate">{evt.title}</p>
                                {evt.time && (
                                  <span className="flex items-center gap-1 text-[10px] text-stone-500 font-mono flex-shrink-0">
                                    <Clock size={9} />
                                    {evt.time}
                                  </span>
                                )}
                              </div>
                              {evt.note && <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{evt.note}</p>}
                              <p className="text-[10px] text-stone-400 font-mono mt-1">{c.label}</p>
                            </div>
                            <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  handleEdit(evt)
                                }}
                                className="text-xs text-stone-500 hover:text-stone-800 px-2 py-1 rounded-lg hover:bg-white transition-colors"
                                aria-label="Edit event"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  onDeleteEvent(evt.id)
                                  if (onInteractionReset) onInteractionReset()
                                  if (editingId === evt.id) resetForm()
                                }}
                                className="text-rose-400 hover:text-rose-600 p-1 rounded-lg hover:bg-white transition-colors"
                                aria-label="Delete event"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 px-4 py-5 text-center text-sm text-stone-400">
                      No events yet — add one below.
                    </div>
                  )}
                </div>

                {/* Add / edit form */}
                <form onSubmit={handleSubmit} className="px-5 pt-4 pb-2">
                  <p className="text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-3">
                    {isRangeMode ? 'Add range event' : editingId ? 'Edit event' : 'Add event'}
                  </p>

                  {/* Title */}
                  <input
                    ref={titleRef}
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Event title…"
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 placeholder:text-stone-300 dark:placeholder:text-stone-600 focus:outline-none transition-shadow"
                    onFocus={e => { e.target.style.boxShadow = `0 0 0 2px ${accentColor}40` }}
                    onBlur={e  => { e.target.style.boxShadow = 'none' }}
                  />

                  {/* Time (optional) */}
                  <div className="mt-3 flex items-center gap-2">
                    <Clock size={13} className="text-stone-400 flex-shrink-0" />
                    <input
                      type="time"
                      value={eventTime}
                      onChange={e => setEventTime(e.target.value)}
                      className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-700 dark:text-stone-300 focus:outline-none transition-shadow w-36"
                      onFocus={e => { e.target.style.boxShadow = `0 0 0 2px ${accentColor}40` }}
                      onBlur={e  => { e.target.style.boxShadow = 'none' }}
                    />
                    <span className="text-xs text-stone-400">optional time</span>
                  </div>

                  {/* Color / category */}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {EVENT_COLORS.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        title={c.label}
                        onClick={() => setSelectedColor(c.id)}
                        className={[
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                          selectedColor === c.id ? 'scale-105 shadow-md' : 'opacity-60 hover:opacity-100',
                        ].join(' ')}
                        style={{
                          backgroundColor: selectedColor === c.id ? c.bg : c.light,
                          color: selectedColor === c.id ? 'white' : c.bg,
                          border: `1.5px solid ${c.bg}${selectedColor === c.id ? '' : '60'}`,
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: selectedColor === c.id ? 'white' : c.bg }} />
                        {c.label}
                      </button>
                    ))}
                  </div>

                  {/* Optional details */}
                  <textarea
                    value={eventNote}
                    onChange={e => setEventNote(e.target.value)}
                    placeholder="Optional details…"
                    rows={2}
                    className="w-full mt-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 placeholder:text-stone-300 dark:placeholder:text-stone-600 focus:outline-none resize-none transition-shadow"
                    onFocus={e => { e.target.style.boxShadow = `0 0 0 2px ${accentColor}40` }}
                    onBlur={e  => { e.target.style.boxShadow = 'none' }}
                  />

                  <div className="flex flex-wrap gap-2 mt-3">
                    {editingId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-4 py-2 text-sm text-stone-500 hover:text-stone-700 rounded-xl transition-colors"
                      >
                        Cancel edit
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={!title.trim()}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-40 transition-all hover:opacity-90 active:scale-95"
                      style={{ backgroundColor: colorObj?.bg || accentColor }}
                    >
                      <Plus size={14} />
                      {isRangeMode ? 'Create events' : editingId ? 'Update' : 'Add event'}
                    </button>
                  </div>
                </form>

                {/* Day note (single-day mode only) */}
                {!isRangeMode && (
                  <div className="px-5 pt-3 pb-5 border-t border-stone-100 dark:border-stone-800 mt-3">
                    <p className="text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-2">
                      Day note
                    </p>
                    <textarea
                      value={dayNote}
                      onChange={e => setDayNote(e.target.value)}
                      onBlur={handleSaveNote}
                      placeholder="Write a note for this day…"
                      rows={3}
                      className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm text-stone-700 dark:text-stone-300 placeholder:text-stone-300 dark:placeholder:text-stone-600 focus:outline-none resize-none transition-shadow"
                      onFocus={e => { e.target.style.boxShadow = `0 0 0 2px ${accentColor}40` }}
                      onBlurCapture={e => { e.target.style.boxShadow = 'none'; handleSaveNote() }}
                    />
                    <p className="mt-1.5 text-[11px] text-stone-400 font-mono">
                      Auto-saved when you leave the field.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-stone-100 dark:border-stone-800 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: accentColor }}
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
