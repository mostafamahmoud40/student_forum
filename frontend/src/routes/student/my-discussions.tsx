import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { MessageSquare, ThumbsUp, Send, Lock, ChevronLeft, Loader2 } from 'lucide-react'
import { threads as threadsApi, type Thread, type ThreadDetail } from '../../lib/api'

export const Route = createFileRoute('/student/my-discussions')({
  component: MyDiscussions,
})

function MyDiscussions() {
  const [threadList, setThreadList] = useState<Thread[]>([])
  const [activeThread, setActiveThread] = useState<ThreadDetail | null>(null)
  const [replyText, setReplyText] = useState('')
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const { threads } = await threadsApi.myList()
        setThreadList(threads)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleClickThread = async (id: number) => {
    try {
      const { thread } = await threadsApi.get(id)
      setActiveThread(thread)
    } catch {
      alert('Could not load thread.')
    }
  }

  const handleLikeThread = async (id: number) => {
    try {
      await threadsApi.like(id)
      if (activeThread?.id === id) {
        setActiveThread((prev) => prev ? { ...prev, likes: prev.likes + 1 } : prev)
      }
      setThreadList((prev) => prev.map((t) => t.id === id ? { ...t, likes: t.likes + 1 } : t))
    } catch { /* already liked */ }
  }

  const handleLikeComment = async (commentId: number) => {
    try {
      await threadsApi.likeComment(commentId)
      setActiveThread((prev) =>
        prev ? { ...prev, comments: prev.comments.map((c) => c.id === commentId ? { ...c, likes: c.likes + 1 } : c) } : prev
      )
    } catch { /* already liked */ }
  }

  const handlePostReply = async () => {
    if (!replyText.trim() || !activeThread) return
    setPosting(true)
    try {
      const { comment } = await threadsApi.comment(activeThread.id, replyText.trim())
      setActiveThread((prev) => prev ? { ...prev, comments: [...prev.comments, comment] } : prev)
      setReplyText('')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to post reply')
    } finally {
      setPosting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (activeThread) {
    return (
      <div className="space-y-6 max-w-5xl font-sans text-slate-800">
        <button onClick={() => setActiveThread(null)}
          className="flex items-center gap-1.5 text-sm font-bold text-primary hover:text-blue-600 cursor-pointer">
          <ChevronLeft className="w-4 h-4" /> Back to My Discussions
        </button>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold border bg-blue-50 border-blue-100 text-blue-600 px-2.5 py-0.5 rounded-md">
                  {activeThread.category}
                </span>
                {activeThread.isLocked && (
                  <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-50 border border-amber-100 text-amber-600 px-2.5 py-0.5 rounded-md">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                )}
              </div>
              <h2 className="text-lg font-black text-slate-900">{activeThread.title}</h2>
              <p className="text-xs text-slate-400 font-semibold">
                By <strong className="text-slate-600">{activeThread.author.name}</strong> · {activeThread.time}
              </p>
            </div>
            <button onClick={() => handleLikeThread(activeThread.id)}
              className="flex items-center gap-1.5 text-xs font-bold text-primary bg-blue-50 px-3 py-2 rounded-xl border border-blue-100 hover:bg-blue-100 transition cursor-pointer shrink-0">
              <ThumbsUp className="w-4 h-4" /> {activeThread.likes}
            </button>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-2xl p-4 border border-slate-100">
            {activeThread.content}
          </p>
        </div>

        {/* Comments */}
        <div className="space-y-3">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            {activeThread.comments.length} {activeThread.comments.length === 1 ? 'Reply' : 'Replies'}
          </h3>

          {activeThread.comments.map((comment) => (
            <div key={comment.id} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-black">
                    {comment.author.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">{comment.author.name}</p>
                    <p className="text-[10px] text-slate-400">{comment.time}</p>
                  </div>
                </div>
                <button onClick={() => handleLikeComment(comment.id)}
                  className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-primary cursor-pointer">
                  <ThumbsUp className="w-3 h-3" /> {comment.likes}
                </button>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{comment.content}</p>
            </div>
          ))}

          {!activeThread.isLocked && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                rows={3}
                className="w-full resize-none text-sm text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition"
              />
              <div className="flex justify-end mt-2">
                <button onClick={handlePostReply} disabled={!replyText.trim() || posting}
                  className="flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-blue-600 transition disabled:opacity-40 cursor-pointer">
                  {posting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Post Reply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl font-sans text-slate-800">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Discussions</h1>
        <p className="text-slate-500 text-sm mt-1">Threads you've started across all communities.</p>
      </div>

      {threadList.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-10 text-center text-slate-400 font-semibold">
          You haven't started any discussions yet.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-2 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
          {threadList.map((thread) => (
            <button key={thread.id} onClick={() => handleClickThread(thread.id)}
              className="w-full text-left p-5 hover:bg-slate-50 rounded-2xl transition-colors flex items-start justify-between gap-4 border-b border-slate-100 last:border-b-0 cursor-pointer">
              <div className="space-y-1.5 min-w-0">
                <p className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 w-fit">{thread.category}</p>
                <h3 className="text-sm font-extrabold text-slate-800 leading-tight">{thread.title}</h3>
                <p className="text-[11px] text-slate-400 font-semibold">{thread.time}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className="flex items-center gap-1 text-xs text-slate-500 font-bold">
                  <MessageSquare className="w-3.5 h-3.5" /> {thread.commentsCount} Replies
                </span>
                <span className="flex items-center gap-1 text-xs text-primary font-bold">
                  <ThumbsUp className="w-3.5 h-3.5" /> {thread.likes} Likes
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
