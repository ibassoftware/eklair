import { TikTokSearchResponse, TikTokVideo } from '@/types/tiktok'

/**
 * TikTok API Client (via RapidAPI)
 * 
 * This file contains the API client for making requests to TikTok API via RapidAPI.
 * Currently using mock data, but ready for real API integration.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_RAPIDAPI_TIKTOK_URL || 'https://tiktok-api23.p.rapidapi.com'
const API_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_TIKTOK_KEY

// Always use real API now
const USE_REAL_API = true

/**
 * Search for TikTok videos by keyword
 * @param keyword - Search keyword
 * @param cursor - Pagination cursor (optional)
 * @param searchId - Search ID for pagination (optional)
 * @returns Promise<TikTokSearchResponse>
 */
export async function searchVideos(
  keyword: string,
  cursor: number = 0,
  searchId: string = '0'
): Promise<TikTokSearchResponse> {

  // Use Next.js API route as proxy to avoid CORS and better error handling
  const url = `/api/tiktok-search?keyword=${encodeURIComponent(keyword)}&cursor=${cursor}&search_id=${searchId}`

  const response = await fetch(url, {
    method: 'GET',
  })


  // Get response text first to debug
  const responseText = await response.text()

  if (!response.ok) {
    console.error('[API Client] Error response:', responseText)
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  // Try to parse JSON
  if (!responseText || responseText.trim() === '') {
    console.error('[API Client] Empty response received')
    throw new Error('API returned empty response')
  }

  try {
    const data = JSON.parse(responseText)
    return data
  } catch (parseError) {
    console.error('[API Client] Failed to parse JSON:', parseError)
    console.error('[API Client] Response text was:', responseText.substring(0, 500))
    throw new Error(`Failed to parse API response: ${parseError}`)
  }
}

/**
 * Get video details by ID
 * @param videoId - TikTok video ID
 * @returns Promise<TikTokVideo>
 */
export async function getVideoDetails(videoId: string): Promise<TikTokVideo> {
  if (USE_REAL_API) {
    // Real API implementation
    const headers = new Headers()
    headers.append('x-rapidapi-host', 'tiktok-api23.p.rapidapi.com')
    headers.append('x-rapidapi-key', API_KEY || '')
    
    const response = await fetch(
      `${API_BASE_URL}/video/details?id=${videoId}`,
      {
        method: 'GET',
        headers
      }
    )

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    return response.json()
  } else {
    // Mock implementation
    const { mockVideos } = await import('@/data/mockData')
    const video = mockVideos.find(v => v.id === videoId)
    
    if (!video) {
      throw new Error('Video not found')
    }
    
    return video
  }
}

/**
 * Get author details by ID
 * @param authorId - TikTok author ID
 * @returns Promise<any>
 */
export async function getAuthorDetails(authorId: string): Promise<any> {
  if (USE_REAL_API) {
    // Real API implementation
    const headers = new Headers()
    headers.append('x-rapidapi-host', 'tiktok-api23.p.rapidapi.com')
    headers.append('x-rapidapi-key', API_KEY || '')
    
    const response = await fetch(
      `${API_BASE_URL}/author/details?id=${authorId}`,
      {
        method: 'GET',
        headers
      }
    )

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    return response.json()
  } else {
    // Mock implementation
    const { mockVideos } = await import('@/data/mockData')
    const author = mockVideos.find(v => v.author.id === authorId)?.author
    
    if (!author) {
      throw new Error('Author not found')
    }
    
    return author
  }
}

/**
 * API Error Handler
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Rate limiter for API calls
 * Helps prevent exceeding API rate limits
 */
class RateLimiter {
  private calls: number[] = []
  private readonly maxCalls: number
  private readonly windowMs: number

  constructor(maxCalls: number = 10, windowMs: number = 60000) {
    this.maxCalls = maxCalls
    this.windowMs = windowMs
  }

  async wait(): Promise<void> {
    const now = Date.now()
    // Remove calls outside of time window
    this.calls = this.calls.filter(callTime => now - callTime < this.windowMs)
    
    if (this.calls.length >= this.maxCalls) {
      const oldestCall = this.calls[0]
      const waitTime = this.windowMs - (now - oldestCall)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
    
    this.calls.push(now)
  }
}

export const rateLimiter = new RateLimiter(10, 60000) // 10 calls per minute
