import React from 'react';
import { Bell } from 'lucide-react';

export default function Header({ currentRole, onOpenNotifications, unreadCount = 0 }) {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      paddingTop: 'calc(12px + var(--safe-area-top, env(safe-area-inset-top, 0px)))',
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)'
    }}>
      {/* Brand & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          border: '1px solid var(--border)',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          boxShadow: '0 2px 6px rgba(10, 31, 61, 0.08)'
        }}>
          <img
            src="/logo.png"
            alt="Concept Academy Logo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <h2 style={{
              fontSize: '17px',
              fontWeight: 900,
              color: 'var(--brand-900)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              margin: 0
            }}>
              CONCEPT
            </h2>
            <span style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: 'var(--accent-500)',
              display: 'inline-block'
            }} />
          </div>
          <span style={{
            fontSize: '9.5px',
            color: 'var(--accent-600)',
            fontFamily: 'var(--font-body)',
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase'
          }}>
            ACADEMY
          </span>
        </div>
      </div>

      {/* Right Controls: Role Badge & Notifications Bell */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{
          padding: '4px 10px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--accent-50)',
          border: '1px solid var(--border-accent)',
          fontSize: '10.5px',
          fontWeight: 800,
          color: 'var(--accent-700)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-500)' }} />
          {currentRole?.toUpperCase() || 'STUDENT'}
        </span>

        {/* Notifications Icon Button */}
        <button
          onClick={onOpenNotifications}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.22s var(--ease-smooth)'
          }}
          title={`Notice Board ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        >
          <Bell size={18} color="var(--brand-900)" />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              minWidth: '18px',
              height: '18px',
              padding: '0 4px',
              background: 'linear-gradient(135deg, var(--accent-600), var(--accent-500))',
              color: '#ffffff',
              borderRadius: '9999px',
              border: '1.5px solid var(--surface)',
              fontFamily: 'var(--font-mono)',
              fontSize: '9.5px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(234, 88, 12, 0.35)'
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
