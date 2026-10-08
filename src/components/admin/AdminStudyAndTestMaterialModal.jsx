import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, X, Plus, Search, BookOpen, FileText, FileCheck, 
  CheckCircle, Video, ExternalLink, Copy, Check, Trash2, 
  ChevronRight, Calendar, Clock, Award, Lightbulb, FileQuestion
} from 'lucide-react';
import MobileDropdown from '../common/MobileDropdown';
import { mockStudyMaterials } from '../../lib/mockData';
import { broadcastDataChange, useDataSync } from '../../lib/syncEvents';

export const COURSE_OPTIONS = [
  'JEE',
  'NEET',
  'MHT-CET',
  '9th',
  '10th',
  '11th',
  '12th'
];

export const SUBJECT_OPTIONS = [
  // JEE
  'Physics (JEE)',
  'Chemistry (JEE)',
  'Maths (JEE)',

  // NEET
  'Physics (NEET)',
  'Chemistry (NEET)',
  'Biology (NEET)',

  // MHT-CET
  'Physics (CET)',
  'Chemistry (CET)',
  'Maths (CET)',
  'Biology (CET)',

  // 9th Standard
  'Science (9th)',
  'Maths (9th)',
  'English (9th)',
  'Social Science (9th)',

  // 10th Standard
  'Science (10th)',
  'Maths (10th)',
  'English (10th)',
  'Social Science (10th)'
];

const INITIAL_SOLUTIONS = [
  {
    id: 'sol-1',
    title: 'Rotational Motion Test 01 - Detailed Solutions',
    subject: 'Physics (JEE)',
    course: 'JEE',
    relatedPaper: 'Rotational Dynamics Major Test',
    type: 'PDF',
    date: '15 Mar 2026',
    attachmentUrl: 'https://drive.google.com/file/d/1fRm5DBtyZYxEYMpTtQ2ujCBvME4zz749/preview',
    description: 'Complete step-by-step mathematical solutions and hints for all 30 questions.'
  },
  {
    id: 'sol-2',
    title: 'Thermodynamics & Equilibrium Solutions & Key',
    subject: 'Chemistry (JEE)',
    course: 'JEE',
    relatedPaper: 'Thermodynamics Assessment',
    type: 'PDF',
    date: '10 Mar 2026',
    attachmentUrl: 'https://drive.google.com/file/d/1fRm5DBtyZYxEYMpTtQ2ujCBvME4zz749/preview',
    description: 'Official answer key with equilibrium constant derivations.'
  }
];

