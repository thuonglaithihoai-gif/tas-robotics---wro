'use client'

import { useState } from 'react'
import { useApp } from './app-context'
import { SmartImageGrid } from './smart-image-grid'
import { TEAM_THEMES } from '@/lib/constants'
import { IconSend, IconCamera, IconCalendar, IconMapPin, IconUsers, IconBook, IconList } from './icons'
import { BookView } from './book-view'

export function JournalTab() {
  const { currentStudent, students, teamData, activeTeamId, saveTeamLog } = useApp()
  
  const [showBookView, setShowBookView] = useState(false)
  const [journalViewMode, setJournalViewMode] = useState<'list' | 'book'>('list')
  const [uploadStatus, setUploadStatus] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [newLog, setNewLog] = useState({
    title: "",
    content: "",
    location: "",
    participants: [] as string[],
    imagesBase64: [] as string[],
    workDone: "",
    robotPart: "",
    codeFeature: "",
    testResult: "",
    progressStatus: "",
    nextPlan: "",
    memberNotes: ""
  })

  const journalLogs = teamData.logs || []
  const theme = TEAM_THEMES[activeTeamId] || TEAM_THEMES[1]

  const processImageFile = (file: File): Promise<string> => new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        const MAX = 1200
        let w = img.width, h = img.height
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round(h * MAX / w); w = MAX }
          else { w = Math.round(w * MAX / h); h = MAX }
        }
        const canvas = document.createElement("canvas")
        canvas.width = w
        canvas.height = h
        canvas.getContext("2d")?.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL("image/jpeg", 0.75))
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    if (newLog.imagesBase64.length + files.length > 6) {
      alert("Max 6 images per log entry.")
      return
    }
    setUploadStatus("compressing")
    const results = await Promise.all(files.map(processImageFile))
    setNewLog(prev => ({ ...prev, imagesBase64: [...prev.imagesBase64, ...results] }))
    setUploadStatus("")
  }

  const removeImage = (idx: number) => {
    setNewLog(prev => ({ ...prev, imagesBase64: prev.imagesBase64.filter((_, i) => i !== idx) }))
  }

  const submitLog = async () => {
    if (!newLog.title || !newLog.content) {
      alert("Please fill in the Title and Activity details!")
      return
    }
    if (!currentStudent) return

    setUploadStatus("uploading")
    setUploadProgress(15)
    
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval)
          return 95
        }
        return prev + Math.floor(Math.random() * 6) + 2
      })
    }, 350)

    try {
      await saveTeamLog({
        teamId: activeTeamId,
        author: currentStudent.name,
        title: newLog.title,
        content: newLog.content,
        location: newLog.location,
        participants: newLog.participants.join(", ") || currentStudent.name,
        imagesBase64: newLog.imagesBase64,
        workDone: newLog.workDone,
        robotPart: newLog.robotPart,
        codeFeature: newLog.codeFeature,
        testResult: newLog.testResult,
        progressStatus: newLog.progressStatus,
        nextPlan: newLog.nextPlan,
        memberNotes: newLog.memberNotes
      })
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      setTimeout(() => {
        setNewLog({
          title: "",
          content: "",
          location: "",
          participants: [],
          imagesBase64: [],
          workDone: "",
          robotPart: "",
          codeFeature: "",
          testResult: "",
          progressStatus: "",
          nextPlan: "",
          memberNotes: ""
        })
        setUploadStatus("")
        setUploadProgress(0)
        alert("Journal Updated Successfully!")
      }, 500)
    } catch (err) {
      clearInterval(progressInterval)
      setUploadStatus("")
      setUploadProgress(0)
      alert("Upload failed: " + (err instanceof Error ? err.message : err))
    }
  }

  const teamMembers = students.filter(s => s.team === activeTeamId && s.role !== 'coach')

  return (
    <>
      {showBookView && (
        <BookView 
          logs={journalLogs} 
          teamData={teamData} 
          currentStudent={currentStudent} 
          onClose={() => setShowBookView(false)} 
        />
      )}
      
      <div className="flex flex-col lg:flex-row gap-6" style={{ display: showBookView ? 'none' : 'flex' }}>
        {/* Left: Add Log Form */}
        {currentStudent?.role !== 'coach' && (
          <div style={{ width: '100%', maxWidth: '420px', flexShrink: 0 }}>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-4">
              <div style={{ background: theme.gradient, padding: '16px 20px' }}>
                <h3 style={{ color: 'white', fontWeight: '800', fontSize: '16px', margin: 0 }}>Add Progress Log</h3>
                <p style={{ color: 'rgba(199,210,254,0.8)', fontSize: '12px', margin: '4px 0 0' }}>Each entry becomes a notebook page</p>
              </div>
              
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Title *</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Week 1: First Robot Build" 
                    className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:border-indigo-400 focus:ring-0 font-semibold" 
                    value={newLog.title} 
                    onChange={e => setNewLog({ ...newLog, title: e.target.value })} 
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Activity Description *</label>
                  <textarea 
                    placeholder="Describe the activity, challenges faced, and solutions..." 
                    className="w-full p-3 border-2 border-slate-200 rounded-xl min-h-[90px] text-sm focus:border-indigo-400 focus:ring-0 resize-none" 
                    value={newLog.content} 
                    onChange={e => setNewLog({ ...newLog, content: e.target.value })} 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Location</label>
                    <input 
                      type="text" 
                      placeholder="Robotics Lab" 
                      className="w-full p-2.5 border-2 border-slate-200 rounded-xl text-sm focus:border-indigo-400 focus:ring-0" 
                      value={newLog.location} 
                      onChange={e => setNewLog({ ...newLog, location: e.target.value })} 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Members</label>
                    <div className="border-2 border-slate-200 rounded-xl p-2 max-h-24 overflow-y-auto">
                      {teamMembers.map(s => (
                        <label key={s.id} className="flex items-center gap-2 text-xs cursor-pointer py-0.5">
                          <input 
                            type="checkbox" 
                            checked={newLog.participants.includes(s.name)} 
                            className="w-3 h-3 accent-indigo-600"
                            onChange={e => {
                              const parts = newLog.participants
                              setNewLog({
                                ...newLog,
                                participants: e.target.checked 
                                  ? [...parts, s.name] 
                                  : parts.filter(n => n !== s.name)
                              })
                            }}
                          />
                          <span className="font-medium text-slate-700">{s.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '12px' }}>
                  <div className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-2">Work Details</div>
                  <div className="space-y-2">
                    <input type="text" placeholder="What did the team do today?" className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:border-indigo-400 focus:ring-0" value={newLog.workDone} onChange={e => setNewLog({ ...newLog, workDone: e.target.value })} />
                    <input type="text" placeholder="Robot parts built / assembled..." className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:border-indigo-400 focus:ring-0" value={newLog.robotPart} onChange={e => setNewLog({ ...newLog, robotPart: e.target.value })} />
                    <input type="text" placeholder="New code feature(s) added..." className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:border-indigo-400 focus:ring-0" value={newLog.codeFeature} onChange={e => setNewLog({ ...newLog, codeFeature: e.target.value })} />
                    <input type="text" placeholder="Test results..." className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:border-indigo-400 focus:ring-0" value={newLog.testResult} onChange={e => setNewLog({ ...newLog, testResult: e.target.value })} />
                  </div>
                </div>
                
                <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '12px' }}>
                  <div className="text-xs font-bold text-sky-700 uppercase tracking-wide mb-2">Progress & Plan</div>
                  <div className="space-y-2">
                    <input type="text" placeholder="Current research progress / where are we now?" className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:border-indigo-400 focus:ring-0" value={newLog.progressStatus} onChange={e => setNewLog({ ...newLog, progressStatus: e.target.value })} />
                    <input type="text" placeholder="Plan for the next session..." className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:border-indigo-400 focus:ring-0" value={newLog.nextPlan} onChange={e => setNewLog({ ...newLog, nextPlan: e.target.value })} />
                    <input type="text" placeholder="Special notes for team members..." className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:border-indigo-400 focus:ring-0" value={newLog.memberNotes} onChange={e => setNewLog({ ...newLog, memberNotes: e.target.value })} />
                  </div>
                </div>
                
                {/* Photo upload */}
                <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '12px' }}>
                  <div className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Photos</div>
                  {newLog.imagesBase64.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {newLog.imagesBase64.map((img, idx) => (
                        <div key={idx} className="relative">
                          <img src={img} alt={`img${idx}`} className="w-full h-16 object-cover rounded-lg border border-slate-200" />
                          <button onClick={() => removeImage(idx)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">x</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <label className="w-full cursor-pointer flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 text-sm font-semibold hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                    <IconCamera /><span>Add Photos (max 6)</span>
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
                
                {/* Upload progress */}
                {uploadStatus ? (
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>{uploadStatus === "compressing" ? "Optimizing..." : "Uploading..."}</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full">
                      <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: uploadProgress + '%' }}></div>
                    </div>
                  </div>
                ) : (
                  <button onClick={submitLog} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
                    <IconSend /> Save to Journal
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Right: Journal Feed */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h3 className="text-2xl font-bold text-slate-800">Team Journey (Portfolio)</h3>
              <span className="text-sm text-slate-500">{journalLogs.length} {journalLogs.length === 1 ? 'Entry' : 'Entries'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <button 
                  onClick={() => setJournalViewMode('list')} 
                  title="List View"
                  style={{
                    padding: '8px 14px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '13px',
                    background: journalViewMode === 'list' ? '#4338ca' : 'transparent',
                    color: journalViewMode === 'list' ? 'white' : '#64748b',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <IconList /><span>List</span>
                </button>
                <button 
                  onClick={() => { setJournalViewMode('book'); setShowBookView(true) }} 
                  title="Book View"
                  style={{
                    padding: '8px 14px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '13px',
                    background: journalViewMode === 'book' ? '#4338ca' : 'transparent',
                    color: journalViewMode === 'book' ? 'white' : '#64748b',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <IconBook /><span>Book</span>
                </button>
              </div>
              {journalLogs.length > 0 && (
                <button 
                  onClick={() => setShowBookView(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: theme.gradient,
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '13px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.25)'
                  }}
                >
                  Open Notebook
                </button>
              )}
            </div>
          </div>
          
          {journalLogs.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '20px', border: '2px dashed #e2e8f0', padding: '60px 30px', textAlign: 'center' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>📔</div>
              <h4 style={{ fontWeight: '800', color: '#334155', fontSize: '18px', marginBottom: '8px' }}>No journal entries yet</h4>
              <p style={{ color: '#94a3b8', fontSize: '14px' }}>Add your first progress log using the form on the left. Each entry will become a page in your research notebook!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {journalLogs.sort((a, b) => b.id - a.id).map((log) => {
                const images = log.imageUrls || []
                const hasImages = images.length > 0
                const ts = log.timestamp ? new Date(log.timestamp) : null
                
                return (
                  <div 
                    key={log.id} 
                    className="group"
                    style={{ 
                      background: 'white', 
                      borderRadius: '20px', 
                      boxShadow: '0 2px 12px rgba(0,0,0,0.07)', 
                      border: '1px solid #e2e8f0', 
                      overflow: 'hidden', 
                      transition: 'box-shadow 0.2s' 
                    }}
                  >
                    {/* Card header */}
                    <div style={{ background: theme.gradient, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ color: 'white', fontWeight: '800', fontSize: '16px', margin: 0, flex: 1 }}>{log.title}</h4>
                      <div style={{ color: 'rgba(199,210,254,0.85)', fontSize: '11px', textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                        {ts && <div style={{ fontWeight: '700' }}>{ts.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>}
                        {ts && <div>{ts.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>}
                      </div>
                    </div>
                    
                    <div className="p-5">
                      {/* Meta info */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '14px', fontSize: '12px', color: '#64748b' }}>
                        {ts && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><IconCalendar /> {ts.toLocaleDateString()}</span>}
                        {log.author && <span><strong>By:</strong> {log.author}</span>}
                        {log.location && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><IconMapPin /> {log.location}</span>}
                        {log.participants && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><IconUsers /> {log.participants}</span>}
                      </div>
                      
                      {/* Content layout */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {hasImages && <SmartImageGrid images={images} />}
                        {log.content && (
                          <p style={{ fontSize: '14px', color: '#334155', lineHeight: '1.7', whiteSpace: 'pre-wrap', margin: 0 }}>{log.content}</p>
                        )}
                      </div>
                      
                      {/* Work Details */}
                      {(log.workDone || log.robotPart || log.codeFeature || log.testResult) && (
                        <div style={{ marginTop: '14px', padding: '12px 14px', background: '#fffbeb', borderRadius: '12px', borderLeft: '3px solid #f59e0b' }}>
                          <div style={{ fontSize: '10px', fontWeight: '800', color: '#92400e', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Work Details</div>
                          {log.workDone && <p style={{ fontSize: '13px', color: '#78350f', margin: '0 0 4px 0' }}><strong>Done:</strong> {log.workDone}</p>}
                          {log.robotPart && <p style={{ fontSize: '13px', color: '#78350f', margin: '0 0 4px 0' }}><strong>Robot Parts:</strong> {log.robotPart}</p>}
                          {log.codeFeature && <p style={{ fontSize: '13px', color: '#78350f', margin: '0 0 4px 0' }}><strong>Code:</strong> {log.codeFeature}</p>}
                          {log.testResult && <p style={{ fontSize: '13px', color: '#78350f', margin: 0 }}><strong>Test:</strong> {log.testResult}</p>}
                        </div>
                      )}
                      
                      {/* Progress & Plan */}
                      {(log.progressStatus || log.nextPlan) && (
                        <div style={{ marginTop: '10px', padding: '12px 14px', background: '#eff6ff', borderRadius: '12px', borderLeft: '3px solid #3b82f6' }}>
                          <div style={{ fontSize: '10px', fontWeight: '800', color: '#1e40af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Progress & Plan</div>
                          {log.progressStatus && <p style={{ fontSize: '13px', color: '#1e3a8a', margin: '0 0 4px 0' }}><strong>Current Progress:</strong> {log.progressStatus}</p>}
                          {log.nextPlan && <p style={{ fontSize: '13px', color: '#1e3a8a', margin: 0 }}><strong>Next Session Plan:</strong> {log.nextPlan}</p>}
                        </div>
                      )}
                      
                      {/* Member Notes */}
                      {log.memberNotes && (
                        <div style={{ marginTop: '10px', padding: '12px 14px', background: '#fdf2f8', borderRadius: '12px', borderLeft: '3px solid #ec4899' }}>
                          <div style={{ fontSize: '10px', fontWeight: '800', color: '#9d174d', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Notes</div>
                          <p style={{ fontSize: '13px', color: '#831843', margin: 0 }}>{log.memberNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
