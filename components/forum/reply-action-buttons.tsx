"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, MessageCircle, Loader2 } from "lucide-react"
import { forumService } from "@/lib/forum-service"
import { toast } from "sonner"

interface ReplyActionButtonsProps {
  replyId: string
  replyAuthor: string
  replyContent: string
  currentUserAddress: string
  topicCreatorId: string
  replyAuthorAddress: string
  onReplyDeleted?: () => void
  onAnswerCreated?: () => void
}

export function ReplyActionButtons({
  replyId,
  replyAuthor,
  replyContent,
  currentUserAddress,
  topicCreatorId,
  replyAuthorAddress,
  onReplyDeleted,
  onAnswerCreated
}: ReplyActionButtonsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAnswerDialog, setShowAnswerDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAnswering, setIsAnswering] = useState(false)
  const [answerContent, setAnswerContent] = useState("")

  // Check if current user is the creator of the channel
  const isCreator = currentUserAddress && topicCreatorId &&
    currentUserAddress.toLowerCase() === topicCreatorId.toLowerCase()

  // Check if this reply is from the creator (creator answer)
  const isCreatorAnswer = replyAuthorAddress && topicCreatorId &&
    replyAuthorAddress.toLowerCase() === topicCreatorId.toLowerCase()

  // Always log for debugging
  console.log('🔍 ReplyActionButtons: Creator check:', {
    currentUserAddress,
    topicCreatorId,
    replyAuthorAddress,
    currentUserAddressType: typeof currentUserAddress,
    topicCreatorIdType: typeof topicCreatorId,
    replyAuthorAddressType: typeof replyAuthorAddress,
    currentUserAddressLength: currentUserAddress?.length,
    topicCreatorIdLength: topicCreatorId?.length,
    replyAuthorAddressLength: replyAuthorAddress?.length,
    isCreator,
    isCreatorAnswer,
    replyId,
    addressesMatch: currentUserAddress?.toLowerCase() === topicCreatorId?.toLowerCase(),
    replyAuthorMatchesCreator: replyAuthorAddress?.toLowerCase() === topicCreatorId?.toLowerCase()
  })

  // Don't render anything if:
  // 1. User is not the creator, OR
  // 2. This is a creator answer (creators shouldn't moderate their own answers)
  if (!isCreator) {
    console.log('🚫 ReplyActionButtons: Not rendering buttons - not creator')
    return null
  }

  if (isCreatorAnswer) {
    console.log('🚫 ReplyActionButtons: Not rendering buttons - creator answer')
    return null
  }

  console.log('✅ ReplyActionButtons: Rendering buttons for creator on user reply')

  const handleDeleteReply = async () => {
    if (!currentUserAddress) {
      toast.error("User address not found")
      return
    }

    setIsDeleting(true)
    try {
      const result = await forumService.deleteReply(currentUserAddress, replyId)
      
      if (result.success) {
        toast.success("Reply deleted successfully")
        setShowDeleteDialog(false)
        onReplyDeleted?.()
      } else {
        toast.error(result.error || "Failed to delete reply")
      }
    } catch (error) {
      console.error("Error deleting reply:", error)
      toast.error("Failed to delete reply")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCreateAnswer = async () => {
    if (!currentUserAddress || !answerContent.trim()) {
      toast.error("Please enter your answer")
      return
    }

    setIsAnswering(true)
    try {
      const result = await forumService.createCreatorAnswer(
        currentUserAddress, 
        replyId, 
        answerContent.trim()
      )
      
      if (result.success) {
        toast.success("Answer posted successfully")
        setShowAnswerDialog(false)
        setAnswerContent("")
        onAnswerCreated?.()
      } else {
        console.error("❌ API create answer failed - detailed error:", result)
        toast.error(result.error || "Failed to post answer")
      }
    } catch (error) {
      console.error("Error creating answer:", error)
      toast.error("Failed to post answer")
    } finally {
      setIsAnswering(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-1 ml-2">
        {/* Delete Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
          className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
          title="Delete inappropriate reply"
        >
          <Trash2 className="w-3 h-3" />
        </Button>

        {/* Answer Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAnswerDialog(true)}
          className="h-6 w-6 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
          title="Answer this reply"
        >
          <MessageCircle className="w-3 h-3" />
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-[#1a2f51] border-[#C0E6FF]/20">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Reply</DialogTitle>
            <DialogDescription className="text-[#C0E6FF]/70">
              Are you sure you want to delete this reply? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-[#0f1a2e] p-3 rounded-md border border-[#C0E6FF]/10">
            <p className="text-sm text-[#C0E6FF]/60 mb-1">Reply from: {replyAuthor}</p>
            <p className="text-sm text-[#C0E6FF] line-clamp-3">{replyContent}</p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
              className="border-[#C0E6FF]/20 text-[#C0E6FF] hover:bg-[#030f1c]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteReply}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Reply
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Answer Dialog */}
      <Dialog open={showAnswerDialog} onOpenChange={setShowAnswerDialog}>
        <DialogContent className="bg-[#1a2f51] border-[#C0E6FF]/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Answer Reply</DialogTitle>
            <DialogDescription className="text-[#C0E6FF]/70">
              Respond to this user's reply as the channel creator.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-[#0f1a2e] p-3 rounded-md border border-[#C0E6FF]/10 mb-4">
            <p className="text-sm text-[#C0E6FF]/60 mb-1">Replying to: {replyAuthor}</p>
            <p className="text-sm text-[#C0E6FF] line-clamp-3">{replyContent}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Your Answer</label>
            <Textarea
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
              placeholder="Type your answer here..."
              className="min-h-[120px] bg-[#0f1a2e] border-[#C0E6FF]/20 text-[#C0E6FF] placeholder:text-[#C0E6FF]/40 focus:border-[#4DA2FF] resize-none"
              disabled={isAnswering}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAnswerDialog(false)
                setAnswerContent("")
              }}
              disabled={isAnswering}
              className="border-[#C0E6FF]/20 text-[#C0E6FF] hover:bg-[#030f1c]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateAnswer}
              disabled={isAnswering || !answerContent.trim()}
              className="bg-[#4DA2FF] hover:bg-[#3d8ae6] text-white"
            >
              {isAnswering ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Post Answer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
