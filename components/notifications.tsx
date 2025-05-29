"use client"

import { useState } from "react"
import { Bell, X, Info, AlertTriangle, CreditCard, TrendingUp, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

// Sample notification data - in a real app, this would come from an API or context
type Notification = {
  id: string
  title: string
  message: string
  date: string
  read: boolean
  type: "info" | "success" | "warning" | "error"
  icon: any
}

const initialNotifications: Notification[] = [
  {
    id: "1",
    title: "Subscription Activated",
    message: "Your VIP subscription has been activated",
    date: "2 hours ago",
    read: false,
    type: "success",
    icon: Gift
  },
  {
    id: "2",
    title: "New Bot Available",
    message: "New trading bot available in the marketplace",
    date: "1 day ago",
    read: false,
    type: "info",
    icon: Info
  },
  {
    id: "3",
    title: "Trading Success",
    message: "Your crypto bot has completed 10 successful trades",
    date: "3 days ago",
    read: true,
    type: "success",
    icon: TrendingUp
  },
  {
    id: "4",
    title: "System Maintenance",
    message: "System maintenance scheduled for tomorrow",
    date: "5 days ago",
    read: true,
    type: "warning",
    icon: AlertTriangle
  },
  {
    id: "5",
    title: "Payment Due",
    message: "Your subscription payment is due in 3 days",
    date: "1 week ago",
    read: true,
    type: "error",
    icon: CreditCard
  }
]

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [open, setOpen] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

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

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full grid grid-cols-2 bg-slate-800 rounded-none border-b border-slate-700">
            <TabsTrigger value="all" className="text-sm">All ({notifications.length})</TabsTrigger>
            <TabsTrigger value="unread" className="text-sm">Unread ({unreadCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="max-h-[300px] overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y divide-slate-700">
                {notifications.map((notification) => (
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
            ) : (
              <div className="p-8 text-center">
                <p className="text-slate-400 text-sm">No notifications</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="unread" className="max-h-[300px] overflow-y-auto">
            {unreadCount > 0 ? (
              <div className="divide-y divide-slate-700">
                {notifications.filter(n => !n.read).map((notification) => (
                  <div
                    key={notification.id}
                    className="p-3 flex items-start gap-2 bg-slate-800 hover:bg-slate-800/50 transition-colors"
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
            ) : (
              <div className="p-8 text-center">
                <p className="text-slate-400 text-sm">No unread notifications</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
