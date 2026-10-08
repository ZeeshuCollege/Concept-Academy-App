import React, { useState } from 'react';
import { 
  CheckCircle2, XCircle, MinusCircle,
  Calendar, FileText, ArrowUpRight
} from 'lucide-react';
import MobileDropdown from '../common/MobileDropdown';
import { useDataSync } from '../../lib/syncEvents';

export const mockLast10Tests = [
  {
    id: 'pt-01',
    testNumber: 10,
    title: 'Physics Unit Test 04',
    subject: 'Physics',
    chapter: 'Ray Optics & Modern Physics',
    date: '14 Apr 2025',
    score: 92,
    maxMarks: 100,
    rank: 2,
    classAverage: 73,
    correct: 23,
    incorrect: 1,
    unattempted: 1,
    grade: 'A+',
    status: 'Passed (Distinction)',
    paperUrl: 'mock_physics_test_01.pdf'
  },
  {
    id: 'pt-02',
    testNumber: 9,
    title: 'Chemistry Unit Test 04',
    subject: 'Chemistry',
    chapter: 'Hydrocarbons & Alkyl Halides',
    date: '11 Apr 2025',
    score: 85,
    maxMarks: 100,
    rank: 5,
    classAverage: 68,
    correct: 21,
    incorrect: 3,
    unattempted: 1,
    grade: 'A',
    status: 'Passed',
    paperUrl: 'mock_chemistry_test_02.pdf'
  },
  {
    id: 'pt-03',
    testNumber: 8,
    title: 'Mathematics Unit Test 04',
    subject: 'Mathematics',
    chapter: 'Differential Equations',
    date: '08 Apr 2025',
    score: 88,
    maxMarks: 100,
    rank: 3,
    classAverage: 70,
    correct: 22,
    incorrect: 2,
    unattempted: 1,
    grade: 'A',
    status: 'Passed (Distinction)',
    paperUrl: 'mock_maths_test_01.pdf'
  },
  {
    id: 'pt-04',
    testNumber: 7,
    title: 'Physics Unit Test 03',
    subject: 'Physics',
    chapter: 'Rotational Dynamics & SHM',
    date: '04 Apr 2025',
    score: 80,
    maxMarks: 100,
    rank: 7,
    classAverage: 65,
    correct: 20,
    incorrect: 4,
    unattempted: 1,
    grade: 'B+',
    status: 'Passed',
    paperUrl: 'mock_physics_test_01.pdf'
  },
  {
    id: 'pt-05',
    testNumber: 6,
    title: 'Chemistry Unit Test 03',
    subject: 'Chemistry',
    chapter: 'Chemical Kinetics & Electrochemistry',
    date: '01 Apr 2025',
    score: 94,
    maxMarks: 100,
    rank: 1,
    classAverage: 72,
    correct: 24,
    incorrect: 1,
    unattempted: 0,
    grade: 'A+',
    status: 'Batch Topper (Distinction)',
    paperUrl: 'mock_chemistry_test_02.pdf'
  },
  {
    id: 'pt-06',
    testNumber: 5,
    title: 'Mathematics Unit Test 03',
    subject: 'Mathematics',
    chapter: 'Definite & Indefinite Integrals',
    date: '27 Mar 2025',
    score: 78,
    maxMarks: 100,
    rank: 8,
    classAverage: 64,
    correct: 19,
    incorrect: 4,
    unattempted: 2,
    grade: 'B+',
    status: 'Passed',
    paperUrl: 'mock_maths_test_01.pdf'
  },
  {
    id: 'pt-07',
    testNumber: 4,
    title: 'Physics Unit Test 02',
    subject: 'Physics',
    chapter: 'Work, Energy & Gravitation',
    date: '22 Mar 2025',
    score: 86,
    maxMarks: 100,
    rank: 4,
    classAverage: 69,
    correct: 21,
    incorrect: 2,
    unattempted: 2,
    grade: 'A',
    status: 'Passed',
    paperUrl: 'mock_physics_test_01.pdf'
  },
  {
    id: 'pt-08',
    testNumber: 3,
    title: 'Chemistry Unit Test 02',
    subject: 'Chemistry',
    chapter: 'Thermodynamics & Equilibrium',
    date: '18 Mar 2025',
    score: 82,
    maxMarks: 100,
    rank: 6,
    classAverage: 67,
    correct: 20,
    incorrect: 3,
    unattempted: 2,
    grade: 'B+',
    status: 'Passed',
    paperUrl: 'mock_chemistry_test_02.pdf'
  },
  {
    id: 'pt-09',
    testNumber: 2,
    title: 'Mathematics Unit Test 02',
    subject: 'Mathematics',
    chapter: 'Continuity & Differentiability',
    date: '14 Mar 2025',
    score: 90,
    maxMarks: 100,
    rank: 3,
    classAverage: 71,
    correct: 23,
    incorrect: 2,
    unattempted: 0,
    grade: 'A+',
    status: 'Passed (Distinction)',
    paperUrl: 'mock_maths_test_01.pdf'
  },
  {
    id: 'pt-10',
    testNumber: 1,
    title: 'Physics Unit Test 01',
    subject: 'Physics',
    chapter: 'Kinematics & Laws of Motion',
    date: '10 Mar 2025',
    score: 88,
    maxMarks: 100,
    rank: 4,
    classAverage: 71,
    correct: 22,
    incorrect: 2,
    unattempted: 1,
    grade: 'A',
    status: 'Passed (Distinction)',
    paperUrl: 'mock_physics_test_01.pdf'
  }
];

