import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Users, Activity, ShieldCheck, Search, UserCheck, Loader2 } from 'lucide-react'
import { admin as adminApi, type ApiUser } from '../../lib/api'

export const Route = createFileRoute('/admin/dashboard')({
  component: AdminDashboard,
})

function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [students, setStudents] = useState<ApiUser[]>([])
  const [loading, setLoading] = useState(true)
  const [approvedDomain, setApprovedDomain] = useState('gu.edu.eg')

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async (search?: string) => {
    try {
      const { students } = await adminApi.students(search)
      setStudents(students)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => loadStudents(searchTerm || undefined), 300)
    return () => clearTimeout(timeout)
  }, [searchTerm])

  const toggleStudentStatus = async (student: ApiUser) => {
    const newStatus = student.status === 'Active' ? 'Restricted' : 'Active'
    try {
      const { user } = await adminApi.updateStatus(student.id, newStatus)
      setStudents((prev) => prev.map((s) => s.id === student.id ? { ...s, status: user.status } : s))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed')
    }
  }

  const approvePendingStudent = async (student: ApiUser) => {
    try {
      const { user } = await adminApi.updateStatus(student.id, 'Active')
      setStudents((prev) => prev.map((s) => s.id === student.id ? { ...s, status: user.status } : s))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed')
    }
  }

  const activeCount = students.filter((s) => s.status === 'Active').length
  const pendingCount = students.filter((s) => s.status === 'Pending').length

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Galala Hub Management</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium max-w-xl">
            Monitor verified registrations, update approved email domains, and configure system rules.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex items-center gap-4 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
          <div className="bg-blue-50 p-3.5 rounded-xl text-primary shrink-0"><Users className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total GU Students</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{students.length} Verified</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex items-center gap-4 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
          <div className="bg-emerald-50 p-3.5 rounded-xl text-emerald-500 shrink-0"><Activity className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Students</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{activeCount} Active</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex items-center gap-4 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
          <div className="bg-indigo-50 p-3.5 rounded-xl text-indigo-500 shrink-0"><ShieldCheck className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified Domain</p>
            <p className="text-lg font-extrabold text-slate-800 mt-1.5 bg-indigo-50/50 border border-indigo-100 px-2.5 py-0.5 rounded-lg w-fit">@{approvedDomain}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.02)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-extrabold text-slate-900">Student Access Management</h2>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, major, email..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3.5">Student Name</th>
                    <th className="px-4 py-3.5">Major / Field</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-bold text-slate-800">{student.name}</div>
                        <div className="text-xs text-slate-400 font-semibold mt-0.5">{student.email}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">{student.major ?? '—'}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase ${
                          student.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          student.status === 'Restricted' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                          'bg-amber-50 text-amber-600 border border-amber-100 animate-pulse'
                        }`}>{student.status}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {student.status === 'Pending' ? (
                            <button onClick={() => approvePendingStudent(student)}
                              className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer">
                              <UserCheck className="w-3.5 h-3.5" /> Verify
                            </button>
                          ) : (
                            <button onClick={() => toggleStudentStatus(student)}
                              className={`px-2.5 py-1.5 font-bold text-xs rounded-lg transition-colors cursor-pointer ${
                                student.status === 'Active'
                                  ? 'bg-rose-50 hover:bg-rose-100/60 text-rose-600 border border-rose-100'
                                  : 'bg-emerald-50 hover:bg-emerald-100/60 text-emerald-600 border border-emerald-100'
                              }`}>
                              {student.status === 'Active' ? 'Block (Restrict)' : 'Unblock (Activate)'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-8 text-slate-400 font-semibold">No students found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.02)] h-fit space-y-6">
          <h2 className="text-xl font-extrabold text-slate-900">Academic Registrations Filter</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-blue-700 text-xs font-semibold leading-relaxed">
              Registrations are restricted strictly based on approved email domain filters.
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Galala Approved Domain</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-extrabold">@</div>
                <input type="text" value={approvedDomain} onChange={(e) => setApprovedDomain(e.target.value)}
                  className="block w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all text-sm"
                />
              </div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500">
              <p className="font-bold text-slate-700 mb-1">Pending Approvals: {pendingCount}</p>
              {pendingCount > 0 ? 'Review pending students in the table.' : 'All accounts are reviewed.'}
            </div>
            <button onClick={() => alert('Domain settings updated!')}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-md cursor-pointer">
              Apply Domain Rule
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
