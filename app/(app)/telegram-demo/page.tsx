"use client"

import { TelegramAccessDemo } from '@/components/telegram-access-demo'

export default function TelegramDemoPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Telegram Access System Demo
          </h1>
          <p className="text-[#C0E6FF]">
            Test the one-time link access system for premium Telegram channels
          </p>
        </div>
        
        <TelegramAccessDemo />
      </div>
    </div>
  )
}
