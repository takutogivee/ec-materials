import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import Header from '../components/Header.jsx';
import Gallery from '../components/Gallery.jsx';
import { User, Download, Settings, History } from 'lucide-react';
import '../index.css';

export default function MyPage() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [downloads, setDownloads] = useState([]);
  const [isLoadingDownloads, setIsLoadingDownloads] = useState(true);
  const [activeTab, setActiveTab] = useState('downloads'); // 'downloads' | 'settings'

  useEffect(() => {
    // If auth finishes checking and no user is found, redirect to login
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('rakuzai_token');
      fetch('/api/user/downloads', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setDownloads(data);
        setIsLoadingDownloads(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoadingDownloads(false);
      });
    }
  }, [user]);

  if (loading || !user) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Helmet>
        <title>マイページ | ラクザイ</title>
      </Helmet>
      
      <Header />
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* User Profile Banner */}
          <div style={{ 
            background: 'linear-gradient(135deg, var(--primary) 0%, #ff4b4b 100%)', 
            borderRadius: '16px', 
            padding: '3rem 2rem',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            boxShadow: '0 10px 25px rgba(191,0,0,0.2)'
          }}>
            <div style={{ 
              width: '80px', height: '80px', 
              borderRadius: '50%', 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              display: 'flex', justifyContent: 'center', alignItems: 'center' 
            }}>
              <User size={40} color="white" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700 }}>
                {user.personName || user.company || user.email}
              </h1>
              <p style={{ margin: '0.5rem 0 0', opacity: 0.9 }}>
                 {user.email} {user.company && `| ${user.company}`}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
            <button 
              onClick={() => setActiveTab('downloads')}
              style={{
                padding: '1rem 2rem',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'downloads' ? '3px solid var(--primary)' : '3px solid transparent',
                color: activeTab === 'downloads' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: activeTab === 'downloads' ? 'bold' : 'normal',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                fontSize: '1.05rem',
                transition: 'all 0.2s'
              }}
            >
              <History size={18} /> ダウンロード履歴
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              style={{
                padding: '1rem 2rem',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'settings' ? '3px solid var(--primary)' : '3px solid transparent',
                color: activeTab === 'settings' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: activeTab === 'settings' ? 'bold' : 'normal',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                fontSize: '1.05rem',
                transition: 'all 0.2s'
              }}
            >
              <Settings size={18} /> アカウント情報
            </button>
          </div>

          {activeTab === 'downloads' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                過去にダウンロードした素材
              </h2>
              {isLoadingDownloads ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>読み込み中...</div>
              ) : downloads.length > 0 ? (
                <div className="gallery-container" style={{ margin: 0, padding: 0 }}>
                  <Gallery 
                    items={downloads.map(d => ({...d, itemType: 'asset'}))} 
                    onImageClick={(item) => navigate('/')} 
                  />
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
                    ※ もう一度ダウンロードするにはトップページをご利用ください。</p>
                </div>
              ) : (
                <div style={{ 
                  background: 'white', padding: '4rem 2rem', borderRadius: '12px', 
                  textAlign: 'center', border: '1px dashed var(--border)', color: 'var(--text-muted)' 
                }}>
                  <Download size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                  <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>ダウンロード履歴がありません</p>
                  <p style={{ fontSize: '0.9rem' }}>トップページから気に入った素材をダウンロードしてみましょう！</p>
                  <button onClick={() => navigate('/')} className="submit-btn" style={{ marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    トップページへ
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div style={{ 
              background: 'white', padding: '2rem', borderRadius: '12px', 
              border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
              maxWidth: '600px'
            }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>登録情報</h2>
              
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>登録メールアドレス</div>
                  <div style={{ fontWeight: 'bold' }}>{user.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>会社名</div>
                  <div style={{ fontWeight: 'bold' }}>{user.company || '未登録'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>担当者名</div>
                  <div style={{ fontWeight: 'bold' }}>{user.personName || '未登録'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>電話番号</div>
                  <div style={{ fontWeight: 'bold' }}>{user.phone || '未登録'}</div>
                </div>
              </div>

              <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                <button 
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  style={{ 
                    padding: '0.75rem 1.5rem', background: '#f1f5f9', color: '#ef4444', 
                    border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' 
                  }}
                >
                  ログアウト
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
