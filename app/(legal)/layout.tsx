export default function LegalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-background text-foreground min-h-screen">
            <div className="max-w-4xl mx-auto px-8 py-24">
                {/* Adds clear spacing, large headings, and readable line heights */}
                <article className="prose prose-lg prose-slate dark:prose-invert 
          prose-headings:text-primary prose-headings:font-bold 
          prose-h1:text-5xl prose-h1:mb-12
          prose-p:text-muted-foreground prose-p:leading-relaxed 
          prose-li:text-muted-foreground">
                    {children}
                </article>
            </div>
        </div>
    )
}
