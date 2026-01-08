import { ParsedResumeData } from "@/lib/resume"
import { UserAvatar } from "./user-avatar"

interface LayoutProps {
    data: ParsedResumeData | null
}

const MarkdownRenderer = ({ text }: { text: string }) => {
    if (!text) return null
    const parts = text.split(/(\*\*.*?\*\*)/g)
    return (
        <span>
            {parts.map((part, index) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                    return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>
                }
                return <span key={index}>{part}</span>
            })}
        </span>
    )
}

export function ModernLayout({ data }: LayoutProps) {
    if (!data || !data.personal) return null

    // Helper to filter hidden items
    const visible = (items: any[]) => items?.filter(i => i.isVisible !== false) || []

    return (
        <div className="w-full h-full bg-white flex text-sm font-sans" id="resume-preview">

            {/* --- LEFT SIDEBAR (30%) --- */}
            {/* IMPORTANT: 'print:!bg-slate-900' ensures background color prints */}
            <aside className="w-[30%] bg-slate-900 text-white p-6 flex flex-col gap-6 print:!bg-slate-900 print:!text-white [print-color-adjust:exact]">

                {/* Profile Pic */}
                <div className="flex justify-center mb-2">
                    <UserAvatar data={data} className="w-32 h-32 rounded-full border-4 border-slate-700 shadow-xl" />
                </div>

                {/* Contact Info */}
                <div className="space-y-3 text-slate-300 text-xs">
                    {data.personal.email && (
                        <div>
                            <div className="uppercase font-bold text-xs text-slate-500 mb-0.5">Email</div>
                            <div className="text-white break-all">{data.personal.email}</div>
                        </div>
                    )}
                    {data.personal.phone && (
                        <div>
                            <div className="uppercase font-bold text-xs text-slate-500 mb-0.5">Phone</div>
                            <div className="text-white">{data.personal.phone}</div>
                        </div>
                    )}
                    {data.personal.location && (
                        <div>
                            <div className="uppercase font-bold text-xs text-slate-500 mb-0.5">Location</div>
                            <div className="text-white">{data.personal.location}</div>
                        </div>
                    )}
                    {data.personal.linkedin && (
                        <div>
                            <div className="uppercase font-bold text-xs text-slate-500 mb-0.5">LinkedIn</div>
                            <div className="text-white truncate">{data.personal.linkedin}</div>
                        </div>
                    )}
                </div>

                {/* Skills (Progress Bars) */}
                {data.skills && (
                    <div className="mt-4">
                        <h3 className="uppercase font-bold text-sm tracking-widest border-b border-slate-700 pb-2 mb-4 text-white">Skills</h3>

                        <div className="space-y-4">
                            {data.skills.languages?.length > 0 && (
                                <div>
                                    <div className="font-semibold text-slate-400 mb-1 text-xs">Languages</div>
                                    <div className="flex flex-wrap gap-1">
                                        {data.skills.languages.map((skill, i) => (
                                            <span key={i} className="bg-slate-800 px-2 py-1 rounded text-xs print:!bg-slate-800 print:!text-white">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {data.skills.tools?.length > 0 && (
                                <div>
                                    <div className="font-semibold text-slate-400 mb-1 text-xs">Tools</div>
                                    <div className="flex flex-wrap gap-1">
                                        {data.skills.tools.map((skill, i) => (
                                            <span key={i} className="bg-slate-800 px-2 py-1 rounded text-xs print:!bg-slate-800 print:!text-white">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </aside>

            {/* --- RIGHT CONTENT (70%) --- */}
            <main className="w-[70%] p-8 bg-white text-slate-800">

                {/* Header */}
                <header className="mb-8 border-b-2 border-slate-100 pb-6">
                    <h1 className="text-4xl font-bold text-slate-900 uppercase tracking-tight leading-none mb-2">
                        {data.personal.name}
                    </h1>
                    {/* Job Title logic could be inferred or added to data schema, using Summary first line or hardcoded for now */}
                    <div className="text-lg text-slate-500 font-medium">Professional Profile</div>

                    {data.personal.summary && (
                        <div className="mt-4 text-slate-600 leading-relaxed">
                            <MarkdownRenderer text={data.personal.summary} />
                        </div>
                    )}
                </header>

                {/* Experience */}
                {visible(data.experience).length > 0 && (
                    <section className="mb-8">
                        <h2 className="text-xl font-bold uppercase tracking-widest text-slate-900 mb-5 flex items-center gap-2">
                            <span className="w-1 h-6 bg-blue-600 rounded-sm print:!bg-blue-600"></span>
                            Experience
                        </h2>
                        <div className="space-y-6 border-l-2 border-slate-100 ml-1.5 pl-6">
                            {visible(data.experience).map((exp: any, i) => (
                                <div key={i} className="relative">
                                    {/* Timeline Dot */}
                                    <div className="absolute -left-[31px] top-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-full print:!border-blue-600"></div>

                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="text-lg font-bold text-slate-900"><MarkdownRenderer text={exp.role} /></h3>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{exp.start} — {exp.end}</span>
                                    </div>
                                    <div className="font-semibold text-blue-600 mb-2 print:!text-blue-600"><MarkdownRenderer text={exp.company} /></div>
                                    <ul className="list-disc list-outside ml-4 space-y-1.5 text-slate-600 marker:text-slate-300">
                                        {exp.bullets?.map((b: string, idx: number) => (
                                            <li key={idx}><MarkdownRenderer text={b} /></li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Education */}
                {visible(data.education).length > 0 && (
                    <section className="mb-8">
                        <h2 className="text-xl font-bold uppercase tracking-widest text-slate-900 mb-5 flex items-center gap-2">
                            <span className="w-1 h-6 bg-blue-600 rounded-sm print:!bg-blue-600"></span>
                            Education
                        </h2>
                        <div className="grid gap-4">
                            {visible(data.education).map((edu: any, i) => (
                                <div key={i} className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-lg"><MarkdownRenderer text={edu.school} /></h4>
                                        <div className="text-slate-600"><MarkdownRenderer text={edu.degree} /></div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-bold text-slate-400 text-xs uppercase">{edu.start} — {edu.end}</span>
                                        {edu.gpa && <span className="text-xs text-slate-500 font-medium">GPA: {edu.gpa}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Projects */}
                {visible(data.projects).length > 0 && (
                    <section>
                        <h2 className="text-xl font-bold uppercase tracking-widest text-slate-900 mb-5 flex items-center gap-2">
                            <span className="w-1 h-6 bg-blue-600 rounded-sm print:!bg-blue-600"></span>
                            Projects
                        </h2>
                        <div className="space-y-4">
                            {visible(data.projects).map((proj: any, i) => (
                                <div key={i}>
                                    <div className="flex justify-between items-baseline">
                                        <h4 className="font-bold text-slate-900"><MarkdownRenderer text={proj.title} /></h4>
                                        <div className="flex gap-2">
                                            {proj.tech?.map((t: string, idx: number) => (
                                                <span key={idx} className="text-[10px] uppercase font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                    {proj.link && <a href={proj.link} className="text-xs text-blue-500 underline mb-1 block">{proj.link}</a>}
                                    <ul className="list-disc list-outside ml-4 mt-1 space-y-1 text-slate-600 marker:text-slate-300">
                                        {proj.bullets?.map((b: string, idx: number) => (
                                            <li key={idx}><MarkdownRenderer text={b} /></li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

            </main>
        </div>
    )
}
