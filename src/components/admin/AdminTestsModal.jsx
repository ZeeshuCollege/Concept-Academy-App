import React, { useState, useEffect } from 'react';
import { 
  X, Plus, Search, FileText, Calendar, 
  ExternalLink, Copy, Check, Trash2, ChevronRight,
  ArrowLeft, FileCheck, Layers
} from 'lucide-react';
import { mockTests } from '../../lib/mockData';
import { COURSE_OPTIONS, SUBJECT_OPTIONS } from './AdminStudyMaterialsModal';
import MobileDropdown from '../common/MobileDropdown';
import { broadcastDataChange, useDataSync } from '../../lib/syncEvents';

export const DURATION_OPTIONS = [
  '45 min',
  '60 min',
  '90 min',
  '120 min (2 hrs)',
  '180 min (3 hrs)',
  '200 min'
];

export default function AdminTestsModal({ isOpen, onClose }) {
  const [tests, setTests] = useState(() => {
    try {
      const saved = localStorage.getItem('concept_academy_tests_list') || localStorage.getItem('aspire_tests_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    try {
      const json = JSON.stringify(tests);
      localStorage.setItem('concept_academy_tests_list', json);
      localStorage.setItem('aspire_tests_list', json);
      broadcastDataChange('tests', { count: tests.length });
    } catch (e) {}
  }, [tests]);

  useDataSync(['tests'], () => {
    try {
      const saved = localStorage.getItem('concept_academy_tests_list') || localStorage.getItem('aspire_tests_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setTests(parsed);
      }
    } catch (e) {}
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('All');

  // Selected test for full detailed view
  const [selectedTest, setSelectedTest] = useState(null);

  // Add Test Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Physics (JEE)');
  const [newCourse, setNewCourse] = useState('JEE');
  const [newDate, setNewDate] = useState(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
  const [newDuration, setNewDuration] = useState('90 min');
  const [newMaxMarks, setNewMaxMarks] = useState('100');
  const [newPassingMarks, setNewPassingMarks] = useState('35');
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('');
  const [newInstructions, setNewInstructions] = useState('1. All questions are compulsory.\n2. Negative marking applies for incorrect responses.');

  const [copiedLink, setCopiedLink] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Reverse Closing Animation States
  const [isClosing, setIsClosing] = useState(false);
  const [isDetailClosing, setIsDetailClosing] = useState(false);
  const [isAddFormClosing, setIsAddFormClosing] = useState(false);

  const handleBack = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 320);
  };

  const handleBackDetail = () => {
    if (isDetailClosing) return;
    setIsDetailClosing(true);
    setTimeout(() => {
      setIsDetailClosing(false);
      setSelectedTest(null);
    }, 320);
  };

  const handleBackAddForm = () => {
    if (isAddFormClosing) return;
    setIsAddFormClosing(true);
    setTimeout(() => {
      setIsAddFormClosing(false);
      setShowAddForm(false);
    }, 320);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showAddForm) {
          handleBackAddForm();
        } else if (selectedTest) {
          handleBackDetail();
        } else {
          handleBack();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showAddForm, selectedTest, isClosing, isDetailClosing, isAddFormClosing]);

  if (!isOpen) return null;

  const handleCopyLink = (url) => {
    if (!url) return;
    navigator.clipboard?.writeText?.(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddTest = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let processedUrl = newAttachmentUrl.trim();
    if (processedUrl.includes('drive.google.com/file/d/') && processedUrl.includes('/view')) {
      processedUrl = processedUrl.replace(/\/view(\?.*)?$/, '/preview');
    }

    const newT = {
      id: `t-${Date.now()}`,
      title: newTitle.trim(),
      code: `${newSubject.substring(0, 4).toUpperCase()}-T${tests.length + 1}`,
      subject: newSubject,
      course: newCourse,
      chapter: 'Complete Syllabus',
      date: newDate,
      duration: newDuration,
      maxMarks: parseInt(newMaxMarks) || 100,
      passingMarks: parseInt(newPassingMarks) || 35,
      mode: 'Offline Classroom',
      size: 'PDF Paper',
      status: 'Upcoming',
      paperUrl: processedUrl || 'https://drive.google.com/file/d/1fRm5DBtyZYxEYMpTtQ2ujCBvME4zz749/preview',
      attachmentUrl: processedUrl || 'https://drive.google.com/file/d/1fRm5DBtyZYxEYMpTtQ2ujCBvME4zz749/preview',
      instructions: newInstructions.trim()
    };

    setTests([newT, ...tests]);
    mockTests.unshift(newT);

    // Reset
    setNewTitle('');
    setNewAttachmentUrl('');
    setShowAddForm(false);

    setSuccessToast(`✓ Test "${newT.title}" scheduled successfully!`);
    setTimeout(() => setSuccessToast(''), 3500);
  };

  const handleDeleteTest = (id, e) => {
    e?.stopPropagation();
    setTests(prev => prev.filter(t => t.id !== id));
    if (selectedTest?.id === id) {
      setSelectedTest(null);
    }
  };

  const filteredTests = tests.filter(t => {
    const titleOrCode = (t.title || t.code || '').toLowerCase();
    const matchesSearch = titleOrCode.includes(searchTerm.toLowerCase()) ||
      (t.course && t.course.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.subject && t.subject.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCourse = selectedCourseFilter === 'All' || t.course === selectedCourseFilter;
    return matchesSearch && matchesCourse;
  });

  return (
    <div 
      className={`fullscreen-page-modal ${isClosing ? 'closing' : ''}`}
      style={{ zIndex: 1200 }}
    >
      {/* Header Bar */}
      <div style={{
        padding: '14px 20px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleBack}
            aria-label="Back"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              background: 'var(--surface-alt)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={19} />
          </button>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #b91c1c 0%, #f87171 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(185, 28, 28, 0.25)'
          }}>
            <FileCheck size={21} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-900)', margin: 0 }}>
              Tests & Examinations
            </h3>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              {tests.length} Scheduled / Completed Tests & Papers
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleBack}
            aria-label="Close"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              background: 'var(--surface-alt)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={19} />
          </button>
        </div>
      </div>

        {/* Feedback Alert Toast */}
        {successToast && (
          <div style={{ background: '#ecfdf5', borderBottom: '1px solid #a7f3d0', color: '#065f46', padding: '9px 18px', fontSize: '12.5px', fontWeight: 700 }}>
            {successToast}
          </div>
        )}

        {/* Filter & Search Bar */}
        <div style={{ padding: '12px 18px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
            <input
              type="text"
              placeholder="Search tests by title, subject or course..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                fontSize: '13px',
                background: 'var(--surface)'
              }}
            />
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <div style={{ minWidth: '150px', flex: '0 0 auto' }}>
            <MobileDropdown
              value={selectedCourseFilter}
              onChange={setSelectedCourseFilter}
              options={['All', ...COURSE_OPTIONS]}
              title="Filter Tests by Course"
              placeholder="All Courses"
              variant="compact"
            />
          </div>
        </div>

        {/* List of Previously Uploaded Tests */}
        {/* "At first only the name, course to which uploaded, size and date on which uploaded will be seen" */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredTests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <FileCheck size={36} color="var(--text-muted)" style={{ margin: '0 auto 10px auto', opacity: 0.5 }} />
              <p style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>No tests found</p>
              <span style={{ fontSize: '12px' }}>Click "+ Add Test" to schedule a test and attach the question paper.</span>
            </div>
          ) : (
            filteredTests.map(t => (
              <div
                key={t.id}
                onClick={() => setSelectedTest(t)}
                className="card"
                style={{
                  padding: '14px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  background: 'var(--surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                {/* Name / Title */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: '#fee2e2',
                      color: '#b91c1c',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <FileText size={15} />
                    </div>
                    <h4 style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--brand-900)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.title || t.code}
                    </h4>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--brand-700)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
                    Details <ChevronRight size={14} />
                  </span>
                </div>

                {/* Initial Info Row: Course, Size, Date */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  paddingTop: '2px'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: 'var(--brand-800)' }}>
                    <Layers size={13} color="var(--brand-600)" />
                    {t.course || '12th Science'}
                  </span>
                  <span>•</span>
                  <span>💾 {t.size || '507 KB'}</span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Calendar size={13} color="var(--text-muted)" />
                    {t.date || 'Upcoming'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Shifted Add Test Button covering Left to Right ── */}
        <div style={{
          padding: '12px 16px',
          paddingBottom: 'calc(12px + var(--safe-area-bottom, env(safe-area-inset-bottom, 0px)))',
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          flexShrink: 0
        }}>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '13px 18px',
              fontSize: '13.5px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              borderRadius: '12px',
              boxShadow: '0 4px 14px rgba(10, 31, 61, 0.2)'
            }}
          >
            <Plus size={18} />
            <span>Add Test & Paper</span>
          </button>
        </div>

      {/* ====================================================================
          FULL DETAILED INTERFACE FOR AN INDIVIDUAL TEST
          "then when clicked on the block a full detailed interface will be opened for every individual item containing the attachment"
         ==================================================================== */}
      {selectedTest && (
        <div 
          className={`fullscreen-page-modal ${isDetailClosing ? 'closing' : ''}`}
          style={{ zIndex: 1250 }}
        >
          {/* Test Detail Header */}
          <div style={{
            padding: '14px 20px',
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={handleBackDetail}
                aria-label="Back"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface-alt)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={19} />
              </button>
              <div>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '2px' }}>
                  <span className={`badge ${selectedTest.status === 'Completed' ? 'badge-success' : 'badge-danger'}`}>
                    {selectedTest.status || 'Upcoming'}
                  </span>
                  <span className="badge badge-accent">
                    {selectedTest.subject}
                  </span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-900)', margin: 0 }}>
                  {selectedTest.title || selectedTest.code}
                </h3>
              </div>
            </div>

            <button
              onClick={handleBackDetail}
              aria-label="Close"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                background: 'var(--surface-alt)',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>

            {/* Detailed Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Test Specifications Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div style={{ padding: '10px 12px', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Duration</span>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--brand-900)', marginTop: '2px' }}>
                    {selectedTest.duration || '90 min'}
                  </div>
                </div>

                <div style={{ padding: '10px 12px', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Max Marks</span>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#2563eb', marginTop: '2px' }}>
                    {selectedTest.maxMarks || 100}
                  </div>
                </div>

                <div style={{ padding: '10px 12px', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Passing Marks</span>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#16a34a', marginTop: '2px' }}>
                    {selectedTest.passingMarks || 35}
                  </div>
                </div>
              </div>

              {/* Course & Date Info */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div style={{ padding: '12px', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Target Course</span>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brand-900)', marginTop: '2px' }}>
                    {selectedTest.course || '12th Science'}
                  </div>
                </div>

                <div style={{ padding: '12px', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Examination Date</span>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brand-900)', marginTop: '2px' }}>
                    {selectedTest.date || 'Upcoming'}
                  </div>
                </div>
              </div>

              {/* Instructions */}
              {selectedTest.instructions && (
                <div style={{ padding: '12px', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Student Exam Instructions</span>
                  <p style={{ fontSize: '12px', color: 'var(--text-primary)', margin: '4px 0 0 0', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                    {selectedTest.instructions}
                  </p>
                </div>
              )}

              {/* Question Paper Attachment Section */}
              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1.5px solid var(--brand-200)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--brand-900)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Question Paper Attachment
                  </span>
                  <button
                    onClick={() => handleCopyLink(selectedTest.attachmentUrl || selectedTest.paperUrl)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11.5px',
                      padding: '4px 10px',
                      background: '#ffffff',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      color: copiedLink ? 'var(--success)' : 'var(--brand-800)'
                    }}
                  >
                    {copiedLink ? <Check size={13} /> : <Copy size={13} />}
                    {copiedLink ? 'Link Copied!' : 'Copy Paper Link'}
                  </button>
                </div>

                {/* Embedded Viewer for Google Drive Preview */}
                {(selectedTest.attachmentUrl || selectedTest.paperUrl) ? (
                  <div style={{ width: '100%', height: '260px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', background: '#ffffff' }}>
                    <iframe
                      src={selectedTest.attachmentUrl || selectedTest.paperUrl}
                      title={selectedTest.title || selectedTest.code}
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', background: '#ffffff', borderRadius: '8px', border: '1px dashed var(--border)' }}>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>No question paper preview available</p>
                  </div>
                )}

                {/* Action Row */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <a
                    href={selectedTest.attachmentUrl || selectedTest.paperUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ flex: 1, padding: '9px', fontSize: '12.5px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'var(--brand-900)' }}
                  >
                    <ExternalLink size={14} /> Open Full Question Paper
                  </a>
                  <button
                    onClick={(e) => handleDeleteTest(selectedTest.id, e)}
                    style={{
                      padding: '9px 14px',
                      borderRadius: '8px',
                      border: '1px solid #fecaca',
                      background: '#fef2f2',
                      color: '#b91c1c',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* ====================================================================
          "ADD TEST" MODAL
          "take all the required input from the admin. Use dropdowns or multiple selection for things which are few or named specific like course, etc."
         ==================================================================== */}
      {showAddForm && (
        <div 
          className={`fullscreen-page-modal ${isAddFormClosing ? 'closing' : ''}`}
          style={{ zIndex: 1300 }}
        >
          {/* Header */}
          <div style={{
            padding: '14px 20px',
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={handleBackAddForm}
                aria-label="Back"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface-alt)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={19} />
              </button>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-900)', margin: 0 }}>
                  Schedule New Test & Attach Paper
                </h3>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  Provide test duration, marks, and Google Drive question paper link
                </span>
              </div>
            </div>
            <button
              onClick={handleBackAddForm}
              aria-label="Close"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                background: 'var(--surface-alt)',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            <div style={{ maxWidth: '650px', margin: '0 auto' }}>
              <form onSubmit={handleAddTest} style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
                {/* Test Name */}
                <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Test Title / Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GATE 2022 General Aptitude Test"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)', marginTop: '4px', fontSize: '13px' }}
                />
              </div>

              {/* Target Course & Subject */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
                <MobileDropdown
                  label="Target Course"
                  title="Select Target Course"
                  value={newCourse}
                  onChange={setNewCourse}
                  options={COURSE_OPTIONS}
                  required={true}
                />

                <MobileDropdown
                  label="Subject"
                  title="Select Subject"
                  value={newSubject}
                  onChange={setNewSubject}
                  options={SUBJECT_OPTIONS}
                  required={true}
                />
              </div>

              {/* Test Date & Duration */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)' }}>Test Date *</label>
                  <input
                    type="text"
                    placeholder="e.g. 25 Sep 2026"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid var(--border)', marginTop: '4px', fontSize: '13px' }}
                  />
                </div>

                <MobileDropdown
                  label="Duration"
                  title="Select Duration"
                  value={newDuration}
                  onChange={setNewDuration}
                  options={DURATION_OPTIONS}
                  required={true}
                />
              </div>

              {/* Max Marks & Passing Marks */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Maximum Marks *</label>
                  <input
                    type="number"
                    value={newMaxMarks}
                    onChange={e => setNewMaxMarks(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)', marginTop: '4px', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Passing Marks</label>
                  <input
                    type="number"
                    value={newPassingMarks}
                    onChange={e => setNewPassingMarks(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)', marginTop: '4px', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Question Paper Attachment Link */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Question Paper Link (Google Drive /preview link) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/file/d/.../preview"
                  value={newAttachmentUrl}
                  onChange={e => setNewAttachmentUrl(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)', marginTop: '4px', fontSize: '13px' }}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                  Paste Google Drive link. /view will be automatically converted to /preview.
                </span>
              </div>


              {/* Instructions */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Exam Instructions</label>
                <textarea
                  rows={2}
                  value={newInstructions}
                  onChange={e => setNewInstructions(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)', marginTop: '4px', fontSize: '13px', resize: 'vertical' }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={handleBackAddForm}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '10px', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, padding: '10px', fontSize: '13px', background: 'var(--brand-900)' }}
                >
                  Schedule Test
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
