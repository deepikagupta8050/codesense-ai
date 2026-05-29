import React from 'react'

import {
  NavLink,
  useNavigate
} from 'react-router-dom'

import {
  LayoutDashboard,
  Code2,
  Shield,
  GitBranch,
  Bot,
  History,
  BarChart3,
  Settings,
  LogOut,
  Zap
} from 'lucide-react'

const NAV = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/review',    icon: Code2,           label: 'AI Code Review' },
  { to: '/security',  icon: Shield,          label: 'Security Scan' },
  { to: '/github',    icon: GitBranch,       label: 'GitHub PRs' },
  { to: '/assistant', icon: Bot,             label: 'AI Assistant' },
  { to: '/history',   icon: History,         label: 'Review History' },
  { to: '/analytics', icon: BarChart3,       label: 'Analytics' },
  { to: '/settings',  icon: Settings,        label: 'Settings' },
]

export default function Sidebar({
  user,
  onLogout,
  showPro,
  setShowPro
}: {
  user: any
  onLogout: () => void
  showPro: boolean
  setShowPro: React.Dispatch<React.SetStateAction<boolean>>
}) {

  const navigate = useNavigate()

  const initial =
    (user?.name || 'U')[0].toUpperCase()

  return (

    <aside
      style={{
        width:'220px',
        minWidth:'220px',
        height:'100vh',
        background:'#0a0a14',
        borderRight:'1px solid rgba(255,255,255,0.07)',
        display:'flex',
        flexDirection:'column',
        
      }}
    >

      {/* LOGO */}

      <div
        style={{
          padding:'16px 14px 12px',
          borderBottom:'1px solid rgba(255,255,255,0.07)',
        }}
      >

        <div
          style={{
            display:'flex',
            alignItems:'center',
            gap:'9px',
          }}
        >

          <div
            style={{
              width:'34px',
              height:'34px',
              borderRadius:'10px',
              flexShrink:0,
              background:'linear-gradient(135deg,#7c3aed,#a855f7)',
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              boxShadow:'0 0 16px rgba(124,58,237,0.45)',
            }}
          >

            <Zap
              size={18}
              color="white"
              fill="white"
            />

          </div>

          <div>

            <div
              style={{
                fontSize:'15px',
                fontWeight:700,
                color:'#f1f5f9',
                lineHeight:1.1,
              }}
            >
              CodeSense
              <span style={{ color:'#a855f7' }}>
                {' '}AI
              </span>
            </div>

            <div
              style={{
                fontSize:'9px',
                color:'#475569',
                marginTop:'1px',
                letterSpacing:'0.06em',
              }}
            >
              AI CODE REVIEWER
            </div>

          </div>

        </div>

      </div>

      {/* NAVIGATION */}

      <nav
        style={{
          flex:1,
          padding:'10px',
          overflowY:'auto',
          display:'flex',
          flexDirection:'column',
          gap:'1px',
        }}
      >

        {NAV.map(({ to, icon: Icon, label }) => (

          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `nav-link${isActive ? ' active' : ''}`
            }
          >

            <div
              style={{
                display:'flex',
                alignItems:'center',
                gap:'10px',
                padding:'10px,12px',
                borderRadius:'12px',
                color:'#cbd5e1',
                fontSize:'14px',
                fontWeight:500,
              }}
            >

              <Icon
                size={16}
                strokeWidth={2}
              />

              <span>{label}</span>

            </div>

          </NavLink>

        ))}

      </nav>

      {/* UPGRADE CARD */}

      {showPro && (

        <div
          style={{
            position:'relative',
            margin:'0 10px 10px',
            padding:'12px',
            background:'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(109,40,217,0.05))',
            border:'1px solid rgba(124,58,237,0.25)',
            borderRadius:'12px',
          }}
        >

          {/* CLOSE BUTTON */}

          <button
            onClick={() => setShowPro(false)}
            style={{
              position:'absolute',
              top:'4px',
              right:'4px',
              background:'none',
              border:'none',
              color:'#64748b',
              cursor:'pointer',
              fontSize:'10px',
            }}
          >
            ✕
          </button>

          <div
            style={{
              display:'flex',
              alignItems:'center',
              gap:'6px',
              marginBottom:'5px',
            }}
          >

            <Zap
              size={12}
              color="#a855f7"
              fill="#a855f7"
            />

            <span
              style={{
                fontSize:'12px',
                fontWeight:700,
                color:'#a855f7',
              }}
            >
              Upgrade to Pro
            </span>

          </div>

          <p
            style={{
              fontSize:'11px',
              color:'#94a3b8',
              lineHeight:1.5,
              marginBottom:'8px',
            }}
          >
            Unlock advanced AI features
            and priority reviews.
          </p>

          <button
            onClick={() => navigate('/settings')}
            style={{
              width:'100%',
              padding:'8px',
              borderRadius:'8px',
              border:'none',
              background:'linear-gradient(135deg,#7c3aed,#6d28d9)',
              color:'#fff',
              fontSize:'11px',
              fontWeight:700,
              cursor:'pointer',
              fontFamily:'inherit',
            }}
          >
            Upgrade Now →
          </button>

        </div>

      )}

      {/* USER */}

      <div
        style={{
          padding:'10px 14px',
          borderTop:'1px solid rgba(255,255,255,0.07)',
          display:'flex',
          alignItems:'center',
          gap:'9px',
          cursor:'pointer',
        }}
        onClick={() => navigate('/settings')}
      >

        <div
          style={{
            width:'32px',
            height:'32px',
            borderRadius:'50%',
            flexShrink:0,
            background:'linear-gradient(135deg,#7c3aed,#3b82f6)',
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            fontSize:'12px',
            fontWeight:700,
            color:'#fff',
          }}
        >
          {initial}
        </div>

        <div
          style={{
            flex:1,
            overflow:'hidden',
            minWidth:0,
          }}
        >

          <div
            style={{
              fontSize:'12px',
              fontWeight:600,
              color:'#f1f5f9',
              overflow:'hidden',
              textOverflow:'ellipsis',
              whiteSpace:'nowrap',
            }}
          >
            {user?.name || 'Developer'}
          </div>

          <div
            style={{
              fontSize:'10px',
              color:'#475569',
              overflow:'hidden',
              textOverflow:'ellipsis',
              whiteSpace:'nowrap',
            }}
          >
            {user?.email || ''}
          </div>

        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onLogout()
          }}
          title="Logout"
          style={{
            background:'none',
            border:'none',
            cursor:'pointer',
            color:'#475569',
            padding:'4px',
            display:'flex',
            flexShrink:0,
          }}
        >

          <LogOut size={14} />

        </button>

      </div>

    </aside>

  )
}