"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useRaffleCraft } from "@/hooks/use-rafflecraft"
import { useSuiRaffleTransactions } from "@/lib/services/sui-raffle-service"
import { useSuiAuth } from "@/contexts/sui-auth-context"
import { toast } from "sonner"
import {
  Brain,
  Trophy,
  Users,
  Clock,
  Zap,
  CheckCircle,
  XCircle,
  Wallet,
  DollarSign,
  Gift,
  Star,
  Sparkles,
  Timer,
  Target,
  Play,
  Ticket,
  Calendar,
  Hash,
  Crown,
  HelpCircle,
  Award,
  Coins
} from "lucide-react"

// Quiz Component for displaying questions and handling answers
interface QuizComponentProps {
  question: string
  options: string[]
  selectedAnswer: string
  onAnswerSelect: (answer: string) => void
  onSubmit: () => void
  isSubmitting: boolean
  timeRemaining: number
  difficulty: string
  category: string
  canSubmit: boolean
}

function QuizComponent({
  question,
  options,
  selectedAnswer,
  onAnswerSelect,
  onSubmit,
  isSubmitting,
  timeRemaining,
  difficulty,
  category,
  canSubmit
}: QuizComponentProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'hard': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="enhanced-card">
      <div className="enhanced-card-content">
        <div className="space-y-6">
          {/* Quiz Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">Weekly Quiz Challenge</h3>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className={`${getDifficultyColor(difficulty)} border-current`}>
                {difficulty.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="text-blue-400 border-blue-400">
                {category.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center gap-2 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <Timer className="w-5 h-5 text-orange-400" />
            <span className="text-orange-400 font-mono text-lg">
              Time Remaining: {formatTime(timeRemaining)}
            </span>
          </div>

          {/* Question */}
          <div className="p-6 bg-[#0f2746] rounded-lg border border-purple-400/30">
            <h4 className="text-lg font-medium text-white mb-4">{question}</h4>

            {/* Answer Options */}
            <RadioGroup value={selectedAnswer} onValueChange={onAnswerSelect}>
              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-600/30 hover:border-purple-400/50 transition-colors">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label
                      htmlFor={`option-${index}`}
                      className="text-white cursor-pointer flex-1"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Submit Button */}
          <Button
            onClick={onSubmit}
            disabled={!canSubmit || isSubmitting}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Submitting Answer...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Submit Answer
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Quiz Results Component
interface QuizResultsProps {
  isCorrect: boolean
  correctAnswer: string
  userAnswer: string
  explanation?: string
  pointsEarned: number
  canMintTicket: boolean
  onContinue: () => void
}

