import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Heart, 
  Activity, 
  MapPin, 
  ShieldCheck, 
  Send, 
  MessageSquare, 
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Stethoscope
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

// Dynamic API Base URL: Uses environment variable if available, else fallbacks to localhost
const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function App() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [query, setQuery] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, chatLoading]);

  const handleAssess = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const payload = {
      vitals: {
        Age: parseFloat(formData.get('age')),
        SystolicBP: parseFloat(formData.get('systolic')),
        DiastolicBP: parseFloat(formData.get('diastolic')),
        BS: parseFloat(formData.get('bs')),
        BodyTemp: parseFloat(formData.get('temp')),
        HeartRate: parseFloat(formData.get('hr'))
      },
      district: formData.get('district'),
      state: formData.get('state')
    };

    try {
      const res = await axios.post(`${API_BASE}/assess`, payload);
      setReport(res.data);
    } catch (err) {
      alert("Assessment failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!query.trim() || !report) return;

    const userMsg = { role: 'user', content: query };
    setChatHistory(prev => [...prev, userMsg]);
    setQuery('');
    setChatLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/chat`, {
        user_query: query,
        assessment_report: report,
        chat_history: chatHistory
      });
      setChatHistory(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting." }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-['Outfit']">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
        <div className="max-w-5xl mx-auto glass-card px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
              <Heart size={24} fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight">PregaCare <span className="text-indigo-600">AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
            <a href="#" className="text-indigo-600">Home</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Assessment</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Reports</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Community</a>
          </div>
          <button className="bg-indigo-50 text-indigo-600 px-5 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-100 transition-colors">
            Sign In
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto pt-32 pb-20 px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 tracking-tight">Your Personal <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Maternal Companion</span></h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">AI-powered risk assessment and clinical guidance, personalized for your unique journey.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form Section */}
          <section className="lg:col-span-7">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <Activity size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Health Synchronization</h2>
                  <p className="text-sm text-slate-500">Sync your latest vitals for a precision report</p>
                </div>
              </div>

              <form onSubmit={handleAssess} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Age</label>
                    <input type="number" name="age" className="input-field" placeholder="Years" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Blood Sugar (mmol/L)</label>
                    <input type="number" step="0.1" name="bs" className="input-field" placeholder="Level" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Systolic BP</label>
                    <input type="number" name="systolic" className="input-field" placeholder="mmHg" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Diastolic BP</label>
                    <input type="number" name="diastolic" className="input-field" placeholder="mmHg" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Body Temp (°F)</label>
                    <input type="number" step="0.1" name="temp" className="input-field" placeholder="Degrees" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Heart Rate (BPM)</label>
                    <input type="number" name="hr" className="input-field" placeholder="BPM" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">State</label>
                    <input type="text" name="state" className="input-field" placeholder="e.g. Gujarat" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">District</label>
                    <input type="text" name="district" className="input-field" placeholder="e.g. Navsari" required />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full btn-gradient flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Generate Risk Analysis
                      <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </section>

          {/* Report Section */}
          <aside className="lg:col-span-5 space-y-8">
            <AnimatePresence mode="wait">
              {report ? (
                <motion.div
                  key="report"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  {/* Score Card */}
                  <div className="glass-card p-8 bg-gradient-to-br from-white to-indigo-50/30">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="font-bold text-lg">Integrated Risk</h3>
                      <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
                        report.risk_band.includes('Low') ? 'bg-emerald-100 text-emerald-700' :
                        report.risk_band.includes('Mid') ? 'bg-amber-100 text-amber-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {report.risk_band}
                      </div>
                    </div>
                    
                    <div className="flex items-end justify-between gap-4">
                      <div className="text-center flex-1">
                        <div className="text-4xl font-black text-indigo-600 mb-1">{report.combined_score}</div>
                        <div className="text-[10px] font-bold uppercase text-slate-400">Total Index</div>
                      </div>
                      <div className="w-px h-10 bg-slate-200" />
                      <div className="text-center flex-1">
                        <div className="text-4xl font-black text-slate-700 mb-1">{report.individual_health_score}</div>
                        <div className="text-[10px] font-bold uppercase text-slate-400">Health</div>
                      </div>
                      <div className="w-px h-10 bg-slate-200" />
                      <div className="text-center flex-1">
                        <div className="text-4xl font-black text-slate-700 mb-1">{report.regional_safety_index}</div>
                        <div className="text-[10px] font-bold uppercase text-slate-400">Safety</div>
                      </div>
                    </div>

                    <div className="mt-8 p-4 bg-white/50 rounded-2xl border border-slate-100 flex gap-3">
                      <AlertCircle className="shrink-0 text-indigo-500" size={20} />
                      <p className="text-sm leading-relaxed text-slate-600">{report.suggested_action}</p>
                    </div>
                  </div>

                  {/* Chat Section */}
                  <div className="glass-card h-[500px] flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-white/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-sm font-bold">Live AI Assistant</span>
                      </div>
                      <Stethoscope size={18} className="text-indigo-400" />
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {chatHistory.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-50 grayscale">
                          <MessageSquare size={48} className="mb-4 text-indigo-200" />
                          <p className="text-sm">I've analyzed your report.<br/>Ask me anything about your vitals.</p>
                        </div>
                      )}
                      {chatHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-4 rounded-[20px] text-sm leading-relaxed ${
                            msg.role === 'user' 
                              ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-100' 
                              : 'bg-slate-100 text-slate-700 rounded-bl-none prose prose-slate prose-sm'
                          }`}>
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-slate-100 p-4 rounded-[20px] rounded-bl-none">
                            <div className="flex gap-1">
                              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleChat} className="p-4 bg-white border-t border-slate-100">
                      <div className="relative">
                        <input 
                          type="text" 
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Ask about your health..."
                          className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-indigo-500/10 transition-all"
                        />
                        <button 
                          type="submit"
                          className="absolute right-2 top-1.5 w-9 h-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center p-12 glass-card border-dashed border-2"
                >
                  <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6 text-slate-400">
                    <ShieldCheck size={40} />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Sync Data to Begin</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">Fill out the clinical vitals on the left to generate your personalized health insight.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </aside>

        </div>
      </main>

      <footer className="max-w-5xl mx-auto py-12 px-4 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-400 text-sm">
        <div className="flex items-center gap-2 font-bold text-slate-600">
          <Heart size={16} fill="currentColor" />
          PregaCare AI
        </div>
        <div className="flex gap-8">
          <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Security</a>
        </div>
        <div>© 2026 PregaCare Technologies India.</div>
      </footer>
    </div>
  );
}

export default App;
