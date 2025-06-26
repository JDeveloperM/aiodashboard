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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ForumTopic, forumService } from "@/lib/forum-service"
import { useSubscription } from "@/contexts/subscription-context"
import { useSuiAuth } from "@/contexts/sui-auth-context"
import { toast } from "sonner"
import { Plus, Crown, Star, Loader2 } from "lucide-react"

const createPostSchema = z.object({
  topic_id: z.string().min(1, "Please select a topic"),
  title: z.string().min(5, "Title must be at least 5 characters").max(200, "Title must be less than 200 characters"),
  content: z.string().min(10, "Content must be at least 10 characters").max(5000, "Content must be less than 5000 characters"),
  content_type: z.enum(["text", "markdown"]).default("text")
})

type CreatePostForm = z.infer<typeof createPostSchema>

interface CreatePostModalProps {
  topics: ForumTopic[]
  onPostCreated?: () => void
  children?: React.ReactNode
}

export function CreatePostModal({ topics, onPostCreated, children }: CreatePostModalProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { tier } = useSubscription()
  const { user } = useSuiAuth()

  const form = useForm<CreatePostForm>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      topic_id: "",
      title: "",
      content: "",
      content_type: "text"
    }
  })

  const getTierIcon = (accessLevel: string) => {
    switch (accessLevel) {
      case 'ROYAL': return <Crown className="w-3 h-3 text-yellow-400" />
      case 'PRO': return <Star className="w-3 h-3 text-purple-400" />
      default: return null
    }
  }

  const canAccessTopic = (topic: ForumTopic) => {
    if (topic.access_level === 'ALL') return true
    if (topic.access_level === 'PRO') return tier === 'PRO' || tier === 'ROYAL'
    if (topic.access_level === 'ROYAL') return tier === 'ROYAL'
    if (topic.access_level === 'CREATORS') return tier === 'PRO' || tier === 'ROYAL'
    return false
  }

  const accessibleTopics = topics.filter(canAccessTopic)

  const onSubmit = async (data: CreatePostForm) => {
    if (!user?.address) {
      toast.error("Please connect your wallet to create a post")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await forumService.createPost(
        user.address,
        {
          topic_id: data.topic_id,
          title: data.title,
          content: data.content,
          content_type: data.content_type
        },
        tier
      )

      if (result.success) {
        toast.success("Post created successfully!")
        form.reset()
        setOpen(false)
        onPostCreated?.()
      } else {
        toast.error(result.error || "Failed to create post")
      }
    } catch (error) {
      console.error("Error creating post:", error)
      toast.error("Failed to create post")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-[#4DA2FF] hover:bg-[#3d8ae6] text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-[#030f1c] border-[#C0E6FF]/20 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Post</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Topic Selection */}
            <FormField
              control={form.control}
              name="topic_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#C0E6FF]">Topic</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-[#1a2f51] border-[#C0E6FF]/20 text-white">
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#030f1c] border-[#C0E6FF]/20">
                      {accessibleTopics.map((topic) => (
                        <SelectItem 
                          key={topic.id} 
                          value={topic.id}
                          className="text-[#C0E6FF] hover:bg-[#1a2f51] focus:bg-[#1a2f51]"
                        >
                          <div className="flex items-center gap-2">
                            <span>{topic.name}</span>
                            {topic.access_level !== 'ALL' && getTierIcon(topic.access_level)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Post Title */}
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

            {/* Post Content */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#C0E6FF]">Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your post content..."
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

            {/* Content Type Selection */}
            <FormField
              control={form.control}
              name="content_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#C0E6FF]">Format</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-[#1a2f51] border-[#C0E6FF]/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#030f1c] border-[#C0E6FF]/20">
                      <SelectItem 
                        value="text"
                        className="text-[#C0E6FF] hover:bg-[#1a2f51] focus:bg-[#1a2f51]"
                      >
                        Plain Text
                      </SelectItem>
                      <SelectItem 
                        value="markdown"
                        className="text-[#C0E6FF] hover:bg-[#1a2f51] focus:bg-[#1a2f51]"
                      >
                        Markdown
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
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
                    <Plus className="w-4 h-4 mr-2" />
                    Create Post
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
