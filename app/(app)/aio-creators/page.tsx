"use client"

import { AIOCreatorsInterface } from "@/components/aio-creators-interface"

export default function AIOCreatorsPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">AIO Creators</h1>
          <p className="text-gray-400 mt-1">Discover and support content creators, access premium channels with SUI tips</p>
        </div>
      </div>

      <AIOCreatorsInterface />
    </div>
  )
}
