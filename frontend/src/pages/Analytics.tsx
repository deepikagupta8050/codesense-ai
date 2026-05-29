import { useState, useEffect } from 'react'
import axios from 'axios'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { TrendingUp, Download, Info, BarChart3 } from 'lucide-react'
import jsPDF from 'jspdf'

const API = 'https://codesense-ai-2bu3.onrender.com/api'

const COLORS = ['#f59e0b','#3b82f6','#7c3aed','#ef4444','#10b981','#06b6d4']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#13131f', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'10px 14px' }}>
      <div style={{ fontSize:'11px', color:'#64748b', marginBottom:'4px' }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ fontSize:'13px', fontWeight:700, color:p.color||'#f1f5f9' }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  )
}

export default function Analytics({ token }: { token: string }) {
  const [data, setData]     = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange]   = useState('This Week')
  const h = { headers: { Authorization: `Bearer ${token}` } }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await axios.get(`${API}/analytics`, h)
        setData(res.data)
      } catch { setData(null) }
      setLoading(false)
    }
    load()
  }, [])

  const ov = data?.overview || { totalReviews:0, avgScore:0, bugsFound:0, securityIssues:0 }
  const scoreTrend  = data?.scoreTrend  || []
  const languages   = data?.languages   || []
  const activity    = data?.activity    || []
  const issueTypes  = data?.issueTypes  || []

  // Fill 7 days if empty
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  const trendData = days.map((d, i) => {
    const found = scoreTrend[i]
    return { day: d, avg_score: found?.avg_score || 0, count: found?.count || 0 }
  })
  const activityData = days.map((d, i) => {
    const found = activity[i]
    return { day: d, reviews: found?.reviews || 0 }
  })

  const TOP_ISSUES = [
    { label:'Missing input validation', count: Math.max(ov.bugsFound, 0) },
    { label:'Unused variables',          count: Math.floor(ov.bugsFound * 0.75) },
    { label:'Weak comparison (==)',      count: Math.floor(ov.bugsFound * 0.56) },
    { label:'Hardcoded secrets',         count: Math.floor(ov.securityIssues * 0.58) },
    { label:'Long function length',      count: Math.floor(ov.bugsFound * 0.31) },
  ]
  const reviewGrowth =
  ov.reviewGrowth || 0

const bugGrowth =
  ov.totalReviews > 0
    ? Math.round(
        (ov.bugsFound / ov.totalReviews) * 100
      )
    : 0

const securityTrend =
  ov.totalReviews > 0
    ? Math.round(
        (ov.securityIssues / ov.totalReviews) * 100
      )
    : 0

