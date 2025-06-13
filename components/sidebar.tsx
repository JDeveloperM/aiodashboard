"use client"

import { useState, useEffect, MouseEvent } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSubscription } from "@/contexts/subscription-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { LayoutDashboard, TrendingUp, BarChart, ChevronLeft, Lock, Menu, X, LineChart, ArrowUpRight, Crown, ArrowRight, Bot, Users, BookOpen, ChevronDown, ChevronRight, Dice6, Rocket, Share2, HelpCircle, Globe, Settings } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [copyTradingExpanded, setCopyTradingExpanded] = useState(false)
  const { canAccessCryptoBots, canAccessForexBots, tier } = useSubscription()

  // Creator Controls access (PRO and ROYAL only)
  const canAccessCreatorControls = tier === "PRO" || tier === "ROYAL"

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      const sidebar = document.getElementById("sidebar")
      const mobileToggle = document.getElementById("mobile-toggle")

      if (
        isMobileOpen &&
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        mobileToggle &&
        !mobileToggle.contains(event.target as Node)
      ) {
        setIsMobileOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isMobileOpen])

  const navigation = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard, restricted: false },
    {
      name: "Copy Trading",
      href: "/copy-trading",
      icon: Bot,
      restricted: false,
      hasDropdown: true,
      subItems: [
        { name: "Overview", href: "/copy-trading", icon: Bot },
        { name: "Crypto Bots", href: "/crypto-bots", icon: TrendingUp, restricted: !canAccessCryptoBots },
        { name: "Stock Bots", href: "/stock-bots", icon: LineChart, restricted: !canAccessForexBots },
        { name: "Forex Bots", href: "/forex-bots", icon: BarChart, restricted: !canAccessForexBots },
      ]
    },
    { name: "AIO Connect", href: "/community", icon: Globe, restricted: false },
    { name: "AIO Creators", href: "/aio-creators", icon: Users, restricted: false },
    { name: "Creator Controls", href: "/creator-controls", icon: Settings, restricted: !canAccessCreatorControls },
    { name: "RaffleCraft", href: "/dapps/rafflecraft", icon: Dice6, restricted: false },
    { name: "DEWhale Launchpad", href: "/dapps/dewhale-launchpad", icon: Rocket, restricted: false },
    { name: "MetaGo Academy", href: "/metago-academy", icon: BookOpen, restricted: false },
  ]

  const bottomNavigation = [
    { name: "FAQs", href: "/faqs", icon: HelpCircle, restricted: false },
  ]

  interface NavItemType {
    name: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    restricted?: boolean
    hasDropdown?: boolean
    subItems?: Array<{
      name: string
      href: string
      icon: React.ComponentType<{ className?: string }>
      restricted?: boolean
    }>
  }

  const NavItem = ({ item }: { item: NavItemType }) => {
    const isActive = item.hasDropdown
      ? item.subItems?.some(subItem => pathname === subItem.href) || pathname === item.href
      : pathname === item.href

    const isExpanded = (item.name === "Copy Trading" && copyTradingExpanded)

    if (item.hasDropdown && (!isCollapsed || isMobileOpen)) {
      return (
        <div>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  if (item.name === "Copy Trading") {
                    setCopyTradingExpanded(!copyTradingExpanded)
                  }
                }}
                className={cn(
                  "flex items-center w-full rounded-md px-3 py-2 text-sm font-medium nav-item-hover",
                  isActive
                    ? "nav-item-active"
                    : "text-white",
                  item.restricted && "opacity-50 cursor-not-allowed",
                )}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span className="flex-1 text-left">{item.name}</span>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                {item.restricted && <Lock className="w-4 h-4 text-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />}
              </button>
            </TooltipTrigger>
          </Tooltip>

          {isExpanded && (
            <div className="ml-6 mt-1 space-y-1">
              {item.subItems?.map((subItem) => (
                <Link
                  key={subItem.name}
                  href={subItem.restricted ? "#" : subItem.href}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium nav-item-hover",
                    pathname === subItem.href
                      ? "nav-item-active"
                      : "text-white",
                    subItem.restricted && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={(e) => {
                    if (subItem.restricted) {
                      e.preventDefault()
                    }
                  }}
                >
                  <subItem.icon className="h-4 w-4 mr-3" />
                  <span>{subItem.name}</span>
                  {subItem.restricted && <Lock className="w-3 h-3 text-red-500 ml-auto" />}
                </Link>
              ))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link
            href={item.restricted ? "#" : item.href}
            className={cn(
              "flex items-center rounded-md px-3 py-2 text-sm font-medium nav-item-hover",
              isActive
                ? "nav-item-active"
                : "text-white",
              isCollapsed && !isMobileOpen && "justify-center px-2",
              item.restricted && "opacity-50 cursor-not-allowed",
            )}
            onClick={(e) => {
              if (item.restricted) {
                e.preventDefault()
              }
            }}
          >
            <item.icon className={cn("h-5 w-5", (!isCollapsed || isMobileOpen) && "mr-3")} />
            {(!isCollapsed || isMobileOpen) && <span>{item.name}</span>}
            {(!isCollapsed || isMobileOpen) && item.restricted && <Lock className="w-4 h-4 text-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />}
          </Link>
        </TooltipTrigger>
        {isCollapsed && !isMobileOpen && (
          <TooltipContent side="right" className="flex items-center gap-4">
            {item.name} {item.restricted && "(Upgrade required)"}
          </TooltipContent>
        )}
      </Tooltip>
    )
  }

  function handleUpgrade(event: MouseEvent<HTMLButtonElement>): void {
    router.push('/dashboard/subscriptions')
  }

  return (
    <TooltipProvider>
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
          id="sidebar"
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
                  <span className="text-lg text-white">AIONET</span>
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
              <Tooltip key={item.name} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm font-medium nav-item-hover mb-1",
                      pathname === item.href
                        ? "nav-item-active"
                        : "text-white",
                      isCollapsed && !isMobileOpen && "justify-center px-2"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", (!isCollapsed || isMobileOpen) && "mr-3")} />
                    {(!isCollapsed || isMobileOpen) && <span>{item.name}</span>}
                  </Link>
                </TooltipTrigger>
                {isCollapsed && !isMobileOpen && (
                  <TooltipContent side="right">
                    {item.name}
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </div>



          {/* Upgrade CTA */}
          {(!isCollapsed || isMobileOpen) && (
            <div className="p-4 mx-2 mb-4 bg-[#0c1b36]/80 backdrop-blur-sm rounded-lg border border-blue-500/20">
              <h3 className="font-medium text-white mb-1">Upgrade Your Plan</h3>
              <p className="text-xs text-gray-300 mb-3">Get access to all features and premium bots</p>
              <Button
    className="w-full bg-[#4da2ff] hover:bg-[#3d8ae6] text-white shadow-lg transition-all duration-200"
    onClick={() => router.push('/dashboard/subscriptions')}
  >
    <TrendingUp className="w-4 h-4 animate-pulse" />
    Upgrade
  </Button>
            </div>
          )}
          {isCollapsed && !isMobileOpen && (
            <div className="p-2 m-2 mb-4 bg-[#0c1b36]/80 backdrop-blur-sm rounded-lg border border-blue-500/20 flex justify-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    size="icon"
                    onClick={() => router.push('/dashboard/subscriptions')}
                  >
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Upgrade now
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </>
    </TooltipProvider>
  )
}
