import { ParsedResumeData } from "@/lib/resume"
import { UserAvatar } from "./user-avatar"
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
                    return <strong key={index} className="font-black text-indigo-900">{part.slice(2, -2)}</strong>
                }
                return <span key={index}>{part}</span>
            })}
        </span>
    )
}

export function CreativeLayout({ data, labels, onUpdate }: LayoutProps) {
    if (!data || !data.personal) return null

    const L = labels || {
        experience: "Experience",
        education: "Education",
        skills: "Skills",
        projects: "Projects",
        contact: "Contact"
    }

    const visible = (items: any[]) => items?.filter(i => i.isVisible !== false) || []

    return (
        <div className="w-full h-full bg-slate-50 font-sans text-slate-800 relative" id="resume-preview">

            {/* --- BOLD HEADER BANNER --- */}
            <div className="bg-indigo-600 h-48 print:!bg-indigo-600 [print-color-adjust:exact]"></div>

            <div className="px-12 -mt-32 relative z-10">
                <div className="flex items-end justify-between">
                    <div className="pb-4">
                        <EditableField
                            value={data.personal.name || "Your Name"}
                            onUpdate={(v) => onUpdate?.('personal.name', v)}
                            as="h1"
                            className="text-5xl font-black text-white tracking-tight uppercase mb-2 block"
                        />
                        <EditableField
                            value={data.personal.location || "Creative Professional"}
                            onUpdate={(v) => onUpdate?.('personal.location', v)}
                            as="p"
                            className="text-indigo-200 text-lg font-medium tracking-wide block"
                        />
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
                            <EditableField
                                value={data.personal.summary}
                                onUpdate={(v) => onUpdate?.('personal.summary', v)}
                                multiline={true}
                                as="p"
                                className="text-lg leading-relaxed text-slate-700 block"
                                renderCustom={<MarkdownRenderer text={data.personal.summary} />}
                            />
                        </section>
                    )}

                    {/* EXPERIENCE */}
                    <section className="group relative">
                        {(data.experience?.length === 0 || !data.experience) && (
                            <AddItemButton label="Add Experience section" onClick={() => {
                                const copy = [{ id: Date.now().toString(), role: "New Role", company: "Company", start: "", end: "", bullets: [""] }];
                                onUpdate?.('experience', JSON.stringify(copy));
                            }} />
                        )}
                        {visible(data.experience).length > 0 && (
                            <>
                                <h2 className="text-2xl font-black text-indigo-900 mb-6 flex items-center gap-3">
                                    <span className="bg-indigo-100 p-2 rounded-lg text-indigo-600 print:!bg-indigo-100 print:!text-indigo-600">EXP</span>
                                    <EditableField value={data.layoutOverrides?.global?.labels?.experience || L.experience} onUpdate={v => onUpdate?.('layoutOverrides.global.labels.experience', v)} as="span" />
                                </h2>

                                <div className="space-y-8 relative before:absolute before:inset-y-0 before:left-4 before:w-0.5 before:bg-indigo-100">
                                    {visible(data.experience).map((exp: any) => {
                                        const realIndex = data.experience.indexOf(exp)
                                        return (
                                            <div key={exp.id || Math.random()} className="relative pl-12 group/item pr-8">
                                                <RemoveItemButton onClick={() => {
                                                    const copy = [...data.experience];
                                                    copy.splice(realIndex, 1);
                                                    onUpdate?.('experience', JSON.stringify(copy));
                                                }} />
                                                <span className="absolute left-2.5 top-2 w-3.5 h-3.5 bg-indigo-600 rounded-full ring-4 ring-white print:!bg-indigo-600"></span>

                                                <div className="flex justify-between items-start mb-2 gap-2">
                                                    <div className="flex-1">
                                                        <EditableField
                                                            value={exp.role || ""}
                                                            onUpdate={(v) => onUpdate?.(`experience.${realIndex}.role`, v)}
                                                            as="h3"
                                                            className="text-xl font-bold text-slate-900 leading-none block"
                                                            renderCustom={<MarkdownRenderer text={exp.role || ""} />}
                                                            placeholder="Role"
                                                        />
                                                        <EditableField
                                                            value={exp.company || ""}
                                                            onUpdate={(v) => onUpdate?.(`experience.${realIndex}.company`, v)}
                                                            as="div"
                                                            className="text-indigo-600 font-semibold mt-1 print:!text-indigo-600 block"
                                                            renderCustom={<MarkdownRenderer text={exp.company || ""} />}
                                                            placeholder="Company"
                                                        />
                                                    </div>
                                                    <span className="bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded print:!bg-slate-900 print:!text-white flex gap-1 items-center whitespace-nowrap">
                                                        <EditableField value={exp.start} onUpdate={(v) => onUpdate?.(`experience.${realIndex}.start`, v)} placeholder="MM/YY" />
                                                        <span>—</span>
                                                        <EditableField value={exp.end} onUpdate={(v) => onUpdate?.(`experience.${realIndex}.end`, v)} placeholder="MM/YY" />
                                                    </span>
                                                </div>

                                                <ul className="space-y-2 mt-3">
                                                    {exp.bullets?.map((b: string, idx: number) => (
                                                        <li key={idx} className="flex gap-3 text-slate-600 text-sm group/bullet relative">
                                                            <RemoveItemButton className="top-0 right-0 p-0 hover:bg-transparent text-gray-300 opacity-40 hover:opacity-100" onClick={() => {
                                                                const copy = [...exp.bullets];
                                                                copy.splice(idx, 1);
                                                                onUpdate?.(`experience.${realIndex}.bullets`, JSON.stringify(copy));
                                                            }} />
                                                            <span className="text-indigo-400 font-bold">›</span>
                                                            <EditableField
                                                                value={b}
                                                                onUpdate={(v) => onUpdate?.(`experience.${realIndex}.bullets.${idx}`, v)}
                                                                multiline={true}
                                                                className="block w-full pr-6"
                                                                renderCustom={<span><MarkdownRenderer text={b} /></span>}
                                                            />
                                                        </li>
                                                    ))}
                                                    <AddItemButton label="Bullet" className="w-auto ml-7 mt-1 justify-start border-none bg-transparent hover:bg-indigo-50 text-indigo-400 shadow-none px-1 py-0.5" onClick={() => {
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
                </div>

                {/* --- RIGHT COL (Side) 4/12 --- */}
                <div className="col-span-4 space-y-8">

                    {/* CONTACT CARD */}
                    <div className="bg-slate-900 text-slate-300 p-6 rounded-xl shadow-lg print:!bg-slate-900 print:!text-slate-300">
                        <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-4 border-b border-slate-700 pb-2">
                            <EditableField value={data.layoutOverrides?.global?.labels?.contact || L.contact} onUpdate={v => onUpdate?.('layoutOverrides.global.labels.contact', v)} as="span" />
                        </h3>
                        <div className="space-y-3 text-sm font-medium">
                            {data.personal.email && (
                                <EditableField
                                    value={data.personal.email}
                                    onUpdate={(v) => onUpdate?.('personal.email', v)}
                                    as="a"
                                    className="block break-all hover:text-indigo-400 transition-colors"
                                />
                            )}
                            {data.personal.phone && (
                                <EditableField
                                    value={data.personal.phone}
                                    onUpdate={(v) => onUpdate?.('personal.phone', v)}
                                    as="a"
                                    className="block hover:text-indigo-400 transition-colors"
                                />
                            )}
                            {data.personal.location && (
                                <EditableField value={data.personal.location} onUpdate={(v) => onUpdate?.('personal.location', v)} className="block" />
                            )}
                            {data.personal.linkedin && (
                                <EditableField
                                    value={data.personal.linkedin}
                                    onUpdate={(v) => onUpdate?.('personal.linkedin', v)}
                                    as="a"
                                    className="block text-indigo-400 hover:text-indigo-300 hover:underline transition-colors break-all"
                                    renderCustom={<span>{data.personal.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span>}
                                />
                            )}
                        </div>
                    </div>

                    {/* MASONRY SKILLS */}
                    {data.skills && (
                        <div>
                            <h3 className="text-xl font-black text-indigo-900 mb-4">
                                <EditableField value={data.layoutOverrides?.global?.labels?.skills || L.skills} onUpdate={v => onUpdate?.('layoutOverrides.global.labels.skills', v)} as="span" />
                            </h3>
                            <EditableField
                                value={[
                                    ...(data.skills.languages || []),
                                    ...(data.skills.tools || []),
                                    ...(data.skills.frameworks || [])
                                ].join(", ")}
                                onUpdate={(v) => {
                                    // A very crude split implementation for simple mapping since creative visually combines them
                                    onUpdate?.('skills.languages', JSON.stringify(v.split(', ').map(x => x.trim())))
                                }}
                                className="block w-full"
                                renderCustom={
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
                                }
                            />
                        </div>
                    )}

                    {/* PROJECTS */}
                    <section className="group relative">
                        {(data.projects?.length === 0 || !data.projects) && (
                            <AddItemButton label="Add Projects section" onClick={() => {
                                const copy = [{ id: Date.now().toString(), title: "Project Name", bullets: [""] }];
                                onUpdate?.('projects', JSON.stringify(copy));
                            }} />
                        )}
                        {visible(data.projects).length > 0 && (
                            <>
                                <h2 className="text-xl font-black text-indigo-900 mb-4">
                                    <EditableField value={data.layoutOverrides?.global?.labels?.projects || L.projects} onUpdate={v => onUpdate?.('layoutOverrides.global.labels.projects', v)} as="span" />
                                </h2>
                                <div className="space-y-4">
                                    {visible(data.projects).map((proj: any) => {
                                        const realIndex = data.projects.indexOf(proj)
                                        return (
                                            <div key={proj.id || Math.random()} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative group/item">
                                                <RemoveItemButton onClick={() => {
                                                    const copy = [...data.projects];
                                                    copy.splice(realIndex, 1);
                                                    onUpdate?.('projects', JSON.stringify(copy));
                                                }} className="top-1 right-1" />
                                                <EditableField
                                                    value={proj.title || ""}
                                                    onUpdate={(v) => onUpdate?.(`projects.${realIndex}.title`, v)}
                                                    as="h4"
                                                    className="font-bold text-slate-900 block"
                                                    renderCustom={<MarkdownRenderer text={proj.title || ""} />}
                                                    placeholder="Project Name"
                                                />
                                                {proj.link && (
                                                    <EditableField value={proj.link} onUpdate={v => onUpdate?.(`projects.${realIndex}.link`, v)} as="a" className="text-xs text-indigo-500 font-bold uppercase tracking-wider mb-2 block truncate" />
                                                )}
                                                <EditableField
                                                    value={proj.bullets?.[0]?.replace(/\*\*/g, '') || ""}
                                                    onUpdate={(v) => onUpdate?.(`projects.${realIndex}.bullets.0`, v)}
                                                    multiline={true}
                                                    className="text-xs text-slate-500 line-clamp-3 block w-full"
                                                />
                                            </div>
                                        )
                                    })}
                                </div>
                                <AddItemButton label="Project" onClick={() => {
                                    const copy = [...(data.projects || []), { id: Date.now().toString(), title: "Project Name", bullets: [""] }];
                                    onUpdate?.('projects', JSON.stringify(copy));
                                }} />
                            </>
                        )}
                    </section>

                </div>
            </div>

            {
                data.customSections?.map((section: any) => {
                    const realIndex = data.customSections.indexOf(section)
                    return (
                        <div key={section.id || Math.random()} className="px-12 pb-6">
                            <EditableField
                                value={section.title || ""}
                                onUpdate={(v) => onUpdate?.(`customSections.${realIndex}.title`, v)}
                                as="h2"
                                className="text-xl font-black text-indigo-900 mb-2 block"
                            />
                            <EditableField
                                value={section.content || ""}
                                onUpdate={(v) => onUpdate?.(`customSections.${realIndex}.content`, v)}
                                multiline={true}
                                as="div"
                                className="bg-white p-6 rounded-xl border border-indigo-50 text-slate-600 block"
                            />
                        </div>
                    )
                })
            }

        </div >
    )
}