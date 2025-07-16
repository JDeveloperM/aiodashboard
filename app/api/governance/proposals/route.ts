import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Admin wallet address
const ADMIN_ADDRESS = '0x311479200d45ef0243b92dbcf9849b8f6b931d27ae885197ea73066724f2bcf4'

// Create Supabase client with service key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
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
  metadata?: any
}

export interface CreateProposalData {
  title: string
  description: string
  voting_deadline: string
  metadata?: any
}

/**
 * GET /api/governance/proposals
 * Get all governance proposals with voting statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // Filter by status
    const includeExpired = searchParams.get('include_expired') === 'true'

    let query = supabase
      .from('governance_proposal_stats')
      .select('*')
      .order('created_at', { ascending: false })

    // Filter by status if provided
    if (status && ['active', 'closed', 'cancelled'].includes(status)) {
      query = query.eq('status', status)
    }

    // Exclude expired proposals unless specifically requested
    if (!includeExpired) {
      query = query.gt('voting_deadline', new Date().toISOString())
    }

    const { data: proposals, error } = await query

    if (error) {
      console.error('Error fetching proposals:', error)
      return NextResponse.json(
        { error: 'Failed to fetch proposals' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      proposals: proposals || []
    })

  } catch (error) {
    console.error('Unexpected error in GET /api/governance/proposals:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/governance/proposals
 * Create a new governance proposal (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminAddress = searchParams.get('admin_address')

    // Validate admin access
    if (adminAddress !== ADMIN_ADDRESS) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, description, voting_deadline, metadata }: CreateProposalData = body

    // Validate required fields
    if (!title || !description || !voting_deadline) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, voting_deadline' },
        { status: 400 }
      )
    }

    // Validate voting deadline is in the future
    const deadline = new Date(voting_deadline)
    if (deadline <= new Date()) {
      return NextResponse.json(
        { error: 'Voting deadline must be in the future' },
        { status: 400 }
      )
    }

    // Create the proposal
    const { data: proposal, error } = await supabase
      .from('governance_proposals')
      .insert({
        title: title.trim(),
        description: description.trim(),
        created_by: adminAddress,
        voting_deadline: deadline.toISOString(),
        metadata: metadata || {},
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating proposal:', error)
      return NextResponse.json(
        { error: 'Failed to create proposal' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      proposal,
      message: 'Proposal created successfully'
    })

  } catch (error) {
    console.error('Unexpected error in POST /api/governance/proposals:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/governance/proposals
 * Update proposal status (admin only)
 */
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminAddress = searchParams.get('admin_address')
    const proposalId = searchParams.get('proposal_id')

    // Validate admin access
    if (adminAddress !== ADMIN_ADDRESS) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    if (!proposalId) {
      return NextResponse.json(
        { error: 'Missing proposal_id parameter' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { status } = body

    // Validate status
    if (!status || !['active', 'closed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: active, closed, or cancelled' },
        { status: 400 }
      )
    }

    // Update the proposal
    const { data: proposal, error } = await supabase
      .from('governance_proposals')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', proposalId)
      .select()
      .single()

    if (error) {
      console.error('Error updating proposal:', error)
      return NextResponse.json(
        { error: 'Failed to update proposal' },
        { status: 500 }
      )
    }

    if (!proposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      proposal,
      message: `Proposal status updated to ${status}`
    })

  } catch (error) {
    console.error('Unexpected error in PATCH /api/governance/proposals:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/governance/proposals
 * Delete a proposal (admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminAddress = searchParams.get('admin_address')
    const proposalId = searchParams.get('proposal_id')

    // Validate admin access
    if (adminAddress !== ADMIN_ADDRESS) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    if (!proposalId) {
      return NextResponse.json(
        { error: 'Missing proposal_id parameter' },
        { status: 400 }
      )
    }

    // Delete the proposal (this will cascade delete all votes)
    const { error } = await supabase
      .from('governance_proposals')
      .delete()
      .eq('id', proposalId)

    if (error) {
      console.error('Error deleting proposal:', error)
      return NextResponse.json(
        { error: 'Failed to delete proposal' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Proposal deleted successfully'
    })

  } catch (error) {
    console.error('Unexpected error in DELETE /api/governance/proposals:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
