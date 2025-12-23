import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { generateId } from "@/lib/resume" // Ensure this imports correctly

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 })
    }

    // LAYER 1: Pre-clean
    const cleanedText = text
      .replace(/(\r\n|\n|\r)/gm, " ")
      .replace(/\s+/g, " ")
      .trim()

    // LAYER 2: "Archivist" Prompt - Extract EVERYTHING
    const prompt = `
      You are an expert Resume Archivist. 
      Your goal is to extract 100% of the candidate's history, including "Field Work", "Volunteering", "Achievements", "Hobbies", or "Certifications".
      
      RULES:
      1. DO NOT FILTER: Even if an item seems irrelevant to a typical job, extract it. The user will decide later what to keep.
      2. PRESERVE CUSTOM SECTIONS: If you see "Field Work" or "Awards", put them in 'customSections'.
      3. STRUCTURE: Use the JSON format below.

      Output JSON Structure:
      {
        "personal": { "name": "...", "email": "...", "phone": "...", "linkedin": "...", "location": "...", "summary": "..." },
        "skills": { "languages": [], "frameworks": [], "tools": [], "concepts": [] },
        "experience": [ { "company": "...", "role": "...", "start": "...", "end": "...", "bullets": ["..."] } ],
        "projects": [ { "title": "...", "tech": ["..."], "bullets": ["..."] } ],
        "education": [ { "school": "...", "degree": "...", "field": "...", "start": "...", "end": "..." } ],
        "customSections": [ { "title": "e.g. Field Work", "items": ["..."], "content": "..." } ]
      }

      RESUME TEXT:
      ${cleanedText}
    `

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0 },
    })

    const responseText = result.response.text()
    const rawData = JSON.parse(responseText)

    // LAYER 3: Data Enrichment (Add IDs and Visibility Defaults)
    // This is the "Logic" that enables user control later
    const enrichedData = {
      ...rawData,
      experience: rawData.experience?.map((item: any) => ({ ...item, id: generateId(), isVisible: true })) || [],
      education: rawData.education?.map((item: any) => ({ ...item, id: generateId(), isVisible: true })) || [],
      projects: rawData.projects?.map((item: any) => ({ ...item, id: generateId(), isVisible: true })) || [],
      customSections: rawData.customSections?.map((item: any) => ({ ...item, id: generateId(), isVisible: true })) || [],
    }

    return NextResponse.json({ success: true, data: enrichedData })

  } catch (error: any) {
    console.error("Error parsing resume:", error)
    return NextResponse.json({ error: "Failed to parse resume" }, { status: 500 })
  }
}