


import { Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  GitBranch, RefreshCw, Search, X, ChevronRight, GitPullRequest,
  Shield, Bug, Zap, Star, AlertTriangle, CheckCircle,
  Download, History, GitCommit, Activity, Database
} from 'lucide-react'

const API = 'https://codesense-ai-2bu3.onrender.com/api'

const SCORE_COLOR = (s: number) => s >= 85 ? '#10b981' : s >= 70 ? '#f59e0b' : s >= 50 ? '#f97316' : '#ef4444'
const SCORE_BG    = (s: number) => s >= 85 ? 'rgba(16,185,129,0.1)' : s >= 70 ? 'rgba(245,158,11,0.1)' : s >= 50 ? 'rgba(249,115,22,0.1)' : 'rgba(239,68,68,0.1)'

const SEV_COLOR: any = {
  critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#10b981', info: '#3b82f6'
}

export default function GitHubPRs({ token }: { token: string }) {
  const [activeTab, setActiveTab]       = useState('Overview')
  const [owner, setOwner]               = useState('')
  const [repo, setRepo]                 = useState('')
  const [repos, setRepos]               = useState<any[]>([])
  const [prs, setPrs]                   = useState<any[]>([])
  const [loading, setLoading]           = useState(false)
  const [loadingRepos, setLoadingRepos] = useState(false)
  const [reviewing, setReviewing]       = useState(false)
  const [scanning, setScanning]         = useState(false)
  const [selectedPR, setSelectedPR]     = useState<any>(null)
  const [aiModel, setAiModel]           = useState('llama-3.3-70b-versatile')
  const [prReview, setPrReview]         = useState<any>(null)
  const [scanResult, setScanResult]     = useState<any>(null)
  const [filter, setFilter]             = useState('All')
  const [search, setSearch]             = useState('')
  const [error, setError]               = useState('')
  const [githubStatus, setGithubStatus] = useState<any>(null)
  const [history, setHistory]           = useState<any[]>([])
  const [scanHistory, setScanHistory] = useState<any[]>([])
  const [commits, setCommits]           = useState<any[]>([])
  const [checks, setChecks]             = useState<any[]>([])
  const [mainView, setMainView]         = useState<'prs' | 'scan' | 'history'>('prs')

  const h = { headers: { Authorization: `Bearer ${token}` } }

  useEffect(() => { checkGithubStatus() }, [])

  const checkGithubStatus = async () => {
    try {
      const res = await axios.get(`${API}/github/status`, h)
      setGithubStatus(res.data)
      if (res.data.connected) fetchUserRepos()
    } catch {}
  }

  const fetchUserRepos = async () => {
    setLoadingRepos(true)
    try {
      const res = await axios.get(`${API}/github/repos`, h)
      setRepos(res.data.repos || [])
    } catch {}
    setLoadingRepos(false)
  }

  const handleRepoSelect = (fullName: string) => {
    const [o, r] = fullName.split('/')
    setOwner(o); setRepo(r)
    setPrs([]); setSelectedPR(null); setPrReview(null); setError('')
  }

  const fetchPRs = async () => {
    if (!owner || !repo) { setError('Enter both the Owner and Repository name.'); return }
    setLoading(true); setError(''); setPrs([]); setSelectedPR(null); setPrReview(null)
    try {
      const res = await axios.get(`${API}/github/prs`, { ...h, params: { owner, repo } })
      setPrs(res.data.prs || [])
      if (res.data.message) setError(res.data.message)
    } catch (e: any) {
      setError(e.response?.data?.error || 'GitHub fetch failed.')
    }
    setLoading(false)
  }

  const reviewPR = async (pr: any) => {
    setReviewing(true); setPrReview(null); setCommits([]); setChecks([])
    try {
      const res = await axios.post(`${API}/github/review-pr`, { owner, repo, prNumber: pr.number, model: aiModel }, h)
      setPrReview(res.data)
      setCommits(res.data.commits || [])
      setChecks(res.data.checks || [])
      setActiveTab('Overview')
    } catch (e: any) {
      setError(e.response?.data?.error || 'AI Review failed.')
    }
    setReviewing(false)
  }

  const scanRepo = async () => {
    if (!owner || !repo) { setError('Pehle repo select karo'); return }
    setScanning(true); setScanResult(null); setError('')
    try {
      const res = await axios.post(`${API}/github/scan-repo`, { owner, repo, model: aiModel }, h)
      setScanResult(res.data)
    } catch (e: any) {
      setError(e.response?.data?.error || 'Scan failed.')
    }
    setScanning(false)
  }

  const fetchHistory = async () => {
  try {
    const res = await axios.get(`${API}/github/history`, h)

    setHistory(res.data.reviews || [])

    setScanHistory(res.data.scans || [])

  } catch {}
}



const loadScan = async (id:number) => {
  try {
    const res = await axios.get(
      `${API}/github/scan/${id}`,
      h
    )

    setScanResult({
      scan: res.data.scan.content
    })

    setMainView('scan')
  } catch {
    alert('Scan load failed')
  }
}

const deleteScan = async (id:number) => {
  if (!window.confirm('Delete this scan history?'))
    return

  try {

    await axios.delete(
      `${API}/github/scan/${id}`,
      h
    )

    setScanHistory(prev =>
      prev.filter((s:any) => s.id !== id)
    )

  } catch {

    alert('Delete failed')

  }
}

const clearAllScans = async () => {
  if (!window.confirm('Delete all scan history?'))
    return

  try {

    await axios.delete(
      `${API}/github/scan-history`,
      h
    )

    setScanHistory([])

  } catch {

    alert('Delete failed')

  }
}



  const exportMarkdown = () => {
    if (scanResult) {

  const md = `
# CodeSense AI Repo Scan

Repository: ${owner}/${repo}

Overall Score: ${scanResult.scan?.overall_score}/100

Files Scanned: ${scanResult.scan?.files_scanned}

Issues Found: ${scanResult.scan?.issues_found}

Security Risks: ${scanResult.scan?.security_risks}

Code Quality: ${scanResult.scan?.quality_score}/100

Security Score: ${scanResult.scan?.security_score}/100

Maintainability: ${scanResult.scan?.maintainability_score}/100

## Summary

${scanResult.scan?.summary || 'No summary available'}

## Bugs

${scanResult.scan?.bugs?.map(
  (b: any) => `- ${b.file}: ${b.issue}`
).join('\n') || 'None'}

## Security Issues

${scanResult.scan?.security_issues?.map(
  (s: any) => `- ${s.issue}
  Fix: ${s.fix}`
).join('\n') || 'None'}

## Recommendations

${scanResult.scan?.recommendations?.map(
  (r: any) => `- ${r}`
).join('\n') || 'None'}

## Performance Suggestions

${scanResult.scan?.performance_suggestions?.map(
  (p: any) => `- ${p}`
).join('\n') || 'None'}

## Duplicate Code

${scanResult.scan?.duplicate_code?.map(
  (d: any) => `- ${d.description || d}`
).join('\n') || 'None'}

## Dead Code

${scanResult.scan?.dead_code?.map(
  (d: any) => `- ${d.file}: ${d.description}`
).join('\n') || 'None'}
`

  const blob = new Blob([md], {
    type: 'text/markdown'
  })

  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')

  a.href = url

  a.download = `${repo}-scan-report.md`

  a.click()

  URL.revokeObjectURL(url)

  return
}
    const review = prReview?.review
    if (!review) return
    const md = `# CodeSense AI Review\n## ${owner}/${repo} — PR #${selectedPR?.number}: ${selectedPR?.title}\n## Score: ${review.score}/100\n\n### Summary\n${review.summary}\n\n### Bugs\n${review.bugs?.map((b: any) => `- [${b.severity}] ${b.line}: ${b.issue}`).join('\n') || 'None'}\n\n### Security\n${review.security?.map((s: any) => `- [${s.severity}] ${s.issue}\n  Fix: ${s.fix}`).join('\n') || 'None'}\n\n### Suggestions\n${review.suggestions?.map((s: any) => `- ${s.file}: ${s.suggestion}`).join('\n') || 'None'}`
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `review-${owner}-${repo}-pr${selectedPR?.number}.md`; a.click()
    URL.revokeObjectURL(url)
  }

  const exportJSON = () => {
    const data = prReview || scanResult
    if (!data) return
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `codesense-${owner}-${repo}-${Date.now()}.json`; a.click()
    URL.revokeObjectURL(url)
  }

  const FILTERS = ['All', 'open', 'closed']
  const filtered = prs.filter(pr => {
    const matchFilter = filter === 'All' || pr.state === filter
    const matchSearch = !search || pr.title.toLowerCase().includes(search.toLowerCase()) || String(pr.number).includes(search)
    return matchFilter && matchSearch
  })

  return (
    <div style={{ width:'100%', padding:'24px', boxSizing:'border-box' }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:translateX(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .pr-row{transition:all .15s;cursor:pointer;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:12px 14px;margin-bottom:8px;display:flex;align-items:center;gap:12px;background:#0a0a14}
        .pr-row:hover{border-color:rgba(124,58,237,0.35);background:#13131f}
        .pr-row.active{border-color:#7c3aed;background:rgba(124,58,237,0.09)}
        .fb{padding:6px 13px;border-radius:100px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:#64748b;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .15s}
        .fb.active{background:#7c3aed;color:#fff;border-color:#7c3aed}
        .fb:hover:not(.active){border-color:rgba(124,58,237,0.3);color:#a855f7}
        .nav-tab{padding:8px 16px;border-radius:8px;border:none;cursor:pointer;font-size:13px;font-weight:600;font-family:inherit;transition:all .15s;display:flex;align-items:center;gap:5px}
        .nav-tab.active{background:#7c3aed;color:#fff}
        .nav-tab:not(.active){background:transparent;color:#64748b}
        .nav-tab:not(.active):hover{color:#a855f7;background:rgba(124,58,237,0.1)}
        .sc{padding:14px;background:#0d0d1a;border:1px solid rgba(255,255,255,0.07);border-radius:10px}
        .sev{padding:2px 8px;border-radius:100px;font-size:10px;font-weight:700;text-transform:uppercase}
        .sp{width:14px;height:14px;border:2px solid rgba(255,255,255,0.25);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;display:inline-block;vertical-align:middle}
      `}</style>

      {/* HEADER */}
      <div style={{ display:'flex',marginTop:'0px',marginLeft:'20px', alignItems:'center', justifyContent:'space-between', marginBottom:'10px', animation:'fadeUp .4s ease' }}>
        <div>
          <h1 style={{ fontSize:'21px', fontWeight:800, color:'#f1f5f9', margin:0 }}>GitHub Workspace</h1>
          <p style={{ fontSize:'13px', color:'#475569', margin:'4px 0 0' }}>
            {githubStatus?.connected ? `🔴 Connected as @${githubStatus.username} • ${repos.length} repos` : '⚪ GitHub Account Not Connected'}
          </p>
        </div>
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          <select value={aiModel} onChange={e => setAiModel(e.target.value)} className="input" style={{ fontSize:'12px', padding:'6px 10px' }}>
            <option value="llama-3.3-70b-versatile">Llama 3.3 70B</option>
            <option value="llama-3.1-8b-instant">Llama 3.1 8B Fast</option>
            <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
          </select>
          {githubStatus?.connected && (
            <button onClick={fetchUserRepos} className="btn btn-ghost btn-sm" disabled={loadingRepos}>
              {loadingRepos ? <span className="sp"/> : <RefreshCw size={13}/>} Sync
            </button>
          )}
          <button className="btn btn-ghost btn-sm" onClick={() => { window.location.href = 'https://codesense-ai-2bu3.onrender.com/api/auth/github' }}>
            <GitBranch size={13}/> {githubStatus?.connected ? 'Re-connect' : 'Connect GitHub'}
          </button>
          {(prReview || scanResult) && <>
            <button onClick={exportMarkdown} className="btn btn-ghost btn-sm"><Download size={13}/> .md</button>
            <button onClick={exportJSON} className="btn btn-ghost btn-sm"><Download size={13}/> .json</button>
          </>}
        </div>
      </div>

      {/* NAV */}
      <div style={{ display:'flex', gap:'6px', marginBottom:'18px' }}>
        <button className={`nav-tab${mainView==='prs'?' active':''}`} onClick={() => setMainView('prs')}><GitPullRequest size={13}/>Pull Requests</button>
        <button className={`nav-tab${mainView==='scan'?' active':''}`} onClick={() => { setMainView('scan'); setScanResult(null) }}><Database size={13}/>Full Repo Scan</button>
        <button className={`nav-tab${mainView==='history'?' active':''}`} onClick={() => { setMainView('history'); fetchHistory() }}><History size={13}/>Review History</button>
      </div>

      {/* REPO SELECTOR */}
      <div className="card" style={{ padding:'16px', marginBottom:'16px' }}>
        <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', alignItems:'center' }}>
          {repos.length > 0 && (
            <select onChange={e => handleRepoSelect(e.target.value)} className="input" style={{ minWidth:'220px', flex:1, maxWidth:'280px' }} defaultValue="">
              <option value="" disabled>📂 My Repositories ({repos.length})</option>
              {repos.map(r => <option key={r.id} value={r.full_name}>{r.private ? '🔒 ' : '📁 '}{r.full_name}</option>)}
            </select>
          )}
          <span style={{ color:'#334155', fontSize:'12px' }}>or manually:</span>
          <input value={owner} onChange={e => setOwner(e.target.value)} placeholder="Owner" className="input" style={{ maxWidth:'150px' }}/>
          <input value={repo} onChange={e => setRepo(e.target.value)} placeholder="Repo name" className="input" style={{ maxWidth:'160px' }} onKeyDown={e => e.key==='Enter' && (mainView==='prs'?fetchPRs():scanRepo())}/>
          {mainView === 'prs' && <button onClick={fetchPRs} disabled={loading} className="btn btn-primary">{loading?<><span className="sp"/> Fetching...</>:<><GitBranch size={13}/> Fetch PRs</>}</button>}
          {mainView === 'scan' && <button onClick={scanRepo} disabled={scanning} className="btn btn-primary">{scanning?<><span className="sp"/> Scanning...</>:<><Activity size={13}/> Scan Repo</>}</button>}
        </div>
        {error && <div style={{ marginTop:'10px', padding:'9px 13px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'8px', fontSize:'12.5px', color:'#ef4444', display:'flex', gap:'7px', alignItems:'center' }}><AlertTriangle size={13}/>{error}</div>}
        {!githubStatus?.connected && <div style={{ marginTop:'10px', padding:'9px 13px', background:'rgba(124,58,237,0.07)', border:'1px solid rgba(124,58,237,0.15)', borderRadius:'8px', fontSize:'12px', color:'#a855f7' }}>Connect GitHub to automatically load your repositories and access repositories.</div>}
      </div>

      {/* ══ PR VIEW ══ */}
      {mainView === 'prs' && (
        <div style={{ display:'grid', gridTemplateColumns:'360px 1fr', gap:'16px', animation:'fadeUp .3s ease' }}>
          {/* PR List */}
          <div>
            <div style={{ display:'flex', gap:'6px', marginBottom:'10px' }}>
              {FILTERS.map(f => (
                <button key={f} className={`fb${filter===f?' active':''}`} onClick={() => setFilter(f)}>
                  {f==='All'?'All':f==='open'?'Open':'Closed'} {f==='All'?prs.length:prs.filter(p=>p.state===f).length}
                </button>
              ))}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'#0d0d1a', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'9px', padding:'8px 12px', marginBottom:'10px' }}>
              <Search size={13} color="#475569"/>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or #number..." style={{ background:'none', border:'none', outline:'none', color:'#f1f5f9', fontSize:'13px', flex:1, fontFamily:'inherit' }}/>
              {search && <button onClick={() => setSearch('')} style={{ background:'none', border:'none', cursor:'pointer', color:'#475569', display:'flex' }}><X size={12}/></button>}
            </div>
            {filtered.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px', color:'#334155' }}>
                <GitPullRequest size={30} style={{ opacity:.2, marginBottom:'10px' }}/>
                <div style={{ fontSize:'13px', color:'#475569' }}>{prs.length===0?'Fetch PRs to start':'No PRs match filter'}</div>
              </div>
            ) : filtered.map(pr => {
              const isActive = selectedPR?.number === pr.number
              const sc = pr.merged ? '#a855f7' : pr.state==='open' ? '#10b981' : '#64748b'
              const sbg = pr.merged ? 'rgba(168,85,247,0.12)' : pr.state==='open' ? 'rgba(16,185,129,0.12)' : 'rgba(100,116,139,0.12)'
              return (
                <div key={pr.number} className={`pr-row${isActive?' active':''}`} onClick={() => { setSelectedPR(pr); setPrReview(null); setCommits([]); setChecks([]) }}>
                  <div style={{ width:'34px', height:'34px', borderRadius:'8px', flexShrink:0, background:'rgba(124,58,237,0.12)', border:'1px solid rgba(124,58,237,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <GitPullRequest size={15} color="#a855f7"/>
                  </div>
                  <div style={{ flex:1, overflow:'hidden' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'5px', marginBottom:'2px' }}>
                      <span style={{ fontSize:'12.5px', fontWeight:600, color:'#f1f5f9', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{pr.title}</span>
                      <span style={{ fontSize:'10px', color:'#7c3aed', fontWeight:700, flexShrink:0 }}>#{pr.number}</span>
                    </div>
                    <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
                      <span style={{ fontSize:'10px', fontWeight:700, color:sc, background:sbg, padding:'1px 6px', borderRadius:'100px' }}>{pr.merged?'Merged':pr.state}</span>
                      <span style={{ fontSize:'10px', color:'#475569' }}>{pr.user} • {pr.created_at?new Date(pr.created_at).toLocaleDateString():''}</span>
                    </div>
                    {pr.additions!==undefined && (
                      <div style={{ fontSize:'10px', marginTop:'2px', display:'flex', gap:'6px' }}>
                        <span style={{ color:'#10b981' }}>+{pr.additions}</span>
                        <span style={{ color:'#ef4444' }}>-{pr.deletions}</span>
                        <span style={{ color:'#334155' }}>{pr.head}→{pr.base}</span>
                      </div>
                    )}
                  </div>
                  <ChevronRight size={12} color="#334155"/>
                </div>
              )
            })}
          </div>

          {/* PR Detail */}
          <div style={{ animation:'slideIn .3s ease' }}>
            {!selectedPR ? (
              <div style={{ background:'#0a0a14', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px', textAlign:'center', minHeight:'400px' }}>
                <GitPullRequest size={40} style={{ opacity:.12, marginBottom:'14px', color:'#7c3aed' }}/>
                <div style={{ fontSize:'15px', fontWeight:600, color:'#475569', marginBottom:'5px' }}>Select a Pull Request</div>
                <div style={{ fontSize:'12px', color:'#334155' }}>Fetch PRs aur koi ek select karo</div>
              </div>
            ) : (
              <div style={{ background:'#0a0a14', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', overflow:'hidden' }}>
                {/* Header */}
                <div style={{ padding:'16px 18px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
                    <span style={{ fontSize:'13px', color:'#7c3aed', fontWeight:700 }}>#{selectedPR.number}</span>
                    <span style={{ fontSize:'11px', fontWeight:700, color:selectedPR.merged?'#a855f7':selectedPR.state==='open'?'#10b981':'#64748b', background:selectedPR.merged?'rgba(168,85,247,0.12)':selectedPR.state==='open'?'rgba(16,185,129,0.12)':'rgba(100,116,139,0.12)', padding:'2px 7px', borderRadius:'100px' }}>{selectedPR.merged?'Merged':selectedPR.state}</span>
                    {selectedPR.draft && <span style={{ fontSize:'10px', color:'#64748b', background:'rgba(100,116,139,0.1)', padding:'2px 6px', borderRadius:'100px' }}>Draft</span>}
                  </div>
                  <h3 style={{ fontSize:'14px', fontWeight:700, color:'#f1f5f9', margin:'0 0 4px' }}>{selectedPR.title}</h3>
                  <div style={{ fontSize:'11px', color:'#475569', marginBottom:'12px' }}>@{selectedPR.user} • {selectedPR.head} → {selectedPR.base}</div>
                  <button onClick={() => reviewPR(selectedPR)} disabled={reviewing} className="btn btn-primary btn-full" style={{ marginBottom:'12px' }}>
                    {reviewing ? <><span className="sp"/> AI Reviewing...</> : <><Star size={13}/> Run AI Review</>}
                  </button>
                  <div style={{ display:'flex' }}>
                    {['Overview','Files','Commits','Checks'].map(t => (
                      <button key={t} onClick={() => setActiveTab(t)} style={{ padding:'8px 14px', background:'none', border:'none', cursor:'pointer', fontSize:'12.5px', fontWeight:activeTab===t?700:500, fontFamily:'inherit', color:activeTab===t?'#f1f5f9':'#64748b', borderBottom:activeTab===t?'2px solid #7c3aed':'2px solid transparent', transition:'all .15s' }}>
                        {t}
                        {t==='Files'&&prReview?.files&&<span style={{ marginLeft:'4px', fontSize:'10px', background:'rgba(124,58,237,0.2)', color:'#a855f7', padding:'1px 5px', borderRadius:'100px' }}>{prReview.files.length}</span>}
                        {t==='Commits'&&commits.length>0&&<span style={{ marginLeft:'4px', fontSize:'10px', background:'rgba(124,58,237,0.2)', color:'#a855f7', padding:'1px 5px', borderRadius:'100px' }}>{commits.length}</span>}
                        {t==='Checks'&&checks.length>0&&<span style={{ marginLeft:'4px', fontSize:'10px', background:'rgba(124,58,237,0.2)', color:'#a855f7', padding:'1px 5px', borderRadius:'100px' }}>{checks.length}</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ padding:'16px 18px', maxHeight:'calc(100vh - 380px)', overflowY:'auto' }}>
                  {!prReview ? (
                    <div style={{ textAlign:'center', padding:'50px 20px', color:'#334155' }}>
                      <Star size={34} style={{ opacity:.15, marginBottom:'12px', color:'#7c3aed' }}/>
                      <div style={{ fontSize:'13px', color:'#475569' }}>Run AI Review to analyze this PR</div>
                    </div>
                  ) : <>
                    {/* OVERVIEW */}
                    {activeTab==='Overview' && (
                      <div style={{ animation:'fadeUp .25s ease' }}>
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'9px', marginBottom:'14px' }}>
                          {[
                            { l:'AI Score', v:`${prReview.review?.score??'—'}/100`, c:SCORE_COLOR(prReview.review?.score) },
                            { l:'Bugs', v:prReview.review?.bugs?.length??0, c:'#ef4444' },
                            { l:'Security', v:prReview.review?.security?.length??0, c:'#f97316' },
                            { l:'Files', v:prReview.files?.length??0, c:'#3b82f6' },
                          ].map(s => (
                            <div key={s.l} className="sc" style={{ textAlign:'center' }}>
                              <div style={{ fontSize:'19px', fontWeight:800, color:s.c }}>{s.v}</div>
                              <div style={{ fontSize:'10px', color:'#64748b', fontWeight:600, marginTop:'2px' }}>{s.l}</div>
                            </div>
                          ))}
                        </div>
                        {prReview.review?.quality && (
                          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px', marginBottom:'14px' }}>
                            {Object.entries(prReview.review.quality).map(([k,v]: any) => (
                              <div key={k} className="sc">
                                <div style={{ fontSize:'10px', color:'#64748b', textTransform:'capitalize', marginBottom:'4px' }}>{k}</div>
                                <div style={{ height:'4px', background:'rgba(255,255,255,0.07)', borderRadius:'2px', overflow:'hidden' }}>
                                  <div style={{ width:`${v}%`, height:'100%', background:SCORE_COLOR(v), borderRadius:'2px' }}/>
                                </div>
                                <div style={{ fontSize:'11px', fontWeight:700, color:SCORE_COLOR(v), marginTop:'3px' }}>{v}/100</div>
                              </div>
                            ))}
                          </div>
                        )}
                        <div style={{ background:'#080810', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'10px', padding:'13px', marginBottom:'13px' }}>
                          <div style={{ fontSize:'10px', fontWeight:700, color:'#7c3aed', marginBottom:'7px', textTransform:'uppercase' }}>Summary</div>
                          <p style={{ fontSize:'12.5px', color:'#94a3b8', lineHeight:1.7, margin:0 }}>{prReview.review?.summary}</p>
                        </div>
                        {prReview.review?.bugs?.length>0 && (
                          <div style={{ marginBottom:'13px' }}>
                            <div style={{ fontSize:'10px', fontWeight:700, color:'#ef4444', marginBottom:'7px', display:'flex', alignItems:'center', gap:'5px' }}><Bug size={11}/>BUGS ({prReview.review.bugs.length})</div>
                            {prReview.review.bugs.map((b: any, i: number) => (
                              <div key={i} style={{ background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.15)', borderRadius:'8px', padding:'9px 11px', marginBottom:'5px' }}>
                                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'3px' }}>
                                  <span style={{ fontSize:'10px', color:'#94a3b8', fontFamily:'monospace' }}>{b.line}</span>
                                  <span className="sev" style={{ background:`${SEV_COLOR[b.severity]||'#64748b'}20`, color:SEV_COLOR[b.severity]||'#64748b' }}>{b.severity}</span>
                                </div>
                                <div style={{ fontSize:'12px', color:'#f1f5f9' }}>{b.issue}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        {prReview.review?.security?.length>0 && (
                          <div style={{ marginBottom:'13px' }}>
                            <div style={{ fontSize:'10px', fontWeight:700, color:'#f97316', marginBottom:'7px', display:'flex', alignItems:'center', gap:'5px' }}><Shield size={11}/>SECURITY ({prReview.review.security.length})</div>
                            {prReview.review.security.map((s: any, i: number) => (
                              <div key={i} style={{ background:'rgba(249,115,22,0.06)', border:'1px solid rgba(249,115,22,0.15)', borderRadius:'8px', padding:'9px 11px', marginBottom:'5px' }}>
                                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'3px' }}>
                                  <span style={{ fontSize:'12px', color:'#f1f5f9', fontWeight:600 }}>{s.issue}</span>
                                  <span className="sev" style={{ background:`${SEV_COLOR[s.severity]||'#64748b'}20`, color:SEV_COLOR[s.severity]||'#64748b' }}>{s.severity}</span>
                                </div>
                                <div style={{ fontSize:'11px', color:'#10b981' }}>✓ {s.fix}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        {prReview.review?.suggestions?.length>0 && (
                          <div style={{ marginBottom:'13px' }}>
                            <div style={{ fontSize:'10px', fontWeight:700, color:'#3b82f6', marginBottom:'7px', display:'flex', alignItems:'center', gap:'5px' }}><Zap size={11}/>SUGGESTIONS</div>
                            {prReview.review.suggestions.map((s: any, i: number) => (
                              <div key={i} style={{ background:'rgba(59,130,246,0.06)', border:'1px solid rgba(59,130,246,0.12)', borderRadius:'8px', padding:'9px 11px', marginBottom:'5px' }}>
                                <div style={{ fontSize:'10px', color:'#3b82f6', fontFamily:'monospace', marginBottom:'2px' }}>{s.file}</div>
                                <div style={{ fontSize:'12px', color:'#94a3b8' }}>{s.suggestion}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        {prReview.review?.performance_tips?.length>0 && (
                          <div style={{ marginBottom:'13px' }}>
                            <div style={{ fontSize:'10px', fontWeight:700, color:'#f59e0b', marginBottom:'7px', display:'flex', alignItems:'center', gap:'5px' }}><Activity size={11}/>PERFORMANCE</div>
                            {prReview.review.performance_tips.map((t: string, i: number) => (
                              <div key={i} style={{ fontSize:'12px', color:'#94a3b8', padding:'5px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>⚡ {t}</div>
                            ))}
                          </div>
                        )}
                        {(prReview.review?.duplicate_code?.length>0 || prReview.review?.dead_code?.length>0) && (
                          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'9px' }}>
                            {prReview.review?.duplicate_code?.length>0 && (
                              <div className="sc">
                                <div style={{ fontSize:'10px', fontWeight:700, color:'#f59e0b', marginBottom:'6px' }}>DUPLICATE CODE</div>
                                {prReview.review.duplicate_code.map((d: string, i: number) => <div key={i} style={{ fontSize:'11px', color:'#94a3b8', padding:'3px 0' }}>• {d}</div>)}
                              </div>
                            )}
                            {prReview.review?.dead_code?.length>0 && (
                              <div className="sc">
                                <div style={{ fontSize:'10px', fontWeight:700, color:'#64748b', marginBottom:'6px' }}>DEAD CODE</div>
                                {prReview.review.dead_code.map((d: string, i: number) => <div key={i} style={{ fontSize:'11px', color:'#94a3b8', padding:'3px 0' }}>• {d}</div>)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* FILES */}
                    {activeTab==='Files' && (
                      <div style={{ animation:'fadeUp .25s ease' }}>
                        {!prReview.files?.length ? <div style={{ textAlign:'center', padding:'30px', color:'#475569' }}>No files</div>
                        : prReview.files.map((file: any, i: number) => (
                          <div key={i} style={{ marginBottom:'10px', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'10px', overflow:'hidden' }}>
                            <div style={{ padding:'9px 12px', background:'#0d0d1a', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                              <span style={{ fontSize:'11.5px', color:'#a855f7', fontFamily:'monospace', fontWeight:600 }}>{file.filename}</span>
                              <div style={{ display:'flex', gap:'8px', fontSize:'11px' }}>
                                <span style={{ color:'#64748b', background:'rgba(255,255,255,0.05)', padding:'2px 6px', borderRadius:'4px', fontSize:'10px', textTransform:'uppercase' }}>{file.status}</span>
                                <span style={{ color:'#10b981' }}>+{file.additions}</span>
                                <span style={{ color:'#ef4444' }}>-{file.deletions}</span>
                              </div>
                            </div>
                            {file.patch && file.patch !== '(binary or no changes)' && (
                              <pre style={{ margin:0, padding:'10px 12px', background:'#060610', fontSize:'11px', overflowX:'auto', maxHeight:'180px', lineHeight:1.6, fontFamily:'monospace' }}>
                                {file.patch.split('\n').map((line: string, li: number) => (
                                  <div key={li} style={{ color: line.startsWith('+')?'#10b981':line.startsWith('-')?'#ef4444':line.startsWith('@@')?'#7c3aed':'#475569' }}>{line}</div>
                                ))}
                              </pre>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* COMMITS */}
                    {activeTab==='Commits' && (
                      <div style={{ animation:'fadeUp .25s ease' }}>
                        {commits.length===0 ? <div style={{ textAlign:'center', padding:'30px', color:'#475569' }}>Run AI Review to load commits</div>
                        : commits.map((c: any, i: number) => (
                          <div key={i} style={{ display:'flex', gap:'10px', padding:'11px', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'9px', marginBottom:'7px', background:'#0d0d1a' }}>
                            <div style={{ width:'30px', height:'30px', borderRadius:'7px', background:'rgba(124,58,237,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                              <GitCommit size={14} color="#a855f7"/>
                            </div>
                            <div style={{ flex:1 }}>
                              <div style={{ fontSize:'12.5px', color:'#f1f5f9', fontWeight:600, marginBottom:'2px' }}>{c.message.split('\n')[0]}</div>
                              <div style={{ display:'flex', gap:'10px', fontSize:'10.5px', color:'#475569' }}>
                                <span style={{ fontFamily:'monospace', color:'#7c3aed' }}>{c.sha}</span>
                                <span>{c.author}</span>
                                <span>{c.date?new Date(c.date).toLocaleDateString():''}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* CHECKS */}
                    {activeTab==='Checks' && (
                      <div style={{ animation:'fadeUp .25s ease' }}>
                        {checks.length===0 ? (
                          <div style={{ textAlign:'center', padding:'30px', color:'#475569' }}>
                            <CheckCircle size={28} style={{ opacity:.2, marginBottom:'8px' }}/>
                            <div>No CI/CD checks found</div>
                          </div>
                        ) : checks.map((c: any, i: number) => {
                          const cc = c.conclusion==='success'?'#10b981':c.conclusion==='failure'?'#ef4444':c.conclusion==='cancelled'?'#64748b':'#f59e0b'
                          return (
                            <div key={i} style={{ display:'flex', gap:'10px', padding:'11px', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'9px', marginBottom:'7px', background:'#0d0d1a', alignItems:'center' }}>
                              <div style={{ width:'9px', height:'9px', borderRadius:'50%', background:cc, flexShrink:0 }}/>
                              <div style={{ flex:1 }}>
                                <div style={{ fontSize:'12.5px', color:'#f1f5f9', fontWeight:600 }}>{c.name}</div>
                                <div style={{ fontSize:'10.5px', color:'#475569' }}>{c.app} • {c.status}</div>
                              </div>
                              <span style={{ fontSize:'11px', fontWeight:700, color:cc, background:`${cc}15`, padding:'3px 8px', borderRadius:'100px', textTransform:'capitalize' }}>{c.conclusion||c.status}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ SCAN VIEW ══ */}
      {mainView==='scan' && (
        <div style={{ animation:'fadeUp .3s ease' }}>
          {scanning && (
            <div style={{ textAlign:'center', padding:'70px', background:'#0a0a14', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px' }}>
              <span className="sp" style={{ width:'32px', height:'32px', borderWidth:'3px' }}/>
              <div style={{ marginTop:'16px', color:'#64748b', fontSize:'14px', fontWeight:600 }}>Scanning repository...</div>
              <div style={{ color:'#334155', fontSize:'12px', marginTop:'4px' }}>Fetching files aur AI se analyze ho raha hai</div>
            </div>
          )}
          {!scanning && !scanResult && (
            <div style={{ textAlign:'center', padding:'70px', background:'#0a0a14', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px' }}>
              <Database size={42} style={{ opacity:.12, marginBottom:'14px', color:'#7c3aed' }}/>
              <div style={{ fontSize:'15px', fontWeight:600, color:'#475569', marginBottom:'6px' }}>Full Repository Scan</div>
              <div style={{ fontSize:'12px', color:'#334155', maxWidth:'300px', margin:'0 auto' }}>Repo select karo, "Scan Repo" click karo. AI bugs, security, quality, duplicate + dead code sab analyze karega.</div>
            </div>
          )}
          {scanResult && (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'16px' }}>
                {[
                  { l:'Overall Score', v:`${scanResult.scan?.overall_score??'—'}/100`, c:SCORE_COLOR(scanResult.scan?.overall_score) },
                  { l:'Files Scanned', v:scanResult.scan?.files_scanned??0, c:'#3b82f6' },
                  { l:'Issues Found', v:scanResult.scan?.issues_found??0, c:'#f59e0b' },
                  { l:'Security Risks', v:scanResult.scan?.security_risks??0, c:'#ef4444' },
                ].map(s => (
                  <div key={s.l} className="sc" style={{ textAlign:'center' }}>
                    <div style={{ fontSize:'22px', fontWeight:800, color:s.c }}>{s.v}</div>
                    <div style={{ fontSize:'10px', color:'#64748b', fontWeight:600, marginTop:'3px' }}>{s.l}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px', marginBottom:'16px' }}>
                {[{ l:'Code Quality', v:scanResult.scan?.quality_score },{ l:'Security', v:scanResult.scan?.security_score },{ l:'Maintainability', v:scanResult.scan?.maintainability_score }].map(s => (
                  <div key={s.l} className="sc">
                    <div style={{ fontSize:'11px', color:'#64748b', marginBottom:'5px', fontWeight:600 }}>{s.l}</div>
                    <div style={{ height:'4px', background:'rgba(255,255,255,0.07)', borderRadius:'2px', overflow:'hidden' }}>
                      <div style={{ width:`${s.v||0}%`, height:'100%', background:SCORE_COLOR(s.v||0), borderRadius:'2px' }}/>
                    </div>
                    <div style={{ fontSize:'13px', fontWeight:800, color:SCORE_COLOR(s.v||0), marginTop:'4px' }}>{s.v??'—'}/100</div>
                  </div>
                ))}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                <div>
                  <div className="sc" style={{ marginBottom:'12px' }}>
                    <div style={{ fontSize:'10px', fontWeight:700, color:'#7c3aed', marginBottom:'7px' }}>SUMMARY</div>
                    <p style={{ fontSize:'12.5px', color:'#94a3b8', lineHeight:1.7, margin:0 }}>{scanResult.scan?.summary}</p>
                  </div>
                  {scanResult.scan?.bugs?.length>0 && (
                    <div style={{ background:'#0a0a14', border:'1px solid rgba(239,68,68,0.15)', borderRadius:'10px', padding:'13px', marginBottom:'12px' }}>
                      <div style={{ fontSize:'10px', fontWeight:700, color:'#ef4444', marginBottom:'7px', display:'flex', alignItems:'center', gap:'5px' }}><Bug size={11}/>BUGS ({scanResult.scan.bugs.length})</div>
                      {scanResult.scan.bugs.slice(0,5).map((b: any, i: number) => (
                        <div key={i} style={{ fontSize:'11.5px', color:'#94a3b8', padding:'5px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                          <span style={{ color:'#a855f7', fontFamily:'monospace', fontSize:'10px' }}>{b.file}</span><br/>{b.issue}
                        </div>
                      ))}
                    </div>
                  )}
                  {scanResult.scan?.security_issues?.length>0 && (
                    <div style={{ background:'#0a0a14', border:'1px solid rgba(249,115,22,0.15)', borderRadius:'10px', padding:'13px' }}>
                      <div style={{ fontSize:'10px', fontWeight:700, color:'#f97316', marginBottom:'7px', display:'flex', alignItems:'center', gap:'5px' }}><Shield size={11}/>SECURITY ({scanResult.scan.security_issues.length})</div>
                      {scanResult.scan.security_issues.slice(0,4).map((s: any, i: number) => (
                        <div key={i} style={{ fontSize:'11.5px', color:'#94a3b8', padding:'5px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                          <div style={{ display:'flex', justifyContent:'space-between' }}>
                            <span>{s.issue}</span>
                            <span className="sev" style={{ background:`${SEV_COLOR[s.severity]||'#64748b'}20`, color:SEV_COLOR[s.severity]||'#64748b' }}>{s.severity}</span>
                          </div>
                          <div style={{ fontSize:'10px', color:'#10b981', marginTop:'2px' }}>Fix: {s.fix}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  {scanResult.scan?.recommendations?.length>0 && (
                    <div className="sc" style={{ marginBottom:'12px' }}>
                      <div style={{ fontSize:'10px', fontWeight:700, color:'#10b981', marginBottom:'7px' }}>TOP RECOMMENDATIONS</div>
                      {scanResult.scan.recommendations.map((r: string, i: number) => (
                        <div key={i} style={{ fontSize:'12px', color:'#94a3b8', padding:'5px 0', borderBottom:'1px solid rgba(255,255,255,0.04)', display:'flex', gap:'6px' }}>
                          <span style={{ color:'#10b981', flexShrink:0 }}>{i+1}.</span>{r}
                        </div>
                      ))}
                    </div>
                  )}
                  {scanResult.scan?.performance_suggestions?.length>0 && (
                    <div style={{ background:'#0a0a14', border:'1px solid rgba(245,158,11,0.15)', borderRadius:'10px', padding:'13px', marginBottom:'12px' }}>
                      <div style={{ fontSize:'10px', fontWeight:700, color:'#f59e0b', marginBottom:'7px', display:'flex', alignItems:'center', gap:'5px' }}><Zap size={11}/>PERFORMANCE</div>
                      {scanResult.scan.performance_suggestions.map((t: string, i: number) => (
                        <div key={i} style={{ fontSize:'12px', color:'#94a3b8', padding:'5px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>⚡ {t}</div>
                      ))}
                    </div>
                  )}
                  {scanResult.scan?.duplicate_code?.length>0 && (
                    <div className="sc" style={{ marginBottom:'12px' }}>
                      <div style={{ fontSize:'10px', fontWeight:700, color:'#f59e0b', marginBottom:'6px' }}>DUPLICATE CODE</div>
                      {scanResult.scan.duplicate_code.map((d: any, i: number) => <div key={i} style={{ fontSize:'11px', color:'#94a3b8', padding:'3px 0' }}>{d.description||d}</div>)}
                    </div>
                  )}
                  {scanResult.scan?.dead_code?.length>0 && (
                    <div className="sc">
                      <div style={{ fontSize:'10px', fontWeight:700, color:'#64748b', marginBottom:'6px' }}>DEAD CODE</div>
                      {scanResult.scan.dead_code.map((d: any, i: number) => (
                        <div key={i} style={{ fontSize:'11px', color:'#94a3b8', padding:'3px 0' }}>
                          <span style={{ color:'#7c3aed', fontFamily:'monospace', fontSize:'10px' }}>{d.file}</span>: {d.description}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {scanResult.repo && (
                <div style={{ marginTop:'14px', padding:'11px 16px', background:'rgba(124,58,237,0.06)', border:'1px solid rgba(124,58,237,0.12)', borderRadius:'10px', display:'flex', gap:'18px', fontSize:'12px', color:'#64748b', flexWrap:'wrap' }}>
                  <span>📦 {scanResult.repo.name}</span>
                  <span>🌐 {scanResult.repo.language}</span>
                  <span>⭐ {scanResult.repo.stars}</span>
                  <span>🍴 {scanResult.repo.forks}</span>
                  <span>🐛 {scanResult.repo.open_issues} open issues</span>
                  <span style={{ marginLeft:'auto' }}>📂 {scanResult.scan?.total_files} total • {scanResult.scan?.files_scanned} analyzed</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══ HISTORY VIEW ══ */}
      {mainView==='history' && (
        <div style={{ animation:'fadeUp .3s ease' }}>
          {history.length===0 && scanHistory.length===0 ? (
            <div style={{ textAlign:'center', padding:'60px', background:'#0a0a14', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px' }}>
              <History size={38} style={{ opacity:.12, marginBottom:'14px', color:'#7c3aed' }}/>
              <div style={{ fontSize:'15px', fontWeight:600, color:'#475569', marginBottom:'5px' }}>No Review History</div>
              <div style={{ fontSize:'12px', color:'#334155' }}>PR reviews yahan save honge</div>
            </div>
          ) : history.map((r: any) => (
            <div key={r.id} style={{ display:'flex', gap:'12px', padding:'13px 16px', background:'#0a0a14', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'10px', marginBottom:'8px', alignItems:'center' }}>
              <div style={{ width:'40px', height:'40px', borderRadius:'9px', background:SCORE_BG(r.ai_score), border:`1px solid ${SCORE_COLOR(r.ai_score)}40`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ fontSize:'13px', fontWeight:800, color:SCORE_COLOR(r.ai_score) }}>{r.ai_score}</span>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'13px', fontWeight:600, color:'#f1f5f9' }}>{r.pr_title}</div>
                <div style={{ fontSize:'11px', color:'#475569', marginTop:'2px', display:'flex', gap:'10px' }}>
                  <span style={{ color:'#7c3aed' }}>{r.repo_name} #{r.pr_number}</span>
                  <span>🐛 {r.bugs_found}</span>
                  <span>🔒 {r.security_issues}</span>
                  <span>{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
          {scanHistory.length > 0 && (
  <>
    <div
  style={{
    display:'flex',
    justifyContent:'space-between',
    alignItems:'center',
    margin:'20px 0 10px'
  }}
>
  <h3
    style={{
      color:'#a855f7',
      margin:0
    }}
  >
    Repo Scan History
  </h3>

  <button
    onClick={clearAllScans}
    style={{
      background:'#ef4444',
      color:'#fff',
      border:'none',
      borderRadius:'8px',
      padding:'8px 14px',
      cursor:'pointer',
      fontWeight:600
    }}
  >
    Clear All
  </button>
</div>

    {scanHistory.map((s:any) => (
      <div
        key={s.id}
        onClick={() => loadScan(s.id)}
        style={{
          display:'flex',
          gap:'12px',
          padding:'13px 16px',
          background:'#0a0a14',
          border:'1px solid rgba(255,255,255,0.07)',
          borderRadius:'10px',
          marginBottom:'8px',
          cursor:'pointer'
        }}
      >
        <div style={{fontSize:'20px'}}>📂</div>

        <div style={{ flex:1 }}>
          <div
  style={{
    display:'flex',
    justifyContent:'space-between',
    alignItems:'center'
  }}
>
  <div
    style={{
      color:'#f1f5f9',
      fontWeight:600
    }}
  >
    {s.title}
  </div>

  <button
  onClick={(e) => {
    e.stopPropagation()
    deleteScan(s.id)
  }}
    style={{
  marginLeft:'auto',
  background:'transparent',
  border:'none',
  color:'#ef4444',
  cursor:'pointer'
}}
  >
    <Trash2 size={16}/>
</button>
</div>

          <div
            style={{
              color:'#64748b',
              fontSize:'12px'
            }}
          >
            {new Date(s.created_at).toLocaleString()}
          </div>
        </div>
      </div>
    ))}
  </>
)}


        </div>
      )}
    </div>
  )
}