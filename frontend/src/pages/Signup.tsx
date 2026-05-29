import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Eye, EyeOff, GitBranch, User, Mail, Lock } from 'lucide-react'

export default function Signup({ onLogin }: { onLogin: (token: string, user: any) => void }) {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showCf, setShowCf] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [modal, setModal] = useState<'privacy'|'terms'|null>(null)

  const submit = async () => {
    setError('')
    if (!name || !email || !password || !confirm) { setError('Sab fields required hain'); return }
    if (password !== confirm) { setError('Passwords match nahi kar rahe'); return }
    if (password.length < 6) { setError('Password kam se kam 6 characters ka hona chahiye'); return }
    setLoading(true)
    try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', { name, email, password })
      onLogin(res.data.token, res.data.user)
    } catch (e: any) {
      setError(e.response?.data?.error || 'Signup failed. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div style={{ display:'flex', height:'100vh', background:'#09090f', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes spin{to{transform:rotate(360deg)}}
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

      {/* LEFT */}
      <div style={{ width:'55%', background:'linear-gradient(160deg,#0e0e1f 0%,#09090f 60%,#110826 100%)',
        borderRight:'1px solid rgba(255,255,255,0.06)', padding:'48px 52px',
        display:'flex', flexDirection:'column', position:'relative', overflow:'hidden', animation:'fadeIn .5s ease' }}>
        <div style={{ position:'absolute', bottom:'-100px', left:'-60px', width:'400px', height:'400px',
          background:'radial-gradient(circle,rgba(124,58,237,0.2) 0%,transparent 65%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', inset:0,
          backgroundImage:'radial-gradient(circle,rgba(124,58,237,0.06) 1px,transparent 1px)',
          backgroundSize:'28px 28px', pointerEvents:'none' }}/>

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
          <div style={{ display:'flex', flexDirection:'column', gap:'16px', marginBottom:'36px' }}>
            {[
              { icon:'⚡', color:'#7c3aed', title:'AI Code Review', desc:'Get intelligent reviews and suggestions.' },
              { icon:'🛡️', color:'#10b981', title:'Security Scanning', desc:'Detect vulnerabilities before they go live.' },
              { icon:'💡', color:'#3b82f6', title:'Smart Suggestions', desc:'Improve quality with AI-powered tips.' },
              { icon:'🔧', color:'#f59e0b', title:'Auto Fix & More', desc:'Fix issues automatically with one click.' },
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
        <p style={{ fontSize:'12px', color:'#334155', marginTop:'20px', textAlign:'center' }}>🛡️ Your code is secure with us.</p>
      </div>

      {/* RIGHT */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px', overflowY:'auto' }}>
        <div style={{ width:'100%', maxWidth:'420px', animation:'fadeUp .5s ease' }}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:'20px' }}>
            <div style={{ width:'56px', height:'56px', borderRadius:'14px',
              background:'linear-gradient(135deg,rgba(124,58,237,0.3),rgba(124,58,237,0.1))',
              border:'1px solid rgba(124,58,237,0.35)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px',
              boxShadow:'0 0 24px rgba(124,58,237,0.2)' }}>👤</div>
          </div>
          <h2 style={{ fontSize:'22px', fontWeight:800, color:'#f1f5f9', textAlign:'center', marginBottom:'6px' }}>
            Create your account
          </h2>
          <p style={{ fontSize:'13px', color:'#64748b', textAlign:'center', marginBottom:'24px' }}>
            Start your journey with CodeSense AI
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'18px' }}>
            {/* Name */}
            <div>
              <div style={{ position:'relative' }}>
                <User size={14} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#475569' }}/>
                <input className="inp" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)}/>
              </div>
            </div>
            {/* Email */}
            <div>
              <div style={{ position:'relative' }}>
                <Mail size={14} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#475569' }}/>
                <input className="inp" type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)}/>
              </div>
            </div>
            {/* Password */}
            <div>
              <div style={{ position:'relative' }}>
                <Lock size={14} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#475569' }}/>
                <input className="inp" type={showPw?'text':'password'} placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} style={{ paddingRight:'38px' }}/>
                <button onClick={()=>setShowPw(!showPw)} style={{ position:'absolute', right:'11px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#475569' }}>
                  {showPw?<EyeOff size={14}/>:<Eye size={14}/>}
                </button>
              </div>
            </div>
            {/* Confirm */}
            <div>
              <div style={{ position:'relative' }}>
                <Lock size={14} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#475569' }}/>
                <input className="inp" type={showCf?'text':'password'} placeholder="Confirm password" value={confirm} onChange={e=>setConfirm(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()} style={{ paddingRight:'38px' }}/>
                <button onClick={()=>setShowCf(!showCf)} style={{ position:'absolute', right:'11px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#475569' }}>
                  {showCf?<EyeOff size={14}/>:<Eye size={14}/>}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ padding:'10px 13px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'8px', fontSize:'12.5px', color:'#ef4444' }}>{error}</div>
            )}

            <button onClick={submit} disabled={loading} style={{
              width:'100%', padding:'12px', borderRadius:'9px', border:'none',
              background: loading?'#1a1a2e':'linear-gradient(135deg,#7c3aed,#6d28d9)',
              color:'#fff', fontSize:'14px', fontWeight:700, cursor:loading?'not-allowed':'pointer',
              fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
              boxShadow:loading?'none':'0 0 22px rgba(124,58,237,0.4)', transition:'all .2s',
            }}>
              {loading?<><div style={{ width:'15px',height:'15px',border:'2px solid rgba(255,255,255,0.2)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite' }}/>Please wait...</>:'Create Account →'}
            </button>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px' }}>
            <div style={{ flex:1, height:'1px', background:'rgba(255,255,255,0.07)' }}/>
            <span style={{ fontSize:'11px', color:'#334155', fontWeight:600 }}>or continue with</span>
            <div style={{ flex:1, height:'1px', background:'rgba(255,255,255,0.07)' }}/>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'16px' }}>

  <button
    className="btn-soc"
    onClick={() => {
      window.location.href =
        'http://localhost:5000/api/auth/github'
    }}
  >
    <GitBranch size={14}/>
    GitHub
  </button>

  <button
    className="btn-soc"
    onClick={() => {
      window.location.href =
        'http://localhost:5000/api/auth/google'
    }}
  >
    <svg width="14" height="14" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>

    Google
  </button>

