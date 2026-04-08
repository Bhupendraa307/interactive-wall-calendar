import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ListChecks, StickyNote, Pencil, Trash2 } from 'lucide-react'
import { EVENT_COLORS } from '../hooks/useEvents'

export default function AllItemsPanel({
  isOpen,
  activeTab,
  events,
  notes,
  onClose,
  onEditEvent,
  onDeleteEvent,
  onDeleteNote,
  accentColor,
}) {
  const [tab, setTab] = useState(activeTab)
  const [selectedEntry, setSelectedEntry] = useState(null)

  useEffect(() => {
    setTab(activeTab)
    setSelectedEntry(null)
  }, [activeTab, isOpen])

  const sortedEvents = events
  const sortedNotes = notes

  const formatDate = (dateValue) => {
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleDateString(undefined, {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    })
  }

  const renderEventItem = (evt) => {
    const color = EVENT_COLORS.find(c => c.id === evt.color)?.bg || accentColor
    return (
      <button
        key={evt.id}
        type="button"
        className="w-full text-left rounded-2xl border border-stone-200 dark:border-stone-700 p-4 bg-gradient-to-br from-white to-stone-50 dark:from-stone-800 dark:to-stone-900 transition-all duration-200 hover:border-stone-300 dark:hover:border-stone-600 hover:shadow-md hover:scale-105 active:scale-95"
        onClick={() => setSelectedEntry({ type: 'event', value: evt })}
      >
        <div className="flex items-start gap-3">
          <span className="w-3 h-3 rounded-full mt-1 flex-shrink-0 shadow-sm" style={{ backgroundColor: color }} />
          <div className="min-w-0">
            <p className="font-medium text-stone-900 dark:text-stone-100 truncate">{evt.title}</p>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 truncate">{formatDate(new Date(evt.date))}</p>
          </div>
        </div>
      </button>
    )
  }

  const renderNoteItem = (note) => (
    <button
      key={note.id}
      type="button"
      className="w-full text-left rounded-2xl border border-stone-200 dark:border-stone-700 p-4 bg-gradient-to-br from-white to-stone-50 dark:from-stone-800 dark:to-stone-900 transition-all duration-200 hover:border-stone-300 dark:hover:border-stone-600 hover:shadow-md hover:scale-105 active:scale-95"
      onClick={() => setSelectedEntry({ type: 'note', value: note })}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-stone-900 dark:text-stone-100 truncate">{note.dateLabel || formatDate(note.date)}</p>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 truncate">{note.text.slice(0, 80) || 'No note content'}</p>
        </div>
        <span className="text-[11px] text-stone-400 dark:text-stone-500 font-mono flex-shrink-0">Note</span>
      </div>
    </button>
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="all-items-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            key="all-items-panel"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 z-50 w-full max-w-full md:right-0 md:top-0 md:bottom-0 md:left-auto md:max-w-xl bg-gradient-to-br from-white to-stone-50 dark:from-stone-900 dark:to-stone-800 shadow-2xl border-t border-stone-200/50 dark:border-stone-700/50 md:border-l md:border-t-0 overflow-hidden flex flex-col max-h-[90vh] md:max-h-full"
          >
            <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-stone-100/50 dark:border-stone-700/50" style={{ borderTopWidth: 4, borderTopColor: accentColor }}>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1">
                    {tab === 'events' ? <ListChecks size={12} /> : <StickyNote size={12} />}
                    {tab === 'events' ? 'All Events' : 'All Notes'}
                  </span>
                </p>
                <h2 className="mt-2 text-lg font-semibold text-stone-900 dark:text-stone-100">Browse your items</h2>
              </div>
              <button 
                className="w-10 h-10 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-all duration-200 hover:scale-110 active:scale-95" 
                onClick={onClose}
                aria-label="Close panel"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-stone-100/50 dark:border-stone-700/50 bg-stone-50/50 dark:bg-stone-900/50 flex-wrap">
              {['events', 'notes'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setTab(option)
                    setSelectedEntry(null)
                  }}
                  className={`rounded-full px-4 py-2 text-sm transition-all duration-200 font-medium ${tab === option ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 shadow-md' : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 hover:scale-105 active:scale-95'}`}
                >
                  {option === 'events' ? 'Events' : 'Notes'}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-5">
              <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                <div className="space-y-3">
                  {(tab === 'events' ? sortedEvents : sortedNotes).length > 0 ? (
                    (tab === 'events' ? sortedEvents : sortedNotes).map(item => (
                      tab === 'events' ? renderEventItem(item) : renderNoteItem(item)
                    ))
                  ) : (
                    <div className="rounded-3xl border border-stone-200 dark:border-stone-700 bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-800/50 dark:to-stone-900/50 p-6 text-sm text-stone-500 dark:text-stone-400 shadow-sm">
                      {tab === 'events'
                        ? 'No events found. Add one by double-clicking a date.'
                        : 'No notes found yet. Save a note by opening any date.'}
                    </div>
                  )}
                </div>

                <div className="rounded-3xl border border-stone-200 dark:border-stone-700 bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-800/50 dark:to-stone-900/50 p-5 min-h-[220px] shadow-sm">
                  {selectedEntry ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.25em] text-stone-400">Details</p>
                          <h3 className="mt-2 text-base font-semibold text-stone-900 dark:text-stone-100">
                            {selectedEntry.type === 'event' ? selectedEntry.value.title : formatDate(selectedEntry.value.date)}
                          </h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {selectedEntry.type === 'event' && (
                            <button
                              type="button"
                              onClick={() => onEditEvent(new Date(selectedEntry.value.date), selectedEntry.value)}
                              className="inline-flex items-center gap-2 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 px-4 py-2 text-sm hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 font-medium"
                              aria-label="Edit event"
                            >
                              <Pencil size={14} />
                              Edit
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              if (selectedEntry.type === 'event') {
                                onDeleteEvent(selectedEntry.value.id)
                              } else {
                                onDeleteNote(selectedEntry.value)
                              }
                              setSelectedEntry(null)
                            }}
                            className="inline-flex items-center gap-2 rounded-full border border-rose-200 dark:border-rose-900 px-3 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all duration-200 hover:scale-105 active:scale-95"
                            aria-label="Delete item"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-stone-600 dark:text-stone-300">
                        <p><span className="font-semibold text-stone-700 dark:text-stone-100">Date:</span> {selectedEntry.value.dateLabel || formatDate(selectedEntry.value.date)}</p>
                        {selectedEntry.type === 'event' ? (
                          <>
                            <p><span className="font-semibold text-stone-700 dark:text-stone-100">Category:</span> {EVENT_COLORS.find(c => c.id === selectedEntry.value.color)?.label || selectedEntry.value.color}</p>
                            {selectedEntry.value.note && <p><span className="font-semibold text-stone-700 dark:text-stone-100">Notes:</span> {selectedEntry.value.note}</p>}
                          </>
                        ) : (
                          <p>{selectedEntry.value.text || 'No note text available.'}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-sm text-stone-500 dark:text-stone-400">
                      <p className="font-medium text-stone-900 dark:text-stone-100">Select an item</p>
                      <p className="mt-2">Click any event or note to view full details here.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
