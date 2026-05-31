'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Student, TeamData, InitialData } from '@/lib/google-script'
import * as api from '@/lib/google-script'

interface AppContextType {
  // Auth state
  students: Student[]
  currentStudent: Student | null
  isUnlocked: boolean
  isLoadingInit: boolean
  initError: string | null
  loginError: string
  
  // Team state
  teamData: TeamData
  activeTeamId: number
  viewingTeamId: number
  
  // Actions
  setSelectedStudentId: (id: string) => void
  setEnteredPin: (pin: string) => void
  handleUnlock: () => void
  handleLogout: () => void
  setActiveTeamId: (id: number) => void
  setViewingTeamId: (id: number) => void
  fetchTeamData: (teamId: number) => Promise<void>
  
  // Data mutation actions
  savePitch: typeof api.savePitch
  voteForPitch: typeof api.voteForPitch
  addComment: typeof api.addComment
  saveTeamLog: typeof api.saveTeamLog
  saveIdeaPost: typeof api.saveIdeaPost
  addIdeaPostComment: typeof api.addIdeaPostComment
  getScheduleData: typeof api.getScheduleData
  saveScheduleSlot: typeof api.saveScheduleSlot
  sendScheduleEmail: typeof api.sendScheduleEmail
  
  // UI state helpers
  selectedStudentId: string
  enteredPin: string
}

const AppContext = createContext<AppContextType | null>(null)

const TEAM_PINS: Record<number, string> = { 1: "1111", 2: "1211", 3: "1131", 4: "1114" }

export function AppProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([])
  const [isLoadingInit, setIsLoadingInit] = useState(true)
  const [initError, setInitError] = useState<string | null>(null)
  const [selectedStudentId, setSelectedStudentId] = useState("")
  const [enteredPin, setEnteredPin] = useState("")
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [teamData, setTeamData] = useState<TeamData>({ logs: [], pitches: [], votes: [], ideaPosts: [] })
  const [activeTeamId, setActiveTeamId] = useState(1)
  const [viewingTeamId, setViewingTeamId] = useState(1)

  const currentStudent = students.find(s => s.id === selectedStudentId) || null

  // Load initial data
  useEffect(() => {
    async function loadInitialData() {
      try {
        const data: InitialData = await api.getInitialData()
        setStudents(data.students || [])
        setIsLoadingInit(false)
      } catch (err) {
        setInitError(err instanceof Error ? err.message : 'Failed to load initial data')
        setIsLoadingInit(false)
      }
    }
    loadInitialData()
  }, [])

  const fetchTeamData = useCallback(async (teamId: number) => {
    try {
      const data = await api.getTeamData(teamId)
      setTeamData(data)
    } catch (err) {
      console.error('Failed to fetch team data:', err)
    }
  }, [])

  // Fetch team data when unlocked
  useEffect(() => {
    if (isUnlocked && currentStudent) {
      setActiveTeamId(currentStudent.team || 1)
      fetchTeamData(activeTeamId)
    }
  }, [isUnlocked, currentStudent, activeTeamId, fetchTeamData])

  const handleUnlock = useCallback(() => {
    if (!currentStudent) {
      setLoginError("Please select your name.")
      return
    }
    if (currentStudent.role === 'coach') {
      setIsUnlocked(true)
      setLoginError("")
      return
    }
    const expectedPin = TEAM_PINS[currentStudent.team] || "1111"
    if (enteredPin === expectedPin) {
      setIsUnlocked(true)
      setLoginError("")
    } else {
      setLoginError("Incorrect PIN!")
    }
  }, [currentStudent, enteredPin])

  const handleLogout = useCallback(() => {
    setIsUnlocked(false)
    setEnteredPin("")
    setSelectedStudentId("")
    setLoginError("")
  }, [])

  // Wrapped API functions that update local state
  const wrappedSavePitch: typeof api.savePitch = async (payload) => {
    const data = await api.savePitch(payload)
    setTeamData(data)
    return data
  }

  const wrappedVoteForPitch: typeof api.voteForPitch = async (payload) => {
    const data = await api.voteForPitch(payload)
    setTeamData(data)
    return data
  }

  const wrappedAddComment: typeof api.addComment = async (payload) => {
    const data = await api.addComment(payload)
    setTeamData(data)
    return data
  }

  const wrappedSaveTeamLog: typeof api.saveTeamLog = async (payload) => {
    const data = await api.saveTeamLog(payload)
    setTeamData(data)
    return data
  }

  const wrappedSaveIdeaPost: typeof api.saveIdeaPost = async (payload) => {
    const data = await api.saveIdeaPost(payload)
    setTeamData(data)
    return data
  }

  const wrappedAddIdeaPostComment: typeof api.addIdeaPostComment = async (payload) => {
    const data = await api.addIdeaPostComment(payload)
    setTeamData(data)
    return data
  }

  return (
    <AppContext.Provider
      value={{
        students,
        currentStudent,
        isUnlocked,
        isLoadingInit,
        initError,
        loginError,
        teamData,
        activeTeamId,
        viewingTeamId,
        selectedStudentId,
        enteredPin,
        setSelectedStudentId: (id) => { setSelectedStudentId(id); setLoginError(""); setEnteredPin("") },
        setEnteredPin: (pin) => { setEnteredPin(pin); setLoginError("") },
        handleUnlock,
        handleLogout,
        setActiveTeamId,
        setViewingTeamId: (id) => { setViewingTeamId(id); setActiveTeamId(id) },
        fetchTeamData,
        savePitch: wrappedSavePitch,
        voteForPitch: wrappedVoteForPitch,
        addComment: wrappedAddComment,
        saveTeamLog: wrappedSaveTeamLog,
        saveIdeaPost: wrappedSaveIdeaPost,
        addIdeaPostComment: wrappedAddIdeaPostComment,
        getScheduleData: api.getScheduleData,
        saveScheduleSlot: api.saveScheduleSlot,
        sendScheduleEmail: api.sendScheduleEmail,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
