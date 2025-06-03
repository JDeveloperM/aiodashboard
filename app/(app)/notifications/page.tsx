"use client"

import { useState } from "react"
import { Search, Filter, Bell, Megaphone, FileText, Users, X, Info, AlertTriangle, TrendingUp, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

// Same notification type and data as in the notifications component
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

const allNotifications: Notification[] = [
  // Platform Updates
  {
    id: "1",
    title: "System Update v2.1.0",
    message: "New features and performance improvements have been deployed. This update includes enhanced security measures, improved user interface elements, and better performance optimization for trading operations.",
    date: "2 hours ago",
    read: false,
    type: "info",
    category: "platform",
    icon: Megaphone
  },
  {
    id: "2",
    title: "Maintenance Complete",
    message: "Scheduled maintenance has been completed successfully. All systems are now fully operational and running at optimal performance.",
    date: "1 day ago",
    read: false,
    type: "success",
    category: "platform",
    icon: AlertTriangle
  },
  {
    id: "3",
    title: "New Trading Bot Available",
    message: "Advanced crypto trading bot now available in marketplace. This bot features AI-powered decision making and risk management capabilities.",
    date: "3 days ago",
    read: true,
    type: "info",
    category: "platform",
    icon: TrendingUp
  },
  {
    id: "8",
    title: "Security Enhancement",
    message: "We've implemented additional security measures to protect your account and trading activities.",
    date: "1 week ago",
    read: true,
    type: "success",
    category: "platform",
    icon: Info
  },
  
  // Monthly Reports
  {
    id: "4",
    title: "November Trading Report",
    message: "Your monthly trading performance report is ready. Review your profits, losses, and trading statistics for November 2024.",
    date: "1 week ago",
    read: false,
    type: "info",
    category: "monthly",
    icon: FileText
  },
  {
    id: "5",
    title: "October Performance Summary",
    message: "Review your October trading statistics and achievements. Your portfolio showed a 15% growth this month with 85% successful trades.",
    date: "1 month ago",
    read: true,
    type: "success",
    category: "monthly",
    icon: FileText
  },
  {
    id: "9",
    title: "September Monthly Report",
    message: "Your September trading report shows excellent performance with consistent profits across multiple trading pairs.",
    date: "2 months ago",
    read: true,
    type: "success",
    category: "monthly",
    icon: FileText
  },
  
  // Community Updates
  {
    id: "6",
    title: "New Community Event",
    message: "Join our upcoming trading competition with $10K prizes. Registration opens tomorrow and the competition runs for 2 weeks.",
    date: "3 hours ago",
    read: false,
    type: "success",
    category: "community",
    icon: Users
  },
  {
    id: "7",
    title: "Community Milestone",
    message: "We've reached 50,000 active traders! Thank you for being part of our growing community. Special rewards are coming soon.",
    date: "2 days ago",
    read: true,
    type: "success",
    category: "community",
    icon: Gift
  },
  {
    id: "10",
    title: "Weekly Community Digest",
    message: "Check out this week's top performing traders and learn from their strategies. New educational content available.",
    date: "1 week ago",
    read: true,
    type: "info",
    category: "community",
    icon: Users
  }
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(allNotifications)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<"all" | "platform" | "monthly" | "community">("all")

  // Filter notifications based on search and category
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || notification.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Get counts for each category
  const platformCount = notifications.filter(n => n.category === "platform").length
  const monthlyCount = notifications.filter(n => n.category === "monthly").length
  const communityCount = notifications.filter(n => n.category === "community").length
  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

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

  const getCategoryName = (category: Notification["category"]) => {
    switch (category) {
      case "platform":
        return "Platform Updates"
      case "monthly":
        return "Monthly Reports"
      case "community":
        return "Community Updates"
      default:
        return "All"
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Notifications</h1>
          <p className="text-gray-400 mt-1">Stay updated with platform announcements, reports, and community news</p>
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={markAllAsRead}
            variant="outline"
            className="bg-transparent border-slate-700 text-white hover:bg-[#4da2ff]/10 hover:border-[#4da2ff]"
          >
            Mark all as read ({unreadCount})
          </Button>
        )}
      </div>

      {/* Search and Filter Section */}
      <Card className="bg-[#1a2f51] border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
                className={selectedCategory === "all" 
                  ? "bg-[#4da2ff] hover:bg-[#4da2ff]/80" 
                  : "bg-transparent border-slate-700 text-white hover:bg-[#4da2ff]/10 hover:border-[#4da2ff]"
                }
              >
                All ({notifications.length})
              </Button>
              <Button
                variant={selectedCategory === "platform" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("platform")}
                className={selectedCategory === "platform" 
                  ? "bg-[#4da2ff] hover:bg-[#4da2ff]/80" 
                  : "bg-transparent border-slate-700 text-white hover:bg-[#4da2ff]/10 hover:border-[#4da2ff]"
                }
              >
                <Megaphone className="h-4 w-4 mr-1" />
                Platform ({platformCount})
              </Button>
              <Button
                variant={selectedCategory === "monthly" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("monthly")}
                className={selectedCategory === "monthly" 
                  ? "bg-[#4da2ff] hover:bg-[#4da2ff]/80" 
                  : "bg-transparent border-slate-700 text-white hover:bg-[#4da2ff]/10 hover:border-[#4da2ff]"
                }
              >
                <FileText className="h-4 w-4 mr-1" />
                Monthly ({monthlyCount})
              </Button>
              <Button
                variant={selectedCategory === "community" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("community")}
                className={selectedCategory === "community" 
                  ? "bg-[#4da2ff] hover:bg-[#4da2ff]/80" 
                  : "bg-transparent border-slate-700 text-white hover:bg-[#4da2ff]/10 hover:border-[#4da2ff]"
                }
              >
                <Users className="h-4 w-4 mr-1" />
                Community ({communityCount})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={cn(
                "bg-[#1a2f51] border-slate-700 transition-all hover:border-slate-600",
                !notification.read && "border-l-4 border-l-[#4da2ff] bg-[#1a2f51]/80"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={cn("p-2 rounded-full flex-shrink-0",
                    `${getTypeStyles(notification.type)} bg-opacity-10`
                  )}>
                    <notification.icon className={`h-5 w-5 ${getTypeStyles(notification.type)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-medium">{notification.title}</h3>
                          {!notification.read && (
                            <Badge variant="secondary" className="bg-[#4da2ff] text-white text-xs">
                              New
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                            {getCategoryName(notification.category)}
                          </Badge>
                        </div>
                        <p className="text-slate-300 text-sm mb-2">{notification.message}</p>
                        <p className="text-slate-400 text-xs">{notification.date}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="text-[#4da2ff] hover:text-white hover:bg-[#4da2ff]/10 text-xs"
                          >
                            Mark as read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-[#1a2f51] border-slate-700">
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-white font-medium mb-2">No notifications found</h3>
              <p className="text-slate-400 text-sm">
                {searchQuery ? "Try adjusting your search terms or filters" : "You're all caught up!"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
