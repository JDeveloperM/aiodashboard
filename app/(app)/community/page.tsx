"use client"

import { ChatInterface } from "@/components/hub/chat-interface"

export default function CommunityPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Chat Interface */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  )
}
