'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogIn, LogOut, Sun, Moon } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useAuth } from './AuthProvider'
import { LinkAccountModal } from './LinkAccountModal'

export function AccountStatus() {
  const { isAnonymous, isLinked, user, signOut, loading } = useAuth()
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)
  const [showModal, setShowModal] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showDropdown])

  // Don't render anything while auth is loading or Supabase is not configured
  if (loading) return null
  if (!user) return null

  // Anonymous user: show "sign in to save" pill
  if (isAnonymous) {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className="fixed top-4 right-4 z-40 px-4 py-2 rounded-full text-xs font-medium glass text-secondary transition-all hover:scale-[1.02] active:scale-95"
        >
          <span className="flex items-center gap-1.5">
            <LogIn size={14} />
            登录保存
          </span>
        </button>
        <LinkAccountModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </>
    )
  }

  // Linked user: show avatar/email with dropdown
  const displayName = user.email
    ? user.email.split('@')[0]
    : user.user_metadata?.full_name || 'User'

  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div ref={dropdownRef} className="fixed top-4 right-4 z-40">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full glass text-secondary transition-all hover:scale-[1.02] active:scale-95"
      >
        {/* Avatar */}
        {user.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt=""
            className="w-6 h-6 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium"
            style={{
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              color: '#fff',
            }}
          >
            {initial}
          </div>
        )}
        <span className="text-xs max-w-[80px] truncate">{displayName}</span>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-40 rounded-xl overflow-hidden glass-strong shadow-elevated"
          >
            {/* Theme toggle */}
            <button
              onClick={() => {
                setShowDropdown(false)
                setTheme(theme === 'dark' ? 'light' : 'dark')
              }}
              className="w-full px-4 py-2.5 text-left text-xs transition-colors flex items-center gap-2 text-muted hover:bg-white/[0.06]"
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              {theme === 'dark' ? '切换亮色' : '切换暗色'}
            </button>

            <div className="h-px bg-divider mx-4" />

            <button
              onClick={async () => {
                setShowDropdown(false)
                try {
                  await signOut()
                } catch (err) {
                  console.error('[AccountStatus] Sign out failed:', err)
                }
              }}
              className="w-full px-4 py-2.5 text-left text-xs transition-colors flex items-center gap-2 text-muted hover:bg-white/[0.06]"
            >
              <LogOut size={14} />
              退出登录
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}