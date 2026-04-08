import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function BlogManager() {
  const [blogs, setBlogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [membersOnly, setMembersOnly] = useState(true);
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorProfile, setAuthorProfile] = useState('');
  const [authorImage, setAuthorImage] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [isRawMode, setIsRawMode] = useState(false);

  const fetchBlogs = () => {
    fetch('/api/blogs')
      .then(res => res.json())
      .then(data => setBlogs(data.sort((a,b) => b.id - a.id)))
      .catch(console.error);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setIsPublic(true);
    setMembersOnly(true);
    setCategory('');
    setTags('');
    setAuthorName('');
    setAuthorProfile('');
    setAuthorImage(null);
    setThumbnail(null);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('isPublic', isPublic);
    formData.append('membersOnly', membersOnly);
    formData.append('category', category);
    formData.append('tags', tags);
    formData.append('authorName', authorName);
    formData.append('authorProfile', authorProfile);
    if (authorImage) formData.append('authorImage', authorImage);
    if (thumbnail) formData.append('thumbnail', thumbnail);

    const url = editingId ? `/api/blogs/${editingId}` : '/api/blogs';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, { method, body: formData });
      if (res.ok) {
        alert('保存しました');
        resetForm();
        setShowForm(false);
        fetchBlogs();
      } else {
        alert('保存に失敗しました');
      }
    } catch (err) {
      alert('エラーが発生しました');
    }
  };

  const handleEdit = (blog) => {
    setEditingId(blog.id);
    setTitle(blog.title);
    setContent(blog.content);
    setIsPublic(blog.isPublic);
    setMembersOnly(blog.membersOnly);
    setCategory(blog.category || '');
    setTags(blog.tags ? blog.tags.join(', ') : '');
    setAuthorName(blog.authorName || '');
    setAuthorProfile(blog.authorProfile || '');
    setAuthorImage(null);
    setThumbnail(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('本当に削除しますか？')) return;
    try {
      await fetch(`/api/blogs/${id}`, { method: 'DELETE' });
      fetchBlogs();
    } catch (err) {
      alert('削除に失敗しました');
    }
  };

  const quillModules = {
    toolbar: [
      [{ header: [2, 3, 4, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3 style={{ margin: 0 }}>ブログ管理 (ノウハウ記事)</h3>
        <button className="admin-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => { setShowForm(!showForm); resetForm(); }}>
          <Plus size={18} />
          {showForm ? 'キャンセル' : '新規記事を作成'}
        </button>
      </div>

      {showForm && (
        <div className="admin-card" style={{ marginBottom: '2rem' }}>
          <h4>{editingId ? '記事の編集' : '新しい記事を作成'}</h4>
          <form className="admin-form" onSubmit={handleSubmit}>
            <label>タイトル <span className="required-mark">必須</span></label>
            <input type="text" className="input-field" value={title} onChange={e => setTitle(e.target.value)} required />

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label>カテゴリ</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={category} 
                  onChange={e => setCategory(e.target.value)} 
                  placeholder="例: ノウハウ" 
                  list="blog-categories"
                />
                <datalist id="blog-categories">
                  <option value="ノウハウ" />
                  <option value="楽天" />
                  <option value="デザイン" />
                </datalist>
              </div>
              <div style={{ flex: 2 }}>
                <label>タグ（カンマ区切り）</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={tags} 
                  onChange={e => setTags(e.target.value)} 
                  placeholder="例: SEO, デザイン, コツ" 
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label>執筆者名 (任意)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={authorName} 
                  onChange={e => setAuthorName(e.target.value)} 
                  placeholder="例: Givee 採用担当" 
                />
              </div>
              <div style={{ flex: 2 }}>
                <label>執筆者プロフィール (任意)</label>
                <textarea 
                  className="input-field" 
                  value={authorProfile} 
                  onChange={e => setAuthorProfile(e.target.value)} 
                  maxLength={300}
                  rows={2}
                  placeholder="例: EC売上改善のプロフェッショナルとして..." 
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label>執筆者写真 (任意)</label>
                <input type="file" onChange={e => setAuthorImage(e.target.files[0])} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '2rem', marginBottom: '2rem', marginTop: '1.5rem', padding: '1rem 1.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontWeight: 600, cursor: 'pointer' }}>
                <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} style={{ width: 'auto', margin: 0, padding: 0 }} />
                <span>公開する</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontWeight: 600, cursor: 'pointer' }}>
                <input type="checkbox" checked={membersOnly} onChange={e => setMembersOnly(e.target.checked)} style={{ width: 'auto', margin: 0, padding: 0 }} />
                <span>会員限定にする</span>
              </label>
            </div>

            <label>サムネイル画像 (任意)</label>
            <input type="file" onChange={e => setThumbnail(e.target.files[0])} style={{ marginBottom: '1.5rem' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ margin: 0 }}>本文</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'normal', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input type="checkbox" checked={isRawMode} onChange={e => setIsRawMode(e.target.checked)} style={{ margin: 0, padding: 0 }} />
                <span>HTML / Markdown を直接入力</span>
              </label>
            </div>
            
            <div style={{ background: 'white', color: 'black', marginBottom: '1.5rem', borderRadius: '4px' }}>
              {isRawMode ? (
                <textarea 
                  className="input-field" 
                  value={content} 
                  onChange={e => setContent(e.target.value)} 
                  style={{ width: '100%', height: '400px', padding: '1rem', fontFamily: 'monospace', resize: 'vertical' }}
                  placeholder="<h2>タイトル</h2><p>本文...</p> または # Markdown"
                />
              ) : (
                <ReactQuill theme="snow" value={content} onChange={setContent} modules={quillModules} style={{ height: '400px', marginBottom: '3rem' }} />
              )}
            </div>

            <button type="submit" className="admin-btn" style={{ width: '100%', padding: '1rem', marginTop: '1rem' }}>保存して公開</button>
          </form>
        </div>
      )}

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>タイトル</th>
              <th>状態</th>
              <th>公開範囲</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map(blog => (
              <tr key={blog.id}>
                <td>{blog.id}</td>
                <td style={{ fontWeight: 'bold' }}>{blog.title}</td>
                <td>
                  <span className="badge" style={{ background: blog.isPublic ? '#10b981' : '#64748b', color: '#fff' }}>
                    {blog.isPublic ? '公開' : '非公開'}
                  </span>
                </td>
                <td>
                  <span className="badge" style={{ background: blog.membersOnly ? '#ef4444' : '#3b82f6', color: '#fff' }}>
                    {blog.membersOnly ? '会員限定' : '全体公開'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleEdit(blog)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6' }} title="編集">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(blog.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="削除">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
