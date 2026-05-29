const express = require('express')
const jwt = require('jsonwebtoken')
const passport = require('passport')

const GoogleStrategy = require('passport-google-oauth20').Strategy
const GitHubStrategy = require('passport-github2').Strategy

const router = express.Router()
const db = require('../database/db')
const authMw = require('../middleware/auth')

// ─────────────────────────────────────────────────────────
// JWT TOKEN
// ─────────────────────────────────────────────────────────
function makeToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  )
}

// ─────────────────────────────────────────────────────────
// PASSPORT GOOGLE
// ─────────────────────────────────────────────────────────
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'https://codesense-ai-2bu3.onrender.com/api/auth/google/callback'
    },
    (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value
        const name = profile.displayName

        let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)

        if (!user) {
          const result = db
            .prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)')
            .run(name, email, 'google-oauth')
          user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid)
        }

        return done(null, user)
      } catch (err) {
        return done(err, null)
      }
    }
  )
)

// ─────────────────────────────────────────────────────────
// PASSPORT GITHUB — accessToken bhi save karo
// ─────────────────────────────────────────────────────────
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: 'https://codesense-ai-2bu3.onrender.com/api/auth/github/callback',
      scope: ['user:email', 'repo'],
    },
    (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || `${profile.username}@github.com`
        const name = profile.displayName || profile.username
        const username = profile.username
        const avatar = profile.photos?.[0]?.value || null

        let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)

        if (!user) {
          const result = db
            .prepare('INSERT INTO users (name, email, password, github_token, github_username, github_avatar, github_connected) VALUES (?, ?, ?, ?, ?, ?, 1)')
            .run(name, email, 'github-oauth', accessToken, username, avatar)
          user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid)
        } else {
          // Existing user — token + username update karo
          db.prepare(`
            UPDATE users
            SET github_token = ?, github_username = ?, github_avatar = ?, github_connected = 1
            WHERE id = ?
          `).run(accessToken, username, avatar, user.id)
          user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id)
        }

        // Settings mein bhi save karo
        db.prepare(`
          INSERT INTO settings (user_id, github_token, github_username, github_connected)
          VALUES (?, ?, ?, 1)
          ON CONFLICT(user_id) DO UPDATE SET
            github_token = excluded.github_token,
            github_username = excluded.github_username,
            github_connected = 1
        `).run(user.id, accessToken, username)

        return done(null, user)
      } catch (err) {
        return done(err, null)
      }
    }
  )
)

// ─────────────────────────────────────────────────────────
// GOOGLE LOGIN
// ─────────────────────────────────────────────────────────
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' }))

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:3000/login' }),
  (req, res) => {
    const token = makeToken(req.user)
    res.redirect(`http://localhost:3000/oauth-success?token=${token}`)
  }
)

// ─────────────────────────────────────────────────────────
// GITHUB LOGIN
// ─────────────────────────────────────────────────────────
router.get('/github', passport.authenticate('github', { scope: ['user:email', 'repo'] }))

router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: 'http://localhost:3000/login' }),
  (req, res) => {
    const token = makeToken(req.user)
    res.redirect(
      `http://localhost:3000/github-success?token=${token}&username=${req.user.github_username || req.user.name}`
    )
  }
)

// ─────────────────────────────────────────────────────────
// SIGNUP
// ─────────────────────────────────────────────────────────
router.post('/signup', (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password)
    return res.status(400).json({ error: 'Sab fields required hain' })

  if (password.length < 6)
    return res.status(400).json({ error: 'Password kam se kam 6 characters ka hona chahiye' })

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (existing) return res.status(400).json({ error: 'Ye email already registered hai' })

  const result = db
    .prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)')
    .run(name, email, password)

  db.prepare('INSERT OR IGNORE INTO settings (user_id) VALUES (?)').run(result.lastInsertRowid)

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid)

  res.json({ token: makeToken(user), user: { id: user.id, name: user.name, email: user.email } })
})

