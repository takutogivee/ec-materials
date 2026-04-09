import React from 'react';
import { Sparkles, Camera, Heart, Download, BookOpen } from 'lucide-react';

export default function Gallery({ items, onImageClick, likedItems = [], onLikeToggle }) {
  return (
    <div className="gallery">
      {items.map((item) => {
        const isLiked = likedItems.includes(item.id);
        
        const getFormatText = (it) => {
          if (it.itemType === 'blog') return '記事';
          if (it.fileUrl) {
            const ext = it.fileUrl.split('.').pop().toLowerCase();
            if (['pdf'].includes(ext)) return 'PDF';
            if (['ai', 'eps'].includes(ext)) return 'AI';
            if (['psd'].includes(ext)) return 'PSD';
            if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return '画像';
            if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) return '資料';
            return ext.toUpperCase() || '素材';
          }
          return '素材';
        };
        const formatText = getFormatText(item);

        return (
        <div key={`${item.itemType}-${item.id}`} className="gallery-item" onClick={() => onImageClick(item)} style={{ position: 'relative' }}>
          {/* ドッグイヤー風タグ */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            background: item.itemType === 'blog' ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: '#fff',
            padding: '4px 12px',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            borderBottomRightRadius: '12px',
            zIndex: 10,
            boxShadow: '2px 2px 4px rgba(0,0,0,0.15)',
            letterSpacing: '0.05em'
          }}>
            {formatText}
          </div>
          {item.itemType === 'blog' && !item.url ? (
            <div style={{ width: '100%', aspectRatio: '16 / 9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', color: '#64748b' }}>
              <BookOpen size={40} style={{ opacity: 0.6, marginBottom: '0.5rem' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '0.05em', opacity: 0.8 }}>ARTICLE</span>
            </div>
          ) : (
            <img 
              src={item.url} 
              alt={`${item.title} ${item.category || ''} ${(item.tags || []).join(' ')}`} 
              loading="lazy" 
              onError={(e) => { e.target.onerror = null; e.target.src = '/logo.png'; }}
            />
          )}
          <div className="gallery-item-info" style={{ padding: '0.8rem' }}>
            <div className="item-title" style={{ color: 'var(--text-main)', fontSize: '1rem', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Download size={14} /> {item.downloads || 0}
                </span>
                <span 
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (onLikeToggle) onLikeToggle(item.id);
                  }}
                >
                  <Heart size={14} color={isLiked ? "#bf0000" : "var(--text-muted)"} fill={isLiked ? "#bf0000" : "none"} />
                  {item.likes || 0}
                </span>
              </div>
              <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('ja-JP') : ''}</span>
            </div>
            <div className="badge-container" style={{ flexWrap: 'wrap', marginTop: '0.5rem' }}>
              {item.itemType === 'blog' && (
                <span className="badge" style={{background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid #3b82f6'}}>ノウハウ記事</span>
              )}
              {item.category && (
                <span className="badge" style={{background: 'rgba(191,0,0,0.1)', color: 'var(--primary)', border: '1px solid var(--primary)'}}>{item.category}</span>
              )}
              {item.tags && item.tags.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="badge" style={{background: 'rgba(0,0,0,0.05)', color: '#555', border: '1px solid #ddd'}}>{tag}</span>
              ))}
            </div>
          </div>
          </div>
        );
      })}
    </div>
  );
}
