"use client"

import { ParsedResumeData } from "@/lib/resume"
import { SimpleResumeLayout } from "./layouts/demo"
import { LAYOUTS } from "@/lib/layouts"
import { AutoScaleWrapper } from "@/components/ui/auto-scale-wrapper" // <--- IMPORT THIS

interface ResumeRendererProps {
  layoutId: string
  data: ParsedResumeData | null
  showWatermark?: boolean
}

/**
 * Resume Renderer Component
 * * Renders the appropriate layout component based on layoutId
 * wrapped in an AutoScaleWrapper to ensure single-page PDF generation.
 */
export function ResumeRenderer({ layoutId, data, showWatermark = false }: ResumeRendererProps) {
  // REGISTRY PATTERN: Look up the component directly
  const layout = LAYOUTS.find(l => l.id === layoutId) || LAYOUTS[0] // Fallback to first (demo)
  const LayoutComponent = layout.component || SimpleResumeLayout

  return (
    <div className="relative flex justify-center">
      {/* 1. The Wrapper forces A4 size and Single Page Scaling 
          2. The 'print:...' classes in the wrapper (via globals.css) handle the PDF export
       */}
      <AutoScaleWrapper>
        <LayoutComponent data={data} />
      </AutoScaleWrapper>

      {showWatermark && (
        <div className="absolute inset-x-0 bottom-0 p-4 flex justify-center items-end bg-gradient-to-t from-white/90 to-transparent pointer-events-none print:hidden z-20">
          <div className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full shadow-sm text-xs font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <span>Created with</span>
            <span className="text-indigo-600 font-bold">ResumeBuilder.ai</span>
          </div>
        </div>
      )}
    </div>
  )
}