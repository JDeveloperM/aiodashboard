"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BookOpen,
  Play,
  Clock,
  Users,
  Star,
  CheckCircle,
  Lock,
  TrendingUp,
  Coins,
  Palette,
  Droplets,
  GraduationCap,
  X
} from "lucide-react"
import { useSubscription } from "@/contexts/subscription-context"

interface Lesson {
  id: string
  title: string
  description: string
  duration: string
  videoUrl: string
  isCompleted: boolean
}

interface Course {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  duration: string
  lessons: Lesson[]
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  progress: number
  isLocked: boolean
  requiredTier?: 'PRO' | 'ROYAL'
  students: number
  rating: number
}

const courses: Course[] = [
  {
    id: "cex-basics",
    title: "CEX Basics",
    description: "Learn the fundamentals of centralized exchanges, how to trade safely, and understand market mechanics.",
    icon: <TrendingUp className="w-6 h-6 text-[#4DA2FF]" />,
    duration: "2h 30m",
    lessons: [
      {
        id: "cex-1",
        title: "Introduction to Centralized Exchanges",
        description: "Understanding what CEX platforms are and how they work",
        duration: "8 min",
        videoUrl: "https://vimeo.com/example-cex-1",
        isCompleted: false
      },
      {
        id: "cex-2",
        title: "Account Setup and Security",
        description: "How to create accounts and secure them properly",
        duration: "12 min",
        videoUrl: "https://vimeo.com/example-cex-2",
        isCompleted: false
      },
      {
        id: "cex-3",
        title: "Understanding Order Types",
        description: "Market orders, limit orders, and stop-loss explained",
        duration: "15 min",
        videoUrl: "https://vimeo.com/example-cex-3",
        isCompleted: false
      },
      {
        id: "cex-4",
        title: "Reading Charts and Indicators",
        description: "Basic technical analysis for beginners",
        duration: "18 min",
        videoUrl: "https://vimeo.com/example-cex-4",
        isCompleted: false
      },
      {
        id: "cex-5",
        title: "Risk Management Basics",
        description: "How to manage risk and protect your capital",
        duration: "14 min",
        videoUrl: "https://vimeo.com/example-cex-5",
        isCompleted: false
      },
      {
        id: "cex-6",
        title: "Fees and Trading Costs",
        description: "Understanding different types of fees on exchanges",
        duration: "10 min",
        videoUrl: "https://vimeo.com/example-cex-6",
        isCompleted: false
      },
      {
        id: "cex-7",
        title: "Withdrawal and Deposits",
        description: "How to safely move funds in and out of exchanges",
        duration: "12 min",
        videoUrl: "https://vimeo.com/example-cex-7",
        isCompleted: false
      },
      {
        id: "cex-8",
        title: "Common Mistakes to Avoid",
        description: "Learn from common trading mistakes and how to avoid them",
        duration: "11 min",
        videoUrl: "https://vimeo.com/example-cex-8",
        isCompleted: false
      }
    ],
    difficulty: "Beginner",
    progress: 0,
    isLocked: false,
    students: 1247,
    rating: 4.8
  },
  {
    id: "dex-basics",
    title: "DEX Basics",
    description: "Understand decentralized exchanges, liquidity pools, and how to trade on platforms like Uniswap and SushiSwap.",
    icon: <Droplets className="w-6 h-6 text-[#4DA2FF]" />,
    duration: "3h 15m",
    lessons: [
      {
        id: "dex-1",
        title: "What are Decentralized Exchanges?",
        description: "Introduction to DEX platforms and how they differ from CEX",
        duration: "10 min",
        videoUrl: "https://vimeo.com/example-dex-1",
        isCompleted: false
      },
      {
        id: "dex-2",
        title: "Setting Up a Crypto Wallet",
        description: "How to set up MetaMask and other wallets for DEX trading",
        duration: "15 min",
        videoUrl: "https://vimeo.com/example-dex-2",
        isCompleted: false
      },
      {
        id: "dex-3",
        title: "Understanding Liquidity Pools",
        description: "How liquidity pools work and their importance in DEX",
        duration: "18 min",
        videoUrl: "https://vimeo.com/example-dex-3",
        isCompleted: false
      },
      {
        id: "dex-4",
        title: "Making Your First DEX Trade",
        description: "Step-by-step guide to trading on Uniswap",
        duration: "20 min",
        videoUrl: "https://vimeo.com/example-dex-4",
        isCompleted: false
      },
      {
        id: "dex-5",
        title: "Understanding Slippage and MEV",
        description: "What is slippage and how to protect against MEV attacks",
        duration: "16 min",
        videoUrl: "https://vimeo.com/example-dex-5",
        isCompleted: false
      },
      {
        id: "dex-6",
        title: "Gas Fees and Optimization",
        description: "Understanding gas fees and how to optimize transactions",
        duration: "14 min",
        videoUrl: "https://vimeo.com/example-dex-6",
        isCompleted: false
      }
    ],
    difficulty: "Intermediate",
    progress: 0,
    isLocked: false,
    students: 892,
    rating: 4.7
  },
  {
    id: "defi-basics",
    title: "DeFi Basics",
    description: "Explore decentralized finance protocols, yield farming, lending, and borrowing in the DeFi ecosystem.",
    icon: <Coins className="w-6 h-6 text-[#4DA2FF]" />,
    duration: "4h 45m",
    lessons: [
      {
        id: "defi-1",
        title: "Introduction to DeFi",
        description: "What is decentralized finance and how it works",
        duration: "12 min",
        videoUrl: "https://vimeo.com/example-defi-1",
        isCompleted: false
      },
      {
        id: "defi-2",
        title: "Lending and Borrowing Protocols",
        description: "Understanding Aave, Compound, and other lending platforms",
        duration: "20 min",
        videoUrl: "https://vimeo.com/example-defi-2",
        isCompleted: false
      },
      {
        id: "defi-3",
        title: "Yield Farming Basics",
        description: "How to earn yield through farming strategies",
        duration: "18 min",
        videoUrl: "https://vimeo.com/example-defi-3",
        isCompleted: false
      },
      {
        id: "defi-4",
        title: "Liquidity Mining",
        description: "Providing liquidity and earning rewards",
        duration: "22 min",
        videoUrl: "https://vimeo.com/example-defi-4",
        isCompleted: false
      },
      {
        id: "defi-5",
        title: "Impermanent Loss Explained",
        description: "Understanding and mitigating impermanent loss",
        duration: "16 min",
        videoUrl: "https://vimeo.com/example-defi-5",
        isCompleted: false
      }
    ],
    difficulty: "Intermediate",
    progress: 0,
    isLocked: true,
    requiredTier: "PRO",
    students: 634,
    rating: 4.9
  },
  {
    id: "nft-basics",
    title: "NFT Basics",
    description: "Learn about non-fungible tokens, how to mint, buy, sell, and understand the NFT marketplace ecosystem.",
    icon: <Palette className="w-6 h-6 text-purple-400" />,
    duration: "2h 45m",
    lessons: [
      {
        id: "nft-1",
        title: "What are NFTs?",
        description: "Introduction to non-fungible tokens and their use cases",
        duration: "10 min",
        videoUrl: "https://vimeo.com/example-nft-1",
        isCompleted: false
      },
      {
        id: "nft-2",
        title: "NFT Marketplaces",
        description: "Overview of OpenSea, Blur, and other NFT platforms",
        duration: "15 min",
        videoUrl: "https://vimeo.com/example-nft-2",
        isCompleted: false
      },
      {
        id: "nft-3",
        title: "Buying Your First NFT",
        description: "Step-by-step guide to purchasing NFTs",
        duration: "18 min",
        videoUrl: "https://vimeo.com/example-nft-3",
        isCompleted: false
      },
      {
        id: "nft-4",
        title: "Creating and Minting NFTs",
        description: "How to create and mint your own NFTs",
        duration: "20 min",
        videoUrl: "https://vimeo.com/example-nft-4",
        isCompleted: false
      },
      {
        id: "nft-5",
        title: "NFT Trading Strategies",
        description: "Advanced strategies for NFT trading and flipping",
        duration: "22 min",
        videoUrl: "https://vimeo.com/example-nft-5",
        isCompleted: false
      }
    ],
    difficulty: "Beginner",
    progress: 0,
    isLocked: false,
    students: 1156,
    rating: 4.6
  },
  {
    id: "liquidity-staking",
    title: "Liquidity & Staking",
    description: "Master advanced concepts of providing liquidity, staking mechanisms, and earning passive income in DeFi.",
    icon: <GraduationCap className="w-6 h-6 text-orange-400" />,
    duration: "5h 20m",
    lessons: [
      {
        id: "staking-1",
        title: "Introduction to Staking",
        description: "Understanding proof-of-stake and staking mechanisms",
        duration: "15 min",
        videoUrl: "https://vimeo.com/example-staking-1",
        isCompleted: false
      },
      {
        id: "staking-2",
        title: "Liquid Staking Protocols",
        description: "Lido, Rocket Pool, and other liquid staking solutions",
        duration: "20 min",
        videoUrl: "https://vimeo.com/example-staking-2",
        isCompleted: false
      },
      {
        id: "staking-3",
        title: "Advanced Liquidity Strategies",
        description: "Complex strategies for maximizing liquidity rewards",
        duration: "25 min",
        videoUrl: "https://vimeo.com/example-staking-3",
        isCompleted: false
      },
      {
        id: "staking-4",
        title: "Risk Management in DeFi",
        description: "Managing risks in advanced DeFi strategies",
        duration: "18 min",
        videoUrl: "https://vimeo.com/example-staking-4",
        isCompleted: false
      }
    ],
    difficulty: "Advanced",
    progress: 0,
    isLocked: true,
    requiredTier: "ROYAL",
    students: 423,
    rating: 4.9
  }
]

