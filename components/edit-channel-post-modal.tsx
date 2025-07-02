"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { CheckCircle, Loader2 } from "lucide-react"
import { useSuiAuth } from "@/contexts/sui-auth-context"
import { forumService } from "@/lib/forum-service"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { toast } from "sonner"

interface EditChannelPostModalProps {
  isOpen: boolean
  onClose: () => void
  post: {
    id: string
    title: string
    content: string
    is_pinned?: boolean
  } | null
  onPostUpdated: () => void
}

export function EditChannelPostModal({
  isOpen,
  onClose,
  post,
  onPostUpdated
}: EditChannelPostModalProps) {
  const { user } = useSuiAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    isPinned: false
  })

  // Initialize form data when post changes
  useEffect(() => {
    if (post && isOpen) {
      console.log('🔄 Initializing edit form with post data:', {
        postId: post.id,
        title: post.title,
        content: post.content,
        contentLength: post.content?.length,
        isPinned: post.is_pinned,
        hasImages: post.content?.includes('<img') || post.content?.includes('data:image'),
        contentPreview: post.content?.substring(0, 200)
      })

      setFormData({
        title: post.title || "",
        content: post.content || "",
        isPinned: post.is_pinned || false
      })
    } else {
      console.log('🔄 Edit form not initialized:', { post: !!post, isOpen })
    }
  }, [post, isOpen])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: "",
        content: "",
        isPinned: false
      })
      setIsSubmitting(false)
    }
  }, [isOpen])

  // Debug: Log form data changes
  useEffect(() => {
    console.log('📝 Form data updated:', {
      title: formData.title,
      contentLength: formData.content?.length,
      contentPreview: formData.content?.substring(0, 200),
      hasImages: formData.content?.includes('<img') || formData.content?.includes('data:image'),
      fullContent: formData.content // Show full content to see what's actually there
    })
  }, [formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.address || !post) {
      toast.error("Authentication required")
      return
    }

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Title and content are required")
      return
    }

    setIsSubmitting(true)

    try {
      console.log('🔄 Updating post:', {
        postId: post.id,
        userAddress: user.address,
        originalTitle: post.title,
        newTitle: formData.title,
        originalContent: post.content?.substring(0, 100),
        newContent: formData.content?.substring(0, 100),
        contentLength: formData.content.length
      })

      const result = await forumService.updateCreatorChannelPost(
        post.id,
        user.address,
        {
          title: formData.title,
          content: formData.content,
          isPinned: formData.isPinned
        }
      )

      console.log('📝 Update result:', result)

      if (!result.success) {
        console.error('❌ Update failed:', result.error)
        toast.error(result.error || 'Failed to update post')
        return
      }

      console.log('✅ Post updated successfully')
      onPostUpdated()
      toast.success("Post updated successfully!")
      onClose()
      
    } catch (error) {
      console.error('❌ Exception during post update:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error(`Failed to update post: ${errorMessage}`)
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

  if (!post) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#030f1c] border-[#1a2f51] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#4DA2FF]">
            Edit Channel Post
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Post Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-[#C0E6FF]">
              Post Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter your post title..."
              className="bg-[#1a2f51] border-[#C0E6FF]/20 text-white placeholder:text-[#C0E6FF]/50"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Post Content */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium text-[#C0E6FF]">
              Post Content *
            </Label>
            <div className="min-h-[200px]">
              <RichTextEditor
                key={`edit-${post?.id}-${isOpen}`}
                content={formData.content}
                onChange={(content) => handleInputChange('content', content)}
                placeholder="Write your post content..."
                className="bg-[#1a2f51] border-[#C0E6FF]/20"
              />
            </div>
          </div>

          {/* Pin Post Option */}
          <div className="flex items-center justify-between p-4 bg-[#1a2f51] rounded-lg border border-[#C0E6FF]/10">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-[#C0E6FF]">
                Pin Post
              </Label>
              <p className="text-xs text-[#C0E6FF]/70">
                Pinned posts appear at the top of your channel
              </p>
            </div>
            <Switch
              checked={formData.isPinned}
              onCheckedChange={(checked) => handleInputChange('isPinned', checked)}
              disabled={isSubmitting}
            />
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
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Update Post
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
