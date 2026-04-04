import React, { useState, useEffect } from 'react';
import { Archive, ArchiveRestore } from 'lucide-react';

export default function LeadManager() {
  const [leads, setLeads] = useState([]);
  const [images, setImages] = useState([]);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    fetch('' + '/api/assets')
      .then(res => res.json())
      .then(data => setImages(data))
      .catch(err => console.error(err));
      
    fetch('' + '/api/leads')
      .then(res => res.json())
      .then(data => setLeads(data))
      .catch(err => console.error(err));
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setLeads(leads.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead));
      }
    } catch (err) {
      console.error(err);
      alert('ステータスの更新に失敗しました');
    }
  };

  const handleToggleArchive = async (id, isArchived) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived: !isArchived })
      });
      if (res.ok) {
        setLeads(leads.map(lead => lead.id === id ? { ...lead, isArchived: !isArchived } : lead));
      }
    } catch (err) {
      console.error(err);
      alert('アーカイブの更新に失敗しました');
    }
  };

  const handleExportCSV = () => {
    // CSVヘッダー
    const headers = ['ステータス', '会社名', '担当者名', '電話番号', 'メールアドレス', '楽天店舗URL', '売上規模', '主な課題', '取得日時', '対象素材名'];
    
    // データ行の作成
    const csvRows = leads.slice().reverse().map(lead => {
      const asset = images.find(i => i.id === lead.downloadedId);
      return [
        `"${lead.status || '未対応'}"`,
        `"${lead.company || ''}"`,
        `"${lead.personName || ''}"`,
        `"${lead.phone || ''}"`,
        `"${lead.email || ''}"`,
        `"${lead.storeUrl || ''}"`,
        `"${lead.revenue || ''}"`,
        `"${lead.challenge || ''}"`,
        `"${lead.date || ''}"`,
        `"${asset ? asset.title : '削除された素材'}"`
      ].join(',');
    });

    // ヘッダーとデータを結合
    const csvString = [headers.join(','), ...csvRows].join('\n');
    
    // BOM(UTF-8)
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvString], { type: 'text/csv' });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const displayedLeads = leads.filter(lead => showArchived ? lead.isArchived : !lead.isArchived);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ margin: 0 }}>獲得したリード一覧（SFA）</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>取得した顧客情報の営業ステータスを管理できます。</p>
        </div>
        <button className="admin-btn" onClick={handleExportCSV}>CSVダウンロード</button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
        <button 
          onClick={() => setShowArchived(false)}
          style={{ 
            padding: '0.75rem 1.5rem', background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: !showArchived ? '2px solid var(--primary)' : '2px solid transparent',
            color: !showArchived ? 'var(--primary)' : 'var(--text-muted)', fontWeight: !showArchived ? 'bold' : 'normal'
          }}
        >
          アクティブ
        </button>
        <button 
          onClick={() => setShowArchived(true)}
          style={{ 
            padding: '0.75rem 1.5rem', background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: showArchived ? '2px solid var(--primary)' : '2px solid transparent',
            color: showArchived ? 'var(--primary)' : 'var(--text-muted)', fontWeight: showArchived ? 'bold' : 'normal'
          }}
        >
          アーカイブ済
        </button>
      </div>

      <div className="admin-card" style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ステータス</th>
              <th>会社・担当者</th>
              <th>連絡先</th>
              <th>楽天URL</th>
              <th>売上/課題</th>
              <th>対象素材 / 取得日時</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: '0.85rem' }}>
            {displayedLeads.slice().reverse().map(lead => {
              const asset = images.find(i => i.id === lead.downloadedId);
              
              const statusColors = {
                '未対応': '#ef4444',
                'アポ獲得': '#f59e0b',
                '商談中': '#3b82f6',
                '受注': '#10b981',
                '失注': '#64748b'
              };
              
              const currentColor = statusColors[lead.status || '未対応'] || '#ef4444';

              return (
                <tr key={lead.id}>
                  <td>
                    <select 
                      value={lead.status || '未対応'} 
                      onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                      style={{
                        padding: '0.4rem', borderRadius: '4px', border: `1px solid ${currentColor}`, 
                        color: currentColor, backgroundColor: '#fff', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer'
                      }}
                    >
                      <option value="未対応">未対応</option>
                      <option value="アポ獲得">アポ獲得</option>
                      <option value="商談中">商談中</option>
                      <option value="受注">受注</option>
                      <option value="失注">失注</option>
                    </select>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{lead.company || '-'}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{lead.personName || '-'}</div>
                  </td>
                  <td>
                    <div>{lead.phone || '-'}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{lead.email}</div>
                  </td>
                  <td>
                    {lead.storeUrl ? (
                      <a href={lead.storeUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'underline', fontSize: '0.75rem' }}>店舗を見る</a>
                    ) : '-'}
                  </td>
                  <td>
                    <div className="badge" style={{background:'#f1f5f9', color:'#334155', display: 'inline-block', marginBottom:'0.2rem'}}>{lead.revenue || '-'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lead.challenge || '-'}</div>
                  </td>
                  <td>
                    {asset ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                        <img src={asset.url} alt={asset.title} style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '4px' }} title={asset.title} />
                        <span style={{ fontSize: '0.75rem', maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{asset.title}</span>
                      </div>
                    ) : '-'}
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{lead.date}</div>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleToggleArchive(lead.id, lead.isArchived)}
                      style={{
                        padding: '0.4rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#f8fafc',
                        color: '#475569', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer'
                      }}
                      title={lead.isArchived ? "アクティブに戻す" : "アーカイブする"}
                    >
                      {lead.isArchived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                      {lead.isArchived ? "復元" : "アーカイブ"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
