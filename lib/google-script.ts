// Helper to call Google Apps Script Web App
// You need to deploy your Google Apps Script as a Web App and set the URL in NEXT_PUBLIC_GOOGLE_SCRIPT_URL

const SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || ''

interface GoogleScriptResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

async function callGoogleScript<T = unknown>(
  action: string,
  payload?: Record<string, unknown>
): Promise<T> {
  if (!SCRIPT_URL) {
    throw new Error('Google Script URL not configured. Please set NEXT_PUBLIC_GOOGLE_SCRIPT_URL environment variable.')
  }

  const response = await fetch(SCRIPT_URL, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: JSON.stringify({
      action,
      ...payload,
    }),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const result: GoogleScriptResponse<T> = await response.json()
  
  if (!result.success && result.error) {
    throw new Error(result.error)
  }

  return result.data as T
}

// API Functions matching your Google Apps Script functions

export interface Student {
  id: string
  name: string
  team: number
  role: string | number
}

export interface TeamLog {
  id: number
  teamId: number
  author: string
  title: string
  content: string
  location?: string
  participants?: string
  timestamp: string
  imageUrls?: string[]
  workDone?: string
  robotPart?: string
  codeFeature?: string
  testResult?: string
  progressStatus?: string
  nextPlan?: string
  memberNotes?: string
}

export interface Pitch {
  roleId: number
  themeId: string
  themeTitle: string
  customFocus?: string
  studentName: string
  answers: {
    q1?: string
    q2?: string
    q3?: string
    notes?: string
  }
  comments?: Array<{ author: string; text: string }>
}

export interface Vote {
  voterName: string
  targetRoleId: number
}

export interface IdeaPost {
  id: number
  teamId: number
  author: string
  content: string
  timestamp: string
  imageUrls?: string[]
  comments?: Array<{ author: string; text: string }>
}

export interface TeamData {
  logs: TeamLog[]
  pitches: Pitch[]
  votes: Vote[]
  ideaPosts: IdeaPost[]
}

export interface InitialData {
  students: Student[]
}

export interface ScheduleSlot {
  [dayIdx: number]: {
    lunch?: number[]
    afternoon?: number[]
  }
}

export interface ScheduleData {
  [weekKey: string]: ScheduleSlot
}

// API Functions

export async function getInitialData(): Promise<InitialData> {
  return callGoogleScript<InitialData>('getInitialData')
}

export async function getTeamData(teamId: number): Promise<TeamData> {
  return callGoogleScript<TeamData>('getTeamData', { teamId })
}

export async function savePitch(payload: {
  teamId: number
  roleId: number | string
  studentName: string
  themeId: string
  themeTitle: string
  customFocus?: string
  answers: { q1?: string; q2?: string; q3?: string; notes?: string }
}): Promise<TeamData> {
  return callGoogleScript<TeamData>('savePitch', { payload: JSON.stringify(payload) })
}

export async function voteForPitch(payload: {
  teamId: number
  voterName: string
  targetRoleId: number
}): Promise<TeamData> {
  return callGoogleScript<TeamData>('voteForPitch', { payload: JSON.stringify(payload) })
}

export async function addComment(payload: {
  teamId: number
  author: string
  targetRoleId: number
  text: string
}): Promise<TeamData> {
  return callGoogleScript<TeamData>('addComment', { payload: JSON.stringify(payload) })
}

export async function saveTeamLog(payload: {
  teamId: number
  author: string
  title: string
  content: string
  location?: string
  participants?: string
  imagesBase64?: string[]
  workDone?: string
  robotPart?: string
  codeFeature?: string
  testResult?: string
  progressStatus?: string
  nextPlan?: string
  memberNotes?: string
}): Promise<TeamData> {
  return callGoogleScript<TeamData>('saveTeamLog', { payload: JSON.stringify(payload) })
}

export async function saveIdeaPost(payload: {
  teamId: number
  author: string
  content: string
  imagesBase64?: string[]
}): Promise<TeamData> {
  return callGoogleScript<TeamData>('saveIdeaPost', { payload: JSON.stringify(payload) })
}

export async function addIdeaPostComment(payload: {
  teamId: number
  postId: number
  author: string
  text: string
}): Promise<TeamData> {
  return callGoogleScript<TeamData>('addIdeaPostComment', { payload: JSON.stringify(payload) })
}

export async function getScheduleData(): Promise<ScheduleData> {
  return callGoogleScript<ScheduleData>('getScheduleData')
}

export async function saveScheduleSlot(payload: {
  weekKey: string
  dayIdx: number
  shiftKey: string
  teamId: number
  action: 'add' | 'remove'
  bookedBy: string
}): Promise<ScheduleData> {
  return callGoogleScript<ScheduleData>('saveScheduleSlot', { payload: JSON.stringify(payload) })
}

export async function sendScheduleEmail(payload: {
  teamId: number
  dayName: string
  shiftLabel: string
  weekLabel: string
  bookedBy: string
}): Promise<void> {
  return callGoogleScript<void>('sendScheduleEmail', { payload: JSON.stringify(payload) })
}
