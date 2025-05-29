"use client"

import { useRef, useState, useEffect } from "react"
import { ChevronDown } from "lucide-react"

// Simplified InView implementation
const useInView = (ref: React.RefObject<Element>, options: IntersectionObserverInit = {}) => {
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const currentRef = ref.current
    if (!currentRef) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting)

      if (entry.isIntersecting && options.once) {
        observer.unobserve(currentRef)
      }
    }, options)

    observer.observe(currentRef)

    return () => {
      observer.unobserve(currentRef)
    }
  }, [ref, options.once, options.threshold, options])

  return isInView
}

const faqs = [
  {
    question: "How do AIonet's trading bots work?",
    answer: "AIonet's trading bots use advanced algorithms and machine learning to analyze market trends, execute trades, and manage risk. Our bots monitor markets 24/7, identifying opportunities based on technical indicators, market sentiment, and historical data patterns."
  },
  {
    question: "Is my money safe with AIonet?",
    answer: "Yes, AIonet never directly holds your funds. We connect to your exchange accounts using API keys with trade-only permissions (no withdrawal access). Your funds remain in your exchange accounts at all times, and you maintain full control over your assets."
  },
  {
    question: "What exchanges are supported?",
    answer: "AIonet currently supports major exchanges including Binance, Bybit, Coinbase Pro, KuCoin, and more. We're constantly adding support for additional exchanges based on user demand and market significance."
  },
  {
    question: "What is the minimum investment required?",
    answer: "There is no minimum investment required to use AIonet. You can start with any amount you're comfortable with. However, we recommend starting with at least €500 to effectively utilize our trading strategies and offset any exchange fees."
  },
  {
    question: "How do I connect my exchange account?",
    answer: "After signing up, navigate to the 'Exchanges' section in your dashboard. Select your exchange and follow the instructions to create API keys with trading permissions only. Copy and paste the API key and secret into AIonet to establish a secure connection."
  },
  {
    question: "Can I customize the trading strategies?",
    answer: "Yes, Premium and VIP users can customize various parameters of our trading strategies, including risk level, take profit targets, stop loss settings, and more. Free users have access to pre-configured strategies with limited customization options."
  },
  {
    question: "What is the average performance of your bots?",
    answer: "Performance varies based on market conditions, selected strategies, and risk settings. Our top-performing strategies have historically achieved 5-15% monthly returns in favorable market conditions. However, past performance is not indicative of future results, and all trading involves risk."
  }
]

export function FAQSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, threshold: 0.3 })

  return (
    <section className="py-32 bg-black relative overflow-hidden" id="faq">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-[size:30px_30px] opacity-5 [mask-image:radial-gradient(white,transparent_70%)]" />
      
      {/* Glowing orbs */}
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-500/5 rounded-full filter blur-[100px]" />
      <div className="absolute bottom-1/3 right-1/3 w-[500px] h-[500px] bg-purple-500/5 rounded-full filter blur-[100px]" />

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
            <span className="text-sm font-medium text-white/80">Questions & Answers</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
            Frequently Asked <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Questions</span>
          </h2>
          
          <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto">
            Find answers to common questions about AIonet's trading platform and services.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <FAQItem 
              key={index} 
              faq={faq} 
              index={index}
              isInView={isInView}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function FAQItem({ faq, index, isInView }) {
  const [isOpen, setIsOpen] = useState(false)
  const contentRef = useRef(null)

  return (
    <div 
      className="mb-4 last:mb-0 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm bg-white/5 hover:border-white/20 transition-all duration-300"
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? "translateY(0)" : "translateY(20px)",
        transitionDelay: `${index * 100}ms`,
        transitionProperty: "transform, opacity",
        transitionDuration: "500ms",
        transitionTimingFunction: "cubic-bezier(0.17, 0.55, 0.55, 1)"
      }}
    >
      <button
        className="w-full text-left p-6 flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <h3 className="text-lg font-medium text-white">{faq.question}</h3>
        <ChevronDown 
          className={`h-5 w-5 text-white/70 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      
      <div 
        ref={contentRef}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ 
          maxHeight: isOpen ? `${(contentRef.current as unknown as HTMLDivElement)?.scrollHeight}px` : "0px",
          opacity: isOpen ? 1 : 0
        }}
      >
        <div className="p-6 pt-0 text-white/70">
          <div className="h-px w-full bg-white/10 mb-6"></div>
          <p>{faq.answer}</p>
        </div>
      </div>
    </div>
  )
}