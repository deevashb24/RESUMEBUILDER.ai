"use server"

import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY || "",
})

export type GenerationType = "resume" | "cover-letter" | "sop"

export async function generateContent(
  resumeText: string,
  jobDescription: string,
  type: GenerationType,
  language: string = 'en'
) {
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
    
    IMPORTANT: The output MUST be in the following language: ${language}. 
    Translate all headers, section titles, and content into ${language}. 
    Maintain the original technical meaning but ensure natural localized phrasing.

    USER RESUME: "${resumeText.slice(0, 10000)}"
    TARGET JOB/PROGRAM: "${jobDescription.slice(0, 5000)}"
    
    Output STRICT JSON with this structure:
    ${jsonStructure}
  `

  try {
    const { text } = await generateText({
      model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
      prompt: prompt,
    })

    // Clean potential markdown code blocks
    let cleanJsonText = text.replace(/```json/g, "").replace(/```/g, "").trim()
    const startIndex = cleanJsonText.indexOf("{")
    const endIndex = cleanJsonText.lastIndexOf("}")
    if (startIndex !== -1 && endIndex !== -1) {
      cleanJsonText = cleanJsonText.substring(startIndex, endIndex + 1)
    }

    return cleanJsonText
  } catch (error) {
    console.error("AI Generation Error:", error)
    throw new Error("Failed to generate content")
  }
}