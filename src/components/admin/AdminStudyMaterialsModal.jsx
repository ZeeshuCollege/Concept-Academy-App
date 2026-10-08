import React, { useState, useEffect } from 'react';
import { 
  X, Plus, Search, BookOpen, FileText, Video, 
  ExternalLink, Copy, Check, Trash2, ChevronRight,
  ArrowLeft, Layers, Calendar
} from 'lucide-react';
import { mockStudyMaterials } from '../../lib/mockData';
import MobileDropdown from '../common/MobileDropdown';
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

export default function AdminStudyMaterialsModal({ isOpen, onClose }) {
  const [materials, setMaterials] = useState(() => {
    try {
      const saved = localStorage.getItem('concept_academy_study_materials') || localStorage.getItem('aspire_study_materials');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    try {
      const json = JSON.stringify(materials);
      localStorage.setItem('concept_academy_study_materials', json);
      localStorage.setItem('aspire_study_materials', json);
      broadcastDataChange('materials', { count: materials.length });
    } catch (e) {}
  }, [materials]);

  useDataSync(['materials'], () => {
    try {
      const saved = localStorage.getItem('concept_academy_study_materials') || localStorage.getItem('aspire_study_materials');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setMaterials(parsed);
      }
    } catch (e) {}
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('All');
  
  // Selected item for full detailed view
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Add modal state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Physics (JEE)');
  const [newCourse, setNewCourse] = useState('JEE');
  const [newChapter, setNewChapter] = useState('');
  const [newType, setNewType] = useState('PDF');
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');
  
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
  }, [isOpen, showAddForm, selectedItem, isClosing, isDetailClosing, isAddFormClosing]);

  if (!isOpen) return null;

  const handleCopyLink = (url) => {
    if (!url) return;
    navigator.clipboard?.writeText?.(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddMaterial = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let processedUrl = newAttachmentUrl.trim();
    // Auto convert standard Google Drive /view links to /preview
    if (processedUrl.includes('drive.google.com/file/d/') && processedUrl.includes('/view')) {
      processedUrl = processedUrl.replace(/\/view(\?.*)?$/, '/preview');
    }

    const newMat = {
      id: `m-${Date.now()}`,
      title: newTitle.trim(),
      subject: newSubject,
      course: newCourse,
      chapter: newChapter.trim() || 'General Unit',
      type: newType,
      size: newType === 'Video' ? 'Video Stream' : 'PDF Document',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      attachmentUrl: processedUrl || 'https://drive.google.com/file/d/1fRm5DBtyZYxEYMpTtQ2ujCBvME4zz749/preview',
      description: newDescription.trim() || 'Study material uploaded by Concept Academy Admin.'
    };

    setMaterials([newMat, ...materials]);
    mockStudyMaterials.unshift(newMat);

    // Reset Form
    setNewTitle('');
    setNewChapter('');
    setNewAttachmentUrl('');
    setNewDescription('');
    setShowAddForm(false);

    setSuccessToast(`✓ "${newMat.title}" uploaded successfully!`);
    setTimeout(() => setSuccessToast(''), 3500);
  };

  const handleDeleteItem = (id, e) => {
    e?.stopPropagation();
    setMaterials(prev => prev.filter(m => m.id !== id));
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
  };

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.course && m.course.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.subject && m.subject.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCourse = selectedCourseFilter === 'All' || m.course === selectedCourseFilter;
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
            background: 'linear-gradient(135deg, #1d4ed8 0%, #38bdf8 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(29, 78, 216, 0.25)'
          }}>
            <BookOpen size={21} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-900)', margin: 0 }}>
              Study Materials Directory
            </h3>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              {materials.length} Uploaded Items • Course-wise Distribution
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
              placeholder="Search by title, subject or course..."
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
              title="Filter Materials by Course"
              placeholder="All Courses"
              variant="compact"
            />
          </div>
        </div>

        {/* List of Previously Uploaded Items */}
        {/* "At first only the name, course to which uploaded, size and date on which uploaded will be seen" */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredMaterials.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <BookOpen size={36} color="var(--text-muted)" style={{ margin: '0 auto 10px auto', opacity: 0.5 }} />
              <p style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>No study materials found</p>
              <span style={{ fontSize: '12px' }}>Click "+ Add Study Material" to upload notes or test question papers.</span>
            </div>
          ) : (
            filteredMaterials.map(item => (
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
                {/* Name / Title & Quick Action Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: item.type === 'Video' ? '#fee2e2' : '#eff6ff',
                      color: item.type === 'Video' ? '#dc2626' : '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {item.type === 'Video' ? <Video size={15} /> : <FileText size={15} />}
                    </div>
                    <h4 style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--brand-900)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title}
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
                    {item.course || 'All Batches'}
                  </span>
                  <span>•</span>
                  <span>💾 {item.size || '1.5 MB'}</span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Calendar size={13} color="var(--text-muted)" />
                    {item.date || 'Recent'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Shifted Add Study Material Button covering Left to Right ── */}
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
            <span>Add Study Material</span>
          </button>
        </div>

      {/* ====================================================================
          FULL DETAILED INTERFACE FOR AN INDIVIDUAL ITEM
          "when clicked on the block a full detailed interface will be opened for every individual item containing the attachment"
         ==================================================================== */}
      {selectedItem && (
        <div 
          className={`fullscreen-page-modal ${isDetailClosing ? 'closing' : ''}`}
          style={{ zIndex: 1250 }}
        >
          {/* Modal Detail Header */}
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
                  <span className={`badge ${selectedItem.type === 'Video' ? 'badge-accent' : 'badge-info'}`}>
                    {selectedItem.type}
                  </span>
                  <span className="badge badge-success">
                    {selectedItem.subject}
                  </span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-900)', margin: 0 }}>
                  {selectedItem.title}
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
              
              {/* Metadata Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div style={{ padding: '12px', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Target Course</span>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brand-900)', marginTop: '2px' }}>
                    {selectedItem.course || 'All Batches'}
                  </div>
                </div>

                <div style={{ padding: '12px', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Topic / Chapter</span>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brand-900)', marginTop: '2px' }}>
                    {selectedItem.chapter || 'Unit Syllabus'}
                  </div>
                </div>

                <div style={{ padding: '12px', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>File Size</span>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brand-900)', marginTop: '2px' }}>
                    {selectedItem.size || '507 KB'}
                  </div>
                </div>

                <div style={{ padding: '12px', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Upload Date</span>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brand-900)', marginTop: '2px' }}>
                    {selectedItem.date || '19 Sep 2026'}
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedItem.description && (
                <div style={{ padding: '12px', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Description & Instructions</span>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-primary)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                    {selectedItem.description}
                  </p>
                </div>
              )}

              {/* Attachment Section */}
              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1.5px solid var(--brand-200)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--brand-900)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Attachment Preview & Link
                  </span>
                  <button
                    onClick={() => handleCopyLink(selectedItem.attachmentUrl)}
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
                    {copiedLink ? 'Link Copied!' : 'Copy Link'}
                  </button>
                </div>

                {/* Embedded Viewer for Google Drive or YouTube */}
                {selectedItem.attachmentUrl ? (
                  <div style={{ width: '100%', height: '240px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', background: '#000000' }}>
                    <iframe
                      src={selectedItem.attachmentUrl}
                      title={selectedItem.title}
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', background: '#ffffff', borderRadius: '8px', border: '1px dashed var(--border)' }}>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>No direct preview available</p>
                  </div>
                )}

                {/* Action Row */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <a
                    href={selectedItem.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ flex: 1, padding: '9px', fontSize: '12.5px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <ExternalLink size={14} /> Open Full Attachment
                  </a>
                  <button
                    onClick={(e) => handleDeleteItem(selectedItem.id, e)}
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
          "ADD STUDY MATERIAL" MODAL
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
                  Upload New Study Material
                </h3>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  Provide title, subject, course, and Google Drive or YouTube resource link
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
              <form onSubmit={handleAddMaterial} style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
              {/* Name / Title */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Material Name / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GATE 2022 General Aptitude Question Paper"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)', marginTop: '4px', fontSize: '13px' }}
                />
              </div>

              {/* Subject & Format Dropdowns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <MobileDropdown
                  label="Subject"
                  title="Select Subject"
                  value={newSubject}
                  onChange={setNewSubject}
                  options={SUBJECT_OPTIONS}
                  required={true}
                />

                <MobileDropdown
                  label="Material Format"
                  title="Select Material Format"
                  value={newType}
                  onChange={setNewType}
                  options={[
                    { value: 'PDF', label: 'PDF Document (Notes / DPP)' },
                    { value: 'Video', label: 'Video Lecture (YouTube)' }
                  ]}
                  required={true}
                />
              </div>

              {/* Course to which uploaded - Named Dropdown */}
              <MobileDropdown
                label="Course to which Uploaded"
                title="Select Target Course"
                value={newCourse}
                onChange={setNewCourse}
                options={COURSE_OPTIONS}
                required={true}
              />

              {/* Chapter / Topic */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Chapter / Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Verbal & Numerical Ability or Chapter 2"
                  value={newChapter}
                  onChange={e => setNewChapter(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)', marginTop: '4px', fontSize: '13px' }}
                />
              </div>

              {/* Attachment URL (Google Drive preview or YouTube embed) */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Attachment Link (Google Drive / YouTube / Cloud) *
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
                  Tip: Paste Google Drive link. /view will be automatically converted to /preview for instant app viewing.
                </span>
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Description & Notes</label>
                <textarea
                  rows={2}
                  placeholder="Additional instructions or chapter notes for students..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
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
                  style={{ flex: 1, padding: '10px', fontSize: '13px' }}
                >
                  Upload Material
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
