import { NextRequest, NextResponse } from 'next/server'
import { dbHelpers } from '@/lib/db'

// GET - Fetch influencer meta (summary notes)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uniqueId: string }> }
) {
  const { uniqueId } = await params

  try {
    const summaryNotes = dbHelpers.getInfluencerSummaryNotes(uniqueId)
    return NextResponse.json({ success: true, data: { summaryNotes } })
  } catch (error) {
    console.error('[API] Error fetching influencer meta:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch influencer meta' },
      { status: 500 }
    )
  }
}

// PUT - Upsert influencer summary notes
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ uniqueId: string }> }
) {
  const { uniqueId } = await params

  try {
    const body = await request.json()
    const { summaryNotes } = body

    if (summaryNotes === undefined || typeof summaryNotes !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing required field: summaryNotes' },
        { status: 400 }
      )
    }

    dbHelpers.upsertInfluencerSummaryNotes(uniqueId, summaryNotes)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Error updating influencer meta:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update influencer meta' },
      { status: 500 }
    )
  }
}
