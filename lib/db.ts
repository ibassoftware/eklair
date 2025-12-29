import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

// Database file path
const dbDir = path.join(process.cwd(), 'data')
const dbPath = path.join(dbDir, 'influencer.db')


// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

// Create database connection
let db: Database.Database
try {
  db = new Database(dbPath)
} catch (error) {
  console.error('[DB] Failed to create database connection:', error)
  throw error
}

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL')

// Initialize tables
function initializeDatabase() {
  // Search History table
  db.exec(`
    CREATE TABLE IF NOT EXISTS search_history (
      id TEXT PRIMARY KEY,
      keyword TEXT NOT NULL,
      results TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      result_count INTEGER NOT NULL
    )
  `)

  // Bucket table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bucket (
      id TEXT PRIMARY KEY,
      video TEXT NOT NULL,
      state TEXT NOT NULL,
      notes TEXT,
      added_at INTEGER NOT NULL
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS influencer_meta (
      influencer_unique_id TEXT PRIMARY KEY,
      summary_notes TEXT,
      updated_at INTEGER NOT NULL
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS influencer_notes (
      id TEXT PRIMARY KEY,
      influencer_unique_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `)

  // Create indexes for better performance
  db.exec('CREATE INDEX IF NOT EXISTS idx_search_history_timestamp ON search_history(timestamp DESC)')
  db.exec('CREATE INDEX IF NOT EXISTS idx_search_history_keyword ON search_history(keyword)')
  db.exec('CREATE INDEX IF NOT EXISTS idx_bucket_state ON bucket(state)')
  db.exec('CREATE INDEX IF NOT EXISTS idx_bucket_added_at ON bucket(added_at DESC)')
  db.exec('CREATE INDEX IF NOT EXISTS idx_influencer_meta_updated_at ON influencer_meta(updated_at DESC)')
  db.exec('CREATE INDEX IF NOT EXISTS idx_influencer_notes_unique_id ON influencer_notes(influencer_unique_id)')
  db.exec('CREATE INDEX IF NOT EXISTS idx_influencer_notes_created_at ON influencer_notes(created_at DESC)')
}

// Initialize on module load
initializeDatabase()

export { db }

// Database helper functions
export const dbHelpers = {
  // Search History
  addSearchHistory: (id: string, keyword: string, results: any[], timestamp: number, resultCount: number) => {
    try {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO search_history (id, keyword, results, timestamp, result_count)
        VALUES (?, ?, ?, ?, ?)
      `)
      const result = stmt.run(id, keyword, JSON.stringify(results), timestamp, resultCount)
      return result
    } catch (error) {
      console.error('[DB] Error in addSearchHistory:', error)
      throw error
    }
  },

  getSearchHistory: (limit: number = 20) => {
    try {
      const stmt = db.prepare(`
        SELECT * FROM search_history
        ORDER BY timestamp DESC
        LIMIT ?
      `)
      const rows = stmt.all(limit)
      return rows.map((row: any) => ({
        id: row.id,
        keyword: row.keyword,
        results: JSON.parse(row.results),
        timestamp: row.timestamp,
        resultCount: row.result_count
      }))
    } catch (error) {
      console.error('[DB] Error in getSearchHistory:', error)
      throw error
    }
  },

  getSearchHistoryById: (id: string) => {
    try {
      const stmt = db.prepare('SELECT * FROM search_history WHERE id = ?')
      const row = stmt.get(id) as any
      if (row) {
        return {
          id: row.id,
          keyword: row.keyword,
          results: JSON.parse(row.results),
          timestamp: row.timestamp,
          resultCount: row.result_count
        }
      }
      return null
    } catch (error) {
      console.error('[DB] Error in getSearchHistoryById:', error)
      throw error
    }
  },

  deleteSearchHistory: (id: string) => {
    try {
      const stmt = db.prepare('DELETE FROM search_history WHERE id = ?')
      const result = stmt.run(id)
      return result
    } catch (error) {
      console.error('[DB] Error in deleteSearchHistory:', error)
      throw error
    }
  },

  clearSearchHistory: () => {
    try {
      const stmt = db.prepare('DELETE FROM search_history')
      const result = stmt.run()
      return result
    } catch (error) {
      console.error('[DB] Error in clearSearchHistory:', error)
      throw error
    }
  },

  // Bucket
  addToBucket: (id: string, video: any, state: string, notes: string | null, addedAt: number) => {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO bucket (id, video, state, notes, added_at)
      VALUES (?, ?, ?, ?, ?)
    `)
    return stmt.run(id, JSON.stringify(video), state, notes, addedAt)
  },

  getBucket: (state?: string) => {
    let query = 'SELECT * FROM bucket'
    const params: any[] = []
    
    if (state) {
      query += ' WHERE state = ?'
      params.push(state)
    }
    
    query += ' ORDER BY added_at DESC'
    
    const stmt = db.prepare(query)
    return stmt.all(...params).map((row: any) => ({
      ...row,
      video: JSON.parse(row.video)
    }))
  },

  removeFromBucket: (id: string) => {
    const stmt = db.prepare('DELETE FROM bucket WHERE id = ?')
    return stmt.run(id)
  },

  updateBucketState: (id: string, state: string) => {
    const stmt = db.prepare('UPDATE bucket SET state = ? WHERE id = ?')
    return stmt.run(state, id)
  },

  updateBucketNotes: (id: string, notes: string) => {
    const stmt = db.prepare('UPDATE bucket SET notes = ? WHERE id = ?')
    return stmt.run(notes, id)
  },

  // Influencer Notes
  getInfluencerSummaryNotes: (influencerUniqueId: string) => {
    const stmt = db.prepare('SELECT summary_notes FROM influencer_meta WHERE influencer_unique_id = ?')
    const row = stmt.get(influencerUniqueId) as any
    return row?.summary_notes ?? null
  },

  upsertInfluencerSummaryNotes: (influencerUniqueId: string, summaryNotes: string) => {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO influencer_meta (influencer_unique_id, summary_notes, updated_at)
      VALUES (?, ?, ?)
    `)
    return stmt.run(influencerUniqueId, summaryNotes, Date.now())
  },

  getInfluencerNotes: (influencerUniqueId: string, limit: number = 50) => {
    const stmt = db.prepare(`
      SELECT id, influencer_unique_id, content, created_at
      FROM influencer_notes
      WHERE influencer_unique_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `)
    const rows = stmt.all(influencerUniqueId, limit) as any[]
    return rows.map(r => ({
      id: r.id,
      influencerUniqueId: r.influencer_unique_id,
      content: r.content,
      createdAt: r.created_at,
    }))
  },

  addInfluencerNote: (influencerUniqueId: string, content: string) => {
    const id = `${influencerUniqueId}-${Date.now()}-${Math.random().toString(16).slice(2)}`
    const createdAt = Date.now()
    const stmt = db.prepare(`
      INSERT INTO influencer_notes (id, influencer_unique_id, content, created_at)
      VALUES (?, ?, ?, ?)
    `)
    stmt.run(id, influencerUniqueId, content, createdAt)
    return { id, influencerUniqueId, content, createdAt }
  },

  deleteInfluencerNote: (noteId: string) => {
    const stmt = db.prepare('DELETE FROM influencer_notes WHERE id = ?')
    return stmt.run(noteId)
  },
}
