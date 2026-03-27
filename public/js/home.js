// ── ELEMENTS ──────────────────────────────────────────────────────────────
const postsGrid         = document.getElementById('postsGrid')
const postCount         = document.getElementById('postCount')
const welcomeUser       = document.getElementById('welcomeUser')
const logoutBtn         = document.getElementById('logoutBtn')
const writeBtn          = document.getElementById('writeBtn')
const trendingRow       = document.getElementById('trendingRow')

const createPostOverlay = document.getElementById('createPostOverlay')
const closeCreatePost   = document.getElementById('closeCreatePost')
const createPostForm    = document.getElementById('createPostForm')
const createPostError   = document.getElementById('createPostError')
const createPostBtn     = document.getElementById('createPostBtn')

const postDetailOverlay = document.getElementById('postDetailOverlay')
const closePostDetail   = document.getElementById('closePostDetail')
const detailTitle       = document.getElementById('detailTitle')
const detailMeta        = document.getElementById('detailMeta')
const detailContent     = document.getElementById('detailContent')
const commentForm       = document.getElementById('commentForm')
const commentInput      = document.getElementById('commentInput')
const commentError      = document.getElementById('commentError')
const commentsList      = document.getElementById('commentsList')

const searchInput    = document.getElementById('searchInput')
const sortBySelect   = document.getElementById('sortBySelect')
const sortOrderSelect = document.getElementById('sortOrderSelect')
const pagination     = document.getElementById('pagination')

const emojis = ['🏋️', '🏃', '💪', '🥗', '🧘', '⚡', '🔥', '🚴']
let activePostId = null
let currentPage = 1
let totalPages = 1
let activeWs = null

function connectToPostRoom(postId) {
  const token = localStorage.getItem('token')
  if (!token) return

  if (activeWs) { activeWs.close(); activeWs = null }

  activeWs = new WebSocket(`ws://localhost:3000/ws?postId=${postId}&token=${token}`)

  activeWs.onmessage = (e) => {
    const { event, data } = JSON.parse(e.data)

    if (event === 'comment:new') {
      const noComments = commentsList.querySelector('.no-comments')
      if (noComments) commentsList.innerHTML = ''

      commentsList.insertAdjacentHTML('afterbegin', `
        <div class="comment">
          <div class="comment-header">
            <div class="post-card-avatar" style="width:24px;height:24px;font-size:.6rem">${avatarHtml(data.user)}</div>
            <span class="comment-author">${data.user?.username || 'Anonymous'}</span>
            <span class="post-card-date">Just now</span>
          </div>
          <p class="comment-text">${data.content}</p>
        </div>
      `)
    }
  }
}

function disconnectFromPostRoom() {
  if (activeWs) { activeWs.close(); activeWs = null }
}

// ── HELPERS ───────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getInitials(username) {
  return username ? username.slice(0, 2).toUpperCase() : 'FB'
}

function avatarHtml(user) {
  return user?.profile?.image
    ? `<img src="${user.profile.image}" alt="${user.username}" />`
    : getInitials(user?.username)
}

function showError(el, msg) {
  el.textContent = msg
  el.style.display = 'block'
}

function hideError(el) {
  el.style.display = 'none'
}

// ── WELCOME ───────────────────────────────────────────────────────────────
const username = localStorage.getItem('username')
if (username) welcomeUser.textContent = `Hey, ${username}`

// ── SKELETONS ─────────────────────────────────────────────────────────────
function renderSkeletons(container, count = 6) {
  container.innerHTML = Array.from({ length: count }).map(() => `
    <div class="skeleton-card">
      <div class="skeleton skeleton-img"></div>
      <div class="skeleton-body">
        <div class="skeleton skeleton-line short"></div>
        <div class="skeleton skeleton-line medium" style="margin-top:14px"></div>
        <div class="skeleton skeleton-line full"></div>
        <div class="skeleton skeleton-line full"></div>
        <div class="skeleton skeleton-line medium"></div>
      </div>
    </div>
  `).join('')
}

