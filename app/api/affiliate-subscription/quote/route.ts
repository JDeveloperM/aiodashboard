import { NextRequest, NextResponse } from 'next/server'

// Server-side price quote function
async function getPriceQuote() {
  try {
    // Fetch current SUI price from CoinGecko
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=sui&vs_currencies=usd')
    const data = await response.json()

    const suiUsdRate = data.sui?.usd || 2.50 // Fallback rate
    const usdcPrice = 15.00 // $15 USDC equivalent for base subscription
    const suiPrice = usdcPrice / suiUsdRate

    return {
      usdcPrice,
      suiPrice: Math.ceil(suiPrice * 1000000000) / 1000000000, // Round up to 9 decimal places
      suiUsdRate,
      validUntil: new Date(Date.now() + 5 * 60 * 1000).toISOString() // Valid for 5 minutes
    }
  } catch (error) {
    console.error('Failed to get price quote:', error)
    // Fallback pricing
    return {
      usdcPrice: 15.00,
      suiPrice: 6.0, // Assuming $2.50 per SUI
      suiUsdRate: 2.50,
      validUntil: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { durationDays } = await request.json()

    if (!durationDays || durationDays <= 0) {
      return NextResponse.json(
        { error: 'Valid duration in days is required' },
        { status: 400 }
      )
    }

    // Get base price quote using server-side function
    const baseQuote = await getPriceQuote()

    // The quote is for a base subscription, duration is handled in the component
    const quote = {
      ...baseQuote,
      durationDays // Add duration to the response
    }

    return NextResponse.json({ quote })
  } catch (error: any) {
    console.error('Get price quote error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get price quote' },
      { status: 500 }
    )
  }
}
