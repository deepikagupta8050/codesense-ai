import { useState, useEffect } from 'react'
import jsPDF from 'jspdf'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import { Search, Trash2, Download, Eye, RefreshCw, Filter, ChevronLeft, ChevronRight, Clock, X } from 'lucide-react'

const API = 'https://codesense-ai-2bu3.onrender.com/api'

const langColors: Record<string, string> = {
  JavaScript:'#f59e0b', TypeScript:'#7c3aed', Python:'#3b82f6',
  Java:'#ef4444', Go:'#06b6d4', Ruby:'#f97316', PHP:'#8b5cf6',
  'C++':'#10b981', 'C#':'#3b82f6', Rust:'#f97316', Unknown:'#64748b',
}

const scoreColor = (s: number) => s >= 90 ? '#10b981' : s >= 75 ? '#f59e0b' : s >= 60 ? '#f97316' : '#ef4444'
const scoreLabel = (s: number) => s >= 90 ? 'Passed' : s >= 75 ? 'Good' : s >= 60 ? 'Needs Improvement' : 'Security Risk'
const scoreBadge = (s: number) => s >= 90 ? 'badge-passed' : s >= 75 ? 'badge-needs' : s >= 60 ? 'badge-needs' : 'badge-risk'

export default function History({ token }: { token: string }) {
  const { id } = useParams()
  const [reviews, setReviews]   = useState<any[]>([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [langFilter, setLangFilter] = useState('All Languages')
  const [selected, setSelected] = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const h = { headers: { Authorization: `Bearer ${token}` } }
  const LIMIT = 8

  const load = async (p = page, s = search, l = langFilter) => {
    setLoading(true)
    try {
      const params: any = { page: p, limit: LIMIT }
      if (s) params.search = s
      if (l !== 'All Languages') params.language = l
      const res = await axios.get(`${API}/history`, { ...h, params })
      setReviews(res.data.reviews || [])
      setTotal(res.data.total || 0)
      setTotalPages(res.data.totalPages || 1)
    } catch { setReviews([]) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

useEffect(() => {
  if (id && reviews.length > 0) {
    const found = reviews.find(r => String(r.id) === String(id))
    if (found) viewDetail(found)
  }
}, [id, reviews])

  const deleteOne = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm('Delete this review?')) return
    await axios.delete(`${API}/history/${id}`, h)
    if (selected?.id === id) setSelected(null)
    load(page)
  }

  const deleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete all review history?')) return
    await axios.delete(`${API}/history`, h)
    setReviews([]); setTotal(0); setSelected(null)
  }

  const viewDetail = async (r: any) => {
    if (selected?.id === r.id) { setSelected(null); return }
    setDetailLoading(true)
    try {
      const res = await axios.get(`${API}/history/${r.id}`, h)
      setSelected(res.data.review)
    } catch { setSelected(r) }
    setDetailLoading(false)
  }

  const downloadReport = (r: any) => {

  const doc = new jsPDF()

  doc.setFontSize(20)

  doc.text(
    'CodeSense AI Report',
    20,
    20
  )

  doc.setFontSize(12)

  doc.text(
    `File: ${r.filename}`,
    20,
    40
  )

  doc.text(
    `Language: ${r.language}`,
    20,
    50
  )

  doc.text(
    `AI Score: ${r.score}/100`,
    20,
    60
  )

  doc.text(
    `Severity: ${r.severity}`,
    20,
    70
  )

  doc.text(
    `Date: ${r.created_at}`,
    20,
    80
  )

  doc.text(
    'AI Review:',
    20,
    100
  )

  const reviewText =
    doc.splitTextToSize(
      r.review || 'No review available',
      170
    )

  doc.text(
    reviewText,
    20,
    110
  )

  doc.save(
    `${r.filename}-report.pdf`
  )

}

  const handleSearch = (v: string) => { setSearch(v); setPage(1); load(1, v, langFilter) }
  const handleLang   = (v: string) => { setLangFilter(v); setPage(1); load(1, search, v) }
  const handlePage   = (p: number) => { setPage(p); load(p) }

  const LANGS = ['All Languages', 'JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'C++', 'C#', 'Ruby', 'PHP']

  return (
    <div className="page" style={{ width:'100%', minHeight:'100vh', padding:'0 28px 30px', transition:'all .3s ease', overflowX:'hidden' }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .row-hover{transition:background .15s;cursor:pointer}
        .row-hover:hover td{background:#1a1a2e!important}
        .row-active td{background:rgba(124,58,237,0.08)!important}
        .action-btn{background:none;border:none;cursor:pointer;display:flex;align-items:center;
          justify-content:center;width:30px;height:30px;border-radius:7px;transition:all .18s}
        .action-btn:hover{background:rgba(255,255,255,0.07)}
        .pg-btn{width:34px;height:34px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);
          background:transparent;color:#64748b;font-size:13px;font-weight:600;cursor:pointer;
          font-family:inherit;display:flex;align-items:center;justify-content:center;transition:all .2s}
        .pg-btn:hover:not(:disabled){border-color:rgba(124,58,237,0.4);color:#a855f7}
        .pg-btn.active{background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;border-color:#7c3aed}
        .pg-btn:disabled{opacity:.3;cursor:not-allowed}
      `}</style>

      {/* Header */}
      <div style={{ display:'flex',marginTop:'20px',marginLeft:'20px', alignItems:'center', justifyContent:'space-between', marginBottom:'10px', animation:'fadeUp .4s ease' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:'rgba(124,58,237,0.12)', border:'1px solid rgba(124,58,237,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Clock size={20} color="#a855f7"/>
          </div>
          <div>
            <h1 style={{ fontSize:'22px', fontWeight:800, color:'#f1f5f9' }}>Review History</h1>
            <p style={{ fontSize:'13px', color:'#64748b' }}>Track all your previous AI code reviews and scans.</p>
          </div>
        </div>
        <div style={{ display:'flex', gap:'10px' }}>
          <button onClick={() => load()} className="btn btn-ghost btn-sm">
            <RefreshCw size={13}/> Refresh
          </button>
          {total > 0 && <button onClick={deleteAll} className="btn btn-danger btn-sm">
            <Trash2 size={13}/> Clear All
          </button>}
          {total > 0 && <button className="btn btn-primary btn-sm" onClick={() => {
            const c = reviews.map(r=>`${r.filename},${r.language},${r.score},${r.severity},${r.created_at}`).join('\n')
            const b = new Blob([`File,Language,Score,Severity,Date\n${c}`],{type:'text/csv'})
            const u = URL.createObjectURL(b); const a = document.createElement('a')
            a.href=u; a.download='reviews-export.csv'; a.click()
          }}>
            <Download size={13}/> Export Report
          </button>}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:'12px', marginBottom:'20px', animation:'fadeUp .4s ease .05s both' }}>
        {/* Search */}
        <div style={{ flex:1, display:'flex', alignItems:'center', gap:'8px', background:'#13131f', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'9px', padding:'9px 14px' }}>
          <Search size={14} color="#475569"/>
          <input value={search} onChange={e => handleSearch(e.target.value)}
            placeholder="Search reviews by file, type or keyword..."
            style={{ background:'none', border:'none', outline:'none', color:'#f1f5f9', fontSize:'13px', flex:1, fontFamily:'inherit' }}/>
          {search && <button onClick={()=>handleSearch('')} style={{ background:'none',border:'none',cursor:'pointer',color:'#475569',display:'flex' }}><X size={13}/></button>}
        </div>

        {/* Language filter */}
        <select value={langFilter} onChange={e=>handleLang(e.target.value)}
          style={{ background:'#13131f', border:'1px solid rgba(255,255,255,0.08)', color:'#94a3b8', borderRadius:'9px', padding:'9px 14px', fontSize:'13px', outline:'none', cursor:'pointer' }}>
          {LANGS.map(l => <option key={l}>{l}</option>)}
        </select>

        {/* Status filter */}
        <select style={{ background:'#13131f', border:'1px solid rgba(255,255,255,0.08)', color:'#94a3b8', borderRadius:'9px', padding:'9px 14px', fontSize:'13px', outline:'none', cursor:'pointer' }}>
          <option>All Status</option>
          <option>Passed</option>
          <option>Needs Improvement</option>
          <option>Security Risk</option>
        </select>

        {/* Sort */}
        <select style={{ background:'#13131f', border:'1px solid rgba(255,255,255,0.08)', color:'#94a3b8', borderRadius:'9px', padding:'9px 14px', fontSize:'13px', outline:'none', cursor:'pointer' }}>
          <option>Latest First</option>
          <option>Oldest First</option>
          <option>Highest Score</option>
          <option>Lowest Score</option>
        </select>
      </div>

      {/* Table + Detail panel */}
      <div style={{ display:'grid', gridTemplateColumns: selected ? '1fr 400px' : '1fr', gap:'16px', animation:'fadeUp .4s ease .1s both' }}>
        {/* Table */}
        <div style={{ background:'#0f0f1a', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', overflow:'hidden' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>File / PR</th>
                <th>Language</th>
                <th>AI Score</th>
                <th>Issues</th>
                <th>Status</th>
                <th>Reviewed On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i}>
                    {[1,2,3,4,5,6,7].map(j => (
                      <td key={j}><div className="skeleton" style={{ height:'14px', width:'80%' }}/></td>
                    ))}
                  </tr>
                ))
              ) : reviews.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign:'center', padding:'60px' }}>
                  <div style={{ fontSize:'36px', marginBottom:'12px' }}>📋</div>
                  <div style={{ fontSize:'15px', fontWeight:600, color:'#f1f5f9', marginBottom:'6px' }}>No reviews yet</div>
                  <div style={{ fontSize:'13px', color:'#475569' }}>
                    {search || langFilter !== 'All Languages' ? 'No results for your filters' : 'Start your first code review!'}
                  </div>
                </td></tr>
              ) : reviews.map(r => (
                <tr key={r.id} className={`row-hover${selected?.id===r.id?' row-active':''}`} onClick={()=>viewDetail(r)}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      <div style={{ width:'34px', height:'34px', borderRadius:'9px', flexShrink:0,
                        background:`${langColors[r.language]||'#64748b'}18`,
                        border:`1px solid ${langColors[r.language]||'#64748b'}30`,
                        display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <span style={{ fontSize:'10px', fontWeight:800, color:langColors[r.language]||'#64748b', fontFamily:'JetBrains Mono' }}>
                          {(r.language||'?').slice(0,2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div style={{ fontSize:'13px', fontWeight:600, color:'#f1f5f9' }}>{r.filename||'untitled'}</div>
                        <div style={{ fontSize:'11px', color:'#475569', marginTop:'1px' }}>{r.language}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize:'12px', fontWeight:600, color:langColors[r.language]||'#64748b',
                      background:`${langColors[r.language]||'#64748b'}18`, padding:'3px 9px', borderRadius:'6px' }}>
                      {r.language||'?'}
                    </span>
                  </td>
                  <td>
                    {/* Score circle */}
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <div style={{ width:'38px', height:'38px', borderRadius:'50%', flexShrink:0,
                        border:`2px solid ${scoreColor(r.score||0)}`,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:'12px', fontWeight:800, color:scoreColor(r.score||0),
                        fontFamily:'JetBrains Mono', background:`${scoreColor(r.score||0)}10` }}>
                        {r.score||0}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize:'13px', color:'#94a3b8' }}>
                      {r.bugs_count||0} {r.bugs_count===1?'Issue':'Issues'}
                      {r.security_count>0&&<div style={{ fontSize:'11px', color:'#ef4444', marginTop:'1px' }}>{r.security_count} Security</div>}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${scoreBadge(r.score||0)}`}>{scoreLabel(r.score||0)}</span>
                  </td>
                  <td style={{ fontSize:'12px', color:'#64748b' }}>
                    {r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}) : '—'}
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:'4px' }}>
                      <button className="action-btn" title="View" onClick={e=>{e.stopPropagation();viewDetail(r)}}>
                        <Eye size={14} color="#64748b"/>
                      </button>
                      <button className="action-btn" title="Download" onClick={e=>{e.stopPropagation();downloadReport(r)}}>
                        <Download size={14} color="#64748b"/>
                      </button>
                      <button className="action-btn" title="Delete" onClick={e=>deleteOne(r.id,e)}>
                        <Trash2 size={14} color="#ef4444"/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {total > 0 && (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
              <span style={{ fontSize:'12px', color:'#475569' }}>
                Showing {Math.min((page-1)*LIMIT+1,total)} to {Math.min(page*LIMIT,total)} of {total} reviews
              </span>
              <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
                <button className="pg-btn" disabled={page<=1} onClick={()=>handlePage(page-1)}>
                  <ChevronLeft size={14}/>
                </button>
                {Array.from({length:Math.min(totalPages,5)},(_,i)=>i+1).map(p=>(
                  <button key={p} className={`pg-btn${page===p?' active':''}`} onClick={()=>handlePage(p)}>{p}</button>
                ))}
                {totalPages>5&&<span style={{ color:'#334155', fontSize:'13px' }}>...</span>}
                {totalPages>5&&<button className={`pg-btn${page===totalPages?' active':''}`} onClick={()=>handlePage(totalPages)}>{totalPages}</button>}
                <button className="pg-btn" disabled={page>=totalPages} onClick={()=>handlePage(page+1)}>
                  <ChevronRight size={14}/>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div style={{ background:'#0f0f1a', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', overflow:'hidden', animation:'slideIn .3s ease', display:'flex', flexDirection:'column' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
              <h3 style={{ fontSize:'14px', fontWeight:700, color:'#f1f5f9' }}>Review Detail</h3>
              <button onClick={()=>setSelected(null)} style={{ background:'none',border:'none',cursor:'pointer',color:'#475569',display:'flex' }}>
                <X size={16}/>
              </button>
            </div>

            {detailLoading ? (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', flex:1, padding:'40px' }}>
                <div style={{ width:'24px',height:'24px',border:'2px solid rgba(124,58,237,0.2)',borderTopColor:'#7c3aed',borderRadius:'50%',animation:'spin .7s linear infinite' }}/>
              </div>
            ) : (
              <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>
                {/* Meta */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'16px' }}>
                  {[
                    ['File', selected.filename||'untitled'],
                    ['Language', selected.language||'?'],
                    ['Score', `${selected.score||0}/100`],
                    ['Severity', selected.severity||'—'],
                    ['Bugs', selected.bugs_count||0],
                    ['Security', selected.security_count||0],
                  ].map(([k,v])=>(
                    <div key={k as string} style={{ padding:'10px', background:'#13131f', borderRadius:'8px' }}>
                      <div style={{ fontSize:'10px', color:'#475569', marginBottom:'3px', textTransform:'uppercase', letterSpacing:'.06em' }}>{k as string}</div>
                      <div style={{ fontSize:'13px', fontWeight:600, color:k==='Score'?scoreColor(selected.score||0):k==='Severity'?(selected.severity==='Critical'?'#ef4444':selected.severity==='Warning'?'#f59e0b':'#10b981'):'#f1f5f9' }}>{String(v)}</div>
                    </div>
                  ))}
                </div>

                {/* Review text */}
                {selected.review && (
                  <div>
                    <div style={{ fontSize:'12px', fontWeight:700, color:'#f1f5f9', marginBottom:'8px' }}>AI Review</div>
                    <pre style={{ whiteSpace:'pre-wrap', fontSize:'11.5px', lineHeight:'1.75', color:'#94a3b8', fontFamily:'JetBrains Mono', background:'#080810', padding:'12px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.06)', maxHeight:'260px', overflowY:'auto' }}>
                      {selected.review}
                    </pre>
                  </div>
                )}

                {/* Download */}
                <button onClick={()=>downloadReport(selected)} className="btn btn-primary btn-full" style={{ marginTop:'14px' }}>
                  <Download size={13}/> Download Report
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}