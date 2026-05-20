import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Trash2, Lock, Unlock, MessageSquare, ThumbsUp, Search, Loader2 } from 'lucide-react'
import { admin as adminApi, threads as threadsApi, type Thread } from '../../lib/api'

export const Route = createFileRoute('/admin/discussions')({
  component: AdminDiscussions,
})

function AdminDiscussions() {
  const [threadList, setThreadList] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadThreads()
  }, [])

  const loadThreads = async (search?: string) => {
    try {
      const { threads } = await threadsApi.list({ search })
      setThreadList(threads)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => loadThreads(searchTerm || undefined), 300)
    return () => clearTimeout(timeout)
  }, [searchTerm])

  const handleToggleLock = async (thread: Thread) => {
    try {
      const { thread: updated } = await adminApi.lockThread(thread.id)
      setThreadList((prev) => prev.map((t) => t.id === thread.id ? { ...t, isLocked: updated.isLocked } : t))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this thread? This cannot be undone.')) return
    try {
      await adminApi.deleteThread(id)
      setThreadList((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manage Discussions</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Review, moderate, delete, or lock student forum threads.</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, author, or category..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
                <tr>
                  <th className="px-6 py-4">Discussion Info</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Stats</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {threadList.map((thread) => (
                  <tr key={thread.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <p className="font-extrabold text-slate-900 truncate">{thread.title}</p>
                        <p className="text-xs text-slate-500 mt-1 truncate">
                          By <span className="font-bold">{thread.author.name}</span> ({thread.author.email}) • {thread.time}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                        {thread.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                        <div className="flex items-center gap-1.5" title="Replies">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{thread.commentsCount}</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Likes">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{thread.likes}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {thread.isLocked ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">
                          <Lock className="w-3.5 h-3.5" /> Locked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                          <Unlock className="w-3.5 h-3.5" /> Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleToggleLock(thread)}
                          className={`p-2 rounded-xl border transition-all cursor-pointer ${thread.isLocked ? 'bg-rose-50 border-rose-100 text-rose-500 hover:bg-rose-100' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                          title={thread.isLocked ? 'Unlock Thread' : 'Lock Thread'}>
                          {thread.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleDelete(thread.id)}
                          className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-500 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
                          title="Delete Discussion">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {threadList.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 font-semibold text-sm">
                      No discussions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
