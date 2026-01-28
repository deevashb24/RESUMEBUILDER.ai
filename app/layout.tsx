import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { GenerationProvider } from "@/lib/generation-context"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "ResumeBuilder.ai",
  description: "AI-Powered Resume Builder",
}

import { Footer } from "@/components/footer"



import { LanguageProvider } from "@/lib/language-context"

// ... imports ...

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased text-slate-800 selection:bg-indigo-100 selection:text-indigo-700 flex flex-col min-h-screen`}>
        <AuthProvider>
          <LanguageProvider>
            <GenerationProvider>
              <div className="flex-grow">
                {children}
              </div>
              <Footer />
            </GenerationProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  )
}