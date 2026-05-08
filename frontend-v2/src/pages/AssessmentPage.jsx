import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Activity, MapPin, ChevronRight, Search } from 'lucide-react';
import locationData from '../assets/location_data.json';

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const API_BASE = VITE_API_URL.endsWith('/') ? VITE_API_URL.slice(0, -1) : VITE_API_URL;

const AssessmentPage = ({ setReport, setVitals }) => {
  const [loading, setLoading] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');
  const navigate = useNavigate();

  const states = Object.keys(locationData);
  const districts = selectedState ? locationData[selectedState] : [];
  
  const filteredDistricts = districts.filter(d => 
    d.toLowerCase().includes(districtSearch.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.target);
    const vitalsPayload = {
      Age: parseFloat(formData.get('age')),
      SystolicBP: parseFloat(formData.get('systolic')),
      DiastolicBP: parseFloat(formData.get('diastolic')),
      BS: parseFloat(formData.get('bs')),
      BodyTemp: parseFloat(formData.get('temp')),
      HeartRate: parseFloat(formData.get('hr'))
    };

    const payload = {
      vitals: vitalsPayload,
      state: selectedState,
      district: selectedDistrict
    };

    try {
      const res = await axios.post(`${API_BASE}/assess`, payload);
      setReport(res.data);
      setVitals(vitalsPayload);
      navigate('/dashboard');
    } catch (err) {
      alert("Assessment failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-3 tracking-tight">Health Analysis</h1>
        <p className="text-slate-500 max-w-lg mx-auto text-sm">Please provide your current vitals and location for a precision risk assessment.</p>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 sm:p-10"
      >
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Vitals Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Activity size={20} />
              </div>
              <h2 className="text-lg font-bold text-slate-700">Clinical Vitals</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { label: 'Age', name: 'age', unit: 'Years', placeholder: 'e.g. 25' },
                { label: 'Blood Sugar', name: 'bs', unit: 'mmol/L', placeholder: 'e.g. 5.5' },
                { label: 'Systolic BP', name: 'systolic', unit: 'mmHg', placeholder: 'e.g. 120' },
                { label: 'Diastolic BP', name: 'diastolic', unit: 'mmHg', placeholder: 'e.g. 80' },
                { label: 'Body Temp', name: 'temp', unit: '°F', placeholder: 'e.g. 98.6' },
                { label: 'Heart Rate', name: 'hr', unit: 'BPM', placeholder: 'e.g. 72' },
              ].map((field) => (
                <div key={field.name} className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">{field.label} ({field.unit})</label>
                  <input 
                    type="number" 
                    step="any"
                    name={field.name} 
                    className="input-field" 
                    placeholder={field.placeholder}
                    required 
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Location Section */}
          <section className="pt-8 border-t border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <MapPin size={20} />
              </div>
              <h2 className="text-lg font-bold text-slate-700">Location Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">State / Union Territory</label>
                <select 
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSelectedDistrict('');
                    setDistrictSearch('');
                  }}
                  className="input-field bg-white cursor-pointer"
                  required
                >
                  <option value="">Select State</option>
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">District</label>
                <div className="relative group">
                  <div className="relative">
                    <Search className="absolute left-3 top-3.5 text-slate-300 group-focus-within:text-indigo-400 transition-colors" size={16} />
                    <input 
                      type="text"
                      placeholder="Search district..."
                      value={districtSearch}
                      onChange={(e) => setDistrictSearch(e.target.value)}
                      disabled={!selectedState}
                      className="input-field pl-10 mb-2 text-sm h-10"
                    />
                  </div>
                  <select 
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="input-field bg-white cursor-pointer"
                    disabled={!selectedState}
                    required
                  >
                    <option value="">Select District</option>
                    {filteredDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {selectedState && filteredDistricts.length === 0 && (
                    <p className="text-[10px] text-rose-400 mt-1">No districts found matching your search.</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-gradient flex items-center justify-center gap-2 group h-14"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span className="text-lg">Analyze Risk Profile</span>
                <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AssessmentPage;