function QuizResults({
  isCorrect,
  correctAnswer,
  userAnswer,
  explanation,
  pointsEarned,
  canMintTicket,
  onContinue
}: QuizResultsProps) {
  return (
    <div className="enhanced-card">
      <div className="enhanced-card-content">
        <div className="text-center space-y-6">
          {/* Result Icon */}
          <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center ${
            isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
          }`}>
            {isCorrect ? (
              <CheckCircle className="w-10 h-10 text-green-400" />
            ) : (
              <XCircle className="w-10 h-10 text-red-400" />
            )}
          </div>

          {/* Result Message */}
          <div>
            <h3 className={`text-2xl font-bold mb-2 ${
              isCorrect ? 'text-green-400' : 'text-red-400'
            }`}>
              {isCorrect ? '🎉 Correct!' : '❌ Incorrect'}
            </h3>
            <p className="text-[#C0E6FF]">
              {isCorrect
                ? 'Great job! You can now mint a raffle ticket.'
                : 'Better luck next week! You can try again in the next weekly quiz.'
              }
            </p>
          </div>

          {/* Answer Details */}
          <div className="space-y-4 text-left">
            <div className="p-4 bg-[#0f2746] rounded-lg border border-gray-600/30">
              <p className="text-sm text-gray-400 mb-1">Your Answer:</p>
              <p className={`font-medium ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {userAnswer}
              </p>
            </div>

            {!isCorrect && (
              <div className="p-4 bg-[#0f2746] rounded-lg border border-green-600/30">
                <p className="text-sm text-gray-400 mb-1">Correct Answer:</p>
                <p className="font-medium text-green-400">{correctAnswer}</p>
              </div>
            )}

            {explanation && (
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <p className="text-sm text-blue-400 mb-1">Explanation:</p>
                <p className="text-white text-sm">{explanation}</p>
              </div>
            )}
          </div>

          {/* Points Earned */}
          <div className="flex items-center justify-center gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-semibold">
              +{pointsEarned} XP Earned
            </span>
          </div>

          {/* Continue Button */}
          <Button
            onClick={onContinue}
            className={`w-full py-3 text-lg ${
              canMintTicket
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {canMintTicket ? (
              <>
                <Ticket className="w-5 h-5 mr-2" />
                Continue to Mint Ticket
              </>
            ) : (
              <>
                <Calendar className="w-5 h-5 mr-2" />
                Try Again Next Week
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Ticket Minting Component
interface TicketMintingProps {
  ticketPrice: number
  onMintSuccess: (ticketNumber: number) => void
  isLoading: boolean
}

function TicketMinting({ ticketPrice, onMintSuccess, isLoading }: TicketMintingProps) {
  const { purchaseTicket, getUserBalance, estimateGasFees } = useSuiRaffleTransactions()
  const [userBalance, setUserBalance] = useState(0)
  const [estimatedGas, setEstimatedGas] = useState(0)
  const [isMinting, setIsMinting] = useState(false)

  useEffect(() => {
    const loadBalanceAndFees = async () => {
      const balance = await getUserBalance()
      const gas = await estimateGasFees(ticketPrice)
      setUserBalance(balance)
      setEstimatedGas(gas)
    }
    loadBalanceAndFees()
  }, [getUserBalance, estimateGasFees, ticketPrice])

  const handleMintTicket = async () => {
    setIsMinting(true)
    try {
      const result = await purchaseTicket(ticketPrice)
      if (result.success && result.transactionHash) {
        // Generate ticket number (in real implementation, this would come from blockchain)
        const ticketNumber = Math.floor(Math.random() * 999) + 1
        onMintSuccess(ticketNumber)
        toast.success(`Ticket #${ticketNumber} minted successfully!`)
      } else {
        toast.error(result.error || 'Failed to mint ticket')
      }
    } catch (error) {
      console.error('Error minting ticket:', error)
      toast.error('Failed to mint ticket')
    } finally {
      setIsMinting(false)
    }
  }

  const totalCost = ticketPrice + estimatedGas
  const canAfford = userBalance >= totalCost

  return (
    <div className="enhanced-card">
      <div className="enhanced-card-content">
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <Ticket className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Mint Your Raffle Ticket</h3>
            <p className="text-[#C0E6FF]">You answered correctly! Now mint your ticket to enter the raffle.</p>
          </div>

          {/* Cost Breakdown */}
          <div className="space-y-3 p-4 bg-[#0f2746] rounded-lg border border-blue-400/30">
            <div className="flex justify-between items-center">
              <span className="text-[#C0E6FF]">Ticket Price:</span>
              <span className="text-white font-semibold">{ticketPrice} SUI</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#C0E6FF]">Estimated Gas:</span>
              <span className="text-white font-semibold">{estimatedGas.toFixed(4)} SUI</span>
            </div>
            <div className="border-t border-gray-600 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-white font-semibold">Total Cost:</span>
                <span className="text-white font-bold">{totalCost.toFixed(4)} SUI</span>
              </div>
            </div>
          </div>

          {/* Balance Check */}
          <div className={`p-3 rounded-lg border ${
            canAfford
              ? 'bg-green-500/10 border-green-500/20'
              : 'bg-red-500/10 border-red-500/20'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[#C0E6FF]">Your Balance:</span>
              <span className={`font-semibold ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                {userBalance.toFixed(4)} SUI
              </span>
            </div>
          </div>

          {/* Mint Button */}
          <Button
            onClick={handleMintTicket}
            disabled={!canAfford || isMinting || isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
          >
            {isMinting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Minting Ticket...
              </>
            ) : !canAfford ? (
              <>
                <Wallet className="w-5 h-5 mr-2" />
                Insufficient Balance
              </>
            ) : (
              <>
                <Coins className="w-5 h-5 mr-2" />
                Mint Ticket with SUI
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function RaffleCraftPage() {
  const { user } = useSuiAuth()
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [quizTimeRemaining, setQuizTimeRemaining] = useState(300) // 5 minutes
  const [isAdmin, setIsAdmin] = useState(true) // For demo purposes

  // Use the RaffleCraft hook
  const {
    currentWeek,
    userEligibility,
    userTickets,
    userQuizAttempt,
    quizCompleted,
    showQuizResults,
    showTicketMinting,
    isLoadingQuiz,
    isSubmittingQuiz,
    isMintingTicket,
    canTakeQuiz,
    canMintTicket,
    hasTicketThisWeek,
    timeRemaining,
    startQuiz,
    submitQuiz,
    mintTicket,
    resetQuiz,
    showTicketMintingInterface
  } = useRaffleCraft()

  // Quiz timer
  useEffect(() => {
    if (canTakeQuiz && quizTimeRemaining > 0) {
      const timer = setInterval(() => {
        setQuizTimeRemaining(prev => Math.max(0, prev - 1))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [canTakeQuiz, quizTimeRemaining])

  const handleStartQuiz = () => {
    startQuiz()
    setQuizTimeRemaining(300) // Reset timer
    setSelectedAnswer('')
  }

  const handleSubmitQuiz = async () => {
    if (!selectedAnswer.trim()) {
      toast.error('Please select an answer')
      return
    }

    try {
      await submitQuiz(selectedAnswer)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit quiz')
    }
  }

  const handleMintSuccess = (ticketNumber: number) => {
    // This would be called after successful ticket minting
    toast.success(`Ticket #${ticketNumber} minted successfully!`)
  }

  if (isLoadingQuiz) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4" />
          <p className="text-[#C0E6FF]">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (!currentWeek) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center py-12">
          <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Active Quiz</h3>
          <p className="text-[#C0E6FF]">There's no active quiz this week. Check back later!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">RaffleCraft Quiz Challenge</h1>
        <p className="text-[#C0E6FF]">Answer the weekly quiz correctly to earn the right to mint a raffle ticket!</p>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Current Week Info */}
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center gap-2 text-white mb-4">
              <Calendar className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-semibold">Week {currentWeek.week_number} Raffle</h3>
            </div>

            <div className="border border-[#4DA2FF]/30 rounded-lg overflow-hidden">
              {/* Prize Pool */}
              <div className="flex items-center border-b border-[#4DA2FF]/30 p-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-yellow-500/20 p-2 rounded">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                  </div>
                  <span className="text-[#C0E6FF] font-medium">Prize Pool:</span>
                </div>
                <div className="text-white font-medium">{currentWeek.prize_pool_sui} SUI</div>
              </div>

              {/* Total Tickets */}
              <div className="flex items-center border-b border-[#4DA2FF]/30 p-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-purple-500/20 p-2 rounded">
                    <Ticket className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-[#C0E6FF] font-medium">Tickets Sold:</span>
                </div>
                <div className="text-white font-medium">{currentWeek.total_tickets_sold}</div>
              </div>

              {/* Ticket Price */}
              <div className="flex items-center border-b border-[#4DA2FF]/30 p-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-[#4DA2FF]/20 p-2 rounded">
                    <DollarSign className="w-4 h-4 text-[#4DA2FF]" />
                  </div>
                  <span className="text-[#C0E6FF] font-medium">Ticket Price:</span>
                </div>
                <div className="text-white font-medium">{currentWeek.ticket_price_sui} SUI</div>
              </div>

              {/* Time Remaining */}
              <div className="flex items-center border-b border-[#4DA2FF]/30 p-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-orange-500/20 p-2 rounded">
                    <Clock className="w-4 h-4 text-orange-400" />
                  </div>
                  <span className="text-[#C0E6FF] font-medium">Time Remaining:</span>
                </div>
                <div className="text-white font-medium">
                  {Math.floor(timeRemaining / (1000 * 60 * 60 * 24))}d {Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))}h
                </div>
              </div>

              {/* Your Status */}
              <div className="flex items-center p-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-cyan-500/20 p-2 rounded">
                    <Users className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="text-[#C0E6FF] font-medium">Your Tickets:</span>
                </div>
                <div className="text-white font-medium">
                  {hasTicketThisWeek ? userTickets.length : 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz/Action Section */}
        <div className="space-y-6">
          {/* User Status */}
          {!user ? (
            <div className="enhanced-card">
              <div className="enhanced-card-content">
                <div className="text-center py-8">
                  <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Connect Your Wallet</h3>
                  <p className="text-[#C0E6FF]">Connect your SUI wallet to participate in the quiz and raffle.</p>
                </div>
              </div>
            </div>
          ) : hasTicketThisWeek ? (
            <div className="enhanced-card">
              <div className="enhanced-card-content">
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-400 mb-2">You're In!</h3>
                  <p className="text-[#C0E6FF] mb-4">
                    You have {userTickets.filter(t => t.week_number === currentWeek.week_number).length} ticket(s) for this week's raffle.
                  </p>
                  <div className="space-y-2">
                    {userTickets
                      .filter(t => t.week_number === currentWeek.week_number)
                      .map(ticket => (
                        <div key={ticket.id} className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                          <p className="text-green-400 font-mono">Ticket #{ticket.ticket_number}</p>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </div>
          ) : quizCompleted && userQuizAttempt ? (
            userQuizAttempt.is_correct ? (
              showTicketMinting ? (
                <TicketMinting
                  ticketPrice={currentWeek.ticket_price_sui}
                  onMintSuccess={handleMintSuccess}
                  isLoading={isMintingTicket}
                />
              ) : (
                <div className="enhanced-card">
                  <div className="enhanced-card-content">
                    <div className="text-center py-8">
                      <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8 text-green-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-green-400 mb-2">Quiz Completed!</h3>
                      <p className="text-[#C0E6FF] mb-4">You answered correctly and can now mint a raffle ticket.</p>
                      <Button
                        onClick={showTicketMintingInterface}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Ticket className="w-4 h-4 mr-2" />
                        Mint Ticket
                      </Button>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="enhanced-card">
                <div className="enhanced-card-content">
                  <div className="text-center py-8">
                    <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                      <XCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-red-400 mb-2">Better Luck Next Week</h3>
                    <p className="text-[#C0E6FF]">You answered incorrectly. Try again in next week's quiz!</p>
                  </div>
                </div>
              </div>
            )
          ) : canTakeQuiz ? (
            showQuizResults ? (
              <QuizResults
                isCorrect={userQuizAttempt?.is_correct || false}
                correctAnswer={currentWeek.options[0]} // First option is always correct in our format
                userAnswer={selectedAnswer}
                explanation="Great job! You've earned the right to mint a raffle ticket."
                pointsEarned={userQuizAttempt?.points_earned || 0}
                canMintTicket={userQuizAttempt?.can_mint_ticket || false}
                onContinue={showTicketMintingInterface}
              />
            ) : (
              <QuizComponent
                question={currentWeek.question_text}
                options={currentWeek.options}
                selectedAnswer={selectedAnswer}
                onAnswerSelect={setSelectedAnswer}
                onSubmit={handleSubmitQuiz}
                isSubmitting={isSubmittingQuiz}
                timeRemaining={quizTimeRemaining}
                difficulty={currentWeek.difficulty}
                category={currentWeek.category}
                canSubmit={!!selectedAnswer && quizTimeRemaining > 0}
              />
            )
          ) : (
            <div className="enhanced-card">
              <div className="enhanced-card-content">
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Ready to Start?</h3>
                  <p className="text-[#C0E6FF] mb-4">
                    Answer this week's quiz question correctly to earn the right to mint a raffle ticket.
                  </p>
                  <Button
                    onClick={handleStartQuiz}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Quiz
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Admin Section */}
          {isAdmin && (
            <div className="enhanced-card">
              <div className="enhanced-card-content">
                <div className="flex items-center gap-2 text-white mb-4">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  <h3 className="font-semibold">Admin Controls</h3>
                </div>
                <div className="space-y-3">
                  <Button
                    onClick={() => toast.info('Winner selection would be triggered here')}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    Draw Winner for Week {currentWeek.week_number}
                  </Button>
                  <Button
                    onClick={() => toast.info('Next week raffle would be created here')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Create Next Week Raffle
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Tickets */}
      {userTickets.length > 0 && (
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center gap-2 text-white mb-4">
              <Ticket className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold">Your Recent Tickets</h3>
            </div>
            <div className="space-y-3">
              {userTickets.slice(0, 5).map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-3 bg-[#011829]/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-500/20 p-2 rounded">
                      <Ticket className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Ticket #{ticket.ticket_number}</p>
                      <p className="text-[#C0E6FF] text-sm">Week {ticket.week_number}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{ticket.amount_paid_sui} SUI</p>
                    <p className="text-[#C0E6FF] text-sm">
                      {new Date(ticket.minted_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="enhanced-card">
        <div className="enhanced-card-content">
          <div className="flex items-center gap-2 text-white mb-4">
            <HelpCircle className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold">How RaffleCraft Works</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-[#0f2746] rounded-lg border border-blue-400/30">
              <div className="mx-auto w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-3">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <h4 className="text-white font-semibold mb-2">1. Answer Quiz</h4>
              <p className="text-[#C0E6FF] text-sm">
                Answer the weekly quiz question correctly to earn the right to mint a ticket.
              </p>
            </div>
            <div className="text-center p-4 bg-[#0f2746] rounded-lg border border-green-400/30">
              <div className="mx-auto w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-3">
                <Coins className="w-6 h-6 text-green-400" />
              </div>
              <h4 className="text-white font-semibold mb-2">2. Mint Ticket</h4>
              <p className="text-[#C0E6FF] text-sm">
                Pay {currentWeek.ticket_price_sui} SUI to mint your raffle ticket with a unique number.
              </p>
            </div>
            <div className="text-center p-4 bg-[#0f2746] rounded-lg border border-yellow-400/30">
              <div className="mx-auto w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mb-3">
                <Trophy className="w-6 h-6 text-yellow-400" />
              </div>
              <h4 className="text-white font-semibold mb-2">3. Win Prize</h4>
              <p className="text-[#C0E6FF] text-sm">
                At the end of the week, one ticket is randomly selected to win the entire prize pool.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
