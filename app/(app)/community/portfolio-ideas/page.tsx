"use client"

import { PortfolioIdeas } from "@/components/portfolio-ideas"

export default function PortfolioIdeasPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Portfolio Ideas</h1>
          <p className="text-gray-400 mt-1">Curated long-term spot trading suggestions</p>
        </div>
      </div>

      <PortfolioIdeas />
    </div>
  )
}
