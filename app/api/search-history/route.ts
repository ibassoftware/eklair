import { NextRequest, NextResponse } from 'next/server'
import { dbHelpers } from '@/lib/db'

// GET - Fetch all search history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    
    const history = dbHelpers.getSearchHistory(limit)
    
    return NextResponse.json({ success: true, data: history })
  } catch (error) {
    console.error('[API] Error fetching search history:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch search history' },
      { status: 500 }
    )
  }
}

// POST - Add new search history
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, keyword, results, timestamp, resultCount } = body
    
    
    if (!id || !keyword || !results || !timestamp) {
      console.error('[API] Missing required fields')
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    dbHelpers.addSearchHistory(id, keyword, results, timestamp, resultCount)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Error adding search history:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add search history' },
      { status: 500 }
    )
  }
}

// DELETE - Clear all search history
export async function DELETE(request: NextRequest) {
  try {
    dbHelpers.clearSearchHistory()
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Error clearing search history:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to clear search history' },
      { status: 500 }
    )
  }
}
