import { ParsedResumeData } from "@/lib/resume"

interface LayoutProps {
    data: ParsedResumeData | null
    labels?: any
}

const MarkdownRenderer = ({ text }: { text: string }) => {
    if (!text) return null
    const parts = text.split(/(\*\*.*?\*\*)/g)
    return (
        <span>
            {parts.map((part, index) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                    return <strong key={index} className="font-semibold">{part.slice(2, -2)}</strong>
                }
                return <span key={index}>{part}</span>
            })}
        </span>
    )
}

export function MinimalLayout({ data, labels }: LayoutProps) {
    if (!data || !data.personal) return null

    const L = labels || {
        experience: "Experience",
        education: "Education",
        skills: "Expertise",
        projects: "Projects"
    }

    const visible = (items: any[]) => items?.filter(i => i.isVisible !== false) || []

    return (
        <div className="w-full h-full bg-white p-12 text-gray-800" id="resume-preview">

            {/* HEADER */}
            <header className="text-center mb-10">
                <h1 className="text-4xl font-serif font-medium tracking-wide uppercase text-gray-900 mb-3">
                    {data.personal.name}
                </h1>

                <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm font-sans text-gray-500 tracking-wide">
                    {data.personal.location && <span>{data.personal.location}</span>}

                    {data.personal.email && (
                        <a
                            href={`mailto:${data.personal.email}`}
                            className="hover:text-gray-900 hover:underline transition-colors"
                        >
                            {data.personal.email}
                        </a>
                    )}

                    {data.personal.phone && (
                        <a
                            href={`tel:${data.personal.phone.replace(/[^\d+]/g, '')}`}
                            className="hover:text-gray-900 hover:underline transition-colors"
                        >
                            {data.personal.phone}
                        </a>
                    )}

                    {data.personal.linkedin && (
                        <a
                            href={data.personal.linkedin.startsWith('http') ? data.personal.linkedin : `https://${data.personal.linkedin}`}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-gray-900 hover:underline transition-colors"
                        >
                            {data.personal.linkedin.replace(/^https?:\/\/(www\.)?/, '')}
                        </a>
                    )}
                </div>
            </header>

            {/* SEPARATOR */}
            <div className="w-16 h-px bg-gray-300 mx-auto mb-10"></div>

            {/* SUMMARY */}
            {data.personal.summary && (
                <section className="mb-10 text-center max-w-2xl mx-auto">
                    <p className="font-serif italic text-gray-700 leading-relaxed">
                        <MarkdownRenderer text={data.personal.summary} />
                    </p>
                </section>
            )}

            {/* EXPERIENCE */}
            {visible(data.experience).length > 0 && (
                <section className="mb-10">
                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6 text-center">{L.experience}</h2>

                    <div className="space-y-8">
                        {visible(data.experience).map((exp: any, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-baseline mb-2 font-sans">
                                    <h3 className="font-bold text-gray-900 text-lg"><MarkdownRenderer text={exp.role} /></h3>
                                    <span className="text-gray-500 text-sm italic">{exp.start} – {exp.end}</span>
                                </div>

                                <div className="text-gray-600 font-medium mb-3 font-serif"><MarkdownRenderer text={exp.company} /></div>

                                <ul className="space-y-1.5 text-sm leading-relaxed text-gray-700">
                                    {exp.bullets?.map((b: string, idx: number) => (
                                        <li key={idx} className="relative pl-4 before:content-['·'] before:absolute before:left-0 before:font-bold before:text-gray-400">
                                            <MarkdownRenderer text={b} />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* SEPARATOR */}
            <div className="w-full border-t border-gray-100 mb-10"></div>

            {/* TWO COLUMNS FOR EDUCATION & SKILLS */}
            <div className="grid grid-cols-2 gap-12">

                {/* EDUCATION */}
                {visible(data.education).length > 0 && (
                    <section>
                        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">{L.education}</h2>
                        <div className="space-y-6">
                            {visible(data.education).map((edu: any, i) => (
                                <div key={i}>
                                    <div className="font-bold text-gray-900 font-sans"><MarkdownRenderer text={edu.school} /></div>
                                    <div className="text-sm font-serif italic text-gray-700 mt-0.5"><MarkdownRenderer text={edu.degree} /></div>
                                    <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{edu.start} – {edu.end}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* SKILLS */}
                {data.skills && (
                    <section>
                        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">{L.skills}</h2>
                        <div className="text-sm space-y-4 font-sans text-gray-700">
                            {data.skills.languages?.length > 0 && (
                                <div>
                                    <span className="font-bold text-gray-900 block mb-1">Languages</span>
                                    <span className="leading-relaxed">{data.skills.languages.join(", ")}</span>
                                </div>
                            )}
                            {data.skills.tools?.length > 0 && (
                                <div>
                                    <span className="font-bold text-gray-900 block mb-1">Technical Tools</span>
                                    <span className="leading-relaxed">{data.skills.tools.join(", ")}</span>
                                </div>
                            )}
                            {data.skills.concepts?.length > 0 && (
                                <div>
                                    <span className="font-bold text-gray-900 block mb-1">Key Concepts</span>
                                    <span className="leading-relaxed">{data.skills.concepts.join(", ")}</span>
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </div>

        </div>
    )
}