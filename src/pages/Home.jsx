import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search } from 'lucide-react';
import Gallery from '../components/Gallery.jsx';
import DownloadModal from '../components/DownloadModal.jsx';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [images, setImages] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [likedItems, setLikedItems] = useState(() => {
    const saved = localStorage.getItem('rakuzai_liked_items');
    return saved ? JSON.parse(saved) : [];
  });
  const [bannerConfig, setBannerConfig] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/assets').then(res => res.json()),
      fetch('/api/blogs').then(res => res.json()),
      fetch('/api/settings').then(res => res.json())
    ]).then(([assetsData, blogsData, settingsData]) => {
      setImages(assetsData);
      setBlogs(blogsData.filter(b => b.isPublic)); // 公開済みのブログのみ
      if (settingsData) setBannerConfig(settingsData);
    }).catch(err => console.error(err));
  }, []);

  useEffect(() => {
    localStorage.setItem('rakuzai_liked_items', JSON.stringify(likedItems));
  }, [likedItems]);

  const handleLikeToggle = (id) => {
    setLikedItems(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  // 画像とブログを統合して扱うための配列を作成
  const mixedItems = [
    ...images.map(img => ({ ...img, itemType: 'asset', sortDate: new Date(img.createdAt || 0).getTime() })),
    ...blogs.map(blog => ({
      ...blog,
      itemType: 'blog',
      url: blog.thumbnailUrl || '', // 画像が存在しない場合のフォールバックはGallery内で処理
      tags: blog.tags || [],
      sortDate: new Date(blog.createdAt).getTime()
    }))
  ].sort((a, b) => b.sortDate - a.sortDate);

  const filteredItems = mixedItems.filter(item => {
    let matchCategory = true;
    if (activeCategory) {
      matchCategory = (item.tags && item.tags.includes(activeCategory)) || item.category === activeCategory;
    }
    
    let matchSearch = true;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      matchSearch = (
        (item.title && item.title.toLowerCase().includes(query)) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query))) ||
        (query === 'ai' && item.type === 'ai') ||
        (query === 'creator' && item.type === 'creator')
      );
    }
    
    return matchCategory && matchSearch;
  });

  // --- カテゴリの集計と抽出 ---
  const categoryCounts = {};
  mixedItems.forEach(item => {
    if (item.category) {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    }
  });

  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1]) // 件数が多い順
    .map(entry => entry[0])      // カテゴリ名のみ抽出
    .slice(0, 10);               // 上位10件

  // 固定の表示にするか、投稿数順にするか。全てを先頭に置いて残りを結合。
  const mergedCategories = ['全て', ...topCategories].map(label => ({ type: 'category', label }));
  
  // 固定タグ
  const fixedTags = ['お買い物マラソン', '送料無料', 'ポイント倍', 'ランキング', '母の日'];
  const mergedTags = fixedTags.map(label => ({ type: 'keyword', label }));

  const allTags = [...mergedCategories, ...mergedTags];

  // --- ランキング抽出 ---
  const topDLItems = mixedItems
    .filter(item => item.itemType === 'asset' && item.downloads > 0)
    .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
    .slice(0, 3); // Top 3

  const topBlogItems = mixedItems
    .filter(item => item.itemType === 'blog' && item.views > 0)
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 3); // Top 3

  return (
    <>
      <Helmet>
        <title>売れるECデザイン・無料素材ダウンロードサイト | ラクザイ</title>
        <meta name="description" content="商用利用可能・ハイクリティなECサイト特化の画像素材（セールバナー、送料無料タグなど）を無料でダウンロード。楽天やAmazonなどの出品やデザインに役立ちます。" />
        <meta property="og:title" content="売れるECデザイン・無料素材ダウンロードサイト | ラクザイ" />
        <meta property="og:description" content="商用利用可能・ハイクリティなECサイト特化の画像素材を無料でダウンロード。楽天やAmazonなどの出品に役立ちます。" />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <Header likedCount={likedItems.length} />
      
      <main>
        <section className="hero">
          <h1><span>売れる</span>ECデザインを、もっと手軽に。</h1>
          <p>
            楽天で売れる素材を集めました。<br/>
            商用利用可能な高品質素材を、無料でダウンロード。
          </p>
          
          <div className="hero-search-wrapper" style={{ margin: '2rem auto 2rem auto', maxWidth: '600px' }}>
            <div className="search-bar" style={{ background: '#fff', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <Search size={20} color="var(--text-muted)" />
              <input 
                type="text" 
                placeholder="ランキング / 王冠 / 女性 / パッケージ など" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* カテゴリ & サジェスト */}
          <div className="category-scroll-container">
            {allTags.map((item, idx) => {
              const isActive = (item.type === 'category' && (item.label === '全て' ? activeCategory === '' : activeCategory === item.label)) || 
                               (item.type === 'keyword' && searchQuery === item.label);
              
              return (
                <button 
                  key={`${item.label}-${idx}`}
                  onClick={() => {
                    if (item.type === 'category') {
                      setActiveCategory(item.label === '全て' ? '' : item.label);
                      setSearchQuery('');
                    } else {
                      setSearchQuery(item.label);
                      setActiveCategory('');
                    }
                  }}
                  className={`category-btn ${isActive ? 'active' : ''} ${item.label === '全て' ? 'btn-all-always-red' : ''}`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

        </section>

        {/* 流れるバナー & ランキング領域 */}
        <div className="marquee-container" style={{ background: 'var(--bg-surface)', marginTop: '0', marginBottom: '1rem', padding: '1rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div className="marquee-content" style={{ gap: '1.5rem', alignItems: 'center' }}>
            {/* スムーズな無限ループのために10周リピート */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((repeatIndex) => (
              <React.Fragment key={repeatIndex}>
                
                {/* 1. DLランキング アイテム表示 (カード形式) */}
                {topDLItems.map((item, idx) => (
                  <div 
                    key={`rank-dl-${repeatIndex}-${item.id}`}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.8rem', background: '#fff', 
                      padding: '0.5rem', paddingRight: '1rem', borderRadius: '8px', 
                      border: `2px solid ${idx === 0 ? '#fde047' : idx === 1 ? '#cbd5e1' : idx === 2 ? '#fdba74' : 'var(--border)'}`, 
                      boxShadow: '0 2px 6px rgba(0,0,0,0.04)', cursor: 'pointer', flexShrink: 0,
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.04)'; }}
                    onClick={() => setSelectedImage(item)}
                  >
                    <img 
                      src={item.url || '/logo.png'} 
                      style={{ width: '60px', height: '60px', borderRadius: '6px', objectFit: 'cover', background: '#f1f5f9' }} 
                      alt={item.title} 
                      onError={(e) => { e.target.onerror = null; e.target.src = '/logo.png'; }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', maxWidth: '150px' }}>
                      <div style={{ 
                        fontSize: '0.65rem', fontWeight: '900', display: 'inline-block', width: 'fit-content', padding: '0.1rem 0.4rem', borderRadius: '4px', marginBottom: '0.1rem',
                        background: idx === 0 ? 'linear-gradient(135deg, #fef08a, #eab308)' : idx === 1 ? 'linear-gradient(135deg, #e2e8f0, #94a3b8)' : idx === 2 ? 'linear-gradient(135deg, #fed7aa, #b45309)' : '#f8fafc',
                        color: idx > 2 ? '#64748b' : '#fff',
                        border: idx > 2 ? '1px solid #e2e8f0' : 'none'
                      }}>
                        {idx === 0 ? '👑 DLランキング 第1位' : `DLランキング 第${idx + 1}位`}
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-main)', marginTop: '0.1rem' }}>{item.title}</span>
                      <span style={{ fontSize: '0.75rem', color: '#fff', background: '#ef4444', padding: '0.1rem 0.4rem', borderRadius: '12px', fontWeight: 'bold', display: 'inline-block', width: 'fit-content', marginTop: '0.1rem' }}>
                        {item.downloads} DL
                      </span>
                    </div>
                  </div>
                ))}

                {/* 2. 記事閲覧数ランキング アイテム表示 */}
                {topBlogItems.map((item, idx) => (
                  <div 
                    key={`rank-blog-${repeatIndex}-${item.id}`}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.8rem', background: '#fff', 
                      padding: '0.5rem', paddingRight: '1rem', borderRadius: '8px', 
                      border: `2px solid ${idx === 0 ? '#bbf7d0' : idx === 1 ? '#e2e8f0' : idx === 2 ? '#fed7aa' : 'var(--border)'}`, 
                      boxShadow: '0 2px 6px rgba(0,0,0,0.04)', cursor: 'pointer', flexShrink: 0,
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.04)'; }}
                    onClick={() => { window.location.href = `/blogs/${item.id}`; }}
                  >
                    <img 
                      src={item.url || '/logo.png'} 
                      style={{ width: '60px', height: '60px', borderRadius: '6px', objectFit: 'cover', background: '#f1f5f9' }} 
                      alt={item.title} 
                      onError={(e) => { e.target.onerror = null; e.target.src = '/logo.png'; }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', maxWidth: '150px' }}>
                      <div style={{ 
                        fontSize: '0.65rem', fontWeight: '900', display: 'inline-block', width: 'fit-content', padding: '0.1rem 0.4rem', borderRadius: '4px', marginBottom: '0.1rem',
                        background: idx === 0 ? 'linear-gradient(135deg, #86efac, #22c55e)' : idx === 1 ? 'linear-gradient(135deg, #e2e8f0, #94a3b8)' : idx === 2 ? 'linear-gradient(135deg, #fed7aa, #b45309)' : '#f8fafc',
                        color: idx > 2 ? '#64748b' : '#fff',
                        border: idx > 2 ? '1px solid #e2e8f0' : 'none'
                      }}>
                        {idx === 0 ? '📖 記事ランキング 第1位' : `記事ランキング 第${idx + 1}位`}
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-main)', marginTop: '0.1rem' }}>{item.title}</span>
                      <span style={{ fontSize: '0.75rem', color: '#fff', background: '#3b82f6', padding: '0.1rem 0.4rem', borderRadius: '12px', fontWeight: 'bold', display: 'inline-block', width: 'fit-content', marginTop: '0.1rem' }}>
                        {item.views} Views
                      </span>
                    </div>
                  </div>
                ))}

                {/* 3. 特集バナー等の表示 */}
                {(bannerConfig && bannerConfig.topBannerActive && bannerConfig.topBanners) && bannerConfig.topBanners.map((banner) => (
                  (banner.imgUrl || banner.text) ? (
                    <a 
                      key={`banner-${repeatIndex}-${banner.id}`}
                      href={banner.url || '#'} 
                      target={banner.url ? "_blank" : "_self"}
                      rel="noopener noreferrer"
                      style={{ 
                        color: '#bf0101', fontWeight: 'bold', fontSize: '0.95rem',
                        textDecoration: 'none', transition: 'opacity 0.2s', whiteSpace: 'nowrap',
                        display: 'flex', alignItems: 'center', flexShrink: 0
                      }}
                      onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                      onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                    >
                      {banner.imgUrl ? (
                        <img 
                          src={banner.imgUrl} 
                          alt={banner.text || '特集バナー'} 
                          style={{ minWidth: '150px', height: '60px', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                        />
                      ) : (
                        <div style={{ background: '#fff', padding: '0.5rem 1rem', borderRadius: '50px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', height: '48px', marginTop: '6px' }}>
                          {banner.text} <span style={{marginLeft:'0.5rem'}}>〉</span>
                        </div>
                      )}
                    </a>
                  ) : null
                ))}
                
              </React.Fragment>
            ))}
          </div>
        </div>

        <section className="gallery-container">
          {filteredItems.length > 0 ? (
            <Gallery 
              items={filteredItems} 
              onImageClick={(item) => {
                if (item.itemType === 'blog') {
                  window.location.href = `/blogs/${item.id}`;
                } else {
                  setSelectedImage(item);
                }
              }} 
              likedItems={likedItems}
              onLikeToggle={handleLikeToggle}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              お探しの素材が見つかりません。別のキーワードやカテゴリをお試しください。
            </div>
          )}
        </section>
      </main>
      
      {/* 検索エンジン向けSEOテキストエリア (UIを邪魔しないように薄い文字で) */}
      <section style={{ maxWidth: '800px', margin: '4rem auto 0 auto', padding: '0 2rem', color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.8' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>ECデザイン・画像のフリー素材「ラクザイ」について</h2>
        <p>
          ラクザイは、楽天市場、Yahoo!ショッピング、Amazonなどで売上を伸ばすためのEC特化型フリー素材（画像・バナー・アイコン）ダウンロードサイトです。
          送料無料タグ、ポイントアップバナー、ランキング受賞の王冠アイコン、母の日やサマーセール特集の背景など、商品の転換率（CVR）やクリック率を向上させるデザインをご用意しています。
          すべての素材が無料で商用利用可能。面倒なクレジット表記も不要なため、日々の店舗運営やSNS（Instagram、LINE）運用ですぐにご活用いただけます。
        </p>
      </section>

      <Footer />

      {selectedImage && (
        <DownloadModal 
          image={selectedImage} 
          onClose={() => setSelectedImage(null)} 
        />
      )}
    </>
  );
}
