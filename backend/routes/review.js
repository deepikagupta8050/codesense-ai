const express = require('express')
const Groq    = require('groq-sdk')
const router  = express.Router()
const db      = require('../database/db')
const authMw  = require('../middleware/auth')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

function parseField(text, key) {
  const m = text.match(new RegExp(`${key}:\\s*(\\d+)`))
  return m ? parseInt(m[1]) : 0
}
function parseSeverity(text) {
  const m = text.match(/SEVERITY:\s*(\w+)/)
  return m ? m[1] : 'Info'
}
function parseLanguage(text) {
  const m = text.match(/LANGUAGE:\s*([\w+#]+)/)
  return m ? m[1] : 'Unknown'
}
function parseFixedCode(text) {
  const m = text.match(/PERFECTLY FIXED CODE:\s*```[\w]*\n([\s\S]*?)```/)
  return m ? m[1].trim() : ''
}
function countBugs(text) {
  const m = text.match(/BUGS FOUND:([\s\S]*?)(?=SECURITY|COMPLEXITY|IMPROVEMENTS|PERFECTLY)/i)
  if (!m) return 0
  return (m[1].match(/^-\s+Bug/gm) || []).length
}
function countSecurity(text) {
  const m = text.match(/SECURITY ISSUES:([\s\S]*?)(?=COMPLEXITY|IMPROVEMENTS|PERFECTLY)/i)
  if (!m) return 0
  const lines = m[1].split('\n').filter(l => l.trim().startsWith('-') && !l.includes('no ') && !l.includes('None'))
  return lines.length
}

// ── AI Review ────────────────────────────────────────────
router.post('/review', authMw, async (req, res) => {
  const { code, filename } = req.body
  if (!code) return res.status(400).json({ error: 'Code nahi mila' })

  try {
    const settings = db.prepare(`
  SELECT ai_model
  FROM settings
  WHERE user_id = ?
`).get(req.user.id)

const selectedModel =
  settings?.ai_model ||
  'llama-3.3-70b-versatile'
  'llama-3.3-70b-versatile'
    const response = await groq.chat.completions.create({
      model: selectedModel,
      messages: [
        {
          role: 'system',
          content: `You are the world's best code reviewer with 20+ years experience at Google and Microsoft.

SEVERITY RULES (Strictly follow):
- Score 95-100 → SEVERITY: Info
- Score 80-94  → SEVERITY: Warning
- Score 0-79   → SEVERITY: Critical

Only find REAL bugs. Style preferences are NOT bugs.`
        },
        {
          role: 'user',
          content: `Review this code carefully.

Respond in EXACT format:

SCORE: [0-100]
LANGUAGE: [detected language]
SEVERITY: [Info/Warning/Critical]

BUGS FOUND:
- Bug 1: [line number and real bug]

SECURITY ISSUES:
- [real security vulnerabilities only]

COMPLEXITY:
- Time: [Big O]
- Space: [Big O]

IMPROVEMENTS:
- [important improvements only]

PERFECTLY FIXED CODE:
\`\`\`
[100% production ready fixed code]
\`\`\`

WHAT WAS FIXED:
- [line by line changes]

Code to review:
${code}`
        }
      ],
      max_tokens: 2000,
      temperature: 0.1
    })

    const reviewText = response.choices[0].message.content
    const score      = parseField(reviewText, 'SCORE')
    const severity   = parseSeverity(reviewText)
    const language   = parseLanguage(reviewText)
    const fixedCode  = parseFixedCode(reviewText)
    const bugsCount  = countBugs(reviewText)
    const secCount   = countSecurity(reviewText)

    // SQLite mein save karo
    const result = db.prepare(`
      INSERT INTO reviews (user_id, filename, language, code, review, score, severity, bugs_count, security_count, fixed_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.id, filename || 'untitled', language, code, reviewText, score, severity, bugsCount, secCount, fixedCode)

    res.json({
      id:       result.lastInsertRowid,
      review:   reviewText,
      score, severity, language, fixedCode, bugsCount, secCount
    })
  } catch (error) {
    console.error('Review error:', error.message)
    res.status(500).json({ error: error.message })
  }
})

// ── History (with pagination + search) ───────────────────
router.get('/history', authMw, (req, res) => {
  const { page = 1, limit = 10, search = '', language = '' } = req.query
  const offset = (parseInt(page) - 1) * parseInt(limit)

  let where = 'WHERE user_id = ?'
  const params = [req.user.id]

  if (search) { where += ' AND (filename LIKE ? OR language LIKE ?)'; params.push(`%${search}%`, `%${search}%`) }
  if (language && language !== 'All') { where += ' AND language = ?'; params.push(language) }

  const total   = db.prepare(`SELECT COUNT(*) as c FROM reviews ${where}`).get(...params).c
  const reviews = db.prepare(`
    SELECT id, filename, language, score, severity, bugs_count, security_count, created_at,
           substr(code, 1, 120) as code_preview
    FROM reviews ${where}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, parseInt(limit), offset)

  res.json({ reviews, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) })
})

// ── Single review detail ─────────────────────────────────
router.get('/history/:id', authMw, (req, res) => {
  const review = db.prepare('SELECT * FROM reviews WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id)
  if (!review) return res.status(404).json({ error: 'Review nahi mila' })
  res.json({ review })
})

// ── Delete one ───────────────────────────────────────────
router.delete('/history/:id', authMw, (req, res) => {
  db.prepare('DELETE FROM reviews WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id)
  res.json({ success: true })
})

// ── Delete all ───────────────────────────────────────────
router.delete('/history', authMw, (req, res) => {
  db.prepare('DELETE FROM reviews WHERE user_id = ?').run(req.user.id)
  res.json({ success: true })
})

module.exports = router