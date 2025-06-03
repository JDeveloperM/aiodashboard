"use client"

import { useState } from "react"
import { Bell, X, Info, AlertTriangle, CreditCard, TrendingUp, Gift, Megaphone, FileText, Users, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Sample notification data - in a real app, this would come from an API or context
type Notification = {
  id: string
  title: string
  message: string
  date: string
  read: boolean
  type: "info" | "success" | "warning" | "error"
  category: "platform" | "monthly" | "community"
  icon: any
}

const initialNotifications: Notification[] = [
  // Platform Updates
  {
    id: "1",
    title: "System Update v2.1.0",
    message: "New features and performance improvements have been deployed",
    date: "2 hours ago",
    read: false,
    type: "info",
    category: "platform",
    icon: Megaphone
  },
  {
    id: "2",
    title: "Maintenance Complete",
    message: "Scheduled maintenance has been completed successfully",
    date: "1 day ago",
    read: false,
    type: "success",
    category: "platform",
    icon: AlertTriangle
  },
  {
    id: "3",
    title: "New Trading Bot Available",
    message: "Advanced crypto trading bot now available in marketplace",
    date: "3 days ago",
    read: true,
    type: "info",
    category: "platform",
    icon: TrendingUp
  },

  // Monthly Reports
  {
    id: "4",
    title: "November Trading Report",
    message: "Your monthly trading performance report is ready",
    date: "1 week ago",
    read: false,
    type: "info",
    category: "monthly",
    icon: FileText
  },
  {
    id: "5",
    title: "October Performance Summary",
    message: "Review your October trading statistics and achievements",
    date: "1 month ago",
    read: true,
    type: "success",
    category: "monthly",
    icon: FileText
  },

  // Community Updates
  {
    id: "6",
    title: "New Community Event",
    message: "Join our upcoming trading competition with $10K prizes",
    date: "3 hours ago",
    read: false,
    type: "success",
    category: "community",
    icon: Users
  },
  {
    id: "7",
    title: "Community Milestone",
    message: "We've reached 50,000 active traders! Thank you for being part of our community",
    date: "2 days ago",
    read: true,
    type: "success",
    category: "community",
    icon: Gift
  }
]

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [open, setOpen] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

  // Get notifications by category
  const platformNotifications = notifications.filter(n => n.category === "platform")
  const monthlyNotifications = notifications.filter(n => n.category === "monthly")
  const communityNotifications = notifications.filter(n => n.category === "community")

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  const getTypeStyles = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "text-green-500"
      case "warning":
        return "text-yellow-500"
      case "error":
        return "text-red-500"
      default:
        return "text-blue-500"
    }
  }

  const getCategoryIcon = (category: Notification["category"]) => {
    switch (category) {
      case "platform":
        return Megaphone
      case "monthly":
        return FileText
      case "community":
        return Users
      default:
        return Info
    }
  }

  const getCategoryName = (category: Notification["category"]) => {
    switch (category) {
      case "platform":
        return "Platform Updates"
      case "monthly":
        return "Monthly Reports"
      case "community":
        return "Community Updates"
      default:
        return "Other"
    }
  }

  const renderNotificationList = (notificationList: Notification[]) => {
    if (notificationList.length === 0) {
      return (
        <div className="p-8 text-center">
          <p className="text-slate-400 text-sm">No notifications in this category</p>
        </div>
      )
    }

    return (
      <div className="divide-y divide-slate-700">
        {notificationList.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "p-3 flex items-start gap-2 hover:bg-slate-800/50 transition-colors",
              !notification.read && "bg-slate-800"
            )}
          >
            <div className={cn("p-2 rounded-full flex-shrink-0",
              `${getTypeStyles(notification.type)} bg-opacity-10`
            )}>
              <notification.icon className={`h-4 w-4 ${getTypeStyles(notification.type)}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">{notification.title}</p>
              <p className="text-sm text-slate-300">{notification.message}</p>
              <p className="text-xs text-slate-400 mt-1">{notification.date}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white h-6 w-6 p-0 rounded-full"
              onClick={() => deleteNotification(notification.id)}
            >
              <span className="sr-only">Delete</span>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
    )
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative bg-transparent border-slate-700 rounded-full hover:border-[#4da2ff] hover:bg-[#4da2ff]/10 transition-colors">
          <Bell className="h-[1.2rem] w-[1.2rem] text-slate-200" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] bg-slate-900 border-slate-700 p-0">
        <div className="flex items-center justify-between p-3 border-b border-slate-700">
          <h3 className="font-medium text-white">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-slate-400 hover:text-white"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>

        <Tabs defaultValue="platform" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-slate-800 rounded-none border-b border-slate-700">
            <TabsTrigger value="platform" className="text-xs">Platform ({platformNotifications.length})</TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs">Monthly ({monthlyNotifications.length})</TabsTrigger>
            <TabsTrigger value="community" className="text-xs">Community ({communityNotifications.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="platform" className="max-h-[300px] overflow-y-auto">
            {renderNotificationList(platformNotifications)}
          </TabsContent>

          <TabsContent value="monthly" className="max-h-[300px] overflow-y-auto">
            {renderNotificationList(monthlyNotifications)}
          </TabsContent>

          <TabsContent value="community" className="max-h-[300px] overflow-y-auto">
            {renderNotificationList(communityNotifications)}
          </TabsContent>
        </Tabs>

        {/* See all Announcements button at bottom */}
        <div className="p-3 border-t border-slate-700 text-center">
          <Link href="/notifications">
            <Button
              variant="ghost"
              size="sm"
              className="text-[#4da2ff] hover:text-white hover:bg-[#4da2ff]/10 flex items-center gap-1 mx-auto"
            >
              See all Announcements
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
