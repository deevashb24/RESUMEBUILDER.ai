"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { getHistory, HistoryEntry } from "@/lib/history"
import Link from "next/link"
import { PricingModal } from "@/components/pricing-modal"

// --- Mini Resume SVG Thumbnail (no external images) ---
function ResumeThumbnail({ type, isUnlocked }: { type?: string; isUnlocked: boolean }) {
  const opacity = isUnlocked ? 0.85 : 0.35
  const filter = isUnlocked ? "none" : "grayscale(100%)"
  return (
    <div
      className="w-[70%] h-auto rounded shadow-2xl transition-all duration-500"
      style={{ opacity, filter }}
    >
      {type === "cover-letter" ? (
        <svg viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <rect width="160" height="200" rx="3" fill="#1a1d1e" />
          <rect x="12" y="14" width="136" height="8" rx="2" fill="#ff8a00" opacity="0.8" />
          <rect x="12" y="28" width="90" height="4" rx="2" fill="#555" />
          <rect x="12" y="46" width="136" height="1" fill="#333" />
          {[56,66,76,86,96,106,118,128,138,148,158,168].map((y, i) => (
            <rect key={y} x="12" y={y} width={[136,120,130,110,136,125,130,115,136,120,110,95][i]} height="3.5" rx="1.5" fill="#444" />
          ))}
        </svg>
      ) : type === "sop" ? (
        <svg viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <rect width="160" height="200" rx="3" fill="#1a1d1e" />
          <rect x="12" y="14" width="100" height="9" rx="2" fill="#b698ff" opacity="0.9" />
          <rect x="12" y="28" width="70" height="4" rx="2" fill="#555" />
          <rect x="12" y="46" width="136" height="1" fill="#333" />
          {[56,66,76,86,98,108,118,128,140,150,160,170].map((y, i) => (
            <rect key={y} x="12" y={y} width={[136,125,130,100,136,120,130,110,136,122,108,90][i]} height="3.5" rx="1.5" fill="#444" />
          ))}
        </svg>
      ) : (
        <svg viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <rect width="160" height="200" rx="3" fill="#1a1d1e" />
          <rect x="12" y="14" width="80" height="9" rx="2" fill="#e1e3e4" opacity="0.9" />
          <rect x="12" y="27" width="55" height="4" rx="2" fill="#666" />
          <rect x="12" y="36" width="100" height="3" rx="1.5" fill="#555" />
          <rect x="12" y="50" width="136" height="1" fill="#2e3132" />
          <rect x="12" y="58" width="45" height="3" rx="1.5" fill="#ff8a00" opacity="0.8" />
          {[66,74,82,90].map((y, i) => (
            <rect key={y} x="12" y={y} width={[130,115,125,105][i]} height="3" rx="1.5" fill="#3a3d3e" />
          ))}
          <rect x="12" y="104" width="45" height="3" rx="1.5" fill="#ff8a00" opacity="0.8" />
          {[112,120,128,136].map((y, i) => (
            <rect key={y} x="12" y={y} width={[128,110,120,100][i]} height="3" rx="1.5" fill="#3a3d3e" />
          ))}
          <rect x="100" y="58" width="48" height="3" rx="1.5" fill="#444" />
          {[66,74,82].map((y, i) => (
            <rect key={y} x="100" y={y} width={[40,48,35][i]} height="3" rx="1.5" fill="#3a3d3e" />
          ))}
        </svg>
      )}
    </div>
  )
}

