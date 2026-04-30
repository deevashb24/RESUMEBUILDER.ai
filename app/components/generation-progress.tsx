"use client"

import { useEffect, useState } from "react"
import { Loader2, CheckCircle2, Circle, ShieldCheck, Zap, Wand2, Fingerprint } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { GenerationType } from "@/actions/generate-content"
// IMPORT LANGUAGE
import { useLanguage } from "@/lib/language-context"

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
  const { t } = useLanguage() // Use Translation
  const [progress, setProgress] = useState(0)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  // Dynamic Label Logic with Translations
  const finalStepLabel =
    generationType === "resume"
      ? t.progress.finalizingResume
      : generationType === "sop"
        ? t.progress.finalizingSop
        : t.progress.finalizingCover

  const STEPS = [
    { id: "scan", label: t.progress.scanning },
    { id: "analyze", label: t.progress.analyzing },
    { id: "grammar", label: t.progress.grammar },
    { id: "finalize", label: finalStepLabel },
  ]

  // ... Keep useEffect logic exactly the same ...
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

    return () => {
      clearInterval(progressInterval)
      clearInterval(stepInterval)
    }
  }, [isFinished, STEPS.length])

  // ... Keep getScoreColor ...
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-700"
    if (score >= 60) return "text-blue-600"
    if (score >= 40) return "text-orange-500"
    return "text-red-600"
  }


  // --- RENDER (Finished State) ---
  if (isFinished && finalStats) {
    return (
      <Card className="border-green-200 bg-green-50 animate-in fade-in zoom-in duration-500 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-green-200" />
        <CardContent className="p-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-green-100 mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-green-900">
              {t.progress.successTitle}
            </h3>
            <p className="text-green-700 max-w-md mx-auto">
              {t.progress.successDesc}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto py-6">
            <div className="bg-white/60 p-4 rounded-xl border border-green-100/50 shadow-sm backdrop-blur-sm">
              <div className="text-sm font-medium text-green-800 mb-1 flex items-center justify-center gap-1">
                <ShieldCheck className="w-4 h-4" /> {t.progress.ats}
              </div>
              <div className={cn("text-3xl font-black", getScoreColor(finalStats.atsScore))}>
                {finalStats.atsScore}%
              </div>
            </div>

            <div className="bg-white/60 p-4 rounded-xl border border-green-100/50 shadow-sm backdrop-blur-sm">
              <div className="text-sm font-medium text-green-800 mb-1 flex items-center justify-center gap-1">
                <Zap className="w-4 h-4" /> {t.progress.impact}
              </div>
              <div className={cn("text-3xl font-black", getScoreColor(finalStats.grammarScore))}>
                {finalStats.grammarScore}%
              </div>
            </div>

            <div className="bg-white/60 p-4 rounded-xl border border-green-100/50 shadow-sm backdrop-blur-sm">
              <div className="text-sm font-medium text-green-800 mb-1 flex items-center justify-center gap-1">
                <Fingerprint className="w-4 h-4" /> {t.progress.unique}
              </div>
              <div className={cn("text-3xl font-black", getScoreColor(finalStats.originalityScore))}>
                {finalStats.originalityScore}%
              </div>
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
          {/* Translated Headers */}
          <h3 className="text-2xl font-bold text-gray-900">
            AI is working...
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Please wait while we optimize your document.
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