'use client'

import { useCallback, useState } from 'react'
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
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`w-full max-w-lg border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
        dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <div className="text-5xl mb-4">📸</div>
      <p className="text-gray-600 mb-2">拖拽照片到这里，或点击选择</p>
      <p className="text-xs text-gray-400 mb-4">支持 JPG、PNG、HEIC 格式</p>
      <label className="inline-block px-6 py-2 bg-black text-white rounded-full cursor-pointer hover:bg-gray-800 transition-colors">
        选择照片
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/heic,image/heif"
          className="hidden"
          onChange={handleChange}
        />
      </label>
      {status && <p className="mt-2 text-xs text-gray-400">{status}</p>}
    </div>
  )
}