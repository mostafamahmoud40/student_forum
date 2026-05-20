import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Search, Heart, Globe, Check, ArrowRight } from 'lucide-react'
import { communities as communitiesApi, threads as threadsApi, type Community, type Thread, auth } from '../lib/api'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const navigate = useNavigate()
  const [communityList, setCommunityList] = useState<Community[]>([])
  const [trendingThreads, setTrendingThreads] = useState<Thread[]>([])
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
        setCommunityList(communities.slice(0, 4))

        const { threads } = await threadsApi.list()
        setTrendingThreads(threads.slice(0, 4))

        if (user) {
          const { communities: joined } = await communitiesApi.myJoined()
          setJoinedIds(joined.map((c) => c.id))
        }
      } catch {
        // fallback: show empty
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

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'Computer Science & AI': return 'bg-blue-50 border-blue-100 text-blue-600'
      case 'Medicine & Surgery': return 'bg-rose-50 border-rose-100 text-rose-600'
      case 'Engineering Hub': return 'bg-amber-50 border-amber-100 text-amber-600'
      case 'Dentistry Science': return 'bg-emerald-50 border-emerald-100 text-emerald-600'
      default: return 'bg-slate-50 border-slate-100 text-slate-600'
    }
  }

  const joinedCommunities = communityList.filter((c) => joinedIds.includes(c.id))

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 flex justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 font-sans text-slate-800 space-y-8 text-left">

      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight text-center">
          Community wisdom and support
        </h1>
        <div className="flex gap-3 max-w-xl mx-auto items-center">
          <div className="flex-grow bg-slate-100/80 rounded-2xl px-4 py-3 flex items-center gap-2 border border-transparent focus-within:bg-white focus-within:border-slate-200 focus-within:shadow-sm transition-all duration-200">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input type="text" placeholder="Search community, topics, discussions..."
              className="bg-transparent border-none text-sm placeholder-slate-400 outline-none w-full font-semibold"
            />
          </div>
          <button onClick={() => setIsLikedHeader(!isLikedHeader)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${isLikedHeader ? 'bg-rose-50 border-rose-100 text-rose-500 shadow-sm' : 'bg-slate-100/80 hover:bg-slate-200/50 border-transparent text-slate-500'}`}>
            <Heart className={`w-5 h-5 ${isLikedHeader ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Popular Communities */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-black text-slate-900">Popular Community</h2>
          <Link to="/communities" className="text-xs font-extrabold text-slate-400 hover:text-slate-600">See All</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {communityList.map((community) => {
            const isJoined = joinedIds.includes(community.id)
            return (
              <div key={community.id} onClick={() => handleCommunityClick(community.title)}
                className="relative h-80 rounded-[2.2rem] overflow-hidden border border-slate-200 shadow-sm flex flex-col justify-between p-5 bg-slate-900 cursor-pointer">
                <img src={community.imageUrl} alt={community.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/25 to-black/85 z-10" />
                <div className="relative z-20 self-start">
                  <div className="bg-black/30 backdrop-blur-md text-white border border-white/20 px-3 py-1 rounded-full flex items-center gap-1.5 text-[9px] font-extrabold tracking-wide">
                    <Globe className="w-3.5 h-3.5" />
                    <span>{community.tag}</span>
                  </div>
                </div>
                <div className="relative z-20 space-y-4 text-center">
                  <div className="space-y-1 text-left">
                    <h3 className="text-white text-base font-extrabold tracking-tight drop-shadow-sm leading-tight">{community.title}</h3>
                    <p className="text-slate-300 text-[10px] font-semibold opacity-85">{community.membersCount.toLocaleString()} members</p>
                    <p className="text-slate-200 text-[10px] font-medium leading-relaxed mt-1 opacity-90 line-clamp-2">{community.description}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); toggleJoin(community.id) }}
                    className={`w-full py-2.5 rounded-full font-extrabold text-xs transition-all active:scale-[0.97] cursor-pointer shadow-md ${isJoined ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-none' : 'bg-white hover:bg-slate-50 text-slate-900 border-none'}`}>
                    {isJoined ? <span className="flex items-center justify-center gap-1"><Check className="w-3.5 h-3.5" /><span>Joined ✓</span></span> : <span>Join</span>}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Your Community */}
      {isLoggedIn && joinedCommunities.length > 0 && (
        <div className="space-y-4 border-t border-slate-100 pt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-black text-slate-900">Your Community</h2>
            <Link to="/student/my-communities" className="text-xs font-extrabold text-slate-400 hover:text-slate-600">See All</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      {/* Trending Discussions */}
      <div className="space-y-4 border-t border-slate-100 pt-6">
        <h2 className="text-lg font-black text-slate-900">Trending discussions</h2>
        <div className="bg-white rounded-3xl border border-slate-200/80 p-2">
          {trendingThreads.map((item) => (
            <div key={item.id} onClick={() => handleCommunityClick(item.category)}
              className="group p-5 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-all flex flex-col sm:flex-row justify-between gap-4 rounded-2xl cursor-pointer">
              <div className="space-y-2 min-w-0">
                <span className={`text-[10px] font-bold border px-2.5 py-0.5 rounded-md w-fit ${getCategoryStyles(item.category)}`}>
                  {item.category}
                </span>
                <h3 className="text-sm font-extrabold text-slate-800 group-hover:text-primary transition-colors leading-tight">{item.title}</h3>
                <p className="text-[11px] text-slate-400 font-semibold">
                  Started by <strong className="text-slate-500 font-bold">{item.author.name}</strong> • {item.commentsCount} replies
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-primary text-xs font-bold shrink-0">
                <span>View Forum</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
