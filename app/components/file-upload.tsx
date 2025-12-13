"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Upload, File, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileUploadProps {
  onFileSelect: (file: File) => void
  uploadedFile?: File | null
  isUploading?: boolean
}

export function FileUpload({
  onFileSelect,
  uploadedFile,
  isUploading = false,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

    const files = Array.from(e.dataTransfer.files)
    const file = files[0]

    if (file && isValidFile(file)) {
      onFileSelect(file)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0] && isValidFile(files[0])) {
      onFileSelect(files[0])
    }
  }

  const isValidFile = (file: File): boolean => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    const validExtensions = [".pdf", ".docx"]
    const fileName = file.name.toLowerCase()

    return (
      validTypes.includes(file.type) ||
      validExtensions.some((ext) => fileName.endsWith(ext))
    )
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onFileSelect(null as any)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
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
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileInput}
        className="hidden"
      />

      {uploadedFile ? (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-3 p-4 bg-background rounded-md border">
            <File className="h-6 w-6 text-primary" />
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-foreground">
                {uploadedFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(uploadedFile.size)}
              </p>
            </div>
            {!isUploading && (
              <button
                onClick={handleRemove}
                className="p-1 hover:bg-muted rounded"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
            {isUploading && (
              <Loader2 className="h-4 w-4 text-primary animate-spin" />
            )}
          </div>
          {isUploading && (
            <p className="text-sm text-muted-foreground">Uploading and parsing...</p>
          )}
        </div>
      ) : (
        <>
          <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground mb-1">
            Drag and drop your resume here
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Supports PDF and DOCX files
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="text-sm"
          >
            Click to browse
          </Button>
        </>
      )}
    </div>
  )
}

