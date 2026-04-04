import React, { useState, useEffect } from 'react';
import { Sparkles, Camera, Plus, Edit2, Trash2, Check, X, CheckSquare } from 'lucide-react';

export default function AssetManager() {
  const [images, setImages] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // データ取得
  const fetchAssets = () => {
    fetch('/api/assets')
      .then(res => res.json())
      .then(data => setImages(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  // 追加フォームステート
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('ai');
  const [newCategory, setNewCategory] = useState('SNS投稿用');
  const [newTags, setNewTags] = useState('');
  const [newFiles, setNewFiles] = useState([]);
  
  // 一括アップロード用プログレス
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  // 編集ステート
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState('ai');
  const [editCategory, setEditCategory] = useState('SNS投稿用');
  const [editTags, setEditTags] = useState('');

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newFiles || newFiles.length === 0) {
      alert("元データ(AI/PSD等)を選択してください");
      return;
    }

    setIsUploading(true);
    setUploadProgress({ current: 0, total: newFiles.length });

    try {
      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        const formData = new FormData();
        formData.append('file', file);
        
        // ファイル名から拡張子を抜いたものをデフォルトタイトルとする
        const fileNameNoExt = file.name.replace(/\.[^/.]+$/, "");
        const finalTitle = newTitle ? `${newTitle}${newFiles.length > 1 ? `_${i+1}` : ''}` : fileNameNoExt;
        
        formData.append('title', finalTitle);
        formData.append('type', newType);
        formData.append('category', newCategory);
        formData.append('tags', newTags);

        await fetch('/api/assets', {
          method: 'POST',
          body: formData
        });
        
        setUploadProgress({ current: i + 1, total: newFiles.length });
      }

      setShowForm(false);
      setNewTitle('');
      setNewTags('');
      setNewFiles([]);
      fetchAssets(); // 再取得してリスト更新
      alert(`${newFiles.length}件の素材をアップロードしました！`);
    } catch (err) {
      console.error(err);
      alert('一部または全部のアップロードに失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditClick = (img) => {
    setEditingId(img.id);
    setEditTitle(img.title);
    setEditCategory(img.category || 'SNS投稿用');
    setEditTags(img.tags.join(', '));
  };

  const handleEditCancel = () => {
    setEditingId(null);
  };

  const handleEditSave = async (id) => {
    try {
      const res = await fetch(`/api/assets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          category: editCategory,
          tags: editTags
        })
      });
      if (res.ok) {
        setEditingId(null);
        fetchAssets();
      }
    } catch (err) {
      console.error(err);
      alert('更新に失敗しました');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("本当にこの素材を削除しますか？")) return;
    try {
      const res = await fetch(`/api/assets/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchAssets();
      }
    } catch (err) {
      console.error(err);
      alert('削除に失敗しました');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(images.map(img => img.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`選択した ${selectedIds.length} 件の素材を本当に削除しますか？`)) return;
    
    try {
      const res = await fetch('/api/assets/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (res.ok) {
        setSelectedIds([]);
        fetchAssets();
      } else {
        throw new Error('Bulk delete failed');
      }
    } catch (err) {
      console.error(err);
      alert('削除に失敗しました');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3 style={{ margin: 0 }}>素材の管理</h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {selectedIds.length > 0 && (
            <button className="admin-btn" style={{ background: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={handleDeleteSelected}>
              <Trash2 size={18} />
              選択した項目を削除 ({selectedIds.length})
            </button>
          )}
          <button className="admin-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setShowForm(!showForm)}>
            <Plus size={18} />
            {showForm ? 'キャンセル' : '新規素材を追加'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="admin-card" style={{ marginBottom: '2rem' }}>
          <h4 style={{ marginTop: 0 }}>新しい素材をアップロード</h4>
          <form className="admin-form" onSubmit={handleAddSubmit}>
            <label>タイトル</label>
            <input type="text" placeholder="例: 夏のセールの背景" value={newTitle} onChange={e => setNewTitle(e.target.value)} required />

            <label>カテゴリ</label>
            <select value={newCategory} onChange={e => setNewCategory(e.target.value)}>
              <option value="SNS投稿用">SNS投稿用</option>
              <option value="広告 / バナー素材">広告 / バナー素材</option>
              <option value="EC / 商品画像">EC / 商品画像</option>
              <option value="LP / Webサイト">LP / Webサイト</option>
              <option value="資料 / プレゼン">資料 / プレゼン</option>
            </select>
            
            <label>タグ (カンマ区切り)</label>
            <input type="text" placeholder="例: セール, 夏, イエロー" value={newTags} onChange={e => setNewTags(e.target.value)} />
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ flex: 1, padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                  📂 元データ (.psd, .ai, .png 等) ※一括選択可能
                </label>
                <input type="file" multiple onChange={e => setNewFiles(Array.from(e.target.files))} required />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  ※複数ファイルを選択した場合、タイトルを空欄にするとファイル名がそのままタイトルとして使われます。
                </p>
              </div>
            </div>

            <button type="submit" className="admin-btn" style={{ marginTop: '1.5rem', width: '100%' }}>保存して公開</button>
          </form>
        </div>
      )}

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>
                <input 
                  type="checkbox" 
                  checked={images.length > 0 && selectedIds.length === images.length} 
                  onChange={handleSelectAll} 
                />
              </th>
              <th>ID</th>
              <th>プレビュー</th>
              <th>タイトル / タグ</th>
              <th>カテゴリ</th>
              <th>DL数</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {images.map(img => {
              const isEditing = editingId === img.id;
              const isSelected = selectedIds.includes(img.id);
              
              return (
                <tr key={img.id} style={{ background: isSelected ? 'rgba(56, 189, 248, 0.1)' : 'transparent' }}>
                  <td style={{ textAlign: 'center' }}>
                    <input 
                      type="checkbox" 
                      checked={isSelected} 
                      onChange={() => handleSelectOne(img.id)} 
                    />
                  </td>
                  <td>#{img.id}</td>
                  <td>
                    <img 
                      src={img.url} 
                      alt={img.title} 
                      style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} 
                      onError={(e) => { e.target.onerror = null; e.target.src = '/logo.png'; }}
                    />
                  </td>
                  
                  {isEditing ? (
                    // 編集中UI
                    <>
                      <td style={{ minWidth: '250px' }}>
                        <input 
                          type="text" 
                          value={editTitle} 
                          onChange={(e) => setEditTitle(e.target.value)} 
                          style={{ width: '100%', marginBottom: '4px', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                        />
                        <input 
                          type="text" 
                          value={editTags} 
                          onChange={(e) => setEditTags(e.target.value)} 
                          style={{ width: '100%', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.8rem' }}
                          placeholder="タグ..."
                        />
                      </td>
                      <td>
                        <select 
                          value={editCategory} 
                          onChange={(e) => setEditCategory(e.target.value)}
                          style={{ padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                        >
                          <option value="SNS投稿用">SNS投稿用</option>
                          <option value="広告 / バナー素材">広告 / バナー素材</option>
                          <option value="EC / 商品画像">EC / 商品画像</option>
                          <option value="LP / Webサイト">LP / Webサイト</option>
                          <option value="資料 / プレゼン">資料 / プレゼン</option>
                        </select>
                      </td>
                      <td>{img.downloads}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleEditSave(img.id)} style={{ color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }} title="保存">
                            <Check size={18} />
                          </button>
                          <button onClick={handleEditCancel} style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }} title="キャンセル">
                            <X size={18} />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    // 通常UI
                    <>
                      <td style={{ fontWeight: 500 }}>
                        <div style={{ marginBottom: '4px' }}>{img.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {img.tags.map(tag => <span key={tag}>#{tag}</span>)}
                        </div>
                      </td>
                      <td>
                        <span style={{ 
                          display: 'inline-flex', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                          background: '#f1f5f9', color: '#334155', whiteSpace: 'nowrap'
                        }}>
                          {img.category || '未分類'}
                        </span>
                      </td>
                      <td>{img.downloads}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleEditClick(img)} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }} title="編集">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(img.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }} title="削除">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