// ── POST CARD ─────────────────────────────────────────────────────────────
function postCardHtml(post, index, badge) {
  const username = post.user?.username || 'Anonymous'
  return `
    <div class="post-card" data-id="${post.id}">
      <div class="post-card-img">
        ${badge ? `<span class="trending-badge">${badge}</span>` : ''}
        ${emojis[index % emojis.length]}
      </div>
      <div class="post-card-body">
        <div class="post-card-meta">
          <div class="post-card-avatar">${avatarHtml(post.user)}</div>
          <span class="post-card-author">${username}</span>
          <span class="post-card-date">${formatDate(post.createdAt)}</span>
        </div>
        <h3>${post.title}</h3>
        <p>${post.content}</p>
        <div class="post-card-footer">
          <span class="comment-btn">💬 ${post._count?.comments ?? 0} Comments</span>
          ${post.views ? `<span class="views-count">👁 ${post.views} views</span>` : ''}
        </div>
      </div>
    </div>
  `
}

// ── LOAD TRENDING ─────────────────────────────────────────────────────────
async function loadTrending() {
  trendingRow.innerHTML = `<div class="trending-skeleton">${
    Array.from({ length: 3 }).map(() => `
      <div class="skeleton-card trending-skeleton-card">
        <div class="skeleton skeleton-img" style="height:120px"></div>
        <div class="skeleton-body">
          <div class="skeleton skeleton-line medium"></div>
          <div class="skeleton skeleton-line short"></div>
        </div>
      </div>
    `).join('')
  }</div>`

  try {
    const res = await fetch('/api/posts/most-viewed', { credentials: 'include' })
    if (!res.ok) { trendingRow.innerHTML = ''; return }
    const posts = await res.json()

    if (!posts.length) { trendingRow.innerHTML = '<p style="color:var(--muted);font-size:.9rem">No trending posts yet.</p>'; return }

    trendingRow.innerHTML = posts.map((post, i) => postCardHtml(post, i, `#${i + 1} · 👁 ${post.views}`)).join('')

    trendingRow.querySelectorAll('.post-card').forEach(card => {
      card.addEventListener('click', () => openPostDetail(card.dataset.id))
    })
  } catch {
    trendingRow.innerHTML = ''
  }
}

