"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const faqCategories = [
  {
    category: "Getting Started",
    faqs: [
      {
        question: "What is MetadudesX and how does it work?",
        answer: "MetadudesX is a Web2.5 platform that bridges traditional Web2 simplicity with Web3 functionality. We offer automated trading bots, community features, DApps, and educational resources. Users can sign in with Google, get auto-generated wallets, and access various tiers (Copier, PRO, ROYAL) with different benefits."
      },
      {
        question: "How do I get started with MetadudesX?",
        answer: "Simply sign up using your Google account or email. You'll automatically start as a Copier user with access to basic features. Connect your Bybit account to start using our trading bots, or explore our community features and educational content."
      },
      {
        question: "What are the different user tiers?",
        answer: "We have three tiers: Copier (basic access, $25 per 10% cycle), PRO (premium features, no cycle fees), and ROYAL (highest tier, exclusive access). PRO and ROYAL users need to mint the respective NFTs to upgrade their accounts."
      }
    ]
  },
  {
    category: "Trading Bots",
    faqs: [
      {
        question: "How do the trading bots work?",
        answer: "Our trading bots use advanced algorithms to execute trades on your connected exchange accounts. They monitor markets 24/7, analyze trends, and execute trades based on proven strategies. You maintain full control of your funds as they remain in your exchange account."
      },
      {
        question: "What is the 10% cycle system?",
        answer: "Our trading bots work in cycles. When a bot achieves 10% profit, the cycle completes and NOMAD users pay $25 to continue to the next cycle. PRO and ROYAL users are exempt from these fees and can continue automatically."
      },
      {
        question: "Which exchanges are supported?",
        answer: "Currently, we primarily support Bybit for our copy trading features. We're continuously working to add support for more exchanges based on user demand and market requirements."
      },
      {
        question: "Is my money safe?",
        answer: "Yes, your funds remain in your own exchange accounts at all times. We only connect via API keys with trading permissions - we never have withdrawal access to your funds. You maintain complete control over your assets."
      }
    ]
  },
  {
    category: "NFTs & Subscriptions",
    faqs: [
      {
        question: "What are PRO and ROYAL NFTs?",
        answer: "PRO and ROYAL NFTs are utility tokens that upgrade your account tier. They provide access to premium features, remove cycle fees, grant exclusive Discord/Telegram roles, and unlock advanced DApps and educational content."
      },
      {
        question: "How do I mint PRO or ROYAL NFTs?",
        answer: "Visit the Subscriptions page in your dashboard to mint NFTs. The process is integrated with the Sui Network for fast, low-fee transactions. Once minted, your account tier will automatically upgrade."
      },
      {
        question: "Can I sell my NFTs?",
        answer: "Yes, NFTs can be traded on compatible marketplaces. However, selling your NFT will downgrade your account tier and remove associated benefits like Discord roles and premium features."
      }
    ]
  },
  {
    category: "Community & Features",
    faqs: [
      {
        question: "How does gated access work?",
        answer: "Our Discord and Telegram communities have role-based access. PRO and ROYAL NFT holders get exclusive roles and access to premium channels. Roles are automatically synced with your NFT holdings."
      },
      {
        question: "What is the Ambassador System?",
        answer: "Our affiliate program allows you to earn commissions by inviting new users. You'll receive 25% of fees from PRO and ROYAL users you refer. Track your referrals and earnings in the Community section."
      },
      {
        question: "What DApps are available?",
        answer: "We're launching several DApps including NodeMe Pool, RaffleCraft, and DEWhale Launchpad. These provide additional investment and engagement opportunities for our community members."
      }
    ]
  },
  {
    category: "Technical & Support",
    faqs: [
      {
        question: "What blockchain does MetadudesX use?",
        answer: "We use the Sui Network for its fast transactions and low fees. This enables seamless NFT minting, wallet integration, and DApp functionality while maintaining an excellent user experience."
      },
      {
        question: "How do I connect my wallet?",
        answer: "Wallets are auto-generated when you sign up, but you can also connect external Sui wallets. Go to your Profile settings to manage wallet connections and view your Sui address."
      },
      {
        question: "What if I need help or support?",
        answer: "You can reach our support team through Discord, Telegram, or by contacting us directly. PRO and ROYAL users receive priority support with faster response times."
      },
      {
        question: "How do I complete KYC verification?",
        answer: "KYC verification is available in your Profile settings. This is required for certain features like DEWhale Launchpad access and higher-tier functionalities. The process is secure and compliant with regulations."
      }
    ]
  }
]

export default function FAQsPage() {
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (id: string) => {
    setOpenItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3 mb-8">
        <HelpCircle className="h-8 w-8 text-blue-400" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-400 mt-1">
            Find answers to common questions about MetadudesX platform and services
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {faqCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="space-y-4">
            <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">
              {category.category}
            </h2>

            <div className="space-y-3">
              {category.faqs.map((faq, faqIndex) => {
                const itemId = `${categoryIndex}-${faqIndex}`
                const isOpen = openItems.includes(itemId)

                return (
                  <Card key={faqIndex} className="enhanced-card border-0">
                    <CardContent className="enhanced-card-content p-0">
                      <button
                        onClick={() => toggleItem(itemId)}
                        className="w-full text-left p-4 flex justify-between items-start gap-3 hover:bg-white/5 transition-colors rounded-lg"
                      >
                        <h3 className="text-base font-medium text-white leading-relaxed">
                          {faq.question}
                        </h3>
                        {isOpen ? (
                          <ChevronUp className="h-4 w-4 text-blue-400 flex-shrink-0 mt-1" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4">
                          <div className="h-px w-full bg-gray-700 mb-3"></div>
                          <p className="text-gray-300 leading-relaxed text-sm">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 rounded-lg border border-blue-500/20" style={{ backgroundColor: '#0f2746' }}>
        <h3 className="text-lg font-semibold text-white mb-2">
          Still have questions?
        </h3>
        <p className="text-gray-300 mb-4">
          Can't find what you're looking for? Join our community or contact our support team.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="#"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Join Discord
          </a>
          <a
            href="#"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}
