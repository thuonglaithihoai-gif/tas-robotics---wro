'use client'

import { useState, useEffect } from 'react'
import { useApp } from './app-context'
import { THEMES } from '@/lib/constants'
import { IconBook, IconSend } from './icons'

export function ThemeSelectionTab() {
  const { currentStudent, teamData, activeTeamId, savePitch } = useApp()
  const [editingThemeId, setEditingThemeId] = useState("")
  const [customFocus, setCustomFocus] = useState("")
  const [formData, setFormData] = useState({ q1: "", q2: "", q3: "", notes: "" })

  const editingTheme = THEMES.find(t => t.id === editingThemeId) || null

  useEffect(() => {
    if (!currentStudent || !editingThemeId) {
      setFormData({ q1: "", q2: "", q3: "", notes: "" })
      return
    }
    const existing = (teamData.pitches || []).find(
      p => p.roleId === currentStudent.role && p.themeId === editingThemeId
    )
    if (existing && existing.answers) {
      setFormData({
        q1: existing.answers.q1 || "",
        q2: existing.answers.q2 || "",
        q3: existing.answers.q3 || "",
        notes: existing.answers.notes || ""
      })
    } else {
      setFormData({ q1: "", q2: "", q3: "", notes: "" })
    }
  }, [currentStudent?.id, editingThemeId, teamData.pitches])

  const handleSavePitch = async () => {
    if (!currentStudent || !editingTheme) return
    try {
      await savePitch({
        teamId: currentStudent.team,
        roleId: currentStudent.role,
        studentName: currentStudent.name,
        themeId: editingTheme.id,
        themeTitle: editingTheme.id === "07" ? "Custom Theme" : editingTheme.title,
        customFocus: editingTheme.id === "07" ? customFocus : editingTheme.focus,
        answers: formData
      })
      alert("Saved to Ideation Board!")
    } catch (err) {
      alert("Failed to save: " + (err instanceof Error ? err.message : err))
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div style={{ background: 'linear-gradient(135deg, #f8faff, #eef2ff)', padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
        <h2 className="text-lg font-bold flex items-center gap-2 text-indigo-900">
          <IconBook /> Select a Research Theme
        </h2>
        <select 
          className="w-full mt-3 p-3 rounded-xl border-2 border-indigo-200 font-semibold text-slate-800 focus:border-indigo-500"
          value={editingThemeId} 
          onChange={e => setEditingThemeId(e.target.value)}
        >
          <option value="">-- Click to select a theme --</option>
          {THEMES.map(t => (
            <option key={t.id} value={t.id}>Theme {t.id}: {t.title}</option>
          ))}
        </select>
      </div>

      {editingTheme && (
        <div className="p-6 space-y-6">
          <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
            {editingTheme.id === "07" ? (
              <div className="space-y-2">
                <label className="font-bold text-indigo-900">What is the title of your custom theme?</label>
                <input 
                  type="text" 
                  className="w-full p-2 rounded-lg border border-indigo-200 focus:ring-1 focus:ring-indigo-500" 
                  placeholder="e.g., Water Puppet Restoration..." 
                  value={customFocus} 
                  onChange={e => setCustomFocus(e.target.value)} 
                />
              </div>
            ) : (
              <>
                <h3 className="font-bold text-indigo-900 text-lg mb-1">{editingTheme.title}</h3>
                <p className="text-indigo-600 text-sm font-semibold mb-3">Focus: {editingTheme.focus}</p>
                <div className="bg-white p-3 rounded-lg border border-indigo-200">
                  <span className="text-xs font-bold text-indigo-500 uppercase">Core Problem</span>
                  <p className="text-indigo-900 font-semibold mt-1">{editingTheme.problem}</p>
                </div>
              </>
            )}
          </div>

          <div className="space-y-4">
            {[
              { key: 'q1', label: 'Q1: What problem does your robot solve?' },
              { key: 'q2', label: 'Q2: How does your robot work? (Design & mechanism)' },
              { key: 'q3', label: 'Q3: What makes your solution unique?' }
            ].map(q => (
              <div key={q.key}>
                <label className="block text-sm font-bold text-slate-700 mb-2">{q.label}</label>
                <textarea 
                  className="w-full p-3 border-2 border-slate-200 rounded-xl min-h-[90px] focus:ring-0 focus:border-indigo-400 text-sm"
                  value={formData[q.key as keyof typeof formData]} 
                  onChange={e => setFormData({ ...formData, [q.key]: e.target.value })} 
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Additional Notes / Sketches description</label>
              <textarea 
                className="w-full p-3 border-2 border-slate-200 rounded-xl min-h-[70px] focus:ring-0 focus:border-indigo-400 text-sm"
                value={formData.notes} 
                onChange={e => setFormData({ ...formData, notes: e.target.value })} 
              />
            </div>
          </div>

          <button 
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
            onClick={handleSavePitch}
          >
            <IconSend /> Save to Ideation Board
          </button>
        </div>
      )}
    </div>
  )
}
