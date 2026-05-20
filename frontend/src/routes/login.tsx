import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react'
import { auth } from '../lib/api'

export const Route = createFileRoute('/login')({
  component: Login,
})

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.')
      return
    }

    setIsLoading(true)
    try {
      const { token, user } = await auth.login(email, password)
      auth.saveSession(token, user)
      setSuccessMessage('Logged in successfully! Redirecting...')
      setTimeout(() => {
        if (user.role === 'admin') navigate({ to: '/admin/dashboard' })
        else navigate({ to: '/student/my-communities' })
      }, 800)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex bg-slate-50 overflow-hidden font-sans">
      {/* Left Side: Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white z-10">
        <div className="mx-auto w-full max-w-md">
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
            <h2 className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back to <span className="text-primary">StudentHub</span>
            </h2>
            <p className="mt-2 text-sm text-slate-500 font-medium">
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold text-primary hover:text-blue-700 transition-colors duration-200">
                Sign up for free
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-5" dir="ltr">
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

              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-bold text-slate-700">
                  University Email Address
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    id="email" name="email" type="email" autoComplete="email" required
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="username@gu.edu.eg"
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200 text-left font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="block text-sm font-bold text-slate-700">Password</label>
                  <a href="#" className="text-xs font-semibold text-primary hover:text-blue-700 transition-colors">Forgot password?</a>
                </div>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    id="password" name="password" type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password" required
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200 text-left font-medium"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input id="remember-me" name="remember-me" type="checkbox"
                  checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary/20 border-slate-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="text-sm text-slate-600 font-semibold cursor-pointer select-none">
                  Remember me on this device
                </label>
              </div>

              <button type="submit" disabled={isLoading}
                className="relative w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-base font-bold text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-200 disabled:opacity-50 active:scale-[0.99] cursor-pointer">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Verifying...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </button>
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
          <div className="relative z-10 w-full flex-1 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 group">
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
