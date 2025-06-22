"use client"

import { useState, useEffect, memo } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSubscription } from "@/contexts/subscription-context"
import { LayoutDashboard, TrendingUp, BarChart, ChevronLeft, Menu, X, LineChart, Bot, Users, BookOpen, Dice6, Rocket, HelpCircle, Globe } from "lucide-react"

export const SidebarTest = memo(function SidebarTest() {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { canAccessCryptoBots, canAccessForexBots, tier } = useSubscription()

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  const navigation = [
    { name: "AIO Dashboard", href: "/aio-dashboard", icon: LayoutDashboard },
    { name: "Copy Trading", href: "/copy-trading", icon: Bot },
    { name: "AIO Connect", href: "/community", icon: Globe },
    { name: "AIO Creators", href: "/aio-creators", icon: Users },
    { name: "RaffleCraft", href: "/dapps/rafflecraft", icon: Dice6 },
    { name: "DEWhale Launchpad", href: "/dapps/dewhale-launchpad", icon: Rocket },
    { name: "MetaGo Academy", href: "/metago-academy", icon: BookOpen },
  ]

  const bottomNavigation = [
    { name: "FAQs", href: "/faqs", icon: HelpCircle },
  ]

  const NavItem = ({ item }: { item: any }) => {
    const isActive = pathname === item.href

    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center rounded-md px-3 py-2 text-sm font-medium nav-item-hover",
          isActive ? "nav-item-active" : "text-white",
          isCollapsed && !isMobileOpen && "justify-center px-2"
        )}
        title={isCollapsed && !isMobileOpen ? item.name : undefined}
      >
        <item.icon className={cn("h-5 w-5", (!isCollapsed || isMobileOpen) && "mr-3")} />
        {(!isCollapsed || isMobileOpen) && <span>{item.name}</span>}
      </Link>
    )
  }

  return (
    <>
      <button
        id="mobile-toggle"
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-background rounded-md shadow-md"
        onClick={() => setIsMobileOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-10" onClick={() => setIsMobileOpen(false)} />
      )}

      <div
        id="sidebar-test"
        className={cn(
          "fixed inset-y-0 z-20 flex flex-col transition-all duration-300 ease-in-out lg:sticky lg:top-0 h-screen sidebar-gradient",
          isCollapsed ? "w-[72px]" : "lg:w-64",
          isMobileOpen ? "w-full translate-x-0" : "w-full -translate-x-full lg:translate-x-0",
          !isMobileOpen && !isCollapsed && "lg:w-64",
          !isMobileOpen && isCollapsed && "lg:w-[72px]",
        )}
      >
        <div className="border-b">
          <div className={cn("flex h-16 items-center gap-2 px-4", isCollapsed && !isMobileOpen && "justify-center px-2")}>
            {(!isCollapsed || isMobileOpen) && (
              <Link href="/" className="flex items-center font-semibold lg:ml-0 ml-12">
                <img
                  src="/images/aionet-logo.png"
                  alt="AIONET"
                  className="h-8 w-auto"
                />
              </Link>
            )}

            {/* Desktop collapse button */}
            <Button
              variant="ghost"
              size="sm"
              className={cn("ml-auto h-8 w-8 hidden lg:flex", isCollapsed && "ml-0")}
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
              <span className="sr-only">{isCollapsed ? "Expand" : "Collapse"} Sidebar</span>
            </Button>

            {/* Mobile close button */}
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-8 w-8 lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close Sidebar</span>
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto scrollbar-thin">
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </nav>
        </div>

        {/* Bottom navigation items */}
        <div className="px-2 pb-2">
          <div className={cn("my-2 border-t border-border", isCollapsed && "mx-2")}></div>
          {bottomNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium nav-item-hover mb-1",
                pathname === item.href ? "nav-item-active" : "text-white",
                isCollapsed && !isMobileOpen && "justify-center px-2"
              )}
              title={isCollapsed && !isMobileOpen ? item.name : undefined}
            >
              <item.icon className={cn("h-5 w-5", (!isCollapsed || isMobileOpen) && "mr-3")} />
              {(!isCollapsed || isMobileOpen) && <span>{item.name}</span>}
            </Link>
          ))}
        </div>

        {/* Simple upgrade CTA */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="p-4 mx-2 mb-4 bg-[#0c1b36]/80 backdrop-blur-sm rounded-lg border border-blue-500/20">
            <h3 className="font-medium text-white mb-1">TEST SIDEBAR + SUBSCRIPTION</h3>
            <p className="text-xs text-gray-300 mb-3">Tier: {tier} | Crypto: {canAccessCryptoBots ? 'Yes' : 'No'}</p>
            <Button
              className="w-full bg-[#4da2ff] hover:bg-[#3d8ae6] text-white shadow-lg transition-all duration-200"
              onClick={() => router.push('/dashboard/subscriptions')}
            >
              Upgrade
            </Button>
          </div>
        )}
      </div>
    </>
  )
})
