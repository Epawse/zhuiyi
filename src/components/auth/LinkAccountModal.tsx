'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from './AuthProvider'

interface LinkAccountModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LinkAccountModal({ isOpen, onClose }: LinkAccountModalProps) {
  const { linkWithEmail, linkWithGoogle } = useAuth()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleEmailLink = async () => {
    if (!email.trim()) return
    setStatus('loading')
    setErrorMessage('')
    try {
      await linkWithEmail(email.trim())
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : '绑定邮箱失败，请重试')
    }
  }

  const handleGoogleLink = async () => {
    setStatus('loading')
    setErrorMessage('')
    try {
      await linkWithGoogle()
      // On success, the page will redirect to Google OAuth, so we don't set success here
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Google登录失败，请重试')
      setStatus('idle')
    }
  }

  const handleClose = () => {
    setStatus('idle')
    setErrorMessage('')
    setEmail('')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="w-full max-w-sm rounded-2xl p-6 pointer-events-auto"
              style={{
                background: 'rgba(26, 26, 46, 0.95)',
                backdropFilter: 'blur(40px) saturate(150%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 24px 80px rgba(0, 0, 0, 0.5)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium" style={{ color: '#F5F0E8' }}>
                  登录保存到云端
                </h2>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round">
                    <line x1="1" y1="1" x2="13" y2="13" />
                    <line x1="13" y1="1" x2="1" y2="13" />
                  </svg>
                </button>
              </div>

              {/* Success state */}
              {status === 'success' ? (
                <div className="text-center py-4">
                  <div
                    className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(0, 255, 212, 0.1)' }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00FFD4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    确认邮件已发送到 {email}
                  </p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    请点击邮件中的链接完成绑定
                  </p>
                </div>
              ) : (
                <>
                  {/* Email input */}
                  <div className="mb-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleEmailLink()}
                      placeholder="输入邮箱地址"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#F5F0E8',
                      }}
                      disabled={status === 'loading'}
                    />
                  </div>

                  <button
                    onClick={handleEmailLink}
                    disabled={!email.trim() || status === 'loading'}
                    className="w-full py-3 rounded-xl text-sm font-medium transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#F5F0E8',
                    }}
                  >
                    {status === 'loading' ? '处理中...' : '绑定邮箱'}
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>或者</span>
                    <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
                  </div>

                  {/* Google button */}
                  <button
                    onClick={handleGoogleLink}
                    disabled={status === 'loading'}
                    className="w-full py-3 rounded-xl text-sm font-medium transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#F5F0E8',
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18">
                      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
                      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
                      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
                      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.579 9 3.58Z" fill="#EA4335"/>
                    </svg>
                    使用 Google 登录
                  </button>

                  {/* Error message */}
                  {status === 'error' && errorMessage && (
                    <p className="mt-3 text-xs text-center" style={{ color: '#FF4D6A' }}>
                      {errorMessage}
                    </p>
                  )}

                  {/* Subtitle */}
                  <p className="mt-4 text-[11px] text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    绑定后可跨设备同步你的记忆旅程
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}