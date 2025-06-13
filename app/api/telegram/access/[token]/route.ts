import { NextRequest, NextResponse } from 'next/server'
import { accessTokens } from '../../generate-access/route'

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params
    const { searchParams } = new URL(request.url)
    
    // Get Telegram user data from query parameters (sent by Telegram bot)
    const telegramUserId = searchParams.get('telegram_user_id')
    const telegramUsername = searchParams.get('telegram_username')
    const telegramFirstName = searchParams.get('telegram_first_name')

    console.log(`[Telegram Access] Access attempt for token: ${token}`)
    console.log(`[Telegram Access] Telegram user: ${telegramUserId} (@${telegramUsername})`)

    // Retrieve token data
    const tokenData = accessTokens.get(token)
    
    if (!tokenData) {
      console.log(`[Telegram Access] Token not found: ${token}`)
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Access Link Invalid</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #e74c3c; }
            .icon { font-size: 48px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">❌</div>
            <h1 class="error">Access Link Invalid</h1>
            <p>This access link is invalid or has expired.</p>
            <p>Please contact the channel creator for a new access link.</p>
          </div>
        </body>
        </html>
        `,
        { 
          status: 404,
          headers: { 'Content-Type': 'text/html' }
        }
      )
    }

    // Check if token is already used
    if (tokenData.used) {
      console.log(`[Telegram Access] Token already used: ${token}`)
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Access Link Already Used</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .warning { color: #f39c12; }
            .icon { font-size: 48px; margin-bottom: 20px; }
            .details { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: left; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">⚠️</div>
            <h1 class="warning">Access Link Already Used</h1>
            <p>This access link has already been used and cannot be used again.</p>
            <div class="details">
              <strong>Used by:</strong> ${tokenData.telegramUsername ? `@${tokenData.telegramUsername}` : `User ID: ${tokenData.telegramUserId}`}<br>
              <strong>Used on:</strong> ${tokenData.usedAt ? new Date(tokenData.usedAt).toLocaleString() : 'Unknown'}
            </div>
            <p>Each access link can only be used once for security purposes.</p>
          </div>
        </body>
        </html>
        `,
        { 
          status: 409,
          headers: { 'Content-Type': 'text/html' }
        }
      )
    }

    // Check if subscription has expired
    const now = new Date()
    const endDate = new Date(tokenData.subscriptionEndDate)
    
    if (now > endDate) {
      console.log(`[Telegram Access] Subscription expired for token: ${token}`)
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Subscription Expired</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #e74c3c; }
            .icon { font-size: 48px; margin-bottom: 20px; }
            .details { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: left; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">⏰</div>
            <h1 class="error">Subscription Expired</h1>
            <p>Your subscription to <strong>${tokenData.channelName}</strong> has expired.</p>
            <div class="details">
              <strong>Expired on:</strong> ${endDate.toLocaleString()}<br>
              <strong>Duration:</strong> ${tokenData.subscriptionDuration} days
            </div>
            <p>Please purchase a new subscription to continue accessing this premium channel.</p>
          </div>
        </body>
        </html>
        `,
        { 
          status: 410,
          headers: { 'Content-Type': 'text/html' }
        }
      )
    }

    // Mark token as used and store Telegram user info
    tokenData.used = true
    tokenData.usedAt = new Date().toISOString()
    if (telegramUserId) tokenData.telegramUserId = telegramUserId
    if (telegramUsername) tokenData.telegramUsername = telegramUsername
    
    accessTokens.set(token, tokenData)

    console.log(`[Telegram Access] Token successfully used: ${token}`)
    console.log(`[Telegram Access] Subscription valid until: ${tokenData.subscriptionEndDate}`)

    // Return success page with subscription details for the Telegram bot
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Access Granted</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
          .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .success { color: #27ae60; }
          .icon { font-size: 48px; margin-bottom: 20px; }
          .details { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: left; }
          .telegram-data { background: #e3f2fd; padding: 10px; border-radius: 5px; margin: 10px 0; font-family: monospace; font-size: 12px; }
          .button { display: inline-block; background: #0088cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">✅</div>
          <h1 class="success">Access Granted!</h1>
          <p>Welcome to <strong>${tokenData.channelName}</strong> by ${tokenData.creatorName}</p>
          
          <div class="details">
            <strong>Subscription Details:</strong><br>
            <strong>Duration:</strong> ${tokenData.subscriptionDuration} days<br>
            <strong>Started:</strong> ${new Date(tokenData.subscriptionStartDate).toLocaleString()}<br>
            <strong>Expires:</strong> ${new Date(tokenData.subscriptionEndDate).toLocaleString()}<br>
            <strong>Tier:</strong> ${tokenData.tier}<br>
            <strong>Amount Paid:</strong> ${tokenData.paymentAmount} SUI
          </div>

          <div class="telegram-data">
            <strong>Bot Integration Data:</strong><br>
            User ID: ${telegramUserId || 'Not provided'}<br>
            Username: @${telegramUsername || 'Not provided'}<br>
            Channel: ${tokenData.channelId}<br>
            Valid Until: ${tokenData.subscriptionEndDate}<br>
            Days Remaining: ${Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))}
          </div>

          <p>Your access has been activated. The Telegram bot will now grant you access to the premium channel.</p>
          
          <a href="https://t.me/${tokenData.channelId.replace('https://t.me/', '')}" class="button">
            Join Channel
          </a>
        </div>
      </body>
      </html>
      `,
      { 
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }
    )

  } catch (error) {
    console.error('[Telegram Access] Error processing access:', error)
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Access Error</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
          .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .error { color: #e74c3c; }
          .icon { font-size: 48px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">💥</div>
          <h1 class="error">Access Error</h1>
          <p>An error occurred while processing your access request.</p>
          <p>Please try again or contact support.</p>
        </div>
      </body>
      </html>
      `,
      { 
        status: 500,
        headers: { 'Content-Type': 'text/html' }
      }
    )
  }
}