// ── LOAD POSTS ────────────────────────────────────────────────────────────
async function loadPosts(page = 1) {
  currentPage = page
  renderSkeletons(postsGrid)

  const search = searchInput.value.trim()
  const sortBy = sortBySelect.value
  const sortOrder = sortOrderSelect.value

  const params = new URLSearchParams({ page, limit: 6, sortBy, sortOrder })
  if (search) params.set('search', search)

  try {
    const res = await fetch(`/api/posts?${params}`, { credentials: 'include' })

    if (res.status === 401) { window.location.href = '/login.html'; return }

    const data = await res.json()
    const posts = data.posts ?? []

    totalPages = data.totalPages ?? 1
    postCount.textContent = `${data.total ?? posts.length} articles`

    if (!posts.length) {
      postsGrid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="icon">🏋️</div>
          <h3>No posts yet</h3>
          <p>Be the first to share your fitness journey.</p>
        </div>`
      return
    }

    postsGrid.innerHTML = posts.map((post, i) => postCardHtml(post, i, null)).join('')

    postsGrid.querySelectorAll('.post-card').forEach(card => {
      card.addEventListener('click', () => openPostDetail(card.dataset.id))
    })

    renderPagination()

  } catch {
    postsGrid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="icon">⚠️</div>
        <h3>Failed to load posts</h3>
        <p>Check your connection and try again.</p>
      </div>`
  }
}

// ── PAGINATION ────────────────────────────────────────────────────────────
function renderPagination() {
  if (totalPages <= 1) { pagination.innerHTML = ''; return }

  let html = `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="loadPosts(${currentPage - 1})">← Prev</button>`

  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="loadPosts(${i})">${i}</button>`
  }

  html += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="loadPosts(${currentPage + 1})">Next →</button>`

  pagination.innerHTML = html
}

// ── POST DETAIL + COMMENTS ────────────────────────────────────────────────
async function openPostDetail(postId) {
  activePostId = postId
  detailTitle.textContent = 'Loading...'
  detailMeta.innerHTML = ''
  detailContent.textContent = ''
  commentsList.innerHTML = ''
  hideError(commentError)
  postDetailOverlay.classList.add('active')
  document.body.style.overflow = 'hidden'

  try {
    const [postRes, commentsRes] = await Promise.all([
      fetch(`/api/posts/${postId}`, { credentials: 'include' }),
      fetch(`/api/posts/${postId}/comments`, { credentials: 'include' })
    ])

    const post = await postRes.json()
    const comments = await commentsRes.json()

    detailTitle.textContent = post.title
    detailMeta.innerHTML = `
      <div class="post-card-meta" style="margin-bottom:0">
        <div class="post-card-avatar">${avatarHtml(post.user)}</div>
        <span class="post-card-author">${post.user?.username || 'Anonymous'}</span>
        <span class="post-card-date">${formatDate(post.createdAt)}</span>
      </div>`
    detailContent.textContent = post.content

    renderComments(comments)
    connectToPostRoom(postId)
  } catch {
    detailTitle.textContent = 'Failed to load post'
  }
}

function renderComments(comments) {
  if (!comments.length) {
    commentsList.innerHTML = '<p class="no-comments">No comments yet. Be the first!</p>'
    return
  }
  commentsList.innerHTML = comments.map(c => `
    <div class="comment">
      <div class="comment-header">
        <div class="post-card-avatar" style="width:24px;height:24px;font-size:.6rem">${avatarHtml(c.user)}</div>
        <span class="comment-author">${c.user?.username || 'Anonymous'}</span>
        <span class="post-card-date">${formatDate(c.createdAt)}</span>
      </div>
      <p class="comment-text">${c.content}</p>
    </div>
  `).join('')
}

commentForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const content = commentInput.value.trim()
  if (!content || !activePostId) return

  hideError(commentError)
  const btn = commentForm.querySelector('button')
  btn.disabled = true

  try {
    const res = await fetch(`/api/posts/${activePostId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ content })
    })

    if (res.status === 401) { window.location.href = '/login.html'; return }

    const comment = await res.json()
    if (!res.ok) { showError(commentError, comment.message || 'Failed to post comment'); return }

    commentInput.value = ''

    const noComments = commentsList.querySelector('.no-comments')
    if (noComments) commentsList.innerHTML = ''

    commentsList.insertAdjacentHTML('afterbegin', `
      <div class="comment">
        <div class="comment-header">
          <div class="post-card-avatar" style="width:24px;height:24px;font-size:.6rem">${getInitials(username)}</div>
          <span class="comment-author">${username || 'You'}</span>
          <span class="post-card-date">Just now</span>
        </div>
        <p class="comment-text">${comment.content}</p>
      </div>
    `)
  } catch {
    showError(commentError, 'Could not post comment.')
  } finally {
    btn.disabled = false
  }
})

// ── CREATE POST ───────────────────────────────────────────────────────────
writeBtn.addEventListener('click', () => {
  createPostOverlay.classList.add('active')
  document.body.style.overflow = 'hidden'
})

closeCreatePost.addEventListener('click', () => {
  createPostOverlay.classList.remove('active')
  document.body.style.overflow = ''
  createPostForm.reset()
  hideError(createPostError)
})

createPostForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const title = document.getElementById('postTitle').value.trim()
  const content = document.getElementById('postContent').value.trim()

  hideError(createPostError)
  createPostBtn.disabled = true
  createPostBtn.textContent = 'Publishing...'

  try {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ title, content, published: true })
    })

    const data = await res.json()
    if (!res.ok) { showError(createPostError, data.message || 'Failed to create post'); return }

    createPostOverlay.classList.remove('active')
    document.body.style.overflow = ''
    createPostForm.reset()
    loadPosts()

  } catch {
    showError(createPostError, 'Could not connect to server.')
  } finally {
    createPostBtn.disabled = false
    createPostBtn.textContent = 'Publish Post'
  }
})

// ── CLOSE MODALS ──────────────────────────────────────────────────────────
closePostDetail.addEventListener('click', () => {
  postDetailOverlay.classList.remove('active')
  document.body.style.overflow = ''
  activePostId = null
  disconnectFromPostRoom()
})

;[createPostOverlay, postDetailOverlay].forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('active')
      document.body.style.overflow = ''
      activePostId = null
      disconnectFromPostRoom()
    }
  })
})

// ── LOGOUT ────────────────────────────────────────────────────────────────
logoutBtn.addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
  localStorage.removeItem('username')
  window.location.href = '/login.html'
})

// ── SEARCH & SORT LISTENERS ───────────────────────────────────────────────
let searchTimeout
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => loadPosts(1), 400)
})

sortBySelect.addEventListener('change', () => loadPosts(1))
sortOrderSelect.addEventListener('change', () => loadPosts(1))

// ── INIT ──────────────────────────────────────────────────────────────────
loadTrending()
loadPosts()
