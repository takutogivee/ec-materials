import React from 'react';
import { Sparkles, Camera, Heart, Download, BookOpen } from 'lucide-react';

export default function Gallery({ items, onImageClick, likedItems = [], onLikeToggle }) {
  return (
    <div className="gallery">
      {items.map((item) => {
        const isLiked = likedItems.includes(item.id);
        
        return (
        <div key={`${item.itemType}-${item.id}`} className="gallery-item" onClick={() => onImageClick(item)}>
          {item.itemType === 'blog' && !item.url ? (
            <div style={{ width: '100%', aspectRatio: '1 / 1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', color: '#64748b' }}>
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
          <div className="gallery-overlay">
            <div className="gallery-top-actions">
              <button 
                className="action-btn" 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (onLikeToggle) onLikeToggle(item.id);
                }}
              >
                <Heart size={18} color={isLiked ? "#bf0000" : "var(--text-main)"} fill={isLiked ? "#bf0000" : "none"} />
              </button>
            </div>
            <div className="gallery-bottom-info">
              <div className="item-title">{item.title}</div>
              <div className="badge-container" style={{ flexWrap: 'wrap' }}>
                {item.itemType === 'blog' && (
                  <span className="badge" style={{background: '#3b82f6'}}>ノウハウ記事</span>
                )}
                {item.category && (
                  <span className="badge" style={{background: 'rgba(191,0,0,0.8)'}}>{item.category}</span>
                )}
                {item.tags && item.tags.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="badge" style={{background: 'rgba(0,0,0,0.6)'}}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
          </div>
        );
      })}
    </div>
  );
}
