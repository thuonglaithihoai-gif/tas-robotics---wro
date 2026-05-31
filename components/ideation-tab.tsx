'use client'

import { useState } from 'react'
import { useApp } from './app-context'
import { SmartImageGrid } from './smart-image-grid'
import { THEMES } from '@/lib/constants'
import { IconSend, IconCamera, IconHeart } from './icons'

export function IdeationTab() {
  const { 
    currentStudent, 
    students, 
    teamData, 
    activeTeamId, 
    saveIdeaPost, 
    addIdeaPostComment,
    voteForPitch,
    addComment 
  } = useApp()
  
  const [newIdeaPost, setNewIdeaPost] = useState({ content: "", imagesBase64: [] as string[] })
  const [ideaUploadStatus, setIdeaUploadStatus] = useState("")
  const [postCommentInputs, setPostCommentInputs] = useState<Record<number, string>>({})
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({})
  const [expandedPosts, setExpandedPosts] = useState<Record<number, boolean>>({})
  const [expandedAnswers, setExpandedAnswers] = useState<Record<number, boolean>>({})

  const togglePost = (id: number) => setExpandedPosts(prev => ({ ...prev, [id]: !prev[id] }))
  const toggleAnswer = (key: number) => setExpandedAnswers(prev => ({ ...prev, [key]: !prev[key] }))

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

  const handleIdeaImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    if (newIdeaPost.imagesBase64.length + files.length > 4) {
      alert("Max 4 images per post.")
      return
    }
    setIdeaUploadStatus("compressing")
    const results = await Promise.all(files.map(processImageFile))
    setNewIdeaPost(prev => ({ ...prev, imagesBase64: [...prev.imagesBase64, ...results] }))
    setIdeaUploadStatus("")
  }

  const removeIdeaImage = (idx: number) => {
    setNewIdeaPost(prev => ({ ...prev, imagesBase64: prev.imagesBase64.filter((_, i) => i !== idx) }))
  }

  const handlePostIdea = async () => {
    if (!newIdeaPost.content && !newIdeaPost.imagesBase64.length) {
      alert("Please write your thoughts or attach at least one image.")
      return
    }
    if (!currentStudent) return
    
    setIdeaUploadStatus("uploading")
    try {
      await saveIdeaPost({
        teamId: activeTeamId,
        author: currentStudent.name,
        content: newIdeaPost.content,
        imagesBase64: newIdeaPost.imagesBase64
      })
      setNewIdeaPost({ content: "", imagesBase64: [] })
      alert("Idea posted!")
    } catch (err) {
      alert("Post failed: " + (err instanceof Error ? err.message : err))
    }
    setIdeaUploadStatus("")
  }

  const handleAddPostComment = async (postId: number) => {
    const text = postCommentInputs[postId]
    if (!text || !currentStudent) return
    
    await addIdeaPostComment({
      teamId: activeTeamId,
      postId,
      author: currentStudent.name,
      text
    })
    setPostCommentInputs({ ...postCommentInputs, [postId]: "" })
  }

  const handleVote = async (targetRoleId: number) => {
    if (!currentStudent) return
    await voteForPitch({
      teamId: activeTeamId,
      voterName: currentStudent.name,
      targetRoleId
    })
  }

  const handleAddComment = async (targetRoleId: number) => {
    const text = commentInputs[targetRoleId]
    if (!text || !currentStudent) return
    
    await addComment({
      teamId: activeTeamId,
      author: currentStudent.name,
      targetRoleId,
      text
    })
    setCommentInputs({ ...commentInputs, [targetRoleId]: "" })
  }

  return (
    <>
      {/* Idea Post Composer */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">Share an Idea</h3>
        <p className="text-sm text-slate-500 mb-4">Post your thoughts, reference photos, sketches - let your teammates comment!</p>
        <textarea 
          className="w-full p-3 border-2 border-slate-200 rounded-xl min-h-[90px] focus:ring-0 focus:border-indigo-400 text-base"
          placeholder="Share your idea or research finding..." 
          value={newIdeaPost.content}
          onChange={e => setNewIdeaPost({ ...newIdeaPost, content: e.target.value })} 
        />
        
        {newIdeaPost.imagesBase64.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {newIdeaPost.imagesBase64.map((img, idx) => (
              <div key={idx} className="relative">
                <img src={img} alt={`Idea ${idx}`} className="h-24 w-24 object-cover rounded-xl border-2 border-slate-200" />
                <button 
                  onClick={() => removeIdeaImage(idx)} 
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold hover:bg-red-600"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between mt-3 gap-3">
          <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-600 font-semibold hover:bg-indigo-50 hover:border-indigo-300 transition-colors">
            <IconCamera /><span>Photos (max 4)</span>
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleIdeaImageUpload} />
          </label>
          <button 
            disabled={ideaUploadStatus !== ""} 
            onClick={handlePostIdea} 
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors"
          >
            <IconSend />
            {ideaUploadStatus === "uploading" ? "Posting..." : ideaUploadStatus === "compressing" ? "Optimizing..." : "Post Idea"}
          </button>
        </div>
      </div>

      {/* Idea Posts Feed */}
      <div className="space-y-5 mb-10">
        {(!teamData.ideaPosts || teamData.ideaPosts.length === 0) ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 italic">
            No ideas posted yet. Be the first!
          </div>
        ) : (
          teamData.ideaPosts.slice().sort((a, b) => b.id - a.id).map(post => (
            <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-bold text-slate-800">{post.author}</div>
                  <div className="text-xs text-slate-400">{new Date(post.timestamp).toLocaleString()}</div>
                </div>
              </div>
              
              {post.content && (
                <div className="mb-3">
                  <p className={`text-slate-700 whitespace-pre-wrap ${!expandedPosts[post.id] ? 'line-clamp-[7]' : ''}`}>
                    {post.content}
                  </p>
                  {(post.content.split('\n').length > 7 || post.content.length > 350) && (
                    <button onClick={() => togglePost(post.id)} className="text-xs text-indigo-600 font-bold mt-1 hover:underline">
                      {expandedPosts[post.id] ? 'Collapse' : 'Read more'}
                    </button>
                  )}
                </div>
              )}
              
              {post.imageUrls && post.imageUrls.length > 0 && <SmartImageGrid images={post.imageUrls} />}
              
              <div className="border-t border-slate-100 pt-3 mt-2">
                <h5 className="text-xs font-bold text-slate-500 uppercase mb-2">Comments</h5>
                <div className="space-y-2 mb-3 max-h-[150px] overflow-y-auto">
                  {post.comments && post.comments.length > 0 ? post.comments.map((cmt, idx) => (
                    <div key={idx} className={`p-2 rounded-lg text-sm ${cmt.author === currentStudent?.name ? "bg-indigo-50 text-indigo-900" : "bg-slate-50 text-slate-700"}`}>
                      <strong>{cmt.author}:</strong> {cmt.text}
                    </div>
                  )) : <div className="text-xs text-slate-400 italic">No comments yet.</div>}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    className="flex-1 p-2 border-2 border-slate-200 rounded-lg text-sm focus:ring-0 focus:border-indigo-400" 
                    placeholder="Add a comment..." 
                    value={postCommentInputs[post.id] || ""} 
                    onChange={e => setPostCommentInputs({ ...postCommentInputs, [post.id]: e.target.value })} 
                    onKeyDown={e => e.key === 'Enter' && handleAddPostComment(post.id)} 
                  />
                  <button 
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700" 
                    onClick={() => handleAddPostComment(post.id)}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pitches Grid */}
      <div className="grid grid-cols-1 gap-6 pt-8 border-t-2 border-dashed border-indigo-200">
        {[1, 2, 3].map(roleId => {
          const sub = (teamData.pitches || []).find(p => p.roleId === roleId)
          const themeInfo = sub ? THEMES.find(t => t.id === sub.themeId) : null
          const votes = (teamData.votes || []).filter(v => v.targetRoleId === roleId)
          const hasVoted = votes.some(v => v.voterName === currentStudent?.name)
          const memberName = students.find(s => s.team === activeTeamId && s.role === roleId)?.name || '(empty)'

          return (
            <div key={roleId} className={`bg-white rounded-2xl shadow-sm border-t-4 ${sub ? 'border-t-indigo-500' : 'border-t-slate-200'} border border-slate-200 overflow-hidden`}>
              <div className="py-4 px-6 bg-slate-50 flex flex-row items-center justify-between rounded-t-2xl border-b border-slate-100">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase">Member {roleId}</div>
                  <div className="text-lg font-bold text-slate-800">{memberName}</div>
                </div>
                {sub ? (
                  <button 
                    onClick={() => handleVote(roleId)} 
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${hasVoted ? "bg-red-50 border-red-200 text-red-600" : "bg-white border-slate-200 text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600"}`}
                  >
                    <IconHeart filled={hasVoted} /><span className="font-bold text-sm">{votes.length}</span>
                  </button>
                ) : <span className="text-sm text-slate-400 italic">No submission yet...</span>}
              </div>
              
              {sub && themeInfo && (
                <div className="p-6">
                  <div className="mb-4 inline-block bg-indigo-100 text-indigo-800 text-sm font-bold px-3 py-1.5 rounded-lg">
                    Theme: {sub.themeTitle}{sub.customFocus && sub.themeId === "07" ? " — " + sub.customFocus : ""}
                  </div>
                  
                  <div style={{ overflow: 'hidden', maxHeight: expandedAnswers[roleId] ? 'none' : '11em', position: 'relative' }}>
                    <div className="grid grid-cols-1 gap-3 mb-2">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <span className="text-xs font-bold text-slate-500 uppercase">Q1: Problem</span>
                        <p className="text-slate-800 mt-1 text-sm">{sub.answers?.q1 || '—'}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <span className="text-xs font-bold text-slate-500 uppercase">Q2: Solution</span>
                        <p className="text-slate-800 mt-1 text-sm">{sub.answers?.q2 || '—'}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <span className="text-xs font-bold text-slate-500 uppercase">Q3: Unique Factor</span>
                        <p className="text-slate-800 mt-1 text-sm">{sub.answers?.q3 || '—'}</p>
                      </div>
                      {sub.answers?.notes && (
                        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                          <span className="text-xs font-bold text-amber-700 uppercase">Notes</span>
                          <p className="text-amber-900 mt-1 text-sm">{sub.answers.notes}</p>
                        </div>
                      )}
                    </div>
                    {!expandedAnswers[roleId] && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50px', background: 'linear-gradient(transparent, white)' }}></div>
                    )}
                  </div>
                  
                  <button onClick={() => toggleAnswer(roleId)} className="text-xs text-indigo-600 font-bold mt-2 hover:underline">
                    {expandedAnswers[roleId] ? 'Show less' : 'Show full pitch'}
                  </button>
                  
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <h5 className="text-xs font-bold text-slate-500 uppercase mb-2">Comments</h5>
                    <div className="space-y-2 mb-3 max-h-[150px] overflow-y-auto">
                      {(sub.comments || []).length > 0 ? (sub.comments || []).map((c, i) => (
                        <div key={i} className={`p-2 rounded-lg text-sm ${c.author === currentStudent?.name ? "bg-indigo-50 text-indigo-900" : "bg-slate-50 text-slate-700"}`}>
                          <strong>{c.author}:</strong> {c.text}
                        </div>
                      )) : <div className="text-xs text-slate-400 italic">No comments yet.</div>}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        className="flex-1 p-2 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-400" 
                        placeholder="Comment..." 
                        value={commentInputs[roleId] || ""} 
                        onChange={e => setCommentInputs({ ...commentInputs, [roleId]: e.target.value })} 
                        onKeyDown={e => e.key === 'Enter' && handleAddComment(roleId)} 
                      />
                      <button 
                        className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700" 
                        onClick={() => handleAddComment(roleId)}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
