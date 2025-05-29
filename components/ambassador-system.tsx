"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { RoleImage } from "@/components/ui/role-image"
import {
  Copy,
  Users,
  DollarSign,
  Share2,
  CheckCircle,
  ExternalLink,
  Calendar,
  Mail
} from "lucide-react"

interface InvitedUser {
  id: string
  username: string
  email: string
  joinDate: string
  status: 'Copier' | 'PRO' | 'ROYAL'
  commission: number
}

export function AmbassadorSystem() {
  const [affiliateLink] = useState("https://metadudesx.io/ref/MDX789ABC")
  const [copied, setCopied] = useState(false)

  const [metrics] = useState({
    totalInvites: 47,
    newUsers: 32,
    copiers: 18,
    proUsers: 10,
    royalUsers: 4,
    totalCommission: 2450.75
  })

  const [invitedUsers] = useState<InvitedUser[]>([
    {
      id: "1",
      username: "CryptoTrader_01",
      email: "trader01@email.com",
      joinDate: "2024-01-15",
      status: "ROYAL",
      commission: 150.00
    },
    {
      id: "2",
      username: "BlockchainFan",
      email: "blockchain@email.com",
      joinDate: "2024-01-12",
      status: "PRO",
      commission: 75.00
    },
    {
      id: "3",
      username: "DeFiExplorer",
      email: "defi@email.com",
      joinDate: "2024-01-10",
      status: "Copier",
      commission: 0.00
    },
    {
      id: "4",
      username: "NFTCollector",
      email: "nft@email.com",
      joinDate: "2024-01-08",
      status: "PRO",
      commission: 75.00
    },
    {
      id: "5",
      username: "MetaTrader",
      email: "meta@email.com",
      joinDate: "2024-01-05",
      status: "ROYAL",
      commission: 150.00
    }
  ])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(affiliateLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join MetadudesX',
        text: 'Join the MetadudesX community and start your Web3 journey!',
        url: affiliateLink
      })
    } else {
      handleCopyLink()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ROYAL':
        return 'bg-purple-500 text-white'
      case 'PRO':
        return 'bg-[#4DA2FF] text-white'
      case 'Copier':
        return 'bg-gray-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  return (
    <div className="space-y-6">
      

      {/* Metrics Overview */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-[#C0E6FF]">Total Invites</p>
                <p className="text-2xl font-bold text-[#FFFFFF]">{metrics.totalInvites}</p>
                <p className="text-xs text-[#C0E6FF] mt-1">Users invited via your link</p>
              </div>
              <div className="bg-[#4DA2FF]/20 p-3 rounded-full">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-[#C0E6FF]">New Users</p>
                <p className="text-2xl font-bold text-[#FFFFFF]">{metrics.newUsers}</p>
                <p className="text-xs text-[#C0E6FF] mt-1">Successfully joined</p>
              </div>
              <div className="bg-[#4DA2FF]/20 p-3 rounded-full">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-[#C0E6FF]">Total Commission</p>
                <p className="text-2xl font-bold text-[#FFFFFF]">${metrics.totalCommission}</p>
                <p className="text-xs text-[#C0E6FF] mt-1">Lifetime earnings</p>
              </div>
              <div className="bg-[#4DA2FF]/20 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-[#C0E6FF]">Conversion Rate</p>
                <p className="text-2xl font-bold text-[#FFFFFF]">
                  {Math.round((metrics.newUsers / metrics.totalInvites) * 100)}%
                </p>
                <p className="text-xs text-[#C0E6FF] mt-1">Invite to signup rate</p>
              </div>
              <div className="bg-[#4DA2FF]/20 p-3 rounded-full">
                <Badge className="bg-[#4DA2FF] text-white">68%</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Affiliate Link Section */}
      <div className="enhanced-card">
        <div className="enhanced-card-content">
          <div className="flex items-center gap-3 text-[#FFFFFF] mb-6">
            <div className="p-2 bg-[#4DA2FF]/20 rounded-lg">
              <Share2 className="w-6 h-6 text-[#4DA2FF]" />
            </div>
            <h3 className="text-xl font-semibold">Your Unique Referral Link</h3>
          </div>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={affiliateLink}
                readOnly
                className="bg-[#030F1C] border-[#C0E6FF]/30 text-[#FFFFFF]"
              />
              <Button
                onClick={handleCopyLink}
                className="bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-[#FFFFFF]"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                className="border-[#C0E6FF] text-[#C0E6FF]"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[#C0E6FF] text-sm">
              Share this link to earn 25% commission on PRO and ROYAL NFT purchases from your referrals.
            </p>
          </div>
        </div>
      </div>

      {/* Invited Users Table */}
      <div className="enhanced-card">
        <div className="enhanced-card-content">
          <div className="flex items-center gap-2 text-[#FFFFFF] mb-6">
            <Users className="w-5 h-5 text-[#4DA2FF]" />
            <h3 className="text-xl font-semibold">Recent Referrals</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead>
                <tr className="border-b border-[#C0E6FF]/20">
                  <th className="text-left py-3 px-2 text-[#C0E6FF] text-sm font-medium w-1/5">Username</th>
                  <th className="text-left py-3 px-2 text-[#C0E6FF] text-sm font-medium w-1/3">Email</th>
                  <th className="text-left py-3 px-2 text-[#C0E6FF] text-sm font-medium w-1/5">Join Date</th>
                  <th className="text-left py-3 px-2 text-[#C0E6FF] text-sm font-medium w-1/6">Status</th>
                  <th className="text-left py-3 px-2 text-[#C0E6FF] text-sm font-medium w-1/6">Commission</th>
                </tr>
              </thead>
              <tbody>
                {invitedUsers.map((user) => (
                  <tr key={user.id} className="border-b border-[#C0E6FF]/10 hover:bg-[#4DA2FF]/5 transition-colors">
                    <td className="py-3 px-2 text-left text-[#FFFFFF] text-sm truncate">{user.username}</td>
                    <td className="py-3 px-2 text-left text-[#C0E6FF] text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-left text-[#C0E6FF] text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span>{new Date(user.joinDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-left">
                      <Badge className={getStatusColor(user.status)}>
                        <div className="flex items-center gap-1">
                          <RoleImage role={user.status as "Copier" | "PRO" | "ROYAL"} size="sm" />
                          {user.status}
                        </div>
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-left text-[#FFFFFF] text-sm font-semibold">
                      ${user.commission.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
