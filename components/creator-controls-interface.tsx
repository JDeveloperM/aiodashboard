"use client"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useCreatorsDatabase } from "@/contexts/creators-database-context"
import { useSubscription } from "@/contexts/subscription-context"
import { useRouter } from "next/navigation"
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit"
import { useSuiAuth } from "@/contexts/sui-auth-context"
import { createWalrusSigner } from "@/lib/walrus-signer-adapter"
import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import {
  Upload,
  Camera,
  X,
  Plus,
  Minus,
  CheckCircle,
  Users,
  Coins,
  Play,
  FileText,
  BookOpen,
  TrendingUp,
  MessageCircle,
  Lock
} from "lucide-react"
import { toast } from "sonner"
import { EditChannelModal } from "./edit-channel-modal"
import { CreatorContentDashboard } from "./creator-content-dashboard"

// Form validation schema
const creatorFormSchema = z.object({
  channelName: z.string().min(3, "Channel name must be at least 3 characters").max(50, "Channel name must be less than 50 characters"),
  channelDescription: z.string().min(10, "Description must be at least 10 characters").max(500, "Description must be less than 500 characters"),
  channelLanguage: z.string().min(1, "Please select a language"),
  creatorRole: z.string().min(1, "Please select your role/profession"),
  channelCategories: z.array(z.string()).min(1, "Select at least 1 category").max(3, "Select maximum 3 categories"),
  maxSubscribers: z.number().min(0, "Must be 0 or greater"),
  isPremium: z.boolean(),
  subscriptionPackages: z.array(z.string()).optional(),
  tipPricing: z.object({
    thirtyDays: z.number().min(0, "Price must be 0 or greater").optional(),
    sixtyDays: z.number().min(0, "Price must be 0 or greater").optional(),
    ninetyDays: z.number().min(0, "Price must be 0 or greater").optional(),
  }),
  agreeToTerms: z.boolean().refine(val => val === true, "You must agree to the Terms & Conditions"),
})

type CreatorFormData = z.infer<typeof creatorFormSchema>

// Constants for form options
const LANGUAGES = [
  // Major European Languages
  "English", "Spanish", "French", "German", "Italian", "Portuguese", "Russian",
  "Dutch", "Polish", "Romanian", "Greek", "Czech", "Hungarian", "Swedish",
  "Norwegian", "Danish", "Finnish", "Bulgarian", "Croatian", "Slovak",
  "Slovenian", "Lithuanian", "Latvian", "Estonian", "Maltese", "Irish",
  "Welsh", "Catalan", "Basque", "Galician", "Albanian", "Macedonian",
  "Serbian", "Bosnian", "Montenegrin", "Ukrainian", "Belarusian",
  // Other Major Languages
  "Chinese", "Japanese", "Korean", "Arabic", "Hindi", "Turkish",
  "Hebrew", "Persian", "Thai", "Vietnamese", "Indonesian", "Malay"
]

const CREATOR_ROLES = [
  "Technical Analyst", "Trading Expert", "Trading Bot Expert", 
  "DeFi Specialist", "NFT Trader", "NFT Artist/Creator", "Crypto Educator"
]

const CHANNEL_CATEGORIES = [
  "Crypto Trading", "Forex Trading", "Stock Trading", "Microcaps", 
  "On-Chain Analysis", "Market Analysis", "Whale Tracking", "DeFi", 
  "Yield Farming", "Liquidity Pools", "Education", "NFTs", "Community"
]

const SUBSCRIPTION_DURATIONS = [
  { value: "30", label: "30 Days" },
  { value: "60", label: "60 Days" },
  { value: "90", label: "90 Days" }
]

