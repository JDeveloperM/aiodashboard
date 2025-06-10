"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RoleImage } from "@/components/ui/role-image"
import { Filter, SortAsc, Users, Crown, Shield, Star, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

interface UserSearchFiltersProps {
  selectedRole: 'ALL' | 'NOMAD' | 'PRO' | 'ROYAL'
  selectedStatus: 'ALL' | 'online' | 'idle' | 'dnd' | 'offline'
  sortBy: 'name' | 'joinDate' | 'level' | 'points'
  onRoleChange: (role: 'ALL' | 'NOMAD' | 'PRO' | 'ROYAL') => void
  onStatusChange: (status: 'ALL' | 'online' | 'idle' | 'dnd' | 'offline') => void
  onSortChange: (sort: 'name' | 'joinDate' | 'level' | 'points') => void
}

export function UserSearchFilters({
  selectedRole,
  selectedStatus,
  sortBy,
  onRoleChange,
  onStatusChange,
  onSortChange
}: UserSearchFiltersProps) {

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ROYAL':
        return <Crown className="w-3 h-3" />
      case 'PRO':
        return <Shield className="w-3 h-3" />
      case 'NOMAD':
        return <Star className="w-3 h-3" />
      default:
        return <Users className="w-3 h-3" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'idle':
        return 'bg-yellow-500'
      case 'dnd':
        return 'bg-red-500'
      case 'offline':
        return 'bg-gray-500'
      default:
        return 'bg-blue-500'
    }
  }

  const roleOptions = [
    { value: 'ALL', label: 'All Roles', icon: <Users className="w-3 h-3" /> },
    { value: 'ROYAL', label: 'Royal', icon: <Crown className="w-3 h-3" /> },
    { value: 'PRO', label: 'Pro', icon: <Shield className="w-3 h-3" /> },
    { value: 'NOMAD', label: 'Nomad', icon: <Star className="w-3 h-3" /> }
  ]

  const statusOptions = [
    { value: 'ALL', label: 'All Status', color: 'bg-blue-500' },
    { value: 'online', label: 'Online', color: 'bg-green-500' },
    { value: 'idle', label: 'Idle', color: 'bg-yellow-500' },
    { value: 'dnd', label: 'Do Not Disturb', color: 'bg-red-500' },
    { value: 'offline', label: 'Offline', color: 'bg-gray-500' }
  ]

  const sortOptions = [
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'joinDate', label: 'Join Date (Newest)' },
    { value: 'level', label: 'Level (Highest)' },
    { value: 'points', label: 'Points (Highest)' }
  ]

  return (
    <div className="mt-4 space-y-4">
      {/* Filter Buttons Row */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-1">
          <Filter className="w-4 h-4 text-[#C0E6FF]" />
          <span className="text-[#C0E6FF] text-sm font-medium">Filters:</span>
        </div>

        {/* Role Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {roleOptions.map((role) => (
            <Button
              key={role.value}
              variant={selectedRole === role.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onRoleChange(role.value as 'ALL' | 'NOMAD' | 'PRO' | 'ROYAL')}
              className={cn(
                "flex items-center gap-1.5 text-xs",
                selectedRole === role.value
                  ? "bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white border-[#4DA2FF]"
                  : "border-[#C0E6FF]/30 text-[#C0E6FF] hover:bg-[#4DA2FF]/10 hover:border-[#4DA2FF]/50"
              )}
            >
              {role.value !== 'ALL' && role.value !== 'NOMAD' && role.value !== 'PRO' && role.value !== 'ROYAL' ? (
                role.icon
              ) : role.value !== 'ALL' ? (
                <RoleImage role={role.value as "NOMAD" | "PRO" | "ROYAL"} size="sm" />
              ) : (
                role.icon
              )}
              {role.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Status Filter Buttons */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-1">
          <Circle className="w-4 h-4 text-[#C0E6FF]" />
          <span className="text-[#C0E6FF] text-sm font-medium">Status:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {statusOptions.map((status) => (
            <Button
              key={status.value}
              variant={selectedStatus === status.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onStatusChange(status.value as 'ALL' | 'online' | 'idle' | 'dnd' | 'offline')}
              className={cn(
                "flex items-center gap-1.5 text-xs",
                selectedStatus === status.value
                  ? "bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white border-[#4DA2FF]"
                  : "border-[#C0E6FF]/30 text-[#C0E6FF] hover:bg-[#4DA2FF]/10 hover:border-[#4DA2FF]/50"
              )}
            >
              <div className={cn("w-2 h-2 rounded-full", status.color)} />
              {status.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-1">
          <SortAsc className="w-4 h-4 text-[#C0E6FF]" />
          <span className="text-[#C0E6FF] text-sm font-medium">Sort by:</span>
        </div>

        <Select value={sortBy} onValueChange={(value) => onSortChange(value as 'name' | 'joinDate' | 'level' | 'points')}>
          <SelectTrigger className="w-48 bg-[#1a2f51] border-[#C0E6FF]/30 text-[#FFFFFF]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1a2f51] border-[#C0E6FF]/30">
            {sortOptions.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="text-[#FFFFFF] focus:bg-[#4DA2FF]/20 focus:text-white"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
