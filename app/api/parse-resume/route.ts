import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { generateId } from "@/lib/resume"
import pdf from "pdf-parse"
import mammoth from "mammoth"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(request: NextRequest) {
  try {
    // 1. Handle FormData (File Upload) - FIX: Read FormData, not JSON
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // 2. Extract Text from File
    let text = ""
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    try {
      if (file.type === "application/pdf") {
        const data = await pdf(buffer)
        text = data.text
      } else if (
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.name.endsWith(".docx")
      ) {
        const result = await mammoth.extractRawText({ buffer })
        text = result.value
      } else {
        // Fallback for plain text files
        text = buffer.toString("utf-8")
      }
    } catch (e) {
      console.error("Text extraction failed:", e)
      return NextResponse.json({ error: "Failed to read file text. Please upload a valid PDF or DOCX." }, { status: 500 })
    }

    // 3. Clean Text (Layer 1)
    const cleanedText = text
      .replace(/(\r\n|\n|\r)/gm, " ")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 30000) // Limit token usage if file is huge

    // 4. Gemini "Archivist" Prompt (Layer 2)
    // We use the strict schema to capture Field Work/Achievements
    const prompt = `
      You are an expert Resume Archivist. 
      Your goal is to extract 100% of the candidate's history, including "Field Work", "Volunteering", "Achievements", "Hobbies", or "Certifications".
      
      RULES:
      1. DO NOT FILTER: Even if an item seems irrelevant to a typical job, extract it. The user will decide later what to keep.
      2. PRESERVE SECTIONS: If you see "Field Work" or "Awards", put them in 'customSections'.
      3. OUTPUT JSON STRICTLY matching the structure below.

      Structure:
      {
        "personal": { "name": "", "email": "", "phone": "", "linkedin": "", "location": "", "summary": "" },
        "skills": { "languages": [], "frameworks": [], "tools": [], "concepts": [] },
        "experience": [ { "company": "", "role": "", "start": "", "end": "", "bullets": [] } ],
        "projects": [ { "title": "", "tech": [], "bullets": [] } ],
        "education": [ { "school": "", "degree": "", "field": "", "start": "", "end": "" } ],
        "customSections": [ { "title": "", "items": [], "content": "" } ]
      }

      RESUME TEXT:
      ${cleanedText}
    `

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" })
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0 },
    })

    const responseText = result.response.text()
    const rawData = JSON.parse(responseText)

    // 5. Enrich Data (Add IDs and Visibility Flags)
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