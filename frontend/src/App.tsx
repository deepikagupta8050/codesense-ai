import { useState } from 'react'
import { Menu } from 'lucide-react'

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom'

import OAuthSuccess from './pages/OAuthSuccess'
import GitHubSuccess from './pages/GitHubSuccess'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import CodeReview from './pages/CodeReview'
import SecurityScan from './pages/SecurityScan'
import AIAssistant from './pages/AIAssistant'
import GitHubPRs from './pages/GitHubPRs'
import History from './pages/History'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'

import Sidebar from './components/Sidebar'

export default function App() {

  // SIDEBAR
  const [sidebarOpen, setSidebarOpen] =
    useState(true)

  // PRO CARD
  const [showPro, setShowPro] =
    useState(true)

  // TOKEN
  const [token, setToken] = useState(
  localStorage.getItem('cs_token') || ''
)


  // USER
  const [user, setUser] = useState<any>(() => {

    try {

      const u =
        localStorage.getItem('cs_user')

      return u ? JSON.parse(u) : null

    } catch {

      return null

    }

  })

  // LOGIN
  const login = (
    tok: string,
    usr: any
  ) => {

    localStorage.setItem(
      'cs_token',
      tok
    )

    localStorage.setItem(
      'cs_user',
      JSON.stringify(usr)
    )

    setUser(usr)
    setToken(tok)
  }

  // LOGOUT
  const logout = () => {

    window.open(
      'https://github.com/logout',
      '_blank'
    )

    localStorage.removeItem('cs_token')

    localStorage.removeItem('cs_user')

    localStorage.removeItem('github_connected')

localStorage.removeItem('github_token')

localStorage.removeItem('github_username')

    
    setToken('')
    setUser(null)

window.location.href = '/'
  }

  // UPDATE USER
  const updateUser = (usr: any) => {

    localStorage.setItem(
      'cs_user',
      JSON.stringify(usr)
    )

    setUser(usr)
  }

  // NO LOGIN
  if (
  !token &&
  !localStorage.getItem('github_connected') &&
  window.location.pathname !== '/github-success'
) {

    return (

      <BrowserRouter>

        <Routes>

          <Route
            path="/"
            element={<Landing />}
          />

          <Route
            path="/login"
            element={
              <Login onLogin={login} />
            }
          />

          <Route
            path="/signup"
            element={
              <Signup onLogin={login} />
            }
          />

          <Route
            path="/oauth-success"
            element={
              <OAuthSuccess onLogin={login} />
            }
          />

          <Route
            path="/github-success"
            element={<GitHubSuccess />}
          />

          <Route
            path="*"
            element={<Navigate to="/" />}
          />

        </Routes>

      </BrowserRouter>
    )
  }

  // MAIN APP
  return (

    <BrowserRouter>

      <div
        style={{
          display:'flex',
          height:'100vh',
          background:'#09090f',
          overflow:'hidden',
          width:'100%',
        }}
      >

        {/* SIDEBAR */}

        <div
          style={{
            width: sidebarOpen ? '220px' : '0px',
            transition:'all .3s ease',
            overflow:'hidden',
            flexShrink:0,
          }}
        >
          <Sidebar
            user={user}
            onLogout={logout}
            showPro={showPro}
            setShowPro={setShowPro}
          />
        </div>

        {/* MAIN */}

        <main
          style={{
            flex:1,
            overflowY:'auto',
            background:'#09090f',
            marginLeft:'0px',
            width:'100%',
            transition:'all .3s ease',
          }}
        >

          {/* TOGGLE BUTTON */}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              position:'absolute',
              top:'8px',
              left: sidebarOpen ? '230px' : '18px',
              zIndex:999,
              width:'25px',
              height:'25px',
              borderRadius:'14px',
              border:'1px solid rgba(255,255,255,0.08)',
              background:'#111122',
              color:'#fff',
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              cursor:'pointer',
              boxShadow:'0 0 20px rgba(124,58,237,0.2)',
              transition:'all .3s ease',
            }}
          >
            <Menu size={8} />
          </button>

          {/* ROUTES */}

          <Routes>

            <Route
              path="/"
              element={
                <Dashboard
                  user={user}
                  token={token}
                />
              }
            />

            <Route
              path="/review"
              element={
                <CodeReview token={token} />
              }
            />

            <Route
              path="/security"
              element={
                <SecurityScan token={token} />
              }
            />

            <Route
              path="/assistant"
              element={
                <AIAssistant token={token} />
              }
            />

            <Route
              path="/github"
              element={
                <GitHubPRs token={token} />
              }
            />

            <Route
              path="/github-success"
              element={<GitHubSuccess />}
            />

            <Route
              path="/history"
              element={
                <History token={token} />
              }
            />

            <Route
              path="/history/:id"
              element={
                <History token={token} />
              }
            />

            <Route
              path="/analytics"
              element={
                <Analytics token={token} />
              }
            />

            <Route
              path="/settings"
              element={
                <Settings
                  user={user}
                  token={token}
                  onUpdate={updateUser}
                  onLogout={logout}
                />
              }
            />

            <Route
              path="*"
              element={<Navigate to="/" />}
            />

          </Routes>

        </main>

      </div>

    </BrowserRouter>
  )
}