import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#0c0f10] text-[#e1e3e4] min-h-screen font-sans">
      {/* Subtle gradient top bar */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#ff8a00]/40 to-transparent" />

      <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[rgba(221,193,174,0.5)] hover:text-[#ff8a00] transition-colors mb-10 group px-4 py-2 -ml-4 rounded-lg hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>

        <article className="
          [&>h1]:text-4xl [&>h1]:md:text-5xl [&>h1]:font-black [&>h1]:text-[#e1e3e4] [&>h1]:mb-6 [&>h1]:tracking-tight
          [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-[#ff8a00] [&>h2]:mt-14 [&>h2]:mb-5 [&>h2]:border-b [&>h2]:border-white/10 [&>h2]:pb-2
          [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-[#ffb77f] [&>h3]:mt-8 [&>h3]:mb-3
          [&>p]:text-[16px] [&>p]:md:text-[17px] [&>p]:text-[rgba(221,193,174,0.7)] [&>p]:leading-relaxed [&>p]:mb-6
          [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-8 [&>ul]:space-y-3 [&>ul>li]:text-[16px] [&>ul>li]:md:text-[17px] [&>ul>li]:text-[rgba(221,193,174,0.7)] [&>ul>li]:leading-relaxed
          [&>ul>li::marker]:text-[#ff8a00]
          [&>a]:text-[#ffb77f] [&>a]:underline [&>a]:underline-offset-4 [&>a]:hover:text-[#ff8a00] [&>a]:transition-colors
          [&>strong]:text-[#e1e3e4] [&>strong]:font-semibold
        ">
          {children}
        </article>

      </div>

      {/* Mini footer */}
      <div className="border-t border-[rgba(255,255,255,0.05)] py-8 mt-12 text-center bg-black/20">
        <span className="text-xs font-medium tracking-widest uppercase text-[rgba(221,193,174,0.4)]">
          © {new Date().getFullYear()} ResumeBuilder.ai
        </span>
      </div>
    </div>
  )
}
