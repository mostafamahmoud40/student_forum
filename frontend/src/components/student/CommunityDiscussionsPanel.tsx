import { useState, useEffect } from 'react'
import { MessageSquare, ThumbsUp, Send, Lock, Loader2 } from 'lucide-react'
import { communities as communitiesApi, threads as threadsApi, type Thread, type ThreadDetail } from '../../lib/api'

interface Props {
  communityId: number
  communityTitle: string
  isJoined: boolean
  onJoin?: () => void
  onLeave?: () => void
}

export default function CommunityDiscussionsPanel({ communityId, communityTitle, isJoined, onJoin, onLeave }: Props) {
  const [threadList, setThreadList] = useState<Thread[]>([])
  const [activeThread, setActiveThread] = useState<ThreadDetail | null>(null)
  const [replyText, setReplyText] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [creatingThread, setCreatingThread] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const { threads } = await communitiesApi.threads(communityId)
        setThreadList(threads as unknown as Thread[])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [communityId])

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

  const handleCreateThread = async () => {
    if (!newTitle.trim() || !newContent.trim()) return
    setCreatingThread(true)
    try {
      const { thread } = await threadsApi.create({
        title: newTitle.trim(),
        content: newContent.trim(),
        category: communityTitle,
        communityId,
      })
      setThreadList((prev) => [thread, ...prev])
      setNewTitle('')
      setNewContent('')
      setShowCreateModal(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create discussion')
    } finally {
      setCreatingThread(false)
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
      <div className="space-y-4">
        <button onClick={() => setActiveThread(null)}
          className="text-xs font-bold text-primary hover:text-blue-600 cursor-pointer">
          ← Back to {communityTitle} Discussions
        </button>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
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

          {!activeThread.isLocked && isJoined && (
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900">{communityTitle}</h2>
          <p className="text-slate-500 text-xs font-medium mt-0.5">Discussions in this community</p>
        </div>
        {!isJoined && onJoin && (
          <button onClick={onJoin}
            className="px-4 py-2 text-xs font-bold bg-primary text-white rounded-xl hover:bg-blue-600 transition cursor-pointer">
            Join Community
          </button>
        )}
        {isJoined && onLeave && (
          <button onClick={onLeave}
            className="px-4 py-2 text-xs font-bold text-rose-500 border border-rose-100 rounded-xl hover:bg-rose-50 transition cursor-pointer">
            Leave
          </button>
        )}
      </div>

      {isJoined && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-blue-600 transition cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            New Discussion
          </button>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-[1px] p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Start a new discussion</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>

            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Discussion title..."
              className="w-full text-sm text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition"
            />
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Write your discussion..."
              rows={5}
              className="w-full resize-none text-sm text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateThread}
                disabled={!newTitle.trim() || !newContent.trim() || creatingThread}
                className="flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-blue-600 transition disabled:opacity-40 cursor-pointer"
              >
                {creatingThread ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Post Discussion
              </button>
            </div>
          </div>
        </div>
      )}

      {threadList.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-10 text-center text-slate-400 font-semibold">
          No discussions in this community yet.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-2 shadow-sm">
          {threadList.map((thread) => (
            <button key={thread.id} onClick={() => handleClickThread(thread.id)}
              className="w-full text-left p-5 hover:bg-slate-50 rounded-2xl transition-colors flex items-start justify-between gap-4 border-b border-slate-100 last:border-b-0 cursor-pointer">
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  {thread.isLocked && (
                    <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-50 border border-amber-100 text-amber-600 px-1.5 py-0.5 rounded">
                      <Lock className="w-2.5 h-2.5" /> Locked
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-extrabold text-slate-800 leading-tight">{thread.title}</h3>
                <p className="text-[11px] text-slate-400 font-semibold">
                  By <strong className="text-slate-500">{thread.author?.name}</strong> · {thread.time}
                </p>
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
