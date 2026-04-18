'use client'

import { useAppStore } from '@/store/useAppStore'
import { LandingPage } from '@/components/landing/LandingPage'
import { ProcessingPage } from '@/components/processing/ProcessingPage'
import { ExperiencePage } from '@/components/experience/ExperiencePage'
import { SharePage } from '@/components/share/SharePage'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { AnimatePresence, motion } from 'framer-motion'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.3 } },
}

export default function Home() {
  const appState = useAppStore((s) => s.state)

  return (
    <main className="min-h-screen">
      <ErrorBoundary>
      <AnimatePresence mode="wait">
        {appState === 'landing' && (
          <motion.div key="landing" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <LandingPage />
          </motion.div>
        )}
        {appState === 'processing' && (
          <motion.div key="processing" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <ProcessingPage />
          </motion.div>
        )}
        {appState === 'experience' && (
          <motion.div key="experience" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <ExperiencePage />
          </motion.div>
        )}
        {appState === 'share' && (
          <motion.div key="share" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <SharePage />
          </motion.div>
        )}
      </AnimatePresence>
      </ErrorBoundary>
    </main>
  )
}