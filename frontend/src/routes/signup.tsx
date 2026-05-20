import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { GraduationCap, Mail, Lock, User, BookOpen, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react'
import { auth } from '../lib/api'

export const Route = createFileRoute('/signup')({
  component: Signup,
})

function Signup() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [major, setMajor] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!name || !email || !major || !password || !confirmPassword) {
      setErrorMessage('Please fill in all the required fields.')
      return
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.')
      return
    }
    if (!agreeTerms) {
      setErrorMessage('You must agree to the Terms of Service & Privacy Policy.')
      return
    }

    setIsLoading(true)
    try {
      const { token, user } = await auth.register(name, email, major, password)
      auth.saveSession(token, user)
      setSuccessMessage('Account created successfully! Welcome to StudentHub.')
      setTimeout(() => navigate({ to: '/student/my-communities' }), 800)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex bg-slate-50 overflow-hidden font-sans">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white z-10 overflow-y-auto">
        <div className="mx-auto w-full max-w-lg">
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center gap-2 text-primary font-bold text-2xl">
              <GraduationCap className="w-10 h-10 text-primary" />
              <span>StudentHub</span>
            </div>
          </div>

          <div className="text-left">
            <span className="text-xs font-bold text-primary tracking-widest uppercase bg-blue-50 px-3 py-1 rounded-full">
              Galala University
            </span>
            <h2 className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">Create your account</h2>
            <p className="mt-2 text-sm text-slate-500 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary hover:text-blue-700 transition-colors duration-200">Sign In</Link>
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-4" dir="ltr">
              {errorMessage && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl text-sm font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
              {successMessage && (
                <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 rounded-xl text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1.5">
                <label htmlFor="name" className="block text-sm font-bold text-slate-700">Full Name</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <User className="h-5 w-5" />
                  </div>
                  <input id="name" name="name" type="text" required value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200 font-medium"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-bold text-slate-700">Galala University Email</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input id="email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="username@gu.edu.eg"
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200 text-left font-medium"
                  />
                </div>
              </div>

              {/* Major */}
              <div className="space-y-1.5">
                <label htmlFor="major" className="block text-sm font-bold text-slate-700">Major / Field of Study</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <select id="major" name="major" required value={major} onChange={(e) => setMajor(e.target.value)}
                    className="block w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200 font-medium cursor-pointer appearance-none">
                    <option value="" disabled>Select your Major</option>
                    <option value="Computer Science">Computer Science & AI</option>
                    <option value="Medicine">Medicine & Surgery</option>
                    <option value="Engineering">Engineering Hub</option>
                    <option value="Dentistry">Dentistry Science</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Business">Business Administration</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="password" className="block text-sm font-bold text-slate-700">Password</label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input id="password" name="password" type={showPassword ? 'text' : 'password'} required
                      value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                      className="block w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200 text-left font-medium"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="confirmPassword" className="block text-sm font-bold text-slate-700">Confirm Password</label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required
                      value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••"
                      className="block w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200 text-left font-medium"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-1.5">
                <input id="agree-terms" name="agree-terms" type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary/20 border-slate-300 rounded cursor-pointer mt-1" />
                <label htmlFor="agree-terms" className="text-sm text-slate-600 leading-snug cursor-pointer select-none font-medium">
                  I agree to the{' '}
                  <a href="#" className="font-semibold text-primary hover:text-blue-700 transition-colors">Terms of Service</a>{' '}
                  and{' '}
                  <a href="#" className="font-semibold text-primary hover:text-blue-700 transition-colors">Privacy Policy</a>{' '}
                  of StudentHub.
                </label>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={isLoading}
                  className="relative w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-base font-bold text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-200 disabled:opacity-50 active:scale-[0.99] cursor-pointer">
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Create Account</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8 bg-slate-50 border-l border-slate-100">
        <div className="w-full h-full max-w-xl bg-slate-100/40 border border-slate-200/50 rounded-[2.5rem] p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-10 left-10 w-24 h-24 rounded-full bg-primary/5 blur-xl" />
          <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-primary/10 blur-2xl" />
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">StudentHub Community</span>
            <span className="text-xs font-bold text-primary tracking-widest uppercase bg-blue-50 px-2.5 py-1 rounded-lg">GU Exclusive</span>
          </div>
          <div className="relative z-10 w-full h-[70%] rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 group">
            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80"
              alt="Students studying together" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          </div>
          <div className="relative z-10 text-center border-t border-slate-200/60 pt-6">
            <div className="flex items-center justify-center gap-2 text-slate-900 font-bold text-lg">
              <GraduationCap className="w-6 h-6 text-primary" />
              <span>StudentHub</span>
            </div>
            <p className="text-slate-400 text-xs mt-1">Galala University Official Community Portal • © {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
