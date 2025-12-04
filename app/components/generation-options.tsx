"use client"

import { Button } from "@/components/ui/button"
import { FileText, BookOpen, Mail } from "lucide-react"

interface GenerationOptionsProps {
  selectedOption: "resume" | "sop" | "cover-letter"
  setSelectedOption: (option: "resume" | "sop" | "cover-letter") => void
}

export function GenerationOptions({ selectedOption, setSelectedOption }: GenerationOptionsProps) {
  const options = [
    {
      id: "resume",
      label: "Resume",
      icon: FileText,
    },
    {
      id: "sop",
      label: "SOP",
      icon: BookOpen,
    },
    {
      id: "cover-letter",
      label: "Cover Letter",
      icon: Mail,
    },
  ]

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {options.map((option) => {
        const Icon = option.icon
        const isSelected = selectedOption === option.id

        return (
          <Button
            key={option.id}
            onClick={() => setSelectedOption(option.id as "resume" | "sop" | "cover-letter")}
            variant={isSelected ? "default" : "outline"}
            className={`flex-1 gap-2 h-10 font-medium transition-colors ${
              isSelected
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "border-border text-foreground hover:bg-muted"
            }`}
          >
            <Icon className="h-4 w-4" />
            {option.label}
          </Button>
        )
      })}
    </div>
  )
}
