const express = require('express')
const Groq    = require('groq-sdk')
const router  = express.Router()
const db      = require('../database/db')
const authMw  = require('../middleware/auth')
const axios   = require('axios')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// ── Helper: scan one code snippet ──────────────────────────
async function scanCode(code, filename) {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are a cybersecurity expert specializing in code security analysis.
Find ALL security vulnerabilities. Be thorough and precise.`
      },
      {
        role: 'user',
        content: `Perform a detailed security scan on this code from file: ${filename}

Respond in EXACT format:

SECURITY_SCORE: [0-100, higher = more secure]
TOTAL_ISSUES: [number]
CRITICAL_COUNT: [number]
HIGH_COUNT: [number]
MEDIUM_COUNT: [number]
LOW_COUNT: [number]

ISSUES:
- SEVERITY: Critical | TYPE: SQL Injection | LINE: 12 | DESC: User input directly concatenated into SQL query | FIX: Use parameterized queries
- SEVERITY: High | TYPE: XSS | LINE: 23 | DESC: Unescaped user input rendered as HTML | FIX: Sanitize input before rendering
- SEVERITY: Medium | TYPE: Hardcoded Secret | LINE: 5 | DESC: API key hardcoded in source | FIX: Use environment variables

SUMMARY:
[2-3 sentence security summary]

RECOMMENDATIONS:
- [Top security recommendation 1]
- [Top security recommendation 2]
- [Top security recommendation 3]

Code to scan:
${code}`
      }
    ],
    max_tokens: 1500,
    temperature: 0.1
  })
  return response.choices[0].message.content
}

const getNum = (text, key) => {
  const m = text.match(new RegExp(`${key}:\\s*(\\d+)`))
  return m ? parseInt(m[1]) : 0
}

// ── POST /api/security/scan ─────────────────────────────────
// Body: { code, filename, scanType: 'snippet'|'file'|'github', repoUrl? }
router.post('/scan', authMw, async (req, res) => {
  const { code, filename, scanType, repoUrl } = req.body
  const startTime = Date.now()

  try {
    // ── GITHUB REPO SCAN ────────────────────────────────────
    if (scanType === 'github') {
      // Get user's connected GitHub token from DB
      const user = db.prepare('SELECT github_token, github_username FROM users WHERE id = ?').get(req.user.id)
      if (!user?.github_token) {
        return res.status(400).json({ error: 'GitHub not connected. Please connect GitHub in Settings.' })
      }

      // Parse owner/repo from URL
      // Supports: https://github.com/owner/repo or owner/repo
      const match = repoUrl.match(/(?:github\.com\/)?([^/]+)\/([^/\s?#]+)/)
      if (!match) return res.status(400).json({ error: 'Invalid GitHub repository URL' })
      const [, owner, repo] = match

      const ghHeaders = {
        Authorization: `token ${user.github_token}`,
        Accept: 'application/vnd.github.v3+json'
      }

      // Fetch repo tree (all files)
      const treeRes = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
        { headers: ghHeaders }
      )

      const CODE_EXTENSIONS = ['.js','.ts','.jsx','.tsx','.py','.java','.go','.rb','.php','.cs','.cpp','.c','.rs','.swift','.kt']
      const files = (treeRes.data.tree || [])
        .filter(f => f.type === 'blob' && CODE_EXTENSIONS.some(ext => f.path.endsWith(ext)))
        .slice(0, 15) // max 15 files to avoid rate limits

      if (files.length === 0) {
        return res.status(400).json({ error: 'No supported code files found in repository.' })
      }

      // Fetch & concatenate file contents
      let combinedCode = ''
      let scannedFiles = []
      for (const file of files) {
        try {
          const fileRes = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`,
            { headers: ghHeaders }
          )
          const content = Buffer.from(fileRes.data.content, 'base64').toString('utf-8')
          combinedCode += `\n\n// ===== FILE: ${file.path} =====\n${content.slice(0, 3000)}`
          scannedFiles.push(file.path)
        } catch { /* skip unreadable files */ }
      }

      const result = await scanCode(combinedCode, `${owner}/${repo}`)
      const duration = ((Date.now() - startTime) / 1000).toFixed(1)

      const critical = getNum(result, 'CRITICAL_COUNT')
      const high     = getNum(result, 'HIGH_COUNT')
      const medium   = getNum(result, 'MEDIUM_COUNT')
      const low      = getNum(result, 'LOW_COUNT')

      db.prepare(`
        INSERT INTO security_scans (user_id, filename, code, result, critical, high, medium, low)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(req.user.id, `${owner}/${repo}`, combinedCode.slice(0, 5000), result, critical, high, medium, low)

      return res.json({
        result, critical, high, medium, low,
        scanType: 'github',
        repoName: `${owner}/${repo}`,
        totalFiles: scannedFiles.length,
        scannedFiles,
        duration: `${duration}s`
      })
    }

    // ── CODE PASTE / FILE UPLOAD SCAN ──────────────────────
    if (!code) return res.status(400).json({ error: 'Code required' })

    const result = await scanCode(code, filename || 'untitled')
    const duration = ((Date.now() - startTime) / 1000).toFixed(1)

    const critical = getNum(result, 'CRITICAL_COUNT')
    const high     = getNum(result, 'HIGH_COUNT')
    const medium   = getNum(result, 'MEDIUM_COUNT')
    const low      = getNum(result, 'LOW_COUNT')

    db.prepare(`
      INSERT INTO security_scans (user_id, filename, code, result, critical, high, medium, low)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.id, filename || 'untitled', code, result, critical, high, medium, low)

    return res.json({
      result, critical, high, medium, low,
      scanType: scanType || 'snippet',
      totalFiles: 1,
      scannedFiles: [filename || 'untitled'],
      duration: `${duration}s`
    })

  } catch (error) {
    console.error('Security scan error:', error.message)
    res.status(500).json({ error: error.message })
  }
})

// ── GET /api/security/history ───────────────────────────────
router.get('/history', authMw, (req, res) => {
  const scans = db.prepare(`
    SELECT id, filename, critical, high, medium, low, created_at
    FROM security_scans WHERE user_id = ?
    ORDER BY created_at DESC LIMIT 20
  `).all(req.user.id)
  res.json({ scans })
})

module.exports = router