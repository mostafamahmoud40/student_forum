import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Search, Heart, MessageSquare, ThumbsUp, Lock } from 'lucide-react'
import { threads as threadsApi, type Thread, auth } from '../lib/api'

export const Route = createFileRoute('/discussions')({
  component: Discussions,
})

const CATEGORIES = [
  'Computer Science & AI',
  'Medicine & Surgery',
  'Engineering Hub',
  'Dentistry Science',
]

function Discussions() {
  const [threadList, setThreadList] = useState<Thread[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const isLoggedIn = !!auth.currentUser()

  useEffect(() => {
    const saved = localStorage.getItem('selectedCategory') ?? ''
    setActiveCategory(saved)
    localStorage.removeItem('selectedCategory')
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { threads } = await threadsApi.list({
          category: activeCategory || undefined,
          search: searchQuery || undefined,
        })
        setThreadList(threads)
      } finally {
        setLoading(false)
      }
    }
    const timeout = setTimeout(load, 300)
    return () => clearTimeout(timeout)
  }, [activeCategory, searchQuery])

  const handleLike = async (id: number) => {
    if (!isLoggedIn) { alert('Please log in to like threads.'); return }
    if (likedIds.has(id)) return
    try {
      await threadsApi.like(id)
      setLikedIds((prev) => new Set([...prev, id]))
      setThreadList((prev) => prev.map((t) => t.id === id ? { ...t, likes: t.likes + 1 } : t))
    } catch {
      // already liked or error
    }
  }

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'Computer Science & AI': return 'bg-blue-50 border-blue-100 text-blue-600'
      case 'Medicine & Surgery': return 'bg-rose-50 border-rose-100 text-rose-600'
      case 'Engineering Hub': return 'bg-amber-50 border-amber-100 text-amber-600'
      case 'Dentistry Science': return 'bg-emerald-50 border-emerald-100 text-emerald-600'
      default: return 'bg-slate-50 border-slate-100 text-slate-600'
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 font-sans text-slate-800 space-y-6 text-left">

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Discussions</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Browse discussions across all academic communities.</p>
        </div>
        <div className="flex gap-2 w-full lg:w-auto">
          <div className="flex-1 bg-slate-100/80 rounded-2xl px-4 py-3 flex items-center gap-2 focus-within:bg-white focus-within:border-slate-200 focus-within:shadow-sm border border-transparent transition-all">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input type="text" placeholder="Search discussions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-sm placeholder-slate-400 font-semibold w-full" />
          </div>
          <button className="p-3 rounded-2xl border border-transparent bg-slate-100/80 text-slate-500 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-all cursor-pointer">
            <Heart className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setActiveCategory('')}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${activeCategory === '' ? 'bg-primary text-white border-transparent shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:shadow-sm'}`}>
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(activeCategory === cat ? '' : cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${activeCategory === cat ? 'bg-primary text-white border-transparent shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:shadow-sm'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Thread List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 divide-y divide-slate-100 shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin w-6 h-6 border-3 border-primary border-t-transparent rounded-full" />
          </div>
        ) : threadList.length === 0 ? (
          <div className="p-10 text-center text-slate-400 font-semibold">No discussions found.</div>
        ) : (
          threadList.map((thread) => (
            <div key={thread.id} className="p-5 sm:p-6 hover:bg-slate-50/50 transition-colors">
              <div className="flex justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold border px-2.5 py-0.5 rounded-md ${getCategoryStyles(thread.category)}`}>
                      {thread.category}
                    </span>
                    {thread.isLocked && (
                      <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-50 border border-amber-100 text-amber-600 px-2.5 py-0.5 rounded-md">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-800 leading-tight">{thread.title}</h3>
                  <p className="text-[11px] text-slate-400 font-semibold">
                    By <strong className="text-slate-500">{thread.author.name}</strong> • {thread.time}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0 ml-2">
                  <button onClick={() => handleLike(thread.id)}
                    className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${likedIds.has(thread.id) ? 'text-primary border-primary/20 bg-blue-50' : 'text-slate-500 border-slate-200 hover:border-primary/20 hover:text-primary hover:bg-blue-50'}`}>
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{thread.likes}</span>
                  </button>
                  <div className="flex items-center gap-1 text-xs text-slate-400 font-semibold">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{thread.commentsCount} replies</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
