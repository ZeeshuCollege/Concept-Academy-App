import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, User, Mail, Phone, Heart, Users, PhoneCall, 
  Award, CheckCircle2, Calendar, FileText, 
  Copy, Check 
} from 'lucide-react';

export default function StudentDetailCardModal({ isOpen, onClose, student, batch }) {
  const [isClosing, setIsClosing] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  if (!isOpen || !student) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setCopiedKey(null);
    }, 380);
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard?.writeText?.(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const personalDetails = [
    { key: 'name', label: 'Full Name', value: student.name, icon: User, iconBg: '#eff6ff', iconColor: '#1e3a8a' },
    { key: 'roll', label: 'Roll Number', value: student.rollNumber || `CONCEPT-2025-${student.roll}`, icon: Award, iconBg: '#f5f3ff', iconColor: '#8b5cf6' },
    { key: 'email', label: 'Email Id', value: student.email, icon: Mail, iconBg: '#f0f9ff', iconColor: '#0ea5e9', canCopy: true },
    { key: 'phone', label: 'Phone Number', value: student.phone || '—', icon: Phone, iconBg: '#ecfdf5', iconColor: '#10b981', canCopy: !!student.phone, isTel: !!student.phone },
    { key: 'blood', label: 'Blood Group', value: student.bloodGroup || 'Not Specified', icon: Heart, iconBg: '#fef2f2', iconColor: '#ef4444', isBadge: true },
    { key: 'parentName', label: "Parent's Name", value: student.parentName || '—', icon: Users, iconBg: '#fffbeb', iconColor: '#d97706' },
    { key: 'parentPhone', label: "Parent's Phone Number", value: student.parentPhone || '—', icon: PhoneCall, iconBg: '#f0fdf4', iconColor: '#16a34a', canCopy: !!student.parentPhone, isTel: !!student.parentPhone }
  ];

  const test = student.latestTest || {
    subject: batch?.subject || 'Physics',
    title: 'Physics Mechanics & Laws of Motion',
    date: '10 Apr 2025',
    score: 88,
    maxMarks: 100,
    percentage: 88,
    rank: 4,
    classAverage: 71,
    correct: 22,
    incorrect: 2,
    unattempted: 1,
    status: 'Passed (Distinction)',
    grade: 'A'
  };

  const modalContent = (
    <div
      className={`modal-backdrop-05s ${isClosing ? 'closing' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className={`modal-sheet-05s ${isClosing ? 'closing' : ''}`}
        style={{
          maxHeight: '92vh',
          height: 'auto',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--canvas)'
        }}
      >
        {/* Mobile Sheet Drag Handle */}
        <div className="sheet-drag-handle" />

        {/* Top Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px 14px 20px',
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src={student.avatar}
              alt={student.name}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                objectFit: 'cover',
                border: '2px solid var(--border)'
              }}
            />
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--brand-900)', margin: 0, lineHeight: 1.2 }}>
                {student.name}
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                Roll #{student.roll} • {batch?.name || 'Batch JEE 12 - A'}
              </span>
            </div>
          </div>

          <button
            onClick={handleClose}
            style={{
              background: 'var(--surface-alt)',
              border: 'none',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)'
            }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div style={{ overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* ======================================================== */}
          {/* SECTION 1: ATTENDANCE RECORD */}
          {/* ======================================================== */}
          <div className="card" style={{ padding: '16px', background: 'var(--surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={16} />
                </div>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--brand-900)', margin: 0 }}>
                  Attendance Record
                </h4>
              </div>
              <span style={{
                fontSize: '12px',
                fontWeight: 800,
                color: student.attendanceRate >= 85 ? '#15803d' : student.attendanceRate >= 75 ? '#b45309' : '#b91c1c',
                background: student.attendanceRate >= 85 ? '#ecfdf5' : student.attendanceRate >= 75 ? '#fffbeb' : '#fef2f2',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)'
              }}>
                {student.attendanceRate}% Overall
              </span>
            </div>

            {/* Attendance Progress Bar */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <span>Lectures Attended</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {student.attendedCount || 25} / {student.totalCount || 28} Lectures
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--surface-alt)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${student.attendanceRate}%`,
                  height: '100%',
                  background: student.attendanceRate >= 85 ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #f59e0b, #d97706)',
                  borderRadius: '4px'
                }} />
              </div>
            </div>

            {/* Recent 5 Lectures History */}
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Recent Lectures Status
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(student.recentAttendance || ['Present', 'Present', 'Absent', 'Present', 'Present']).map((st, i) => {
                  const isP = st === 'Present';
                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        padding: '6px 4px',
                        borderRadius: '8px',
                        background: isP ? '#ecfdf5' : '#fef2f2',
                        border: `1px solid ${isP ? '#bbf7d0' : '#fecaca'}`,
                        textAlign: 'center'
                      }}
                    >
                      <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>
                        Lec {i + 1}
                      </span>
                      <strong style={{ fontSize: '11px', color: isP ? '#15803d' : '#b91c1c' }}>
                        {isP ? 'P' : 'A'}
                      </strong>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 2: LATEST TEST PERFORMANCE (THAT SUBJECT) */}
          {/* ======================================================== */}
          <div className="card" style={{ padding: '16px', background: 'var(--surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={16} />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--brand-900)', margin: 0 }}>
                    Latest Test Performance
                  </h4>
                  <span style={{ fontSize: '10px', color: 'var(--accent-500)', fontWeight: 700 }}>
                    {test.subject} Assessment
                  </span>
                </div>
              </div>
              <span className="badge badge-accent">
                Grade {test.grade}
              </span>
            </div>

            {/* Test Title & Date */}
            <div style={{ padding: '10px 12px', background: 'var(--surface-alt)', borderRadius: '10px', marginBottom: '12px' }}>
              <h5 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px 0' }}>
                {test.title}
              </h5>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                <Calendar size={12} />
                <span>{test.date}</span>
                <span>•</span>
                <span>Max: {test.maxMarks} Marks</span>
              </div>
            </div>

            {/* Score & Rank Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
              <div style={{ padding: '10px 8px', background: 'var(--surface-alt)', borderRadius: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>Score</span>
                <strong style={{ fontSize: '16px', color: 'var(--brand-900)' }}>{test.score}</strong>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>/{test.maxMarks}</span>
              </div>

              <div style={{ padding: '10px 8px', background: 'var(--surface-alt)', borderRadius: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>Rank</span>
                <strong style={{ fontSize: '16px', color: '#2563eb' }}>#{test.rank}</strong>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>in Batch</span>
              </div>

              <div style={{ padding: '10px 8px', background: 'var(--surface-alt)', borderRadius: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>Class Avg</span>
                <strong style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>{test.classAverage}</strong>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>/100</span>
              </div>
            </div>

            {/* Accuracy Breakdown */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)', padding: '6px 8px', background: 'var(--surface-alt)', borderRadius: '8px' }}>
              <span style={{ color: '#16a34a', fontWeight: 600 }}>✓ {test.correct} Correct</span>
              <span style={{ color: '#dc2626', fontWeight: 600 }}>✕ {test.incorrect} Incorrect</span>
              <span style={{ color: 'var(--text-muted)' }}>• {test.unattempted} Skipped</span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 3: PERSONAL INFORMATION */}
          {/* ======================================================== */}
          <div className="card" style={{ padding: '4px 16px', background: 'var(--surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 0 8px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#f5f3ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={16} />
              </div>
              <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--brand-900)', margin: 0 }}>
                Personal Information
              </h4>
            </div>

            {personalDetails.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    padding: '12px 0',
                    borderBottom: index < personalDetails.length - 1 ? '1px solid var(--border)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '10px',
                      background: item.iconBg,
                      color: item.iconColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Icon size={16} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: 500 }}>
                        {item.label}
                      </span>
                      {item.isBadge ? (
                        <span style={{
                          display: 'inline-block',
                          marginTop: '2px',
                          padding: '2px 8px',
                          background: '#fef2f2',
                          color: '#b91c1c',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '12px',
                          fontWeight: 800
                        }}>
                          {item.value}
                        </span>
                      ) : (
                        <span style={{
                          fontSize: item.key === 'email' ? '12px' : '13px',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          display: 'block',
                          marginTop: '1px',
                          overflowWrap: 'anywhere',
                          wordBreak: 'break-word',
                          lineHeight: 1.35
                        }}>
                          {item.value}
                        </span>
                      )}
                    </div>
                  </div>

                  {item.canCopy && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(item.value, item.key)}
                      style={{
                        flexShrink: 0,
                        background: copiedKey === item.key ? 'var(--success-tint)' : 'var(--surface-alt)',
                        border: '1px solid var(--border)',
                        color: copiedKey === item.key ? 'var(--success)' : 'var(--text-secondary)',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title={`Copy ${item.label}`}
                    >
                      {copiedKey === item.key ? (
                        <>
                          <Check size={12} />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)'
        }}>
          <button
            onClick={handleClose}
            className="btn-primary"
            style={{ width: '100%', padding: '11px', fontSize: '13px' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