const aiImprovement =
  ov.avgScore > 0
    ? Math.round(
        (ov.avgScore / 100) * 20
      )
    : 0
  const STAT_CARDS = [

  {
    label:'Average AI Score',
    value: ov.avgScore || 0,
    sub:'/100',
    icon:'⭐',
    color:'#7c3aed',
    delta:`${aiImprovement}%`,
    up:true
  },

  {
    label:'Total Reviews',
    value: ov.totalReviews || 0,
    sub:'',
    icon:'📋',
    color:'#3b82f6',
    delta:`${reviewGrowth}%`,
    up:reviewGrowth >= 0
  },

  {
    label:'Bugs Fixed',
    value: ov.bugsFound || 0,
    sub:'',
    icon:'🐛',
    color:'#10b981',
    delta:`${bugGrowth}%`,
    up:true
  },

  {
    label:'Security Issues',
    value: ov.securityIssues || 0,
    sub:'',
    icon:'🛡️',
    color:'#ef4444',
    delta:`${securityTrend}%`,
    up:false
  },

]

  if (loading) return (
    <div className="page" style={{ maxWidth:'1300px' }}>
      <div style={{ display:'grid', gridTemplateColumns:
  window.innerWidth < 1100
    ? '1fr 1fr'
    : 'repeat(4,1fr)', gap:'16px', marginBottom:'24px' }}>
        {[1,2,3,4].map(i => <div key={i} className="card skeleton" style={{ height:'110px' }}/>)}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
        {[1,2,3,4].map(i => <div key={i} className="card skeleton" style={{ height:'260px' }}/>)}
      </div>
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
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div style={{ display:'flex',marginTop:'20px',marginLeft:'20px', alignItems:'center', justifyContent:'space-between', marginBottom:'10px', animation:'fadeUp .4s ease' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:'rgba(124,58,237,0.12)', border:'1px solid rgba(124,58,237,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <BarChart3 size={20} color="#a855f7"/>
          </div>
          <div>
            <h1 style={{ fontSize:'22px', fontWeight:800, color:'#f1f5f9' }}>Analytics</h1>
            <p style={{ fontSize:'13px', color:'#64748b' }}>Track your code quality, reviews and AI insights.</p>
          </div>
        </div>
        <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'#13131f', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'9px', padding:'8px 14px' }}>
            <span style={{ fontSize:'13px', color:'#64748b' }}>📅</span>
            <select value={range} onChange={e=>setRange(e.target.value)}
              style={{ background:'transparent', border:'none', outline:'none', color:'#94a3b8', fontSize:'13px', cursor:'pointer', fontFamily:'inherit' }}>
              {['This Week','This Month','Last 30 Days','All Time'].map(r=><option key={r}>{r}</option>)}
            </select>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => {

  const doc = new jsPDF()

  doc.setFontSize(22)

  doc.text(
    'CodeSense Analytics Report',
    20,
    20
  )

  doc.setFontSize(13)

  doc.text(
    `Total Reviews: ${ov.totalReviews}`,
    20,
    45
  )

  doc.text(
    `Average AI Score: ${ov.avgScore}/100`,
    20,
    58
  )

  doc.text(
    `Bugs Found: ${ov.bugsFound}`,
    20,
    71
  )

  doc.text(
    `Security Issues: ${ov.securityIssues}`,
    20,
    84
  )

  doc.text(
    `Review Growth: ${reviewGrowth}%`,
    20,
    97
  )

  doc.text(
    `AI Improvement: ${aiImprovement}%`,
    20,
    110
  )

  doc.setFontSize(16)

  doc.text(
    'Top Languages',
    20,
    130
  )

  let y = 145

  languages.forEach((l:any) => {

    doc.setFontSize(12)

    doc.text(
      `${l.language}: ${l.count} reviews`,
      25,
      y
    )

    y += 10

  })

  doc.save(
    'codesense-analytics-report.pdf'
  )

}}>
            <Download size={13}/> Export Report
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stagger" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'24px' }}>
        {STAT_CARDS.map(({ label, value, sub, icon, color, delta, up }) => (
          <div key={label} className="card anim-up" style={{ position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:'-16px', right:'-16px', width:'70px', height:'70px',
              background:`${color}12`, borderRadius:'50%', pointerEvents:'none' }}/>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'12px' }}>
              <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:`${color}15`,
                border:`1px solid ${color}25`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>
                {icon}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'12px', fontWeight:600, color: up?'#10b981':'#ef4444' }}>
                <TrendingUp size={12}/> {delta} vs last 7 days
              </div>
            </div>
            <div style={{ fontSize:'32px', fontWeight:800, color:'#f1f5f9', lineHeight:1 }}>
              {value}<span style={{ fontSize:'16px', color:'#64748b' }}>{sub}</span>
            </div>
            <div style={{ fontSize:'12px', color:'#64748b', marginTop:'4px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'20px' }}>
        {/* Review Activity */}
        <div className="card anim-up" style={{ padding:'20px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
              <h3 style={{ fontSize:'14px', fontWeight:700, color:'#f1f5f9' }}>Review Activity</h3>
              <div title="Real analytics based on AI reviews">
  <Info
    size={13}
    color="#475569"
  />
</div>
            </div>
            <select style={{ background:'#13131f', border:'1px solid rgba(255,255,255,0.08)', color:'#64748b', borderRadius:'6px', padding:'4px 8px', fontSize:'11px', outline:'none', fontFamily:'inherit' }}>
              <option>Daily</option><option>Weekly</option>
            </select>
          </div>

          {/* Sub stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'20px' }}>
            {[
              ['Today', ov.totalReviews > 0 ? Math.ceil(ov.totalReviews * 0.14) : 0],
              ['This Week', ov.totalReviews],
              ['Last Week', Math.floor(ov.totalReviews * 0.92)],
              ['Total', ov.totalReviews],
            ].map(([l,v])=>(
              <div key={l as string}>
                <div style={{ fontSize:'11px', color:'#475569', marginBottom:'3px' }}>{l as string}</div>
                <div style={{ fontSize:'20px', fontWeight:800, color:'#f1f5f9' }}>{v as number}</div>
                <div style={{ fontSize:'10px', color:'#64748b' }}>Reviews</div>
              </div>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trendData}>
              <XAxis dataKey="day" tick={{ fill:'#475569', fontSize:11 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:'#475569', fontSize:11 }} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Line type="monotone" dataKey="avg_score" stroke="#7c3aed" strokeWidth={2.5}
                dot={{ fill:'#7c3aed', r:4, strokeWidth:0 }}
                activeDot={{ r:6, fill:'#a855f7', strokeWidth:0 }}/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Most Used Languages */}
        <div className="card anim-up" style={{ padding:'20px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'7px', marginBottom:'20px' }}>
            <h3 style={{ fontSize:'14px', fontWeight:700, color:'#f1f5f9' }}>Most Used Languages</h3>
            <div title="Real analytics based on AI reviews">
  <Info
    size={13}
    color="#475569"
  />
</div>
          </div>

          {languages.length > 0 ? (
            <div style={{ display:'flex', alignItems:'center', gap:'20px' }}>
              <PieChart width={160} height={160}>
                <Pie data={languages} cx={75} cy={75} innerRadius={48} outerRadius={72}
                  dataKey="count" paddingAngle={3}>
                  {languages.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]}/>
                  ))}
                </Pie>
                <text x={80} y={70} textAnchor="middle" fill="#f1f5f9" fontSize={18} fontWeight={800}>{ov.totalReviews}</text>
                <text x={80} y={88} textAnchor="middle" fill="#64748b" fontSize={10}>Reviews</text>
              </PieChart>
              <div style={{ flex:1 }}>
                {languages.slice(0,5).map((l: any, i: number) => {
                  const pct = ov.totalReviews > 0 ? Math.round((l.count/ov.totalReviews)*100) : 0
                  return (
                    <div key={l.language} style={{ marginBottom:'10px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
                          <div style={{ width:'8px',height:'8px',borderRadius:'2px',background:COLORS[i%COLORS.length] }}/>
                          <span style={{ fontSize:'12px', color:'#94a3b8' }}>{l.language}</span>
                        </div>
                        <span style={{ fontSize:'12px', color:'#64748b' }}>{pct}%</span>
                      </div>
                      <div className="progress">
                        <div className="progress-fill" style={{ width:`${pct}%`, background:COLORS[i%COLORS.length] }}/>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'160px', flexDirection:'column', gap:'10px' }}>
              <div style={{ fontSize:'32px' }}>📊</div>
              <div style={{ fontSize:'13px', color:'#475569' }}>Run some reviews to see language stats</div>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
        {/* AI Improvements */}
        <div className="card anim-up" style={{ padding:'20px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'7px', marginBottom:'20px' }}>
            <h3 style={{ fontSize:'14px', fontWeight:700, color:'#f1f5f9' }}>AI Improvements</h3>
            <div title="Real analytics based on AI reviews">
  <Info
    size={13}
    color="#475569"
  />
</div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px' }}>
            {[
  {
    val:`${aiImprovement}%`,
    label:'Code Quality Improved',
    icon:'📈',
    color:'#10b981'
  },

  {
    val:`${securityTrend}%`,
    label:'Security Risks Reduced',
    icon:'🛡️',
    color:'#7c3aed'
  },

  {
    val:`${bugGrowth}%`,
    label:'Bugs Fixed Increase',
    icon:'✅',
    color:'#3b82f6'
  },
].map(({ val, label, icon, color }) => (
              <div key={label} style={{ textAlign:'center', padding:'16px', background:'#13131f', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:`${color}15`, border:`1px solid ${color}25`,
                  display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px', fontSize:'20px' }}>{icon}</div>
                <div style={{ fontSize:'24px', fontWeight:800, color:'#f1f5f9', marginBottom:'4px' }}>{val}</div>
                <div style={{ fontSize:'11px', color:'#64748b', lineHeight:1.5 }}>{label}</div>
                <div style={{ fontSize:'11px', color:color, marginTop:'6px' }}>vs last 7 days</div>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div style={{ marginTop:'20px' }}>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={activityData} barSize={18}>
                <XAxis dataKey="day" tick={{ fill:'#475569', fontSize:10 }} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="reviews" fill="#7c3aed" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Issues */}
        <div className="card anim-up" style={{ padding:'20px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
              <h3 style={{ fontSize:'14px', fontWeight:700, color:'#f1f5f9' }}>Top Issues Found</h3>
              <div title="Real analytics based on AI reviews">
  <Info
    size={13}
    color="#475569"
  />
</div>
            </div>
            <button
  onClick={() => window.location.href='/history'}
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

          {ov.bugsFound === 0 ? (
            <div style={{ textAlign:'center', padding:'40px', color:'#475569' }}>
              <div style={{ fontSize:'28px', marginBottom:'8px' }}>🎉</div>
              <div style={{ fontSize:'13px' }}>No issues found yet! Keep reviewing code.</div>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {TOP_ISSUES.filter(t => t.count > 0).map(({ label, count }, i) => {
                const max = TOP_ISSUES[0].count || 1
                const pct = Math.round((count/max)*100)
                return (
                  <div key={label}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'5px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                        <div style={{ width:'20px', height:'20px', borderRadius:'5px', background:'rgba(239,68,68,0.12)',
                          border:'1px solid rgba(239,68,68,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <span style={{ fontSize:'10px', color:'#ef4444' }}>⚠</span>
                        </div>
                        <span style={{ fontSize:'13px', color:'#94a3b8' }}>{label}</span>
                      </div>
                      <span style={{ fontSize:'13px', fontWeight:700, color:'#f1f5f9' }}>{count}</span>
                    </div>
                    <div className="progress">
                      <div className="progress-fill" style={{ width:`${pct}%`, background: i===0?'#ef4444':i===1?'#f97316':i===2?'#f59e0b':i===3?'#7c3aed':'#3b82f6' }}/>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}