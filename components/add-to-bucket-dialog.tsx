"use client"

import { useCallback, useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Check, Plus, AlertCircle } from 'lucide-react'
import { leadsStorage } from "@/lib/storage"
import { LeadsInfluencer, TikTokVideo, LeadsState } from "@/types/tiktok"
import { useToast } from "@/components/ui/use-toast"

interface AddToBucketDialogProps {
  video: TikTokVideo
  trigger?: React.ReactNode
}

export function AddToBucketDialog({ video, trigger }: AddToBucketDialogProps) {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<LeadsState>('to reach out')
  const [notes, setNotes] = useState('')
  const [inLeads, setInLeads] = useState(false)
  const { toast } = useToast()

  const syncInLeads = useCallback(() => {
    const existing = leadsStorage
      .getAll()
      .some(item => item.video.author.uniqueId === video.author.uniqueId)
    setInLeads(existing)
  }, [video.author.uniqueId])

  useEffect(() => {
    syncInLeads()
  }, [syncInLeads])

  useEffect(() => {
    const handleLeadsUpdate = () => syncInLeads()
    window.addEventListener('bucket-updated', handleLeadsUpdate)
    return () => window.removeEventListener('bucket-updated', handleLeadsUpdate)
  }, [syncInLeads])

  const handleAdd = () => {
    const leadsItem: LeadsInfluencer = {
      id: `${video.id}-${Date.now()}`,
      video,
      state,
      notes,
      addedAt: Date.now()
    }

    const success = leadsStorage.add(leadsItem)
    if (success) {
      fetch(`/api/influencers/${video.author.uniqueId}/meta`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summaryNotes: notes || '' }),
      }).catch((error) => {
        console.error('[AddToBucketDialog] Failed to persist notes to DB:', error)
      })

      setOpen(false)
      setNotes('')
      setState('to reach out')
      window.dispatchEvent(new CustomEvent('bucket-updated', { detail: { item: leadsItem } }))

      toast({
        variant: "success",
        title: "Added to leads",
        description: `${video.author.nickname} has been added to your "${state}" leads.`,
      })
    } else {
      toast({
        variant: "destructive",
        title: "Already in leads",
        description: `${video.author.nickname} is already in your leads.`,
        action: <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.href = '/leads'}
          className="bg-gray-200 text-gray-700 hover:bg-gray-300 ml-auto"
        >
          View Leads
        </Button>,
      })
    }
  }

  if (inLeads) {
    return (
      <Button
        variant="outline"
        onClick={() => window.location.href = '/leads'}
        className="w-full border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:border-green-300"
      >
        <Check className="w-4 h-4 mr-2" />
        In Leads
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold shadow-lg">
            <Plus className="w-4 h-4 mr-2" />
            Add to Leads
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-900" />
            Add to Influencer Leads
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
            <div className="h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
              <img 
                src={video.video.cover} 
                alt={video.desc} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900">{video.author.nickname}</h3>
              <p className="text-gray-600 text-sm line-clamp-1">{video.desc}</p>
              <div className="flex gap-4 mt-2 text-xs text-gray-600">
                <span>{video.authorStats.followerCount.toLocaleString()} followers</span>
                <span>{video.stats.diggCount.toLocaleString()} likes</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="leads-state">Campaign State *</Label>
              <Select value={state} onValueChange={(v) => setState(v as LeadsState)}>
                <SelectTrigger id="leads-state">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="to reach out">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      To Reach Out
                      <span className="text-gray-600 text-xs ml-2">First contact this influencer</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="in progress">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      In Progress
                      <span className="text-gray-600 text-xs ml-2">Currently contacting</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="done">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Done
                      <span className="text-gray-600 text-xs ml-2">Campaign completed</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this influencer, campaign goals, contact info, etc..."
                className="min-h-[100px] bg-gray-50 border-gray-300 resize-none"
              />
              <p className="text-gray-500 text-xs">Optional - Add any relevant notes for your reference</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleAdd} className="flex-1 bg-blue-900 hover:bg-blue-800">
              <Check className="w-4 h-4 mr-2" />
              Add to Leads
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
