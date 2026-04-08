import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import { Lock, BookOpen } from 'lucide-react';

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blogs')
      .then(res => res.json())
      .then(data => {
        // 公開されているもののみ表示
        setBlogs(data.filter(b => b.isPublic).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Header />
      <main style={{ maxWidth: '1000px', margin: '4rem auto', padding: '0 1rem' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '3rem' }}>売上アップのノウハウ記事</h1>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>読み込み中...</div>
        ) : blogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>現在公開されている記事はありません。</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            {blogs.map(blog => (
              <Link to={`/blogs/${blog.id}`} key={blog.id} style={{ textDecoration: 'none', color: 'inherit', display: 'block', background: 'var(--bg-surface)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ height: '180px', background: '#e2e8f0', position: 'relative' }}>
                  {blog.thumbnailUrl ? (
                    <img src={blog.thumbnailUrl} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', color: '#64748b' }}>
                      <BookOpen size={40} style={{ opacity: 0.6, marginBottom: '0.5rem' }} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '0.05em', opacity: 0.8 }}>ARTICLE</span>
                    </div>
                  )}
                  {blog.membersOnly && (
                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--primary)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Lock size={12} /> 会員限定
                    </div>
                  )}
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{new Date(blog.createdAt).toLocaleDateString('ja-JP')}</div>
                  <h2 style={{ fontSize: '1.1rem', margin: '0 0 1rem 0', lineHeight: '1.4' }}>{blog.title}</h2>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {blog.content.replace(/<[^>]*>?/gm, '')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
