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
                    return <strong key={index} className="font-black text-indigo-900">{part.slice(2, -2)}</strong>
                }
                return <span key={index}>{part}</span>
            })}
        </span>
    )
}

export function CreativeLayout({ data }: LayoutProps) {
    if (!data || !data.personal) return null
    const visible = (items: any[]) => items?.filter(i => i.isVisible !== false) || []

    return (
        <div className="w-full h-full bg-slate-50 font-sans text-slate-800 relative" id="resume-preview">

            {/* --- BOLD HEADER BANNER --- */}
            <div className="bg-indigo-600 h-48 print:!bg-indigo-600 [print-color-adjust:exact]"></div>

            <div className="px-12 -mt-32 relative z-10">
                <div className="flex items-end justify-between">
                    <div className="pb-4">
                        <h1 className="text-5xl font-black text-white tracking-tight uppercase mb-2">
                            {data.personal.name}
                        </h1>
                        <p className="text-indigo-200 text-lg font-medium tracking-wide">
                            Creative Professional
                        </p>
                    </div>

                    <div className="mb-[-20px] print:mb-0">
                        <UserAvatar
                            data={data}
                            className="w-40 h-40 rounded-2xl border-[6px] border-white shadow-2xl bg-indigo-500"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8 p-12 pt-8">

                {/* --- LEFT COL (Main) 8/12 --- */}
                <div className="col-span-8 space-y-10">

                    {/* SUMMARY */}
                    {data.personal.summary && (
                        <section className="bg-white p-6 rounded-xl shadow-sm border border-indigo-50">
                            <p className="text-lg leading-relaxed text-slate-700">
                                <MarkdownRenderer text={data.personal.summary} />
                            </p>
                        </section>
                    )}

                    {/* EXPERIENCE */}
                    {visible(data.experience).length > 0 && (
                        <section>
                            <h2 className="text-2xl font-black text-indigo-900 mb-6 flex items-center gap-3">
                                <span className="bg-indigo-100 p-2 rounded-lg text-indigo-600 print:!bg-indigo-100 print:!text-indigo-600">EXP</span>
                                Experience
                            </h2>

                            <div className="space-y-8 relative before:absolute before:inset-y-0 before:left-4 before:w-0.5 before:bg-indigo-100">
                                {visible(data.experience).map((exp: any, i) => (
                                    <div key={i} className="relative pl-12">
                                        <span className="absolute left-2.5 top-2 w-3.5 h-3.5 bg-indigo-600 rounded-full ring-4 ring-white print:!bg-indigo-600"></span>

                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-900 leading-none"><MarkdownRenderer text={exp.role} /></h3>
                                                <div className="text-indigo-600 font-semibold mt-1 print:!text-indigo-600"><MarkdownRenderer text={exp.company} /></div>
                                            </div>
                                            <span className="bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded print:!bg-slate-900 print:!text-white">
                                                {exp.start} — {exp.end}
                                            </span>
                                        </div>

                                        <ul className="space-y-2 mt-3">
                                            {exp.bullets?.map((b: string, idx: number) => (
                                                <li key={idx} className="flex gap-3 text-slate-600 text-sm">
                                                    <span className="text-indigo-400 font-bold">›</span>
                                                    <span><MarkdownRenderer text={b} /></span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* --- RIGHT COL (Side) 4/12 --- */}
                <div className="col-span-4 space-y-8">

                    {/* CONTACT CARD */}
                    <div className="bg-slate-900 text-slate-300 p-6 rounded-xl shadow-lg print:!bg-slate-900 print:!text-slate-300">
                        <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-4 border-b border-slate-700 pb-2">Contact</h3>
                        <div className="space-y-3 text-sm font-medium">
                            {data.personal.email && <div className="break-all">{data.personal.email}</div>}
                            {data.personal.phone && <div>{data.personal.phone}</div>}
                            {data.personal.location && <div>{data.personal.location}</div>}
                            {data.personal.linkedin && <div className="text-indigo-400">{data.personal.linkedin}</div>}
                        </div>
                    </div>

                    {/* MASONRY SKILLS */}
                    {data.skills && (
                        <div>
                            <h3 className="text-xl font-black text-indigo-900 mb-4">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    ...(data.skills.languages || []),
                                    ...(data.skills.tools || []),
                                    ...(data.skills.frameworks || [])
                                ].map((skill, i) => (
                                    <span
                                        key={i}
                                        className={`
                        px-3 py-1.5 rounded-lg text-sm font-bold border-2
                        ${i % 2 === 0 ? 'bg-white border-indigo-100 text-indigo-700' : 'bg-indigo-50 border-indigo-200 text-indigo-800'}
                        print:!border-gray-200
                      `}
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PROJECTS */}
                    {visible(data.projects).length > 0 && (
                        <section>
                            <h2 className="text-xl font-black text-indigo-900 mb-4">Projects</h2>
                            <div className="space-y-4">
                                {visible(data.projects).map((proj: any, i) => (
                                    <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                        <h4 className="font-bold text-slate-900"><MarkdownRenderer text={proj.title} /></h4>
                                        {proj.link && <a href={proj.link} className="text-xs text-indigo-500 font-bold uppercase tracking-wider mb-2 block">View Project</a>}
                                        <p className="text-xs text-slate-500 line-clamp-3">
                                            {proj.bullets?.[0]?.replace(/\*\*/g, '')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                </div>
            </div>

            {data.customSections?.map((section: any, i) => (
                <div key={i} className="px-12 pb-6">
                    <h2 className="text-xl font-black text-indigo-900 mb-2">{section.title}</h2>
                    <div className="bg-white p-6 rounded-xl border border-indigo-50 text-slate-600">
                        {section.content}
                    </div>
                </div>
            ))}

        </div>
    )
}
