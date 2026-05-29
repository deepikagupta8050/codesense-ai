import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Eye, EyeOff, GitBranch, Mail, Lock } from 'lucide-react'

export default function Login({ onLogin }: { onLogin: (token: string, user: any) => void }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [modal, setModal] = useState<'privacy'|'terms'|null>(null)

  const submit = async () => {
    setError('')
    if (!email || !password) { setError('Email aur password required hai'); return }
    setLoading(true)
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password })
      onLogin(res.data.token, res.data.user)
    } catch (e: any) {
      setError(e.response?.data?.error || 'Login failed. Please try again.')
    }
    setLoading(false)
  }

  const demoLogin = async () => {
    setLoading(true)
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email: 'demo@codesense.ai', password: 'demo123' })
      onLogin(res.data.token, res.data.user)
    } catch { setError('Demo login failed') }
    setLoading(false)
  }

  return (
    <div style={{ display:'flex', height:'100vh', background:'#09090f', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
        *{box-sizing:border-box;margin:0;padding:0}
        .inp{width:100%;background:#13131f;border:1px solid rgba(255,255,255,0.08);color:#f1f5f9;
          border-radius:9px;padding:11px 14px 11px 38px;font-size:13px;outline:none;
          transition:border-color .2s,box-shadow .2s;font-family:inherit}
        .inp:focus{border-color:#7c3aed;box-shadow:0 0 0 3px rgba(124,58,237,0.15)}
        .inp::placeholder{color:#475569}
        .btn-soc{width:100%;padding:11px;border-radius:9px;border:1px solid rgba(255,255,255,0.1);
          background:transparent;color:#94a3b8;font-size:13px;font-weight:600;cursor:pointer;
          font-family:inherit;display:flex;align-items:center;justify-content:center;gap:9px;
          transition:all .2s}
        .btn-soc:hover{border-color:rgba(124,58,237,0.4);color:#f1f5f9;background:rgba(124,58,237,0.06)}
        .code-line{display:flex;gap:14px;font-family:'JetBrains Mono',monospace;font-size:12px;line-height:22px}
      `}</style>

      {/* LEFT PANEL */}
      <div style={{ width:'55%', background:'linear-gradient(160deg,#0e0e1f 0%,#09090f 60%,#110826 100%)',
        borderRight:'1px solid rgba(255,255,255,0.06)', padding:'48px 52px',
        display:'flex', flexDirection:'column', position:'relative', overflow:'hidden', animation:'fadeIn .5s ease' }}>
        {/* Glow */}
        <div style={{ position:'absolute', bottom:'-100px', left:'-60px', width:'400px', height:'400px',
          background:'radial-gradient(circle,rgba(124,58,237,0.2) 0%,transparent 65%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', top:'30%', right:'-80px', width:'300px', height:'300px',
          background:'radial-gradient(circle,rgba(59,130,246,0.08) 0%,transparent 65%)', pointerEvents:'none' }}/>
        {/* Grid */}
        <div style={{ position:'absolute', inset:0,
          backgroundImage:'radial-gradient(circle,rgba(124,58,237,0.06) 1px,transparent 1px)',
          backgroundSize:'28px 28px', pointerEvents:'none' }}/>

        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'52px', position:'relative' }}>
          <div style={{ width:'34px', height:'34px', borderRadius:'9px',
            background:'linear-gradient(135deg,#7c3aed,#a855f7)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 0 18px rgba(124,58,237,0.5)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
          <span style={{ fontSize:'15px', fontWeight:700, color:'#f1f5f9' }}>
            CodeSense <span style={{ color:'#a855f7' }}>AI</span>
          </span>
        </div>

        {/* Hero Text */}
        <div style={{ flex:1, position:'relative' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'7px', padding:'5px 12px',
            borderRadius:'100px', border:'1px solid rgba(124,58,237,0.35)',
            background:'rgba(124,58,237,0.1)', marginBottom:'20px' }}>
            <span style={{ fontSize:'12px', color:'#c084fc' }}>✦ AI-Powered Code Review</span>
          </div>
          <h1 style={{ fontSize:'40px', fontWeight:800, lineHeight:1.12, marginBottom:'16px', color:'#f1f5f9' }}>
            Review Code <span style={{ background:'linear-gradient(90deg,#a855f7,#7c3aed)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Smarter,</span><br/>
            Ship <span style={{ background:'linear-gradient(90deg,#a855f7,#7c3aed)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Better.</span>
          </h1>
          <p style={{ fontSize:'14px', color:'#64748b', lineHeight:1.75, marginBottom:'32px', maxWidth:'380px' }}>
            AI reviews your code, finds issues, suggests fixes, and helps you write clean, secure and reliable code.
          </p>

          {/* Features */}
          <div style={{ display:'flex', flexDirection:'column', gap:'16px', marginBottom:'36px' }}>
            {[
              { icon:'⚡', color:'#7c3aed', title:'AI Code Review', desc:'Get intelligent reviews and suggestions.' },
              { icon:'🛡️', color:'#10b981', title:'Security Scanning', desc:'Detect vulnerabilities before they go live.' },
              { icon:'💡', color:'#3b82f6', title:'Smart Suggestions', desc:'Improve quality with AI-powered tips.' },
              { icon:'🔧', color:'#f59e0b', title:'Auto Fix', desc:'Fix issues automatically with one click.' },
            ].map(({ icon, color, title, desc }) => (
              <div key={title} style={{ display:'flex', alignItems:'center', gap:'13px' }}>
                <div style={{ width:'34px', height:'34px', borderRadius:'9px', flexShrink:0,
                  background:`${color}18`, border:`1px solid ${color}30`,
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px' }}>{icon}</div>
                <div>
                  <div style={{ fontSize:'13px', fontWeight:600, color:'#f1f5f9' }}>{title}</div>
                  <div style={{ fontSize:'12px', color:'#64748b', marginTop:'1px' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

        </div>

        <p style={{ fontSize:'12px', color:'#334155', marginTop:'20px', textAlign:'center', position:'relative' }}>
          🛡️ Your code is secure with us.
        </p>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center',
        padding:'40px', background:'#09090f' }}>
        <div style={{ width:'100%', maxWidth:'400px', animation:'fadeUp .5s ease' }}>
          {/* Shield icon */}
          <div style={{ display:'flex', justifyContent:'center', marginBottom:'24px' }}>
            <div style={{ width:'56px', height:'56px', borderRadius:'14px',
              background:'linear-gradient(135deg,rgba(124,58,237,0.3),rgba(124,58,237,0.1))',
              border:'1px solid rgba(124,58,237,0.35)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px',
              boxShadow:'0 0 24px rgba(124,58,237,0.2)' }}>🛡️</div>
          </div>

          <h2 style={{ fontSize:'24px', fontWeight:800, color:'#f1f5f9', textAlign:'center', marginBottom:'6px' }}>
            Welcome back! 
          </h2>
          <p style={{ fontSize:'13px', color:'#64748b', textAlign:'center', marginBottom:'28px' }}>
            Sign in to continue to CodeSense AI
          </p>

          {/* Tabs */}
          <div style={{ display:'flex', background:'#13131f', padding:'3px', borderRadius:'10px',
            border:'1px solid rgba(255,255,255,0.07)', marginBottom:'24px' }}>
            <button style={{ flex:1, padding:'8px', borderRadius:'8px', border:'none', cursor:'pointer',
              fontSize:'13px', fontWeight:700, fontFamily:'inherit',
              background:'#1a1a2e', color:'#f1f5f9' }}>Login</button>
            <button onClick={()=>navigate('/signup')} style={{ flex:1, padding:'8px', borderRadius:'8px',
              border:'none', cursor:'pointer', fontSize:'13px', fontWeight:600, fontFamily:'inherit',
              background:'transparent', color:'#475569' }}>Sign Up</button>
          </div>

          {/* Social */}
          <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'20px' }}>
            <button
  className="btn-soc"
  onClick={() => {
    window.location.href =
      'http://localhost:5000/api/auth/github'
  }}
>
              <GitBranch size={15}/> Continue with GitHub
            </button>
            <button
  className="btn-soc"
  onClick={() => {
    window.location.href =
      'http://localhost:5000/api/auth/google'
  }}
>
              <svg width="15" height="15" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>

          {/* OR */}
          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px' }}>
            <div style={{ flex:1, height:'1px', background:'rgba(255,255,255,0.07)' }}/>
            <span style={{ fontSize:'11px', color:'#334155', fontWeight:600 }}>or</span>
            <div style={{ flex:1, height:'1px', background:'rgba(255,255,255,0.07)' }}/>
          </div>

          {/* Form */}
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            <div>
              <label style={{ fontSize:'12px', fontWeight:600, color:'#64748b', display:'block', marginBottom:'6px' }}>Email address</label>
              <div style={{ position:'relative' }}>
                <Mail size={14} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#475569' }}/>
                <input className="inp" type="email" placeholder="Enter your email"
                  value={email} onChange={e=>setEmail(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&submit()}/>
              </div>
            </div>
            <div>
              <label style={{ fontSize:'12px', fontWeight:600, color:'#64748b', display:'block', marginBottom:'6px' }}>Password</label>
              <div style={{ position:'relative' }}>
                <Lock size={14} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#475569' }}/>
                <input className="inp" type={showPw?'text':'password'} placeholder="Enter your password"
                  value={password} onChange={e=>setPassword(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&submit()}
                  style={{ paddingRight:'38px' }}/>
                <button onClick={()=>setShowPw(!showPw)} style={{ position:'absolute', right:'11px', top:'50%',
                  transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#475569' }}>
                  {showPw?<EyeOff size={14}/>:<Eye size={14}/>}
                </button>
              </div>
              <div style={{ textAlign:'right', marginTop:'6px' }}>
                <span style={{ fontSize:'12px', color:'#7c3aed', cursor:'pointer' }}>Forgot password?</span>
              </div>
            </div>

            {error && (
              <div style={{ padding:'10px 13px', background:'rgba(239,68,68,0.1)',
                border:'1px solid rgba(239,68,68,0.25)', borderRadius:'8px', fontSize:'12.5px', color:'#ef4444' }}>
                {error}
              </div>
            )}

            <button onClick={submit} disabled={loading} style={{
              width:'100%', padding:'12px', borderRadius:'9px', border:'none',
              background: loading ? '#1a1a2e' : 'linear-gradient(135deg,#7c3aed,#6d28d9)',
              color:'#fff', fontSize:'14px', fontWeight:700, cursor: loading?'not-allowed':'pointer',
              fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
              boxShadow: loading ? 'none' : '0 0 22px rgba(124,58,237,0.4)', transition:'all .2s',
            }}>
              {loading ? <><div style={{ width:'15px',height:'15px',border:'2px solid rgba(255,255,255,0.2)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite' }}/>Please wait...</> : 'Sign In →'}
            </button>

            

                        <p style={{ textAlign:'center', fontSize:'13px', color:'#475569' }}>
              Don't have an account?{' '}
              <span
                onClick={()=>navigate('/signup')}
                style={{
                  color:'#a855f7',
                  cursor:'pointer',
                  fontWeight:600
                }}
              >
                Sign Up
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Privacy/Terms Modal */}
      {modal && (
        <div
          onClick={()=>setModal(null)}
          style={{
            position:'fixed',
            inset:0,
            background:'rgba(0,0,0,0.7)',
            zIndex:999,
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            padding:'20px'
          }}
        >
          <div
            onClick={e=>e.stopPropagation()}
            style={{
              background:'#13131f',
              border:'1px solid rgba(255,255,255,0.1)',
              borderRadius:'14px',
              padding:'28px',
              maxWidth:'560px',
              width:'100%',
              maxHeight:'80vh',
              overflowY:'auto'
            }}
          >
            <div
              style={{
                display:'flex',
                justifyContent:'space-between',
                alignItems:'center',
                marginBottom:'20px'
              }}
            >
              <h2
                style={{
                  fontSize:'18px',
                  fontWeight:700,
                  color:'#f1f5f9'
                }}
              >
                {modal === 'privacy'
                  ? '🔒 Privacy Policy'
                  : '📋 Terms of Use'}
              </h2>

              <button
                onClick={()=>setModal(null)}
                style={{
                  background:'none',
                  border:'none',
                  cursor:'pointer',
                  color:'#475569',
                  fontSize:'20px'
                }}
              >
                ×
              </button>
            </div>

            {modal === 'privacy' ? (
              <div
                style={{
                  fontSize:'13px',
                  color:'#94a3b8',
                  lineHeight:1.8
                }}
              >
                <p style={{ marginBottom:'12px' }}>
                  <strong style={{ color:'#f1f5f9' }}>
                    Data Collection:
                  </strong>{' '}
                  We collect only your email and name for account creation.
                </p>

                <p style={{ marginBottom:'12px' }}>
                  <strong style={{ color:'#f1f5f9' }}>
                    Code Privacy:
                  </strong>{' '}
                  Your code is never stored permanently.
                </p>

                <p style={{ marginBottom:'12px' }}>
                  <strong style={{ color:'#f1f5f9' }}>
                    Security:
                  </strong>{' '}
                  All data is encrypted using TLS/SSL.
                </p>
              </div>
            ) : (
              <div
                style={{
                  fontSize:'13px',
                  color:'#94a3b8',
                  lineHeight:1.8
                }}
              >
                <p style={{ marginBottom:'12px' }}>
                  <strong style={{ color:'#f1f5f9' }}>
                    Acceptance:
                  </strong>{' '}
                  By using CodeSense AI, you agree to these terms.
                </p>

                <p style={{ marginBottom:'12px' }}>
                  <strong style={{ color:'#f1f5f9' }}>
                    Usage:
                  </strong>{' '}
                  Use the platform only for lawful purposes.
                </p>

                <p style={{ marginBottom:'12px' }}>
                  <strong style={{ color:'#f1f5f9' }}>
                    Account:
                  </strong>{' '}
                  You are responsible for your account security.
                </p>
              </div>
            )}

            <button
              onClick={()=>setModal(null)}
              style={{
                marginTop:'20px',
                width:'100%',
                padding:'10px',
                borderRadius:'8px',
                background:'linear-gradient(135deg,#7c3aed,#6d28d9)',
                border:'none',
                color:'#fff',
                fontSize:'14px',
                fontWeight:700,
                cursor:'pointer',
                fontFamily:'inherit'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}