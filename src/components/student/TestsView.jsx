import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import MobileDropdown from '../common/MobileDropdown';
import { useDataSync } from '../../lib/syncEvents';

export default function TestsView({ onOpenTestPaper }) {
  const [tab, setTab] = useState('upcoming');

  const [testsList, setTestsList] = useState(() => {
    try {
      const saved = localStorage.getItem('concept_academy_tests_list') || localStorage.getItem('aspire_tests_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  useDataSync(['tests', 'marks'], () => {
    try {
      const saved = localStorage.getItem('concept_academy_tests_list') || localStorage.getItem('aspire_tests_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setTestsList(parsed);
      } else {
        setTestsList([]);
      }
    } catch (e) {}
  });

  const tests = testsList.filter(t => (t.status || 'Upcoming').toLowerCase() === tab);

  return (
    <div className="view-transition-enter" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '90px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--brand-900)', margin: 0, letterSpacing: '-0.02em' }}>
            Assessments & Results
          </h3>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            EVALUATION_LOG // JEE-NEET
          </span>
        </div>
        <span className="badge badge-accent">
          {tests.length} Records
        </span>
      </div>

      {/* Assessment View Dropdown */}
      <div>
        <MobileDropdown
          title="Select Assessment View"
          options={[
            { value: 'upcoming', label: 'Scheduled Tests' },
            { value: 'completed', label: 'Evaluated Marks' }
          ]}
          value={tab}
          onChange={val => setTab(val)}
          placeholder="Select View"
        />
      </div>

      {/* Test List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {tests.length === 0 ? (
          <div className="card" style={{ padding: '36px 20px', textAlign: 'center', borderRadius: '12px' }}>
            <Calendar size={36} color="var(--text-muted)" style={{ margin: '0 auto 10px auto', opacity: 0.5 }} />
            <h4 style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--brand-900)', margin: 0 }}>No Tests Found</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              {tab === 'upcoming' ? 'No tests scheduled at the moment.' : 'No completed tests evaluated yet.'}
            </p>
          </div>
        ) : (
          tests.map(test => (
            <div key={test.id} className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="badge badge-warning" style={{ marginBottom: '4px' }}>
                  {test.subject}
                </span>
                <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--brand-900)', margin: '4px 0 0 0' }}>
                  {test.code}
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{test.chapter}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--brand-800)', fontFamily: 'var(--font-mono)' }}>
                  {test.duration}
                </span>
                <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'block', fontFamily: 'var(--font-mono)' }}>
                  MAX: {test.maxMarks}M
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', marginTop: '10px', fontFamily: 'var(--font-mono)' }}>
              <Calendar size={13} color="var(--brand-700)" />
              <span>{test.date}</span>
            </div>

            {/* If completed, show score summary */}
            {test.status === 'Completed' && (
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
                <div style={{ background: 'var(--surface-alt)', border: '1px solid #bbf7d0', padding: '10px 4px', borderRadius: '10px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Marks</span>
                  <strong style={{ fontSize: '14px', color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>{test.marksObtained}/100</strong>
                </div>
                <div style={{ background: 'var(--surface-alt)', border: '1px solid #bfdbfe', padding: '10px 4px', borderRadius: '10px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Rank</span>
                  <strong style={{ fontSize: '14px', color: 'var(--brand-800)', fontFamily: 'var(--font-mono)' }}>#{test.rank}</strong>
                </div>
                <div style={{ background: 'var(--surface-alt)', border: '1px solid #fed7aa', padding: '10px 4px', borderRadius: '10px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Score</span>
                  <strong style={{ fontSize: '14px', color: 'var(--accent-600)', fontFamily: 'var(--font-mono)' }}>{test.percentage}%</strong>
                </div>
              </div>
            )}

            {/* In-App Test Paper View Action */}
            <button
              onClick={() => onOpenTestPaper({ title: test.code, subtitle: `${test.subject} • ${test.chapter} (${test.date})` })}
              className="btn-secondary"
              style={{ width: '100%', marginTop: '12px', fontSize: '12px', padding: '9px', borderRadius: '10px' }}
            >
              View Test Paper (In-App)
            </button>
          </div>
        ))
      )}
    </div>
    </div>
  );
}
