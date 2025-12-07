import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, BookOpen, Mail } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - ResumeAI Landing Page */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-24">
        <div className="text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight">
            ResumeAI
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Generate Your Perfect Resume, SOP, and Cover Letter
          </p>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
            Create tailored resumes, SOPs, and cover letters powered by AI. 
            Get personalized documents that match your dream job.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <p className="text-lg font-medium text-foreground">
              Get Started
            </p>
            <Link href="/dashboard">
              <Button variant="outline" size="lg">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-4 p-6 rounded-lg border border-border bg-card">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-foreground">Resume</h3>
            <p className="text-sm text-muted-foreground">
              Create professional resumes tailored to specific job descriptions
            </p>
          </div>

          <div className="text-center space-y-4 p-6 rounded-lg border border-border bg-card">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-foreground">SOP</h3>
            <p className="text-sm text-muted-foreground">
              Generate compelling Statements of Purpose for applications
            </p>
          </div>

          <div className="text-center space-y-4 p-6 rounded-lg border border-border bg-card">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-foreground">Cover Letter</h3>
            <p className="text-sm text-muted-foreground">
              Write personalized cover letters that stand out
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
