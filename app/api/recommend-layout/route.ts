import { NextRequest, NextResponse } from "next/server"
import { LAYOUTS } from "@/lib/layouts"

/**
 * API Route: Recommend Resume Layout
 * 
 * Analyzes job description and resume data to recommend best layout using AI
 */
export async function POST(request: NextRequest) {
  try {
    const { jobDescription, resumeData } = await request.json()

    if (!jobDescription || !resumeData) {
      return NextResponse.json(
        { error: "Missing jobDescription or resumeData" },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY
    const useOpenAI = !!process.env.OPENAI_API_KEY

    if (!apiKey) {
      // Fallback to default layout if no AI key
      return NextResponse.json({ success: true, layoutId: "demo" })
    }

    const prompt = `Based on this job description and resume data, recommend the best resume layout from these options:
- demo: Professional two-column layout (best for most roles, clean and organized)
- modern: Clean and professional (best for tech, business, corporate roles)
- classic: Traditional format (best for conservative industries, academia)
- creative: Eye-catching design (best for design, marketing, creative roles)

Job Description: ${jobDescription.substring(0, 1000)}

Resume Summary: ${JSON.stringify({
      skills: resumeData.skills?.slice(0, 10) || [],
      experienceCount: resumeData.experience?.length || 0,
      educationCount: resumeData.education?.length || 0,
    }).substring(0, 500)}

Respond with ONLY the layout ID (demo, modern, classic, or creative), nothing else.`

    let recommendation = "demo"

    try {
      if (useOpenAI) {
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
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0.3,
          }),
        })

        const data = await response.json()
        const result = data.choices?.[0]?.message?.content?.trim().toLowerCase()

        if (LAYOUTS.some((l) => l.id === result)) {
          recommendation = result
        }
      } else {
        const response = await fetch(
          // Change this line:
`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-001:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: prompt }],
                },
              ],
            }),
          }
        )

        const data = await response.json()
        const result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase()

        if (LAYOUTS.some((l) => l.id === result)) {
          recommendation = result
        }
      }
    } catch (error) {
      console.error("Error getting layout recommendation:", error)
      // Fallback to demo
    }

    return NextResponse.json({ success: true, layoutId: recommendation })
  } catch (error: any) {
    console.error("Error recommending layout:", error)
    return NextResponse.json(
      { error: error.message || "Failed to recommend layout" },
      { status: 500 }
    )
  }
}

