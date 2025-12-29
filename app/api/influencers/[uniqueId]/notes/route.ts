import { NextRequest, NextResponse } from 'next/server'
import { dbHelpers } from '@/lib/db'

// GET - Fetch influencer notes timeline
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uniqueId: string }> }
) {
  const { uniqueId } = await params

  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    const notes = dbHelpers.getInfluencerNotes(uniqueId, limit)
    return NextResponse.json({ success: true, data: notes })
  } catch (error) {
    console.error('[API] Error fetching influencer notes:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch influencer notes' },
      { status: 500 }
    )
  }
}

// POST - Add a note to influencer timeline
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ uniqueId: string }> }
) {
  const { uniqueId } = await params

  try {
    const body = await request.json()
    const { content } = body

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing required field: content' },
        { status: 400 }
      )
    }

    const trimmed = content.trim()
    if (!trimmed) {
      return NextResponse.json(
        { success: false, error: 'Content must not be empty' },
        { status: 400 }
      )
    }

    const note = dbHelpers.addInfluencerNote(uniqueId, trimmed)
    return NextResponse.json({ success: true, data: note })
  } catch (error) {
    console.error('[API] Error adding influencer note:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add influencer note' },
      { status: 500 }
    )
  }
}
