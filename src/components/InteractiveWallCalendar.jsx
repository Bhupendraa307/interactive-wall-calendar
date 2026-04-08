import React, { useState, useCallback, useMemo } from 'react'
import confetti from 'canvas-confetti'
import { useCalendar }               from '../hooks/useCalendar'
import { useNotes }                  from '../hooks/useNotes'
import { useDarkMode }               from '../hooks/useDarkMode'
import { useEvents }                 from '../hooks/useEvents'
import HeroImage                     from './HeroImage'
import CalendarHeader                from './CalendarHeader'
import CalendarGrid                  from './CalendarGrid'
import EventModal                    from './EventModal'
import AllItemsPanel                 from './AllItemsPanel'
import RangeSummary                  from './RangeSummary'
import StatsPanel                    from './StatsPanel'
import DayDetailPanel                from './DayDetailPanel'

/**
 * InteractiveWallCalendar — root component.
 * Composes all sub-components; keeps rendering logic lean.
 */
export default function InteractiveWallCalendar() {
  const { isDark, toggle: toggleDark }                         = useDarkMode()
  const { notes, getNote, setNote, hasNote, getMonthNote, setMonthNote } = useNotes()
  const {
    events, getEventsForDay, getEventsForMonth,
    addEvent, updateEvent, deleteEvent, hasEvents, exportMonth,
  } = useEvents()

  // ── UI state ─────────────────────────────────────────────────────────────
  const [accentColor, setAccentColor]         = useState('#6366f1')
  const [selectedDate, setSelectedDate]       = useState(null)
  const [direction, setDirection]             = useState('next')
  const [monthKey, setMonthKey]               = useState(0)

  // Modal / panel visibility
  const [eventModalDay, setEventModalDay]         = useState(null)
  const [rangeEventModalOpen, setRangeEventModalOpen] = useState(false)
  const [initialEditEvent, setInitialEditEvent]   = useState(null)
  const [allPanelOpen, setAllPanelOpen]           = useState(false)
  const [allPanelMode, setAllPanelMode]           = useState('events')

  // Monthly memo inline editor
  const [monthlyMemoDraft, setMonthlyMemoDraft] = useState('')
  const [memoEditing, setMemoEditing]           = useState(false)

  // Date search
  const [searchValue, setSearchValue] = useState('')

  // ── Calendar hook ────────────────────────────────────────────────────────
  const {
    currentYear, currentMonth, calendarDays,
    rangeStart, rangeEnd, rangeDays,
    setHoverDate,
    prevMonth, nextMonth, goToToday, goToDate,
    handleDayClick, handleDragStart, handleDragEnter, handleDragEnd,
    getDayStatus, clearRange, today,
  } = useCalendar()

  const isCurrentMonth = currentYear === today.year && currentMonth === today.month

  // ── Derived data ─────────────────────────────────────────────────────────
  const monthEvents = useMemo(
    () => getEventsForMonth(currentYear, currentMonth),
    [getEventsForMonth, currentYear, currentMonth]
  )

  const notesCount = useMemo(() => {
    const prefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-`
    return Object.keys(notes).filter(k => k.startsWith(prefix)).length
  }, [currentYear, currentMonth, notes])

  const selectedDateEvents = useMemo(
    () => selectedDate ? getEventsForDay(currentYear, currentMonth, selectedDate) : [],
    [selectedDate, currentYear, currentMonth, getEventsForDay]
  )

  const selectedDateNote = useMemo(
    () => selectedDate ? getNote(currentYear, currentMonth, selectedDate) : '',
    [selectedDate, currentYear, currentMonth, getNote]
  )

  const monthlyMemo = useMemo(
    () => getMonthNote(currentYear, currentMonth),
    [getMonthNote, currentYear, currentMonth]
  )

  const allEvents = useMemo(
    () => events.slice().sort((a, b) => a.date.localeCompare(b.date)),
    [events]
  )

  const allNotes = useMemo(
    () => Object.entries(notes)
      .map(([key, text]) => {
        const parts = key.split('-').map(Number)
        const isMonthly = parts.length === 2
        const [year, month, day] = parts
        const monthIndex = (month || 1) - 1
        const safeDay = isMonthly ? 1 : day
        return {
          id: key,
          year,
          month: monthIndex,
          day: isMonthly ? null : day,
          text,
          isMonthly,
          date: new Date(year, monthIndex, safeDay),
          dateLabel: isMonthly
            ? new Date(year, monthIndex, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
            : null,
        }
      })
      .sort((a, b) => a.date - b.date),
    [notes]
  )

  const getEventColors = useCallback(
    (yr, mo, day) => getEventsForDay(yr, mo, day).map(e => e.color),
    [getEventsForDay]
  )

  // ── Navigation ───────────────────────────────────────────────────────────
  const handlePrev = useCallback(() => {
    setDirection('prev'); setMonthKey(k => k - 1); prevMonth()
  }, [prevMonth])

  const handleNext = useCallback(() => {
    setDirection('next'); setMonthKey(k => k + 1); nextMonth()
  }, [nextMonth])

  // ── Date search ──────────────────────────────────────────────────────────
  const handleSearch = useCallback((e) => {
    e.preventDefault()
    const normalized = searchValue.trim()
    if (!normalized) return
    let target = new Date(normalized)
    if (Number.isNaN(target.getTime())) target = new Date(`${normalized} ${today.year}`)
    if (!Number.isNaN(target.getTime())) {
      goToDate(target)
      setSelectedDate(target.getDate())
    }
    setSearchValue('')
  }, [searchValue, today.year, goToDate])

  // ── Day interactions ─────────────────────────────────────────────────────
  const handleDayClickWithConfetti = useCallback((day) => {
    if (!day) return
    setAllPanelOpen(false)
    const hadStart = !!rangeStart && !rangeEnd
    setSelectedDate(day)
    handleDayClick(day)
    if (hadStart) {
      setTimeout(() => {
        confetti({
          particleCount: 60,
          spread: 55,
          origin: { y: 0.6 },
          colors: [accentColor, '#ffffff', `${accentColor}99`],
          ticks: 80,
          scalar: 0.8,
        })
      }, 50)
    }
  }, [handleDayClick, rangeStart, rangeEnd, accentColor])

  const handleDayDoubleClick = useCallback((day) => {
    if (!day) return
    handleDragEnd()
    setAllPanelOpen(false)
    setSelectedDate(day)
    setEventModalDay(day)
    setInitialEditEvent(null)
  }, [handleDragEnd])

  const openEventModal = useCallback((dayOrDate, initialEvent = null) => {
    if (!dayOrDate) return
    handleDragEnd()
    let day = dayOrDate
    if (dayOrDate instanceof Date) { day = dayOrDate.getDate(); goToDate(dayOrDate) }
    setSelectedDate(day)
    setEventModalDay(day)
    setInitialEditEvent(initialEvent)
    setAllPanelOpen(false)
  }, [goToDate, handleDragEnd])

  // ── Range event ──────────────────────────────────────────────────────────
  const handleOpenRangeEventModal = useCallback(() => {
    if (!rangeStart || !rangeEnd) return
    setAllPanelOpen(false)
    setRangeEventModalOpen(true)
  }, [rangeStart, rangeEnd])

  const handleAddRangeEvents = useCallback((startDay, endDay, eventData) => {
    const lo = Math.min(startDay, endDay)
    const hi = Math.max(startDay, endDay)
    for (let d = lo; d <= hi; d++) addEvent(currentYear, currentMonth, d, eventData)
    setRangeEventModalOpen(false)
    clearRange()
  }, [addEvent, currentYear, currentMonth, clearRange])

  // ── Monthly memo ─────────────────────────────────────────────────────────
  const handleEditMonthlyMemo = useCallback(() => {
    setMonthlyMemoDraft(monthlyMemo)
    setMemoEditing(true)
  }, [monthlyMemo])

  const handleSaveMemo = useCallback(() => {
    setMonthNote(currentYear, currentMonth, monthlyMemoDraft)
    setMemoEditing(false)
  }, [currentYear, currentMonth, monthlyMemoDraft, setMonthNote])

  const handleCancelMemo = useCallback(() => {
    setMemoEditing(false)
    setMonthlyMemoDraft(monthlyMemo)
  }, [monthlyMemo])

  // ── Export ───────────────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('wall_calendar_notes') || '{}')
      exportMonth(currentYear, currentMonth, stored)
    } catch {
      exportMonth(currentYear, currentMonth, {})
    }
  }, [exportMonth, currentYear, currentMonth])

  // ── All-panel helpers ────────────────────────────────────────────────────
  const handleOpenAll = useCallback((mode) => {
    setAllPanelMode(mode)
    setAllPanelOpen(true)
    setEventModalDay(null)
    setInitialEditEvent(null)
  }, [])

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-stone-50 via-stone-100 to-stone-200 dark:from-stone-900 dark:via-stone-800 dark:to-stone-700 flex items-start justify-center p-3 sm:p-4 md:p-6 transition-all duration-500">
      <div className="w-full max-w-7xl flex flex-col">

        {/* ── Top bar ── */}
        <div className="mb-2 grid gap-2 px-1 grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center flex-shrink-0">
          <div className="text-center sm:col-start-2">
            <p className="font-mono text-sm sm:text-base text-stone-600 dark:text-stone-300 uppercase tracking-[0.2em] font-semibold">
              Interactive Wall Calendar
            </p>
          </div>

          <form
            onSubmit={handleSearch}
            className="flex w-full sm:w-auto items-center gap-2 flex-wrap sm:justify-end sm:col-start-3 sm:justify-self-end"
          >
            <input
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              placeholder="Search  YYYY-MM-DD"
              aria-label="Search or jump to a date"
              className="w-full sm:w-auto sm:min-w-[200px] bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-full px-4 py-2 text-sm text-stone-700 dark:text-stone-200 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-shadow"
              onFocus={e => { e.target.style.boxShadow = `0 0 0 2px ${accentColor}40` }}
              onBlur={e  => { e.target.style.boxShadow = 'none' }}
            />
            <button
              type="submit"
              className="rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-4 py-2 text-sm hover:opacity-80 transition-opacity"
            >
              Go
            </button>
            <button
              type="button"
              onClick={() => handleOpenAll('events')}
              className="rounded-full px-4 py-2 text-sm text-white transition-opacity hover:opacity-80"
              style={{ backgroundColor: accentColor }}
            >
              All Events
            </button>
            <button
              type="button"
              onClick={() => handleOpenAll('notes')}
              className="rounded-full bg-amber-500 text-white px-4 py-2 text-sm hover:opacity-80 transition-opacity"
            >
              All Notes
            </button>
          </form>
        </div>

        {/* ── Main card ── */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-lg border border-stone-200/50 dark:border-stone-700/50 overflow-hidden flex-1 flex flex-col md:flex-row min-h-0">

          {/* LEFT — hero + stats */}
          <div className="md:w-[40%] flex-shrink-0 flex flex-col overflow-hidden border-b md:border-b-0 md:border-r border-stone-100 dark:border-stone-800">
            <HeroImage
              currentMonth={currentMonth}
              currentYear={currentYear}
              onColorExtract={setAccentColor}
            />

            <div className="hidden md:flex flex-col px-4 pb-4 pt-3 flex-1 gap-3 overflow-y-auto">
              <RangeSummary
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                onClear={clearRange}
                accentColor={accentColor}
                onCreateRangeEvent={handleOpenRangeEventModal}
              />

              <StatsPanel
                currentYear={currentYear}
                currentMonth={currentMonth}
                monthEvents={monthEvents}
                rangeDays={rangeDays}
                notesCount={notesCount}
                onExport={handleExport}
                accentColor={accentColor}
              />

              {/* Legend */}
              <div>
                <p className="font-mono text-[10px] text-stone-400 uppercase tracking-widest mb-2">Legend</p>
                <div className="space-y-1.5">
                  {[
                    { style: 'ring',  label: 'Today',    color: accentColor },
                    { style: 'fill',  label: 'Selected', color: accentColor },
                    { style: 'rose',  label: 'Sunday',   color: '#f43f5e' },
                    { style: 'amber', label: 'Holiday',  color: '#f59e0b' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-lg flex-shrink-0 flex items-center justify-center"
                        style={{
                          backgroundColor:
                            item.style === 'fill'  ? item.color :
                            item.style === 'rose'  ? '#fff1f2' :
                            item.style === 'amber' ? '#fffbeb' : 'transparent',
                          boxShadow: item.style === 'ring' ? `inset 0 0 0 2px ${item.color}` : 'none',
                        }}
                      >
                        {item.style === 'amber' && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                      </div>
                      <span className="text-xs text-stone-500 dark:text-stone-400">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[11px] font-mono text-stone-400 dark:text-stone-500 pt-1 border-t border-stone-100 dark:border-stone-800">
                Double-click any day to add events or notes.
              </p>
            </div>
          </div>

          {/* RIGHT — calendar grid */}
          <div className="flex-1 px-3 md:px-5 pb-4 flex flex-col min-h-0">
            <CalendarHeader
              currentYear={currentYear}
              currentMonth={currentMonth}
              onPrev={handlePrev}
              onNext={handleNext}
              onToday={goToToday}
              onClearRange={clearRange}
              hasRange={!!(rangeStart || rangeEnd)}
              isDark={isDark}
              onToggleDark={toggleDark}
              accentColor={accentColor}
              isCurrentMonth={isCurrentMonth}
            />

            <CalendarGrid
              calendarDays={calendarDays}
              currentYear={currentYear}
              currentMonth={currentMonth}
              selectedDate={selectedDate}
              getDayStatus={getDayStatus}
              hasNote={(yr, mo, day) => hasNote(yr, mo, day) || hasEvents(yr, mo, day)}
              getEventColors={getEventColors}
              handleDayClick={handleDayClickWithConfetti}
              setHoverDate={setHoverDate}
              handleDragStart={handleDragStart}
              handleDragEnter={handleDragEnter}
              handleDragEnd={handleDragEnd}
              direction={direction}
              monthKey={monthKey}
              accentColor={accentColor}
              onDayDoubleClick={handleDayDoubleClick}
            />

            {/* Day detail panel (desktop + mobile) */}
            <DayDetailPanel
              selectedDate={selectedDate}
              currentYear={currentYear}
              currentMonth={currentMonth}
              selectedDateEvents={selectedDateEvents}
              selectedDateNote={selectedDateNote}
              monthlyMemo={monthlyMemo}
              memoEditing={memoEditing}
              monthlyMemoDraft={monthlyMemoDraft}
              onClearDate={() => setSelectedDate(null)}
              onEditNote={() => { if (selectedDate) { setEventModalDay(selectedDate); setInitialEditEvent(null) } }}
              onEditMonthlyMemo={handleEditMonthlyMemo}
              onSaveMemo={handleSaveMemo}
              onCancelMemo={handleCancelMemo}
              onMemoChange={setMonthlyMemoDraft}
              onOpenEvent={(evt) => openEventModal(selectedDate, evt)}
              accentColor={accentColor}
            />

            {/* Mobile-only: range summary + stats */}
            <div className="md:hidden mt-2 space-y-2 flex-shrink-0">
              <RangeSummary
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                onClear={clearRange}
                accentColor={accentColor}
                onCreateRangeEvent={handleOpenRangeEventModal}
              />
              <StatsPanel
                currentYear={currentYear}
                currentMonth={currentMonth}
                monthEvents={monthEvents}
                rangeDays={rangeDays}
                notesCount={notesCount}
                onExport={handleExport}
                accentColor={accentColor}
              />
            </div>
          </div>
        </div>

      </div>

      {/* ── Overlays ── */}
      <AllItemsPanel
        isOpen={allPanelOpen}
        activeTab={allPanelMode}
        events={allEvents}
        notes={allNotes}
        onClose={() => setAllPanelOpen(false)}
        onEditEvent={openEventModal}
        onDeleteEvent={deleteEvent}
        onDeleteNote={(note) => {
          if (!note?.id) return
          const parts = note.id.split('-').map(Number)
          if (parts.length === 2) {
            const [year, month] = parts
            setMonthNote(year, month - 1, '')
          } else if (parts.length === 3) {
            const [year, month, day] = parts
            setNote(year, month - 1, day, '')
          }
        }}
        accentColor={accentColor}
      />

      <EventModal
        day={rangeEventModalOpen ? null : eventModalDay}
        year={currentYear}
        month={currentMonth}
        rangeStart={rangeEventModalOpen ? rangeStart : null}
        rangeEnd={rangeEventModalOpen ? rangeEnd : null}
        events={eventModalDay ? getEventsForDay(currentYear, currentMonth, eventModalDay) : []}
        initialEvent={initialEditEvent}
        getNote={getNote}
        setNote={setNote}
        onAddEvent={addEvent}
        onAddRangeEvents={handleAddRangeEvents}
        onUpdateEvent={updateEvent}
        onDeleteEvent={deleteEvent}
        onInteractionReset={handleDragEnd}
        onClose={() => {
          handleDragEnd()
          setEventModalDay(null)
          setInitialEditEvent(null)
          setRangeEventModalOpen(false)
        }}
        accentColor={accentColor}
      />
    </div>
  )
}
