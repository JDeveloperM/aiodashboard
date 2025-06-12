"use client"

import { ProfileSystem } from "@/components/profile-system"

export default function ProfilePage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Profile</h1>
          <p className="text-gray-400 mt-1">Manage your profile and earn points by inviting new users to AIONET</p>
        </div>
      </div>

      <ProfileSystem />
    </div>
  )
}
