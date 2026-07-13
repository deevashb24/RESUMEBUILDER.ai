import { NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { ParsedResumeData } from "@/lib/resume"
import { auth } from "@clerk/nextjs/server"
import { z } from "zod"

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY || "",
})

const tailorSchema = z.object({
  jobDescription: z.string().min(1).max(25000),
  resumeData: z.record(z.any())
})

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parseResult = tailorSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid payload data", details: parseResult.error.errors }, { status: 400 })
    }

    const { resumeData, jobDescription } = parseResult.data as { resumeData: ParsedResumeData, jobDescription: string };

    const prompt = `
      You are an elite Resume Strategist and ATS Analyzer.
      
      TASK:
      1. Analyze the JD and identify "Potential Required Skills".
      2. Analyze the Resume and count "Original Match".
      3. Rewrite the Summary/Bullets to include missing skills (use **bold** for keywords).
      
      4. SCORING RULES (Fair & Realistic):
         - "Grammar Score": 0-100. Deduct for typos/passive voice.
         - "Originality Score": 0-100. Deduct for clichés.
         - "ATS Compatibility": 0-100. How well keywords match.
           * NOTE: Even if the match is low, do not score below 40 unless it's completely irrelevant gibberish. 
           * If it's a decent match but missing keywords, score between 60-80.
           * Only score 90+ for perfect matches.

      5. PRESERVE all experience/projects.

      Output JSON STRICTLY:
      {
        "stats": {
          "atsScore": 75, 
          "grammarScore": 95,
          "originalityScore": 92,
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

    const { text: responseText } = await generateText({
      model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
      prompt: prompt,
      temperature: 0.2,
    })

    let cleanJsonText = responseText.replace(/```json/g, "").replace(/```/g, "").trim()
    const startIndex = cleanJsonText.indexOf("{")
    const endIndex = cleanJsonText.lastIndexOf("}")
    if (startIndex !== -1 && endIndex !== -1) {
      cleanJsonText = cleanJsonText.substring(startIndex, endIndex + 1)
    }

    const suggestions = JSON.parse(cleanJsonText)
    const stats = suggestions.stats

    // --- SAFETY FLOOR LOGIC ---
    // Ensure scores are not discouragingly low due to parsing glitches
    stats.atsScore = Math.max(45, Math.min(99, stats.atsScore));
    stats.grammarScore = Math.max(60, Math.min(100, stats.grammarScore));

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