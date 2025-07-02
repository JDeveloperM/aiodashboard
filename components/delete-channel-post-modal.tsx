"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2, AlertTriangle, Loader2 } from "lucide-react"
import { useSuiAuth } from "@/contexts/sui-auth-context"
import { forumService } from "@/lib/forum-service"
import { toast } from "sonner"

interface DeleteChannelPostModalProps {
  isOpen: boolean
  onClose: () => void
  post: {
    id: string
    title: string
  } | null
  onPostDeleted: () => void
}

export function DeleteChannelPostModal({
  isOpen,
  onClose,
  post,
  onPostDeleted
}: DeleteChannelPostModalProps) {
  const { user } = useSuiAuth()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!user?.address || !post) {
      toast.error("Authentication required")
      return
    }

    setIsDeleting(true)

    try {
      console.log('🗑️ Deleting post:', {
        postId: post.id,
        userAddress: user.address,
        title: post.title
      })

      const result = await forumService.deleteCreatorChannelPost(
        post.id,
        user.address
      )

      console.log('🗑️ Delete result:', result)

      if (!result.success) {
        console.error('❌ Delete failed:', result.error)
        toast.error(result.error || 'Failed to delete post')
        return
      }

      console.log('✅ Post deleted successfully')
      onPostDeleted()
      toast.success("Post deleted successfully!")
      onClose()
      
    } catch (error) {
      console.error('❌ Exception during post deletion:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error(`Failed to delete post: ${errorMessage}`)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!post) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#030f1c] border-[#1a2f51] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Delete Post
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-[#C0E6FF] text-sm">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
          </div>

          <div className="p-3 bg-[#1a2f51] rounded-lg border border-[#C0E6FF]/10">
            <p className="text-xs text-[#C0E6FF]/70 mb-1">Post Title:</p>
            <p className="text-white font-medium truncate">{post.title}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 border-[#C0E6FF]/30 text-[#C0E6FF] hover:bg-[#C0E6FF]/10"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Post
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
