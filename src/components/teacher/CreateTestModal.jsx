import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, CheckCircle2 } from 'lucide-react';
import MobileDropdown from '../common/MobileDropdown';
import { broadcastDataChange } from '../../lib/syncEvents';

export default function CreateTestModal({ isOpen, onClose, onCreated }) {
  const [testName, setTestName] = useState('');
  const [subject, setSubject] = useState('Physics');
  const [chapter, setChapter] = useState('Laws of Motion');
  const [date, setDate] = useState('2025-04-18');
  const [duration, setDuration] = useState('1 hr 30 min');
  const [fileUploaded, setFileUploaded] = useState(false);
  const [fileName, setFileName] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 380);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!testName) return;

    const newTest = {
      id: `t-${Date.now()}`,
      code: testName,
      title: testName,
      subject,
      chapter,
      date,
      duration,
      maxMarks: 100,
      status: 'Upcoming'
    };

    try {
      const saved = localStorage.getItem('concept_academy_tests_list') || localStorage.getItem('aspire_tests_list');
      const list = saved ? JSON.parse(saved) : [];
      list.push(newTest);
      const json = JSON.stringify(list);
      localStorage.setItem('concept_academy_tests_list', json);
      localStorage.setItem('aspire_tests_list', json);
      broadcastDataChange('tests', { test: newTest });
    } catch (err) {}

    if (onCreated) {
      onCreated(newTest);
    }
    handleClose();
  };

  const modalContent = (
    <div
      className={`modal-backdrop-05s ${isClosing ? 'closing' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className={`modal-sheet-05s ${isClosing ? 'closing' : ''}`}>
        <div className="sheet-drag-handle" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--brand-900)' }}>Create Test</h3>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Test Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Unit Test 1 - Mechanics"
              value={testName}
              onChange={e => setTestName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <MobileDropdown
              label="Subject"
              title="Select Subject"
              options={[
                { value: 'Physics', label: 'Physics' },
                { value: 'Chemistry', label: 'Chemistry' },
                { value: 'Mathematics', label: 'Mathematics' },
                { value: 'Biology', label: 'Biology' }
              ]}
              value={subject}
              onChange={val => setSubject(val)}
              placeholder="Select Subject"
            />

            <MobileDropdown
              label="Duration"
              title="Select Test Duration"
              options={[
                { value: '45 mins', label: '45 mins' },
                { value: '1 hr', label: '1 hour' },
                { value: '1 hr 30 min', label: '1 hr 30 min' },
                { value: '2 hrs', label: '2 hours' },
                { value: '3 hrs', label: '3 hours (Full Test)' }
              ]}
              value={duration}
              onChange={val => setDuration(val)}
              placeholder="Select Duration"
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Chapter / Topic
            </label>
            <input
              type="text"
              value={chapter}
              onChange={e => setChapter(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Test Date
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px'
              }}
            />
          </div>

          {/* Test Paper Upload Dropzone */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Upload Test Paper (PDF)
            </label>
            <div
              onClick={() => {
                setFileUploaded(true);
                setFileName('Physics_Mock_Test_Paper_2025.pdf');
              }}
              style={{
                border: '2px dashed var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                textAlign: 'center',
                cursor: 'pointer',
                background: fileUploaded ? 'var(--success-tint)' : 'var(--surface-alt)'
              }}
            >
              {fileUploaded ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--success)', fontSize: '12px', fontWeight: 600 }}>
                  <CheckCircle2 size={16} />
                  <span>{fileName} (Attached)</span>
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                  <Upload size={20} style={{ margin: '0 auto 4px auto', display: 'block', color: 'var(--brand-800)' }} />
                  <span>Click to select question paper (PDF, max 10MB)</span>
                </div>
              )}
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '6px' }}>
            Schedule & Publish Test
          </button>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
