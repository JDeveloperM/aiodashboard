"use client"

import { PersistentProfileSystem } from "@/components/persistent-profile-system"

export default function ProfilePage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Profile</h1>
          <p className="text-gray-400 mt-1">Manage your persistent profile with encrypted database storage</p>
        </div>
      </div>

      <PersistentProfileSystem />
    </div>
  )
}
