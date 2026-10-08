import React, { useState } from 'react';
import { Calendar, FileText, BookOpen, ChevronRight, Clock, CheckCircle2 } from 'lucide-react';
import { useDataSync } from '../../lib/syncEvents';

export default function StudentHome({ user, onNavigate, onOpenTestPaper }) {
  const loadTodayLecture = () => {
    try {
      const timetable = JSON.parse(localStorage.getItem('concept_academy_admin_timetable') || localStorage.getItem('aspire_admin_timetable') || '[]');
      if (Array.isArray(timetable) && timetable.length > 0) {
        return timetable[0];
      }
    } catch (e) {}
    return null;
  };

  const [todayLecture, setTodayLecture] = useState(loadTodayLecture);

  useDataSync(['timetable'], () => {
    setTodayLecture(loadTodayLecture());
  });

  return (
    <div className="view-transition-enter" style={{
      padding: '16px',
      minHeight: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      paddingBottom: '90px'
    }}>
      {/* Greeting Header - Sharp Architectural Alignment */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '2px 0 6px 0',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '12px'
      }}>
        <div style={{ flex: 1, paddingRight: '14px' }}>
          <span style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            display: 'block',
            marginBottom: '2px',
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}>
            ACADEMIC_SYS // STUDENT PORTAL
          </span>
          <h1 style={{
            fontSize: 'clamp(24px, 6.5vw, 30px)',
            fontWeight: 900,
            color: 'var(--brand-900)',
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            margin: 0
          }}>
            {user.name}
          </h1>
          <span style={{
            fontSize: '11px',
            color: 'var(--brand-700)',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)'
          }}>
            {user.course || 'JEE'} • {user.rollNumber || 'STU-104'}
          </span>
        </div>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img
            src={user.avatar}
            alt={user.name}
            style={{
              width: 'clamp(68px, 18vw, 80px)',
              height: 'clamp(68px, 18vw, 80px)',
              borderRadius: '16px',
              objectFit: 'cover',
              border: '2.5px solid var(--accent-500)',
              boxShadow: '0 4px 12px rgba(234, 88, 12, 0.15)'
            }}
          />
        </div>
      </div>

      {/* Today's Class Card */}
      <div style={{
        background: 'linear-gradient(135deg, var(--brand-950) 0%, var(--brand-900) 100%)',
        border: '1px solid var(--brand-800)',
        borderLeft: '5px solid var(--accent-500)',
        borderRadius: '16px',
        padding: '18px',
        color: '#ffffff',
        boxShadow: '0 8px 24px rgba(10, 31, 61, 0.18)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge" style={{ background: 'rgba(249, 115, 22, 0.2)', color: '#fb923c', border: '1px solid rgba(249, 115, 22, 0.4)', borderRadius: '9999px', fontSize: '10px', fontWeight: 800, padding: '3px 9px' }}>
                {todayLecture ? "TODAY'S LECTURE" : 'SCHEDULE'}
              </span>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.75)' }}>
                {todayLecture ? `[${todayLecture.course || 'ROOM 105'}]` : '[INSTITUTE]'}
              </span>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-0.01em' }}>
              {todayLecture ? `${todayLecture.subject} • ${todayLecture.faculty || 'Faculty'}` : 'No scheduled lectures today'}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.85)', fontFamily: 'var(--font-mono)' }}>
              <Clock size={13} color="#fb923c" />
              <span>{todayLecture ? `${todayLecture.day}: ${todayLecture.time}` : 'Regular batch timetable active'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('classes')}
          style={{
            marginTop: '16px',
            background: 'linear-gradient(135deg, var(--accent-500), var(--accent-600))',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 18px',
            fontSize: '11.5px',
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 3px 10px rgba(234, 88, 12, 0.3)',
            transition: 'var(--transition-smooth)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1.5px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(234, 88, 12, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 3px 10px rgba(234, 88, 12, 0.3)';
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'translateY(-1.5px)'}
        >
          View Full Schedule <ChevronRight size={14} />
        </button>
      </div>

      {/* Quick Action 2x2 Grid - Smooth Ergonomic Cards */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          flex: 1,
          minHeight: '240px'
        }}>
          {[
            {
              id: 'attendance',
              code: 'MOD_01',
              label: 'Attendance',
              desc: 'Check logs & stats',
              icon: CheckCircle2,
              bg: '#fff7ed',
              color: 'var(--accent-600)',
              border: '#fed7aa'
            },
            {
              id: 'tests',
              code: 'MOD_02',
              label: 'Tests',
              desc: 'Papers & scores',
              icon: FileText,
              bg: '#f0fdf4',
              color: '#16a34a',
              border: '#bbf7d0'
            },
            {
              id: 'materials',
              code: 'MOD_03',
              label: 'Materials',
              desc: 'PDFs & lectures',
              icon: BookOpen,
              bg: 'var(--brand-50)',
              color: 'var(--brand-600)',
              border: 'var(--brand-200)'
            },
            {
              id: 'classes',
              code: 'MOD_04',
              label: 'Schedule',
              desc: 'Weekly routine',
              icon: Calendar,
              bg: '#f8fafc',
              color: 'var(--brand-800)',
              border: 'var(--border)'
            }
          ].map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => onNavigate(action.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  textAlign: 'left',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  padding: '16px 14px',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-card)',
                  transition: 'var(--transition-smooth)',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-400)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(10, 31, 61, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: action.bg,
                    border: `1px solid ${action.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: action.color,
                    transition: 'var(--transition-smooth)'
                  }}>
                    <Icon size={22} />
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9.5px',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    letterSpacing: '0.04em'
                  }}>
                    {action.code}
                  </span>
                </div>

                <div style={{ marginTop: '14px' }}>
                  <span style={{
                    fontSize: '15px',
                    fontWeight: 800,
                    color: 'var(--brand-900)',
                    display: 'block',
                    marginBottom: '2px',
                    letterSpacing: '-0.01em'
                  }}>
                    {action.label}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    color: 'var(--text-muted)',
                    lineHeight: 1.3,
                    display: 'block'
                  }}>
                    {action.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
