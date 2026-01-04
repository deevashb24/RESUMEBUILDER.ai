"use client"

import { ParsedResumeData } from "@/lib/resume"
import { SimpleResumeLayout } from "./layouts/demo"

interface ResumeRendererProps {
  layoutId: string
  data: ParsedResumeData | null
  showWatermark?: boolean
}

/**
 * Resume Renderer Component
 * 
 * Renders the appropriate layout component based on layoutId
 * Currently supports: demo layout
 */
export function ResumeRenderer({ layoutId, data, showWatermark = false }: ResumeRendererProps) {
  let content;

  // Map layout IDs to their components
  switch (layoutId) {
    case "demo":
      content = <SimpleResumeLayout data={data} />;
      break;
    case "modern":
    case "classic":
    case "creative":
      // Placeholder for other layouts - can be added later
      content = (
        <div className="w-[210mm] h-[297mm] mx-auto bg-white shadow-2xl p-12 flex items-center justify-center border-2 border-dashed border-gray-300">
          <p className="text-gray-400">
            {layoutId.charAt(0).toUpperCase() + layoutId.slice(1)} layout coming soon
          </p>
        </div>
      );
      break;
    default:
      content = <SimpleResumeLayout data={data} />;
  }

  return (
    <div className="relative h-full w-full print:w-auto print:h-auto">
      {content}

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

