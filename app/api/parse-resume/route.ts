import { NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { generateId } from "@/lib/resume"
import pdf from "pdf-parse"
import mammoth from "mammoth"

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY || "",
})

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

    // 4. AI "Archivist" Prompt (Layer 2)
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

    const { text: responseText } = await generateText({
      model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
      prompt: prompt,
      temperature: 0,
    })

    let cleanJsonText = responseText.replace(/```json/g, "").replace(/```/g, "").trim()
    const startIndex = cleanJsonText.indexOf("{")
    const endIndex = cleanJsonText.lastIndexOf("}")
    if (startIndex !== -1 && endIndex !== -1) {
      cleanJsonText = cleanJsonText.substring(startIndex, endIndex + 1)
    }

    let rawData;
    try {
      rawData = JSON.parse(cleanJsonText)
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", cleanJsonText);
      throw new Error("AI returned invalid JSON");
    }

    // 5. Enrich Data (Add IDs and Visibility Flags)
    const enrichedData = {
      ...rawData,
      personal: rawData.personal || { name: "", email: "", phone: "", linkedin: "", location: "", summary: "" },
      skills: rawData.skills || { languages: [], frameworks: [], tools: [], concepts: [] },
      experience: rawData.experience?.map((item: any) => ({ ...item, id: generateId(), isVisible: true })) || [],
      education: rawData.education?.map((item: any) => ({ ...item, id: generateId(), isVisible: true })) || [],
      projects: rawData.projects?.map((item: any) => ({ ...item, id: generateId(), isVisible: true })) || [],
      customSections: rawData.customSections?.map((item: any) => ({ ...item, id: generateId(), isVisible: true })) || [],
    }

    // Ensure arrays exist inside skills in case Gemini returned a partial skills object
    enrichedData.skills.languages = enrichedData.skills.languages || []
    enrichedData.skills.frameworks = enrichedData.skills.frameworks || []
    enrichedData.skills.tools = enrichedData.skills.tools || []
    enrichedData.skills.concepts = enrichedData.skills.concepts || []

    return NextResponse.json({ success: true, data: enrichedData })

  } catch (error: any) {
    console.error("Error parsing resume:", error)
    return NextResponse.json({ error: "Failed to parse resume" }, { status: 500 })
  }
}