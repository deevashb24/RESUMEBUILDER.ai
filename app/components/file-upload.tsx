"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { UploadCloud, FileText, X, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface FileUploadProps {
  onFileSelect: (file: File | null) => void
  onUpload?: () => void // New prop for the manual upload trigger
  uploadedFile: File | null
  isUploading: boolean
  isParsed?: boolean // New prop to hide button after success
}

export function FileUpload({ 
  onFileSelect, 
  onUpload, 
  uploadedFile, 
  isUploading,
  isParsed 
}: FileUploadProps) {
  
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0])
      }
    },
    [onFileSelect]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    multiple: false,
    disabled: isUploading || !!uploadedFile, // Disable dropzone if file exists
  })

  // Handle removing the file
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onFileSelect(null) // This triggers the cleanup in parent
  }

  // Handle manual upload click
  const handleUploadClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onUpload) onUpload()
  }

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 transition-all duration-200 ease-in-out text-center cursor-pointer",
          isDragActive ? "border-primary bg-primary/5 scale-[0.99]" : "border-gray-200 hover:border-primary/50 hover:bg-gray-50",
          uploadedFile ? "border-solid bg-white cursor-default" : ""
        )}
      >
        <input {...getInputProps()} />
        
        {uploadedFile ? (
          <div className="space-y-4">
            {/* File Info Card */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 relative group">
              <div className="p-2 bg-white rounded-md shadow-sm">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[200px] md:max-w-[300px]">
                  {uploadedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              {/* Success Badge or Remove Button */}
              {isParsed ? (
                 <CheckCircle2 className="w-6 h-6 text-green-500" />
              ) : (
                <button
                  onClick={handleRemove}
                  className="p-1 hover:bg-red-100 text-gray-400 hover:text-red-600 rounded-full transition-colors"
                  disabled={isUploading}
                  title="Remove file"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Upload Action Area */}
            {!isParsed && (
              <div className="animate-in fade-in slide-in-from-top-2">
                {isUploading ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-sm text-blue-600 font-medium">
                      <UploadCloud className="w-4 h-4 animate-bounce" />
                      Uploading & Analyzing...
                    </div>
                    <Progress value={45} className="h-1.5 w-full max-w-[200px] mx-auto" />
                  </div>
                ) : (
                  <Button 
                    onClick={handleUploadClick}
                    size="lg"
                    className="w-full sm:w-auto min-w-[200px] gap-2 font-semibold shadow-lg shadow-blue-100"
                  >
                    <UploadCloud className="w-4 h-4" />
                    Upload & Analyze Resume
                  </Button>
                )}
              </div>
            )}
            
            {isParsed && (
              <div className="flex items-center justify-center gap-2 text-sm text-green-600 font-medium animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                Ready to Generate
              </div>
            )}
          </div>
        ) : (
          // Empty State (Browse)
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-gray-500 mt-1">
                PDF or DOCX (Max 5MB)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}