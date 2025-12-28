import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { ParsedResumeData } from "@/lib/resume"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(request: NextRequest) {
  try {
    const { resumeData, jobDescription } = await request.json()

    if (!resumeData || !jobDescription) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 })
    }

    const prompt = `
      You are an elite Resume Strategist and ATS Analyzer.
      
      TASK:
      1. Analyze the JD and identify "Potential Required Skills".
      2. Analyze the Resume and count "Original Match".
      3. Rewrite the Summary/Bullets to include missing skills (use **bold** for keywords).
      
      4. QUALITY AUDIT (CRITICAL):
         - Calculate a "Grammar Score" (100 = perfect, deduct for typos/passive voice).
         - Calculate an "Originality Score" (100 = unique/impactful, deduct for clichés like "hard worker" or generic AI-sounding phrases).
         - Calculate "ATS Compatibility" (0-100).

      5. PRESERVE all experience/projects.

      Output JSON STRICTLY:
      {
        "stats": {
          "atsScore": 85, 
          "grammarScore": 95,
          "originalityScore": 92, // The "Plagiarism-Free" equivalent
          "originalMatchCount": 10,
          "totalPotentialSkills": 20,
          "addedSkillsCount": 5
        },
        "suggestedSkills": {
          "languages": [],
          "tools": [],
          "concepts": []
        },
        "optimizedSummary": "...",
        "feedback": "..."
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
    const stats = suggestions.stats

    // Calculate Improvement Pct
    const improvement = stats.originalMatchCount > 0 
      ? Math.round((stats.addedSkillsCount / stats.originalMatchCount) * 100) 
      : 100
    stats.improvementPct = improvement

    const tailoredResume: ParsedResumeData = {
      ...resumeData,
      personal: {
        ...resumeData.personal,
        summary: suggestions.optimizedSummary || resumeData.personal.summary
      },
      skills: {
        languages: [...new Set([...resumeData.skills.languages, ...(suggestions.suggestedSkills.languages || [])])],
        frameworks: [...new Set([...resumeData.skills.frameworks, ...(suggestions.suggestedSkills.frameworks || [])])],
        tools: [...new Set([...resumeData.skills.tools, ...(suggestions.suggestedSkills.tools || [])])],
        concepts: [...new Set([...resumeData.skills.concepts, ...(suggestions.suggestedSkills.concepts || [])])],
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: tailoredResume, 
      stats: stats, 
      feedback: suggestions.feedback 
    })

  } catch (error: any) {
    console.error("Error tailoring resume:", error)
    return NextResponse.json({ error: "Failed to tailor resume" }, { status: 500 })
  }
}