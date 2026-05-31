'use client'

import { useState } from 'react'
import type { TeamLog, TeamData, Student } from '@/lib/google-script'
import { SmartImageGrid } from './smart-image-grid'
import { TEAM_THEMES } from '@/lib/constants'
import { IconChevronLeft, IconChevronRight, IconPrinter } from './icons'

interface BookViewProps {
  logs: TeamLog[]
  teamData: TeamData
  currentStudent: Student | null
  onClose: () => void
}

export function BookView({ logs, teamData, currentStudent, onClose }: BookViewProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const sortedLogs = [...(logs || [])].sort((a, b) => a.id - b.id)
  const totalPages = sortedLogs.length + 1 // +1 for cover
  const teamNum = currentStudent?.team || 1

  const goNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(p => p + 1)
    }
  }
  
  const goPrev = () => {
    if (currentPage > 0) {
      setCurrentPage(p => p - 1)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15,23,42,0.92)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      overflowY: 'auto',
      padding: '20px 16px 40px'
    }}>
      {/* Book toolbar */}
      <div style={{
        width: '100%',
        maxWidth: '794px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        background: 'rgba(30,27,75,0.8)',
        borderRadius: '12px',
        padding: '10px 16px',
        backdropFilter: 'blur(8px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>📖</span>
          <span style={{ color: '#c7d2fe', fontWeight: '700', fontSize: '14px' }}>Team {teamNum} - Research Notebook</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={() => window.print()} 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(99,102,241,0.3)',
              color: '#c7d2fe',
              border: '1px solid rgba(99,102,241,0.4)',
              borderRadius: '8px',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            <IconPrinter /><span>Print</span>
          </button>
          <button 
            onClick={onClose} 
            style={{
              background: 'rgba(239,68,68,0.2)',
              color: '#fca5a5',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px',
              padding: '6px 14px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '700'
            }}
          >
            Close
          </button>
        </div>
      </div>

      {/* Page display */}
      <div style={{ width: '100%', maxWidth: '794px', position: 'relative' }}>
        {currentPage === 0 
          ? <CoverPage teamData={teamData} teamNum={teamNum} totalPages={totalPages} />
          : <A4Page log={sortedLogs[currentPage - 1]} pageNum={currentPage + 1} totalPages={totalPages} teamNum={teamNum} />
        }
      </div>

      {/* Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginTop: '20px',
        padding: '10px 20px',
        background: 'rgba(30,27,75,0.8)',
        borderRadius: '40px',
        backdropFilter: 'blur(8px)'
      }}>
        <button 
          onClick={goPrev} 
          disabled={currentPage === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: currentPage === 0 ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.4)',
            color: currentPage === 0 ? '#4338ca' : '#e0e7ff',
            border: 'none',
            cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <IconChevronLeft />
        </button>
        
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button 
              key={i} 
              onClick={() => setCurrentPage(i)}
              style={{
                width: i === currentPage ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s',
                background: i === currentPage ? '#818cf8' : 'rgba(129,140,248,0.3)'
              }}
            />
          ))}
        </div>
        
        <button 
          onClick={goNext} 
          disabled={currentPage === totalPages - 1}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: currentPage === totalPages - 1 ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.4)',
            color: currentPage === totalPages - 1 ? '#4338ca' : '#e0e7ff',
            border: 'none',
            cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <IconChevronRight />
        </button>
      </div>
      
      <div style={{ color: 'rgba(148,163,184,0.6)', fontSize: '12px', marginTop: '8px' }}>
        {currentPage === 0 ? 'Cover' : 'Page ' + (currentPage + 1)} of {totalPages} - Use arrows or dots to navigate
      </div>
    </div>
  )
}

function CoverPage({ teamData, teamNum, totalPages }: { teamData: TeamData; teamNum: number; totalPages: number }) {
  const coverGradients: Record<number, string> = {
    1: 'linear-gradient(145deg,#0d1b2a,#1e3a5f,#2d5986)',
    2: 'linear-gradient(145deg,#042f2e,#134e4a,#1a6b64)',
    3: 'linear-gradient(145deg,#1a1833,#312e5a,#4a4580)',
    4: 'linear-gradient(145deg,#111827,#1f2937,#374151)'
  }

  return (
    <div 
      className="a4-page" 
      style={{
        width: '210mm',
        minHeight: '297mm',
        background: coverGradients[teamNum] || coverGradients[1],
        boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)',
        margin: '0 auto',
        borderRadius: '3px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div style={{ textAlign: 'center', color: 'white', padding: '40px' }}>
        <div style={{ fontSize: '80px', marginBottom: '20px' }}>🤖</div>
        <div style={{ 
          fontSize: '13px', 
          fontWeight: '700', 
          letterSpacing: '3px', 
          textTransform: 'uppercase', 
          color: 'rgba(199,210,254,0.8)', 
          marginBottom: '12px' 
        }}>
          Digital Research Notebook
        </div>
        <h1 style={{ 
          fontSize: '36px', 
          fontWeight: '900', 
          lineHeight: '1.2', 
          marginBottom: '16px', 
          background: 'linear-gradient(135deg, #a5b4fc, #e0e7ff)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent' 
        }}>
          Robots Meet Culture
        </h1>
        <div style={{ width: '60px', height: '3px', background: 'rgba(199,210,254,0.5)', margin: '0 auto 20px' }}></div>
        <div style={{ fontSize: '16px', fontWeight: '700', color: 'rgba(199,210,254,0.9)', marginBottom: '8px' }}>Team {teamNum}</div>
        <div style={{ fontSize: '13px', color: 'rgba(199,210,254,0.6)' }}>WRO 2026</div>
        <div style={{ marginTop: '60px', fontSize: '12px', color: 'rgba(199,210,254,0.4)', fontStyle: 'italic' }}>
          {(teamData?.logs?.length || 0)} journal entries recorded
        </div>
      </div>
      <div style={{ 
        position: 'absolute', 
        bottom: 20, 
        left: '50%', 
        transform: 'translateX(-50%)', 
        fontSize: '11px', 
        color: 'rgba(199,210,254,0.4)' 
      }}>
        Page 1 of {totalPages}
      </div>
    </div>
  )
}

function A4Page({ log, pageNum, totalPages, teamNum }: { log: TeamLog; pageNum: number; totalPages: number; teamNum: number }) {
  const images = log.imageUrls || []
  const ts = log.timestamp ? new Date(log.timestamp) : null
  const dateStr = ts ? ts.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''
  const timeStr = ts ? ts.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''
  
  const theme = TEAM_THEMES[teamNum] || TEAM_THEMES[1]
  const headerGradients: Record<number, string> = {
    1: 'linear-gradient(135deg, #1e3a5f 0%, #2d6ca3 100%)',
    2: 'linear-gradient(135deg, #134e4a 0%, #1d8a80 100%)',
    3: 'linear-gradient(135deg, #312e5a 0%, #6b68ab 100%)',
    4: 'linear-gradient(135deg, #374151 0%, #6b7280 100%)'
  }

  return (
    <div 
      className="a4-page" 
      style={{
        width: '210mm',
        minHeight: '297mm',
        background: 'white',
        boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)',
        margin: '0 auto',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '3px',
        paddingLeft: '25mm'
      }}
    >
      {/* Binding strip */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '25mm',
        background: 'linear-gradient(to right, rgba(0,0,0,0.04), rgba(0,0,0,0.01), transparent)',
        borderRight: '1px dashed rgba(0,0,0,0.08)',
        pointerEvents: 'none'
      }}></div>
      
      {/* Page header decoration */}
      <div style={{
        background: headerGradients[teamNum] || headerGradients[1],
        padding: '16px 20px 14px',
        marginLeft: '-25mm',
        paddingLeft: 'calc(25mm + 20px)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
        <div style={{ position: 'absolute', top: '5px', right: '60px', fontSize: '40px', opacity: '0.15' }}>⚙️</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>
              Team {teamNum} Research Notebook
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: '900', color: 'white', lineHeight: '1.3', margin: 0 }}>
              {log.title || 'Untitled Note'}
            </h2>
          </div>
          <div style={{ textAlign: 'right', color: 'rgba(255,255,255,0.8)', fontSize: '11px', marginLeft: '12px', flexShrink: 0 }}>
            <div style={{ fontWeight: '700' }}>{dateStr}</div>
            <div>{timeStr}</div>
          </div>
        </div>
      </div>
      
      {/* Page content */}
      <div style={{ padding: '16px 20px 40px 18px', position: 'relative' }}>
        {/* Meta info row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '14px', fontSize: '12px', color: '#64748b' }}>
          {log.location && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>📍 {log.location}</span>}
          {log.participants && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>👥 {log.participants}</span>}
          {log.author && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>✍️ {log.author}</span>}
        </div>

        {/* Smart image grid */}
        {images.length > 0 && <SmartImageGrid images={images} />}

        {/* Activity description */}
        {log.content && (
          <div style={{ marginBottom: '14px', padding: '12px', background: '#f8fafc', borderRadius: '8px', borderLeft: `3px solid ${theme.accent}` }}>
            <p style={{ fontSize: '13px', color: '#334155', lineHeight: '1.65', margin: 0, whiteSpace: 'pre-wrap' }}>{log.content}</p>
          </div>
        )}

        {/* Work details */}
        {(log.workDone || log.robotPart || log.codeFeature || log.testResult) && (
          <div style={{ marginBottom: '12px', padding: '12px', background: '#fffbeb', borderRadius: '8px', borderLeft: '3px solid #f59e0b' }}>
            <div style={{ fontSize: '10px', fontWeight: '800', color: '#92400e', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Work Details</div>
            {log.workDone && <p style={{ fontSize: '12px', color: '#78350f', margin: '0 0 4px 0' }}><strong>Done:</strong> {log.workDone}</p>}
            {log.robotPart && <p style={{ fontSize: '12px', color: '#78350f', margin: '0 0 4px 0' }}><strong>Robot Parts:</strong> {log.robotPart}</p>}
            {log.codeFeature && <p style={{ fontSize: '12px', color: '#78350f', margin: '0 0 4px 0' }}><strong>Code:</strong> {log.codeFeature}</p>}
            {log.testResult && <p style={{ fontSize: '12px', color: '#78350f', margin: 0 }}><strong>Test:</strong> {log.testResult}</p>}
          </div>
        )}

        {/* Progress & Plan */}
        {(log.progressStatus || log.nextPlan) && (
          <div style={{ marginBottom: '12px', padding: '12px', background: '#eff6ff', borderRadius: '8px', borderLeft: '3px solid #3b82f6' }}>
            <div style={{ fontSize: '10px', fontWeight: '800', color: '#1e40af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Progress & Plan</div>
            {log.progressStatus && <p style={{ fontSize: '12px', color: '#1e3a8a', margin: '0 0 4px 0' }}><strong>Current Progress:</strong> {log.progressStatus}</p>}
            {log.nextPlan && <p style={{ fontSize: '12px', color: '#1e3a8a', margin: 0 }}><strong>Next Session Plan:</strong> {log.nextPlan}</p>}
          </div>
        )}

        {/* Member notes */}
        {log.memberNotes && (
          <div style={{ marginBottom: '12px', padding: '12px', background: '#fdf2f8', borderRadius: '8px', borderLeft: '3px solid #ec4899' }}>
            <div style={{ fontSize: '10px', fontWeight: '800', color: '#9d174d', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Notes</div>
            <p style={{ fontSize: '12px', color: '#831843', margin: 0 }}>{log.memberNotes}</p>
          </div>
        )}
      </div>

      {/* Page number */}
      <div style={{ position: 'absolute', bottom: '12px', right: '20px', fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>
        Page {pageNum} of {totalPages}
      </div>
      
      {/* Corner decoration */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        right: 0, 
        width: 0, 
        height: 0, 
        borderStyle: 'solid', 
        borderWidth: '0 28px 28px 0', 
        borderColor: 'transparent rgba(255,255,255,0.3) transparent transparent' 
      }}></div>
    </div>
  )
}
