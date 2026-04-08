import React, { useState } from 'react';
import { Building2, TrendingUp, MonitorPlay, MessageCircle, ExternalLink, BookOpen, LogIn, LogOut, User, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Header({ likedCount }) {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="global-header" style={{ background: '#000000', color: '#fff', height: '100px', display: 'flex', alignItems: 'center' }}>
      <div className="header-top" style={{ display: 'flex', width: '100%', alignItems: 'center', padding: '0 0 0 30px' }}>
        <div className="logo" style={{ flexGrow: 1, display: 'flex', alignItems: 'center', height: '100px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <img src="/logo.png" alt="ラクザイ" className="logo-img" style={{ objectFit: 'contain', height: '100px', padding: '15px 0', filter: 'brightness(0) invert(1)' }} />
          </Link>
        </div>
        
        <div className="header-right desktop-only" style={{ display: 'flex', alignItems: 'center', height: '100px' }}>
          {user ? (
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', fontSize: '0.9rem' }}>
              <Link to="/mypage" style={{ textDecoration: 'none', color: '#fff', fontWeight: 'bold' }}>
                <User size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }}/>{user.company || user.email}様
              </Link>
              <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#a1a1aa', fontWeight: 'bold' }}>
                <LogOut size={16} /> ログアウト
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', height: '100px', alignItems: 'center', padding: '0 1rem' }}>
              <Link to="/login" style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '0 15px', textDecoration: 'none', color: '#fff', fontWeight: 'bold', fontSize: '0.9rem', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='#333'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                 ログイン
              </Link>
              <Link to="/register" style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '0 15px', textDecoration: 'none', color: '#fff', fontWeight: 'bold', fontSize: '0.9rem', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='#333'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                 新規登録
              </Link>
            </div>
          )}
          
          <div style={{ display: 'flex', height: '100px', alignItems: 'center', gap: '1px', background: '#333' }}>
            <a href="https://www.pitaliy.com/signup?step=1" target="_blank" rel="noopener noreferrer" className="contact-btn-sp-hide" style={{ display: 'flex', width: '220px', height: '100%', alignItems: 'center', justifyContent: 'center', gap: '12px', textDecoration: 'none', background: '#fff', color: '#000', transition: 'opacity 0.2s', lineHeight: '1.2' }} onMouseOver={e=>e.currentTarget.style.opacity='0.85'} onMouseOut={e=>e.currentTarget.style.opacity='1'}>
               <MessageCircle size={32} color="#000" />
               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                 <span style={{ fontSize: '0.65em', fontWeight: 'bold' }}>楽天に効果的な無料の</span>
                 <span style={{ fontSize: '0.9rem', fontWeight: 'bold', marginTop: '2px' }}>AIチャットを作成</span>
               </div>
            </a>
            <a href="https://givee.co.jp/lp/rakuten-consulting" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', width: '220px', height: '100%', alignItems: 'center', justifyContent: 'center', gap: '12px', textDecoration: 'none', background: 'linear-gradient(to right, var(--primary), #e60000)', color: '#fff', transition: 'opacity 0.2s', lineHeight: '1.2' }} onMouseOver={e=>e.currentTarget.style.opacity='0.85'} onMouseOut={e=>e.currentTarget.style.opacity='1'}>
               <TrendingUp size={32} color="#fff" />
               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                 <span style={{ fontSize: '0.65em', fontWeight: 'bold' }}>楽天のプロに</span>
                 <span style={{ fontSize: '1rem', fontWeight: 'bold', marginTop: '2px' }}>無料で相談する</span>
               </div>
            </a>
          </div>
        </div>

        <button 
          className="mobile-menu-btn" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', paddingRight: '1rem', display: 'none' }}
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="mobile-menu-dropdown" style={{ position: 'absolute', top: '100px', left: 0, width: '100%', zIndex: 99, borderTop: '1px solid #e2e8f0', background: 'white', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {user ? (
            <>
              <Link to="/mypage" onClick={() => setIsMenuOpen(false)} style={{ display: 'block', width: '100%', padding: '12px', textAlign: 'center', background: '#334155', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}>マイページ</Link>
              <button onClick={() => { logout(); setIsMenuOpen(false); }} style={{ display: 'block', width: '100%', padding: '12px', textAlign: 'center', background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 'bold' }}>ログアウト</button>
            </>
          ) : (
            <>
              <Link to="/register" onClick={() => setIsMenuOpen(false)} style={{ display: 'block', width: '100%', padding: '12px', textAlign: 'center', background: '#334155', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}>新規登録</Link>
              <Link to="/login" onClick={() => setIsMenuOpen(false)} style={{ display: 'block', width: '100%', padding: '12px', textAlign: 'center', background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}>ログイン</Link>
            </>
          )}
          <a href="https://givee.co.jp/lp/rakuten-consulting" target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', padding: '12px', textAlign: 'center', background: '#e11d48', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold', marginTop: '0.5rem' }}>
            楽天コンサルに無料相談
          </a>
          <a href="https://www.pitaliy.com/signup?step=1" target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', padding: '12px', textAlign: 'center', background: '#e2e8f0', color: '#334155', border: '1px solid #cbd5e1', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
            無料のAIチャットを作る
          </a>
        </div>
      )}


    </header>
  );
}
