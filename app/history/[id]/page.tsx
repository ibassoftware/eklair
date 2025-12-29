"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AddToBucketDialog } from "@/components/add-to-bucket-dialog"
import { FilterSidebar } from "@/components/filter-sidebar"
import { calculateQualityScore, formatNumber } from "@/lib/calculations"
import { SearchHistory, TikTokVideo } from "@/types/tiktok"
import { ExternalLink, Users, ThumbsUp, CheckCircle, MessageCircle, Share2, Eye, BarChart3, ArrowLeft } from 'lucide-react'
import { searchHistoryStorage } from '@/lib/storage'

export default function HistoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [historyItem, setHistoryItem] = useState<SearchHistory | null>(null)
  const [loading, setLoading] = useState(true)
  const [displayedVideos, setDisplayedVideos] = useState<TikTokVideo[]>([])

  interface Filters {
    minFollowers: number
    minEngagement: number
    verifiedOnly: boolean
    qualityLevels: ('High' | 'Medium' | 'Low')[]
  }

  const [filters, setFilters] = useState<Filters>({
    minFollowers: 0,
    minEngagement: 0,
    verifiedOnly: false,
    qualityLevels: ['High', 'Medium', 'Low']
  })

  useEffect(() => {
    const loadHistoryItem = async () => {
      const id = params.id as string
      const item = await searchHistoryStorage.getById(id)
      setHistoryItem(item)
      setLoading(false)
    }
    loadHistoryItem()
  }, [params.id])

  useEffect(() => {
    if (historyItem) {
      applyFilters(historyItem.results)
    }
  }, [filters, historyItem])

  const applyFilters = (videos: TikTokVideo[]) => {
    let filtered = [...videos]

    if (filters.minFollowers > 0) {
      filtered = filtered.filter(v => v.authorStats.followerCount >= filters.minFollowers)
    }
    
    if (filters.minEngagement > 0) {
      filtered = filtered.filter(v => {
        const engagement = (v.stats.diggCount / v.stats.playCount) * 100
        return engagement >= filters.minEngagement
      })
    }
    
    if (filters.verifiedOnly) {
      filtered = filtered.filter(v => v.author.verified)
    }
    
    if (filters.qualityLevels.length < 3) {
      filtered = filtered.filter(v => {
        const quality = calculateQualityScore(v)
        return filters.qualityLevels.includes(quality.level)
      })
    }

    setDisplayedVideos(filtered)
  }

  if (loading) {
    return (
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="container mx-auto px-4 py-12">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-900 border-t-transparent"></div>
              <p className="text-gray-600 mt-4">Loading...</p>
            </div>
          </div>
        </div>
      </TooltipProvider>
    )
  }

  if (!historyItem) {
    return (
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="container mx-auto px-4 py-12">
            <Card className="bg-white border-gray-200">
              <CardContent className="p-12 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">History item not found</h3>
                <Button onClick={() => router.push('/history')} className="mt-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to History
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </TooltipProvider>
    )
  }

  const qualityColors = {
    High: 'bg-green-600',
    Medium: 'bg-yellow-600',
    Low: 'bg-red-600',
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Button
                onClick={() => router.push('/history')}
                variant="ghost"
                className="mb-4 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to History
              </Button>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                "{historyItem.keyword}"
              </h1>
              <p className="text-gray-600">
                {historyItem.resultCount || 0} results • {new Date(historyItem.timestamp).toLocaleDateString()}
              </p>
            </div>

            <div className="flex gap-8">
              {/* Sidebar with Filters */}
              <div className="hidden lg:block w-80">
                <FilterSidebar onFilterChange={setFilters} />
              </div>

              {/* Results Grid */}
              <div className="flex-1">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {displayedVideos.map((video) => {
                    const quality = calculateQualityScore(video)

                    return (
                      <Card
                        key={video.id}
                        className="group bg-white border-gray-200 overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-900/10"
                      >
                        <div className="relative">
                          <div className="aspect-[9/16] bg-gray-100 overflow-hidden">
                            <img
                              src={video.video.cover}
                              alt={video.desc}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          </div>
                          <div className="absolute top-4 right-4">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge className={`${qualityColors[quality.level]} text-white border-0 font-bold px-3 py-1 shadow-lg cursor-help`}>
                                  {quality.level}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent side="left">
                                <div className="space-y-1 text-xs">
                                  <p>• Score: {quality.score}/100</p>
                                  <p>• Engagement: {quality.engagementRate.toFixed(1)}%</p>
                                  <p>• Verified: {quality.verified ? 'Yes' : 'No'}</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          {video.author.verified && (
                            <div className="absolute top-4 left-4">
                              <div className="flex items-center gap-1.5 bg-blue-600/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                                <CheckCircle className="w-4 h-4 text-white" />
                                <span className="text-white font-semibold text-xs">Verified</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <CardContent className="p-5">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="relative">
                              <Avatar className="h-12 w-12 ring-2 ring-blue-900/50">
                                <AvatarImage src={video.author.avatarMedium} alt={video.author.nickname} />
                                <AvatarFallback className="bg-blue-900 text-white font-bold">
                                  {video.author.nickname.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 text-lg truncate group-hover:text-blue-900 transition-colors">
                                {video.author.nickname}
                              </h3>
                              <p className="text-gray-500 text-sm line-clamp-2">{video.desc}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                              <Users className="w-5 h-5 text-blue-900" />
                              <div>
                                <div className="text-gray-500 text-xs">Subscribers</div>
                                <div className="text-gray-900 font-bold">{formatNumber(video.authorStats.followerCount)}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                              <ThumbsUp className="w-5 h-5 text-pink-600" />
                              <div>
                                <div className="text-gray-500 text-xs">Video Likes</div>
                                <div className="text-gray-900 font-bold">{formatNumber(video.stats.diggCount)}</div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500 text-sm flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-blue-900" />
                                Engagement Rate
                              </span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="font-bold text-gray-900 cursor-help border-b border-dashed border-gray-400">
                                    {quality.engagementRate.toFixed(1)}%
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                  <p className="text-xs">Likes / Plays × 100</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <Progress
                              value={quality.engagementRate * 10}
                              className="h-2"
                            />
                          </div>

                          {/* Additional Stats */}
                          <div className="grid grid-cols-3 gap-2 mb-4">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="text-center bg-white border border-gray-200 rounded-lg p-2 shadow-sm cursor-help">
                                  <Eye className="w-4 h-4 text-blue-700 mx-auto mb-1" />
                                  <div className="text-gray-600 text-xs">Plays</div>
                                  <div className="text-gray-900 font-semibold text-sm">{formatNumber(video.stats.playCount)}</div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p className="text-xs">Total video views</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="text-center bg-white border border-gray-200 rounded-lg p-2 shadow-sm cursor-help">
                                  <MessageCircle className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                                  <div className="text-gray-600 text-xs">Comments</div>
                                  <div className="text-gray-900 font-semibold text-sm">{formatNumber(video.stats.commentCount)}</div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p className="text-xs">Video comments</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="text-center bg-white border border-gray-200 rounded-lg p-2 shadow-sm cursor-help">
                                  <Share2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                                  <div className="text-gray-600 text-xs">Shares</div>
                                  <div className="text-gray-900 font-semibold text-sm">{formatNumber(video.stats.shareCount)}</div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p className="text-xs">Video shares</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="text-center bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
                              <div className="text-gray-600 text-xs">Videos</div>
                              <div className="text-gray-900 font-semibold">{video.authorStats.videoCount}</div>
                            </div>
                            <div className="text-center bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
                              <div className="text-gray-600 text-xs">Total Hearts</div>
                              <div className="text-gray-900 font-semibold">{formatNumber(video.authorStats.heartCount)}</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <AddToBucketDialog video={video} />
                            <Button
                              variant="outline"
                              className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400"
                              onClick={() => window.open(`https://www.tiktok.com/@${video.author.uniqueId}/video/${video.id}`, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </TooltipProvider>
  )
}
