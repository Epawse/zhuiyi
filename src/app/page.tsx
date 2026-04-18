'use client'

import { useAppStore } from '@/store/useAppStore'
import { LandingPage } from '@/components/landing/LandingPage'
import { ProcessingPage } from '@/components/processing/ProcessingPage'
import { ExperiencePage } from '@/components/experience/ExperiencePage'
import { SharePage } from '@/components/share/SharePage'
import { StoreHydrator } from '@/components/common/StoreHydrator'

export default function Home() {
  const appState = useAppStore((s) => s.state)

  return (
    <main className="min-h-screen">
      <StoreHydrator />
      {appState === 'landing' && <LandingPage />}
      {appState === 'processing' && <ProcessingPage />}
      {appState === 'experience' && <ExperiencePage />}
      {appState === 'share' && <SharePage />}
    </main>
  )
}