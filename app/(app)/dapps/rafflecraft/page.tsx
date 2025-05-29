"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dice6,
  Trophy,
  Users,
  Clock,
  Zap,
  ArrowRight,
  ExternalLink,
  Wallet,
  DollarSign,
  Gift,
  Star,
  Sparkles,
  Timer,
  Target,
  Play,
  X,
  Ticket,
  Calendar,
  Hash,
  Plus,
  Minus,
  Crown
} from "lucide-react"

interface TicketPurchase {
  txHash: string
  buyer: string
  ticketNo: number
  timestamp: string
}

interface CurrentRound {
  roundNumber: number
  startDate: string
  endDate: string
  prizePool: string
  totalTickets: number
  ticketPrice: string
  yourTickets: string
  isActive: boolean
}

interface Winner {
  round: number
  winner: string
  prize: string
  date: string
}

// Current round data
const currentRound: CurrentRound = {
  roundNumber: 1,
  startDate: "Mon, Feb 10, 2025, 04:58:16 PM",
  endDate: "Mon, Feb 17, 2025, 04:58:16 PM",
  prizePool: "0.2 POL",
  totalTickets: 2,
  ticketPrice: "0.1 POL",
  yourTickets: "2/3 Available",
  isActive: true
}

// Sample ticket purchases data
const ticketPurchases: TicketPurchase[] = [
  {
    txHash: "0x1234...5678",
    buyer: "0x3ED0_5495",
    ticketNo: 573,
    timestamp: "2025-02-10T16:58:16Z"
  },
  {
    txHash: "0x9abc...def0",
    buyer: "0x3ED0_5495",
    ticketNo: 632,
    timestamp: "2025-02-10T17:15:30Z"
  }
]

// Winners history data
const winnersHistory: Winner[] = [
  // No winners yet for demo
]

// Slot Machine Component
interface SlotMachineProps {
  isSpinning: boolean
  finalNumber: number | null
  onSpinComplete: () => void
}

