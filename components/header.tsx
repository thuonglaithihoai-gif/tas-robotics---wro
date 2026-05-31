'use client'

import { useApp } from './app-context'
import { TEAM_THEMES, TEAM_DRIVE_LINKS } from '@/lib/constants'

interface HeaderProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function Header({ activeTab, setActiveTab }: HeaderProps) {
  const { currentStudent, viewingTeamId, setViewingTeamId, handleLogout } = useApp()
  
  if (!currentStudent) return null

  const theme = TEAM_THEMES[currentStudent.team] || TEAM_THEMES[1]

  return (
    <>
      {/* Header */}
      <header 
        style={{ 
          maxWidth: '1100px', 
          margin: '0 auto 20px', 
          background: theme.gradient, 
          borderRadius: '16px', 
          padding: '16px 24px', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)' 
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '32px' }}>🤖</span>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '900', color: 'white', margin: 0, lineHeight: '1.2' }}>
                Robots Meet Culture
              </h1>
              <p style={{ fontSize: '12px', color: 'rgba(199,210,254,0.8)', margin: 0 }}>
                WRO 2026 - Team {currentStudent.role !== 'coach' ? currentStudent.team : 'Admin'} Research Workspace
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ 
              background: 'rgba(255,255,255,0.15)', 
              color: 'white', 
              padding: '6px 14px', 
              borderRadius: '20px', 
              fontSize: '13px', 
              fontWeight: '700' 
            }}>
              {currentStudent.name}
            </span>
            
            {currentStudent.role === 'coach' && (
              <select 
                style={{ 
                  padding: '6px 12px', 
                  borderRadius: '10px', 
                  border: '2px solid rgba(255,255,255,0.3)', 
                  background: 'rgba(255,255,255,0.1)', 
                  color: 'white', 
                  fontWeight: '700', 
                  fontSize: '13px', 
                  cursor: 'pointer' 
                }}
                value={viewingTeamId} 
                onChange={e => setViewingTeamId(parseInt(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6].map(t => (
                  <option key={t} value={t} style={{ color: '#1e1b4b' }}>View Team {t}</option>
                ))}
              </select>
            )}
            
            <button 
              style={{ 
                background: 'rgba(255,255,255,0.15)', 
                color: 'rgba(199,210,254,0.9)', 
                border: 'none', 
                borderRadius: '8px', 
                padding: '6px 12px', 
                cursor: 'pointer', 
                fontSize: '13px', 
                fontWeight: '600' 
              }}
              onClick={handleLogout}
            >
              Sign Out
            </button>
            
            {currentStudent.team && TEAM_DRIVE_LINKS[currentStudent.team] && (
              <a 
                href={TEAM_DRIVE_LINKS[currentStudent.team]} 
                target="_blank" 
                rel="noreferrer"
                style={{ 
                  background: 'rgba(255,255,255,0.15)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  padding: '6px 12px', 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  textDecoration: 'none' 
                }}
              >
                Drive
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div style={{ 
        maxWidth: '1100px', 
        margin: '0 auto', 
        display: 'flex', 
        background: 'white', 
        borderRadius: '14px', 
        padding: '4px', 
        marginBottom: '20px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)', 
        border: '1px solid #e2e8f0' 
      }}>
        {currentStudent.role !== 'coach' && (
          <TabButton 
            label="Theme Selection" 
            icon="🧠" 
            isActive={activeTab === 'draft'} 
            onClick={() => setActiveTab('draft')} 
            teamNum={currentStudent.team}
          />
        )}
        <TabButton 
          label="Ideation Board" 
          icon="💡" 
          isActive={activeTab === 'team'} 
          onClick={() => setActiveTab('team')} 
          teamNum={currentStudent.team}
        />
        <TabButton 
          label="Team Journal" 
          icon="📖" 
          isActive={activeTab === 'journal'} 
          onClick={() => setActiveTab('journal')} 
          teamNum={currentStudent.team}
        />
        <TabButton 
          label="Schedule" 
          icon="📅" 
          isActive={activeTab === 'schedule'} 
          onClick={() => setActiveTab('schedule')} 
          teamNum={currentStudent.team}
        />
      </div>
    </>
  )
}

function TabButton({ label, icon, isActive, onClick, teamNum }: {
  label: string
  icon: string
  isActive: boolean
  onClick: () => void
  teamNum: number
}) {
  const theme = TEAM_THEMES[teamNum] || TEAM_THEMES[1]
  
  return (
    <button 
      style={{ 
        flex: 1, 
        padding: '11px', 
        borderRadius: '10px', 
        fontWeight: '700', 
        fontSize: '14px', 
        border: 'none', 
        cursor: 'pointer', 
        transition: 'all 0.2s',
        background: isActive ? theme.gradient : 'transparent',
        color: isActive ? 'white' : '#64748b'
      }}
      onClick={onClick}
    >
      {icon} {label}
    </button>
  )
}
