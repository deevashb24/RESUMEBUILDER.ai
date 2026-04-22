import React from "react"
import { ParsedResumeData } from "@/lib/resume"
import { mapParsedResumeToIITKDocument, IITKExperienceEntry } from "@/lib/iitk-adapter"

export const IITKLayout = ({ data }: { data: ParsedResumeData }) => {
    if (!data) return null;
    const doc = mapParsedResumeToIITKDocument(data);

    return (
        <>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/dreampulse/computer-modern-web-font@master/fonts.css" />
            <div className="iitk-root relative w-full h-full bg-white text-black text-[10pt] leading-[1.15]">
                <style dangerouslySetInnerHTML={{
                    __html: `
          .iitk-root {
            font-family: "Computer Modern Serif", "Latin Modern Roman", "CMU Serif", serif;
            margin: 0;
            padding: 0.2in;
            box-sizing: border-box;
            /* Support print */
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

          /* Small Caps simulation if font doesn't have it natively or standard text-transform uppercase used for section headers */
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
          
          /* Table spacing */
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
                        <span className="iitk-sc">{doc.header.name}</span>
                    </div>
                    <div className="w-full flex justify-between text-[9pt] leading-tight">
                        <span>{doc.header.academicLine1}</span>
                        <span className="flex items-center gap-1">
                            <span className="inline-flex w-3 h-3 bg-black text-white items-center justify-center text-[6pt] rounded-[sm]">✉</span>
                            {doc.header.email} |
                            <span className="inline-flex w-3 h-3 bg-black text-white items-center justify-center text-[6pt] rounded-[sm]">✆</span>
                            {doc.header.phone}
                        </span>
                    </div>
                    <div className="w-full flex justify-between text-[9pt] leading-tight mt-1">
                        <span>{doc.header.academicLine2}</span>
                        <span className="flex items-center gap-1">
                            <span className="inline-flex w-3 h-3 bg-black text-white items-center justify-center text-[6pt] rounded-[sm]">in</span>
                            {doc.header.linkedin} |
                            <span className="inline-flex w-3 h-3 bg-black text-white items-center justify-center text-[6pt] rounded-[sm] opacity-80">gh</span>
                            {doc.header.github}
                        </span>
                    </div>
                    <div className="w-full h-[1pt] bg-black mt-[1.5mm]" />
                </div>

                {/* ACADEMIC QUALIFICATIONS */}
                {doc.academicQualifications && doc.academicQualifications.length > 0 && (
                    <div className="mb-[2mm]">
                        <SectionHeader title="Academic Qualifications" />
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
                                {doc.academicQualifications.filter(q => q.isVisible !== false).map((q, i) => (
                                    <tr key={q.id || i} className="iitk-keep-together">
                                        <td className="iitk-td font-semibold">{q.year}</td>
                                        <td className="iitk-td">{q.degree}</td>
                                        <td className="iitk-td">{q.institute}</td>
                                        <td className="iitk-td font-bold">{q.performance}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ACADEMIC ACHIEVEMENTS */}
                {doc.academicAchievements && doc.academicAchievements.length > 0 && (
                    <div className="mb-[2mm]">
                        <SectionHeader title="Academic Achievements" />
                        <ul className="iitk-bullet-list">
                            {doc.academicAchievements.filter(a => a.isVisible !== false).map((a, i) => (
                                <li key={a.id || i} className="iitk-keep-together flex justify-between items-start">
                                    <span dangerouslySetInnerHTML={{ __html: a.text }} />
                                    {a.trailingDate && (
                                        <span className="text-gray-700 italic text-[9pt] pl-4 whitespace-nowrap">{a.trailingDate}</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* PROFESSIONAL EXPERIENCE */}
                {doc.professionalExperience && doc.professionalExperience.length > 0 && (
                    <div className="mb-[2mm]">
                        <SectionHeader title="Professional Experience" />
                        {doc.professionalExperience.filter(e => e.isVisible !== false).map((exp, i) => (
                            <div key={exp.id || i} className="mb-1 iitk-keep-together">
                                <div className="bg-[#e5e7eb] w-full px-[3pt] py-[1.5pt] flex justify-between items-center text-[10pt] mb-[2pt]">
                                    <div>
                                        <span className="font-bold">{exp.role}</span> | <span className="italic">{exp.organization}</span>
                                    </div>
                                    {exp.displayDate && (
                                        <div className="text-gray-700 italic text-[9pt]">{exp.displayDate}</div>
                                    )}
                                </div>
                                {exp.variant === "structured" && exp.highlight && (
                                    <div className="italic mb-[2pt]" dangerouslySetInnerHTML={{ __html: exp.highlight }} />
                                )}

                                {exp.variant === "simple" ? (
                                    <ul className="iitk-bullet-list mt-1">
                                        {exp.bullets.map((b, bi) => (
                                            <li key={bi} dangerouslySetInnerHTML={{ __html: b }} />
                                        ))}
                                    </ul>
                                ) : (
                                    <table className="iitk-table w-full text-[10pt] mt-[2pt]">
                                        <tbody>
                                            {(exp as any).blocks?.map((block: any, bi: number) => (
                                                <tr key={bi} className="iitk-keep-together">
                                                    <td className="iitk-td border-r w-[10%] text-center font-bold">{block.label}</td>
                                                    <td className="iitk-td align-top border-l p-0 py-[1pt] px-[2pt]">
                                                        <ul className="iitk-bullet-list bg-transparent" style={{ marginLeft: "10pt" }}>
                                                            {block.items?.map((item: string, ii: number) => (
                                                                <li key={ii} dangerouslySetInnerHTML={{ __html: item }} />
                                                            ))}
                                                        </ul>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* KEY PROJECTS AND WORKSHOPS */}
                {doc.projectsAndWorkshops && doc.projectsAndWorkshops.length > 0 && (
                    <div className="mb-[2mm]">
                        <SectionHeader title="Key Projects and Workshops" />
                        {doc.projectsAndWorkshops.filter(p => p.isVisible !== false).map((proj, i) => (
                            <div key={proj.id || i} className="mb-1 iitk-keep-together">
                                <div className="bg-[#e5e7eb] w-full px-[3pt] py-[1.5pt] flex justify-between items-center text-[10pt] mb-[1pt]">
                                    <div>
                                        <span className="font-bold">
                                            {proj.link ? <a href={proj.link} className="hover:underline">{proj.title}</a> : proj.title}
                                        </span> | <span className="italic">{proj.subtitle}</span>
                                    </div>
                                    {proj.displayDate && (
                                        <div className="text-gray-700 italic text-[9pt]">{proj.displayDate}</div>
                                    )}
                                </div>
                                {proj.context && (
                                    <div className="italic text-[10pt] mb-[1pt]">{proj.context}</div>
                                )}
                                <ul className="iitk-bullet-list mt-[1pt]">
                                    {proj.bullets.map((b, bi) => (
                                        <li key={bi} dangerouslySetInnerHTML={{ __html: b }} />
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}

                {/* TECHNICAL SKILLS AND RELEVANT COURSES */}
                {doc.technicalSkillsTable && doc.technicalSkillsTable.length > 0 && (
                    <div className="mb-[2mm] iitk-keep-together">
                        <SectionHeader title="Technical Skills & Relevant Courses" suffix="*online courses" />
                        <table className="iitk-table w-full text-[10pt]">
                            <tbody>
                                {doc.technicalSkillsTable.filter(s => s.isVisible !== false).map((skill, i) => (
                                    <tr key={skill.id || i}>
                                        <td className="iitk-td font-bold w-[25%] text-center">{skill.label}</td>
                                        <td className="iitk-td w-[75%]" dangerouslySetInnerHTML={{ __html: skill.text }} />
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* POSITIONS OF RESPONSIBILITY */}
                {doc.positionsOfResponsibility && doc.positionsOfResponsibility.length > 0 && (
                    <div className="mb-[2mm]">
                        <SectionHeader title="Positions of Responsibility" />
                        {doc.positionsOfResponsibility.filter(p => p.isVisible !== false).map((pos, i) => (
                            <div key={pos.id || i} className="mb-[2pt] iitk-keep-together">
                                <div className="bg-[#e5e7eb] w-full px-[3pt] py-[1.5pt] flex justify-between items-center text-[10pt] mb-[1pt]">
                                    <div className="font-bold">
                                        {pos.role} | {pos.organization}
                                    </div>
                                    {pos.displayDate && (
                                        <div className="italic text-[10pt]">{pos.displayDate}</div>
                                    )}
                                </div>
                                <ul className="iitk-bullet-list mt-[1pt]">
                                    {pos.bullets.map((b, bi) => (
                                        <li key={bi} dangerouslySetInnerHTML={{ __html: b }} />
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}

                {/* EXTRA-CURRICULAR ACTIVITIES */}
                {doc.extracurricularCategories && doc.extracurricularCategories.length > 0 && (
                    <div className="mb-[2mm] iitk-keep-together">
                        <SectionHeader title="Extra-Curricular Activities" />
                        <table className="iitk-table w-full text-[10pt]">
                            <tbody>
                                {doc.extracurricularCategories.filter(e => e.isVisible !== false).map((category, i) => (
                                    <tr key={category.id || i}>
                                        <td className="iitk-td font-bold w-[13%] text-center align-top py-[2pt]">{category.category}</td>
                                        <td className="iitk-td w-[87%] align-top p-0 py-[1pt] px-[2pt]">
                                            <ul className="iitk-bullet-list" style={{ marginLeft: "10pt" }}>
                                                {category.bullets.map((b, bi) => (
                                                    <li key={bi} dangerouslySetInnerHTML={{ __html: b }} />
                                                ))}
                                            </ul>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    )
}

const SectionHeader = ({ title, suffix }: { title: string, suffix?: string }) => (
    <div className="w-full font-bold text-[12pt] flex justify-between items-center tracking-wide mb-[4pt] px-[2pt] py-[2pt]"
        style={{ backgroundColor: '#d1d5db', border: '1px solid white' }}>
        <span className="iitk-sc">{title}</span>
        {suffix && <span className="font-normal italic text-[9pt]">{suffix}</span>}
    </div>
);
