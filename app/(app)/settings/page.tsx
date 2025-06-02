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
import { Bell, Globe, Zap, AlertTriangle, User } from "lucide-react"
import { useNotifications } from "@/hooks/use-notifications"
import { DashboardProfiles } from "@/components/dashboard-profiles"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const isDeleteConfirmed = deleteConfirmation === "DELETE"

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
        <TabsList className="grid w-full grid-cols-3 bg-[#011829] border border-[#C0E6FF]/20">
          <TabsTrigger value="account" className="text-[#C0E6FF] data-[state=active]:bg-[#4DA2FF] data-[state=active]:text-white">Account</TabsTrigger>
          <TabsTrigger value="general" className="text-[#C0E6FF] data-[state=active]:bg-[#4DA2FF] data-[state=active]:text-white">General</TabsTrigger>
          <TabsTrigger value="notifications" className="text-[#C0E6FF] data-[state=active]:bg-[#4DA2FF] data-[state=active]:text-white">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <DashboardProfiles />
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
                  <Select defaultValue="en">
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
                    <Switch id="performance" />
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-[#C0E6FF]/20">
                <Button className="bg-[#4da2ff] hover:bg-[#3d8ae6] text-white transition-colors duration-200">
                  Save Changes
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
                <Button className="bg-[#4da2ff] hover:bg-[#3d8ae6] text-white transition-colors duration-200">
                  Save Preferences
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  )
}
