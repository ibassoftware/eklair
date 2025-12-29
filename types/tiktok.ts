export interface TikTokAuthor {
  id: string
  uniqueId: string
  nickname: string
  avatarLarger: string
  avatarMedium: string
  avatarThumb: string
  signature: string
  verified: boolean
  secUid: string
  privateAccount: boolean
  relation: number
}

export interface TikTokAuthorStats {
  followerCount: number
  followingCount: number
  heartCount: number
  diggCount: number
  videoCount: number
  heart: number
}

export interface TikTokStats {
  diggCount: number
  shareCount: number
  commentCount: number
  playCount: number
  collectCount: number
}

export interface TikTokVideo {
  id: string
  desc: string
  createTime: number
  author: TikTokAuthor
  authorStats: TikTokAuthorStats
  stats: TikTokStats
  music: {
    id: string
    title: string
    authorName: string
  }
  video: {
    id: string
    cover: string
    playAddr: string
    downloadAddr: string
    duration: number
    width: number
    height: number
  }
  challenges: Array<{
    id: string
    title: string
    desc: string
  }>
  isAd: boolean
}

export interface TikTokSearchResponse {
  has_more: boolean
  cursor: number
  item_list: TikTokVideo[]
  extra: {
    logid: string
    now: number
    search_request_id: string
  }
}

export type LeadsState = 'to reach out' | 'in progress' | 'done'

export interface LeadsInfluencer {
  id: string
  video: TikTokVideo
  state: LeadsState
  notes?: string
  addedAt: number
}

export interface SearchHistory {
  id: string
  keyword: string
  results: TikTokVideo[]
  timestamp: number
  resultCount: number
}

export interface InfluencerQuality {
  score: number
  level: 'High' | 'Medium' | 'Low'
  engagementRate: number
  subscriberCount: number
  verified: boolean
  totalHearts: number
  videoCount: number
}

export interface InfluencerNote {
  id: string
  influencerUniqueId: string
  content: string
  createdAt: number
}
