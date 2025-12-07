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

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  // Fetch history when user is available
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
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar />
        <main className="p-6 md:p-8">
          <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
      </div>
    )
  }

  const formatTimestamp = (timestamp: Timestamp | Date | undefined) => {
    if (!timestamp) return "Unknown date"
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const formatType = (type: string) => {
    return type
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }
  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />
      <main className="p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground">History</h1>
            <p className="text-sm text-muted-foreground mt-1">View all your previously generated documents</p>
          </div>

          {historyLoading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <p className="text-muted-foreground">Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <p className="text-muted-foreground">No history yet. Generate something to see it here!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <Card key={item.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">
                          {item.title || `${formatType(item.type)} - ${formatTimestamp(item.createdAt)}`}
                        </h3>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                            {formatType(item.type)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(item.createdAt)}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="ml-4 gap-2 bg-transparent">
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </div>
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
