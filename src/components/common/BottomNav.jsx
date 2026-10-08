import React from 'react';
import { Home, Calendar, BookOpen, FileText, User, Users, BarChart2, DollarSign, UserCheck, UserPlus } from 'lucide-react';
import { useSystemNavigation } from '../../lib/systemNavigation';

export default function BottomNav({ role, activeTab, setActiveTab }) {
  const { navMode, isKeyboardOpen } = useSystemNavigation();

  // Define nav configurations per role based on CONCEPT ACADEMY THEME.png
  const navConfigs = {
    student: [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'classes', label: 'Classes', icon: Calendar },
      { id: 'tests', label: 'Tests', icon: FileText },
      { id: 'materials', label: 'Materials', icon: BookOpen },
      { id: 'profile', label: 'Profile', icon: User }
    ],
    teacher: [
      { id: 'home', label: 'Dashboard', icon: Home },
      { id: 'batches', label: 'Batches', icon: Users },
      { id: 'performance', label: 'Performance', icon: BarChart2 },
      { id: 'profile', label: 'Profile', icon: User }
    ],
    parent: [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'child', label: 'Child', icon: User },
      { id: 'performance', label: 'Performance', icon: BarChart2 },
      { id: 'fees', label: 'Fees', icon: DollarSign },
      { id: 'profile', label: 'Profile', icon: User }
    ],
    admin: [
      { id: 'home', label: 'Dashboard', icon: Home },
      { id: 'students', label: 'Students', icon: Users },
      { id: 'parents', label: 'Parents', icon: UserCheck },
      { id: 'teachers', label: 'Teachers', icon: UserPlus },
      { id: 'batches', label: 'Batches', icon: BookOpen },
      { id: 'profile', label: 'Settings', icon: User }
    ]
  };

  const tabs = navConfigs[role] || navConfigs.student;
  const isSixTabs = tabs.length >= 6;

  // Dynamic bottom padding based on 3-button navigation vs full-screen gesture pill
  const dynamicPaddingBottom = navMode === 'buttons'
    ? 'calc(var(--safe-area-bottom, 48px) + 6px)'
    : 'calc(max(var(--safe-area-bottom, 20px), 20px) + 8px)';

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        maxWidth: '480px',
        margin: '0 auto',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: isSixTabs ? '6px' : '8px',
        paddingLeft: isSixTabs ? '2px' : '4px',
        paddingRight: isSixTabs ? '2px' : '4px',
        paddingBottom: dynamicPaddingBottom,
        zIndex: 40,
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.05)',
        transform: isKeyboardOpen ? 'translateY(110%)' : 'translateY(0)',
        opacity: isKeyboardOpen ? 0 : 1,
        pointerEvents: isKeyboardOpen ? 'none' : 'auto',
        transition: 'transform 0.26s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease, padding-bottom 0.2s ease'
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: isSixTabs ? '4px 0' : '6px 0',
              color: isActive ? 'var(--accent-600)' : 'var(--text-muted)',
              transition: 'all 0.25s var(--ease-smooth)',
              position: 'relative',
              minWidth: 0,
              touchAction: 'manipulation'
            }}
          >
            <div style={{
              transform: isActive ? 'scale(1.1) translateY(-1px)' : 'scale(1)',
              background: isActive ? 'var(--accent-50)' : 'transparent',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              transition: 'all 0.25s var(--ease-smooth)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Icon size={isSixTabs ? 18 : 20} strokeWidth={isActive ? 2.5 : 1.8} />
            </div>
            <span style={{
              fontSize: isSixTabs ? '10px' : '11px',
              fontWeight: isActive ? 800 : 500,
              marginTop: isSixTabs ? '1px' : '3px',
              color: isActive ? 'var(--brand-900)' : 'var(--text-muted)',
              transition: 'color 0.2s ease',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
              display: 'block'
            }}>
              {tab.label}
            </span>
            {isActive && (
              <span style={{
                position: 'absolute',
                top: '0px',
                width: isSixTabs ? '24px' : '32px',
                height: '3px',
                background: 'linear-gradient(90deg, var(--brand-700), var(--accent-500))',
                borderRadius: '9999px',
                boxShadow: '0 2px 8px rgba(234, 88, 12, 0.4)',
                transition: 'all 0.25s var(--ease-smooth)'
              }} />
            )}
          </button>
        );
      })}
    </nav>
  );
}
