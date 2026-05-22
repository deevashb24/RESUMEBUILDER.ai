"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"

// A4 dimensions in pixels at 96 dpi (210mm × 297mm)
const A4_WIDTH_PX = 794
const A4_HEIGHT_PX = 1123

/**
 * Number of pixels from the bottom of a page within which a block header is
 * considered an "orphan" and pushed to the next page. Prevents a section
 * heading from appearing alone at the very foot of a page with no body content.
 */
const ORPHAN_SAFE_ZONE_PX = 72 // ≈ 6 lines

interface PageSlice {
  /** Y coordinate (inside the full content column) where this page's viewport starts */
  startY: number
  /** Y coordinate where this page was cut off by an avoid-break element */
  endY?: number
}

interface MultiPageRendererProps {
  children: React.ReactNode
  /** Called each time the page count changes */
  onPageCountChange?: (count: number) => void
}

/**
 * MultiPageRenderer — Layout-Agnostic Pagination Engine with Smart Break Detection
 *
 * Strategy:
 * 1. Render the full layout in a hidden, off-screen div at native A4 width so
 *    content flows to its natural height with zero compression.
 * 2. After layout, query every [data-avoid-break] element inside the container.
 * 3. Compute "smart" page break offsets:
 *    - Start with natural boundaries: 0, A4_H, 2×A4_H, …
 *    - If a block's top < boundary < block's bottom → the block crosses the
 *      boundary. Move the break to block.top so the block is pushed intact to
 *      the next page.
 *    - Orphan guard: if a block's top falls within ORPHAN_SAFE_ZONE_PX of the
 *      boundary bottom, also push it forward.
 * 4. Render one .a4-page-sheet per computed slice, each clipping via
 *    overflow:hidden + marginTop = -slice.startY.
 *
 * Print (react-to-print): relies on CSS break-inside:avoid applied to the
 * same [data-avoid-break] elements — the browser's print engine handles it.
 */
export function MultiPageRenderer({ children, onPageCountChange }: MultiPageRendererProps) {
  const measureRef = useRef<HTMLDivElement>(null)
  const [pageSlices, setPageSlices] = useState<PageSlice[]>([])
  const [naturalHeight, setNaturalHeight] = useState(0)
  const [ready, setReady] = useState(false)

  /**
   * Resolve an element's offsetTop relative to a specific ancestor container.
   * More reliable than getBoundingClientRect() for off-screen / hidden elements.
   */
  const getRelativeOffsetTop = (el: HTMLElement, container: HTMLElement): number => {
    let top = 0
    let current: HTMLElement | null = el
    while (current && current !== container) {
      top += current.offsetTop
      const parent = current.offsetParent as HTMLElement | null
      // Guard against the offsetParent chain escaping our container
      if (!parent || (parent !== container && !container.contains(parent))) break
      current = parent
    }
    return top
  }

  const computeBreaks = useCallback(() => {
    const container = measureRef.current
    if (!container) return

    const h = container.scrollHeight
    if (h === 0) return

    // ------------------------------------------------------------------
    // Collect all avoid-break elements and their positions inside the
    // measurement container. We use offsetTop traversal instead of
    // getBoundingClientRect() because the container is off-screen.
    // ------------------------------------------------------------------
    const avoidEls = Array.from(
      container.querySelectorAll<HTMLElement>('[data-avoid-break="true"]')
    ).map((el) => ({
      top: getRelativeOffsetTop(el, container),
      bottom: getRelativeOffsetTop(el, container) + el.offsetHeight,
    }))

    // ------------------------------------------------------------------
    // Build smart page break points iteratively
    // ------------------------------------------------------------------
    const slices: PageSlice[] = []
    let currentStart = 0

    while (currentStart < h) {
      const sliceStart = currentStart

      const naturalBreak = currentStart + A4_HEIGHT_PX
      if (naturalBreak >= h) {
        slices.push({ startY: sliceStart, endY: h })
        break
      }

      // Find the earliest position an avoid-break element forces us to break
      let adjustedBreak = naturalBreak

      for (const { top, bottom } of avoidEls) {
        // Case 1 — element straddles the natural page boundary → push break up
        if (top < naturalBreak && bottom > naturalBreak && top > currentStart) {
          adjustedBreak = Math.min(adjustedBreak, top)
        }

        // Case 2 — orphan guard: element starts in the safe zone near the bottom
        // of the page AND its body spills onto the next page
        if (
          top >= naturalBreak - ORPHAN_SAFE_ZONE_PX &&
          top < naturalBreak &&
          bottom > naturalBreak &&
          top > currentStart
        ) {
          adjustedBreak = Math.min(adjustedBreak, top)
        }
      }

      // Safety valve: if adjustedBreak hasn't advanced (e.g. a single block is
      // taller than a full page), fall back to the natural boundary to prevent
      // an infinite loop.
      if (adjustedBreak <= currentStart) {
        adjustedBreak = naturalBreak
      }

      slices.push({ startY: sliceStart, endY: adjustedBreak })
      currentStart = adjustedBreak
    }

    setPageSlices(slices)
    setNaturalHeight(h)
    setReady(true)
    onPageCountChange?.(slices.length)
  }, [onPageCountChange])

  useEffect(() => {
    // Initial measure after children have painted
    const raf = requestAnimationFrame(() => computeBreaks())

    // Re-measure whenever the content height changes (edits, images loading, etc.)
    const observer = new ResizeObserver(() => computeBreaks())
    if (measureRef.current) observer.observe(measureRef.current)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [children, computeBreaks])

  return (
    <div className="multi-page-resume-root">
      {/* ─── Hidden measurement container ──────────────────────────────────
          Positioned off-screen so it doesn't affect visible layout.
          Uses a grid context so h-full children resolve to content height
          rather than collapsing to 0 under height:auto.
      ──────────────────────────────────────────────────────────────────── */}
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
          display: "grid",
          gridTemplateRows: "auto",
        }}
      >
        <div
          ref={measureRef}
          style={{
            width: A4_WIDTH_PX,
            minHeight: A4_HEIGHT_PX,
            height: "auto",
          }}
        >
          {children}
        </div>
      </div>

      {/* ─── Visible paginated output ───────────────────────────────────── */}
      {ready &&
        pageSlices.map((slice, pageIndex) => (
          <div
            key={pageIndex}
            className="a4-page-sheet"
            style={{
              width: A4_WIDTH_PX,
              height: A4_HEIGHT_PX,
              overflow: "hidden",
              position: "relative",
              background: "white",
              marginBottom: pageIndex < pageSlices.length - 1 ? 24 : 0,
              boxShadow: "0 8px 40px rgba(0,0,0,0.55)",
              flexShrink: 0,
            }}
          >
            {/*
             * Shift the full content column upward by the slice's startY so that
             * only the correct vertical strip is visible through the clipping viewport.
             */}
            <div
              style={{
                width: A4_WIDTH_PX,
                marginTop: -slice.startY,
                height: naturalHeight,
                pointerEvents: "all",
              }}
            >
              {children}
            </div>

            {/* White overlay mask to hide overlapping content pushed to the next page */}
            {slice.endY !== undefined && slice.endY - slice.startY < A4_HEIGHT_PX && (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: A4_HEIGHT_PX - (slice.endY - slice.startY),
                  backgroundColor: "white",
                  zIndex: 50,
                  pointerEvents: "none"
                }}
              />
            )}
          </div>
        ))}

      {/* ─── Loading skeleton ───────────────────────────────────────────── */}
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
