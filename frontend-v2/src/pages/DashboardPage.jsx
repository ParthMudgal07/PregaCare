import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Heart, 
  MessageSquare, 
  Send, 
  Download, 
  AlertCircle, 
  Stethoscope,
  Activity,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const DashboardPage = ({ report, vitals }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [query, setQuery] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const chatEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!report) {
      navigate('/assess');
    }
  }, [report, navigate]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, chatLoading]);

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

  const downloadPDF = async () => {
    setPdfLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/export-pdf`, {
        report,
        vitals
      }, { responseType: 'blob' });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'PregaCare_Report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };

  if (!report) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Analytics Column */}
      <div className="lg:col-span-5 space-y-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-8 bg-gradient-to-br from-white to-indigo-50/30"
        >
          <div className="flex items-center justify-between mb-10">
            <h3 className="font-bold text-xl text-slate-800">Risk Assessment</h3>
            <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
              report.risk_band.includes('Low') ? 'bg-emerald-100 text-emerald-700' :
              report.risk_band.includes('Mid') ? 'bg-amber-100 text-amber-700' :
              'bg-rose-100 text-rose-700'
            }`}>
              {report.risk_band}
            </div>
          </div>
          
          <div className="flex flex-col items-center mb-10">
             <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Circular Progress (SVG) */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="12"
                    className="text-slate-100"
                  />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r="88"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeDasharray={553}
                    initial={{ strokeDashoffset: 553 }}
                    animate={{ strokeDashoffset: 553 - (553 * report.combined_score) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={
                      report.risk_band.includes('Low') ? 'text-emerald-500' :
                      report.risk_band.includes('Mid') ? 'text-amber-500' :
                      'text-rose-500'
                    }
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-slate-800">{report.combined_score}</span>
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">PregaCare Index</span>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/50 rounded-2xl border border-slate-100 text-center">
              <div className="flex items-center justify-center gap-2 text-indigo-600 mb-1">
                <Activity size={16} />
                <span className="text-2xl font-black">{report.individual_health_score}</span>
              </div>
              <div className="text-[10px] font-bold uppercase text-slate-400">Health Index</div>
            </div>
            <div className="p-4 bg-white/50 rounded-2xl border border-slate-100 text-center">
              <div className="flex items-center justify-center gap-2 text-purple-600 mb-1">
                <MapPin size={16} />
                <span className="text-2xl font-black">{Math.round(report.regional_safety_index * 100)}</span>
              </div>
              <div className="text-[10px] font-bold uppercase text-slate-400">Safety Index</div>
            </div>
          </div>

          <div className="mt-8 p-5 bg-white/80 rounded-2xl border border-slate-100 flex gap-4">
            <AlertCircle className="shrink-0 text-indigo-500" size={24} />
            <p className="text-sm leading-relaxed text-slate-600 font-medium">{report.suggested_action}</p>
          </div>

          <button 
            onClick={downloadPDF}
            disabled={pdfLoading}
            className="w-full mt-8 flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-indigo-100 text-indigo-600 font-bold hover:bg-indigo-50 transition-all disabled:opacity-50"
          >
            {pdfLoading ? (
              <RefreshCw className="animate-spin" size={20} />
            ) : (
              <>
                <Download size={20} />
                Export Medical Report (PDF)
              </>
            )}
          </button>
        </motion.div>

        {/* Location Info */}
        <div className="glass-card p-6 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center">
                <MapPin size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Analysis Location</p>
                <h4 className="font-bold text-slate-700">{report.location}</h4>
              </div>
           </div>
           <button 
            onClick={() => navigate('/assess')}
            className="text-xs font-bold text-indigo-600 hover:underline"
           >
            Change
           </button>
        </div>
      </div>

      {/* Chat Column */}
      <div className="lg:col-span-7 h-[calc(100vh-280px)] min-h-[600px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card h-full flex flex-col overflow-hidden bg-white"
        >
          <div className="p-5 border-b border-slate-100 bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Stethoscope size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">AI Clinical Assistant</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Personalized Insights Live</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setChatHistory([])}
              className="p-2 text-slate-300 hover:text-slate-600 transition-colors"
              title="Clear Chat"
            >
              <RefreshCw size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
            {chatHistory.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-200 rounded-3xl flex items-center justify-center mb-6">
                  <MessageSquare size={40} />
                </div>
                <h4 className="font-bold text-slate-700 mb-2">How can I help you?</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  I have analyzed your {report.risk_band} status. Ask me about your vitals, diet, or local healthcare steps.
                </p>
              </div>
            )}
            
            {chatHistory.map((msg, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] p-5 rounded-[24px] text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none prose prose-slate prose-sm max-w-none'
                }`}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </motion.div>
            ))}
            
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 p-5 rounded-[24px] rounded-bl-none shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-slate-200 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-slate-200 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-slate-200 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleChat} className="p-5 bg-white border-t border-slate-100">
            <div className="relative">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type your health question..."
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-5 pr-14 text-sm focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
              />
              <button 
                type="submit"
                disabled={!query.trim() || chatLoading}
                className="absolute right-2 top-2 w-11 h-11 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50 disabled:grayscale"
              >
                <Send size={20} />
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-400 mt-3 font-medium">
              AI companion is for guidance only. Always consult a doctor for medical emergencies.
            </p>
          </form>
        </motion.div>
      </div>

    </div>
  );
};

export default DashboardPage;
