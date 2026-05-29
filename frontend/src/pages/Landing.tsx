import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [visible, setVisible] = useState(false)
  const [subEmail, setSubEmail] = useState('')
  const [subDone, setSubDone] = useState(false)
  const [modal, setModal] = useState<'privacy'|'terms'|null>(null)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setVisible(true)
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const NAV_MAP: Record<string,string> = {
    'Features':'features','How It Works':'how-it-works','Pricing':'pricing','About Us':'about'
  }
  const FOOTER_MAP: Record<string,string> = {
    'About Us':'about','How It Works':'how-it-works','Features':'features','Pricing':'pricing'
  }

  const handleSubscribe = () => {
    if (!subEmail || !subEmail.includes('@')) { alert('Valid email dalo!'); return }
    setSubDone(true); setSubEmail('')
    setTimeout(() => setSubDone(false), 3000)
  }

  const G = {
    page: { background:'#09090f', color:'#e2e8f0', fontFamily:"'Plus Jakarta Sans',sans-serif", minHeight:'100vh', overflowX:'hidden' as const },
    nav: {
      position:'fixed' as const, top:0, left:0, right:0, zIndex:100,
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 6%', height:'64px',
      background: scrolled ? 'rgba(9,9,15,0.9)' : 'transparent',
      backdropFilter: scrolled ? 'blur(14px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(124,58,237,0.15)' : '1px solid transparent',
      transition:'all 0.35s ease',
    },
  }

  const btnPrimary: React.CSSProperties = {
    padding:'10px 22px', borderRadius:'9px', border:'none',
    background:'linear-gradient(135deg,#7c3aed,#6d28d9)', color:'#fff',
    fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:'inherit',
    boxShadow:'0 0 22px rgba(124,58,237,0.4)', transition:'all 0.2s',
    display:'inline-flex', alignItems:'center', gap:'6px',
  }
  const btnOutline: React.CSSProperties = {
    padding:'10px 20px', borderRadius:'9px', border:'1px solid rgba(255,255,255,0.12)',
    background:'transparent', color:'#e2e8f0', fontSize:'14px', fontWeight:600,
    cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s',
    display:'inline-flex', alignItems:'center', gap:'6px',
  }

  const FEATURES = [
    { icon:'⚡', title:'AI Code Review',   desc:'Get smart AI reviews with clear explanations and actionable suggestions.' },
    { icon:'🛡️', title:'Security Scan',    desc:'Detect vulnerabilities and security issues before they go live.' },
    { icon:'🔧', title:'Auto Fix Code',    desc:'Automatically fix issues with one click using AI suggestions.' },
    { icon:'📊', title:'Smart Analytics',  desc:'Track code quality, trends and performance with deep analytics.' },
    { icon:'🔀', title:'PR Analysis',      desc:'Analyze pull requests and improve code review collaboration.' },
  ]

  const HOW = [
    { n:'1', icon:'⬆️', title:'Upload Code',       desc:'Connect your repo or upload your code.' },
    { n:'2', icon:'🤖', title:'AI Reviews',         desc:'Our AI analyzes your code and finds issues.' },
    { n:'3', icon:'🔧', title:'Auto Fix',           desc:'Fix issues automatically or apply suggestions.' },
    { n:'4', icon:'🚀', title:'Ship Better Code',   desc:'Improve code quality and ship with confidence.' },
  ]

  const PRICING = [
    { name:'Free',  sub:'For Students',   price:'$0',  mo:'/month', pop:false,
      items:['5 Code Reviews / month','Basic AI Suggestions','Security Scan (Basic)','Community Support'] },
    { name:'Pro',   sub:'For Developers', price:'$9',  mo:'/month', pop:true,
      items:['Unlimited Code Reviews','Advanced AI Fixes','Security Scan (Advanced)','Analytics & Reports'] },
    { name:'Team',  sub:'For Teams',      price:'$29', mo:'/month', pop:false,
      items:['Everything in Pro','Team Collaboration','Priority Support','Custom Rules & Workflows'] },
  ]

  return (
    <div style={G.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes gradMove{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        .fade-up{animation:fadeUp 0.6s ease both}
        .fade-in{animation:fadeIn 0.5s ease both}
        .float-anim{animation:float 4s ease infinite}
        .nav-lnk{font-size:14px;color:#94a3b8;cursor:pointer;text-decoration:none;transition:color .2s}
        .nav-lnk:hover{color:#f1f5f9}
        .feat-card{background:#0f0f1a;border:1px solid rgba(124,58,237,0.15);border-radius:14px;
          padding:28px 20px;text-align:center;transition:all 0.28s;cursor:default}
        .feat-card:hover{border-color:rgba(124,58,237,0.5);transform:translateY(-5px);
          box-shadow:0 12px 40px rgba(124,58,237,0.12)}
        .price-card{background:#0f0f1a;border:1px solid rgba(255,255,255,0.07);
          border-radius:16px;padding:28px;transition:all .25s}
        .price-card:hover{border-color:rgba(124,58,237,0.3);transform:translateY(-3px)}
        .price-card-pop{background:linear-gradient(135deg,rgba(124,58,237,0.15),rgba(109,40,217,0.08));
          border:1px solid rgba(124,58,237,0.45);border-radius:16px;padding:28px;
          box-shadow:0 0 40px rgba(124,58,237,0.1)}
        .btn-p:hover{transform:translateY(-2px)!important;box-shadow:0 0 32px rgba(124,58,237,0.5)!important}
        .btn-o:hover{border-color:rgba(124,58,237,0.5)!important;color:#a855f7!important}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#1a1a2e;border-radius:2px}
      `}</style>

      {/* NAV */}
      <nav style={G.nav}>
        <div style={{display:'flex',alignItems:'center',gap:'9px'}}>
          <div style={{width:'32px',height:'32px',borderRadius:'8px',
            background:'linear-gradient(135deg,#7c3aed,#a855f7)',
            display:'flex',alignItems:'center',justifyContent:'center',
            boxShadow:'0 0 16px rgba(124,58,237,0.5)'}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
          <span style={{fontSize:'15px',fontWeight:700,color:'#f1f5f9'}}>
            CodeSense <span style={{color:'#a855f7'}}>AI</span>
          </span>
        </div>
        <div style={{display:'flex',gap:'32px'}}>
          {['Features','How It Works','Pricing','About Us'].map(l=>(
            <a key={l} className="nav-lnk" href="#" onClick={e=>{e.preventDefault();scrollTo(NAV_MAP[l])}}>{l}</a>
          ))}
        </div>
        <div style={{display:'flex',gap:'10px'}}>
          <button className="btn-o" style={btnOutline} onClick={()=>navigate('/login')}>Log In</button>
          <button className="btn-p" style={btnPrimary} onClick={()=>navigate('/signup')}>Get Started Free →</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{padding:'130px 6% 80px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:'-60px',left:'50%',transform:'translateX(-50%)',
          width:'900px',height:'500px',
          background:'radial-gradient(ellipse,rgba(124,58,237,0.2) 0%,transparent 65%)',
          pointerEvents:'none'}}/>
        <div style={{position:'absolute',inset:0,
          backgroundImage:'radial-gradient(circle,rgba(124,58,237,0.07) 1px,transparent 1px)',
          backgroundSize:'30px 30px',pointerEvents:'none'}}/>

        <div style={{maxWidth:'1200px',margin:'0 auto',display:'grid',
          gridTemplateColumns:'1fr 1fr',gap:'60px',alignItems:'center',position:'relative'}}>
          {/* Left */}
          <div className="fade-up" style={{animationDelay:'0.1s'}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:'8px',
              padding:'6px 14px',borderRadius:'100px',marginBottom:'24px',
              border:'1px solid rgba(124,58,237,0.4)',background:'rgba(124,58,237,0.1)'}}>
              <span style={{fontSize:'13px',color:'#c084fc'}}>✦ AI-Powered Code Review</span>
            </div>
            <h1 style={{fontSize:'52px',fontWeight:800,lineHeight:1.1,marginBottom:'20px',color:'#f1f5f9'}}>
              AI Code Review<br/>for Smart<br/>
              <span style={{background:'linear-gradient(90deg,#a855f7,#7c3aed)',
                WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
                Developers
              </span>{' '}
              <span style={{color:'#a855f7',fontSize:'40px'}}>✦</span>
            </h1>
            <p style={{fontSize:'16px',color:'#94a3b8',lineHeight:1.75,marginBottom:'36px',maxWidth:'440px'}}>
              Instant AI reviews, smart suggestions, and automated fixes to help you write cleaner, safer and better code, faster.
            </p>
            <div style={{display:'flex',gap:'14px',marginBottom:'44px'}}>
              <button className="btn-p" style={{...btnPrimary,padding:'13px 28px',fontSize:'15px'}}
                onClick={()=>navigate('/signup')}>Get Started Free →</button>
              <button className="btn-o" style={{...btnOutline,padding:'13px 24px',fontSize:'15px'}}
                onClick={()=>navigate('/login')}>▷ Try Live Demo</button>
            </div>
            <div style={{display:'flex',gap:'24px',flexWrap:'wrap' as const}}>
              {['AI Reviews','Auto Fix','Security Scan','Smart Analytics'].map(f=>(
                <div key={f} style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'13px',color:'#64748b'}}>
                  <span style={{color:'#7c3aed'}}>✦</span>{f}
                </div>
              ))}
            </div>
          </div>

          {/* Right — Code Preview Card */}
          <div className="fade-up float-anim" style={{animationDelay:'0.25s'}}>
            <div style={{background:'#0f0f1a',border:'1px solid rgba(124,58,237,0.2)',
              borderRadius:'16px',overflow:'hidden',
              boxShadow:'0 24px 60px rgba(0,0,0,0.5),0 0 40px rgba(124,58,237,0.08)'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
                padding:'12px 16px',borderBottom:'1px solid rgba(255,255,255,0.05)',background:'#080810'}}>
                <div style={{display:'flex',gap:'6px'}}>
                  <div style={{width:'11px',height:'11px',borderRadius:'50%',background:'#ef4444'}}/>
                  <div style={{width:'11px',height:'11px',borderRadius:'50%',background:'#f59e0b'}}/>
                  <div style={{width:'11px',height:'11px',borderRadius:'50%',background:'#10b981'}}/>
                </div>
                <span style={{fontSize:'12px',color:'#475569',fontFamily:'JetBrains Mono'}}>userService.py</span>
                <div/>
              </div>
              <div style={{display:'flex'}}>
                <div style={{flex:1,padding:'16px',fontFamily:'JetBrains Mono',fontSize:'12px',lineHeight:'22px',color:'#cdd6f4'}}>
                  {[
                    {n:1,code:'def get_user(user_id):'},
                    {n:2,code:'  user = User.objects.filter(id=user_id)'},
                    {n:3,code:'  if user:'},
                    {n:4,code:'    return user'},
                    {n:5,code:'  return None'},
                    {n:6,code:''},
                    {n:7,code:'def calculate_total(items):'},
                    {n:8,code:'  total = 0'},
                    {n:9,code:'  for item in items:'},
                    {n:10,code:'    total += item.price'},
                    {n:11,code:'  return total'},
                  ].map(({n,code})=>(
                    <div key={n} style={{display:'flex',gap:'14px'}}>
                      <span style={{color:'#2d3748',minWidth:'16px',textAlign:'right',userSelect:'none'}}>{n}</span>
                      <span style={{color: n===2?'#fca5a5': n===8?'#fcd34d': '#cdd6f4'}}>{code}</span>
                    </div>
                  ))}
                </div>
                <div style={{width:'175px',background:'#0a0a14',borderLeft:'1px solid rgba(255,255,255,0.05)',padding:'14px',flexShrink:0}}>
                  <div style={{fontSize:'12px',fontWeight:700,color:'#f1f5f9',marginBottom:'4px'}}>AI Review</div>
                  <div style={{fontSize:'11px',color:'#64748b',marginBottom:'8px'}}>Issues Found</div>
                  <div style={{fontSize:'28px',fontWeight:800,color:'#f1f5f9',marginBottom:'12px'}}>3</div>
                  {[['Critical','#ef4444',1],['High','#f97316',1],['Medium','#f59e0b',1],['Low','#10b981',0]].map(([l,c,n])=>(
                    <div key={l as string} style={{display:'flex',justifyContent:'space-between',marginBottom:'6px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'5px'}}>
                        <div style={{width:'7px',height:'7px',borderRadius:'50%',background:c as string}}/>
                        <span style={{fontSize:'11px',color:'#94a3b8'}}>{l as string}</span>
                      </div>
                      <span style={{fontSize:'11px',color:'#64748b'}}>{n as number}</span>
                    </div>
                  ))}
                  <div style={{marginTop:'12px',paddingTop:'12px',borderTop:'1px solid rgba(255,255,255,0.05)'}}>
                    <div style={{fontSize:'11px',fontWeight:700,color:'#f1f5f9',marginBottom:'6px'}}>AI Suggestion</div>
                    <div style={{fontSize:'10.5px',color:'#64748b',lineHeight:1.6,marginBottom:'8px'}}>
                      Use <code style={{color:'#c084fc'}}>.first()</code> instead of <code style={{color:'#c084fc'}}>filter()</code>
                    </div>
                    <div style={{fontSize:'10px',color:'#7c3aed',marginBottom:'8px'}}>Line 2</div>
                    <button style={{width:'100%',padding:'7px',background:'linear-gradient(135deg,#7c3aed,#6d28d9)',
                      border:'none',borderRadius:'6px',color:'#fff',fontSize:'11px',fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
                      Apply Fix
                    </button>
                  </div>
                </div>
              </div>
              <div style={{display:'flex',gap:'20px',padding:'10px 16px',borderTop:'1px solid rgba(255,255,255,0.05)',background:'#080810'}}>
                <span style={{fontSize:'11px',color:'#f59e0b'}}>⚠ 3 Issues</span>
                <span style={{fontSize:'11px',color:'#10b981'}}>✓ 1 Auto Fix</span>
                <span style={{fontSize:'11px',color:'#10b981'}}>🛡 Security: Good</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{padding:'80px 6%',maxWidth:'1200px',margin:'0 auto'}}>
        <h2 className="fade-up" style={{textAlign:'center',fontSize:'36px',fontWeight:800,color:'#f1f5f9',marginBottom:'8px'}}>
          Powerful features for better code <span style={{color:'#7c3aed'}}>+</span>
        </h2>
        <p className="fade-up" style={{textAlign:'center',color:'#64748b',marginBottom:'48px',animationDelay:'.1s'}}>
          Everything you need to write clean, secure and reliable code
        </p>
        <div className="stagger" style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'16px'}}>
          {FEATURES.map(({icon,title,desc})=>(
            <div key={title} className="feat-card anim-up">
              <div style={{width:'52px',height:'52px',borderRadius:'12px',
                background:'rgba(124,58,237,0.15)',border:'1px solid rgba(124,58,237,0.25)',
                display:'flex',alignItems:'center',justifyContent:'center',
                margin:'0 auto 16px',fontSize:'22px'}}>{icon}</div>
              <h3 style={{fontSize:'14px',fontWeight:700,color:'#f1f5f9',marginBottom:'8px'}}>{title}</h3>
              <p style={{fontSize:'12px',color:'#64748b',lineHeight:1.65}}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{padding:'80px 6%',background:'rgba(124,58,237,0.03)'}}>
        <div style={{maxWidth:'1100px',margin:'0 auto'}}>
          <h2 style={{textAlign:'center',fontSize:'36px',fontWeight:800,color:'#f1f5f9',marginBottom:'56px'}}>
            How it works
          </h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'24px'}}>
            {HOW.map(({n,icon,title,desc},i)=>(
              <div key={n} style={{textAlign:'center',position:'relative'}}>
                {i<3&&<div style={{position:'absolute',top:'22px',left:'60%',right:'-40%',
                  height:'2px',background:'linear-gradient(90deg,rgba(124,58,237,0.6),rgba(124,58,237,0.05))',zIndex:0}}/>}
                <div style={{width:'44px',height:'44px',borderRadius:'50%',
                  background:'linear-gradient(135deg,#7c3aed,#6d28d9)',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:'15px',fontWeight:800,color:'#fff',margin:'0 auto 20px',
                  position:'relative',zIndex:1,boxShadow:'0 0 20px rgba(124,58,237,0.4)'}}>
                  {n}
                </div>
                <div style={{fontSize:'28px',marginBottom:'14px'}}>{icon}</div>
                <h3 style={{fontSize:'15px',fontWeight:700,color:'#f1f5f9',marginBottom:'8px'}}>{title}</h3>
                <p style={{fontSize:'13px',color:'#64748b',lineHeight:1.65}}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ANALYTICS SECTION */}
      <section style={{padding:'80px 6%'}}>
        <div style={{maxWidth:'1200px',margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1.6fr',gap:'60px',alignItems:'center'}}>
          <div className="fade-up">
            <h2 style={{fontSize:'44px',fontWeight:800,lineHeight:1.12,marginBottom:'16px'}}>
              Track. Analyze.<br/>
              <span style={{background:'linear-gradient(90deg,#a855f7,#7c3aed)',
                WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Improve.</span>
            </h2>
            <p style={{fontSize:'14px',color:'#64748b',lineHeight:1.75,marginBottom:'24px'}}>
              Get deep insights into your code quality, security and performance over time.
            </p>
            {['Code Quality Score','Security Vulnerabilities','Complexity & Maintainability','Team & Project Analytics'].map(item=>(
              <div key={item} style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'12px'}}>
                <div style={{width:'20px',height:'20px',borderRadius:'50%',flexShrink:0,
                  background:'rgba(124,58,237,0.15)',border:'1px solid rgba(124,58,237,0.4)',
                  display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <span style={{fontSize:'10px',color:'#a855f7'}}>✓</span>
                </div>
                <span style={{fontSize:'14px',color:'#94a3b8'}}>{item}</span>
              </div>
            ))}
          </div>
          <div className="fade-up" style={{animationDelay:'.15s'}}>
            <div style={{background:'#0f0f1a',border:'1px solid rgba(124,58,237,0.15)',borderRadius:'16px',padding:'24px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
                <h3 style={{fontSize:'15px',fontWeight:700,color:'#f1f5f9'}}>Analytics Overview</h3>
                <span style={{fontSize:'12px',color:'#64748b',background:'#1a1a2e',padding:'4px 10px',borderRadius:'6px',border:'1px solid rgba(255,255,255,0.07)'}}>This Week ∨</span>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'14px',marginBottom:'20px'}}>
                {[['Code Quality','82/100','+7↑','#10b981'],['Security Score','91/100','+4↑','#10b981'],
                  ['Issues Found','28','↑11%','#ef4444'],['Auto Fix','15','↑23%','#a855f7']].map(([l,v,d,c])=>(
                  <div key={l as string}>
                    <div style={{fontSize:'11px',color:'#475569',marginBottom:'3px'}}>{l as string}</div>
                    <div style={{fontSize:'20px',fontWeight:800,color:'#f1f5f9',marginBottom:'2px'}}>{v as string}</div>
                    <div style={{fontSize:'11px',color:c as string}}>↑ <span style={{color:'#64748b'}}>{d as string}</span></div>
                  </div>
                ))}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
                <div>
                  <div style={{fontSize:'12px',color:'#475569',marginBottom:'8px'}}>Code Quality Trend</div>
                  <div style={{background:'#080810',borderRadius:'8px',padding:'12px',height:'80px',
                    display:'flex',alignItems:'flex-end',justifyContent:'space-between',gap:'3px'}}>
                    {[25,38,30,52,45,62,70,80].map((h,i)=>(
                      <div key={i} style={{flex:1,borderRadius:'3px 3px 0 0',height:`${h}%`,
                        background:i===7?'#7c3aed':'rgba(124,58,237,0.3)',transition:'height .5s'}}/>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{fontSize:'12px',color:'#475569',marginBottom:'8px'}}>Issues by Severity</div>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                    <div style={{width:'68px',height:'68px',borderRadius:'50%',flexShrink:0,
                      background:'conic-gradient(#ef4444 0% 11%,#f97316 11% 36%,#f59e0b 36% 79%,#10b981 79% 100%)',
                      display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <div style={{width:'46px',height:'46px',borderRadius:'50%',background:'#080810',
                        display:'flex',flexDirection:'column' as const,alignItems:'center',justifyContent:'center'}}>
                        <div style={{fontSize:'13px',fontWeight:800,color:'#f1f5f9'}}>28</div>
                        <div style={{fontSize:'9px',color:'#475569'}}>Total</div>
                      </div>
                    </div>
                    <div>
                      {[['Critical','#ef4444',3],['High','#f97316',7],['Medium','#f59e0b',12],['Low','#10b981',6]].map(([l,c,n])=>(
                        <div key={l as string} style={{display:'flex',alignItems:'center',gap:'5px',marginBottom:'3px'}}>
                          <div style={{width:'6px',height:'6px',borderRadius:'50%',background:c as string}}/>
                          <span style={{fontSize:'11px',color:'#64748b'}}>{l as string}</span>
                          <span style={{fontSize:'11px',color:'#94a3b8',marginLeft:'4px'}}>{n as number}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{padding:'80px 6%',background:'rgba(124,58,237,0.02)'}}>
        <div style={{maxWidth:'1000px',margin:'0 auto'}}>
          <h2 style={{textAlign:'center',fontSize:'36px',fontWeight:800,color:'#f1f5f9',marginBottom:'8px'}}>
            Simple pricing, built for everyone
          </h2>
          <p style={{textAlign:'center',color:'#64748b',marginBottom:'48px',fontSize:'14px'}}>No hidden fees. Cancel anytime.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'20px'}}>
            {PRICING.map(({name,sub,price,mo,pop,items})=>(
              <div key={name} className={pop?'price-card-pop':'price-card'} style={{position:'relative'}}>
                {pop&&<div style={{position:'absolute',top:'-12px',left:'50%',transform:'translateX(-50%)',
                  padding:'4px 16px',background:'linear-gradient(135deg,#7c3aed,#6d28d9)',
                  borderRadius:'100px',fontSize:'11px',fontWeight:700,color:'#fff',whiteSpace:'nowrap'}}>
                  Most Popular
                </div>}
                <div style={{marginBottom:'20px'}}>
                  <h3 style={{fontSize:'20px',fontWeight:800,color:'#f1f5f9'}}>{name}</h3>
                  <div style={{fontSize:'12px',color:'#64748b',marginTop:'2px'}}>{sub} ↗</div>
                </div>
                <div style={{marginBottom:'24px'}}>
                  <span style={{fontSize:'40px',fontWeight:800,color:'#f1f5f9'}}>{price}</span>
                  <span style={{fontSize:'14px',color:'#475569'}}>{mo}</span>
                </div>
                <div style={{marginBottom:'24px'}}>
                  {items.map(f=>(
                    <div key={f} style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'10px'}}>
                      <span style={{color:'#7c3aed',fontSize:'13px'}}>✓</span>
                      <span style={{fontSize:'13px',color:'#94a3b8'}}>{f}</span>
                    </div>
                  ))}
                </div>
                <button onClick={()=>navigate('/signup')} style={{
                  width:'100%',padding:'11px',borderRadius:'8px',cursor:'pointer',fontFamily:'inherit',
                  fontSize:'14px',fontWeight:700,transition:'all .2s',
                  border: pop?'none':'1px solid rgba(255,255,255,0.1)',
                  background: pop?'linear-gradient(135deg,#7c3aed,#6d28d9)':'transparent',
                  color: pop?'#fff':'#94a3b8',
                  boxShadow: pop?'0 0 22px rgba(124,58,237,0.3)':'none',
                }}>Get Started →</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" style={{padding:'60px 6%', background:'rgba(124,58,237,0.03)'}}>
        <div style={{maxWidth:'800px',margin:'0 auto',textAlign:'center'}}>
          <h2 style={{fontSize:'36px',fontWeight:800,color:'#f1f5f9',marginBottom:'16px'}}>About CodeSense AI</h2>
          <p style={{fontSize:'15px',color:'#64748b',lineHeight:1.8,marginBottom:'24px'}}>
            CodeSense AI is an AI-powered code review platform built to help developers write cleaner, smarter, and more secure code.
            We use cutting-edge AI to analyze your code, find bugs, detect security vulnerabilities, and suggest improvements — instantly.
          </p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'20px',marginTop:'32px'}}>
            {[
              {icon:'🚀',title:'Our Mission',desc:'Make code review faster, smarter, and accessible to every developer.'},
              {icon:'🛡️',title:'Security First',desc:'We never store your code. All reviews happen securely and privately.'},
              {icon:'🤖',title:'AI Powered',desc:'Powered by state-of-the-art LLMs to give you the best code feedback.'},
            ].map(({icon,title,desc})=>(
              <div key={title} style={{padding:'24px',background:'#0f0f1a',borderRadius:'12px',border:'1px solid rgba(124,58,237,0.15)'}}>
                <div style={{fontSize:'28px',marginBottom:'10px'}}>{icon}</div>
                <div style={{fontSize:'14px',fontWeight:700,color:'#f1f5f9',marginBottom:'8px'}}>{title}</div>
                <div style={{fontSize:'13px',color:'#64748b',lineHeight:1.65}}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{borderTop:'1px solid rgba(255,255,255,0.06)',padding:'48px 6% 28px'}}>
        <div style={{maxWidth:'1200px',margin:'0 auto'}}>
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1.5fr',gap:'40px',marginBottom:'36px'}}>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'12px'}}>
                <div style={{width:'28px',height:'28px',borderRadius:'7px',
                  background:'linear-gradient(135deg,#7c3aed,#a855f7)',
                  display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </div>

                <span style={{fontSize:'14px',fontWeight:700,color:'#f1f5f9'}}>
                  CodeSense <span style={{color:'#a855f7'}}>AI</span>
                </span>
              </div>

              <p style={{fontSize:'12.5px',color:'#475569',lineHeight:1.7,maxWidth:'220px',marginBottom:'16px'}}>
                AI-powered code review platform built to help developers write cleaner, smarter, and more secure code.
              </p>

              <div style={{display:'flex',gap:'10px'}}>
                {['⊕','✕','in','⊙'].map((ic,i)=>(
                  <div
                    key={i}
                    style={{
                      width:'30px',
                      height:'30px',
                      borderRadius:'7px',
                      cursor:'pointer',
                      border:'1px solid rgba(255,255,255,0.08)',
                      display:'flex',
                      alignItems:'center',
                      justifyContent:'center',
                      color:'#475569',
                      fontSize:'13px',
                      transition:'all .2s'
                    }}
                  >
                    {ic}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{
                fontSize:'11px',
                fontWeight:700,
                color:'#94a3b8',
                letterSpacing:'.08em',
                textTransform:'uppercase',
                marginBottom:'14px'
              }}>
                About
              </h4>

              {['About Us','How It Works','Features','Pricing'].map(l=>(
                <div
                  key={l}
                  onClick={()=>scrollTo(FOOTER_MAP[l])}
                  style={{
                    fontSize:'13px',
                    color:'#475569',
                    marginBottom:'9px',
                    cursor:'pointer',
                    transition:'color .2s'
                  }}
                  onMouseEnter={e=>(e.currentTarget.style.color='#a855f7')}
                  onMouseLeave={e=>(e.currentTarget.style.color='#475569')}
                >
                  {l}
                </div>
              ))}
            </div>

            <div>
              <h4 style={{
                fontSize:'11px',
                fontWeight:700,
                color:'#94a3b8',
                letterSpacing:'.08em',
                textTransform:'uppercase',
                marginBottom:'14px'
              }}>
                Contact
              </h4>

              <div style={{fontSize:'13px',color:'#475569',marginBottom:'8px'}}>
                hello@codesense.ai
              </div>

              <div style={{fontSize:'13px',color:'#475569'}}>
                We'd love to hear from you!
              </div>
            </div>

            <div>
              <h4 style={{
                fontSize:'11px',
                fontWeight:700,
                color:'#94a3b8',
                letterSpacing:'.08em',
                textTransform:'uppercase',
                marginBottom:'14px'
              }}>
                Stay Updated
              </h4>

              <p style={{
                fontSize:'13px',
                color:'#475569',
                marginBottom:'12px',
                lineHeight:1.6
              }}>
                Get the latest updates and tips straight to your inbox.
              </p>

              <div style={{display:'flex',gap:'8px'}}>
                <input
                  placeholder="Enter your email"
                  value={subEmail}
                  onChange={e=>setSubEmail(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&handleSubscribe()}
                  style={{
                    flex:1,
                    padding:'9px 12px',
                    background:'#0f0f1a',
                    border:'1px solid rgba(255,255,255,0.08)',
                    borderRadius:'7px',
                    color:'#e2e8f0',
                    fontSize:'13px',
                    outline:'none',
                    fontFamily:'inherit'
                  }}
                />

                <button
                  onClick={handleSubscribe}
                  style={{
                    padding:'9px 14px',
                    background: subDone
                      ? '#10b981'
                      : 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                    border:'none',
                    borderRadius:'7px',
                    color:'#fff',
                    fontSize:'13px',
                    fontWeight:700,
                    cursor:'pointer',
                    fontFamily:'inherit',
                    transition:'background .3s'
                  }}
                >
                  {subDone ? '✓ Done!' : 'Subscribe'}
                </button>
              </div>
            </div>
          </div>

          <div
            style={{
              borderTop:'1px solid rgba(255,255,255,0.06)',
              paddingTop:'24px',
              display:'flex',
              justifyContent:'space-between',
              alignItems:'center'
            }}
          >
            <span style={{fontSize:'12px',color:'#334155'}}>
              © 2026 CodeSense AI. All rights reserved.
            </span>

            <div style={{display:'flex',gap:'20px'}}>
              <span
                onClick={()=>setModal('privacy')}
                style={{fontSize:'12px',color:'#334155',cursor:'pointer'}}
              >
                Privacy Policy
              </span>

              <span
                onClick={()=>setModal('terms')}
                style={{fontSize:'12px',color:'#334155',cursor:'pointer'}}
              >
                Terms of Use
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* MODAL */}
      {modal && (
        <div
          onClick={()=>setModal(null)}
          style={{
            position:'fixed',
            inset:0,
            background:'rgba(0,0,0,0.8)',
            zIndex:9999,
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
              borderRadius:'16px',
              padding:'32px',
              maxWidth:'580px',
              width:'100%',
              maxHeight:'80vh',
              overflowY:'auto',
              fontFamily:"'Plus Jakarta Sans',sans-serif"
            }}
          >
            <div style={{
              display:'flex',
              justifyContent:'space-between',
              alignItems:'center',
              marginBottom:'20px'
            }}>
              <h2 style={{
                fontSize:'20px',
                fontWeight:800,
                color:'#f1f5f9'
              }}>
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
                  color:'#64748b',
                  fontSize:'22px',
                  lineHeight:1
                }}
              >
                ×
              </button>
            </div>

            {modal === 'privacy' ? (
              <div style={{
                fontSize:'14px',
                color:'#94a3b8',
                lineHeight:1.9
              }}>
                <p style={{marginBottom:'14px'}}>
                  <strong style={{color:'#f1f5f9'}}>
                    Data Collection
                  </strong>
                  <br/>
                  We collect only your email and name for account creation.
                </p>
              </div>
            ) : (
              <div style={{
                fontSize:'14px',
                color:'#94a3b8',
                lineHeight:1.9
              }}>
                <p style={{marginBottom:'14px'}}>
                  <strong style={{color:'#f1f5f9'}}>
                    Acceptance
                  </strong>
                  <br/>
                  By using CodeSense AI, you agree to these terms.
                </p>
              </div>
            )}

            <button
              onClick={()=>setModal(null)}
              style={{
                marginTop:'24px',
                width:'100%',
                padding:'12px',
                borderRadius:'9px',
                background:'linear-gradient(135deg,#7c3aed,#6d28d9)',
                border:'none',
                color:'#fff',
                fontSize:'14px',
                fontWeight:700,
                cursor:'pointer',
                fontFamily:"'Plus Jakarta Sans',sans-serif"
              }}
            >
              Got it, Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}