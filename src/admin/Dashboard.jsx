import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

export default function Dashboard() {
  const [images, setImages] = useState([]);
  const [leads, setLeads] = useState([]);
  
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSavingMail, setIsSavingMail] = useState(false);

  const [regSubject, setRegSubject] = useState('');
  const [regBody, setRegBody] = useState('');
  const [isSavingRegMail, setIsSavingRegMail] = useState(false);



  // バナー設定
  const [topBannerActive, setTopBannerActive] = useState(false);
  const [topBanners, setTopBanners] = useState([]);
  const [isSavingBanner, setIsSavingBanner] = useState(false);

  useEffect(() => {
    fetch('/api/assets')
      .then(res => res.json())
      .then(data => setImages(data))
      .catch(err => console.error(err));
      
    fetch('/api/leads')
      .then(res => res.json())
      .then(data => setLeads(data))
      .catch(err => console.error(err));
      
    // 設定全般取得
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if(data) {
          setSubject(data.mailSubject || '');
          setBody(data.mailBody || '');
          setRegSubject(data.regMailSubject || '');
          setRegBody(data.regMailBody || '');
          setTopBannerActive(data.topBannerActive || false);
          // 既存データの互換性維持または新規配列セット
          if (data.topBanners && Array.isArray(data.topBanners)) {
            setTopBanners(data.topBanners);
          } else if (data.topBannerText || data.topBannerImgUrl) {
            // 単一から複数への移行期対応
            setTopBanners([{
              id: Date.now(),
              text: data.topBannerText || '',
              url: data.topBannerUrl || '',
              imgUrl: data.topBannerImgUrl || ''
            }]);
          }
        }
      })
      .catch(err => console.error(err));
  }, []);

  const totalDownloads = images.reduce((acc, current) => acc + current.downloads, 0);

  // 設定を統合保存するユーティリティ
  const saveAllSettings = async (updates) => {
    try {
      const res = await fetch('/api/settings');
      const current = await res.json();
      const merged = { ...current, ...updates };

      const saveRes = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged)
      });
      return saveRes.ok;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleSaveMail = async (e) => {
    e.preventDefault();
    setIsSavingMail(true);
    const ok = await saveAllSettings({ mailSubject: subject, mailBody: body });
    if (ok) alert("ダウンロード完了メール設定を保存しました。");
    else alert("保存に失敗しました。");
    setIsSavingMail(false);
  };

  const handleSaveRegMail = async (e) => {
    e.preventDefault();
    setIsSavingRegMail(true);
    const ok = await saveAllSettings({ regMailSubject: regSubject, regMailBody: regBody });
    if (ok) alert("会員登録完了メール設定を保存しました。");
    else alert("保存に失敗しました。");
    setIsSavingRegMail(false);
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    setIsSavingBanner(true);
    // 保存時に単一フィールドは破棄（nullや削除）せずとも、今回は配列だけを更新する（互換性残しでもOK）
    const ok = await saveAllSettings({ topBannerActive, topBanners });
    if (ok) alert("バナー設定を保存しました。");
    else alert("保存に失敗しました。");
    setIsSavingBanner(false);
  };

  const handleBannerUpload = async (e, bannerId) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.url) {
        updateBannerField(bannerId, 'imgUrl', data.url);
      } else {
        alert('画像のアップロードに失敗しました');
      }
    } catch (err) {
      console.error(err);
      alert('アップロードエラーが発生しました');
    }
  };

  const updateBannerField = (id, field, value) => {
    setTopBanners(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const addBanner = () => {
    setTopBanners(prev => [...prev, { id: Date.now(), text: '', url: '', imgUrl: '' }]);
  };

  const removeBanner = (id) => {
    setTopBanners(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div>
      <h3 style={{ marginBottom: '1.5rem', marginTop: 0 }}>概要</h3>
      <div className="stat-grid">
        <div className="admin-card">
          <div style={{ color: 'var(--text-muted)' }}>獲得リード（メールアドレス）数</div>
          <div className="stat-value">{leads.length}</div>
        </div>
        <div className="admin-card">
          <div style={{ color: 'var(--text-muted)' }}>総ダウンロード数</div>
          <div className="stat-value">{totalDownloads.toLocaleString()}</div>
        </div>
        <div className="admin-card">
          <div style={{ color: 'var(--text-muted)' }}>公開中素材数</div>
          <div className="stat-value">{images.length}</div>
        </div>
      </div>
      
      <div className="admin-card">
        <h3 style={{ marginTop: 0 }}>最新のダウンロード履歴</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>メールアドレス</th>
              <th>ダウンロード日時</th>
              <th>素材ID</th>
            </tr>
          </thead>
          <tbody>
            {leads.slice().reverse().map(lead => (
              <tr key={lead.id}>
                <td>{lead.email}</td>
                <td>{lead.date}</td>
                <td>Asset #{lead.downloadedId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-card">
        <h4 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--primary)' }}>トップページお知らせバナー設定</h4>
        <form className="admin-form" onSubmit={handleSaveBanner}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', marginBottom: '1.5rem', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={topBannerActive}
              onChange={(e) => setTopBannerActive(e.target.checked)}
              style={{ width: '1.2rem', height: '1.2rem' }}
            />
            フロントのトップページにバナーを表示する
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {topBanners.map((banner, index) => (
              <div key={banner.id} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h5 style={{ margin: 0 }}>バナー #{index + 1}</h5>
                  <button 
                    type="button" 
                    onClick={() => removeBanner(banner.id)} 
                    style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    削除
                  </button>
                </div>

                <label style={{ fontWeight: 'bold' }}>バナー画像のアップロード</label>
                <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleBannerUpload(e, banner.id)} 
                    style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px', background: '#fff' }}
                  />
                  {banner.imgUrl && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                      <img 
                        src={banner.imgUrl} 
                        alt="Banner Preview" 
                        style={{ height: '50px', objectFit: 'contain', border: '1px solid #e2e8f0', borderRadius: '4px', background: 'white' }} 
                      />
                      <input 
                        type="text" 
                        value={banner.imgUrl} 
                        onChange={(e) => updateBannerField(banner.id, 'imgUrl', e.target.value)} 
                        className="input-field"
                        style={{ flexGrow: 1, margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}
                        placeholder="または直接URLを入力"
                      />
                    </div>
                  )}
                </div>

                <label style={{ fontWeight: 'bold' }}>バナーテキスト <span style={{fontSize: '0.75rem', color:'var(--text-muted)'}}>※画像がない場合に表示</span></label>
                <input 
                  type="text" 
                  value={banner.text} 
                  onChange={(e) => updateBannerField(banner.id, 'text', e.target.value)} 
                  placeholder="例: 【お買い物マラソン直前】特設SALE素材を追加しました！" 
                  style={{ marginBottom: '1.5rem' }}
                  className="input-field"
                />

                <label style={{ fontWeight: 'bold' }}>リンク先URL <span style={{fontSize: '0.75rem', color:'var(--text-muted)'}}>任意</span></label>
                <input 
                  type="url" 
                  value={banner.url} 
                  onChange={(e) => updateBannerField(banner.id, 'url', e.target.value)} 
                  placeholder="https://rakuzai.com/campaign" 
                  className="input-field"
                />
              </div>
            ))}
          </div>

          <button 
            type="button" 
            onClick={addBanner} 
            style={{ marginTop: '1rem', padding: '0.8rem', background: 'none', border: '2px dashed #cbd5e1', color: '#64748b', cursor: 'pointer', borderRadius: '8px', fontWeight: 'bold', width: '100%' }}
          >
            + バナー枠を追加する
          </button>

          <button type="submit" className="admin-btn" disabled={isSavingBanner} style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#334155' }}>
            <Save size={18} />
            {isSavingBanner ? '保存中...' : 'バナー設定を保存する'}
          </button>
        </form>
      </div>

      <div className="admin-card">
        <h4 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--primary)' }}>自動配信メール設定 (ダウンロード完了時)</h4>
        <form className="admin-form" onSubmit={handleSaveMail}>
          <label style={{ fontWeight: 'bold' }}>メールの件名</label>
          <input 
            type="text" 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)} 
            placeholder="例: ダウンロードありがとうございます" 
            required 
            style={{ marginBottom: '1.5rem' }}
            className="input-field"
          />

          <label style={{ fontWeight: 'bold' }}>
            メールの本文
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem', fontWeight: 'normal' }}>
              ※ {'{company}'} は入力された会社名（「株式会社〇〇」）に自動で置き換わります
            </span>
          </label>
          <textarea 
            value={body} 
            onChange={(e) => setBody(e.target.value)} 
            rows={10} 
            required 
            placeholder="メール本文を入力"
            className="input-field"
          />

          <button type="submit" className="admin-btn" disabled={isSavingMail} style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Save size={18} />
            {isSavingMail ? '保存中...' : 'メール設定を保存する'}
          </button>
        </form>
      </div>

      <div className="admin-card" style={{ marginTop: '2rem' }}>
        <h4 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--primary)' }}>自動配信メール設定 (新規会員登録完了時)</h4>
        <form className="admin-form" onSubmit={handleSaveRegMail}>
          <label style={{ fontWeight: 'bold' }}>メールの件名</label>
          <input 
            type="text" 
            value={regSubject} 
            onChange={(e) => setRegSubject(e.target.value)} 
            placeholder="例: 【ラクザイ】新規会員登録が完了しました" 
            required 
            style={{ marginBottom: '1.5rem' }}
            className="input-field"
          />

          <label style={{ fontWeight: 'bold' }}>
            メールの本文
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem', fontWeight: 'normal' }}>
              ※ {'{company}'}、{'{personName}'}、{'{email}'}、{'{password}'} が自動で置き換わります
            </span>
          </label>
          <textarea 
            value={regBody} 
            onChange={(e) => setRegBody(e.target.value)} 
            rows={10} 
            required 
            placeholder="メール本文を入力"
            className="input-field"
          />

          <button type="submit" className="admin-btn" disabled={isSavingRegMail} style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Save size={18} />
            {isSavingRegMail ? '保存中...' : 'メール設定を保存する'}
          </button>
        </form>
      </div>

    </div>
  );
}
