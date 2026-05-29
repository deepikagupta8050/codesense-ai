import { useState, useRef } from 'react'
import axios from 'axios'
import {
  Shield, RefreshCw, AlertTriangle, CheckCircle,
  Upload, GitBranch, Code2, X, FileCode, ChevronDown
} from 'lucide-react'

const API = 'https://codesense-ai-2bu3.onrender.com/api'

function parseIssues(text: string) {
  const m = text.match(/ISSUES:([\s\S]*?)(?=SUMMARY:|RECOMMENDATIONS:|$)/i)
  if (!m) return []
  return m[1].split('\n').filter(l => l.trim().startsWith('-')).map(l => {
    const line = l.replace(/^-\s*/, '').trim()
    const sev     = line.match(/SEVERITY:\s*(\w+)/i)?.[1] || 'Medium'
    const type    = line.match(/TYPE:\s*([^|]+)/i)?.[1]?.trim() || 'Issue'
    const lineNum = line.match(/LINE:\s*(\d+)/i)?.[1] || '—'
    const desc    = line.match(/DESC:\s*([^|]+)/i)?.[1]?.trim() || line
    const fix     = line.match(/FIX:\s*(.+)/i)?.[1]?.trim() || ''
    return { sev, type, lineNum, desc, fix }
  }).filter(i => i.desc.length > 3)
}

function parseScore(text: string)   { const m = text.match(/SECURITY_SCORE:\s*(\d+)/i); return m ? parseInt(m[1]) : null }
function parseCounts(text: string)  {
  return {
    critical: parseInt(text.match(/CRITICAL_COUNT:\s*(\d+)/i)?.[1] || '0'),
    high:     parseInt(text.match(/HIGH_COUNT:\s*(\d+)/i)?.[1] || '0'),
    medium:   parseInt(text.match(/MEDIUM_COUNT:\s*(\d+)/i)?.[1] || '0'),
    low:      parseInt(text.match(/LOW_COUNT:\s*(\d+)/i)?.[1] || '0'),
  }
}
function parseSummary(text: string) { const m = text.match(/SUMMARY:([\s\S]*?)(?=RECOMMENDATIONS:|ISSUES:|$)/i); return m ? m[1].trim() : '' }
function parseRecs(text: string)    { const m = text.match(/RECOMMENDATIONS:([\s\S]*?)$/i); if (!m) return []; return m[1].split('\n').filter(l=>l.trim().startsWith('-')).map(l=>l.replace(/^-\s*/,'').trim()).filter(Boolean) }

const sevColor = (s: string) => s==='Critical'?'#ef4444':s==='High'?'#f97316':s==='Medium'?'#f59e0b':'#10b981'
const sevBg    = (s: string) => s==='Critical'?'rgba(239,68,68,0.12)':s==='High'?'rgba(249,115,22,0.12)':s==='Medium'?'rgba(245,158,11,0.12)':'rgba(16,185,129,0.12)'

type ScanMode = 'paste' | 'upload' | 'github'

interface ScanResult {
  result: string
  scanType: string
  repoName?: string
  totalFiles: number
  scannedFiles: string[]
  duration: string
}

