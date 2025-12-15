import { NextRequest, NextResponse } from "next/server"

// Dynamic imports for server-side only packages
let mammoth: any
let pdfParse: any

// Lazy load these packages (they're server-side only)
async function loadParsers() {
  if (!mammoth) {
    mammoth = (await import("mammoth")).default
  }
  if (!pdfParse) {
    pdfParse = (await import("pdf-parse")).default
  }
}

/**
 * API Route: Parse Resume Document
 * 
 * Accepts PDF or DOCX files, extracts text, and sends to AI for structured parsing.
 * Returns structured resume data in JSON format.
 * 
 * Architecture:
 * - Server-side only (no client exposure of AI keys)
 * - Supports PDF (pdf-parse) and DOCX (mammoth)
 * - Uses Gemini or OpenAI API for intelligent parsing
 */

interface ParsedResume {
  name: string
  email: string
  phone: string
  skills: string[]
  experience: Array<{
    title: string
    company: string
    duration: string
    description: string
  }>
  education: Array<{
    degree: string
    institution: string
    year: string
  }>
  projects: Array<{
    name: string
    description: string
    technologies: string[]
  }>
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file type
    const fileType = file.type
    const fileName = file.name.toLowerCase()
    const isPDF = fileType === "application/pdf" || fileName.endsWith(".pdf")
    const isDOCX =
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileName.endsWith(".docx")

    if (!isPDF && !isDOCX) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload PDF or DOCX." },
        { status: 400 }
      )
    }

    // Load parsers
    await loadParsers()

    // Extract text from document
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    let extractedText = ""

    if (isPDF) {
      const pdfData = await pdfParse(buffer)
      extractedText = pdfData.text
    } else if (isDOCX) {
      const result = await mammoth.extractRawText({ buffer })
      extractedText = result.value
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: "Could not extract text from document" },
        { status: 400 }
      )
    }

    // Parse with AI (Gemini or OpenAI)
    const parsedResume = await parseResumeWithAI(extractedText)

    return NextResponse.json({ success: true, data: parsedResume })
  } catch (error: any) {
    console.error("Error parsing resume:", error)
    return NextResponse.json(
      { error: error.message || "Failed to parse resume" },
      { status: 500 }
    )
  }
}

/**
 * Parse resume text using AI (Gemini or OpenAI)
 * Returns structured JSON with resume data
 */
async function parseResumeWithAI(resumeText: string): Promise<ParsedResume> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY
  const useOpenAI = !!process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error(
      "No AI API key found. Please set GEMINI_API_KEY or OPENAI_API_KEY in environment variables."
    )
  }

  const prompt = `Parse the following resume text and extract structured information. Return ONLY valid JSON in this exact format (no markdown, no code blocks):

{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "+1234567890",
  "skills": ["skill1", "skill2"],
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Jan 2020 - Present",
      "description": "Job description"
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "University Name",
      "year": "2020"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "Project description",
      "technologies": ["tech1", "tech2"]
    }
  ]
}

Resume text:
${resumeText.substring(0, 8000)}`

  if (useOpenAI) {
    return await parseWithOpenAI(apiKey, prompt)
  } else {
    return await parseWithGemini(apiKey, prompt)
  }
}

async function parseWithGemini(apiKey: string, prompt: string): Promise<ParsedResume> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Gemini API error: ${error}`)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) {
    throw new Error("No response from Gemini API")
  }

  // Extract JSON from response (handle markdown code blocks if present)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error("Could not extract JSON from AI response")
  }

  return JSON.parse(jsonMatch[0])
}

async function parseWithOpenAI(apiKey: string, prompt: string): Promise<ParsedResume> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a resume parser. Extract structured information and return ONLY valid JSON, no markdown formatting.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${error}`)
  }

  const data = await response.json()
  const text = data.choices?.[0]?.message?.content

  if (!text) {
    throw new Error("No response from OpenAI API")
  }

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error("Could not extract JSON from AI response")
  }

  return JSON.parse(jsonMatch[0])
}

