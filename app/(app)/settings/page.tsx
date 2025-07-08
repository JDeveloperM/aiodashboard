"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Bell, Globe, Zap, AlertTriangle, User, CreditCard, Coins, Plus, Trash2, Shield, Eye, EyeOff, Settings, Flag } from "lucide-react"
import { useNotifications } from "@/hooks/use-notifications"
import { useProfile } from "@/contexts/profile-context"
import { useSuiAuth } from "@/contexts/sui-auth-context"
import { DashboardProfiles } from "@/components/dashboard-profiles"
import { NewUserOnboarding } from "@/components/new-user-onboarding"
import { KYCVerificationFlow } from "@/components/kyc-verification-flow"

import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface PaymentMethod {
  id: string
  type: string
  name: string
  last4: string
  expiryMonth: string
  expiryYear: string
  isDefault: boolean
  autoRenewal: boolean
}
export default function SettingsPage() {
  // Use persistent profile system
  const { user, isNewUser } = useSuiAuth()

  // Check if user is admin
  const isAdmin = user?.address === '0x311479200d45ef0243b92dbcf9849b8f6b931d27ae885197ea73066724f2bcf4'

  // Use our notification hook
  const {
    permission: notificationPermission,
    settings: notifications,
    updateSettings: updateNotificationSettings,
    requestPermission: requestNotificationPermission,
    isSupported: isNotificationSupported,
    sendTestNotification
  } = useNotifications(user?.address)
  const { profile, updateProfile, isLoading } = useProfile()

  // KYC flow state
  const [showKYCFlow, setShowKYCFlow] = useState(false)

  // Payment method state - loaded from persistent profile
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [pointsAutoRenewal, setPointsAutoRenewal] = useState(false)
  const [showAddCardDialog, setShowAddCardDialog] = useState(false)
  const [newCardData, setNewCardData] = useState({
    number: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    name: ''
  })

  // General settings state - loaded from persistent profile
  const [performanceMode, setPerformanceMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Privacy settings state
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'private'>('public')
  const [showAchievements, setShowAchievements] = useState(true)
  const [showLevel, setShowLevel] = useState(true)
  const [showJoinDate, setShowJoinDate] = useState(true)
  const [showLastActive, setShowLastActive] = useState(false)
  const [allowProfileSearch, setAllowProfileSearch] = useState(true)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const isDeleteConfirmed = deleteConfirmation === "DELETE"

  // Load settings from persistent profile
  useEffect(() => {
    if (profile) {
      // Load payment preferences (using localStorage fallback since column doesn't exist)
      const savedPaymentMethods = localStorage.getItem(`payment_methods_${user?.address}`)
      const savedAutoRenewal = localStorage.getItem(`points_auto_renewal_${user?.address}`)

      if (savedPaymentMethods) {
        setPaymentMethods(JSON.parse(savedPaymentMethods))
      }
      if (savedAutoRenewal) {
        setPointsAutoRenewal(savedAutoRenewal === 'true')
      }

      // Load display preferences
      const displayPrefs = profile.display_preferences || {}
      setPerformanceMode(displayPrefs.performance_mode || false)

      // Load privacy preferences
      const privacyPrefs = displayPrefs.privacy_settings || {}
      setProfileVisibility(privacyPrefs.profile_visibility || 'public')
      setShowAchievements(privacyPrefs.show_achievements !== false)
      setShowLevel(privacyPrefs.show_level !== false)
      setShowJoinDate(privacyPrefs.show_join_date !== false)
      setShowLastActive(privacyPrefs.show_last_active === true)
      setAllowProfileSearch(privacyPrefs.allow_profile_search !== false)
    }
  }, [profile])

  // Save payment preferences to localStorage (since column doesn't exist in database)
  const savePaymentPreferences = async (updatedMethods: PaymentMethod[], autoRenewal: boolean) => {
    if (!user?.address) return

    try {
      // Save to localStorage as fallback
      localStorage.setItem(`payment_methods_${user.address}`, JSON.stringify(updatedMethods))
      localStorage.setItem(`points_auto_renewal_${user.address}`, autoRenewal.toString())

      console.log('✅ Payment preferences saved to localStorage')
      toast.success('Payment preferences saved')
    } catch (error) {
      console.error('❌ Failed to save payment preferences:', error)
      toast.error('Failed to save payment preferences')
    }
  }

  // Payment method functions
  const handleAddCard = async () => {
    const newCard: PaymentMethod = {
      id: Date.now().toString(),
      type: 'card',
      name: `${newCardData.name} ending in ${newCardData.number.slice(-4)}`,
      last4: newCardData.number.slice(-4),
      expiryMonth: newCardData.expiryMonth,
      expiryYear: newCardData.expiryYear,
      isDefault: paymentMethods.length === 0,
      autoRenewal: false
    }

    const updatedMethods = [...paymentMethods, newCard]
    setPaymentMethods(updatedMethods)
    await savePaymentPreferences(updatedMethods, pointsAutoRenewal)

    setNewCardData({ number: '', expiryMonth: '', expiryYear: '', cvc: '', name: '' })
    setShowAddCardDialog(false)
    toast.success('Payment method added successfully!')
  }

  const handleRemoveCard = async (cardId: string) => {
    const updatedMethods = paymentMethods.filter(method => method.id !== cardId)
    setPaymentMethods(updatedMethods)
    await savePaymentPreferences(updatedMethods, pointsAutoRenewal)
    toast.success('Payment method removed successfully!')
  }

  const handleSetDefault = async (cardId: string) => {
    const updatedMethods = paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === cardId
    }))
    setPaymentMethods(updatedMethods)
    await savePaymentPreferences(updatedMethods, pointsAutoRenewal)
    toast.success('Default payment method updated!')
  }

  const handleToggleAutoRenewal = async (cardId: string) => {
    const updatedMethods = paymentMethods.map(method =>
      method.id === cardId
        ? { ...method, autoRenewal: !method.autoRenewal }
        : method
    )
    setPaymentMethods(updatedMethods)
    await savePaymentPreferences(updatedMethods, pointsAutoRenewal)
    toast.success('Auto-renewal setting updated!')
  }

  const handlePointsAutoRenewalChange = async (checked: boolean) => {
    setPointsAutoRenewal(checked)
    await savePaymentPreferences(paymentMethods, checked)
    toast.success('Points auto-renewal setting updated!')
  }

  // Save general settings to database
  const saveGeneralSettings = async () => {
    if (!user?.address) {
      toast.error("Please connect your wallet first")
      return
    }

    setIsSaving(true)

    try {
      console.log('💾 Saving general settings to database and Walrus...')

      const displayPreferences = {
        ...profile?.display_preferences,
        performance_mode: performanceMode,
        email_notifications: notifications?.email_enabled,
        push_notifications: notifications?.push_enabled,
        browser_notifications: notifications?.browser_enabled,
        trade_notifications: notifications?.trade_enabled,
        news_notifications: notifications?.platform_enabled,
        promo_notifications: notifications?.promotion_enabled,
        privacy_settings: {
          profile_visibility: profileVisibility,
          show_achievements: showAchievements,
          show_level: showLevel,
          show_join_date: showJoinDate,
          show_last_active: showLastActive,
          allow_profile_search: allowProfileSearch
        }
      }

      await updateProfile({
        display_preferences: displayPreferences
      })

      toast.success('✅ Settings saved successfully to database and Walrus!')
    } catch (error) {
      console.error('💥 Error saving settings:', error)
      toast.error(`Failed to save settings: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    setIsSaving(false)
  }

  const handleDeleteAccount = () => {
    if (!isDeleteConfirmed) return

    // Here you would implement the actual account deletion logic
    console.log("Account deletion requested")
    setDeleteDialogOpen(false)
    setDeleteConfirmation("")
  }

  return (
    <>
      {/* New User Onboarding Modal */}
      <NewUserOnboarding />

      {/* KYC Verification Flow */}
      <KYCVerificationFlow
        isOpen={showKYCFlow}
        onClose={() => setShowKYCFlow(false)}
        onComplete={() => {
          setShowKYCFlow(false)
          toast.success('KYC verification completed!')
        }}
      />

      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Settings</h1>
            <p className="text-[#C0E6FF] mt-1">
              {isNewUser && !user?.onboardingCompleted
                ? "Complete your account setup to access all features"
                : "Manage your account settings and preferences"
              }
            </p>
          </div>
          {profile?.kyc_status !== 'verified' && (
            <Button
              onClick={() => setShowKYCFlow(true)}
              className="bg-[#4DA2FF] hover:bg-[#3d8ae6] text-white"
            >
              Complete KYC
            </Button>
          )}
        </div>

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 bg-[#011829] border border-[#C0E6FF]/20">
          <TabsTrigger value="account" className="text-[#C0E6FF] data-[state=active]:bg-[#4DA2FF] data-[state=active]:text-white">Account</TabsTrigger>
          <TabsTrigger value="privacy" className="text-[#C0E6FF] data-[state=active]:bg-[#4DA2FF] data-[state=active]:text-white">Privacy</TabsTrigger>
          <TabsTrigger value="payment" className="text-[#C0E6FF] data-[state=active]:bg-[#4DA2FF] data-[state=active]:text-white">Payment</TabsTrigger>
          <TabsTrigger value="general" className="text-[#C0E6FF] data-[state=active]:bg-[#4DA2FF] data-[state=active]:text-white">General</TabsTrigger>
          <TabsTrigger value="notifications" className="text-[#C0E6FF] data-[state=active]:bg-[#4DA2FF] data-[state=active]:text-white">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <DashboardProfiles />
        </TabsContent>

        <TabsContent value="privacy">
          <div className="enhanced-card">
            <div className="enhanced-card-content">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-[#4DA2FF]" />
                  <h3 className="text-lg font-semibold text-white">Privacy Settings</h3>
                </div>
                <p className="text-[#C0E6FF] text-sm">Control who can see your profile and what information is displayed publicly.</p>
              </div>

              <div className="space-y-6">
                {/* Profile Visibility */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-[#4DA2FF]" />
                        <Label htmlFor="profile-visibility" className="text-white">Profile Visibility</Label>
                      </div>
                      <p className="text-sm text-[#C0E6FF]">Choose who can view your profile.</p>
                    </div>
                    <Select value={profileVisibility} onValueChange={(value: 'public' | 'private') => setProfileVisibility(value)}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            Public
                          </div>
                        </SelectItem>
                        <SelectItem value="private">
                          <div className="flex items-center gap-2">
                            <EyeOff className="w-4 h-4" />
                            Private
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {profileVisibility === 'private' && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-yellow-400 mb-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-medium">Private Profile</span>
                      </div>
                      <p className="text-sm text-yellow-300">
                        Your profile will not be visible to other users. Profile links will show a "Profile not found" message.
                      </p>
                    </div>
                  )}
                </div>

                {/* Search Visibility */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-[#4DA2FF]" />
                      <Label htmlFor="allow-search" className="text-white">Allow Profile Search</Label>
                    </div>
                    <p className="text-sm text-[#C0E6FF]">Allow other users to find your profile through search.</p>
                  </div>
                  <Switch
                    id="allow-search"
                    checked={allowProfileSearch}
                    onCheckedChange={setAllowProfileSearch}
                    disabled={profileVisibility === 'private'}
                  />
                </div>

                {/* Information Display Settings */}
                <div className="border-t border-[#C0E6FF]/20 pt-6">
                  <h4 className="text-white font-medium mb-4">Public Information Display</h4>
                  <p className="text-sm text-[#C0E6FF] mb-4">
                    Choose what information to show on your public profile. These settings only apply when your profile is public.
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="show-achievements" className="text-white">Show Achievements</Label>
                        <p className="text-sm text-[#C0E6FF]">Display your claimed achievements on your profile.</p>
                      </div>
                      <Switch
                        id="show-achievements"
                        checked={showAchievements}
                        onCheckedChange={setShowAchievements}
                        disabled={profileVisibility === 'private'}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="show-level" className="text-white">Show Level & XP</Label>
                        <p className="text-sm text-[#C0E6FF]">Display your profile level and XP progress.</p>
                      </div>
                      <Switch
                        id="show-level"
                        checked={showLevel}
                        onCheckedChange={setShowLevel}
                        disabled={profileVisibility === 'private'}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="show-join-date" className="text-white">Show Join Date</Label>
                        <p className="text-sm text-[#C0E6FF]">Display when you joined the platform.</p>
                      </div>
                      <Switch
                        id="show-join-date"
                        checked={showJoinDate}
                        onCheckedChange={setShowJoinDate}
                        disabled={profileVisibility === 'private'}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="show-last-active" className="text-white">Show Last Active</Label>
                        <p className="text-sm text-[#C0E6FF]">Display when you were last active on the platform.</p>
                      </div>
                      <Switch
                        id="show-last-active"
                        checked={showLastActive}
                        onCheckedChange={setShowLastActive}
                        disabled={profileVisibility === 'private'}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-[#C0E6FF]/20">
                <Button
                  onClick={saveGeneralSettings}
                  disabled={isSaving || isLoading}
                  className="bg-[#4da2ff] hover:bg-[#3d8ae6] text-white transition-colors duration-200"
                >
                  {isSaving ? "Saving Privacy Settings..." : "Save Privacy Settings"}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payment">
          <div className="space-y-6">
            {/* Points Payment Method */}
            <div className="enhanced-card">
              <div className="enhanced-card-content">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Coins className="h-5 w-5 text-[#4DA2FF]" />
                    <h3 className="text-lg font-semibold text-white">Points Payment</h3>
                  </div>
                  <p className="text-[#C0E6FF] text-sm">Use your earned points to pay for subscriptions and services.</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-[#1a2f51] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#4DA2FF]/20 rounded-lg">
                          <Coins className="w-5 h-5 text-[#4DA2FF]" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">Available Points</h4>
                          <p className="text-[#C0E6FF] text-sm">Current balance</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">{(profile?.points || 0).toLocaleString()}</p>
                        <p className="text-[#C0E6FF] text-sm">Points</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#C0E6FF]/20">
                      <div>
                        <Label htmlFor="points-auto-renewal" className="text-white">Auto-renewal with Points</Label>
                        <p className="text-sm text-[#C0E6FF]">Automatically renew subscriptions using points when available.</p>
                      </div>
                      <Switch
                        id="points-auto-renewal"
                        checked={pointsAutoRenewal}
                        onCheckedChange={handlePointsAutoRenewalChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Credit/Debit Cards */}
            <div className="enhanced-card">
              <div className="enhanced-card-content">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-[#4DA2FF]" />
                      <h3 className="text-lg font-semibold text-white">Credit & Debit Cards</h3>
                    </div>
                    <Dialog open={showAddCardDialog} onOpenChange={setShowAddCardDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-[#4DA2FF] hover:bg-[#3d8ae6] text-white">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Card
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#0c1b36] border border-[#C0E6FF]/20">
                        <DialogHeader>
                          <DialogTitle className="text-white">Add New Card</DialogTitle>
                          <DialogDescription className="text-[#C0E6FF]">
                            Add a new credit or debit card for payments.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="card-name" className="text-white">Cardholder Name</Label>
                            <Input
                              id="card-name"
                              placeholder="John Doe"
                              value={newCardData.name}
                              onChange={(e) => setNewCardData({...newCardData, name: e.target.value})}
                              className="bg-[#1a2f51] border-[#C0E6FF]/20 text-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor="card-number" className="text-white">Card Number</Label>
                            <Input
                              id="card-number"
                              placeholder="1234 5678 9012 3456"
                              value={newCardData.number}
                              onChange={(e) => setNewCardData({...newCardData, number: e.target.value})}
                              className="bg-[#1a2f51] border-[#C0E6FF]/20 text-white"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="expiry-month" className="text-white">Month</Label>
                              <Select value={newCardData.expiryMonth} onValueChange={(value) => setNewCardData({...newCardData, expiryMonth: value})}>
                                <SelectTrigger className="bg-[#1a2f51] border-[#C0E6FF]/20 text-white">
                                  <SelectValue placeholder="MM" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({length: 12}, (_, i) => (
                                    <SelectItem key={i+1} value={String(i+1).padStart(2, '0')}>
                                      {String(i+1).padStart(2, '0')}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="expiry-year" className="text-white">Year</Label>
                              <Select value={newCardData.expiryYear} onValueChange={(value) => setNewCardData({...newCardData, expiryYear: value})}>
                                <SelectTrigger className="bg-[#1a2f51] border-[#C0E6FF]/20 text-white">
                                  <SelectValue placeholder="YYYY" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({length: 10}, (_, i) => (
                                    <SelectItem key={2024+i} value={String(2024+i)}>
                                      {2024+i}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="cvc" className="text-white">CVC</Label>
                              <Input
                                id="cvc"
                                placeholder="123"
                                value={newCardData.cvc}
                                onChange={(e) => setNewCardData({...newCardData, cvc: e.target.value})}
                                className="bg-[#1a2f51] border-[#C0E6FF]/20 text-white"
                              />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowAddCardDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleAddCard} className="bg-[#4DA2FF] hover:bg-[#3d8ae6] text-white">
                            Add Card
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <p className="text-[#C0E6FF] text-sm">Manage your payment methods and auto-renewal settings.</p>
                </div>

                <div className="space-y-4">
                  {paymentMethods.length === 0 ? (
                    <div className="text-center py-8">
                      <CreditCard className="w-12 h-12 text-[#C0E6FF]/50 mx-auto mb-4" />
                      <p className="text-[#C0E6FF] mb-2">No payment methods added</p>
                      <p className="text-[#C0E6FF]/70 text-sm">Add a card to enable automatic payments</p>
                    </div>
                  ) : (
                    paymentMethods.map((method) => (
                      <div key={method.id} className="bg-[#1a2f51] rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#4DA2FF]/20 rounded-lg">
                              <CreditCard className="w-5 h-5 text-[#4DA2FF]" />
                            </div>
                            <div>
                              <h4 className="text-white font-medium">{method.name}</h4>
                              <p className="text-[#C0E6FF] text-sm">Expires {method.expiryMonth}/{method.expiryYear}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {method.isDefault && (
                              <Badge className="bg-[#4DA2FF] text-white">Default</Badge>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveCard(method.id)}
                              className="text-red-400 border-red-400/20 hover:bg-red-400/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-3 pt-3 border-t border-[#C0E6FF]/20">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor={`auto-renewal-${method.id}`} className="text-white">Auto-renewal</Label>
                              <p className="text-sm text-[#C0E6FF]">Automatically renew subscriptions with this card.</p>
                            </div>
                            <Switch
                              id={`auto-renewal-${method.id}`}
                              checked={method.autoRenewal}
                              onCheckedChange={() => handleToggleAutoRenewal(method.id)}
                            />
                          </div>

                          {!method.isDefault && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetDefault(method.id)}
                              className="text-[#4DA2FF] border-[#4DA2FF]/20 hover:bg-[#4DA2FF]/10"
                            >
                              Set as Default
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="general">
          <div className="enhanced-card">
            <div className="enhanced-card-content">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">General Settings</h3>
                <p className="text-[#C0E6FF] text-sm">Manage your account settings and preferences.</p>
              </div>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-[#FFD700]" />
                        <Label htmlFor="performance" className="text-white">Performance Mode</Label>
                      </div>
                      <p className="text-sm text-[#C0E6FF]">Optimize for performance on slower devices.</p>
                    </div>
                    <Switch
                      id="performance"
                      checked={performanceMode}
                      onCheckedChange={setPerformanceMode}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-[#C0E6FF]/20">
                <Button
                  onClick={saveGeneralSettings}
                  disabled={isSaving || isLoading}
                  className="bg-[#4da2ff] hover:bg-[#3d8ae6] text-white transition-colors duration-200"
                >
                  {isSaving ? "Saving to Database & Walrus..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="enhanced-card border-red-500/20">
              <div className="enhanced-card-content">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <h3 className="text-lg font-semibold text-red-500">Danger Zone</h3>
                  </div>
                  <p className="text-[#C0E6FF] text-sm">
                    Actions in this section can lead to permanent data loss. Please proceed with caution.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-[#C0E6FF]">
                      Deleting your account will permanently remove all your data, including your profile, settings, and trading history.
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-red-500/20">
                  <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="bg-red-500 hover:bg-red-600">
                        Delete Account
                      </Button>
                    </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <span>Confirm Account Deletion</span>
                      </DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-sm text-muted-foreground">
                        Please type <span className="font-bold">DELETE</span> to confirm.
                      </p>
                      <Input
                        className="mt-2"
                        placeholder="Type DELETE to confirm"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        className="bg-red-500 hover:bg-red-600"
                        onClick={handleDeleteAccount}
                        disabled={!isDeleteConfirmed}
                      >
                        Delete Account
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="enhanced-card">
            <div className="enhanced-card-content">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="h-5 w-5 text-[#4DA2FF]" />
                  <h3 className="text-lg font-semibold text-white">Notification Settings</h3>
                </div>
                <p className="text-[#C0E6FF] text-sm">Configure how and when you receive notifications.</p>
              </div>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications" className="text-white">Email Notifications</Label>
                      <p className="text-sm text-[#C0E6FF]">Receive notifications via email.</p>
                    </div>
                  <Switch
                    id="email-notifications"
                    checked={notifications?.email_enabled ?? true}
                    onCheckedChange={(checked) => updateNotificationSettings({ email_enabled: checked })}
                  />
                </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-notifications" className="text-white">Push Notifications</Label>
                      <p className="text-sm text-[#C0E6FF]">Receive notifications on your mobile device.</p>
                    </div>
                  <Switch
                    id="push-notifications"
                    checked={notifications?.push_enabled ?? true}
                    onCheckedChange={(checked) => updateNotificationSettings({ push_enabled: checked })}
                  />
                </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="browser-notifications" className="text-white">Browser Notifications</Label>
                      <p className="text-sm text-[#C0E6FF]">Receive notifications in your browser.</p>
                      {notificationPermission === 'denied' && (
                        <p className="text-xs text-red-400 mt-1">Browser notifications are blocked. Please enable them in your browser settings.</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {notificationPermission === 'default' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={requestNotificationPermission}
                          className="text-xs bg-transparent border-slate-700 text-white hover:bg-[#4da2ff]/10 hover:border-[#4da2ff]"
                        >
                          Enable
                        </Button>
                      )}
                      <Switch
                        id="browser-notifications"
                        checked={notifications?.browser_enabled ?? true}
                        onCheckedChange={(checked) => updateNotificationSettings({ browser_enabled: checked })}
                        disabled={notificationPermission === 'denied'}
                      />
                    </div>
                  </div>

                  {notificationPermission === 'granted' && notifications?.browser_enabled && (
                    <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg">
                      <div>
                        <Label className="text-white">Test Browser Notifications</Label>
                        <p className="text-sm text-[#C0E6FF]">Send a test notification to verify everything is working.</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={sendTestNotification}
                        className="bg-transparent border-slate-700 text-white hover:bg-[#4da2ff]/10 hover:border-[#4da2ff]"
                      >
                        Send Test
                      </Button>
                    </div>
                  )}

                  <div className="border-t border-[#C0E6FF]/20 pt-4">
                    <h3 className="text-lg font-medium mb-2 text-white">Notification Types</h3>
                    <p className="text-sm text-[#C0E6FF] mb-4">
                      Choose which types of notifications you want to receive. These settings apply to all notification methods (email, push, and browser).
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="trade-notifications" className="text-white">Trade Executions</Label>
                          <p className="text-sm text-[#C0E6FF]">
                            Receive notifications when trades are opened or closed.
                          </p>
                        </div>
                      <Switch
                        id="trade-notifications"
                        checked={notifications?.trade_enabled ?? true}
                        onCheckedChange={(checked) => updateNotificationSettings({ trade_enabled: checked })}
                      />
                    </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="news-notifications" className="text-white">Market News</Label>
                          <p className="text-sm text-[#C0E6FF]">
                            Receive notifications about important market events and news.
                          </p>
                        </div>
                      <Switch
                        id="news-notifications"
                        checked={notifications?.platform_enabled ?? true}
                        onCheckedChange={(checked) => updateNotificationSettings({ platform_enabled: checked })}
                      />
                    </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="promo-notifications" className="text-white">Promotions & Updates</Label>
                          <p className="text-sm text-[#C0E6FF]">
                            Receive notifications about new features, promotions, and platform updates.
                          </p>
                        </div>
                        <Switch
                          id="promo-notifications"
                          checked={notifications?.promotion_enabled ?? false}
                          onCheckedChange={(checked) => updateNotificationSettings({ promotion_enabled: checked })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-[#C0E6FF]/20">
                <Button
                  onClick={saveGeneralSettings}
                  disabled={isSaving || isLoading}
                  className="bg-[#4da2ff] hover:bg-[#3d8ae6] text-white transition-colors duration-200"
                >
                  {isSaving ? "Saving to Database & Walrus..." : "Save Preferences"}
                </Button>
              </div>
            </div>
          </div>

          {/* Admin Dashboard Link */}
          {isAdmin && (
            <div className="enhanced-card">
              <div className="enhanced-card-content p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[#4da2ff]/20 p-3 rounded-full">
                    <Shield className="w-6 h-6 text-[#4da2ff]" />
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-semibold">Admin Functions</h3>
                    <p className="text-gray-400 text-sm">Access admin dashboard for platform management</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link href="/admin-dashboard">
                    <Button className="bg-[#4da2ff] hover:bg-[#4da2ff]/80 text-white">
                      <Settings className="w-4 h-4 mr-2" />
                      Open Admin Dashboard
                    </Button>
                  </Link>
                  <Link href="/admin-reports">
                    <Button variant="outline" className="border-[#C0E6FF]/30 text-white hover:bg-[#C0E6FF]/10">
                      <Flag className="w-4 h-4 mr-2" />
                      View Reports
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

      </Tabs>
    </div>
    </>
  )
}
