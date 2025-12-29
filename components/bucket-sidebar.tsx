"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { leadsStorage } from "@/lib/storage"
import { LeadsInfluencer, LeadsState } from "@/types/tiktok"
import { formatNumber } from "@/lib/calculations"
import { Trash2, UserPlus, FileText, Download, ExternalLink, GripVertical, User } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"

const STATES: LeadsState[] = ['to reach out', 'in progress', 'done']

export function BucketSidebar() {
  const [leads, setLeads] = useState<LeadsInfluencer[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverState, setDragOverState] = useState<LeadsState | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const loadLeads = () => {
      const stored = leadsStorage.getAll()
      setLeads(stored)
    }

    loadLeads()
    window.addEventListener('bucket-updated', loadLeads)

    return () => {
      window.removeEventListener('bucket-updated', loadLeads)
    }
  }, [])

  const handleDelete = (id: string) => {
    const item = leads.find(i => i.id === id)
    leadsStorage.remove(id)
    window.dispatchEvent(new Event('bucket-updated'))
    toast({
      title: "Removed from leads",
      description: item?.video.author.nickname ? `${item.video.author.nickname} has been removed from your leads.` : "Influencer removed from leads.",
    })
  }

  const handleStateChange = (id: string, newState: LeadsState) => {
    const item = leads.find(i => i.id === id)
    leadsStorage.updateState(id, newState)
    window.dispatchEvent(new Event('bucket-updated'))
    toast({
      title: "State updated",
      description: item?.video.author.nickname ? `${item.video.author.nickname} moved to "${newState}".` : `Moved to "${newState}".`,
    })
  }

  const handleNotesSave = () => {
    if (editingId && notes !== undefined) {
      const item = leads.find(i => i.id === editingId)
      if (item?.video?.author?.uniqueId) {
        fetch(`/api/influencers/${item.video.author.uniqueId}/meta`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ summaryNotes: notes }),
        }).catch((error) => {
          console.error('[BucketSidebar] Failed to persist notes to DB:', error)
        })
      }

      leadsStorage.updateNotes(editingId, notes)
      setEditingId(null)
      setNotes('')
      window.dispatchEvent(new Event('bucket-updated'))
      toast({
        title: "Notes saved",
        description: "Your notes have been saved successfully.",
      })
    }
  }

  const handleExport = (format: 'json' | 'csv') => {
    if (format === 'json') {
      const data = leadsStorage.exportToJSON()
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `influencers-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      toast({
        title: "Export successful",
        description: "Your data has been exported as JSON.",
      })
    } else {
      const data = leadsStorage.exportToCSV()
      const blob = new Blob([data], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `influencers-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      toast({
        title: "Export successful",
        description: "Your data has been exported as CSV.",
      })
    }
  }

  const getBadgeColor = (state: LeadsState) => {
    const colors = {
      'to reach out': 'bg-blue-100 text-blue-800 border-blue-200',
      'in progress': 'bg-amber-100 text-amber-800 border-amber-200',
      'done': 'bg-emerald-100 text-emerald-800 border-emerald-200'
    }
    return colors[state]
  }

  const getColumnHeaderColor = (state: LeadsState) => {
    const colors = {
      'to reach out': 'from-blue-50 to-blue-100 border-blue-200',
      'in progress': 'from-amber-50 to-amber-100 border-amber-200',
      'done': 'from-emerald-50 to-emerald-100 border-emerald-200'
    }
    return colors[state]
  }

  const getItemsByState = (state: LeadsState) => {
    return leads.filter(item => item.state === state)
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, state: LeadsState) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverState(state)
  }

  const handleDragLeave = () => {
    setDragOverState(null)
  }

  const handleDrop = (e: React.DragEvent, newState: LeadsState) => {
    e.preventDefault()
    if (draggedId) {
      handleStateChange(draggedId, newState)
      setDraggedId(null)
    }
    setDragOverState(null)
  }

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <Card className="bg-white border-gray-200 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-700" />
              Influencer Pipeline
            </CardTitle>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleExport('json')} variant="outline" className="h-8">
                <Download className="w-3 h-3 mr-1" />
                JSON
              </Button>
              <Button size="sm" onClick={() => handleExport('csv')} variant="outline" className="h-8">
                <Download className="w-3 h-3 mr-1" />
                CSV
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Empty state */}
      {leads.length === 0 && (
        <Card className="bg-white border-gray-200">
          <CardContent className="p-12 text-center">
            <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No influencers in your leads yet.</p>
            <p className="text-gray-500 text-sm">Search for influencers and add them to your leads!</p>
          </CardContent>
        </Card>
      )}

      {/* Kanban Board */}
      {leads.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STATES.map((state) => {
            const items = getItemsByState(state)
            return (
              <div
                key={state}
                className={`rounded-xl border-2 p-4 min-h-[500px] transition-all ${
                  dragOverState === state
                    ? `bg-gradient-to-b ${getColumnHeaderColor(state)} border-blue-900 scale-[1.02]`
                    : `bg-white border-gray-200`
                }`}
                onDragOver={(e) => handleDragOver(e, state)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, state)}
              >
                <div className={`flex items-center justify-between mb-4 p-3 rounded-lg bg-gradient-to-r ${getColumnHeaderColor(state)} border`}>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${getBadgeColor(state)}`}>
                      {state}
                    </Badge>
                    <span className="text-gray-900 font-bold">{items.length}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {items.map((item) => (
                    <Card
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item.id)}
                      className={`bg-white border-gray-200 cursor-grab active:cursor-grabbing hover:border-blue-900/50 transition-all ${
                        draggedId === item.id ? 'opacity-50 ring-2 ring-blue-900' : ''
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <a
                            href={`https://www.tiktok.com/@${item.video.author.uniqueId}/video/${item.video.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full h-40 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 hover:border-blue-300 transition-colors"
                          >
                            <img
                              src={item.video.video.cover}
                              alt={item.video.desc}
                              className="h-full w-full object-cover"
                            />
                          </a>

                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              <GripVertical className="w-4 h-4 text-slate-500" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Avatar className="h-8 w-8 ring-2 ring-blue-900/50 flex-shrink-0">
                                  <AvatarImage src={item.video.author.avatarMedium} alt={item.video.author.nickname} />
                                  <AvatarFallback className="bg-blue-900 text-white text-xs">
                                    {item.video.author.nickname.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <a
                                  href={`https://www.tiktok.com/@${item.video.author.uniqueId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-bold text-gray-900 text-sm truncate hover:text-blue-900 hover:underline"
                                >
                                  {item.video.author.nickname}
                                </a>
                              </div>

                              <p className="text-gray-600 text-xs line-clamp-2 mb-2">{item.video.desc}</p>

                              <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-2">
                                <span>{formatNumber(item.video.authorStats.followerCount)} followers</span>
                                <span>•</span>
                                <span>{formatNumber(item.video.stats.diggCount)} likes</span>
                              </div>

                              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                <a
                                  href={`https://www.tiktok.com/@${item.video.author.uniqueId}/video/${item.video.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 hover:underline"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  View saved video
                                </a>
                              </div>

                            {editingId === item.id ? (
                              <div className="space-y-2">
                                <Label htmlFor="notes" className="text-xs text-gray-600">Notes</Label>
                                <Input
                                  id="notes"
                                  value={notes}
                                  onChange={(e) => setNotes(e.target.value)}
                                  className="h-8 text-sm bg-gray-50 border-gray-300"
                                  placeholder="Add notes about this influencer..."
                                />
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={handleNotesSave} className="h-8 bg-blue-900 hover:bg-blue-800 text-white">
                                    Save
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => setEditingId(null)} className="h-8 border-gray-300 bg-white text-gray-800 hover:bg-gray-50">
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="text-gray-600 text-xs line-clamp-2 mb-2">{item.notes || 'No notes'}</p>

                                <div className="flex gap-2 flex-wrap">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.location.href = `/leads/${item.video.author.uniqueId}`}
                                    className="h-7 text-xs px-2 border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
                                  >
                                    <User className="w-3 h-3 mr-1" />
                                    Details
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingId(item.id)
                                      setNotes(item.notes || '')
                                    }}
                                    className="h-7 text-xs px-2 border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
                                  >
                                    <FileText className="w-3 h-3 mr-1" />
                                    Notes
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(`https://www.tiktok.com/@${item.video.author.uniqueId}`, '_blank')}
                                    className="h-7 text-xs px-2 border-blue-200 bg-blue-50 text-blue-900 hover:bg-blue-100"
                                  >
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    Profile
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDelete(item.id)}
                                    className="h-7 text-xs px-2 border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
