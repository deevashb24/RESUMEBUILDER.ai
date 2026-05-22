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
        <link rel="icon" type="image/png" href="data:image/png;base64,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u1KLvxLwaxOeOcVly5atXLVywfz55z86744dHR3ff/ChkZELa666uv9k/9TUVE/Pmiuu7Ok/1a8gGn3d85mRL8x8Yapa37i888u9lx7qn5ScJeLTNq4Vy234IB4fH9++/c6dOx8cGBg4dfr0zod+iHqwJYODQ3Pnzl22bOnJk/0gUFilwt0zR+CDpLOzc3h4eM6czqVLl7z77ns/eGjnDTdcPzEx/spf9//ut4+hneVSubOzY3R05More+659767tt95ydy5X9y29dprN3332/tXr1594cKFiYnJSy6dVy4WxkYv1KroSLF7fvmD0do0nl/cR25POChkNUKOnrpCYfbs2W+99fYjj/zyyad27djxza1bt01PTz766GN3331XV1fXG6+/3r1yxQt/fqG3txc1rF27dlZHBX0dOHP2itWrf/TjnzzwwPewgS/t3QesBw4cOHd+eNnSZQ//7Of79u69au3VKL67e8XfXnttdGTkK1/76o777pucmDhy5Mg37rr7ttu//sGHQ3tffHHHjm+dPtX/i4d/enrg7Hdu7Lpl7dzhkamXj41vWDW7+I+PBJs4VQr/SUUEJWFNTU1v2LD+8cd/3/dG3+abbhobHa3WarfeeitwnBs+9/6Jk4sWLqrM4gKBSdu16w8LuxY+v+dP2L3bb7/tuuuue/vtI9tuvnnBggW969et710/PHxu0aLFpUp5VkcHWoACMGblSvmO7dv/+NST+17at2BB1x13bj9x4v1FixZt3rwFmH7z618NDA3XipWB89VDJyZ6lnZsWtXZVZmu2g2Bs6Ozjn/4ibD5buOESTh27Dg2YemSxWPj45AePfrOqVOnj71zbN26q++99x4A6l3Xu6ZnDcYMXmdOD+Bc9p86NV2tovjR0dHj7xwfODOwYePGw4fffPPwm/fff/+ZM2c2bNiAcR8aHAI+bF25VBofG79s1eXz589HE8fGRocGB0/8+31kX7Fi5ZF/Hbt+1ewlcys7buw69N4o5mcWfQAQi1AxkDjs+CljYCiIC9OMARgbG3viiV2bt2zZvXv3xmuuWb58+Z49z23adO1ll39mz57n9+9/5Quf/9zg0Ad9hw9PTk4dPHgQnfv7wYPd3cufeeZZSLZs2XLo0Otnz57dtGlTT0/Prid2vfraAYzi2cHBw319k1OTR4/+E3fB3U8/vW3rNuTq6+t77tlnbv7SLbhxvfrqAczey/tf+ezqzssWzDr+YbW7q/P0uerh/vGxaukv747zpsQnCkrg7BQXLlwYwYcTiXsoyiyVytgSu3vAAASumPWJiQk0DHdGU8ESNBKXyyWzgTu6ODk5WeG9Ercj+kJbLlWwQ3iDO/55jx99anXcp9FK5IINWswI1lfEx9ZzKPjnT94FQeHGQ+8486qgoYBcJWG3UKV8UtZpuEAL1q7GWhwiYafwkIW/mgaC2TkEJA2BEJsLPaCJGdlliChsvaAJT2IL3NIqpzIELhQrhHI21uLwSUOef2kTZojRVtDsJhaGOHy3Mp4ivKgLDYIFotheWGX0yxZMwyFu7mhmJSoxsAeZIEQj03pVEEMSWYEAWn6NxKdWnj0sdwFgTqfsrdfmawYxQ6xZcSiM29JwFzLrRs/YjBipSQtFKCanokLttCHghoSZAGAVoobjgr8zA0+oiZ12UgOkDlgQXi1bbGCLAiLUT+2dwIGQKTlUOKfsJ0VkVBR5kpYTuwGCRcFBhUvOALKwYiQrVNJyaRCrd8LscqwJ211hbCrsQKSJNm4R90U14AzAlHck8CxAjvo/Bty+wCOW1YGoLCJb4Bo+CyGB5YhZaeo0CNcaYZHMIJWYHBL3zRx5BkKnBUbFqDiANxf+cUA2LJKU94McFsuxYvBMDCIzFeNAXZWTmNyvLaE3aw0GNkKQNSSaDsIGpvBfOUjilxkp5HxZ21QUo1qcsBX1xu8DlnVmQLBpNjDH3DVkSqSZY/hOxjIAFIufmtVYfn0HzyKo0YzRAMtGC0FiDTT4Px7iDK7SO2vdtYMoNFSz7eyu3nmzDSVSgIJYFA8JK7X6JAbd8JWyuWd0udiC10Ud3cAJ1QM09gdD5cAOsAxgBlT+CrFuuDgWOhkEz2phiBK5T9kOILSC0iKlyTctwwF7B+QmrjJJyrqxJ1IqdljjAw9oVAQVJFQD5eq8zgt7L47341iAh7asSQIWY4FN1WyQynNxZjaWNqTKHIlPv8CPzFYPRfZjexBqgDI8B1LEKSDQM6jaaVOXdjQQu8po1aBmETmBaw8Ih+OiTeJWqIToG2+jtPpky1sYQ18kXM4sZVmPNZ9DFO9K4emQGlIbHmSezZrhbDNhQBHGidQmFz5VzUx7XidgrxTsvOaINeG7A7YibhPryw6xOZitgaO9uYZYrdmWxu6YhjUaVyw3cHcIU5o2fna5DxwojQ8JUeRCAamn0+2KgRtWO627O+FYU0fQOYMWrJ1bcwvomdctoWn4MOeZnMiljKGy/uUMENp9LZOz7uvEDKoUYnOc1DHsQCpKaST7FNnmaF6MIU5zOe3FmCTHfgpPYgeRIzxTTm5ss7YZMSzdDFrQzpoKbHaIU5175oK2Yw2TXy2UG1s0Z5u1MDCtY2jJevxUmx1iOEPh13ZBDY1rnTVJisBpqHyZ0BBA6DYugTDFZ45u5nGcYAFpUKsBwjRiyuZiOZvap7RlMokbe1LXtlOZQe6aGmcjBCNP7IQn8BA5Vc4g1YJGplQyQ4pUZTHdN4VrMc3ArqEAS5OaulGKwAzaGXtK+HooFzqRatPgntF8c6pcUtf+B81v/H+D4i2RAAAAAElFTkSuQmCC" />
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
              socialButtonsBlockButton: "!bg-[#ff8a00] hover:!bg-[#e67a00] !border-none transition-all",
              socialButtonsBlockButtonText: "!text-white !font-bold",
              dividerLine: "!bg-slate-800",
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