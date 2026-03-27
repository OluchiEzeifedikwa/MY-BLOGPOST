const form = document.getElementById('loginForm')
const errorMsg = document.getElementById('errorMsg')
const submitBtn = document.getElementById('submitBtn')

form.addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = document.getElementById('email').value.trim()
  const password = document.getElementById('password').value

  errorMsg.style.display = 'none'
  submitBtn.disabled = true
  submitBtn.textContent = 'Logging in...'

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    })

    const data = await res.json()

    if (!res.ok) {
      errorMsg.textContent = data.message || 'Invalid email or password.'
      errorMsg.style.display = 'block'
      return
    }

    if (data.username) localStorage.setItem('username', data.username)
    if (data.token) localStorage.setItem('token', data.token)
    window.location.href = '/home.html'

    


  } catch {
    errorMsg.textContent = 'Could not connect to server. Please try again.'
    errorMsg.style.display = 'block'
  } finally {
    submitBtn.disabled = false
    submitBtn.textContent = 'Log In'
  }
})
