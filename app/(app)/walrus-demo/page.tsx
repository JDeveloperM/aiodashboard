"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { WalrusProfileSystem } from '@/components/walrus-profile-system'
import { WalrusStatusIndicator, StorageCostEstimator } from '@/components/walrus-provider'
import { useWalrus } from '@/hooks/use-walrus'
import { useSuiAuth } from '@/contexts/sui-auth-context'
import { toast } from 'sonner'
import {
  Database,
  Upload,
  Download,
  Image as ImageIcon,
  FileText,
  Coins,
  Network,
  CheckCircle,
  AlertCircle,
  Info,
  Zap
} from 'lucide-react'

export default function WalrusDemoPage() {
  const { user, isSignedIn } = useSuiAuth()
  const {
    storeImage,
    storeData,
    retrieveImage,
    retrieveData,
    isLoading,
    error,
    isInitialized,
    isConnected,
    network,
    calculateCost,
    getStorageOptions,
    storageOptions
  } = useWalrus()

  const [demoResults, setDemoResults] = useState<{
    imageUpload?: { blobId?: string; cost?: number; fallback: boolean; success: boolean }
    dataUpload?: { blobId?: string; cost?: number; fallback: boolean; success: boolean }
    imageRetrieve?: string | null
    dataRetrieve?: any
  }>({})

  const handleDemoImageUpload = async () => {
    try {
      // Create a demo image (1x1 pixel PNG)
      const canvas = document.createElement('canvas')
      canvas.width = 100
      canvas.height = 100
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#4DA2FF'
        ctx.fillRect(0, 0, 100, 100)
        ctx.fillStyle = 'white'
        ctx.font = '12px Arial'
        ctx.fillText('Demo', 35, 55)
      }
      
      const dataUrl = canvas.toDataURL('image/png')
      
      const result = await storeImage(dataUrl, 'profile-image', {
        epochs: 7, // 1 week
        deletable: true,
        useWalrus: true
      })

      setDemoResults(prev => ({ ...prev, imageUpload: result }))
      toast.success('Demo image uploaded successfully!')
    } catch (error) {
      console.error('Demo image upload failed:', error)
      toast.error('Demo image upload failed')
    }
  }

  const handleDemoDataUpload = async () => {
    try {
      const demoData = {
        name: 'Demo User',
        timestamp: new Date().toISOString(),
        preferences: {
          theme: 'dark',
          notifications: true
        },
        achievements: ['first_login', 'profile_complete']
      }

      const result = await storeData(demoData, 'user-profile', {
        epochs: 30, // 1 month
        deletable: true,
        useWalrus: true
      })

      setDemoResults(prev => ({ ...prev, dataUpload: result }))
      toast.success('Demo data uploaded successfully!')
    } catch (error) {
      console.error('Demo data upload failed:', error)
      toast.error('Demo data upload failed')
    }
  }

  const handleDemoImageRetrieve = async () => {
    if (!demoResults.imageUpload?.blobId) {
      toast.error('No image to retrieve. Upload an image first.')
      return
    }

    try {
      const imageUrl = await retrieveImage(
        demoResults.imageUpload.blobId,
        'profile-image'
      )

      if (imageUrl) {
        setDemoResults(prev => ({ ...prev, imageRetrieve: imageUrl }))
        toast.success('Demo image retrieved successfully!')
      } else {
        toast.error('No image data found')
      }
    } catch (error) {
      console.error('Demo image retrieve failed:', error)
      toast.error('Demo image retrieve failed')
    }
  }

  const handleDemoDataRetrieve = async () => {
    if (!demoResults.dataUpload?.blobId) {
      toast.error('No data to retrieve. Upload data first.')
      return
    }

    try {
      const data = await retrieveData(
        demoResults.dataUpload.blobId,
        'user-profile'
      )

      if (data) {
        setDemoResults(prev => ({ ...prev, dataRetrieve: data }))
        toast.success('Demo data retrieved successfully!')
      } else {
        toast.error('No data found')
      }
    } catch (error) {
      console.error('Demo data retrieve failed:', error)
      toast.error('Demo data retrieve failed')
    }
  }

  if (!isSignedIn) {
    return (
      <div className="container mx-auto p-6">
        <Card className="bg-[#0A1628] border-[#C0E6FF]/20">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#C0E6FF] mb-2">Wallet Connection Required</h2>
            <p className="text-[#C0E6FF]/70">
              Please connect your Sui wallet to access the Walrus storage demo.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-[#C0E6FF]">Walrus Storage Demo</h1>
        <p className="text-[#C0E6FF]/70">
          Experience decentralized storage with Mysten Labs Walrus
        </p>
      </div>

      {/* Status Overview */}
      <Card className="bg-[#0A1628] border-[#C0E6FF]/20">
        <CardHeader>
          <CardTitle className="text-[#C0E6FF] flex items-center gap-2">
            <Network className="w-5 h-5" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-[#C0E6FF]">
                Wallet: {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isInitialized ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-sm text-[#C0E6FF]">
                Walrus: {isInitialized ? 'Ready' : 'Initializing'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm text-[#C0E6FF]">
                Network: {network}
              </span>
            </div>
          </div>
          
          <div className="mt-4">
            <WalrusStatusIndicator />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="demo" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-[#030f1c]">
          <TabsTrigger value="demo" className="data-[state=active]:bg-[#4DA2FF]">
            Demo Operations
          </TabsTrigger>
          <TabsTrigger value="profile" className="data-[state=active]:bg-[#4DA2FF]">
            Profile System
          </TabsTrigger>
          <TabsTrigger value="costs" className="data-[state=active]:bg-[#4DA2FF]">
            Storage Costs
          </TabsTrigger>
        </TabsList>

        {/* Demo Operations Tab */}
        <TabsContent value="demo" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Storage Demo */}
            <Card className="bg-[#0A1628] border-[#C0E6FF]/20">
              <CardHeader>
                <CardTitle className="text-[#C0E6FF] flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Image Storage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Button
                    onClick={handleDemoImageUpload}
                    disabled={isLoading || !isInitialized || !isConnected}
                    className="w-full bg-[#4DA2FF] hover:bg-[#4DA2FF]/80"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Demo Image
                  </Button>
                  
                  <Button
                    onClick={handleDemoImageRetrieve}
                    disabled={isLoading || !demoResults.imageUpload}
                    variant="outline"
                    className="w-full border-[#C0E6FF]/20 text-[#C0E6FF] hover:bg-[#C0E6FF]/10"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Retrieve Image
                  </Button>
                </div>

                {demoResults.imageUpload && (
                  <div className="p-3 bg-[#030f1c] rounded border border-[#C0E6FF]/20">
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span className="text-[#C0E6FF]">Upload successful</span>
                      </div>
                      <div>Blob ID: {demoResults.imageUpload.blobId ? demoResults.imageUpload.blobId.slice(0, 16) + '...' : 'Local storage'}</div>
                      <div>Cost: {demoResults.imageUpload.cost ? demoResults.imageUpload.cost.toFixed(6) + ' SUI' : 'Free (local)'}</div>
                      <div>Fallback: {demoResults.imageUpload.fallback ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                )}

                {demoResults.imageRetrieve && (
                  <div className="text-center">
                    <img
                      src={demoResults.imageRetrieve}
                      alt="Retrieved demo"
                      className="w-20 h-20 mx-auto rounded border border-[#C0E6FF]/20"
                    />
                    <p className="text-xs text-[#C0E6FF]/70 mt-2">Retrieved from Walrus</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Data Storage Demo */}
            <Card className="bg-[#0A1628] border-[#C0E6FF]/20">
              <CardHeader>
                <CardTitle className="text-[#C0E6FF] flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Data Storage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Button
                    onClick={handleDemoDataUpload}
                    disabled={isLoading || !isInitialized || !isConnected}
                    className="w-full bg-[#4DA2FF] hover:bg-[#4DA2FF]/80"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Demo Data
                  </Button>
                  
                  <Button
                    onClick={handleDemoDataRetrieve}
                    disabled={isLoading || !demoResults.dataUpload}
                    variant="outline"
                    className="w-full border-[#C0E6FF]/20 text-[#C0E6FF] hover:bg-[#C0E6FF]/10"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Retrieve Data
                  </Button>
                </div>

                {demoResults.dataUpload && (
                  <div className="p-3 bg-[#030f1c] rounded border border-[#C0E6FF]/20">
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span className="text-[#C0E6FF]">Upload successful</span>
                      </div>
                      <div>Blob ID: {demoResults.dataUpload.blobId ? demoResults.dataUpload.blobId.slice(0, 16) + '...' : 'Local storage'}</div>
                      <div>Cost: {demoResults.dataUpload.cost ? demoResults.dataUpload.cost.toFixed(6) + ' SUI' : 'Free (local)'}</div>
                      <div>Fallback: {demoResults.dataUpload.fallback ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                )}

                {demoResults.dataRetrieve && (
                  <div className="p-3 bg-[#030f1c] rounded border border-[#C0E6FF]/20">
                    <div className="text-xs">
                      <div className="text-[#C0E6FF] mb-2">Retrieved Data:</div>
                      <pre className="text-[#C0E6FF]/70 overflow-x-auto">
                        {JSON.stringify(demoResults.dataRetrieve, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Profile System Tab */}
        <TabsContent value="profile">
          <WalrusProfileSystem enableWalrusSync={true} />
        </TabsContent>

        {/* Storage Costs Tab */}
        <TabsContent value="costs" className="space-y-6">
          <Card className="bg-[#0A1628] border-[#C0E6FF]/20">
            <CardHeader>
              <CardTitle className="text-[#C0E6FF] flex items-center gap-2">
                <Coins className="w-5 h-5" />
                Storage Cost Calculator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#C0E6FF]">Sample File Sizes</h3>
                  
                  {[
                    { name: 'Profile Image (100KB)', size: 100 * 1024 },
                    { name: 'Channel Banner (500KB)', size: 500 * 1024 },
                    { name: 'User Profile Data (5KB)', size: 5 * 1024 },
                    { name: 'Achievement Data (10KB)', size: 10 * 1024 }
                  ].map((item) => (
                    <div key={item.name} className="space-y-2">
                      <h4 className="font-medium text-[#C0E6FF]">{item.name}</h4>
                      <StorageCostEstimator sizeInBytes={item.size} />
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#C0E6FF]">Storage Duration Options</h3>
                  
                  <div className="space-y-2">
                    {Object.entries(storageOptions).map(([name, epochs]) => (
                      <div key={name} className="flex justify-between p-2 bg-[#030f1c] rounded border border-[#C0E6FF]/20">
                        <span className="text-[#C0E6FF]">{name}</span>
                        <span className="text-[#C0E6FF]/70">{epochs} epochs (~{Math.ceil(epochs / 7)} weeks)</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-blue-500/10 rounded border border-blue-500/20">
                    <div className="flex items-center gap-2 text-sm text-blue-400">
                      <Info className="w-4 h-4" />
                      <span>1 epoch ≈ 24 hours on Sui testnet</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {error && (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
