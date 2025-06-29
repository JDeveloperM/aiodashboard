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
import { createClient } from '@supabase/supabase-js'
import { useSubscription } from "@/contexts/subscription-context"
import { useSuiAuth } from "@/contexts/sui-auth-context"
import { toast } from "sonner"
import { Plus, Loader2 } from "lucide-react"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const createTopicSchema = z.object({
  name: z.string().min(5, "Topic name must be at least 5 characters").max(100, "Topic name must be less than 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description must be less than 500 characters")
})

type CreateTopicForm = z.infer<typeof createTopicSchema>

interface CreateTopicModalProps {
  categoryId: string
  categoryName: string
  onTopicCreated?: () => void
  children?: React.ReactNode
}

export function CreateTopicModal({ categoryId, categoryName, onTopicCreated, children }: CreateTopicModalProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { tier } = useSubscription()
  const { user } = useSuiAuth()

  const form = useForm<CreateTopicForm>({
    resolver: zodResolver(createTopicSchema),
    defaultValues: {
      name: "",
      description: ""
    }
  })

  const onSubmit = async (data: CreateTopicForm) => {
    if (!user?.address) {
      toast.error("Please connect your wallet to create a topic")
      return
    }

    setIsSubmitting(true)
    try {
      console.log('🚀 Creating topic with data:', {
        categoryId,
        name: data.name,
        description: data.description,
        access_level: 'ALL',
        sort_order: 999
      })

      // Create the topic
      const { data: topicData, error: topicError } = await supabase
        .from('forum_topics')
        .insert({
          category_id: categoryId,
          name: data.name,
          description: data.description,
          access_level: 'ALL', // Default access level
          sort_order: 999, // Will be at the end
          is_active: true // Explicitly set as active
        })
        .select('id')
        .single()

      console.log('📝 Topic creation result:', { topicData, topicError })

      if (topicError) {
        console.error('❌ Topic creation failed:', topicError)
        throw topicError
      }

      if (!topicData) {
        console.error('❌ No topic data returned')
        throw new Error('No topic data returned from database')
      }

      console.log('✅ Topic created successfully with ID:', topicData.id)
      toast.success("Topic created successfully!")
      form.reset()
      setOpen(false)
      onTopicCreated?.()
    } catch (error) {
      console.error("Error creating topic:", error)
      toast.error(`Failed to create topic: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
            New Topic
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-[#030f1c] border-[#C0E6FF]/20 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Topic in {categoryName}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Topic Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#C0E6FF]">Topic Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter topic name..."
                      className="bg-[#1a2f51] border-[#C0E6FF]/20 text-white placeholder:text-[#C0E6FF]/50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Topic Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#C0E6FF]">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what this topic is about..."
                      className="bg-[#1a2f51] border-[#C0E6FF]/20 text-white placeholder:text-[#C0E6FF]/50 min-h-[80px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-between items-center">
                    <FormMessage />
                    <span className="text-xs text-[#C0E6FF]/50">
                      {field.value.length}/500 characters
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
                    <Plus className="w-4 h-4 mr-2" />
                    Create Topic
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
