"use client"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useCreators } from "@/contexts/creators-context"
import { useSubscription } from "@/contexts/subscription-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  MessageCircle
} from "lucide-react"
import { toast } from "sonner"

// Form validation schema
const creatorFormSchema = z.object({
  channelName: z.string().min(3, "Channel name must be at least 3 characters").max(50, "Channel name must be less than 50 characters"),
  channelDescription: z.string().min(10, "Description must be at least 10 characters").max(500, "Description must be less than 500 characters"),
  channelLanguage: z.string().min(1, "Please select a language"),
  creatorRole: z.string().min(1, "Please select your role/profession"),
  channelCategories: z.array(z.string()).min(1, "Select at least 1 category").max(3, "Select maximum 3 categories"),
  maxSubscribers: z.number().min(0, "Must be 0 or greater"),
  telegramUsername: z.string().min(1, "Please enter your Telegram username for direct messages"),
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
  const { addCreator } = useCreators()
  const { tier } = useSubscription()
  const router = useRouter()
  const [profileImage, setProfileImage] = useState<string>("")
  const [coverImage, setCoverImage] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const profileImageRef = useRef<HTMLInputElement>(null)
  const coverImageRef = useRef<HTMLInputElement>(null)

  const form = useForm<CreatorFormData>({
    resolver: zodResolver(creatorFormSchema),
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
      agreeToTerms: false,
    },
  })

  const watchIsPremium = form.watch("isPremium")
  const watchCategories = form.watch("channelCategories")
  const watchSubscriptionPackages = form.watch("subscriptionPackages") || []

  const handleImageUpload = (type: 'profile' | 'cover') => {
    if (type === 'profile') {
      profileImageRef.current?.click()
    } else {
      coverImageRef.current?.click()
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string
        if (type === 'profile') {
          setProfileImage(imageDataUrl)
        } else {
          setCoverImage(imageDataUrl)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = (type: 'profile' | 'cover') => {
    if (type === 'profile') {
      setProfileImage("")
    } else {
      setCoverImage("")
    }
  }

  const onSubmit = async (data: CreatorFormData) => {
    setIsSubmitting(true)
    try {
      // Generate unique ID for the new creator
      const newCreatorId = `creator_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Create channel data
      const newChannel = {
        id: `${newCreatorId}_channel_1`,
        name: data.channelName,
        type: data.isPremium ? "premium" as const : "free" as const,
        price: data.isPremium && data.subscriptionPackages?.includes("30")
          ? (data.tipPricing.thirtyDays || 0)
          : 0,
        description: data.channelDescription,
        subscribers: 0, // New channel starts with 0 subscribers
        telegramUrl: `https://t.me/${data.telegramUsername}`, // Use the creator's telegram username
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
        } : undefined
      }

      // Create new creator object
      const newCreator = {
        id: newCreatorId,
        name: data.channelName, // Using channel name as creator name for now
        username: data.telegramUsername,
        avatar: profileImage || "/api/placeholder/64/64",
        coverImage: coverImage || undefined, // Save cover image if uploaded
        role: data.creatorRole,
        tier: tier as 'PRO' | 'ROYAL', // Use current user's tier
        subscribers: 0, // New creator starts with 0 subscribers
        category: data.channelCategories[0] || "General", // Primary category (first selected)
        categories: data.channelCategories, // All selected categories
        channels: [newChannel],
        contentTypes: ["Live Streams", "Analysis", "Tutorials"], // Default content types
        verified: false, // New creators start unverified
        languages: [data.channelLanguage],
        availability: {
          hasLimit: data.maxSubscribers > 0,
          currentSlots: 0,
          maxSlots: data.maxSubscribers > 0 ? data.maxSubscribers : undefined,
          status: 'available' as const
        },
        socialLinks: {
          telegram: `https://t.me/${data.telegramUsername}`
        },
        bannerColor: "#4DA2FF" // Default banner color
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Add the new creator to the context
      addCreator(newCreator)

      toast.success('Channel created successfully! Your creator profile is now live.')

      // Reset form
      form.reset()
      setProfileImage("")
      setCoverImage("")

      // Redirect to AIO Creators page to see the new creator
      setTimeout(() => {
        router.push('/aio-creators')
      }, 1500)

    } catch (error) {
      console.error('Error creating creator:', error)
      toast.error('Failed to create channel. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get form values for preview
  const watchChannelName = form.watch("channelName")
  const watchChannelDescription = form.watch("channelDescription")
  const watchCreatorRole = form.watch("creatorRole")
  const watchChannelLanguage = form.watch("channelLanguage")
  const watchMaxSubscribers = form.watch("maxSubscribers")
  const watchTelegramUsername = form.watch("telegramUsername")

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
      telegram: watchTelegramUsername ? `https://t.me/${watchTelegramUsername}` : "https://t.me/your_username"
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
        telegramUrl: "https://t.me/your_channel",
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Channel Images Section */}
          <Card className="enhanced-card">
            <CardHeader>
              <CardTitle className="text-white">Channel Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Image */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#C0E6FF]">Channel Profile Image</label>
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <Avatar className="h-20 w-20 border-2 border-[#4DA2FF]">
                      <AvatarImage src={profileImage} alt="Profile" />
                      <AvatarFallback className="bg-[#4DA2FF] text-white text-xl">
                        <Camera className="w-8 h-8" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                         onClick={() => handleImageUpload('profile')}>
                      <Camera className="w-6 h-6 text-white" />
                    </div>

                    {profileImage && (
                      <button
                        type="button"
                        onClick={() => removeImage('profile')}
                        className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors duration-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleImageUpload('profile')}
                      className="border-[#C0E6FF] text-[#C0E6FF] hover:bg-[#4DA2FF]/20"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Profile Image
                    </Button>
                    <p className="text-xs text-gray-400 mt-1">Recommended: 400x400px, max 5MB</p>
                  </div>
                </div>
                
                <input
                  ref={profileImageRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'profile')}
                  className="hidden"
                />
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#C0E6FF]">Channel Cover Photo (Optional)</label>
                <div className="space-y-2">
                  {coverImage ? (
                    <div className="relative group">
                      <div className="w-full h-32 rounded-lg overflow-hidden border-2 border-[#4DA2FF]">
                        <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                           onClick={() => handleImageUpload('cover')}>
                        <Camera className="w-8 h-8 text-white" />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeImage('cover')}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="w-full h-32 border-2 border-dashed border-[#C0E6FF]/30 rounded-lg flex items-center justify-center cursor-pointer hover:border-[#4DA2FF] transition-colors duration-200"
                      onClick={() => handleImageUpload('cover')}
                    >
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-[#C0E6FF] mx-auto mb-2" />
                        <p className="text-sm text-[#C0E6FF]">Click to upload cover image</p>
                      </div>
                    </div>
                  )}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleImageUpload('cover')}
                    className="border-[#C0E6FF] text-[#C0E6FF] hover:bg-[#4DA2FF]/20"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {coverImage ? 'Change Cover Image' : 'Upload Cover Image'}
                  </Button>
                  <p className="text-xs text-gray-400">Recommended: 1200x400px, max 5MB</p>
                </div>
                
                <input
                  ref={coverImageRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'cover')}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>

          {/* Basic Channel Information */}
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

              {/* Telegram Username */}
              <FormField
                control={form.control}
                name="telegramUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#C0E6FF]">Telegram Username for Direct Messages *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#C0E6FF] text-sm">
                          @
                        </div>
                        <Input
                          placeholder="your_telegram_username"
                          className="bg-[#1a2f51] border-[#C0E6FF]/30 text-white placeholder:text-[#C0E6FF]/60 pl-8"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-gray-400">
                      Users will contact you directly via this Telegram username for personal messages
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Creator Role and Categories */}
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

          {/* Channel Settings */}
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

          {/* Tip Pricing - Only show if Premium is enabled and packages are selected */}
          {watchIsPremium && watchSubscriptionPackages.length > 0 && (
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

          {/* Terms and Conditions */}
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

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#4da2ffcc] hover:bg-[#4da2ff] text-white px-8 py-3 text-lg font-semibold min-w-[200px]"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Channel...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Create My Channel
                </>
              )}
            </Button>
            </div>
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
              {!watchChannelName && !watchChannelDescription && !watchCreatorRole && !watchTelegramUsername && (
                <div className="text-center py-8 text-gray-400">
                  <Play className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Start filling the form to see your preview</p>
                </div>
              )}

              {/* Show preview when data exists */}
              {(watchChannelName || watchChannelDescription || watchCreatorRole || watchTelegramUsername) && (
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
              {(watchChannelName || watchChannelDescription || watchCreatorRole || watchTelegramUsername) && (
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
    </div>
  )
}
