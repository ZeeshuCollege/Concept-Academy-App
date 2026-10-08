import React, { useState, useEffect } from 'react';

export default function OpeningScreen({ isLoggedIn, onOpenLogin, onProceed }) {
  const [isExiting, setIsExiting] = useState(false);

  // When already logged in, show as opening splash screen with no button and auto-proceed
  useEffect(() => {
    if (isLoggedIn) {
      const timer = setTimeout(() => {
        handleProceed();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn]);

  const handleProceed = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      onProceed();
    }, 420);
  };

  return (
    <div
      onClick={isLoggedIn ? handleProceed : undefined}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        overflow: 'hidden',
        userSelect: 'none',
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? 'scale(1.03)' : 'scale(1)',
        transition: 'opacity 0.42s cubic-bezier(0.4, 0, 0.2, 1), transform 0.42s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: isLoggedIn ? 'pointer' : 'default'
      }}
    >
      {/* Soft Pastel Organic Background Blobs matching screenshot */}
      <div style={{
        position: 'absolute',
        top: '-30px',
        left: '-30px',
        width: '180px',
        height: '200px',
        background: '#fed7aa',
        opacity: 0.55,
        borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
        filter: 'blur(30px)',
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'absolute',
        top: '-20px',
        right: '-30px',
        width: '190px',
        height: '210px',
        background: '#bae6fd',
        opacity: 0.65,
        borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
        filter: 'blur(32px)',
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'absolute',
        bottom: '80px',
        left: '-40px',
        width: '210px',
        height: '230px',
        background: '#e0e7ff',
        opacity: 0.65,
        borderRadius: '50% 50% 40% 60% / 50% 40% 60% 50%',
        filter: 'blur(36px)',
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'absolute',
        bottom: '120px',
        right: '-30px',
        width: '170px',
        height: '200px',
        background: '#fecdd3',
        opacity: 0.55,
        borderRadius: '40% 60% 50% 50% / 60% 40% 50% 50%',
        filter: 'blur(32px)',
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'absolute',
        bottom: '-20px',
        left: '15%',
        right: '15%',
        height: '110px',
        background: '#e0f2fe',
        opacity: 0.6,
        borderRadius: '50%',
        filter: 'blur(28px)',
        pointerEvents: 'none'
      }} />

      {/* Top spacer / status bar area */}
      <div style={{ height: '50px', width: '100%', flexShrink: 0 }} />

      {/* Center Branding & Tagline Content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        padding: '0 24px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Official Concept Academy 3D Medallion Logo */}
        <div style={{
          width: '175px',
          height: '175px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          filter: 'drop-shadow(0 14px 28px rgba(15, 46, 90, 0.22))'
        }}>
          <img
            src="/logo.png"
            alt="Concept Academy"
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'contain'
            }}
          />
        </div>

        {/* Tagline */}
        <div style={{ textAlign: 'center', marginTop: '54px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 800,
            color: '#1e293b',
            lineHeight: 1.35,
            margin: 0,
            letterSpacing: '-0.01em'
          }}>
            Better Learning<br />Bigger Dreams
          </h2>
        </div>
      </div>

      {/* Bottom Area: Shows ONLY Login button if not logged in, NO buttons if already logged in */}
      <div style={{
        width: '100%',
        padding: '0 32px calc(28px + var(--safe-area-bottom, env(safe-area-inset-bottom, 0px))) 32px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        minHeight: '110px'
      }}>
        {!isLoggedIn ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenLogin();
            }}
            style={{
              width: '100%',
              maxWidth: '300px',
              padding: '15px 28px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, var(--brand-950) 0%, var(--brand-900) 100%)',
              border: '1px solid var(--accent-500)',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(10, 31, 61, 0.25)',
              transition: 'var(--transition-smooth)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 28px rgba(10, 31, 61, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(10, 31, 61, 0.25)';
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
            onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
            onTouchEnd={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Access Portal // Sign In
          </button>
        ) : (
          /* When already logged in, no button is shown - subtle splash hint */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            opacity: 0.8
          }}>
            <div style={{
              width: '36px',
              height: '4px',
              borderRadius: '9999px',
              background: 'linear-gradient(90deg, var(--brand-700), var(--accent-500))',
              animation: 'topLoaderSlide 1.2s infinite ease-in-out'
            }} />
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
              INITIALIZING SESSION...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
