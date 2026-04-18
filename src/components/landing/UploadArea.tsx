'use client'

import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { convertHeicToJpeg } from '@/lib/photo/heic'
import { compressImage } from '@/lib/photo/compress'
import { extractExif } from '@/lib/photo/exif'

export function UploadArea() {
  const setPhotos = useAppStore((s) => s.setPhotos)
  const setState = useAppStore((s) => s.setState)
  const [dragging, setDragging] = useState(false)
  const [status, setStatus] = useState('')

  const handleFiles = useCallback(
    async (files: FileList) => {
      const total = files.length
      const photoFiles = []

      for (let i = 0; i < total; i++) {
        const file = files[i]
        setStatus(`处理照片 ${i + 1}/${total}...`)

        // Step 1: Extract EXIF from ORIGINAL file (before HEIC conversion loses it)
        const exif = await extractExif(file)

        // Step 2: Convert HEIC to JPEG if needed
        const converted = await convertHeicToJpeg(file)

        // Step 3: Compress and get preview dataUrl
        const { dataUrl } = await compressImage(converted)

        photoFiles.push({
          id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          file: converted,
          preview: dataUrl,
          exif,
          analysis: null,
          analyzing: false,
        })
      }

      setPhotos(photoFiles)
      setState('processing')
    },
    [setPhotos, setState]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files)
      }
    },
    [handleFiles]
  )

  return (
    <motion.div
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      whileHover={{
        boxShadow: '0 0 40px rgba(212, 165, 116, 0.06), 0 0 80px rgba(212, 165, 116, 0.03)',
      }}
      className={`
        w-full max-w-lg rounded-3xl p-10 text-center
        backdrop-blur-xl border transition-all duration-300 cursor-pointer
        ${dragging
          ? 'bg-white/10 border-white/20 shadow-[0_0_60px_rgba(212,165,116,0.1)]'
          : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.12]'
        }
      `}
    >
      {/* Camera / aperture SVG icon */}
      <div className="flex justify-center mb-5">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white/30"
        >
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
      </div>

      <p className="text-white/50 mb-1.5 text-sm">拖拽照片到这里</p>
      <p className="text-[11px] text-white/20 mb-5">支持 JPG、PNG、HEIC 格式</p>

      <label className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full cursor-pointer transition-all bg-white/[0.08] border border-white/[0.12] hover:bg-white/[0.14] hover:border-white/[0.18] text-white/70 hover:text-white/90 text-sm">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        选择照片
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/heic,image/heif"
          className="hidden"
          onChange={handleChange}
        />
      </label>

      {status && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-xs text-white/30"
        >
          {status}
        </motion.p>
      )}
    </motion.div>
  )
}