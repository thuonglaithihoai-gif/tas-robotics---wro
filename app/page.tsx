'use client'

import { useState } from 'react'
import { useApp } from '@/components/app-context'
import { LoginScreen } from '@/components/login-screen'
import { Header } from '@/components/header'
import { ThemeSelectionTab } from '@/components/theme-selection-tab'
import { IdeationTab } from '@/components/ideation-tab'
import { JournalTab } from '@/components/journal-tab'
import { ScheduleTab } from '@/components/schedule-tab'

export default function Home() {
  const { isLoadingInit, initError, isUnlocked, currentStudent } = useApp()
  const [activeTab, setActiveTab] = useState('journal')

  // Loading state
  if (isLoadingInit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div style={{ fontSize: '48px', animation: 'spin 2s linear infinite' }}>⚙️</div>
          <p className="font-bold text-indigo-600">Loading Workspace...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl max-w-lg shadow-lg">
          <h3 className="font-bold text-lg mb-2">System Error</h3>
          <p>{initError}</p>
          <p className="mt-4 text-sm text-red-600">
            Make sure you have set the <code className="bg-red-100 px-1 rounded">NEXT_PUBLIC_GOOGLE_SCRIPT_URL</code> environment variable with your Google Apps Script Web App URL.
          </p>
        </div>
      </div>
    )
  }

  // Login state
  if (!isUnlocked) {
    return <LoginScreen />
  }

  // Set default tab based on role
  const defaultTab = currentStudent?.role === 'coach' ? 'team' : activeTab

  return (
    <div className="min-h-screen p-4 md:p-6">
      <Header activeTab={defaultTab} setActiveTab={setActiveTab} />
      
      <main style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {defaultTab === 'draft' && currentStudent?.role !== 'coach' && (
          <ThemeSelectionTab />
        )}
        
        {defaultTab === 'team' && (
          <IdeationTab />
        )}
        
        {defaultTab === 'journal' && (
          <JournalTab />
        )}
        
        {defaultTab === 'schedule' && (
          <ScheduleTab />
        )}
      </main>
    </div>
  )
}
