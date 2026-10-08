import React, { useState } from 'react';
import { X, Bell, CheckCheck, AlertTriangle, FileText, CheckCircle2, BookOpen, DollarSign, Clock } from 'lucide-react';
import { useSwipeDownDismiss } from '../../lib/systemNavigation';

export default function NotificationsModal({ isOpen, onClose, notices = [], onMarkAllRead, onNoticeClick }) {
  const [filter, setFilter] = useState('All');
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 380);
  };

  const { dragOffset, touchHandlers } = useSwipeDownDismiss(handleClose);

  if (!isOpen) return null;

  const unreadCount = notices.filter(n => !n.read).length;

  const filteredNotices = notices.filter(n => {
    if (filter === 'Unread') return !n.read;
    if (filter === 'Tests') return n.category === 'Test';
    if (filter === 'Academic') return n.category === 'Material' || n.category === 'Attendance';
    if (filter === 'Notices') return n.category === 'Notice' || n.category === 'Fee';
    return true;
  });

  const getCategoryMeta = (category) => {
    switch (category) {
      case 'Test':
        return { icon: FileText, bg: '#fffbeb', color: '#d97706', border: '#fde68a', label: 'Assessment' };
      case 'Attendance':
        return { icon: CheckCircle2, bg: '#ecfdf5', color: '#16a34a', border: '#bbf7d0', label: 'Attendance' };
      case 'Material':
        return { icon: BookOpen, bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', label: 'Study Material' };
      case 'Fee':
        return { icon: DollarSign, bg: '#fdf4ff', color: '#c026d3', border: '#f5d0fe', label: 'Fee Account' };
      default:
        return { icon: Bell, bg: '#f1f5f9', color: '#475569', border: '#e2e8f0', label: 'Notice' };
    }
  };

  return (
    <div
      className={`modal-backdrop-05s ${isClosing ? 'closing' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className={`modal-sheet-05s ${isClosing ? 'closing' : ''}`}
        style={{
          maxHeight: '88vh',
          transform: dragOffset > 0 ? `translate3d(0, ${dragOffset}px, 0)` : undefined,
          transition: dragOffset > 0 ? 'none' : undefined
        }}
      >
        {/* Native Mobile Drag Handle & Header Swipe-down trigger */}
        <div
          {...touchHandlers}
          style={{ width: '100%', padding: '6px 0 2px 0', cursor: 'grab', touchAction: 'none' }}
        >
          <div className="sheet-drag-handle" />
        </div>

        {/* Top Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'var(--brand-950)',
              border: '1px solid var(--brand-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Bell size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--brand-900)', letterSpacing: '-0.01em' }}>Notice Board</h3>
                {unreadCount > 0 && (
                  <span className="badge badge-danger" style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '9999px' }}>
                    {unreadCount} New
                  </span>
                )}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Latest updates & announcements</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                style={{
                  background: 'var(--surface-alt)',
                  border: '1px solid var(--border)',
                  color: 'var(--brand-800)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  transition: 'var(--transition-smooth)'
                }}
                title="Mark all as read"
              >
                <CheckCheck size={14} /> Mark Read
              </button>
            )}
            <button
              onClick={handleClose}
              style={{
                background: 'var(--surface-alt)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                transition: 'var(--transition-smooth)'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Filter Switcher Tabs */}
        <div style={{ display: 'flex', gap: '8px', padding: '10px 20px', overflowX: 'auto', borderBottom: '1px solid var(--border)', background: 'var(--surface-alt)' }}>
          {['All', 'Unread', 'Tests', 'Academic', 'Notices'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                border: filter === f ? '1px solid var(--brand-900)' : '1px solid var(--border)',
                background: filter === f ? 'var(--brand-900)' : 'var(--surface)',
                color: filter === f ? '#ffffff' : 'var(--text-secondary)',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: filter === f ? '0 2px 6px rgba(10, 31, 61, 0.18)' : 'none',
                transition: 'var(--transition-smooth)'
              }}
            >
              {f} {f === 'Unread' && unreadCount > 0 ? `(${unreadCount})` : ''}
            </button>
          ))}
        </div>

        {/* Notice List (Latest to Oldest) */}
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
          {filteredNotices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <Bell size={36} style={{ margin: '0 auto 10px auto', opacity: 0.4 }} />
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-secondary)' }}>No notices in this view</h4>
              <p style={{ fontSize: '12px', marginTop: '4px' }}>Check other filters for updates.</p>
            </div>
          ) : (
            filteredNotices.map((notice) => {
              const meta = getCategoryMeta(notice.category);
              const Icon = meta.icon;

              return (
                <div
                  key={notice.id}
                  onClick={() => onNoticeClick && onNoticeClick(notice.id)}
                  style={{
                    flexShrink: 0,
                    background: notice.read ? 'var(--surface)' : 'var(--accent-50)',
                    border: `1px solid ${notice.read ? 'var(--border)' : 'var(--accent-200)'}`,
                    borderLeft: `4px solid ${meta.color}`,
                    borderRadius: '14px',
                    padding: '14px',
                    display: 'flex',
                    gap: '12px',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'var(--transition-smooth)',
                    boxShadow: notice.read ? 'var(--shadow-card)' : '0 4px 12px rgba(234, 88, 12, 0.08)'
                  }}
                >
                  {/* Category Icon Badge */}
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: meta.bg,
                    color: meta.color,
                    border: `1px solid ${meta.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={18} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: meta.color, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'JetBrains Mono, monospace' }}>
                        {meta.label}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px', fontFamily: 'JetBrains Mono, monospace' }}>
                          <Clock size={11} /> {notice.timestamp}
                        </span>
                        {!notice.read && (
                          <span style={{ width: '8px', height: '8px', borderRadius: '9999px', background: 'var(--accent-500)', display: 'inline-block' }} />
                        )}
                      </div>
                    </div>

                    <h4 style={{ fontSize: '13.5px', fontWeight: notice.read ? 600 : 800, color: 'var(--text-primary)', lineHeight: 1.35 }}>
                      {notice.title}
                    </h4>

                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
                      {notice.message}
                    </p>

                    {/* Course tags if present */}
                    {notice.courses && notice.courses.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                        {notice.courses.map((c, i) => (
                          <span key={i} className="badge" style={{
                            fontSize: '9.5px',
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            background: c === 'All Courses' || c === 'All' ? 'var(--surface-alt)' : '#eff6ff',
                            color: c === 'All Courses' || c === 'All' ? 'var(--text-secondary)' : '#1d4ed8',
                            border: c === 'All Courses' || c === 'All' ? '1px solid var(--border)' : '1px solid #bfdbfe'
                          }}>
                            {c === 'All Courses' || c === 'All' ? '🌐 All Courses' : `🎯 ${c}`}
                          </span>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span>{notice.date}</span>
                      {notice.priority === 'high' && (
                        <span style={{ color: 'var(--danger)', fontWeight: 700, fontSize: '10px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <AlertTriangle size={11} /> Urgent
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Note */}
        <div style={{
          padding: '12px 20px',
          background: 'var(--surface-alt)',
          borderTop: '1px solid var(--border)',
          textAlign: 'center',
          fontSize: '11px',
          color: 'var(--text-muted)'
        }}>
          Concept Academy Closed Ecosystem • Real-time Instant Delivery Active
        </div>
      </div>
    </div>
  );
}
