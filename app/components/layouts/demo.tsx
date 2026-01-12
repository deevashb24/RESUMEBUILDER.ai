import { ParsedResumeData } from "@/lib/resume"
import { UserAvatar } from "./user-avatar"

interface SimpleResumeLayoutProps {
  data: ParsedResumeData | null
}

// Helper: Converts "**text**" into <strong>text</strong>
const MarkdownRenderer = ({ text }: { text: string }) => {
  if (!text) return null

  // Split by double asterisks
  const parts = text.split(/(\*\*.*?\*\*)/g)

  return (
    <span>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          // Remove asterisks and render bold
          return <strong key={index} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>
        }
        return <span key={index}>{part}</span>
      })}
    </span>
  )
}

export function SimpleResumeLayout({ data }: SimpleResumeLayoutProps) {
  if (!data || !data.personal) {
    return (
      <div className="p-10 text-center text-red-500">
        <h2 className="text-xl font-bold">Error Loading Resume</h2>
        <p>The resume data is missing or corrupted.</p>
      </div>
    )
  }

  const filterVisible = (items: any[]) => items?.filter(item => item.isVisible !== false) || []

  return (
    <div className="w-full h-full bg-white p-8 text-sm leading-relaxed text-gray-800" id="resume-preview">

      {/* HEADER: Updated to support Avatar */}
      <header className="border-b-2 border-gray-900 pb-6 mb-6 flex items-start justify-between gap-6">

        {/* LEFT: Personal Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold uppercase tracking-wide text-gray-900">
            <MarkdownRenderer text={data.personal.name || "Your Name"} />
          </h1>
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
            {data.personal.email && <span>{data.personal.email}</span>}
            {data.personal.phone && <span>• {data.personal.phone}</span>}
            {data.personal.linkedin && <span>• {data.personal.linkedin}</span>}
            {data.personal.location && <span>• {data.personal.location}</span>}
          </div>
          {data.personal.summary && (
            <div className="mt-4 text-gray-700 italic">
              <MarkdownRenderer text={data.personal.summary} />
            </div>
          )}
        </div>

        {/* RIGHT: User Avatar */}
        <UserAvatar data={data} className="w-24 h-24 border-2 border-gray-100 shadow-sm shrink-0" />

      </header>

      {/* SKILLS */}
      {data.skills && (
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3">Technical Skills</h2>
          <div className="grid grid-cols-[120px_1fr] gap-y-2">
            {data.skills.languages?.length > 0 && <><span className="font-semibold">Languages:</span><span>{data.skills.languages.join(", ")}</span></>}
            {data.skills.tools?.length > 0 && <><span className="font-semibold">Tools:</span><span>{data.skills.tools.join(", ")}</span></>}
            {data.skills.frameworks?.length > 0 && <><span className="font-semibold">Frameworks:</span><span>{data.skills.frameworks.join(", ")}</span></>}
            {data.skills.concepts?.length > 0 && <><span className="font-semibold">Concepts:</span><span>{data.skills.concepts.join(", ")}</span></>}
          </div>
        </section>
      )}

      {/* EXPERIENCE */}
      {filterVisible(data.experience).length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3">Professional Experience</h2>
          <div className="space-y-4">
            {filterVisible(data.experience).map((exp: any) => (
              <div key={exp.id || Math.random()}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-gray-900"><MarkdownRenderer text={exp.role} /></h3>
                  <span className="text-sm text-gray-600 whitespace-nowrap">{exp.start} – {exp.end}</span>
                </div>
                <div className="text-gray-700 font-semibold mb-1"><MarkdownRenderer text={exp.company} /></div>
                <ul className="list-disc list-outside ml-4 space-y-1 text-gray-700">
                  {exp.bullets?.map((bullet: string, i: number) => (
                    <li key={i}><MarkdownRenderer text={bullet} /></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PROJECTS */}
      {filterVisible(data.projects).length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3">Projects</h2>
          <div className="space-y-4">
            {filterVisible(data.projects).map((proj: any) => (
              <div key={proj.id || Math.random()}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-gray-900"><MarkdownRenderer text={proj.title} /></h3>
                  {proj.tech?.length > 0 && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{proj.tech.join(" • ")}</span>}
                </div>
                <ul className="list-disc list-outside ml-4 mt-1 space-y-1 text-gray-700">
                  {proj.bullets?.map((b: string, i: number) => (
                    <li key={i}><MarkdownRenderer text={b} /></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* EDUCATION */}
      {filterVisible(data.education).length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3">Education</h2>
          <div className="space-y-4">
            {filterVisible(data.education).map((edu: any) => (
              <div key={edu.id || Math.random()} className="flex justify-between">
                <div>
                  <div className="font-bold text-gray-900"><MarkdownRenderer text={edu.school} /></div>
                  <div><MarkdownRenderer text={edu.degree} /> {edu.field ? `in ${edu.field}` : ""}</div>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <div>{edu.start} – {edu.end}</div>
                  {edu.gpa && <div>GPA: {edu.gpa}</div>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CUSTOM SECTIONS */}
      {filterVisible(data.customSections || []).map((section: any) => (
        <section key={section.id || Math.random()} className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3">{section.title}</h2>
          {section.items && section.items.length > 0 && (
            <ul className="list-disc list-outside ml-4 space-y-1 text-gray-700">
              {section.items.map((item: string, i: number) => (
                <li key={i}><MarkdownRenderer text={item} /></li>
              ))}
            </ul>
          )}
          {section.content && <p className="text-gray-700 whitespace-pre-wrap"><MarkdownRenderer text={section.content} /></p>}
        </section>
      ))}
    </div>
  )
}