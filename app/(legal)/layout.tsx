import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function LegalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-background text-foreground min-h-screen">
            <div className="max-w-4xl mx-auto px-8 py-12 md:py-24">

                <Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors mb-8 flex items-center gap-2 group w-fit">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Back to All Documents</span>
                </Link>

                {/* Adds clear spacing, large headings, and readable line heights */}
                <article className="prose prose-lg prose-slate dark:prose-invert 
          prose-headings:text-foreground prose-headings:font-bold 
          prose-h1:text-4xl md:prose-h1:text-5xl prose-h1:mb-12 prose-h1:tracking-tight
          prose-p:text-muted-foreground prose-p:leading-relaxed 
          prose-li:text-muted-foreground">
                    {children}
                </article>
            </div>
        </div>
    )
}
