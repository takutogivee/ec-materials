import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { LayoutDashboard, Image as ImageIcon, Users, LogOut, ExternalLink, Settings } from 'lucide-react';
import '../admin.css';

export default function AdminLayout() {
  const navigate = useNavigate();
  
  // 認証チェック
  const isAuthenticated = localStorage.getItem('rakuzai_auth') === 'true';
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('rakuzai_auth');
    navigate('/admin/login');
  };

  const [stats, setStats] = useState({ todayCount: 0, weekCount: 0 });

  useEffect(() => {
    fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, []);

  return (
    <div className="admin-container">
      {/* サイドバー */}
      <aside className="admin-sidebar">
        <div className="admin-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src="/logo.png" alt="ラクザイ" style={{ height: '32px', objectFit: 'contain' }} />
          <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>管理画面</span>
        </div>
        <nav className="admin-nav">
          <NavLink to="/admin" end className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <LayoutDashboard size={20} />
            ダッシュボード
          </NavLink>
          <NavLink to="/admin/assets" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <ImageIcon size={18} />
            素材の管理
          </NavLink>
          <NavLink to="/admin/leads" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Users size={18} />
            獲得したリード
          </NavLink>
        </nav>
        <div className="admin-sidebar-footer">
          <button className="nav-item btn-link" onClick={() => navigate('/')} style={{ marginBottom: '1rem', width: '100%', textAlign: 'left' }}>
            ← フロント画面へ戻る
          </button>
          <button className="nav-item btn-link" onClick={handleLogout} style={{ color: '#ef4444', width: '100%', textAlign: 'left' }}>
            <LogOut size={18} />
            ログアウト
          </button>
        </div>
      </aside>
      
      {/* メインコンテンツ */}
      <main className="admin-main">
        <header className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="admin-page-title">ラクザイ管理画面</h2>
          <div style={{
            display: 'flex', gap: '1rem', background: '#f8f9fa', padding: '0.5rem 1rem', 
            borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.875rem', fontWeight: 600
          }}>
            <div style={{ color: '#64748b' }}>本日のダウンロード: <span style={{ color: '#0f172a', fontSize: '1rem', marginLeft: '4px' }}>{stats.todayCount}</span></div>
            <div style={{ color: '#cbd5e1' }}>|</div>
            <div style={{ color: '#64748b' }}>直近7日間のDL: <span style={{ color: '#0f172a', fontSize: '1rem', marginLeft: '4px' }}>{stats.weekCount}</span></div>
          </div>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