export function CreatorControlsInterface() {
  const { addCreator, updateCreator, updateChannel, creators, refreshCreators, getUserCreators, deleteChannel } = useCreatorsDatabase()
  const { tier } = useSubscription()
  const router = useRouter()
  const currentAccount = useCurrentAccount()
  const { user } = useSuiAuth()
  const { mutate: signAndExecute } = useSignAndExecuteTransaction()
  // Image states - using Walrus integration like profile page
  const [profileImage, setProfileImage] = useState<string>("")
  const [coverImage, setCoverImage] = useState<string>("")
  const [profileImageBlobId, setProfileImageBlobId] = useState<string>("")
  const [coverImageBlobId, setCoverImageBlobId] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Progressive card display states
  const [showChannelDetails, setShowChannelDetails] = useState(false)
  const [showChannelSettings, setShowChannelSettings] = useState(false)
  const [showPricingPackages, setShowPricingPackages] = useState(false)

  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingChannel, setEditingChannel] = useState<any>(null)
  const [editingCreatorId, setEditingCreatorId] = useState<string>("")

  const form = useForm<CreatorFormData>({
    resolver: zodResolver(creatorFormSchema),
    defaultValues: {
      channelName: "",
      channelDescription: "",
      channelLanguage: "",
      creatorRole: "",
      channelCategories: [],
      maxSubscribers: 0,
      isPremium: false,
      subscriptionPackages: [],
      tipPricing: {
        thirtyDays: 0,
        sixtyDays: 0,
        ninetyDays: 0,
      },
      agreeToTerms: false,
    },
  })

  const watchIsPremium = form.watch("isPremium")
  const watchCategories = form.watch("channelCategories")
  const watchSubscriptionPackages = form.watch("subscriptionPackages") || []

  // Additional watch statements for progressive display
  const watchChannelName = form.watch("channelName")
  const watchChannelDescription = form.watch("channelDescription")
  const watchChannelLanguage = form.watch("channelLanguage")
  const watchCreatorRole = form.watch("creatorRole")
  const watchMaxSubscribers = form.watch("maxSubscribers")

  // Progressive card visibility logic
  useEffect(() => {
    // Show Channel Details card when at least profile image is added
    const hasImages = !!(profileImage || coverImage)
    setShowChannelDetails(hasImages)

    // Show Channel Settings card when basic details are filled
    const hasBasicDetails = !!(watchChannelName && watchChannelDescription && watchChannelLanguage && watchCreatorRole && watchCategories?.length > 0)
    setShowChannelSettings(hasImages && hasBasicDetails)

    // Show Pricing & Packages card when settings are configured (no longer depends on Telegram)
    setShowPricingPackages(hasImages && hasBasicDetails)
  }, [profileImage, coverImage, watchChannelName, watchChannelDescription, watchChannelLanguage, watchCreatorRole, watchCategories, watchMaxSubscribers])

  // Image update handlers - using Walrus integration like profile page
  const handleProfileImageUpdate = (imageUrl: string, blobId?: string) => {
    console.log('📸 Profile image updated:', { imageUrl, blobId })
    setProfileImage(imageUrl)
    setProfileImageBlobId(blobId || "")
  }

  const handleCoverImageUpdate = (imageUrl: string, blobId?: string) => {
    console.log('🖼️ Cover image updated:', { imageUrl, blobId })
    setCoverImage(imageUrl)
    setCoverImageBlobId(blobId || "")
  }

  const handleProfileImageRemove = () => {
    console.log('📸 Profile image removed')
    setProfileImage("")
    setProfileImageBlobId("")
  }

  const handleCoverImageRemove = () => {
    console.log('🖼️ Cover image removed')
    setCoverImage("")
    setCoverImageBlobId("")
  }

  // Edit modal handlers
  const handleEditChannel = (channel: any, creatorId: string) => {
    console.log('✏️ Opening edit modal for channel:', channel.name)
    setEditingChannel(channel)
    setEditingCreatorId(creatorId)
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setEditingChannel(null)
    setEditingCreatorId("")
  }

  const handleSaveChannel = async (channelId: string, updatedData: any) => {
    try {
      await updateChannel(editingCreatorId, channelId, updatedData)
      handleCloseEditModal()
    } catch (error) {
      console.error('Failed to update channel:', error)
      throw error // Let the modal handle the error display
    }
  }

  const onSubmit = async (data: CreatorFormData) => {
    console.log('🚀 Form submission started')
    console.log('📝 Form data:', data)

    if (!user?.address) {
      console.error('❌ No user authenticated')
      toast.error('Please connect your wallet or sign in first')
      return
    }

    console.log('✅ User authenticated:', user.address)

    // Check channel creation limits based on user tier
    const userChannelLimit = tier === 'ROYAL' ? 3 : 2 // ROYAL: 3 channels, PRO: 2 channels

    // Find existing creator profile for current user by wallet address
    const existingUserCreator = creators.find(creator =>
      creator.creatorAddress &&
      creator.creatorAddress.toLowerCase() === user.address.toLowerCase()
    )

    const currentChannelCount = existingUserCreator ? existingUserCreator.channels.length : 0

    console.log(`🔍 Channel limit check: ${tier} tier allows ${userChannelLimit} channels`)
    console.log(`📊 User has ${currentChannelCount} existing channels`)
    console.log(`👤 Existing creator:`, existingUserCreator ? { name: existingUserCreator.name, channels: existingUserCreator.channels.length } : 'None')

    if (currentChannelCount >= userChannelLimit) {
      const tierName = tier === 'ROYAL' ? 'ROYAL' : 'PRO'
      toast.error(`Channel limit reached! ${tierName} users can create maximum ${userChannelLimit} channels. You currently have ${currentChannelCount} channels.`)
      console.error(`❌ Channel limit exceeded: ${currentChannelCount}/${userChannelLimit}`)
      return
    }

    console.log(`✅ Channel limit check passed: ${currentChannelCount}/${userChannelLimit} channels used`)

    setIsSubmitting(true)
    try {
      console.log('🚀 Creating creator profile...')

      // Generate unique ID for the new creator
      const newCreatorId = `creator_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      console.log('🆔 Generated creator ID:', newCreatorId)

      // Create channel data with channel-specific information
      const newChannel = {
        id: `${newCreatorId}_channel_${existingUserCreator ? existingUserCreator.channels.length + 1 : 1}`,
        name: data.channelName,
        type: data.isPremium ? "premium" as const : "free" as const,
        price: data.isPremium && data.subscriptionPackages?.includes("30")
          ? (data.tipPricing.thirtyDays || 0)
          : 0,
        description: data.channelDescription,
        subscribers: 0, // New channel starts with 0 subscribers
        subscriptionPackages: data.isPremium ? data.subscriptionPackages : undefined,
        pricing: data.isPremium ? {
          thirtyDays: data.tipPricing.thirtyDays,
          sixtyDays: data.tipPricing.sixtyDays,
          ninetyDays: data.tipPricing.ninetyDays,
        } : undefined,
        availability: data.maxSubscribers > 0 ? {
          hasLimit: true,
          currentSlots: 0,
          maxSlots: data.maxSubscribers,
          status: 'available' as const
        } : { hasLimit: false, status: 'available' as const },

        // Add channel-specific data
        channelCategories: data.channelCategories, // Store categories per channel
        channelLanguage: data.channelLanguage, // Store language per channel
        channelRole: data.creatorRole, // Store role/profession per channel
        // Generate unique identifier for this specific channel
        channelIdentifier: `${data.channelName.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`
      }

      // Check if user already has a creator profile
      if (existingUserCreator) {
        console.log('👤 Adding channel to existing creator profile')
        await addChannelToExistingCreator(existingUserCreator, data, newChannel, profileImageBlobId, coverImageBlobId)
      } else {
        console.log('👤 Creating new creator profile with first channel')
        await createNewCreatorWithChannel(data, newChannel, newCreatorId, profileImageBlobId, coverImageBlobId)
      }

      console.log('✅ Channel created successfully')

      // Force refresh the creators list to update the UI
      console.log('🔄 Force refreshing creators list...')
      await refreshCreators()
      console.log('✅ Creators list refreshed')

      toast.success('Channel created successfully! Your channel is now live.')

      // Reset form
      form.reset()
      setProfileImage("")
      setCoverImage("")
      setProfileImageBlobId("")
      setCoverImageBlobId("")

      // Redirect to AIO Creators page to see the updated creator
      setTimeout(() => {
        router.push('/aio-creators')
      }, 1500)

    } catch (error) {
      console.error('❌ Error creating creator:', error)

      // More detailed error logging
      if (error instanceof Error) {
        console.error('❌ Error message:', error.message)
        console.error('❌ Error stack:', error.stack)
        toast.error(`Failed to create channel: ${error.message}`)
      } else {
        console.error('❌ Unknown error:', error)
        toast.error('Failed to create channel. Please try again.')
      }
    } finally {
      console.log('🏁 Form submission completed')
      setIsSubmitting(false)
    }
  }

  // Helper function to create new creator with first channel
  const createNewCreatorWithChannel = async (data: CreatorFormData, newChannel: any, newCreatorId: string, profileImageBlobId: string, coverImageBlobId: string) => {
    // Add channel-specific images to the new channel
    const channelWithImages = {
      ...newChannel,
      // Store channel-specific images
      channelAvatar: profileImage || "/api/placeholder/64/64",
      channelCover: coverImage || undefined,
      channelAvatarBlobId: profileImageBlobId,
      channelCoverBlobId: coverImageBlobId,
    }

    const newCreator = {
      id: newCreatorId,
      creatorAddress: user?.address || '', // Add the wallet address for ownership verification
      name: data.channelName, // Using channel name as creator name for now
      username: data.channelName.replace(/\s+/g, '_').toLowerCase(), // Generate username from channel name
      avatar: "/api/placeholder/64/64", // Placeholder - we use channel-specific images instead
      coverImage: "/api/placeholder/400/200", // Placeholder - we use channel-specific images instead
      role: data.creatorRole,
      tier: tier as 'PRO' | 'ROYAL',
      subscribers: 0,
      category: data.channelCategories[0] || "General",
      categories: data.channelCategories,
      channels: [channelWithImages], // Use channel with images
      contentTypes: ["Live Streams", "Analysis", "Tutorials"],
      verified: false,
      languages: [data.channelLanguage],
      availability: {
        hasLimit: data.maxSubscribers > 0,
        currentSlots: 0,
        maxSlots: data.maxSubscribers > 0 ? data.maxSubscribers : undefined,
        status: 'available' as const
      },
      socialLinks: {
        // No social links for now - removed Telegram
      },
      bannerColor: "#4DA2FF"
    }

    console.log('📤 Creating new creator with first channel...')
    await addCreator(newCreator, profileImageBlobId, coverImageBlobId)
  }

  // Helper function to add channel to existing creator
  const addChannelToExistingCreator = async (existingCreator: any, data: CreatorFormData, newChannel: any, profileImageBlobId: string, coverImageBlobId: string) => {
    console.log('📤 Adding channel to existing creator...')

    // Add channel-specific images to the new channel
    const channelWithImages = {
      ...newChannel,
      // Store channel-specific images, not creator profile images
      channelAvatar: profileImage || existingCreator.avatar,
      channelCover: coverImage || existingCreator.coverImage,
      channelAvatarBlobId: profileImageBlobId,
      channelCoverBlobId: coverImageBlobId,
    }

    // Create updated creator with new channel added (keep existing creator profile images unchanged)
    const updatedCreator = {
      ...existingCreator,
      channels: [...existingCreator.channels, channelWithImages],
      // Explicitly preserve existing creator profile images
      avatar: existingCreator.avatar,
      coverImage: existingCreator.coverImage,
    }

    console.log('📝 Updated creator with new channel:', updatedCreator)

    // Use updateCreator instead of addCreator for existing creators
    await updateCreator(existingCreator.id, updatedCreator, profileImageBlobId, coverImageBlobId)
  }

  // Get form values for preview (using existing watch statements above)

  // Helper function to get current user's channel count
  const getCurrentUserChannelCount = () => {
    if (!user?.address) {
      console.log('📊 No user authenticated, returning 0 channels')
      return 0
    }

    // Use the getUserCreators method for accurate filtering
    const userCreators = getUserCreators(user.address)
    const totalChannels = userCreators.reduce((total, creator) => total + creator.channels.length, 0)

    console.log(`📊 Found ${userCreators.length} creators for user ${user.address} with ${totalChannels} total channels`)

    return totalChannels
  }

  const currentChannelCount = getCurrentUserChannelCount()
  const maxChannels = tier === 'ROYAL' ? 3 : 2

  // Force re-render when creators list changes
  useEffect(() => {
    // Silent update when creators list changes
  }, [creators])

  // Debug image states
  console.log('🖼️ Current image states:', {
    profileImage,
    coverImage,
    profileImageBlobId,
    coverImageBlobId
  })

  // Generate preview data
  const previewData = {
    id: "preview",
    name: watchChannelName || "Your Channel Name",
    username: "your_username",
    avatar: profileImage || "/api/placeholder/64/64",
    coverImage: coverImage || undefined,
    role: watchCreatorRole || "Your Role",
    tier: "PRO" as const,
    subscribers: Math.floor(Math.random() * 1000) + 100,
    category: watchCategories[0] || "Category",
    verified: true,
    contentTypes: ["Live Streams", "Analysis", "Tutorials"],
    languages: watchChannelLanguage ? [watchChannelLanguage] : ["Language"],
    availability: {
      hasLimit: watchMaxSubscribers > 0,
      currentSlots: watchMaxSubscribers > 0 ? Math.floor(watchMaxSubscribers * 0.7) : undefined,
      maxSlots: watchMaxSubscribers > 0 ? watchMaxSubscribers : undefined,
      status: 'available' as const
    },
    socialLinks: {
      // No social links for now - removed Telegram
    },
    bannerColor: "#4DA2FF",
    channels: [
      {
        id: "preview-1",
        name: watchChannelName || "Your Channel",
        type: watchIsPremium ? "premium" as const : "free" as const,
        price: watchIsPremium && watchSubscriptionPackages.includes("30")
          ? (form.getValues("tipPricing.thirtyDays") || 5.0)
          : 0,
        description: watchChannelDescription || "Your channel description",
        subscribers: Math.floor(Math.random() * 500) + 50,
        subscriptionPackages: watchIsPremium ? watchSubscriptionPackages : undefined,
        pricing: watchIsPremium ? {
          thirtyDays: form.getValues("tipPricing.thirtyDays"),
          sixtyDays: form.getValues("tipPricing.sixtyDays"),
          ninetyDays: form.getValues("tipPricing.ninetyDays"),
        } : undefined,
        availability: watchMaxSubscribers > 0 ? {
          hasLimit: true,
          currentSlots: Math.floor(watchMaxSubscribers * 0.7),
          maxSlots: watchMaxSubscribers,
          status: 'available' as const
        } : undefined
      }
    ]
  }

  // Get user's existing channels
  const userCreator = creators.find(creator =>
    creator.creatorAddress &&
    creator.creatorAddress.toLowerCase() === user?.address?.toLowerCase()
  )
  const userChannels = userCreator?.channels || []

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Tabs defaultValue="manage" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-[#1a2f51] border-[#C0E6FF]/20">
          <TabsTrigger
            value="manage"
            className="text-[#C0E6FF] data-[state=active]:bg-[#4DA2FF] data-[state=active]:text-white"
          >
            Manage Channels
          </TabsTrigger>
          <TabsTrigger
            value="create"
            className="text-[#C0E6FF] data-[state=active]:bg-[#4DA2FF] data-[state=active]:text-white"
          >
            Create Channel
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Manage Channels */}
        <TabsContent value="manage" className="space-y-6 mt-6">
          {/* Existing Channels Section */}
          {userChannels.length > 0 && (
        <Card className="enhanced-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Manage Your Channels ({userChannels.length}/{tier === 'ROYAL' ? 3 : 2})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Channels Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {userChannels.map((channel) => (
                <div key={channel.id} className="enhanced-card overflow-hidden">
                  {/* Banner with Avatar */}
                  <div
                    className="relative h-20 flex items-center p-3 rounded-t-lg overflow-hidden"
                    style={{
                      background: (() => {
                        // Use channel-specific cover only (no creator profile cover)
                        const channelData = channel as any
                        const channelCover = channelData.channelCover

                        return channelCover
                          ? `url(${channelCover})`
                          : `linear-gradient(135deg, ${userCreator?.bannerColor || '#4DA2FF'}40, ${userCreator?.bannerColor || '#4DA2FF'}20)`
                      })(),
                      backgroundSize: (() => {
                        const channelData = channel as any
                        const channelCover = channelData.channelCover
                        return channelCover ? 'cover' : 'auto'
                      })(),
                      backgroundPosition: (() => {
                        const channelData = channel as any
                        const channelCover = channelData.channelCover
                        return channelCover ? 'center' : 'auto'
                      })(),
                      borderBottom: `2px solid ${userCreator?.bannerColor || '#4DA2FF'}60`
                    }}
                  >
                    {/* Cover Image Overlay for better text readability */}
                    {(() => {
                      const channelData = channel as any
                      const channelCover = channelData.channelCover
                      return channelCover && (
                        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-t-lg"></div>
                      )
                    })()}

                    {/* Main Banner Content */}
                    <div className="banner-main-content flex items-center gap-2 w-full relative z-10">
                      <Avatar className="h-12 w-12 border-2 border-white/20">
                        <AvatarImage
                          src={(() => {
                            // Use channel-specific avatar only (no creator profile avatar)
                            const channelData = channel as any
                            const channelAvatar = channelData.channelAvatar
                            return channelAvatar
                          })()}
                          alt={channel.name}
                        />
                        <AvatarFallback className="bg-[#4DA2FF] text-white text-sm">
                          {channel.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-semibold text-sm truncate">{channel.name}</h3>
                            <p className="text-white/80 text-xs">@{channel.telegramUrl?.replace('https://t.me/', '') || 'N/A'}</p>
                          </div>
                          <Badge className={`ml-2 ${
                            channel.type === 'premium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                          }`}>
                            {channel.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-3">

                    <div className="space-y-2">
                      <p className="text-gray-400 text-sm line-clamp-2">{channel.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#C0E6FF]">{channel.subscribers} subscribers</span>
                        {channel.type === 'premium' && (
                          <span className="text-yellow-400">{channel.price} SUI</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleEditChannel(channel, userCreator!.id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        onClick={async () => {
                          if (window.confirm(`Are you sure you want to delete "${channel.name}"?`)) {
                            try {
                              await deleteChannel(userCreator!.id, channel.id)
                              toast.success('Channel deleted successfully')
                            } catch (error) {
                              console.error('Failed to delete channel:', error)
                              toast.error('Failed to delete channel')
                            }
                          }
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-3"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Content Management Section */}
            <div className="border-t border-gray-700 pt-6">
              <CreatorContentDashboard
                tier={tier}
                currentChannelCount={currentChannelCount}
                maxChannels={maxChannels}
              />
            </div>
          </CardContent>
        </Card>
      )}

          {/* Empty state for manage tab when no channels */}
          {userChannels.length === 0 && (
            <Card className="enhanced-card">
              <CardContent className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-[#C0E6FF]/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Channels Yet</h3>
                <p className="text-[#C0E6FF]/70 mb-4">
                  You haven't created any channels yet. Switch to the "Create Channel" tab to get started.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab 2: Create Channel */}
        <TabsContent value="create" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">


          {/* Progress Indicator */}
          <Card className="enhanced-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#4DA2FF] text-white flex items-center justify-center text-xs font-bold">1</div>
                  <span className="text-white">Channel Images</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full ${showChannelDetails ? 'bg-[#4DA2FF] text-white' : 'bg-gray-600 text-gray-400'} flex items-center justify-center text-xs font-bold`}>2</div>
                  <span className={showChannelDetails ? 'text-white' : 'text-gray-400'}>Channel Details</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full ${showChannelSettings ? 'bg-[#4DA2FF] text-white' : 'bg-gray-600 text-gray-400'} flex items-center justify-center text-xs font-bold`}>3</div>
                  <span className={showChannelSettings ? 'text-white' : 'text-gray-400'}>Settings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full ${showPricingPackages ? 'bg-[#4DA2FF] text-white' : 'bg-gray-600 text-gray-400'} flex items-center justify-center text-xs font-bold`}>4</div>
                  <span className={showPricingPackages ? 'text-white' : 'text-gray-400'}>Complete</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Channel Images Section */}
          <Card className="enhanced-card">
            <CardHeader>
              <CardTitle className="text-white">Channel Images</CardTitle>
              <p className="text-gray-400 text-sm">
                Start by adding your channel profile image and cover photo. More options will appear as you complete each step.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Image */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#C0E6FF]">Channel Profile Image</label>
                <div className="flex items-center gap-4">
                  <WalrusProfileImage
                    currentImage={profileImage}
                    currentBlobId={profileImageBlobId}
                    fallbackText={watchChannelName?.charAt(0) || "C"}
                    size="xl"
                    onImageUpdate={handleProfileImageUpdate}
                    onImageRemove={handleProfileImageRemove}
                    editable={true}
                    className="border-2 border-[#4DA2FF]"
                  />

                  <div className="flex-1">
                    <p className="text-xs text-gray-400">Recommended: 400x400px, max 5MB</p>
                    <p className="text-xs text-[#C0E6FF] mt-1">Click the avatar to upload or change image</p>
                  </div>
                </div>
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#C0E6FF]">Channel Cover Photo (Optional)</label>
                <WalrusCoverImage
                  currentImage={coverImage}
                  currentBlobId={coverImageBlobId}
                  onImageUpdate={handleCoverImageUpdate}
                  onImageRemove={handleCoverImageRemove}
                  editable={true}
                  height="h-32"
                />
                <p className="text-xs text-gray-400">Recommended: 1200x400px, max 5MB</p>
              </div>
            </CardContent>
          </Card>

          {/* Basic Channel Information - Show after images are added */}
          {showChannelDetails && (
          <Card className="enhanced-card">
            <CardHeader>
              <CardTitle className="text-white">Channel Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Channel Name */}
              <FormField
                control={form.control}
                name="channelName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#C0E6FF]">Channel Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter a unique and recognizable name for your channel"
                        className="bg-[#1a2f51] border-[#C0E6FF]/30 text-white placeholder:text-[#C0E6FF]/60"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-gray-400">
                      This will be the main identifier for your channel
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Channel Description */}
              <FormField
                control={form.control}
                name="channelDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#C0E6FF]">Channel Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Briefly describe the purpose, content, and value of your channel"
                        className="bg-[#1a2f51] border-[#C0E6FF]/30 text-white placeholder:text-[#C0E6FF]/60 min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-gray-400">
                      Explain what subscribers can expect from your channel
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Channel Language */}
              <FormField
                control={form.control}
                name="channelLanguage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#C0E6FF]">Channel Language *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[#1a2f51] border-[#C0E6FF]/30 text-white">
                          <SelectValue placeholder="Choose the primary language used in your channel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#1a2f51] border-[#C0E6FF]/30">
                        {LANGUAGES.map((language) => (
                          <SelectItem
                            key={language}
                            value={language}
                            className="text-white focus:bg-[#4DA2FF]/20 focus:text-white"
                          >
                            {language}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </CardContent>
          </Card>
          )}

          {/* Creator Role and Categories - Show after images are added */}
          {showChannelDetails && (
          <Card className="enhanced-card">
            <CardHeader>
              <CardTitle className="text-white">Creator Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Creator Role */}
              <FormField
                control={form.control}
                name="creatorRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#C0E6FF]">Creator Role / Profession *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[#1a2f51] border-[#C0E6FF]/30 text-white">
                          <SelectValue placeholder="Select your professional category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#1a2f51] border-[#C0E6FF]/30">
                        {CREATOR_ROLES.map((role) => (
                          <SelectItem
                            key={role}
                            value={role}
                            className="text-white focus:bg-[#4DA2FF]/20 focus:text-white"
                          >
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Channel Categories */}
              <FormField
                control={form.control}
                name="channelCategories"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-[#C0E6FF]">Channel Categories (Select up to 3) *</FormLabel>
                    <FormDescription className="text-gray-400">
                      Choose the main categories that best describe your content
                    </FormDescription>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                      {CHANNEL_CATEGORIES.map((category) => (
                        <FormField
                          key={category}
                          control={form.control}
                          name="channelCategories"
                          render={({ field }) => {
                            const isSelected = field.value?.includes(category)
                            const canSelect = !isSelected && (field.value?.length || 0) < 3

                            return (
                              <FormItem key={category}>
                                <FormControl>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      checked={isSelected}
                                      disabled={!canSelect && !isSelected}
                                      onCheckedChange={(checked) => {
                                        const currentValue = field.value || []
                                        if (checked) {
                                          field.onChange([...currentValue, category])
                                        } else {
                                          field.onChange(currentValue.filter((value) => value !== category))
                                        }
                                      }}
                                      className="border-[#C0E6FF]/30 data-[state=checked]:bg-[#4DA2FF] data-[state=checked]:border-[#4DA2FF]"
                                    />
                                    <label className={`text-sm ${isSelected ? 'text-[#4DA2FF]' : 'text-[#C0E6FF]'} ${!canSelect && !isSelected ? 'opacity-50' : ''}`}>
                                      {category}
                                    </label>
                                  </div>
                                </FormControl>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {watchCategories.map((category) => (
                        <Badge key={category} className="bg-[#4DA2FF] text-white">
                          {category}
                          <button
                            type="button"
                            onClick={() => {
                              const currentCategories = form.getValues("channelCategories")
                              form.setValue("channelCategories", currentCategories.filter(c => c !== category))
                            }}
                            className="ml-2 hover:bg-white/20 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          )}

          {/* Channel Settings - Show after basic details are filled */}
          {showChannelSettings && (
          <Card className="enhanced-card">
            <CardHeader>
              <CardTitle className="text-white">Channel Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Maximum Subscriber Limit */}
              <FormField
                control={form.control}
                name="maxSubscribers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#C0E6FF]">Maximum Subscriber Limit</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0 = unlimited"
                        className="bg-[#1a2f51] border-[#C0E6FF]/30 text-white placeholder:text-[#C0E6FF]/60"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription className="text-gray-400">
                      Set the number of subscriber slots (0 = unlimited)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Premium Channel Toggle */}
              <FormField
                control={form.control}
                name="isPremium"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-[#C0E6FF]/30 p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base text-[#C0E6FF]">
                        Premium Channel
                      </FormLabel>
                      <FormDescription className="text-gray-400">
                        Enable if your channel is paid/subscription-based
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-[#4DA2FF]"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Subscription Packages - Only show if Premium is enabled */}
              {watchIsPremium && (
                <FormField
                  control={form.control}
                  name="subscriptionPackages"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-[#C0E6FF]">Subscription Packages</FormLabel>
                      <FormDescription className="text-gray-400">
                        Choose available subscription durations
                      </FormDescription>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                        {SUBSCRIPTION_DURATIONS.map((duration) => (
                          <FormField
                            key={duration.value}
                            control={form.control}
                            name="subscriptionPackages"
                            render={({ field }) => {
                              const isSelected = field.value?.includes(duration.value)

                              return (
                                <FormItem key={duration.value}>
                                  <FormControl>
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={(checked) => {
                                          const currentValue = field.value || []
                                          if (checked) {
                                            field.onChange([...currentValue, duration.value])
                                          } else {
                                            field.onChange(currentValue.filter((value) => value !== duration.value))
                                          }
                                        }}
                                        className="border-[#C0E6FF]/30 data-[state=checked]:bg-[#4DA2FF] data-[state=checked]:border-[#4DA2FF]"
                                      />
                                      <label className={`text-sm ${isSelected ? 'text-[#4DA2FF]' : 'text-[#C0E6FF]'}`}>
                                        {duration.label}
                                      </label>
                                    </div>
                                  </FormControl>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {watchSubscriptionPackages.map((packageDuration) => {
                          const durationLabel = SUBSCRIPTION_DURATIONS.find(d => d.value === packageDuration)?.label
                          return (
                            <Badge key={packageDuration} className="bg-[#4DA2FF] text-white">
                              {durationLabel}
                              <button
                                type="button"
                                onClick={() => {
                                  const currentPackages = form.getValues("subscriptionPackages") || []
                                  form.setValue("subscriptionPackages", currentPackages.filter(p => p !== packageDuration))
                                }}
                                className="ml-2 hover:bg-white/20 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          )
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>
          )}

          {/* Tip Pricing - Show after settings are configured and if Premium is enabled */}
          {showPricingPackages && watchIsPremium && watchSubscriptionPackages.length > 0 && (
            <Card className="enhanced-card">
              <CardHeader>
                <CardTitle className="text-white">Tip Pricing (SUI)</CardTitle>
                <p className="text-gray-400 text-sm">Set optional tipping prices based on subscription duration</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* 30 Days Pricing */}
                  {watchSubscriptionPackages.includes("30") && (
                    <FormField
                      control={form.control}
                      name="tipPricing.thirtyDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#C0E6FF]">30 Days Package</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="number"
                                step="0.1"
                                min="0"
                                placeholder="0.0"
                                className="bg-[#1a2f51] border-[#C0E6FF]/30 text-white placeholder:text-[#C0E6FF]/60 pr-12"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#C0E6FF] text-sm">
                                SUI
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* 60 Days Pricing */}
                  {watchSubscriptionPackages.includes("60") && (
                    <FormField
                      control={form.control}
                      name="tipPricing.sixtyDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#C0E6FF]">60 Days Package</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="number"
                                step="0.1"
                                min="0"
                                placeholder="0.0"
                                className="bg-[#1a2f51] border-[#C0E6FF]/30 text-white placeholder:text-[#C0E6FF]/60 pr-12"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#C0E6FF] text-sm">
                                SUI
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* 90 Days Pricing */}
                  {watchSubscriptionPackages.includes("90") && (
                    <FormField
                      control={form.control}
                      name="tipPricing.ninetyDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#C0E6FF]">90 Days Package</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="number"
                                step="0.1"
                                min="0"
                                placeholder="0.0"
                                className="bg-[#1a2f51] border-[#C0E6FF]/30 text-white placeholder:text-[#C0E6FF]/60 pr-12"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#C0E6FF] text-sm">
                                SUI
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Terms and Conditions - Show after pricing is configured */}
          {showPricingPackages && (
          <Card className="enhanced-card">
            <CardHeader>
              <CardTitle className="text-white">Agreement</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="agreeToTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-[#C0E6FF]/30 data-[state=checked]:bg-[#4DA2FF] data-[state=checked]:border-[#4DA2FF]"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-[#C0E6FF]">
                        I agree to the Terms & Conditions *
                      </FormLabel>
                      <FormDescription className="text-gray-400">
                        By checking this box, you confirm that you have read and agree to our terms of service and community guidelines.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          )}

          {/* Submit Button - Show after all steps are completed */}
          {showPricingPackages && (
          <div className="flex justify-center pt-6">
            <Button
              type="submit"
              disabled={isSubmitting || currentChannelCount >= maxChannels}
              className={`px-8 py-3 text-lg font-semibold min-w-[200px] ${
                currentChannelCount >= maxChannels
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-[#4da2ffcc] hover:bg-[#4da2ff] text-white'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Channel...
                </>
              ) : currentChannelCount >= maxChannels ? (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Channel Limit Reached
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Create My Channel
                </>
              )}
            </Button>
            </div>
          )}
          </form>
        </Form>
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
          <Card className="enhanced-card sticky top-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Play className="w-5 h-5 text-[#4DA2FF]" />
                Live Preview
                <Badge variant="outline" className="border-[#4DA2FF] text-[#4DA2FF] text-xs">
                  Real-time
                </Badge>
              </CardTitle>
              <p className="text-gray-400 text-sm">See how your creator card will appear to users</p>
            </CardHeader>
            <CardContent>
              {/* Show placeholder when no data */}
              {!watchChannelName && !watchChannelDescription && !watchCreatorRole && (
                <div className="text-center py-8 text-gray-400">
                  <Play className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Start filling the form to see your preview</p>
                </div>
              )}

              {/* Show preview when data exists */}
              {(watchChannelName || watchChannelDescription || watchCreatorRole) && (
                <div className="enhanced-card overflow-hidden">
                {/* Banner with Avatar */}
                <div
                  className="relative h-20 flex items-center p-3 rounded-t-lg overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${previewData.bannerColor}40, ${previewData.bannerColor}20)`,
                    borderBottom: `2px solid ${previewData.bannerColor}60`
                  }}
                >
                  {/* Cover Image Preview */}
                  {coverImage && (
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-30"
                      style={{ backgroundImage: `url(${coverImage})` }}
                    />
                  )}

                  <div className="banner-main-content flex items-center gap-2 w-full relative z-10">
                    <Avatar className="h-14 w-14 border-2 border-white/20">
                      <AvatarImage src={previewData.avatar} alt={previewData.name} />
                      <AvatarFallback className="bg-[#4DA2FF] text-white text-lg">
                        {previewData.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <h3 className="text-white font-semibold text-sm truncate">{previewData.name}</h3>
                        {previewData.verified && (
                          <CheckCircle className="w-3 h-3 text-blue-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-white/80 text-xs">@{previewData.username}</p>
                    </div>

                    {/* Telegram Chat Icon */}
                    <div className="flex items-center gap-1">
                      <div className="w-6 h-6 bg-[#0088CC] rounded-full flex items-center justify-center">
                        <MessageCircle className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 space-y-3">
                  {/* Role and Categories */}
                  <div className="flex flex-wrap items-center justify-center gap-1">
                    <Badge className="bg-[#4da2ff] text-white text-xs px-2 py-1">
                      {previewData.role}
                    </Badge>
                    {/* Display all selected categories */}
                    {watchCategories.length > 0 ? (
                      watchCategories.slice(0, 3).map((category, index) => (
                        <Badge key={index} className="bg-green-600 text-white text-xs px-2 py-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {category}
                        </Badge>
                      ))
                    ) : (
                      <Badge className="bg-gray-500 text-white text-xs px-2 py-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Select Categories
                      </Badge>
                    )}
                    {/* Show +X more if there are more than 3 categories */}
                    {watchCategories.length > 3 && (
                      <Badge className="bg-gray-600 text-white text-xs px-2 py-1">
                        +{watchCategories.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Subscribers and Availability */}
                  <div className="flex items-center justify-center gap-4 text-xs text-[#C0E6FF]">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{previewData.subscribers.toLocaleString()} subscribers</span>
                    </div>
                    {previewData.availability.hasLimit && (
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        <span>{previewData.availability.currentSlots}/{previewData.availability.maxSlots} slots</span>
                      </div>
                    )}
                  </div>

                  {/* Languages */}
                  <div className="flex justify-center">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {previewData.languages.map((lang, index) => (
                        <span key={index} className="text-xs text-[#C0E6FF] bg-[#1a2f51] px-2 py-1 rounded">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Channel Preview */}
                  <div className="space-y-2">
                    <h4 className="text-white text-sm font-medium text-center">Channel</h4>
                    {previewData.channels.map((channel) => (
                      <div key={channel.id} className="bg-[#1a2f51] rounded-lg p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h5 className="text-white text-sm font-medium truncate">{channel.name}</h5>
                            <p className="text-[#C0E6FF] text-xs mt-1 line-clamp-2">{channel.description}</p>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <Users className="w-3 h-3 text-[#C0E6FF]" />
                            <span className="text-[#C0E6FF] text-xs">{channel.subscribers}</span>
                          </div>
                        </div>

                        {channel.availability && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#C0E6FF]">
                              {channel.availability.currentSlots}/{channel.availability.maxSlots} slots
                            </span>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span className="text-green-400">Available</span>
                            </div>
                          </div>
                        )}

                        <Button
                          size="sm"
                          disabled
                          className={`w-full h-6 text-xs ${
                            channel.type === 'free'
                              ? "bg-green-600 text-white"
                              : "bg-[#4DA2FF] text-white"
                          }`}
                        >
                          {channel.type === 'free' ? (
                            'Access Free'
                          ) : (
                            `Tip ${channel.price} SUI`
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              )}

              {/* Preview Notes - Only show when preview is visible */}
              {(watchChannelName || watchChannelDescription || watchCreatorRole) && (
                <div className="mt-4 p-3 bg-[#1a2f51] rounded-lg">
                  <h4 className="text-[#C0E6FF] text-sm font-medium mb-2">Preview Notes:</h4>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Subscriber count and slots are simulated for preview</li>
                    <li>• Social media icons will link to your actual accounts</li>
                    <li>• Card will update in real-time as you fill the form</li>
                    <li>• Final card may have slight visual differences</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
        </TabsContent>
      </Tabs>

      {/* Edit Channel Modal */}
      <EditChannelModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        channel={editingChannel}
        creatorId={editingCreatorId}
        onSave={handleSaveChannel}
      />
    </div>
  )
}
