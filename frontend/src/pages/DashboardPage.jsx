import { useState, useEffect } from 'react'
import { 
  Database, Clock, PlusSquare, Play, LogOut, 
  Terminal, CheckCircle2, Trash2, XCircle, Zap, Sparkles, ArrowRight, Copy, Check, Download, Info
} from 'lucide-react'
import api from '../api'

export default function DashboardPage({ onLogout }) {
  const [activeMenu, setActiveMenu] = useState('add_db') 
  const [user, setUser] = useState({ username: 'User', email: 'Loading...', initials: 'U' })

  // DB Connection States
  const [savedConnections, setSavedConnections] = useState([])
  const [connectionId, setConnectionId] = useState(null)
  const [dbName, setDbName] = useState('')
  const [dbUrl, setDbUrl] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [connError, setConnError] = useState(null)

  // Query Execution States
  const [queryText, setQueryText] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [queryResult, setQueryResult] = useState(null)
  const [queryError, setQueryError] = useState(null)

  // History & Copy States
  const [history, setHistory] = useState([])
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await api.get('/me')
        const username = res.data.username || 'User'
        const email = res.data.email || 'user@queryai.com'
        const initials = username.substring(0, 2).toUpperCase()
        setUser({ username, email, initials })
      } catch (e) {
        console.error("Failed to fetch user profile from DB", e)
      }
    }
    fetchUserProfile()
    fetchSavedConnections()
  }, [])

  const fetchSavedConnections = async () => {
    try {
      const res = await api.get('/connections')
      if (res.data.connections) {
        setSavedConnections(res.data.connections)
      }
    } catch (err) {
      console.error("Failed to fetch connections", err)
    }
  }

  const fetchHistory = async () => {
    try {
      const res = await api.get('/history')
      setHistory(res.data.history || [])
    } catch (err) {
      console.error("History fetch failed", err)
    }
  }

  const handleConnectNew = async (e) => {
    e.preventDefault()
    setIsConnecting(true)
    setConnError(null)

    try {
      const res = await api.post('/connections', {
        connection_name: dbName,
        db_url: dbUrl
      })
      setConnectionId(res.data.connection_id)
      fetchSavedConnections() 
      setActiveMenu('query')
    } catch (err) {
      setConnError(err.response?.data?.detail || "Failed to connect to database.")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleSelectExistingConnection = (conn) => {
    setConnectionId(conn.id)
    setDbName(conn.name)
    setActiveMenu('query')
  }

  const handleQuery = async (e) => {
    e.preventDefault()
    if (!queryText.trim()) return

    setIsExecuting(true)
    setQueryError(null)
    setQueryResult(null)

    try {
      const res = await api.post('/query', {
        connection_id: connectionId,
        user_query: queryText
      })
      setQueryResult(res.data)
      fetchHistory() 
    } catch (err) {
      setQueryError(err.response?.data?.detail || "Query execution failed.")
      fetchHistory()
    } finally {
      setIsExecuting(false)
    }
  }

  const handleClear = () => {
    setQueryText('')
    setQueryResult(null)
    setQueryError(null)
  }

  const handleCopyQuery = (id, sqlText) => {
    navigator.clipboard.writeText(sqlText)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleExportCSV = () => {
    if (!queryResult || !Array.isArray(queryResult.results) || queryResult.results.length === 0) return;
    
    const headers = Object.keys(queryResult.results[0]).join(',');
    const rows = queryResult.results.map(row => {
      return Object.values(row).map(val => {
        let stringVal = val !== null ? String(val) : '';
        return `"${stringVal.replace(/"/g, '""')}"`; 
      }).join(',');
    });

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `QueryAI_Export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden selection:bg-blue-500 selection:text-white relative">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.07]"></div>
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-900/20 via-slate-950/90 to-slate-950 pointer-events-none"></div>

      <div className="w-72 bg-slate-900/40 backdrop-blur-2xl border-r border-white/5 flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
        <div className="p-6 border-b border-white/5 flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-xl shadow-lg shadow-blue-500/20">
            <Database className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-black bg-gradient-to-r from-white via-blue-100 to-cyan-400 bg-clip-text text-transparent tracking-tight">
            QueryAI
          </span>
        </div>

        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] py-6 flex flex-col gap-2.5 px-4">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Workspace</p>
          
          <button onClick={() => setActiveMenu('add_db')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer group ${activeMenu === 'add_db' ? 'bg-blue-600/20 border border-blue-500/40 text-blue-300 shadow-[0_0_20px_rgba(37,99,235,0.2)] backdrop-blur-md' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent'}`}>
            <PlusSquare className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeMenu === 'add_db' ? 'text-blue-400' : 'text-slate-500'}`} /> 
            <span className="font-semibold text-sm">Databases</span>
          </button>
          
          <button onClick={() => setActiveMenu('query')} disabled={!connectionId} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${!connectionId ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${activeMenu === 'query' ? 'bg-blue-600/20 border border-blue-500/40 text-blue-300 shadow-[0_0_20px_rgba(37,99,235,0.2)] backdrop-blur-md' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent'}`}>
            <Terminal className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeMenu === 'query' ? 'text-blue-400' : 'text-slate-500'}`} /> 
            <span className="font-semibold text-sm">Query Interface</span>
          </button>
          
          <button onClick={() => { setActiveMenu('history'); fetchHistory(); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${activeMenu === 'history' ? 'bg-blue-600/20 border border-blue-500/40 text-blue-300 shadow-[0_0_20px_rgba(37,99,235,0.2)] backdrop-blur-md' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent'}`}>
            <Clock className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeMenu === 'history' ? 'text-blue-400' : 'text-slate-500'}`} /> 
            <span className="font-semibold text-sm">Query History</span>
          </button>

          {connectionId && (
            <div className="mt-6 p-4 bg-slate-900/40 rounded-2xl border border-white/5 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl transition-all"></div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 relative z-10">Connected Target</p>
              <div className="flex items-center space-x-2.5 relative z-10">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-pulse"></span>
                <span className="text-xs font-bold text-slate-200 truncate">{dbName || 'Active DB'}</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/5 bg-slate-950/20">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/30 border border-white/5 backdrop-blur-md">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center font-bold text-white shadow-md flex-shrink-0 text-sm">
                {user.initials}
              </div>
              <div className="truncate pr-1">
                <p className="text-xs font-bold text-slate-200 truncate">{user.username}</p>
                <p className="text-[11px] text-slate-400 truncate" title={user.email}>{user.email}</p>
              </div>
            </div>
            <button onClick={onLogout} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer flex-shrink-0" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {activeMenu === 'add_db' && (
          <div className="flex-1 p-10 flex flex-col items-center justify-start relative overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="w-full max-w-2xl flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-500 py-10">
              {savedConnections.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">Saved Connections</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedConnections.map((conn) => (
                      <div 
                        key={conn.id} 
                        onClick={() => handleSelectExistingConnection(conn)}
                        className="bg-slate-900/40 backdrop-blur-xl p-5 rounded-2xl border border-white/10 hover:border-blue-500/50 hover:bg-slate-800/60 transition-all cursor-pointer shadow-lg group"
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <Database className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                          <h3 className="font-bold text-slate-200 truncate">{conn.name}</h3>
                        </div>
                        <p className="text-xs text-slate-400">Click to connect and start querying.</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center w-full">
                <hr className="flex-1 border-white/10" />
                <span className="px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Or Add New Target</span>
                <hr className="flex-1 border-white/10" />
              </div>

              <div className="bg-slate-900/30 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-[0_8px_32px_0_rgba(37,99,235,0.15)] relative z-10">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-2xl flex items-center justify-center shadow-inner">
                    <PlusSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">New Connection</h2>
                    <p className="text-xs text-slate-400">Secure schema extraction via AI metadata mapping</p>
                  </div>
                </div>
                
                <form onSubmit={handleConnectNew} className="space-y-5">
                  {connError && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center font-medium backdrop-blur-md">
                      <XCircle className="w-4 h-4 mr-2 flex-shrink-0"/> {connError}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Project Name</label>
                    <input type="text" required value={dbName} onChange={(e) => setDbName(e.target.value)} placeholder="e.g., Production Analytics DB" className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 text-sm transition-all backdrop-blur-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">PostgreSQL URL</label>
                    <input type="text" required value={dbUrl} onChange={(e) => setDbUrl(e.target.value)} placeholder="postgresql://user:password@localhost:5432/dbname" className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 text-sm transition-all font-mono backdrop-blur-sm" />
                  </div>
                  <button type="submit" disabled={isConnecting} className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-3.5 rounded-xl flex items-center justify-center transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                    {isConnecting ? (
                      <span className="flex items-center"><Sparkles className="w-4 h-4 mr-2 animate-spin"/> Analyzing Schema...</span>
                    ) : (
                      <span className="flex items-center">Establish Connection <ArrowRight className="w-4 h-4 ml-2"/></span>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'query' && (
          <div className="flex-1 flex flex-col h-full relative animate-in fade-in duration-300">
            <div className="px-8 py-5 border-b border-white/5 flex justify-between items-center bg-slate-900/30 backdrop-blur-xl z-10">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 shadow-inner">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Natural Language SQL Playground</h2>
                  <p className="text-xs text-slate-400">Type queries in plain English and execute safely</p>
                </div>
              </div>
              <button onClick={handleClear} className="flex items-center text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/20 px-3.5 py-2 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-500/30 backdrop-blur-sm">
                <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Clear Workspace
              </button>
            </div>

            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-8 pb-40 space-y-6">
              {queryError && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl flex items-start shadow-[0_8px_32px_rgba(239,68,68,0.15)] backdrop-blur-md">
                  <XCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-red-400"/>
                  <div>
                    <h4 className="font-bold text-sm">Execution Blocked or Failed</h4>
                    <p className="text-xs mt-1 opacity-90">{queryError}</p>
                  </div>
                </div>
              )}

              {queryResult && (
                <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-500">
                  
                  {/* AI EXPLANATION BOX */}
                  {queryResult.explanation && (
                    <div className="bg-blue-900/10 backdrop-blur-xl p-5 rounded-2xl border border-blue-500/20 shadow-lg flex items-start space-x-4">
                      <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 shrink-0">
                        <Info className="w-5 h-5"/>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-blue-300 mb-1.5 uppercase tracking-wider">AI Explanation</h4>
                        <p className="text-sm text-slate-300 leading-relaxed">
                          {queryResult.explanation}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-900/40 backdrop-blur-2xl p-6 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative group">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center text-emerald-400 font-bold text-xs tracking-wider uppercase">
                        <CheckCircle2 className="w-4 h-4 mr-2"/> Generated SQL Query
                      </div>
                      <button 
                        onClick={() => handleCopyQuery('result', queryResult.sql_executed)}
                        className="flex items-center text-xs font-medium bg-slate-800/50 hover:bg-slate-700/80 text-slate-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer border border-white/10 backdrop-blur-md"
                      >
                        {copiedId === 'result' ? <><Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Copied!</> : <><Copy className="w-3.5 h-3.5 mr-1" /> Copy Query</>}
                      </button>
                    </div>
                    <code className="text-xs font-mono bg-slate-950/80 text-cyan-300 p-4 rounded-xl block overflow-x-auto whitespace-pre-wrap break-words border border-white/5 shadow-inner">
                      {queryResult.sql_executed || 'No SQL generated'}
                    </code>
                  </div>

                  <div className="bg-slate-900/40 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-slate-950/30">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider">Result Output Dataset</h3>
                        <span className="text-[11px] px-2.5 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-full font-mono backdrop-blur-md">
                          {Array.isArray(queryResult.results) ? queryResult.results.length : 0} rows returned
                        </span>
                      </div>
                      
                      <button 
                        onClick={handleExportCSV}
                        disabled={!Array.isArray(queryResult.results) || queryResult.results.length === 0}
                        className="flex items-center text-xs font-bold bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 px-3 py-1.5 rounded-lg transition-all cursor-pointer border border-blue-500/30 backdrop-blur-md disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
                      </button>
                    </div>

                    <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      <table className="min-w-full divide-y divide-white/5">
                        <thead className="bg-slate-950/40">
                          <tr>
                            {Array.isArray(queryResult.results) && queryResult.results.length > 0 ? (
                              Object.keys(queryResult.results[0]).map((key) => (
                                <th key={key} className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                  {key}
                                </th>
                              ))
                            ) : (
                              <th className="px-6 py-3.5 text-left text-xs font-medium text-slate-500">Empty Result Set</th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-xs">
                          {Array.isArray(queryResult.results) && queryResult.results.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                              {Object.values(row).map((val, j) => (
                                <td key={j} className="px-6 py-4 whitespace-nowrap text-slate-300 font-medium">
                                  {val !== null ? String(val) : <span className="text-slate-600 italic">NULL</span>}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              
              {!queryResult && !queryError && (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 py-20 relative z-10">
                  <div className="p-4 bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/5 mb-4 shadow-inner">
                    <Terminal className="w-8 h-8 text-slate-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-400">Ready for your prompt. Type below to query data.</p>
                </div>
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent z-20">
              <form onSubmit={handleQuery} className="max-w-4xl mx-auto flex items-center bg-slate-900/50 backdrop-blur-2xl rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/10 p-2 pl-6 focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <input 
                  type="text" 
                  value={queryText} 
                  onChange={(e) => setQueryText(e.target.value)} 
                  placeholder={isExecuting ? "Executing AI Pipeline..." : "Ask anything e.g. 'Show top 5 active customers'..."} 
                  className="flex-1 bg-transparent border-none outline-none py-3 text-white placeholder-slate-400 text-sm font-medium"
                  disabled={isExecuting}
                />
                <button type="submit" disabled={isExecuting || !queryText.trim()} className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl flex items-center justify-center font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] ml-3 cursor-pointer">
                  {isExecuting ? 'Running...' : <><Play className="w-3.5 h-3.5 mr-1.5 fill-current" /> Execute</>}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeMenu === 'history' && (
          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-10 relative z-10 animate-in fade-in duration-300">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-black text-white tracking-tight mb-2">Query Execution Logs</h2>
              <p className="text-xs text-slate-400 mb-8">Auditing history and status of all past prompts.</p>
              
              <div className="space-y-4">
                {history.map((item) => (
                  <div key={item.id} className="bg-slate-900/40 backdrop-blur-2xl p-5 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:bg-slate-800/40 transition-all flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-slate-100 font-bold text-sm">"{item.user_prompt}"</p>
                      <div className="flex items-center space-x-3 flex-shrink-0">
                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border backdrop-blur-md ${
                          item.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                          item.status === 'BLOCKED' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                          'bg-red-500/20 text-red-300 border-red-500/30'
                        }`}>
                          {item.status}
                        </span>
                        <span className="text-xs font-medium text-slate-400">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="relative group mt-1">
                      <div className="absolute top-2 right-2">
                        <button 
                          onClick={() => handleCopyQuery(item.id, item.generated_sql)}
                          className="flex items-center text-[11px] font-medium bg-slate-800/60 hover:bg-slate-700/80 text-slate-200 px-2.5 py-1 rounded-md transition-all cursor-pointer border border-white/10 shadow-sm backdrop-blur-md"
                        >
                          {copiedId === item.id ? <><Check className="w-3 h-3 mr-1 text-emerald-400" /> Copied</> : <><Copy className="w-3 h-3 mr-1" /> Copy</>}
                        </button>
                      </div>
                      <pre className="text-xs font-mono bg-slate-950/60 text-slate-300 p-3.5 pr-20 rounded-xl border border-white/5 shadow-inner whitespace-pre-wrap break-words">
                        {item.generated_sql || 'No SQL syntax returned'}
                      </pre>
                    </div>
                  </div>
                ))}
                {history.length === 0 && (
                  <div className="text-center py-32 text-slate-500">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium text-slate-400">No query history records found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}