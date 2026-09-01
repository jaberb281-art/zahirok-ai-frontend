import type { Metadata } from "next"
import { Sora, Manrope } from "next/font/google"
import { Suspense } from "react"
import "./globals.css"
import { EarlyAccessProvider } from "@/components/early-access/early-access-provider"
import { AppShell } from "@/components/layout/app-shell"

const displayFont = Sora({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
})

const bodyFont = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Soroz AI — The Sound of Balochistan, Generated",
  description:
    "Create and discover Balochi music powered by AI. Traditional instruments, native vocal style, multiple dialects.",
  icons: {
    icon: "/logo/logo.png",
    apple: "/logo/logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      dir="ltr"
      data-scroll-behavior="smooth"
      className={`${displayFont.variable} ${bodyFont.variable}`}
    >
      <body>
        <Suspense fallback={null}>
          <EarlyAccessProvider>
            <AppShell>{children}</AppShell>
          </EarlyAccessProvider>
        </Suspense>
      </body>
    </html>
  )
}
