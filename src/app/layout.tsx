import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Providers } from './providers'
import './globals.css'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: '追忆 — 让记忆浮现',
  description: 'AI驱动的照片编年史生成器，将你的照片转化为多风格叙事体验',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('zhuiyi-theme')
                if (!theme) {
                  theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
                }
                document.documentElement.setAttribute('data-theme', theme)
              })()
            `,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
