require('dotenv').config()
const express = require('express')
const cors = require('cors')
const passport = require('passport')
const session = require('express-session')
require('./config/passport')


const app = express()

// ─────────────────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────────────────
app.use(
  cors({
    origin: 'https://codesense-ai-ten.vercel.app',
    credentials: true,
  })
)

app.use(express.json({ limit: '5mb' }))

app.use(express.urlencoded({ extended: true }))

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
)
app.use(passport.initialize())
app.use(passport.session())

// ─────────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'))

app.use('/api', require('./routes/review'))

app.use('/api/analytics', require('./routes/analytics'))

app.use('/api/chat', require('./routes/chat'))

app.use('/api/security', require('./routes/security'))

app.use('/api/github', require('./routes/github'))

app.use('/api/upload', require('./routes/upload'))

// ─────────────────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: '✅ CodeSense AI Backend Ready!',
    version: '2.0',

    routes: [
      'POST   /api/auth/login',
      'POST   /api/auth/signup',
      'GET    /api/auth/me',
      'PUT    /api/auth/profile',
      'PUT    /api/auth/password',

      'GET    /api/auth/settings',
      'PUT    /api/auth/settings',

      'GET    /api/auth/google',
      'GET    /api/auth/github',

      'POST   /api/review',

      'GET    /api/history',
      'GET    /api/history/:id',
      'DELETE /api/history/:id',
      'DELETE /api/history',

      'GET    /api/analytics',

      'POST   /api/chat/message',
      'GET    /api/chat/history',
      'DELETE /api/chat/clear',

      'POST   /api/security/scan',
      'GET    /api/security/history',

      'GET    /api/github/repos',
      'GET    /api/github/prs',
      'POST   /api/github/review-pr',

      'POST   /api/upload',
    ],
  })
})

// ─────────────────────────────────────────────────────────
// ERROR HANDLER
// ─────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err)

  res.status(err.status || 500).json({
    error: err.message || 'Server error',
  })
})

// ─────────────────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(
    `✅ CodeSense AI Backend running on http://localhost:${PORT}`
  )

  console.log(
    `📋 All routes loaded — ${new Date().toLocaleString()}`
  )
})