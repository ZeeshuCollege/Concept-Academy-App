import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Users, CheckCircle2, Save, FileText, ArrowLeft
} from 'lucide-react';
import { getStoredStudents, saveStoredStudents } from '../../lib/userAuthStore';
import { COURSE_OPTIONS } from './AdminStudyMaterialsModal';
import MobileDropdown from '../common/MobileDropdown';
import { broadcastDataChange, useDataSync } from '../../lib/syncEvents';

export default function AdminMarksModal({ isOpen, onClose }) {
  const [tests, setTests] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Load tests on mount / open
  useEffect(() => {
    if (!isOpen) return;
    try {
      const saved = localStorage.getItem('concept_academy_tests_list') || localStorage.getItem('aspire_tests_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setTests(parsed);
          if (parsed.length > 0) {
            setSelectedTestId(prev => (prev && parsed.some(t => t.id === prev)) ? prev : parsed[0].id);
          } else {
            setSelectedTestId('');
          }
          return;
        }
      }
    } catch (e) {}
    setTests([]);
    setSelectedTestId('');
  }, [isOpen]);

  useDataSync(['tests'], () => {
    try {
      const saved = localStorage.getItem('concept_academy_tests_list') || localStorage.getItem('aspire_tests_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setTests(parsed);
          if (!selectedTestId && parsed.length > 0) setSelectedTestId(parsed[0].id);
        }
      }
    } catch (e) {}
  });

  // Selected test or null when no paper is selected
  const activeTest = useMemo(() => {
    if (!selectedTestId) return null;
    return tests.find(t => t.id === selectedTestId) || null;
  }, [tests, selectedTestId]);

  const [maxMarks, setMaxMarks] = useState(100);
  const [passingMarks, setPassingMarks] = useState(35);
  const [testDate, setTestDate] = useState(() => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));

  // Student list: enrolled students from userAuthStore
  const [studentsList, setStudentsList] = useState([]);
  // Marks map: { [studentId]: { score: number | '', isAbsent: boolean, remarks: string } }
  const [studentMarks, setStudentMarks] = useState({});

  const [successToast, setSuccessToast] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  // Compute live test metrics
  const stats = useMemo(() => {
    if (!activeTest) {
      return {
        totalStudents: 0,
        evaluatedCount: 0,
        totalPresent: 0,
        totalAbsent: 0,
        avgScore: '—',
        highestScore: '—',
        lowestScore: '—',
        passRate: 0
      };
    }

    let totalPresent = 0;
    let totalAbsent = 0;
    let totalScoreSum = 0;
    let evaluatedCount = 0;
    let passedCount = 0;
    let highest = -1;
    let lowest = 9999;

    studentsList.forEach(std => {
      const entry = studentMarks[std.id];
      if (!entry) return;
      if (entry.isAbsent) {
        totalAbsent += 1;
        return;
      }
      if (entry.score !== '' && !isNaN(Number(entry.score))) {
        const s = Number(entry.score);
        totalPresent += 1;
        evaluatedCount += 1;
        totalScoreSum += s;
        if (s >= Number(passingMarks)) passedCount += 1;
        if (s > highest) highest = s;
        if (s < lowest) lowest = s;
      }
    });

    const avg = evaluatedCount > 0 ? (totalScoreSum / evaluatedCount).toFixed(1) : '—';
    const passRate = evaluatedCount > 0 ? Math.round((passedCount / evaluatedCount) * 100) : 0;

    return {
      totalStudents: studentsList.length,
      evaluatedCount,
      totalPresent,
      totalAbsent,
      avgScore: avg,
      highestScore: highest >= 0 ? highest : '—',
      lowestScore: lowest <= 100 ? lowest : '—',
      passRate
    };
  }, [activeTest, studentsList, studentMarks, passingMarks]);

  // Load students & existing marks on mount or test change
  useEffect(() => {
    if (!isOpen) return;

    const stored = getStoredStudents();
    const baseList = Array.isArray(stored) ? stored : [];
    setStudentsList(baseList);

    if (!selectedTestId) {
      setStudentMarks({});
      return;
    }

    // Load saved marks for this test from localStorage
    try {
      const savedStorage = JSON.parse(localStorage.getItem(`concept_academy_marks_${selectedTestId}`) || localStorage.getItem(`aspire_marks_${selectedTestId}`) || '{}');
      const initialMap = {};
      baseList.forEach(std => {
        if (savedStorage[std.id]) {
          initialMap[std.id] = savedStorage[std.id];
        } else {
          initialMap[std.id] = {
            score: '',
            isAbsent: false,
            remarks: ''
          };
        }
      });
      setStudentMarks(initialMap);
    } catch {
      const fallbackMap = {};
      baseList.forEach(std => {
        fallbackMap[std.id] = { score: '', isAbsent: false, remarks: '' };
      });
      setStudentMarks(fallbackMap);
    }
  }, [isOpen, selectedTestId]);

  // Sync test metadata when test changes
  useEffect(() => {
    if (activeTest) {
      setMaxMarks(activeTest.maxMarks || 100);
      setPassingMarks(activeTest.passingMarks || 35);
      if (activeTest.date) setTestDate(activeTest.date);
    }
  }, [activeTest]);

  // Back navigation handler with smooth animation
  const handleBack = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 320);
  };

  // Android back button / escape support
  useEffect(() => {
    if (!isOpen) return;
    const handleAppBack = (e) => {
      handleBack();
      e.detail?.markHandled?.();
    };
    window.addEventListener('app:back', handleAppBack);
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleBack();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('app:back', handleAppBack);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isClosing]);

  if (!isOpen) return null;

  // Filter students based on course and search query
  const filteredStudents = studentsList.filter(std => {
    const matchesCourse = selectedCourseFilter === 'All' || std.course === selectedCourseFilter;
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch = !q || 
      (std.name || '').toLowerCase().includes(q) || 
      (std.rollNumber || '').toLowerCase().includes(q) ||
      (std.roll || '').toString().includes(q);
    return matchesCourse && matchesSearch;
  });

  // Handle single student score change
  const handleScoreChange = (studentId, rawValue) => {
    if (rawValue === '') {
      setStudentMarks(prev => ({
        ...prev,
        [studentId]: { ...(prev[studentId] || {}), score: '', isAbsent: false }
      }));
      return;
    }
    const val = parseInt(rawValue, 10);
    if (isNaN(val)) return;
    const clamped = Math.max(0, Math.min(Number(maxMarks) || 100, val));
    setStudentMarks(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        score: clamped.toString(),
        isAbsent: false
      }
    }));
  };

  // Toggle student absence
  const handleToggleAbsent = (studentId) => {
    setStudentMarks(prev => {
      const current = prev[studentId] || { score: '', isAbsent: false };
      const nextAbsent = !current.isAbsent;
      return {
        ...prev,
        [studentId]: {
          ...current,
          isAbsent: nextAbsent,
          score: nextAbsent ? '0' : (current.score === '0' ? '35' : current.score)
        }
      };
    });
  };

  // Dynamic Grade Color Helper
  const getGradeInfo = (score, isAbsent) => {
    if (isAbsent) return { label: 'Absent', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' };
    if (score === '' || score === null || score === undefined) return { label: 'Ungraded', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' };
    const num = Number(score);
    const max = Number(maxMarks) || 100;
    const pct = Math.round((num / max) * 100);
    if (pct < Number(passingMarks)) return { label: 'Fail', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' };
    if (pct >= 90) return { label: 'A+ (90%)', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' };
    if (pct >= 75) return { label: 'A (75%)', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' };
    if (pct >= 60) return { label: 'B (60%)', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' };
    if (pct >= 45) return { label: 'C (45%)', color: '#d97706', bg: '#fffbeb', border: '#fde68a' };
    return { label: 'Pass', color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe' };
  };

  // Save and publish marks
  const handleSaveMarks = () => {
    if (!activeTest) {
      setSuccessToast('⚠️ No Paper Selected. Please select a paper first.');
      setTimeout(() => setSuccessToast(''), 3000);
      return;
    }

    try {
      // 1. Persist marks record for this test
      const marksJson = JSON.stringify(studentMarks);
      localStorage.setItem(`concept_academy_marks_${selectedTestId}`, marksJson);
      localStorage.setItem(`aspire_marks_${selectedTestId}`, marksJson);

      // 2. Update students list in userAuthStore with latestTest scores
      const currentStored = getStoredStudents();
      if (currentStored && currentStored.length > 0) {
        const updated = currentStored.map(s => {
          const m = studentMarks[s.id];
          if (m && m.score !== '') {
            const scoreNum = Number(m.score);
            const pct = Math.round((scoreNum / (Number(maxMarks) || 100)) * 100);
            return {
              ...s,
              score: `${pct}%`,
              latestTest: {
                title: activeTest.title,
                subject: activeTest.subject,
                date: testDate,
                score: scoreNum,
                maxMarks: Number(maxMarks),
                percentage: pct,
                status: m.isAbsent ? 'Absent' : (scoreNum >= Number(passingMarks) ? 'Passed' : 'Failed'),
                grade: getGradeInfo(m.score, m.isAbsent).label.split(' ')[0]
              }
            };
          }
          return s;
        });
        saveStoredStudents(updated);
      }

      // Dispatch custom event for real-time live performance graph updates
      const marksDetail = {
        testId: selectedTestId,
        testTitle: activeTest.title,
        marks: studentMarks,
        maxMarks: Number(maxMarks),
        date: testDate
      };
      window.dispatchEvent(new CustomEvent('concept_academy:marks-updated', { detail: marksDetail }));
      window.dispatchEvent(new CustomEvent('aspire:marks-updated', { detail: marksDetail }));

      broadcastDataChange('marks', {
        testId: selectedTestId,
        testTitle: activeTest.title,
        marks: studentMarks
      });
      broadcastDataChange('tests', { updatedTestId: selectedTestId });

      setSuccessToast(`✓ Marks successfully uploaded & published for "${activeTest.title}"!`);
      setTimeout(() => setSuccessToast(''), 3500);
    } catch {
      setSuccessToast('⚠️ Marks saved locally.');
      setTimeout(() => setSuccessToast(''), 2500);
    }
  };

  return (
    <div
      className={`fullscreen-page-modal ${isClosing ? 'closing' : ''}`}
      style={{
        position: 'fixed',
        inset: 0,
        maxWidth: '480px',
        margin: '0 auto',
        background: 'var(--canvas)',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Top Navigation Bar */}
      <div style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        flexShrink: 0,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
          <button
            onClick={handleBack}
            style={{
              background: 'var(--surface-alt)',
              border: '1px solid var(--border)',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--brand-900)',
              flexShrink: 0
            }}
            title="Back to Admin"
          >
            <ArrowLeft size={17} />
          </button>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h2 style={{ fontSize: '15.5px', fontWeight: 800, color: 'var(--brand-900)', margin: 0, lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                Marks Upload
              </h2>
              <span className="badge" style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', fontSize: '9.5px', fontWeight: 700, padding: '1px 5px', whiteSpace: 'nowrap' }}>
                Quick Action
              </span>
            </div>
            <p style={{ fontSize: '10.5px', color: 'var(--text-secondary)', margin: '2px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Grade & publish student test scores
            </p>
          </div>
        </div>

        {/* Header Publish Button */}
        <button
          type="button"
          onClick={handleSaveMarks}
          disabled={!activeTest}
          className="btn-primary"
          style={{
            padding: '7px 12px',
            fontSize: '11.5px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            borderRadius: '8px',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            opacity: activeTest ? 1 : 0.5,
            cursor: activeTest ? 'pointer' : 'not-allowed'
          }}
        >
          <Save size={14} />
          <span>Publish</span>
        </button>
      </div>

      {/* Success Banner */}
      {successToast && (
        <div style={{
          background: '#ecfdf5',
          color: '#065f46',
          borderBottom: '1px solid #a7f3d0',
          padding: '8px 14px',
          fontSize: '12px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0,
          animation: 'fadeInShade 0.2s ease-out'
        }}>
          <CheckCircle2 size={15} color="#059669" style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{successToast}</span>
        </div>
      )}

      {/* Scrollable Container */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        
        {/* Test Selector Card */}
        <div className="card" style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--brand-800)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Select Test to Grade
            </span>
            <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
              {tests.length} {tests.length === 1 ? 'test' : 'tests'} available
            </span>
          </div>

          <MobileDropdown
            value={selectedTestId || ''}
            onChange={setSelectedTestId}
            options={[
              { value: '', label: 'No Paper Selected' },
              ...tests.map(t => ({
                value: t.id,
                label: `${t.title} (${t.course})`,
                badge: t.course,
                description: `${t.subject} • Max Marks: ${t.maxMarks || 100}`
              }))
            ]}
            title="Select Test to Grade"
            placeholder="Select Test Assessment..."
            variant="compact"
          />

          {/* Test Parameters Bar */}
          <div style={{
            background: 'var(--surface-alt)',
            padding: '8px 10px',
            borderRadius: '8px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '6px',
            alignItems: 'center'
          }}>
            <div style={{ minWidth: 0, textAlign: 'center' }}>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700, display: 'block', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Max</span>
              {activeTest ? (
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={maxMarks}
                  onChange={e => setMaxMarks(e.target.value)}
                  style={{ width: '100%', padding: '3px 4px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '12px', fontWeight: 700, marginTop: '2px', textAlign: 'center', background: 'var(--surface)' }}
                />
              ) : (
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>—</span>
              )}
            </div>
            <div style={{ minWidth: 0, textAlign: 'center' }}>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700, display: 'block', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Pass</span>
              {activeTest ? (
                <input
                  type="number"
                  min="1"
                  max={maxMarks}
                  value={passingMarks}
                  onChange={e => setPassingMarks(e.target.value)}
                  style={{ width: '100%', padding: '3px 4px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '12px', fontWeight: 700, marginTop: '2px', textAlign: 'center', background: 'var(--surface)' }}
                />
              ) : (
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>—</span>
              )}
            </div>
            <div style={{ minWidth: 0, textAlign: 'center' }}>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700, display: 'block', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Date</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: activeTest ? 'var(--text-primary)' : 'var(--text-muted)', display: 'block', marginTop: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {activeTest ? testDate : '—'}
              </span>
            </div>
            <div style={{ minWidth: 0, textAlign: 'center' }}>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700, display: 'block', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Course</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: activeTest ? 'var(--brand-700)' : 'var(--text-muted)', display: 'block', marginTop: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {activeTest ? activeTest.course : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Performance KPI Ribbon */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
          <div className="card" style={{ padding: '8px 3px', textAlign: 'center', borderRadius: '10px' }}>
            <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: 700, display: 'block', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Evaluated</span>
            <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--brand-800)', margin: '2px 0 0 0', whiteSpace: 'nowrap' }}>
              {activeTest ? `${stats.evaluatedCount}/${filteredStudents.length}` : '0/0'}
            </h4>
          </div>
          <div className="card" style={{ padding: '8px 3px', textAlign: 'center', borderRadius: '10px' }}>
            <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: 700, display: 'block', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Class Avg</span>
            <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: '#0284c7', margin: '2px 0 0 0', whiteSpace: 'nowrap' }}>
              {activeTest ? stats.avgScore : '—'}
            </h4>
          </div>
          <div className="card" style={{ padding: '8px 3px', textAlign: 'center', borderRadius: '10px' }}>
            <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: 700, display: 'block', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Highest</span>
            <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: '#16a34a', margin: '2px 0 0 0', whiteSpace: 'nowrap' }}>
              {activeTest ? stats.highestScore : '—'}
            </h4>
          </div>
          <div className="card" style={{ padding: '8px 3px', textAlign: 'center', borderRadius: '10px' }}>
            <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: 700, display: 'block', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Pass Rate</span>
            <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: '#d97706', margin: '2px 0 0 0', whiteSpace: 'nowrap' }}>
              {activeTest ? `${stats.passRate}%` : '0%'}
            </h4>
          </div>
        </div>

        {/* Search & Filter Row */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Search Bar */}
          <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search student or roll..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              disabled={!activeTest}
              style={{
                width: '100%',
                padding: '7px 8px 7px 30px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                fontSize: '12px',
                background: 'var(--surface)',
                opacity: activeTest ? 1 : 0.6
              }}
            />
          </div>

          {/* Course Filter Dropdown */}
          <div style={{ width: '130px', flexShrink: 0 }}>
            <MobileDropdown
              value={selectedCourseFilter}
              onChange={setSelectedCourseFilter}
              disabled={!activeTest}
              options={['All', ...COURSE_OPTIONS]}
              title="Filter Students by Course"
              placeholder="All Courses"
              variant="compact"
            />
          </div>
        </div>

        {/* Students Marks Upload List */}
        <div className="card" style={{ padding: '0 12px', background: 'var(--surface)', borderRadius: '12px' }}>
          <div style={{ padding: '10px 0 8px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Student ({activeTest ? filteredStudents.length : 0})
            </span>
            <span style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Marks {activeTest ? `/ ${maxMarks}` : ''}
            </span>
          </div>

          {!activeTest ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <FileText size={36} color="var(--brand-700)" style={{ margin: '0 auto 10px auto', opacity: 0.6 }} />
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--brand-900)', margin: '0 0 6px 0' }}>
                No Paper Selected
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, maxWidth: '280px', marginInline: 'auto' }}>
                {tests.length === 0
                  ? 'No test papers available. Please add a test from the Test & Paper section.'
                  : 'Please select a test paper from the dropdown above to view students and enter marks.'}
              </p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Users size={32} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
              <p style={{ fontSize: '12.5px', margin: 0 }}>No students found matching current filter.</p>
            </div>
          ) : (
            filteredStudents.map((student, idx) => {
              const entry = studentMarks[student.id] || { score: '', isAbsent: false, remarks: '' };
              const grade = getGradeInfo(entry.score, entry.isAbsent);

              return (
                <div
                  key={student.id || idx}
                  style={{
                    padding: '10px 0',
                    borderBottom: idx < filteredStudents.length - 1 ? '1px solid var(--border)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px'
                  }}
                >
                  {/* Student Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {student.name}
                      </span>
                      <span style={{
                        fontSize: '9.5px',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        background: 'var(--surface-alt)',
                        color: 'var(--text-secondary)',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}>
                        #{student.roll || student.rollNumber?.split('-').pop() || idx + 101}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '95px', flexShrink: 1 }}>
                        {student.course || '12th Science'}
                      </span>
                      <span style={{
                        fontSize: '9.5px',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '999px',
                        background: grade.bg,
                        color: grade.color,
                        border: `1px solid ${grade.border}`,
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        lineHeight: 1.2
                      }}>
                        {grade.label}
                      </span>
                    </div>
                  </div>

                  {/* Marks Input & Absence Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    {/* Absent button */}
                    <button
                      type="button"
                      onClick={() => handleToggleAbsent(student.id)}
                      style={{
                        padding: '4px 7px',
                        borderRadius: '6px',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        border: entry.isAbsent ? '1px solid #fecaca' : '1px solid var(--border)',
                        background: entry.isAbsent ? '#fee2e2' : 'var(--surface-alt)',
                        color: entry.isAbsent ? '#b91c1c' : 'var(--text-secondary)',
                        transition: 'all 0.15s ease'
                      }}
                      title="Toggle Absent"
                    >
                      {entry.isAbsent ? 'Absent' : 'Present'}
                    </button>

                    {/* Numeric Marks Input */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <input
                        type="number"
                        disabled={entry.isAbsent}
                        value={entry.isAbsent ? '' : entry.score}
                        placeholder={entry.isAbsent ? 'AB' : '0'}
                        min="0"
                        max={maxMarks}
                        onChange={e => handleScoreChange(student.id, e.target.value)}
                        style={{
                          width: '46px',
                          height: '32px',
                          textAlign: 'center',
                          padding: '3px 2px',
                          fontSize: '13.5px',
                          fontWeight: 800,
                          borderRadius: '7px',
                          border: entry.isAbsent ? '1px solid #fecaca' : (entry.score !== '' ? '1.5px solid #3b82f6' : '1px solid var(--border)'),
                          background: entry.isAbsent ? '#fef2f2' : (entry.score !== '' ? '#eff6ff' : 'var(--surface)'),
                          color: entry.isAbsent ? '#dc2626' : 'var(--brand-900)'
                        }}
                      />
                      <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 600, width: '28px', whiteSpace: 'nowrap' }}>
                        /{maxMarks}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Sticky Bottom Save Action Panel */}
      <div style={{
        padding: '10px 14px',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        flexShrink: 0,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
      }}>
        <button
          type="button"
          onClick={handleSaveMarks}
          disabled={!activeTest}
          className="btn-primary"
          style={{
            width: '100%',
            padding: '11px',
            fontSize: '13px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            borderRadius: '10px',
            opacity: activeTest ? 1 : 0.6,
            cursor: activeTest ? 'pointer' : 'not-allowed',
            boxShadow: activeTest ? '0 3px 12px rgba(30, 58, 138, 0.2)' : 'none'
          }}
        >
          <Save size={16} />
          <span>
            {activeTest 
              ? `Save & Publish Marks (${stats.evaluatedCount}/${filteredStudents.length} entered)`
              : 'No Paper Selected'}
          </span>
        </button>
      </div>
    </div>
  );
}
