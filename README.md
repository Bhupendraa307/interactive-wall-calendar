# Interactive Wall Calendar

A production-grade React wall calendar built for the TakeUforward SWE Intern challenge.

## Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 + Vite | Fast dev, modern React |
| Tailwind CSS | Utility-first styling, dark mode via `class` |
| Framer Motion | Month slide + modal spring animations |
| canvas-confetti | Delight moment on range complete |
| Lucide React | Clean icon set |
| localStorage | Zero-backend data persistence |

## How to Run

```bash
npm install
npm run dev
# → http://localhost:5173
```

## Deploy

```bash
npm run build          # output → /dist
npx vercel --prod      # deploy to Vercel
# or drag /dist to netlify.com/drop
```

## Features

### Core Requirements ✅
- Wall calendar aesthetic with hero image (local PNG per month) + CSS spiral binding
- Monthly calendar grid built from scratch — zero external calendar libraries
- **Date range selection** — click-to-click OR click-and-drag
- Hover preview before confirming end date
- Today's date highlighted with dynamic accent color ring
- Sundays (rose) and Saturdays (orange) styled distinctly
- Dark / light mode toggle with localStorage persistence

### Events System ✅
- **Double-click any day** → EventModal opens
- Add titled events with 6 color categories: Work / Personal / Travel / Health / Social / Other
- **Optional event time** (HH:MM) shown on event cards and exported
- Edit and delete existing events inline
- Day notes alongside events in the same modal (auto-saved on blur)
- Colored event dots on each calendar day cell

### Notes System ✅
- Per-date notes (auto-saved on blur in EventModal)
- **Monthly memo** — a separate free-text note for the whole month, editable inline
- **AllItemsPanel** — browse every event and note across all months in one panel
- All data persists in `localStorage` (survives refresh)

### Bonus / Stand-out ✅
| Feature | Detail |
|---------|--------|
| 🎉 Confetti | Fires when a date range is completed |
| 📊 Stats panel | Event count by category with progress bars, notes count, range days |
| 📥 Export | Downloads month's events + notes (including times) as `.txt` |
| 🖼️ Dynamic accent color | Extracted from hero image via `<canvas>`, drives entire UI theme |
| 🇮🇳 Indian public holidays | Amber dot + tooltip on Republic Day, Independence Day, Gandhi Jayanti etc. |
| ⌨️ Keyboard navigation | Arrow keys move between days; Enter/Space selects |
| ↩️ Today button | Appears when viewing another month |
| ✨ Stagger animations | Day cells animate in sequentially on month change |
| 🔍 Date search | Type a date (e.g. `2026-08-15`) and jump to it instantly |
| 📋 Range event creation | Select a range → "Add event" applies it to every day in range |

## Folder Structure

```
src/
├── components/
│   ├── InteractiveWallCalendar.jsx  ← root, wires everything
│   ├── HeroImage.jsx                ← photo + spiral binding + color extraction
│   ├── CalendarHeader.jsx           ← navigation + today + dark mode toggle
│   ├── CalendarGrid.jsx             ← 7-col grid, Framer Motion, drag support
│   ├── DayCell.jsx                  ← single day (all visual states)
│   ├── DayDetailPanel.jsx           ← inline selected-date detail + monthly memo
│   ├── EventModal.jsx               ← event CRUD + day note + time field
│   ├── AllItemsPanel.jsx            ← global events + notes browser panel
│   ├── StatsPanel.jsx               ← month stats + export button
│   └── RangeSummary.jsx             ← selected range display
├── hooks/
│   ├── useCalendar.js               ← grid, range, drag, navigation
│   ├── useEvents.js                 ← event CRUD + export (makeKey outside hook)
│   ├── useNotes.js                  ← per-date + monthly notes + localStorage
│   └── useDarkMode.js               ← theme with localStorage persistence
└── utils/
    └── calendarData.js              ← local hero images, holidays, constants
```

## Interaction Guide

| Gesture | Action |
|---------|--------|
| Single click | Set range start / end |
| Click + drag | Select range in one motion |
| Double-click | Open event + note editor |
| Arrow keys | Navigate between day cells |
| Enter / Space | Select focused day |
| Type date + Go | Jump to any date |
| Click `today` badge | Return to current month |
| Click trash icon | Clear range selection |
| Click `Export` | Download month as `.txt` |
| Click `All Events` | Open global events browser |
| Click `All Notes` | Open global notes browser |

## Design Decisions

1. **No calendar library** — grid built from `new Date()` primitives, demonstrating core JS
2. **Local hero images** — bundled PNGs avoid CORS errors during demo
3. **makeKey outside hook** — helper function defined at module scope so it is never recreated on render
4. **Accent color from image canvas** — drives selection highlights, modal border, dots — coherent per-month identity automatically
5. **Double-click for events, single-click for range** — avoids interaction conflict
6. **DayDetailPanel extracted** — keeps root component under 200 lines, demonstrates component thinking
7. **Time field on events** — even optional, makes it feel like a real calendar app
"# interactive-wall-calendar" 
