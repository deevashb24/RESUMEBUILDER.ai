import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#020617] text-white min-h-screen font-sans">
      {/* Subtle gradient top bar */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-400 transition-colors mb-10 group px-4 py-2 -ml-4 rounded-lg hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>

        <article className="
          prose prose-invert prose-lg max-w-none
          prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-white
          prose-h1:text-4xl prose-h1:mb-8
          prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:text-blue-400
          prose-p:text-slate-400 prose-p:leading-relaxed prose-p:mb-5
          prose-li:text-slate-400 prose-li:marker:text-blue-500/50
          prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-slate-200
        ">
          {children}
        </article>

      </div>

      {/* Mini footer */}
      <div className="border-t border-white/5 py-6 text-center">
        <span className="text-xs text-slate-600">© {new Date().getFullYear()} ResumeBuilder.ai</span>
      </div>
    </div>
  )
}
