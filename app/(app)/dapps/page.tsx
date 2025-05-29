import { DAppsSection } from "@/components/dapps-section"

export default function DAppsPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">DApps</h1>
          <p className="text-gray-400 mt-1">Decentralized applications built for the MetadudesX ecosystem</p>
        </div>
      </div>

      <DAppsSection />
    </div>
  )
}
