import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Database, AlertCircle, ArrowLeft, Sparkles } from 'lucide-react'
import api from "../api.js"

export default function AuthPage({ defaultMode, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(defaultMode === 'login')
  const [formData, setFormData] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      let response;
      if (isLogin) {
        const params = new URLSearchParams()
        params.append('username', formData.username)
        params.append('password', formData.password)
        
        response = await api.post('/login', params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
      } else {
        response = await api.post('/register', {
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
      }
      onAuthSuccess(response.data.access_token)
    } catch (err) {
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail
        if (!isLogin && detail === "Username already registered") {
          setError("User already exists. Redirecting to login...")
          setTimeout(() => { setIsLogin(true); setError(null) }, 2000)
        } else {
          setError(typeof detail === 'string' ? detail : "Invalid credentials.")
        }
      } else {
        setError("Cannot connect to server.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative font-sans overflow-hidden selection:bg-blue-500 selection:text-white">
      
      {/* ================= GLOBAL BACKGROUND ================= */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.07]"></div>
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-900/20 via-slate-950/90 to-slate-950 pointer-events-none"></div>

      {/* Back to Home Button */}
      <Link to="/" className="absolute top-6 left-6 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer z-20 font-medium text-sm">
        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Home
      </Link>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
          {/* LOGO ICON */}
          <div className="p-3.5 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-2xl shadow-lg shadow-blue-500/20 mb-3">
            <Database className="w-10 h-10 text-white" />
          </div>
          {/* LOGO GRADIENT TEXT */}
          <span className="text-4xl font-black bg-gradient-to-r from-white via-blue-100 to-cyan-400 bg-clip-text text-transparent tracking-tight">
            QueryAI
          </span>
        </div>
        <h2 className="mt-4 text-center text-xl font-bold text-slate-300">
          {isLogin ? 'Welcome back to your workspace' : 'Create your AI data analyst account'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
        {/* GLASSMORPHISM FORM CARD */}
        <div className="bg-slate-900/40 backdrop-blur-2xl py-10 px-6 shadow-[0_8px_32px_0_rgba(37,99,235,0.15)] sm:rounded-3xl sm:px-10 border border-white/10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* ERROR ALERT */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 p-4 flex rounded-xl backdrop-blur-md items-center">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <p className="ml-3 text-sm text-red-300 font-medium">{error}</p>
              </div>
            )}

            {/* USERNAME */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Username</label>
              <input type="text" required value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 text-sm transition-all backdrop-blur-sm" 
                placeholder="e.g., john_1234"
              />
            </div>

            {/* EMAIL */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 text-sm transition-all backdrop-blur-sm" 
                  placeholder="example@mail.com"
                />
              </div>
            )}

            {/* PASSWORD */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 text-sm transition-all backdrop-blur-sm" 
                placeholder="••••••••"
              />
            </div>

            {/* ANIMATED GRADIENT SUBMIT BUTTON */}
            <button type="submit" disabled={loading}
              className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2">
              {loading ? (
                <span className="flex items-center"><Sparkles className="w-4 h-4 mr-2 animate-spin"/> Processing...</span>
              ) : (
                isLogin ? 'Login to Dashboard' : 'Create Account'
              )}
            </button>
          </form>

          {/* TOGGLE ACCOUNT TEXT */}
          <div className="mt-8 text-center text-sm text-slate-400 font-medium">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setIsLogin(!isLogin); setError(null); }} className="text-blue-400 hover:text-blue-300 transition-colors font-bold underline-offset-4 hover:underline focus:outline-none cursor-pointer">
              {isLogin ? "Sign up" : "Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}