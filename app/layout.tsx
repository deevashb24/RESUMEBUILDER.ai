import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { GenerationProvider } from "@/lib/generation-context"
import { ClerkProvider } from "@clerk/nextjs"
import { LanguageProvider } from "@/lib/language-context"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

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
  title: {
    default: "ResumeBuilder.ai - Build Job-Winning Resumes with AI",
    template: "%s | ResumeBuilder.ai"
  },
  description: "Create tailored, ATS-friendly resumes, cover letters, and SOPs in minutes. Our AI understands job descriptions and formats your experience to land you interviews.",
  applicationName: "ResumeBuilder.ai",
  keywords: ["AI resume builder", "ATS resume", "job winning resume", "cover letter generator", "resume maker", "resume optimization"],
  authors: [{ name: "ResumeBuilder.ai Team" }],
  creator: "ResumeBuilder.ai",
  publisher: "ResumeBuilder.ai",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "ResumeBuilder.ai - Build Job-Winning Resumes with AI",
    description: "Create tailored, ATS-friendly resumes, cover letters, and SOPs in minutes. Leverage AI to optimize your profile and land interviews.",
    url: "https://resumebuilderai.in",
    siteName: "ResumeBuilder.ai",
    images: [
      {
        url: "/og-image.jpg", // The user will need to add this image
        width: 1200,
        height: 630,
        alt: "ResumeBuilder.ai Platform Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeBuilder.ai - Build Job-Winning Resumes",
    description: "Create tailored, ATS-friendly resumes, cover letters, and SOPs in minutes using AI.",
    images: ["/og-image.jpg"],
    creator: "@resumebuilderai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

import { dark } from "@clerk/themes"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ResumeBuilder.ai",
    "operatingSystem": "Web",
    "applicationCategory": "BusinessApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Create tailored, ATS-friendly resumes, cover letters, and SOPs in minutes using AI.",
    "url": "https://resumebuilderai.in"
  };

  return (
    <html lang="en">
      <head>
        <link rel="prefetch" href="/dashboard" />
        <link rel="prefetch" href="/history" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClerkProvider
          appearance={{
            baseTheme: dark,
            variables: {
              colorPrimary: "#ff8a00",
              colorBackground: "#0c0f10",
              colorInput: "#161a1d",
              colorPrimaryForeground: "#000000",
              colorForeground: "#e1e3e4",
            },
            elements: {
              card: "border border-orange-500/20 shadow-2xl shadow-orange-900/20 bg-[#0c0f10]",
              socialButtonsBlockButton: "bg-orange-500 hover:bg-orange-600 border-none transition-all",
              socialButtonsBlockButtonText: "text-white font-bold",
              dividerLine: "bg-slate-800",
              dividerText: "text-slate-500",
              formFieldInput: "bg-[#161a1d] border-slate-800 focus:border-orange-500 text-white",
              formFieldLabel: "text-slate-300",
              footerActionLink: "text-orange-500 hover:text-orange-400 font-semibold",
              identityPreviewText: "text-white",
              identityPreviewEditButtonIcon: "text-orange-500"
            }
          }}
        >
          <AuthProvider>
            <LanguageProvider>
              <GenerationProvider>
                {children}
              </GenerationProvider>
            </LanguageProvider>
          </AuthProvider>
        </ClerkProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}