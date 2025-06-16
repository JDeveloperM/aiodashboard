"use client"

import { useState } from "react"
import { Send, Megaphone, FileText, Users, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { NotificationCategory, NotificationType } from "@/types/notifications"

interface AdminNotificationsProps {
  isAdmin: boolean
}

export function AdminNotifications({ isAdmin }: AdminNotificationsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    category: 'platform' as NotificationCategory,
    type: 'info' as NotificationType,
    priority: 2,
    actionUrl: '',
    actionLabel: ''
  })

  // Don't render if not admin
  if (!isAdmin) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Please fill in title and message')
      return
    }

    setIsLoading(true)
    
    try {
      // Send notification to all users by broadcasting
      const response = await fetch('/api/admin/notifications/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          message: formData.message.trim(),
          type: formData.type,
          category: formData.category,
          priority: formData.priority,
          action_url: formData.actionUrl.trim() || undefined,
          action_label: formData.actionLabel.trim() || undefined,
          admin_address: '0x311479200d45ef0243b92dbcf9849b8f6b931d27ae885197ea73066724f2bcf4'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send notification')
      }

      const result = await response.json()
      
      toast.success(`Notification sent to ${result.sent_count} users!`)
      
      // Reset form
      setFormData({
        title: '',
        message: '',
        category: 'platform',
        type: 'info',
        priority: 2,
        actionUrl: '',
        actionLabel: ''
      })
      
    } catch (error) {
      console.error('Error sending notification:', error)
      toast.error('Failed to send notification')
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'platform':
        return <Megaphone className="h-4 w-4" />
      case 'monthly':
        return <FileText className="h-4 w-4" />
      case 'community':
        return <Users className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'bg-green-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-blue-500'
    }
  }

  return (
    <Card className="bg-[#1a2f51] border-slate-700">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-red-500 text-white">
            ADMIN
          </Badge>
          <CardTitle className="text-white">Send Platform Notification</CardTitle>
        </div>
        <CardDescription className="text-slate-400">
          Send notifications to all platform users. Use responsibly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter notification title..."
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
              maxLength={100}
              required
            />
            <p className="text-xs text-slate-400">{formData.title.length}/100 characters</p>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-white">Message *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Enter notification message..."
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 min-h-[100px]"
              maxLength={500}
              required
            />
            <p className="text-xs text-slate-400">{formData.message.length}/500 characters</p>
          </div>

          {/* Category and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-white">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value: NotificationCategory) => 
                  setFormData(prev => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="platform" className="text-white">
                    <div className="flex items-center gap-2">
                      <Megaphone className="h-4 w-4" />
                      Platform Updates
                    </div>
                  </SelectItem>
                  <SelectItem value="monthly" className="text-white">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Monthly Reports
                    </div>
                  </SelectItem>
                  <SelectItem value="community" className="text-white">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Community Updates
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-white">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: NotificationType) => 
                  setFormData(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="info" className="text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      Info
                    </div>
                  </SelectItem>
                  <SelectItem value="success" className="text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Success
                    </div>
                  </SelectItem>
                  <SelectItem value="warning" className="text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      Warning
                    </div>
                  </SelectItem>
                  <SelectItem value="error" className="text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      Error
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Optional Action URL and Label */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="actionUrl" className="text-white">Action URL (Optional)</Label>
              <Input
                id="actionUrl"
                value={formData.actionUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, actionUrl: e.target.value }))}
                placeholder="/dashboard, https://example.com"
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actionLabel" className="text-white">Action Label (Optional)</Label>
              <Input
                id="actionLabel"
                value={formData.actionLabel}
                onChange={(e) => setFormData(prev => ({ ...prev, actionLabel: e.target.value }))}
                placeholder="View Details, Learn More"
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Preview */}
          {(formData.title || formData.message) && (
            <div className="space-y-2">
              <Label className="text-white">Preview</Label>
              <div className="bg-slate-800 border border-slate-600 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${getTypeColor(formData.type)} bg-opacity-20`}>
                    {getCategoryIcon(formData.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-medium">{formData.title || 'Notification Title'}</p>
                      <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                        {formData.category}
                      </Badge>
                    </div>
                    <p className="text-slate-300 text-sm">{formData.message || 'Notification message...'}</p>
                    {formData.actionLabel && (
                      <p className="text-xs text-[#4da2ff] mt-1">• {formData.actionLabel}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !formData.title.trim() || !formData.message.trim()}
            className="w-full bg-[#4da2ff] hover:bg-[#4da2ff]/80 text-white"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send to All Users
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
