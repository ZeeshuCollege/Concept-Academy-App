import React, { useState, useEffect } from 'react';
import { User, Lock, HelpCircle, LogOut, ChevronRight, ShieldCheck, FileText, Trash2, Camera } from 'lucide-react';
import PersonalDetailsModal from './PersonalDetailsModal';
import ManagePasswordModal from './ManagePasswordModal';
import ChangeAvatarModal from '../common/ChangeAvatarModal';
import DeleteAccountModal from './DeleteAccountModal';

export default function StudentProfile({ user, onLogout, onUpdateAvatar, onUpdateUser, onOpenPermissions }) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isManagePasswordOpen, setIsManagePasswordOpen] = useState(false);
  const [isChangeAvatarOpen, setIsChangeAvatarOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);

  // Intercept back button for profile submodals
  useEffect(() => {
    const handleProfileBack = (e) => {
      if (isDeleteAccountOpen) {
        setIsDeleteAccountOpen(false);
        e.detail?.markHandled?.();
        return;
      }
      if (isChangeAvatarOpen) {
        setIsChangeAvatarOpen(false);
        e.detail?.markHandled?.();
        return;
      }
      if (isManagePasswordOpen) {
        setIsManagePasswordOpen(false);
        e.detail?.markHandled?.();
        return;
      }
      if (isDetailsOpen) {
        setIsDetailsOpen(false);
        e.detail?.markHandled?.();
        return;
      }
    };
    window.addEventListener('app:back', handleProfileBack);
    return () => window.removeEventListener('app:back', handleProfileBack);
  }, [isDeleteAccountOpen, isChangeAvatarOpen, isManagePasswordOpen, isDetailsOpen]);

  const isTeacher = user?.role === 'teacher';
  const isParent = user?.role === 'parent';
  const isAdmin = user?.role === 'admin';

  // Dynamic Subtitle
  const subtitle = isTeacher
    ? (user.subject || user.subjects || 'Faculty')
    : isParent
    ? (user.linkedChild?.name ? `Parent of ${user.linkedChild.name}` : user.linkedChildName ? `Parent of ${user.linkedChildName}` : 'Parent')
    : isAdmin
    ? 'System Administrator'
    : (user.course || 'Student');

  // Dynamic Verification Badge
  const roleBadgeLabel = isTeacher
    ? 'Verified Concept Academy Teacher'
    : isParent
    ? 'Verified Concept Academy Parent'
    : isAdmin
    ? 'Verified Concept Academy Admin'
    : 'Verified Concept Academy Student';

  // Dynamic Personal Details Badge
  const personalDetailsBadge = isTeacher
    ? (user.employeeId || 'ID #018')
    : isParent
    ? 'Parent ID'
    : isAdmin
    ? 'Admin ID'
    : (user.rollNumber ? `#${user.rollNumber.split('-').pop()}` : 'Roll #104');

  const menuItems = [
    { icon: User, label: 'Personal Details', badge: personalDetailsBadge },
    { icon: Lock, label: 'Manage Password', badge: null },
    { icon: ShieldCheck, label: 'Device Permissions', badge: 'Active' },
    { icon: FileText, label: 'Privacy Policy', badge: null },
    { icon: Trash2, label: 'Delete Account & Data', badge: null, isDanger: true },
    { icon: HelpCircle, label: 'Help & Support', badge: null }
  ];

  return (
    <div className="view-transition-enter" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '90px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--brand-900)', margin: 0, letterSpacing: '-0.02em' }}>
            System Profile
          </h3>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            USER_IDENTITY // ACCESS_TIER
          </span>
        </div>
        <span className="badge badge-success" style={{ borderRadius: '9999px' }}>
          ACTIVE AUTH
        </span>
      </div>

      {/* User Card - Smooth Curved Architecture */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px', borderRadius: '16px' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img
            src={user.avatar}
            alt={user.name}
            onClick={() => setIsChangeAvatarOpen(true)}
            style={{ width: '64px', height: '64px', borderRadius: '16px', objectFit: 'cover', border: '2px solid var(--accent-500)', cursor: 'pointer', boxShadow: '0 4px 10px rgba(234, 88, 12, 0.15)' }}
            title="Click to change profile picture"
          />
          <button
            type="button"
            onClick={() => setIsChangeAvatarOpen(true)}
            aria-label="Change profile picture"
            style={{
              position: 'absolute',
              bottom: '-3px',
              right: '-3px',
              width: '24px',
              height: '24px',
              borderRadius: '9999px',
              background: 'var(--accent-500)',
              border: '2px solid #ffffff',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'var(--transition-smooth)'
            }}
            title="Change Profile Picture"
          >
            <Camera size={12} strokeWidth={2.5} />
          </button>
        </div>
        <div>
          <h4 style={{ fontSize: '17px', fontWeight: 900, color: 'var(--brand-900)', margin: 0, letterSpacing: '-0.02em' }}>
            {user.name}
          </h4>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0', fontFamily: 'var(--font-mono)' }}>
            {subtitle}
          </p>
          <span className="badge badge-info" style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px', borderRadius: '9999px' }}>
            <ShieldCheck size={11} />
            {roleBadgeLabel}
          </span>
        </div>
      </div>

      {/* Navigation List - Sharp Frame */}
      <div className="card" style={{ padding: '4px 16px', display: 'flex', flexDirection: 'column' }}>
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              onClick={() => {
                if (item.label === 'Personal Details') {
                  setIsDetailsOpen(true);
                } else if (item.label === 'Manage Password') {
                  setIsManagePasswordOpen(true);
                } else if (item.label === 'Device Permissions' && onOpenPermissions) {
                  onOpenPermissions();
                } else if (item.label === 'Privacy Policy') {
                  window.open('/privacy-policy.html', '_blank');
                } else if (item.label === 'Delete Account & Data') {
                  setIsDeleteAccountOpen(true);
                } else if (item.label === 'Help & Support') {
                  window.location.href = 'mailto:conceptacademy@outlook.com';
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 0',
                borderBottom: index < menuItems.length - 1 ? '1px solid var(--border)' : 'none',
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={18} color={item.isDanger ? '#dc2626' : 'var(--brand-800)'} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: item.isDanger ? '#dc2626' : 'var(--text-primary)' }}>{item.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {item.badge && (
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.badge}</span>
                )}
                <ChevronRight size={16} color="var(--text-muted)" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Personal Details Modal (0.5s Bottom-to-Top Pop-up) */}
      <PersonalDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        user={user}
        onSaveUser={onUpdateUser}
      />

      {/* Manage Password Modal (0.5s Bottom-to-Top Pop-up) */}
      <ManagePasswordModal
        isOpen={isManagePasswordOpen}
        onClose={() => setIsManagePasswordOpen(false)}
        user={user}
      />

      {/* Change Avatar Modal (0.5s Bottom-to-Top Pop-up, Camera & Media Access) */}
      <ChangeAvatarModal
        isOpen={isChangeAvatarOpen}
        onClose={() => setIsChangeAvatarOpen(false)}
        currentAvatar={user.avatar}
        onSaveAvatar={onUpdateAvatar}
      />

      {/* Delete Account Modal (Google Play Compliance) */}
      <DeleteAccountModal
        isOpen={isDeleteAccountOpen}
        onClose={() => setIsDeleteAccountOpen(false)}
        user={user}
        onAccountDeleted={onLogout}
      />

      {/* Log Out Button */}
      <button
        onClick={onLogout}
        style={{
          background: '#fff1f2',
          border: '1px solid #fecdd3',
          color: '#e11d48',
          borderRadius: '12px',
          padding: '13px',
          fontSize: '14px',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'var(--transition-smooth)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#ffe4e6';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#fff1f2';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
      >
        <LogOut size={16} />
        Log Out
      </button>
    </div>
  );
}
