"use client"

import { useEffect, useRef } from "react"
import { MessageItem } from "./message-item"

interface MessageListProps {
  channel: string
}

interface Message {
  id: string
  user: {
    name: string
    avatar: string
    role?: string
    isBot?: boolean
  }
  content: string
  timestamp: string
  reactions?: { emoji: string; count: number; users: string[] }[]
  attachments?: { type: string; url: string; name: string }[]
}

// Mock data for different channels
const mockMessages: Record<string, Message[]> = {
  "general-chat": [
    {
      id: "1",
      user: { name: "donG", avatar: "/placeholder-user.jpg", role: "Admin" },
      content: "Όντως και το όνομα του πρέπει να τον λένε:",
      timestamp: "4:37 AM",
      reactions: [{ emoji: "👍", count: 1, users: ["user1"] }]
    },
    {
      id: "2",
      user: { name: "Zealot", avatar: "/placeholder-user.jpg", role: "Moderator" },
      content: "Το τελευταίο το reach. Βάλε να θέλεις αλλά max 1-2 όχι ΙΟ",
      timestamp: "10:37 AM"
    },
    {
      id: "3",
      user: { name: "donG", avatar: "/placeholder-user.jpg", role: "Admin" },
      content: "Και hashtags ποτέ",
      timestamp: "10:37 AM"
    },
    {
      id: "4",
      user: { name: "Zealot", avatar: "/placeholder-user.jpg", role: "Moderator" },
      content: "Αν δεν βάλεις στους tags ισως θα κατεβάσει ο αλγόριθμος ότι γράφεις για αυτό το πρόβλημα για να πάρω yaps ας πάμε 😊",
      timestamp: "10:37 AM"
    },
    {
      id: "5",
      user: { name: "donG", avatar: "/placeholder-user.jpg", role: "Admin" },
      content: "Αν δεν βάλεις στους tags ισως θα κατεβάσει ο αλγόριθμος ότι γράφεις για αυτό το πρόβλημα για να πάρω yaps ας πάμε 😊",
      timestamp: "10:37 AM"
    },
    {
      id: "6",
      user: { name: "Zealot", avatar: "/placeholder-user.jpg", role: "Moderator" },
      content: "Γι αυτό είπα max 1-2. Έχω κάτσει φορές δεν θα κάτσω. Τα διαβάζω. Για τον τρόπο που θα πάρεις yaps ας έχουμε πια πολλές φορές. Είδαμε ότι γι αυτό που βρίσκονται αν θα",
      timestamp: "10:37 AM",
      reactions: [
        { emoji: "❤️", count: 1, users: ["user1"] },
        { emoji: "👍", count: 1, users: ["user2"] }
      ]
    },
    {
      id: "7",
      user: { name: "TauCee", avatar: "/placeholder-user.jpg" },
      content: "Καλημέρα παιδιά!",
      timestamp: "11:57 AM"
    },
    {
      id: "8",
      user: { name: "donG", avatar: "/placeholder-user.jpg", role: "Admin" },
      content: "Δεν κάνω κοπι στο περάσει στο testGPT και το μοντάρω μετά\nΣε ευχαριστώ για την βοήθεια! Γιατγερα μου θα προσπαθήσω από εδώ και πέρα αυτά που Δες",
      timestamp: "11:57 AM"
    },
    {
      id: "9",
      user: { name: "Zealot", avatar: "/placeholder-user.jpg", role: "Moderator" },
      content: "Αυτό που θέλω να πω είναι να βρεις αυτό το στοιχείο γράφεις. Να το καταλαβαίνεις και εσύ. Να είσαι σου. Δεν είσαι αυτός που Δες την εδώσεις. Είσαι αυτός που Δες την",
      timestamp: "11:57 AM",
      reactions: [
        { emoji: "❤️", count: 1, users: ["user1"] },
        { emoji: "👍", count: 1, users: ["user2"] },
        { emoji: "😊", count: 1, users: ["user3"] }
      ]
    }
  ],
  "verify": [
    {
      id: "v1",
      user: { name: "AIOBot", avatar: "/images/aibot.png", isBot: true },
      content: "Welcome to the verification channel! Please follow the instructions to verify your account.",
      timestamp: "12:00 PM"
    }
  ],
  "rules": [
    {
      id: "r1",
      user: { name: "AIOBot", avatar: "/images/aibot.png", isBot: true },
      content: "📋 **AIO Connect Rules**\n\n1. Be respectful to all members\n2. No spam or excessive self-promotion\n3. Keep discussions relevant to the channel topic\n4. No NSFW content\n5. Follow Discord's Terms of Service",
      timestamp: "12:00 PM"
    }
  ]
}

export function MessageList({ channel }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messages = mockMessages[channel] || []

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-16 h-16 bg-[#4DA2FF]/20 rounded-full flex items-center justify-center mb-4">
            <span className="text-[#4DA2FF] text-2xl">#</span>
          </div>
          <h3 className="text-white text-lg font-semibold mb-2">Welcome to #{channel}</h3>
          <p className="text-[#C0E6FF]/70 max-w-md">
            This is the beginning of the #{channel} channel. Start the conversation!
          </p>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  )
}
