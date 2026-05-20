// Relative /api works in Docker (nginx proxy) and Vite dev (vite proxy) — same origin, no CORS issues
const BASE = import.meta.env.VITE_API_URL ?? '/api'

export interface ApiUser {
  id: number
  name: string
  email: string
  role: 'student' | 'admin'
  major?: string | null
  status?: string
}

export interface Community {
  id: number
  title: string
  tag: string
  imageUrl: string
  avatarUrl?: string | null
  description: string
  creator: string
  membersCount: number
  discussionsCount: number
  interactionsCount: number
}

export interface Thread {
  id: number
  title: string
  content: string
  author: { id: number; name: string; email: string; isBanned?: boolean }
  category: string
  likes: number
  views: number
  isLocked: boolean
  commentsCount: number
  time: string
}

export interface ThreadDetail extends Omit<Thread, 'commentsCount'> {
  comments: Comment[]
}

export interface Comment {
  id: number
  author: { id: number; name: string }
  content: string
  likes: number
  time: string
}

function getToken(): string | null {
  return localStorage.getItem('token')
}

function getUser(): ApiUser | null {
  const raw = localStorage.getItem('user')
  return raw ? (JSON.parse(raw) as ApiUser) : null
}

function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((err as { error: string }).error ?? res.statusText)
  }
  return res.json() as Promise<T>
}

// ── Auth ───────────────────────────────────────────────────────────────────

export const auth = {
  login: (email: string, password: string) =>
    request<{ token: string; user: ApiUser }>('POST', '/auth/login', { email, password }),

  register: (name: string, email: string, major: string, password: string) =>
    request<{ token: string; user: ApiUser }>('POST', '/auth/register', { name, email, major, password }),

  me: () => request<{ user: ApiUser }>('GET', '/auth/me'),

  saveSession: (token: string, user: ApiUser) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    // Keep legacy keys so Navbar polling still works instantly
    localStorage.setItem('userRole', user.role)
    localStorage.setItem('userEmail', user.email)
  },

  clearSession: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userEmail')
  },

  currentUser: getUser,
  currentRole: () => getUser()?.role ?? null,
}

// ── Communities ────────────────────────────────────────────────────────────

export const communities = {
  list: () => request<{ communities: Community[] }>('GET', '/communities'),

  get: (id: number) => request<{ community: Community }>('GET', `/communities/${id}`),

  threads: (id: number) =>
    request<{ threads: Thread[] }>('GET', `/communities/${id}/threads`),

  join: (id: number) => request<{ success: boolean }>('POST', `/communities/${id}/join`),

  leave: (id: number) => request<{ success: boolean }>('DELETE', `/communities/${id}/join`),

  myJoined: () => request<{ communities: Community[] }>('GET', '/communities/me/joined'),
}

// ── Threads ────────────────────────────────────────────────────────────────

export const threads = {
  list: (params?: { category?: string; search?: string }) => {
    const qs = new URLSearchParams()
    if (params?.category) qs.set('category', params.category)
    if (params?.search) qs.set('search', params.search)
    const q = qs.toString()
    return request<{ threads: Thread[] }>('GET', `/threads${q ? `?${q}` : ''}`)
  },

  get: (id: number) => request<{ thread: ThreadDetail }>('GET', `/threads/${id}`),

  myList: () => request<{ threads: Thread[] }>('GET', '/threads/me/list'),

  create: (data: { title: string; content: string; category: string; communityId?: number }) =>
    request<{ thread: Thread }>('POST', '/threads', data),

  update: (id: number, data: { title?: string; content?: string }) =>
    request<{ thread: Thread }>('PATCH', `/threads/${id}`, data),

  delete: (id: number) => request<{ success: boolean }>('DELETE', `/threads/${id}`),

  like: (id: number) => request<{ success: boolean }>('POST', `/threads/${id}/like`),

  comment: (id: number, content: string) =>
    request<{ comment: Comment }>('POST', `/threads/${id}/comments`, { content }),

  likeComment: (commentId: number) =>
    request<{ success: boolean }>('POST', `/threads/comments/${commentId}/like`),
}

// ── Admin ──────────────────────────────────────────────────────────────────

export const admin = {
  students: (search?: string) => {
    const q = search ? `?search=${encodeURIComponent(search)}` : ''
    return request<{ students: ApiUser[] }>('GET', `/admin/students${q}`)
  },

  updateStatus: (id: number, status: string) =>
    request<{ user: ApiUser }>('PATCH', `/admin/students/${id}/status`, { status }),

  createCommunity: (data: Partial<Community>) =>
    request<{ community: Community }>('POST', '/admin/communities', data),

  updateCommunity: (id: number, data: Partial<Community>) =>
    request<{ community: Community }>('PATCH', `/admin/communities/${id}`, data),

  deleteCommunity: (id: number) =>
    request<{ success: boolean }>('DELETE', `/admin/communities/${id}`),

  lockThread: (id: number) =>
    request<{ thread: Thread }>('PATCH', `/admin/threads/${id}/lock`),

  deleteThread: (id: number) =>
    request<{ success: boolean }>('DELETE', `/admin/threads/${id}`),

  banUser: (email: string) =>
    request<{ success: boolean }>('POST', '/admin/users/ban', { email }),

  moderation: () =>
    request<{ items: ModerationItem[] }>('GET', '/admin/moderation'),

  approveFlag: (id: number) =>
    request<{ success: boolean }>('PATCH', `/admin/moderation/${id}/approve`),

  deleteFlag: (id: number) =>
    request<{ success: boolean }>('DELETE', `/admin/moderation/${id}`),
}

export interface ModerationItem {
  id: number
  author: string
  reason: string
  severity: 'High' | 'Medium' | 'Low'
  thread: { id: number; title: string }
}
