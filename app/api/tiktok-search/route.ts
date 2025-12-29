import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_RAPIDAPI_TIKTOK_URL || 'https://tiktok-api23.p.rapidapi.com'
const API_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_TIKTOK_KEY

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const keyword = searchParams.get('keyword')
  const cursor = searchParams.get('cursor') || '0'
  const searchId = searchParams.get('search_id') || '0'

  if (!keyword) {
    return NextResponse.json({ error: 'Keyword is required' }, { status: 400 })
  }

  if (!API_KEY) {
    console.error('[API Route] RAPIDAPI_TIKTOK_KEY is not set')
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }


  try {
    const url = `${API_BASE_URL}/api/search/video?keyword=${encodeURIComponent(keyword)}&cursor=${cursor}&search_id=${searchId}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'tiktok-api23.p.rapidapi.com',
        'x-rapidapi-key': API_KEY,
      },
    })


    const text = await response.text()

    if (!response.ok) {
      console.error('[API Route] API error:', text)
      return NextResponse.json(
        { error: `TikTok API error: ${response.status} ${response.statusText}`, details: text },
        { status: response.status }
      )
    }

    if (!text || text.trim() === '') {
      console.error('[API Route] Empty response from TikTok API')
      return NextResponse.json(
        { error: 'Empty response from TikTok API' },
        { status: 502 }
      )
    }

    try {
      const data = JSON.parse(text)
      return NextResponse.json(data)
    } catch (parseError) {
      console.error('[API Route] JSON parse error:', parseError)
      console.error('[API Route] Response text:', text)
      return NextResponse.json(
        { error: 'Invalid JSON response from TikTok API', details: text.substring(0, 500) },
        { status: 502 }
      )
    }
  } catch (error) {
    console.error('[API Route] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch from TikTok API', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