export default function AdminStudyAndTestMaterialModal({ isOpen, onClose, initialSubCategory = 'study_material' }) {
  // ── 3 Sub Categories: 'study_material' | 'question_paper' | 'solutions' ──
  const [activeSubCategory, setActiveSubCategory] = useState(initialSubCategory);

  // Sync initial subcategory if changed from outside
  useEffect(() => {
    if (initialSubCategory) {
      setActiveSubCategory(initialSubCategory);
    }
  }, [initialSubCategory, isOpen]);

  // ── 1. Study Materials State (Synced with concept_academy_study_materials) ──
  const [studyMaterials, setStudyMaterials] = useState(() => {
    try {
      const saved = localStorage.getItem('concept_academy_study_materials') || localStorage.getItem('aspire_study_materials');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return mockStudyMaterials || [];
  });

  useEffect(() => {
    try {
      const json = JSON.stringify(studyMaterials);
      localStorage.setItem('concept_academy_study_materials', json);
      localStorage.setItem('aspire_study_materials', json);
      broadcastDataChange('materials', { count: studyMaterials.length });
    } catch (e) {}
  }, [studyMaterials]);

  // ── 2. Question Papers State (Synced with concept_academy_tests_list) ──
  const [questionPapers, setQuestionPapers] = useState(() => {
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
      const json = JSON.stringify(questionPapers);
      localStorage.setItem('concept_academy_tests_list', json);
      localStorage.setItem('aspire_tests_list', json);
      broadcastDataChange('tests', { count: questionPapers.length });
    } catch (e) {}
  }, [questionPapers]);

  useDataSync(['materials'], () => {
    try {
      const saved = localStorage.getItem('concept_academy_study_materials') || localStorage.getItem('aspire_study_materials');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setStudyMaterials(parsed);
      }
    } catch (e) {}
  });

  useDataSync(['tests'], () => {
    try {
      const saved = localStorage.getItem('concept_academy_tests_list') || localStorage.getItem('aspire_tests_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setQuestionPapers(parsed);
      }
    } catch (e) {}
  });

  // ── 3. Solutions State (Synced with concept_academy_solutions_list) ──
  const [solutions, setSolutions] = useState(() => {
    try {
      const saved = localStorage.getItem('concept_academy_solutions_list') || localStorage.getItem('aspire_solutions_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_SOLUTIONS;
  });

  useEffect(() => {
    try {
      const json = JSON.stringify(solutions);
      localStorage.setItem('concept_academy_solutions_list', json);
      localStorage.setItem('aspire_solutions_list', json);
    } catch (e) {}
  }, [solutions]);

  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('All');

  // Selected item for Detail sheet
  const [selectedItem, setSelectedItem] = useState(null);

  // Add Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Physics (JEE)');
  const [newCourse, setNewCourse] = useState('JEE');
  const [newChapter, setNewChapter] = useState('');
  const [newType, setNewType] = useState('PDF');
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');
  
  // Specific to Question Papers
  const [newDate, setNewDate] = useState(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
  const [newDuration, setNewDuration] = useState('90 min');
  const [newMaxMarks, setNewMaxMarks] = useState('100');
  const [newPassingMarks, setNewPassingMarks] = useState('35');
  const [newInstructions, setNewInstructions] = useState('1. All questions compulsory.\n2. Negative marking applicable.');

  // Specific to Solutions
  const [newRelatedPaper, setNewRelatedPaper] = useState('');

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
      setSelectedItem(null);
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

  // Android hardware back / gesture support
  useEffect(() => {
    if (!isOpen) return;
    const handleAppBack = (e) => {
      if (showAddForm) {
        handleBackAddForm();
        e.detail?.markHandled();
      } else if (selectedItem) {
        handleBackDetail();
        e.detail?.markHandled();
      } else {
        handleBack();
        e.detail?.markHandled();
      }
    };
    window.addEventListener('app:back', handleAppBack);
    return () => window.removeEventListener('app:back', handleAppBack);
  }, [isOpen, showAddForm, selectedItem]);

  // Keyboard Escape handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showAddForm) {
          handleBackAddForm();
        } else if (selectedItem) {
          handleBackDetail();
        } else {
          handleBack();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showAddForm, selectedItem]);

  if (!isOpen) return null;

  const handleCopyLink = (url) => {
    if (!url) return;
    navigator.clipboard?.writeText?.(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Convert Google Drive view links to preview
  const formatAttachmentUrl = (url) => {
    let clean = (url || '').trim();
    if (clean.includes('drive.google.com/file/d/') && clean.includes('/view')) {
      clean = clean.replace(/\/view(\?.*)?$/, '/preview');
    }
    return clean || 'https://drive.google.com/file/d/1fRm5DBtyZYxEYMpTtQ2ujCBvME4zz749/preview';
  };

  // Unified Add Item Handler
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const attachment = formatAttachmentUrl(newAttachmentUrl);
    const dateFormatted = newDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    if (activeSubCategory === 'study_material') {
      const newMat = {
        id: `mat-${Date.now()}`,
        title: newTitle.trim(),
        subject: newSubject,
        course: newCourse,
        chapter: newChapter.trim() || 'General Unit',
        type: newType,
        size: newType === 'Video' ? 'Video Stream' : 'PDF Document',
        date: dateFormatted,
        attachmentUrl: attachment,
        description: newDescription.trim() || 'Study material uploaded by Concept Academy Admin.'
      };
      setStudyMaterials([newMat, ...studyMaterials]);
      setSuccessToast(`✓ Study Material "${newMat.title}" added successfully!`);
    } else if (activeSubCategory === 'question_paper') {
      const newTest = {
        id: `tst-${Date.now()}`,
        title: newTitle.trim(),
        subject: newSubject,
        course: newCourse,
        chapter: newChapter.trim() || 'Test Paper',
        date: dateFormatted,
        duration: newDuration,
        maxMarks: Number(newMaxMarks) || 100,
        passingMarks: Number(newPassingMarks) || 35,
        status: 'Upcoming',
        type: 'Question Paper',
        attachmentUrl: attachment,
        instructions: newInstructions.trim() || 'All questions compulsory.'
      };
      setQuestionPapers([newTest, ...questionPapers]);
      setSuccessToast(`✓ Question Paper "${newTest.title}" published successfully!`);
    } else if (activeSubCategory === 'solutions') {
      const newSol = {
        id: `sol-${Date.now()}`,
        title: newTitle.trim(),
        subject: newSubject,
        course: newCourse,
        relatedPaper: newRelatedPaper.trim() || 'Question Paper',
        type: newType,
        date: dateFormatted,
        attachmentUrl: attachment,
        description: newDescription.trim() || 'Solution key uploaded by Concept Academy Admin.'
      };
      setSolutions([newSol, ...solutions]);
      setSuccessToast(`✓ Solution "${newSol.title}" uploaded successfully!`);
    }

    // Reset Form
    setNewTitle('');
    setNewChapter('');
    setNewAttachmentUrl('');
    setNewDescription('');
    setNewRelatedPaper('');
    setShowAddForm(false);
    setTimeout(() => setSuccessToast(''), 3500);
  };

  // Unified Delete Handler
  const handleDeleteItem = (id, e) => {
    e?.stopPropagation();
    if (activeSubCategory === 'study_material') {
      setStudyMaterials(prev => prev.filter(m => m.id !== id));
    } else if (activeSubCategory === 'question_paper') {
      setQuestionPapers(prev => prev.filter(t => t.id !== id));
    } else if (activeSubCategory === 'solutions') {
      setSolutions(prev => prev.filter(s => s.id !== id));
    }

    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
  };

  // Current active dataset
  const currentList = activeSubCategory === 'study_material'
    ? studyMaterials
    : activeSubCategory === 'question_paper'
      ? questionPapers
      : solutions;

  const filteredItems = (currentList || []).filter(item => {
    if (!item) return false;
    const q = (searchTerm || '').toLowerCase().trim();
    const matchesSearch = !q ||
      String(item.title || '').toLowerCase().includes(q) ||
      (item.course && String(item.course).toLowerCase().includes(q)) ||
      (item.subject && String(item.subject).toLowerCase().includes(q)) ||
      (item.chapter && String(item.chapter).toLowerCase().includes(q)) ||
      (item.relatedPaper && String(item.relatedPaper).toLowerCase().includes(q));
    const matchesCourse = selectedCourseFilter === 'All' || item.course === selectedCourseFilter;
    return matchesSearch && matchesCourse;
  });

  return (
    <div 
      className={`fullscreen-page-modal ${isClosing ? 'closing' : ''}`}
      style={{ zIndex: 1200 }}
    >
      {/* ── Header Bar ── */}
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
              background: 'var(--surface-alt, #f8fafc)',
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
            background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
          }}>
            <BookOpen size={21} />
          </div>

          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-900)', margin: 0 }}>
              Study and Test Material
            </h3>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              Unified Repository • Study Material, Papers & Solutions
            </span>
          </div>
        </div>

        <button
          onClick={handleBack}
          aria-label="Close"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            background: 'var(--surface-alt, #f8fafc)',
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

      {/* ── Sub-Categories Segmented Switcher ── */}
      <div style={{
        padding: '10px 18px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          background: '#f1f5f9',
          padding: '4px',
          borderRadius: '12px',
          gap: '4px'
        }}>
          {/* Sub Category 1: Study Material */}
          <button
            type="button"
            onClick={() => { setActiveSubCategory('study_material'); setSelectedItem(null); }}
            style={{
              padding: '8px 6px',
              borderRadius: '9px',
              border: 'none',
              fontWeight: 800,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              transition: 'all 0.18s ease',
              background: activeSubCategory === 'study_material' ? '#ffffff' : 'transparent',
              color: activeSubCategory === 'study_material' ? '#0284c7' : 'var(--text-muted, #64748b)',
              boxShadow: activeSubCategory === 'study_material' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            <BookOpen size={14} />
            <span>Study Material</span>
            <span style={{
              fontSize: '10px',
              padding: '1px 5px',
              borderRadius: '999px',
              background: activeSubCategory === 'study_material' ? '#e0f2fe' : '#e2e8f0',
              color: activeSubCategory === 'study_material' ? '#0369a1' : '#64748b',
              fontWeight: 800
            }}>
              {studyMaterials.length}
            </span>
          </button>

          {/* Sub Category 2: Question Paper */}
          <button
            type="button"
            onClick={() => { setActiveSubCategory('question_paper'); setSelectedItem(null); }}
            style={{
              padding: '8px 6px',
              borderRadius: '9px',
              border: 'none',
              fontWeight: 800,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              transition: 'all 0.18s ease',
              background: activeSubCategory === 'question_paper' ? '#ffffff' : 'transparent',
              color: activeSubCategory === 'question_paper' ? '#b91c1c' : 'var(--text-muted, #64748b)',
              boxShadow: activeSubCategory === 'question_paper' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            <FileText size={14} />
            <span>Question Paper</span>
            <span style={{
              fontSize: '10px',
              padding: '1px 5px',
              borderRadius: '999px',
              background: activeSubCategory === 'question_paper' ? '#fee2e2' : '#e2e8f0',
              color: activeSubCategory === 'question_paper' ? '#b91c1c' : '#64748b',
              fontWeight: 800
            }}>
              {questionPapers.length}
            </span>
          </button>

          {/* Sub Category 3: Solutions */}
          <button
            type="button"
            onClick={() => { setActiveSubCategory('solutions'); setSelectedItem(null); }}
            style={{
              padding: '8px 6px',
              borderRadius: '9px',
              border: 'none',
              fontWeight: 800,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              transition: 'all 0.18s ease',
              background: activeSubCategory === 'solutions' ? '#ffffff' : 'transparent',
              color: activeSubCategory === 'solutions' ? '#047857' : 'var(--text-muted, #64748b)',
              boxShadow: activeSubCategory === 'solutions' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            <CheckCircle size={14} />
            <span>Solutions</span>
            <span style={{
              fontSize: '10px',
              padding: '1px 5px',
              borderRadius: '999px',
              background: activeSubCategory === 'solutions' ? '#d1fae5' : '#e2e8f0',
              color: activeSubCategory === 'solutions' ? '#065f46' : '#64748b',
              fontWeight: 800
            }}>
              {solutions.length}
            </span>
          </button>
        </div>
      </div>

      {/* ── Feedback Alert Toast ── */}
      {successToast && (
        <div style={{ background: '#ecfdf5', borderBottom: '1px solid #a7f3d0', color: '#065f46', padding: '9px 18px', fontSize: '12.5px', fontWeight: 700 }}>
          {successToast}
        </div>
      )}

      {/* ── Filter & Search Bar ── */}
      <div style={{ padding: '12px 18px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
          <input
            type="text"
            placeholder={`Search ${activeSubCategory === 'study_material' ? 'study materials' : activeSubCategory === 'question_paper' ? 'question papers' : 'solutions'}...`}
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
            title="Filter by Course"
            placeholder="All Courses"
            variant="compact"
          />
        </div>
      </div>

      {/* ── Items List ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            {activeSubCategory === 'study_material' && <BookOpen size={36} color="var(--text-muted)" style={{ margin: '0 auto 10px auto', opacity: 0.5 }} />}
            {activeSubCategory === 'question_paper' && <FileText size={36} color="var(--text-muted)" style={{ margin: '0 auto 10px auto', opacity: 0.5 }} />}
            {activeSubCategory === 'solutions' && <CheckCircle size={36} color="var(--text-muted)" style={{ margin: '0 auto 10px auto', opacity: 0.5 }} />}
            <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: 'var(--brand-900)' }}>
              No {activeSubCategory === 'study_material' ? 'study materials' : activeSubCategory === 'question_paper' ? 'question papers' : 'solutions'} found
            </p>
            <span style={{ fontSize: '12px' }}>
              Click below to upload new {activeSubCategory === 'study_material' ? 'study notes or DPPs' : activeSubCategory === 'question_paper' ? 'exam question papers' : 'answer keys & solutions'}.
            </span>
          </div>
        ) : (
          filteredItems.map(item => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
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
              {/* Title & Category Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: activeSubCategory === 'study_material' ? (item.type === 'Video' ? '#fee2e2' : '#eff6ff') : activeSubCategory === 'question_paper' ? '#fee2e2' : '#ecfdf5',
                    color: activeSubCategory === 'study_material' ? (item.type === 'Video' ? '#dc2626' : '#2563eb') : activeSubCategory === 'question_paper' ? '#b91c1c' : '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {activeSubCategory === 'study_material' ? (item.type === 'Video' ? <Video size={16} /> : <FileText size={16} />) : activeSubCategory === 'question_paper' ? <FileCheck size={16} /> : <Lightbulb size={16} />}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: 800,
                      color: 'var(--brand-900)',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.title}
                    </h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {item.subject} • {item.chapter || item.relatedPaper || 'General'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="badge badge-accent" style={{ fontSize: '10px' }}>
                    {item.course}
                  </span>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </div>
              </div>

              {/* Subtitle Details: Date, Max Marks / Size */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '11px',
                color: 'var(--text-muted)',
                paddingTop: '6px',
                borderTop: '1px solid #f1f5f9'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} /> {item.date}
                </span>

                {activeSubCategory === 'study_material' && (
                  <span style={{ fontWeight: 600, color: 'var(--brand-800)' }}>
                    {item.size || 'PDF'}
                  </span>
                )}

                {activeSubCategory === 'question_paper' && (
                  <span style={{ fontWeight: 600, color: '#b91c1c' }}>
                    {item.maxMarks ? `${item.maxMarks} Marks • ${item.duration || '90m'}` : item.duration}
                  </span>
                )}

                {activeSubCategory === 'solutions' && (
                  <span style={{ fontWeight: 600, color: '#047857' }}>
                    Solution Key
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Bottom Action Button (+ Add New) ── */}
      <div style={{
        padding: '14px 20px',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        gap: '10px'
      }}>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary"
          style={{
            flex: 1,
            padding: '12px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            borderRadius: '10px',
            fontWeight: 800
          }}
        >
          <Plus size={16} />
          {activeSubCategory === 'study_material' && 'Add Study Material'}
          {activeSubCategory === 'question_paper' && 'Upload Question Paper'}
          {activeSubCategory === 'solutions' && 'Add Solution Key'}
        </button>
      </div>

      {/* ── Detailed Full View Sheet/Modal ── */}
      {selectedItem && (
        <div 
          className={`fullscreen-page-modal ${isDetailClosing ? 'closing' : ''}`}
          style={{ zIndex: 1250 }}
        >
          <div style={{
            padding: '14px 20px',
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={handleBackDetail}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface-alt, #f8fafc)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={19} />
              </button>
              <h4 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--brand-900)' }}>
                {activeSubCategory === 'study_material' ? 'Material Details' : activeSubCategory === 'question_paper' ? 'Question Paper Details' : 'Solution Details'}
              </h4>
            </div>

            <button
              onClick={handleBackDetail}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                background: 'var(--surface-alt, #f8fafc)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={19} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card" style={{ padding: '16px', borderRadius: '14px' }}>
              <span className="badge badge-accent" style={{ marginBottom: '8px', display: 'inline-block' }}>
                {selectedItem.course}
              </span>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--brand-900)', margin: '0 0 6px 0' }}>
                {selectedItem.title}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                Subject: <strong>{selectedItem.subject}</strong>
              </p>
              {selectedItem.chapter && (
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Chapter / Unit: {selectedItem.chapter}
                </p>
              )}
              {selectedItem.relatedPaper && (
                <p style={{ fontSize: '12.5px', color: '#047857', fontWeight: 600, margin: '4px 0 0 0' }}>
                  Linked Question Paper: {selectedItem.relatedPaper}
                </p>
              )}
            </div>

            {/* Quick Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Date Published</span>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--brand-900)', marginTop: '2px' }}>
                  {selectedItem.date}
                </div>
              </div>

              {activeSubCategory === 'question_paper' ? (
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Total Marks</span>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#b91c1c', marginTop: '2px' }}>
                    {selectedItem.maxMarks || 100} Marks ({selectedItem.duration || '90m'})
                  </div>
                </div>
              ) : (
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Format</span>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--brand-900)', marginTop: '2px' }}>
                    {selectedItem.type || 'PDF Document'}
                  </div>
                </div>
              )}
            </div>

            {/* Description / Instructions */}
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
                {activeSubCategory === 'question_paper' ? 'Exam Instructions' : 'Description & Notes'}
              </span>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '6px 0 0 0', whiteSpace: 'pre-line', lineHeight: 1.5 }}>
                {selectedItem.description || selectedItem.instructions || 'No additional notes provided.'}
              </p>
            </div>

            {/* Attachment Actions */}
            {selectedItem.attachmentUrl && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a
                  href={selectedItem.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{
                    padding: '12px',
                    fontSize: '13px',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    borderRadius: '10px',
                    fontWeight: 800
                  }}
                >
                  <ExternalLink size={16} /> Open & View Document
                </a>

                <button
                  type="button"
                  onClick={() => handleCopyLink(selectedItem.attachmentUrl)}
                  className="btn-secondary"
                  style={{
                    padding: '10px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    borderRadius: '10px',
                    fontWeight: 700
                  }}
                >
                  {copiedLink ? <Check size={15} color="#16a34a" /> : <Copy size={15} />}
                  {copiedLink ? 'Link Copied to Clipboard!' : 'Copy Document Link'}
                </button>
              </div>
            )}

            {/* Delete Item */}
            <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
              <button
                type="button"
                onClick={(e) => {
                  if (window.confirm(`Are you sure you want to remove "${selectedItem.title}"?`)) {
                    handleDeleteItem(selectedItem.id, e);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '11px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '10px',
                  color: '#dc2626',
                  fontWeight: 800,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Trash2 size={16} /> Delete from Repository
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Form Sheet/Modal ── */}
      {showAddForm && (
        <div 
          className={`fullscreen-page-modal ${isAddFormClosing ? 'closing' : ''}`}
          style={{ zIndex: 1250 }}
        >
          <div style={{
            padding: '14px 20px',
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={handleBackAddForm}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface-alt, #f8fafc)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={19} />
              </button>
              <h4 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--brand-900)' }}>
                {activeSubCategory === 'study_material' && 'Add Study Material'}
                {activeSubCategory === 'question_paper' && 'Upload Question Paper'}
                {activeSubCategory === 'solutions' && 'Add Solution Key'}
              </h4>
            </div>

            <button
              onClick={handleBackAddForm}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                background: 'var(--surface-alt, #f8fafc)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={19} />
            </button>
          </div>

          <form onSubmit={handleAddItem} style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Title Input */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-900)', display: 'block', marginBottom: '4px' }}>
                {activeSubCategory === 'study_material' ? 'Material Title *' : activeSubCategory === 'question_paper' ? 'Question Paper / Test Title *' : 'Solution Key Title *'}
              </label>
              <input
                type="text"
                required
                placeholder={activeSubCategory === 'study_material' ? 'e.g. Electromagnetic Induction Complete Notes' : activeSubCategory === 'question_paper' ? 'e.g. Physics Unit Test 03' : 'e.g. Unit Test 03 Detailed Solutions'}
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  fontSize: '13px'
                }}
              />
            </div>

            {/* Course Selector */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-900)', display: 'block', marginBottom: '4px' }}>
                Course / Stream
              </label>
              <MobileDropdown
                value={newCourse}
                onChange={setNewCourse}
                options={COURSE_OPTIONS}
                title="Select Target Course"
                placeholder="Select Course"
              />
            </div>

            {/* Subject Selector */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-900)', display: 'block', marginBottom: '4px' }}>
                Subject
              </label>
              <MobileDropdown
                value={newSubject}
                onChange={setNewSubject}
                options={SUBJECT_OPTIONS}
                title="Select Subject"
                placeholder="Select Subject"
              />
            </div>

            {/* Sub-category specific inputs */}
            {activeSubCategory === 'study_material' && (
              <>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-900)', display: 'block', marginBottom: '4px' }}>
                    Chapter / Unit Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chapter 04: Magnetism"
                    value={newChapter}
                    onChange={e => setNewChapter(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontSize: '13px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-900)', display: 'block', marginBottom: '4px' }}>
                    Format / Type
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {['PDF', 'Video', 'DPP / Worksheet'].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNewType(t)}
                        style={{
                          flex: 1,
                          padding: '9px',
                          borderRadius: '8px',
                          border: `1.5px solid ${newType === t ? '#0284c7' : 'var(--border)'}`,
                          background: newType === t ? '#e0f2fe' : 'var(--surface)',
                          color: newType === t ? '#0369a1' : 'var(--text-secondary)',
                          fontWeight: 700,
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeSubCategory === 'question_paper' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-900)', display: 'block', marginBottom: '4px' }}>
                      Max Marks
                    </label>
                    <input
                      type="number"
                      value={newMaxMarks}
                      onChange={e => setNewMaxMarks(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        fontSize: '13px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-900)', display: 'block', marginBottom: '4px' }}>
                      Duration
                    </label>
                    <input
                      type="text"
                      value={newDuration}
                      onChange={e => setNewDuration(e.target.value)}
                      placeholder="e.g. 90 min"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        fontSize: '13px'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-900)', display: 'block', marginBottom: '4px' }}>
                    Exam Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={newInstructions}
                    onChange={e => setNewInstructions(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontSize: '13px',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
              </>
            )}

            {activeSubCategory === 'solutions' && (
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-900)', display: 'block', marginBottom: '4px' }}>
                  Associated Question Paper / Exam
                </label>
                <input
                  type="text"
                  placeholder="e.g. Unit Test 03 Question Paper"
                  value={newRelatedPaper}
                  onChange={e => setNewRelatedPaper(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    fontSize: '13px'
                  }}
                />
              </div>
            )}

            {/* Document Link Input */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-900)', display: 'block', marginBottom: '4px' }}>
                Document / File Link (Google Drive / Web PDF)
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/file/d/.../view"
                value={newAttachmentUrl}
                onChange={e => setNewAttachmentUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  fontSize: '13px'
                }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                Tip: Google Drive share links are automatically configured for secure preview.
              </span>
            </div>

            {/* Description Input */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-900)', display: 'block', marginBottom: '4px' }}>
                Description / Notes
              </label>
              <textarea
                rows={2}
                placeholder="Brief synopsis or reference guidelines..."
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  fontSize: '13px',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '10px', display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={handleBackAddForm}
                className="btn-secondary"
                style={{ flex: 1, padding: '12px', fontSize: '13px', borderRadius: '10px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{ flex: 1, padding: '12px', fontSize: '13px', borderRadius: '10px', fontWeight: 800 }}
              >
                Save & Publish
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
