"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FilterSidebar } from "@/components/filter-sidebar"
import { AddToBucketDialog } from "@/components/add-to-bucket-dialog"
import { calculateQualityScore, formatNumber } from "@/lib/calculations"
import { searchHistoryStorage } from "@/lib/storage"
import { searchVideos } from "@/lib/api-client"
import { Search, ExternalLink, Users, ThumbsUp, CheckCircle, MessageCircle, Share2, Eye, BarChart3, Filter, X, ArrowUpDown, ChevronDown } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { TikTokVideo, SearchHistory } from '@/types/tiktok'

interface Filters {
  minFollowers: number
  minEngagement: number
  verifiedOnly: boolean
  qualityLevels: ('High' | 'Medium' | 'Low')[]
}

export default function Home() {
  const searchParams = useSearchParams()
  const queryParam = searchParams.get('q')
  
  const [searchQuery, setSearchQuery] = useState(queryParam || '')
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    minFollowers: 0,
    minEngagement: 0,
    verifiedOnly: false,
    qualityLevels: ['High', 'Medium', 'Low']
  })
  const [sortOption, setSortOption] = useState<'relevance' | 'likes' | 'followers' | 'engagement'>('relevance')
  const [searchResults, setSearchResults] = useState<TikTokVideo[]>([])
  const [displayedVideos, setDisplayedVideos] = useState<TikTokVideo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [cursor, setCursor] = useState(0)
  const [searchId, setSearchId] = useState('0')
  const [searchDepth, setSearchDepth] = useState(1)

  useEffect(() => {
    if (queryParam) {
      handleSearch(queryParam)
    }
  }, [queryParam])

  useEffect(() => {
    const loadHistory = async () => {
      const history = await searchHistoryStorage.getAll()
      setSearchHistory(history.slice(0, 5)) // Show last 5 searches
    }
    loadHistory()
  }, [])

  const handleSearch = async (query: string, isLoadMore: boolean = false) => {
    if (!query.trim()) {
      return
    }
    
    if (isLoadMore) {
      setIsLoadingMore(true)
    } else {
      setIsLoading(true)
      setCursor(0)
      setSearchId('0')
    }
    
    if (!isLoadMore) {
      setSearchQuery(query)
    }
    
    try {
      let allVideos: TikTokVideo[] = []
      let currentCursor = isLoadMore ? cursor : 0
      let currentSearchId = isLoadMore ? searchId : '0'
      let hasMorePages = true
      let pagesFetched = 0
      const maxPages = isLoadMore ? 1 : searchDepth
      
      // Fetch multiple pages based on search depth
      while (hasMorePages && pagesFetched < maxPages) {
        const response = await searchVideos(query, currentCursor, currentSearchId)
        
        const videos = response.item_list || []
        allVideos = [...allVideos, ...videos]
        
        // Update pagination state
        hasMorePages = response.has_more || false
        if (response.extra?.logid) {
          currentSearchId = response.extra.logid
        }
        // Update cursor from API response
        if (response.cursor !== undefined) {
          currentCursor = response.cursor
        }
        
        pagesFetched++
        
        // Add small delay between pages to avoid rate limiting
        if (hasMorePages && pagesFetched < maxPages) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }
      
      
      // Update pagination state
      setHasMore(hasMorePages)
      setSearchId(currentSearchId)
      setCursor(currentCursor)
      
      if (isLoadMore) {
        // Append new videos to existing results
        setSearchResults(prev => [...prev, ...allVideos])
        // Apply filters to all results
        applyFiltersAndSort([...searchResults, ...allVideos])
      } else {
        // Replace results with new search
        setSearchResults(allVideos)
        // Apply filters to the new results
        applyFiltersAndSort(allVideos)
        
        // Save to history only for new searches
        const historyItem = {
          id: `search-${Date.now()}`,
          keyword: query,
          results: allVideos,
          timestamp: Date.now(),
          resultCount: allVideos.length
        }
        await searchHistoryStorage.add(historyItem)
      }
      
    } catch (error) {
      console.error('[Search] API error:', error)
      // Don't fallback to mock data - show error to user
      setSearchResults([])
      setDisplayedVideos([])
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters)
  }

  const handleLoadMore = () => {
    if (!searchQuery || isLoadingMore || !hasMore) return
    handleSearch(searchQuery, true)
  }

  const applyFiltersAndSort = (videos = searchResults) => {
    let filtered = [...videos]

    // Apply filters
    if (filters.minFollowers > 0) {
      const before = filtered.length
      filtered = filtered.filter(v => v.authorStats.followerCount >= filters.minFollowers)
    }
    
    if (filters.minEngagement > 0) {
      const before = filtered.length
      filtered = filtered.filter(v => {
        const engagement = (v.stats.diggCount / v.stats.playCount) * 100
        return engagement >= filters.minEngagement
      })
    }
    
    if (filters.verifiedOnly) {
      const before = filtered.length
      filtered = filtered.filter(v => v.author.verified)
    }
    
    if (filters.qualityLevels.length < 3) {
      const before = filtered.length
      filtered = filtered.filter(v => {
        const quality = calculateQualityScore(v)
        return filters.qualityLevels.includes(quality.level)
      })
    }

    
    // Apply sorting
    switch (sortOption) {
      case 'likes':
        filtered.sort((a, b) => b.stats.diggCount - a.stats.diggCount)
        break
      case 'followers':
        filtered.sort((a, b) => b.authorStats.followerCount - a.authorStats.followerCount)
        break
      case 'engagement':
        filtered.sort((a, b) => {
          const engagementA = (a.stats.diggCount / a.stats.playCount) * 100
          const engagementB = (b.stats.diggCount / b.stats.playCount) * 100
          return engagementB - engagementA
        })
        break
      default:
        // relevance - keep original order
        break
    }

    setDisplayedVideos(filtered)
  }

  useEffect(() => {
    applyFiltersAndSort()
  }, [filters, sortOption])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery)
    }
  }

  const handleHistoryClick = (keyword: string) => {
    setSearchQuery(keyword)
    handleSearch(keyword)
    setShowHistory(false)
  }

  const clearFilters = () => {
    const resetFilters: Filters = {
      minFollowers: 0,
      minEngagement: 0,
      verifiedOnly: false,
      qualityLevels: ['High', 'Medium', 'Low']
    }
    setFilters(resetFilters)
    setSortOption('relevance')
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.minFollowers > 0) count++
    if (filters.minEngagement > 0) count++
    if (filters.verifiedOnly) count++
    if (filters.qualityLevels.length < 3) count++
    if (sortOption !== 'relevance') count++
    return count
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="flex gap-8">
            {/* Sidebar with Filters */}
            <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto transition-transform duration-300 z-40 ${showFilters ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:relative lg:top-0 lg:h-auto lg:border-0 lg:bg-transparent lg:p-0`}>
              <FilterSidebar onFilterChange={handleFilterChange} />
            </div>

            {/* Main Content */}
            <div className="flex-1 lg:ml-0 ml-80">
              <div className="max-w-3xl mx-auto mb-6">
                <Card className="bg-white border-gray-200 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex gap-2 mb-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          placeholder="Search influencers by keyword..."
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value)
                            setShowHistory(e.target.value.length > 0)
                          }}
                          onFocus={() => setShowHistory(searchQuery.length > 0)}
                          onBlur={() => setTimeout(() => setShowHistory(false), 200)}
                          onKeyDown={handleKeyDown}
                          className="pl-12 bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 h-14 text-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                        {showHistory && searchHistory.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                            {searchHistory.map((item) => (
                              <button
                                key={item.id}
                                onClick={() => handleHistoryClick(item.keyword)}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 flex items-center gap-3"
                              >
                                <Search className="w-4 h-4 text-gray-400" />
                                <div className="flex-1">
                                  <div className="text-gray-900 font-medium">{item.keyword}</div>
                                  <div className="text-gray-500 text-xs">{item.resultCount} results</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={() => handleSearch(searchQuery)}
                        className="h-14 px-8 bg-blue-900 hover:bg-blue-800 text-white font-semibold text-lg shadow-md lg:hidden"
                      >
                        <Search className="w-5 h-5" />
                      </Button>
                      <Button
                        onClick={() => handleSearch(searchQuery)}
                        className="h-14 px-8 bg-blue-900 hover:bg-blue-800 text-white font-semibold text-lg shadow-md hidden lg:flex"
                      >
                        Search
                      </Button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">Search Depth:</span>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((depth) => (
                          <Button
                            key={depth}
                            variant={searchDepth === depth ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSearchDepth(depth)}
                            className={searchDepth === depth
                              ? "bg-blue-900 hover:bg-blue-800 text-white shadow-sm"
                              : "border-gray-300 bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-300"
                            }
                          >
                            {depth} page{depth > 1 ? 's' : ''}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Active Filters & Sort */}
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
                
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-gray-400" />
                  <Select value={sortOption} onValueChange={(v) => setSortOption(v as any)}>
                    <SelectTrigger className="h-9 w-40 bg-white border-gray-300 text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="likes">Most Likes</SelectItem>
                      <SelectItem value="followers">Most Subscribers</SelectItem>
                      <SelectItem value="engagement">Engagement Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {getActiveFilterCount() > 0 && (
                  <>
                    <div className="flex items-center gap-2 ml-auto">
                      <span className="text-sm text-gray-600">
                        {getActiveFilterCount()} active filter{getActiveFilterCount() > 1 ? 's' : ''}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-gray-600 hover:text-red-600"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Clear All
                      </Button>
                    </div>
                  </>
                )}
              </div>

              {/* Active Filter Badges */}
              {getActiveFilterCount() > 0 && (
                <div className="mb-6 flex flex-wrap gap-2">
                  {filters.minFollowers > 0 && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                      Min Followers: {formatNumber(filters.minFollowers)}
                      <button onClick={() => handleFilterChange({ ...filters, minFollowers: 0 })} className="ml-2 hover:text-blue-900">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.minEngagement > 0 && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                      Min Engagement: {filters.minEngagement}%
                      <button onClick={() => handleFilterChange({ ...filters, minEngagement: 0 })} className="ml-2 hover:text-blue-900">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.verifiedOnly && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                      Verified Only
                      <button onClick={() => handleFilterChange({ ...filters, verifiedOnly: false })} className="ml-2 hover:text-blue-900">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.qualityLevels.length < 3 && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                      Quality: {filters.qualityLevels.join(', ')}
                      <button onClick={() => handleFilterChange({ ...filters, qualityLevels: ['High', 'Medium', 'Low'] })} className="ml-2 hover:text-blue-900">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {sortOption !== 'relevance' && (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800 border-gray-200">
                      Sort: {sortOption}
                      <button onClick={() => setSortOption('relevance')} className="ml-2 hover:text-gray-900">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              )}

              {/* Results */}
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-900 border-t-transparent"></div>
                  <p className="text-gray-600 mt-4">Searching...</p>
                </div>
              ) : displayedVideos.length === 0 ? (
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-12 text-center">
                    <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
                    <p className="text-gray-600 mb-6">
                      {searchQuery ? 'Try adjusting your filters or search terms' : 'Enter a keyword to search for influencers'}
                    </p>
                    {getActiveFilterCount() > 0 && (
                      <Button onClick={clearFilters} variant="outline">
                        Clear Filters
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-gray-600 text-sm">
                      Showing {displayedVideos.length} result{displayedVideos.length !== 1 ? 's' : ''}
                      {searchQuery && ` for "${searchQuery}"`}
                    </p>
                  </div>

                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {displayedVideos.map((video) => {
                      const quality = calculateQualityScore(video)
                      const qualityColors = {
                        High: 'bg-green-600',
                        Medium: 'bg-yellow-600',
                        Low: 'bg-red-600',
                      }

                      return (
                        <Card
                          key={video.id}
                          className={`group bg-white border-gray-200 overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-900/10 ${
                            hoveredCard === video.id ? 'ring-2 ring-blue-900' : ''
                          }`}
                          onMouseEnter={() => setHoveredCard(video.id)}
                          onMouseLeave={() => setHoveredCard(null)}
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
                                <a
                                  href={`https://www.tiktok.com/@${video.author.uniqueId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-bold text-gray-900 text-lg truncate group-hover:text-blue-900 transition-colors hover:underline"
                                >
                                  {video.author.nickname}
                                </a>
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
                                <span className="text-gray-600 text-sm flex items-center gap-2">
                                  <BarChart3 className="w-4 h-4 text-blue-700" />
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
                                  <div className="text-center bg-gradient-to-b from-blue-50 to-white border border-blue-100 rounded-lg p-2 shadow-sm cursor-help">
                                    <Eye className="w-4 h-4 text-blue-700 mx-auto mb-1" />
                                    <div className="text-blue-800 text-xs">Plays</div>
                                    <div className="text-gray-900 font-semibold text-sm">{formatNumber(video.stats.playCount)}</div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p className="text-xs">Total video views</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="text-center bg-gradient-to-b from-cyan-50 to-white border border-cyan-100 rounded-lg p-2 shadow-sm cursor-help">
                                    <MessageCircle className="w-4 h-4 text-cyan-700 mx-auto mb-1" />
                                    <div className="text-cyan-800 text-xs">Comments</div>
                                    <div className="text-gray-900 font-semibold text-sm">{formatNumber(video.stats.commentCount)}</div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p className="text-xs">Video comments</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="text-center bg-gradient-to-b from-emerald-50 to-white border border-emerald-100 rounded-lg p-2 shadow-sm cursor-help">
                                    <Share2 className="w-4 h-4 text-emerald-700 mx-auto mb-1" />
                                    <div className="text-emerald-800 text-xs">Shares</div>
                                    <div className="text-gray-900 font-semibold text-sm">{formatNumber(video.stats.shareCount)}</div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p className="text-xs">Video shares</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-4">
                              <div className="text-center bg-gradient-to-b from-slate-50 to-white border border-slate-200 rounded-lg p-2 shadow-sm">
                                <div className="text-gray-600 text-xs">Videos</div>
                                <div className="text-gray-900 font-semibold">{video.authorStats.videoCount}</div>
                              </div>
                              <div className="text-center bg-gradient-to-b from-rose-50 to-white border border-rose-200 rounded-lg p-2 shadow-sm">
                                <div className="text-rose-700 text-xs">Total Hearts</div>
                                <div className="text-gray-900 font-semibold">{formatNumber(video.authorStats.heartCount)}</div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <AddToBucketDialog video={video} />
                              <Button
                                variant="outline"
                                className="w-full border-gray-300 text-gray-900 hover:bg-gray-50"
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

                  {/* Load More Button */}
                  {hasMore && displayedVideos.length > 0 && (
                    <div className="mt-8 text-center">
                      <Button
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        className="bg-blue-900 hover:bg-blue-800 text-white font-semibold px-8 py-3 shadow-md"
                      >
                        {isLoadingMore ? (
                          <>
                            <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                            Loading more...
                          </>
                        ) : (
                          <>
                            Load More Results
                            <ChevronDown className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  <div className="mt-8 text-center">
                    <p className="text-gray-500 text-sm">
                      Showing {displayedVideos.length} result{displayedVideos.length !== 1 ? 's' : ''}
                      {hasMore && ' (more available)'}
                      {searchQuery && ` for "${searchQuery}"`} • Powered by TikTok API
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </TooltipProvider>
  )
}