export default function SecurityScan({ token }: { token: string }) {
  const [mode, setMode]         = useState<ScanMode>('paste')
  const [code, setCode]         = useState('')
  const [filename, setFilename] = useState('')
  const [lang, setLang] = useState('JavaScript')
  const [repoUrl, setRepoUrl]   = useState('')
  const [scanData, setScanData] = useState<ScanResult | null>(null)
  const [loading, setLoading]   = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [filter, setFilter]     = useState('All')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const h = { headers: { Authorization: `Bearer ${token}` } }

  // ── File Upload Handler ─────────────────────────────────
  const handleFile = (file: File) => {
    setFilename(file.name)
    const reader = new FileReader()
    reader.onload = e => setCode(e.target?.result as string || '')
    reader.readAsText(file)
  }

  const detectLanguage = (text:string) => {

  if(text.includes('#include'))
    return 'untitled.cpp'

  if(text.includes('using namespace std'))
    return 'untitled.cpp'

  if(text.includes('public class'))
    return 'untitled.java'

  if(text.includes('def '))
    return 'untitled.py'

  if(text.includes('import java'))
    return 'untitled.java'

  if(text.includes('console.log'))
    return 'untitled.js'

  if(text.includes('function '))
    return 'untitled.js'

  if(text.includes('interface '))
    return 'untitled.ts'

  if(text.includes(': string'))
    return 'untitled.ts'

  if(text.includes('package main'))
    return 'untitled.go'

  if(text.includes('fmt.Println'))
    return 'untitled.go'

  if(text.includes('puts '))
    return 'untitled.rb'

  if(text.includes('<?php'))
    return 'untitled.php'

  if(text.includes('fn main'))
    return 'untitled.rs'

  if(text.includes('fun main'))
    return 'untitled.kt'

  if(text.includes('using System'))
    return 'untitled.cs'

  if(text.includes('namespace '))
    return 'untitled.cs'

  if(text.includes('import SwiftUI'))
    return 'untitled.swift'

  return 'untitled.txt'
}









  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  // ── Scan ────────────────────────────────────────────────
  const scan = async () => {
    if (mode === 'github' && !repoUrl.trim()) { alert('GitHub repository URL daalo!'); return }
    if (mode !== 'github' && !code.trim())    { alert('Code paste karo ya file upload karo!'); return }

    setLoading(true); setScanData(null); setSelected(null)
    try {
      const payload: any = { scanType: mode }
      if (mode === 'github') {
        payload.repoUrl = repoUrl.trim()
      } else {
        payload.code     = code
        payload.filename = filename || (mode === 'paste' ? 'snippet' : 'untitled')
        payload.scanType = mode === 'upload' ? 'file' : 'snippet'
      }

      const res = await axios.post(`${API}/security/scan`, payload, h)
      setScanData(res.data)
    } catch (e: any) {
      alert('Error: ' + (e.response?.data?.error || 'Scan failed'))
    }
    setLoading(false)
  }

  const result  = scanData?.result || ''
  const score   = parseScore(result)
  const counts  = parseCounts(result)
  const issues  = parseIssues(result)
  const summary = parseSummary(result)
  const recs    = parseRecs(result)
  const total   = counts.critical + counts.high + counts.medium + counts.low

  const scoreColor = score !== null ? (score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444') : '#64748b'
  const scoreLabel = score !== null ? (score >= 80 ? 'Good' : score >= 60 ? 'Fair' : 'Poor') : ''

  const FILTERS  = ['All', 'Critical', 'High', 'Medium', 'Low']
  const filtered = filter === 'All' ? issues : issues.filter(i => i.sev === filter)

  const scanTypeLabel = scanData?.scanType === 'github'
    ? 'Full Repository'
    : scanData?.scanType === 'file'
    ? 'Single File'
    : 'Code Snippet'

  const downloadReport = () => {
    if (!result) return
    const blob = new Blob([result], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `security-report-${scanData?.repoName?.replace('/','_') || filename || 'scan'}.txt`
    a.click()
  }

  return (
    <div className="page" style={{ maxWidth: '2000px' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        .iss-row { transition:all .18s; cursor:pointer }
        .iss-row:hover { background:#1a1a2e!important }
        .mode-tab { transition:all .2s; cursor:pointer; border:none; font-family:inherit }
        .mode-tab:hover { background:rgba(255,255,255,0.07)!important }
        .drop-zone { transition:all .2s }
      `}</style>

      {/* ── Header ─────────────────────────────────────── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px', animation:'fadeUp .4s ease' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Shield size={20} color="#ef4444"/>
          </div>
          <div>
            <h1 style={{ fontSize:'22px', fontWeight:800, color:'#f1f5f9' }}>AI Security Scan</h1>
            <p style={{ fontSize:'13px', color:'#64748b' }}>Detect vulnerabilities and security risks in your code before deployment.</p>
          </div>
        </div>
        <div style={{ display:'flex', gap:'10px' }}>
          <button onClick={scan} disabled={loading} className="btn btn-primary">
            {loading
              ? <><div style={{ width:'14px',height:'14px',border:'2px solid rgba(255,255,255,0.25)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite' }}/> Scanning...</>
              : <><Shield size={14}/> Scan Code</>}
          </button>
          {result && (
            <button className="btn btn-ghost btn-sm" onClick={downloadReport}>
              Generate Report
            </button>
          )}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'20px' }}>

        {/* ── Left: Input Panel ────────────────────────── */}
        <div style={{ background:'#0a0a14', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', overflow:'hidden', animation:'fadeUp .4s ease .05s both' }}>

          {/* Mode Tabs */}
          <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.07)', background:'#050510' }}>
            {([
              { id:'paste',  icon:<Code2 size={13}/>,   label:'Paste Code' },
              { id:'upload', icon:<Upload size={13}/>,   label:'Upload File' },
              { id:'github', icon:<GitBranch size={13}/>,   label:'GitHub Repo' },
            ] as { id: ScanMode; icon: React.ReactNode; label: string }[]).map(tab => (
              <button key={tab.id} className="mode-tab" onClick={() => { setMode(tab.id); setCode(''); setFilename(''); setRepoUrl('') }}
                style={{
                  flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'6px',
                  padding:'11px 8px', fontSize:'12px', fontWeight:600,
                  color: mode === tab.id ? '#f1f5f9' : '#475569',
                  background: mode === tab.id ? 'rgba(124,58,237,0.12)' : 'transparent',
                  borderBottom: mode === tab.id ? '2px solid #7c3aed' : '2px solid transparent',
                }}>
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>

          {/* ── Paste Mode ─────────────────────────── */}
          {mode === 'paste' && (
            <>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px', background:'#050510', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display:'flex', gap:'5px' }}>
                  <div style={{ width:'10px',height:'10px',borderRadius:'50%',background:'#ef4444' }}/>
                  <div style={{ width:'10px',height:'10px',borderRadius:'50%',background:'#f59e0b' }}/>
                  <div style={{ width:'10px',height:'10px',borderRadius:'50%',background:'#10b981' }}/>
                </div>
                <input
                  value={filename}
                  onChange={e => setFilename(e.target.value)}
                  placeholder="filename.js"
                  style={{ background:'transparent', border:'none', outline:'none', color:'#94a3b8', fontSize:'12px', fontFamily:'JetBrains Mono', textAlign:'center' }}
                />
                <span style={{ fontSize:'11px', color:'#334155' }}>{code ? `${code.split('\n').length} lines` : ''}</span>
              </div>
              <textarea
  className="code-ta"
  value={code}
  onChange={e => {

    const value = e.target.value

    setCode(value)

    if(!filename || filename.startsWith('untitled.')){
      setFilename(detectLanguage(value))
    }
  }}
                placeholder={'// Paste your code here for security scanning...\n// AI will detect:\n// - SQL Injection\n// - XSS vulnerabilities\n// - Hardcoded secrets\n// - Unsafe functions\n// - And more...'}
                style={{ minHeight:'320px' }}
              />
            </>
          )}

          {/* ── Upload Mode ────────────────────────── */}
          {mode === 'upload' && (
            <div style={{ padding:'20px' }}>
              <div
                className="drop-zone"
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? '#7c3aed' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius:'12px', padding:'32px', textAlign:'center', cursor:'pointer',
                  background: dragOver ? 'rgba(124,58,237,0.06)' : 'rgba(255,255,255,0.02)',
                  marginBottom: code ? '16px' : 0,
                }}>
                <Upload size={28} color={dragOver ? '#7c3aed' : '#475569'} style={{ marginBottom:'10px' }}/>
                <div style={{ fontSize:'14px', fontWeight:600, color:'#94a3b8', marginBottom:'4px' }}>
                  {filename ? filename : 'Drop file here or click to browse'}
                </div>
                <div style={{ fontSize:'12px', color:'#475569' }}>
                  Supports: .js .ts .jsx .tsx .py .java .go .rb .php .cs .cpp .c .rs
                </div>
                <input ref={fileRef} type="file"
                  accept=".js,.ts,.jsx,.tsx,.py,.java,.go,.rb,.php,.cs,.cpp,.c,.rs,.swift,.kt,.vue,.html,.css"
                  style={{ display:'none' }}
                  onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
                />
              </div>

              {code && (
                <div style={{ position:'relative' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'12px', color:'#64748b' }}>
                      <FileCode size={13}/> {filename} — {code.split('\n').length} lines
                    </div>
                    <button onClick={() => { setCode(''); setFilename('') }}
                      style={{ background:'none', border:'none', cursor:'pointer', color:'#475569' }}>
                      <X size={14}/>
                    </button>
                  </div>
                  <textarea className="code-ta" value={code} onChange={e => setCode(e.target.value)}
                    style={{ minHeight:'220px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.07)' }}
                  />
                </div>
              )}
            </div>
          )}

          {/* ── GitHub Mode ────────────────────────── */}
          {mode === 'github' && (
            <div style={{ padding:'20px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'12px 14px', background:'rgba(16,185,129,0.07)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:'10px', marginBottom:'18px' }}>
                <CheckCircle size={14} color="#10b981"/>
                <span style={{ fontSize:'12.5px', color:'#86efac' }}>
                  GitHub account connected. Your token will be used to fetch repository files.
                </span>
              </div>

              <label style={{ fontSize:'12px', color:'#64748b', display:'block', marginBottom:'6px', fontWeight:600 }}>Repository URL</label>
              <input
                value={repoUrl}
                onChange={e => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repository"
                style={{
                  width:'100%', boxSizing:'border-box', padding:'11px 14px',
                  background:'#0d0d1a', border:'1px solid rgba(255,255,255,0.1)',
                  borderRadius:'9px', color:'#f1f5f9', fontSize:'13px',
                  fontFamily:'JetBrains Mono', outline:'none', marginBottom:'12px',
                }}
              />

              <div style={{ padding:'14px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'9px' }}>
                <div style={{ fontSize:'12px', color:'#64748b', marginBottom:'8px', fontWeight:600 }}>What gets scanned:</div>
                {['.js, .ts, .jsx, .tsx', '.py, .java, .go, .rb', '.php, .cs, .cpp, .c, .rs'].map(ext => (
                  <div key={ext} style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'12px', color:'#475569', marginBottom:'4px' }}>
                    <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:'#7c3aed' }}/>
                    {ext}
                  </div>
                ))}
                <div style={{ fontSize:'11px', color:'#334155', marginTop:'8px' }}>Max 15 files per scan to stay within API limits.</div>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Score + Status ─────────────────────── */}
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>

          {/* Score Card */}
          <div style={{ background:'#0f0f1a', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', padding:'20px', animation:'fadeUp .4s ease .1s both' }}>
            <h3 style={{ fontSize:'14px', fontWeight:700, color:'#f1f5f9', marginBottom:'16px' }}>Security Score</h3>
            <div style={{ display:'flex', alignItems:'center', gap:'20px', marginBottom:'20px' }}>
              <div style={{ position:'relative', width:'90px', height:'90px', flexShrink:0 }}>
                <svg width="90" height="90" style={{ transform:'rotate(-90deg)' }}>
                  <circle cx="45" cy="45" r="36" fill="none" stroke="#1a1a2e" strokeWidth="8"/>
                  <circle cx="45" cy="45" r="36" fill="none" stroke={scoreColor} strokeWidth="8"
                    strokeDasharray={`${2*Math.PI*36*(score||0)/100} ${2*Math.PI*36}`}
                    strokeLinecap="round" style={{ transition:'stroke-dasharray .8s ease' }}/>
                </svg>
                <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontSize:'20px', fontWeight:800, color:scoreColor, fontFamily:'JetBrains Mono' }}>
                    {score !== null ? score : '—'}
                  </span>
                  <span style={{ fontSize:'9px', color:'#475569' }}>/100</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize:'16px', fontWeight:700, color:scoreColor, marginBottom:'4px' }}>
                  {score !== null ? scoreLabel : 'Not scanned'}
                </div>
                {scanData && <div style={{ fontSize:'12px', color:'#64748b' }}>{scanData.scannedFiles.length} file{scanData.scannedFiles.length !== 1 ? 's' : ''} scanned</div>}
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px' }}>
              {([['Critical',counts.critical,'#ef4444'],['High',counts.high,'#f97316'],['Medium',counts.medium,'#f59e0b'],['Low',counts.low,'#10b981']] as [string,number,string][]).map(([l,n,c]) => (
                <div key={l} style={{ textAlign:'center', padding:'10px', borderRadius:'9px', background:`${c}10`, border:`1px solid ${c}25` }}>
                  <div style={{ fontSize:'20px', fontWeight:800, color:c }}>{n}</div>
                  <div style={{ fontSize:'11px', color:'#64748b', marginTop:'2px' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Scan Status */}
          <div style={{ background:'#0f0f1a', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', padding:'20px', animation:'fadeUp .4s ease .15s both' }}>
            <h3 style={{ fontSize:'14px', fontWeight:700, color:'#f1f5f9', marginBottom:'14px' }}>Scan Status</h3>
            <div style={{ textAlign:'center', padding:'16px 0' }}>

              {loading ? (
                <div>
                  <div style={{ width:'48px', height:'48px', borderRadius:'50%', border:'3px solid rgba(124,58,237,0.2)', borderTopColor:'#7c3aed', animation:'spin .8s linear infinite', margin:'0 auto 12px' }}/>
                  <div style={{ fontSize:'14px', fontWeight:600, color:'#f1f5f9' }}>
                    {mode === 'github' ? 'Fetching & scanning repository...' : 'Scanning code...'}
                  </div>
                  <div style={{ fontSize:'12px', color:'#64748b', marginTop:'4px' }}>AI is analyzing your code</div>
                </div>

              ) : scanData ? (
                <div>
                  <div style={{ width:'52px', height:'52px', borderRadius:'50%', background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
                    <CheckCircle size={24} color="#10b981"/>
                  </div>
                  <div style={{ fontSize:'14px', fontWeight:700, color:'#10b981' }}>Scan completed successfully!</div>
                  <div style={{ fontSize:'12px', color:'#64748b', marginTop:'4px' }}>Your code was scanned for vulnerabilities.</div>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginTop:'16px', textAlign:'left' }}>
                    {[
                      ['Scan Type',   scanTypeLabel],
                      ['Duration',    scanData.duration],
                      ['Total Files', String(scanData.totalFiles)],
                      ['Scanned At',  new Date().toLocaleDateString('en-IN')],
                    ].map(([k,v]) => (
                      <div key={k}>
                        <div style={{ fontSize:'11px', color:'#475569' }}>{k}</div>
                        <div style={{ fontSize:'13px', color:'#94a3b8', marginTop:'2px', fontWeight:600 }}>{v}</div>
                      </div>
                    ))}
                  </div>

                  {/* Scanned files list (GitHub only) */}
                  {scanData.scanType === 'github' && scanData.scannedFiles.length > 0 && (
                    <div style={{ marginTop:'14px', textAlign:'left', maxHeight:'100px', overflowY:'auto', background:'#0d0d1a', borderRadius:'8px', padding:'10px' }}>
                      {scanData.scannedFiles.map(f => (
                        <div key={f} style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'11px', color:'#64748b', marginBottom:'3px', fontFamily:'JetBrains Mono' }}>
                          <FileCode size={10} color="#7c3aed"/>{f}
                        </div>
                      ))}
                    </div>
                  )}

                  <button onClick={scan} disabled={loading} className="btn btn-primary btn-full" style={{ marginTop:'14px' }}>
                    <RefreshCw size={13}/> Scan Again
                  </button>
                </div>

              ) : (
                <div>
                  <div style={{ width:'52px', height:'52px', borderRadius:'50%', background:'rgba(100,116,139,0.1)', border:'1px solid rgba(100,116,139,0.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
                    <Shield size={24} color="#64748b"/>
                  </div>
                  <div style={{ fontSize:'14px', color:'#64748b' }}>No scan run yet</div>
                  <div style={{ fontSize:'12px', color:'#334155', marginTop:'4px' }}>
                    {mode === 'paste'  && 'Code paste karo aur Scan Code click karo'}
                    {mode === 'upload' && 'File upload karo aur Scan Code click karo'}
                    {mode === 'github' && 'GitHub repository URL daalo aur Scan Code click karo'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Issues + Recommendations ─────────────────────── */}
      {scanData && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:'20px', animation:'fadeUp .4s ease' }}>

          {/* Issues Table */}
          <div style={{ background:'#0f0f1a', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', overflow:'hidden' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.07)', flexWrap:'wrap', gap:'10px' }}>
              <h3 style={{ fontSize:'14px', fontWeight:700, color:'#f1f5f9' }}>
                Detected Issues <span style={{ color:'#64748b', fontWeight:500 }}>({total})</span>
              </h3>
              <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                {FILTERS.map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    padding:'4px 10px', borderRadius:'100px', border:'none', cursor:'pointer',
                    fontSize:'11px', fontWeight:700, fontFamily:'inherit',
                    background: filter===f ? '#7c3aed' : 'rgba(255,255,255,0.05)',
                    color: filter===f ? '#fff' : '#64748b', transition:'all .18s',
                  }}>
                    {f}{f !== 'All' ? ` (${f==='Critical'?counts.critical:f==='High'?counts.high:f==='Medium'?counts.medium:counts.low})` : ''}
                  </button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px', color:'#475569' }}>
                <CheckCircle size={28} color="#10b981" style={{ marginBottom:'8px' }}/>
                <div style={{ fontSize:'13px', color:'#10b981', fontWeight:600 }}>No {filter !== 'All' ? filter : ''} issues found!</div>
              </div>
            ) : (
              <table className="tbl">
                <thead><tr><th>Issue</th><th>File</th><th>Line</th><th>Severity</th><th>Status</th></tr></thead>
                <tbody>
                  {filtered.map((issue, i) => (
                    <tr key={i} className="iss-row"
                      onClick={() => setSelected(selected?.type===issue.type&&selected?.lineNum===issue.lineNum ? null : issue)}
                      style={{ background: selected?.type===issue.type ? '#1a1a2e' : 'transparent' }}>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:'9px' }}>
                          <div style={{ width:'28px', height:'28px', borderRadius:'7px', flexShrink:0, background:sevBg(issue.sev), display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <AlertTriangle size={12} color={sevColor(issue.sev)}/>
                          </div>
                          <div>
                            <div style={{ fontSize:'13px', fontWeight:600, color:'#f1f5f9' }}>{issue.type}</div>
                            <div style={{ fontSize:'11px', color:'#64748b', marginTop:'1px' }}>{issue.desc.slice(0,55)}{issue.desc.length>55?'...':''}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontFamily:'JetBrains Mono', fontSize:'11px', color:'#64748b', maxWidth:'120px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {scanData.scanType === 'github' ? (scanData.scannedFiles[0] || '—') : (filename || 'snippet')}
                      </td>
                      <td style={{ fontFamily:'JetBrains Mono', fontSize:'12px', color:'#64748b' }}>{issue.lineNum}</td>
                      <td><span style={{ padding:'3px 8px', borderRadius:'100px', fontSize:'11px', fontWeight:700, color:sevColor(issue.sev), background:sevBg(issue.sev) }}>{issue.sev}</span></td>
                      <td><span style={{ padding:'3px 8px', borderRadius:'100px', fontSize:'11px', fontWeight:700, color:'#f59e0b', background:'rgba(245,158,11,0.12)' }}>Unresolved</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Selected issue detail */}
            {selected && (
              <div style={{ margin:'14px', padding:'14px', background:'#13131f', borderRadius:'10px', border:`1px solid ${sevColor(selected.sev)}30`, animation:'fadeUp .3s ease' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' }}>
                  <AlertTriangle size={14} color={sevColor(selected.sev)}/>
                  <span style={{ fontSize:'13px', fontWeight:700, color:'#f1f5f9' }}>{selected.type}</span>
                  <span style={{ padding:'2px 7px', borderRadius:'100px', fontSize:'10px', fontWeight:700, color:sevColor(selected.sev), background:sevBg(selected.sev) }}>{selected.sev}</span>
                </div>
                <p style={{ fontSize:'12.5px', color:'#94a3b8', lineHeight:1.65, marginBottom:'10px' }}>{selected.desc}</p>
                {selected.fix && (
                  <div style={{ padding:'10px', background:'rgba(16,185,129,0.08)', borderRadius:'7px', border:'1px solid rgba(16,185,129,0.2)', fontSize:'12px', color:'#86efac' }}>
                    <span style={{ fontWeight:700 }}>Fix: </span>{selected.fix}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right column */}
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>

            {/* Recommendations */}
            <div style={{ background:'#0f0f1a', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', padding:'16px' }}>
              <h3 style={{ fontSize:'14px', fontWeight:700, color:'#f1f5f9', marginBottom:'14px' }}>Security Recommendations</h3>
              {(recs.length > 0 ? recs.slice(0,5) : [
                'Use environment variables for all secrets and API keys',
                'Sanitize and validate all user input before processing',
                'Use parameterized queries to prevent SQL injection',
                'Avoid using eval() or dynamic code execution',
                'Implement strong authentication and session management',
              ]).map((r, i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'10px', marginBottom:'12px' }}>
                  <div style={{ width:'28px',height:'28px',borderRadius:'7px',background:'rgba(124,58,237,0.12)',border:'1px solid rgba(124,58,237,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',flexShrink:0 }}>🔐</div>
                  <div style={{ fontSize:'12.5px', color:'#94a3b8', lineHeight:1.6 }}>{r}</div>
                </div>
              ))}
            </div>

            {/* Security Summary donut */}
            <div style={{ background:'#0f0f1a', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', padding:'16px' }}>
              <h3 style={{ fontSize:'14px', fontWeight:700, color:'#f1f5f9', marginBottom:'14px' }}>Security Summary</h3>
              <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                <div style={{ position:'relative', flexShrink:0 }}>
                  <svg width="80" height="80" style={{ transform:'rotate(-90deg)' }}>
                    <circle cx="40" cy="40" r="32" fill="none" stroke="#1a1a2e" strokeWidth="8"/>
                    {total > 0 && [
                      {c:'#ef4444', pct:counts.critical/total},
                      {c:'#f97316', pct:counts.high/total},
                      {c:'#f59e0b', pct:counts.medium/total},
                      {c:'#10b981', pct:counts.low/total},
                    ].reduce((acc: {arr:any[],offset:number}, {c,pct}) => {
                      acc.arr.push({c,pct,offset:acc.offset}); acc.offset+=pct; return acc
                    }, {arr:[],offset:0}).arr.map(({c,pct,offset},i) => (
                      <circle key={i} cx="40" cy="40" r="32" fill="none" stroke={c} strokeWidth="8"
                        strokeDasharray={`${2*Math.PI*32*pct} ${2*Math.PI*32}`}
                        strokeDashoffset={-2*Math.PI*32*offset} strokeLinecap="butt"/>
                    ))}
                  </svg>
                  <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center' }}>
                    <div style={{ fontSize:'16px',fontWeight:800,color:'#f1f5f9' }}>{total}</div>
                    <div style={{ fontSize:'9px',color:'#475569' }}>Total</div>
                  </div>
                </div>
                <div style={{ flex:1 }}>
                  {([['Critical','#ef4444',counts.critical],['High','#f97316',counts.high],['Medium','#f59e0b',counts.medium],['Low','#10b981',counts.low]] as [string,string,number][]).map(([l,c,n]) => (
                    <div key={l} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'6px' }}>
                      <div style={{ display:'flex',alignItems:'center',gap:'6px' }}>
                        <div style={{ width:'8px',height:'8px',borderRadius:'2px',background:c }}/>
                        <span style={{ fontSize:'12px',color:'#64748b' }}>{l}</span>
                      </div>
                      <span style={{ fontSize:'12px',fontWeight:700,color:c }}>{n} ({total>0?Math.round(n/total*100):0}%)</span>
                    </div>
                  ))}
                </div>
              </div>
              {summary && (
                <p style={{ fontSize:'12px',color:'#475569',lineHeight:1.65,marginTop:'14px',paddingTop:'14px',borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                  {summary}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}