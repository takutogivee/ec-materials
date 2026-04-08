import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--bg-surface)', padding: '2.5rem 1rem 2rem', borderTop: '1px solid var(--border)', marginTop: '4rem', textAlign: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
        <img src="/logo.png" alt="ラクザイ" style={{ height: '36px', objectFit: 'contain', opacity: 0.8 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
        <Link to="/terms" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--primary)'} onMouseOut={e => e.target.style.color = 'var(--text-muted)'}>
          利用規約
        </Link>
        <a href="https://givee.co.jp/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--primary)'} onMouseOut={e => e.target.style.color = 'var(--text-muted)'}>
          運営会社 (Givee株式会社)
        </a>
      </div>
      <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
        &copy; {new Date().getFullYear()} Givee Inc. All rights reserved.
      </div>
    </footer>
  );
}
