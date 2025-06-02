"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { RoleImage } from "@/components/ui/role-image"
import { useSubscription } from "@/contexts/subscription-context"
import {
  User,
  Mail,
  Wallet,
  Shield,
  Camera,
  CheckCircle,
  AlertCircle,
  Upload,
  CreditCard,
  Trash2,
  Plus,
  Crown,
  Star,
  Users,
  RefreshCw
} from "lucide-react"

interface ProfileData {
  profilePicture: string
  firstName: string
  lastName: string
  username: string
  email: string
  walletAddress: string
  kycStatus: 'pending' | 'verified' | 'rejected' | 'not-started'
  notifications: boolean
}

interface CreditCard {
  id: string
  type: 'visa' | 'mastercard' | 'amex'
  lastFour: string
  expiryMonth: string
  expiryYear: string
  isDefault: boolean
}

interface NFTData {
  id: string
  name: string
  type: 'PRO' | 'ROYAL' | 'NODEME'
  owned: boolean
  benefits: string[]
  mintDate?: string
}

export function DashboardProfiles() {
  const { tier } = useSubscription()

  const [profileData, setProfileData] = useState<ProfileData>({
    profilePicture: "",
    firstName: "Dimitris",
    lastName: "Papadopoulos",
    username: "metadude_gr_01",
    email: "dimitris.papadopoulos@example.com",
    walletAddress: "0x742d35Cc6634C0532925a3b8D404fddF4f8b2c1a9e",
    kycStatus: 'verified',
    notifications: true
  })

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Credit Cards State
  const [creditCards, setCreditCards] = useState<CreditCard[]>([
    {
      id: '1',
      type: 'visa',
      lastFour: '4242',
      expiryMonth: '12',
      expiryYear: '25',
      isDefault: true
    },
    {
      id: '2',
      type: 'mastercard',
      lastFour: '8888',
      expiryMonth: '08',
      expiryYear: '26',
      isDefault: false
    }
  ])
  const [autoRenewal, setAutoRenewal] = useState(true)
  const [showAddCard, setShowAddCard] = useState(false)

  // NFT Data based on current tier
  const nftData: NFTData[] = [
    {
      id: 'pro',
      name: 'MetadudesX PRO',
      type: 'PRO',
      owned: tier === 'PRO' || tier === 'ROYAL',
      benefits: ['Crypto Trading Bots', 'Community Access', 'Portfolio Ideas'],
      mintDate: tier === 'PRO' || tier === 'ROYAL' ? '2024-01-15' : undefined
    },
    {
      id: 'royal',
      name: 'MetadudesX ROYAL',
      type: 'ROYAL',
      owned: tier === 'ROYAL',
      benefits: ['All PRO Benefits', 'Forex Trading Bots', 'VIP Support', 'Exclusive Events'],
      mintDate: tier === 'ROYAL' ? '2024-02-20' : undefined
    },
    {
      id: 'nodeme',
      name: 'NodeMe Pool NFT',
      type: 'NODEME',
      owned: tier === 'ROYAL', // Assuming ROYAL tier gets NodeMe access
      benefits: ['Staking Rewards', 'Pool Governance', 'Priority Access'],
      mintDate: tier === 'ROYAL' ? '2024-03-10' : undefined
    }
  ]

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSaving(false)
    setIsEditing(false)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileData(prev => ({
          ...prev,
          profilePicture: e.target?.result as string
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-500 text-white'
      case 'pending':
        return 'bg-yellow-500 text-white'
      case 'rejected':
        return 'bg-red-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getKycStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4" />
      case 'pending':
        return <AlertCircle className="w-4 h-4" />
      case 'rejected':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Shield className="w-4 h-4" />
    }
  }

  // Credit Card Helper Functions
  const getCardIcon = (type: string) => {
    switch (type) {
      case 'visa':
        return '💳'
      case 'mastercard':
        return '💳'
      case 'amex':
        return '💳'
      default:
        return '💳'
    }
  }

  const getCardName = (type: string) => {
    switch (type) {
      case 'visa':
        return 'Visa'
      case 'mastercard':
        return 'Mastercard'
      case 'amex':
        return 'American Express'
      default:
        return 'Credit Card'
    }
  }

  const handleDeleteCard = (cardId: string) => {
    setCreditCards(prev => prev.filter(card => card.id !== cardId))
  }

  const handleAddCard = () => {
    // In a real implementation, this would open a modal to add a new card
    setShowAddCard(true)
  }

  // NFT Helper Functions
  const getNFTIcon = (type: string) => {
    switch (type) {
      case 'PRO':
        return <Star className="w-6 h-6" />
      case 'ROYAL':
        return <Crown className="w-6 h-6" />
      case 'NODEME':
        return <Users className="w-6 h-6" />
      default:
        return <Star className="w-6 h-6" />
    }
  }

  const getNFTColor = (type: string) => {
    switch (type) {
      case 'PRO':
        return 'from-[#4DA2FF] to-[#011829]'
      case 'ROYAL':
        return 'from-[#FFD700] to-[#FFA500]'
      case 'NODEME':
        return 'from-[#00D4FF] to-[#007ACC]'
      default:
        return 'from-[#4DA2FF] to-[#011829]'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Account Information</h3>
          <p className="text-[#C0E6FF] text-sm">🇬🇷 Manage your Greek community profile and Sui wallet integration</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                className="border-[#C0E6FF] text-[#C0E6FF]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-[#4DA2FF] to-[#011829] text-white"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-[#4da2ff] hover:bg-[#3d8ae6] text-white transition-colors duration-200"
            >
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Profile Picture */}
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center gap-2 text-white mb-4">
              <Camera className="w-5 h-5 text-[#4DA2FF]" />
              <h3 className="font-semibold">Profile Picture</h3>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#4DA2FF] to-[#011829] flex items-center justify-center overflow-hidden">
                  {profileData.profilePicture ? (
                    <img
                      src={profileData.profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                </div>

                {isEditing && (
                  <div className="w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="profile-upload"
                    />
                    <label htmlFor="profile-upload">
                      <Button
                        as="span"
                        variant="outline"
                        className="w-full border-[#C0E6FF] text-[#C0E6FF] cursor-pointer"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Image
                      </Button>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="enhanced-card lg:col-span-2">
          <div className="enhanced-card-content">
            <div className="flex items-center gap-2 text-white mb-4">
              <User className="w-5 h-5 text-[#4DA2FF]" />
              <h3 className="font-semibold">Personal Information</h3>
            </div>
            <div className="space-y-4">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-[#C0E6FF]">First Name</Label>
                <Input
                  id="firstName"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                  disabled={!isEditing}
                  className="bg-[#030F1C] border-[#C0E6FF]/30 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-[#C0E6FF]">Last Name</Label>
                <Input
                  id="lastName"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                  disabled={!isEditing}
                  className="bg-[#030F1C] border-[#C0E6FF]/30 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-[#C0E6FF]">Username</Label>
                <Input
                  id="username"
                  value={profileData.username}
                  onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                  disabled={!isEditing}
                  className="bg-[#030F1C] border-[#C0E6FF]/30 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#C0E6FF]">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!isEditing}
                  className="bg-[#030F1C] border-[#C0E6FF]/30 text-white"
                />
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* KYC Section */}
      <div className="enhanced-card">
        <div className="enhanced-card-content">
          <div className="flex items-center gap-2 text-white mb-4">
            <Shield className="w-5 h-5 text-[#4DA2FF]" />
            <h3 className="font-semibold">KYC Verification</h3>
          </div>
          <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className={getKycStatusColor(profileData.kycStatus)}>
                {getKycStatusIcon(profileData.kycStatus)}
                <span className="ml-2 capitalize">{profileData.kycStatus.replace('-', ' ')}</span>
              </Badge>
              <span className="text-[#C0E6FF]">
                {profileData.kycStatus === 'verified'
                  ? 'Your identity has been verified for DEWhale security'
                  : 'Complete KYC verification for enhanced security'
                }
              </span>
            </div>

            {profileData.kycStatus !== 'verified' && (
              <Button
                className="bg-gradient-to-r from-[#4DA2FF] to-[#011829] text-white"
              >
                {profileData.kycStatus === 'not-started' ? 'Start KYC' : 'Continue KYC'}
              </Button>
            )}
          </div>
          </div>
        </div>
      </div>

      {/* Wallet Information */}
      <div className="enhanced-card">
        <div className="enhanced-card-content">
          <div className="flex items-center gap-2 text-white mb-4">
            <Wallet className="w-5 h-5 text-[#4DA2FF]" />
            <h3 className="font-semibold">Wallet & Preferences</h3>
          </div>
          <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="walletAddress" className="text-[#C0E6FF]">Sui Wallet Address</Label>
            <Input
              id="walletAddress"
              value={profileData.walletAddress}
              onChange={(e) => setProfileData(prev => ({ ...prev, walletAddress: e.target.value }))}
              disabled={!isEditing}
              className="bg-[#030F1C] border-[#C0E6FF]/30 text-white font-mono"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#4DA2FF]" />
              <span className="text-[#C0E6FF]">Email Notifications</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setProfileData(prev => ({ ...prev, notifications: !prev.notifications }))}
              disabled={!isEditing}
              className={`border-[#C0E6FF] ${
                profileData.notifications
                  ? 'bg-[#4DA2FF] text-white'
                  : 'text-[#C0E6FF]'
              }`}
            >
              {profileData.notifications ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
          </div>
        </div>
      </div>

      {/* Credit Cards & Payment Methods */}
      <div className="enhanced-card">
        <div className="enhanced-card-content">
          <div className="flex items-center gap-2 text-white mb-4">
            <CreditCard className="w-5 h-5 text-[#4DA2FF]" />
            <h3 className="font-semibold">Payment Methods</h3>
          </div>
          <div className="space-y-4">
            {/* Auto-renewal Toggle */}
            <div className="flex items-center justify-between p-3 bg-[#030F1C] rounded-lg border border-[#C0E6FF]/20">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#4DA2FF]" />
                <div>
                  <span className="text-white font-medium">Auto-renewal</span>
                  <p className="text-[#C0E6FF] text-sm">Automatically renew your subscription</p>
                </div>
              </div>
              <Switch
                checked={autoRenewal}
                onCheckedChange={setAutoRenewal}
                className="data-[state=checked]:bg-[#4DA2FF]"
              />
            </div>

            {/* Saved Credit Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-[#C0E6FF]">Saved Cards</Label>
                <Button
                  onClick={handleAddCard}
                  size="sm"
                  variant="outline"
                  className="border-[#C0E6FF] text-[#C0E6FF] hover:bg-[#4DA2FF] hover:text-white"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Card
                </Button>
              </div>

              {creditCards.map((card) => (
                <div
                  key={card.id}
                  className="flex items-center justify-between p-3 bg-[#030F1C] rounded-lg border border-[#C0E6FF]/20"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getCardIcon(card.type)}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">
                          {getCardName(card.type)} •••• {card.lastFour}
                        </span>
                        {card.isDefault && (
                          <Badge className="bg-[#4DA2FF] text-white text-xs">Default</Badge>
                        )}
                      </div>
                      <span className="text-[#C0E6FF] text-sm">
                        Expires {card.expiryMonth}/{card.expiryYear}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDeleteCard(card.id)}
                    size="sm"
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              {creditCards.length === 0 && (
                <div className="text-center py-6 text-[#C0E6FF]">
                  <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No payment methods saved</p>
                  <p className="text-sm">Add a card to enable auto-renewal</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MetadudesX NFTs Owned */}
      <div className="enhanced-card">
        <div className="enhanced-card-content">
          <div className="flex items-center gap-2 text-white mb-4">
            <Crown className="w-5 h-5 text-[#4DA2FF]" />
            <h3 className="font-semibold">MetadudesX NFTs</h3>
          </div>
          <div className="space-y-4">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              {nftData.map((nft) => (
                <div
                  key={nft.id}
                  className={`p-4 rounded-lg border transition-all duration-300 ${
                    nft.owned
                      ? 'bg-gradient-to-br from-[#4DA2FF]/20 to-[#011829]/20 border-[#4DA2FF]/50'
                      : 'bg-[#030F1C] border-[#C0E6FF]/20 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-full bg-gradient-to-r ${getNFTColor(nft.type)}`}>
                      {getNFTIcon(nft.type)}
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{nft.name}</h4>
                      <div className="flex items-center gap-2">
                        {nft.owned ? (
                          <Badge className="bg-green-500 text-white text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Owned
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-500 text-white text-xs">
                            Not Owned
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {nft.owned && nft.mintDate && (
                    <div className="mb-3">
                      <span className="text-[#C0E6FF] text-sm">
                        Minted: {new Date(nft.mintDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label className="text-[#C0E6FF] text-sm">Benefits:</Label>
                    <ul className="space-y-1">
                      {nft.benefits.map((benefit, index) => (
                        <li key={index} className="text-white text-sm flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {nftData.filter(nft => nft.owned).length === 0 && (
              <div className="text-center py-6 text-[#C0E6FF]">
                <Crown className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No NFTs owned</p>
                <p className="text-sm">Visit the subscriptions page to mint your NFT</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
