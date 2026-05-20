import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { ShieldAlert, AlertTriangle, CheckCircle2, Trash2, ShieldCheck, Loader2 } from 'lucide-react'
import { admin as adminApi, type ModerationItem } from '../../lib/api'

export const Route = createFileRoute('/admin/moderation')({
  component: ModerationQueue,
})

function ModerationQueue() {
  const [flaggedPosts, setFlaggedPosts] = useState<ModerationItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.moderation()
      .then(({ items }) => setFlaggedPosts(items))
      .finally(() => setLoading(false))
  }, [])

  const handleApprovePost = async (id: number) => {
    try {
      await adminApi.approveFlag(id)
      setFlaggedPosts((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed')
    }
  }

  const handleDeletePost = async (id: number) => {
    try {
      await adminApi.deleteFlag(id)
      setFlaggedPosts((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Moderation Queue</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium max-w-xl">
            Review items reported by StudentHub users for academic dishonesty, spam, or harassment.
          </p>
        </div>
        <div className="shrink-0">
          <span className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-2 rounded-xl text-sm font-extrabold shadow-sm flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            {flaggedPosts.length} Pending Items
          </span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.02)] space-y-6">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
        ) : (
          <div className="space-y-4">
            {flaggedPosts.map((post) => (
              <div key={post.id}
                className="p-5 rounded-2xl bg-slate-50/50 hover:bg-slate-50 border border-slate-200/60 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      post.severity === 'High' ? 'bg-rose-100 text-rose-700' :
                      post.severity === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {post.severity} Priority
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-xs font-semibold text-rose-500 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{post.reason}</span>
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-800">{post.thread.title}</h3>
                  <p className="text-xs text-slate-400 font-semibold">
                    Reported Author: <strong className="text-slate-600 font-bold">@{post.author}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleApprovePost(post.id)}
                    className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer">
                    <CheckCircle2 className="w-4 h-4" /> Keep Post
                  </button>
                  <button onClick={() => handleDeletePost(post.id)}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer">
                    <Trash2 className="w-4 h-4" /> Remove Post
                  </button>
                </div>
              </div>
            ))}
            {flaggedPosts.length === 0 && (
              <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-semibold space-y-2">
                <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-sm font-bold text-slate-700">Moderation Queue Clear!</p>
                <p className="text-xs text-slate-400 font-medium">All flagged discussions have been audited.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
