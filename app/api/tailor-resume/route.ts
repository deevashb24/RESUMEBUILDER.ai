import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { ParsedResumeData, generateId } from "@/lib/resume"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(request: NextRequest) {
  try {
    const { resumeData, jobDescription } = await request.json()

    if (!resumeData || !jobDescription) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 })
    }

    const prompt = `
      You are a Resume Strategist.
      
      INPUT:
      1. A user's existing resume (JSON).
      2. A Job Description (JD).

      TASK:
      1. Analyze the JD and identify 3-5 critical hard skills missing from the resume.
      2. Analyze the Resume Summary and rewrite it to align with the JD, but keep it truthful.
      3. CRITICAL: PRESERVE all existing "experience", "projects", and "customSections" (like Field Work). DO NOT DELETE THEM.
      4. RETURN ONLY the *changes* or *additions*.

      Output JSON:
      {
        "suggestedSkills": {
          "languages": ["..."],
          "tools": ["..."],
          "concepts": ["..."]
        },
        "optimizedSummary": "...",
        "feedback": "Brief explanation of what was optimized."
      }

      RESUME DATA:
      ${JSON.stringify(resumeData).substring(0, 10000)}

      JOB DESCRIPTION:
      ${jobDescription.substring(0, 5000)}
    `

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
    })

    const suggestions = JSON.parse(result.response.text())

    // MERGE LOGIC: We combine AI suggestions with User's Data
    // We do NOT replace the user's data, we simply append the new suggestions.
    
    const tailoredResume: ParsedResumeData = {
      ...resumeData,
      personal: {
        ...resumeData.personal,
        summary: suggestions.optimizedSummary || resumeData.personal.summary // Propose new summary
      },
      skills: {
        languages: [...new Set([...resumeData.skills.languages, ...(suggestions.suggestedSkills.languages || [])])],
        frameworks: [...new Set([...resumeData.skills.frameworks, ...(suggestions.suggestedSkills.frameworks || [])])],
        tools: [...new Set([...resumeData.skills.tools, ...(suggestions.suggestedSkills.tools || [])])],
        concepts: [...new Set([...resumeData.skills.concepts, ...(suggestions.suggestedSkills.concepts || [])])],
      }
      // Note: experience, education, projects, customSections are UNTOUCHED.
      // This ensures "Field Work" and "Achievements" never fade away.
    }

    return NextResponse.json({ success: true, data: tailoredResume, feedback: suggestions.feedback })

  } catch (error: any) {
    console.error("Error tailoring resume:", error)
    return NextResponse.json({ error: "Failed to tailor resume" }, { status: 500 })
  }
}