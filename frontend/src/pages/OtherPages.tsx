// Analytics Page
import { BarChart2, TrendingUp, Code2, Shield } from 'lucide-react'

export function Analytics() {
  const langData = [
    { lang: 'JavaScript', count: 0, color: '#f59e0b' },
    { lang: 'Python', count: 0, color: '#3b82f6' },
    { lang: 'TypeScript', count: 0, color: '#8b5cf6' },
    { lang: 'Java', count: 0, color: '#ef4444' },
    { lang: 'Other', count: 0, color: '#10b981' },
  ]

  return (
    <div className="page" style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="page-header">
        <h1>Analytics</h1>
        <p>Reviews ke charts aur trends dekho</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Score Trend */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <TrendingUp size={18} color="#3b82f6" />
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#f1f5f9' }}>Score Trend</h3>
          </div>
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#475569' }}>
            <BarChart2 size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
            <div style={{ fontSize: '13px' }}>Review karo — data yahan aayega</div>
          </div>
        </div>

        {/* Language Breakdown */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Code2 size={18} color="#8b5cf6" />
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#f1f5f9' }}>Languages Used</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {langData.map(({ lang, count, color }) => (
              <div key={lang}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>{lang}</span>
                  <span style={{ fontSize: '12px', color: '#475569' }}>{count} reviews</span>
                </div>
                <div style={{ height: '4px', background: '#1e2d45', borderRadius: '2px' }}>
                  <div style={{ width: count > 0 ? `${count}%` : '0%', height: '100%', background: color, borderRadius: '2px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {[
          { label: 'Total Reviews Done', value: '0', icon: Code2, color: '#3b82f6' },
          { label: 'Average Score', value: '—', icon: TrendingUp, color: '#10b981' },
          { label: 'Security Issues Found', value: '0', icon: Shield, color: '#ef4444' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card" style={{ textAlign: 'center' }}>
            <Icon size={24} color={color} style={{ marginBottom: '10px' }} />
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#f1f5f9', marginBottom: '4px' }}>{value}</div>
            <div style={{ fontSize: '12px', color: '#475569', fontWeight: '600' }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Security Scan Page
export function SecurityScan({ token }: { token: string }) {
  return (
    <div className="page" style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="page-header">
        <h1>Security Scanner</h1>
        <p>Code mein security vulnerabilities dhundho</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'SQL Injection', desc: 'Database attacks', color: '#ef4444', icon: '🔴' },
          { label: 'XSS Attack', desc: 'Script injection', color: '#f59e0b', icon: '🟡' },
          { label: 'Hardcoded Secrets', desc: 'Passwords/tokens', color: '#8b5cf6', icon: '🟣' },
          { label: 'Insecure Functions', desc: 'eval(), exec()', color: '#ef4444', icon: '🔴' },
          { label: 'No Input Validation', desc: 'Missing checks', color: '#f59e0b', icon: '🟡' },
          { label: 'Weak Cryptography', desc: 'MD5, SHA1 usage', color: '#ef4444', icon: '🔴' },
        ].map(({ label, desc, color, icon }) => (
          <div key={label} className="card" style={{ borderColor: `${color}40` }}>
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>{icon}</div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' }}>{label}</div>
            <div style={{ fontSize: '12px', color: '#475569' }}>{desc}</div>
            <div style={{ marginTop: '10px', fontSize: '11px', color: color, fontWeight: '700' }}>Auto-detected</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ textAlign: 'center', padding: '40px', color: '#475569' }}>
        <Shield size={36} style={{ marginBottom: '12px', opacity: 0.3, color: '#ef4444' }} />
        <div style={{ fontSize: '15px', fontWeight: '600', color: '#f1f5f9', marginBottom: '6px' }}>Security Scan</div>
        <div style={{ fontSize: '13px', marginBottom: '16px' }}>
          Code Review page pe jaao → Code paste karo → AI automatically security issues dhundhega
        </div>
        <div style={{ fontSize: '12px', color: '#3b82f6' }}>
          Security Scanner AI Review mein built-in hai ✅
        </div>
      </div>
    </div>
  )
}

// Settings Page
export function Settings() {
  return (
    <div className="page" style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="page-header">
        <h1>Settings</h1>
        <p>Apni preferences set karo</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
        {[
          {
            title: 'AI Model',
            items: [
              { label: 'Current Model', value: 'Llama 3.3 70B (via Groq)', note: 'Fast + Accurate' },
              { label: 'Max Tokens', value: '2000', note: 'Response length' },
              { label: 'Temperature', value: '0.1', note: 'Consistent results ke liye' },
            ]
          },
          {
            title: 'Review Settings',
            items: [
              { label: 'Auto-detect Language', value: 'ON ✅', note: '' },
              { label: 'Security Scan', value: 'ON ✅', note: '' },
              { label: 'Complexity Analysis', value: 'ON ✅', note: '' },
              { label: 'Auto Fix Code', value: 'ON ✅', note: '' },
            ]
          },
          {
            title: 'Backend Info',
            items: [
              { label: 'Backend URL', value: 'http://localhost:5000', note: '' },
              { label: 'Auth', value: 'JWT Token', note: '7 days validity' },
              { label: 'History Storage', value: 'In-Memory', note: 'Server restart pe clear' },
            ]
          }
        ].map(({ title, items }) => (
          <div key={title} className="card">
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#f1f5f9', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #1e2d45' }}>
              {title}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {items.map(({ label, value, note }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>{label}</div>
                    {note && <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>{note}</div>}
                  </div>
                  <div style={{
                    fontSize: '12px', color: '#3b82f6', fontWeight: '700',
                    background: '#3b82f620', padding: '4px 10px', borderRadius: '6px',
                    border: '1px solid #3b82f640', fontFamily: 'JetBrains Mono'
                  }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Profile Page
export function Profile({ user }: { user: any }) {
  return (
    <div className="page" style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="page-header">
        <h1>Profile</h1>
        <p>Tumhari account details</p>
      </div>

      <div style={{ maxWidth: '500px' }}>
        {/* Avatar card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
          <div style={{
            width: '72px', height: '72px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', fontWeight: '800', color: 'white',
            boxShadow: '0 0 20px #3b82f640'
          }}>
            {(user?.name || 'U')[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#f1f5f9' }}>{user?.name || 'User'}</div>
            <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>{user?.email || ''}</div>
            <div style={{ marginTop: '8px' }}>
              <span className="badge badge-info">Developer</span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="card">
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#f1f5f9', marginBottom: '16px' }}>Account Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: 'Full Name', value: user?.name || '—' },
              { label: 'Email', value: user?.email || '—' },
              { label: 'Account Type', value: 'Free Developer' },
              { label: 'Auth Method', value: 'JWT Token' },
              { label: 'Session', value: 'Active (7 days)' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid #0d1220' }}>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{label}</span>
                <span style={{ fontSize: '13px', color: '#f1f5f9', fontWeight: '700' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Landing Page (shown before login)
export function Landing({ onLogin }: { onLogin: () => void }) {
  return (
    <div style={{
      minHeight: '100vh', background: '#080b14',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '40px 20px',
      position: 'relative', overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: '800px', height: '400px',
        background: 'radial-gradient(ellipse, #3b82f615, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(#1e2d4508 1px, transparent 1px), linear-gradient(90deg, #1e2d4508 1px, transparent 1px)',
        backgroundSize: '40px 40px', pointerEvents: 'none'
      }} />

      <div style={{
        width: '64px', height: '64px',
        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        borderRadius: '16px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '24px',
        boxShadow: '0 0 40px #3b82f640'
      }}>
        <Shield size={30} color="white" />
      </div>

      <h1 style={{ fontSize: '48px', fontWeight: '800', color: '#f1f5f9', lineHeight: 1.1, marginBottom: '16px' }}>
        CodeSense AI
      </h1>
      <p style={{ fontSize: '18px', color: '#64748b', maxWidth: '500px', lineHeight: '1.6', marginBottom: '32px' }}>
        AI-powered code reviewer — bugs dhundho, score pao, aur instantly fix karo
      </p>

      <div style={{ display: 'flex', gap: '14px' }}>
        <a href="/login" style={{
          padding: '14px 32px',
          background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
          color: 'white', borderRadius: '10px',
          textDecoration: 'none', fontWeight: '700', fontSize: '15px',
          boxShadow: '0 0 20px #3b82f640'
        }}>
          Get Started →
        </a>
      </div>
    </div>
  )
}