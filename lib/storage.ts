import { LeadsInfluencer, LeadsState, SearchHistory, InfluencerNote } from '@/types/tiktok'

const LEADS_STORAGE_KEY = 'influencer-leads'
const SEARCH_HISTORY_KEY = 'search-history'
const INFLUENCER_NOTES_KEY = 'influencer-notes-v1'

export const leadsStorage = {
  getAll: (): LeadsInfluencer[] => {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(LEADS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  },

  add: (influencer: LeadsInfluencer) => {
    if (typeof window === 'undefined') return
    const leads = leadsStorage.getAll()
    const existing = leads.find(item => item.video.author.uniqueId === influencer.video.author.uniqueId)
    if (existing) return false

    leads.push(influencer)
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads))
    return true
  },

  remove: (id: string) => {
    if (typeof window === 'undefined') return
    const leads = leadsStorage.getAll()
    const updated = leads.filter(item => item.id !== id)
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(updated))
  },

  updateState: (id: string, state: LeadsState) => {
    if (typeof window === 'undefined') return
    const leads = leadsStorage.getAll()
    const updated = leads.map(item =>
      item.id === id ? { ...item, state } : item
    )
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(updated))
  },

  updateNotes: (id: string, notes: string) => {
    if (typeof window === 'undefined') return
    const leads = leadsStorage.getAll()
    const updated = leads.map(item =>
      item.id === id ? { ...item, notes } : item
    )
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(updated))
  },

  getByState: (state?: LeadsState): LeadsInfluencer[] => {
    const leads = leadsStorage.getAll()
    return state ? leads.filter(item => item.state === state) : leads
  },

  exportToJSON: (): string => {
    const leads = leadsStorage.getAll()
    return JSON.stringify(leads, null, 2)
  },

  exportToCSV: (): string => {
    const leads = leadsStorage.getAll()
    if (leads.length === 0) return ''

    const headers = ['Name', 'Username', 'State', 'Notes', 'Added Date', 'Followers', 'Video Likes']
    const rows = leads.map(item => [
      item.video.author.nickname,
      item.video.author.uniqueId,
      item.state,
      item.notes || '',
      new Date(item.addedAt).toLocaleDateString(),
      item.video.authorStats.followerCount,
      item.video.stats.diggCount
    ])

    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
  }
}

// Backward compatibility alias
export const bucketStorage = leadsStorage

export const influencerNotesStorage = {
  getAll: (): Record<string, InfluencerNote[]> => {
    if (typeof window === 'undefined') return {}
    const stored = localStorage.getItem(INFLUENCER_NOTES_KEY)
    return stored ? JSON.parse(stored) : {}
  },

  getByInfluencerUniqueId: (influencerUniqueId: string): InfluencerNote[] => {
    const all = influencerNotesStorage.getAll()
    const notes = all[influencerUniqueId] || []
    return notes.sort((a, b) => b.createdAt - a.createdAt)
  },

  add: (influencerUniqueId: string, content: string): InfluencerNote | null => {
    if (typeof window === 'undefined') return null
    const all = influencerNotesStorage.getAll()
    const note: InfluencerNote = {
      id: `${influencerUniqueId}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      influencerUniqueId,
      content,
      createdAt: Date.now(),
    }

    const existing = all[influencerUniqueId] || []
    all[influencerUniqueId] = [note, ...existing]
    localStorage.setItem(INFLUENCER_NOTES_KEY, JSON.stringify(all))
    return note
  },

  remove: (influencerUniqueId: string, noteId: string) => {
    if (typeof window === 'undefined') return
    const all = influencerNotesStorage.getAll()
    const existing = all[influencerUniqueId] || []
    all[influencerUniqueId] = existing.filter(n => n.id !== noteId)
    localStorage.setItem(INFLUENCER_NOTES_KEY, JSON.stringify(all))
  },
}

export const searchHistoryStorage = {
  getAll: async (): Promise<SearchHistory[]> => {
    if (typeof window === 'undefined') return []
    try {
      const response = await fetch('/api/search-history')
      const result = await response.json()
      if (result.success) {
        return result.data
      } else {
        throw new Error('API returned success=false')
      }
    } catch (error) {
      console.error('[Storage] Error fetching search history:', error)
      // Fallback to localStorage on error
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY)
      const localData = stored ? JSON.parse(stored) : []
      return localData
    }
  },

  add: async (history: SearchHistory) => {
    if (typeof window === 'undefined') return
    try {
      const response = await fetch('/api/search-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: history.id,
          keyword: history.keyword,
          results: history.results,
          timestamp: history.timestamp,
          resultCount: history.resultCount
        })
      })
      const result = await response.json()
      if (!result.success) {
        throw new Error('Failed to add search history')
      }
    } catch (error) {
      console.error('[Storage] Error adding search history:', error)
      // Fallback to localStorage on error
      const historyList = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]')
      const existingIndex = historyList.findIndex((h: SearchHistory) => h.keyword === history.keyword)
      
      if (existingIndex >= 0) {
        historyList[existingIndex] = history
      } else {
        historyList.unshift(history)
      }
      
      const maxHistory = 20
      if (historyList.length > maxHistory) {
        historyList.pop()
      }
      
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(historyList))
    }
  },

  remove: async (id: string) => {
    if (typeof window === 'undefined') return
    try {
      const response = await fetch(`/api/search-history/${id}`, {
        method: 'DELETE'
      })
      const result = await response.json()
      if (!result.success) {
        throw new Error('Failed to remove search history')
      }
    } catch (error) {
      console.error('[Storage] Error removing search history:', error)
      // Fallback to localStorage on error
      const historyList = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]')
      const updated = historyList.filter((item: SearchHistory) => item.id !== id)
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated))
    }
  },

  getById: async (id: string): Promise<SearchHistory | null> => {
    if (typeof window === 'undefined') return null
    try {
      const response = await fetch(`/api/search-history/${id}`)
      const result = await response.json()
      if (result.success && result.data) {
        return result.data
      } else {
        throw new Error('API returned no data')
      }
    } catch (error) {
      console.error('[Storage] Error getting search history by id:', error)
      // Fallback to localStorage on error
      const historyList = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]')
      const item = historyList.find((item: SearchHistory) => item.id === id) || null
      return item
    }
  },

  clear: async () => {
    if (typeof window === 'undefined') return
    try {
      const response = await fetch('/api/search-history', {
        method: 'DELETE'
      })
      const result = await response.json()
      if (!result.success) {
        throw new Error('Failed to clear search history')
      }
    } catch (error) {
      console.error('[Storage] Error clearing search history:', error)
      // Fallback to localStorage on error
      localStorage.removeItem(SEARCH_HISTORY_KEY)
    }
  }
}
