"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RoleImage } from "@/components/ui/role-image"
import { SuiIcon } from "@/components/ui/sui-icon"
import { CommissionData, CommissionTransaction } from "@/lib/affiliate-service"
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  UserPlus, 
  CreditCard,
  BarChart3,
  Gift,
  Clock,
  CheckCircle
} from "lucide-react"

interface CommissionTrackingProps {
  commissionData: CommissionData
  loading: boolean
}

export function CommissionTracking({ commissionData, loading }: CommissionTrackingProps) {
  const getCommissionTypeIcon = (type: string) => {
    switch (type) {
      case 'signup':
        return <UserPlus className="w-4 h-4" />
      case 'subscription':
        return <CreditCard className="w-4 h-4" />
      case 'purchase':
        return <ShoppingCart className="w-4 h-4" />
      case 'trading_fee':
        return <BarChart3 className="w-4 h-4" />
      default:
        return <Gift className="w-4 h-4" />
    }
  }

  const getCommissionTypeColor = (type: string) => {
    switch (type) {
      case 'signup':
        return 'text-green-400'
      case 'subscription':
        return 'text-blue-400'
      case 'purchase':
        return 'text-purple-400'
      case 'trading_fee':
        return 'text-orange-400'
      default:
        return 'text-gray-400'
    }
  }

  const formatCommissionType = (type: string) => {
    switch (type) {
      case 'signup':
        return 'Sign Up'
      case 'subscription':
        return 'Subscription'
      case 'purchase':
        return 'Purchase'
      case 'trading_fee':
        return 'Trading Fee'
      default:
        return 'Other'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4DA2FF]"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Commission Overview Cards */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Commissions */}
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-[#C0E6FF]">TOTAL COMMISSIONS</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-[#FFFFFF]">{commissionData.totalCommissions.toLocaleString()}</p>
                  <SuiIcon className="text-[#4DA2FF]" size="lg" />
                </div>
                <p className="text-xs text-[#C0E6FF] mt-1">Total earned</p>
              </div>
              <div className="bg-[#4DA2FF]/20 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* NOMAD Commissions */}
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-[#C0E6FF]">NOMAD COMMISSIONS</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-[#FFFFFF]">{commissionData.tierBreakdown.nomadCommissions.toLocaleString()}</p>
                  <SuiIcon className="text-gray-400" size="lg" />
                </div>
                <p className="text-xs text-[#C0E6FF] mt-1">From NOMAD users</p>
              </div>
              <div className="bg-gray-600/20 p-3 rounded-full">
                <RoleImage role="NOMAD" size="lg" />
              </div>
            </div>
          </div>
        </div>

        {/* PRO Commissions */}
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-[#C0E6FF]">PRO COMMISSIONS</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-[#FFFFFF]">{commissionData.tierBreakdown.proCommissions.toLocaleString()}</p>
                  <SuiIcon className="text-blue-400" size="lg" />
                </div>
                <p className="text-xs text-[#C0E6FF] mt-1">From PRO users</p>
              </div>
              <div className="bg-blue-600/20 p-3 rounded-full">
                <RoleImage role="PRO" size="lg" />
              </div>
            </div>
          </div>
        </div>

        {/* ROYAL Commissions */}
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-[#C0E6FF]">ROYAL COMMISSIONS</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-[#FFFFFF]">{commissionData.tierBreakdown.royalCommissions.toLocaleString()}</p>
                  <SuiIcon className="text-yellow-400" size="lg" />
                </div>
                <p className="text-xs text-[#C0E6FF] mt-1">From ROYAL users</p>
              </div>
              <div className="bg-yellow-600/20 p-3 rounded-full">
                <RoleImage role="ROYAL" size="lg" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Commission Type Breakdown and Recent Transactions */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Commission Type Breakdown */}
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-[#4DA2FF]" />
              <h3 className="text-xl font-semibold text-white">Commission Types</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#030f1c] rounded-lg border border-[#C0E6FF]/10">
                <div className="flex items-center gap-3">
                  <div className="text-green-400">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <span className="text-[#C0E6FF] text-sm">Sign Up</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-white font-semibold">{commissionData.typeBreakdown.signupCommissions.toLocaleString()}</span>
                  <SuiIcon className="text-green-400" size="sm" />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#030f1c] rounded-lg border border-[#C0E6FF]/10">
                <div className="flex items-center gap-3">
                  <div className="text-blue-400">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <span className="text-[#C0E6FF] text-sm">Subscription</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-white font-semibold">{commissionData.typeBreakdown.subscriptionCommissions.toLocaleString()}</span>
                  <SuiIcon className="text-blue-400" size="sm" />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#030f1c] rounded-lg border border-[#C0E6FF]/10">
                <div className="flex items-center gap-3">
                  <div className="text-purple-400">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <span className="text-[#C0E6FF] text-sm">Purchase</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-white font-semibold">{commissionData.typeBreakdown.purchaseCommissions.toLocaleString()}</span>
                  <SuiIcon className="text-purple-400" size="sm" />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#030f1c] rounded-lg border border-[#C0E6FF]/10">
                <div className="flex items-center gap-3">
                  <div className="text-orange-400">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <span className="text-[#C0E6FF] text-sm">Trading Fee</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-white font-semibold">{commissionData.typeBreakdown.tradingFeeCommissions.toLocaleString()}</span>
                  <SuiIcon className="text-orange-400" size="sm" />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#030f1c] rounded-lg border border-[#C0E6FF]/10">
                <div className="flex items-center gap-3">
                  <div className="text-gray-400">
                    <Gift className="w-4 h-4" />
                  </div>
                  <span className="text-[#C0E6FF] text-sm">Other</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-white font-semibold">{commissionData.typeBreakdown.otherCommissions.toLocaleString()}</span>
                  <SuiIcon className="text-gray-400" size="sm" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-[#4DA2FF]" />
              <h3 className="text-xl font-semibold text-white">Recent Transactions</h3>
            </div>

            {commissionData.recentTransactions.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {commissionData.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="p-3 bg-[#030f1c] rounded-lg border border-[#C0E6FF]/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={getCommissionTypeColor(transaction.commissionType)}>
                          {getCommissionTypeIcon(transaction.commissionType)}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-white font-semibold">{transaction.amount.toLocaleString()}</span>
                          <SuiIcon className="text-[#4DA2FF]" size="sm" />
                        </div>
                        <Badge className="bg-green-600/20 text-green-400 border-green-600/30 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#C0E6FF]">{transaction.affiliateUsername}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">{formatCommissionType(transaction.commissionType)}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-400">{new Date(transaction.earnedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-[#C0E6FF] text-sm">No commission transactions yet</p>
                <p className="text-gray-400 text-xs">Start referring users to earn commissions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
