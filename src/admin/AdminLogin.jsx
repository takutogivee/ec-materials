import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');

    // 仮のハードコード認証
    if (username === 'admin' && password === 'rakuzai_admin') {
      localStorage.setItem('rakuzai_auth', 'true');
      navigate('/admin');
    } else {
      setErrorMsg('IDまたはパスワードが正しくありません');
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
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>管理者ID</label>
            <input 
              type="text" 
              className="input-field" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="IDを入力" 
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
