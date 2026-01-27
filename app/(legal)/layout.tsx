export default function LegalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="max-w-3xl mx-auto px-6 py-20 min-h-screen">
            <div className="prose prose-slate max-w-none">
                {children}
            </div>
        </div>
    )
}
