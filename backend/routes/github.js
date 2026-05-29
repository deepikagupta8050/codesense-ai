const express = require('express')
const axios = require('axios')
const Groq = require('groq-sdk')

const router = express.Router()
const authMw = require('../middleware/auth')
const db = require('../database/db')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// ─────────────────────────────────────────────────────────
// HELPER: User ka GitHub token DB se lo
// ─────────────────────────────────────────────────────────
function getUserGithubToken(userId) {
  const settings = db.prepare('SELECT github_token FROM settings WHERE user_id = ?').get(userId)
  if (settings?.github_token) return settings.github_token

  const user = db.prepare('SELECT github_token FROM users WHERE id = ?').get(userId)
  return user?.github_token || null
}

// ─────────────────────────────────────────────────────────
// HELPER: GitHub API headers
// ─────────────────────────────────────────────────────────
function ghHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'CodeSense-AI',
    'X-GitHub-Api-Version': '2022-11-28'
  }
}

// ─────────────────────────────────────────────────────────
// HELPER: GitHub error handle
// ─────────────────────────────────────────────────────────
function handleGithubError(e, res) {
  const status = e.response?.status
  const msg = e.response?.data?.message || e.message

  if (status === 401) return res.status(401).json({ error: 'GitHub token invalid ya expired hai. Settings mein update karo.' })
  if (status === 403) return res.status(403).json({ error: 'GitHub API rate limit hit ho gaya. Thodi der baad try karo.' })
  if (status === 404) return res.status(404).json({ error: 'Repository nahi mila. Owner/repo name check karo ya private repo ke liye token chahiye.' })
  if (status === 422) return res.status(422).json({ error: 'Invalid request: ' + msg })

  return res.status(500).json({ error: msg || 'GitHub API error' })
}

// ─────────────────────────────────────────────────────────
// 1. GET USER REPOSITORIES (Login ke baad auto fetch)
// ─────────────────────────────────────────────────────────
router.get('/repos', authMw, async (req, res) => {
  try {
    const token = getUserGithubToken(req.user.id)
    if (!token) return res.status(400).json({ error: 'GitHub account connected nahi hai. Settings mein GitHub token add karo.' })

    const response = await axios.get(
      'https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator',
      { headers: ghHeaders(token) }
    )

    const repos = response.data.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      private: repo.private,
      url: repo.html_url,
      updated_at: repo.updated_at,
      owner: repo.owner.login,
      language: repo.language,
      stars: repo.stargazers_count,
      open_issues: repo.open_issues_count,
      description: repo.description
    }))

    // DB mein save karo
    repos.forEach(repo => {
      db.prepare(`
        INSERT OR IGNORE INTO github_repositories (user_id, repo_name, repo_url, private)
        VALUES (?, ?, ?, ?)
      `).run(req.user.id, repo.full_name, repo.url, repo.private ? 1 : 0)
    })

    res.json({ repos })
  } catch (e) {
    handleGithubError(e, res)
  }
})

// ─────────────────────────────────────────────────────────
// 2. GET PULL REQUESTS
// ─────────────────────────────────────────────────────────
router.get('/prs', authMw, async (req, res) => {
  try {
    const { owner, repo } = req.query
    if (!owner || !repo) return res.status(400).json({ error: 'owner aur repo required hai' })

    const token = getUserGithubToken(req.user.id)
    if (!token) return res.status(400).json({ error: 'GitHub account connected nahi hai. Settings mein GitHub token add karo.' })

    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=30`,
      { headers: ghHeaders(token) }
    )

    if (response.data.length === 0) {
      return res.json({ prs: [], message: 'No pull requests were found in this repository.' })
    }

    const prs = await Promise.all(
      response.data.map(async (pr) => {
        let additions = 0, deletions = 0
        try {
          const detail = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/pulls/${pr.number}`,
            { headers: ghHeaders(token) }
          )
          additions = detail.data.additions
          deletions = detail.data.deletions
        } catch {}

        return {
          number: pr.number,
          title: pr.title,
          state: pr.state,
          user: pr.user.login,
          avatar: pr.user.avatar_url,
          created_at: pr.created_at,
          updated_at: pr.updated_at,
          url: pr.html_url,
          additions,
          deletions,
          draft: pr.draft,
          merged: pr.merged_at !== null,
          base: pr.base.ref,
          head: pr.head.ref
        }
      })
    )

    res.json({ prs })
  } catch (e) {
    handleGithubError(e, res)
  }
})

