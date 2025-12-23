// app/components/layouts/demo.tsx
import { ParsedResumeData } from "@/lib/resume"

interface SimpleResumeLayoutProps {
  data: ParsedResumeData | null
}

export function SimpleResumeLayout({ data }: SimpleResumeLayoutProps) {
  if (!data) return null

  // Helper to filter hidden items
  const filterVisible = (items: any[]) => items.filter(item => item.isVisible !== false)

  return (
    <div className="w-full h-full bg-white p-8 text-sm leading-relaxed text-gray-800" id="resume-preview">
      {/* ... (Header stays the same) ... */}

      {/* Experience - Only show visible items */}
      {filterVisible(data.experience).length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3">Professional Experience</h2>
          <div className="space-y-4">
            {filterVisible(data.experience).map((exp: any) => (
              <div key={exp.id}> 
                {/* ... (render content) ... */}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ... (Do the same filterVisible check for Projects, Education, and CustomSections) ... */}
      
      {/* Custom Sections (Preserved!) */}
      {filterVisible(data.customSections).map((section: any) => (
        <section key={section.id} className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3">{section.title}</h2>
          {section.items && (
             <ul className="list-disc ml-4">
               {section.items.map((item: string, i: number) => <li key={i}>{item}</li>)}
             </ul>
          )}
        </section>
      ))}
    </div>
  )
}