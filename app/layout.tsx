import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AppProvider } from '@/components/app-context'

export const metadata: Metadata = {
  title: 'Robots Meet Culture - WRO 2026',
  description: 'Team Research Notebook for WRO 2026 - Robots Meet Culture Competition',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1e3a5f',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-[#f0f4ff]">
      <body className="gear-bg text-slate-900 min-h-screen">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  )
}
