import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Globe, ChevronLeft, Loader2, Users } from 'lucide-react'
import { communities as communitiesApi, type Community, auth } from '../../lib/api'
import CommunityDiscussionsPanel from '../../components/student/CommunityDiscussionsPanel'

export const Route = createFileRoute('/student/my-communities')({
  component: MyCommunities,
})

function MyCommunities() {
  const [communityList, setCommunityList] = useState<Community[]>([])
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null)
  const [loading, setLoading] = useState(true)
  const isLoggedIn = !!auth.currentUser()

  useEffect(() => {
    const load = async () => {
      try {
        if (isLoggedIn) {
          const { communities } = await communitiesApi.myJoined()
          setCommunityList(communities)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isLoggedIn])

  const handleLeave = async (communityId: number) => {
    try {
      await communitiesApi.leave(communityId)
      setCommunityList((prev) => prev.filter((c) => c.id !== communityId))
      if (selectedCommunity?.id === communityId) setSelectedCommunity(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to leave')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (selectedCommunity) {
    return (
      <div className="space-y-6 max-w-5xl font-sans text-slate-800">
        <button onClick={() => setSelectedCommunity(null)}
          className="flex items-center gap-1.5 text-sm font-bold text-primary hover:text-blue-600 cursor-pointer">
          <ChevronLeft className="w-4 h-4" /> Back to My Communities
        </button>
        <CommunityDiscussionsPanel
          communityId={selectedCommunity.id}
          communityTitle={selectedCommunity.title}
          isJoined
          onLeave={() => handleLeave(selectedCommunity.id)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl font-sans text-slate-800">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Communities</h1>
        <p className="text-slate-500 text-sm mt-1">Academic groups you've joined.</p>
      </div>

      {communityList.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-10 text-center text-slate-400 font-semibold">
          You haven't joined any communities yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {communityList.map((community) => (
            <div key={community.id}
              className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden hover:border-primary/30 hover:shadow-md transition-all group">
              <div className="relative h-32 overflow-hidden">
                <img src={community.imageUrl} alt={community.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md border border-white/20 text-white px-2.5 py-1 rounded-full flex items-center gap-1 text-[10px] font-bold">
                  <Globe className="w-3 h-3" /> {community.tag}
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-extrabold text-slate-800 truncate">{community.title}</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">by {community.creator}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold">
                  <Users className="w-3.5 h-3.5 text-slate-400" /> {community.membersCount.toLocaleString()} members
                </div>
                <div className="flex gap-2 pt-1 border-t border-slate-100">
                  <button onClick={() => setSelectedCommunity(community)}
                    className="flex-1 py-2 text-xs font-bold bg-primary text-white rounded-xl hover:bg-blue-600 transition cursor-pointer text-center">
                    View Community
                  </button>
                  <button onClick={() => handleLeave(community.id)}
                    className="px-3 py-2 text-xs font-bold text-rose-500 border border-rose-100 rounded-xl hover:bg-rose-50 transition cursor-pointer">
                    Leave
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
