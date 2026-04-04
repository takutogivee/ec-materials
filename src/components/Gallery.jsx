import React from 'react';
import { Sparkles, Camera, Heart, Download } from 'lucide-react';

export default function Gallery({ images, onImageClick, likedItems = [], onLikeToggle }) {
  return (
    <div className="gallery">
      {images.map((img) => {
        const isLiked = likedItems.includes(img.id);
        
        return (
        <div key={img.id} className="gallery-item" onClick={() => onImageClick(img)}>
          <img 
            src={img.url} 
            alt={img.title} 
            loading="lazy" 
            onError={(e) => { e.target.onerror = null; e.target.src = '/logo.png'; }}
          />
          <div className="gallery-overlay">
            <div className="gallery-top-actions">
              <button 
                className="action-btn" 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (onLikeToggle) onLikeToggle(img.id);
                }}
              >
                <Heart size={18} color={isLiked ? "#bf0000" : "var(--text-main)"} fill={isLiked ? "#bf0000" : "none"} />
              </button>
            </div>
            <div className="gallery-bottom-info">
              <div className="item-title">{img.title}</div>
              {img.resolution && (
                <div className="badge-container">
                  <span className="badge" style={{background: 'rgba(0,0,0,0.5)'}}>{img.resolution}</span>
                </div>
              )}
            </div>
          </div>
          </div>
        );
      })}
    </div>
  );
}
