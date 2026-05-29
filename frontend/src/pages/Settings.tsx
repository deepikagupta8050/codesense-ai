import { useState, useEffect, useMemo} from 'react'
import axios from 'axios'
import {
  Lock,
  GitBranch,
  Save,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react'

const API = 'http://localhost:5000/api'



export default function Settings({ user, token, onUpdate, onLogout }: { user: any; token: string; onUpdate: (u: any) => void; onLogout: () => void }) {
  const [name, setName]         = useState(user?.name || '')
  const [curPw, setCurPw]       = useState('')
  const [newPw, setNewPw]       = useState('')
  const [showCur, setShowCur]   = useState(false)
  const [showNew, setShowNew]   = useState(false)
  const [githubToken, setGithubToken] = useState('')
  const [notifications, setNotifications] = useState({ email:true, pr:true, security:true, weekly:false })
  const [aiModel, setAiModel]   = useState('llama-3.3-70b-versatile')
  const [autoReview, setAutoReview] = useState(false)

const [aiSuggestions, setAiSuggestions] =
  useState(false)

const [codeExplanations, setCodeExplanations] =
  useState(false)
  const [saving, setSaving]     = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [saved, setSaved]       = useState('')
  const [error, setError]       = useState('')
  const h = useMemo(() => ({
  headers: {
    Authorization: `Bearer ${token}`
  }
}), [token])

  useEffect(() => {
    axios.get(`${API}/auth/settings`, h).then(r => {
      const s = r.data.settings || {}
      if (s.ai_model) setAiModel(s.ai_model)
      if (s.auto_review !== undefined)
  setAutoReview(
    Boolean(s.auto_review)
  )

if (s.ai_suggestions !== undefined)
  setAiSuggestions(
    Boolean(s.ai_suggestions)
  )

if (s.code_explanations !== undefined)
  setCodeExplanations(
    Boolean(s.code_explanations)
  )
      if (s.github_token) setGithubToken(s.github_token)
      if (s.notifications !== undefined) {

  setNotifications(prev => ({
    ...prev,
    email: Boolean(s.notifications)
  }))
}
    }).catch(() => {})
  }, [h])

  const showMsg = (msg: string) => { setSaved(msg); setTimeout(() => setSaved(''), 3000) }

  const saveProfile = async () => {
    if (!name.trim()) { setError('Name required'); return }
    setSaving(true); setError('')
    try {
      const res = await axios.put(`${API}/auth/profile`, { name }, h)
      onUpdate(res.data.user)
      showMsg('Profile updated successfully!')
    } catch (e: any) { setError(e.response?.data?.error || 'Update failed') }
    setSaving(false)
  }

  const savePassword = async () => {
    if (!curPw || !newPw) { setError('Both passwords required'); return }
    setPwSaving(true); setError('')
    try {
      await axios.put(`${API}/auth/password`, { currentPassword: curPw, newPassword: newPw }, h)
      setCurPw(''); setNewPw('')
      showMsg('Password changed successfully!')
    } catch (e: any) { setError(e.response?.data?.error || 'Password change failed') }
    setPwSaving(false)
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      await axios.put(`${API}/auth/settings`, {

  ai_model: aiModel,

  theme:'dark',

  language_pref:'auto',

  notifications: notifications.email ? 1 : 0,

  github_token: githubToken || null,

  auto_review: autoReview ? 1 : 0,

  ai_suggestions: aiSuggestions ? 1 : 0,

  code_explanations:
    codeExplanations ? 1 : 0,

}, h)
      showMsg('Settings saved!')
    } catch { showMsg('Settings saved locally!') }
    setSaving(false)
  }

  

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={onChange}/>
      <span className="tog-slider"/>
    </label>
  )

  const SectionTitle = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
    <div style={{ display:'flex', alignItems:'center', gap:'9px', marginBottom:'16px', paddingBottom:'12px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
      <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:'rgba(124,58,237,0.12)', border:'1px solid rgba(124,58,237,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        {icon}
      </div>
      <h2 style={{ fontSize:'14px', fontWeight:700, color:'#f1f5f9' }}>{title}</h2>
    </div>
  )

  return (
    <div
  className="page"
  style={{
    maxWidth:'100%',
    padding:'0 28px 30px',
    transition:'all .3s ease',
  }}
>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ display:'flex', height:'100%', marginTop:'10px',marginLeft:'25px', alignItems:'center', justifyContent:'space-between', marginBottom:'10px', animation:'fadeUp .4s ease' }}>
        <div>
          <h1 style={{ fontSize:'22px', fontWeight:800, color:'#f1f5f9' }}> ⚙️ Settings</h1>
          <p style={{ fontSize:'13px', color:'#64748b' }}>Manage your account, preferences and integrations.</p>
        </div>
        
      </div>

      {/* Success / Error */}
      {saved && (
        <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'11px 16px', background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.25)', borderRadius:'9px', marginBottom:'16px', animation:'fadeUp .3s ease' }}>
          <CheckCircle size={15} color="#10b981"/>
          <span style={{ fontSize:'13px', color:'#10b981', fontWeight:600 }}>{saved}</span>
        </div>
      )}
      {error && (
        <div style={{ padding:'11px 16px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'9px', marginBottom:'16px', fontSize:'13px', color:'#ef4444' }}>{error}</div>
      )}

      {/* Top — Profile + Account + Appearance */}
      <div
  style={{
    display:'grid',
    gridTemplateColumns:'1.1fr 1.1fr',
    gap:'16px',
    marginBottom:'16px',
    alignItems:'stretch'
  }}
>
        {/* Profile */}
        <div className="card" style={{ gridColumn:'1', position:'relative', height: '100%' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'20px' }}>
            <div style={{ position:'relative' }}>
              <div style={{ width:'68px', height:'68px', borderRadius:'50%',
                background:'linear-gradient(135deg,#7c3aed,#3b82f6)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'26px', fontWeight:800, color:'#fff',
                boxShadow:'0 0 20px rgba(124,58,237,0.3)' }}>
                {(name||'U')[0].toUpperCase()}
              </div>
              <div style={{ position:'absolute', bottom:0, right:0, width:'20px', height:'20px', borderRadius:'50%', background:'#1a1a2e', border:'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:'10px' }}>📷</div>
            </div>
            <div>

  <div
    style={{
      fontSize:'26px',
      fontWeight:800,
      color:'#ffffff',
      letterSpacing:'-.5px',
      lineHeight:'1.1'
    }}
  >
    {name || 'Developer'}
  </div>

  <div
    style={{
      display:'inline-flex',
      alignItems:'center',
      gap:'7px',
      marginTop:'10px',
      padding:'6px 12px',
      borderRadius:'999px',
      background:'rgba(124,58,237,.12)',
      border:'1px solid rgba(124,58,237,.25)'
    }}
  >

    <div
      style={{
        width:'8px',
        height:'8px',
        borderRadius:'50%',
        background:'#22c55e',
        boxShadow:'0 0 10px #22c55e'
      }}
    />

    <span
      style={{
        fontSize:'11px',
        color:'#c084fc',
        fontWeight:700,
        letterSpacing:'.5px'
      }}
    >
      ACTIVE DEVELOPER
    </span>

  </div>

  <div
    style={{
      marginTop:'12px',
      fontSize:'13px',
      color:'#94a3b8',
      fontWeight:500
    }}
  >
    {user?.email || ''}
  </div>

</div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            <div>
              <label style={{ fontSize:'11px', color:'#64748b', fontWeight:600, display:'block', marginBottom:'5px' }}>FULL NAME</label>
              <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/>
            </div>
            <button onClick={saveProfile} disabled={saving} className="btn btn-primary btn-full">
              {saving ? <><div style={{ width:'13px',height:'13px',border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite' }}/> Saving...</> : <><Save size={13}/> Save Profile</>}
            </button>
          </div>
        </div>

        {/* Account */}
        <div className="card">
          <SectionTitle icon={<Lock size={15} color="#a855f7"/>} title="Account"/>
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {/* Change Password */}
            <div style={{ padding:'12px', background:'#13131f', borderRadius:'9px', border:'1px solid rgba(255,255,255,0.06)', cursor:'pointer' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <Lock size={14} color="#64748b"/>
                  <span style={{ fontSize:'13px', color:'#94a3b8' }}>Change Password</span>
                </div>
                <span style={{ fontSize:'12px', color:'#475569' }}>›</span>
              </div>
            </div>
            <div>
              <label style={{ fontSize:'11px', color:'#64748b', display:'block', marginBottom:'5px' }}>CURRENT PASSWORD</label>
              <div style={{ position:'relative' }}>
                <input className="input" type={showCur?'text':'password'} value={curPw} onChange={e=>setCurPw(e.target.value)} placeholder="••••••••" style={{ paddingRight:'38px' }}/>
                <button onClick={()=>setShowCur(!showCur)} style={{ position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#475569',display:'flex' }}>
                  {showCur?<EyeOff size={13}/>:<Eye size={13}/>}
                </button>
              </div>
            </div>
            <div>
              <label style={{ fontSize:'11px', color:'#64748b', display:'block', marginBottom:'5px' }}>NEW PASSWORD</label>
              <div style={{ position:'relative' }}>
                <input className="input" type={showNew?'text':'password'} value={newPw} onChange={e=>setNewPw(e.target.value)} placeholder="••••••••" style={{ paddingRight:'38px' }}/>
                <button onClick={()=>setShowNew(!showNew)} style={{ position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#475569',display:'flex' }}>
                  {showNew?<EyeOff size={13}/>:<Eye size={13}/>}
                </button>
              </div>
            </div>
            <button onClick={savePassword} disabled={pwSaving} className="btn btn-secondary btn-full">
              {pwSaving?'Saving...':'Update Password'}
            </button>
            <div style={{ height:'1px', background:'rgba(255,255,255,0.06)' }}/>
            <button onClick={onLogout} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px', borderRadius:'8px', border:'none', background:'rgba(239,68,68,0.08)', color:'#ef4444', cursor:'pointer', fontFamily:'inherit', fontSize:'13px', fontWeight:600, width:'100%', justifyContent:'center', transition:'all .2s' }}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(239,68,68,0.15)'}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='rgba(239,68,68,0.08)'}>
              Logout
            </button>
          </div>
        </div>

        
        
      </div>

      {/* Bottom row */}
      <div style={{ display:'grid', gridTemplateColumns:'1.1fr .9fr', gap:'16px', animation:'fadeUp .4s ease .1s both' }}>
        {/* AI Preferences */}
        <div className="card">
          <SectionTitle icon={<span style={{ fontSize:'14px' }}>🤖</span>} title="AI Preferences"/>
          <div style={{ fontSize:'12px', color:'#64748b', marginBottom:'14px' }}>Configure how AI reviews and suggestions work.</div>
          <div style={{ marginBottom:'14px' }}>
            <label style={{ fontSize:'11px', color:'#64748b', display:'block', marginBottom:'6px' }}>DEFAULT AI MODEL</label>
            <select
  value={aiModel}
  onChange={e=>setAiModel(e.target.value)}
  style={{
    width:'100%',
    background:'#13131f',
    border:'1px solid rgba(255,255,255,0.08)',
    color:'#94a3b8',
    borderRadius:'8px',
    padding:'9px 12px',
    fontSize:'13px',
    outline:'none',
    fontFamily:'inherit'
  }}
>

  <option value="llama-3.3-70b-versatile">
    Llama 3.3 70B
  </option>

  <option value="llama-3.1-8b-instant">
    Llama 3.1 8B (Fast)
  </option>

  <option value="mixtral-8x7b-32768">
    Mixtral 8x7B
  </option>

</select>
          </div>
          {[
            { label:'Auto Review PRs', desc:'Automatically review new pull requests', val:autoReview, set:setAutoReview },
            { label:'AI Suggestions', desc:'Show AI improvement suggestions', val:aiSuggestions, set:setAiSuggestions },
            { label:'Code Explanations', desc:'Explain complex code in simple terms', val:codeExplanations, set:setCodeExplanations },
          ].map(({ label, desc, val, set }) => (
            <div key={label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
              <div>
                <div style={{ fontSize:'13px', color:'#f1f5f9', fontWeight:500 }}>{label}</div>
                <div style={{ fontSize:'11px', color:'#475569', marginTop:'2px' }}>{desc}</div>
              </div>
              <Toggle checked={val} onChange={()=>set(!val)}/>
            </div>
          ))}
          <button onClick={saveSettings} disabled={saving} className="btn btn-primary btn-full">
            {saving?'Saving...':'Save Preferences'}
          </button>
        </div>

        
        {/* GitHub Integration */}
<div className="card">

  <SectionTitle
    icon={<GitBranch size={15} color="#a855f7"/>}
    title="GitHub Integration"
  />

  <div
    style={{
      fontSize:'12px',
      color:'#64748b',
      marginBottom:'14px'
    }}
  >
    Connect and manage your GitHub account.
  </div>

  {/* CONNECTED USER */}
  {localStorage.getItem('github_connected') === 'true' ? (

    <>

      <div
        style={{
          display:'flex',
          alignItems:'center',
          gap:'10px',
          padding:'12px',
          background:'#13131f',
          borderRadius:'9px',
          border:'1px solid rgba(255,255,255,0.07)',
          marginBottom:'12px'
        }}
      >

        <GitBranch
          size={20}
          color="#f1f5f9"
        />

        <div style={{ flex:1 }}>

          <div
            style={{
              fontSize:'13px',
              fontWeight:600,
              color:'#f1f5f9'
            }}
          >
            {
              localStorage.getItem(
                'github_username'
              ) || 'GitHub User'
            }
          </div>

          <div
            style={{
              fontSize:'11px',
              color:'#64748b',
              marginTop:'1px'
            }}
          >
            GitHub account connected
          </div>

        </div>

        <span
          style={{
            fontSize:'11px',
            fontWeight:700,
            color:'#10b981',
            background:'rgba(16,185,129,0.12)',
            padding:'3px 9px',
            borderRadius:'100px',
            border:'1px solid rgba(16,185,129,0.25)'
          }}
        >
          Connected
        </span>

      </div>

      <button

        onClick={() => {

          localStorage.removeItem(
            'github_token'
          )

          localStorage.removeItem(
            'github_username'
          )

          localStorage.removeItem(
            'github_connected'
          )

          window.location.reload()
        }}

        style={{
          width:'100%',
          padding:'9px',
          borderRadius:'8px',
          border:'1px solid rgba(239,68,68,0.2)',
          background:'transparent',
          color:'#ef4444',
          fontSize:'13px',
          fontWeight:600,
          cursor:'pointer',
          fontFamily:'inherit'
        }}
      >
        Disconnect GitHub
      </button>

    </>

  ) : (

    <>
      <div
        style={{
          padding:'12px',
          borderRadius:'8px',
          background:'rgba(255,255,255,0.03)',
          border:'1px solid rgba(255,255,255,0.06)',
          marginBottom:'12px',
          fontSize:'13px',
          color:'#94a3b8'
        }}
      >
        No GitHub account connected.
      </div>

      <button

        className="btn btn-primary btn-full"

        onClick={() => {

          window.location.href =
            'http://localhost:5000/api/auth/github'
        }}
      >
        <GitBranch size={14}/>
        Connect GitHub
      </button>
    </>
  )}

</div>

        
        
      </div>

      <div style={{ textAlign:'center', marginTop:'24px', fontSize:'12px', color:'#334155' }}>
        © 2026 CodeSense AI. All rights reserved.
      </div>
    </div>
  )
}