import { ParsedResumeData } from "@/lib/resume"
import { UserAvatar } from "./user-avatar"
import { EditableField } from "../ui/editable-field"
import { AddItemButton, RemoveItemButton } from "../ui/structural-controls"

interface SimpleResumeLayoutProps {
  data: ParsedResumeData | null
  labels?: any
  onUpdate?: (pathStr: string, newValue: string) => void
}

// Helper: Converts "**text**" into <strong>text</strong>
const MarkdownRenderer = ({ text }: { text: string }) => {
  if (!text) return null
  const parts = text.split(/(\*\*.*?\*\*)/g)
  return (
    <span>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={index} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>
        }
        return <span key={index}>{part}</span>
      })}
    </span>
  )
}

export function SimpleResumeLayout({ data, labels, onUpdate }: SimpleResumeLayoutProps) {
  const L = labels || {
    experience: "Professional Experience",
    education: "Education",
    skills: "Technical Skills",
    projects: "Projects",
    languages: "Languages",
    tools: "Tools"
  }

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
    <div className="w-full min-h-full bg-white p-8 text-sm leading-relaxed text-gray-800" id="resume-preview">

      <header className="border-b-2 border-gray-900 pb-6 mb-6 flex items-start justify-between gap-6">
        <div className="flex-1">
          <EditableField
            value={data.personal.name || "Your Name"}
            onUpdate={(v) => onUpdate?.('personal.name', v)}
            as="h1"
            className="text-3xl font-bold uppercase tracking-wide text-gray-900 block"
            renderCustom={<MarkdownRenderer text={data.personal.name || "Your Name"} />}
          />
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
            {data.personal.email && (
              <EditableField
                value={data.personal.email}
                onUpdate={(v) => onUpdate?.('personal.email', v)}
                as="a"
                className="hover:text-blue-600 hover:underline transition-colors block"
              />
            )}

            {data.personal.phone && (
              <span className="flex items-center gap-1">•
                <EditableField
                  value={data.personal.phone}
                  onUpdate={(v) => onUpdate?.('personal.phone', v)}
                  as="a"
                  className="hover:text-blue-600 hover:underline transition-colors block"
                />
              </span>
            )}

            {data.personal.linkedin && (
              <span className="flex items-center gap-1">•
                <EditableField
                  value={data.personal.linkedin}
                  onUpdate={(v) => onUpdate?.('personal.linkedin', v)}
                  as="a"
                  className="hover:text-blue-600 hover:underline transition-colors block"
                  renderCustom={<span>{data.personal.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span>}
                />
              </span>
            )}

            {data.personal.location && (
              <span className="flex items-center gap-1">•
                <EditableField
                  value={data.personal.location}
                  onUpdate={(v) => onUpdate?.('personal.location', v)}
                  className="block"
                />
              </span>
            )}
          </div>

          {data.personal.summary && (
            <EditableField
              value={data.personal.summary}
              onUpdate={(v) => onUpdate?.('personal.summary', v)}
              multiline={true}
              as="div"
              className="mt-4 text-gray-700 italic block min-h-[1.5rem]"
              renderCustom={<MarkdownRenderer text={data.personal.summary} />}
            />
          )}
        </div>

        <UserAvatar data={data} className="w-24 h-24 border-2 border-gray-100 shadow-sm shrink-0" />
      </header>

      {/* SKILLS */}
      {data.skills && (
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3">
            <EditableField value={data.layoutOverrides?.global?.labels?.skills || L.skills} onUpdate={(v) => onUpdate?.('layoutOverrides.global.labels.skills', v)} as="span" />
          </h2>
          <div className="grid grid-cols-[120px_1fr] gap-y-2">
            {data.skills.languages?.length > 0 && <><span className="font-semibold">{L.languages}:</span><EditableField value={data.skills.languages.join(", ")} onUpdate={(v) => onUpdate?.('skills.languages', JSON.stringify(v.split(', ').map(x => x.trim())))} className="block" renderCustom={<span>{data.skills.languages.join(", ")}</span>} /></>}
            {data.skills.tools?.length > 0 && <><span className="font-semibold">{L.tools}:</span><EditableField value={data.skills.tools.join(", ")} onUpdate={(v) => onUpdate?.('skills.tools', JSON.stringify(v.split(', ').map(x => x.trim())))} className="block" renderCustom={<span>{data.skills.tools.join(", ")}</span>} /></>}
            {data.skills.frameworks?.length > 0 && <><span className="font-semibold">Frameworks:</span><EditableField value={data.skills.frameworks.join(", ")} onUpdate={(v) => onUpdate?.('skills.frameworks', JSON.stringify(v.split(', ').map(x => x.trim())))} className="block" renderCustom={<span>{data.skills.frameworks.join(", ")}</span>} /></>}
            {data.skills.concepts?.length > 0 && <><span className="font-semibold">Concepts:</span><EditableField value={data.skills.concepts.join(", ")} onUpdate={(v) => onUpdate?.('skills.concepts', JSON.stringify(v.split(', ').map(x => x.trim())))} className="block" renderCustom={<span>{data.skills.concepts.join(", ")}</span>} /></>}
          </div>
        </section>
      )}

      {/* EXPERIENCE */}
      <section className="mb-6 group relative">
        {(data.experience?.length === 0 || !data.experience) && (
          <AddItemButton label="Add Experience section" onClick={() => {
            const copy = [{ id: Date.now().toString(), role: "New Role", company: "Company", start: "", end: "", bullets: [""] }];
            onUpdate?.('experience', JSON.stringify(copy));
          }} />
        )}
        {filterVisible(data.experience).length > 0 && (
          <>
            <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3">
              <EditableField value={data.layoutOverrides?.global?.labels?.experience || L.experience} onUpdate={(v) => onUpdate?.('layoutOverrides.global.labels.experience', v)} as="span" />
            </h2>
            <div className="space-y-4">
              {filterVisible(data.experience).map((exp: any) => {
                const realIndex = data.experience.indexOf(exp)
                return (
                  <div key={exp.id || Math.random()} className="group/item relative">
                    <RemoveItemButton onClick={() => {
                      const copy = [...data.experience];
                      copy.splice(realIndex, 1);
                      onUpdate?.('experience', JSON.stringify(copy));
                    }} />
                    <div className="flex justify-between items-baseline gap-2 pr-8">
                      <EditableField
                        value={exp.role || ""}
                        onUpdate={(v) => onUpdate?.(`experience.${realIndex}.role`, v)}
                        as="h3"
                        className="font-bold text-gray-900 block flex-1"
                        renderCustom={<MarkdownRenderer text={exp.role || ""} />}
                        placeholder="Role"
                      />
                      <div className="text-sm text-gray-600 whitespace-nowrap flex gap-1 items-center">
                        <EditableField value={exp.start} onUpdate={(v) => onUpdate?.(`experience.${realIndex}.start`, v)} placeholder="MM/YY" />
                        <span>–</span>
                        <EditableField value={exp.end} onUpdate={(v) => onUpdate?.(`experience.${realIndex}.end`, v)} placeholder="MM/YY" />
                      </div>
                    </div>
                    <EditableField
                      value={exp.company || ""}
                      onUpdate={(v) => onUpdate?.(`experience.${realIndex}.company`, v)}
                      as="div"
                      className="text-gray-700 font-semibold mb-1 block"
                      renderCustom={<MarkdownRenderer text={exp.company || ""} />}
                      placeholder="Company"
                    />
                    <ul className="list-disc list-outside ml-4 space-y-1 text-gray-700">
                      {exp.bullets?.map((bullet: string, i: number) => (
                        <li key={i} className="group/bullet relative">
                          <RemoveItemButton className="top-0 right-0 p-0 hover:bg-transparent text-gray-300 opacity-40 hover:opacity-100" onClick={() => {
                            const copy = [...exp.bullets];
                            copy.splice(i, 1);
                            onUpdate?.(`experience.${realIndex}.bullets`, JSON.stringify(copy));
                          }} />
                          <EditableField
                            value={bullet}
                            onUpdate={(v) => onUpdate?.(`experience.${realIndex}.bullets.${i}`, v)}
                            multiline={true}
                            renderCustom={<MarkdownRenderer text={bullet} />}
                            className="block pr-6"
                          />
                        </li>
                      ))}
                      <AddItemButton label="Bullet" className="w-auto ml-1 mt-1 justify-start border-none bg-transparent hover:bg-gray-50 text-gray-400 shadow-none px-1 py-0.5" onClick={() => {
                        const copy = [...(exp.bullets || []), ""];
                        onUpdate?.(`experience.${realIndex}.bullets`, JSON.stringify(copy));
                      }} />
                    </ul>
                  </div>
                )
              })}
            </div>
            <AddItemButton label="Experience" onClick={() => {
              const copy = [...(data.experience || []), { id: Date.now().toString(), role: "New Role", company: "Company", start: "", end: "", bullets: [""] }];
              onUpdate?.('experience', JSON.stringify(copy));
            }} />
          </>
        )}
      </section>

      {/* PROJECTS */}
      <section className="mb-6 group relative">
        {(data.projects?.length === 0 || !data.projects) && (
          <AddItemButton label="Add Projects section" onClick={() => {
            const copy = [{ id: Date.now().toString(), title: "New Project", tech: [], bullets: [""] }];
            onUpdate?.('projects', JSON.stringify(copy));
          }} />
        )}
        {filterVisible(data.projects).length > 0 && (
          <>
            <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3">
              <EditableField value={data.layoutOverrides?.global?.labels?.projects || L.projects} onUpdate={(v) => onUpdate?.('layoutOverrides.global.labels.projects', v)} as="span" />
            </h2>
            <div className="space-y-4">
              {filterVisible(data.projects).map((proj: any) => {
                const realIndex = data.projects.indexOf(proj)
                return (
                  <div key={proj.id || Math.random()} className="group/item relative">
                    <RemoveItemButton onClick={() => {
                      const copy = [...data.projects];
                      copy.splice(realIndex, 1);
                      onUpdate?.('projects', JSON.stringify(copy));
                    }} />
                    <div className="flex justify-between items-baseline gap-2 pr-8">
                      <EditableField
                        value={proj.title || ""}
                        onUpdate={(v) => onUpdate?.(`projects.${realIndex}.title`, v)}
                        as="h3"
                        className="font-bold text-gray-900 block flex-1"
                        renderCustom={proj.link ? (
                          <a href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`} target="_blank" rel="noreferrer" className="hover:text-blue-600 hover:underline">
                            <MarkdownRenderer text={proj.title} />
                          </a>
                        ) : <MarkdownRenderer text={proj.title} />}
                        placeholder="Project Title"
                      />
                      <EditableField
                        value={proj.tech?.join(" • ") || ""}
                        onUpdate={(v) => onUpdate?.(`projects.${realIndex}.tech`, JSON.stringify(v.split(' • ').map(x => x.trim())))}
                        className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 block"
                        renderCustom={<span>{proj.tech?.join(" • ")}</span>}
                        placeholder="React • Node"
                      />
                    </div>
                    <ul className="list-disc list-outside ml-4 mt-1 space-y-1 text-gray-700">
                      {proj.bullets?.map((b: string, i: number) => (
                        <li key={i} className="group/bullet relative">
                          <RemoveItemButton className="top-0 right-0 p-0 hover:bg-transparent text-gray-300 opacity-40 hover:opacity-100" onClick={() => {
                            const copy = [...proj.bullets];
                            copy.splice(i, 1);
                            onUpdate?.(`projects.${realIndex}.bullets`, JSON.stringify(copy));
                          }} />
                          <EditableField
                            value={b}
                            onUpdate={(v) => onUpdate?.(`projects.${realIndex}.bullets.${i}`, v)}
                            multiline={true}
                            renderCustom={<MarkdownRenderer text={b} />}
                            className="block pr-6"
                          />
                        </li>
                      ))}
                      <AddItemButton label="Bullet" className="w-auto ml-1 mt-1 justify-start border-none bg-transparent hover:bg-gray-50 text-gray-400 shadow-none px-1 py-0.5" onClick={() => {
                        const copy = [...(proj.bullets || []), ""];
                        onUpdate?.(`projects.${realIndex}.bullets`, JSON.stringify(copy));
                      }} />
                    </ul>
                  </div>
                )
              })}
            </div>
            <AddItemButton label="Project" onClick={() => {
              const copy = [...(data.projects || []), { id: Date.now().toString(), title: "New Project", tech: [], bullets: [""] }];
              onUpdate?.('projects', JSON.stringify(copy));
            }} />
          </>
        )}
      </section>

      {/* EDUCATION */}
      <section className="mb-6 group relative">
        {(data.education?.length === 0 || !data.education) && (
          <AddItemButton label="Add Education section" onClick={() => {
            const copy = [{ id: Date.now().toString(), school: "University", degree: "Degree", field: "Field", start: "", end: "" }];
            onUpdate?.('education', JSON.stringify(copy));
          }} />
        )}
        {filterVisible(data.education).length > 0 && (
          <>
            <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3">
              <EditableField value={data.layoutOverrides?.global?.labels?.education || L.education} onUpdate={(v) => onUpdate?.('layoutOverrides.global.labels.education', v)} as="span" />
            </h2>
            <div className="space-y-4">
              {filterVisible(data.education).map((edu: any) => {
                const realIndex = data.education.indexOf(edu)
                return (
                  <div key={edu.id || Math.random()} className="flex justify-between gap-4 group/item relative pr-8">
                    <RemoveItemButton onClick={() => {
                      const copy = [...data.education];
                      copy.splice(realIndex, 1);
                      onUpdate?.('education', JSON.stringify(copy));
                    }} />
                    <div className="flex-1">
                      <EditableField
                        value={edu.school || ""}
                        onUpdate={(v) => onUpdate?.(`education.${realIndex}.school`, v)}
                        as="div"
                        className="font-bold text-gray-900 block"
                        renderCustom={<MarkdownRenderer text={edu.school || ""} />}
                        placeholder="School / University"
                      />
                      <div className="flex gap-1 items-baseline">
                        <EditableField value={edu.degree} onUpdate={(v) => onUpdate?.(`education.${realIndex}.degree`, v)} renderCustom={<MarkdownRenderer text={edu.degree || ""} />} placeholder="Degree" />
                        {edu.field && <span>in</span>}
                        <EditableField value={edu.field || ""} onUpdate={(v) => onUpdate?.(`education.${realIndex}.field`, v)} renderCustom={<MarkdownRenderer text={edu.field || ""} />} placeholder="Field of Study" />
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-600 min-w-[100px]">
                      <div className="flex gap-1 justify-end items-center">
                        <EditableField value={edu.start} onUpdate={(v) => onUpdate?.(`education.${realIndex}.start`, v)} placeholder="MM/YY" />
                        <span>–</span>
                        <EditableField value={edu.end} onUpdate={(v) => onUpdate?.(`education.${realIndex}.end`, v)} placeholder="MM/YY" />
                      </div>
                      <div className="flex justify-end gap-1">GPA:
                        <EditableField value={edu.gpa || ""} onUpdate={(v) => onUpdate?.(`education.${realIndex}.gpa`, v)} placeholder="4.0" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <AddItemButton label="Education" onClick={() => {
              const copy = [...(data.education || []), { id: Date.now().toString(), school: "University", degree: "Degree", field: "", start: "", end: "" }];
              onUpdate?.('education', JSON.stringify(copy));
            }} />
          </>
        )}
      </section>

      {/* CUSTOM SECTIONS */}
      {filterVisible(data.customSections || []).map((section: any) => {
        const realIndex = (data.customSections || []).indexOf(section)
        return (
          <section key={section.id || Math.random()} className="mb-6 group/item relative">
            <RemoveItemButton onClick={() => {
              const copy = [...data.customSections];
              copy.splice(realIndex, 1);
              onUpdate?.('customSections', JSON.stringify(copy));
            }} />
            <EditableField
              value={section.title || ""}
              onUpdate={(v) => onUpdate?.(`customSections.${realIndex}.title`, v)}
              as="h2"
              className="text-lg font-bold uppercase border-b border-gray-300 mb-3 block"
              placeholder="Custom Section"
            />
            {section.items && section.items.length > 0 && (
              <ul className="list-disc list-outside ml-4 space-y-1 text-gray-700">
                {section.items.map((item: string, i: number) => (
                  <li key={i} className="group/bullet relative">
                    <RemoveItemButton className="top-0 right-0 p-0 text-gray-300 opacity-40 hover:opacity-100 hover:bg-transparent" onClick={() => {
                      const copy = [...section.items];
                      copy.splice(i, 1);
                      onUpdate?.(`customSections.${realIndex}.items`, JSON.stringify(copy));
                    }} />
                    <EditableField
                      value={item}
                      onUpdate={(v) => onUpdate?.(`customSections.${realIndex}.items.${i}`, v)}
                      multiline={true}
                      renderCustom={<MarkdownRenderer text={item} />}
                      className="block pr-6"
                    />
                  </li>
                ))}
                <AddItemButton label="Bullet" className="w-auto ml-1 mt-1 justify-start border-none bg-transparent hover:bg-gray-50 text-gray-400 shadow-none px-1 py-0.5" onClick={() => {
                  const copy = [...(section.items || []), ""];
                  onUpdate?.(`customSections.${realIndex}.items`, JSON.stringify(copy));
                }} />
              </ul>
            )}
            {section.content && (
              <EditableField
                value={section.content}
                onUpdate={(v) => onUpdate?.(`customSections.${realIndex}.content`, v)}
                multiline={true}
                as="p"
                className="text-gray-700 whitespace-pre-wrap block"
                renderCustom={<MarkdownRenderer text={section.content} />}
              />
            )}
          </section>
        )
      })}

      {/* ADD SECTION BUTTON */}
      <AddItemButton label="Custom Section" className="mt-8 ml-auto mr-auto max-w-[200px]" onClick={() => {
        const copy = [...(data.customSections || []), { id: Date.now().toString(), title: "New Section", items: ["New Item"], content: "" }];
        onUpdate?.('customSections', JSON.stringify(copy));
      }} />
    </div>
  )
}