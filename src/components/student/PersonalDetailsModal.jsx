import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, User, Mail, Phone, BookOpen, Heart, 
  ShieldCheck, Copy, Check, Edit3, Lock,
  Save, CheckCircle2, Users, Award 
} from 'lucide-react';
import MobileDropdown from '../common/MobileDropdown';
import { COURSE_OPTIONS } from '../admin/AdminStudyMaterialsModal';
import { DEFAULT_GREY_AVATAR } from '../../lib/mockData';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function PersonalDetailsModal({ isOpen, onClose, user, onSaveUser }) {
  const [isClosing, setIsClosing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isTeacher = user?.role === 'teacher';
  const isParent = user?.role === 'parent';

  // Form State initialized from user props
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bloodGroup: '',
    course: '',
    rollNumber: '',
    parentName: '',
    parentPhone: '',
    subject: '',
    employeeId: '',
    linkedChildName: '',
    linkedChildClass: ''
  });

  // Populate formData whenever modal opens or user prop updates
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || (isTeacher ? 'Teacher' : isParent ? 'Parent' : 'Student'),
        email: user.email || '',
        phone: user.phone || '',
        bloodGroup: user.bloodGroup || '',
        course: user.course || '',
        rollNumber: user.rollNumber || (isTeacher ? '' : isParent ? '' : ''),
        parentName: user.parentName || '',
        parentPhone: user.parentPhone || '',
        subject: user.subjects || user.subject || '',
        employeeId: user.employeeId || '',
        linkedChildName: user.linkedChild?.name || user.linkedChildName || '',
        linkedChildClass: user.linkedChild?.class || user.course || ''
      });
      setIsEditing(false);
      setSaveSuccess(false);
    }
  }, [user, isOpen, isTeacher, isParent]);

  // Android back button / back gesture support
  useEffect(() => {
    if (!isOpen) return;
    const handleAppBack = (e) => {
      if (isEditing) {
        setIsEditing(false);
        e.detail?.markHandled();
        return;
      }
      handleClose();
      e.detail?.markHandled();
    };
    window.addEventListener('app:back', handleAppBack);
    return () => window.removeEventListener('app:back', handleAppBack);
  }, [isOpen, isEditing]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setIsEditing(false);
      setSaveSuccess(false);
    }, 380);
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard?.writeText?.(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Save all personal details
  const handleSave = (e) => {
    if (e) e.preventDefault();
    if (!formData.name.trim()) return;

    const updatedUser = {
      ...user,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      bloodGroup: formData.bloodGroup
    };

    if (isTeacher) {
      // Teacher cannot edit Subjects and Employee-ID; Designation is removed
      updatedUser.subject = user?.subject || user?.subjects || formData.subject;
      updatedUser.subjects = user?.subjects || user?.subject || formData.subject;
      updatedUser.employeeId = user?.employeeId || formData.employeeId;
    } else if (isParent) {
      const selectedCourse = formData.linkedChildClass || user?.linkedChild?.class || 'JEE';
      updatedUser.course = selectedCourse;
      updatedUser.linkedChild = {
        ...(user?.linkedChild || {}),
        name: user?.linkedChild?.name || formData.linkedChildName,
        class: selectedCourse,
        course: selectedCourse
      };
      try {
        localStorage.setItem('concept_academy_parent_child_course', selectedCourse);
        localStorage.setItem('aspire_parent_child_course', selectedCourse);
        localStorage.setItem('concept_academy_user_course', selectedCourse);
        localStorage.setItem('aspire_user_course', selectedCourse);
      } catch (e) {}
    } else {
      const selectedCourse = formData.course || user?.course || 'JEE';
      updatedUser.course = selectedCourse;
      updatedUser.rollNumber = user?.rollNumber || formData.rollNumber;
      if (user?.parentName) updatedUser.parentName = user.parentName;
      if (user?.parentPhone) updatedUser.parentPhone = user.parentPhone;
      try {
        localStorage.setItem('concept_academy_user_course', selectedCourse);
        localStorage.setItem('aspire_user_course', selectedCourse);
      } catch (e) {}
    }

    if (onSaveUser) {
      onSaveUser(updatedUser);
    }

    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Construct view-mode details list based on active role & custom fields
  const getDisplayDetails = () => {
    let list = [];

    if (isTeacher) {
      list = [
        { key: 'fullName', label: 'Full Name', value: formData.name, icon: User, iconColor: '#1e3a8a', iconBg: '#eff6ff' },
        { key: 'email', label: 'Email Id', value: formData.email, icon: Mail, iconColor: '#0ea5e9', iconBg: '#f0f9ff', canCopy: true },
        { key: 'phone', label: 'Phone Number', value: formData.phone, icon: Phone, iconColor: '#10b981', iconBg: '#ecfdf5', canCopy: true },
        { key: 'bloodGroup', label: 'Blood Group', value: formData.bloodGroup, icon: Heart, iconColor: '#ef4444', iconBg: '#fef2f2', isBadge: true },
        { key: 'subjects', label: 'Subject(s)', value: formData.subject, icon: BookOpen, iconColor: '#8b5cf6', iconBg: '#f5f3ff' },
        { key: 'employeeId', label: 'Employee ID', value: formData.employeeId, icon: ShieldCheck, iconColor: '#0284c7', iconBg: '#f0f9ff', canCopy: true }
      ];
    } else if (isParent) {
      list = [
        { key: 'fullName', label: 'Full Name', value: formData.name, icon: User, iconColor: '#1e3a8a', iconBg: '#eff6ff' },
        { key: 'email', label: 'Email Id', value: formData.email, icon: Mail, iconColor: '#0ea5e9', iconBg: '#f0f9ff', canCopy: true },
        { key: 'phone', label: 'Phone Number', value: formData.phone, icon: Phone, iconColor: '#10b981', iconBg: '#ecfdf5', canCopy: true },
        { key: 'child', label: 'Linked Student', value: formData.linkedChildName, icon: Users, iconColor: '#8b5cf6', iconBg: '#f5f3ff' },
        { key: 'childClass', label: "Student's Class", value: formData.linkedChildClass, icon: BookOpen, iconColor: '#2563eb', iconBg: '#eff6ff' },
        { key: 'bloodGroup', label: 'Blood Group', value: formData.bloodGroup, icon: Heart, iconColor: '#ef4444', iconBg: '#fef2f2', isBadge: true }
      ];
    } else {
      // Student
      list = [
        { key: 'fullName', label: 'Full Name', value: formData.name, icon: User, iconColor: '#1e3a8a', iconBg: '#eff6ff' },
        { key: 'rollNumber', label: 'Roll Number', value: formData.rollNumber, icon: Award, iconColor: '#8b5cf6', iconBg: '#f5f3ff', canCopy: true },
        { key: 'email', label: 'Email Id', value: formData.email, icon: Mail, iconColor: '#0ea5e9', iconBg: '#f0f9ff', canCopy: true },
        { key: 'phone', label: 'Phone Number', value: formData.phone, icon: Phone, iconColor: '#10b981', iconBg: '#ecfdf5', canCopy: true },
        { key: 'course', label: 'Course / Stream', value: formData.course, icon: BookOpen, iconColor: '#2563eb', iconBg: '#eff6ff' },
        { key: 'bloodGroup', label: 'Blood Group', value: formData.bloodGroup, icon: Heart, iconColor: '#ef4444', iconBg: '#fef2f2', isBadge: true }
      ];
    }

    return list;
  };

  const displayList = getDisplayDetails();

  const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

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
        {/* Native Mobile Drag Handle */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--brand-800) 0%, var(--accent-500) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(30, 58, 138, 0.2)'
            }}>
              <User size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--brand-900)', margin: 0, lineHeight: 1.2 }}>
                {isEditing ? 'Edit Personal Details' : 'Personal Details'}
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                {isTeacher ? 'Faculty Profile' : isParent ? 'Parent Profile' : 'Student Profile'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  background: 'var(--brand-50)',
                  border: '1px solid #bfdbfe',
                  borderRadius: 'var(--radius-full)',
                  padding: '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: 'var(--brand-800)',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                <Edit3 size={14} />
                Edit
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                style={{
                  background: 'var(--surface-alt)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-full)',
                  padding: '6px 12px',
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            )}

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
        </div>

        {/* Success Toast */}
        {saveSuccess && (
          <div style={{
            background: '#ecfdf5',
            borderBottom: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '10px 16px',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={16} color="#10b981" />
            Personal details updated and saved successfully!
          </div>
        )}

        {/* Scrollable Body */}
        <div style={{ overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Summary Profile Header Card */}
          <div className="card" style={{
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            background: 'var(--surface)'
          }}>
            <img
              src={user?.avatar || DEFAULT_GREY_AVATAR}
              alt={formData.name}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '14px',
                objectFit: 'cover',
                border: '2px solid var(--border)'
              }}
            />
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--brand-900)', margin: 0 }}>
                {formData.name || 'User Profile'}
              </h4>
              <span style={{ fontSize: '12px', color: 'var(--accent-500)', fontWeight: 600, display: 'block', marginTop: '2px' }}>
                {isTeacher ? (formData.subject || 'Physics Faculty') : isParent ? `Parent of ${formData.linkedChildName}` : formData.course}
              </span>
              <span className="badge badge-success" style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={12} />
                {isTeacher ? 'Verified Teacher' : isParent ? 'Verified Parent' : 'Verified Student'}
              </span>
            </div>
          </div>

          {/* =========================================================================
              VIEW MODE: Read-Only List with Copy Shortcuts
             ========================================================================= */}
          {!isEditing ? (
            <>
              <div className="card" style={{ padding: '4px 16px', background: 'var(--surface)' }}>
                {displayList.map((item, index) => {
                  const Icon = item.icon;
                  const isCopied = copiedKey === item.key;

                  return (
                    <div
                      key={item.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        padding: '13px 0',
                        borderBottom: index < displayList.length - 1 ? '1px solid var(--border)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          background: item.iconBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: item.iconColor,
                          flexShrink: 0
                        }}>
                          <Icon size={18} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>
                            {item.label}
                          </span>
                          {item.isBadge ? (
                            <span style={{
                              display: 'inline-block',
                              marginTop: '2px',
                              padding: '2px 10px',
                              borderRadius: 'var(--radius-full)',
                              background: item.value ? '#fef2f2' : 'var(--surface-alt)',
                              color: item.value ? '#dc2626' : 'var(--text-muted)',
                              border: item.value ? '1px solid #fecaca' : '1px solid var(--border)',
                              fontSize: item.value ? '13px' : '12px',
                              fontWeight: item.value ? 800 : 500
                            }}>
                              {item.value || 'Not Specified'}
                            </span>
                          ) : (
                            <span style={{
                              fontSize: item.key === 'email' ? '12.5px' : '13.5px',
                              fontWeight: 700,
                              color: 'var(--text-primary)',
                              display: 'block',
                              marginTop: '1px',
                              overflowWrap: 'anywhere',
                              wordBreak: 'break-word',
                              lineHeight: 1.35
                            }}>
                              {item.value || '—'}
                            </span>
                          )}
                        </div>
                      </div>

                      {item.canCopy && item.value && (
                        <button
                          onClick={() => copyToClipboard(item.value, item.key)}
                          style={{
                            flexShrink: 0,
                            background: isCopied ? '#ecfdf5' : 'var(--surface-alt)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            padding: '6px 10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: isCopied ? '#059669' : 'var(--text-secondary)',
                            transition: 'all 0.15s ease'
                          }}
                          title="Copy"
                        >
                          {isCopied ? (
                            <>
                              <Check size={12} color="#059669" />
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
            </>
          ) : (
            /* =========================================================================
                EDIT MODE: Interactive inputs for allowed fields only
               ========================================================================= */
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--surface)' }}>
                <h5 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--brand-900)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                  Basic Information
                </h5>

                {/* Full Name */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border)' }}
                    placeholder="Enter full name"
                  />
                </div>

                {/* Email Id */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Email Id *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                    style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border)' }}
                    placeholder="Enter email address"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field"
                    style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border)' }}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>

                {/* Blood Group */}
                <MobileDropdown
                  label="Blood Group"
                  title="Select Blood Group"
                  options={BLOOD_GROUPS.map(bg => ({ value: bg, label: bg }))}
                  value={formData.bloodGroup || ''}
                  onChange={val => setFormData({ ...formData, bloodGroup: val })}
                  placeholder="Select Blood Group"
                />
              </div>

              {/* Role-Specific Fields */}
              <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--surface)' }}>
                <h5 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--brand-900)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                  {isTeacher ? 'Academic & Faculty Details' : isParent ? 'Child & Family Details' : 'Academic & Student Details'}
                </h5>

                {isTeacher ? (
                  <>
                    {/* Subject(s) - Locked */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                          Subject(s)
                        </label>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Lock size={10} /> Non-editable
                        </span>
                      </div>
                      <input
                        type="text"
                        disabled
                        value={formData.subject}
                        className="input-field"
                        style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border)', background: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' }}
                      />
                    </div>

                    {/* Employee ID - Locked */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                          Employee ID
                        </label>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Lock size={10} /> Non-editable
                        </span>
                      </div>
                      <input
                        type="text"
                        disabled
                        value={formData.employeeId}
                        className="input-field"
                        style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border)', background: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' }}
                      />
                    </div>
                  </>
                ) : isParent ? (
                  <>
                    {/* Linked Student Name - Locked */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                          Linked Student Name
                        </label>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Lock size={10} /> Non-editable
                        </span>
                      </div>
                      <input
                        type="text"
                        disabled
                        value={formData.linkedChildName}
                        className="input-field"
                        style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border)', background: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' }}
                      />
                    </div>

                    {/* Student's Class / Course */}
                    <div>
                      <MobileDropdown
                        label="Student's Class / Course"
                        title="Select Student's Enrolled Course"
                        value={formData.linkedChildClass || 'JEE'}
                        onChange={(val) => setFormData(prev => ({ ...prev, linkedChildClass: val }))}
                        options={COURSE_OPTIONS}
                        placeholder="Select Child Course"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Course / Stream Selection */}
                    <div>
                      <MobileDropdown
                        label="Course / Stream"
                        title="Select Enrolled Course"
                        value={formData.course || 'JEE'}
                        onChange={(val) => setFormData(prev => ({ ...prev, course: val }))}
                        options={COURSE_OPTIONS}
                        placeholder="Select Course"
                      />
                    </div>

                    {/* Roll Number - Locked */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                          Roll Number
                        </label>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Lock size={10} /> Non-editable
                        </span>
                      </div>
                      <input
                        type="text"
                        disabled
                        value={formData.rollNumber}
                        className="input-field"
                        style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border)', background: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' }}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    flex: 2,
                    padding: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Save size={16} />
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        {!isEditing && (
          <div style={{
            padding: '12px 20px',
            background: 'var(--surface)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: '10px'
          }}>
            <button
              onClick={() => setIsEditing(true)}
              className="btn-secondary"
              style={{ flex: 1, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Edit3 size={15} />
              Edit Details
            </button>
            <button
              onClick={handleClose}
              className="btn-primary"
              style={{ flex: 1, padding: '10px' }}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
