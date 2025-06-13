"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TelegramAccessModal } from './telegram-access-modal'
import { 
  generateTelegramAccessLink, 
  createSubscriptionSummary,
  type SubscriptionSummary 
} from '@/lib/telegram-access'
import { toast } from 'sonner'
import { MessageCircle, TestTube } from 'lucide-react'

export function TelegramAccessDemo() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [subscriptionSummary, setSubscriptionSummary] = useState<SubscriptionSummary | null>(null)
  
  // Demo form data
  const [formData, setFormData] = useState({
    userId: 'demo_user_123',
    creatorId: 'demo_creator_456',
    channelId: 'demo_channel_789',
    subscriptionDuration: 30,
    tier: 'PRO' as 'NOMAD' | 'PRO' | 'ROYAL',
    paymentAmount: 5.0,
    channelName: 'Demo Premium Channel',
    creatorName: 'Demo Creator'
  })

  const handleGenerateDemo = async () => {
    setIsGenerating(true)
    
    try {
      console.log('[Demo] Generating access link with data:', formData)
      
      const result = await generateTelegramAccessLink(formData)
      
      if (result.success) {
        const summary = await createSubscriptionSummary(result)
        if (summary) {
          setSubscriptionSummary(summary)
          setShowModal(true)
          toast.success('Demo access link generated!')
        } else {
          throw new Error('Failed to create subscription summary')
        }
      } else {
        throw new Error(result.error || 'Failed to generate access link')
      }
      
    } catch (error) {
      console.error('[Demo] Error:', error)
      toast.error('Failed to generate demo access link')
    } finally {
      setIsGenerating(false)
    }
  }

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a2f51] border-[#C0E6FF]/30">
        <CardHeader>
          <CardTitle className="text-[#C0E6FF] flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Telegram Access System Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="userId" className="text-[#C0E6FF]">User ID</Label>
              <Input
                id="userId"
                value={formData.userId}
                onChange={(e) => updateFormData('userId', e.target.value)}
                className="bg-[#030f1c] border-[#C0E6FF]/30 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="creatorId" className="text-[#C0E6FF]">Creator ID</Label>
              <Input
                id="creatorId"
                value={formData.creatorId}
                onChange={(e) => updateFormData('creatorId', e.target.value)}
                className="bg-[#030f1c] border-[#C0E6FF]/30 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="channelName" className="text-[#C0E6FF]">Channel Name</Label>
              <Input
                id="channelName"
                value={formData.channelName}
                onChange={(e) => updateFormData('channelName', e.target.value)}
                className="bg-[#030f1c] border-[#C0E6FF]/30 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="creatorName" className="text-[#C0E6FF]">Creator Name</Label>
              <Input
                id="creatorName"
                value={formData.creatorName}
                onChange={(e) => updateFormData('creatorName', e.target.value)}
                className="bg-[#030f1c] border-[#C0E6FF]/30 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-[#C0E6FF]">Duration (days)</Label>
              <Select
                value={formData.subscriptionDuration.toString()}
                onValueChange={(value) => updateFormData('subscriptionDuration', parseInt(value))}
              >
                <SelectTrigger className="bg-[#030f1c] border-[#C0E6FF]/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="60">60 Days</SelectItem>
                  <SelectItem value="90">90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tier" className="text-[#C0E6FF]">Tier</Label>
              <Select
                value={formData.tier}
                onValueChange={(value) => updateFormData('tier', value)}
              >
                <SelectTrigger className="bg-[#030f1c] border-[#C0E6FF]/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NOMAD">NOMAD</SelectItem>
                  <SelectItem value="PRO">PRO</SelectItem>
                  <SelectItem value="ROYAL">ROYAL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-[#C0E6FF]">Payment Amount (SUI)</Label>
              <Input
                id="amount"
                type="number"
                step="0.1"
                value={formData.paymentAmount}
                onChange={(e) => updateFormData('paymentAmount', parseFloat(e.target.value))}
                className="bg-[#030f1c] border-[#C0E6FF]/30 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="channelId" className="text-[#C0E6FF]">Channel ID</Label>
              <Input
                id="channelId"
                value={formData.channelId}
                onChange={(e) => updateFormData('channelId', e.target.value)}
                className="bg-[#030f1c] border-[#C0E6FF]/30 text-white"
              />
            </div>
          </div>
          
          <div className="pt-4">
            <Button
              onClick={handleGenerateDemo}
              disabled={isGenerating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Generate Demo Access Link
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Demo Instructions */}
      <Card className="bg-[#1a2f51] border-[#C0E6FF]/30">
        <CardHeader>
          <CardTitle className="text-[#C0E6FF]">How to Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-300">
          <div className="space-y-2">
            <h4 className="font-semibold text-white">1. Generate Access Link</h4>
            <p>Click the button above to generate a demo one-time access link with QR code.</p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-white">2. Test Access Link</h4>
            <p>Click the generated access link to test the validation flow. The link can only be used once.</p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-white">3. Check Admin Dashboard</h4>
            <p>Visit <code className="bg-[#030f1c] px-2 py-1 rounded text-[#C0E6FF]">/telegram-admin</code> to view generated tokens (requires ROYAL tier).</p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-white">4. Bot Integration</h4>
            <p>The webhook endpoint at <code className="bg-[#030f1c] px-2 py-1 rounded text-[#C0E6FF]">/api/telegram/bot-webhook</code> is ready for Telegram bot integration.</p>
          </div>
        </CardContent>
      </Card>

      {/* Telegram Access Modal */}
      <TelegramAccessModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        subscriptionSummary={subscriptionSummary}
        isLoading={isGenerating}
      />
    </div>
  )
}
