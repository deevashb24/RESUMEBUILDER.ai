"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Loader2, 
  CheckCircle2, 
  Circle, 
  ShieldCheck, 
  Zap, 
  Wand2, 
  Fingerprint,
  ArrowRight
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { GenerationType } from "@/actions/generate-content"

interface GenerationProgressProps {
  isFinished: boolean
  finalStats?: {
    atsScore: number
    grammarScore: number
    originalityScore: number
    originalMatchCount: number
    totalPotentialSkills: number
    addedSkillsCount: number
    improvementPct: number
  }
  generationType: GenerationType
}

export function GenerationProgress({
  isFinished,
  finalStats,
  generationType,
}: GenerationProgressProps) {
  const [progress, setProgress] = useState(0)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [simulatedScore, setSimulatedScore] = useState(0)

  // Dynamic Label Logic
  const finalStepLabel =
    generationType === "resume"
      ? "Finalizing Resume Structure..."
      : generationType === "sop"
      ? "Finalizing Statement of Purpose..."
      : "Finalizing Cover Letter..."

  const STEPS = [
    { id: "scan", label: "Scanning Job Description..." },
    { id: "analyze", label: "Analyzing Keywords & Gaps..." },
    { id: "grammar", label: "Checking Grammar & Originality..." },
    { id: "finalize", label: finalStepLabel },
  ]

  useEffect(() => {
    if (isFinished) {
      setProgress(100)
      setCurrentStepIndex(STEPS.length)
      return
    }

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95
        return prev + 0.8
      })
    }, 100)

    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= STEPS.length - 1) return prev
        return prev + 1
      })
    }, 3000)

    const scoreInterval = setInterval(() => {
      setSimulatedScore((prev) => {
        if (prev >= 65) return 65
        return prev + 1
      })
    }, 150)

    return () => {
      clearInterval(progressInterval)
      clearInterval(stepInterval)
      clearInterval(scoreInterval)
    }
  }, [isFinished, STEPS.length])

  // --- RENDER (Finished State) ---
  if (isFinished && finalStats) {
    return (
      <Card className="border-green-200 bg-green-50/50 animate-in fade-in zoom-in duration-500 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-green-200" />
        <CardContent className="p-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-green-100 mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-green-900">
              {generationType === 'resume' ? 'Resume Tailored!' : 'Document Generated!'}
            </h3>
            <p className="text-green-700 max-w-md mx-auto">
              We optimized your {generationType === 'sop' ? 'SOP' : generationType === 'cover-letter' ? 'Cover Letter' : 'resume'} for the highest success rate.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto py-6">
            <div className="bg-white/60 p-4 rounded-xl border border-green-100/50 shadow-sm backdrop-blur-sm">
              <div className="text-sm font-medium text-green-800 mb-1 flex items-center justify-center gap-1">
                <ShieldCheck className="w-4 h-4" /> ATS
              </div>
              <div className="text-3xl font-black text-green-700">{finalStats.atsScore}%</div>
            </div>
            <div className="bg-white/60 p-4 rounded-xl border border-green-100/50 shadow-sm backdrop-blur-sm">
              <div className="text-sm font-medium text-green-800 mb-1 flex items-center justify-center gap-1">
                <Zap className="w-4 h-4" /> Impact
              </div>
              <div className="text-3xl font-black text-green-700">{finalStats.grammarScore}%</div>
            </div>
            <div className="bg-white/60 p-4 rounded-xl border border-green-100/50 shadow-sm backdrop-blur-sm">
              <div className="text-sm font-medium text-green-800 mb-1 flex items-center justify-center gap-1">
                <Fingerprint className="w-4 h-4" /> Unique
              </div>
              <div className="text-3xl font-black text-green-700">{finalStats.originalityScore}%</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // --- RENDER (Loading State) ---
  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="p-0 space-y-8">
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4 relative">
             <Wand2 className="w-8 h-8 text-primary animate-pulse" />
             <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            AI is crafting your {generationType === 'sop' ? 'SOP' : generationType === 'cover-letter' ? 'Letter' : 'Resume'}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Analyzing standard industry patterns and optimizing for the specific job description...
          </p>
        </div>

        <div className="max-w-md mx-auto space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium text-gray-600">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-3 pl-2">
            {STEPS.map((step, index) => {
              const isActive = index === currentStepIndex
              const isCompleted = index < currentStepIndex

              return (
                <div key={step.id} className="flex items-center gap-3">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center border transition-colors duration-300",
                    isCompleted ? "bg-green-500 border-green-500" : 
                    isActive ? "border-primary bg-primary/10" : "border-gray-200"
                  )}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : isActive ? (
                      <Loader2 className="w-3 h-3 text-primary animate-spin" />
                    ) : (
                      <Circle className="w-3 h-3 text-gray-300" />
                    )}
                  </div>
                  <span className={cn(
                    "text-sm transition-colors duration-300",
                    isCompleted ? "text-gray-900 font-medium" : 
                    isActive ? "text-primary font-bold" : "text-gray-400"
                  )}>
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}