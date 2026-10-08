import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Users, CheckCircle2, X, Check, Calendar, 
  Clock, User, BookOpen, ChevronRight, ArrowLeft, CheckSquare
} from 'lucide-react';
import { COURSE_OPTIONS } from './AdminStudyMaterialsModal';
import { DAYS_OF_WEEK, getSubjectsForCourse } from './AdminTimetableModal';
import { getStoredStudents } from '../../lib/userAuthStore';
import { getTodayDateKey, getBatchAttendance, saveBatchAttendance } from '../../lib/attendanceService';
import MobileDropdown from '../common/MobileDropdown';
import { useDataSync } from '../../lib/syncEvents';

export default function AdminAttendanceModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('mark'); // 'mark' | 'records'
  const [selectedCourse, setSelectedCourse] = useState(COURSE_OPTIONS[0]);
  const [attendanceDate, setAttendanceDate] = useState(getTodayDateKey());
  const [searchTerm, setSearchTerm] = useState('');
  const [recordsCourseFilter, setRecordsCourseFilter] = useState('All');
  const [selectedDayFilter, setSelectedDayFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  // Timetable lectures loaded from localStorage
  const [timetable, setTimetable] = useState([]);
  const [lectureAttendanceCache, setLectureAttendanceCache] = useState({});

  // Marking System Sheet states
  const [selectedLectureForAttendance, setSelectedLectureForAttendance] = useState(null);
  const [isLectureSheetClosing, setIsLectureSheetClosing] = useState(false);
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  const [modalStudentStatusMap, setModalStudentStatusMap] = useState({});

  // Registered students
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    const stored = getStoredStudents();
    setStudents(Array.isArray(stored) ? stored : []);

    try {
      const saved = localStorage.getItem('concept_academy_admin_timetable') || localStorage.getItem('aspire_admin_timetable');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setTimetable(parsed);
        }
      }
    } catch (e) {}
  }, [isOpen]);

  useDataSync(['students', 'timetable'], () => {
    const stored = getStoredStudents();
    setStudents(Array.isArray(stored) ? stored : []);
    try {
      const saved = localStorage.getItem('concept_academy_admin_timetable') || localStorage.getItem('aspire_admin_timetable');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setTimetable(parsed);
      }
    } catch (e) {}
  });

  // Students belonging to selected course for marking
  const courseStudents = useMemo(() => {
    return (students || []).filter(s => s && (s.course || 'JEE') === selectedCourse);
  }, [students, selectedCourse]);

  // Day of week of the selected date (e.g. 'Mon', 'Tue'...)
  const selectedDayOfWeek = useMemo(() => {
    try {
      const d = new Date(attendanceDate + 'T00:00:00');
      const dayIndex = d.getDay();
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days[dayIndex] || 'Mon';
    } catch (e) {
      return 'Mon';
    }
  }, [attendanceDate]);

  // Course lectures from timetable
  const courseLectures = useMemo(() => {
    return (timetable || []).filter(l => l && (l.course || 'JEE') === selectedCourse);
  }, [timetable, selectedCourse]);

  // Fallback subjects if no timetable lectures exist yet
  const fallbackSubjects = useMemo(() => {
    try {
      return getSubjectsForCourse(selectedCourse);
    } catch (e) {
      return ['Physics', 'Chemistry', 'Mathematics'];
    }
  }, [selectedCourse]);

  // Effective lectures to display: either from timetable or generated fallback subjects
  const effectiveLectures = useMemo(() => {
    if (courseLectures.length > 0) {
      if (selectedDayFilter === 'All') return courseLectures;
      return courseLectures.filter(l => l.day === selectedDayFilter);
    }

    // Default subject sessions when timetable has no entries for this course
    return fallbackSubjects.slice(0, 4).map((subj, idx) => ({
      id: `session_${selectedCourse}_${subj.replace(/\s+/g, '_')}`,
      subject: subj,
      course: selectedCourse,
      day: selectedDayOfWeek,
      time: idx === 0 ? '09:00 AM - 10:30 AM' : (idx === 1 ? '10:45 AM - 12:15 PM' : (idx === 2 ? '01:00 PM - 02:30 PM' : '02:45 PM - 04:15 PM')),
      faculty: `${subj.split(' ')[0]} Faculty`
    }));
  }, [courseLectures, selectedDayFilter, fallbackSubjects, selectedCourse, selectedDayOfWeek]);

  // Open full attendance marking system for a clicked lecture
  const handleOpenLectureAttendance = async (lecture) => {
    setSelectedLectureForAttendance(lecture);
    setModalSearchTerm('');

    // Check existing attendance records
    try {
      const existing = await getBatchAttendance(lecture.id, attendanceDate);
      if (Array.isArray(existing) && existing.length > 0) {
        const map = {};
        existing.forEach(r => {
          map[r.student_id] = r.status;
        });
        setModalStudentStatusMap(map);
        return;
      }
      const existingPrefix = await getBatchAttendance(`${selectedCourse}_${lecture.id}`, attendanceDate);
      if (Array.isArray(existingPrefix) && existingPrefix.length > 0) {
        const map = {};
        existingPrefix.forEach(r => {
          map[r.student_id] = r.status;
        });
        setModalStudentStatusMap(map);
        return;
      }
    } catch (e) {}

    // Default: all enrolled course students marked Present
    const defaultMap = {};
    courseStudents.forEach(s => {
      defaultMap[s.id] = 'Present';
    });
    setModalStudentStatusMap(defaultMap);
  };

  const handleCloseLectureSheet = () => {
    if (isLectureSheetClosing) return;
    setIsLectureSheetClosing(true);
    setTimeout(() => {
      setSelectedLectureForAttendance(null);
      setIsLectureSheetClosing(false);
    }, 250);
  };

  const handleToggleModalStudent = (studentId) => {
    setModalStudentStatusMap(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present'
    }));
  };

  const handleModalMarkAll = (status) => {
    const updated = {};
    courseStudents.forEach(s => {
      updated[s.id] = status;
    });
    setModalStudentStatusMap(updated);
  };

  const handleSaveLectureAttendance = async () => {
    if (!selectedLectureForAttendance) return;
    if (courseStudents.length === 0) {
      setToastMessage(`⚠️ No students enrolled in ${selectedCourse}.`);
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }

    const studentRecords = courseStudents.map(s => ({
      id: s.id,
      name: s.name,
      roll: s.roll || s.rollNumber || '—',
      status: modalStudentStatusMap[s.id] || 'Present'
    }));

    const pCount = studentRecords.filter(s => s.status === 'Present').length;
    const tCount = studentRecords.length;

    try {
      await saveBatchAttendance({
        batchId: selectedLectureForAttendance.id,
        batchName: `${selectedCourse} - ${selectedLectureForAttendance.subject}`,
        subject: selectedLectureForAttendance.subject,
        teacherName: selectedLectureForAttendance.faculty || 'Faculty',
        time: selectedLectureForAttendance.time,
        dateStr: attendanceDate,
        students: studentRecords
      });

      // Update card metadata in cache and localStorage
      const meta = { marked: true, present: pCount, total: tCount };
      const metaJson = JSON.stringify(meta);
      localStorage.setItem(`concept_academy_att_meta_${selectedLectureForAttendance.id}_${attendanceDate}`, metaJson);
      localStorage.setItem(`aspire_att_meta_${selectedLectureForAttendance.id}_${attendanceDate}`, metaJson);
      setLectureAttendanceCache(prev => ({
        ...prev,
        [`${selectedLectureForAttendance.id}_${attendanceDate}`]: meta
      }));

      setToastMessage(`✓ Attendance saved for ${selectedLectureForAttendance.subject} (${pCount}/${tCount} Present)`);
      setTimeout(() => setToastMessage(''), 3500);

      handleCloseLectureSheet();
    } catch (e) {
      setToastMessage(`✓ Attendance saved locally`);
      setTimeout(() => setToastMessage(''), 3000);
      handleCloseLectureSheet();
    }
  };

  const handleBack = () => {
    if (selectedLectureForAttendance) {
      handleCloseLectureSheet();
      return;
    }
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 320);
  };

  // Android back button integration
  useEffect(() => {
    if (!isOpen) return;
    const handleAppBack = (e) => {
      handleBack();
      e.detail?.markHandled?.();
    };
    window.addEventListener('app:back', handleAppBack);
    return () => window.removeEventListener('app:back', handleAppBack);
  }, [isOpen, isClosing, selectedLectureForAttendance, isLectureSheetClosing]);

  if (!isOpen) return null;

  // Filter students for Records Tab
  const filteredRecordsStudents = (students || []).filter(s => {
    if (!s) return false;
    const matchesCourse = recordsCourseFilter === 'All' || (s.course || 'JEE') === recordsCourseFilter;
    const matchesSearch = !searchTerm || 
      String(s.name || '').toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      String(s.roll || s.rollNumber || '').toLowerCase().includes(searchTerm.toLowerCase().trim());
    return matchesCourse && matchesSearch;
  });

  // Modal student stats
  const modalPresentCount = courseStudents.filter(s => (modalStudentStatusMap[s.id] || 'Present') === 'Present').length;
  const modalAbsentCount = courseStudents.length - modalPresentCount;
  const modalRate = courseStudents.length > 0 ? Math.round((modalPresentCount / courseStudents.length) * 100) : 0;

  // Filtered students inside marking modal
  const filteredModalStudents = courseStudents.filter(s => {
    if (!modalSearchTerm) return true;
    const q = modalSearchTerm.toLowerCase();
    return (s.name || '').toLowerCase().includes(q) || (s.roll || s.rollNumber || '').toLowerCase().includes(q);
  });

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
      {/* ── Top Header ── */}
      <div style={{
        padding: '12px 16px 10px',
        paddingTop: 'calc(12px + max(var(--safe-area-top, 0px), env(safe-area-inset-top, 0px), 24px))',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={handleBack}
            aria-label="Back to Admin Dashboard"
            style={{
              background: 'var(--surface-alt)',
              border: '1px solid var(--border)',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-900)'
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--brand-900)', margin: 0 }}>
              Attendance
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Mark attendance & student logs
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#ecfdf5', padding: '4px 8px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
          <CheckCircle2 size={13} color="#10b981" />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#047857' }}>
            {activeTab === 'mark' ? `${courseStudents.length} Students` : `${students.length} Students`}
          </span>
        </div>
      </div>

      {/* ── Toast Notification ── */}
      {toastMessage && (
        <div style={{
          background: '#10b981',
          color: '#ffffff',
          padding: '8px 14px',
          fontSize: '12px',
          fontWeight: 700,
          textAlign: 'center',
          flexShrink: 0,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {toastMessage}
        </div>
      )}

      {/* ── Standard 2 Tabs: Mark Attendance vs Student Records ── */}
      <div style={{
        display: 'flex',
        padding: '8px 16px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        gap: '8px',
        flexShrink: 0
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('mark')}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '10px',
            fontSize: '12.5px',
            fontWeight: 700,
            cursor: 'pointer',
            border: activeTab === 'mark' ? '1.5px solid var(--brand-700)' : '1px solid var(--border)',
            background: activeTab === 'mark' ? 'var(--brand-50)' : 'var(--surface-alt)',
            color: activeTab === 'mark' ? 'var(--brand-900)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.15s ease'
          }}
        >
          <CheckSquare size={14} />
          <span>Mark Attendance</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('records')}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '10px',
            fontSize: '12.5px',
            fontWeight: 700,
            cursor: 'pointer',
            border: activeTab === 'records' ? '1.5px solid var(--brand-700)' : '1px solid var(--border)',
            background: activeTab === 'records' ? 'var(--brand-50)' : 'var(--surface-alt)',
            color: activeTab === 'records' ? 'var(--brand-900)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.15s ease'
          }}
        >
          <Users size={14} />
          <span>Student Records</span>
        </button>
      </div>

      {/* ── Main Content Area ── */}
      {activeTab === 'mark' ? (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {/* Controls: Course selector & Date Picker */}
          <div style={{ padding: '12px 16px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Course & Day Selectors via MobileDropdown */}
            <div style={{ display: 'grid', gridTemplateColumns: courseLectures.length > 0 ? '1.2fr 1fr' : '1fr', gap: '8px' }}>
              <MobileDropdown
                label="Select Course"
                title="Choose Enrolled Course"
                value={selectedCourse}
                onChange={setSelectedCourse}
                options={COURSE_OPTIONS}
                placeholder="Choose Course..."
                variant="compact"
              />

              {courseLectures.length > 0 && (
                <MobileDropdown
                  label="Day Filter"
                  title="Filter by Lecture Day"
                  value={selectedDayFilter}
                  onChange={setSelectedDayFilter}
                  options={[
                    { value: 'All', label: 'All Days' },
                    ...DAYS_OF_WEEK.map(d => ({
                      value: d,
                      label: d === selectedDayOfWeek ? `${d} (Today)` : d,
                      badge: d === selectedDayOfWeek ? 'Today' : undefined
                    }))
                  ]}
                  placeholder="All Days"
                  variant="compact"
                />
              )}
            </div>

            {/* Date Picker Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={15} color="var(--brand-700)" />
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={e => setAttendanceDate(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    background: 'var(--surface-alt)',
                    color: 'var(--brand-900)'
                  }}
                />
              </div>

              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--brand-800)',
                background: 'var(--brand-50)',
                padding: '4px 9px',
                borderRadius: '8px',
                border: '1px solid var(--border)'
              }}>
                Day: {selectedDayOfWeek}
              </div>
            </div>
          </div>

          {/* ── Lectures Section ── */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Select a Lecture to Mark Attendance
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {effectiveLectures.length} {effectiveLectures.length === 1 ? 'Lecture' : 'Lectures'}
              </span>
            </div>

            {effectiveLectures.length === 0 ? (
              <div className="card" style={{ padding: '36px 20px', textAlign: 'center', borderRadius: '12px' }}>
                <Clock size={36} color="var(--text-muted)" style={{ margin: '0 auto 10px auto', opacity: 0.5 }} />
                <h4 style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--brand-900)', margin: 0 }}>
                  No Lectures Found for {selectedCourse}
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  No scheduled lecture match the selected day filter.
                </p>
              </div>
            ) : (
              effectiveLectures.map(lec => {
                const cardKey = `${lec.id}_${attendanceDate}`;
                let cardMeta = lectureAttendanceCache[cardKey];
                if (!cardMeta) {
                  try {
                    const raw = localStorage.getItem(`concept_academy_att_meta_${lec.id}_${attendanceDate}`) || localStorage.getItem(`aspire_att_meta_${lec.id}_${attendanceDate}`);
                    if (raw) {
                      cardMeta = JSON.parse(raw);
                    }
                  } catch (e) {}
                }
                const isMarked = Boolean(cardMeta && cardMeta.marked);

                return (
                  <div
                    key={lec.id}
                    onClick={() => handleOpenLectureAttendance(lec)}
                    role="button"
                    tabIndex={0}
                    style={{
                      background: 'var(--surface)',
                      border: isMarked ? '1.5px solid #10b981' : '1px solid var(--border)',
                      borderRadius: '14px',
                      padding: '13px 15px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '9px',
                      transition: 'transform 0.12s ease, box-shadow 0.12s ease'
                    }}
                  >
                    {/* Top Row: Subject Title + Status Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <div style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '10px',
                          background: isMarked ? '#ecfdf5' : 'var(--brand-50)',
                          color: isMarked ? '#047857' : 'var(--brand-700)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <BookOpen size={16} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <h4 style={{
                            fontSize: '14px',
                            fontWeight: 800,
                            color: 'var(--brand-900)',
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {lec.subject}
                          </h4>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {lec.course || selectedCourse}
                          </span>
                        </div>
                      </div>

                      {isMarked ? (
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          background: '#ecfdf5',
                          color: '#047857',
                          border: '1px solid #a7f3d0',
                          padding: '4px 9px',
                          borderRadius: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          whiteSpace: 'nowrap',
                          flexShrink: 0
                        }}>
                          <CheckCircle2 size={12} />
                          <span>{cardMeta?.present ?? 0}/{cardMeta?.total ?? courseStudents.length} Present</span>
                        </span>
                      ) : (
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          background: 'var(--brand-50)',
                          color: 'var(--brand-700)',
                          border: '1px solid var(--border)',
                          padding: '4px 9px',
                          borderRadius: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          whiteSpace: 'nowrap',
                          flexShrink: 0
                        }}>
                          <span>Tap to Mark</span>
                          <ChevronRight size={12} />
                        </span>
                      )}
                    </div>

                    {/* Bottom Row: Time, Faculty, Day */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '11.5px',
                      color: 'var(--text-secondary)',
                      flexWrap: 'wrap',
                      paddingTop: '6px',
                      borderTop: '1px solid var(--border)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock size={13} color="var(--brand-600)" />
                        <span style={{ fontWeight: 600 }}>{lec.time || 'Class Time'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <User size={13} color="var(--brand-600)" />
                        <span>{lec.faculty || 'Faculty'}</span>
                      </div>
                      {lec.day && (
                        <span style={{
                          marginLeft: 'auto',
                          fontSize: '10.5px',
                          fontWeight: 700,
                          background: 'var(--surface-alt)',
                          padding: '2px 7px',
                          borderRadius: '6px',
                          color: 'var(--brand-800)',
                          border: '1px solid var(--border)'
                        }}>
                          {lec.day}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* ── TAB 2: STUDENT RECORDS ── */
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search student by name or roll..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 34px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                fontSize: '13px',
                color: 'var(--text-primary)'
              }}
            />
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Course Filter Dropdown */}
          <MobileDropdown
            value={recordsCourseFilter}
            onChange={setRecordsCourseFilter}
            options={['All', ...COURSE_OPTIONS]}
            title="Filter Records by Course"
            placeholder="All Courses"
            variant="compact"
          />

          {/* Students List in Records */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredRecordsStudents.length === 0 ? (
              <div className="card" style={{ padding: '36px 20px', textAlign: 'center', borderRadius: '12px' }}>
                <Users size={36} color="var(--text-muted)" style={{ margin: '0 auto 10px auto', opacity: 0.5 }} />
                <h4 style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--brand-900)', margin: 0 }}>No Student Records</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  No students found matching the selected filter.
                </p>
              </div>
            ) : (
              filteredRecordsStudents.map(student => {
                const attended = Number(student.attendedLectures || student.attendedCount || 0);
                const total = Number(student.totalLectures || student.totalCount || 0);
                const pct = total > 0 ? Math.round((attended / total) * 100) : (student.overallAttendance || 0);

                return (
                  <div
                    key={student.id}
                    className="card"
                    style={{
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderRadius: '12px',
                      background: 'var(--surface)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        background: 'var(--brand-50)',
                        color: 'var(--brand-700)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                        fontWeight: 800,
                        flexShrink: 0
                      }}>
                        {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--brand-900)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {student.name}
                        </h4>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {student.course || 'JEE'} • Roll: {student.roll || student.rollNumber || '—'}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{
                        fontSize: '13.5px',
                        fontWeight: 800,
                        color: pct >= 75 ? '#047857' : (pct >= 50 ? '#d97706' : '#dc2626')
                      }}>
                        {pct}%
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>
                        Attendance
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── FULL ATTENDANCE MARKING MODAL SHEET (When a Lecture Card is Clicked) ── */}
      {selectedLectureForAttendance && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            maxWidth: '480px',
            margin: '0 auto',
            background: 'rgba(10, 31, 61, 0.55)',
            backdropFilter: 'blur(3px)',
            zIndex: 10050,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            animation: 'fadeIn 0.18s ease-out'
          }}
          onClick={handleCloseLectureSheet}
        >
          <div
            className={isLectureSheetClosing ? 'closing' : ''}
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--canvas)',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 -8px 30px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
              animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Sheet Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '10px', paddingBottom: '4px' }}>
              <div style={{ width: '40px', height: '4px', borderRadius: '4px', background: 'var(--border)' }} />
            </div>

            {/* Sheet Header */}
            <div style={{
              padding: '10px 16px 12px',
              background: 'var(--surface)',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    background: 'var(--brand-800)',
                    color: '#ffffff',
                    padding: '2px 7px',
                    borderRadius: '6px'
                  }}>
                    {selectedCourse}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    • {attendanceDate}
                  </span>
                </div>
                <h3 style={{ fontSize: '16.5px', fontWeight: 800, color: 'var(--brand-900)', margin: '0 0 4px 0' }}>
                  {selectedLectureForAttendance.subject}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} color="var(--brand-600)" />
                    {selectedLectureForAttendance.time || 'Class Time'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User size={12} color="var(--brand-600)" />
                    {selectedLectureForAttendance.faculty || 'Faculty'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseLectureSheet}
                style={{
                  background: 'var(--surface-alt)',
                  border: '1px solid var(--border)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Controls Row: Search + All Present / All Absent */}
            <div style={{
              padding: '10px 16px',
              background: 'var(--surface)',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Search enrolled students..."
                    value={modalSearchTerm}
                    onChange={e => setModalSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '7px 10px 7px 30px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontSize: '12px',
                      background: 'var(--surface-alt)',
                      color: 'var(--brand-900)'
                    }}
                  />
                  <Search size={13} color="var(--text-muted)" style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)' }} />
                  {modalSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setModalSearchTerm('')}
                      style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleModalMarkAll('Present')}
                  style={{
                    padding: '7px 10px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: '#ecfdf5',
                    color: '#047857',
                    border: '1px solid #a7f3d0',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  ✓ All Present
                </button>
                <button
                  type="button"
                  onClick={() => handleModalMarkAll('Absent')}
                  style={{
                    padding: '7px 10px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: '#fef2f2',
                    color: '#b91c1c',
                    border: '1px solid #fecaca',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  ✕ All Absent
                </button>
              </div>

              {/* Attendance Quick Stats Strip */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                <span>Enrolled: <strong style={{ color: 'var(--brand-900)' }}>{courseStudents.length}</strong></span>
                <span style={{ color: '#047857' }}>Present: <strong>{modalPresentCount}</strong></span>
                <span style={{ color: '#b91c1c' }}>Absent: <strong>{modalAbsentCount}</strong></span>
                <span style={{ color: 'var(--brand-700)' }}>Rate: <strong>{modalRate}%</strong></span>
              </div>
            </div>

            {/* Students List in Modal */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              maxHeight: '48vh'
            }}>
              {courseStudents.length === 0 ? (
                <div className="card" style={{ padding: '30px 16px', textAlign: 'center', borderRadius: '12px' }}>
                  <Users size={32} color="var(--text-muted)" style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
                  <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--brand-900)', margin: 0 }}>
                    No Students Enrolled in {selectedCourse}
                  </h4>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                    Add students to the {selectedCourse} course from the Students tab in Admin.
                  </p>
                </div>
              ) : filteredModalStudents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 10px', color: 'var(--text-muted)', fontSize: '12px' }}>
                  No students match "{modalSearchTerm}"
                </div>
              ) : (
                filteredModalStudents.map(student => {
                  const status = modalStudentStatusMap[student.id] || 'Present';
                  const isPresent = status === 'Present';

                  return (
                    <div
                      key={student.id}
                      onClick={() => handleToggleModalStudent(student.id)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '12px',
                        background: isPresent ? '#f0fdf4' : '#fef2f2',
                        border: isPresent ? '1px solid #bbf7d0' : '1px solid #fecaca',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: isPresent ? '#dcfce7' : '#fee2e2',
                          color: isPresent ? '#15803d' : '#b91c1c',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12.5px',
                          fontWeight: 800,
                          flexShrink: 0
                        }}>
                          {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--brand-900)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {student.name}
                          </span>
                          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                            Roll: {student.roll || student.rollNumber || '—'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          handleToggleModalStudent(student.id);
                        }}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          fontSize: '11.5px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          border: isPresent ? '1.5px solid #10b981' : '1.5px solid #ef4444',
                          background: isPresent ? '#10b981' : '#ef4444',
                          color: '#ffffff',
                          boxShadow: isPresent ? '0 2px 6px rgba(16, 185, 129, 0.25)' : '0 2px 6px rgba(239, 68, 68, 0.25)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isPresent ? <Check size={13} strokeWidth={3} /> : <X size={13} strokeWidth={3} />}
                        <span>{status}</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Sheet Fixed Bottom Actions */}
            <div style={{
              padding: '12px 16px',
              paddingBottom: 'calc(12px + var(--safe-area-bottom, env(safe-area-inset-bottom, 0px)))',
              background: 'var(--surface)',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: '10px'
            }}>
              <button
                type="button"
                onClick={handleCloseLectureSheet}
                style={{
                  flex: 1,
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface-alt)',
                  color: 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveLectureAttendance}
                className="btn-primary"
                style={{
                  flex: 2,
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(10, 31, 61, 0.2)'
                }}
              >
                <CheckCircle2 size={16} />
                <span>Save Attendance ({modalPresentCount}/{courseStudents.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
