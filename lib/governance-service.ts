import { createClient } from '@supabase/supabase-js'
import { nftMintingService } from './nft-minting-service'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface GovernanceProposal {
  id: string
  title: string
  description: string
  created_by: string
  status: 'active' | 'closed' | 'cancelled'
  voting_deadline: string
  created_at: string
  updated_at: string
  votes_for: number
  votes_against: number
  total_votes: number
  for_percentage: number
  against_percentage: number
  seconds_remaining: number
  voting_status: 'active' | 'expired' | 'closed' | 'cancelled'
  royal_voters: number
  pro_voters: number
  royal_vote_weight: number
  pro_vote_weight: number
  metadata?: any
}

export interface GovernanceVote {
  id: string
  proposal_id: string
  voter_address: string
  vote_choice: 'for' | 'against'
  vote_weight: number
  voter_tier: 'NOMAD' | 'PRO' | 'ROYAL'
  created_at: string
  metadata?: any
}

export interface UserVotingStatus {
  can_vote: boolean
  vote_weight: number
  tier: 'NOMAD' | 'PRO' | 'ROYAL'
  has_voted: boolean
  vote_choice?: 'for' | 'against'
  remaining_votes: number
}

export interface CreateProposalData {
  title: string
  description: string
  voting_deadline: Date
  metadata?: any
}

class GovernanceService {
  /**
   * Get vote weight based on user tier
   */
  getVoteWeight(tier: 'NOMAD' | 'PRO' | 'ROYAL'): number {
    switch (tier) {
      case 'ROYAL':
        return 3
      case 'PRO':
        return 1
      case 'NOMAD':
        return 0 // NOMAD users cannot vote
      default:
        return 0
    }
  }

  /**
   * Get user's current tier from NFT ownership
   */
  async getUserTier(userAddress: string): Promise<'NOMAD' | 'PRO' | 'ROYAL'> {
    try {
      // Use NFT minting service to check tier
      const tier = await nftMintingService.getUserTier(userAddress)
      return tier
    } catch (error) {
      console.error('Error getting user tier:', error)
      return 'NOMAD'
    }
  }

