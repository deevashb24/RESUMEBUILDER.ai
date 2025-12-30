"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export type GenerationType = "resume" | "cover-letter" | "sop"

export async function generateContent(
  resumeText: string, 
  jobDescription: string, 
  type: GenerationType
) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

  let systemInstruction = ""
  let jsonStructure = ""

  // --- 1. RESUME CONFIG ---
  if (type === "resume") {
    systemInstruction = `
      You are an expert ATS Resume Optimizer.
      Task: Tailor the user's resume to the Job Description.
      Focus: Keywords, metrics, and impact.
    `
    jsonStructure = `
      {
        "personalInfo": { "fullName": "", "email": "", "phone": "", "linkedin": "", "location": "" },
        "summary": "Professional summary...",
        "skills": ["Skill1", "Skill2"],
        "experience": [ { "company": "", "role": "", "duration": "", "points": ["..."] } ],
        "education": [ { "school": "", "degree": "", "year": "" } ],
        "projects": [ { "name": "", "tech": "", "description": "" } ],
        "stats": { "atsScore": 85, "grammarScore": 95, "improvementPct": 30, "addedSkillsCount": 5, "originalityScore": 90 }
      }
    `
  } 
  
  // --- 2. COVER LETTER CONFIG ---
  else if (type === "cover-letter") {
    systemInstruction = `
      You are a professional Career Coach.
      Task: Write a persuasive Cover Letter connecting the user's resume experience to the Job Description.
      Tone: Professional, confident, and enthusiastic.
    `
    jsonStructure = `
      {
        "type": "cover-letter",
        "personalInfo": { "fullName": "", "email": "", "phone": "", "address": "" },
        "recipientInfo": { "managerName": "Hiring Manager", "company": "Company Name", "address": "Company Address" },
        "date": "Today's Date",
        "subject": "Application for [Role Name]",
        "salutation": "Dear Hiring Manager,",
        "paragraphs": [
          "Hook: Why I am applying...",
          "Body 1: Specific achievement from resume matching JD...",
          "Body 2: Soft skills and culture fit...",
          "Call to Action: Request for interview."
        ],
        "signOff": "Sincerely,",
        "stats": { "atsScore": 90, "grammarScore": 100, "addedSkillsCount": 0, "improvementPct": 0, "originalityScore": 95 }
      }
    `
  }

  // --- 3. SOP CONFIG ---
  else if (type === "sop") {
    systemInstruction = `
      You are a University Admissions Consultant.
      Task: Write a Statement of Purpose (SOP) for a university application or research role.
      Tone: Narrative, reflective, and ambitious.
    `
    jsonStructure = `
      {
        "type": "sop",
        "title": "Statement of Purpose",
        "paragraphs": [
          "Introduction: My motivation and hook...",
          "Academic Background: Highlights from resume...",
          "Professional Experience: Real-world application...",
          "Why This Program: Specific fit...",
          "Conclusion: Future goals."
        ],
        "stats": { "atsScore": 90, "grammarScore": 100, "addedSkillsCount": 0, "improvementPct": 0, "originalityScore": 95 }
      }
    `
  }

  const prompt = `
    ${systemInstruction}
    
    USER RESUME: "${resumeText.slice(0, 10000)}"
    TARGET JOB/PROGRAM: "${jobDescription.slice(0, 5000)}"
    
    Output STRICT JSON with this structure:
    ${jsonStructure}
  `

  try {
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    // Clean potential markdown code blocks
    return text.replace(/```json/g, "").replace(/```/g, "").trim()
  } catch (error) {
    console.error("AI Generation Error:", error)
    throw new Error("Failed to generate content")
  }
}