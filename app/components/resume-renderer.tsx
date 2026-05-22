"use client"

import React, { useEffect } from "react"
import { ParsedResumeData } from "@/lib/resume"
import { SimpleResumeLayout } from "./layouts/demo"
import { LAYOUTS } from "@/lib/layouts"
import { MultiPageRenderer } from "@/components/ui/multi-page-renderer"
import { AutoScaleWrapper } from "@/components/ui/auto-scale-wrapper"
import { useLanguage } from "@/lib/language-context"

interface ResumeRendererProps {
  layoutId: string
  data: ParsedResumeData | null
  showWatermark?: boolean
  onUpdate?: (path: string, value: string) => void
  onPageCountChange?: (count: number) => void
  pageMode?: "single" | "multi"
  onScaleChange?: (scale: number) => void
}

/**
 * Resume Renderer Component
 * Renders the appropriate layout component based on layoutId.
 * Supports toggling between Single Page (using AutoScaleWrapper) and Multi Page (using MultiPageRenderer) layouts.
 */
export function ResumeRenderer({
  layoutId,
  data,
  showWatermark = false,
  onUpdate,
  onPageCountChange,
  pageMode = "single",
  onScaleChange,
}: ResumeRendererProps) {
  const { t } = useLanguage()

  // REGISTRY PATTERN: Look up the component directly
  const layout = LAYOUTS.find(l => l.id === layoutId) || LAYOUTS[0]
  const LayoutComponent = layout.component || SimpleResumeLayout

  // Single page mode is always 1 page. Ensure it's reported back to parent.
  useEffect(() => {
    if (pageMode === "single") {
      onPageCountChange?.(1)
    }
  }, [pageMode, onPageCountChange])

  return (
    <div className="relative flex flex-col items-center">
      {pageMode === "single" ? (
        <AutoScaleWrapper onScaleChange={onScaleChange}>
          <LayoutComponent data={data} labels={t.resume} onUpdate={onUpdate} />
        </AutoScaleWrapper>
      ) : (
        <MultiPageRenderer onPageCountChange={onPageCountChange}>
          <LayoutComponent data={data} labels={t.resume} onUpdate={onUpdate} />
        </MultiPageRenderer>
      )}

      {showWatermark && (
        <div className="absolute inset-x-0 bottom-0 p-4 flex justify-center items-end bg-gradient-to-t from-white/90 to-transparent pointer-events-none print:hidden z-20">
          <div className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full shadow-sm text-xs font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <span>{t.footer.madeWith}</span>
            <span className="text-indigo-600 font-bold">ResumeBuilder.ai</span>
          </div>
        </div>
      )}
    </div>
  )
}