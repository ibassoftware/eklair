"use client"

import { useState, useEffect } from 'react'
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { leadsStorage, searchHistoryStorage } from "@/lib/storage"
import { LeadsInfluencer, SearchHistory } from "@/types/tiktok"
import { formatNumber } from "@/lib/calculations"
import { 
  FolderOpen, Search, Users, ThumbsUp, Clock, TrendingUp, 
  ArrowUpRight, Star, CheckCircle, MessageCircle, Share2, 
  Download, Plus, Target, Activity, Zap 
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [leads, setLeads] = useState<LeadsInfluencer[]>([])
  const [history, setHistory] = useState<SearchHistory[]>([])

  useEffect(() => {
    loadData()

    const handleLeadsUpdate = () => {
      setLeads(leadsStorage.getAll())
    }

    window.addEventListener('bucket-updated', handleLeadsUpdate)

    return () => {
      window.removeEventListener('bucket-updated', handleLeadsUpdate)
    }
  }, [])

  const loadData = async () => {
    setLeads(leadsStorage.getAll())
    const historyData = await searchHistoryStorage.getAll()
    setHistory(historyData)
  }

  const getLeadsStateCount = (state?: string) => {
    return state
      ? leads.filter(item => item.state === state).length
      : leads.length
  }

  const getTopInfluencers = () => {
    return [...leads]
      .sort((a, b) => b.video.authorStats.followerCount - a.video.authorStats.followerCount)
      .slice(0, 5)
  }

  const getRecentSearches = () => {
    return [...history]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5)
  }

  const getEngagementRate = (video: any) => {
    if (!video.stats.playCount) return 0
    return ((video.stats.diggCount / video.stats.playCount) * 100).toFixed(1)
  }

  const topInfluencers = getTopInfluencers()
  const recentSearches = getRecentSearches()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Overview of your influencer search and campaign management</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Link href="/search">
              <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Search className="w-6 h-6 text-blue-900" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">New Search</h3>
                      <p className="text-sm text-gray-600">Find influencers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/leads">
              <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
                      <FolderOpen className="w-6 h-6 text-pink-700" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">View Leads</h3>
                      <p className="text-sm text-gray-600">Manage influencers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/history">
              <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-amber-700" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">History</h3>
                      <p className="text-sm text-gray-600">Past searches</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <Download className="w-6 h-6 text-green-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Export Data</h3>
                    <p className="text-sm text-gray-600">Download reports</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white border-gray-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-blue-900" />
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    Total
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{getLeadsStateCount()}</div>
                <div className="text-sm text-gray-600">Influencers in Leads</div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                    <Target className="w-5 h-5 text-cyan-700" />
                  </div>
                  <Badge className="bg-cyan-100 text-cyan-800 border-cyan-200">
                    To Reach Out
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{getLeadsStateCount('to reach out')}</div>
                <div className="text-sm text-gray-600">Pending outreach</div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-amber-700" />
                  </div>
                  <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                    In Progress
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{getLeadsStateCount('in progress')}</div>
                <div className="text-sm text-gray-600">Active campaigns</div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-700" />
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Done
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{getLeadsStateCount('done')}</div>
                <div className="text-sm text-gray-600">Completed campaigns</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Top Influencers */}
            <Card className="bg-white border-gray-200 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Star className="w-5 h-5 text-yellow-600" />
                    Top Influencers
                  </CardTitle>
                  <Link href="/leads">
                    <Button variant="ghost" size="sm" className="text-blue-900 hover:text-blue-700">
                      View All <ArrowUpRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {topInfluencers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No influencers in leads yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topInfluencers.map((item, idx) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200 hover:border-blue-300 transition-colors"
                      >
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center text-white text-xs font-bold">
                          {idx + 1}
                        </div>
                        <Avatar className="h-10 w-10 ring-2 ring-blue-900/30">
                          <AvatarImage src={item.video.author.avatarMedium} alt={item.video.author.nickname} />
                          <AvatarFallback className="bg-blue-900 text-white text-xs">
                            {item.video.author.nickname.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm truncate">{item.video.author.nickname}</h4>
                          <div className="flex items-center gap-3 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {formatNumber(item.video.authorStats.followerCount)}
                            </span>
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3" />
                              {formatNumber(item.video.stats.diggCount)}
                            </span>
                          </div>
                        </div>
                        <Badge className={`text-xs ${
                          item.state === 'to reach out' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          item.state === 'in progress' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                          'bg-green-100 text-green-800 border-green-200'
                        }`}>
                          {item.state}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Searches */}
            <Card className="bg-white border-gray-200 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Clock className="w-5 h-5 text-amber-600" />
                    Recent Searches
                  </CardTitle>
                  <Link href="/history">
                    <Button variant="ghost" size="sm" className="text-blue-900 hover:text-blue-700">
                      View All <ArrowUpRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {recentSearches.length === 0 ? (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No search history yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentSearches.map((item, idx) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200 hover:border-blue-300 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Search className="w-5 h-5 text-blue-900" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm truncate">"{item.keyword}"</h4>
                          <div className="flex items-center gap-3 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {item.resultCount || 0} results
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(item.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Link href={`/search?q=${encodeURIComponent(item.keyword)}`}>
                          <Button variant="ghost" size="sm" className="h-8 hover:bg-blue-50">
                            <ArrowUpRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <Card className="bg-white border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Zap className="w-5 h-5 text-yellow-600" />
                Quick Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-100">
                  <div className="text-2xl font-bold text-blue-900">{history.length}</div>
                  <div className="text-sm text-gray-600">Total Searches</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-pink-50 border border-pink-100">
                  <div className="text-2xl font-bold text-pink-900">
                    {history.reduce((acc, item) => acc + (item.resultCount || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Results Found</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-cyan-50 border border-cyan-100">
                  <div className="text-2xl font-bold text-cyan-900">
                    {leads.reduce((acc, item) => acc + item.video.authorStats.followerCount, 0) > 0
                      ? formatNumber(leads.reduce((acc, item) => acc + item.video.authorStats.followerCount, 0))
                      : '0'}
                  </div>
                  <div className="text-sm text-gray-600">Total Followers</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-50 border border-green-100">
                  <div className="text-2xl font-bold text-green-900">
                    {leads.length > 0
                      ? ((leads.filter(i => i.state === 'done').length / leads.length) * 100).toFixed(0)
                      : '0'}%
                  </div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}
