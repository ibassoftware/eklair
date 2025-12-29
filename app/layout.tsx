import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Eklair Influencer Search - TikTok Influencer Platform",
  description: "Discover, analyze, and connect with top TikTok influencers for your marketing campaigns. Advanced search with engagement metrics and quality scoring.",
  keywords: ["TikTok", "influencer", "marketing", "search", "social media"],
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
