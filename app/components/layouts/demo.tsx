"use client"

import React from 'react'
import { ParsedResumeData } from '@/lib/resume'

interface LayoutProps {
  data: ParsedResumeData | null
}

export const SimpleResumeLayout = ({ data }: LayoutProps) => {
  // 1. Fallback if no data is present yet
  if (!data) {
    return (
      <div className="w-[210mm] h-[297mm] mx-auto bg-gray-100 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded">
        <p>No resume data to display</p>
      </div>
    );
  }

  // 2. The Actual Layout (A4 Dimensions: 210mm x 297mm)
  return (
    <div className="w-[210mm] min-h-[297mm] bg-white shadow-2xl mx-auto p-12 text-slate-800 font-sans">
      
      {/* HEADER SECTION */}
      <header className="border-b-2 border-slate-800 pb-6 mb-8">
        <h1 className="text-4xl font-bold uppercase tracking-wide text-slate-900 mb-2">
          {data.name || "Your Name"}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-slate-600 font-medium">
          {data.email && (
            <span className="flex items-center gap-1">
              📧 {data.email}
            </span>
          )}
          {data.phone && (
            <span className="flex items-center gap-1">
              📱 {data.phone}
            </span>
          )}
        </div>
      </header>

      {/* TWO COLUMN GRID */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* LEFT COLUMN (35% width) - Education & Skills */}
        <aside className="col-span-4 space-y-8">
          
          {/* Education */}
          {data.education && data.education.length > 0 && (
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-300 mb-3 pb-1">
                Education
              </h3>
              <div className="space-y-4">
                {data.education.map((edu, index) => (
                  <div key={index}>
                    <div className="font-bold text-slate-800">{edu.institution}</div>
                    <div className="text-sm text-slate-600">{edu.degree}</div>
                    <div className="text-xs text-slate-400 mt-1">{edu.year}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-300 mb-3 pb-1">
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, index) => (
                  <span 
                    key={index} 
                    className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}
        </aside>

        {/* RIGHT COLUMN (65% width) - Experience & Projects */}
        <main className="col-span-8 space-y-8">
          
          {/* Experience */}
          {data.experience && data.experience.length > 0 && (
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-300 mb-4 pb-1">
                Experience
              </h3>
              <div className="space-y-6">
                {data.experience.map((exp, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-bold text-lg text-slate-800">{exp.title}</h4>
                      <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded">
                        {exp.duration}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-600 mb-2">
                      {exp.company}
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {data.projects && data.projects.length > 0 && (
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-300 mb-4 pb-1">
                Projects
              </h3>
              <div className="space-y-4">
                {data.projects.map((proj, index) => (
                  <div key={index} className="bg-slate-50 p-4 rounded border border-slate-100">
                    <h4 className="font-bold text-slate-800 mb-1">{proj.name}</h4>
                    <p className="text-sm text-slate-600 mb-2">{proj.description}</p>
                    {proj.technologies && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {proj.technologies.map((tech, tIndex) => (
                          <span key={tIndex} className="text-[10px] uppercase tracking-wide text-slate-500">
                            #{tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

        </main>
      </div>
    </div>
  );
};