function SlotMachine({ isSpinning, finalNumber, onSpinComplete }: SlotMachineProps) {
  const [displayNumbers, setDisplayNumbers] = useState([0, 0, 0])
  const [spinDuration, setSpinDuration] = useState(0)

  useEffect(() => {
    if (isSpinning && finalNumber !== null) {
      setSpinDuration(2000) // 2 seconds spin
      const interval = setInterval(() => {
        setDisplayNumbers([
          Math.floor(Math.random() * 10),
          Math.floor(Math.random() * 10),
          Math.floor(Math.random() * 10)
        ])
      }, 100)

      setTimeout(() => {
        clearInterval(interval)
        // Convert final number to 3 digits
        const finalStr = finalNumber.toString().padStart(3, '0')
        setDisplayNumbers([
          parseInt(finalStr[0]),
          parseInt(finalStr[1]),
          parseInt(finalStr[2])
        ])
        onSpinComplete()
      }, spinDuration)

      return () => clearInterval(interval)
    }
  }, [isSpinning, finalNumber, onSpinComplete, spinDuration])

  return (
    <div className="enhanced-card">
      <div className="enhanced-card-content">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-white mb-4">
            <Ticket className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold">Your Ticket Number</h3>
          </div>

          {/* Slot Machine Display */}
          <div className="flex justify-center items-center gap-2 p-6 rounded-xl border border-purple-400/30" style={{ backgroundColor: '#0f2746' }}>
            {displayNumbers.map((number, index) => (
              <div
                key={index}
                className={`
                  w-16 h-20 bg-black/80 border-2 border-purple-400/50 rounded-lg
                  flex items-center justify-center text-3xl font-bold text-white
                  shadow-lg shadow-purple-500/20
                  ${isSpinning ? 'animate-slot-spin animate-glow-pulse' : ''}
                  transition-all duration-300
                `}
                style={{
                  background: isSpinning
                    ? 'linear-gradient(45deg, #1a1a2e, #16213e, #0f3460)'
                    : 'linear-gradient(45deg, #000, #1a1a2e)',
                  boxShadow: isSpinning
                    ? '0 0 20px rgba(147, 51, 234, 0.5), inset 0 0 20px rgba(147, 51, 234, 0.1)'
                    : '0 0 10px rgba(147, 51, 234, 0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                <span
                  className={`
                    ${isSpinning ? 'text-purple-300' : 'text-white'}
                    transition-colors duration-300
                  `}
                >
                  {number}
                </span>
              </div>
            ))}
          </div>

          {/* Status Text */}
          <div className="text-center">
            {isSpinning ? (
              <p className="text-purple-300 animate-pulse">🎰 Generating your ticket number...</p>
            ) : finalNumber !== null ? (
              <p className="text-green-400 font-semibold">🎉 Ticket #{finalNumber} minted successfully!</p>
            ) : (
              <p className="text-[#C0E6FF]">Click "Mint with POL" to get your ticket number</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RaffleCraftPage() {
  const [ticketAmount, setTicketAmount] = useState(1)
  const [isAdmin, setIsAdmin] = useState(true) // For demo purposes

  // Slot machine state
  const [isSpinning, setIsSpinning] = useState(false)
  const [mintedTicketNumber, setMintedTicketNumber] = useState<number | null>(null)

  const handleMintTickets = () => {
    console.log(`Minting ${ticketAmount} tickets`)

    // Start slot machine animation
    setIsSpinning(true)

    // Generate random ticket number (in real app, this would come from blockchain)
    const newTicketNumber = Math.floor(Math.random() * 999) + 1
    setMintedTicketNumber(newTicketNumber)

    // Add minting logic here
  }

  const handleSpinComplete = () => {
    setIsSpinning(false)
  }

  const handleDrawWinner = () => {
    console.log("Drawing winner...")
    // Add winner drawing logic here
  }

  const incrementTickets = () => {
    if (ticketAmount < 10) {
      setTicketAmount(ticketAmount + 1)
    }
  }

  const decrementTickets = () => {
    if (ticketAmount > 1) {
      setTicketAmount(ticketAmount - 1)
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">RaffleCraft</h1>
        <p className="text-[#C0E6FF] mt-1">Decentralized raffles and giveaways on Sui Network</p>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Current Round Info */}
        <div className="enhanced-card">
          <div className="enhanced-card-content">
            <div className="flex items-center gap-2 text-white mb-4">
              <Dice6 className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-semibold">Current Round: {currentRound.roundNumber}</h3>
            </div>
            <div>
            <div className="border border-[#4DA2FF]/30 rounded-lg overflow-hidden">
              {/* Started */}
              <div className="flex items-center border-b border-[#4DA2FF]/30 p-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-green-500/20 p-2 rounded">
                    <Play className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-[#C0E6FF] font-medium">Started:</span>
                </div>
                <div className="text-white font-medium">{currentRound.startDate}</div>
              </div>

              {/* Ending */}
              <div className="flex items-center border-b border-[#4DA2FF]/30 p-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-red-500/20 p-2 rounded">
                    <X className="w-4 h-4 text-red-400" />
                  </div>
                  <span className="text-[#C0E6FF] font-medium">Ending:</span>
                </div>
                <div className="text-white font-medium">{currentRound.endDate}</div>
              </div>

              {/* Prize Pool */}
              <div className="flex items-center border-b border-[#4DA2FF]/30 p-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-yellow-500/20 p-2 rounded">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                  </div>
                  <span className="text-[#C0E6FF] font-medium">Prize Pool:</span>
                </div>
                <div className="text-white font-medium">{currentRound.prizePool}</div>
              </div>

              {/* Total Tickets Bought */}
              <div className="flex items-center border-b border-[#4DA2FF]/30 p-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-purple-500/20 p-2 rounded">
                    <Ticket className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-[#C0E6FF] font-medium">Total Tickets Bought:</span>
                </div>
                <div className="text-white font-medium">{currentRound.totalTickets}</div>
              </div>

              {/* Ticket Price */}
              <div className="flex items-center border-b border-[#4DA2FF]/30 p-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-[#4DA2FF]/20 p-2 rounded">
                    <DollarSign className="w-4 h-4 text-[#4DA2FF]" />
                  </div>
                  <span className="text-[#C0E6FF] font-medium">Ticket Price:</span>
                </div>
                <div className="text-white font-medium">{currentRound.ticketPrice}</div>
              </div>

              {/* Your Tickets */}
              <div className="flex items-center p-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-cyan-500/20 p-2 rounded">
                    <Users className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="text-[#C0E6FF] font-medium">Your Tickets:</span>
                </div>
                <div className="text-white font-medium">{currentRound.yourTickets}</div>
              </div>
            </div>
            </div>
          </div>
        </div>

        {/* Mint Section */}
        <div className="space-y-6">
          {/* Mint with POL */}
          <div className="enhanced-card">
            <div className="enhanced-card-content">
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <Button
                    onClick={decrementTickets}
                    disabled={ticketAmount <= 1}
                    className="w-10 h-10 p-0 bg-[#011829] border border-[#4DA2FF]/30 text-white hover:bg-[#4DA2FF]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    type="number"
                    value={ticketAmount}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1
                      if (value >= 1 && value <= 10) {
                        setTicketAmount(value)
                      }
                    }}
                    min="1"
                    max="10"
                    className="w-20 text-center bg-[#011829] border-[#4DA2FF]/30 text-white"
                  />
                  <Button
                    onClick={incrementTickets}
                    disabled={ticketAmount >= 10}
                    className="w-10 h-10 p-0 bg-[#011829] border border-[#4DA2FF]/30 text-white hover:bg-[#4DA2FF]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={handleMintTickets}
                    className="bg-[#4DA2FF] hover:bg-[#4DA2FF]/80 text-white px-8"
                  >
                    Mint with POL
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Slot Machine */}
          <SlotMachine
            isSpinning={isSpinning}
            finalNumber={mintedTicketNumber}
            onSpinComplete={handleSpinComplete}
          />

          {/* Admin Section */}
          {isAdmin && (
            <div className="enhanced-card">
              <div className="enhanced-card-content">
                <div className="flex items-center gap-2 text-white mb-4">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  <h3 className="font-semibold">Admin: Draw Winner for Current Round</h3>
                </div>
                <div>
                <Button
                  onClick={handleDrawWinner}
                  className="w-full text-white"
                  style={{ backgroundColor: '#377ae5' }}
                >
                  Draw Winner
                </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tickets Bought in This Round */}
      <div className="enhanced-card">
        <div className="enhanced-card-content">
          <div className="flex items-center gap-2 text-white mb-4">
            <Ticket className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold">Tickets Bought in This Round</h3>
          </div>
          <div>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-3 gap-4 p-4 bg-[#4DA2FF]/10 rounded-lg mb-4">
              <div className="text-center">
                <p className="text-[#4DA2FF] font-semibold">Tx Hash</p>
              </div>
              <div className="text-center">
                <p className="text-[#4DA2FF] font-semibold">Buyer</p>
              </div>
              <div className="text-center">
                <p className="text-[#4DA2FF] font-semibold">Ticket No</p>
              </div>
            </div>

            {ticketPurchases.length > 0 ? (
              <div className="space-y-3">
                {ticketPurchases.map((purchase, index) => (
                  <div key={index} className="grid grid-cols-3 gap-4 p-3 bg-[#011829]/50 rounded-lg">
                    <div className="text-center">
                      <p className="text-[#4DA2FF] font-mono text-sm">{purchase.txHash}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-mono text-sm">{purchase.buyer}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-semibold">{purchase.ticketNo}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-[#C0E6FF]">No tickets purchased yet.</p>
              </div>
            )}
          </div>
          </div>
        </div>
      </div>

      {/* Winners History */}
      <div className="enhanced-card">
        <div className="enhanced-card-content">
          <div className="flex items-center gap-2 text-white mb-4">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h3 className="font-semibold">Winners History</h3>
          </div>
          <div>
          {winnersHistory.length > 0 ? (
            <div className="space-y-4">
              {winnersHistory.map((winner, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-[#011829]/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="bg-yellow-500/20 p-2 rounded">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Round {winner.round}</p>
                      <p className="text-[#C0E6FF] text-sm">{winner.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{winner.winner}</p>
                    <p className="text-yellow-400 text-sm">{winner.prize}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="bg-gray-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-[#C0E6FF]">No winners yet.</p>
            </div>
          )}
          </div>
        </div>
      </div>

    </div>
  )
}
