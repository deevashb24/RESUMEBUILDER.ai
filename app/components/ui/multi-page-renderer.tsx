"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"

// A4 dimensions in pixels at 96dpi (standard screen resolution)
// 210mm × 297mm → 794px × 1123px
const A4_WIDTH_PX = 794
const A4_HEIGHT_PX = 1123

interface MultiPageRendererProps {
  children: React.ReactNode
  /** Called with the total number of rendered pages */
  onPageCountChange?: (count: number) => void
}

/**
 * MultiPageRenderer — Layout-Agnostic Pagination Engine
 *
 * Strategy:
 * 1. Render the layout content at full native A4 width in a hidden
 *    off-screen container so it can reflow to its natural height.
 * 2. Measure the total natural height.
 * 3. Compute page count = ceil(naturalHeight / A4_HEIGHT_PX).
 * 4. For each page N, render a clipping viewport that shows a
 *    [N * A4_HEIGHT_PX] vertical slice of the content via
 *    `overflow: hidden` + negative `marginTop` offset.
 *
 * This preserves 100% design fidelity — no scaling, no compression.
 * The PDF export (react-to-print) picks up each .a4-page-sheet element
 * and the @page CSS rule handles natural page breaks.
 */
export function MultiPageRenderer({ children, onPageCountChange }: MultiPageRendererProps) {
  const measureRef = useRef<HTMLDivElement>(null)
  const [pageCount, setPageCount] = useState(1)
  const [naturalHeight, setNaturalHeight] = useState(0)
  const [ready, setReady] = useState(false)

  const measure = useCallback(() => {
    if (!measureRef.current) return
    const h = measureRef.current.scrollHeight
    if (h === 0) return
    const pages = Math.max(1, Math.ceil(h / A4_HEIGHT_PX))
    setNaturalHeight(h)
    setPageCount(pages)
    setReady(true)
    onPageCountChange?.(pages)
  }, [onPageCountChange])

  useEffect(() => {
    // Initial measure after children paint
    const raf = requestAnimationFrame(() => {
      measure()
    })

    // Watch for layout changes (images loading, fonts, content edits)
    const observer = new ResizeObserver(() => measure())
    if (measureRef.current) observer.observe(measureRef.current)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [children, measure])

  return (
    <div className="multi-page-resume-root">
      {/* ─── Hidden measurement container ─────────────────────────────── */}
      {/*
       * Renders content at A4 width with no height ceiling.
       * The inner wrapper uses `display: grid; grid-template-rows: auto`
       * so `h-full` children inside layout components resolve to content-fit
       * rather than collapsing to 0 (which happens with height: auto on parent).
       */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          top: 0,
          width: A4_WIDTH_PX,
          overflow: "visible",
          pointerEvents: "none",
          visibility: "hidden",
          // Grid context makes children with h-full resolve to content height
          display: "grid",
          gridTemplateRows: "auto",
        }}
      >
        <div
          ref={measureRef}
          style={{
            width: A4_WIDTH_PX,
            // min-height so layouts with h-full render at least 1 page
            minHeight: A4_HEIGHT_PX,
            height: "auto",
          }}
        >
          {children}
        </div>
      </div>

      {/* ─── Visible paginated output ──────────────────────────────────── */}
      {ready && Array.from({ length: pageCount }).map((_, pageIndex) => {
        const offsetY = pageIndex * A4_HEIGHT_PX
        return (
          <div
            key={pageIndex}
            className="a4-page-sheet"
            style={{
              width: A4_WIDTH_PX,
              height: A4_HEIGHT_PX,
              overflow: "hidden",
              position: "relative",
              background: "white",
              // Spacing between pages in screen view
              marginBottom: pageIndex < pageCount - 1 ? 24 : 0,
              boxShadow: "0 8px 40px rgba(0,0,0,0.55)",
              flexShrink: 0,
            }}
          >
            {/* Content is shifted up by the page offset */}
            <div
              style={{
                width: A4_WIDTH_PX,
                // Shift the entire content up to show the correct slice
                marginTop: -offsetY,
                // Total height is the natural content height
                height: naturalHeight,
                pointerEvents: "all",
              }}
            >
              {children}
            </div>
          </div>
        )
      })}

      {/* Skeleton placeholder while measuring */}
      {!ready && (
        <div
          style={{
            width: A4_WIDTH_PX,
            height: A4_HEIGHT_PX,
            background: "white",
            boxShadow: "0 8px 40px rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ opacity: 0.3, fontSize: 13, color: "#666" }}>Rendering…</div>
        </div>
      )}
    </div>
  )
}
