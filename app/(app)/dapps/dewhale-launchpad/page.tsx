"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Rocket,
  TrendingUp,
  Users,
  Clock,
  Zap,
  ArrowRight,
  ExternalLink,
  Wallet,
  DollarSign,
  Star,
  Shield,
  Target,
  Globe,
  Award,
  CheckCircle,
  Calendar,
  BarChart3,
  Coins,
  Crown
} from "lucide-react"

interface LaunchpadProject {
  id: string
  name: string
  symbol: string
  description: string
  category: string
  totalRaise: string
  pricePerToken: string
  tokensForSale: string
  startDate: string
  endDate: string
  status: 'upcoming' | 'live' | 'ended' | 'successful'
  progress: number
  participants: number
  minAllocation: string
  maxAllocation: string
  vesting: string
  logo: string
  website: string
  whitepaper: string
  tier: 'public' | 'pro' | 'royal'
}

const launchpadProjects: LaunchpadProject[] = [
  {
    id: "1",
    name: "SuiSwap Protocol",
    symbol: "SSWAP",
    description: "Next-generation DEX built on Sui with advanced AMM features and yield farming",
    category: "DeFi",
    totalRaise: "$2.5M",
    pricePerToken: "$0.05",
    tokensForSale: "50,000,000",
    startDate: "2024-02-15",
    endDate: "2024-02-22",
    status: "live",
    progress: 75,
    participants: 1247,
    minAllocation: "100 SUI",
    maxAllocation: "5,000 SUI",
    vesting: "20% TGE, 80% over 12 months",
    logo: "/api/placeholder/80/80",
    website: "https://suiswap.io",
    whitepaper: "https://docs.suiswap.io",
    tier: "public"
  },
  {
    id: "2",
    name: "MetaVerse Sui",
    symbol: "MVSUI",
    description: "Immersive metaverse platform powered by Sui blockchain technology",
    category: "Gaming",
    totalRaise: "$5.0M",
    pricePerToken: "$0.12",
    tokensForSale: "41,666,667",
    startDate: "2024-03-01",
    endDate: "2024-03-08",
    status: "upcoming",
    progress: 0,
    participants: 0,
    minAllocation: "500 SUI",
    maxAllocation: "10,000 SUI",
    vesting: "10% TGE, 90% over 18 months",
    logo: "/api/placeholder/80/80",
    website: "https://metaversesui.com",
    whitepaper: "https://docs.metaversesui.com",
    tier: "pro"
  },
  {
    id: "3",
    name: "SuiChain AI",
    symbol: "SCAI",
    description: "AI-powered blockchain infrastructure for next-gen dApps on Sui",
    category: "AI/Infrastructure",
    totalRaise: "$10.0M",
    pricePerToken: "$0.25",
    tokensForSale: "40,000,000",
    startDate: "2024-03-15",
    endDate: "2024-03-22",
    status: "upcoming",
    progress: 0,
    participants: 0,
    minAllocation: "1,000 SUI",
    maxAllocation: "25,000 SUI",
    vesting: "5% TGE, 95% over 24 months",
    logo: "/api/placeholder/80/80",
    website: "https://suichain.ai",
    whitepaper: "https://docs.suichain.ai",
    tier: "royal"
  }
]

