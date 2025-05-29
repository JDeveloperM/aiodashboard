"use client"

import { useRef, useState, useEffect } from "react"
import { UserPlus, Settings, LineChart, DollarSign } from "lucide-react"
import StarBorder from "@/components/ui/star-border"

// Simplified InView implementation
const useInView = (ref, options = {}) => {
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting)

      if (entry.isIntersecting && options.once) {
        observer.unobserve(ref.current)
      }
    }, options)

    observer.observe(ref.current)

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [ref, options.once, options.threshold])

  return isInView
}

const steps = [
  {
    icon: UserPlus,
    title: "Create an Account",
    description: "Sign up for AIonet in minutes and complete your profile to get started.",
    color: "#3b82f6" // blue
  },
  {
    icon: Settings,
    title: "Connect Your Exchange",
    description: "Securely connect your preferred exchange account using API keys with trade-only permissions.",
    color: "#8b5cf6" // purple
  },
  {
    icon: LineChart,
    title: "Select Trading Strategies",
    description: "Browse our marketplace of proven strategies and select the ones that match your goals.",
    color: "#0ea5e9" // sky blue
  },
  {
    icon: DollarSign,
    title: "Start Automated Trading",
    description: "Activate your selected strategies and watch as trades are automatically executed for you.",
    color: "#10b981" // emerald
  }
]

export function HowItWorksSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section className="py-32 bg-black relative overflow-hidden" id="how-it-works">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-[size:30px_30px] opacity-5 [mask-image:radial-gradient(white,transparent_70%)]" />
      
      {/* Glowing orbs */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full filter blur-[100px]" />
      <div className="absolute bottom-1/3 left-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full filter blur-[100px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-4 py-1 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
            <span className="text-sm font-medium text-white/80">Simple Process</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
            How It <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Works</span>
          </h2>
          
          <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto">
            Getting started with AIonet is simple. Follow these steps to begin your AI-powered automated trading journey.
          </p>
        </div>

        <div
          ref={ref}
          className="relative max-w-4xl mx-auto"
        >
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-white/10" />

          {steps.map((step, index) => {
            const isEven = index % 2 === 0
            const Icon = step.icon

            return (
              <div
                key={index}
                className="relative mb-24 last:mb-0"
                style={{
                  opacity: isInView ? 1 : 0,
                  transform: isInView ? "translateY(0)" : "translateY(50px)",
                  transition: "all 0.7s cubic-bezier(0.17, 0.55, 0.55, 1)",
                  transitionDelay: `${index * 200}ms`
                }}
              >
                <div className={`flex items-center ${isEven ? 'flex-row' : 'flex-row-reverse'} gap-8`}>
                  {/* Timeline dot */}
                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center z-10 border border-white/20 backdrop-blur-sm"
                    style={{
                      background: `linear-gradient(135deg, ${step.color}20, ${step.color}10)`,
                      boxShadow: `0 0 20px ${step.color}20`
                    }}
                  >
                    <span className="text-white font-bold text-lg">{index + 1}</span>
                  </div>

                  {/* Content */}
                  <div className={`w-1/2 ${isEven ? 'text-right pr-12' : 'text-left pl-12'}`}>
                    <div 
                      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 transition-all duration-500 hover:shadow-lg hover:shadow-blue-500/5 hover:border-white/20"
                      style={{
                        transform: isEven ? 'perspective(1000px) rotateY(-2deg)' : 'perspective(1000px) rotateY(2deg)'
                      }}
                    >
                      <div className={`flex items-center gap-3 mb-4 ${isEven ? 'justify-end' : 'justify-start'}`}>
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ 
                            background: `linear-gradient(135deg, ${step.color}20, ${step.color}10)`,
                            border: `1px solid ${step.color}30`
                          }}
                        >
                          <Icon className="h-5 w-5" style={{ color: step.color }} />
                        </div>
                        <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                      </div>
                      <p className="text-white/70 text-sm leading-relaxed">{step.description}</p>
                    </div>
                  </div>

                  {/* Empty space for the other side */}
                  <div className="w-1/2" />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
