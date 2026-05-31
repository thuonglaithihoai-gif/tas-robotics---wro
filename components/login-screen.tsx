'use client'

import { useApp } from './app-context'

export function LoginScreen() {
  const {
    students,
    currentStudent,
    loginError,
    selectedStudentId,
    enteredPin,
    setSelectedStudentId,
    setEnteredPin,
    handleUnlock,
  } = useApp()

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4" 
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1e3a5f 100%)' }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div style={{ fontSize: '56px', marginBottom: '12px' }}>🤖</div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: 'white', letterSpacing: '-0.5px' }}>
            Robots Meet Culture
          </h1>
          <p style={{ color: 'rgba(199,210,254,0.7)', fontSize: '14px', marginTop: '6px' }}>
            WRO 2026 - Team Research Notebook
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Select Your Name
              </label>
              <select 
                className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-0 font-semibold text-slate-800"
                value={selectedStudentId} 
                onChange={e => setSelectedStudentId(e.target.value)}
              >
                <option value="">-- Choose Name --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.role === 'coach' ? '(Admin)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {currentStudent && currentStudent.role !== 'coach' && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  PIN Code (Team {currentStudent.team})
                </label>
                <input 
                  type="password" 
                  placeholder="Enter Team PIN (4 digits)" 
                  maxLength={4}
                  className="w-full border-2 border-slate-200 rounded-xl text-center font-bold text-2xl tracking-widest p-3 focus:border-indigo-500 focus:ring-0"
                  value={enteredPin} 
                  onChange={e => setEnteredPin(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleUnlock()}
                />
              </div>
            )}

            {loginError && (
              <p className="text-red-600 text-sm font-semibold text-center">
                {loginError}
              </p>
            )}

            <button 
              className="w-full py-4 text-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors disabled:opacity-40"
              disabled={!currentStudent || (!enteredPin && currentStudent?.role !== 'coach')} 
              onClick={handleUnlock}
            >
              Enter Workspace
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
