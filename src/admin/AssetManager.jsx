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
  const [newThumbnail, setNewThumbnail] = useState(null);
  
  // 一括アップロード用プログレス
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState('ai');
  const [editCategory, setEditCategory] = useState('SNS投稿用');
  const [editTags, setEditTags] = useState('');
  const [editThumbnail, setEditThumbnail] = useState(null);

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

        if (newThumbnail && newFiles.length === 1) {
          formData.append('thumbnail', newThumbnail);
        }

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
      setNewThumbnail(null);
      fetchAssets(); // 再取得してリスト更新
      alert(`${newFiles.length}件の素材をアップロードしました！`);
    } catch (err) {
      console.error(err);
      alert('一部または全部のアップロードに失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (img) => {
    setEditingId(img.id);
    setEditTitle(img.title);
    setEditType(img.type);
    setEditCategory(img.category || '');
    setEditTags(img.tags.join(', '));
    setEditThumbnail(null);
  };

  const handleEditCancel = () => {
    setEditingId(null);
  };

  const handleEditSave = async (id) => {
    try {
      const formData = new FormData();
      formData.append('title', editTitle);
      formData.append('type', editType);
      formData.append('category', editCategory);
      formData.append('tags', editTags);
      if (editThumbnail) {
        formData.append('thumbnail', editThumbnail);
      }

      const res = await fetch(`/api/assets/${id}`, {
        method: 'PUT',
        body: formData
      });
      if (res.ok) {
        setEditingId(null);
        setEditThumbnail(null);
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
            <input 
              list="category-options" 
              className="input-field" 
              value={newCategory} 
              onChange={e => setNewCategory(e.target.value)} 
              placeholder="選択するか新しいカテゴリを入力" 
              style={{ marginBottom: '1.5rem' }} 
              required
            />
            <datalist id="category-options">
              <option value="全て" />
              <option value="SNS投稿用" />
              <option value="広告 / バナー素材" />
              <option value="EC / 商品画像" />
              <option value="LP / Webサイト" />
              <option value="資料 / プレゼン" />
            </datalist>
            
            <label>タグ (カンマ区切り)</label>
            <input type="text" className="input-field" placeholder="例: セール, 夏, イエロー" value={newTags} onChange={e => setNewTags(e.target.value)} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
              {['ランキング', '母の日', 'お買い物マラソン', '送料無料', 'ポイント倍'].map(tag => (
                <span 
                  key={tag} 
                  onClick={() => {
                    const currentTags = newTags.split(',').map(t => t.trim()).filter(Boolean);
                    if (!currentTags.includes(tag)) {
                      setNewTags([...currentTags, tag].join(', '));
                    }
                  }}
                  className="badge" 
                  style={{ background: '#e2e8f0', color: '#475569', cursor: 'pointer', padding: '0.3rem 0.6rem' }}
                >
                  + {tag}
                </span>
              ))}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                  📂 元データ (.psd, .ai, .png, .pdf 等) ※一括選択可能
                </label>
                <input type="file" multiple onChange={e => setNewFiles(Array.from(e.target.files))} required />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  ※複数ファイルを選択した場合、タイトルを空欄にするとファイル名がタイトルになります。
                </p>
              </div>

              {newFiles.length === 1 && (
                <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: '#f8fafc' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    🖼 プレビュー/サムネイル画像 (任意)
                  </label>
                  <input type="file" accept="image/*" onChange={e => setNewThumbnail(e.target.files[0])} />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', margin: 0 }}>
                    ※PDFファイルなどをアップロードする場合、表紙となる画像を指定できます。
                  </p>
                </div>
              )}
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
                      <td style={{ minWidth: '300px' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '4px' }}>
                          <img 
                            src={editThumbnail ? URL.createObjectURL(editThumbnail) : img.url} 
                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} 
                            alt="preview"
                          />
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => setEditThumbnail(e.target.files[0])} 
                            style={{ fontSize: '0.75rem', padding: '4px', alignSelf: 'center' }}
                            title="プレビュー画像を変更"
                          />
                        </div>
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
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem', marginTop: '0.3rem' }}>
                          {['ランキング', '母の日', 'お買い物マラソン', '送料無料', 'ポイント倍'].map(tag => (
                            <span 
                              key={tag} 
                              onClick={() => {
                                const currentTags = editTags.split(',').map(t => t.trim()).filter(Boolean);
                                if (!currentTags.includes(tag)) {
                                  setEditTags([...currentTags, tag].join(', '));
                                }
                              }}
                              className="badge" 
                              style={{ background: '#e2e8f0', color: '#475569', cursor: 'pointer', fontSize: '0.65rem' }}
                            >
                              + {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <input 
                          list="category-options" 
                          value={editCategory} 
                          onChange={(e) => setEditCategory(e.target.value)}
                          style={{ padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px', width: '100%' }}
                        />
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
                          <button onClick={() => handleEdit(img)} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }} title="編集">
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
