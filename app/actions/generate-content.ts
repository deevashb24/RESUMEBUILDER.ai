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
    // This part is largely handled by the API route, but kept for consistency
    systemInstruction = `
      You are an expert ATS Resume Optimizer.
    `
    jsonStructure = `
      { "personalInfo": "..." }
    `
  } 
  
  // --- 2. COVER LETTER CONFIG ---
  else if (type === "cover-letter") {
    systemInstruction = `
      You are a professional Career Coach.
      Task: Write a persuasive Cover Letter connecting the user's resume experience to the Job Description.
      Tone: Professional, confident, and enthusiastic.
      
      SCORING:
      - ATS Score: 0-100 (How well keywords match)
      - Grammar: 0-100
    `
    jsonStructure = `
      {
        "type": "cover-letter",
        "personalInfo": { "fullName": "", "email": "", "phone": "", "address": "" },
        "recipientInfo": { "managerName": "Hiring Manager", "company": "Company Name", "address": "Company Address" },
        "date": "Today's Date",
        "subject": "Application for [Role Name]",
        "salutation": "Dear Hiring Manager,",
        "paragraphs": [ "..." ],
        "signOff": "Sincerely,",
        "stats": { "atsScore": 85, "grammarScore": 95, "addedSkillsCount": 0, "improvementPct": 0, "originalityScore": 90 }
      }
    `
  }

  // --- 3. SOP CONFIG ---
  else if (type === "sop") {
    systemInstruction = `
      You are a University Admissions Consultant.
      Task: Write a Statement of Purpose (SOP).
      Tone: Narrative, reflective, and ambitious.
      
      SCORING:
      - Evaluate how strong the narrative is for admission.
    `
    jsonStructure = `
      {
        "type": "sop",
        "title": "Statement of Purpose",
        "paragraphs": [ "..." ],
        "stats": { "atsScore": 85, "grammarScore": 95, "addedSkillsCount": 0, "improvementPct": 0, "originalityScore": 92 }
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