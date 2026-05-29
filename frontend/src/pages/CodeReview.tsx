import { useState, useRef } from 'react'
import axios from 'axios'
import { Upload, Play, Copy, Download, CheckCircle, AlertTriangle, RefreshCw, ChevronRight, X } from 'lucide-react'

const API = 'http://localhost:5000/api'

const LANGS = ['JavaScript','TypeScript','Python','Java','C++','C#','Go','Ruby','PHP','Rust','Swift','Kotlin']

function parseScore(t:string){const m=t.match(/SCORE:\s*(\d+)/);return m?parseInt(m[1]):null}
function parseSeverity(t:string){const m=t.match(/SEVERITY:\s*(\w+)/);return m?m[1]:''}
function parseLang(t:string){const m=t.match(/LANGUAGE:\s*([\w+#]+)/);return m?m[1]:''}
function parseFixed(t:string){const m=t.match(/PERFECTLY FIXED CODE:\s*```[\w]*\n([\s\S]*?)```/);return m?m[1].trim():''}
function parseBugs(t:string){
  const m=t.match(/BUGS FOUND:([\s\S]*?)(?=SECURITY ISSUES:|COMPLEXITY:|IMPROVEMENTS:|PERFECTLY)/i)
  if(!m)return[]
  return m[1].split('\n').filter(l=>l.trim().startsWith('-')).map(l=>l.replace(/^-\s*/,'').trim()).filter(Boolean)
}
function parseSecurity(t:string){
  const m=t.match(/SECURITY ISSUES:([\s\S]*?)(?=COMPLEXITY:|IMPROVEMENTS:|PERFECTLY)/i)
  if(!m)return[]
  return m[1].split('\n').filter(l=>l.trim().startsWith('-')).map(l=>l.replace(/^-\s*/,'').trim()).filter(Boolean).filter(l=>!l.toLowerCase().includes('no '))
}
function parseComplexity(t:string){
  const m=t.match(/COMPLEXITY:([\s\S]*?)(?=IMPROVEMENTS:|PERFECTLY)/i)
  if(!m)return{time:'',space:''}
  const lines=m[1].split('\n')
  const time=lines.find(l=>l.toLowerCase().includes('time'))?.replace(/.*time[:\s]*/i,'').trim()||''
  const space=lines.find(l=>l.toLowerCase().includes('space'))?.replace(/.*space[:\s]*/i,'').trim()||''
  return{time,space}
}
function parseImprovements(t:string){
  const m=t.match(/IMPROVEMENTS:([\s\S]*?)(?=PERFECTLY|WHAT WAS)/i)
  if(!m)return[]
  return m[1].split('\n').filter(l=>l.trim().startsWith('-')).map(l=>l.replace(/^-\s*/,'').trim()).filter(Boolean)
}

const scoreColor=(s:number)=>s>=95?'#10b981':s>=80?'#f59e0b':s>=60?'#f97316':'#ef4444'
const scoreLabel=(s:number)=>s>=95?'Excellent':s>=80?'Good':s>=60?'Needs Work':'Poor'

export default function CodeReview({token}:{token:string}){
  const [code,setCode]=useState('')
  const [filename,setFilename]=useState('untitled.js')
  const [lang,setLang]=useState('JavaScript')
  const [review,setReview]=useState('')
  const [loading,setLoading]=useState(false)
  const [activeTab,setActiveTab]=useState<'issues'|'suggestions'|'security'|'complexity'>('issues')
  const [copied,setCopied]=useState(false)
  const [copiedFixed,setCopiedFixed]=useState(false)
  const fileRef=useRef<HTMLInputElement>(null)
  const h={headers:{Authorization:`Bearer ${token}`}}

  const score=parseScore(review)
  const severity=parseSeverity(review)
  const detectedLang=parseLang(review)
  const fixedCode=parseFixed(review)
  const bugs=parseBugs(review)
  const security=parseSecurity(review)
  const complexity=parseComplexity(review)
  const improvements=parseImprovements(review)

  const doReview=async()=>{
    if(!code.trim()){alert('Code paste karo pehle!');return}
    setLoading(true);setReview('')
    try{
      const res=await axios.post(`${API}/review`,{code,filename},h)
      setReview(res.data.review||'')
    }catch(e:any){setReview('Error: '+(e.response?.data?.error||'Review failed'))}
    setLoading(false)
  }

  const uploadFile=async(f:File)=>{
    const form=new FormData();form.append('file',f)
    try{
      const res=await axios.post(`${API}/upload`,form,{headers:{...h.headers,'Content-Type':'multipart/form-data'}})
      setCode(res.data.code);setFilename(res.data.filename);if(res.data.language)setLang(res.data.language)
    }catch(e:any){alert(e.response?.data?.error||'Upload failed')}
  }

  const copyReview=()=>{navigator.clipboard.writeText(review);setCopied(true);setTimeout(()=>setCopied(false),2000)}
  const copyFixed=()=>{navigator.clipboard.writeText(fixedCode);setCopiedFixed(true);setTimeout(()=>setCopiedFixed(false),2000)}
  const applyFix=()=>{setCode(fixedCode);setReview('');window.scrollTo(0,0)}
  const exportReport=()=>{
    const c=`CodeSense AI — Code Review Report\n${'='.repeat(40)}\nDate: ${new Date().toLocaleString()}\nFile: ${filename}\nScore: ${score}/100\nSeverity: ${severity}\nLanguage: ${detectedLang}\n\n${'='.repeat(40)}\n\nORIGINAL CODE:\n${code}\n\n${'='.repeat(40)}\n\nAI REVIEW:\n${review}`
    const b=new Blob([c],{type:'text/plain'});const u=URL.createObjectURL(b)
    const a=document.createElement('a');a.href=u;a.download=`codesense-${filename}-report.txt`;a.click()
  }

  const sevColor=severity==='Critical'?'#ef4444':severity==='Warning'?'#f59e0b':'#10b981'

  return(
    <div
  className="page"
  style={{
    width:'100%',
    padding:'25px',
    boxSizing:'border-box'
  }}
>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:translateX(0)}}
        .tab-btn{padding:8px 16px;border:none;background:transparent;color:#64748b;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;border-bottom:2px solid transparent;transition:all .2s}
        .tab-btn.active{color:#7c3aed;border-bottom-color:#7c3aed}
        .tab-btn:hover:not(.active){color:#94a3b8}
        .issue-item{display:flex;align-items:flex-start;gap:10px;padding:10px 14px;border-radius:9px;background:#13131f;border:1px solid rgba(255,255,255,0.06);margin-bottom:8px;transition:all .2s}
        .issue-item:hover{border-color:rgba(124,58,237,0.25)}
      `}</style>

      {/* Header */}
      <div style={{display:'flex',alignItems:'flex-start', marginTop: '5px', marginRight:'40px', marginLeft:'20px', justifyContent:'space-between',marginBottom:'20px',animation:'fadeUp .4s ease'}}>
        <div>
          <h1 style={{fontSize:'24px',fontWeight:800,color:'#f1f5f9',marginBottom:'4px'}}>AI Code Review</h1>
          <p style={{fontSize:'13px',color:'#64748b'}}>Get AI-powered feedback to improve your code quality.</p>
        </div>
        <div style={{display:'flex',gap:'10px'}}>
          <button onClick={()=>navigate('/history')} className="btn btn-ghost btn-sm">
            <RefreshCw size={13}/> History
          </button>
          {review&&<button onClick={exportReport} className="btn btn-ghost btn-sm">
            <Download size={13}/> Export Report
          </button>}
          {review&&<button onClick={copyReview} className="btn btn-ghost btn-sm">
            {copied?<><CheckCircle size={13}/> Copied!</>:<><Copy size={13}/> Copy</>}
          </button>}
        </div>
      </div>

      <div style={{display:'grid', marginTop: '20px', gridTemplateColumns:'1fr 380px',gap:'16px',alignItems:'start'}}>
        {/* LEFT — Editor */}
        <div style={{display:'flex',flexDirection:'column',gap:'14px',marginTop:'0'}}>
          {/* Editor card */}
          <div style={{background:'#0a0a14',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'14px',overflow:'hidden',animation:'fadeUp .4s ease .05s both'}}>
            {/* Editor header */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px',background:'#050510',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
              <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                <div style={{display:'flex',gap:'5px'}}>
                  <div style={{width:'11px',height:'11px',borderRadius:'50%',background:'#ef4444'}}/>
                  <div style={{width:'11px',height:'11px',borderRadius:'50%',background:'#f59e0b'}}/>
                  <div style={{width:'11px',height:'11px',borderRadius:'50%',background:'#10b981'}}/>
                </div>
                <input value={filename} onChange={e=>setFilename(e.target.value)}
                  style={{background:'transparent',border:'none',outline:'none',color:'#94a3b8',
                    fontSize:'12px',fontFamily:'JetBrains Mono',width:'140px'}}/>
                <select
  value={lang}
  onChange={e => {

    const l = e.target.value

    setLang(l)

    const ext:any = {
      JavaScript:'js',
      TypeScript:'ts',
      Python:'py',
      Java:'java',
      'C++':'cpp',
      'C#':'cs',
      Go:'go',
      Ruby:'rb',
      PHP:'php',
      Rust:'rs',
      Swift:'swift',
      Kotlin:'kt'
    }

    setFilename(`untitled.${ext[l]}`)
  }}
                  style={{background:'#13131f',border:'1px solid rgba(255,255,255,0.08)',color:'#64748b',
                    borderRadius:'6px',padding:'3px 8px',fontSize:'12px',outline:'none'}}>
                  {LANGS.map(l=><option key={l}>{l}</option>)}
                </select>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                <input ref={fileRef} type="file" style={{display:'none'}}
                  accept=".js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.cs,.go,.rb,.php,.rs,.kt,.swift"
                  onChange={e=>e.target.files?.[0]&&uploadFile(e.target.files[0])}/>
                <button onClick={()=>fileRef.current?.click()} className="btn btn-ghost btn-xs">
                  <Upload size={12}/> Upload File
                </button>
                {code&&<button onClick={()=>{setCode('');setReview('')}} style={{background:'none',border:'none',cursor:'pointer',color:'#475569'}}>
                  <X size={14}/>
                </button>}
                <div style={{fontSize:'11px',color:'#334155'}}>
                  {code?`Lines ${code.split('\n').length} • ${lang}`:'Empty'}
                </div>
                {code&&<div style={{display:'flex',alignItems:'center',gap:'4px',fontSize:'11px',color:'#10b981'}}>
                  <span style={{width:'6px',height:'6px',borderRadius:'50%',background:'#10b981',display:'inline-block'}}/>
                  Auto-saved
                </div>}
              </div>
            </div>

            {/* Line numbers + code area */}
            <div style={{position:'relative',display:'flex',minHeight:'380px'}}>
              {code&&<div style={{padding:'16px 10px',background:'#03030a',borderRight:'1px solid rgba(255,255,255,0.04)',
                fontFamily:'JetBrains Mono',fontSize:'12px',lineHeight:'22.75px',color:'#2d3748',
                userSelect:'none',minWidth:'36px',textAlign:'right'}}>
                {code.split('\n').map((_,i)=><div key={i}>{i+1}</div>)}
              </div>}
              <textarea
                className="code-ta"
                value={code}
                onChange={e=>setCode(e.target.value)}
                placeholder={`// Paste your ${lang} code here...\n// Or click "Upload File" to load from disk\n\nfunction example() {\n  // Your code here\n}`}
                style={{flex:1,minHeight:'380px'}}
                spellCheck={false}
              />
            </div>

            {/* Review button */}
            <div style={{padding:'12px 16px',borderTop:'1px solid rgba(255,255,255,0.05)',background:'#050510'}}>
              <button onClick={doReview} disabled={loading||!code.trim()} className="btn btn-primary btn-full btn-lg">
                {loading
                  ?<><div style={{width:'16px',height:'16px',border:'2px solid rgba(255,255,255,0.25)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>AI Analyzing...</>
                  :<><Play size={16}/> Review Code</>}
              </button>
            </div>
          </div>

          {/* Before / After Diff */}
          {fixedCode&&(
            <div style={{background:'#0a0a14',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'14px',overflow:'hidden',animation:'slideIn .4s ease'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 18px',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                <h3 style={{fontSize:'14px',fontWeight:700,color:'#f1f5f9'}}>Before / After (AI Fixed Code)</h3>
                <div style={{display:'flex',gap:'8px'}}>
                  <button onClick={copyFixed} className="btn btn-ghost btn-xs">
                    {copiedFixed?<><CheckCircle size={11}/> Copied!</>:<><Copy size={11}/> Copy Fixed</>}
                  </button>
                  <button onClick={applyFix} className="btn btn-primary btn-xs">
                    <RefreshCw size={11}/> Apply Fix & Re-Review
                  </button>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 40px 1fr'}}>
                {/* Before */}
                <div>
                  <div style={{padding:'8px 14px',background:'rgba(239,68,68,0.08)',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                    <span style={{fontSize:'11px',fontWeight:700,color:'#ef4444'}}>Before (Original Code)</span>
                  </div>
                  <pre style={{padding:'14px',fontFamily:'JetBrains Mono',fontSize:'11.5px',lineHeight:'1.7',
                    color:'#fca5a5',margin:0,overflowX:'auto',maxHeight:'240px',overflowY:'auto',background:'rgba(239,68,68,0.04)'}}>
                    {code.slice(0,600)}{code.length>600?'\n...':''}</pre>
                </div>
                {/* Arrow */}
                <div style={{display:'flex',alignItems:'center',justifyContent:'center',background:'#050510'}}>
                  <div style={{width:'32px',height:'32px',borderRadius:'50%',background:'linear-gradient(135deg,#7c3aed,#6d28d9)',
                    display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 14px rgba(124,58,237,0.4)'}}>
                    <ChevronRight size={16} color="#fff"/>
                  </div>
                </div>
                {/* After */}
                <div>
                  <div style={{padding:'8px 14px',background:'rgba(16,185,129,0.08)',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                    <span style={{fontSize:'11px',fontWeight:700,color:'#10b981'}}>After (AI Fixed Code)</span>
                  </div>
                  <pre style={{padding:'14px',fontFamily:'JetBrains Mono',fontSize:'11.5px',lineHeight:'1.7',
                    color:'#86efac',margin:0,overflowX:'auto',maxHeight:'240px',overflowY:'auto',background:'rgba(16,185,129,0.04)'}}>
                    {fixedCode}</pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Results */}
        <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
          {/* Score Ring */}
          {score!==null&&(
            <div style={{background:'#0f0f1a',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',padding:'20px',animation:'slideIn .4s ease'}}>
              <div style={{display:'flex',alignItems:'center',gap:'20px',marginBottom:'18px'}}>
                {/* Circular score */}
                <div style={{position:'relative',width:'90px',height:'90px',flexShrink:0}}>
                  <svg width="90" height="90" style={{transform:'rotate(-90deg)'}}>
                    <circle cx="45" cy="45" r="38" fill="none" stroke="#1a1a2e" strokeWidth="7"/>
                    <circle cx="45" cy="45" r="38" fill="none" stroke={scoreColor(score)} strokeWidth="7"
                      strokeDasharray={`${2*Math.PI*38*score/100} ${2*Math.PI*38}`}
                      strokeLinecap="round" style={{transition:'stroke-dasharray .8s ease'}}/>
                  </svg>
                  <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                    <span style={{fontSize:'20px',fontWeight:800,color:scoreColor(score),fontFamily:'JetBrains Mono'}}>{score}</span>
                    <span style={{fontSize:'9px',color:'#475569',fontWeight:600}}>/ 100</span>
                  </div>
                </div>
                <div>
                  <div style={{fontSize:'18px',fontWeight:800,color:'#f1f5f9',marginBottom:'4px'}}>Overall Code Score</div>
                  <div style={{fontSize:'13px',color:scoreColor(score),fontWeight:600,marginBottom:'8px'}}>{scoreLabel(score)}</div>
                  <span style={{padding:'4px 10px',borderRadius:'100px',fontSize:'11px',fontWeight:700,
                    color:sevColor,background:`${sevColor}18`,border:`1px solid ${sevColor}30`}}>
                    {severity||'Info'}
                  </span>
                </div>
              </div>
              {/* Review Summary */}
              <div style={{borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:'16px'}}>
                <div style={{fontSize:'13px',fontWeight:700,color:'#f1f5f9',marginBottom:'12px'}}>Review Summary</div>
                {[
                  {label:'Issues Found',val:bugs.length,color:'#f59e0b',icon:'⚠'},
                  {label:'Critical',val:security.filter(s=>s.toLowerCase().includes('critical')).length||0,color:'#ef4444',icon:'🔴'},
                  {label:'Warnings',val:bugs.length,color:'#f97316',icon:'🟠'},
                  {label:'Suggestions',val:improvements.length,color:'#3b82f6',icon:'💡'},
                  {label:'Security Risks',val:security.length,color:'#ef4444',icon:'🛡'},
                ].map(({label,val,color,icon})=>(
                  <div key={label} style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'8px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'7px',fontSize:'12.5px',color:'#94a3b8'}}>
                      <span style={{fontSize:'11px'}}>{icon}</span>{label}
                    </div>
                    <span style={{fontSize:'13px',fontWeight:700,color}}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabs — Issues / Suggestions / Security / Complexity */}
          {review&&(
            <div style={{background:'#0f0f1a',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',overflow:'hidden',animation:'slideIn .4s ease .1s both'}}>
              <div style={{display:'flex',borderBottom:'1px solid rgba(255,255,255,0.07)',padding:'0 4px'}}>
                {([['issues','Issues',bugs.length],['suggestions','Suggestions',improvements.length],['security','Security',security.length],['complexity','Complexity',0]] as const).map(([id,label,count])=>(
                  <button key={id} className={`tab-btn${activeTab===id?' active':''}`}
                    onClick={()=>setActiveTab(id as any)}>
                    {label}{count>0&&<span style={{padding:'1px 6px',borderRadius:'100px',
                      fontSize:'10px',background:activeTab===id?'rgba(124,58,237,0.2)':'rgba(255,255,255,0.06)',
                      color:activeTab===id?'#a855f7':'#475569'}}>{count}</span>}
                  </button>
                ))}
              </div>
              <div style={{padding:'14px',maxHeight:'340px',overflowY:'auto'}}>
                {activeTab==='issues'&&(
                  bugs.length===0
                    ?<div style={{textAlign:'center',padding:'24px',color:'#475569'}}>
                      <CheckCircle size={28} color="#10b981" style={{marginBottom:'8px'}}/>
                      <div style={{fontSize:'13px',color:'#10b981',fontWeight:600}}>No bugs found!</div>
                    </div>
                    :bugs.map((b,i)=>(
                      <div key={i} className="issue-item">
                        <AlertTriangle size={14} color="#f59e0b" style={{marginTop:'1px',flexShrink:0}}/>
                        <div style={{fontSize:'12.5px',color:'#94a3b8',lineHeight:1.6}}>{b}</div>
                      </div>
                    ))
                )}
                {activeTab==='suggestions'&&(
                  improvements.length===0
                    ?<div style={{textAlign:'center',padding:'24px',color:'#475569',fontSize:'13px'}}>No suggestions</div>
                    :improvements.map((imp,i)=>(
                      <div key={i} className="issue-item">
                        <span style={{fontSize:'13px',flexShrink:0}}>💡</span>
                        <div style={{fontSize:'12.5px',color:'#94a3b8',lineHeight:1.6}}>{imp}</div>
                      </div>
                    ))
                )}
                {activeTab==='security'&&(
                  security.length===0
                    ?<div style={{textAlign:'center',padding:'24px',color:'#475569'}}>
                      <CheckCircle size={28} color="#10b981" style={{marginBottom:'8px'}}/>
                      <div style={{fontSize:'13px',color:'#10b981',fontWeight:600}}>No security issues!</div>
                    </div>
                    :security.map((s,i)=>(
                      <div key={i} className="issue-item" style={{borderColor:'rgba(239,68,68,0.15)'}}>
                        <span style={{fontSize:'13px',flexShrink:0}}>🛡️</span>
                        <div style={{fontSize:'12.5px',color:'#fca5a5',lineHeight:1.6}}>{s}</div>
                      </div>
                    ))
                )}
                {activeTab==='complexity'&&(
                  <div>
                    {complexity.time&&<div className="issue-item">
                      <span style={{fontSize:'13px'}}>⏱</span>
                      <div><div style={{fontSize:'11px',color:'#475569',marginBottom:'3px'}}>Time Complexity</div>
                      <div style={{fontSize:'13px',fontWeight:700,color:'#a855f7',fontFamily:'JetBrains Mono'}}>{complexity.time}</div></div>
                    </div>}
                    {complexity.space&&<div className="issue-item">
                      <span style={{fontSize:'13px'}}>💾</span>
                      <div><div style={{fontSize:'11px',color:'#475569',marginBottom:'3px'}}>Space Complexity</div>
                      <div style={{fontSize:'13px',fontWeight:700,color:'#3b82f6',fontFamily:'JetBrains Mono'}}>{complexity.space}</div></div>
                    </div>}
                    {!complexity.time&&!complexity.space&&<div style={{textAlign:'center',padding:'24px',color:'#475569',fontSize:'13px'}}>Run a review to see complexity analysis</div>}
                  </div>
                )}
              </div>
              {/* Apply All Fixes button */}
              {fixedCode&&(
                <div style={{padding:'12px 14px',borderTop:'1px solid rgba(255,255,255,0.06)'}}>
                  <button onClick={applyFix} className="btn btn-primary btn-full">
                    ✦ Apply All Fixes
                  </button>
                </div>
              )}
            </div>
          )}

          {/* AI Explanation */}
          {fixedCode&&(
            <div style={{background:'#0f0f1a',border:'1px solid rgba(124,58,237,0.2)',borderRadius:'14px',padding:'16px',animation:'slideIn .4s ease .2s both'}}>
              <div style={{display:'flex',alignItems:'center',gap:'7px',marginBottom:'12px'}}>
                <span style={{fontSize:'14px'}}>✦</span>
                <span style={{fontSize:'13px',fontWeight:700,color:'#f1f5f9'}}>AI Explanation</span>
              </div>
              <ul style={{padding:'0 0 0 4px',display:'flex',flexDirection:'column',gap:'7px'}}>
                {improvements.slice(0,4).map((imp,i)=>(
                  <li key={i} style={{display:'flex',alignItems:'flex-start',gap:'7px',fontSize:'12.5px',color:'#94a3b8',lineHeight:1.6,listStyle:'none'}}>
                    <span style={{color:'#7c3aed',marginTop:'2px',flexShrink:0}}>•</span>{imp}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Empty state */}
          {!review&&!loading&&(
            <div style={{background:'#0f0f1a',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'14px',
              padding:'48px 24px',textAlign:'center',animation:'fadeUp .4s ease'}}>
              <div style={{width:'60px',height:'60px',borderRadius:'16px',
                background:'rgba(124,58,237,0.12)',border:'1px solid rgba(124,58,237,0.25)',
                display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',fontSize:'26px'}}>🤖</div>
              <div style={{fontSize:'15px',fontWeight:700,color:'#f1f5f9',marginBottom:'8px'}}>AI Review Results</div>
              <div style={{fontSize:'13px',color:'#475569',lineHeight:1.7}}>
                Paste your code on the left<br/>and click "Review Code" to get<br/>instant AI feedback
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function navigate(path: string) { window.location.href = path }