import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Send, Plus, Trash2, Upload, Code2, Zap, FileText, X } from 'lucide-react'

const API = 'https://codesense-ai-2bu3.onrender.com/api'

const QUICK_ACTIONS = [
  { icon:'💡', label:'Explain this code',       prompt:'Can you explain what this code does and how it works in detail?' },
  { icon:'🐛', label:'Find and fix bugs',        prompt:'Please find all bugs in my code and provide the fixed version.' },
  { icon:'⚡', label:'Optimize performance',     prompt:'How can I optimize this code for better performance and efficiency?' },
  { icon:'🛡️', label:'Check security issues',    prompt:'Please check for any security vulnerabilities or risks in this code.' },
  { icon:'📄', label:'Generate documentation',   prompt:'Generate comprehensive documentation for this code including usage examples.' },
]

const MODELS = [{ value:'mixtral-8x7b-32768', label:'Mixtral 8x7B' }, { value:'llama-3.1-8b-instant', label:'Llama 3.1 8B (Fast)' }, { value:'llama-3.3-70b-versatile', label:'Llama 3.3 70B (Best)' }]

function renderMessage(content: string) {
  const parts = content.split(/(```[\s\S]*?```)/g)
  return parts.map((part, i) => {
    if (part.startsWith('```')) {
      const lines  = part.split('\n')
      const lang   = lines[0].replace('```', '').trim()
      const code   = lines.slice(1, -1).join('\n')
      return (
        <div key={i} style={{ margin:'10px 0', borderRadius:'8px', overflow:'hidden', border:'1px solid rgba(255,255,255,0.08)' }}>
          {lang && <div style={{ padding:'5px 12px', background:'#050510', fontSize:'11px', color:'#475569', fontFamily:'JetBrains Mono' }}>{lang}</div>}
          <pre style={{ margin:0, padding:'12px', background:'#080810', fontFamily:'JetBrains Mono', fontSize:'12px', lineHeight:1.7, color:'#cdd6f4', overflowX:'auto' }}>{code}</pre>
        </div>
      )
    }
    return <span key={i} style={{ whiteSpace:'pre-wrap' }}>{part}</span>
  })
}

