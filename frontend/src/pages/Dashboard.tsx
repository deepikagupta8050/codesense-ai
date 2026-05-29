import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Code2, Shield, Upload, Bot, Eye, TrendingUp, AlertTriangle, Star, Zap } from 'lucide-react'

const API = 'http://localhost:5000/api'

export default function Dashboard({ user, token }: { user: any; token: string }) {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ totalReviews:0, bugsFound:0, securityScore:0, autoFix:0, reviewGrowth:0 });
  const [recentReviews, setRecentReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const h = { headers: { Authorization: `Bearer ${token}` } }

  useEffect(() => {
    const load = async () => {
      try {
        const [histRes, analytRes] = await Promise.all([
          axios.get(`${API}/history?limit=5`, h),
          axios.get(`${API}/analytics`, h),
        ])
        setRecentReviews(histRes.data.reviews || [])
        const ov = analytRes.data.overview || {}
        setStats({
          totalReviews: ov.totalReviews || 0,
          bugsFound: ov.bugsFound || 0,
          securityScore: ov.totalReviews > 0 ? Math.max(0, 100 - ((ov.securityIssues || 0) * 10) - ((ov.bugsFound || 0) * 2)) : 0,
          autoFix: Math.round((ov.bugsFound || 0) * 0.6),
          reviewGrowth: ov.reviewGrowth || 0,
        })
      } catch(e) { console.log(e) }
      setLoading(false)
    }
    load()
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  const STAT_CARDS = [
    { label:'Total Reviews', value: stats.totalReviews, icon:'📋', color:'#7c3aed', bg:'rgba(124,58,237,0.12)', delta:'+24% from last week' },
    { label:'Bugs Found', value: stats.bugsFound, icon:'🐛', color:'#10b981', bg:'rgba(16,185,129,0.12)', delta:'+18% from last week' },
    { label:'Security Score', value:`${stats.securityScore}/100`, icon:'🛡️', color:'#f59e0b', bg:'rgba(245,158,11,0.12)' },
    { label:'Auto Fix Applied', value: stats.autoFix, icon:'✨', color:'#3b82f6', bg:'rgba(59,130,246,0.12)', delta:'+31% from last week' },
  ]

  const QUICK_ACTIONS = [
    { icon: Code2, label:'Start New Review', desc:'Review your code with AI', color:'#7c3aed', bg:'rgba(124,58,237,0.15)', to:'/review' },
    { icon: Upload, label:'Upload Code', desc:'Upload file or folder for review', color:'#10b981', bg:'rgba(16,185,129,0.15)', to:'/review' },
    { icon: Shield, label:'Scan Repository', desc:'Connect GitHub repo and scan', color:'#3b82f6', bg:'rgba(59,130,246,0.15)', to:'/security' },
    { icon: Bot, label:'Ask AI Assistant', desc:'Get help and explanations', color:'#a855f7', bg:'rgba(168,85,247,0.15)', to:'/assistant' },
  ]

  

  const langColors: Record<string,string> = {
    JavaScript:'#f59e0b', Python:'#3b82f6', TypeScript:'#7c3aed',
    Java:'#ef4444', Go:'#06b6d4', Unknown:'#64748b',
  }
  const scoreColor = (s:number) => s>=80?'#10b981':s>=60?'#f59e0b':'#ef4444'

  return (
    <div
  className="page"
  style={{
    maxWidth:'100%',
    padding:'0 28px 30px',
    transition:'all .3s ease',
  }}
>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}} @keyframes spin{to{transform:rotate(360deg)}} .qa-card{transition:all .22s} .qa-card:hover{transform:translateY(-3px);border-color:rgba(124,58,237,0.35)!important}`}</style>

      {/* Header */}
      <div style={{ display:'flex',marginTop:'20px',marginLeft:'20px', alignItems:'center', justifyContent:'space-between', marginBottom:'10px', animation:'fadeUp .4s ease' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px' }}>
            <h1 style={{ fontSize:'26px', fontWeight:800, color:'#f1f5f9' }}>
              {greeting}, {user?.name?.split(' ')[0] || 'Developer'}! 👋
            </h1>
            <div style={{ display:'flex', alignItems:'center', gap:'5px', padding:'3px 10px',
              background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.25)',
              borderRadius:'100px' }}>
              <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#10b981',
                display:'inline-block', animation:'pulse 2s ease infinite' }}/>
              <span style={{ fontSize:'11px', color:'#10b981', fontWeight:600 }}>Live</span>
            </div>
          </div>
          <p style={{ fontSize:'14px', color:'#64748b' }}>Your AI code workspace is ready.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stagger" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'24px' }}>
        {STAT_CARDS.map(({ label, value, icon, color, bg, delta }) => (
          <div key={label} className="card anim-up" style={{ position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:'-20px', right:'-20px', width:'80px', height:'80px',
              background:bg, borderRadius:'50%', pointerEvents:'none' }}/>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'14px' }}>
              <div style={{ width:'44px', height:'44px', borderRadius:'11px', background:bg,
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px' }}>{icon}</div>
            </div>
            {loading
              ? <div className="skeleton" style={{ height:'30px', width:'60%', marginBottom:'6px' }}/>
              : <div style={{ fontSize:'32px', fontWeight:800, color:'#f1f5f9', lineHeight:1 }}>{value}</div>
            }
            <div style={{ fontSize:'13px', color:'#64748b', marginTop:'4px', marginBottom:'8px' }}>{label}</div>
            <div style={{ fontSize:'12px', color:'#10b981', display:'flex', alignItems:'center', gap:'4px' }}>
              <TrendingUp size={11}/> Live analytics
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:'20px', marginBottom:'20px' }}>
        {/* Recent Reviews Table */}
        <div className="card anim-up" style={{ padding:0, overflow:'hidden' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 20px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
            <h2 style={{ fontSize:'15px', fontWeight:700, color:'#f1f5f9' }}>Recent AI Reviews</h2>
            <button onClick={()=>navigate('/history')} style={{ fontSize:'13px', color:'#7c3aed', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>
              View all →
            </button>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th>File / Repository</th>
                <th>Language</th>
                <th>Score</th>
                <th>Issues</th>
                <th>Reviewed At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3,4,5].map(i=>(
                  <tr key={i}><td colSpan={6}>
                    <div className="skeleton" style={{ height:'16px', width:'100%' }}/>
                  </td></tr>
                ))
              ) : recentReviews.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign:'center', padding:'40px', color:'#475569' }}>
                  <div style={{ fontSize:'28px', marginBottom:'8px' }}>📋</div>
                  <div style={{ fontSize:'14px', fontWeight:600, marginBottom:'4px' }}>No reviews yet</div>
                  <div style={{ fontSize:'12px' }}>Start your first code review!</div>
                </td></tr>
              ) : recentReviews.map((r:any) => (
                <tr key={r.id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      <div style={{ width:'30px', height:'30px', borderRadius:'7px', flexShrink:0,
                        background:`${langColors[r.language]||'#64748b'}20`,
                        border:`1px solid ${langColors[r.language]||'#64748b'}30`,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:'10px', fontWeight:700, color:langColors[r.language]||'#64748b' }}>
                        {(r.language||'?').slice(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize:'13px', fontWeight:600, color:'#f1f5f9' }}>{r.filename||'untitled'}</div>
                        <div style={{ fontSize:'11px', color:'#475569', marginTop:'1px' }}>{r.language}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize:'12px', color:langColors[r.language]||'#64748b',
                      background:`${langColors[r.language]||'#64748b'}18`,
                      padding:'3px 9px', borderRadius:'6px', fontWeight:600 }}>{r.language||'?'}</span>
                  </td>
                  <td>
                    <span style={{ fontSize:'13px', fontWeight:700, color:scoreColor(r.score||0),
                      background:`${scoreColor(r.score||0)}18`, padding:'3px 9px', borderRadius:'6px' }}>
                      {r.score||0}/100
                    </span>
                  </td>
                  <td style={{ fontSize:'13px', color:'#94a3b8' }}>{r.bugs_count||0}</td>
                  <td style={{ fontSize:'12px', color:'#64748b' }}>{r.created_at ? new Date(r.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : '—'}</td>
                  <td>
                    <button onClick={()=>navigate(`/history/${r.id}`)} style={{ background:'none', border:'none', cursor:'pointer', color:'#475569' }}>
                      <Eye size={15}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Column */}
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          {/* AI Activity Feed */}
          <div className="card anim-up" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 18px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
              <h2 style={{ fontSize:'14px', fontWeight:700, color:'#f1f5f9' }}>AI Activity Feed</h2>
              <button
  onClick={() => navigate('/history')}
  style={{
    fontSize:'12px',
    color:'#7c3aed',
    background:'none',
    border:'none',
    cursor:'pointer',
    fontFamily:'inherit'
  }}
>
  View all →
</button>
            </div>
            <div style={{ padding:'8px 0' }}>
              {recentReviews.length === 0 ? (

  <div
    style={{
      padding:'20px',
      textAlign:'center',
      color:'#64748b',
      fontSize:'13px'
    }}
  >
    No recent activity
  </div>

) : (

  recentReviews.slice(0,5).map((r:any, i:number) => (
    <div
  onClick={() => navigate(`/history/${r.id}`)}
  style={{ cursor:'pointer' }}
>

    <div
      key={i}
      style={{
        display:'flex',
        alignItems:'flex-start',
        gap:'12px',
        padding:'10px 18px',
        borderBottom:
          i < recentReviews.length - 1
            ? '1px solid rgba(255,255,255,0.04)'
            : 'none'
      }}
    >

      <div
        style={{
          width:'34px',
          height:'34px',
          borderRadius:'9px',
          background:'rgba(124,58,237,0.15)',
          border:'1px solid rgba(124,58,237,0.25)',
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          fontSize:'15px'
        }}
      >
        🔍
      </div>

      <div style={{ flex:1 }}>

        <div
          style={{
            fontSize:'12.5px',
            fontWeight:600,
            color:'#f1f5f9'
          }}
        >
          AI reviewed {r.filename || 'untitled'}
        </div>

        <div
          style={{
            fontSize:'11.5px',
            color:'#64748b',
            marginTop:'2px'
          }}
        >
          {r.bugs_count || 0} issues found
        </div>

      </div>

      <div
        style={{
          fontSize:'11px',
          color:'#334155'
        }}
      >
        {r.created_at
          ? new Date(r.created_at).toLocaleTimeString([], {
              hour:'2-digit',
              minute:'2-digit'
            })
          : 'now'}
      </div>

    </div>
    </div>

  ))

)}
            </div>
          </div>

          {/* Security Alerts */}
          <div className="card anim-up" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 18px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
              <h2 style={{ fontSize:'14px', fontWeight:700, color:'#f1f5f9' }}>Security Alerts</h2>
              <button
  onClick={() => navigate('/security')}
  style={{
    fontSize:'12px',
    color:'#7c3aed',
    background:'none',
    border:'none',
    cursor:'pointer',
    fontFamily:'inherit'
  }}
>
  View all →
</button>
            </div>
            <div style={{ padding:'8px 0' }}>
              {recentReviews.length === 0 ? (

  <div
    style={{
      padding:'20px',
      textAlign:'center',
      color:'#64748b',
      fontSize:'13px'
    }}
  >
    No security alerts
  </div>

) : (

  recentReviews.slice(0,5).map((r:any, i:number) => (

    <div
      key={i}
      style={{
        display:'flex',
        alignItems:'center',
        gap:'10px',
        padding:'10px 18px',
        borderBottom:
          i < recentReviews.length - 1
            ? '1px solid rgba(255,255,255,0.04)'
            : 'none'
      }}
    >

      <div
        style={{
          width:'30px',
          height:'30px',
          borderRadius:'8px',
          flexShrink:0,
          background:'rgba(239,68,68,0.15)',
          display:'flex',
          alignItems:'center',
          justifyContent:'center'
        }}
      >
        ⚠️
      </div>

      <div style={{ flex:1, overflow:'hidden' }}>

        <div
          style={{
            fontSize:'12px',
            fontWeight:600,
            color:'#f1f5f9',
            overflow:'hidden',
            textOverflow:'ellipsis',
            whiteSpace:'nowrap'
          }}
        >
          {r.filename || 'Unknown File'}
        </div>

        <div
          style={{
            fontSize:'11px',
            color:'#475569',
            marginTop:'1px'
          }}
        >
          {r.security_count || 0} security issues
        </div>

      </div>

      <span
        style={{
          fontSize:'11px',
          fontWeight:700,
          background:
            (r.security_count || 0) > 5
              ? 'rgba(239,68,68,0.15)'
              : 'rgba(245,158,11,0.15)',
          color:
            (r.security_count || 0) > 5
              ? '#ef4444'
              : '#f59e0b',
          padding:'3px 8px',
          borderRadius:'6px',
          flexShrink:0
        }}
      >
        {(r.security_count || 0) > 5 ? 'High' : 'Medium'}
      </span>

    </div>

  ))

)}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 style={{ fontSize:'16px', fontWeight:700, color:'#f1f5f9', marginBottom:'14px' }}>Quick Actions</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px' }}>
          {QUICK_ACTIONS.map(({ icon:Icon, label, desc, color, bg, to }) => (
            <div key={label} className="card qa-card" style={{ cursor:'pointer', textAlign:'center', padding:'24px 16px' }}
              onClick={()=>navigate(to)}>
              <div style={{ width:'52px', height:'52px', borderRadius:'14px', background:bg,
                display:'flex', alignItems:'center', justifyContent:'center',
                margin:'0 auto 14px' }}>
                <Icon size={22} color={color}/>
              </div>
              <div style={{ fontSize:'13px', fontWeight:700, color:'#f1f5f9', marginBottom:'5px' }}>{label}</div>
              <div style={{ fontSize:'12px', color:'#475569', lineHeight:1.6 }}>{desc}</div>
              <div style={{ marginTop:'14px', fontSize:'12px', color:color, fontWeight:600 }}>→</div>
            </div>
          ))}
        </div>
      </div>

      
    </div>
  )
}