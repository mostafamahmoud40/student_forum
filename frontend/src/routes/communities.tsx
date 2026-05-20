import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Search, Heart, Globe, Check, Users, MessageSquare, Activity } from 'lucide-react'
import { communities as communitiesApi, type Community, auth } from '../lib/api'

export const Route = createFileRoute('/communities')({
  component: Communities,
})

function Communities() {
  const navigate = useNavigate()
  const [communityList, setCommunityList] = useState<Community[]>([])
  const [joinedIds, setJoinedIds] = useState<number[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLikedHeader, setIsLikedHeader] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = auth.currentUser()
    setIsLoggedIn(!!user)
    const load = async () => {
      try {
        const { communities } = await communitiesApi.list()
        setCommunityList(communities)
        if (user) {
          const { communities: joined } = await communitiesApi.myJoined()
          setJoinedIds(joined.map((c) => c.id))
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const toggleJoin = async (id: number) => {
    if (!isLoggedIn) {
      alert('Please log in to join academic communities!')
      navigate({ to: '/login' })
      return
    }
    try {
      if (joinedIds.includes(id)) {
        await communitiesApi.leave(id)
        setJoinedIds((prev) => prev.filter((cid) => cid !== id))
        setCommunityList((prev) => prev.map((c) => c.id === id ? { ...c, membersCount: c.membersCount - 1 } : c))
      } else {
        await communitiesApi.join(id)
        setJoinedIds((prev) => [...prev, id])
        setCommunityList((prev) => prev.map((c) => c.id === id ? { ...c, membersCount: c.membersCount + 1 } : c))
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed')
    }
  }

  const handleCommunityClick = (title: string) => {
    localStorage.setItem('selectedCategory', title)
    navigate({ to: '/discussions' })
  }

  const joinedCommunities = communityList.filter((c) => joinedIds.includes(c.id))

  if (loading) {
    return <div className="max-w-6xl mx-auto px-4 py-16 flex justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 font-sans text-slate-800 space-y-8 text-left">

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Academic Communities</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">Discover, join, and interact with academic groups across all departments.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <select className="w-full sm:w-auto bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-slate-600 cursor-pointer shadow-sm">
            <option value="">All Categories</option>
            <option>Computer Science & AI</option>
            <option>Medicine & Surgery</option>
            <option>Engineering Hub</option>
            <option>Dentistry Science</option>
          </select>
          <div className="w-full sm:w-72 bg-slate-100/80 rounded-2xl px-4 py-3 flex items-center gap-2 border border-transparent focus-within:bg-white focus-within:border-slate-200 focus-within:shadow-sm transition-all duration-200">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input type="text" placeholder="Search communities..."
              className="bg-transparent border-none text-sm placeholder-slate-400 outline-none w-full font-semibold" />
          </div>
          <button onClick={() => setIsLikedHeader(!isLikedHeader)}
            className={`shrink-0 w-full sm:w-auto p-3.5 rounded-2xl border transition-all cursor-pointer flex justify-center items-center ${isLikedHeader ? 'bg-rose-50 border-rose-100 text-rose-500 shadow-sm' : 'bg-slate-100/80 hover:bg-slate-200/50 border-transparent text-slate-500'}`}>
            <Heart className={`w-5 h-5 ${isLikedHeader ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-900">All Communities</h2>
        <div className="flex flex-col gap-4">
          {communityList.map((community) => {
            const isJoined = joinedIds.includes(community.id)
            return (
              <div key={community.id} onClick={() => handleCommunityClick(community.title)}
                className="bg-white border border-slate-200/80 rounded-[2rem] overflow-hidden flex flex-col sm:flex-row hover:border-primary/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all cursor-pointer group">
                <div className="relative w-full sm:w-64 h-48 sm:h-auto shrink-0">
                  <img src={community.imageUrl} alt={community.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent sm:hidden" />
                  <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md border border-white/20 text-white px-3 py-1 rounded-full flex items-center gap-1.5 text-[10px] font-extrabold shadow-sm">
                    <Globe className="w-3.5 h-3.5" /><span>{community.tag}</span>
                  </div>
                </div>
                <div className="p-5 sm:p-6 flex flex-col justify-between flex-grow min-w-0">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="text-left flex-grow min-w-0">
                      <h3 className="text-lg font-extrabold text-slate-800 group-hover:text-primary transition-colors truncate">{community.title}</h3>
                      <p className="text-slate-500 text-[11px] font-bold mt-0.5">Created by <span className="text-slate-700">{community.creator}</span></p>
                      <p className="text-slate-600 text-xs font-medium line-clamp-2 mt-2.5 leading-relaxed max-w-2xl">{community.description}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); toggleJoin(community.id) }}
                      className={`shrink-0 w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 ${isJoined ? 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 shadow-sm' : 'bg-primary text-white border border-transparent hover:bg-blue-600 shadow-sm hover:shadow-md'}`}>
                      {isJoined ? <><Check className="w-4 h-4 text-emerald-500" /><span>Joined</span></> : <span>Join Community</span>}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-5 mt-5 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-1.5"><Users className="w-4 h-4 text-slate-400" /><span className="text-slate-800 font-bold text-sm">{community.membersCount.toLocaleString()}</span><span className="text-slate-500 text-xs font-medium">Members</span></div>
                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                    <div className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4 text-slate-400" /><span className="text-slate-800 font-bold text-sm">{community.discussionsCount.toLocaleString()}</span><span className="text-slate-500 text-xs font-medium">Discussions</span></div>
                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                    <div className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-slate-400" /><span className="text-slate-800 font-bold text-sm">{(community.interactionsCount / 1000).toFixed(1)}k</span><span className="text-slate-500 text-xs font-medium">Interactions</span></div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {isLoggedIn && joinedCommunities.length > 0 && (
        <div className="space-y-4 border-t border-slate-100 pt-6">
          <h2 className="text-lg font-black text-slate-900">Your Communities</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {joinedCommunities.map((community) => (
              <div key={community.id} onClick={() => handleCommunityClick(community.title)}
                className="bg-slate-50 border border-slate-200/50 rounded-3xl p-4 flex items-center justify-between hover:bg-white hover:border-slate-200 transition-all shadow-sm cursor-pointer">
                <div className="flex items-center gap-3">
                  <img src={community.avatarUrl ?? `https://i.pravatar.cc/100?img=${community.id}`} alt={community.title}
                    className="w-10 h-10 rounded-full border border-white shadow-sm object-cover" />
                  <div className="text-left">
                    <h4 className="text-sm font-extrabold text-slate-800">{community.title}</h4>
                    <p className="text-[11px] text-slate-400 font-semibold">{community.membersCount.toLocaleString()} members</p>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); toggleJoin(community.id) }}
                  className="text-[10px] font-extrabold text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-rose-100 transition-all cursor-pointer">
                  Leave
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
