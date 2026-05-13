"use client"

import { useState, useEffect } from "react"
import { SignInButton } from "@clerk/nextjs"
import Link from "next/link"
import {
  FileText, Mail, BookOpen, Sparkles, CheckCircle,
  ArrowRight, Target, Download, Brain, ShieldCheck,
  Zap, Star, Users, TrendingUp, Menu, X, ChevronDown, ChevronUp
} from "lucide-react"

export default function ResumeBuilderLanding({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [typedText, setTypedText] = useState("")
  const [showStickyCTA, setShowStickyCTA] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const fullText = "Quantify your impact: increased revenue by 24% over 6 months."

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, i))
      i++
      if (i > fullText.length) {
        setTimeout(() => { i = 0 }, 2000)
      }
    }, 50)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyCTA(window.scrollY > 800)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="overflow-x-hidden bg-slate-50 text-slate-900">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo → home link */}
          <Link href="/" className="flex items-center gap-3 group px-2">
            <div className="hidden sm:block">
              <h1 className="text-xl font-black tracking-tight leading-none text-slate-900">
                ResumeBuilder<span className="text-[#ff8a00]">.ai</span>
              </h1>
            </div>
          </Link>
          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-500 hover:text-orange-600 text-sm font-medium transition-colors">Features</a>
            <a href="#how-it-works" className="text-slate-500 hover:text-orange-600 text-sm font-medium transition-colors">How it Works</a>
            <a href="#benefits" className="text-slate-500 hover:text-orange-600 text-sm font-medium transition-colors">Benefits</a>
          </div>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-500 hover:from-orange-600 hover:to-orange-600 text-white text-sm font-semibold px-5 py-2 rounded-full transition-all shadow-md shadow-orange-200 hover:scale-105"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="text-sm text-slate-500 hover:text-orange-600 transition-colors hidden md:block font-medium">Login</button>
                </SignInButton>
                <SignInButton mode="modal">
                  <button className="text-sm font-semibold bg-gradient-to-r from-orange-500 to-orange-500 hover:from-orange-600 hover:to-orange-600 text-white px-5 py-2 rounded-full transition-all shadow-md shadow-orange-200 hover:scale-105">Go to Dashboard</button>
                </SignInButton>
              </>
            )}
            {/* Mobile hamburger */}
            <button
              className="md:hidden ml-1 p-2 text-slate-500 hover:text-orange-600 transition-colors"
              onClick={() => setMobileMenuOpen(o => !o)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4 flex flex-col gap-4 shadow-lg">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-slate-600 hover:text-orange-600 text-sm font-medium transition-colors">Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-slate-600 hover:text-orange-600 text-sm font-medium transition-colors">How it Works</a>
            <a href="#benefits" onClick={() => setMobileMenuOpen(false)} className="text-slate-600 hover:text-orange-600 text-sm font-medium transition-colors">Benefits</a>
            {isLoggedIn ? (
              <Link href="/dashboard" className="text-sm font-semibold text-orange-600" onClick={() => setMobileMenuOpen(false)}>Go to Dashboard →</Link>
            ) : (
              <SignInButton mode="modal">
                <button className="text-sm text-slate-600 hover:text-orange-600 text-left font-medium transition-colors" onClick={() => setMobileMenuOpen(false)}>Login</button>
              </SignInButton>
            )}
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-32 overflow-hidden" style={{ backgroundImage: "linear-gradient(rgba(15, 23, 42, 0.82), rgba(15, 23, 42, 0.92)), url('/bg-hero.jpg')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
        {/* orbs */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-orange-700/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-orange-700/20 rounded-full blur-[120px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div className="flex flex-col gap-7">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/30 bg-orange-500/10 w-max">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-semibold tracking-widest text-orange-400 uppercase">AI-Powered Career Engine</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Build{" "}
              <span className="bg-gradient-to-r from-orange-400 to-orange-400 bg-clip-text text-transparent">
                Job-Winning
              </span>{" "}
              Resumes with AI
            </h1>

            <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
              Create tailored resumes, cover letters, and SOPs in minutes using AI that understands job descriptions, application requirements, and professional formatting.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-500 hover:from-orange-600 hover:to-orange-600 text-white font-semibold px-8 py-4 rounded-lg shadow-xl shadow-orange-900/30 hover:scale-105 transition-all text-base"
                >
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <SignInButton mode="modal">
                  <button className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-500 hover:from-orange-600 hover:to-orange-600 text-white font-semibold px-8 py-4 rounded-lg shadow-xl shadow-orange-900/30 hover:scale-105 transition-all text-base">
                    Go to Dashboard <ArrowRight className="w-4 h-4" />
                  </button>
                </SignInButton>
              )}
              <a href="#how-it-works">
                <button className="inline-flex items-center gap-2 border border-white/30 text-white bg-transparent hover:bg-white/10 px-8 py-4 rounded-lg transition-all text-base font-semibold">
                  See How It Works
                </button>
              </a>
            </div>
          </div>

          {/* Right – mock UI */}
          <div className="relative h-[520px] flex items-center justify-center">
            {/* resume card */}
            <div className="absolute inset-0 m-auto w-80 h-96 bg-white/5 backdrop-blur-xl border border-white/15 rounded-2xl p-6 shadow-2xl -rotate-2 hover:rotate-0 transition-transform duration-500 z-10">
              <div className="h-4 w-1/3 bg-white/20 rounded mb-2" />
              <div className="h-2 w-1/4 bg-white/10 rounded mb-8" />
              {[1, 0.8, 0.6].map((w, i) => (
                <div key={i} className="h-2 rounded mb-2 bg-white/10" style={{ width: `${w * 100}%` }} />
              ))}
              <div className="mt-6 flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded bg-orange-500/20 flex items-center justify-center">
                  <Target className="w-3 h-3 text-orange-400" />
                </div>
                <div className="h-2 w-24 bg-white/15 rounded" />
              </div>
              {[1, 0.85].map((w, i) => (
                <div key={i} className="h-2 rounded mb-2 bg-white/10" style={{ width: `${w * 100}%` }} />
              ))}
            </div>

            {/* AI suggestion chip */}
            <div className="absolute top-16 -right-4 w-60 bg-white/5 backdrop-blur-xl border border-orange-500/30 rounded-xl p-4 shadow-xl z-20">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-orange-400 animate-pulse" />
                <span className="text-xs font-semibold text-orange-400">AI Suggestion</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed min-h-[40px]">
                "{typedText}"
                <span className="inline-block w-1 h-3 ml-1 bg-orange-400 animate-pulse" />
              </p>
              <button className="mt-2 w-full py-1 text-xs text-orange-400 bg-orange-500/10 rounded hover:bg-orange-500/20 transition-colors font-semibold">
                Apply Optimization
              </button>
            </div>

            {/* match score badge */}
            <div className="absolute bottom-16 -left-4 w-24 h-24 bg-white/5 backdrop-blur-xl border border-orange-500/30 rounded-full flex flex-col items-center justify-center shadow-xl z-20">
              <span className="text-2xl font-bold text-orange-400">92%</span>
              <span className="text-[10px] text-slate-400 text-center">Match Score</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <section className="border-y border-slate-200 py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-center gap-10">
          {[
            { icon: <Zap className="w-4 h-4 text-orange-500" />, label: "AI-Tailored" },
            { icon: <ShieldCheck className="w-4 h-4 text-orange-500" />, label: "ATS-Friendly" },
            { icon: <Mail className="w-4 h-4 text-orange-500" />, label: "Cover letters in seconds" },
            { icon: <Users className="w-4 h-4 text-orange-500" />, label: "Built for professionals" },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-slate-500">
              {icon}
              <span className="text-xs font-semibold tracking-wider uppercase">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── BG SECTION 1 ── */}
      <section className="relative py-32 min-h-[560px] flex items-center" style={{ backgroundImage: "linear-gradient(rgba(5, 10, 30, 0.80), rgba(5, 10, 30, 0.92)), url('/bg-section1.webp')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="inline-block mb-6 px-3 py-1 rounded-full bg-orange-500/30 text-orange-200 border border-orange-400/40 text-xs font-semibold tracking-wider uppercase">Modern Job Seekers</span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}>Designed for modern job seekers</h2>
          <p className="text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed" style={{ textShadow: "0 1px 10px rgba(0,0,0,0.7)" }}>
            Whether you are applying for internships, switching careers, or aiming for a leadership role, ResumeBuilder.ai helps you present your experience with clarity, confidence, and professional structure.
          </p>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">Your Professional Arsenal</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Everything you need to stand out in today's competitive job market.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-slate-50 border border-slate-200 rounded-2xl p-8 hover:-translate-y-2 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-100 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center mb-6 group-hover:bg-orange-100 transition-colors">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900">Resume Builder</h3>
              <p className="text-slate-500 leading-relaxed">Dynamic, structurally sound templates that adapt to your content and pass ATS filters flawlessly.</p>
            </div>
            <div className="group bg-slate-50 border border-slate-200 rounded-2xl p-8 hover:-translate-y-2 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-100 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center mb-6 group-hover:bg-orange-100 transition-colors">
                <Mail className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900">Cover Letter Generator</h3>
              <p className="text-slate-500 leading-relaxed">Hyper-personalized cover letters instantly drafted to align your skills directly with the job description.</p>
            </div>
            <div className="group bg-slate-50 border border-slate-200 rounded-2xl p-8 hover:-translate-y-2 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-100 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center mb-6 group-hover:bg-orange-100 transition-colors">
                <BookOpen className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900">SOP Generator</h3>
              <p className="text-slate-500 leading-relaxed">Craft compelling Statements of Purpose for academic or specialized roles with structural precision.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── BG SECTION 2 ── */}
      <section className="relative py-32 min-h-[500px] flex items-center overflow-hidden border-y border-white/5" style={{ backgroundImage: "linear-gradient(rgba(5, 10, 30, 0.80), rgba(5, 10, 30, 0.92)), url('/bg-section2.jpg')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}>From first draft to final application</h2>
          <p className="text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed" style={{ textShadow: "0 1px 10px rgba(0,0,0,0.7)" }}>
            Stop spending hours formatting documents manually. ResumeBuilder.ai helps you generate, refine, and improve resumes and supporting documents quickly, while keeping them polished and professional.
          </p>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">How It Works</h2>
            <p className="text-slate-500">Three simple steps to your next career document.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Paste your job description", desc: "Add the role, company, or application requirement you are targeting." },
              { step: "02", title: "Generate with AI", desc: "ResumeBuilder.ai creates tailored content with strong wording and structure." },
              { step: "03", title: "Edit, download, and apply", desc: "Refine your document, export it, and apply with confidence." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative bg-white border border-slate-200 rounded-2xl p-8 hover:border-orange-300 hover:shadow-lg transition-all">
                <span className="text-6xl font-black text-slate-100 absolute top-4 right-6">{step}</span>
                <span className="text-xs font-bold text-orange-500 tracking-widest uppercase mb-4 block">Step {step}</span>
                <h3 className="text-xl font-semibold mb-3 text-slate-900">{title}</h3>
                <p className="text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI MATCH SPLIT SECTION ── */}
      <section className="py-24 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <span className="inline-block mb-6 px-3 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200 text-xs font-semibold tracking-wider uppercase">AI Matching</span>
            <h2 className="text-4xl font-bold mb-6 leading-tight text-slate-900">Tailored for every opportunity</h2>
            <p className="text-slate-500 leading-relaxed mb-8">
              Generic resumes get ignored. ResumeBuilder.ai helps match your experience to the role by improving bullet points, highlighting relevant skills, and structuring your document for clarity.
            </p>
            <ul className="space-y-3">
              {["ATS-friendly structure", "Role-specific wording", "Professional formatting", "Faster application workflow"].map(b => (
                <li key={b} className="flex items-center gap-3 text-slate-700">
                  <CheckCircle className="w-5 h-5 text-orange-500 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* Right – resume mock */}
          <div className="relative h-[480px]">
            <div className="absolute inset-0 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl shadow-slate-200">
              {/* Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">AK</div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">Arjun Kumar</div>
                  <div className="text-xs text-slate-400">Senior Software Engineer</div>
                </div>
              </div>
              {/* Skills */}
              <div className="flex gap-2 flex-wrap mb-5">
                {["React", "TypeScript", "Node.js", "AWS"].map(skill => (
                  <span key={skill} className="px-2 py-1 bg-orange-50 text-orange-600 text-xs rounded-full border border-orange-200 font-medium">{skill}</span>
                ))}
              </div>
              {/* Experience lines */}
              <div className="mb-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Experience</div>
                <div className="space-y-1.5">
                  {["100%", "88%", "72%"].map((w, i) => (
                    <div key={i} className="h-2 rounded-full bg-slate-100" style={{ width: w }}>
                      <div className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-400" style={{ width: i === 0 ? "80%" : i === 1 ? "65%" : "50%" }} />
                    </div>
                  ))}
                </div>
              </div>
              {/* Skills lines */}
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Key Achievements</div>
                <div className="space-y-1.5">
                  {["95%", "80%", "70%", "60%"].map((w, i) => (
                    <div key={i} className="h-2 rounded-full bg-slate-100" style={{ width: w }} />
                  ))}
                </div>
              </div>

              {/* floating badge */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-br from-orange-600 to-orange-600 rounded-full px-4 py-2 shadow-xl">
                <span className="text-sm font-bold text-white">92% Match</span>
              </div>

              {/* AI box */}
              <div className="absolute -bottom-5 -left-5 bg-white border border-orange-200 rounded-xl p-4 w-56 shadow-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="w-3 h-3 text-orange-500 animate-pulse" />
                  <span className="text-xs text-orange-600 font-semibold">AI Tip</span>
                </div>
                <p className="text-xs text-slate-500">Add metrics to improve your bullet point impact score</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BG SECTION 3 ── */}
      <section className="relative py-32 min-h-[500px] flex items-center overflow-hidden border-t border-white/5" style={{ backgroundImage: "linear-gradient(rgba(5, 10, 30, 0.80), rgba(5, 10, 30, 0.92)), url('/bg-section3.jpg')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}>Built to help you stand out</h2>
          <p className="text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed" style={{ textShadow: "0 1px 10px rgba(0,0,0,0.7)" }}>
            In a competitive market, generic applications are easy to ignore. ResumeBuilder.ai helps you highlight the right skills, align your experience with the role, and communicate your strengths effectively.
          </p>
        </div>
      </section>

      {/* ── BENEFITS GRID ── */}
      <section id="benefits" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">Why ResumeBuilder.ai?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Zap className="w-5 h-5 text-yellow-500" />, title: "Save hours of writing", desc: "Generate full documents in minutes, not hours." },
              { icon: <Star className="w-5 h-5 text-orange-500" />, title: "Improve resume clarity", desc: "AI rewrites bullet points for maximum impact." },
              { icon: <Target className="w-5 h-5 text-orange-500" />, title: "Match job descriptions", desc: "Align every resume to the specific role." },
              { icon: <Mail className="w-5 h-5 text-orange-500" />, title: "Cover letters instantly", desc: "Personalized letters generated alongside resumes." },
              { icon: <BookOpen className="w-5 h-5 text-orange-500" />, title: "SOPs for applications", desc: "Compelling statements for universities and visas." },
              { icon: <TrendingUp className="w-5 h-5 text-green-500" />, title: "Beginner-friendly", desc: "Simple editing tools for all experience levels." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-orange-200 hover:shadow-md hover:-translate-y-1 transition-all">
                <div className="mb-3">{icon}</div>
                <h3 className="font-semibold mb-2 text-slate-900">{title}</h3>
                <p className="text-sm text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 border-t border-slate-200 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
          <h2 className="text-4xl font-bold mb-4 text-slate-900">Trusted by Professionals</h2>
          <p className="text-slate-500">Join thousands of job seekers who landed their dream roles.</p>
        </div>
        <div className="flex gap-6 animate-marquee pause-on-hover py-4">
          {[
            { name: "Alex Chen", role: "Software Engineer @ Google", text: "ResumeBuilder.ai saved me hours. The AI suggestions for my experience bullet points were spot on!" },
            { name: "Sarah Miller", role: "Product Manager", text: "The ATS-friendly templates are beautiful and professional. I got 3 interview calls in one week." },
            { name: "David Kumar", role: "Graduate Student", text: "Crafting a SOP used to be so stressful. This tool made it effortless and professional." },
            { name: "Jessica Wu", role: "Marketing Lead", text: "The cover letter generator is a game changer. It feels so personalized to every job description." },
            { name: "Michael Ross", role: "Data Scientist", text: "Finally a tool that understands technical roles. My resume looks so much more impactful now." },
          ].concat([
            { name: "Alex Chen", role: "Software Engineer @ Google", text: "ResumeBuilder.ai saved me hours. The AI suggestions for my experience bullet points were spot on!" },
            { name: "Sarah Miller", role: "Product Manager", text: "The ATS-friendly templates are beautiful and professional. I got 3 interview calls in one week." },
            { name: "David Kumar", role: "Graduate Student", text: "Crafting a SOP used to be so stressful. This tool made it effortless and professional." },
            { name: "Jessica Wu", role: "Marketing Lead", text: "The cover letter generator is a game changer. It feels so personalized to every job description." },
            { name: "Michael Ross", role: "Data Scientist", text: "Finally a tool that understands technical roles. My resume looks so much more impactful now." },
          ]).map((t, i) => (
            <div key={i} className="min-w-[350px] bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
              <p className="text-slate-600 italic mb-4">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-500 flex items-center justify-center font-bold text-sm text-white">
                  {t.name[0]}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-900">{t.name}</h4>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BG SECTION 4 ── */}
      <section className="relative py-32 min-h-[500px] flex items-center overflow-hidden border-t border-white/5" style={{ backgroundImage: "linear-gradient(rgba(5, 10, 30, 0.80), rgba(5, 10, 30, 0.92)), url('/bg-section4.jpg')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}>Everything you need for career documents</h2>
          <p className="text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed" style={{ textShadow: "0 1px 10px rgba(0,0,0,0.7)" }}>
            From resumes and cover letters to Statements of Purpose, ResumeBuilder.ai gives you a single, intelligent workflow to create documents faster and with higher quality.
          </p>
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section className="py-24 border-t border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">Frequently Asked Questions</h2>
            <p className="text-slate-500">Everything you need to know about ResumeBuilder.ai</p>
          </div>
          <div className="space-y-4">
            {[
              { q: "How does the pricing work?", a: "You can build your resume for free to see our AI in action. When you're ready, we offer low-cost single document unlocks, or a subscription for unlimited downloads and access to all premium templates and career tools." },
              { q: "Do the resumes pass ATS (Applicant Tracking Systems)?", a: "Absolutely. Our templates are specifically engineered with clean structural data that ATS systems can easily parse, ensuring your resume actually gets seen." },
              { q: "Can I export my resume to PDF?", a: "Yes, all documents can be exported as high-quality, professional PDFs ready for any application portal." },
              { q: "How does the AI matching work?", a: "Our AI analyzes the job description you provide and compares it with your experience, suggesting specific keywords and bullet point improvements to maximize your match score." },
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
                <button
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-100 transition-colors"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <span className="font-semibold text-slate-900">{item.q}</span>
                  {openFaq === idx ? <ChevronUp className="w-5 h-5 text-orange-500" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>
                {openFaq === idx && (
                  <div className="px-6 py-4 text-slate-600 border-t border-slate-200 bg-white">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-32 relative overflow-hidden bg-gradient-to-br from-orange-600 via-orange-600 to-orange-700">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('/bg-hero.jpg')", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-5xl font-bold mb-6 leading-tight text-white">
            Ready to build your<br />
            <span className="text-orange-200">next opportunity?</span>
          </h2>
          <p className="text-xl text-orange-100 mb-10">Start creating professional career documents with AI today.</p>
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-white text-orange-700 hover:bg-orange-50 font-bold px-10 py-5 text-lg rounded-xl shadow-2xl hover:scale-105 transition-all"
            >
              Go to Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <SignInButton mode="modal">
              <button className="inline-flex items-center gap-2 bg-white text-orange-700 hover:bg-orange-50 font-bold px-10 py-5 text-lg rounded-xl shadow-2xl hover:scale-105 transition-all">
                Go to Dashboard <ArrowRight className="w-5 h-5" />
              </button>
            </SignInButton>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-200 py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-3 group">
                <div>
                  <h1 className="text-lg font-black tracking-tight leading-none text-slate-900">
                    ResumeBuilder<span className="text-[#ff8a00]">.ai</span>
                  </h1>
                </div>
              </Link>
              <p className="mt-3 text-sm text-slate-500 max-w-xs">
                AI-powered career documents that help you land interviews faster.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="/dashboard" className="text-sm text-slate-500 hover:text-orange-600 transition-colors">Dashboard</Link></li>
                <li><Link href="/history" className="text-sm text-slate-500 hover:text-orange-600 transition-colors">History</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-sm text-slate-500 hover:text-orange-600 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-sm text-slate-500 hover:text-orange-600 transition-colors">Terms of Service</Link></li>
                <li><Link href="/cookies" className="text-sm text-slate-500 hover:text-orange-600 transition-colors">Cookie Policy</Link></li>
                <li><Link href="/refund-policy" className="text-sm text-slate-500 hover:text-orange-600 transition-colors">Refund Policy</Link></li>
                <li><Link href="/cancellation-policy" className="text-sm text-slate-500 hover:text-orange-600 transition-colors">Cancellation Policy</Link></li>
                <li><Link href="/contact" className="text-sm text-slate-500 hover:text-orange-600 transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-8 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} ResumeBuilder.ai. Precision engineered for career growth.
          </div>
        </div>
      </footer>

      {/* ── STICKY MOBILE CTA ── */}
      {showStickyCTA && (
        <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 md:hidden">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xl shadow-slate-300/50 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">Go to Dashboard</p>
              <p className="text-sm font-semibold text-slate-900">Build your resume now</p>
            </div>
            {isLoggedIn ? (
              <Link href="/dashboard" className="bg-gradient-to-r from-orange-500 to-orange-500 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md shadow-orange-200">
                Dashboard
              </Link>
            ) : (
              <SignInButton mode="modal">
                <button className="bg-gradient-to-r from-orange-500 to-orange-500 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md shadow-orange-200">Go to Dashboard</button>
              </SignInButton>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
