import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Search, Globe, Check, Users, MessageSquare, ChevronLeft, Loader2 } from 'lucide-react'
import { communities as communitiesApi, type Community, auth } from '../../lib/api'
import CommunityDiscussionsPanel from '../../components/student/CommunityDiscussionsPanel'

export const Route = createFileRoute('/student/browse-communities')({
  component: BrowseCommunities,
})

function BrowseCommunities() {
  const [communityList, setCommunityList] = useState<Community[]>([])
  const [joinedIds, setJoinedIds] = useState<number[]>([])
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'All' | 'Joined' | 'Public'>('All')
  const [loading, setLoading] = useState(true)
  const isLoggedIn = !!auth.currentUser()

  useEffect(() => {
    const load = async () => {
      try {
        const { communities } = await communitiesApi.list()
        setCommunityList(communities)
        if (isLoggedIn) {
          const { communities: joined } = await communitiesApi.myJoined()
          setJoinedIds(joined.map((c) => c.id))
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isLoggedIn])

  const toggleJoin = async (communityId: number) => {
    if (!isLoggedIn) { alert('Please log in first.'); return }
    try {
      if (joinedIds.includes(communityId)) {
        await communitiesApi.leave(communityId)
        setJoinedIds((prev) => prev.filter((id) => id !== communityId))
        setCommunityList((prev) =>
          prev.map((c) => c.id === communityId ? { ...c, membersCount: c.membersCount - 1 } : c)
        )
      } else {
        await communitiesApi.join(communityId)
        setJoinedIds((prev) => [...prev, communityId])
        setCommunityList((prev) =>
          prev.map((c) => c.id === communityId ? { ...c, membersCount: c.membersCount + 1 } : c)
        )
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed')
    }
  }

  const filtered = communityList.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || (filter === 'Joined' ? joinedIds.includes(c.id) : c.tag === 'Public')
    return matchSearch && matchFilter
  })

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
          <ChevronLeft className="w-4 h-4" /> Back to Browse Communities
        </button>
        <CommunityDiscussionsPanel
          communityId={selectedCommunity.id}
          communityTitle={selectedCommunity.title}
          isJoined={joinedIds.includes(selectedCommunity.id)}
          onJoin={() => toggleJoin(selectedCommunity.id)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl font-sans text-slate-800">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Browse Communities</h1>
        <p className="text-slate-500 text-sm mt-1">Discover and join academic groups across Galala University.</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2">
          {(['All', 'Joined', 'Public'] as const).map((tab) => (
            <button key={tab} onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${filter === tab ? 'bg-primary text-white border-transparent shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
              {tab}
            </button>
          ))}
        </div>
        <div className="flex-1 bg-slate-100/80 rounded-2xl px-4 py-2.5 flex items-center gap-2 border border-transparent focus-within:bg-white focus-within:border-slate-200 focus-within:shadow-sm transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input type="text" placeholder="Search communities..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm outline-none placeholder-slate-400 font-semibold w-full" />
        </div>
      </div>

      {/* Community Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((community) => {
          const isJoined = joinedIds.includes(community.id)
          return (
            <div key={community.id} onClick={() => setSelectedCommunity(community)}
              className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group">
              <div className="relative h-36 overflow-hidden">
                <img src={community.imageUrl} alt={community.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md border border-white/20 text-white px-2.5 py-1 rounded-full flex items-center gap-1 text-[10px] font-bold">
                  <Globe className="w-3 h-3" /> {community.tag}
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-extrabold text-slate-800 group-hover:text-primary transition-colors truncate">{community.title}</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">by {community.creator}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); toggleJoin(community.id) }}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${isJoined ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' : 'bg-primary text-white border-transparent hover:bg-blue-600'}`}>
                    {isJoined ? <><Check className="w-3 h-3" /> Joined</> : 'Join'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{community.description}</p>
                <div className="flex items-center gap-3 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold">
                    <Users className="w-3.5 h-3.5 text-slate-400" /> {community.membersCount.toLocaleString()}
                  </div>
                  <div className="w-1 h-1 rounded-full bg-slate-200" />
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" /> {community.discussionsCount}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-10 text-slate-400 font-semibold">No communities found.</div>
      )}
    </div>
  )
}