// ─────────────────────────────────────────────────────────
// 3. AI REVIEW PULL REQUEST (Real - Bugs/Security/Score)
// ─────────────────────────────────────────────────────────
router.post('/review-pr', authMw, async (req, res) => {
  try {
    const { owner, repo, prNumber, model } = req.body
    if (!owner || !repo || !prNumber) return res.status(400).json({ error: 'owner, repo aur prNumber required hai' })

    const token = getUserGithubToken(req.user.id)
    if (!token) return res.status(400).json({ error: 'GitHub account connected nahi hai.' })

    // PR details
    const [prRes, filesRes, commitsRes, checksRes] = await Promise.all([
      axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`, { headers: ghHeaders(token) }),
      axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/files`, { headers: ghHeaders(token) }),
      axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/commits`, { headers: ghHeaders(token) }),
      axios.get(`https://api.github.com/repos/${owner}/${repo}/commits/${prRes?.data?.head?.sha || 'HEAD'}/check-runs`, { headers: ghHeaders(token) }).catch(() => ({ data: { check_runs: [] } }))
    ])

    const files = filesRes.data.map(f => ({
      filename: f.filename,
      status: f.status,
      additions: f.additions,
      deletions: f.deletions,
      changes: f.changes,
      patch: f.patch ? f.patch.substring(0, 2000) : '(binary or no changes)'
    }))

    const commits = commitsRes.data.map(c => ({
      sha: c.sha.substring(0, 7),
      message: c.commit.message,
      author: c.commit.author.name,
      date: c.commit.author.date
    }))

    // AI Review
    const aiResponse = await groq.chat.completions.create({
      model: model || 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a senior software engineer and security expert. Review pull requests and respond in this EXACT JSON format only, no extra text:
{
  "summary": "2-3 line overview",
  "score": <number 0-100>,
  "bugs": [{"line": "filename:linenum", "issue": "description", "severity": "high/medium/low"}],
  "security": [{"issue": "description", "severity": "critical/high/medium/low", "fix": "how to fix"}],
  "suggestions": [{"file": "filename", "suggestion": "what to improve"}],
  "quality": {"maintainability": <0-100>, "readability": <0-100>, "performance": <0-100>},
  "duplicate_code": ["description of duplicated logic if any"],
  "dead_code": ["description of unused code if any"],
  "performance_tips": ["specific optimization suggestions"]
}`
        },
        {
          role: 'user',
          content: `Review this PR:
Repository: ${owner}/${repo}
PR #${prNumber}: ${prRes.data.title}
Author: ${prRes.data.user.login}
Files changed: ${files.length}

Changed Files with Patches:
${JSON.stringify(files, null, 2).substring(0, 6000)}`
        }
      ],
      temperature: 0.1,
      max_tokens: 2000
    })

    let reviewData = {}
    try {
      const raw = aiResponse.choices[0].message.content
      const cleaned = raw.replace(/```json|```/g, '').trim()
      reviewData = JSON.parse(cleaned)
    } catch {
      reviewData = {
        summary: aiResponse.choices[0].message.content,
        score: 70,
        bugs: [],
        security: [],
        suggestions: [],
        quality: { maintainability: 70, readability: 70, performance: 70 },
        duplicate_code: [],
        dead_code: [],
        performance_tips: []
      }
    }

    // DB mein save karo
    const saved = db.prepare(`
      INSERT INTO pr_reviews (user_id, repo_name, pr_number, pr_title, review, ai_score, security_issues, bugs_found)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.user.id,
      `${owner}/${repo}`,
      prNumber,
      prRes.data.title,
      JSON.stringify(reviewData),
      reviewData.score || 0,
      reviewData.security?.length || 0,
      reviewData.bugs?.length || 0
    )

    res.json({
      review: reviewData,
      files,
      commits,
      checks: checksRes.data?.check_runs || [],
      pr: {
        title: prRes.data.title,
        number: prRes.data.number,
        author: prRes.data.user.login,
        state: prRes.data.state,
        additions: prRes.data.additions,
        deletions: prRes.data.deletions
      },
      reviewId: saved.lastInsertRowid
    })
  } catch (e) {
    console.error(e.response?.data || e.message)
    handleGithubError(e, res)
  }
})

