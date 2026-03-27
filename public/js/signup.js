const form = document.getElementById('signupForm')
const errorMsg = document.getElementById('errorMsg')
const successMsg = document.getElementById('successMsg')
const submitBtn = document.getElementById('submitBtn')

form.addEventListener('submit', async (e) => {
  e.preventDefault()

  const username = document.getElementById('username').value.trim()
  const email = document.getElementById('email').value.trim()
  const password = document.getElementById('password').value

  errorMsg.style.display = 'none'
  successMsg.style.display = 'none'
  submitBtn.disabled = true
  submitBtn.textContent = 'Creating account...'

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    })

    const data = await res.json()

    if (!res.ok) {
      errorMsg.textContent = data.message || 'Something went wrong.'
      errorMsg.style.display = 'block'
      return
    }

    successMsg.textContent = 'Account created! Redirecting to login...'
    successMsg.style.display = 'block'

    setTimeout(() => {
      window.location.href = '/login.html'
    }, 1500)

  } catch {
    errorMsg.textContent = 'Could not connect to server. Please try again.'
    errorMsg.style.display = 'block'
  } finally {
    submitBtn.disabled = false
    submitBtn.textContent = 'Create Account'
  }
})
