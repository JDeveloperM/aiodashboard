"use client"

import { useRef, useState, useEffect } from "react"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SignUpButton } from "@clerk/nextjs"

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

const plans = [
  {
    name: "Free",
    price: "€0",
    description: "Perfect for beginners to explore the platform",
    features: [
      { included: true, text: "Access to basic dashboard" },
      { included: true, text: "1 free trading strategy" },
      { included: true, text: "Real-time market data" },
      { included: true, text: "Basic analytics" },
      { included: false, text: "Crypto trading bots" },
      { included: false, text: "Forex trading bots" },
      { included: false, text: "Priority support" },
    ],
    popular: false,
    buttonText: "Get Started",
    color: "#3b82f6" // blue
  },
  {
    name: "Premium",
    price: "€250",
    period: "one-time",
    description: "For active traders seeking advanced strategies",
    features: [
      { included: true, text: "Everything in Free" },
      { included: true, text: "Unlimited trading strategies" },
      { included: true, text: "Crypto trading bots" },
      { included: true, text: "Advanced analytics" },
      { included: true, text: "Email support" },
      { included: false, text: "Forex trading bots" },
      { included: false, text: "Custom strategy development" },
    ],
    popular: true,
    buttonText: "Upgrade Now",
    color: "#8b5cf6" // purple
  },
  {
    name: "VIP",
    price: "€600",
    period: "one-time",
    description: "Complete access to all features and priority support",
    features: [
      { included: true, text: "Everything in Premium" },
      { included: true, text: "Forex trading bots" },
      { included: true, text: "Stock trading bots" },
      { included: true, text: "Priority support" },
      { included: true, text: "1-on-1 strategy consultation" },
      { included: true, text: "Early access to new features" },
      { included: true, text: "Dedicated account manager" },
    ],
    popular: false,
    buttonText: "Upgrade to VIP",
    color: "#f59e0b" // Changed from #0ea5e9 to amber/golden color
  }
]

export function PricingSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, threshold: 0.3 })

  return (
    <section className="py-32 bg-black relative overflow-hidden" id="pricing">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-[size:30px_30px] opacity-5 [mask-image:radial-gradient(white,transparent_70%)]" />
      
      {/* Glowing orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full filter blur-[100px]" />
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full filter blur-[100px]" />

      <div 
        ref={ref}
        className="container mx-auto px-4 relative z-10"
        style={{
          opacity: isInView ? 1 : 0,
          transform: isInView ? "translateY(0)" : "translateY(30px)",
          transition: "all 0.7s cubic-bezier(0.17, 0.55, 0.55, 1)"
        }}
      >
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-4 py-1 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
            <span className="text-sm font-medium text-white/80">Simple Pricing</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
            One-Time <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Pricing</span>
          </h2>
          
          <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto">
            No monthly fees or hidden costs. Pay once and get lifetime access to your chosen plan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <PricingCard key={index} plan={plan} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

function PricingCard({ plan, index }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <div
      ref={ref}
      className={`
        backdrop-blur-sm border rounded-2xl overflow-hidden transition-all duration-500
        ${plan.popular 
          ? 'border-white/20 bg-white/10 shadow-lg relative z-10 scale-105' 
          : 'border-white/10 bg-white/5'}
        hover:shadow-lg hover:border-white/20
      `}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? "translateY(0)" : "translateY(30px)",
        transitionDelay: `${index * 100}ms`,
        boxShadow: plan.popular ? `0 0 30px ${plan.color}10` : ''
      }}
    >
      {plan.popular && (
        <div 
          className="py-1 px-3 text-center text-xs font-semibold uppercase tracking-wider"
          style={{ 
            background: `linear-gradient(to right, ${plan.color}80, ${plan.color}40)`,
            color: 'white'
          }}
        >
          Most Popular
        </div>
      )}

      <div className="p-8">
        <h3 className="text-2xl font-bold mb-2 text-white">{plan.name}</h3>
        <div className="flex items-end mb-4">
          <span className="text-4xl font-bold text-white">{plan.price}</span>
          {plan.period && <span className="text-white/60 ml-2 text-sm">{plan.period === "one-time" ? "one-time payment" : plan.period}</span>}
        </div>
        <p className="text-white/70 mb-6">{plan.description}</p>

        <SignUpButton mode="modal">
          <Button
            className={`w-full mb-6 rounded-full py-6 h-auto ${
              plan.popular 
                ? 'bg-white hover:bg-white/90 text-black' 
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
            }`}
            variant={plan.popular ? 'default' : 'outline'}
          >
            {plan.buttonText}
          </Button>
        </SignUpButton>

        <div className="space-y-4">
          {plan.features.map((feature, featureIndex) => (
            <div key={featureIndex} className="flex items-center">
              {feature.included ? (
                <div 
                  className="h-5 w-5 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
                  style={{ 
                    background: `${plan.color}20`,
                    border: `1px solid ${plan.color}40`
                  }}
                >
                  <Check className="h-3 w-3" style={{ color: plan.color }} />
                </div>
              ) : (
                <div className="h-5 w-5 rounded-full flex items-center justify-center mr-3 flex-shrink-0 bg-white/10 border border-white/20">
                  <X className="h-3 w-3 text-white/40" />
                </div>
              )}
              <span className={feature.included ? 'text-white/90' : 'text-white/40'}>
                {feature.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