export default function AIAssistant({ token }: { token: string }) {
  const [messages,   setMessages]   = useState<any[]>([])
  const [chatHistory, setChatHistory] = useState<any[]>([])
  const [allChats, setAllChats] = useState<any[]>([])
  const [input,      setInput]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [model, setModel] = useState('mixtral-8x7b-32768')
  const [attachedCode, setAttachedCode] = useState('')
  const [attachedFile, setAttachedFile] = useState('')
  const [recentFiles,  setRecentFiles]  = useState<any[]>([])
  const [histLoading,  setHistLoading]  = useState(true)
  const bottomRef  = useRef<HTMLDivElement>(null)
  const fileRef    = useRef<HTMLInputElement>(null)
  const h = { headers: { Authorization: `Bearer ${token}` } }
  const [showRight, setShowRight] = useState(false)
  const [activeChat, setActiveChat] = useState<number | null>(null)
  const [showCode, setShowCode] = useState(false)

  // Load chat history on mount
  useEffect(() => { loadHistory() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const loadHistory = async () => {
    setHistLoading(true)
    try {
      const res = await axios.get(`${API}/chat/history`, h)
      setChatHistory(res.data.messages || [])
setAllChats(res.data.messages || [])
setMessages(res.data.messages || [])
    } catch { setMessages([]) }
    setHistLoading(false)
  }
  const tryModels = async (
  message: string,
  code?: string
) => {

  const modelsToTry = [
    model,
    'mixtral-8x7b-32768',
    'llama-3.1-8b-instant',
    'llama-3.3-70b-versatile'
  ]

  const uniqueModels = Array.from(new Set(modelsToTry))

  for (const currentModel of uniqueModels) {

    try {

      console.log('Trying model:', currentModel)

      const res = await axios.post(
        `${API}/chat/message`,
        {
          message,
          code,
          model: currentModel
        },
        h
      )

      return {
        success: true,
        data: res.data,
        usedModel: currentModel
      }

    } catch (e: any) {

      console.log('Failed model:', currentModel)

      if (
        e.response?.status !== 429 &&
        e.response?.status !== 500
      ) {
        throw e
      }

    }

  }

  throw new Error('All AI models failed.')
}
  const send = async (msg?: string, uploadedCode?: string) => {

  const text = (msg || input).trim()

  if (!text || loading) return

  setInput('')

  const userMsg = {
    id: Date.now(),
    role: 'user',
    content: text,
    created_at: new Date().toISOString()
  }

  setMessages(prev => [...prev, userMsg])

  setLoading(true)

  try {

    const result = await tryModels(
  text,
  uploadedCode || attachedCode || undefined
)

const aiMsg = {
  id: Date.now() + 1,
  role: 'assistant',
  content: result.data.reply,
  created_at: new Date().toISOString()
}

setMessages(prev => [...prev, aiMsg])

    
    setChatHistory(prev => [
  {
    id: userMsg.id,
    role: 'user',
    content: userMsg.content,
    created_at: userMsg.created_at
  },
  ...prev
])

  } catch (e: any) {

    const errMsg = {
      id: Date.now() + 1,
      role: 'assistant',
      content:
        '❌ Error: ' +
        (e.response?.data?.error ||
          'Could not connect to AI. Please try again.'),
      created_at: new Date().toISOString()
    }

    setMessages(prev => [...prev, errMsg])

  }

  setLoading(false)

}

  const clearChat = async () => {
    if (!window.confirm('Clear all chat history?')) return
    try { await axios.delete(`${API}/chat/clear`, h) } catch {}
    setMessages([])
    setAttachedCode('')
    setAttachedFile('')
  }

  const handleFileUpload = (file: File) => {

  if (!file) return

  setAttachedFile(file.name)

  const reader = new FileReader()

  reader.onload = (e) => {

  const text = e.target?.result as string

  console.log(text)

  setAttachedCode(text)

  setAttachedFile(file.name)

  setInput(`I've uploaded a file: ${file.name}. Please analyze this code.`)

  setTimeout(() => {

    send(
      `I've uploaded a file: ${file.name}. Please analyze this code.`,
      text
    )

  }, 200)



}

  reader.readAsText(file)

}

  const applyRecentFile = (file: any) => {
    setAttachedCode(file.code)
    setAttachedFile(file.name)
  }

  const formatTime = (iso: string) => {
    try { return new Date(iso).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) } catch { return '' }
  }

  return (
    <div style={{ display:'flex', height:'calc(100vh - 0px)', overflow:'visible', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes dots{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
        .msg-wrap{animation:fadeUp .3s ease}
        .qa-btn{width:100%;text-align:left;padding:9px 12px;border-radius:8px;
          border:1px solid rgba(255,255,255,0.07);background:transparent;color:#94a3b8;
          font-size:12px;cursor:pointer;font-family:inherit;
          display:flex;align-items:center;gap:8px;transition:all .18s}
        .qa-btn:hover{background:rgba(124,58,237,0.1);border-color:rgba(124,58,237,0.3);color:#f1f5f9}
        .send-btn{width:40px;height:40px;border-radius:9px;border:none;
          background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;cursor:pointer;
          display:flex;align-items:center;justify-content:center;flex-shrink:0;
          transition:all .2s;box-shadow:0 0 16px rgba(124,58,237,0.3)}
        .send-btn:hover:not(:disabled){transform:scale(1.07)}
        .send-btn:disabled{opacity:.4;cursor:not-allowed;transform:none}
        .chat-inp{flex:1;background:transparent;border:none;outline:none;color:#f1f5f9;
          font-size:13px;font-family:inherit;resize:none;line-height:1.5;max-height:120px}
        .chat-inp::placeholder{color:#334155}
        .recent-file{display:flex;align-items:center;gap:8px;padding:7px 10px;
          border-radius:7px;cursor:pointer;transition:background .15s;border:1px solid transparent}
        .recent-file:hover{background:rgba(255,255,255,0.04);border-color:rgba(124,58,237,0.2)}
      `}</style>

      

      {/* CENTER - Main chat */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Header */}
        <div style={{ display:'flex',marginTop:'20px',marginLeft:'50px', alignItems:'center', justifyContent:'space-between', marginBottom:'10px', animation:'fadeUp .4s ease' }}>
          <div>
            <h1 style={{ fontSize:'18px', fontWeight:800, color:'#f1f5f9' }}>AI Assistant</h1>
            <p style={{ fontSize:'12px', color:'#64748b', marginTop:'2px' }}>Ask anything about your code. Get intelligent answers instantly.</p>
          </div>
          <div style={{ display:'flex', marginRight:'8px',gap:'8px', alignItems:'center' }}>
            {/* Model selector */}
            <select value={model} onChange={e => setModel(e.target.value)}
              style={{ background:'#13131f', border:'1px solid rgba(255,255,255,0.08)', color:'#94a3b8', borderRadius:'8px', padding:'7px 12px', fontSize:'12px', outline:'none', fontFamily:'inherit', cursor:'pointer' }}>
              {MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            {/* Upload file button */}
            <input ref={fileRef} type="file" style={{ display:'none' }}
              accept=".js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.cs,.go,.rb,.php,.rs,.kt,.swift,.html,.css,.json,.md"
              onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}/>
            <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()}>
              <Upload size={13}/> Upload File
            </button>
            <button className="btn btn-ghost btn-sm" onClick={clearChat}>
              <Trash2 size={13}/> Clear
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => { setMessages([]); setAttachedCode(''); setAttachedFile('') }}>
              <Plus size={13}/> New Chat
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex:1, overflowY:'auto', padding:'24px', display:'flex', flexDirection:'column', gap:'16px' }}>

          {/* Attached file badge */}
          {attachedFile && (
            <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 12px',
              background:'rgba(124,58,237,0.1)', border:'1px solid rgba(124,58,237,0.25)',
              borderRadius:'8px', fontSize:'12px', color:'#a855f7', alignSelf:'flex-start' }}>
              
              <button
  type="button"
  onClick={(e) => {
    e.preventDefault()
    e.stopPropagation()

    console.log(attachedCode)

    setShowCode(true)
  }}
  style={{
    background:'none',
    border:'none',
    color:'#c084fc',
    cursor:'pointer',
    fontSize:'12px',
    display:'flex',
    alignItems:'center',
    gap:'4px'
  }}
>
  Attached: <strong>{attachedFile}</strong>
</button>
              <button onClick={() => { setAttachedCode(''); setAttachedFile('') }}
                style={{ background:'none', border:'none', cursor:'pointer', color:'#64748b', display:'flex', marginLeft:'4px' }}>
                <X size={12}/>
              </button>
            </div>
          )}

          {/* Empty state */}
          {messages.length === 0 && !histLoading && (
            <div style={{ textAlign:'center', margin:'auto', maxWidth:'440px', animation:'fadeUp .4s ease' }}>
              <div style={{ width:'64px', height:'64px', borderRadius:'18px',
                background:'rgba(124,58,237,0.12)', border:'1px solid rgba(124,58,237,0.25)',
                display:'flex', alignItems:'center', justifyContent:'center',
                margin:'0 auto 16px', fontSize:'28px' }}>🤖</div>
              <h2 style={{ fontSize:'18px', fontWeight:700, color:'#f1f5f9', marginBottom:'8px' }}>AI Code Assistant</h2>
              <p style={{ fontSize:'13px', color:'#64748b', lineHeight:1.7, marginBottom:'20px' }}>
                Ask me anything about your code — bugs, optimization, security, explanations, and more. Upload a file or paste code to get started.
              </p>
              {/* Quick start suggestions */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', textAlign:'left' }}>
                {['Explain this function', 'Find security issues', 'Optimize my code', 'Write unit tests'].map(s => (
                  <button key={s} onClick={() => send(s)} style={{
                    padding:'10px 12px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.08)',
                    background:'rgba(124,58,237,0.06)', color:'#94a3b8', fontSize:'12px',
                    cursor:'pointer', fontFamily:'inherit', textAlign:'left', transition:'all .2s'
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor='rgba(124,58,237,0.3)'; (e.currentTarget as HTMLElement).style.color='#f1f5f9' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.color='#94a3b8' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <div key={msg.id || i} className="msg-wrap" style={{ display:'flex', gap:'12px', alignItems:'flex-start', flexDirection: msg.role==='user'?'row-reverse':'row' }}>
              <div style={{ width:'32px', height:'32px', borderRadius:'50%', flexShrink:0,
                background: msg.role==='user' ? 'linear-gradient(135deg,#7c3aed,#3b82f6)' : '#13131f',
                border: msg.role==='assistant' ? '1px solid rgba(124,58,237,0.25)' : 'none',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize: msg.role==='assistant'?'16px':'12px', fontWeight:700, color:'#fff' }}>
                {msg.role==='user' ? (msg.content[0]||'U').toUpperCase() : '🤖'}
              </div>
              <div style={{ maxWidth:'78%' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'5px',
                  flexDirection: msg.role==='user'?'row-reverse':'row' }}>
                  <span style={{ fontSize:'12px', fontWeight:700, color:'#f1f5f9' }}>
                    {msg.role==='user' ? 'You' : 'AI Assistant'}
                  </span>
                  <span style={{ fontSize:'10px', color:'#334155' }}>{formatTime(msg.created_at)}</span>
                </div>
                <div className={msg.role==='user'?'chat-user':'chat-ai'}>
                  {msg.role==='assistant' ? renderMessage(msg.content) : msg.content}
                </div>
              </div>
            </div>
          ))}

          {/* Loading dots */}
          {loading && (
            <div style={{ display:'flex', gap:'12px', alignItems:'flex-start' }}>
              <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'#13131f',
                border:'1px solid rgba(124,58,237,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px' }}>🤖</div>
              <div className="chat-ai" style={{ display:'flex', gap:'5px', alignItems:'center', padding:'14px 16px' }}>
                {[0,0.15,0.3].map((d,i) => (
                  <div key={i} style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#7c3aed',
                    animation:`dots 1.2s ease infinite`, animationDelay:`${d}s` }}/>
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        {/* Input */}
        <div style={{ padding:'14px 24px', borderTop:'1px solid rgba(255,255,255,0.07)', background:'#09090f', flexShrink:0 }}>
          <div style={{ display:'flex', gap:'10px', alignItems:'flex-end',
            background:'#13131f', border:'1px solid rgba(255,255,255,0.08)',
            borderRadius:'12px', padding:'10px 12px', transition:'border-color .2s' }}
            onFocus={e => (e.currentTarget.style.borderColor='rgba(124,58,237,0.4)')}
            onBlur={e => (e.currentTarget.style.borderColor='rgba(255,255,255,0.08)')}>
            
            
            {/* File attach */}
            <button title="Upload file" onClick={() => fileRef.current?.click()}
              style={{ background:'none', border:'none', cursor:'pointer', color:'#475569', display:'flex', flexShrink:0, padding:'2px', transition:'color .15s' }}
              onMouseEnter={e=>(e.currentTarget.style.color='#a855f7')}
              onMouseLeave={e=>(e.currentTarget.style.color='#475569')}>
              <Upload size={16}/>
            </button>
            <textarea className="chat-inp" rows={1} value={input}
              onChange={e => { setInput(e.target.value); e.target.style.height='auto'; e.target.style.height=Math.min(e.target.scrollHeight,120)+'px' }}
              placeholder={attachedFile ? `Ask about ${attachedFile}...` : 'Ask anything about your code...'}
              onKeyDown={e => { if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send() } }}/>
            <button className="send-btn" disabled={loading || !input.trim()} onClick={() => send()}>
              <Send size={16}/>
            </button>
          </div>
          <div style={{ fontSize:'11px', color:'#334155', marginTop:'6px', textAlign:'center' }}>
            Press Enter to send • Shift+Enter for new line • Upload files for AI analysis
          </div>
        </div>
      </div>
      {/* LEFT - Chat history sidebar */}
<div
  style={{
    width: showRight ? '220px' : '70px',
    background:'#0a0a14',
    borderLeft:'1px solid rgba(255,255,255,0.07)',
    display:'flex',
    flexDirection:'column',
    transition:'all .25s ease',
    overflow:'hidden'
  }}
>

  {/* Top */}
  <div
    style={{
      padding:'14px',
      display:'flex',
      alignItems:'center',
      justifyContent: showRight ? 'space-between' : 'center',
      borderBottom:'1px solid rgba(255,255,255,0.06)'
    }}
  >

    <button
      onClick={() => setShowRight(!showRight)}
      title="Open sidebar"
      style={{
        width:'36px',
        height:'36px',
        borderRadius:'12px',
        border:'1px solid rgba(255,255,255,0.08)',
        background:'#11111f',
        color:'#fff',
        cursor:'pointer',
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        fontSize:'16px',
        flexShrink:0
      }}
    >
      ☰
    </button>

    {showRight && (
      <button
        onClick={clearChat}
        style={{
          background:'none',
          border:'none',
          color:'#475569',
          cursor:'pointer',
          display:'flex'
        }}
      >
        <Trash2 size={14}/>
      </button>
    )}

  </div>

  {/* Mini Icons */}
  {!showRight && (
    <div
      style={{
        display:'flex',
        flexDirection:'column',
        alignItems:'center',
        gap:'18px',
        paddingTop:'20px'
      }}
    >

      <button
        style={{
          background:'none',
          border:'none',
          color:'#fff',
          cursor:'pointer'
        }}
        onClick={() => {
  setMessages([])
  setInput('')
  setAttachedCode('')
  setAttachedFile('')
}}
      >
        <Plus size={20}/>
      </button>

      <button
  style={{
    background:'none',
    border:'none',
    color:'#fff',
    cursor:'pointer'
  }}
  onClick={() => setShowRight(true)}
>
  🔍
</button>

      

    </div>
  )}

  {/* Full Sidebar */}
  {showRight && (
    <>
      <div style={{ padding:'14px' }}>

        <button
          onClick={() => {
            setMessages([])
            setAttachedCode('')
            setAttachedFile('')
          }}
          style={{
            width:'100%',
            padding:'12px',
            borderRadius:'12px',
            border:'1px solid rgba(255,255,255,0.06)',
            background:'#11111f',
            color:'#fff',
            cursor:'pointer',
            marginBottom:'10px',
            textAlign:'left',
            fontSize:'14px'
          }}
        >
          +  New chat
        </button>

        <input
  type="text"
  placeholder="🔍 Search chats"
  onChange={(e) => {
    const value = e.target.value.toLowerCase()

    const filtered = allChats.filter((c:any) =>
      c.content.toLowerCase().includes(value)
    )

    setChatHistory(filtered)
  }}
  style={{
    width:'100%',
    background:'#11111f',
    border:'1px solid rgba(255,255,255,0.06)',
    borderRadius:'12px',
    padding:'12px',
    color:'#fff',
    fontSize:'14px',
    marginBottom:'14px',
    outline:'none'
  }}
/>

      </div>

      {/* Chats */}
      <div
        style={{
          flex:1,
          overflowY:'auto',
          padding:'0 10px 10px',
          display:'flex',
          flexDirection:'column',
          gap:'6px'
        }}
      >

        {chatHistory.filter(m => m.role === 'user').length === 0 ? (
          <div
            style={{
              fontSize:'12px',
              color:'#334155',
              textAlign:'center',
              marginTop:'20px',
              lineHeight:1.6
            }}
          >
            No conversations yet.
          </div>
        ) : (
          chatHistory
  .slice()
  .reverse()
  .map((m, i) => (
              <div
  key={m.id || i}
  onClick={() => {

  setActiveChat(i)

  setMessages([
    m
  ])

}}
  style={{
                  padding:'10px',
                  borderRadius:'10px',
                  cursor:'pointer',
                  background:
  activeChat === i
    ? 'linear-gradient(135deg,#7c3aed,#4f46e5)'
    : '#11111f',
                  border:'1px solid rgba(255,255,255,0.05)'
                }}
              >
                <div
                  style={{
                    fontSize:'12px',
                    color:
  activeChat === i
    ? '#ffffff'
    : '#94a3b8',
                    overflow:'hidden',
                    textOverflow:'ellipsis',
                    whiteSpace:'nowrap'
                  }}
                >
                  {m.content.slice(0,35)}
                </div>

                <div
                  style={{
                    fontSize:'10px',
                    color:'#475569',
                    marginTop:'4px'
                  }}
                >
                  {m.created_at
                    ? new Date(m.created_at).toLocaleDateString()
                    : 'Today'}
                </div>

              </div>
            ))
        )}

      </div>
    </>
  )}

</div>
  
  {showCode && (
  <div
    style={{
      position:'fixed',
      top:0,
      left:0,
      width:'100%',
      height:'100%',
      background:'rgba(0,0,0,0.82)',
      display:'flex',
      justifyContent:'center',
      alignItems:'center',
      zIndex:9999
    }}
  >
    <div
      style={{
        width:'85%',
        height:'85%',
        background:'#0f172a',
        borderRadius:'14px',
        border:'1px solid rgba(255,255,255,0.08)',
        display:'flex',
        flexDirection:'column',
        overflow:'hidden'
      }}
    >

      {/* Top Bar */}
      <div
        style={{
          padding:'14px 18px',
          borderBottom:'1px solid rgba(255,255,255,0.08)',
          display:'flex',
          justifyContent:'space-between',
          alignItems:'center',
          color:'#fff',
          fontWeight:600
        }}
      >
        <span>{attachedFile}</span>

        <button
          onClick={() => setShowCode(false)}
          style={{
            background:'none',
            border:'none',
            color:'#fff',
            fontSize:'20px',
            cursor:'pointer'
          }}
        >
          ✕
        </button>
      </div>

      {/* Code Area */}
      <textarea
        defaultValue={attachedCode}
        value={attachedCode}
        readOnly
        style={{
          flex:1,
          width:'100%',
          background:'#020617',
          color:'#f8fafc',
          border:'none',
          padding:'20px',
          fontSize:'13px',
          fontFamily:'monospace',
          outline:'none',
          resize:'none',
          lineHeight:'1.6'
        }}
      />

    </div>
  </div>
)}
      </div>
)
}