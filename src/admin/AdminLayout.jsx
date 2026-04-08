import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { LayoutDashboard, Image as ImageIcon, Users, LogOut, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import '../admin.css';

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  
  const [stats, setStats] = useState({ todayCount: 0, weekCount: 0 });

  useEffect(() => {
    // loading中や未認証の場合はAPIを叩かない
    if (loading || (!user && !localStorage.getItem('rakuzai_auth'))) return;
    
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, [loading, user]);

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  // 管理者権限チェック（もしくは、古い方式での認証はフォールバックとして残してお祈りするか... いいえ、今回は新方式に統一します）
  // ※ もし新規登録時の最初のユーザーなら自動的に admin になっています。
  const isAdmin = user && user.role === 'admin';
  const isOldAuth = localStorage.getItem('rakuzai_auth') === 'true'; // 移行用

  if (!isAdmin && !isOldAuth) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('rakuzai_auth');
    logout();
  };

  return (
    <div className="admin-container">
      {/* サイドバー */}
      <aside className="admin-sidebar">
        <div className="admin-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '100px' }}>
          <img src="/logo.png" alt="ラクザイ" style={{ height: '70px', objectFit: 'contain', padding: '15px 0', filter: 'brightness(0) invert(1)' }} />
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
          <NavLink to="/admin/blogs" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <BookOpen size={18} />
            ブログ記事の管理
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
