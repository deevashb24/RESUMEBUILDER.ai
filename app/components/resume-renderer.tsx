"use client"

import { ParsedResumeData } from "@/lib/resume"
import { SimpleResumeLayout } from "./layouts/demo"

interface ResumeRendererProps {
  layoutId: string
  data: ParsedResumeData | null
}

/**
 * Resume Renderer Component
 * 
 * Renders the appropriate layout component based on layoutId
 * Currently supports: demo layout
 */
export function ResumeRenderer({ layoutId, data }: ResumeRendererProps) {
  // Map layout IDs to their components
  switch (layoutId) {
    case "demo":
      return <SimpleResumeLayout data={data} />
    case "modern":
    case "classic":
    case "creative":
      // Placeholder for other layouts - can be added later
      return (
        <div className="w-[210mm] h-[297mm] mx-auto bg-white shadow-2xl p-12 flex items-center justify-center border-2 border-dashed border-gray-300">
          <p className="text-gray-400">
            {layoutId.charAt(0).toUpperCase() + layoutId.slice(1)} layout coming soon
          </p>
        </div>
      )
    default:
      return <SimpleResumeLayout data={data} />
  }
}

