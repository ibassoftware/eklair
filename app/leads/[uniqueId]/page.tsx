"use client"

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { leadsStorage } from "@/lib/storage"
import { formatNumber } from "@/lib/calculations"
import type { LeadsInfluencer, LeadsState, InfluencerNote } from "@/types/tiktok"
import { ArrowLeft, ExternalLink, FileText, Trash2 } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"

function getBadgeColor(state: LeadsState) {
  const colors: Record<LeadsState, string> = {
    'to reach out': 'bg-blue-100 text-blue-800 border-blue-200',
    'in progress': 'bg-amber-100 text-amber-800 border-amber-200',
    'done': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  }
  return colors[state]
}

export default function LeadsInfluencerDetailPage() {
  const params = useParams<{ uniqueId?: string | string[] }>()
  const router = useRouter()
  const { toast } = useToast()

  const uniqueId = useMemo(() => {
    const value = params?.uniqueId
    if (!value) return ''
    return Array.isArray(value) ? value[0] : value
  }, [params])

  const [leadsItem, setLeadsItem] = useState<LeadsInfluencer | null>(null)
  const [leadsNotes, setLeadsNotes] = useState('')
  const [savingLeadsNotes, setSavingLeadsNotes] = useState(false)

  const [newNote, setNewNote] = useState('')
  const [timelineNotes, setTimelineNotes] = useState<InfluencerNote[]>([])

  useEffect(() => {
    if (!uniqueId) return

    let cancelled = false

    const load = async () => {
      const item = leadsStorage.getAll().find(i => i.video.author.uniqueId === uniqueId) || null
      if (cancelled) return

      setLeadsItem(item)
      setLeadsNotes(item?.notes || '')

      try {
        const [metaRes, notesRes] = await Promise.all([
          fetch(`/api/influencers/${uniqueId}/meta`, { method: 'GET' }),
          fetch(`/api/influencers/${uniqueId}/notes?limit=50`, { method: 'GET' }),
        ])

        const metaJson = await metaRes.json()
        const notesJson = await notesRes.json()

        if (!cancelled) {
          if (metaJson?.success && metaJson?.data?.summaryNotes !== null && metaJson?.data?.summaryNotes !== undefined) {
            setLeadsNotes(metaJson.data.summaryNotes)
          }
          if (notesJson?.success && Array.isArray(notesJson?.data)) {
            setTimelineNotes(notesJson.data)
          }
        }
      } catch (error) {
        console.error('[LeadsInfluencerDetailPage] Failed to load influencer notes:', error)
      }
    }

    load()
    window.addEventListener('bucket-updated', load)

    return () => {
      cancelled = true
      window.removeEventListener('bucket-updated', load)
    }
  }, [uniqueId])

  const handleSaveLeadsNotes = async () => {
    if (!leadsItem) return
    setSavingLeadsNotes(true)
    try {
      const res = await fetch(`/api/influencers/${uniqueId}/meta`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summaryNotes: leadsNotes }),
      })
      const json = await res.json()

      if (!json?.success) {
        throw new Error(json?.error || 'Failed to save notes')
      }

      leadsStorage.updateNotes(leadsItem.id, leadsNotes)
      window.dispatchEvent(new Event('bucket-updated'))

      toast({
        title: "Notes saved",
        description: "Your influencer notes have been saved to the database.",
      })
    } finally {
      setSavingLeadsNotes(false)
    }
  }

  const handleAddTimelineNote = () => {
    const trimmed = newNote.trim()
    if (!trimmed || !uniqueId) return

    ;(async () => {
      try {
        const res = await fetch(`/api/influencers/${uniqueId}/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: trimmed }),
        })
        const json = await res.json()

        if (!json?.success) {
          throw new Error(json?.error || 'Failed to add note')
        }

        setNewNote('')

        const reload = await fetch(`/api/influencers/${uniqueId}/notes?limit=50`, { method: 'GET' })
        const reloadJson = await reload.json()
        if (reloadJson?.success && Array.isArray(reloadJson?.data)) {
          setTimelineNotes(reloadJson.data)
        }

        toast({
          title: "Note added",
          description: "A new note was added to the timeline.",
        })
      } catch (error) {
        console.error('[LeadsInfluencerDetailPage] Failed to add note:', error)
        toast({
          variant: 'destructive',
          title: 'Failed to add note',
          description: 'Please try again.',
        })
      }
    })()
  }

  const handleRemoveTimelineNote = (noteId: string) => {
    if (!uniqueId) return

    ;(async () => {
      try {
        const res = await fetch(`/api/influencers/${uniqueId}/notes/${noteId}`, {
          method: 'DELETE',
        })
        const json = await res.json()

        if (!json?.success) {
          throw new Error(json?.error || 'Failed to delete note')
        }

        const reload = await fetch(`/api/influencers/${uniqueId}/notes?limit=50`, { method: 'GET' })
        const reloadJson = await reload.json()
        if (reloadJson?.success && Array.isArray(reloadJson?.data)) {
          setTimelineNotes(reloadJson.data)
        }
      } catch (error) {
        console.error('[LeadsInfluencerDetailPage] Failed to delete note:', error)
        toast({
          variant: 'destructive',
          title: 'Failed to delete note',
          description: 'Please try again.',
        })
      }
    })()
  }

  if (!uniqueId) {
    return null
  }

  if (!leadsItem) {
    return (
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto space-y-6">
              <Button variant="outline" onClick={() => router.push('/leads')} className="w-fit">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Leads
              </Button>

              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Influencer not found</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-600 space-y-3">
                  <p>This influencer isn't in your leads (or the leads was cleared).</p>
                  <Button asChild>
                    <Link href="/leads">Go to Leads</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
          <Footer />
        </div>
      </TooltipProvider>
    )
  }

  const profileUrl = `https://www.tiktok.com/@${leadsItem.video.author.uniqueId}`
  const savedVideoUrl = `https://www.tiktok.com/@${leadsItem.video.author.uniqueId}/video/${leadsItem.video.id}`

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <Header />

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <Button variant="outline" onClick={() => router.push('/leads')} className="w-fit border-gray-300 bg-white text-gray-900 hover:bg-gray-50">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Leads
              </Button>

              <div className="flex gap-2 flex-wrap">
                <Button asChild variant="outline" className="border-blue-200 bg-blue-50 text-blue-900 hover:bg-blue-100">
                  <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    TikTok Profile
                  </a>
                </Button>

                <Button asChild variant="outline" className="border-gray-300 bg-white text-gray-900 hover:bg-gray-50">
                  <a href={savedVideoUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Saved Video
                  </a>
                </Button>
              </div>
            </div>

            <Card className="bg-white border-gray-200 shadow-lg shadow-blue-900/5">
              <CardHeader className="pb-4 border-b border-gray-100 bg-gradient-to-r from-white to-blue-50/60">
                <div className="flex items-start justify-between gap-6 flex-wrap">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 ring-2 ring-blue-900/40">
                      <AvatarImage src={leadsItem.video.author.avatarMedium} alt={leadsItem.video.author.nickname} />
                      <AvatarFallback className="bg-blue-900 text-white text-lg">
                        {leadsItem.video.author.nickname.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <h1 className="text-2xl font-bold text-gray-900 truncate">{leadsItem.video.author.nickname}</h1>
                      <p className="text-gray-600">@{leadsItem.video.author.uniqueId}</p>
                      <div className="mt-2">
                        <Badge className={`text-xs ${getBadgeColor(leadsItem.state)}`}>{leadsItem.state}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full sm:w-auto">
                    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
                      <p className="text-xs text-gray-500">Followers</p>
                      <p className="text-lg font-bold text-gray-900">{formatNumber(leadsItem.video.authorStats.followerCount)}</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
                      <p className="text-xs text-gray-500">Total Hearts</p>
                      <p className="text-lg font-bold text-gray-900">{formatNumber(leadsItem.video.authorStats.heartCount)}</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
                      <p className="text-xs text-gray-500">Video Count</p>
                      <p className="text-lg font-bold text-gray-900">{formatNumber(leadsItem.video.authorStats.videoCount)}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-gray-200 bg-white shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-gray-900 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-900" />
                        Saved Video Snapshot
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <a
                        href={savedVideoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full h-56 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 hover:border-blue-300 transition-colors"
                      >
                        <img
                          src={leadsItem.video.video.cover}
                          alt={leadsItem.video.desc}
                          className="h-full w-full object-cover"
                        />
                      </a>

                      <p className="text-gray-600 text-sm line-clamp-3">{leadsItem.video.desc}</p>

                      <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                        <span>{formatNumber(leadsItem.video.stats.playCount)} plays</span>
                        <span>•</span>
                        <span>{formatNumber(leadsItem.video.stats.diggCount)} likes</span>
                        <span>•</span>
                        <span>{formatNumber(leadsItem.video.stats.commentCount)} comments</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200 bg-white shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-gray-900">Lead Notes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Label htmlFor="leads-notes" className="text-sm text-gray-600">Notes (quick summary)</Label>
                      <Textarea
                        id="leads-notes"
                        value={leadsNotes}
                        onChange={(e) => setLeadsNotes(e.target.value)}
                        placeholder="Contact info, pricing, deal terms, next steps..."
                        className="min-h-[140px] bg-slate-50 border-gray-300"
                      />
                      <div className="flex justify-end">
                        <Button onClick={handleSaveLeadsNotes} disabled={savingLeadsNotes} className="bg-blue-900 hover:bg-blue-800 text-white">
                          Save
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-gray-200 bg-white shadow-sm">
                  <CardHeader className="pb-3 border-b border-gray-100">
                    <CardTitle className="text-base text-gray-900">CRM Notes Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-note" className="text-sm text-gray-600">Add a note</Label>
                      <Textarea
                        id="new-note"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Logged call, outreach attempt, response, negotiation details..."
                        className="min-h-[90px] bg-slate-50 border-gray-300"
                      />
                      <div className="flex justify-end">
                        <Button onClick={handleAddTimelineNote} className="bg-blue-900 hover:bg-blue-800 text-white">
                          Add Note
                        </Button>
                      </div>
                    </div>

                    {timelineNotes.length === 0 ? (
                      <p className="text-sm text-gray-600">No timeline notes yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {timelineNotes.map((note) => (
                          <Card key={note.id} className="border-gray-200 bg-white">
                            <CardContent className="p-4 space-y-2">
                              <div className="flex items-start justify-between gap-4">
                                <p className="text-xs text-gray-500">
                                  {new Date(note.createdAt).toLocaleString()}
                                </p>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemoveTimelineNote(note.id)}
                                  className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-500/10 px-2"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                              <div className="rounded-md border border-gray-100 bg-slate-50 px-3 py-2">
                                <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.content}</p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        </div>

        <Footer />
      </div>
    </TooltipProvider>
  )
}
