import React, { useState } from 'react';
import { X, Download, CheckCircle2 } from 'lucide-react';

export default function DownloadModal({ image, onClose }) {
  const [company, setCompany] = useState('');
  const [personName, setPersonName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [revenue, setRevenue] = useState('');
  const [challenge, setChallenge] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [isAgreed, setIsAgreed] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const validateEmail = (emailStr) => {
    if (!/^\S+@\S+\.\S+$/.test(emailStr)) return "有効なメールアドレスを入力してください";
    const freeMails = ['gmail.com', 'yahoo.co.jp', 'hotmail.com', 'outlook.com', 'icloud.com', 'ezweb.ne.jp', 'docomo.ne.jp', 'softbank.ne.jp'];
    const domain = emailStr.split('@')[1];
    if (domain && freeMails.includes(domain.toLowerCase())) {
      return "フリーメールアドレスはご利用いただけません。企業ドメインでご登録ください。";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const emailErr = validateEmail(email);
    if (emailErr) {
      setErrorMsg(emailErr);
      return;
    }

    if (!company || !personName || !email || !phone || !revenue || !challenge) {
      setErrorMsg("すべての必須項目を入力してください");
      return;
    }

    if (!isAgreed) {
      setErrorMsg("利用規約に同意してください");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, company, personName, phone, revenue, challenge, storeUrl, downloadedId: image.id 
        })
      });

      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/assets/${image.id}/download`, { method: 'POST' });

      setIsSubmitting(false);
      setIsSuccess(true);
      
      const link = document.createElement('a');
      link.href = image.fileUrl || image.url; 
      link.download = `rakuzai-material-${image.id}`; 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      setErrorMsg('サーバーとの通信に失敗しました。');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} color="var(--text-main)" />
        </button>
        
        <div className="modal-image" style={{ position: 'relative' }}>
          <img 
            src={image.url} 
            alt={image.title} 
            onError={(e) => { e.target.onerror = null; e.target.src = '/logo.png'; }}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
          {/* ウォーターマーク（透かし） */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', zIndex: 10
          }}>
            <div style={{
              transform: 'rotate(-40deg)', fontSize: '4rem', fontWeight: 900,
              color: 'rgba(0,0,0,0.1)', textShadow: '1px 1px 0 rgba(255,255,255,0.3)',
              whiteSpace: 'nowrap', userSelect: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8rem'
            }}>
              <span>RAKUZAI SAMPLE</span>
              <span>RAKUZAI SAMPLE</span>
              <span>RAKUZAI SAMPLE</span>
            </div>
          </div>
        </div>
        
        <div className="modal-info">
          <h2>{image.title}</h2>
          
          <div style={{ marginTop: 'auto', flex: 1 }}>
            {isSuccess ? (
              <div className="success-message">
                <CheckCircle2 size={48} color="var(--primary)" style={{ margin: '0 auto 1rem', display: 'block' }} />
                <h3 style={{fontSize:'1.2rem', marginBottom:'0.5rem'}}>ダウンロードを開始しました</h3>
                <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>貴重な情報のご提供ありがとうございます。<br/>引き続き「ラクザイ」の素材をご活用ください。</p>
                
                <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <h4 style={{ color: 'var(--text-main)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>🎁 さらに特別なご案内</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    オンラインMTGで、他の素材もプレゼントいたします。貴社のECの課題解決のお手伝いをさせてください。
                  </p>
                  <a href="https://givee.co.jp/contact#contact" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ textDecoration: 'none', background: '#2563eb' }}>
                    お打ち合わせはこちらから
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  商用利用可能な高精細画像をダウンロードするには、以下の情報を入力してください。
                </p>

                <div className="form-group">
                  <label htmlFor="company">会社名（店舗名） <span className="required-mark">必須</span></label>
                  <input type="text" id="company" className="input-field" placeholder="株式会社○○" value={company} onChange={(e) => setCompany(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label htmlFor="personName">担当者名 <span className="required-mark">必須</span></label>
                  <input type="text" id="personName" className="input-field" placeholder="楽天 太郎" value={personName} onChange={(e) => setPersonName(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label htmlFor="email">メールアドレス <span className="required-mark">必須</span></label>
                  <input type="email" id="email" className="input-field" placeholder="info@yourcompany.co.jp" value={email} onChange={(e) => {setEmail(e.target.value); setErrorMsg('');}} required />
                  <span style={{fontSize:'0.7rem', color:'var(--text-muted)'}}>※gmail等のフリーメールはご利用いただけません。</span>
                </div>

                <div className="form-group">
                  <label htmlFor="phone">電話番号 <span className="required-mark">必須</span></label>
                  <input type="tel" id="phone" className="input-field" placeholder="03-0000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label htmlFor="storeUrl">楽天店舗URL <span style={{fontSize: '0.65rem', marginLeft:'0.3rem', color:'var(--text-muted)'}}>任意</span></label>
                  <input type="url" id="storeUrl" className="input-field" placeholder="https://www.rakuten.co.jp/..." value={storeUrl} onChange={(e) => setStoreUrl(e.target.value)} />
                </div>

                <div className="form-group">
                  <label htmlFor="revenue">現状の月商規模 <span className="required-mark">必須</span></label>
                  <select id="revenue" className="input-field" value={revenue} onChange={(e) => setRevenue(e.target.value)} required>
                    <option value="" disabled>選択してください</option>
                    <option value="100万未満">100万未満</option>
                    <option value="100万〜500万">100万円〜500万円</option>
                    <option value="500万〜1000万">500万円〜1000万円</option>
                    <option value="1000万以上">1000万円以上</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="challenge">現在の主な課題 <span className="required-mark">必須</span></label>
                  <select id="challenge" className="input-field" value={challenge} onChange={(e) => setChallenge(e.target.value)} required>
                    <option value="" disabled>選択してください</option>
                    <option value="転換率の向上">転換率の向上（CVR改善）</option>
                    <option value="アクセス数の増加">アクセス数の増加（集客）</option>
                    <option value="素材・デザインの枯渇">素材・デザインの枯渇</option>
                    <option value="リソース不足">制作リソース不足</option>
                    <option value="その他">その他</option>
                  </select>
                </div>

                <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <input 
                    type="checkbox" 
                    id="termsCheck" 
                    checked={isAgreed}
                    onChange={(e) => setIsAgreed(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                  />
                  <label htmlFor="termsCheck" style={{ fontSize: '0.9rem', cursor: 'pointer', userSelect: 'none' }}>
                    <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>利用規約</a>の内容に同意する
                  </label>
                </div>

                {errorMsg && <div className="error-message" style={{ color: '#ef4444', marginBottom: '1rem', fontWeight: 'bold' }}>{errorMsg}</div>}
                
                <button type="submit" className="btn-primary" disabled={isSubmitting || !isAgreed} style={{ opacity: isAgreed ? 1 : 0.6 }}>
                  {isSubmitting ? '処理中...' : (
                    <>
                      <Download size={20} />
                      規約に同意して無料でダウンロード
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
