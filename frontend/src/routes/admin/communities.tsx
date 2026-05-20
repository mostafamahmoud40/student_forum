import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Globe, X, Users, MessageSquare, Activity, Loader2 } from 'lucide-react'
import { admin as adminApi, type Community } from '../../lib/api'

export const Route = createFileRoute('/admin/communities')({
  component: AdminCommunities,
})

function AdminCommunities() {
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    tag: 'Public',
    description: '',
    imageUrl: '',
    creator: 'Dr. Khaled Salem',
  })

  useEffect(() => {
    loadCommunities()
  }, [])

  const loadCommunities = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL ?? '/api'}/communities`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` },
      })
      const data = await res.json() as { communities: Community[] }
      setCommunities(data.communities)
    } finally {
      setLoading(false)
    }
  }

  const openModal = (community?: Community) => {
    if (community) {
      setEditingId(community.id)
      setFormData({ title: community.title, tag: community.tag, description: community.description, imageUrl: community.imageUrl, creator: community.creator })
    } else {
      setEditingId(null)
      setFormData({ title: '', tag: 'Public', description: '', imageUrl: '', creator: 'Dr. Khaled Salem' })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => setIsModalOpen(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        const { community } = await adminApi.updateCommunity(editingId, formData)
        setCommunities((prev) => prev.map((c) => c.id === editingId ? community : c))
      } else {
        const { community } = await adminApi.createCommunity(formData)
        setCommunities((prev) => [...prev, community])
      }
      closeModal()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this community?')) return
    try {
      await adminApi.deleteCommunity(id)
      setCommunities((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manage Communities</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Create, edit, or delete academic communities.</p>
        </div>
        <button onClick={() => openModal()}
          className="bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer">
          <Plus className="w-4 h-4" /> Create Community
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {communities.map((community) => (
          <div key={community.id} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm flex flex-col group">
            <div className="relative h-40 w-full shrink-0">
              <img src={community.imageUrl || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600'} alt={community.title}
                className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md border border-white/20 text-white px-2.5 py-1 rounded-full flex items-center gap-1 text-[10px] font-extrabold">
                <Globe className="w-3 h-3" /> <span>{community.tag}</span>
              </div>
              <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openModal(community)}
                  className="p-1.5 bg-white/20 backdrop-blur-md hover:bg-white/40 border border-white/30 text-white rounded-lg transition-colors cursor-pointer">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(community.id)}
                  className="p-1.5 bg-rose-500/80 backdrop-blur-md hover:bg-rose-600 border border-rose-500/50 text-white rounded-lg transition-colors cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute bottom-3 left-4 right-4">
                <h3 className="text-lg font-black text-white truncate drop-shadow-md">{community.title}</h3>
              </div>
            </div>

            <div className="p-4 flex flex-col flex-grow">
              <p className="text-xs font-bold text-slate-500 mb-2">Created by {community.creator}</p>
              <p className="text-slate-600 text-sm font-medium line-clamp-2 leading-relaxed flex-grow">{community.description}</p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1" title="Members">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-bold text-slate-700">{community.membersCount}</span>
                </div>
                <div className="flex items-center gap-1" title="Discussions">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-bold text-slate-700">{community.discussionsCount}</span>
                </div>
                <div className="flex items-center gap-1" title="Interactions">
                  <Activity className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-bold text-slate-700">{community.interactionsCount}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button onClick={closeModal} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-black text-slate-900 mb-6">{editingId ? 'Edit Community' : 'Create Community'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {(['title', 'imageUrl', 'creator'] as const).map((field) => (
                <div key={field}>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 capitalize">{field === 'imageUrl' ? 'Image URL' : field}</label>
                  <input required={field !== 'imageUrl'} type={field === 'imageUrl' ? 'url' : 'text'}
                    value={formData[field]} onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    placeholder={field === 'imageUrl' ? 'https://...' : ''}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-slate-700"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tag</label>
                <select value={formData.tag} onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-slate-700">
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                  <option value="Restricted">Restricted</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                <textarea required rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-slate-700"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-blue-600 rounded-xl shadow-md transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Save Changes' : 'Create Community'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
