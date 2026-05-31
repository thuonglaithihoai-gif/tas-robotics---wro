// Constants used across the app

export const THEMES = [
  { id: "01", title: "Traditional Decorative Patterns", focus: "Dong Son - Dong Ho Folk Art - Hue Patterns", problem: "How can robots showcase Vietnam's decorative heritage?" },
  { id: "02", title: "Cultural Heritage Site Guide", focus: "Museums - Historical Sites - Living Culture", problem: "How can a robot guide visitors through heritage sites?" },
  { id: "03", title: "Vietnamese Traditional Instruments", focus: "Dan Bau - Dan Tranh - T'rung - Trong", problem: "How can robots help people understand traditional music?" },
  { id: "04", title: "Traditional Craft Villages", focus: "Van Phuc Silk - Bat Trang Ceramics - Dong Ky Wood", problem: "How can robots preserve and promote craft village skills?" },
  { id: "05", title: "Traditional Arts in the Classroom", focus: "Folk Art - Music - Dance - Storytelling", problem: "How can robots make traditional arts accessible to students?" },
  { id: "06", title: "Costumes & Performing Arts", focus: "The 54 Ethnic Groups of Vietnam", problem: "How can robots present Vietnam's diverse cultural costumes?" },
  { id: "07", title: "Custom Theme (Propose your own)", focus: "Creative Freedom", problem: "Define your own problem statement!" }
]

export const TEAM_COLORS: Record<number, { bg: string; border: string; text: string; dot: string }> = {
  1: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af', dot: '#3b82f6' },
  2: { bg: '#d1fae5', border: '#10b981', text: '#065f46', dot: '#10b981' },
  3: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', dot: '#f59e0b' },
  4: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b', dot: '#ef4444' },
  5: { bg: '#f3e8ff', border: '#a855f7', text: '#6b21a8', dot: '#a855f7' },
}

export const TEAM_THEMES: Record<number, { accent: string; light: string; text: string; gradient: string }> = {
  1: { accent: '#1e3a5f', light: '#dbeafe', text: '#1e3a5f', gradient: 'linear-gradient(135deg,#1e3a5f,#2d5986)' },
  2: { accent: '#134e4a', light: '#ccfbf1', text: '#134e4a', gradient: 'linear-gradient(135deg,#134e4a,#1a6b64)' },
  3: { accent: '#312e5a', light: '#ede9fe', text: '#312e5a', gradient: 'linear-gradient(135deg,#312e5a,#4a4580)' },
  4: { accent: '#374151', light: '#f3f4f6', text: '#374151', gradient: 'linear-gradient(135deg,#1f2937,#374151)' },
}

export const TEAM_DRIVE_LINKS: Record<number, string> = {
  1: 'https://drive.google.com/drive/folders/1z1CnZ9SRDR9A7Ly6zrjH95GJpeNxz5lx?usp=drive_link',
  2: 'https://drive.google.com/drive/folders/1916SKI5SLEdOxtaoHxCkVq2k7AwL55qF?usp=drive_link',
  3: 'https://drive.google.com/drive/folders/1X2W__Np7GJ-4Hnq7MYtk5idr8DpUOvdw?usp=drive_link',
  4: 'https://drive.google.com/drive/folders/1y8m01hbxnY97usoSfslnxSm8gPaukaH-?usp=drive_link',
  5: 'https://drive.google.com/drive/folders/1J5ct86WGR9k2rnxtaJNha3UvbO8RmKLp?usp=drive_link',
}

export const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

export const SHIFTS = [
  { key: 'lunch', label: 'Lunch', time: '12:30-13:00', maxTeams: 2 },
  { key: 'afternoon', label: 'Afternoon', time: '15:00-16:30', maxTeams: 3 },
]

export const NUM_TEAMS = 5
