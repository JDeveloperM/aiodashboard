"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Bell, Globe, Zap, AlertTriangle, User, CreditCard, Coins, Plus, Trash2 } from "lucide-react"
import { useNotifications } from "@/hooks/use-notifications"
import { usePersistentProfile } from "@/hooks/use-persistent-profile"
import { useSuiAuth } from "@/contexts/sui-auth-context"
import { DashboardProfiles } from "@/components/dashboard-profiles"
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
  // Use our notification hook
  const {
    permission: notificationPermission,
    settings: notifications,
    updateSettings: setNotifications,
    requestPermission: requestNotificationPermission,
    sendTestNotification,
    isSupported: isNotificationSupported
  } = useNotifications()

  // Use persistent profile system
  const { user } = useSuiAuth()
  const { profile, updateProfile, isLoading } = usePersistentProfile()

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
  const [language, setLanguage] = useState("en")
  const [performanceMode, setPerformanceMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const isDeleteConfirmed = deleteConfirmation === "DELETE"

  // Load settings from persistent profile
  useEffect(() => {
    if (profile) {
      // Load payment preferences
      const paymentPrefs = profile.payment_preferences || {}
      setPaymentMethods(paymentPrefs.payment_methods || [])
      setPointsAutoRenewal(paymentPrefs.points_auto_renewal !== false)

      // Load display preferences
      const displayPrefs = profile.display_preferences || {}
      setLanguage(displayPrefs.language || "en")
      setPerformanceMode(displayPrefs.performance_mode || false)
    }
  }, [profile])

  // Save payment preferences to database
  const savePaymentPreferences = async (updatedMethods: PaymentMethod[], autoRenewal: boolean) => {
    if (!user?.address) return

    try {
      const paymentPreferences = {
        payment_methods: updatedMethods,
        points_auto_renewal: autoRenewal
      }

      await updateProfile({
        payment_preferences: paymentPreferences
      })

      console.log('✅ Payment preferences saved to database and Walrus')
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
        language,
        performance_mode: performanceMode,
        email_notifications: notifications.email,
        push_notifications: notifications.push,
        browser_notifications: notifications.browser,
        trade_notifications: notifications.trades,
        news_notifications: notifications.news,
        promo_notifications: notifications.promotions
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
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Settings</h1>
          <p className="text-[#C0E6FF] mt-1">Manage your account settings and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-[#011829] border border-[#C0E6FF]/20">
          <TabsTrigger value="account" className="text-[#C0E6FF] data-[state=active]:bg-[#4DA2FF] data-[state=active]:text-white">Account</TabsTrigger>
          <TabsTrigger value="payment" className="text-[#C0E6FF] data-[state=active]:bg-[#4DA2FF] data-[state=active]:text-white">Payment Methods</TabsTrigger>
          <TabsTrigger value="general" className="text-[#C0E6FF] data-[state=active]:bg-[#4DA2FF] data-[state=active]:text-white">General</TabsTrigger>
          <TabsTrigger value="notifications" className="text-[#C0E6FF] data-[state=active]:bg-[#4DA2FF] data-[state=active]:text-white">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <DashboardProfiles />
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
                        <Globe className="h-5 w-5 text-[#4DA2FF]" />
                        <Label htmlFor="language" className="text-white">Language</Label>
                      </div>
                      <p className="text-sm text-[#C0E6FF]">Select your preferred language.</p>
                    </div>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications({ email: checked })}
                  />
                </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-notifications" className="text-white">Push Notifications</Label>
                      <p className="text-sm text-[#C0E6FF]">Receive notifications on your mobile device.</p>
                    </div>
                  <Switch
                    id="push-notifications"
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications({ push: checked })}
                  />
                </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="browser-notifications" className="text-white">Browser Notifications</Label>
                      <p className="text-sm text-[#C0E6FF]">
                        Receive notifications in this browser when the app is open.
                        {notificationPermission === "denied" && (
                          <span className="block text-red-500 mt-1">
                            Notifications are blocked. Please update your browser settings.
                          </span>
                        )}
                      </p>
                    </div>
                  <div className="flex items-center gap-2">
                    {notificationPermission !== "granted" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={requestNotificationPermission}
                        disabled={notificationPermission === "denied"}
                      >
                        {notificationPermission === "denied" ? "Blocked" : "Enable"}
                      </Button>
                    )}
                    <Switch
                      id="browser-notifications"
                      checked={notifications.browser && notificationPermission === "granted"}
                      onCheckedChange={(checked) => {
                        if (notificationPermission !== "granted" && checked) {
                          requestNotificationPermission();
                        } else {
                          setNotifications({ browser: checked });
                        }
                      }}
                      disabled={notificationPermission !== "granted"}
                    />
                  </div>
                </div>

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
                        checked={notifications.trades}
                        onCheckedChange={(checked) => setNotifications({ trades: checked })}
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
                        checked={notifications.news}
                        onCheckedChange={(checked) => setNotifications({ news: checked })}
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
                          checked={notifications.promotions}
                          onCheckedChange={(checked) => setNotifications({ promotions: checked })}
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
        </TabsContent>

      </Tabs>
    </div>
  )
}
