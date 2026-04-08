import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import Header from '../components/Header.jsx';
import { Lock, ArrowLeft, ExternalLink, MessageCircle, FileText, ChevronRight, Share2 } from 'lucide-react';
import { marked } from 'marked';
import Footer from '../components/Footer.jsx';

export default function BlogDetail() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [allBlogs, setAllBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // 記事と、関連記事用の全記事を取得
    Promise.all([
      fetch(`/api/blogs/${id}`).then(res => res.json()),
      fetch('/api/blogs').then(res => res.json())
    ])
    .then(([blogData, allBlogsData]) => {
      if (!blogData.error) setBlog(blogData);
      setAllBlogs(allBlogsData.filter(b => b.isPublic).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}>読み込み中...</div>;
  if (!blog) return <div style={{ textAlign: 'center', padding: '4rem' }}>記事が見つかりません。</div>;

  // 会員限定記事の場合、未ログインなら冒頭の少しだけ見せる
  const showFullContent = !blog.membersOnly || user;
  
  // HTMLタグを除去した本文を取得
  const rawText = blog.content.replace(/<[^>]*>?/gm, '');
  const previewText = rawText.length > 100 ? rawText.substring(0, 100) + '...' : rawText;

  return (
    <>
      <Header />
      <main style={{ maxWidth: '800px', margin: '3rem auto', padding: '0 1rem' }}>
        <article style={{ background: 'var(--bg-surface)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              {new Date(blog.createdAt).toLocaleDateString('ja-JP')}
            </div>
            <h1 style={{ fontSize: '1.8rem', lineHeight: '1.4', marginBottom: '1rem' }}>{blog.title}</h1>
            {blog.membersOnly && (
              <span className="badge" style={{ background: 'var(--primary)', color: 'white', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Lock size={14} /> 会員限定記事
              </span>
            )}
          </header>

          {blog.thumbnailUrl && (
            <div style={{ marginBottom: '2rem', borderRadius: '8px', overflow: 'hidden' }}>
              <img src={blog.thumbnailUrl} alt={blog.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
          )}

          <div className="blog-content" style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--text-main)' }}>
            {showFullContent ? (
              <div dangerouslySetInnerHTML={{ __html: marked.parse(blog.content) }} />
            ) : (
              <div>
                <p style={{ opacity: 0.7 }}>{previewText}</p>
                <div style={{ 
                  margin: '2rem 0', 
                  padding: '3rem 2rem', 
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(248,250,252,1) 50%)',
                  textAlign: 'center',
                  borderTop: '1px dashed #cbd5e1',
                  borderRadius: '0 0 12px 12px'
                }}>
                  <Lock size={32} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                  <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>この記事の続きは会員限定です</h3>
                  <p style={{ color: '#475569', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                    無料会員登録またはログインをすると、売上アップのノウハウ記事をすべて読むことができます。
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                    <Link to="/register" className="btn-gradient-two" style={{ display: 'block', textAlign: 'center', minWidth: '160px' }}>無料会員登録</Link>
                    <Link to="/login" style={{ 
                      textDecoration: 'none', background: '#fff', border: '2px solid var(--primary)', 
                      color: 'var(--primary)', padding: '10px 24px', borderRadius: '50px', 
                      fontWeight: 700, transition: 'all 0.2s', minWidth: '160px',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = '#fff0f0'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; }}
                    >
                      ログイン
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {showFullContent && (
            <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
              
              {/* === SNS Share === */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem' }}>
                <a href={`https://twitter.com/share?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(blog.title)}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', height: '40px', borderRadius: '20px', background: '#000', color: '#fff', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold' }}>X (Twitter)</a>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', height: '40px', borderRadius: '20px', background: '#1877F2', color: '#fff', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold' }}>Facebook</a>
                <a href={`https://line.me/R/msg/text/?${encodeURIComponent(blog.title + ' ' + window.location.href)}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', background: '#06C755', color: '#fff' }}><MessageCircle size={20} /></a>
              </div>

              {/* === Call to Action === */}
              <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #ff4b4b 100%)', padding: '2.5rem 2rem', borderRadius: '12px', textAlign: 'center', color: 'white', marginBottom: '3rem' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1rem' }}>楽天の売上アップにお悩みですか？</h3>
                <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>弊社ECコンサルタントが無料でご相談に乗ります。</p>
                <a href="https://givee.co.jp/lp/rakuten-consulting" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#fff', color: 'var(--primary)', padding: '16px 36px', borderRadius: '50px', fontSize: '1.1rem', fontWeight: 'bold', textDecoration: 'none', transition: 'transform 0.2s', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  楽天のプロに無料相談する <ChevronRight size={20} />
                </a>
              </div>

              {/* === Author === */}
              {(blog.authorName || blog.authorProfile) && (
                <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '8px', marginBottom: '3rem', display: 'flex', gap: '1.5rem', border: '1px solid var(--border)' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                    {blog.authorImageUrl ? (
                      <img src={blog.authorImageUrl} alt={blog.authorName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '1.5rem', color: '#64748b' }}>{blog.authorName ? blog.authorName.charAt(0) : 'G'}</span>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>この記事を執筆した人</div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{blog.authorName || 'Givee運営チーム'}</div>
                    <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.6', margin: 0 }}>{blog.authorProfile}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </article>

        {/* === Related & New === */}
        {showFullContent && (
          <div style={{ marginTop: '4rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1.5rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>おすすめ記事</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
              {allBlogs
                .filter(b => b.id !== blog.id)
                .slice(0, 3)
                .map(related => (
                  <Link to={`/blogs/${related.id}`} key={related.id} style={{ textDecoration: 'none', color: 'inherit', display: 'block', background: 'var(--bg-surface)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{ height: '140px', background: '#e2e8f0', position: 'relative' }}>
                      {related.thumbnailUrl ? (
                         <img src={related.thumbnailUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                         <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', color: '#64748b' }}>
                           <FileText size={30} style={{ opacity: 0.6, marginBottom: '0.5rem' }} />
                         </div>
                      )}
                    </div>
                    <div style={{ padding: '1rem' }}>
                      <h4 style={{ fontSize: '0.95rem', margin: 0, lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{related.title}</h4>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: '4rem', textAlign: 'center' }}>
          <Link to="/blogs" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '12px 24px', background: '#f1f5f9', color: '#475569', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'} onMouseOut={e => e.currentTarget.style.background = '#f1f5f9'}>
            <ArrowLeft size={18} /> 一覧へ戻る
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