export function MetaGoAcademy() {
  const { tier } = useSubscription()
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  const canAccessCourse = (course: Course) => {
    if (!course.isLocked) return true
    if (course.requiredTier === "PRO" && (tier === "PRO" || tier === "ROYAL")) return true
    if (course.requiredTier === "ROYAL" && tier === "ROYAL") return true
    return false
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-[#4DA2FF] text-white'
      case 'Intermediate':
        return 'bg-orange-500 text-white'
      case 'Advanced':
        return 'bg-red-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson)
    setIsVideoPlaying(true)
    // Mark lesson as completed
    lesson.isCompleted = true
  }

  const handleCloseVideo = () => {
    setSelectedLesson(null)
    setIsVideoPlaying(false)
  }

  // Video Player Modal
  if (selectedLesson && isVideoPlaying) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#0f2746' }}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-bold text-white">{selectedLesson.title}</h3>
              <p className="text-[#C0E6FF] text-sm">{selectedLesson.description}</p>
            </div>
            <Button
              onClick={handleCloseVideo}
              variant="outline"
              className="border-[#C0E6FF] text-[#C0E6FF] hover:bg-[#C0E6FF]/10"
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>

          {/* Video Player Placeholder */}
          <div className="aspect-video bg-[#030F1C] rounded-lg flex items-center justify-center mb-4">
            <div className="text-center">
              <Play className="w-16 h-16 text-[#4DA2FF] mx-auto mb-4" />
              <p className="text-[#C0E6FF]">Video Player</p>
              <p className="text-sm text-[#C0E6FF]/70">Vimeo integration would be implemented here</p>
              <p className="text-xs text-[#C0E6FF]/50 mt-2">Video URL: {selectedLesson.videoUrl}</p>
            </div>
          </div>

          {/* Lesson Details */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <div className="enhanced-card">
              <div className="enhanced-card-content p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-[#4DA2FF]" />
                  <span className="text-[#C0E6FF] text-sm">Duration</span>
                </div>
                <p className="text-white font-semibold">{selectedLesson.duration}</p>
              </div>
            </div>

            <div className="enhanced-card">
              <div className="enhanced-card-content p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-[#C0E6FF] text-sm">Status</span>
                </div>
                <p className="text-green-400 font-semibold">
                  {selectedLesson.isCompleted ? 'Completed' : 'In Progress'}
                </p>
              </div>
            </div>

            <div className="enhanced-card">
              <div className="enhanced-card-content p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-[#4DA2FF]" />
                  <span className="text-[#C0E6FF] text-sm">Course</span>
                </div>
                <p className="text-white font-semibold">{selectedCourse?.title}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (selectedCourse) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setSelectedCourse(null)}
            variant="outline"
            size="sm"
            className="border-[#C0E6FF] text-[#C0E6FF]"
          >
            ← Back to Courses
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-[#FFFFFF]">{selectedCourse.title}</h2>
            <p className="text-[#C0E6FF]">Course Overview</p>
          </div>
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="enhanced-card">
              <div className="enhanced-card-content">
                <div className="flex items-center gap-2 text-white mb-4">
                  <BookOpen className="w-5 h-5 text-[#4DA2FF]" />
                  <h3 className="font-semibold">Course Content</h3>
                </div>
                <div>
                <div className="space-y-4">
                  {selectedCourse.lessons.map((lesson, i) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors duration-200"
                      style={{ backgroundColor: '#0f2746' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0f2746cc'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0f2746'}
                      onClick={() => handleLessonClick(lesson)}
                    >
                      <div className="w-8 h-8 bg-[#4DA2FF]/20 rounded-full flex items-center justify-center">
                        {lesson.isCompleted ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Play className="w-4 h-4 text-[#4DA2FF]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-[#FFFFFF] font-medium">{lesson.title}</h4>
                        <p className="text-[#C0E6FF] text-sm">{lesson.description}</p>
                      </div>
                      <div className="text-[#C0E6FF] text-sm">{lesson.duration}</div>
                    </div>
                  ))}
                </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="enhanced-card">
              <div className="enhanced-card-content">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#4DA2FF]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      {selectedCourse.icon}
                    </div>
                    <h3 className="text-[#FFFFFF] font-bold">{selectedCourse.title}</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[#C0E6FF] text-sm">Duration</span>
                      <span className="text-[#FFFFFF] text-sm">{selectedCourse.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#C0E6FF] text-sm">Lessons</span>
                      <span className="text-[#FFFFFF] text-sm">{selectedCourse.lessons.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#C0E6FF] text-sm">Students</span>
                      <span className="text-[#FFFFFF] text-sm">{selectedCourse.students.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#C0E6FF] text-sm">Rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-[#FFFFFF] text-sm">{selectedCourse.rating}</span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-[#FFFFFF]">
                    <Play className="w-4 h-4 mr-2" />
                    Start Course
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => {
          const hasAccess = canAccessCourse(course)

          return (
            <div
              key={course.id}
              className={`enhanced-card transition-all duration-300 ${
                hasAccess ? 'hover:border-[#4DA2FF]/50 cursor-pointer' : 'opacity-60'
              }`}
              onClick={() => hasAccess && setSelectedCourse(course)}
            >
              <div className="enhanced-card-content">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#030F1C] rounded-xl">
                      {course.icon}
                    </div>
                    <div>
                      <h3 className="text-white text-lg font-semibold">{course.title}</h3>
                      <Badge className={getDifficultyColor(course.difficulty)}>
                        {course.difficulty}
                      </Badge>
                    </div>
                  </div>
                  {!hasAccess && (
                    <Lock className="w-5 h-5 text-[#C0E6FF]" />
                  )}
                </div>
                <div className="space-y-4">
                <p className="text-[#C0E6FF] text-sm leading-relaxed">
                  {course.description}
                </p>

                <div className="grid gap-2 grid-cols-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#C0E6FF]" />
                    <span className="text-[#C0E6FF]">{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#C0E6FF]" />
                    <span className="text-[#C0E6FF]">{course.lessons.length} lessons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#C0E6FF]" />
                    <span className="text-[#C0E6FF]">{course.students.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-[#C0E6FF]">{course.rating}</span>
                  </div>
                </div>

                {course.progress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#C0E6FF]">Progress</span>
                      <span className="text-[#FFFFFF]">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                )}

                {!hasAccess && course.requiredTier && (
                  <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/30">
                    <p className="text-sm text-orange-400 text-center">
                      Requires {course.requiredTier} NFT
                    </p>
                  </div>
                )}

                <div className="pt-2">
                  {hasAccess ? (
                    <Button className="w-full bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-[#FFFFFF]">
                      {course.progress > 0 ? (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Continue
                        </>
                      ) : (
                        <>
                          <BookOpen className="w-4 h-4 mr-2" />
                          Start Course
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full border-[#C0E6FF] text-[#C0E6FF]"
                      disabled
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Locked
                    </Button>
                  )}
                </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Learning Path */}
      <div className="enhanced-card">
        <div className="enhanced-card-content">
          <div className="flex items-center gap-2 text-white mb-6 justify-center">
            <GraduationCap className="w-6 h-6 text-[#4DA2FF]" />
            <h3 className="text-xl font-semibold">Recommended Learning Path</h3>
          </div>
          <div>
          <div className="flex items-center justify-center space-x-4 overflow-x-auto pb-4">
            {['CEX Basics', 'NFT Basics', 'DEX Basics', 'DeFi Basics', 'Liquidity & Staking'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className="text-center space-y-2 min-w-[120px]">
                  <div className="w-10 h-10 bg-[#4DA2FF]/20 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-[#4DA2FF] font-bold">{index + 1}</span>
                  </div>
                  <p className="text-[#C0E6FF] text-sm">{step}</p>
                </div>
                {index < 4 && (
                  <div className="w-8 h-0.5 bg-[#C0E6FF]/30 mx-2"></div>
                )}
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