const getCombinedTests = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('concept_academy_tests_list') || localStorage.getItem('aspire_tests_list') || '[]');
    const completed = saved.filter(t => (t.status || '').toLowerCase() === 'completed');
    if (completed.length > 0) {
      const mapped = completed.map((t, idx) => ({
        id: t.id || `live-${idx}`,
        testNumber: 10 + idx + 1,
        title: t.title || t.code || 'Assessment Paper',
        subject: t.subject || 'Physics',
        chapter: t.chapter || 'Latest Assessment',
        date: t.date || 'Recent',
        score: t.score || 88,
        maxMarks: t.maxMarks || 100,
        rank: 1,
        classAverage: 72,
        correct: 22,
        incorrect: 2,
        unattempted: 1,
        grade: 'A',
        status: 'Passed',
        paperUrl: t.fileUrl || 'mock_physics_test_01.pdf'
      }));
      return [...mapped, ...mockLast10Tests];
    }
  } catch (e) {}
  return mockLast10Tests;
};

export default function ParentPerformance({ onOpenTestPaper }) {
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [testsList, setTestsList] = useState(getCombinedTests);

  useDataSync(['tests', 'marks'], () => {
    setTestsList(getCombinedTests());
  });

  const totalTests = testsList.length;
  const avgScore = totalTests > 0 ? Math.round(testsList.reduce((acc, t) => acc + (t.score || 0), 0) / totalTests) : 0;
  const bestRank = testsList.length > 0 ? Math.min(...testsList.map(t => t.rank || 1)) : 1;

  const filteredTests = testsList.filter(t => {
    if (subjectFilter === 'All') return true;
    return t.subject === subjectFilter;
  });

  const getSubjectColor = (subject) => {
    switch (subject) {
      case 'Physics':
        return { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' };
      case 'Chemistry':
        return { bg: '#fef3c7', color: '#92400e', border: '#fde68a' };
      case 'Mathematics':
        return { bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0' };
      default:
        return { bg: '#f1f5f9', color: '#334155', border: '#cbd5e1' };
    }
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '90px' }}>
      {/* Header */}
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-900)', margin: '0 0 4px 0' }}>
          Academic Performance
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
          Results and question breakdowns for the last {totalTests} completed tests
        </p>
      </div>

      {/* KPI Overview Summary Card */}
      <div className="card" style={{ padding: '16px', background: 'var(--surface)', borderRadius: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
          <div style={{ padding: '12px 6px', background: 'var(--surface-alt)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>
              Average Score
            </span>
            <strong style={{ fontSize: '20px', color: 'var(--brand-900)', display: 'block', marginTop: '2px', fontFamily: 'JetBrains Mono, monospace' }}>
              {avgScore}%
            </strong>
            <span style={{ fontSize: '10px', color: '#15803d', fontWeight: 700 }}>
              Consistent A
            </span>
          </div>

          <div style={{ padding: '12px 6px', background: 'var(--surface-alt)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>
              Best Rank
            </span>
            <strong style={{ fontSize: '20px', color: 'var(--accent-500)', display: 'block', marginTop: '2px', fontFamily: 'JetBrains Mono, monospace' }}>
              #{bestRank}
            </strong>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>
              Batch of 35
            </span>
          </div>

          <div style={{ padding: '12px 6px', background: 'var(--surface-alt)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>
              Tests Cleared
            </span>
            <strong style={{ fontSize: '20px', color: '#10b981', display: 'block', marginTop: '2px', fontFamily: 'JetBrains Mono, monospace' }}>
              10/10
            </strong>
            <span style={{ fontSize: '10px', color: '#15803d', fontWeight: 700 }}>
              100% Pass
            </span>
          </div>
        </div>
      </div>

      {/* Subject Filter Mobile Dropdown */}
      <div>
        <MobileDropdown
          title="Filter by Subject"
          options={['All', 'Physics', 'Chemistry', 'Mathematics'].map(subj => {
            const count = subj === 'All' 
              ? mockLast10Tests.length 
              : mockLast10Tests.filter(t => t.subject === subj).length;
            return {
              value: subj,
              label: `${subj === 'All' ? 'All Subjects' : subj} (${count})`
            };
          })}
          value={subjectFilter}
          onChange={val => setSubjectFilter(val)}
          placeholder="Filter by Subject"
        />
      </div>

      {/* Last 10 Test Result Cards with Breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredTests.map((test) => {
          const sc = getSubjectColor(test.subject);
          const diffFromAvg = test.score - test.classAverage;

          return (
            <div
              key={test.id}
              className="card card-hover"
              style={{
                padding: '16px',
                background: 'var(--surface)',
                borderRadius: '16px',
                borderLeft: `4px solid ${test.score >= 90 ? '#10b981' : test.score >= 80 ? 'var(--brand-800)' : '#f59e0b'}`
              }}
            >
              {/* Top Row: Subject Badge & Test Date */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontSize: '10px',
                  fontWeight: 800,
                  background: sc.bg,
                  color: sc.color,
                  border: `1px solid ${sc.border}`,
                  fontFamily: 'JetBrains Mono, monospace'
                }}>
                  {test.subject}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                  <Calendar size={12} />
                  <span>{test.date}</span>
                </div>
              </div>

              {/* Title & Topic */}
              <div style={{ marginBottom: '12px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--brand-900)', margin: '0 0 2px 0' }}>
                  {test.title}
                </h4>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Unit: {test.chapter}
                </span>
              </div>

              {/* Score & Rank Highlight Bar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 14px',
                background: 'var(--surface-alt)',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                marginBottom: '12px'
              }}>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>Score</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <strong style={{ fontSize: '18px', color: 'var(--brand-900)', fontFamily: 'JetBrains Mono, monospace' }}>
                      {test.score}
                    </strong>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>/{test.maxMarks}</span>
                    <span style={{
                      marginLeft: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: test.score >= 90 ? '#15803d' : '#1e40af',
                      fontFamily: 'JetBrains Mono, monospace'
                    }}>
                      ({test.score}%)
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>Batch Rank</span>
                  <strong style={{ fontSize: '15px', color: 'var(--brand-800)', fontFamily: 'JetBrains Mono, monospace' }}>
                    Rank #{test.rank}
                  </strong>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>
                    Grade {test.grade}
                  </span>
                </div>
              </div>

              {/* Simple Breakdown Section */}
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Test Breakdown
                </span>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '6px',
                  marginBottom: '10px'
                }}>
                  <div style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: '#ecfdf5',
                    border: '1px solid #86efac',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <CheckCircle2 size={14} color="#15803d" />
                    <div>
                      <strong style={{ fontSize: '12px', color: '#15803d', display: 'block', lineHeight: 1, fontFamily: 'JetBrains Mono, monospace' }}>
                        {test.correct}
                      </strong>
                      <span style={{ fontSize: '9px', color: '#166534', fontWeight: 600 }}>Correct</span>
                    </div>
                  </div>

                  <div style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: '#fef2f2',
                    border: '1px solid #fca5a5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <XCircle size={14} color="#b91c1c" />
                    <div>
                      <strong style={{ fontSize: '12px', color: '#b91c1c', display: 'block', lineHeight: 1, fontFamily: 'JetBrains Mono, monospace' }}>
                        {test.incorrect}
                      </strong>
                      <span style={{ fontSize: '9px', color: '#991b1b', fontWeight: 600 }}>Incorrect</span>
                    </div>
                  </div>

                  <div style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: 'var(--surface-alt)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <MinusCircle size={14} color="var(--text-muted)" />
                    <div>
                      <strong style={{ fontSize: '12px', color: 'var(--text-primary)', display: 'block', lineHeight: 1, fontFamily: 'JetBrains Mono, monospace' }}>
                        {test.unattempted}
                      </strong>
                      <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 600 }}>Skipped</span>
                    </div>
                  </div>
                </div>

                {/* Class Average Comparison Pill */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  paddingTop: '6px',
                  borderTop: '1px solid var(--border)'
                }}>
                  <span>Class Average: <strong style={{ fontFamily: 'JetBrains Mono, monospace' }}>{test.classAverage}/100</strong></span>
                  <span style={{ color: diffFromAvg >= 0 ? '#15803d' : '#b91c1c', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                    {diffFromAvg >= 0 ? `+${diffFromAvg} above avg` : `${diffFromAvg} below avg`}
                  </span>
                </div>
              </div>

              {/* View Question Paper Action */}
              {onOpenTestPaper && (
                <button
                  type="button"
                  onClick={() => onOpenTestPaper({ title: test.title, subtitle: `${test.subject} • ${test.date}` })}
                  style={{
                    marginTop: '12px',
                    width: '100%',
                    padding: '9px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    background: 'var(--surface-alt)',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: 'var(--brand-800)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'var(--transition-smooth)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-400)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <FileText size={13} />
                  <span>View Test Paper & Answers</span>
                  <ArrowUpRight size={13} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
