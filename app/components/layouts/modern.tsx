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
                    return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>
                }
                return <span key={index}>{part}</span>
            })}
        </span>
    )
}

export function ModernLayout({ data, labels, onUpdate }: LayoutProps) {
    if (!data || !data.personal) return null

    const L = labels || {
        experience: "Experience",
        education: "Education",
        skills: "Skills",
        projects: "Projects",
        languages: "Languages",
        tools: "Tools"
    }

    const visible = (items: any[]) => items?.filter(i => i.isVisible !== false) || []

    return (
        <div className="w-full h-full bg-white flex text-sm font-sans" id="resume-preview">

            <aside className="w-[30%] bg-slate-900 text-white p-6 flex flex-col gap-6 print:!bg-slate-900 print:!text-white [print-color-adjust:exact]">
                <div className="flex justify-center mb-2">
                    <UserAvatar data={data} className="w-32 h-32 rounded-full border-4 border-slate-700 shadow-xl" />
                </div>

                <div className="space-y-3 text-slate-300 text-xs">
                    {data.personal.email && (
                        <div>
                            <div className="uppercase font-bold text-xs text-slate-500 mb-0.5">Email</div>
                            <EditableField
                                value={data.personal.email}
                                onUpdate={(v) => onUpdate?.('personal.email', v)}
                                as="a"
                                className="text-white break-all hover:text-blue-400 hover:underline transition-colors block"
                            />
                        </div>
                    )}
                    {data.personal.phone && (
                        <div>
                            <div className="uppercase font-bold text-xs text-slate-500 mb-0.5">Phone</div>
                            <EditableField
                                value={data.personal.phone}
                                onUpdate={(v) => onUpdate?.('personal.phone', v)}
                                as="a"
                                className="text-white hover:text-blue-400 hover:underline transition-colors block"
                            />
                        </div>
                    )}
                    {data.personal.location && (
                        <div>
                            <div className="uppercase font-bold text-xs text-slate-500 mb-0.5">Location</div>
                            <EditableField
                                value={data.personal.location}
                                onUpdate={(v) => onUpdate?.('personal.location', v)}
                                className="text-white block"
                            />
                        </div>
                    )}
                    {data.personal.linkedin && (
                        <div>
                            <div className="uppercase font-bold text-xs text-slate-500 mb-0.5">LinkedIn</div>
                            <EditableField
                                value={data.personal.linkedin}
                                onUpdate={(v) => onUpdate?.('personal.linkedin', v)}
                                as="a"
                                className="text-white truncate block hover:text-blue-400 hover:underline transition-colors"
                                renderCustom={<span>{data.personal.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span>}
                            />
                        </div>
                    )}
                </div>

                {data.skills && (
                    <div className="mt-4">
                        <h3 className="uppercase font-bold text-sm tracking-widest border-b border-slate-700 pb-2 mb-4 text-white">
                            <EditableField value={data.layoutOverrides?.global?.labels?.skills || L.skills} onUpdate={v => onUpdate?.('layoutOverrides.global.labels.skills', v)} as="span" />
                        </h3>

                        <div className="space-y-4">
                            {data.skills.languages?.length > 0 && (
                                <div>
                                    <div className="font-semibold text-slate-400 mb-1 text-xs">
                                        <EditableField value={data.layoutOverrides?.global?.labels?.languages || L.languages} onUpdate={v => onUpdate?.('layoutOverrides.global.labels.languages', v)} as="span" />
                                    </div>
                                    <EditableField
                                        value={data.skills.languages.join(", ")}
                                        onUpdate={(v) => onUpdate?.('skills.languages', JSON.stringify(v.split(', ').map(x => x.trim())))}
                                        className="text-white block"
                                        renderCustom={
                                            <div className="flex flex-wrap gap-1">
                                                {data.skills.languages.map((skill, i) => (
                                                    <span key={i} className="bg-slate-800 px-2 py-1 rounded text-xs print:!bg-slate-800 print:!text-white">{skill}</span>
                                                ))}
                                            </div>
                                        }
                                    />
                                </div>
                            )}
                            {data.skills.tools?.length > 0 && (
                                <div>
                                    <div className="font-semibold text-slate-400 mb-1 text-xs">
                                        <EditableField value={data.layoutOverrides?.global?.labels?.tools || L.tools} onUpdate={v => onUpdate?.('layoutOverrides.global.labels.tools', v)} as="span" />
                                    </div>
                                    <EditableField
                                        value={data.skills.tools.join(", ")}
                                        onUpdate={(v) => onUpdate?.('skills.tools', JSON.stringify(v.split(', ').map(x => x.trim())))}
                                        className="text-white block"
                                        renderCustom={
                                            <div className="flex flex-wrap gap-1">
                                                {data.skills.tools.map((skill, i) => (
                                                    <span key={i} className="bg-slate-800 px-2 py-1 rounded text-xs print:!bg-slate-800 print:!text-white">{skill}</span>
                                                ))}
                                            </div>
                                        }
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </aside>

            <main className="w-[70%] p-8 bg-white text-slate-800">

                <header className="mb-8 border-b-2 border-slate-100 pb-6">
                    <EditableField
                        value={data.personal.name || "Your Name"}
                        onUpdate={(v) => onUpdate?.('personal.name', v)}
                        as="h1"
                        className="text-4xl font-bold text-slate-900 uppercase tracking-tight leading-none mb-2 block"
                    />
                    <div className="text-lg text-slate-500 font-medium">Professional Profile</div>

                    {data.personal.summary && (
                        <EditableField
                            value={data.personal.summary}
                            onUpdate={(v) => onUpdate?.('personal.summary', v)}
                            multiline={true}
                            as="div"
                            className="mt-4 text-slate-600 leading-relaxed block"
                            renderCustom={<MarkdownRenderer text={data.personal.summary} />}
                        />
                    )}
                </header>

                {visible(data.experience).length > 0 && (
                    <section className="mb-8 group relative">
                        {(data.experience?.length === 0 || !data.experience) && (
                            <AddItemButton label="Add Experience section" onClick={() => {
                                const copy = [{ id: Date.now().toString(), role: "New Role", company: "Company", start: "", end: "", bullets: [""] }];
                                onUpdate?.('experience', JSON.stringify(copy));
                            }} />
                        )}
                        {visible(data.experience).length > 0 && (
                            <>
                                <h2 className="text-xl font-bold uppercase tracking-widest text-slate-900 mb-5 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-blue-600 rounded-sm print:!bg-blue-600"></span>
                                    <EditableField value={data.layoutOverrides?.global?.labels?.experience || L.experience} onUpdate={v => onUpdate?.('layoutOverrides.global.labels.experience', v)} as="span" />
                                </h2>
                                <div className="space-y-6 border-l-2 border-slate-100 ml-1.5 pl-6">
                                    {visible(data.experience).map((exp: any) => {
                                        const realIndex = data.experience.indexOf(exp)
                                        return (
                                            <div key={exp.id || Math.random()} className="relative group/item pr-8">
                                                <RemoveItemButton onClick={() => {
                                                    const copy = [...data.experience];
                                                    copy.splice(realIndex, 1);
                                                    onUpdate?.('experience', JSON.stringify(copy));
                                                }} />
                                                <div className="absolute -left-[31px] top-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-full print:!border-blue-600"></div>

                                                <div className="flex justify-between items-baseline mb-1 gap-2">
                                                    <EditableField
                                                        value={exp.role || ""}
                                                        onUpdate={(v) => onUpdate?.(`experience.${realIndex}.role`, v)}
                                                        as="h3"
                                                        className="text-lg font-bold text-slate-900 block flex-1"
                                                        renderCustom={<MarkdownRenderer text={exp.role || ""} />}
                                                        placeholder="Role"
                                                    />
                                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wide flex gap-1 items-center">
                                                        <EditableField value={exp.start} onUpdate={(v) => onUpdate?.(`experience.${realIndex}.start`, v)} placeholder="MM/YY" />
                                                        <span>—</span>
                                                        <EditableField value={exp.end} onUpdate={(v) => onUpdate?.(`experience.${realIndex}.end`, v)} placeholder="MM/YY" />
                                                    </div>
                                                </div>
                                                <EditableField
                                                    value={exp.company || ""}
                                                    onUpdate={(v) => onUpdate?.(`experience.${realIndex}.company`, v)}
                                                    as="div"
                                                    className="font-semibold text-blue-600 mb-2 print:!text-blue-600 block"
                                                    renderCustom={<MarkdownRenderer text={exp.company || ""} />}
                                                    placeholder="Company"
                                                />
                                                <ul className="list-disc list-outside ml-4 space-y-1.5 text-slate-600 marker:text-slate-300">
                                                    {exp.bullets?.map((b: string, idx: number) => (
                                                        <li key={idx} className="group/bullet relative">
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
                                                    <AddItemButton label="Bullet" className="w-auto ml-1 mt-1 justify-start border-none bg-transparent hover:bg-slate-50 text-slate-400 shadow-none px-1 py-0.5" onClick={() => {
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
                )}

                <section className="mb-8 group relative">
                    {(data.education?.length === 0 || !data.education) && (
                        <AddItemButton label="Add Education section" onClick={() => {
                            const copy = [{ id: Date.now().toString(), school: "University", degree: "Degree", field: "", start: "", end: "" }];
                            onUpdate?.('education', JSON.stringify(copy));
                        }} />
                    )}
                    {visible(data.education).length > 0 && (
                        <>
                            <h2 className="text-xl font-bold uppercase tracking-widest text-slate-900 mb-5 flex items-center gap-2">
                                <span className="w-1 h-6 bg-blue-600 rounded-sm print:!bg-blue-600"></span>
                                <EditableField value={data.layoutOverrides?.global?.labels?.education || L.education} onUpdate={v => onUpdate?.('layoutOverrides.global.labels.education', v)} as="span" />
                            </h2>
                            <div className="grid gap-4">
                                {visible(data.education).map((edu: any) => {
                                    const realIndex = data.education.indexOf(edu)
                                    return (
                                        <div key={edu.id || Math.random()} className="flex justify-between items-start gap-4 group/item relative">
                                            <RemoveItemButton onClick={() => {
                                                const copy = [...data.education];
                                                copy.splice(realIndex, 1);
                                                onUpdate?.('education', JSON.stringify(copy));
                                            }} />
                                            <div className="flex-1">
                                                <EditableField
                                                    value={edu.school || ""}
                                                    onUpdate={(v) => onUpdate?.(`education.${realIndex}.school`, v)}
                                                    as="h4"
                                                    className="font-bold text-slate-900 text-lg block"
                                                    renderCustom={<MarkdownRenderer text={edu.school || ""} />}
                                                    placeholder="School / University"
                                                />
                                                <EditableField
                                                    value={edu.degree || ""}
                                                    onUpdate={(v) => onUpdate?.(`education.${realIndex}.degree`, v)}
                                                    as="div"
                                                    className="text-slate-600 block"
                                                    renderCustom={<MarkdownRenderer text={edu.degree || ""} />}
                                                    placeholder="Degree"
                                                />
                                            </div>
                                            <div className="text-right min-w-[100px]">
                                                <div className="font-bold text-slate-400 text-xs uppercase flex items-center justify-end gap-1">
                                                    <EditableField value={edu.start} onUpdate={(v) => onUpdate?.(`education.${realIndex}.start`, v)} placeholder="MM/YY" />
                                                    <span>—</span>
                                                    <EditableField value={edu.end} onUpdate={(v) => onUpdate?.(`education.${realIndex}.end`, v)} placeholder="MM/YY" />
                                                </div>
                                                {edu.gpa && (
                                                    <div className="text-xs text-slate-500 font-medium flex justify-end gap-1">
                                                        GPA: <EditableField value={edu.gpa} onUpdate={(v) => onUpdate?.(`education.${realIndex}.gpa`, v)} />
                                                    </div>
                                                )}
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

                <section className="group relative">
                    {(data.projects?.length === 0 || !data.projects) && (
                        <AddItemButton label="Add Projects section" onClick={() => {
                            const copy = [{ id: Date.now().toString(), title: "Project Name", bullets: [""] }];
                            onUpdate?.('projects', JSON.stringify(copy));
                        }} />
                    )}
                    {visible(data.projects).length > 0 && (
                        <>
                            <h2 className="text-xl font-bold uppercase tracking-widest text-slate-900 mb-5 flex items-center gap-2">
                                <span className="w-1 h-6 bg-blue-600 rounded-sm print:!bg-blue-600"></span>
                                <EditableField value={data.layoutOverrides?.global?.labels?.projects || L.projects} onUpdate={v => onUpdate?.('layoutOverrides.global.labels.projects', v)} as="span" />
                            </h2>
                            <div className="space-y-4">
                                {visible(data.projects).map((proj: any) => {
                                    const realIndex = data.projects.indexOf(proj)
                                    return (
                                        <div key={proj.id || Math.random()} className="group/item relative pr-8">
                                            <RemoveItemButton onClick={() => {
                                                const copy = [...data.projects];
                                                copy.splice(realIndex, 1);
                                                onUpdate?.('projects', JSON.stringify(copy));
                                            }} />
                                            <div className="flex justify-between items-baseline gap-2">
                                                <EditableField
                                                    value={proj.title || ""}
                                                    onUpdate={(v) => onUpdate?.(`projects.${realIndex}.title`, v)}
                                                    as="h4"
                                                    className="font-bold text-slate-900 block flex-1"
                                                    renderCustom={proj.link ? (
                                                        <a href={proj.link} target="_blank" rel="noreferrer" className="hover:text-blue-600 hover:underline">
                                                            <MarkdownRenderer text={proj.title} />
                                                        </a>
                                                    ) : <MarkdownRenderer text={proj.title} />}
                                                    placeholder="Project Title"
                                                />
                                                <div className="flex gap-2">
                                                    {proj.tech?.length > 0 && (
                                                        <EditableField
                                                            value={proj.tech.join(" • ")}
                                                            onUpdate={(v) => onUpdate?.(`projects.${realIndex}.tech`, JSON.stringify(v.split(' • ').map(x => x.trim())))}
                                                            className="block"
                                                            renderCustom={
                                                                <>
                                                                    {proj.tech.map((t: string, idx: number) => (
                                                                        <span key={idx} className="text-[10px] uppercase font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 mr-1.5">{t}</span>
                                                                    ))}
                                                                </>
                                                            }
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                            <ul className="list-disc list-outside ml-4 mt-1 space-y-1 text-slate-600 marker:text-slate-300">
                                                {proj.bullets?.map((b: string, idx: number) => (
                                                    <li key={idx} className="group/bullet relative">
                                                        <RemoveItemButton className="top-0 right-0 p-0 hover:bg-transparent text-gray-300 opacity-40 hover:opacity-100" onClick={() => {
                                                            const copy = [...proj.bullets];
                                                            copy.splice(idx, 1);
                                                            onUpdate?.(`projects.${realIndex}.bullets`, JSON.stringify(copy));
                                                        }} />
                                                        <EditableField
                                                            value={b}
                                                            onUpdate={(v) => onUpdate?.(`projects.${realIndex}.bullets.${idx}`, v)}
                                                            multiline={true}
                                                            className="block pr-6"
                                                            renderCustom={<MarkdownRenderer text={b} />}
                                                        />
                                                    </li>
                                                ))}
                                                <AddItemButton label="Bullet" className="w-auto ml-1 mt-1 justify-start border-none bg-transparent hover:bg-slate-50 text-slate-400 shadow-none px-1 py-0.5" onClick={() => {
                                                    const copy = [...(proj.bullets || []), ""];
                                                    onUpdate?.(`projects.${realIndex}.bullets`, JSON.stringify(copy));
                                                }} />
                                            </ul>
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
            </main>
        </div>
    )
}