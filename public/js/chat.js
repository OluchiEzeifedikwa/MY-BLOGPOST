const CHAT_URL = 'https://n8n-2cxd.onrender.com/webhook/ab5393d5-3eaf-45de-aed3-b6da0a5bd718/chat'

const chatToggle   = document.getElementById('chatToggle')
const chatPanel    = document.getElementById('chatPanel')
const chatClose    = document.getElementById('chatClose')
const chatMessages = document.getElementById('chatMessages')
const chatInput    = document.getElementById('chatInput')
const chatSend     = document.getElementById('chatSend')

let sessionId = localStorage.getItem('meshai_session')
if (!sessionId) {
  sessionId = crypto.randomUUID()
  localStorage.setItem('meshai_session', sessionId)
}

let isOpen = false

function toggleChat() {
  isOpen = !isOpen
  chatPanel.classList.toggle('open', isOpen)
  chatToggle.textContent = isOpen ? '✕' : '💬'
  if (isOpen) chatInput.focus()
}

chatToggle.addEventListener('click', toggleChat)
chatClose.addEventListener('click', toggleChat)

function appendMessage(text, type) {
  const div = document.createElement('div')
  div.className = `chat-msg ${type}`
  div.textContent = text
  chatMessages.appendChild(div)
  chatMessages.scrollTop = chatMessages.scrollHeight
  return div
}

async function sendMessage() {
  const text = chatInput.value.trim()
  if (!text) return

  chatInput.value = ''
  chatSend.disabled = true
  appendMessage(text, 'user')

  const typing = appendMessage('MeshAI is typing...', 'typing')

  try {
    const res = await fetch(CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'sendMessage', sessionId, chatInput: text })
    })

    const data = await res.json()
    typing.remove()
    appendMessage(data.output || 'Sorry, I could not respond right now.', 'bot')
  } catch {
    typing.remove()
    appendMessage('Could not reach MeshAI. Try again later.', 'bot')
  } finally {
    chatSend.disabled = false
    chatInput.focus()
  }
}

chatSend.addEventListener('click', sendMessage)
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
})
