// app/lib/resume.ts

// Base interface for all items (adds ID and Visibility control)
export interface ResumeItem {
  id: string
  isVisible: boolean // User can toggle this ON/OFF
  isGenerated?: boolean // Tag if AI added this specific item
}

export interface ResumeSection extends ResumeItem {
  title: string
  items: string[] // For simple lists like Achievements
  content?: string // For paragraph content
}

export interface ExperienceItem extends ResumeItem {
  company: string
  role: string
  start: string
  end: string
  location?: string
  bullets: string[]
}

export interface ProjectItem extends ResumeItem {
  title: string
  tech: string[]
  bullets: string[]
  link?: string
}

export interface EducationItem extends ResumeItem {
  school: string
  degree: string
  field: string
  start: string
  end: string
  gpa?: string
}

export interface SkillSet {
  languages: string[]
  frameworks: string[]
  tools: string[]
  concepts: string[]
}

export interface ParsedResumeData {
  personal: {
    name: string
    email: string
    phone: string
    linkedin: string
    location: string
    summary: string
  }
  experience: ExperienceItem[]
  education: EducationItem[]
  projects: ProjectItem[]
  skills: SkillSet
  // "customSections" ensures Field Work, Awards, Hobbies never fade away
  customSections: ResumeSection[] 
}

// Helper to generate IDs
export const generateId = () => Math.random().toString(36).substr(2, 9)

export const initialResumeData: ParsedResumeData = {
  personal: { name: "", email: "", phone: "", linkedin: "", location: "", summary: "" },
  experience: [],
  education: [],
  projects: [],
  skills: { languages: [], frameworks: [], tools: [], concepts: [] },
  customSections: [] 
}