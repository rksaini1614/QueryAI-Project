import { Link } from 'react-router-dom'
import { TypeAnimation } from 'react-type-animation'
import { Database, Zap, Shield, ChevronRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-hidden selection:bg-blue-500 selection:text-white">
      
      {/* ================= GLOBAL BACKGROUND ================= */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.07] pointer-events-none"></div>
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-900/20 via-slate-950/90 to-slate-950 pointer-events-none"></div>

      {/* ================= NAVBAR ================= */}
      <nav className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-3">
          {/* LOGO ICON */}
          <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-xl shadow-lg shadow-blue-500/20">
            <Database className="w-6 h-6 text-white" />
          </div>
          {/* GRADIENT LOGO TEXT */}
          <span className="text-3xl font-black bg-gradient-to-r from-white via-blue-100 to-cyan-400 bg-clip-text text-transparent tracking-tight">
            QueryAI
          </span>
        </div>
        <div className="space-x-5 flex items-center">
          <Link to="/login" className="text-slate-300 hover:text-white font-medium transition-colors">
            Login
          </Link>
          <Link to="/register" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-6 py-2.5 rounded-xl font-bold shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] transition-all">
            Get Started
          </Link>
        </div>
      </nav>

      {/* ================= HERO SECTION ================= */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 mt-12 mb-20 animate-in fade-in zoom-in-95 duration-700">
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-8 drop-shadow-2xl">
          Chat with your Database. <br className="hidden md:block" />
          
          {/* GRADIENT TYPING TEXT */}
          <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent block mt-4 h-20">
            <TypeAnimation
              sequence={[
                'Talk in plain English.',
                2000,
                'Generate SQL instantly.',
                2000,
                'Analyze data faster.',
                2000,
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
            />
          </span>
        </h1>
        <p className="mt-2 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 font-medium">
          Stop struggling with complex SQL syntax. Connect your database, ask questions naturally, and let our AI handle the heavy lifting.
        </p>
        
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-5">
          <Link to="/register" className="flex items-center justify-center px-8 py-3.5 text-base font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] hover:-translate-y-1 transition-all duration-300 md:py-4 md:text-lg">
            Start Querying Free <ChevronRight className="ml-2 w-5 h-5" />
          </Link>
          <Link to="/login" className="flex items-center justify-center px-8 py-3.5 border border-white/10 text-base font-bold rounded-xl text-slate-200 bg-slate-900/50 backdrop-blur-md hover:bg-slate-800/80 hover:border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 md:py-4 md:text-lg">
            Login to Dashboard
          </Link>
        </div>
      </main>

      {/* ================= HOW IT WORKS SECTION ================= */}
      <section className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">How QueryAI Works</h2>
            <p className="mt-4 text-lg text-slate-400 font-medium">Three simple steps to unlock your data.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 Card */}
            <div className="bg-slate-900/40 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 hover:border-blue-500/30 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.15)] hover:-translate-y-2 transition-all duration-300 group cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
              <div className="w-14 h-14 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-500/30 transition-all duration-300 shadow-inner relative z-10">
                <Database className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-200 mb-3 group-hover:text-blue-300 transition-colors relative z-10">1. Connect Database</h3>
              <p className="text-slate-400 text-sm leading-relaxed relative z-10">
                Securely link your PostgreSQL database. We automatically extract your schema without touching your actual data.
              </p>
            </div>

            {/* Step 2 Card */}
            <div className="bg-slate-900/40 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 hover:border-blue-500/30 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.15)] hover:-translate-y-2 transition-all duration-300 group cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all"></div>
              <div className="w-14 h-14 bg-amber-500/20 border border-amber-500/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-amber-500/30 transition-all duration-300 shadow-inner relative z-10">
                <Zap className="w-7 h-7 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-200 mb-3 group-hover:text-amber-300 transition-colors relative z-10">2. Ask in English</h3>
              <p className="text-slate-400 text-sm leading-relaxed relative z-10">
                Type your request just like you're talking to a data analyst. "Show me the top 5 users who signed up this week."
              </p>
            </div>

            {/* Step 3 Card */}
            <div className="bg-slate-900/40 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 hover:border-emerald-500/30 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:-translate-y-2 transition-all duration-300 group cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all"></div>
              <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500/30 transition-all duration-300 shadow-inner relative z-10">
                <Shield className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-200 mb-3 group-hover:text-emerald-300 transition-colors relative z-10">3. Get Results</h3>
              <p className="text-slate-400 text-sm leading-relaxed relative z-10">
                Our AI generates safe, optimized SQL, executes it, and returns the results in a clean, readable table format instantly.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="relative z-10 bg-slate-950/50 backdrop-blur-md border-t border-white/5 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="p-1.5 bg-blue-600/20 rounded-lg">
              <Database className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-xl font-bold text-slate-200 tracking-tight">QueryAI</span>
          </div>
          <div className="text-slate-500 text-sm font-medium text-center md:text-left">
            © {new Date().getFullYear()} QueryAI. Built for next-generation data analysis.
          </div>
        </div>
      </footer>
    </div>
  )
}