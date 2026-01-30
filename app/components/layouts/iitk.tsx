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
                    return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>
                }
                return <span key={index}>{part}</span>
            })}
        </span>
    )
}

// Reusable Section Header (Gray Box)
const SectionHeader = ({ title }: { title: string }) => (
    <div className="w-full border border-gray-400 bg-gray-200 px-2 py-0.5 mt-4 mb-2">
        <h2 className="text-[11pt] font-bold uppercase tracking-wide text-gray-900 font-serif">
            {title}
        </h2>
    </div>
)

// Reusable Item Header (Gray Box for Experience/Projects)
const ItemHeader = ({ left, right }: { left: React.ReactNode; right?: string }) => (
    <div className="w-full border border-gray-300 bg-gray-100 px-2 py-1 flex justify-between items-center mt-2 mb-1">
        <div className="text-[10pt] text-gray-900 font-serif">
            {left}
        </div>
        {right && <div className="text-[9pt] italic text-gray-600 font-serif">{right}</div>}
    </div>
)

export function IitkLayout({ data, labels }: LayoutProps) {
    if (!data || !data.personal) return null

    const L = labels || {
        experience: "Professional Experience",
        education: "Academic Qualifications",
        skills: "Technical Skills",
        projects: "Key Projects"
    }

    const visible = (items: any[]) => items?.filter(i => i.isVisible !== false) || []

    return (
        <div className="w-full h-full bg-white p-[0.2in] text-gray-900 font-serif leading-snug text-[10pt]" id="resume-preview">

            {/* --- HEADER --- */}
            <div className="flex justify-between items-start mb-1">
                <div>
                    <h1 className="text-2xl font-bold uppercase tracking-wide mb-1">
                        {data.personal.name}
                    </h1>
                    <div className="text-[9pt]">
                        {data.personal.summary && (
                            <p className="italic max-w-md leading-tight">{data.personal.summary.slice(0, 150)}...</p>
                        )}
                    </div>
                </div>

                <div className="text-right text-[9pt] space-y-0.5">
                    {data.personal.email && (
                        <div>
                            <span className="font-bold mr-1">Email:</span>
                            <a href={`mailto:${data.personal.email}`} className="hover:underline text-blue-800">{data.personal.email}</a>
                        </div>
                    )}
                    {data.personal.phone && (
                        <div>
                            <span className="font-bold mr-1">Phone:</span>
                            <a href={`tel:${data.personal.phone}`} className="hover:underline">{data.personal.phone}</a>
                        </div>
                    )}
                    <div className="flex justify-end gap-3 mt-1">
                        {data.personal.linkedin && (
                            <a href={data.personal.linkedin} target="_blank" rel="noreferrer" className="hover:underline text-blue-800 flex items-center gap-1">
                                LinkedIn
                            </a>
                        )}
                        {/* You can map GitHub here if added to data schema later */}
                    </div>
                </div>
            </div>

            <div className="border-b-2 border-black w-full my-2"></div>

            {/* --- ACADEMIC QUALIFICATIONS (TABLE) --- */}
            <SectionHeader title={L.education} />
            <div className="w-full">
                <table className="w-full border-collapse border border-gray-400 text-[10pt]">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="border border-gray-400 p-1 text-center font-bold w-[15%]">Year</th>
                            <th className="border border-gray-400 p-1 text-center font-bold w-[30%]">Degree/Certificate</th>
                            <th className="border border-gray-400 p-1 text-center font-bold w-[40%]">Institute</th>
                            <th className="border border-gray-400 p-1 text-center font-bold w-[15%]">CPI/%</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visible(data.education).map((edu: any, i) => (
                            <tr key={i}>
                                <td className="border border-gray-400 p-1 text-center">
                                    {edu.end ? `${edu.start} - ${edu.end}` : edu.start}
                                </td>
                                <td className="border border-gray-400 p-1 text-center">
                                    {edu.degree} {edu.field && `in ${edu.field}`}
                                </td>
                                <td className="border border-gray-400 p-1 text-center">
                                    {edu.school}
                                </td>
                                <td className="border border-gray-400 p-1 text-center font-bold">
                                    {edu.gpa || "N/A"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- PROFESSIONAL EXPERIENCE --- */}
            {visible(data.experience).length > 0 && (
                <>
                    <SectionHeader title={L.experience} />
                    {visible(data.experience).map((exp: any, i) => (
                        <div key={i} className="mb-2">
                            <ItemHeader
                                left={<span><span className="font-bold">{exp.role}</span> <span className="mx-1">|</span> <span className="italic">{exp.company}</span></span>}
                                right={`${exp.start} - ${exp.end}`}
                            />
                            <ul className="list-disc list-outside ml-5 text-[10pt] space-y-0.5 text-justify">
                                {exp.bullets?.map((bullet: string, idx: number) => (
                                    <li key={idx} className="pl-1">
                                        <MarkdownRenderer text={bullet} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </>
            )}

            {/* --- KEY PROJECTS --- */}
            {visible(data.projects).length > 0 && (
                <>
                    <SectionHeader title={L.projects} />
                    {visible(data.projects).map((proj: any, i) => (
                        <div key={i} className="mb-2">
                            <ItemHeader
                                left={<span><span className="font-bold">{proj.title}</span> <span className="mx-1">|</span> <span className="italic">Project</span></span>}
                                right={proj.link ? "Link Available" : ""}
                            />
                            <div className="pl-1 mb-1 italic text-[9pt]">
                                {proj.tech && <span>Tech: {proj.tech.join(", ")}</span>}
                            </div>
                            <ul className="list-disc list-outside ml-5 text-[10pt] space-y-0.5 text-justify">
                                {proj.bullets?.map((bullet: string, idx: number) => (
                                    <li key={idx} className="pl-1">
                                        <MarkdownRenderer text={bullet} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </>
            )}

            {/* --- TECHNICAL SKILLS (TABLE STYLE) --- */}
            {data.skills && (
                <>
                    <SectionHeader title={L.skills} />
                    <div className="w-full border border-gray-400">
                        <table className="w-full border-collapse text-[10pt]">
                            <tbody>
                                {data.skills.languages && data.skills.languages.length > 0 && (
                                    <tr className="border-b border-gray-300">
                                        <td className="p-1.5 font-bold w-[25%] align-top bg-gray-50 border-r border-gray-300">Programming Languages</td>
                                        <td className="p-1.5 w-[75%]">{data.skills.languages.join(" | ")}</td>
                                    </tr>
                                )}
                                {data.skills.frameworks && data.skills.frameworks.length > 0 && (
                                    <tr className="border-b border-gray-300">
                                        <td className="p-1.5 font-bold w-[25%] align-top bg-gray-50 border-r border-gray-300">Frameworks/Libs</td>
                                        <td className="p-1.5 w-[75%]">{data.skills.frameworks.join(" | ")}</td>
                                    </tr>
                                )}
                                {data.skills.tools && data.skills.tools.length > 0 && (
                                    <tr className="border-b border-gray-300">
                                        <td className="p-1.5 font-bold w-[25%] align-top bg-gray-50 border-r border-gray-300">Tools & Platforms</td>
                                        <td className="p-1.5 w-[75%]">{data.skills.tools.join(" | ")}</td>
                                    </tr>
                                )}
                                {data.skills.concepts && data.skills.concepts.length > 0 && (
                                    <tr>
                                        <td className="p-1.5 font-bold w-[25%] align-top bg-gray-50 border-r border-gray-300">Key Concepts</td>
                                        <td className="p-1.5 w-[75%]">{data.skills.concepts.join(" | ")}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* --- CUSTOM SECTIONS (Achievements/Positions) --- */}
            {visible(data.customSections || []).map((section: any, i) => (
                <div key={i} className="mt-4">
                    <SectionHeader title={section.title} />

                    {/* If content is just text */}
                    {section.content && <p className="mb-2 whitespace-pre-wrap">{section.content}</p>}

                    {/* If items list */}
                    {section.items && section.items.length > 0 && (
                        <ul className="list-disc list-outside ml-5 text-[10pt] space-y-0.5 text-justify">
                            {section.items.map((item: string, idx: number) => (
                                <li key={idx} className="pl-1">
                                    <MarkdownRenderer text={item} />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ))}

        </div>
    )
}