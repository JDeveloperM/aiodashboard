"use client"

import { AffiliateControls } from "@/components/affiliate-controls"

export default function AffiliateControlsPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Affiliate Controls</h1>
          <p className="text-gray-400 mt-1">Manage your referrals, view metrics, and track your affiliate performance</p>
        </div>
      </div>

      <AffiliateControls />
    </div>
  )
}
