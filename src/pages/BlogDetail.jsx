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

  const linkify = (text) => {
    if (!text) return text;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) => 
      urlRegex.test(part) ? <a key={i} href={part} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{part}</a> : part
    );
  };

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
              <div className="sns-box" style={{ marginBottom: '3rem' }}>
                <a href={`https://twitter.com/share?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(blog.title)}`} target="_blank" rel="noreferrer" className="btn-sns btn-x">
                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
                        <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"></path>
                    </svg>
                    <div>Twitter</div>
                </a>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noreferrer" className="btn-sns btn-facebook">
                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 320 512">
                        <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"></path>
                    </svg>
                    <div>Facebook</div>
                </a>
                <a href={`https://line.me/R/msg/text/?${encodeURIComponent(blog.title + ' ' + window.location.href)}`} target="_blank" rel="noreferrer" className="btn-sns btn-line">
                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
                        <path d="M311 196.8v81.3c0 2.1-1.6 3.7-3.7 3.7h-13c-1.3 0-2.4-.7-3-1.5l-37.3-50.3v48.2c0 2.1-1.6 3.7-3.7 3.7h-13c-2.1 0-3.7-1.6-3.7-3.7V196.9c0-2.1 1.6-3.7 3.7-3.7h12.9c1.1 0 2.4 .6 3 1.6l37.3 50.3V196.9c0-2.1 1.6-3.7 3.7-3.7h13c2.1-.1 3.8 1.6 3.8 3.5zm-93.7-3.7h-13c-2.1 0-3.7 1.6-3.7 3.7v81.3c0 2.1 1.6 3.7 3.7 3.7h13c2.1 0 3.7-1.6 3.7-3.7V196.8c0-1.9-1.6-3.7-3.7-3.7zm-31.4 68.1H150.3V196.8c0-2.1-1.6-3.7-3.7-3.7h-13c-2.1 0-3.7 1.6-3.7 3.7v81.3c0 1 .3 1.8 1 2.5c.7 .6 1.5 1 2.5 1h52.2c2.1 0 3.7-1.6 3.7-3.7v-13c0-1.9-1.6-3.7-3.5-3.7zm193.7-68.1H327.3c-1.9 0-3.7 1.6-3.7 3.7v81.3c0 1.9 1.6 3.7 3.7 3.7h52.2c2.1 0 3.7-1.6 3.7-3.7V265c0-2.1-1.6-3.7-3.7-3.7H344V247.7h35.5c2.1 0 3.7-1.6 3.7-3.7V230.9c0-2.1-1.6-3.7-3.7-3.7H344V213.5h35.5c2.1 0 3.7-1.6 3.7-3.7v-13c-.1-1.9-1.7-3.7-3.7-3.7zM512 93.4V419.4c-.1 51.2-42.1 92.7-93.4 92.6H92.6C41.4 511.9-.1 469.8 0 418.6V92.6C.1 41.4 42.2-.1 93.4 0H419.4c51.2 .1 92.7 42.1 92.6 93.4zM441.6 233.5c0-83.4-83.7-151.3-186.4-151.3s-186.4 67.9-186.4 151.3c0 74.7 66.3 137.4 155.9 149.3c21.8 4.7 19.3 12.7 14.4 42.1c-.8 4.7-3.8 18.4 16.1 10.1s107.3-63.2 146.5-108.2c27-29.7 39.9-59.8 39.9-93.1z"></path>
                    </svg>
                    <div>LINE</div>
                </a>
                <a href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&description=${encodeURIComponent(blog.title)}`} target="_blank" rel="noreferrer" className="btn-sns btn-pinterest">
                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512">
                        <path d="M204 6.5C101.4 6.5 0 74.9 0 185.6 0 256 39.6 296 63.6 296c9.9 0 15.6-27.6 15.6-35.4 0-9.3-23.7-29.1-23.7-67.8 0-80.4 61.2-137.4 140.4-137.4 68.1 0 118.5 38.7 118.5 109.8 0 53.1-21.3 152.7-90.3 152.7-24.9 0-46.2-18-46.2-43.8 0-37.8 26.4-74.4 26.4-113.4 0-66.2-93.9-54.2-93.9 25.8 0 16.8 2.1 35.4 9.6 50.7-13.8 59.4-42 147.9-42 209.1 0 18.9 2.7 37.5 4.5 56.4 3.4 3.8 1.7 3.4 6.9 1.5 50.4-69 48.6-82.5 71.4-172.8 12.3 23.4 44.1 36 69.3 36 106.2 0 153.9-103.5 153.9-196.8C384 71.3 298.2 6.5 204 6.5z"></path>
                    </svg>
                    <div>Pinterest</div>
                </a>
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
                <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', marginBottom: '3rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', border: '1px solid var(--border)' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                    {blog.authorImageUrl ? (
                      <img src={blog.authorImageUrl} alt={blog.authorName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '1.5rem', color: '#64748b' }}>{blog.authorName ? blog.authorName.charAt(0) : 'G'}</span>
                    )}
                  </div>
                  <div style={{ flex: '1 1 200px', wordBreak: 'break-word' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>この記事を執筆した人</div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{blog.authorName || 'Givee運営チーム'}</div>
                    <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>{linkify(blog.authorProfile)}</p>
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