</div>

          <p style={{ textAlign:'center', fontSize:'12px', color:'#475569', lineHeight:1.6 }}>
            Already have an account?{' '}
            <span onClick={()=>navigate('/login')} style={{ color:'#a855f7', cursor:'pointer', fontWeight:600 }}>Sign In</span>
          </p>
          <p style={{ textAlign:'center', fontSize:'11px', color:'#334155', marginTop:'10px', lineHeight:1.6 }}>
            By creating an account, you agree to our{' '}
            <span onClick={()=>setModal('terms')} style={{ color:'#7c3aed', cursor:'pointer' }}>Terms of Use</span> and{' '}
            <span onClick={()=>setModal('privacy')} style={{ color:'#7c3aed', cursor:'pointer' }}>Privacy Policy</span>
          </p>
        </div>
      </div>
    

      {modal && (
        <div onClick={()=>setModal(null)} style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:999,
          display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'
        }}>
          <div onClick={e=>e.stopPropagation()} style={{
            background:'#13131f', border:'1px solid rgba(255,255,255,0.1)',
            borderRadius:'14px', padding:'28px', maxWidth:'560px', width:'100%', maxHeight:'80vh', overflowY:'auto'
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
              <h2 style={{ fontSize:'18px', fontWeight:700, color:'#f1f5f9' }}>
                {modal === 'privacy' ? '🔒 Privacy Policy' : '📋 Terms of Use'}
              </h2>
              <button onClick={()=>setModal(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'#475569', fontSize:'20px' }}>×</button>
            </div>
            {modal === 'privacy' ? (
              <div style={{ fontSize:'13px', color:'#94a3b8', lineHeight:1.8 }}>
                <p style={{ marginBottom:'12px' }}><strong style={{ color:'#f1f5f9' }}>Data Collection:</strong> We collect only your email and name for account creation.</p>
                <p style={{ marginBottom:'12px' }}><strong style={{ color:'#f1f5f9' }}>Code Privacy:</strong> Your code is sent to our AI for review and is never stored permanently.</p>
                <p style={{ marginBottom:'12px' }}><strong style={{ color:'#f1f5f9' }}>Security:</strong> All data is encrypted in transit using TLS/SSL.</p>
                <p><strong style={{ color:'#f1f5f9' }}>Contact:</strong> privacy@codesense.ai</p>
              </div>
            ) : (
              <div style={{ fontSize:'13px', color:'#94a3b8', lineHeight:1.8 }}>
                <p style={{ marginBottom:'12px' }}><strong style={{ color:'#f1f5f9' }}>Acceptance:</strong> By using CodeSense AI, you agree to these terms.</p>
                <p style={{ marginBottom:'12px' }}><strong style={{ color:'#f1f5f9' }}>Usage:</strong> You may use our service for lawful purposes only.</p>
                <p style={{ marginBottom:'12px' }}><strong style={{ color:'#f1f5f9' }}>Account:</strong> You are responsible for your account security.</p>
                <p><strong style={{ color:'#f1f5f9' }}>Changes:</strong> We reserve the right to modify these terms at any time.</p>
              </div>
            )}
            <button onClick={()=>setModal(null)} style={{
              marginTop:'20px', width:'100%', padding:'10px', borderRadius:'8px',
              background:'linear-gradient(135deg,#7c3aed,#6d28d9)', border:'none',
              color:'#fff', fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:'inherit'
            }}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}