import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { GenerationProvider } from "@/lib/generation-context"
import { ClerkProvider } from "@clerk/nextjs"
import { LanguageProvider } from "@/lib/language-context"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL("https://resumebuilderai.in"),
  title: "ResumeBuilder.ai - Build Job-Winning Resumes with AI",
  description: "Create tailored resumes, cover letters, and SOPs in minutes using AI that understands job descriptions and professional formatting.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClerkProvider>
          <AuthProvider>
            <LanguageProvider>
              <GenerationProvider>
                {children}
              </GenerationProvider>
            </LanguageProvider>
          </AuthProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}