const express = require('express')
const multer  = require('multer')
const router  = express.Router()
const authMw  = require('../middleware/auth')

const ALLOWED = ['.js','.ts','.jsx','.tsx','.py','.java','.cpp','.c','.cs','.go','.rb','.php','.rs','.kt','.swift','.html','.css']

const storage = multer.memoryStorage()
const upload  = multer({
  storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB max
  fileFilter: (req, file, cb) => {
    const ext = '.' + file.originalname.split('.').pop().toLowerCase()
    if (ALLOWED.includes(ext)) cb(null, true)
    else cb(new Error(`File type not allowed. Allowed: ${ALLOWED.join(', ')}`))
  }
})

// ── Upload file → returns code text ──────────────────────
router.post('/', authMw, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'File required' })

  const code     = req.file.buffer.toString('utf-8')
  const filename = req.file.originalname
  const ext      = filename.split('.').pop().toLowerCase()

  const langMap = {
    js: 'JavaScript', ts: 'TypeScript', jsx: 'React JSX', tsx: 'React TSX',
    py: 'Python', java: 'Java', cpp: 'C++', c: 'C', cs: 'C#',
    go: 'Go', rb: 'Ruby', php: 'PHP', rs: 'Rust', kt: 'Kotlin',
    swift: 'Swift', html: 'HTML', css: 'CSS'
  }

  res.json({
    code,
    filename,
    language: langMap[ext] || 'Unknown',
    size: req.file.size,
    lines: code.split('\n').length
  })
})

module.exports = router