  /**
   * Get all active proposals
   */
  async getActiveProposals(): Promise<GovernanceProposal[]> {
    try {
      const { data, error } = await supabase
        .from('governance_proposal_stats')
        .select('*')
        .eq('status', 'active')
        .gt('voting_deadline', new Date().toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching active proposals:', error)
      throw error
    }
  }

  /**
   * Get all proposals (including expired/closed)
   */
  async getAllProposals(): Promise<GovernanceProposal[]> {
    try {
      const { data, error } = await supabase
        .from('governance_proposal_stats')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching all proposals:', error)
      throw error
    }
  }

  /**
   * Get proposal by ID
   */
  async getProposal(proposalId: string): Promise<GovernanceProposal | null> {
    try {
      const { data, error } = await supabase
        .from('governance_proposal_stats')
        .select('*')
        .eq('id', proposalId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching proposal:', error)
      return null
    }
  }

  /**
   * Get user's voting status for a specific proposal
   */
  async getUserVotingStatus(userAddress: string, proposalId: string): Promise<UserVotingStatus> {
    try {
      // Get user tier
      const tier = await this.getUserTier(userAddress)
      const voteWeight = this.getVoteWeight(tier)
      const canVote = voteWeight > 0

      // Check if user has voted
      const { data: vote, error } = await supabase
        .from('governance_votes')
        .select('vote_choice, vote_weight')
        .eq('proposal_id', proposalId)
        .eq('voter_address', userAddress)
        .single()

      return {
        can_vote: canVote,
        vote_weight: voteWeight,
        tier,
        has_voted: !!vote,
        vote_choice: vote?.vote_choice as 'for' | 'against' | undefined,
        remaining_votes: canVote && !vote ? voteWeight : 0
      }
    } catch (error) {
      console.error('Error getting user voting status:', error)
      // Return default status for NOMAD tier
      return {
        can_vote: false,
        vote_weight: 0,
        tier: 'NOMAD',
        has_voted: false,
        remaining_votes: 0
      }
    }
  }

  /**
   * Get user's voting status for all active proposals
   */
  async getUserVotingStatuses(userAddress: string): Promise<Record<string, UserVotingStatus>> {
    try {
      const proposals = await this.getActiveProposals()
      const statuses: Record<string, UserVotingStatus> = {}

      for (const proposal of proposals) {
        statuses[proposal.id] = await this.getUserVotingStatus(userAddress, proposal.id)
      }

      return statuses
    } catch (error) {
      console.error('Error getting user voting statuses:', error)
      return {}
    }
  }

  /**
   * Submit a vote
   */
  async submitVote(
    proposalId: string,
    voterAddress: string,
    voteChoice: 'for' | 'against'
  ): Promise<{ success: boolean; error?: string; vote?: GovernanceVote }> {
    try {
      // Get user tier
      const tier = await this.getUserTier(voterAddress)
      const voteWeight = this.getVoteWeight(tier)

      // Check if user can vote
      if (voteWeight === 0) {
        return {
          success: false,
          error: 'NOMAD tier users cannot vote. Upgrade to PRO or ROYAL tier to participate in governance.'
        }
      }

      // Check if proposal exists and is active
      const proposal = await this.getProposal(proposalId)
      if (!proposal) {
        return { success: false, error: 'Proposal not found' }
      }

      if (proposal.status !== 'active') {
        return { success: false, error: 'Proposal is not active for voting' }
      }

      if (new Date(proposal.voting_deadline) <= new Date()) {
        return { success: false, error: 'Voting deadline has passed' }
      }

      // Check if user has already voted
      const { data: existingVote } = await supabase
        .from('governance_votes')
        .select('id')
        .eq('proposal_id', proposalId)
        .eq('voter_address', voterAddress)
        .single()

      if (existingVote) {
        return { success: false, error: 'You have already voted on this proposal' }
      }

      // Submit the vote
      const { data: vote, error } = await supabase
        .from('governance_votes')
        .insert({
          proposal_id: proposalId,
          voter_address: voterAddress,
          vote_choice: voteChoice,
          vote_weight: voteWeight,
          voter_tier: tier,
          metadata: {
            timestamp: new Date().toISOString(),
            user_tier_at_vote: tier
          }
        })
        .select()
        .single()

      if (error) throw error

      return { success: true, vote }
    } catch (error) {
      console.error('Error submitting vote:', error)
      return { success: false, error: 'Failed to submit vote' }
    }
  }

  /**
   * Remove a vote (allow users to change their mind)
   */
  async removeVote(
    proposalId: string,
    voterAddress: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if proposal is still active
      const proposal = await this.getProposal(proposalId)
      if (!proposal) {
        return { success: false, error: 'Proposal not found' }
      }

      if (proposal.status !== 'active' || new Date(proposal.voting_deadline) <= new Date()) {
        return {
          success: false,
          error: 'Cannot remove vote: proposal is no longer active or deadline has passed'
        }
      }

      // Remove the vote
      const { error } = await supabase
        .from('governance_votes')
        .delete()
        .eq('proposal_id', proposalId)
        .eq('voter_address', voterAddress)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Error removing vote:', error)
      return { success: false, error: 'Failed to remove vote' }
    }
  }

  /**
   * Get voting statistics for a proposal
   */
  async getProposalStats(proposalId: string) {
    try {
      const proposal = await this.getProposal(proposalId)
      if (!proposal) return null

      return {
        total_votes: proposal.total_votes,
        votes_for: proposal.votes_for,
        votes_against: proposal.votes_against,
        for_percentage: proposal.for_percentage,
        against_percentage: proposal.against_percentage,
        royal_voters: proposal.royal_voters,
        pro_voters: proposal.pro_voters,
        royal_vote_weight: proposal.royal_vote_weight,
        pro_vote_weight: proposal.pro_vote_weight,
        voting_status: proposal.voting_status,
        seconds_remaining: proposal.seconds_remaining
      }
    } catch (error) {
      console.error('Error getting proposal stats:', error)
      return null
    }
  }

  /**
   * Check if user has access to governance (PRO or ROYAL tier)
   */
  async hasGovernanceAccess(userAddress: string): Promise<boolean> {
    try {
      const tier = await this.getUserTier(userAddress)
      return tier === 'PRO' || tier === 'ROYAL'
    } catch (error) {
      console.error('Error checking governance access:', error)
      return false
    }
  }
}

export const governanceService = new GovernanceService()
