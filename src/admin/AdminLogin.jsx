import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.user.role === 'admin') {
          login(data.token, data.user);
          navigate('/admin');
        } else {
          setErrorMsg('管理者権限がありません');
        }
      } else {
        setErrorMsg(data.error || 'ログイン失敗');
      }
    } catch(err) {
      setErrorMsg('エラーが発生しました');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', padding: '1rem' }}>
      <div className="admin-card" style={{ maxWidth: '400px', width: '100%', padding: '2rem', textAlign: 'center' }}>
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: 'var(--primary)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={30} color="white" />
          </div>
        </div>
        
        <h2 style={{ margin: '0 0 1.5rem', color: 'var(--text-main)', fontSize: '1.5rem' }}>管理画面ログイン</h2>
        
        {errorMsg && (
          <div style={{ background: '#fef2f2', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>管理者メールアドレス</label>
            <input 
              type="text" 
              className="input-field" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="メールアドレスを入力" 
              required 
            />
          </div>
          <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>パスワード</label>
            <input 
              type="password" 
              className="input-field" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="パスワードを入力" 
              required 
            />
          </div>
          <button type="submit" className="admin-btn" style={{ width: '100%', justifyContent: 'center' }}>
            ログイン
          </button>
        </form>
        
        <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          &copy; Givee Inc.
        </div>
      </div>
    </div>
  );
}
