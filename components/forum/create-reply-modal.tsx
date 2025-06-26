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
import { toast } from "sonner"
import { MessageSquare, Loader2 } from "lucide-react"

const createReplySchema = z.object({
  title: z.string().optional(),
  content: z.string().min(10, "Content must be at least 10 characters").max(5000, "Content must be less than 5000 characters"),
  content_type: z.enum(["text", "markdown"]).default("text")
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
  const { user } = useSuiAuth()

  const form = useForm<CreateReplyForm>({
    resolver: zodResolver(createReplySchema),
    defaultValues: {
      title: "",
      content: "",
      content_type: "text"
    }
  })

  const onSubmit = async (data: CreateReplyForm) => {
    if (!user?.address) {
      toast.error("Please connect your wallet to create a post")
      return
    }

    // Validate title for new posts
    if (!replyToPost && (!data.title || data.title.trim().length < 5)) {
      toast.error("Title is required and must be at least 5 characters")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await forumService.createPost(
        user.address,
        {
          topic_id: topicId,
          title: replyToPost ? `Re: ${replyToPost.title || 'Post'}` : (data.title || "Untitled Post"),
          content: data.content,
          content_type: data.content_type
        },
        tier
      )

      if (result.success) {
        toast.success(replyToPost ? "Reply posted successfully!" : "Post created successfully!")
        form.reset()
        setOpen(false)
        // Call the callback after a short delay to ensure database update
        setTimeout(() => {
          onReplyCreated?.()
        }, 300)
      } else {
        console.error("Forum service error:", result.error)
        toast.error(result.error || (replyToPost ? "Failed to post reply" : "Failed to create post"))
      }
    } catch (error) {
      console.error("Error creating post:", error)
      toast.error(replyToPost ? "Failed to post reply" : "Failed to create post")
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
            {replyToPost ? `Reply to ${replyToPost.author_username || 'User'}` : `New Post in ${topicName}`}
          </DialogTitle>
          {replyToPost && (
            <div className="bg-[#1a2f51] border-l-4 border-[#4DA2FF] p-3 mt-2 rounded-r-md">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm text-[#C0E6FF]/70">Replying to:</p>
                <Badge className="bg-gradient-to-r from-blue-400 to-blue-600 text-white text-xs">
                  {replyToPost.author_username || `User ${replyToPost.author_address.slice(0, 6)}`}
                </Badge>
              </div>
              <p className="text-[#C0E6FF] text-sm line-clamp-3 italic">"{replyToPost.content}"</p>
            </div>
          )}
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Post Title - only show if not replying to a post */}
            {!replyToPost && (
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#C0E6FF]">Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your post title..."
                        className="bg-[#1a2f51] border-[#C0E6FF]/20 text-white placeholder:text-[#C0E6FF]/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Post Content */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#C0E6FF]">
                    {replyToPost ? 'Your Reply' : 'Content'}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={replyToPost ? "Write your reply..." : "Write your post content..."}
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
                    {replyToPost ? 'Post Reply' : 'Create Post'}
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
