const express = require('express')
const Groq = require('groq-sdk')
const router = express.Router()
const db = require('../database/db')
const authMw = require('../middleware/auth')

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

// ─────────────────────────────────────────────────────────
// AVAILABLE MODELS
// ─────────────────────────────────────────────────────────
const FALLBACK_MODELS = [
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768',
  'llama-3.3-70b-versatile'
]

// ─────────────────────────────────────────────────────────
// TRY MODELS ONE BY ONE
// ─────────────────────────────────────────────────────────
async function generateAIResponse(messages, selectedModel) {

  // Remove duplicates
  const modelsToTry = [
    selectedModel,
    ...FALLBACK_MODELS
  ].filter(Boolean)

  const uniqueModels = modelsToTry.filter(
    (m, i) => modelsToTry.indexOf(m) === i
  )

  let lastError = null

  for (const modelName of uniqueModels) {

    try {

      console.log(`🧠 Trying model: ${modelName}`)

      const response =
        await groq.chat.completions.create({

          model: modelName,

          messages,

          temperature: 0.3,

          max_tokens: 1800
        })

      console.log(`✅ Success with: ${modelName}`)

      return {
        reply:
          response?.choices?.[0]?.message?.content ||
          'No response generated.',

        model: modelName
      }

    } catch (err) {

      console.log(`❌ Failed model: ${modelName}`)

      lastError = err

      // Continue to next model
    }
  }

  throw lastError
}

// ─────────────────────────────────────────────────────────
// SEND MESSAGE
// ─────────────────────────────────────────────────────────
router.post('/message', authMw, async (req, res) => {

  const {
    message,
    code,
    fileName,
    model
  } = req.body

  if (!message && !code) {

    return res.status(400).json({
      error: 'Message or code required'
    })
  }

  try {

    // ─────────────────────────────────────────────────────
    // SAVE USER MESSAGE
    // ─────────────────────────────────────────────────────
    db.prepare(`
      INSERT INTO chat_messages (user_id, role, content)
      VALUES (?, ?, ?)
    `).run(
      req.user.id,
      'user',
      message || `Uploaded file: ${fileName || 'code file'}`
    )

    // ─────────────────────────────────────────────────────
    // GET CHAT HISTORY
    // ─────────────────────────────────────────────────────
    const history = db.prepare(`
      SELECT role, content
      FROM chat_messages
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `).all(req.user.id).reverse()

    // ─────────────────────────────────────────────────────
    // FINAL USER PROMPT
    // ─────────────────────────────────────────────────────
    let finalUserPrompt = ''

    if (message) {

      finalUserPrompt += `${message}\n\n`
    }

    if (code) {

      finalUserPrompt += `
User uploaded file: ${fileName || 'code file'}

Analyze this code carefully.

\`\`\`
${code}
\`\`\`
`
    }

    // ─────────────────────────────────────────────────────
    // SYSTEM PROMPT
    // ─────────────────────────────────────────────────────
    const systemPrompt = `
You are CodeSense AI.

You are an expert software engineer and AI coding assistant.

Your tasks:
- Analyze uploaded code
- Detect bugs
- Find security vulnerabilities
- Suggest optimizations
- Explain code simply
- Generate fixed code if needed
- Write clean developer-friendly responses

IMPORTANT RULES:
- If user uploads code, ALWAYS analyze it
- NEVER ask user to paste code again
- Assume uploaded file content is already provided
- Use markdown code blocks properly
- Keep responses concise but useful
`

    // ─────────────────────────────────────────────────────
    // ALL MESSAGES
    // ─────────────────────────────────────────────────────
    const messages = [

      {
        role: 'system',
        content: systemPrompt
      },

      ...history.map(h => ({
        role: h.role,
        content: h.content
      })),

      {
        role: 'user',
        content: finalUserPrompt
      }
    ]

    // ─────────────────────────────────────────────────────
    // GENERATE RESPONSE WITH FALLBACK
    // ─────────────────────────────────────────────────────
    const aiResult = await generateAIResponse(
      messages,
      model
    )

    const reply = aiResult.reply

    // ─────────────────────────────────────────────────────
    // SAVE ASSISTANT MESSAGE
    // ─────────────────────────────────────────────────────
    db.prepare(`
      INSERT INTO chat_messages (user_id, role, content)
      VALUES (?, ?, ?)
    `).run(
      req.user.id,
      'assistant',
      reply
    )

    // ─────────────────────────────────────────────────────
    // SEND RESPONSE
    // ─────────────────────────────────────────────────────
    res.json({
      reply,
      modelUsed: aiResult.model
    })

  } catch (error) {

    console.log('❌ AI ERROR:', error)

    res.status(500).json({

      error:
        'Could not connect to AI. Please try again.'
    })
  }
})

// ─────────────────────────────────────────────────────────
// GET CHAT HISTORY
// ─────────────────────────────────────────────────────────
router.get('/history', authMw, (req, res) => {

  const messages = db.prepare(`
    SELECT id, role, content, created_at
    FROM chat_messages
    WHERE user_id = ?
    ORDER BY created_at ASC
    LIMIT 100
  `).all(req.user.id)

  res.json({
    messages
  })
})

// ─────────────────────────────────────────────────────────
// CLEAR CHAT
// ─────────────────────────────────────────────────────────
router.delete('/clear', authMw, (req, res) => {

  db.prepare(`
    DELETE FROM chat_messages
    WHERE user_id = ?
  `).run(req.user.id)

  res.json({
    success: true
  })
})

module.exports = router