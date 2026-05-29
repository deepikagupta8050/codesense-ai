const express = require('express')
const router  = express.Router()
const db      = require('../database/db')
const authMw  = require('../middleware/auth')

// ── Main Analytics ───────────────────────────────────────
router.get('/', authMw, (req, res) => {

  const uid = req.user.id

  // ── Overview Stats ────────────────────────────────────

  const total =
    db.prepare(`
      SELECT COUNT(*) as c
      FROM reviews
      WHERE user_id = ?
    `).get(uid).c

  const avgScore =
    db.prepare(`
      SELECT AVG(score) as a
      FROM reviews
      WHERE user_id = ?
    `).get(uid).a

  const totalBugs =
    db.prepare(`
      SELECT SUM(bugs_count) as s
      FROM reviews
      WHERE user_id = ?
    `).get(uid).s

  const totalSec =
    db.prepare(`
      SELECT SUM(security_count) as s
      FROM reviews
      WHERE user_id = ?
    `).get(uid).s

  // ── Current Week Reviews ──────────────────────────────

  const currentWeek =
    db.prepare(`
      SELECT COUNT(*) as c
      FROM reviews
      WHERE user_id = ?
      AND created_at >= date('now', '-7 days')
    `).get(uid).c

  // ── Previous Week Reviews ─────────────────────────────

  const previousWeek =
    db.prepare(`
      SELECT COUNT(*) as c
      FROM reviews
      WHERE user_id = ?
      AND created_at >= date('now', '-14 days')
      AND created_at < date('now', '-7 days')
    `).get(uid).c

  // ── Growth Calculation ────────────────────────────────

  const calcGrowth = (current, previous) => {

    if (!previous || previous === 0) {

      return current > 0 ? 100 : 0

    }

    return Math.round(
      ((current - previous) / previous) * 100
    )

  }

  const reviewGrowth =
    calcGrowth(currentWeek, previousWeek)

  // ── Score Trend ───────────────────────────────────────

  const scoreTrend =
    db.prepare(`
      SELECT
        date(created_at) as day,
        ROUND(AVG(score),1) as avg_score,
        COUNT(*) as count
      FROM reviews
      WHERE user_id = ?
      AND created_at >= date('now', '-7 days')
      GROUP BY date(created_at)
      ORDER BY day ASC
    `).all(uid)

  // ── Language Breakdown ────────────────────────────────

  const languages =
    db.prepare(`
      SELECT
        language,
        COUNT(*) as count,
        ROUND(AVG(score),1) as avg_score
      FROM reviews
      WHERE user_id = ?
      GROUP BY language
      ORDER BY count DESC
      LIMIT 6
    `).all(uid)

  // ── Severity Breakdown ────────────────────────────────

  const severities =
    db.prepare(`
      SELECT
        severity,
        COUNT(*) as count
      FROM reviews
      WHERE user_id = ?
      GROUP BY severity
    `).all(uid)

  // ── Issue Types ───────────────────────────────────────

  const issueTypes = [

    {
      type: 'Bugs',
      count: totalBugs || 0,
      color: '#ef4444'
    },

    {
      type: 'Security',
      count: totalSec || 0,
      color: '#f59e0b'
    },

    {
      type: 'Info',
      count: Math.max(
        0,
        total - (totalBugs || 0)
      ),
      color: '#3b82f6'
    },

  ]

  // ── Activity ──────────────────────────────────────────

  const activity =
    db.prepare(`
      SELECT
        date(created_at) as day,
        COUNT(*) as reviews
      FROM reviews
      WHERE user_id = ?
      AND created_at >= date('now', '-30 days')
      GROUP BY date(created_at)
      ORDER BY day ASC
    `).all(uid)

  // ── Response ──────────────────────────────────────────

  res.json({

    overview: {

      totalReviews: total,

      avgScore:
        avgScore
          ? Math.round(avgScore)
          : 0,

      bugsFound:
        totalBugs || 0,

      securityIssues:
        totalSec || 0,

      reviewGrowth,

      currentWeek,

      previousWeek,

    },

    scoreTrend,

    languages,

    severities,

    issueTypes,

    activity,

  })

})

module.exports = router