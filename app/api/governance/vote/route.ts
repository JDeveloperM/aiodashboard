import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client with service key for voting operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface VoteData {
  proposal_id: string
  voter_address: string
  vote_choice: 'for' | 'against'
  voter_tier: 'NOMAD' | 'PRO' | 'ROYAL'
}

export interface UserVoteStatus {
  proposal_id: string
  has_voted: boolean
  vote_choice?: 'for' | 'against'
  vote_weight?: number
  can_vote: boolean
  remaining_votes?: number
}

/**
 * Get vote weight based on user tier
 */
function getVoteWeight(tier: 'NOMAD' | 'PRO' | 'ROYAL'): number {
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
 * GET /api/governance/vote
 * Get user's voting status for proposals
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get('user_address')
    const proposalId = searchParams.get('proposal_id')

    if (!userAddress) {
      return NextResponse.json(
        { error: 'Missing user_address parameter' },
        { status: 400 }
      )
    }

    // Get user's tier from profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role_tier')
      .eq('address', userAddress)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    const userTier = profile.role_tier as 'NOMAD' | 'PRO' | 'ROYAL'
    const voteWeight = getVoteWeight(userTier)
    const canVote = voteWeight > 0

    if (proposalId) {
      // Get voting status for specific proposal
      const { data: vote, error: voteError } = await supabase
        .from('governance_votes')
        .select('vote_choice, vote_weight')
        .eq('proposal_id', proposalId)
        .eq('voter_address', userAddress)
        .single()

      const voteStatus: UserVoteStatus = {
        proposal_id: proposalId,
        has_voted: !!vote,
        vote_choice: vote?.vote_choice as 'for' | 'against' | undefined,
        vote_weight: vote?.vote_weight,
        can_vote: canVote,
        remaining_votes: canVote ? voteWeight : 0
      }

      return NextResponse.json({
        success: true,
        vote_status: voteStatus,
        user_tier: userTier,
        vote_weight: voteWeight
      })
    } else {
      // Get voting status for all active proposals
      const { data: proposals, error: proposalsError } = await supabase
        .from('governance_proposals')
        .select('id')
        .eq('status', 'active')
        .gt('voting_deadline', new Date().toISOString())

      if (proposalsError) {
        console.error('Error fetching proposals:', proposalsError)
        return NextResponse.json(
          { error: 'Failed to fetch proposals' },
          { status: 500 }
        )
      }

      // Get user's votes for all proposals
      const { data: votes, error: votesError } = await supabase
        .from('governance_votes')
        .select('proposal_id, vote_choice, vote_weight')
        .eq('voter_address', userAddress)

      if (votesError) {
        console.error('Error fetching votes:', votesError)
        return NextResponse.json(
          { error: 'Failed to fetch user votes' },
          { status: 500 }
        )
      }

      const voteStatuses: UserVoteStatus[] = (proposals || []).map(proposal => {
        const userVote = votes?.find(v => v.proposal_id === proposal.id)
        return {
          proposal_id: proposal.id,
          has_voted: !!userVote,
          vote_choice: userVote?.vote_choice as 'for' | 'against' | undefined,
          vote_weight: userVote?.vote_weight,
          can_vote: canVote,
          remaining_votes: canVote ? voteWeight : 0
        }
      })

      return NextResponse.json({
        success: true,
        vote_statuses: voteStatuses,
        user_tier: userTier,
        vote_weight: voteWeight
      })
    }

  } catch (error) {
    console.error('Unexpected error in GET /api/governance/vote:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/governance/vote
 * Submit a vote for a proposal
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { proposal_id, voter_address, vote_choice }: VoteData = body

    // Validate required fields
    if (!proposal_id || !voter_address || !vote_choice) {
      return NextResponse.json(
        { error: 'Missing required fields: proposal_id, voter_address, vote_choice' },
        { status: 400 }
      )
    }

    // Validate vote choice
    if (!['for', 'against'].includes(vote_choice)) {
      return NextResponse.json(
        { error: 'Invalid vote_choice. Must be "for" or "against"' },
        { status: 400 }
      )
    }

    // Get user's tier from profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role_tier')
      .eq('address', voter_address)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    const userTier = profile.role_tier as 'NOMAD' | 'PRO' | 'ROYAL'
    const voteWeight = getVoteWeight(userTier)

    // Check if user can vote
    if (voteWeight === 0) {
      return NextResponse.json(
        { error: 'NOMAD tier users cannot vote. Upgrade to PRO or ROYAL tier to participate in governance.' },
        { status: 403 }
      )
    }

    // Check if proposal exists and is active
    const { data: proposal, error: proposalError } = await supabase
      .from('governance_proposals')
      .select('id, status, voting_deadline')
      .eq('id', proposal_id)
      .single()

    if (proposalError || !proposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      )
    }

    // Check if proposal is still active and not expired
    if (proposal.status !== 'active') {
      return NextResponse.json(
        { error: 'Proposal is not active for voting' },
        { status: 400 }
      )
    }

    if (new Date(proposal.voting_deadline) <= new Date()) {
      return NextResponse.json(
        { error: 'Voting deadline has passed' },
        { status: 400 }
      )
    }

    // Check if user has already voted
    const { data: existingVote, error: voteCheckError } = await supabase
      .from('governance_votes')
      .select('id')
      .eq('proposal_id', proposal_id)
      .eq('voter_address', voter_address)
      .single()

    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already voted on this proposal' },
        { status: 400 }
      )
    }

    // Insert the vote
    const { data: vote, error: voteError } = await supabase
      .from('governance_votes')
      .insert({
        proposal_id,
        voter_address,
        vote_choice,
        vote_weight: voteWeight,
        voter_tier: userTier,
        metadata: {
          timestamp: new Date().toISOString(),
          user_tier_at_vote: userTier
        }
      })
      .select()
      .single()

    if (voteError) {
      console.error('Error submitting vote:', voteError)
      return NextResponse.json(
        { error: 'Failed to submit vote' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      vote,
      message: `Vote submitted successfully with weight ${voteWeight}`,
      vote_weight: voteWeight
    })

  } catch (error) {
    console.error('Unexpected error in POST /api/governance/vote:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/governance/vote
 * Remove a vote (allow users to change their mind before deadline)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const proposalId = searchParams.get('proposal_id')
    const voterAddress = searchParams.get('voter_address')

    if (!proposalId || !voterAddress) {
      return NextResponse.json(
        { error: 'Missing required parameters: proposal_id, voter_address' },
        { status: 400 }
      )
    }

    // Check if proposal is still active
    const { data: proposal, error: proposalError } = await supabase
      .from('governance_proposals')
      .select('status, voting_deadline')
      .eq('id', proposalId)
      .single()

    if (proposalError || !proposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      )
    }

    if (proposal.status !== 'active' || new Date(proposal.voting_deadline) <= new Date()) {
      return NextResponse.json(
        { error: 'Cannot remove vote: proposal is no longer active or deadline has passed' },
        { status: 400 }
      )
    }

    // Delete the vote
    const { error: deleteError } = await supabase
      .from('governance_votes')
      .delete()
      .eq('proposal_id', proposalId)
      .eq('voter_address', voterAddress)

    if (deleteError) {
      console.error('Error removing vote:', deleteError)
      return NextResponse.json(
        { error: 'Failed to remove vote' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Vote removed successfully'
    })

  } catch (error) {
    console.error('Unexpected error in DELETE /api/governance/vote:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
