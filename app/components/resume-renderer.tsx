"use client"

import { ParsedResumeData } from "@/lib/resume"
import { SimpleResumeLayout } from "./layouts/demo"
import { LAYOUTS } from "@/lib/layouts"
import { MultiPageRenderer } from "@/components/ui/multi-page-renderer"
import { useLanguage } from "@/lib/language-context"

interface ResumeRendererProps {
  layoutId: string
  data: ParsedResumeData | null
  showWatermark?: boolean
  onUpdate?: (path: string, value: string) => void
  onPageCountChange?: (count: number) => void
}

/**
 * Resume Renderer Component
 * Renders the appropriate layout component based on layoutId.
 * Uses MultiPageRenderer for layout-agnostic, multi-page content overflow.
 */
export function ResumeRenderer({
  layoutId,
  data,
  showWatermark = false,
  onUpdate,
  onPageCountChange,
}: ResumeRendererProps) {
  const { t } = useLanguage()

  // REGISTRY PATTERN: Look up the component directly
  const layout = LAYOUTS.find(l => l.id === layoutId) || LAYOUTS[0]
  const LayoutComponent = layout.component || SimpleResumeLayout

  return (
    <div className="relative flex flex-col items-center">
      {/* MultiPageRenderer handles pagination — no compression, no scaling */}
      <MultiPageRenderer onPageCountChange={onPageCountChange}>
        <LayoutComponent data={data} labels={t.resume} onUpdate={onUpdate} />
      </MultiPageRenderer>

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