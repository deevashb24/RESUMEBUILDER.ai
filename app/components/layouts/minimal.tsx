import { ParsedResumeData } from "@/lib/resume"
import { EditableField } from "../ui/editable-field"
import { AddItemButton, RemoveItemButton } from "../ui/structural-controls"

interface LayoutProps {
    data: ParsedResumeData | null
    labels?: any
    onUpdate?: (pathStr: string, newValue: string) => void
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

export function MinimalLayout({ data, labels, onUpdate }: LayoutProps) {
    if (!data || !data.personal) return null

    const L = labels || {
        experience: "Experience",
        education: "Education",
        skills: "Expertise",
        projects: "Projects"
    }

    const visible = (items: any[]) => items?.filter(i => i.isVisible !== false) || []

    return (
        <div className="w-full min-h-full bg-white p-12 text-gray-800" id="resume-preview">

            {/* HEADER */}
            <header className="text-center mb-10">
                <EditableField
                    value={data.personal.name || "Your Name"}
                    onUpdate={(v) => onUpdate?.('personal.name', v)}
                    as="h1"
                    className="text-4xl font-serif font-medium tracking-wide uppercase text-gray-900 mb-3 block"
                />

                <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-1 text-sm font-sans text-gray-500 tracking-wide">
                    {data.personal.location && (
                        <EditableField value={data.personal.location} onUpdate={(v) => onUpdate?.('personal.location', v)} />
                    )}

                    {data.personal.email && (
                        <EditableField
                            value={data.personal.email}
                            onUpdate={(v) => onUpdate?.('personal.email', v)}
                            as="a"
                            className="hover:text-gray-900 hover:underline transition-colors block"
                        />
                    )}

                    {data.personal.phone && (
                        <EditableField
                            value={data.personal.phone}
                            onUpdate={(v) => onUpdate?.('personal.phone', v)}
                            as="a"
                            className="hover:text-gray-900 hover:underline transition-colors block"
                        />
                    )}

                    {data.personal.linkedin && (
                        <EditableField
                            value={data.personal.linkedin}
                            onUpdate={(v) => onUpdate?.('personal.linkedin', v)}
                            as="a"
                            className="hover:text-gray-900 hover:underline transition-colors block"
                            renderCustom={<span>{data.personal.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span>}
                        />
                    )}
                </div>
            </header>

            {/* SEPARATOR */}
            <div className="w-16 h-px bg-gray-300 mx-auto mb-10"></div>

            {/* SUMMARY */}
            {data.personal.summary && (
                <section className="mb-10 text-center max-w-2xl mx-auto">
                    <EditableField
                        value={data.personal.summary}
                        onUpdate={(v) => onUpdate?.('personal.summary', v)}
                        multiline={true}
                        as="p"
                        className="font-serif italic text-gray-700 leading-relaxed block"
                        renderCustom={<MarkdownRenderer text={data.personal.summary} />}
                    />
                </section>
            )}

            {/* EXPERIENCE */}
            {visible(data.experience).length > 0 && (
                <section className="mb-10 group relative">
                    {(data.experience?.length === 0 || !data.experience) && (
                        <AddItemButton label="Add Experience section" onClick={() => {
                            const copy = [{ id: Date.now().toString(), role: "New Role", company: "Company", start: "", end: "", bullets: [""] }];
                            onUpdate?.('experience', JSON.stringify(copy));
                        }} />
                    )}
                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6 text-center">
                        <EditableField value={data.layoutOverrides?.global?.labels?.experience || L.experience} onUpdate={(v) => onUpdate?.('layoutOverrides.global.labels.experience', v)} as="span" />
                    </h2>

                    <div className="space-y-8">
                        {visible(data.experience).map((exp: any) => {
                            const realIndex = data.experience.indexOf(exp)
                            return (
                                <div key={exp.id || Math.random()} className="group/item relative">
                                    <RemoveItemButton onClick={() => {
                                        const copy = [...data.experience];
                                        copy.splice(realIndex, 1);
                                        onUpdate?.('experience', JSON.stringify(copy));
                                    }} />
                                    <div className="flex justify-between items-baseline mb-2 font-sans gap-2 pr-8">
                                        <EditableField
                                            value={exp.role || ""}
                                            onUpdate={(v) => onUpdate?.(`experience.${realIndex}.role`, v)}
                                            as="h3"
                                            className="font-bold text-gray-900 text-lg block flex-1"
                                            renderCustom={<MarkdownRenderer text={exp.role || ""} />}
                                            placeholder="Role"
                                        />
                                        <div className="text-gray-500 text-sm italic flex gap-1 items-center">
                                            <EditableField value={exp.start} onUpdate={(v) => onUpdate?.(`experience.${realIndex}.start`, v)} placeholder="MM/YY" />
                                            <span>–</span>
                                            <EditableField value={exp.end} onUpdate={(v) => onUpdate?.(`experience.${realIndex}.end`, v)} placeholder="MM/YY" />
                                        </div>
                                    </div>

                                    <EditableField
                                        value={exp.company || ""}
                                        onUpdate={(v) => onUpdate?.(`experience.${realIndex}.company`, v)}
                                        as="div"
                                        className="text-gray-600 font-medium mb-3 font-serif block"
                                        renderCustom={<MarkdownRenderer text={exp.company || ""} />}
                                        placeholder="Company"
                                    />

                                    <ul className="space-y-1.5 text-sm leading-relaxed text-gray-700">
                                        {exp.bullets?.map((b: string, idx: number) => (
                                            <li key={idx} className="relative pl-4 before:content-['·'] before:absolute before:left-0 before:font-bold before:text-gray-400 group/bullet">
                                                <RemoveItemButton className="top-0 right-0 p-0 hover:bg-transparent text-gray-300 opacity-40 hover:opacity-100" onClick={() => {
                                                    const copy = [...exp.bullets];
                                                    copy.splice(idx, 1);
                                                    onUpdate?.(`experience.${realIndex}.bullets`, JSON.stringify(copy));
                                                }} />
                                                <EditableField
                                                    value={b}
                                                    onUpdate={(v) => onUpdate?.(`experience.${realIndex}.bullets.${idx}`, v)}
                                                    multiline={true}
                                                    className="block pr-6"
                                                    renderCustom={<MarkdownRenderer text={b} />}
                                                />
                                            </li>
                                        ))}
                                        <AddItemButton label="Bullet" className="w-auto ml-4 mt-1 justify-start border-none bg-transparent hover:bg-gray-50 text-gray-400 shadow-none px-1 py-0.5" onClick={() => {
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
                </section>
            )}

            {/* SEPARATOR */}
            <div className="w-full border-t border-gray-100 mb-10"></div>

            {/* TWO COLUMNS FOR EDUCATION & SKILLS */}
            <div className="grid grid-cols-2 gap-12">

                {/* EDUCATION */}
                <section className="group relative">
                    {(data.education?.length === 0 || !data.education) && (
                        <AddItemButton label="Add Education section" onClick={() => {
                            const copy = [{ id: Date.now().toString(), school: "University", degree: "Degree", field: "Field", start: "", end: "" }];
                            onUpdate?.('education', JSON.stringify(copy));
                        }} />
                    )}
                    {visible(data.education).length > 0 && (
                        <>
                            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">
                                <EditableField value={data.layoutOverrides?.global?.labels?.education || L.education} onUpdate={(v) => onUpdate?.('layoutOverrides.global.labels.education', v)} as="span" />
                            </h2>
                            <div className="space-y-6">
                                {visible(data.education).map((edu: any) => {
                                    const realIndex = data.education.indexOf(edu)
                                    return (
                                        <div key={edu.id || Math.random()} className="group/item relative pr-8">
                                            <RemoveItemButton onClick={() => {
                                                const copy = [...data.education];
                                                copy.splice(realIndex, 1);
                                                onUpdate?.('education', JSON.stringify(copy));
                                            }} />
                                            <EditableField
                                                value={edu.school || ""}
                                                onUpdate={(v) => onUpdate?.(`education.${realIndex}.school`, v)}
                                                as="div"
                                                className="font-bold text-gray-900 font-sans block"
                                                renderCustom={<MarkdownRenderer text={edu.school || ""} />}
                                                placeholder="School / University"
                                            />
                                            <EditableField
                                                value={edu.degree || ""}
                                                onUpdate={(v) => onUpdate?.(`education.${realIndex}.degree`, v)}
                                                as="div"
                                                className="text-sm font-serif italic text-gray-700 mt-0.5 block"
                                                renderCustom={<MarkdownRenderer text={edu.degree || ""} />}
                                                placeholder="Degree"
                                            />
                                            <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider flex gap-1 items-center">
                                                <EditableField value={edu.start} onUpdate={(v) => onUpdate?.(`education.${realIndex}.start`, v)} placeholder="MM/YY" />
                                                <span>–</span>
                                                <EditableField value={edu.end} onUpdate={(v) => onUpdate?.(`education.${realIndex}.end`, v)} placeholder="MM/YY" />
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

                {/* SKILLS */}
                {data.skills && (
                    <section>
                        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">
                            <EditableField value={data.layoutOverrides?.global?.labels?.skills || L.skills} onUpdate={(v) => onUpdate?.('layoutOverrides.global.labels.skills', v)} as="span" />
                        </h2>
                        <div className="text-sm space-y-4 font-sans text-gray-700">
                            {data.skills.languages?.length > 0 && (
                                <div>
                                    <span className="font-bold text-gray-900 block mb-1">Languages</span>
                                    <EditableField
                                        value={data.skills.languages.join(", ")}
                                        onUpdate={(v) => onUpdate?.('skills.languages', JSON.stringify(v.split(', ').map(x => x.trim())))}
                                        className="leading-relaxed block"
                                        renderCustom={<span>{data.skills.languages.join(", ")}</span>}
                                    />
                                </div>
                            )}
                            {data.skills.tools?.length > 0 && (
                                <div>
                                    <span className="font-bold text-gray-900 block mb-1">Technical Tools</span>
                                    <EditableField
                                        value={data.skills.tools.join(", ")}
                                        onUpdate={(v) => onUpdate?.('skills.tools', JSON.stringify(v.split(', ').map(x => x.trim())))}
                                        className="leading-relaxed block"
                                        renderCustom={<span>{data.skills.tools.join(", ")}</span>}
                                    />
                                </div>
                            )}
                            {data.skills.concepts?.length > 0 && (
                                <div>
                                    <span className="font-bold text-gray-900 block mb-1">Key Concepts</span>
                                    <EditableField
                                        value={data.skills.concepts.join(", ")}
                                        onUpdate={(v) => onUpdate?.('skills.concepts', JSON.stringify(v.split(', ').map(x => x.trim())))}
                                        className="leading-relaxed block"
                                        renderCustom={<span>{data.skills.concepts.join(", ")}</span>}
                                    />
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </div>

        </div>
    )
}