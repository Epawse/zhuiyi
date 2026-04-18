'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'

export function StoreHydrator() {
  useEffect(() => {
    useAppStore.getState()._hydrate()
  }, [])
  return null
}