"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { forumService, ForumPost } from "@/lib/forum-service"
import { useSubscription } from "@/contexts/subscription-context"
import { useSuiAuth } from "@/contexts/sui-auth-context"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { toast } from "sonner"
import { MessageSquare, Loader2 } from "lucide-react"

const createReplySchema = z.object({
  content: z.string().min(10, "Reply must be at least 10 characters").max(5000, "Reply must be less than 5000 characters"),
  content_type: z.enum(["text", "markdown", "html"]).default("html")
})

type CreateReplyForm = z.infer<typeof createReplySchema>

interface CreateReplyModalProps {
  topicId: string
  topicName: string
  onReplyCreated?: () => void
  children?: React.ReactNode
  replyToPost?: ForumPost
}

export function CreateReplyModal({ topicId, topicName, onReplyCreated, children, replyToPost }: CreateReplyModalProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { tier } = useSubscription()
  const { user, isSignedIn } = useSuiAuth()
  const currentAccount = useCurrentAccount()

  const form = useForm<CreateReplyForm>({
    resolver: zodResolver(createReplySchema),
    defaultValues: {
      content: "",
      content_type: "html"
    }
  })

  const onSubmit = async (data: CreateReplyForm) => {
    if (!isSignedIn) {
      toast.error("Please connect your wallet to create a reply")
      return
    }

    const userAddress = user?.address || currentAccount?.address
    if (!userAddress) {
      toast.error("Please connect your wallet to continue")
      return
    }

    // This modal should only be used for replies, not new posts
    if (!replyToPost) {
      toast.error("This modal is for replies only. Use the New Post button to create a new discussion.")
      return
    }

    setIsSubmitting(true)
    try {
      // Use createUserReply for replies instead of createPost
      const result = await forumService.createUserReply(
        userAddress,
        {
          topic_id: topicId,
          title: `Re: ${replyToPost.title || 'Post'}`,
          content: data.content,
          parent_post_id: replyToPost.id
        },
        tier
      )

      if (result.success) {
        toast.success("Reply posted successfully!")
        form.reset()
        setOpen(false)
        // Call the callback after a short delay to ensure database update
        setTimeout(() => {
          onReplyCreated?.()
        }, 300)
      } else {
        console.error("Forum service error:", result.error)
        toast.error(result.error || "Failed to post reply")
      }
    } catch (error) {
      console.error("Error creating reply:", error)
      toast.error("Failed to post reply")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-[#4DA2FF] hover:bg-[#3d8ae6] text-white">
            <MessageSquare className="w-4 h-4 mr-2" />
            Reply
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-[#030f1c] border-[#C0E6FF]/20 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white text-lg">
            Reply to {replyToPost?.author_username || 'User'}
          </DialogTitle>
          {replyToPost && (
            <div className="bg-[#1a2f51] border-l-4 border-[#4DA2FF] p-3 mt-2 rounded-r-md">
              <div className="flex items-center gap-2">
                <p className="text-sm text-[#C0E6FF]/70">Replying to:</p>
                <Badge className="bg-gradient-to-r from-blue-400 to-blue-600 text-white text-xs">
                  {replyToPost.author_username || `User ${replyToPost.author_address.slice(0, 6)}`}
                </Badge>
              </div>
            </div>
          )}
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title field removed - replies don't need titles */}

            {/* Reply Content */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#C0E6FF]">Your Reply</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your reply..."
                      className="bg-[#1a2f51] border-[#C0E6FF]/20 text-white placeholder:text-[#C0E6FF]/50 min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-between items-center">
                    <FormMessage />
                    <span className="text-xs text-[#C0E6FF]/50">
                      {field.value.length}/5000 characters
                    </span>
                  </div>
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="border-[#C0E6FF]/20 text-[#C0E6FF] hover:bg-[#1a2f51]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#4DA2FF] hover:bg-[#3d8ae6] text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Post Reply
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
