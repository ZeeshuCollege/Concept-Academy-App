import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  ArrowLeft, ChevronUp, ChevronDown, Layers, FileText, CheckCircle2
} from 'lucide-react';

export default function ProtectedPdfViewer({ 
  title, 
  subtitle, 
  studentName = 'Student', 
  rollNo = 'CONCEPT-ACADEMY', 
  onClose 
}) {
  const [zoom, setZoom] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isClosing, setIsClosing] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const [docHeight, setDocHeight] = useState(2600);

  const scrollContainerRef = useRef(null);
  const documentWrapperRef = useRef(null);
  const pageRefs = [useRef(null), useRef(null), useRef(null)];
  const pinchStartDistRef = useRef(null);
  const pinchStartZoomRef = useRef(1);

  const totalPages = 3;
  const timestamp = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const watermarkText = `${studentName} • Roll #${rollNo} • ${timestamp}`;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 280);
  };

  // Measure document height so container scroll space expands with zoom without overlapping
  useEffect(() => {
    if (documentWrapperRef.current) {
      setDocHeight(documentWrapperRef.current.scrollHeight || 2600);
    }
  }, []);

  // Native Pinch-To-Zoom and Double-Tap Zoom Gestures
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let lastTapTime = 0;

    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        pinchStartDistRef.current = dist;
        pinchStartZoomRef.current = zoom;
        setIsPinching(true);
      } else if (e.touches.length === 1) {
        // Double-tap anywhere on the document to toggle zoom (100% <-> 150%)
        const now = Date.now();
        if (now - lastTapTime < 300) {
          setZoom(prev => (prev > 1.1 ? 1 : 1.5));
          lastTapTime = 0;
        } else {
          lastTapTime = now;
        }
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 2 && pinchStartDistRef.current) {
        if (e.cancelable) e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const scaleFactor = dist / pinchStartDistRef.current;
        const targetZoom = +(pinchStartZoomRef.current * scaleFactor).toFixed(2);
        // Smoothly clamp zoom between 0.85x and 2.5x
        const clampedZoom = Math.min(2.5, Math.max(0.85, targetZoom));
        setZoom(clampedZoom);
      }
    };

    const handleTouchEnd = (e) => {
      if (e.touches.length < 2) {
        pinchStartDistRef.current = null;
        setIsPinching(false);
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [zoom]);

  // Listen to Android hardware back button / gesture to close viewer
  useEffect(() => {
    const handleAppBack = (e) => {
      if (showThumbnails) {
        setShowThumbnails(false);
        e.detail?.markHandled();
        return;
      }
      handleClose();
      e.detail?.markHandled();
    };

    window.addEventListener('app:back', handleAppBack);
    return () => window.removeEventListener('app:back', handleAppBack);
  }, [showThumbnails]);

  // Track active page as user scrolls (ScrollSpy)
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const containerTop = scrollContainerRef.current.scrollTop;
    
    pageRefs.forEach((ref, index) => {
      if (ref.current) {
        const offsetTop = (ref.current.offsetTop - 120) * zoom;
        const offsetBottom = offsetTop + ref.current.clientHeight * zoom;
        if (containerTop >= offsetTop && containerTop < offsetBottom) {
          setCurrentPage(index + 1);
        }
      }
    });
  };

  const scrollToPage = (pageNum) => {
    const targetRef = pageRefs[pageNum - 1];
    if (targetRef && targetRef.current) {
      targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setCurrentPage(pageNum);
      setShowThumbnails(false);
    }
  };

  const viewerContent = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100dvh',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        background: '#1e2430',
        color: '#f8fafc',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        animation: isClosing ? 'pdfFadeOut 0.28s ease forwards' : 'pdfFadeIn 0.28s ease forwards',
        overflow: 'hidden'
      }}
    >
      <style>{`
        @keyframes pdfFadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pdfFadeOut {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(0.98); }
        }
        .pdf-page-sheet {
          background: #ffffff;
          color: #0f172a;
          box-shadow: 0 10px 30px rgba(0,0,0,0.35);
          border-radius: 4px;
          margin-bottom: 24px;
          position: relative;
          user-select: none;
          -webkit-user-select: none;
          box-sizing: border-box;
          transition: transform 0.15s ease;
        }
        .pdf-page-sheet:last-child {
          margin-bottom: 90px;
        }
      `}</style>

      {/* =========================================================================
          TOP READER TOOLBAR (Chrome / Adobe Style)
         ========================================================================= */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        paddingTop: 'calc(10px + var(--safe-area-top, env(safe-area-inset-top, 0px)))',
        background: '#0f172a',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
        zIndex: 50,
        flexShrink: 0
      }}>
        {/* Left: Back Button & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
          <button
            onClick={handleClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              flexShrink: 0
            }}
            title="Back / Close"
          >
            <ArrowLeft size={20} />
          </button>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={14} color="#38bdf8" />
              <h4 style={{
                fontSize: '14px',
                fontWeight: 700,
                color: '#ffffff',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {title || 'Assessment Paper'}
              </h4>
            </div>
            <p style={{
              fontSize: '11px',
              color: '#94a3b8',
              margin: '2px 0 0 0',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {subtitle || 'Protected Document'}
            </p>
          </div>
        </div>

        {/* Right: Controls (Page Badge, Zoom, Thumbnails) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {/* Thumbnail Drawer Toggle */}
          <button
            onClick={() => setShowThumbnails(prev => !prev)}
            style={{
              background: showThumbnails ? '#0284c7' : 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 10px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            title="Pages"
          >
            <Layers size={15} />
            <span>{currentPage}/{totalPages}</span>
          </button>

          {/* Zoom % Indicator (Tap to reset) */}
          <button
            onClick={() => setZoom(1)}
            style={{
              background: zoom !== 1 ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.08)',
              border: zoom !== 1 ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '6px 10px',
              color: zoom !== 1 ? '#38bdf8' : '#e2e8f0',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Pinch to zoom • Tap to reset (100%)"
          >
            {Math.round(zoom * 100)}%
          </button>
        </div>
      </header>

      {/* =========================================================================
          MAIN VIEWER BODY (Smooth Scrollable Canvas with Multi-Page Sheets)
         ========================================================================= */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', overflow: 'hidden' }}>
        
        {/* Left Side Thumbnail Drawer (Collapsible) */}
        {showThumbnails && (
          <aside style={{
            width: '130px',
            background: '#0f172a',
            borderRight: '1px solid rgba(255,255,255,0.1)',
            overflowY: 'auto',
            padding: '12px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            flexShrink: 0,
            zIndex: 40
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
              Pages ({totalPages})
            </div>
            {[1, 2, 3].map(num => (
              <div
                key={num}
                onClick={() => scrollToPage(num)}
                style={{
                  cursor: 'pointer',
                  border: currentPage === num ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '6px',
                  padding: '8px 6px',
                  background: currentPage === num ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255,255,255,0.04)',
                  textAlign: 'center'
                }}
              >
                <div style={{
                  height: '70px',
                  background: '#ffffff',
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0f172a',
                  fontSize: '11px',
                  fontWeight: 800,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                }}>
                  P.{num}
                </div>
                <span style={{ fontSize: '11px', color: currentPage === num ? '#38bdf8' : '#cbd5e1', fontWeight: 600, marginTop: '4px', display: 'block' }}>
                  Page {num}
                </span>
              </div>
            ))}
          </aside>
        )}

        {/* Scrollable Canvas for PDF Pages */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          style={{
            flex: 1,
            height: '100%',
            overflowY: 'auto',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            overscrollBehaviorY: 'contain',
            padding: '16px 12px calc(100px + var(--safe-area-bottom, env(safe-area-inset-bottom, 0px))) 12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxSizing: 'border-box'
          }}
        >
          {/* Unified Document Sheet Stack — Scales all pages together so they NEVER overlap */}
          <div
            ref={documentWrapperRef}
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              width: '100%',
              maxWidth: '680px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: `${Math.max(40, (zoom - 1) * docHeight + 60)}px`,
              transition: isPinching ? 'none' : 'transform 0.15s ease'
            }}
          >
            {/* =========================================================================
                PAGE 1 OF 3: Assessment Header, Instructions & Questions 1 - 5
               ========================================================================= */}
            <div
              ref={pageRefs[0]}
              className="pdf-page-sheet"
              style={{
                width: '100%',
                maxWidth: '680px',
                minHeight: '850px',
                padding: '36px 28px'
              }}
            >
            {/* Diagonal Watermark Overlay */}
            <WatermarkOverlay text={watermarkText} />

            {/* Test Paper Header */}
            <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '20px', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{
                  background: 'var(--brand-900)',
                  color: '#ffffff',
                  padding: '3px 10px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 900,
                  letterSpacing: '0.08em'
                }}>
                  CONCEPT
                </span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--brand-900)' }}>ACADEMY</span>
              </div>
              <h2 style={{ fontSize: '17px', fontWeight: 900, color: '#0f172a', margin: '6px 0 2px 0' }}>
                {title || 'JEE ADVANCED MOCK ASSESSMENT'}
              </h2>
              <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-800)', margin: 0 }}>
                ACADEMIC SESSION 2025-26 • DEPARTMENT OF SCIENCE
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                marginTop: '14px',
                paddingTop: '10px',
                borderTop: '1px solid #e2e8f0',
                fontSize: '11.5px',
                fontWeight: 700,
                color: '#334155',
                textAlign: 'center'
              }}>
                <div>Subject: Physics</div>
                <div>Time: 90 Minutes</div>
                <div>Max Marks: 100</div>
              </div>
            </div>

            {/* Candidate Box */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '11px',
              color: '#475569',
              marginBottom: '18px'
            }}>
              <span><strong>Candidate:</strong> {studentName}</span>
              <span><strong>Roll No:</strong> {rollNo}</span>
              <span><strong>Set:</strong> A</span>
            </div>

            {/* General Instructions */}
            <div style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '6px',
              padding: '10px 14px',
              marginBottom: '20px',
              fontSize: '11.5px',
              color: '#92400e'
            }}>
              <strong style={{ display: 'block', marginBottom: '3px' }}>GENERAL INSTRUCTIONS:</strong>
              <ul style={{ margin: 0, paddingLeft: '16px', lineHeight: 1.5 }}>
                <li>Section I contains 5 MCQs with One Correct Option (+4, -1).</li>
                <li>Section II contains 5 Multi-Correct MCQs (+4, -2).</li>
                <li>Section III contains 5 Numerical Value Problems (+4, 0).</li>
                <li>Calculators, smart devices, or external resources are strictly prohibited.</li>
              </ul>
            </div>

            {/* SECTION I HEADER */}
            <div style={{
              background: '#0f172a',
              color: '#ffffff',
              padding: '5px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 800,
              marginBottom: '16px'
            }}>
              SECTION I — SINGLE CORRECT CHOICE QUESTIONS (Q.1 – Q.5)
            </div>

            {/* Questions 1 - 3 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '13px', lineHeight: 1.55 }}>
              <div>
                <p style={{ fontWeight: 700, margin: '0 0 6px 0' }}>
                  1. A particle of mass <i>m</i> is projected from the ground with velocity <i>u</i> at an angle θ with the horizontal. The radius of curvature of its trajectory at the highest point is:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', paddingLeft: '14px', fontSize: '12.5px' }}>
                  <div>(A) (u² cos²θ) / g</div>
                  <div>(B) (u² sin²θ) / g</div>
                  <div>(C) (u² cosθ) / 2g</div>
                  <div>(D) (2u² sinθ) / g</div>
                </div>
              </div>

              <div>
                <p style={{ fontWeight: 700, margin: '0 0 6px 0' }}>
                  2. A block of mass 2 kg is placed on a rough horizontal surface with coefficient of friction μ = 0.4. A horizontal force F = 6 N is applied on the block. The frictional force acting on the block is (take g = 10 m/s²):
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', paddingLeft: '14px', fontSize: '12.5px' }}>
                  <div>(A) 8 N</div>
                  <div>(B) 6 N</div>
                  <div>(C) 0 N</div>
                  <div>(D) 2 N</div>
                </div>
              </div>

              <div>
                <p style={{ fontWeight: 700, margin: '0 0 6px 0' }}>
                  3. A solid cylinder of mass M and radius R rolls without slipping down an inclined plane of inclination θ. The linear acceleration of its center of mass is:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', paddingLeft: '14px', fontSize: '12.5px' }}>
                  <div>(A) g sinθ</div>
                  <div>(B) (2/3) g sinθ</div>
                  <div>(C) (1/2) g sinθ</div>
                  <div>(D) (3/4) g sinθ</div>
                </div>
              </div>
            </div>

            {/* Page 1 Footer */}
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '28px',
              right: '28px',
              paddingTop: '10px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: '#64748b'
            }}>
              <span>CONCEPT ACADEMY • CONFIDENTIAL</span>
              <span style={{ fontWeight: 700 }}>Page 1 of 3</span>
            </div>
          </div>

          {/* =========================================================================
              PAGE 2 OF 3: Questions 4 - 8 (Section I Cont. & Section II Multi-Correct)
             ========================================================================= */}
            <div
              ref={pageRefs[1]}
              className="pdf-page-sheet"
              style={{
                width: '100%',
                maxWidth: '680px',
                minHeight: '850px',
                padding: '36px 28px'
              }}
            >
            <WatermarkOverlay text={watermarkText} />

            {/* Page 2 Top Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', marginBottom: '18px', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
              <span>{title || 'JEE ADVANCED MOCK ASSESSMENT'}</span>
              <span>SUBJECT: PHYSICS</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '13px', lineHeight: 1.55 }}>
              <div>
                <p style={{ fontWeight: 700, margin: '0 0 6px 0' }}>
                  4. An ideal gas undergoes an isothermal expansion from volume V to 2V, followed by an adiabatic compression back to volume V. If γ = 1.4, the final pressure compared to initial pressure P₀ is:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', paddingLeft: '14px', fontSize: '12.5px' }}>
                  <div>(A) P₀ (2)^(0.4)</div>
                  <div>(B) P₀ / (2)^(0.4)</div>
                  <div>(C) P₀</div>
                  <div>(D) 2 P₀</div>
                </div>
              </div>

              <div>
                <p style={{ fontWeight: 700, margin: '0 0 6px 0' }}>
                  5. Two point charges +q and -q are placed at a distance 2a apart. The electric potential at a distance r (r &gt;&gt; a) on the equatorial line is:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', paddingLeft: '14px', fontSize: '12.5px' }}>
                  <div>(A) Zero</div>
                  <div>(B) (1 / 4πε₀) · (q / r²)</div>
                  <div>(C) (1 / 4πε₀) · (qa / r²)</div>
                  <div>(D) (1 / 4πε₀) · (2q / r)</div>
                </div>
              </div>

              {/* SECTION II HEADER */}
              <div style={{
                background: '#0f172a',
                color: '#ffffff',
                padding: '5px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 800,
                marginTop: '10px'
              }}>
                SECTION II — ONE OR MORE THAN ONE CORRECT (Q.6 – Q.8)
              </div>

              <div>
                <p style={{ fontWeight: 700, margin: '0 0 6px 0' }}>
                  6. A uniform rod of length L and mass M is free to rotate in a vertical plane about a horizontal axis through its upper end. It is released from rest in the horizontal position. When it becomes vertical:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', paddingLeft: '14px', fontSize: '12.5px' }}>
                  <div>(A) Angular velocity ω = √(3g / L)</div>
                  <div>(B) Linear velocity of the lowest point is √(3gL)</div>
                  <div>(C) Acceleration of the center of mass is 3g / 2</div>
                  <div>(D) The hinge force is equal to 2.5 Mg</div>
                </div>
              </div>

              <div>
                <p style={{ fontWeight: 700, margin: '0 0 6px 0' }}>
                  7. In a Young's double slit experiment with monochromatic light of wavelength λ, which of the following changes will increase the fringe width β?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', paddingLeft: '14px', fontSize: '12.5px' }}>
                  <div>(A) Increasing distance D between slits and screen</div>
                  <div>(B) Decreasing separation d between the two slits</div>
                  <div>(C) Immersing the entire apparatus in water (n = 1.33)</div>
                  <div>(D) Using light of longer wavelength (e.g. red instead of blue)</div>
                </div>
              </div>
            </div>

            {/* Page 2 Footer */}
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '28px',
              right: '28px',
              paddingTop: '10px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: '#64748b'
            }}>
              <span>CONCEPT ACADEMY • IN-APP PROTECTED READER</span>
              <span style={{ fontWeight: 700 }}>Page 2 of 3</span>
            </div>
          </div>

          {/* =========================================================================
              PAGE 3 OF 3: Numerical Value Questions & Official End of Paper
             ========================================================================= */}
            <div
              ref={pageRefs[2]}
              className="pdf-page-sheet"
              style={{
                width: '100%',
                maxWidth: '680px',
                minHeight: '850px',
                padding: '36px 28px'
              }}
            >
            <WatermarkOverlay text={watermarkText} />

            {/* Page 3 Top Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', marginBottom: '18px', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
              <span>{title || 'JEE ADVANCED MOCK ASSESSMENT'}</span>
              <span>SECTION III: NUMERICAL VALUE</span>
            </div>

            {/* SECTION III HEADER */}
            <div style={{
              background: '#0f172a',
              color: '#ffffff',
              padding: '5px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 800,
              marginBottom: '16px'
            }}>
              SECTION III — NON-NEGATIVE INTEGER TYPE (Q.8 – Q.10)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontSize: '13px', lineHeight: 1.55 }}>
              <div>
                <p style={{ fontWeight: 700, margin: '0 0 8px 0' }}>
                  8. A wire of length 1 meter and resistance 10 Ω is connected across an accumulator of emf 2 V and internal resistance 1 Ω. A standard cell of emf 1.018 V is balanced across length <i>L</i> cm of the potentiometer wire. The value of <i>L</i> in cm is:
                </p>
                <div style={{
                  background: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '6px',
                  padding: '12px',
                  fontSize: '12px',
                  color: '#64748b'
                }}>
                  [ Workspace for Rough Calculation ]
                </div>
              </div>

              <div>
                <p style={{ fontWeight: 700, margin: '0 0 8px 0' }}>
                  9. A ray of light incident at an angle of 60° on a face of a prism of refractive angle 30° emerges normally from the other face. The refractive index of the material of the prism is √<i>n</i>. Find the integer value of <i>n</i>:
                </p>
                <div style={{
                  background: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '6px',
                  padding: '12px',
                  fontSize: '12px',
                  color: '#64748b'
                }}>
                  [ Workspace for Rough Calculation ]
                </div>
              </div>

              <div>
                <p style={{ fontWeight: 700, margin: '0 0 8px 0' }}>
                  10. Find the self-inductance (in millihenry) of a solenoid of 500 turns wound uniformly on a cylinder of diameter 2 cm and length 50 cm. (Take π² ≈ 10):
                </p>
                <div style={{
                  background: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '6px',
                  padding: '12px',
                  fontSize: '12px',
                  color: '#64748b'
                }}>
                  [ Workspace for Rough Calculation ]
                </div>
              </div>
            </div>

            {/* Official End of Paper Seal */}
            <div style={{
              marginTop: '40px',
              padding: '16px',
              borderRadius: '8px',
              background: '#f0fdf4',
              border: '1.5px dashed #86efac',
              textAlign: 'center'
            }}>
              <CheckCircle2 size={24} color="#16a34a" style={{ margin: '0 auto 6px auto' }} />
              <h5 style={{ fontSize: '14px', fontWeight: 800, color: '#166534', margin: 0 }}>
                *** END OF QUESTION PAPER ***
              </h5>
              <p style={{ fontSize: '11px', color: '#15803d', margin: '4px 0 0 0' }}>
                All questions vetted by Concept Academy Academic Council • Full solutions will be published after test window closes.
              </p>
            </div>

            {/* Page 3 Footer */}
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '28px',
              right: '28px',
              paddingTop: '10px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: '#64748b'
            }}>
              <span>CONCEPT ACADEMY • SECURE EXAM SYSTEM</span>
              <span style={{ fontWeight: 700 }}>Page 3 of 3</span>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* =========================================================================
          BOTTOM FLOATING CONTROLLER DOCK (Adobe / Google Drive Style)
         ========================================================================= */}
      <footer style={{
        position: 'absolute',
        bottom: 'calc(18px + var(--safe-area-bottom, env(safe-area-inset-bottom, 0px)))',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.16)',
        borderRadius: '30px',
        padding: '6px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
        zIndex: 100
      }}>
        {/* Previous Page */}
        <button
          onClick={() => scrollToPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          style={{
            background: 'none',
            border: 'none',
            color: currentPage === 1 ? '#475569' : '#ffffff',
            cursor: currentPage === 1 ? 'default' : 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center'
          }}
          title="Previous Page"
        >
          <ChevronUp size={18} />
        </button>

        {/* Page Counter Badge */}
        <span style={{
          fontSize: '12px',
          fontWeight: 700,
          color: '#ffffff',
          letterSpacing: '0.02em',
          padding: '2px 8px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px'
        }}>
          Page {currentPage} of {totalPages}
        </span>

        {/* Next Page */}
        <button
          onClick={() => scrollToPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          style={{
            background: 'none',
            border: 'none',
            color: currentPage === totalPages ? '#475569' : '#ffffff',
            cursor: currentPage === totalPages ? 'default' : 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center'
          }}
          title="Next Page"
        >
          <ChevronDown size={18} />
        </button>
      </footer>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(viewerContent, document.body) : viewerContent;
}

/**
 * Reusable Semi-Transparent Diagonal Watermark Overlay
 */
function WatermarkOverlay({ text }) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-around',
      opacity: 0.11,
      zIndex: 10
    }}>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div
          key={i}
          style={{
            transform: 'rotate(-24deg)',
            fontSize: '15px',
            fontWeight: 800,
            color: '#0f172a',
            whiteSpace: 'nowrap',
            textAlign: 'center',
            letterSpacing: '2.5px'
          }}
        >
          {text} • CONCEPT ACADEMY CONFIDENTIAL
        </div>
      ))}
    </div>
  );
}
