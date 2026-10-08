import React, { useState, useEffect } from 'react';
import { mockSchedule } from '../../lib/mockData';
import { Clock, UserCheck, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import AttendanceView from './AttendanceView';
import MobileDropdown from '../common/MobileDropdown';
import { useDataSync } from '../../lib/syncEvents';

export default function Timetable({ initialSubTab = 'schedule' }) {
  const [subTab, setSubTab] = useState(initialSubTab);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const [selectedDay, setSelectedDay] = useState('Mon');

  const [adminTimetable, setAdminTimetable] = useState(() => {
    try {
      const raw = localStorage.getItem('concept_academy_admin_timetable') || localStorage.getItem('aspire_admin_timetable');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
  });

  useDataSync(['timetable'], () => {
    try {
      const raw = localStorage.getItem('concept_academy_admin_timetable') || localStorage.getItem('aspire_admin_timetable');
      setAdminTimetable(raw ? JSON.parse(raw) : []);
    } catch (e) {}
  });

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const dayLectures = (adminTimetable && adminTimetable.length > 0)
    ? adminTimetable.filter(l => l.day === selectedDay)
    : (mockSchedule || []).filter(l => l.day === selectedDay);

  return (
    <div className="view-transition-enter" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '90px' }}>
      {/* Top Segmented View Switcher */}
      <div className="tab-container">
        <button
          className={`tab-btn ${subTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setSubTab('schedule')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <CalendarIcon size={14} /> Class Schedule
        </button>
        <button
          className={`tab-btn ${subTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setSubTab('attendance')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <CheckCircle2 size={14} /> Attendance Record
        </button>
      </div>

      {subTab === 'attendance' ? (
        <AttendanceView />
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--brand-900)', margin: 0, letterSpacing: '-0.02em' }}>
                Weekly Timetable
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                SCHEDULE_MATRIX // 7-DAY
              </span>
            </div>
            <span className="badge badge-accent">
              {dayLectures.length} {dayLectures.length === 1 ? 'Class' : 'Classes'}
            </span>
          </div>

          {/* Day Selector Mobile Dropdown */}
          <MobileDropdown
            label="Day of Week"
            title="Select Day of the Week"
            options={[
              { value: 'Mon', label: 'Monday' },
              { value: 'Tue', label: 'Tuesday' },
              { value: 'Wed', label: 'Wednesday' },
              { value: 'Thu', label: 'Thursday' },
              { value: 'Fri', label: 'Friday' },
              { value: 'Sat', label: 'Saturday' },
              { value: 'Sun', label: 'Sunday' }
            ]}
            value={selectedDay}
            onChange={val => setSelectedDay(val)}
            placeholder="Select Day"
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              {selectedDay.toUpperCase()} // SESSIONS
            </span>
            <span className="badge badge-info" style={{ borderRadius: '9999px' }}>
              Offline Classes
            </span>
          </div>

          {/* Schedule Timeline Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {dayLectures.length === 0 ? (
              <div className="card" style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '14px' }}>
                <CalendarIcon size={32} style={{ margin: '0 auto 8px auto', opacity: 0.4 }} />
                <p style={{ fontSize: '13px', margin: 0, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  NO LECTURES SCHEDULED FOR {selectedDay.toUpperCase()}
                </p>
              </div>
            ) : (
              dayLectures.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="card"
                  style={{
                    padding: '16px',
                    borderRadius: '14px',
                    borderLeft: item.status === 'Ongoing' ? '4px solid var(--accent-500)' : '4px solid var(--brand-700)',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <span className="badge badge-accent" style={{ fontSize: '9.5px', padding: '2px 6px' }}>
                          LECTURE #{idx + 1}
                        </span>
                        {item.course && (
                          <span className="badge badge-warning" style={{ fontSize: '9.5px', padding: '2px 6px' }}>
                            {item.course}
                          </span>
                        )}
                      </div>
                      <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--brand-900)', margin: '4px 0 0 0' }}>
                        {item.subject}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                        <Clock size={13} color="var(--brand-700)" />
                        <span>{item.time}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                      <UserCheck size={14} color="var(--success)" />
                      {item.faculty || 'Senior Faculty'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
