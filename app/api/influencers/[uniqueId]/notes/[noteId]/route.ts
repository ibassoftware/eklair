import { NextRequest, NextResponse } from 'next/server'
import { dbHelpers } from '@/lib/db'

// DELETE - Delete a specific note by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ uniqueId: string; noteId: string }> }
) {
  const { uniqueId: _uniqueId, noteId } = await params

  try {
    if (!noteId) {
      return NextResponse.json(
        { success: false, error: 'Missing noteId' },
        { status: 400 }
      )
    }

    dbHelpers.deleteInfluencerNote(noteId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Error deleting influencer note:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete influencer note' },
      { status: 500 }
    )
  }
}
