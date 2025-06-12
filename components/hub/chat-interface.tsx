"use client"

import { useState } from "react"
import { ChannelSidebar } from "./channel-sidebar"
import { MessageList } from "./message-list"
import { MessageInput } from "./message-input"
import { UserList } from "./user-list"
import { Users, Hash, Menu, X, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/components/ui/use-mobile"

export function ChatInterface() {
  const [selectedChannel, setSelectedChannel] = useState("announcements")
  const [showUserList, setShowUserList] = useState(true)
  const [showChannelSidebar, setShowChannelSidebar] = useState(false)
  const [showMobileUserList, setShowMobileUserList] = useState(false)
  const isMobile = useIsMobile()

  // Check if current channel is a direct message
  const isDirectMessage = selectedChannel.startsWith("dm-")

  // Get username from DM channel ID
  const getDMUsername = (channelId: string) => {
    if (!channelId.startsWith("dm-")) return ""
    const userId = channelId.replace("dm-", "")
    // Mock data - in real app this would come from user data
    const userMap: { [key: string]: string } = {
      "user-1": "Trou",
      "user-2": "CryptoKing",
      "user-3": "NFTTrader",
      "user-4": "AIOGamer",
      "user-5": "BlockchainDev"
    }
    return userMap[userId] || "Unknown User"
  }

  return (
    <div className="flex h-full bg-[#0c1b36] relative">
      {/* Channel Sidebar - Desktop */}
      {!isMobile && (
        <div className="w-60 bg-gradient-to-b from-[#16213E] via-[#1A3C6D] to-[#0F3460] border-r border-[#1A3C6D]/30">
          <ChannelSidebar
            selectedChannel={selectedChannel}
            onChannelSelect={setSelectedChannel}
          />
        </div>
      )}

      {/* Channel Sidebar - Mobile Overlay */}
      {isMobile && showChannelSidebar && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={() => setShowChannelSidebar(false)}
          />
          {/* Sidebar */}
          <div className="fixed left-0 top-0 bottom-0 w-full bg-gradient-to-b from-[#16213E] via-[#1A3C6D] to-[#0F3460] z-[70]">
            <ChannelSidebar
              selectedChannel={selectedChannel}
              onChannelSelect={(channel) => {
                setSelectedChannel(channel)
                setShowChannelSidebar(false)
              }}
              isMobile={true}
              onClose={() => setShowChannelSidebar(false)}
            />
          </div>
        </>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Channel Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1A3C6D]/30 bg-[#0c1b36]/50">
          <div className="flex items-center gap-2">
            {/* Mobile Menu Button */}
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChannelSidebar(true)}
                className="text-[#C0E6FF] hover:text-white hover:bg-[#1A3C6D]/30 mr-2"
              >
                <Menu className="w-4 h-4" />
              </Button>
            )}
            {isDirectMessage ? (
              <MessageCircle className="w-5 h-5 text-[#4DA2FF]" />
            ) : (
              <Hash className="w-5 h-5 text-[#4DA2FF]" />
            )}
            <span className="text-white font-semibold">
              {isDirectMessage ? getDMUsername(selectedChannel) : selectedChannel}
            </span>
            {!isMobile && (
              <>
                <span className="text-[#C0E6FF]/50 text-sm">|</span>
                <span className="text-[#C0E6FF]/70 text-sm">
                  {isDirectMessage && "Direct message conversation"}
                  {selectedChannel === "announcements" && "Official announcements and important updates"}
                  {selectedChannel === "community-rules" && "AIO Connect rules and guidelines"}
                  {selectedChannel === "community-updates" && "Latest AIO Connect updates and changes"}
                  {selectedChannel === "market-daily" && "Daily market analysis and insights"}
                  {selectedChannel === "market-updates" && "Real-time market updates and news"}
                  {selectedChannel === "market-thoughts" && "Share your market thoughts and predictions"}
                  {selectedChannel === "general-chat" && "General AIO Connect discussions"}
                  {selectedChannel === "farming-chat" && "Discuss farming strategies and opportunities"}
                  {selectedChannel === "charting-chat" && "Technical analysis and chart discussions"}
                  {selectedChannel === "gaming-chat" && "Gaming discussions and updates"}
                  {selectedChannel === "ai-chat" && "AI and technology discussions"}
                </span>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => isMobile ? setShowMobileUserList(true) : setShowUserList(!showUserList)}
            className="text-[#C0E6FF] hover:text-white hover:bg-[#1A3C6D]/30"
          >
            <Users className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex">
          <div className="flex-1 flex flex-col">
            <MessageList channel={selectedChannel} />
            <MessageInput channel={selectedChannel} />
          </div>

          {/* User List - Desktop */}
          {showUserList && !isMobile && (
            <div className="w-60 border-l border-[#1A3C6D]/30">
              <UserList />
            </div>
          )}
        </div>
      </div>

      {/* Mobile User List Overlay */}
      {isMobile && showMobileUserList && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={() => setShowMobileUserList(false)}
          />
          {/* User List Sidebar */}
          <div className="fixed left-0 top-0 bottom-0 w-full bg-[#0c1b36] z-[70] flex flex-col">
            {/* Header with close button */}
            <div className="p-4 border-b border-[#1A3C6D]/30">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold text-lg ml-12">Members</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileUserList(false)}
                  className="text-[#C0E6FF] hover:text-white hover:bg-[#1A3C6D]/30 h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {/* User List Content */}
            <div className="flex-1 overflow-hidden">
              <UserList />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
