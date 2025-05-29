import type React from "react"
import "./globals.css"
import { Inter, Space_Grotesk } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"
import { SubscriptionProvider } from "@/contexts/subscription-context"
import { SettingsProvider } from "@/contexts/settings-context"
import { PointsProvider } from "@/contexts/points-context"
import { Toaster } from "@/components/ui/sonner"

import type { Metadata, Viewport } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import '@/styles/squares.css'




const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
})

const spaceGrotesk = Space_Grotesk({
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  title: "MetadudesX - Greek NFT-Gated Community on Sui Network",
  description: "Empowering everyday individuals through decentralized investment opportunities, NFT-gated trading bots, and educational resources on Sui Network",
  generator: 'v0.dev'
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        baseTheme: 'dark',
        variables: {
          colorPrimary: "#1e3a8a",
          colorBackground: "#0c1b36",
          colorInputBackground: "#0f2b5a",
          colorInputText: "white",
          colorTextOnPrimaryBackground: "white",
          borderRadius: "0.375rem"
        },
        elements: {
          card: "bg-[#0c1b36] border border-[#1e3a8a]",
          headerTitle: "text-white",
          headerSubtitle: "text-white",
          socialButtonsBlockButton: "bg-[#0f2b5a] hover:bg-[#0a1f3f] text-white",
          formButtonPrimary: "bg-[#0f2b5a] hover:bg-[#0a1f3f] text-white",
          footerActionLink: "text-blue-400 hover:text-blue-500",
          formFieldInput: "bg-[#0f2b5a] border-[#1e3a8a] text-white",
          dividerLine: "bg-[#1e3a8a]",
          formFieldLabel: "text-white",
          identityPreviewText: "text-white",
          identityPreviewEditButton: "text-blue-400 hover:text-blue-500",
          userButtonPopoverCard: "bg-[#0c1b36] border-[#1e3a8a]",
          userButtonPopoverActionButton: "hover:bg-[#0f2b5a] text-white",
          userButtonPopoverActionButtonText: "text-white",
          userButtonPopoverActionButtonIcon: "text-white",
          userPreviewMainIdentifier: "text-white",
          userPreviewSecondaryIdentifier: "text-white",
          navbar: "bg-[#0c1b36]",
          page: "bg-[#0c1b36]"
        }
      }}
    >
      <html lang="en" suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable} blue-theme`}>
        <body className="font-sans bg-dashboard-dark min-h-screen">
          <ThemeProvider defaultTheme="blue-theme" enableSystem={false}>
            <SubscriptionProvider>
              <SettingsProvider>
                <PointsProvider>
                  {children}
                  <Toaster />
                </PointsProvider>
              </SettingsProvider>
            </SubscriptionProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}

