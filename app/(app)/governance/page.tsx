"use client"

import { useState, useEffect } from 'react'
import { useSuiAuth } from '@/contexts/sui-auth-context'
import { useProfile } from '@/contexts/profile-context'
import { useAvatar } from '@/contexts/avatar-context'
import { governanceService, GovernanceProposal, UserVotingStatus } from '@/lib/governance-service'
import { useGovernanceRealtime } from '@/hooks/use-governance-realtime'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Vote,
  Clock,
  Users,
  Crown,
  Star,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

interface ProposalCardProps {
  proposal: GovernanceProposal
  userStatus: UserVotingStatus
  onVote: (proposalId: string, choice: 'for' | 'against') => Promise<void>
  isVoting: boolean
}

interface CompletedProposalsTableProps {
  proposals: GovernanceProposal[]
}

function CompletedProposalsTable({ proposals }: CompletedProposalsTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getResultBadge = (proposal: GovernanceProposal) => {
    const isApproved = proposal.votes_for > proposal.votes_against
    return (
      <Badge className={isApproved
        ? 'bg-green-500/20 text-green-400 border-green-500/30'
        : 'bg-red-500/20 text-red-400 border-red-500/30'
      }>
        {isApproved ? 'APPROVED' : 'REJECTED'}
      </Badge>
    )
  }

  const getStatusBadge = (proposal: GovernanceProposal) => {
    if (proposal.status === 'cancelled' || proposal.voting_status === 'cancelled') {
      return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">CANCELLED</Badge>
    }
    if (proposal.voting_status === 'expired') {
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">EXPIRED</Badge>
    }
    return getResultBadge(proposal)
  }

  return (
    <Card className="bg-[#1a2f51] border-[#C0E6FF]/30">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-[#C0E6FF]/20 hover:bg-transparent">
              <TableHead className="text-[#C0E6FF] font-semibold">Proposal</TableHead>
              <TableHead className="text-[#C0E6FF] font-semibold text-center">Result</TableHead>
              <TableHead className="text-[#C0E6FF] font-semibold text-center">Votes</TableHead>
              <TableHead className="text-[#C0E6FF] font-semibold text-center">Participation</TableHead>
              <TableHead className="text-[#C0E6FF] font-semibold text-center">Completed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {proposals.map((proposal) => (
              <TableRow key={proposal.id} className="border-[#C0E6FF]/10 hover:bg-[#C0E6FF]/5">
                <TableCell className="py-4">
                  <div>
                    <h3 className="text-white font-medium text-sm mb-1 line-clamp-2">
                      {proposal.title}
                    </h3>
                    <p className="text-gray-400 text-xs line-clamp-1">
                      {proposal.description}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {getStatusBadge(proposal)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="space-y-1">
                    <div className="text-xs text-gray-400">
                      <span className="text-green-400">{proposal.votes_for}</span>
                      {' / '}
                      <span className="text-red-400">{proposal.votes_against}</span>
                    </div>
                    <div className="text-xs text-white font-medium">
                      {proposal.for_percentage}% for
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="space-y-1">
                    <div className="text-xs text-white font-medium">
                      {proposal.total_votes} votes
                    </div>
                    <div className="text-xs text-gray-400">
                      {proposal.royal_voters + proposal.pro_voters} users
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="text-xs text-gray-400">
                    {formatDate(proposal.voting_deadline)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function ProposalCard({ proposal, userStatus, onVote, isVoting }: ProposalCardProps) {
  const formatTimeRemaining = (seconds: number) => {
    if (seconds <= 0) return 'Expired'
    
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) return `${days}d ${hours}h remaining`
    if (hours > 0) return `${hours}h ${minutes}m remaining`
    return `${minutes}m remaining`
  }



  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'ROYAL': return <Crown className="w-4 h-4 text-yellow-400" />
      case 'PRO': return <Star className="w-4 h-4 text-blue-400" />
      case 'NOMAD': return <Shield className="w-4 h-4 text-gray-400" />
      default: return <Shield className="w-4 h-4 text-gray-400" />
    }
  }

  const canVoteOnProposal = userStatus.can_vote && 
    !userStatus.has_voted && 
    proposal.voting_status === 'active'

  return (
    <Card className="bg-[#1a2f51] border-[#C0E6FF]/30 hover:border-[#4da2ff]/50 transition-colors">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl text-white mb-2">{proposal.title}</CardTitle>
            <p className="text-gray-300 text-sm leading-relaxed">{proposal.description}</p>
          </div>

        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Voting Progress */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Voting Progress</span>
            <span className="text-white font-medium">
              {proposal.total_votes} vote{proposal.total_votes !== 1 ? 's' : ''} cast
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-green-400">For: {proposal.votes_for} ({proposal.for_percentage}%)</span>
              <span className="text-red-400">Against: {proposal.votes_against} ({proposal.against_percentage}%)</span>
            </div>
            <Progress 
              value={proposal.for_percentage} 
              className="h-2 bg-gray-700"
            />
          </div>
        </div>

        <Separator className="bg-gray-700" />

        {/* Voting Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-400">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span>ROYAL voters: {proposal.royal_voters}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Star className="w-4 h-4 text-blue-400" />
              <span>PRO voters: {proposal.pro_voters}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{formatTimeRemaining(proposal.seconds_remaining)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Users className="w-4 h-4" />
              <span>Weight: {proposal.royal_vote_weight + proposal.pro_vote_weight}</span>
            </div>
          </div>
        </div>

        <Separator className="bg-gray-700" />

        {/* User Status & Voting */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getTierIcon(userStatus.tier)}
              <span className="text-sm text-gray-400">
                Your tier: {userStatus.tier} (Weight: {userStatus.vote_weight})
              </span>
            </div>
            
            {userStatus.has_voted && (
              <div className="flex items-center gap-2">
                {userStatus.vote_choice === 'for' ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
                <span className="text-sm text-gray-300">
                  Voted {userStatus.vote_choice?.toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Voting Buttons */}
          {proposal.status === 'closed' || proposal.voting_status === 'closed' ? (
            <div className="text-center p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">Proposal Completed</span>
              </div>
              <span className="text-xs text-gray-400">
                Final Result: {proposal.votes_for > proposal.votes_against ? 'APPROVED' : 'REJECTED'}
                ({proposal.for_percentage}% for, {proposal.against_percentage}% against)
              </span>
            </div>
          ) : proposal.status === 'cancelled' || proposal.voting_status === 'cancelled' ? (
            <div className="text-center p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <div className="flex items-center justify-center gap-2">
                <XCircle className="w-5 h-5 text-orange-400" />
                <span className="text-sm font-medium text-orange-400">Proposal Cancelled</span>
              </div>
            </div>
          ) : proposal.voting_status === 'expired' ? (
            <div className="text-center p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-5 h-5 text-red-400" />
                <span className="text-sm font-medium text-red-400">Voting Expired</span>
              </div>
            </div>
          ) : userStatus.tier === 'NOMAD' ? (
            <div className="flex items-center gap-2 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-orange-400">
                Upgrade to PRO or ROYAL tier to participate in governance
              </span>
            </div>
          ) : canVoteOnProposal ? (
            <div className="flex gap-2">
              <Button
                onClick={() => onVote(proposal.id, 'for')}
                disabled={isVoting}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {isVoting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Vote For
              </Button>
              <Button
                onClick={() => onVote(proposal.id, 'against')}
                disabled={isVoting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {isVoting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                Vote Against
              </Button>
            </div>
          ) : userStatus.has_voted ? (
            <div className="text-center p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <span className="text-sm text-blue-400">You have already voted on this proposal</span>
            </div>
          ) : (
            <div className="text-center p-2 bg-gray-500/10 border border-gray-500/30 rounded-lg">
              <span className="text-sm text-gray-400">Voting is no longer available</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function GovernancePage() {
  const { isSignedIn, user } = useSuiAuth()
  const { profile } = useProfile()
  const { getAvatarUrl, getFallbackText } = useAvatar()
  const tier = profile?.role_tier || 'NOMAD'
  const [proposals, setProposals] = useState<GovernanceProposal[]>([])
  const [userStatuses, setUserStatuses] = useState<Record<string, UserVotingStatus>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isVoting, setIsVoting] = useState(false)
  const [activeTab, setActiveTab] = useState('active')

  // Load proposals and user voting statuses
  const loadData = async () => {
    if (!isSignedIn || !user?.address) return

    try {
      setIsLoading(true)

      // Load all proposals (including completed ones for demonstration)
      const allProposals = await governanceService.getAllProposals()
      setProposals(allProposals)

      // Load user voting statuses for active proposals
      const statuses = await governanceService.getUserVotingStatuses(user.address)
      setUserStatuses(statuses)

    } catch (error) {
      console.error('Error loading governance data:', error)
      toast.error('Failed to load governance data')
    } finally {
      setIsLoading(false)
    }
  }

  // Real-time updates
  useGovernanceRealtime({
    onProposalUpdate: (updatedProposal) => {
      setProposals(prev =>
        prev.map(p => p.id === updatedProposal.id ? updatedProposal : p)
      )
    },
    onNewProposal: (newProposal) => {
      setProposals(prev => [newProposal, ...prev])
    },
    onVoteUpdate: async (proposalId) => {
      // Refresh user voting status for the updated proposal
      if (user?.address) {
        try {
          const status = await governanceService.getUserVotingStatus(user.address, proposalId)
          setUserStatuses(prev => ({
            ...prev,
            [proposalId]: status
          }))

          // Also refresh the proposal data to get updated vote counts
          const updatedProposal = await governanceService.getProposal(proposalId)
          if (updatedProposal) {
            setProposals(prev =>
              prev.map(p => p.id === proposalId ? updatedProposal : p)
            )
          }
        } catch (error) {
          console.error('Error refreshing vote data:', error)
        }
      }
    },
    enabled: isSignedIn && !!user?.address && tier !== 'NOMAD'
  })

  // Handle voting
  const handleVote = async (proposalId: string, choice: 'for' | 'against') => {
    if (!user?.address) return

    try {
      setIsVoting(true)
      
      const result = await governanceService.submitVote(proposalId, user.address, choice)
      
      if (result.success) {
        toast.success(`Vote submitted successfully!`, {
          description: `You voted ${choice.toUpperCase()} with weight ${userStatuses[proposalId]?.vote_weight || 1}`
        })
        
        // Reload data to reflect changes
        await loadData()
      } else {
        toast.error('Failed to submit vote', {
          description: result.error
        })
      }
    } catch (error) {
      console.error('Error submitting vote:', error)
      toast.error('Failed to submit vote')
    } finally {
      setIsVoting(false)
    }
  }

  // Filter proposals by status
  const activeProposals = proposals.filter(p =>
    p.status === 'active' && p.voting_status === 'active'
  )
  const completedProposals = proposals.filter(p =>
    p.status === 'closed' || p.voting_status === 'closed' ||
    p.status === 'cancelled' || p.voting_status === 'cancelled' ||
    p.voting_status === 'expired'
  )

  useEffect(() => {
    loadData()
  }, [isSignedIn, user?.address])

  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto bg-[#1a2f51] border-[#C0E6FF]/30">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Authentication Required</h2>
            <p className="text-[#C0E6FF]">Please sign in to access the governance system.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">DAO Governance</h1>
          <p className="text-gray-400 mt-2">Participate in AIONET community decisions</p>
        </div>
        <div className="flex items-center gap-2 bg-[#1a2f51] px-4 py-2 rounded-lg border border-[#C0E6FF]/30">
          <Vote className="w-5 h-5 text-[#4da2ff]" />
          <span className="text-white font-medium">Governance</span>
        </div>
      </div>

      {/* User Status */}
      <Card className="bg-[#1a2f51] border-[#C0E6FF]/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* User Avatar */}
              <Avatar className="h-12 w-12 bg-blue-100">
                <AvatarImage src={getAvatarUrl()} alt={profile?.username || user?.username} />
                <AvatarFallback className="bg-[#4DA2FF] text-white font-semibold">
                  {getFallbackText()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold text-white">Your Voting Power</h3>
                <p className="text-gray-400">
                  Tier: {tier} • Vote Weight: {governanceService.getVoteWeight(tier as any)}
                  {tier === 'NOMAD' && ' (No voting access)'}
                </p>
              </div>
            </div>
            {tier !== 'NOMAD' && (
              <div className="text-right">
                <p className="text-sm text-gray-400">Total Proposals</p>
                <p className="text-2xl font-bold text-white">{proposals.length}</p>
                <p className="text-xs text-gray-500">
                  {activeProposals.length} active • {completedProposals.length} completed
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Proposals Tabs */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#4da2ff]" />
          <span className="ml-2 text-gray-400">Loading proposals...</span>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#1a2f51] border border-[#C0E6FF]/20">
            <TabsTrigger
              value="active"
              className="text-[#C0E6FF] data-[state=active]:bg-[#4DA2FF] data-[state=active]:text-white flex items-center gap-2"
            >
              <Vote className="w-4 h-4" />
              Active ({activeProposals.length})
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="text-[#C0E6FF] data-[state=active]:bg-[#4DA2FF] data-[state=active]:text-white flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Completed ({completedProposals.length})
            </TabsTrigger>
          </TabsList>

          {/* Active Proposals Tab */}
          <TabsContent value="active" className="mt-6">
            {activeProposals.length === 0 ? (
              <Card className="bg-[#1a2f51] border-[#C0E6FF]/30">
                <CardContent className="p-12 text-center">
                  <Vote className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Active Proposals</h3>
                  <p className="text-gray-400">There are currently no active proposals to vote on.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeProposals.map((proposal) => (
                  <ProposalCard
                    key={proposal.id}
                    proposal={proposal}
                    userStatus={userStatuses[proposal.id] || {
                      can_vote: false,
                      vote_weight: 0,
                      tier: 'NOMAD',
                      has_voted: false,
                      remaining_votes: 0
                    }}
                    onVote={handleVote}
                    isVoting={isVoting}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Completed Proposals Tab */}
          <TabsContent value="completed" className="mt-6">
            {completedProposals.length === 0 ? (
              <Card className="bg-[#1a2f51] border-[#C0E6FF]/30">
                <CardContent className="p-12 text-center">
                  <CheckCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Completed Proposals</h3>
                  <p className="text-gray-400">No proposals have been completed yet.</p>
                </CardContent>
              </Card>
            ) : (
              <CompletedProposalsTable proposals={completedProposals} />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
