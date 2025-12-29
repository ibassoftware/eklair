"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BucketSidebar } from "@/components/bucket-sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function LeadsPage() {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Influencer Leads</h1>
              <p className="text-gray-600">Manage your saved influencers and track outreach progress</p>
            </div>
            <BucketSidebar />
          </div>
        </div>
        <Footer />
      </div>
    </TooltipProvider>
  )
}