export default function DEWhaleLaunchpadPage() {
  const [selectedProject, setSelectedProject] = useState<LaunchpadProject | null>(null)
  const [investAmount, setInvestAmount] = useState("")

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-green-500 text-white'
      case 'upcoming':
        return 'bg-blue-500 text-white'
      case 'ended':
        return 'bg-gray-500 text-white'
      case 'successful':
        return 'bg-purple-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'public':
        return 'bg-gray-500 text-white'
      case 'pro':
        return 'bg-[#4DA2FF] text-white'
      case 'royal':
        return 'bg-yellow-500 text-black'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'royal':
        return <Crown className="w-3 h-3" />
      case 'pro':
        return <Star className="w-3 h-3" />
      default:
        return <Users className="w-3 h-3" />
    }
  }

  const totalRaised = launchpadProjects.reduce((acc, project) => {
    const value = parseFloat(project.totalRaise.replace(/[$M,]/g, '')) * 1000000
    return acc + (value * project.progress / 100)
  }, 0)

  const liveProjects = launchpadProjects.filter(p => p.status === 'live').length
  const totalParticipants = launchpadProjects.reduce((acc, project) => acc + project.participants, 0)

  return (
    <>
      <style jsx>{`
        .ripple-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          filter: blur(0.5px);
        }

        .ripple {
          position: absolute;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle,
            rgba(77, 162, 255, 0.3) 0%,
            rgba(77, 162, 255, 0.15) 30%,
            rgba(77, 162, 255, 0.08) 60%,
            transparent 100%);
          border-radius: 50%;
          animation: fluid-ripple 6s infinite ease-out;
          filter: blur(2px);
        }

        .ripple-1 {
          animation-delay: 0s;
          filter: blur(1.5px);
        }

        .ripple-2 {
          animation-delay: 1.2s;
          filter: blur(2.5px);
        }

        .ripple-3 {
          animation-delay: 2.4s;
          filter: blur(1.8px);
        }

        .ripple-4 {
          animation-delay: 3.6s;
          filter: blur(2.2px);
        }

        .ripple-5 {
          animation-delay: 4.8s;
          filter: blur(1.6px);
        }

        .ripple-6 {
          animation-delay: 0.6s;
          filter: blur(2.8px);
        }

        @keyframes fluid-ripple {
          0% {
            width: 15px;
            height: 15px;
            opacity: 0;
            transform: translate(-50%, -50%) scale(0);
          }
          5% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(0.1);
          }
          15% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(0.3);
          }
          40% {
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(0.7);
          }
          70% {
            opacity: 0.3;
            transform: translate(-50%, -50%) scale(1.2);
          }
          100% {
            width: 200px;
            height: 200px;
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.5);
          }
        }

        @media (min-width: 768px) {
          @keyframes fluid-ripple {
            0% {
              width: 20px;
              height: 20px;
              opacity: 0;
              transform: translate(-50%, -50%) scale(0);
            }
            5% {
              opacity: 0.8;
              transform: translate(-50%, -50%) scale(0.1);
            }
            15% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(0.3);
            }
            40% {
              opacity: 0.6;
              transform: translate(-50%, -50%) scale(0.7);
            }
            70% {
              opacity: 0.3;
              transform: translate(-50%, -50%) scale(1.2);
            }
            100% {
              width: 300px;
              height: 300px;
              opacity: 0;
              transform: translate(-50%, -50%) scale(1.5);
            }
          }
        }

        /* Additional fluid layers for more realistic effect */
        .ripple::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          background: radial-gradient(circle,
            rgba(192, 230, 255, 0.2) 0%,
            rgba(192, 230, 255, 0.08) 40%,
            transparent 70%);
          border-radius: 50%;
          animation: inner-wave 6s infinite ease-out;
          filter: blur(1.5px);
        }

        @keyframes inner-wave {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
          }
          10% {
            transform: translate(-50%, -50%) scale(0.2);
            opacity: 0.5;
          }
          30% {
            transform: translate(-50%, -50%) scale(0.6);
            opacity: 0.4;
          }
          60% {
            transform: translate(-50%, -50%) scale(1.0);
            opacity: 0.2;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.4);
            opacity: 0;
          }
        }
      `}</style>

      <div className="space-y-6 p-6">
      {/* Hero Section */}
      <div className="dashboard-card p-8 text-center relative overflow-hidden">
        {/* Ripple Effect Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="ripple-container">
            <div className="ripple ripple-1" style={{top: '20%', left: '15%'}}></div>
            <div className="ripple ripple-2" style={{top: '70%', left: '80%'}}></div>
            <div className="ripple ripple-3" style={{top: '40%', left: '60%'}}></div>
            <div className="ripple ripple-4" style={{top: '80%', left: '25%'}}></div>
            <div className="ripple ripple-5" style={{top: '15%', left: '75%'}}></div>
            <div className="ripple ripple-6" style={{top: '60%', left: '10%'}}></div>
          </div>
        </div>

        {/* Coming Soon Content */}
        <div className="bg-gradient-to-r from-[#4DA2FF]/10 to-purple-500/10 border border-[#4DA2FF]/20 rounded-lg p-6 relative z-10 text-center">
          {/* DEWhale Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/images/dewhale.png"
              alt="DEWhale Launchpad"
              width={96}
              height={96}
              className="w-24 h-24"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">DEWhale Launchpad</h1>
          <p className="text-xl text-[#C0E6FF] mb-6 max-w-3xl mx-auto">
            The premier launchpad for innovative projects on Sui Network. Discover, invest, and be part of the next generation of blockchain innovation.
          </p>
          <h3 className="text-xl font-bold text-white mb-2">Coming Q4 2024</h3>
          <p className="text-[#C0E6FF] mb-4">
            DEWhale Launchpad is our flagship DApp for the Sui ecosystem. Be among the first to discover groundbreaking projects.
          </p>
          <div className="flex gap-3 justify-center">
            <Button className="bg-[#4da2ff] hover:bg-[#3d8ae6] text-white transition-colors duration-200">
              <Star className="w-4 h-4 mr-2" />
              Join Waitlist
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center gap-2 text-white mb-4">
              <DollarSign className="w-5 h-5 text-green-400" />
              <h3 className="font-semibold">Total Raised</h3>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-white">${(totalRaised / 1000000).toFixed(1)}M</p>
              <div className="flex items-center">
                <TrendingUp className="h-3 w-3 text-green-400 mr-1" />
                <span className="text-green-400 text-xs font-medium">+45.2%</span>
                <span className="text-[#C0E6FF] text-xs ml-2">this month</span>
              </div>
            </div>
          </div>
        </div>

        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center gap-2 text-white mb-4">
              <Rocket className="w-5 h-5 text-[#4DA2FF]" />
              <h3 className="font-semibold">Live Projects</h3>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-white">{liveProjects}</p>
              <div className="flex items-center">
                <TrendingUp className="h-3 w-3 text-green-400 mr-1" />
                <span className="text-green-400 text-xs font-medium">+12.5%</span>
                <span className="text-[#C0E6FF] text-xs ml-2">this week</span>
              </div>
            </div>
          </div>
        </div>

        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center gap-2 text-white mb-4">
              <Users className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold">Total Investors</h3>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-white">{totalParticipants.toLocaleString()}</p>
              <div className="flex items-center">
                <TrendingUp className="h-3 w-3 text-green-400 mr-1" />
                <span className="text-green-400 text-xs font-medium">+28.5%</span>
                <span className="text-[#C0E6FF] text-xs ml-2">this week</span>
              </div>
            </div>
          </div>
        </div>

        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center gap-2 text-white mb-4">
              <Target className="w-5 h-5 text-yellow-400" />
              <h3 className="font-semibold">Success Rate</h3>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-white">94.7%</p>
              <div className="flex items-center">
                <TrendingUp className="h-3 w-3 text-green-400 mr-1" />
                <span className="text-green-400 text-xs font-medium">+2.3%</span>
                <span className="text-[#C0E6FF] text-xs ml-2">this quarter</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Projects */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-white">Featured Projects</h2>
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {launchpadProjects.map((project) => (
            <div key={project.id} className="enhanced-card overflow-hidden">
              <div className="enhanced-card-content">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#4DA2FF] to-purple-500 rounded-full flex items-center justify-center">
                      <Coins className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white text-lg font-semibold">{project.name}</h3>
                      <p className="text-sm text-[#C0E6FF]">{project.symbol}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                    <Badge className={getTierColor(project.tier)}>
                      {getTierIcon(project.tier)}
                      <span className="ml-1">{project.tier.toUpperCase()}</span>
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                <p className="text-sm text-[#C0E6FF] leading-relaxed">{project.description}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#C0E6FF]">Total Raise</p>
                    <p className="text-lg font-bold text-white">{project.totalRaise}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#C0E6FF]">Token Price</p>
                    <p className="text-lg font-bold text-white">{project.pricePerToken}</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#C0E6FF]">Progress</span>
                    <span className="text-white">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[#C0E6FF]">Participants</p>
                    <p className="font-semibold text-white">{project.participants}</p>
                  </div>
                  <div>
                    <p className="text-[#C0E6FF]">Category</p>
                    <p className="font-semibold text-white">{project.category}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#C0E6FF]">Min/Max Allocation</span>
                    <span className="text-white">{project.minAllocation} - {project.maxAllocation}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#C0E6FF]">Vesting</span>
                    <span className="text-white text-xs">{project.vesting}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-[#4da2ff] hover:bg-[#3d8ae6] text-white transition-colors duration-200"
                    disabled={project.status !== 'live'}
                  >
                    {project.status === 'live' ? 'Invest Now' :
                     project.status === 'upcoming' ? 'Coming Soon' :
                     project.status === 'ended' ? 'Sale Ended' : 'View Details'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button variant="outline" size="sm" className="border-[#C0E6FF] text-[#C0E6FF]">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose DEWhale */}
      <div className="enhanced-card">
        <div className="enhanced-card-content">
          <div className="flex items-center gap-2 text-white mb-6 justify-center">
            <Rocket className="w-6 h-6 text-[#4DA2FF]" />
            <h3 className="text-2xl font-semibold">Why Choose DEWhale Launchpad?</h3>
          </div>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <div className="text-center">
            <div className="bg-[#4DA2FF]/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Shield className="w-8 h-8 text-[#4DA2FF]" />
            </div>
            <h4 className="font-semibold text-white mb-2">Rigorous Vetting</h4>
            <p className="text-sm text-[#C0E6FF]">Every project undergoes thorough due diligence and security audits</p>
          </div>

          <div className="text-center">
            <div className="bg-green-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
            <h4 className="font-semibold text-white mb-2">High Success Rate</h4>
            <p className="text-sm text-[#C0E6FF]">94.7% of launched projects achieve their funding goals</p>
          </div>

          <div className="text-center">
            <div className="bg-purple-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Crown className="w-8 h-8 text-purple-400" />
            </div>
            <h4 className="font-semibold text-white mb-2">Tier-Based Access</h4>
            <p className="text-sm text-[#C0E6FF]">Exclusive allocations for PRO and ROYAL NFT holders</p>
          </div>

          <div className="text-center">
            <div className="bg-yellow-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Zap className="w-8 h-8 text-yellow-400" />
            </div>
            <h4 className="font-semibold text-white mb-2">Sui Native</h4>
            <p className="text-sm text-[#C0E6FF]">Built specifically for the Sui ecosystem with optimal performance</p>
          </div>
        </div>
        </div>
      </div>
    </div>
    </>
  )
}
