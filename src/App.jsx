import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Home from './pages/Home.jsx';
import Terms from './pages/Terms.jsx';
import AdminLayout from './admin/AdminLayout.jsx';
import Dashboard from './admin/Dashboard.jsx';
import AssetManager from './admin/AssetManager.jsx';
import LeadManager from './admin/LeadManager.jsx';
import AdminLogin from './admin/AdminLogin.jsx';

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          {/* パブリックサイト (ストアフロント) */}
          <Route path="/" element={<Home />} />
          <Route path="/terms" element={<Terms />} />
          
          {/* 管理画面ログイン (Layout外) */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* 管理画面 (Admin) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="assets" element={<AssetManager />} />
            <Route path="leads" element={<LeadManager />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
