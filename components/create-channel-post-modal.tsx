"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSuiAuth } from "@/contexts/sui-auth-context"
import { forumService } from "@/lib/forum-service"
import { 
  FileText, 
  Calendar, 
  Eye, 
  Pin,
  Send,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { toast } from "sonner"

interface CreateChannelPostModalProps {
  isOpen: boolean
  onClose: () => void
  channel: any
  onPostCreated: () => void
}

export function CreateChannelPostModal({
  isOpen,
  onClose,
  channel,
  onPostCreated
}: CreateChannelPostModalProps) {
  const { user } = useSuiAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    isPinned: false,
    publishNow: true,
    scheduledDate: ""
  })

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: "",
        content: "",
        isPinned: false,
        publishNow: true,
        scheduledDate: ""
      })
      setIsSubmitting(false)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    if (!user?.address) {
      toast.error("Please connect your wallet")
      return
    }

    if (!channel || !channel.id) {
      console.error('❌ Invalid channel data:', channel)
      toast.error("Invalid channel selected. Please select a channel first.")
      return
    }

    setIsSubmitting(true)

    try {
      console.log('🚀 Starting post creation with data:', {
        userAddress: user.address,
        channelId: channel.id,
        channelName: channel.name,
        title: formData.title,
        contentLength: formData.content.length
      })

      // Create the creator channel post using the forum service
      const result = await forumService.createCreatorChannelPost(
        user.address,
        channel.id,
        {
          title: formData.title,
          content: formData.content,
          isPinned: formData.isPinned,
          publishNow: formData.publishNow,
          scheduledDate: formData.scheduledDate,
          channelName: channel.name // Pass the actual channel name
        }
      )

      console.log('📝 Forum service result:', result)

      if (!result.success) {
        console.error('❌ Forum service returned error:', result.error)
        toast.error(result.error || 'Failed to create post')
        return
      }

      console.log('✅ Creator channel post created:', {
        postId: result.postId,
        topicId: result.topicId
      })

      // Reset form
      setFormData({
        title: "",
        content: "",
        isPinned: false,
        publishNow: true,
        scheduledDate: ""
      })

      onPostCreated()
      toast.success("Post created successfully!")
      
    } catch (error) {
      console.error('❌ Exception during post creation:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error(`Failed to create post: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!channel) return null

  return (
    <Dialog key={channel?.id} open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#030F1C] border-[#C0E6FF]/20 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-xl flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Create Channel Post
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Channel Info */}
          <div className="flex items-center gap-3 p-4 bg-[#1a2f51] rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={channel.creatorAvatar} alt={channel.creatorName} />
              <AvatarFallback className="bg-[#4DA2FF] text-white">
                {channel.creatorName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-white font-semibold">{channel.name}</h3>
              <p className="text-[#C0E6FF] text-sm">by {channel.creatorName}</p>
              <Badge
                className={
                  channel.type === 'premium'
                    ? "bg-orange-500/20 text-orange-400 border-orange-500/30 mt-1"
                    : channel.type === 'vip'
                    ? "bg-purple-500/20 text-purple-400 border-purple-500/30 mt-1"
                    : "bg-green-500/20 text-green-400 border-green-500/30 mt-1"
                }
              >
                {channel.type.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Post Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">
              Post Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter an engaging title for your post..."
              className="bg-[#1a2f51] border-[#C0E6FF]/20 text-white placeholder:text-[#C0E6FF]/50"
              maxLength={100}
            />
            <p className="text-[#C0E6FF]/70 text-xs">
              {formData.title.length}/100 characters
            </p>
          </div>

          {/* Post Content */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-white">
              Post Content *
            </Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Write your post content here... You can include insights, analysis, trading signals, or any valuable content for your subscribers."
              className="bg-[#1a2f51] border-[#C0E6FF]/20 text-white placeholder:text-[#C0E6FF]/50 min-h-[200px]"
              maxLength={5000}
            />
            <p className="text-[#C0E6FF]/70 text-xs">
              {formData.content.length}/5000 characters
            </p>
          </div>

          {/* Post Options */}
          <div className="space-y-4 p-4 bg-[#1a2f51] rounded-lg">
            <h4 className="text-white font-medium flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Post Options
            </h4>
            
            {/* Pin Post */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pin className="w-4 h-4 text-[#C0E6FF]" />
                <div>
                  <Label htmlFor="pin-post" className="text-white text-sm">
                    Pin this post
                  </Label>
                  <p className="text-[#C0E6FF]/70 text-xs">
                    Pinned posts appear at the top of your channel
                  </p>
                </div>
              </div>
              <Switch
                id="pin-post"
                checked={formData.isPinned}
                onCheckedChange={(checked) => handleInputChange('isPinned', checked)}
              />
            </div>

            {/* Publish Options */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-[#C0E6FF]" />
                <div>
                  <Label htmlFor="publish-now" className="text-white text-sm">
                    Publish immediately
                  </Label>
                  <p className="text-[#C0E6FF]/70 text-xs">
                    Post will be visible to subscribers right away
                  </p>
                </div>
              </div>
              <Switch
                id="publish-now"
                checked={formData.publishNow}
                onCheckedChange={(checked) => handleInputChange('publishNow', checked)}
              />
            </div>

            {/* Scheduled Publishing */}
            {!formData.publishNow && (
              <div className="space-y-2">
                <Label htmlFor="scheduled-date" className="text-white text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Schedule for later
                </Label>
                <Input
                  id="scheduled-date"
                  type="datetime-local"
                  value={formData.scheduledDate}
                  onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                  className="bg-[#030f1c] border-[#C0E6FF]/20 text-white"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            )}
          </div>

          {/* Preview Info */}
          <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h4 className="text-blue-400 font-medium text-sm">Post Preview</h4>
                <p className="text-[#C0E6FF]/70 text-xs mt-1">
                  This post will be visible to all {channel.subscribers} subscribers of your {channel.name} channel. 
                  Subscribers will be able to reply to your post but cannot create new posts in your channel.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 border-[#C0E6FF]/30 text-[#C0E6FF] hover:bg-[#C0E6FF]/10"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white"
              disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {formData.publishNow ? 'Publish Post' : 'Schedule Post'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
