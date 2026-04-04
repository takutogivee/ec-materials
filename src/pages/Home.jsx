import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search } from 'lucide-react';
import Gallery from '../components/Gallery.jsx';
import DownloadModal from '../components/DownloadModal.jsx';
import Header from '../components/Header.jsx';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [images, setImages] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [likedItems, setLikedItems] = useState([]);
  const [bannerConfig, setBannerConfig] = useState(null);

  useEffect(() => {
    fetch('/api/assets')
      .then(res => res.json())
      .then(data => setImages(data))
      .catch(err => console.error(err));
      
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setBannerConfig(data))
      .catch(err => console.error(err));
  }, []);

  const handleLikeToggle = (id) => {
    setLikedItems(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const filteredImages = images.filter(img => {
    let matchCategory = true;
    if (activeCategory) {
      matchCategory = img.tags.includes(activeCategory) || img.category === activeCategory;
    }
    
    let matchSearch = true;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      // 空白で分割して複数キーワードのAND検索等も可能だが今回は単純な含むチェック
      matchSearch = (
        img.title.toLowerCase().includes(query) ||
        img.tags.some(tag => tag.toLowerCase().includes(query)) ||
        (query === 'ai' && img.type === 'ai') ||
        (query === 'creator' && img.type === 'creator')
      );
    }
    
    return matchCategory && matchSearch;
  });

  // カルーセル用の配列
  const allTags = [
    { type: 'keyword', label: 'お買い物マラソン' },
    { type: 'keyword', label: '送料無料' },
    { type: 'keyword', label: 'ポイント倍' },
    { type: 'keyword', label: 'ランキング' },
    { type: 'keyword', label: '母の日' },
    { type: 'category', label: '全て' },
    { type: 'category', label: 'SNS投稿用' },
    { type: 'category', label: '広告 / バナー素材' },
    { type: 'category', label: 'EC / 商品画像' },
    { type: 'category', label: 'LP / Webサイト' },
    { type: 'category', label: '資料 / プレゼン' }
  ];

  // 無限ループ用に配列を長めに用意（3セット繋げる）
  const carouselItems = [...allTags, ...allTags, ...allTags];
  
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => {
        // 次のインデックスへ。全体の2/3を超えたらリセットして無限ループ風にする
        if (prev >= allTags.length * 2) {
          return allTags.length; // 真ん中のセットの先頭へジャンプ
        }
        return prev + 1;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [allTags.length]);

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
          
          {/* カテゴリ & サジェストの5秒スライダー */}
          <div style={{ width: '100%', overflow: 'hidden', position: 'relative', marginTop: '1rem', marginBottom: '0.5rem' }}>
            <div style={{
              display: 'flex',
              gap: '0.8rem',
              // 1アイテムあたり140px + gapを想定してtransformで動かす (約150px移動)
              transform: `translateX(-${slideIndex * 153}px)`,
              transition: slideIndex === allTags.length ? 'none' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
              willChange: 'transform'
            }}>
              {carouselItems.map((item, idx) => {
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
                    style={{ 
                      flex: '0 0 auto',
                      width: '140px',
                      height: '42px',
                      background: isActive ? 'var(--primary)' : '#fff', 
                      color: isActive ? 'white' : '#475569',
                      border: `1px solid ${isActive ? 'var(--primary)' : '#cbd5e1'}`, 
                      borderRadius: '8px', 
                      fontWeight: '600',
                      fontSize: '0.8rem', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background 0.2s, transform 0.2s',
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
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
          {filteredImages.length > 0 ? (
            <Gallery 
              images={filteredImages} 
              onImageClick={(img) => setSelectedImage(img)} 
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
      
      <footer style={{ background: 'var(--bg-surface)', padding: '2rem 1rem', borderTop: '1px solid var(--border)', marginTop: '4rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1rem' }}>
          <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none' }}>利用規約</a>
          <a href="https://givee.co.jp/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none' }}>運営会社 (Givee株式会社)</a>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          &copy; {new Date().getFullYear()} Givee Inc. All rights reserved.
        </div>
      </footer>

      {selectedImage && (
        <DownloadModal 
          image={selectedImage} 
          onClose={() => setSelectedImage(null)} 
        />
      )}
    </>
  );
}