function DocCard({ item, isUnlocked, onUnlock }: { item: HistoryEntry; isUnlocked: boolean; onUnlock: () => void }) {
  const label = item.type === "cover-letter" ? "Cover Letter" : item.type === "sop" ? "SOP" : "Resume"
  const date = new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  const atsScore = (item as any).atsScore || null

  return (
    <article
      className="group relative flex flex-col rounded-xl overflow-hidden transition-transform duration-300 ease-out hover:scale-[1.01]"
      style={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      {/* Thumbnail */}
      <div
        className="h-48 w-full relative overflow-hidden border-b flex justify-center items-start p-6"
        style={{ background: "#0c0f10", borderColor: "rgba(255,255,255,0.1)" }}
      >
        <ResumeThumbnail type={item.type} isUnlocked={isUnlocked} />

        {/* Status Badge */}
        {isUnlocked ? (
          <div
            className="absolute top-4 right-4 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.1em] flex items-center gap-1.5"
            style={{
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(55,58,59,0.5)",
              color: "#e1e3e4",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#b698ff", boxShadow: "0 0 5px #b698ff" }} />
            Unlocked
          </div>
        ) : (
          <div
            className="absolute top-4 right-4 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.1em] flex items-center gap-1.5"
            style={{
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,138,0,0.3)",
              background: "rgba(255,138,0,0.1)",
              color: "#ff8a00",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 11V7A5 5 0 0 0 7 7v4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z" />
            </svg>
            Locked
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-6 flex flex-col flex-1">
        <div className="mb-4">
          <span className="text-xs font-bold uppercase tracking-[0.1em] block mb-2" style={{ color: "rgba(221,193,174,0.7)" }}>
            {label}
          </span>
          <h3
            className="text-[22px] font-semibold leading-tight line-clamp-2 transition-colors group-hover:text-[#ffb77f]"
            style={{ color: isUnlocked ? "#e1e3e4" : "rgba(225,227,228,0.8)" }}
          >
            {item.title || "Untitled Document"}
          </h3>
        </div>

        <div
          className="mt-auto pt-4 flex items-center justify-between text-sm border-t"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}
        >
          <span className="flex items-center gap-1.5" style={{ color: "rgba(221,193,174,0.7)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.6">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {date}
          </span>
          {atsScore && isUnlocked ? (
            <span className="font-medium flex items-center gap-1.5 px-2 py-1 rounded text-xs" style={{ color: "#ff8a00", background: "rgba(255,138,0,0.1)" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
              ATS: {atsScore}%
            </span>
          ) : (
            <span style={{ color: "rgba(221,193,174,0.35)", fontSize: "13px" }}>N/A</span>
          )}
        </div>
      </div>

      {/* Hover Overlay — slides in from below */}
      {isUnlocked ? (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-4 p-8 z-10"
          style={{
            background: "rgba(17,20,21,0.92)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,138,0,0.2)",
          }}
        >
          <Link href={`/dashboard/preview?id=${item.id}`} className="w-full">
            <button
              className="w-full py-3.5 px-6 rounded-lg font-semibold text-base translate-y-4 group-hover:translate-y-0 transition-all duration-300 ease-out"
              style={{ background: "#ff8a00", color: "#000" }}
            >
              View / Edit
            </button>
          </Link>
          <Link href={`/dashboard/preview?id=${item.id}`} className="w-full">
            <button
              className="w-full py-3.5 px-6 rounded-lg font-semibold text-base flex justify-center items-center gap-2 translate-y-4 group-hover:translate-y-0 transition-all duration-300 ease-out delay-75"
              style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "#e1e3e4" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download PDF
            </button>
          </Link>
        </div>
      ) : (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-4 p-8 z-10"
          style={{
            background: "rgba(17,20,21,0.92)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="#ff8a00" className="mb-1">
            <path d="M17 11V7A5 5 0 0 0 7 7v4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z" />
          </svg>
          <p className="text-sm text-center" style={{ color: "rgba(221,193,174,0.7)" }}>
            Upgrade to Pro to unlock this generated document.
          </p>
          <button
            onClick={onUnlock}
            className="w-full py-3.5 px-6 rounded-lg font-bold text-base translate-y-4 group-hover:translate-y-0 transition-all duration-300 ease-out"
            style={{ background: "#ffffff", color: "#000" }}
          >
            Unlock Document
          </button>
        </div>
      )}
    </article>
  )
}

export default function HistoryPage() {
  const { user, loading, isPremium, unlockedGenerations } = useAuth()
  const router = useRouter()
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [showPricing, setShowPricing] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.replace("/")
  }, [user, loading, router])

  useEffect(() => {
    async function fetchHistory() {
      if (user) {
        const data = await getHistory(user.id)
        setHistory(data)
      }
      setIsLoadingHistory(false)
    }
    if (!loading && user) fetchHistory()
  }, [user, loading])

  const filteredHistory = history.filter((item) => {
    const titleMatch = (item.title || "").toLowerCase().includes(searchQuery.toLowerCase())
    const typeMatch = typeFilter === "all" || item.type === typeFilter
    return titleMatch && typeMatch
  })

  const filterLabels: Record<string, string> = { all: "All Types", resume: "Resumes", "cover-letter": "Cover Letters", sop: "SOPs" }

  return (
    <>
      {/* Main Content */}
      <div className="w-full">
        <div className="max-w-[1280px] mx-auto">


          {/* Header */}
          <div className="mb-6">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-[#ff8a00]" style={{ color: "rgba(225,227,228,0.5)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Back to Dashboard
            </Link>
          </div>
          <header className="flex justify-between items-end mb-12 border-b pb-6 relative" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            <div className="absolute bottom-0 left-0 w-1/3 h-px" style={{ background: "linear-gradient(to right, #ff8a00, transparent)" }} />
            <div>
              <h2 className="font-black tracking-tight mb-2 leading-tight" style={{ fontSize: "48px", letterSpacing: "-0.04em", color: "#e1e3e4" }}>
                Your Document Library
              </h2>
              <p style={{ fontSize: "18px", color: "rgba(221,193,174,0.85)", lineHeight: 1.6 }}>
                Access, refine, and manage your AI-generated professional assets in your personal atelier.
              </p>
            </div>

            <div className="flex gap-4 items-center flex-shrink-0">
              {/* Ghost Search */}
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(221,193,174,0.6)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search documents..."
                  className="w-72 py-3 pl-12 pr-4 rounded-lg text-sm transition-all outline-none"
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#e1e3e4",
                    fontSize: "16px",
                  }}
                />
              </div>

              {/* Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="flex items-center gap-2 py-3 px-5 rounded-lg text-sm transition-all"
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#e1e3e4",
                    fontSize: "16px",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
                  </svg>
                  {filterLabels[typeFilter]}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "rgba(221,193,174,0.6)" }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {filterOpen && (
                  <div
                    className="absolute right-0 mt-2 w-44 rounded-xl overflow-hidden z-50"
                    style={{ background: "#1d2021", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(24px)" }}
                  >
                    {Object.entries(filterLabels).map(([val, label]) => (
                      <button
                        key={val}
                        onClick={() => { setTypeFilter(val); setFilterOpen(false) }}
                        className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                        style={{
                          color: typeFilter === val ? "#ff8a00" : "#e1e3e4",
                          background: typeFilter === val ? "rgba(255,138,0,0.08)" : "transparent",
                          fontSize: "14px",
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Grid */}
          {loading || isLoadingHistory ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", height: "380px" }} />
              ))}
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6" style={{ background: "rgba(255,138,0,0.06)", color: "rgba(255,138,0,0.35)" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: "#e1e3e4" }}>
                {searchQuery ? "No results found" : "It's quiet in here."}
              </h3>
              <p className="mb-8 max-w-xs" style={{ color: "rgba(221,193,174,0.6)", fontSize: "16px" }}>
                {searchQuery ? `No documents match "${searchQuery}".` : "You haven't generated any documents yet. Start your first tailored resume."}
              </p>
              <Link href="/dashboard">
                <button className="px-8 py-3 rounded-xl font-bold text-sm" style={{ background: "#ff8a00", color: "#000" }}>
                  Create Document
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredHistory.map((item) => {
                const isItemUnlocked = isPremium || !!unlockedGenerations?.includes(item.id)
                return (
                  <DocCard key={item.id} item={item} isUnlocked={isItemUnlocked} onUnlock={() => setShowPricing(true)} />
                )
              })}

              {/* Create New card */}
              <Link href="/dashboard">
                <article
                  className="group relative flex flex-col items-center justify-center rounded-xl overflow-hidden cursor-pointer transition-colors duration-300 hover:bg-white/5"
                  style={{
                    minHeight: "380px",
                    background: "transparent",
                    border: "1px dashed rgba(255,255,255,0.1)",
                  }}
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110"
                    style={{ background: "#1d2021" }}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(221,193,174,0.5)" strokeWidth="2" className="group-hover:stroke-[#ff8a00] transition-colors duration-300">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: "#e1e3e4" }}>New Document</h3>
                  <p className="text-sm text-center px-6" style={{ color: "rgba(221,193,174,0.5)" }}>
                    Launch the AI Atelier to craft a new resume or cover letter.
                  </p>
                </article>
              </Link>
            </div>
          )}
        </div>
      </div>

      <PricingModal open={showPricing} onClose={() => setShowPricing(false)} />
    </>
  )
}