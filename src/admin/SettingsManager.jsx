import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

export default function SettingsManager() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/settings')
      .then(res => res.json())
      .then(data => {
        setSubject(data.mailSubject || '');
        setBody(data.mailBody || '');
      })
      .catch(err => console.error(err));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const currentRes = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/settings');
      const currentData = await currentRes.json();
      const mergedData = { 
        ...currentData,
        mailSubject: subject,
        mailBody: body
      };

      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mergedData)
      });
      if (res.ok) {
        alert("設定を保存しました。");
      }
    } catch (err) {
      console.error(err);
      alert("保存に失敗しました。");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ margin: 0 }}>システム設定</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          自動配信メールの文面などの運用設定を行います。
        </p>
      </div>

      <div className="admin-card">
        <h4 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--primary)' }}>自動配信メール設定 (ダウンロード完了時)</h4>
        <form className="admin-form" onSubmit={handleSave}>
          <label style={{ fontWeight: 'bold' }}>メールの件名</label>
          <input 
            type="text" 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)} 
            placeholder="例: ダウンロードありがとうございます" 
            required 
            style={{ marginBottom: '1.5rem' }}
          />

          <label style={{ fontWeight: 'bold' }}>
            メールの本文
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem', fontWeight: 'normal' }}>
              ※ `{company}` は入力された会社名（「株式会社〇〇」）に自動で置き換わります
            </span>
          </label>
          <textarea 
            value={body} 
            onChange={(e) => setBody(e.target.value)} 
            rows={12} 
            required 
            placeholder="メール本文を入力"
          />

          <button type="submit" className="admin-btn" disabled={isSaving} style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Save size={18} />
            {isSaving ? '保存中...' : '設定を保存する'}
          </button>
        </form>
      </div>
    </div>
  );
}
