import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import Header from '../components/Header.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        navigate('/');
      } else {
        setErrorMsg(data.error);
      }
    } catch (err) {
      setErrorMsg('エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 背景の装飾 */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(191,0,0,0.05) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(15,23,42,0.03) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }} />

      <Header />
      
      <main style={{ 
        flex: 1, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '2rem 1rem',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.05), 0 0 20px rgba(191,0,0,0.03)',
          borderRadius: '24px',
          padding: '3rem 2.5rem',
          width: '100%',
          maxWidth: '440px',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              おかえりなさい
            </h1>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              アカウントにログインして素材をダウンロード
            </p>
          </div>

          {errorMsg && (
            <div style={{ 
              background: '#fef2f2', color: '#b91c1c', padding: '1rem', 
              borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem',
              border: '1px solid #fecaca', textAlign: 'center'
            }}>
              {errorMsg}
            </div>
          )}
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                メールアドレス
              </label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                style={{
                  width: '100%', padding: '0.875rem 1rem', fontSize: '1rem',
                  background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px',
                  transition: 'all 0.2s', outline: 'none'
                }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(191,0,0,0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                placeholder="info@example.com"
              />
            </div>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  パスワード
                </label>
              </div>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                style={{
                  width: '100%', padding: '0.875rem 1rem', fontSize: '1rem',
                  background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px',
                  transition: 'all 0.2s', outline: 'none'
                }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(191,0,0,0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{
                width: '100%', padding: '1rem', marginTop: '0.5rem',
                background: 'linear-gradient(to right, var(--primary), #e60000)',
                color: 'white', border: 'none', borderRadius: '10px',
                fontSize: '1rem', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1, transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 14px rgba(191,0,0,0.3)'
              }}
              onMouseOver={(e) => { if (!isSubmitting) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(191,0,0,0.4)'; } }}
              onMouseOut={(e) => { if (!isSubmitting) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(191,0,0,0.3)'; } }}
            >
              {isSubmitting ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>
          
          <div style={{ textAlign: 'center', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>アカウントをお持ちでないですか？ </span>
            <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
              新規登録はこちら
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
