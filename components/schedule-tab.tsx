'use client'

import { useState, useEffect } from 'react'
import { useApp } from './app-context'
import { TEAM_COLORS, DAY_NAMES, SHIFTS, NUM_TEAMS } from '@/lib/constants'

function getMondayOfWeek(offset: number) {
  const today = new Date()
  const day = today.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(today)
  monday.setDate(today.getDate() + diff + offset * 7)
  monday.setHours(0, 0, 0, 0)
  return monday
}

function formatDateSlash(d: Date) {
  return (d.getMonth() + 1) + '/' + d.getDate()
}

function getWeekKey(offset: number) {
  const mon = getMondayOfWeek(offset)
  return mon.getFullYear() + '-' + String(mon.getMonth() + 1).padStart(2, '0') + '-' + String(mon.getDate()).padStart(2, '0')
}

function formatMonthDay(d: Date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return months[d.getMonth()] + ' ' + d.getDate()
}

export function ScheduleTab() {
  const { currentStudent, getScheduleData, saveScheduleSlot, sendScheduleEmail } = useApp()
  
  const [weekOffset, setWeekOffset] = useState(0)
  const [allSlots, setAllSlots] = useState<Record<string, Record<number, Record<string, number[]>>>>({})
  const [loading, setLoading] = useState(false)
  const [addingFor, setAddingFor] = useState<{ dayIdx: number; shiftKey: string } | null>(null)

  const isCoach = currentStudent?.role === 'coach'
  const myTeamId = currentStudent?.team || null
  const canManage = (tid: number) => isCoach || tid === myTeamId

  const weekKey = getWeekKey(weekOffset)
  const monday = getMondayOfWeek(weekOffset)
  const days = DAY_NAMES.map((name, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return { name, date: d }
  })
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const isCurrentWeek = weekOffset === 0
  const isToday = (d: Date) => d.getTime() === today.getTime()
  const teamList = Array.from({ length: NUM_TEAMS }, (_, i) => i + 1)

  const loadSchedule = async () => {
    setLoading(true)
    try {
      const data = await getScheduleData()
      setAllSlots(data || {})
    } catch {
      setAllSlots({})
    }
    setLoading(false)
  }

  useEffect(() => {
    loadSchedule()
  }, [weekOffset])

  const currentSlots = allSlots[weekKey] || {}
  const getSlot = (dayIdx: number, shiftKey: string): number[] => {
    const s = currentSlots[dayIdx]?.[shiftKey]
    return s ? s.map(Number) : []
  }

  const mutateSlot = async (dayIdx: number, shiftKey: string, teamId: number, action: 'add' | 'remove') => {
    setLoading(true)
    try {
      const data = await saveScheduleSlot({
        weekKey,
        dayIdx,
        shiftKey,
        teamId,
        action,
        bookedBy: currentStudent?.name || 'Unknown'
      })
      setAllSlots(data || {})
    } catch {
      // Handle error silently
    }
    setLoading(false)
  }

  const addTeam = async (dayIdx: number, shiftKey: string, teamId: number) => {
    if (!canManage(teamId)) return
    await mutateSlot(dayIdx, shiftKey, teamId, 'add')
    setAddingFor(null)
    
    // Send email notification
    const shiftObj = SHIFTS.find(s => s.key === shiftKey)
    const weekLabel = formatMonthDay(days[0].date) + ' - ' + formatMonthDay(days[4].date)
    
    sendScheduleEmail({
      teamId,
      dayName: days[dayIdx].name + ' ' + formatDateSlash(days[dayIdx].date),
      shiftLabel: shiftObj?.label || shiftKey,
      weekLabel,
      bookedBy: currentStudent?.name || 'Unknown'
    }).catch(() => {})
  }

  const removeTeam = async (dayIdx: number, shiftKey: string, teamId: number) => {
    if (!canManage(teamId)) return
    await mutateSlot(dayIdx, shiftKey, teamId, 'remove')
  }

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg,#f8faff,#eef2ff)', padding: '16px 20px', borderRadius: '14px', marginBottom: '16px', border: '1px solid #e0e7ff' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#3730a3', margin: '0 0 4px' }}>Weekly Practice Schedule</h2>
        <p style={{ fontSize: '13px', color: '#6366f1', margin: 0 }}>Assign your team&apos;s lunch and afternoon practice slots for each week.</p>
      </div>

      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
        {/* Rules bar */}
        <div style={{ background: '#1e1b4b', color: '#c7d2fe', fontSize: '12px', fontWeight: '600', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span>Rules: <strong>Lunch max 2 teams</strong> - <strong>Afternoon max 3 teams</strong> per slot</span>
          <span style={{ opacity: 0.5 }}>-</span>
          <span>Absence: report ASAP</span>
          <span style={{ opacity: 0.5 }}>-</span>
          <span>Need more slots: contact teacher</span>
          {loading && <span style={{ marginLeft: 'auto', fontSize: '11px', opacity: 0.7 }}>Syncing...</span>}
        </div>

        {/* Week navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
          <button onClick={() => setWeekOffset(w => w - 1)} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
            Prev
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: '800', fontSize: '15px', color: '#1e293b' }}>
              Week of {formatMonthDay(days[0].date)} – {formatMonthDay(days[4].date)}
            </div>
            {isCurrentWeek && <div style={{ fontSize: '11px', color: '#6366f1', fontWeight: '600' }}>( This week )</div>}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {!isCurrentWeek && (
              <button onClick={() => setWeekOffset(0)} style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: '#6366f1', color: 'white', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
                Today
              </button>
            )}
            <button onClick={() => setWeekOffset(w => w + 1)} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
              Next
            </button>
          </div>
        </div>

        {/* Grid */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '540px' }}>
            <thead>
              <tr>
                <th style={{ width: '100px', padding: '10px 12px', fontSize: '12px', fontWeight: '700', color: '#64748b', textAlign: 'left', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}></th>
                {days.map((d, i) => (
                  <th key={i} style={{ 
                    padding: '10px 8px', 
                    fontSize: '13px', 
                    fontWeight: '800', 
                    color: isToday(d.date) ? '#7c3aed' : '#334155', 
                    textAlign: 'center', 
                    background: isToday(d.date) ? '#f5f3ff' : '#f8fafc', 
                    borderBottom: '1px solid #e2e8f0', 
                    borderLeft: '1px solid #f1f5f9' 
                  }}>
                    <div>{d.name}</div>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: isToday(d.date) ? '#7c3aed' : '#94a3b8', marginTop: '2px' }}>{formatDateSlash(d.date)}</div>
                    {isToday(d.date) && <div style={{ width: '6px', height: '6px', background: '#7c3aed', borderRadius: '50%', margin: '3px auto 0' }}></div>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SHIFTS.map((shift) => (
                <tr key={shift.key}>
                  <td style={{ padding: '10px 12px', fontSize: '12px', fontWeight: '700', color: '#475569', background: '#f8fafc', borderRight: '1px solid #e2e8f0', borderTop: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{shift.label}</span>
                      <span style={{ fontSize: '10px', background: '#e0e7ff', color: '#4338ca', borderRadius: '4px', padding: '1px 5px', fontWeight: '700' }}>max {shift.maxTeams}</span>
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '500', marginTop: '2px' }}>{shift.time}</div>
                  </td>
                  {days.map((d, dayIdx) => {
                    const teams = getSlot(dayIdx, shift.key)
                    const isFull = teams.length >= shift.maxTeams
                    const isActive = addingFor?.dayIdx === dayIdx && addingFor?.shiftKey === shift.key
                    const addable = teamList.filter(tid => !teams.includes(tid) && canManage(tid))
                    const canShowAdd = addable.length > 0 && !isFull && !loading
                    
                    return (
                      <td key={dayIdx} style={{ padding: '8px', verticalAlign: 'top', background: isToday(d.date) ? '#faf8ff' : 'white', borderLeft: '1px solid #f1f5f9', borderTop: '1px solid #f1f5f9', minWidth: '110px' }}>
                        {teams.map(tid => {
                          const c = TEAM_COLORS[tid] || TEAM_COLORS[1]
                          return (
                            <div key={tid} style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between', 
                              background: c.bg, 
                              border: `1px solid ${c.border}`, 
                              borderRadius: '8px', 
                              padding: '4px 8px', 
                              marginBottom: '4px', 
                              fontSize: '12px', 
                              fontWeight: '700', 
                              color: c.text 
                            }}>
                              <span>Team {tid}</span>
                              {canManage(tid) && !loading && (
                                <button 
                                  onClick={() => removeTeam(dayIdx, shift.key, tid)} 
                                  style={{ marginLeft: '6px', background: 'none', border: 'none', cursor: 'pointer', color: c.text, fontSize: '13px', lineHeight: '1', padding: '0 2px', opacity: 0.7 }}
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          )
                        })}
                        {isFull && <div style={{ fontSize: '10px', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '2px 0' }}>Full</div>}
                        {!isActive && canShowAdd && (
                          <button 
                            onClick={() => setAddingFor({ dayIdx, shiftKey: shift.key })}
                            style={{ width: '100%', padding: '5px', borderRadius: '8px', border: '1.5px dashed #cbd5e1', background: 'transparent', cursor: 'pointer', fontSize: '12px', color: '#94a3b8', fontWeight: '600', marginTop: teams.length > 0 ? '2px' : '0' }}
                          >
                            + Add
                          </button>
                        )}
                        {isActive && (
                          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px', marginTop: teams.length > 0 ? '2px' : '0' }}>
                            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>Pick your team:</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '4px' }}>
                              {addable.map(tid => {
                                const c = TEAM_COLORS[tid] || TEAM_COLORS[1]
                                return (
                                  <button 
                                    key={tid} 
                                    onClick={() => addTeam(dayIdx, shift.key, tid)}
                                    style={{ padding: '3px 8px', borderRadius: '6px', border: `1px solid ${c.border}`, background: c.bg, color: c.text, cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}
                                  >
                                    Team {tid}
                                  </button>
                                )
                              })}
                            </div>
                            <button onClick={() => setAddingFor(null)} style={{ fontSize: '10px', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>
                              Cancel
                            </button>
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Team legend */}
        <div style={{ padding: '10px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          {teamList.map(tid => {
            const c = TEAM_COLORS[tid] || TEAM_COLORS[1]
            return (
              <span key={tid} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '600', color: '#475569' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: c.dot, display: 'inline-block' }}></span>
                Team {tid}
              </span>
            )
          })}
          <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#94a3b8', cursor: 'pointer' }} onClick={loadSchedule}>
            Refresh
          </span>
        </div>
      </div>
    </div>
  )
}
