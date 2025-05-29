"use client"

import { AmbassadorSystem } from "@/components/ambassador-system"

export default function AmbassadorSystemPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Ambassador System</h1>
          <p className="text-gray-400 mt-1">Earn commissions by inviting new users to MetadudesX</p>
        </div>
      </div>

      <AmbassadorSystem />
    </div>
  )
}