// ─────────────────────────────────────────────────────────
// 4. FULL REPOSITORY SCAN
// ─────────────────────────────────────────────────────────
router.post('/scan-repo', authMw, async (req, res) => {
  try {
    const { owner, repo, model } = req.body
    if (!owner || !repo) return res.status(400).json({ error: 'owner aur repo required hai' })

    const token = getUserGithubToken(req.user.id)
    if (!token) return res.status(400).json({ error: 'GitHub account connected nahi hai.' })

    // Repo info + file tree
    const [repoRes, treeRes] = await Promise.all([
      axios.get(`https://api.github.com/repos/${owner}/${repo}`, { headers: ghHeaders(token) }),
      axios.get(`https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`, { headers: ghHeaders(token) })
    ])

    const allFiles = (treeRes.data.tree || []).filter(f =>
      f.type === 'blob' &&
      !f.path.includes('node_modules') &&
      !f.path.includes('.git') &&
      !f.path.includes('dist/') &&
      !f.path.includes('build/') &&
      /\.(js|ts|tsx|jsx|py|java|go|rb|php|cs|cpp|c|rs)$/.test(f.path)
    )

    const totalFiles = allFiles.length
    const sampleFiles = allFiles.slice(0, 15) // Max 15 files analyze karo

    // Sample files ka content fetch karo
    const fileContents = await Promise.allSettled(
      sampleFiles.map(f =>
        axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${f.path}`, { headers: ghHeaders(token) })
          .then(r => ({
            path: f.path,
            content: Buffer.from(r.data.content, 'base64').toString('utf8').substring(0, 1500)
          }))
      )
    )

    const analyzedFiles = fileContents
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value)

    // AI full scan
    const aiResponse = await groq.chat.completions.create({
      model: model || 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a senior code auditor. Analyze repositories and respond in this EXACT JSON format only:
{
  "overall_score": <0-100>,
  "quality_score": <0-100>,
  "security_score": <0-100>,
  "maintainability_score": <0-100>,
  "summary": "2-3 line overview",
  "issues_found": <number>,
  "security_risks": <number>,
  "files_scanned": <number>,
  "bugs": [{"file": "path", "issue": "description", "severity": "high/medium/low"}],
  "security_issues": [{"file": "path", "issue": "description", "severity": "critical/high/medium/low", "fix": "suggestion"}],
  "duplicate_code": [{"description": "what is duplicated", "files": ["file1", "file2"]}],
  "dead_code": [{"file": "path", "description": "what is unused"}],
  "performance_suggestions": ["specific tips"],
  "recommendations": ["top things to fix"]
}`
        },
        {
          role: 'user',
          content: `Full repository scan:
Repo: ${owner}/${repo}
Language: ${repoRes.data.language}
Total files found: ${totalFiles}
Analyzing ${analyzedFiles.length} sample files:

${analyzedFiles.map(f => `--- ${f.path} ---\n${f.content}`).join('\n\n').substring(0, 8000)}`
        }
      ],
      temperature: 0.1,
      max_tokens: 2500
    })

    let scanData = {}
    try {
      const raw = aiResponse.choices[0].message.content
      const cleaned = raw.replace(/```json|```/g, '').trim()
      scanData = JSON.parse(cleaned)
    } catch {
      scanData = {
        overall_score: 70,
        summary: aiResponse.choices[0].message.content,
        issues_found: 0,
        security_risks: 0,
        files_scanned: analyzedFiles.length
      }
    }

    scanData.files_scanned = analyzedFiles.length
    scanData.total_files = totalFiles

    // Report save karo
    db.prepare(`
      INSERT INTO reports (user_id, title, type, content)
      VALUES (?, ?, 'repo_scan', ?)
    `).run(req.user.id, `${owner}/${repo} - Full Scan`, JSON.stringify(scanData))

    res.json({
      scan: scanData,
      repo: {
        name: repoRes.data.full_name,
        language: repoRes.data.language,
        stars: repoRes.data.stargazers_count,
        forks: repoRes.data.forks_count,
        open_issues: repoRes.data.open_issues_count
      }
    })
  } catch (e) {
    console.error(e.response?.data || e.message)
    handleGithubError(e, res)
  }
})






// ─────────────────────────────────────────────────────────
// 5. REVIEW HISTORY
// ─────────────────────────────────────────────────────────
router.get('/history', authMw, (req, res) => {
  try {
    const reviews = db.prepare(`
      SELECT id, repo_name, pr_number, pr_title, ai_score, security_issues, bugs_found, created_at
      FROM pr_reviews
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `).all(req.user.id)

    const scans = db.prepare(`
      SELECT id, title, created_at
      FROM reports
      WHERE user_id = ? AND type = 'repo_scan'
      ORDER BY created_at DESC
      LIMIT 20
    `).all(req.user.id)

    res.json({ reviews, scans })
  } catch (e) {
    res.status(500).json({ error: 'History fetch failed' })
  }
})






