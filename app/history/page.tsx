// app/history/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { Eye } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getUserHistory, HistoryEntry } from "@/lib/history"
import { Timestamp } from "firebase/firestore"

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
    return <div className="min-h-screen bg-background"><DashboardNavbar /><main className="p-8">Loading...</main></div>
  }

  const formatTimestamp = (timestamp: Timestamp | Date | undefined) => {
    if (!timestamp) return "Unknown date"
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp
    return date.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const formatType = (type: string) => type.replace("-", " ").toUpperCase()

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />
      <main className="p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold mb-6">History</h1>

          {historyLoading ? (
            <p>Loading history...</p>
          ) : history.length === 0 ? (
            <p>No history yet.</p>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <Card key={item.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">
                        {item.title || `${formatType(item.type)} - ${formatTimestamp(item.createdAt)}`}
                      </h3>
                      <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="bg-secondary px-2 py-0.5 rounded">{formatType(item.type)}</span>
                        <span>{formatTimestamp(item.createdAt)}</span>
                      </div>
                    </div>
                    
                    {/* FIXED BUTTON HERE */}
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
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}