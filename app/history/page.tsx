"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { getHistory, HistoryEntry } from "@/lib/history"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Calendar, ArrowLeft, Clock, Lock, Download, CheckCircle } from "lucide-react"
import Link from "next/link"
// IMPORT LANGUAGE
import { useLanguage } from "@/lib/language-context"

export default function HistoryPage() {
  const { user, loading, isPremium, unlockedGenerations } = useAuth()
  const { t } = useLanguage() // Get Translations
  const router = useRouter()
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      if (user) {
        const data = await getHistory(user.id)
        setHistory(data)
      }
      setIsLoadingHistory(false)
    }
    if (!loading && user) {
      fetchHistory()
    }
  }, [user, loading])

  if (loading) return <div className="p-12 text-center text-gray-500">{t.history.loading}</div>
  if (!user) {
    router.replace("/")
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* --- HEADER --- */}
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
            <h1 className="text-3xl font-bold text-gray-900">{t.history.title}</h1>
            <p className="text-gray-500">{t.history.subtitle}</p>
          </div>
        </div>

        {/* --- HISTORY LIST --- */}
        {isLoadingHistory ? (
          <div className="text-center py-12 text-gray-500">{t.history.loading}</div>
        ) : history.length === 0 ? (
          <Card className="border-dashed border-2 shadow-none bg-transparent">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <Clock className="w-12 h-12 text-gray-300" />
              <div className="space-y-1">
                <h3 className="font-semibold text-gray-900">{t.history.emptyTitle}</h3>
                <p className="text-sm text-gray-500">{t.history.emptyDesc}</p>
              </div>
              <Link href="/dashboard">
                <Button>{t.history.goDashboard}</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {history.map((item) => {
              const isItemUnlocked = isPremium || unlockedGenerations?.includes(item.id)

              return (
                <Card key={item.id} className={`group transition-all duration-200 border-gray-200 ${isItemUnlocked ? 'hover:shadow-md hover:border-blue-200' : 'hover:border-amber-200'}`}>
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 ${isItemUnlocked ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-gray-900 line-clamp-1">{item.title || "Untitled Document"}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="uppercase font-bold tracking-wider text-[10px] bg-gray-100 px-2 py-0.5 rounded-full">
                            {item.type || "DOCUMENT"}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>

                          {isItemUnlocked ? (
                            <span className="flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-green-200 uppercase tracking-wide ml-2">
                              <CheckCircle className="w-3 h-3" /> {t.history.unlocked}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-200 uppercase tracking-wide ml-2">
                              <Lock className="w-3 h-3" /> {t.history.locked}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Link href={`/dashboard/preview?id=${item.id}`}>
                      {isItemUnlocked ? (
                        <Button variant="outline" size="sm" className="w-full sm:w-auto gap-2 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 hover:border-blue-300">
                          <Download className="w-4 h-4" /> {t.history.download}
                        </Button>
                      ) : (
                        <Button variant="default" size="sm" className="w-full sm:w-auto gap-2 bg-gray-900 hover:bg-black">
                          <Lock className="w-4 h-4" /> {t.history.unlock}
                        </Button>
                      )}
                    </Link>

                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}