import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function LegalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-background text-foreground min-h-screen font-sans">
            <div className="max-w-4xl mx-auto px-6 py-12 md:py-24">

                <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-10 group px-4 py-2 -ml-4 rounded-lg hover:bg-secondary/50">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-base font-medium">Back to Dashboard</span>
                </Link>

                <article className="prose prose-lg prose-slate dark:prose-invert 
                    prose-headings:text-foreground prose-headings:font-bold prose-headings:tracking-tight
                    prose-h1:text-4xl md:prose-h1:text-5xl prose-h1:mb-8
                    prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:text-primary
                    prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6
                    prose-li:text-muted-foreground prose-li:marker:text-primary/50
                    max-w-none">
                    {children}
                </article>
            </div>
        </div>
    )
}
