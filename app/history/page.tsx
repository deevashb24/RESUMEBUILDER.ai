"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { getHistory, HistoryEntry } from "@/lib/history"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Calendar, ArrowRight, ArrowLeft, Clock } from "lucide-react" // Added ArrowLeft
import Link from "next/link"

export default function HistoryPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      if (user) {
        const data = await getHistory(user.uid)
        setHistory(data)
      }
      setIsLoadingHistory(false)
    }
    if (!loading && user) {
      fetchHistory()
    }
  }, [user, loading])

  if (loading) return <div>Loading...</div>
  if (!user) {
    router.replace("/")
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* --- HEADER WITH BACK BUTTON --- */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => router.push("/dashboard")}
            className="rounded-full h-10 w-10 bg-white shadow-sm border-gray-200 hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Button>
          <div>
             <h1 className="text-3xl font-bold text-gray-900">Your History</h1>
             <p className="text-gray-500">Access your previously generated documents.</p>
          </div>
        </div>

        {/* --- HISTORY LIST --- */}
        {isLoadingHistory ? (
          <div className="text-center py-12 text-gray-500">Loading history...</div>
        ) : history.length === 0 ? (
          <Card className="border-dashed border-2 shadow-none bg-transparent">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <Clock className="w-12 h-12 text-gray-300" />
              <div className="space-y-1">
                <h3 className="font-semibold text-gray-900">No history yet</h3>
                <p className="text-sm text-gray-500">Generate your first document to see it here.</p>
              </div>
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {history.map((item) => (
              <Card key={item.id} className="group hover:shadow-md transition-all duration-200 border-gray-200">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-gray-900 line-clamp-1">{item.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="uppercase font-bold tracking-wider text-[10px] bg-gray-100 px-2 py-0.5 rounded-full">
                           {item.type || "RESUME"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link href={`/dashboard/preview?id=${item.id}`}>
                    <Button variant="ghost" size="sm" className="gap-2 text-gray-600 group-hover:text-blue-600">
                      View & Download <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}