// ─────────────────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────────────────
router.post('/login', (req, res) => {
  const { email, password } = req.body

  if (!email || !password)
    return res.status(400).json({ error: 'Email aur password required' })

  const user = db.prepare('SELECT * FROM users WHERE email = ? AND password = ?').get(email, password)
  if (!user) return res.status(401).json({ error: 'Email ya password galat hai' })

  res.json({ token: makeToken(user), user: { id: user.id, name: user.name, email: user.email } })
})

// ─────────────────────────────────────────────────────────
// ME
// ─────────────────────────────────────────────────────────
router.get('/me', authMw, (req, res) => {
  const user = db
    .prepare('SELECT id, name, email, github_username, github_connected, created_at FROM users WHERE id = ?')
    .get(req.user.id)

  if (!user) return res.status(404).json({ error: 'User nahi mila' })
  res.json({ user })
})

// ─────────────────────────────────────────────────────────
// UPDATE PROFILE
// ─────────────────────────────────────────────────────────
router.put('/profile', authMw, (req, res) => {
  const { name } = req.body
  if (!name?.trim()) return res.status(400).json({ error: 'Name required' })

  db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name, req.user.id)
  const updatedUser = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(req.user.id)

  res.json({ success: true, user: updatedUser })
})

// ─────────────────────────────────────────────────────────
// UPDATE PASSWORD
// ─────────────────────────────────────────────────────────
router.put('/password', authMw, (req, res) => {
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword)
    return res.status(400).json({ error: 'All password fields required' })

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
  if (user.password !== currentPassword)
    return res.status(401).json({ error: 'Current password incorrect' })

  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(newPassword, req.user.id)
  res.json({ success: true, message: 'Password updated' })
})

// ─────────────────────────────────────────────────────────
// GET SETTINGS
// ─────────────────────────────────────────────────────────
router.get('/settings', authMw, (req, res) => {
  let settings = db.prepare('SELECT * FROM settings WHERE user_id = ?').get(req.user.id)

  if (!settings) {
    db.prepare('INSERT INTO settings (user_id) VALUES (?)').run(req.user.id)
    settings = db.prepare('SELECT * FROM settings WHERE user_id = ?').get(req.user.id)
  }

  res.json({ settings })
})

// ─────────────────────────────────────────────────────────
// UPDATE SETTINGS
// ─────────────────────────────────────────────────────────
router.put('/settings', authMw, (req, res) => {
  const {
    ai_model, theme, language_pref, notifications,
    auto_review, ai_suggestions, code_explanations,
    github_token, github_username, github_connected
  } = req.body

  db.prepare(`
    INSERT INTO settings (
      user_id, ai_model, theme, language_pref, notifications,
      auto_review, ai_suggestions, code_explanations,
      github_token, github_username, github_connected
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      ai_model = excluded.ai_model,
      theme = excluded.theme,
      language_pref = excluded.language_pref,
      notifications = excluded.notifications,
      auto_review = excluded.auto_review,
      ai_suggestions = excluded.ai_suggestions,
      code_explanations = excluded.code_explanations,
      github_token = excluded.github_token,
      github_username = excluded.github_username,
      github_connected = excluded.github_connected
  `).run(
    req.user.id,
    ai_model || 'llama-3.3-70b-versatile',
    theme || 'dark',
    language_pref || 'auto',
    notifications ? 1 : 0,
    auto_review ? 1 : 0,
    ai_suggestions ? 1 : 0,
    code_explanations ? 1 : 0,
    github_token || null,
    github_username || null,
    github_connected ? 1 : 0
  )

  // Agar github_token settings mein save hua toh users table bhi update karo
  if (github_token) {
    db.prepare(`
      UPDATE users SET github_token = ?, github_username = ?, github_connected = ?
      WHERE id = ?
    `).run(github_token, github_username || null, github_connected ? 1 : 0, req.user.id)
  }

  res.json({ success: true, message: 'Settings updated' })
})

module.exports = router