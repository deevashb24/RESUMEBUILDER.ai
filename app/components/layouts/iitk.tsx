import React from "react"
import { ParsedResumeData } from "@/lib/resume"
import { mapParsedResumeToIITKDocument, IITKExperienceEntry } from "@/lib/iitk-adapter"
import { EditableField } from "../ui/editable-field"
import { AddItemButton, RemoveItemButton } from "../ui/structural-controls"

export const IITKLayout = ({ data, onUpdate }: { data: ParsedResumeData, onUpdate?: (pathStr: string, newValue: any) => void }) => {
    if (!data) return null;
    const doc = mapParsedResumeToIITKDocument(data);

    // Helpers to find original indices
    const getEduIndex = (id: string) => data.education?.findIndex(e => e.id === id) ?? -1
    const getExpIndex = (id: string) => data.experience?.findIndex(e => e.id === id) ?? -1
    const getProjIndex = (id: string) => data.projects?.findIndex(e => e.id === id) ?? -1

    return (
        <>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/dreampulse/computer-modern-web-font@master/fonts.css" />
            <div className="iitk-root relative w-full min-h-full bg-white text-black text-[10pt] leading-[1.15]">
                <style dangerouslySetInnerHTML={{
                    __html: `
          .iitk-root {
            font-family: "Computer Modern Serif", "Latin Modern Roman", "CMU Serif", serif;
            margin: 0;
            padding: 0.2in;
            box-sizing: border-box;
            width: 100%;
          }
          
          @media print {
            @page {
              margin: 0.2in;
              size: A4;
            }
            .iitk-root {
              padding: 0;
            }
            .iitk-keep-together {
              break-inside: avoid;
              page-break-inside: avoid;
            }
            .page-break {
              page-break-before: always;
            }
          }

          .iitk-sc {
            font-variant-caps: small-caps;
          }
          
          .iitk-bullet-list {
            margin: 0;
            padding: 0;
            padding-left: 14pt;
            list-style-type: disc;
          }
          .iitk-bullet-list li {
            margin-bottom: 0pt;
            padding-bottom: 0pt;
            line-height: 1.15;
          }
          .iitk-table, .iitk-th, .iitk-td {
            border: 1px solid black;
            border-collapse: collapse;
          }
          
          .iitk-td {
            padding: 2pt 4pt;
            vertical-align: middle;
          }
          .iitk-th {
            padding: 2pt 4pt;
            font-weight: bold;
            text-align: center;
          }
        `}} />

                {/* HEADER */}
                <div className="iitk-keep-together mb-[3mm]">
                    <div className="w-full text-left font-bold text-[20.74pt] mb-[-2pt]">
                        <EditableField
                            value={doc.header.name}
                            onUpdate={(v) => onUpdate?.('personal.name', v)}
                            as="div"
                            className="iitk-sc inline-block"
                        />
                    </div>
                    <div className="w-full flex justify-between text-[9pt] leading-tight">
                        <EditableField
                            value={doc.header.academicLine1 || ""}
                            onUpdate={(v) => onUpdate?.('layoutOverrides.iitk.header.academicLine1', v)}
                            as="span"
                            placeholder="Academic Line 1"
                        />
                        <span className="flex items-center gap-1">
                            <span className={`inline-flex items-center gap-1 relative group/item ${!doc.header.email?.trim() ? 'hidden' : ''}`}>
                                <RemoveItemButton onClick={() => onUpdate?.('personal.email', '')} className="top-[-4px] left-[-12px] w-4 h-4" />
                                <span className="inline-flex w-3 h-3 bg-black text-white items-center justify-center text-[6pt] rounded-[sm]">✉</span>
                                <EditableField value={doc.header.email || ""} onUpdate={(v) => onUpdate?.('personal.email', v)} placeholder="Email" as="a" href={`mailto:${doc.header.email || ""}`} className="hover:underline" />
                            </span>
                            {(doc.header.email?.trim() || !doc.header.email) && (doc.header.phone?.trim() || !doc.header.phone) && <span className={`${(!doc.header.email?.trim() || !doc.header.phone?.trim()) ? 'hidden' : ''}`}>|</span>}
                            <span className={`inline-flex items-center gap-1 relative group/item ${!doc.header.phone?.trim() ? 'hidden' : ''}`}>
                                <RemoveItemButton onClick={() => onUpdate?.('personal.phone', '')} className="top-[-4px] left-[-12px] w-4 h-4" />
                                <span className="inline-flex w-3 h-3 bg-black text-white items-center justify-center text-[6pt] rounded-[sm]">✆</span>
                                <EditableField value={doc.header.phone || ""} onUpdate={(v) => onUpdate?.('personal.phone', v)} placeholder="Phone" as="a" href={`tel:${doc.header.phone?.replace(/\\D/g, '') || ""}`} className="hover:underline" />
                            </span>
                        </span>
                    </div>
                    <div className="w-full flex justify-between text-[9pt] leading-tight mt-1">
                        <EditableField
                            value={doc.header.academicLine2 || ""}
                            onUpdate={(v) => onUpdate?.('layoutOverrides.iitk.header.academicLine2', v)}
                            as="span"
                            placeholder="Academic Line 2"
                        />
                        <span className="flex items-center gap-1">
                            <span className={`inline-flex items-center gap-1 relative group/item ${!doc.header.linkedin?.trim() ? 'hidden' : ''}`}>
                                <RemoveItemButton onClick={() => onUpdate?.('personal.linkedin', '')} className="top-[-4px] left-[-12px] w-4 h-4" />
                                <span className="inline-flex w-3 h-3 bg-black text-white items-center justify-center text-[6pt] rounded-[sm]">in</span>
                                <EditableField value={doc.header.linkedin || ""} onUpdate={(v) => onUpdate?.('personal.linkedin', v)} placeholder="LinkedIn" as="a" href={doc.header.linkedin?.startsWith('http') ? doc.header.linkedin : `https://${doc.header.linkedin}`} target="_blank" className="hover:underline" />
                            </span>
                            {(doc.header.linkedin?.trim() || !doc.header.linkedin) && (doc.header.github?.trim() || !doc.header.github) && <span className={`${(!doc.header.linkedin?.trim() || !doc.header.github?.trim()) ? 'hidden' : ''}`}>|</span>}
                            <span className={`inline-flex items-center gap-1 relative group/item ${!doc.header.github?.trim() ? 'hidden' : ''}`}>
                                <RemoveItemButton onClick={() => onUpdate?.('personal.summary', '')} className="top-[-4px] left-[-12px] w-4 h-4" />
                                <span className="inline-flex w-3 h-3 bg-black text-white items-center justify-center text-[6pt] rounded-[sm] opacity-80">gh</span>
                                <EditableField value={doc.header.github || ""} onUpdate={(v) => onUpdate?.('personal.summary', v)} placeholder="GitHub" as="a" href={doc.header.github?.startsWith('http') ? doc.header.github : `https://${doc.header.github}`} target="_blank" className="hover:underline" />
                            </span>
                        </span>
                    </div>
                    <div className="w-full h-[1pt] bg-black mt-[1.5mm]" />
                </div>

                {/* ACADEMIC QUALIFICATIONS */}
                {doc.academicQualifications && doc.academicQualifications.length > 0 && (
                    <div className="mb-[2mm]">
                        <SectionHeader title={<EditableField value={data.layoutOverrides?.global?.labels?.academicQualifications || "Academic Qualifications"} onUpdate={v => onUpdate?.('layoutOverrides.global.labels.academicQualifications', v)} as="span" />} />
                        <table className="iitk-table w-full text-center text-[10pt]">
                            <thead>
                                <tr>
                                    <th className="iitk-th w-[13%]">Year</th>
                                    <th className="iitk-th w-[35%]">Degree/Certificate</th>
                                    <th className="iitk-th w-[38%]">Institute</th>
                                    <th className="iitk-th w-[14%]">Performance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {doc.academicQualifications.filter(q => q.isVisible !== false).map((q, i) => {
                                    const realIndex = getEduIndex(q.id)
                                    // if realIndex == -1, user created this exclusively for layoutOverrides which won't map correctly without robust array sync, so map locally if pos
                                    const yPath = realIndex >= 0 ? `education.${realIndex}.start` : `layoutOverrides.iitk.academicQualifications.${i}.year`;
                                    const dPath = realIndex >= 0 ? `education.${realIndex}.degree` : `layoutOverrides.iitk.academicQualifications.${i}.degree`;
                                    const iPath = realIndex >= 0 ? `education.${realIndex}.school` : `layoutOverrides.iitk.academicQualifications.${i}.institute`;
                                    const pPath = realIndex >= 0 ? `education.${realIndex}.gpa` : `layoutOverrides.iitk.academicQualifications.${i}.performance`;

                                    return (
                                        <tr key={q.id || i} className="iitk-keep-together group/row relative">
                                            <td className="iitk-td font-semibold relative">
                                                <RemoveItemButton onClick={() => {
                                                    if (realIndex >= 0) {
                                                        const copy = [...(data.education || [])];
                                                        copy.splice(realIndex, 1);
                                                        onUpdate?.('education', JSON.stringify(copy));
                                                    }
                                                }} className="top-1 -left-6 right-auto z-10" />
                                                <EditableField value={q.year} onUpdate={v => onUpdate?.(yPath, v)} />
                                            </td>
                                            <td className="iitk-td"><EditableField value={q.degree} onUpdate={v => onUpdate?.(dPath, v)} /></td>
                                            <td className="iitk-td"><EditableField value={q.institute} onUpdate={v => onUpdate?.(iPath, v)} /></td>
                                            <td className="iitk-td font-bold"><EditableField value={q.performance} onUpdate={v => onUpdate?.(pPath, v)} /></td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                        <AddItemButton label="Add Education Row" onClick={() => {
                            const copy = [...(data.education || []), { id: Date.now().toString(), school: "New Institute", degree: "Degree", start: "", end: "Present", gpa: "N/A" }];
                            onUpdate?.('education', JSON.stringify(copy));
                        }} className="mt-1" />
                    </div>
                )}

                {/* ACADEMIC ACHIEVEMENTS */}
                {doc.academicAchievements && doc.academicAchievements.length > 0 && (
                    <div className="mb-[2mm]">
                        <SectionHeader title={<EditableField value={data.layoutOverrides?.global?.labels?.academicAchievements || "Academic Achievements"} onUpdate={v => onUpdate?.('layoutOverrides.global.labels.academicAchievements', v)} as="span" />} />
                        <ul className="iitk-bullet-list">
                            {doc.academicAchievements.filter(a => a.isVisible !== false).map((a, i) => (
                                <li key={a.id || i} className="iitk-keep-together flex justify-between items-start">
                                    <EditableField
                                        value={a.text}
                                        onUpdate={v => onUpdate?.(`layoutOverrides.iitk.academicAchievements.${i}.text`, v)}
                                        renderCustom={<span dangerouslySetInnerHTML={{ __html: a.text }} />}
                                    />
                                    {a.trailingDate && (
                                        <EditableField value={a.trailingDate} onUpdate={v => onUpdate?.(`layoutOverrides.iitk.academicAchievements.${i}.trailingDate`, v)} className="text-gray-700 italic text-[9pt] pl-4 whitespace-nowrap" />
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* PROFESSIONAL EXPERIENCE */}
                {doc.professionalExperience && doc.professionalExperience.length > 0 && (
                    <div className="mb-[2mm]">
                        <SectionHeader title={<EditableField value={data.layoutOverrides?.global?.labels?.experience || "Professional Experience"} onUpdate={v => onUpdate?.('layoutOverrides.global.labels.experience', v)} as="span" />} />
                        {doc.professionalExperience.filter(e => e.isVisible !== false).map((exp, i) => {
                            const realIndex = getExpIndex(exp.id)
                            const rPath = realIndex >= 0 ? `experience.${realIndex}.role` : `layoutOverrides.iitk.professionalExperience.${i}.role`
                            const oPath = realIndex >= 0 ? `experience.${realIndex}.company` : `layoutOverrides.iitk.professionalExperience.${i}.organization`
                            const dPath = realIndex >= 0 ? `experience.${realIndex}.start` : `layoutOverrides.iitk.professionalExperience.${i}.displayDate`

                            return (
                                <div key={exp.id || i} className="mb-1 iitk-keep-together group/item relative">
                                    <RemoveItemButton onClick={() => {
                                        if (realIndex >= 0) {
                                            const copy = [...(data.experience || [])];
                                            copy.splice(realIndex, 1);
                                            onUpdate?.('experience', JSON.stringify(copy));
                                        }
                                    }} className="top-0 -left-6 right-auto z-10" />

                                    <div className="bg-[#e5e7eb] w-full px-[3pt] py-[1.5pt] flex justify-between items-center text-[10pt] mb-[2pt]">
                                        <div>
                                            <EditableField value={exp.role} onUpdate={v => onUpdate?.(rPath, v)} className="font-bold inline-block" /> {exp.role?.trim() && exp.organization?.trim() ? " | " : " "} <EditableField value={exp.organization} onUpdate={v => onUpdate?.(oPath, v)} className="italic inline-block" />
                                        </div>
                                        <EditableField value={exp.displayDate || ""} onUpdate={v => onUpdate?.(dPath, v)} className="text-gray-700 italic text-[9pt]" placeholder="Date" />
                                    </div>

                                    {exp.variant === "structured" && exp.highlight && (
                                        <EditableField value={exp.highlight} onUpdate={v => onUpdate?.(`layoutOverrides.iitk.professionalExperience.${i}.highlight`, v)} className="italic mb-[2pt] block" renderCustom={<span dangerouslySetInnerHTML={{ __html: exp.highlight }} />} />
                                    )}

                                    {exp.variant === "simple" ? (
                                        <ul className="iitk-bullet-list mt-1">
                                            {exp.bullets.map((b, bi) => (
                                                <li key={bi} className="group/bullet relative">
                                                    <RemoveItemButton className="top-0 -left-6 right-auto hover:bg-transparent text-gray-400 opacity-40 hover:opacity-100" onClick={() => {
                                                        if (realIndex >= 0) {
                                                            const copy = [...exp.bullets];
                                                            copy.splice(bi, 1);
                                                            onUpdate?.(`experience.${realIndex}.bullets`, JSON.stringify(copy));
                                                        }
                                                    }} />
                                                    <EditableField value={b} onUpdate={v => onUpdate?.(realIndex >= 0 ? `experience.${realIndex}.bullets.${bi}` : `layoutOverrides.iitk.professionalExperience.${i}.bullets.${bi}`, v)} renderCustom={<span dangerouslySetInnerHTML={{ __html: b }} />} multiline={true} />
                                                </li>
                                            ))}
                                            <li className="list-none">
                                                <AddItemButton label="Bullet" className="w-auto mt-1 justify-start border-none bg-transparent hover:bg-gray-50 text-gray-400 shadow-none px-1 py-0.5" onClick={() => {
                                                    if (realIndex >= 0) {
                                                        const copy = [...(exp.bullets || []), ""];
                                                        onUpdate?.(`experience.${realIndex}.bullets`, JSON.stringify(copy));
                                                    }
                                                }} />
                                            </li>
                                        </ul>
                                    ) : (
                                        <table className="iitk-table w-full text-[10pt] mt-[2pt]">
                                            <tbody>
                                                {(exp as any).blocks?.map((block: any, bi: number) => (
                                                    <tr key={bi} className="iitk-keep-together group/row relative">
                                                        <td className="iitk-td border-r w-[10%] text-center font-bold relative">
                                                            <RemoveItemButton onClick={() => {
                                                                if (realIndex >= 0) {
                                                                    const copy = [...(exp as any).blocks];
                                                                    copy.splice(bi, 1);
                                                                    onUpdate?.(`experience.${realIndex}.blocks`, JSON.stringify(copy));
                                                                }
                                                            }} className="top-1 -left-6 right-auto z-10" />
                                                            <EditableField value={block.label} onUpdate={v => onUpdate?.(`layoutOverrides.iitk.professionalExperience.${i}.blocks.${bi}.label`, v)} />
                                                        </td>
                                                        <td className="iitk-td align-top border-l p-0 py-[1pt] px-[2pt]">
                                                            <ul className="iitk-bullet-list bg-transparent" style={{ marginLeft: "10pt" }}>
                                                                {block.items?.map((item: string, ii: number) => (
                                                                    <li key={ii} className="group/bullet relative">
                                                                        <RemoveItemButton className="top-0 -left-6 right-auto hover:bg-transparent text-gray-300 opacity-40 hover:opacity-100" onClick={() => {
                                                                            if (realIndex >= 0) {
                                                                                const copy = [...block.items];
                                                                                copy.splice(ii, 1);
                                                                                onUpdate?.(`experience.${realIndex}.blocks.${bi}.items`, JSON.stringify(copy));
                                                                            }
                                                                        }} />
                                                                        <EditableField value={item} onUpdate={v => onUpdate?.(`layoutOverrides.iitk.professionalExperience.${i}.blocks.${bi}.items.${ii}`, v)} renderCustom={<span dangerouslySetInnerHTML={{ __html: item }} />} multiline={true} />
                                                                    </li>
                                                                ))}
                                                                <li className="list-none">
                                                                    <AddItemButton label="Sub-task" className="w-auto mt-1 justify-start border-none bg-transparent hover:bg-gray-50 text-gray-400 shadow-none px-1 py-0.5" onClick={() => {
                                                                        if (realIndex >= 0) {
                                                                            const copy = [...(block.items || []), ""];
                                                                            onUpdate?.(`experience.${realIndex}.blocks.${bi}.items`, JSON.stringify(copy));
                                                                        }
                                                                    }} />
                                                                </li>
                                                            </ul>
                                                        </td>
                                                    </tr>
                                                ))}
                                                <tr>
                                                    <td colSpan={2} className="p-1 border-none text-center bg-gray-50/50 relative">
                                                        <AddItemButton label="Add Block" className="w-full mt-1 border-none bg-transparent shadow-none" onClick={() => {
                                                            if (realIndex >= 0) {
                                                                const copy = [...((exp as any).blocks || []), { label: "Project", items: [""] }];
                                                                onUpdate?.(`experience.${realIndex}.blocks`, JSON.stringify(copy));
                                                            }
                                                        }} />
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )
                        })}
                        <AddItemButton label="Add Experience section" onClick={() => {
                            const copy = [...(data.experience || []), { id: Date.now().toString(), role: "New Role", company: "Company", start: "", end: "", bullets: [""] }];
                            onUpdate?.('experience', JSON.stringify(copy));
                        }} className="mt-1" />
                    </div>
                )}

                {/* KEY PROJECTS AND WORKSHOPS */}
                {doc.projectsAndWorkshops && doc.projectsAndWorkshops.length > 0 && (
                    <div className="mb-[2mm]">
                        <SectionHeader title={<EditableField value={data.layoutOverrides?.global?.labels?.projects || "Key Projects and Workshops"} onUpdate={v => onUpdate?.('layoutOverrides.global.labels.projects', v)} as="span" />} />
                        {doc.projectsAndWorkshops.filter(p => p.isVisible !== false).map((proj, i) => {
                            const realIndex = getProjIndex(proj.id)
                            const tPath = realIndex >= 0 ? `projects.${realIndex}.title` : `layoutOverrides.iitk.projectsAndWorkshops.${i}.title`
                            const sPath = realIndex >= 0 ? `projects.${realIndex}.tech` : `layoutOverrides.iitk.projectsAndWorkshops.${i}.subtitle`

                            return (
                                <div key={proj.id || i} className="mb-1 iitk-keep-together group/item relative">
                                    <RemoveItemButton onClick={() => {
                                        if (realIndex >= 0) {
                                            const copy = [...(data.projects || [])];
                                            copy.splice(realIndex, 1);
                                            onUpdate?.('projects', JSON.stringify(copy));
                                        }
                                    }} className="top-0 -left-6 right-auto z-10" />

                                    <div className="bg-[#e5e7eb] w-full px-[3pt] py-[1.5pt] flex justify-between items-center text-[10pt] mb-[1pt]">
                                        <div className="flex items-center flex-wrap">
                                            <EditableField value={proj.title} onUpdate={v => onUpdate?.(tPath, v)} className="font-bold inline-block" /> 
                                            {proj.title?.trim() && proj.subtitle?.trim() && <span className="mx-1">|</span>} 
                                            <EditableField value={proj.subtitle || ""} onUpdate={v => { if (realIndex >= 0) { onUpdate?.(`projects.${realIndex}.tech`, JSON.stringify(v.split(' | ').map(x => x.trim()))) } else { onUpdate?.(sPath, v) } }} className="italic inline-block" />
                                            <span className={`inline-flex items-center gap-[3px] ml-2 relative group/item ${!proj.link?.trim() ? 'hidden' : ''}`}>
                                                <RemoveItemButton onClick={() => {
                                                    if (realIndex >= 0) onUpdate?.(`projects.${realIndex}.link`, '')
                                                    else onUpdate?.(`layoutOverrides.iitk.projectsAndWorkshops.${i}.link`, '')
                                                }} className="top-[-4px] left-[-12px] w-3 h-3" />
                                                <a 
                                                    href={proj.link?.startsWith('http') ? proj.link : `https://${proj.link}`}
                                                    target="_blank"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        const url = window.prompt("Enter Repository URL:", proj.link || "");
                                                        if (url !== null) {
                                                            if (realIndex >= 0) onUpdate?.(`projects.${realIndex}.link`, url);
                                                            else onUpdate?.(`layoutOverrides.iitk.projectsAndWorkshops.${i}.link`, url);
                                                        }
                                                    }}
                                                    className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer text-gray-700 hover:text-black"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                                    </svg>
                                                </a>
                                            </span>
                                            {!proj.link?.trim() && (
                                                <span className="print:hidden ml-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                    <AddItemButton label="Link" className="w-auto h-4 px-1.5 py-0 text-[8px] bg-transparent border-gray-300 text-gray-500 hover:bg-gray-100" onClick={() => {
                                                        const url = window.prompt("Enter Repository URL:", "github.com/");
                                                        if (url !== null) {
                                                            if (realIndex >= 0) onUpdate?.(`projects.${realIndex}.link`, url)
                                                            else onUpdate?.(`layoutOverrides.iitk.projectsAndWorkshops.${i}.link`, url)
                                                        }
                                                    }} />
                                                </span>
                                            )}
                                        </div>
                                        <EditableField value={proj.displayDate || ""} onUpdate={v => {
                                            if (realIndex >= 0) onUpdate?.(`projects.${realIndex}.date`, v)
                                            else onUpdate?.(`layoutOverrides.iitk.projectsAndWorkshops.${i}.displayDate`, v)
                                        }} className="text-gray-700 italic text-[9pt]" placeholder="Date" />
                                    </div>
                                    {proj.context && (
                                        <EditableField value={proj.context} onUpdate={v => onUpdate?.(`layoutOverrides.iitk.projectsAndWorkshops.${i}.context`, v)} className="italic text-[10pt] mb-[1pt] block" />
                                    )}
                                    <ul className="iitk-bullet-list mt-[1pt]">
                                        {proj.bullets.map((b, bi) => (
                                            <li key={bi} className="group/bullet relative">
                                                <RemoveItemButton className="top-0 -left-6 right-auto hover:bg-transparent text-gray-400 opacity-40 hover:opacity-100" onClick={() => {
                                                    if (realIndex >= 0) {
                                                        const copy = [...proj.bullets];
                                                        copy.splice(bi, 1);
                                                        onUpdate?.(`projects.${realIndex}.bullets`, JSON.stringify(copy));
                                                    }
                                                }} />
                                                <EditableField value={b} onUpdate={v => onUpdate?.(realIndex >= 0 ? `projects.${realIndex}.bullets.${bi}` : `layoutOverrides.iitk.projectsAndWorkshops.${i}.bullets.${bi}`, v)} renderCustom={<span dangerouslySetInnerHTML={{ __html: b }} />} multiline={true} />
                                            </li>
                                        ))}
                                        <li className="list-none">
                                            <AddItemButton label="Bullet" className="w-auto mt-1 justify-start border-none bg-transparent hover:bg-gray-50 text-gray-400 shadow-none px-1 py-0.5" onClick={() => {
                                                if (realIndex >= 0) {
                                                    const copy = [...(proj.bullets || []), ""];
                                                    onUpdate?.(`projects.${realIndex}.bullets`, JSON.stringify(copy));
                                                }
                                            }} />
                                        </li>
                                    </ul>
                                </div>
                            )
                        })}
                        <AddItemButton label="Add Project section" onClick={() => {
                            const copy = [...(data.projects || []), { id: Date.now().toString(), title: "New Project", tech: ["Tech"], start: "", end: "", bullets: [""] }];
                            onUpdate?.('projects', JSON.stringify(copy));
                        }} className="mt-1" />
                    </div>
                )}

                {/* TECHNICAL SKILLS AND RELEVANT COURSES */}
                {doc.technicalSkillsTable && doc.technicalSkillsTable.length > 0 && (
                    <div className="mb-[2mm] iitk-keep-together">
                        <SectionHeader title={<EditableField value={data.layoutOverrides?.global?.labels?.skills || "Technical Skills & Relevant Courses"} onUpdate={v => onUpdate?.('layoutOverrides.global.labels.skills', v)} as="span" />} />
                        <table className="iitk-table w-full text-[10pt]">
                            <tbody>
                                {doc.technicalSkillsTable.filter(s => s.isVisible !== false).map((skill, i) => (
                                    <tr key={skill.id || i} className="group/row relative">
                                        <td className="iitk-td font-bold w-[25%] text-center relative">
                                            <RemoveItemButton onClick={() => {
                                                onUpdate?.(`layoutOverrides.iitk.technicalSkillsTable.${i}.isVisible`, false);
                                            }} className="top-1 -left-6 right-auto z-10" />
                                            <EditableField value={skill.label} onUpdate={v => onUpdate?.(`layoutOverrides.iitk.technicalSkillsTable.${i}.label`, v)} />
                                        </td>
                                        <td className="iitk-td w-[75%]">
                                            <EditableField value={skill.text} onUpdate={v => {
                                                if (skill.id === "s-lang") onUpdate?.("skills.languages", JSON.stringify(v.split(' | ').map(x => x.trim())));
                                                else if (skill.id === "s-frame") onUpdate?.("skills.frameworks", JSON.stringify(v.split(' | ').map(x => x.trim())));
                                                else if (skill.id === "s-tool") onUpdate?.("skills.tools", JSON.stringify(v.split(' | ').map(x => x.trim())));
                                                else if (skill.id === "s-con") onUpdate?.("skills.concepts", JSON.stringify(v.split(' | ').map(x => x.trim())));
                                                else onUpdate?.(`layoutOverrides.iitk.technicalSkillsTable.${i}.text`, v);
                                            }} renderCustom={<span dangerouslySetInnerHTML={{ __html: skill.text }} />} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <AddItemButton label="Add Skill Category" onClick={() => {
                            // IITK Maps skills from layoutOverrides dynamically if lengths mismatch or they are added manualy. To support adding we push to layoutOverrides.
                            const currentOverrides = data.layoutOverrides?.iitk?.technicalSkillsTable || (doc.technicalSkillsTable ? [...doc.technicalSkillsTable] : []);
                            const copy = [...currentOverrides, { id: Date.now().toString(), label: "Category", text: "Skill 1 | Skill 2" }];
                            onUpdate?.('layoutOverrides.iitk.technicalSkillsTable', JSON.stringify(copy));
                        }} className="mt-1" />
                    </div>
                )}

                {/* POSITIONS OF RESPONSIBILITY */}
                {doc.positionsOfResponsibility && doc.positionsOfResponsibility.length > 0 && (
                    <div className="mb-[2mm]">
                        <SectionHeader title={<EditableField value={data.layoutOverrides?.global?.labels?.responsibility || "Positions of Responsibility"} onUpdate={v => onUpdate?.('layoutOverrides.global.labels.responsibility', v)} as="span" />} />
                        {doc.positionsOfResponsibility.filter(p => p.isVisible !== false).map((pos, i) => (
                            <div key={pos.id || i} className="mb-[2pt] iitk-keep-together group/item relative">
                                <RemoveItemButton onClick={() => {
                                    onUpdate?.(`layoutOverrides.iitk.positionsOfResponsibility.${i}.isVisible`, false);
                                }} className="top-0 -left-6 right-auto z-10" />

                                <div className="bg-[#e5e7eb] w-full px-[3pt] py-[1.5pt] flex justify-between items-center text-[10pt] mb-[1pt]">
                                    <div className="font-bold">
                                        <EditableField value={pos.role} onUpdate={v => onUpdate?.(`layoutOverrides.iitk.positionsOfResponsibility.${i}.role`, v)} className="inline-block" /> {pos.role?.trim() && pos.organization?.trim() ? " | " : " "} <EditableField value={pos.organization} onUpdate={v => onUpdate?.(`layoutOverrides.iitk.positionsOfResponsibility.${i}.organization`, v)} className="inline-block" />
                                    </div>
                                    <EditableField value={pos.displayDate || ""} onUpdate={v => onUpdate?.(`layoutOverrides.iitk.positionsOfResponsibility.${i}.displayDate`, v)} className="italic text-[10pt]" placeholder="Date" />
                                </div>
                                <ul className="iitk-bullet-list mt-[1pt]">
                                    {pos.bullets.map((b, bi) => (
                                        <li key={bi} className="group/bullet relative">
                                            <RemoveItemButton className="top-0 -left-6 right-auto hover:bg-transparent text-gray-400 opacity-40 hover:opacity-100" onClick={() => {
                                                const copy = [...pos.bullets];
                                                copy.splice(bi, 1);
                                                onUpdate?.(`layoutOverrides.iitk.positionsOfResponsibility.${i}.bullets`, JSON.stringify(copy));
                                            }} />
                                            <EditableField value={b} onUpdate={v => onUpdate?.(`layoutOverrides.iitk.positionsOfResponsibility.${i}.bullets.${bi}`, v)} renderCustom={<span dangerouslySetInnerHTML={{ __html: b }} />} multiline={true} />
                                        </li>
                                    ))}
                                    <li className="list-none">
                                        <AddItemButton label="Bullet" className="w-auto mt-1 justify-start border-none bg-transparent hover:bg-gray-50 text-gray-400 shadow-none px-1 py-0.5" onClick={() => {
                                            const copy = [...(pos.bullets || []), ""];
                                            onUpdate?.(`layoutOverrides.iitk.positionsOfResponsibility.${i}.bullets`, JSON.stringify(copy));
                                        }} />
                                    </li>
                                </ul>
                            </div>
                        ))}
                        <AddItemButton label="Add Position" onClick={() => {
                            const currentOverrides = data.layoutOverrides?.iitk?.positionsOfResponsibility || (doc.positionsOfResponsibility ? [...doc.positionsOfResponsibility] : []);
                            const copy = [...currentOverrides, { id: Date.now().toString(), role: "Role", organization: "Org", bullets: [""] }];
                            onUpdate?.('layoutOverrides.iitk.positionsOfResponsibility', JSON.stringify(copy));
                        }} className="mt-1" />
                    </div>
                )}

                {/* EXTRA-CURRICULAR ACTIVITIES */}
                {doc.extracurricularCategories && doc.extracurricularCategories.length > 0 && (
                    <div className="mb-[2mm] iitk-keep-together">
                        <SectionHeader title={<EditableField value={data.layoutOverrides?.global?.labels?.extracurricular || "Extra-Curricular Activities"} onUpdate={v => onUpdate?.('layoutOverrides.global.labels.extracurricular', v)} as="span" />} />
                        <table className="iitk-table w-full text-[10pt]">
                            <tbody>
                                {doc.extracurricularCategories.filter(e => e.isVisible !== false).map((category, i) => (
                                    <tr key={category.id || i} className="group/row relative">
                                        <td className="iitk-td font-bold w-[13%] text-center align-top py-[2pt] relative">
                                            <RemoveItemButton onClick={() => {
                                                onUpdate?.(`layoutOverrides.iitk.extracurricularCategories.${i}.isVisible`, false);
                                            }} className="top-0 -left-6 right-auto z-10" />
                                            <EditableField value={category.category} onUpdate={v => onUpdate?.(`layoutOverrides.iitk.extracurricularCategories.${i}.category`, v)} />
                                        </td>
                                        <td className="iitk-td w-[87%] align-top p-0 py-[1pt] px-[2pt]">
                                            <ul className="iitk-bullet-list" style={{ marginLeft: "10pt" }}>
                                                {category.bullets.map((b, bi) => (
                                                    <li key={bi} className="group/bullet relative">
                                                        <RemoveItemButton className="top-0 -left-6 right-auto hover:bg-transparent text-gray-400 opacity-40 hover:opacity-100" onClick={() => {
                                                            const copy = [...category.bullets];
                                                            copy.splice(bi, 1);
                                                            onUpdate?.(`layoutOverrides.iitk.extracurricularCategories.${i}.bullets`, JSON.stringify(copy));
                                                        }} />
                                                        <EditableField value={b} onUpdate={v => onUpdate?.(`layoutOverrides.iitk.extracurricularCategories.${i}.bullets.${bi}`, v)} renderCustom={<span dangerouslySetInnerHTML={{ __html: b }} />} multiline={true} />
                                                    </li>
                                                ))}
                                                <li className="list-none">
                                                    <AddItemButton label="Bullet" className="w-auto mt-1 justify-start border-none bg-transparent hover:bg-gray-50 text-gray-400 shadow-none px-1 py-0.5" onClick={() => {
                                                        const copy = [...(category.bullets || []), ""];
                                                        onUpdate?.(`layoutOverrides.iitk.extracurricularCategories.${i}.bullets`, JSON.stringify(copy));
                                                    }} />
                                                </li>
                                            </ul>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <AddItemButton label="Add Category" onClick={() => {
                            const currentOverrides = data.layoutOverrides?.iitk?.extracurricularCategories || (doc.extracurricularCategories ? [...doc.extracurricularCategories] : []);
                            const copy = [...currentOverrides, { id: Date.now().toString(), category: "Other", bullets: [""] }];
                            onUpdate?.('layoutOverrides.iitk.extracurricularCategories', JSON.stringify(copy));
                        }} className="mt-1" />
                    </div>
                )}

                {/* DYNAMIC CUSTOM SECTIONS */}
                {data.layoutOverrides?.iitk?.customLayoutSections?.filter((s: any) => s.isVisible !== false).map((section: any, si: number) => (
                    <div key={section.id || si} className="mb-[2mm] relative group/section">
                        <SectionHeader title={<EditableField value={section.title || "Custom Section"} onUpdate={v => onUpdate?.(`layoutOverrides.iitk.customLayoutSections.${si}.title`, v)} as="span" />} />
                        <RemoveItemButton onClick={() => {
                            onUpdate?.(`layoutOverrides.iitk.customLayoutSections.${si}.isVisible`, false);
                        }} className="top-0 -left-6 right-auto z-10 hidden group-hover/section:block" />
                        
                        {section.items?.filter((item: any) => item.isVisible !== false).map((item: any, ii: number) => (
                            <div key={item.id || ii} className="mb-[2pt] iitk-keep-together group/item relative">
                                <RemoveItemButton onClick={() => {
                                    onUpdate?.(`layoutOverrides.iitk.customLayoutSections.${si}.items.${ii}.isVisible`, false);
                                }} className="top-0 -left-6 right-auto z-10" />

                                <div className="bg-[#e5e7eb] w-full px-[3pt] py-[1.5pt] flex justify-between items-center text-[10pt] mb-[1pt]">
                                    <div className="font-bold">
                                        <EditableField value={item.title} onUpdate={v => onUpdate?.(`layoutOverrides.iitk.customLayoutSections.${si}.items.${ii}.title`, v)} className="inline-block" /> {item.title?.trim() && item.subtitle?.trim() ? " | " : " "} <EditableField value={item.subtitle} onUpdate={v => onUpdate?.(`layoutOverrides.iitk.customLayoutSections.${si}.items.${ii}.subtitle`, v)} className="inline-block font-normal italic" />
                                    </div>
                                    <EditableField value={item.displayDate || ""} onUpdate={v => onUpdate?.(`layoutOverrides.iitk.customLayoutSections.${si}.items.${ii}.displayDate`, v)} className="italic text-[10pt]" placeholder="Date" />
                                </div>
                                <ul className="iitk-bullet-list mt-[1pt]">
                                    {item.bullets.map((b: string, bi: number) => (
                                        <li key={bi} className="group/bullet relative">
                                            <RemoveItemButton className="top-0 -left-6 right-auto hover:bg-transparent text-gray-400 opacity-40 hover:opacity-100" onClick={() => {
                                                const copy = [...item.bullets];
                                                copy.splice(bi, 1);
                                                onUpdate?.(`layoutOverrides.iitk.customLayoutSections.${si}.items.${ii}.bullets`, JSON.stringify(copy));
                                            }} />
                                            <EditableField value={b} onUpdate={v => onUpdate?.(`layoutOverrides.iitk.customLayoutSections.${si}.items.${ii}.bullets.${bi}`, v)} renderCustom={<span dangerouslySetInnerHTML={{ __html: b }} />} multiline={true} />
                                        </li>
                                    ))}
                                    <li className="list-none">
                                        <AddItemButton label="Bullet" className="w-auto mt-1 justify-start border-none bg-transparent hover:bg-gray-50 text-gray-400 shadow-none px-1 py-0.5" onClick={() => {
                                            const copy = [...(item.bullets || []), ""];
                                            onUpdate?.(`layoutOverrides.iitk.customLayoutSections.${si}.items.${ii}.bullets`, JSON.stringify(copy));
                                        }} />
                                    </li>
                                </ul>
                            </div>
                        ))}
                        <AddItemButton label="Add Item" onClick={() => {
                            const copy = [...(section.items || []), { id: Date.now().toString(), title: "Title", subtitle: "Subtitle", bullets: [""] }];
                            onUpdate?.(`layoutOverrides.iitk.customLayoutSections.${si}.items`, JSON.stringify(copy));
                        }} className="mt-1" />
                    </div>
                ))}

                {/* Add Custom Section Button - Only visible in editor */}
                <div className="w-full mt-4 print:hidden flex justify-center pb-4 pt-2 opacity-50 hover:opacity-100 transition-opacity">
                    <button 
                        onClick={() => {
                            const currentSections = data.layoutOverrides?.iitk?.customLayoutSections || [];
                            const copy = [...currentSections, { 
                                id: Date.now().toString(), 
                                title: "New Section", 
                                items: [{ id: Date.now().toString(), title: "Item Title", subtitle: "Item Subtitle", bullets: [""] }] 
                            }];
                            onUpdate?.('layoutOverrides.iitk.customLayoutSections', JSON.stringify(copy));
                        }}
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full border border-gray-300 shadow-sm"
                    >
                        <span className="text-lg leading-none">+</span> Add Custom Section
                    </button>
                </div>

            </div>
        </>
    )
}

const SectionHeader = ({ title, suffix }: { title: React.ReactNode, suffix?: string }) => (
    <div className="w-full font-bold text-[12pt] flex justify-between items-center tracking-wide mb-[4pt] px-[2pt] py-[2pt]"
        style={{ backgroundColor: '#d1d5db', border: '1px solid white' }}>
        <span className="iitk-sc">{title}</span>
        {suffix && <span className="font-normal italic text-[9pt]">{suffix}</span>}
    </div>
);
