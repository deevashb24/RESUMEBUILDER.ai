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
}

// The steps we will show in the "Checklist"
const STEPS = [
  { id: "scan", label: "Scanning Job Description..." },
  { id: "analyze", label: "Analyzing Keywords & Gaps..." },
  { id: "grammar", label: "Checking Grammar & Originality..." },
  { id: "finalize", label: "Finalizing Resume Structure..." },
]

export function GenerationProgress({ isFinished, finalStats }: GenerationProgressProps) {
  const [progress, setProgress] = useState(0)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [simulatedScore, setSimulatedScore] = useState(0)

  // --- ANIMATION LOGIC ---
  useEffect(() => {
    if (isFinished) {
      setProgress(100)
      setCurrentStepIndex(STEPS.length) // All done
      return
    }

    // 1. Progress Bar (0 -> 90%)
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return 95
        return prev + 0.8 // Adjust speed here
      })
    }, 100)

    // 2. Step Walker (Moves through steps based on progress)
    const stepInterval = setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev >= STEPS.length - 1) return prev
        return prev + 1
      })
    }, 3000) // 3 seconds per step

    // 3. Score Simulator (0 -> 60ish while waiting)
    const scoreInterval = setInterval(() => {
      setSimulatedScore(prev => {
        if (prev >= 65) return 65 // Hover around 65 while waiting
        return prev + 1
      })
    }, 150)

    return () => {
      clearInterval(progressInterval)
      clearInterval(stepInterval)
      clearInterval(scoreInterval)
    }
  }, [isFinished])

  // --- HELPER: Color for Scores ---
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-blue-600"
    if (score >= 40) return "text-orange-500"
    return "text-red-500"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good"
    if (score >= 40) return "Average"
    return "Needs Work"
  }

  // --- VIEW: FINISHED (The Result Card) ---
  if (isFinished && finalStats) {
    return (
      <Card className="border-green-200 bg-green-50/50 animate-in fade-in zoom-in duration-500 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-green-500" />
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            {/* Left: Headline & Call to Action */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" /> Optimization Complete
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                Your Resume is Ready!
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We improved your grammar, added <strong>{finalStats.addedSkillsCount} missing keywords</strong>, and boosted your ATS score by <strong>{finalStats.improvementPct}%</strong>.
              </p>
            </div>

            {/* Right: The "Uniform" Score Card */}
            <div className="bg-white rounded-2xl p-6 border border-green-100 shadow-sm text-center transform transition-all hover:scale-105">
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-2">ATS Score</div>
              <div className={cn("text-6xl font-black mb-1", getScoreColor(finalStats.atsScore))}>
                {finalStats.atsScore}
              </div>
              <div className={cn("text-sm font-bold bg-opacity-10 py-1 px-3 rounded-full inline-block", getScoreColor(finalStats.atsScore).replace('text-', 'bg-'))}>
                {getScoreLabel(finalStats.atsScore)}
              </div>
              
              <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-gray-100">
                 <div className="text-center">
                    <div className="text-lg font-bold text-gray-800">{finalStats.grammarScore}%</div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold">Grammar</div>
                 </div>
                 <div className="text-center border-l border-gray-100">
                    <div className="text-lg font-bold text-gray-800">{finalStats.originalityScore}%</div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold">Originality</div>
                 </div>
                 <div className="text-center border-l border-gray-100">
                    <div className="text-lg font-bold text-gray-800">+{finalStats.addedSkillsCount}</div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold">Skills</div>
                 </div>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>
    )
  }

  // --- VIEW: GENERATING (The Progress Animation) ---
  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="p-0 space-y-8">
        
        {/* 1. Header & Big Text */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 animate-pulse">
            Generating...
          </h2>
          <p className="text-gray-500">Please wait while our AI architect builds your resume.</p>
        </div>

        {/* 2. Main Layout: Steps (Left) + Score Gauge (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Left: The Checklist (Span 7 cols) */}
          <div className="md:col-span-7 space-y-6">
             {/* Progress Bar */}
             <div className="space-y-2">
               <Progress value={progress} className="h-2" />
               <div className="flex justify-between text-xs text-gray-400 font-medium">
                 <span>Process Started</span>
                 <span>{Math.round(progress)}%</span>
               </div>
             </div>

             {/* Steps List */}
             <div className="space-y-4">
               {STEPS.map((step, index) => {
                 const isActive = index === currentStepIndex
                 const isCompleted = index < currentStepIndex
                 
                 return (
                   <div 
                     key={step.id} 
                     className={cn(
                       "flex items-center gap-4 p-3 rounded-lg transition-all duration-500 border",
                       isActive ? "bg-white border-blue-200 shadow-sm scale-102" : "border-transparent opacity-60",
                       isCompleted ? "opacity-100" : ""
                     )}
                   >
                     {/* Icon State Logic */}
                     <div className="flex-shrink-0">
                       {isCompleted ? (
                         <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center">
                           <CheckCircle2 className="h-4 w-4 text-green-600" />
                         </div>
                       ) : isActive ? (
                         <div className="h-6 w-6 relative">
                           <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                         </div>
                       ) : (
                         <Circle className="h-6 w-6 text-gray-300" />
                       )}
                     </div>
                     
                     {/* Text */}
                     <span className={cn(
                       "text-sm font-medium",
                       isActive ? "text-blue-900" : "text-gray-500",
                       isCompleted && "text-gray-700 decoration-green-500"
                     )}>
                       {step.label}
                     </span>
                   </div>
                 )
               })}
             </div>
          </div>

          {/* Right: The "Uniform" Score Gauge (Span 5 cols) */}
          <div className="md:col-span-5 flex flex-col justify-center">
             <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-center relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50" />
                
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                  Estimated Quality
                </h3>

                {/* The "Calculating" Number */}
                <div className="text-5xl font-black text-gray-300 tabular-nums">
                   {simulatedScore}<span className="text-2xl text-gray-200">%</span>
                </div>
                
                <div className="mt-4 flex justify-center gap-2">
                   <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">
                      <ShieldCheck className="w-3 h-3" /> ATS
                   </div>
                   <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">
                      <Zap className="w-3 h-3" /> IMPACT
                   </div>
                </div>

                <div className="mt-4 text-xs text-gray-400 animate-pulse">
                   Calculating Metrics...
                </div>
             </div>
          </div>

        </div>

      </CardContent>
    </Card>
  )
}