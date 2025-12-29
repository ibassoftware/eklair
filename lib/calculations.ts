import { TikTokVideo, InfluencerQuality } from '@/types/tiktok'

export function calculateEngagementRate(video: TikTokVideo): number {
  if (video.stats.playCount === 0) return 0
  return (video.stats.diggCount / video.stats.playCount) * 100
}

export function calculateQualityScore(video: TikTokVideo): InfluencerQuality {
  const engagementRate = calculateEngagementRate(video)
  const subscriberCount = video.authorStats.followerCount
  const videoCount = video.authorStats.videoCount
  const verified = video.author.verified
  const totalHearts = video.authorStats.heartCount

  let score = 0

  // Engagement rate scoring (up to 40 points)
  if (engagementRate > 10) score += 40
  else if (engagementRate > 5) score += 30
  else if (engagementRate > 2) score += 20
  else if (engagementRate > 1) score += 10

  // Subscriber count scoring (up to 30 points)
  if (subscriberCount > 10000000) score += 30
  else if (subscriberCount > 1000000) score += 25
  else if (subscriberCount > 100000) score += 20
  else if (subscriberCount > 10000) score += 15
  else if (subscriberCount > 1000) score += 10

  // Verification bonus (10 points)
  if (verified) score += 10

  // Video count consistency (up to 10 points)
  if (videoCount > 1000) score += 10
  else if (videoCount > 500) score += 8
  else if (videoCount > 100) score += 6
  else if (videoCount > 50) score += 4
  else if (videoCount > 20) score += 2

  // Total hearts (up to 10 points)
  if (totalHearts > 100000000) score += 10
  else if (totalHearts > 10000000) score += 8
  else if (totalHearts > 1000000) score += 6
  else if (totalHearts > 100000) score += 4
  else if (totalHearts > 10000) score += 2

  let level: 'High' | 'Medium' | 'Low'
  if (score >= 70) level = 'High'
  else if (score >= 40) level = 'Medium'
  else level = 'Low'

  return {
    score,
    level,
    engagementRate,
    subscriberCount,
    verified,
    totalHearts,
    videoCount,
  }
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}
