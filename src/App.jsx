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
import BlogManager from './admin/BlogManager.jsx';

import { AuthProvider } from './contexts/AuthContext.jsx';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import BlogList from './pages/BlogList.jsx';
import BlogDetail from './pages/BlogDetail.jsx';
import MyPage from './pages/MyPage.jsx';

function App() {
  return (
    <AuthProvider>
      <HelmetProvider>
        <BrowserRouter>
          <Routes>
            {/* パブリックサイト (ストアフロント) */}
            <Route path="/" element={<Home />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/blogs" element={<BlogList />} />
            <Route path="/blogs/:id" element={<BlogDetail />} />
            <Route path="/mypage" element={<MyPage />} />
            
            {/* 管理画面ログイン (Layout外) */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* 管理画面 (Admin) */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="assets" element={<AssetManager />} />
              <Route path="leads" element={<LeadManager />} />
              <Route path="blogs" element={<BlogManager />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </HelmetProvider>
    </AuthProvider>
  );
}

export default App;
