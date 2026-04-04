import React from 'react';
import { Building2, TrendingUp, MonitorPlay, MessageCircle, ExternalLink, Heart } from 'lucide-react';

export default function Header({ likedCount }) {
  return (
    <header className="global-header">
      <div className="header-top">
        <div className="logo" style={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          <img src="/logo.png" alt="ラクザイ" className="logo-img" style={{ objectFit: 'contain' }} />
        </div>
        
        <div className="header-right" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <a href="https://givee.co.jp/lp/rakuten-consulting" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
            <img src="/contact-btn.png" alt="売上を伸ばす無料相談" className="contact-img" style={{ objectFit: 'contain' }} />
          </a>
          <a href="https://www.pitaliy.com/signup?step=1" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
            <img src="/contact-btn2.png" alt="お問い合わせ" className="contact-img" style={{ objectFit: 'contain' }} />
          </a>
        </div>
      </div>

      <nav className="header-nav">
        <a href="https://givee.co.jp/lp/rakuten-consulting" target="_blank" rel="noopener noreferrer" className="nav-link">
          <Building2 size={16} /> 運営会社 Givee株式会社
        </a>
        <a href="https://givee.co.jp/lp/rakuten-consulting" target="_blank" rel="noopener noreferrer" className="nav-link">
          <TrendingUp size={16} /> 楽天コンサル
        </a>
        <a href="https://givee.co.jp/lp/athlee" target="_blank" rel="noopener noreferrer" className="nav-link">
          <ExternalLink size={16} /> ECを伸ばすアスリート支援
        </a>
        <a href="https://givee.co.jp/lp/tiktok" target="_blank" rel="noopener noreferrer" className="nav-link">
          <MonitorPlay size={16} /> 1再生4円の再生報酬型SNS運用
        </a>
        <a href="https://aivy.tokyo/clp" target="_blank" rel="noopener noreferrer" className="nav-link">
          <MessageCircle size={16} /> 無料から使えるLINE増加チャット
        </a>
      </nav>
    </header>
  );
}
