import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import Header from '../components/Header.jsx';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [personName, setPersonName] = useState('');
  const [phone, setPhone] = useState('');
  const [revenue, setRevenue] = useState('');
  const [challenge, setChallenge] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, company, personName, phone, revenue, challenge, storeUrl })
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
        padding: '3rem 1rem',
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
          maxWidth: '540px',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              新規会員登録
            </h1>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              無料で全てのEC特化素材がダウンロードできるようになります
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
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Input Styles Function */}
            {(() => {
              const inputProps = {
                style: {
                  width: '100%', padding: '0.875rem 1rem', fontSize: '1rem',
                  background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px',
                  transition: 'all 0.2s', outline: 'none'
                },
                onFocus: (e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(191,0,0,0.1)'; },
                onBlur: (e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }
              };
              const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' };

              return (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>会社名（店舗名） <span style={{color:'red'}}>*</span></label>
                      <input type="text" required value={company} onChange={e => setCompany(e.target.value)} {...inputProps} placeholder="株式会社ラクザイ" />
                    </div>
                    <div>
                      <label style={labelStyle}>担当者名 <span style={{color:'red'}}>*</span></label>
                      <input type="text" required value={personName} onChange={e => setPersonName(e.target.value)} {...inputProps} placeholder="山田 太郎" />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>メールアドレス <span style={{color:'red'}}>*</span></label>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} {...inputProps} placeholder="info@example.com" />
                  </div>
                  
                  <div>
                    <label style={labelStyle}>パスワード <span style={{color:'red'}}>*</span></label>
                    <input type="password" required value={password} onChange={e => setPassword(e.target.value)} {...inputProps} placeholder="••••••••" />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>電話番号 <span style={{color:'red'}}>*</span></label>
                      <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} {...inputProps} placeholder="03-0000-0000" />
                    </div>
                    <div>
                      <label style={labelStyle}>月商規模</label>
                      <select value={revenue} onChange={e => setRevenue(e.target.value)} {...inputProps} style={{...inputProps.style, padding: '0.875rem' }}>
                        <option value="">選択してください</option>
                        <option value="〜100万円">〜100万円</option>
                        <option value="100万円〜500万円">100万円〜500万円</option>
                        <option value="500万円〜1000万円">500万円〜1000万円</option>
                        <option value="1000万円以上">1000万円以上</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>主な課題 <span style={{color:'red'}}>*</span></label>
                      <select required value={challenge} onChange={e => setChallenge(e.target.value)} {...inputProps} style={{...inputProps.style, padding: '0.875rem' }}>
                        <option value="">選択してください</option>
                        <option value="売上の伸び悩み">売上の伸び悩み</option>
                        <option value="転換率の向上">転換率の向上</option>
                        <option value="集客・アクセス改善">集客・アクセス改善</option>
                        <option value="リソース・人手不足">リソース・人手不足</option>
                        <option value="その他">その他</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>対象店舗URL（任意）</label>
                      <input type="url" value={storeUrl} onChange={e => setStoreUrl(e.target.value)} {...inputProps} placeholder="https://www.rakuten.ne.jp/gold/..." />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    style={{
                      width: '100%', padding: '1rem', marginTop: '1rem',
                      background: 'linear-gradient(to right, var(--primary), #e60000)',
                      color: 'white', border: 'none', borderRadius: '10px',
                      fontSize: '1rem', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      opacity: isSubmitting ? 0.7 : 1, transition: 'transform 0.2s, box-shadow 0.2s',
                      boxShadow: '0 4px 14px rgba(191,0,0,0.3)'
                    }}
                    onMouseOver={(e) => { if (!isSubmitting) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(191,0,0,0.4)'; } }}
                    onMouseOut={(e) => { if (!isSubmitting) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(191,0,0,0.3)'; } }}
                  >
                    {isSubmitting ? '登録処理中...' : '会員登録して利用開始'}
                  </button>
                </>
              );
            })()}
          </form>
        </div>
      </main>
    </div>
  );
}
