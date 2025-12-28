"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { Eye, ShieldCheck } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getUserHistory, HistoryEntry } from "@/lib/history"
import { Timestamp } from "firebase/firestore"
import { cn } from "@/lib/utils"

export default function HistoryPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && !loading) {
      const fetchHistory = async () => {
        try {
          setHistoryLoading(true)
          const entries = await getUserHistory(user.uid)
          setHistory(entries)
        } catch (error) {
          console.error("Error fetching history:", error)
        } finally {
          setHistoryLoading(false)
        }
      }
      fetchHistory()
    }
  }, [user, loading])

  if (loading || !user) {
    return <div className="min-h-screen bg-background"><DashboardNavbar /><main className="p-8 text-center text-muted-foreground">Loading...</main></div>
  }

  const formatTimestamp = (timestamp: Timestamp | Date | undefined) => {
    if (!timestamp) return "Unknown date"
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp
    return date.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const formatType = (type: string) => type.replace("-", " ").toUpperCase()

  // Helper to get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-700 border-green-200"
    if (score >= 60) return "bg-blue-100 text-blue-700 border-blue-200"
    if (score >= 40) return "bg-orange-100 text-orange-700 border-orange-200"
    return "bg-red-100 text-red-700 border-red-200"
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />
      <main className="p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold mb-6">History</h1>

          {historyLoading ? (
            <p className="text-muted-foreground">Loading history...</p>
          ) : history.length === 0 ? (
            <p className="text-muted-foreground">No history yet.</p>
          ) : (
            <div className="space-y-3">
              {history.map((item) => {
                // Parse the output to find the score
                let atsScore = null
                try {
                  if (item.output) {
                    const parsed = JSON.parse(item.output)
                    // Check for stats object saved in the new format
                    if (parsed.stats && parsed.stats.atsScore) {
                      atsScore = parsed.stats.atsScore
                    }
                  }
                } catch (e) {
                  // Ignore parsing errors
                }

                return (
                  <Card key={item.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium">
                            {item.title || `${formatType(item.type)}`}
                          </h3>
                          
                          {/* ATS Score Badge */}
                          {atsScore !== null && (
                            <div className={cn(
                              "flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border",
                              getScoreColor(atsScore)
                            )}>
                              <ShieldCheck className="w-3 h-3" />
                              ATS: {atsScore}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-3 text-xs text-muted-foreground">
                          <span className="bg-secondary px-2 py-0.5 rounded">{formatType(item.type)}</span>
                          <span>{formatTimestamp(item.createdAt)}</span>
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="ml-4 gap-2"
                        onClick={() => router.push(`/dashboard/preview?id=${item.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>

                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}