// ─────────────────────────────────────────────────────────
// 6. GET SINGLE REVIEW (for export)
// ─────────────────────────────────────────────────────────
router.get('/review/:id', authMw, (req, res) => {
  try {
    const review = db.prepare(`
      SELECT * FROM pr_reviews WHERE id = ? AND user_id = ?
    `).get(req.params.id, req.user.id)

    if (!review) return res.status(404).json({ error: 'Review nahi mila' })

    res.json({ review: { ...review, review: JSON.parse(review.review) } })
  } catch (e) {
    res.status(500).json({ error: 'Review fetch failed' })
  }
})


router.get('/scan/:id', authMw, (req, res) => {
  try {
    const scan = db.prepare(`
      SELECT *
      FROM reports
      WHERE id = ?
      AND user_id = ?
      AND type = 'repo_scan'
    `).get(req.params.id, req.user.id)

    if (!scan) {
      return res.status(404).json({
        error: 'Scan nahi mila'
      })
    }

    res.json({
      scan: {
        ...scan,
        content: JSON.parse(scan.content)
      }
    })
  } catch (e) {
    res.status(500).json({
      error: 'Scan fetch failed'
    })
  }
})

router.delete('/scan/:id', authMw, (req, res) => {
  try {
    const result = db.prepare(`
      DELETE FROM reports
      WHERE id = ?
      AND user_id = ?
      AND type = 'repo_scan'
    `).run(req.params.id, req.user.id)

    res.json({
      success: true,
      deleted: result.changes
    })
  } catch (e) {
    res.status(500).json({
      error: 'Delete failed'
    })
  }
})



router.delete('/scan-history', authMw, (req, res) => {
  try {
    db.prepare(`
      DELETE FROM reports
      WHERE user_id = ?
      AND type = 'repo_scan'
    `).run(req.user.id)

    res.json({ success: true })
  } catch {
    res.status(500).json({
      error: 'History delete failed'
    })
  }
})




// ─────────────────────────────────────────────────────────
// 7. GET COMMITS (Real data)
// ─────────────────────────────────────────────────────────
router.get('/commits', authMw, async (req, res) => {
  try {
    const { owner, repo, prNumber } = req.query
    const token = getUserGithubToken(req.user.id)
    if (!token) return res.status(400).json({ error: 'GitHub connected nahi hai' })

    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/commits`,
      { headers: ghHeaders(token) }
    )

    const commits = response.data.map(c => ({
      sha: c.sha.substring(0, 7),
      fullSha: c.sha,
      message: c.commit.message,
      author: c.commit.author.name,
      email: c.commit.author.email,
      date: c.commit.author.date,
      url: c.html_url
    }))

    res.json({ commits })
  } catch (e) {
    handleGithubError(e, res)
  }
})

// ─────────────────────────────────────────────────────────
// 8. GET CHECKS / CI STATUS (Real data)
// ─────────────────────────────────────────────────────────
router.get('/checks', authMw, async (req, res) => {
  try {
    const { owner, repo, sha } = req.query
    const token = getUserGithubToken(req.user.id)
    if (!token) return res.status(400).json({ error: 'GitHub connected nahi hai' })

    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits/${sha}/check-runs`,
      { headers: ghHeaders(token) }
    )

    const checks = (response.data.check_runs || []).map(c => ({
      id: c.id,
      name: c.name,
      status: c.status,
      conclusion: c.conclusion,
      started_at: c.started_at,
      completed_at: c.completed_at,
      url: c.html_url,
      app: c.app?.name || 'GitHub'
    }))

    res.json({ checks })
  } catch (e) {
    handleGithubError(e, res)
  }
})

// ─────────────────────────────────────────────────────────
// 9. GITHUB STATUS (Connected hai ya nahi)
// ─────────────────────────────────────────────────────────
router.get('/status', authMw, (req, res) => {
  try {
    const settings = db.prepare('SELECT github_token, github_username, github_connected FROM settings WHERE user_id = ?').get(req.user.id)
    const user = db.prepare('SELECT github_token, github_username, github_connected FROM users WHERE id = ?').get(req.user.id)

    const token = settings?.github_token || user?.github_token
    const username = settings?.github_username || user?.github_username
    const connected = !!(settings?.github_connected || user?.github_connected)

    res.json({ connected, username: username || null, hasToken: !!token })
  } catch (e) {
    res.status(500).json({ error: 'Status check failed' })
  }
})



module.exports = router