"use client"

import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"
import { useUser } from "@clerk/nextjs"
import { useEffect } from "react"
import { redirect } from "next/navigation"
import { usePathname } from "next/navigation"
import Squares from "@/components/ui/squares"
import WaterDrops from "@/components/ui/water-drops"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoaded, isSignedIn } = useUser()
  const pathname = usePathname()

  // Check if we're on the dashboard page
  const isDashboardPage = pathname === '/dashboard'

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      redirect("/")
    }
  }, [isLoaded, isSignedIn])

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative" style={{ backgroundColor: '#0f172a' }}>
      {/* Background - Dark blue gradient matching the image */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a8a] via-[#0f172a] to-[#1e40af] opacity-50"></div>
        {isDashboardPage ? (
          <WaterDrops
            speed={0.8}
            dropSize={12}
            direction="random"
            dropColor="rgba(30, 58, 138, 0.15)"
            hoverRippleColor="rgba(30, 58, 138, 0.3)"
            className="opacity-40"
            numDrops={35}
          />
        ) : (
          <Squares
            speed={0.1}
            squareSize={40}
            direction="down"
            borderColor="rgba(30, 58, 138, 0.1)"
            hoverFillColor="rgba(30, 58, 138, 0.05)"
            className="opacity-30"
          />
        )}
      </div>

      <Sidebar />
      <div className="flex-1 flex flex-col w-full relative z-10">
        <TopNav />
        <div className="flex-1 p-4 md:p-6 w-full max-w-full overflow-x-hidden">
          <main className="w-full">{children}</main>
        </div>
      </div>
    </div>
  )
}
