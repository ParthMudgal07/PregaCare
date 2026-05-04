import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import AssessmentPage from './pages/AssessmentPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  const [user, setUser] = useState(null);
  const [report, setReport] = useState(null);
  const [vitals, setVitals] = useState(null);

  return (
    <BrowserRouter>
      <Layout user={user} setUser={setUser}>
        <Routes>
          <Route 
            path="/" 
            element={!user ? <LoginPage setUser={setUser} /> : <Navigate to="/assess" />} 
          />
          <Route 
            path="/assess" 
            element={user ? <AssessmentPage setReport={setReport} setVitals={setVitals} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/dashboard" 
            element={user && report ? <DashboardPage report={report} vitals={vitals} /> : <Navigate to="/assess" />} 
          />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
