import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { GenerationProvider } from "@/lib/generation-context" // Import this

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ResumeBuilder.ai",
  description: "AI-Powered Resume Builder",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {/* Wrap App in GenerationProvider */}
          <GenerationProvider>
            {children}
          </GenerationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}