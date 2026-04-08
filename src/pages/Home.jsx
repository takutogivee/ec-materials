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
  const [likedItems, setLikedItems] = useState([]);
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

  // 動的にカテゴリとタグを抽出
  const dynamicCategories = Array.from(new Set(mixedItems.map(item => item.category).filter(Boolean)));
  const dynamicTags = Array.from(new Set(mixedItems.flatMap(item => item.tags || []).filter(Boolean)));

  // 固定の表示順
  const fixedCategories = ['全て', 'SNS投稿用', '広告 / バナー素材', 'EC / 商品画像', 'LP / Webサイト', '資料 / プレゼン'];
  const fixedTags = ['お買い物マラソン', '送料無料', 'ポイント倍', 'ランキング', '母の日'];

  // 重複排除しながらマージ
  const mergedCategories = [...new Set([...fixedCategories, ...dynamicCategories])].map(label => ({ type: 'category', label }));
  const mergedTags = [...new Set([...fixedTags, ...dynamicTags])].map(label => ({ type: 'keyword', label }));

  const allTags = [...mergedCategories, ...mergedTags];

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

        {/* 流れるバナー表示領域 */}
        {(bannerConfig && bannerConfig.topBannerActive && bannerConfig.topBanners && bannerConfig.topBanners.length > 0) && (
          <div className="marquee-container" style={{ background: 'var(--bg-surface)', marginTop: '0', marginBottom: '1rem', padding: '0.75rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
            <div className="marquee-content" style={{ gap: '2rem' }}>
              {/* スムーズな無限ループのために配列全体を10回リピート */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((repeatIndex) => (
                <React.Fragment key={repeatIndex}>
                  {bannerConfig.topBanners.map((banner) => (
                    (banner.imgUrl || banner.text) ? (
                      <a 
                        key={`${repeatIndex}-${banner.id}`}
                        href={banner.url || '#'} 
                        target={banner.url ? "_blank" : "_self"}
                        rel="noopener noreferrer"
                        style={{ 
                          color: '#bf0101', fontWeight: 'bold', fontSize: '0.95rem',
                          textDecoration: 'none', transition: 'opacity 0.2s', whiteSpace: 'nowrap',
                          display: 'flex', alignItems: 'center'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                        onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                      >
                        {banner.imgUrl ? (
                          <img 
                            src={banner.imgUrl} 
                            alt={banner.text || '特集バナー'} 
                            style={{ width: '150px', height: '78px', objectFit: 'cover', borderRadius: '4px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                          />
                        ) : (
                          <>
                            {banner.text} <span style={{marginLeft:'0.5rem'}}>〉</span>
                          </>
                        )}
                      </a>
                    ) : null
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

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
