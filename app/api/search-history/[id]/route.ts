import { NextRequest, NextResponse } from 'next/server'
import { dbHelpers } from '@/lib/db'

// GET - Get a specific search history item by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const item = dbHelpers.getSearchHistoryById(id)
    
    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Search history item not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, data: item })
  } catch (error) {
    console.error('[API] Error getting search history:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get search history' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a specific search history item by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    dbHelpers.deleteSearchHistory(id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Error deleting search history:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete search history' },
      { status: 500 }
    )
  }
}
