"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { Eye } from "lucide-react"

const mockHistory = [
  {
    id: 1,
    title: "Resume for Software Engineer",
    timestamp: "2024-12-03 at 2:45 PM",
    type: "Resume",
  },
  {
    id: 2,
    title: "SOP for Product Manager Role",
    timestamp: "2024-12-02 at 11:20 AM",
    type: "SOP",
  },
  {
    id: 3,
    title: "Cover Letter - Tech Startup",
    timestamp: "2024-12-01 at 4:15 PM",
    type: "Cover Letter",
  },
  {
    id: 4,
    title: "Resume for Data Analyst",
    timestamp: "2024-11-30 at 10:00 AM",
    type: "Resume",
  },
  {
    id: 5,
    title: "SOP for Consulting Role",
    timestamp: "2024-11-29 at 3:30 PM",
    type: "SOP",
  },
]

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />
      <main className="p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground">History</h1>
            <p className="text-sm text-muted-foreground mt-1">View all your previously generated documents</p>
          </div>

          <div className="space-y-3">
            {mockHistory.map((item) => (
              <Card key={item.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{item.title}</h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                          {item.type}
                        </span>
                        <span className="text-xs text-muted-foreground">{item.timestamp}</span>
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
        </div>
      </main>
    </div>
  )
}
