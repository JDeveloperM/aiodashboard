"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { WalrusProfileImage } from "@/components/walrus-profile-image"
import { WalrusCoverImage } from "@/components/walrus-cover-image"
import {
  Form,
  FormControl,
  FormDescription,
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
import { CheckCircle, X, Coins } from "lucide-react"
import type { Channel } from "@/contexts/creators-context"

// Form validation schema
const editChannelSchema = z.object({
  channelName: z.string().min(3, "Channel name must be at least 3 characters"),
  channelDescription: z.string().min(10, "Description must be at least 10 characters"),
  channelLanguage: z.string().min(1, "Please select a language"),
  creatorRole: z.string().min(1, "Please select your role"),
  channelCategories: z.array(z.string()).min(1, "Select at least one category"),
  maxSubscribers: z.number().min(0, "Max subscribers must be 0 or greater"),
  telegramUsername: z.string().min(3, "Telegram username must be at least 3 characters"),
  isPremium: z.boolean(),
  subscriptionPackages: z.array(z.string()).optional(),
  tipPricing: z.object({
    thirtyDays: z.number().min(0, "Price must be 0 or greater"),
    sixtyDays: z.number().min(0, "Price must be 0 or greater"),
    ninetyDays: z.number().min(0, "Price must be 0 or greater"),
  }),
})

type EditChannelFormData = z.infer<typeof editChannelSchema>

interface EditChannelModalProps {
  isOpen: boolean
  onClose: () => void
  channel: Channel | null
  creatorId: string
  onSave: (channelId: string, updatedData: Partial<Channel>) => Promise<void>
}

export function EditChannelModal({ 
  isOpen, 
  onClose, 
  channel, 
  creatorId, 
  onSave 
}: EditChannelModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profileImage, setProfileImage] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [profileImageBlobId, setProfileImageBlobId] = useState("")
  const [coverImageBlobId, setCoverImageBlobId] = useState("")

  const form = useForm<EditChannelFormData>({
    resolver: zodResolver(editChannelSchema),
    defaultValues: {
      channelName: "",
      channelDescription: "",
      channelLanguage: "",
      creatorRole: "",
      channelCategories: [],
      maxSubscribers: 0,
      telegramUsername: "",
      isPremium: false,
      subscriptionPackages: [],
      tipPricing: {
        thirtyDays: 0,
        sixtyDays: 0,
        ninetyDays: 0,
      },
    },
  })

  // Populate form when channel changes
  useEffect(() => {
    if (channel && isOpen) {
      const telegramUsername = channel.telegramUrl?.replace('https://t.me/', '') || ''

      // Initialize form data
      form.reset({
        channelName: channel.name,
        channelDescription: channel.description,
        channelLanguage: (channel as any).channelLanguage || '',
        creatorRole: (channel as any).channelRole || '',
        channelCategories: (channel as any).channelCategories || [],
        maxSubscribers: channel.availability?.maxSlots || 0,
        telegramUsername: telegramUsername,
        isPremium: channel.type === 'premium',
        subscriptionPackages: channel.subscriptionPackages || [],
        tipPricing: {
          thirtyDays: channel.pricing?.thirtyDays || 0,
          sixtyDays: channel.pricing?.sixtyDays || 0,
          ninetyDays: channel.pricing?.ninetyDays || 0,
        },
      })

      // Initialize channel images
      const channelData = channel as any
      setProfileImage(channelData.channelAvatar || '')
      setCoverImage(channelData.channelCover || '')
      setProfileImageBlobId(channelData.channelAvatarBlobId || '')
      setCoverImageBlobId(channelData.channelCoverBlobId || '')
    }
  }, [channel, isOpen, form])

  const handleProfileImageUpdate = (imageUrl: string, blobId?: string) => {
    setProfileImage(imageUrl)
    setProfileImageBlobId(blobId || "")
  }

  const handleCoverImageUpdate = (imageUrl: string, blobId?: string) => {
    setCoverImage(imageUrl)
    setCoverImageBlobId(blobId || "")
  }

  const handleProfileImageRemove = () => {
    setProfileImage("")
    setProfileImageBlobId("")
  }

  const handleCoverImageRemove = () => {
    setCoverImage("")
    setCoverImageBlobId("")
  }

  const onSubmit = async (data: EditChannelFormData) => {
    if (!channel) return

    setIsSubmitting(true)
    try {
      // Prepare updated channel data
      const updatedChannel: Partial<Channel> = {
        name: data.channelName,
        description: data.channelDescription,
        type: data.isPremium ? "premium" : "free",
        price: data.isPremium && data.subscriptionPackages?.includes("30")
          ? (data.tipPricing.thirtyDays || 0)
          : 0,
        telegramUrl: `https://t.me/${data.telegramUsername}`,
        subscriptionPackages: data.isPremium ? data.subscriptionPackages : undefined,
        pricing: data.isPremium ? {
          thirtyDays: data.tipPricing.thirtyDays,
          sixtyDays: data.tipPricing.sixtyDays,
          ninetyDays: data.tipPricing.ninetyDays,
        } : undefined,
        availability: data.maxSubscribers > 0 ? {
          hasLimit: true,
          currentSlots: channel.availability?.currentSlots || 0,
          maxSlots: data.maxSubscribers,
          status: 'available' as const
        } : { hasLimit: false, status: 'available' as const },
        // Channel-specific data
        channelCategories: data.channelCategories,
        channelLanguage: data.channelLanguage,
        channelRole: data.creatorRole,
        // Channel-specific images (only update if new images were uploaded)
        ...(profileImage && { channelAvatar: profileImage }),
        ...(coverImage && { channelCover: coverImage }),
        ...(profileImageBlobId && { channelAvatarBlobId: profileImageBlobId }),
        ...(coverImageBlobId && { channelCoverBlobId: coverImageBlobId }),
      }

      await onSave(channel.id, updatedChannel)
      toast.success('Channel updated successfully!')
      onClose()
    } catch (error) {
      console.error('Failed to update channel:', error)
      toast.error('Failed to update channel')
    } finally {
      setIsSubmitting(false)
    }
  }

  const categories = [
    "Trading", "DeFi", "Analysis", "Education", "NFTs", "Gaming", 
    "News", "Technical Analysis", "Altcoins", "Bitcoin", "Ethereum"
  ]

  const languages = [
    "English", "Spanish", "French", "German", "Italian", "Portuguese",
    "Russian", "Chinese", "Japanese", "Korean", "Arabic", "Hindi"
  ]

  const roles = [
    "Crypto Trader", "DeFi Expert", "NFT Collector", "Blockchain Developer",
    "Market Analyst", "Content Creator", "Educator", "Influencer"
  ]

  if (!channel) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#030f1c] border-[#C0E6FF]/20">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">
            Edit Channel: {channel.name}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Images Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Image */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#C0E6FF]">Channel Avatar</label>
                <WalrusProfileImage
                  currentImage={profileImage}
                  currentBlobId={profileImageBlobId}
                  onImageUpdate={handleProfileImageUpdate}
                  onImageRemove={handleProfileImageRemove}
                  editable={true}
                  size="xl"
                  fallbackText={channel?.name?.charAt(0) || "C"}
                />
                <p className="text-xs text-gray-400">Recommended: 400x400px, max 5MB</p>
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#C0E6FF]">Channel Cover</label>
                <WalrusCoverImage
                  currentImage={coverImage}
                  currentBlobId={coverImageBlobId}
                  onImageUpdate={handleCoverImageUpdate}
                  onImageRemove={handleCoverImageRemove}
                  editable={true}
                />
                <p className="text-xs text-gray-400">Recommended: 1200x400px, max 5MB</p>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="channelName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#C0E6FF]">Channel Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter channel name"
                        className="bg-[#1a2f51] border-[#C0E6FF]/30 text-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telegramUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#C0E6FF]">Telegram Username *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="your_channel"
                        className="bg-[#1a2f51] border-[#C0E6FF]/30 text-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="channelDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#C0E6FF]">Channel Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your channel..."
                      className="bg-[#1a2f51] border-[#C0E6FF]/30 text-white min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Language and Role */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="channelLanguage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#C0E6FF]">Primary Language *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[#1a2f51] border-[#C0E6FF]/30 text-white">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {languages.map((language) => (
                          <SelectItem key={language} value={language}>
                            {language}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="creatorRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#C0E6FF]">Your Role *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[#1a2f51] border-[#C0E6FF]/30 text-white">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Categories */}
            <FormField
              control={form.control}
              name="channelCategories"
              render={() => (
                <FormItem>
                  <FormLabel className="text-[#C0E6FF]">Channel Categories *</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {categories.map((category) => (
                      <FormField
                        key={category}
                        control={form.control}
                        name="channelCategories"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={category}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(category)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, category])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== category
                                          )
                                        )
                                  }}
                                  className="border-[#C0E6FF]/30"
                                />
                              </FormControl>
                              <FormLabel className="text-sm text-[#C0E6FF] font-normal">
                                {category}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Premium Settings */}
            <div className="space-y-4 p-4 bg-[#1a2f51] rounded-lg">
              <FormField
                control={form.control}
                name="isPremium"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel className="text-[#C0E6FF]">Premium Channel</FormLabel>
                      <FormDescription className="text-gray-400">
                        Enable paid access to your channel
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("isPremium") && (
                <div className="space-y-4 pt-4 border-t border-[#C0E6FF]/20">
                  {/* Subscription Packages */}
                  <FormField
                    control={form.control}
                    name="subscriptionPackages"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-[#C0E6FF]">Available Packages</FormLabel>
                        <div className="flex gap-4">
                          {["30", "60", "90"].map((days) => (
                            <FormField
                              key={days}
                              control={form.control}
                              name="subscriptionPackages"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={days}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(days)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value || [], days])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== days
                                                )
                                              )
                                        }}
                                        className="border-[#C0E6FF]/30"
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm text-[#C0E6FF] font-normal">
                                      {days} days
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Pricing */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="tipPricing.thirtyDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#C0E6FF]">30 Days (SUI)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              placeholder="0.0"
                              className="bg-[#030f1c] border-[#C0E6FF]/30 text-white"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tipPricing.sixtyDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#C0E6FF]">60 Days (SUI)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              placeholder="0.0"
                              className="bg-[#030f1c] border-[#C0E6FF]/30 text-white"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tipPricing.ninetyDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#C0E6FF]">90 Days (SUI)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              placeholder="0.0"
                              className="bg-[#030f1c] border-[#C0E6FF]/30 text-white"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Max Subscribers */}
            <FormField
              control={form.control}
              name="maxSubscribers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#C0E6FF]">Max Subscribers (0 = unlimited)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      className="bg-[#1a2f51] border-[#C0E6FF]/30 text-white"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription className="text-gray-400">
                    Set a limit on how many users can subscribe to your channel
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="border-[#C0E6FF]/30 text-[#C0E6FF] hover:bg-[#C0E6FF]/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#4da2ffcc] hover:bg-[#4da2ff] text-white"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Update Channel
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
