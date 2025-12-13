/**
 * Resume Layout System
 * 
 * Layouts are React components stored in /app/components/layouts/
 * Each layout component receives ParsedResumeData and renders the resume
 */

export interface Layout {
  id: string
  name: string
  description: string
  preview: string
  component?: React.ComponentType<{ data: any }>
}

// Available layouts (can be extended)
export const LAYOUTS: Layout[] = [
  {
    id: "demo",
    name: "Professional",
    description: "Clean two-column layout with header",
    preview: "/layouts/layout-demo.png",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Clean and professional design",
    preview: "/layouts/layout-modern.png",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional resume format",
    preview: "/layouts/layout-classic.png",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Eye-catching design for creative roles",
    preview: "/layouts/layout-creative.png",
  },
]

/**
 * Get layout by ID
 */
export function getLayout(layoutId: string): Layout | undefined {
  return LAYOUTS.find((layout) => layout.id === layoutId)
}

/**
 * Recommend layout based on job description and resume data
 * Uses AI to analyze and suggest best layout
 */
export async function recommendLayout(
  jobDescription: string,
  resumeData: any
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY
  const useOpenAI = !!process.env.OPENAI_API_KEY

  if (!apiKey) {
    // Fallback to default layout if no AI key
    return "modern"
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
      const recommendation = data.choices?.[0]?.message?.content?.trim().toLowerCase()

      if (LAYOUTS.some((l) => l.id === recommendation)) {
        return recommendation
      }
    } else {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
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
      const recommendation = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase()

      if (LAYOUTS.some((l) => l.id === recommendation)) {
        return recommendation
      }
    }
  } catch (error) {
    console.error("Error getting layout recommendation:", error)
  }

  // Fallback to demo layout
  return "demo"
}

