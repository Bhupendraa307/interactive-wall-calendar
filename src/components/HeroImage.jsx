import React, { useEffect, useRef, useCallback, useState } from 'react'
import { HERO_IMAGES, MONTH_NAMES } from '../utils/calendarData'

const MONTH_FALLBACK_COLORS = [
  '#64748b', '#2563eb', '#0ea5e9', '#f97316',
  '#16a34a', '#0891b2', '#0f766e', '#facc15',
  '#7c3aed', '#ec4899', '#ef4444', '#0f172a',
]

/**
 * HeroImage — top section of the wall calendar.
 * Shows a full-width landscape photo with month/year overlay.
 * Extracts dominant color from image via hidden canvas → calls onColorExtract.
 */
export default function HeroImage({ currentMonth, currentYear, onColorExtract }) {
  const [hasImageError, setHasImageError] = useState(false)
  const [displayUrl, setDisplayUrl] = useState('')
  const imgRef = useRef(null)
  const canvasRef = useRef(null)
  const hero = HERO_IMAGES[currentMonth] || { url: '', label: 'Calendar hero' }

  useEffect(() => {
    setHasImageError(false)
    setDisplayUrl(hero.url)
    onColorExtract(MONTH_FALLBACK_COLORS[currentMonth] || '#6366f1')
  }, [currentMonth, hero.url, onColorExtract])

  // Extract dominant color from loaded image
  const extractColor = useCallback(() => {
    const img = imgRef.current
    const canvas = canvasRef.current
    if (!img || !canvas) return

    try {
      canvas.width = 10
      canvas.height = 10
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, 10, 10)
      const data = ctx.getImageData(0, 0, 10, 10).data

      // Average color of pixels (skip very dark/bright ones for better accent)
      let r = 0, g = 0, b = 0, count = 0
      for (let i = 0; i < data.length; i += 4) {
        const brightness = (data[i] + data[i+1] + data[i+2]) / 3
        if (brightness > 40 && brightness < 215) {
          r += data[i]; g += data[i+1]; b += data[i+2]; count++
        }
      }
      if (count > 0) {
        // Boost saturation a bit for a more vibrant accent
        const avg_r = Math.round((r / count) * 1.2)
        const avg_g = Math.round((g / count) * 1.1)
        const avg_b = Math.round((b / count) * 1.3)
        onColorExtract(`rgb(${Math.min(avg_r,255)}, ${Math.min(avg_g,255)}, ${Math.min(avg_b,255)})`)
      }
    } catch {
      // CORS failure — fall back to default accent
      onColorExtract('#4f6ef7')
    }
  }, [onColorExtract])

  // Spiral binding pattern — 18 rings across the top
  const spirals = Array.from({ length: 18 }, (_, i) => i)

  return (
    <div className="relative w-full">
      {/* Hidden canvas for color extraction */}
      <canvas ref={canvasRef} className="hidden" crossOrigin="anonymous" />

      {/* Hanging hook */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 z-20 flex items-end justify-center h-6">
        <div className="w-10 h-5 rounded-b-full bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-sm" />
      </div>

      {/* Spiral binding */}
      <div className="relative z-10 flex justify-center items-end gap-1.5 sm:gap-2.5 md:gap-[28px] px-4 sm:px-5 md:px-6 h-5 mt-1 -mb-2 overflow-hidden">
        {spirals.map(i => (
          <div
            key={i}
            className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 rounded-full border-2 md:border-[2.5px] border-stone-300 dark:border-stone-600 bg-stone-100 dark:bg-stone-800 shadow-inner"
          />
        ))}
      </div>

      {/* Hero image container */}
      <div className="relative w-full h-48 sm:h-56 md:h-72 overflow-hidden rounded-t-2xl border border-stone-200 dark:border-stone-800 bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-700 dark:to-stone-800 shadow-lg">
        {displayUrl ? (
          <img
            ref={imgRef}
            src={displayUrl}
            alt={hero.label}
            decoding="async"
            crossOrigin="anonymous"
            onLoad={extractColor}
            onError={() => {
              setHasImageError(true)
              onColorExtract(MONTH_FALLBACK_COLORS[currentMonth] || '#6366f1')
            }}
            className={`w-full h-full object-cover transition-all duration-700 ${hasImageError ? 'hidden' : ''}`}
          />
        ) : null}

        {hasImageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-stone-300 to-stone-400 dark:from-stone-800 dark:to-stone-900 text-stone-700 dark:text-stone-200 text-sm font-medium">
            Hero image unavailable
          </div>
        )}

        {/* Subtle paper texture overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-black/10 dark:from-transparent dark:via-black/5 dark:to-white/5 pointer-events-none" />

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />

        {/* Month & year text */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 md:p-6">
          <p className="font-mono text-white/70 text-xs tracking-[0.2em] uppercase mb-1">
            {currentYear}
          </p>
          <h2 className="font-display text-white text-2xl sm:text-3xl md:text-4xl font-bold leading-none tracking-tight drop-shadow-lg">
            {MONTH_NAMES[currentMonth]}
          </h2>
        </div>

        {/* Image label badge */}
        <div className="absolute top-3 right-3 hidden sm:block bg-black/30 backdrop-blur-sm text-white/80 text-xs font-mono px-2 py-1 rounded-full">
          {hero.label}
        </div>
      </div>
    </div>
  )
}
