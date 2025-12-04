"use client"

import type React from "react"

import { useState } from "react"
import { Upload } from "lucide-react"

export function FileUpload() {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    // File upload logic will go here
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragOver ? "border-primary bg-accent" : "border-border bg-muted"
      }`}
    >
      <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
      <p className="text-sm font-medium text-foreground mb-1">Drag and drop your file here</p>
      <p className="text-xs text-muted-foreground mb-4">or</p>
      <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
        Click to browse
      </button>
    </div>
  )
}
