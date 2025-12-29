"use client"

import { useState, useEffect } from 'react'
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { searchHistoryStorage } from "@/lib/storage"
import { SearchHistory } from "@/types/tiktok"
import { History, Trash2, Search, Clock, ExternalLink, Calendar, TrendingUp, Users, ThumbsUp } from 'lucide-react'
import { formatNumber } from '@/lib/calculations'

export default function HistoryPage() {
  const [history, setHistory] = useState<SearchHistory[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    const stored = await searchHistoryStorage.getAll()
    setHistory(stored)
  }

  const handleDelete = async (id: string) => {
    await searchHistoryStorage.remove(id)
    loadHistory()
  }

  const handleClearAll = async () => {
    await searchHistoryStorage.clear()
    loadHistory()
  }

  const handleSearch = (keyword: string) => {
    // Navigate to home page with the search query
    window.location.href = `/?q=${encodeURIComponent(keyword)}`
  }

  const filteredHistory = history.filter(item =>
    item.keyword.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Search History</h1>
              <p className="text-gray-600">View and manage your past searches and saved results</p>
            </div>

            {/* Search and Actions */}
            <Card className="bg-white border-gray-200 shadow-md mb-8">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Search history..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  {history.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={handleClearAll}
                      className="border-red-500/50 text-red-600 hover:bg-red-500/10 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* History List */}
            {filteredHistory.length === 0 ? (
              <Card className="bg-white border-gray-200">
                <CardContent className="p-12 text-center">
                  <History className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No search history yet</h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery ? 'No results match your search query' : 'Start searching for influencers to build your history'}
                  </p>
                  <Button
                    onClick={() => window.location.href = '/'}
                    className="bg-blue-900 hover:bg-blue-800"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Start Searching
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredHistory.map((item) => (
                  <Card
                    key={item.id}
                    className="bg-white border-gray-200 hover:border-blue-900/50 transition-all duration-300"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-900/10 flex items-center justify-center">
                              <Search className="w-5 h-5 text-blue-900" />
                            </div>
                            <div className="flex-1">
                              <h3
                                className="font-bold text-gray-900 text-lg hover:text-blue-900 transition-colors cursor-pointer"
                                onClick={() => window.location.href = `/history/${item.id}`}
                              >
                                "{item.keyword}"
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDate(item.timestamp)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(item.timestamp).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  {item.resultCount || 0} results
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Preview of top results */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                            {item.results.slice(0, 3).map((video, idx) => (
                              <div
                                key={`${item.id}-${idx}`}
                                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200"
                              >
                                <Avatar className="h-10 w-10 ring-2 ring-blue-900/30">
                                  <AvatarImage src={video.author.avatarMedium} alt={video.author.nickname} />
                                  <AvatarFallback className="bg-blue-900 text-white text-xs">
                                    {video.author.nickname.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-900 text-sm truncate">{video.author.nickname}</h4>
                                  <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <span className="flex items-center gap-1">
                                      <Users className="w-3 h-3" />
                                      {formatNumber(video.authorStats.followerCount)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <ThumbsUp className="w-3 h-3" />
                                      {formatNumber(video.stats.diggCount)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center gap-3">
                            <Button
                              onClick={() => handleSearch(item.keyword)}
                              className="bg-blue-900 hover:bg-blue-800 text-white shadow-sm"
                            >
                              <Search className="w-4 h-4 mr-2" />
                              Search Again
                            </Button>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(`https://www.tiktok.com/search?q=${encodeURIComponent(item.keyword)}`, '_blank')}
                                  className="border-blue-200 text-blue-800 hover:bg-blue-50 hover:border-blue-300"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Search on TikTok</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          className="text-gray-600 hover:text-red-600 hover:bg-red-500/10 h-fit"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Stats */}
            {history.length > 0 && (
              <Card className="bg-white border-gray-200 mt-8">
                <CardHeader>
                  <CardTitle className="text-lg">History Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-lg bg-gray-50">
                      <div className="text-3xl font-bold text-blue-900">{history.length}</div>
                      <div className="text-sm text-gray-600 mt-1">Total Searches</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-gray-50">
                      <div className="text-3xl font-bold text-pink-600">
                        {history.reduce((acc, item) => acc + (item.resultCount || 0), 0)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Total Results</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-gray-50">
                      <div className="text-3xl font-bold text-blue-600">
                        {new Set(history.flatMap(h => h.results.map(r => r.author.uniqueId))).size}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Unique Influencers</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-gray-50">
                      <div className="text-3xl font-bold text-green-600">
                        {new Set(history.map(h => h.keyword)).size}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Unique Keywords</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </TooltipProvider>
  )
}
