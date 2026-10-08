import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, Clock, 
  User, Trash2, X, Check,
  ArrowLeft, Calendar, SkipForward
} from 'lucide-react';
import { COURSE_OPTIONS, SUBJECT_OPTIONS } from './AdminStudyMaterialsModal';
import { getStoredTeachers } from '../../lib/userAuthStore';
import MobileDropdown from '../common/MobileDropdown';
import { broadcastDataChange } from '../../lib/syncEvents';

export const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function getFacultyOptions() {
  try {
    const stored = getStoredTeachers();
    if (Array.isArray(stored) && stored.length > 0) {
      return stored.filter(Boolean).map(t => `${t?.name || 'Faculty'}${t?.subject ? ` (${t.subject})` : ''}`);
    }
  } catch (e) {}
  return [
    'Physics Faculty',
    'Chemistry Faculty',
    'Mathematics Faculty',
    'Biology Faculty',
    'English Faculty',
    'Science Faculty'
  ];
}

export const FACULTY_OPTIONS = [
  'Physics Faculty',
  'Chemistry Faculty',
  'Mathematics Faculty',
  'Biology Faculty',
  'English Faculty',
  'Science Faculty'
];

const HOURS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

const DEFAULT_SLOTS = [
  { fromHour: '09', fromMinute: '00', fromPeriod: 'AM', tillHour: '10', tillMinute: '30', tillPeriod: 'AM' },
  { fromHour: '10', fromMinute: '45', fromPeriod: 'AM', tillHour: '12', tillMinute: '15', tillPeriod: 'PM' },
  { fromHour: '01', fromMinute: '00', fromPeriod: 'PM', tillHour: '02', tillMinute: '30', tillPeriod: 'PM' },
  { fromHour: '02', fromMinute: '45', fromPeriod: 'PM', tillHour: '04', tillMinute: '15', tillPeriod: 'PM' },
  { fromHour: '04', fromMinute: '30', fromPeriod: 'PM', tillHour: '06', tillMinute: '00', tillPeriod: 'PM' },
  { fromHour: '06', fromMinute: '15', fromPeriod: 'PM', tillHour: '07', tillMinute: '45', tillPeriod: 'PM' },
  { fromHour: '07', fromMinute: '00', fromPeriod: 'AM', tillHour: '08', tillMinute: '30', tillPeriod: 'AM' },
  { fromHour: '12', fromMinute: '30', fromPeriod: 'PM', tillHour: '01', tillMinute: '30', tillPeriod: 'PM' },
  { fromHour: '08', fromMinute: '00', fromPeriod: 'PM', tillHour: '09', tillMinute: '30', tillPeriod: 'PM' },
  { fromHour: '09', fromMinute: '30', fromPeriod: 'PM', tillHour: '10', tillMinute: '30', tillPeriod: 'PM' }
];

export function getSubjectsForCourse(course) {
  if (!course) return SUBJECT_OPTIONS;
  if (course.includes('JEE')) {
    const primary = ['Physics (JEE)', 'Chemistry (JEE)', 'Maths (JEE)'];
    return [...primary, ...SUBJECT_OPTIONS.filter(s => !primary.includes(s))];
  }
  if (course.includes('NEET')) {
    const primary = ['Physics (NEET)', 'Chemistry (NEET)', 'Biology (NEET)'];
    return [...primary, ...SUBJECT_OPTIONS.filter(s => !primary.includes(s))];
  }
  if (course.includes('10th')) {
    const primary = ['Science (10th)', 'Maths (10th)', 'English (10th)', 'Hindi (10th)', 'Marathi (10th)', 'History (10th)', 'Geography (10th)'];
    return [...primary, ...SUBJECT_OPTIONS.filter(s => !primary.includes(s))];
  }
  if (course.includes('9th')) {
    const primary = ['Science (9th)', 'Maths (9th)', 'English (9th)', 'Hindi (9th)', 'Marathi (9th)', 'History (9th)', 'Geography (9th)'];
    return [...primary, ...SUBJECT_OPTIONS.filter(s => !primary.includes(s))];
  }
  if (course.includes('11th')) {
    const primary = ['Physics (JEE)', 'Chemistry (JEE)', 'Maths (JEE)', 'Biology (NEET)', 'English (11th)'];
    return [...primary, ...SUBJECT_OPTIONS.filter(s => !primary.includes(s))];
  }
  if (course.includes('12th')) {
    const primary = ['Physics (JEE)', 'Chemistry (JEE)', 'Maths (JEE)', 'Biology (NEET)', 'English (12th)'];
    return [...primary, ...SUBJECT_OPTIONS.filter(s => !primary.includes(s))];
  }
  return SUBJECT_OPTIONS;
}

function createLectureSlot(course, slotIndex = 0) {
  const subjects = getSubjectsForCourse(course) || SUBJECT_OPTIONS;
  const facultyOptions = getFacultyOptions();
  const subject = subjects[slotIndex % subjects.length] || SUBJECT_OPTIONS[0] || 'Physics';
  const faculty = facultyOptions[slotIndex % facultyOptions.length] || 'Faculty';
  const slotTime = DEFAULT_SLOTS[slotIndex % DEFAULT_SLOTS.length] || DEFAULT_SLOTS[0];
  return {
    subject,
    faculty,
    fromHour: slotTime.fromHour || '09',
    fromMinute: slotTime.fromMinute || '00',
    fromPeriod: slotTime.fromPeriod || 'AM',
    tillHour: slotTime.tillHour || '10',
    tillMinute: slotTime.tillMinute || '30',
    tillPeriod: slotTime.tillPeriod || 'AM'
  };
}

function createInitialWeekData(course) {
  const data = {};
  DAYS_OF_WEEK.forEach(day => {
    data[day] = {
      lectureCount: 2,
      isSaved: false,
      isSkipped: false,
      lectures: [
        createLectureSlot(course, 0),
        createLectureSlot(course, 1)
      ]
    };
  });
  return data;
}

const INITIAL_TIMETABLE = [];

export default function AdminTimetableModal({ isOpen, onClose }) {
  // Load from localStorage or empty
  const [timetable, setTimetable] = useState(() => {
    try {
      const saved = localStorage.getItem('concept_academy_admin_timetable') || localStorage.getItem('aspire_admin_timetable');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map(lec => ({
            ...lec,
            subject: lec.subject || 'Subject',
            course: lec.course || 'General',
            day: lec.day || 'Mon',
            time: lec.time || '10:00 AM - 11:30 AM',
            faculty: lec.faculty || 'Faculty'
          }));
        }
      }
    } catch (e) {}
    return INITIAL_TIMETABLE;
  });

  const [selectedCourse, setSelectedCourse] = useState('All');
  const [selectedDay, setSelectedDay] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // Weekly Planner Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAddCourse, setSelectedAddCourse] = useState(COURSE_OPTIONS[0]);
  const [activeAddDay, setActiveAddDay] = useState('Mon');
  const [weekData, setWeekData] = useState(() => createInitialWeekData(COURSE_OPTIONS[0]));
  const addModalBodyRef = useRef(null);

  // Animation states for smooth reverse exit
  const [isClosing, setIsClosing] = useState(false);
  const [isAddClosing, setIsAddClosing] = useState(false);

  // Save to localStorage whenever timetable updates
  useEffect(() => {
    try {
      const json = JSON.stringify(timetable);
      localStorage.setItem('concept_academy_admin_timetable', json);
      localStorage.setItem('aspire_admin_timetable', json);
      broadcastDataChange('timetable', { timetable });
    } catch (e) {}
  }, [timetable]);

  const handleBack = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 320);
  };

  const handleOpenAddModal = () => {
    const courseToUse = selectedCourse !== 'All' ? selectedCourse : COURSE_OPTIONS[0];
    setSelectedAddCourse(courseToUse);
    setActiveAddDay('Mon');
    setWeekData(createInitialWeekData(courseToUse));
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    if (isAddClosing) return;
    setIsAddClosing(true);
    setTimeout(() => {
      setIsAddClosing(false);
      setShowAddModal(false);
    }, 320);
  };

  // Android back button integration
  useEffect(() => {
    if (!isOpen) return;
    const handleAppBack = (e) => {
      if (showAddModal) {
        handleCloseAddModal();
        e.detail?.markHandled?.();
      } else {
        handleBack();
        e.detail?.markHandled?.();
      }
    };
    window.addEventListener('app:back', handleAppBack);
    return () => window.removeEventListener('app:back', handleAppBack);
  }, [isOpen, showAddModal, isClosing, isAddClosing]);

  if (!isOpen) return null;

  // Handlers for weekly planner
  const handleCourseChange = (newCourse) => {
    setSelectedAddCourse(newCourse);
    setWeekData(prev => {
      const updated = { ...prev };
      DAYS_OF_WEEK.forEach(day => {
        const count = updated[day]?.lectureCount || 2;
        const newLecs = [];
        for (let i = 0; i < count; i++) {
          newLecs.push(createLectureSlot(newCourse, i));
        }
        updated[day] = {
          ...updated[day],
          lectures: newLecs
        };
      });
      return updated;
    });
  };

  const handleLectureCountChange = (newCount) => {
    setWeekData(prev => {
      const currentDayData = prev[activeAddDay] || { lectureCount: 2, lectures: [] };
      const currentLectures = currentDayData.lectures || [];
      let updatedLectures = [...currentLectures];

      if (newCount > currentLectures.length) {
        for (let i = currentLectures.length; i < newCount; i++) {
          updatedLectures.push(createLectureSlot(selectedAddCourse, i));
        }
      } else {
        updatedLectures = updatedLectures.slice(0, newCount);
      }

      return {
        ...prev,
        [activeAddDay]: {
          ...currentDayData,
          lectureCount: newCount,
          lectures: updatedLectures
        }
      };
    });
  };

  const handleLectureFieldChange = (index, field, value) => {
    setWeekData(prev => {
      const currentDay = activeAddDay || 'Mon';
      const dayData = (prev && prev[currentDay]) ? { ...prev[currentDay] } : { lectureCount: 2, lectures: [] };
      const currentLecs = Array.isArray(dayData.lectures) ? [...dayData.lectures] : [];
      
      while (currentLecs.length <= index) {
        currentLecs.push(createLectureSlot(selectedAddCourse, currentLecs.length));
      }
      
      currentLecs[index] = {
        ...(currentLecs[index] || createLectureSlot(selectedAddCourse, index)),
        [field]: value
      };

      return {
        ...prev,
        [currentDay]: {
          ...dayData,
          lectures: currentLecs
        }
      };
    });
  };

  const handleTimeSlotChange = (index, slotStr) => {
    try {
      const [fromPart, tillPart] = slotStr.split(' - ');
      const [fromTime, fromPeriod] = fromPart.trim().split(' ');
      const [fromHour, fromMinute] = fromTime.split(':');
      const [tillTime, tillPeriod] = tillPart.trim().split(' ');
      const [tillHour, tillMinute] = tillTime.split(':');

      setWeekData(prev => {
        const currentDay = activeAddDay || 'Mon';
        const dayData = (prev && prev[currentDay]) ? { ...prev[currentDay] } : { lectureCount: 2, lectures: [] };
        const currentLecs = Array.isArray(dayData.lectures) ? [...dayData.lectures] : [];
        
        while (currentLecs.length <= index) {
          currentLecs.push(createLectureSlot(selectedAddCourse, currentLecs.length));
        }
        
        currentLecs[index] = {
          ...(currentLecs[index] || createLectureSlot(selectedAddCourse, index)),
          fromHour,
          fromMinute,
          fromPeriod,
          tillHour,
          tillMinute,
          tillPeriod
        };

        return {
          ...prev,
          [currentDay]: {
            ...dayData,
            lectures: currentLecs
          }
        };
      });
    } catch (err) {
      console.warn('Error parsing time slot:', err);
    }
  };

  const commitWeeklyTimetable = (completedWeekData) => {
    const newLecsToAdd = [];
    const configuredDays = [];

    DAYS_OF_WEEK.forEach(day => {
      const dayInfo = completedWeekData[day];
      if (dayInfo && dayInfo.isSaved && !dayInfo.isSkipped && dayInfo.lectures?.length > 0) {
        configuredDays.push(day);
        dayInfo.lectures.forEach((lec, idx) => {
          const formattedTime = `${lec.fromHour}:${lec.fromMinute} ${lec.fromPeriod} - ${lec.tillHour}:${lec.tillMinute} ${lec.tillPeriod}`;
          newLecsToAdd.push({
            id: `lec-${Date.now()}-${day}-${idx}`,
            course: selectedAddCourse,
            subject: lec.subject,
            day: day,
            time: formattedTime,
            faculty: lec.faculty,
            status: 'Upcoming'
          });
        });
      }
    });

    if (newLecsToAdd.length > 0) {
      setTimetable(prev => {
        const remaining = prev.filter(
          item => !(item.course === selectedAddCourse && configuredDays.includes(item.day))
        );
        return [...newLecsToAdd, ...remaining];
      });

      setSelectedCourse(selectedAddCourse);
      setSelectedDay('All');
      setToastMessage(`✓ Weekly timetable for ${selectedAddCourse} saved successfully! (${newLecsToAdd.length} lectures scheduled)`);
    } else {
      setToastMessage(`ℹ Weekly timetable setup finished for ${selectedAddCourse}`);
    }

    setTimeout(() => setToastMessage(''), 3500);
    handleCloseAddModal();
  };

  const handleSaveDay = () => {
    const updatedWeekData = {
      ...weekData,
      [activeAddDay]: {
        ...weekData[activeAddDay],
        isSaved: true,
        isSkipped: false
      }
    };
    setWeekData(updatedWeekData);

    if (activeAddDay === 'Sun') {
      commitWeeklyTimetable(updatedWeekData);
    } else {
      const currentIndex = DAYS_OF_WEEK.indexOf(activeAddDay);
      const nextDay = DAYS_OF_WEEK[currentIndex + 1];
      setActiveAddDay(nextDay);
      if (addModalBodyRef.current) {
        addModalBodyRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleSkipDay = () => {
    const updatedWeekData = {
      ...weekData,
      [activeAddDay]: {
        ...weekData[activeAddDay],
        isSaved: false,
        isSkipped: true
      }
    };
    setWeekData(updatedWeekData);

    if (activeAddDay === 'Sun') {
      commitWeeklyTimetable(updatedWeekData);
    } else {
      const currentIndex = DAYS_OF_WEEK.indexOf(activeAddDay);
      const nextDay = DAYS_OF_WEEK[currentIndex + 1];
      setActiveAddDay(nextDay);
      if (addModalBodyRef.current) {
        addModalBodyRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleDeleteLecture = (id, subject, day) => {
    setDeletingId(id);
    setTimeout(() => {
      setTimetable(prev => prev.filter(l => l.id !== id));
      setDeletingId(null);
      setToastMessage(`✓ Removed ${subject} (${day}) from Timetable`);
      setTimeout(() => setToastMessage(''), 3000);
    }, 250);
  };

  // Filter lectures
  const filteredLectures = (timetable || []).filter(l => {
    if (!l) return false;
    const matchesCourse = selectedCourse === 'All' || l.course === selectedCourse;
    const matchesDay = selectedDay === 'All' || l.day === selectedDay;
    const matchesSearch = !searchTerm || 
      (l.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.course || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.faculty || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCourse && matchesDay && matchesSearch;
  });

  // Ongoing classes to show on front
  const ongoingLectures = (timetable || []).filter(l => l && l.status === 'Ongoing');

  const availableSubjectsForAdd = getSubjectsForCourse(selectedAddCourse);
  const facultyOptionsList = getFacultyOptions();
  const currentDayState = weekData[activeAddDay] || { lectureCount: 2, lectures: [] };
  const currentLectures = currentDayState.lectures || [];

  return (
    <div className={`fullscreen-page-modal ${isClosing ? 'closing' : ''}`}>
      {/* Top Header */}
      <div style={{
        padding: '16px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
          <button
            type="button"
            onClick={handleBack}
            aria-label="Back to Admin Dashboard"
            style={{
              background: 'var(--surface-alt)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-900)',
              flexShrink: 0
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--brand-900)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Timetable
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Class schedules &amp; weekly lectures
            </span>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          background: '#10b981',
          color: '#ffffff',
          padding: '10px 16px',
          fontSize: '12px',
          fontWeight: 700,
          textAlign: 'center',
          animation: 'fadeIn 0.2s ease-out',
          flexShrink: 0
        }}>
          {toastMessage}
        </div>
      )}

      {/* Sticky Filters & Search Header */}
      <div style={{
        padding: '12px 16px',
        background: 'var(--canvas)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        flexShrink: 0
      }}>
        {/* Search Any Batch Anytime */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search any batch (e.g. JEE 12-A, NEET), subject, faculty..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              fontSize: '13px'
            }}
          />
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Class / Course & Day Selectors via MobileDropdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <MobileDropdown
            label="Class / Course"
            title="Filter by Course"
            value={selectedCourse}
            onChange={setSelectedCourse}
            options={['All', ...COURSE_OPTIONS]}
            placeholder="All Courses"
            variant="compact"
          />

          <MobileDropdown
            label="Day of Week"
            title="Filter by Day"
            value={selectedDay}
            onChange={setSelectedDay}
            options={['All', ...DAYS_OF_WEEK]}
            placeholder="All Days"
            variant="compact"
          />
        </div>
      </div>

      {/* Lectures List Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        paddingBottom: '90px'
      }}>
        {/* ── ON FRONT: ONGOING CLASSES HERO SECTION ── */}
        {ongoingLectures.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(249, 115, 22, 0.05) 100%)',
            border: '1.5px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '16px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            boxShadow: '0 2px 10px rgba(239, 68, 68, 0.06)',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  display: 'inline-block',
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  background: '#ef4444',
                  boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.25)'
                }} />
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#b91c1c', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Ongoing Classes (Live Now)
                </h4>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#ef4444', background: '#fee2e2', padding: '2px 8px', borderRadius: '999px' }}>
                {ongoingLectures.length} Ongoing
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {ongoingLectures.map(lec => (
                <div
                  key={lec.id}
                    style={{
                      background: 'var(--surface)',
                      borderRadius: '12px',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, background: '#fee2e2', color: '#b91c1c' }}>
                          {lec.course}
                        </span>
                        <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: '#f1f5f9', color: '#475569' }}>
                          {lec.day}
                        </span>
                      </div>
                      <span className="badge badge-success" style={{ fontSize: '10px' }}>
                        • Live Now
                      </span>
                    </div>

                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--brand-900)', margin: 0 }}>
                        {lec.subject}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        <Clock size={13} color="var(--accent-500)" />
                        <span style={{ fontWeight: 700 }}>{lec.time}</span>
                        <span>•</span>
                        <span>{lec.faculty}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border)', marginTop: '2px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
                        Faculty: {lec.faculty}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669' }}>
                        In Progress
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ── SCHEDULED TIMETABLE LECTURES ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px', flexShrink: 0 }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
            Showing {filteredLectures.length} scheduled lectures
          </span>
          {(selectedCourse !== 'All' || selectedDay !== 'All' || searchTerm) && (
            <button
              onClick={() => { setSelectedCourse('All'); setSelectedDay('All'); setSearchTerm(''); }}
              style={{ fontSize: '11px', color: '#0ea5e9', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Reset Filters
            </button>
          )}
        </div>

        {filteredLectures.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: 'var(--surface)',
            borderRadius: '16px',
            border: '1px dashed var(--border)'
          }}>
            <Calendar size={36} color="var(--text-muted)" style={{ margin: '0 auto 10px auto' }} />
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--brand-900)' }}>No Lectures Found</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              No lectures match the selected filters. Tap "+ Add Timetable" to schedule a week.
            </p>
          </div>
        ) : (
          filteredLectures.map(lec => (
            <div
              key={lec.id}
                className="card"
                style={{
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  opacity: deletingId === lec.id ? 0.3 : 1,
                  transform: deletingId === lec.id ? 'scale(0.97)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                  minHeight: 'fit-content',
                  boxSizing: 'border-box'
                }}
              >
                {/* Header row: Course badge, Status & Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 800,
                      background: '#e0f2fe',
                      color: '#0369a1'
                    }}>
                      {lec.course}
                    </span>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: '#f1f5f9',
                      color: '#475569'
                    }}>
                      {lec.day}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {lec.status === 'Ongoing' ? (
                      <span className="badge badge-success" style={{ fontSize: '10px' }}>• Ongoing</span>
                    ) : (
                      <span className="badge badge-info" style={{ fontSize: '10px' }}>Upcoming</span>
                    )}

                    {/* Delete Action Button */}
                    <button
                      type="button"
                      title="Delete lecture from timetable"
                      onClick={() => {
                        if (window.confirm(`Delete ${lec.subject} on ${lec.day} (${lec.time})?`)) {
                          handleDeleteLecture(lec.id, lec.subject, lec.day);
                        }
                      }}
                      style={{
                        background: '#fef2f2',
                        border: '1px solid #fee2e2',
                        color: '#ef4444',
                        borderRadius: '8px',
                        padding: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Subject Title */}
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--brand-900)', margin: 0 }}>
                    {lec.subject}
                  </h4>
                </div>

                {/* Details: Time & Faculty */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  paddingTop: '8px',
                  borderTop: '1px solid var(--border)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <Clock size={13} color="var(--accent-500)" />
                    <span style={{ fontWeight: 700, color: 'var(--brand-900)' }}>{lec.time}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <User size={13} color="#8b5cf6" />
                    <span>Faculty: <strong style={{ color: 'var(--brand-900)' }}>{lec.faculty}</strong></span>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>

      {/* ── MODAL SHEET 2: ADD WEEKLY TIMETABLE MODAL SHEET ── */}
      {showAddModal && (
        <div
          className={`modal-backdrop-05s ${isAddClosing ? 'closing' : ''}`}
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseAddModal(); }}
        >
          <div
            className={`modal-sheet-05s ${isAddClosing ? 'closing' : ''}`}
            style={{
              padding: '20px',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div className="sheet-drag-handle" />

            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexShrink: 0 }}>
              <div>
                <h4 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--brand-900)', margin: 0 }}>
                  Add Weekly Timetable
                </h4>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Schedule lectures day-by-day from Monday to Sunday
                </span>
              </div>
              <button
                type="button"
                onClick={handleCloseAddModal}
                style={{
                  background: 'var(--surface-alt)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div
              ref={addModalBodyRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                paddingRight: '2px'
              }}
            >
              {/* 1. Course Selection Dropdown */}
              <MobileDropdown
                label="Target Course / Class *"
                title="Select Target Course"
                options={COURSE_OPTIONS.map(c => ({ value: c, label: c }))}
                value={selectedAddCourse}
                onChange={val => handleCourseChange(val)}
                placeholder="Select Course"
              />

              {/* 2. Days of Week in a Row (Mon, Tue, ... Sun) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Day of the Week
                  </label>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#0284c7' }}>
                    {activeAddDay === 'Sun' ? 'Final Day (Sunday)' : `Day ${DAYS_OF_WEEK.indexOf(activeAddDay) + 1} of 7`}
                  </span>
                </div>

                <div
                  className="no-scrollbar"
                  style={{
                    display: 'flex',
                    gap: '6px',
                    overflowX: 'auto',
                    paddingBottom: '4px',
                    paddingRight: '12px',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                  }}
                >
                  {DAYS_OF_WEEK.map(day => {
                    const isActive = activeAddDay === day;
                    const dayState = weekData[day];
                    const isSaved = dayState?.isSaved;
                    const isSkipped = dayState?.isSkipped;

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setActiveAddDay(day)}
                        style={{
                          flex: '1 0 46px',
                          flexShrink: 0,
                          padding: '8px 4px',
                          borderRadius: '10px',
                          border: isActive ? '2px solid #0ea5e9' : '1px solid var(--border)',
                          background: isActive
                            ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                            : isSaved
                            ? '#ecfdf5'
                            : isSkipped
                            ? 'var(--surface-alt)'
                            : 'var(--surface)',
                          color: isActive
                            ? '#ffffff'
                            : isSaved
                            ? '#059669'
                            : isSkipped
                            ? 'var(--text-muted)'
                            : 'var(--text-primary)',
                          fontWeight: isActive ? 800 : 700,
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '2px',
                          transition: 'all 0.15s ease',
                          boxShadow: isActive ? '0 2px 8px rgba(14, 165, 233, 0.35)' : 'none'
                        }}
                      >
                        <span>{day}</span>
                        <span style={{ fontSize: '9px', fontWeight: 800 }}>
                          {isSaved ? '✓ Added' : isSkipped ? 'Skip' : `${dayState?.lectureCount || 0}L`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Number of Lectures Dropdown (1 to 10) */}
              <div style={{
                background: 'var(--surface-alt)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0
              }}>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--brand-900)', display: 'block' }}>
                    Lectures for {activeAddDay}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Number of lectures to schedule
                  </span>
                </div>
                <div style={{ minWidth: '130px' }}>
                  <MobileDropdown
                    title="Number of Lectures"
                    options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => ({
                      value: num,
                      label: `${num} ${num === 1 ? 'Lecture' : 'Lectures'}`
                    }))}
                    value={currentDayState.lectureCount || 2}
                    onChange={val => handleLectureCountChange(Number(val))}
                    placeholder="Select"
                  />
                </div>
              </div>

              {/* 4. Cards based on number of lectures */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '16px' }}>
                {currentLectures.map((lec, idx) => (
                  <div
                    key={idx}
                    className="card"
                    style={{
                      padding: '14px',
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                      background: 'var(--surface)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                      flexShrink: 0,
                      minHeight: 'fit-content',
                      boxSizing: 'border-box'
                    }}
                  >
                    {/* Card Title & Slot summary */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 800,
                        background: '#e0f2fe',
                        color: '#0369a1',
                        padding: '3px 8px',
                        borderRadius: '6px'
                      }}>
                        Lecture #{idx + 1}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                        {lec.fromHour}:{lec.fromMinute} {lec.fromPeriod} - {lec.tillHour}:{lec.tillMinute} {lec.tillPeriod}
                      </span>
                    </div>

                    {/* Subject dropdown */}
                    <MobileDropdown
                      label="Subject *"
                      title={`Select Subject (Lecture #${idx + 1})`}
                      options={availableSubjectsForAdd.map(sub => ({ value: sub, label: sub }))}
                      value={lec.subject || availableSubjectsForAdd[0] || ''}
                      onChange={val => handleLectureFieldChange(idx, 'subject', val)}
                      placeholder="Select Subject"
                    />

                    {/* Teacher / Faculty dropdown */}
                    <MobileDropdown
                      label="Teacher / Faculty *"
                      title={`Select Faculty (Lecture #${idx + 1})`}
                      options={facultyOptionsList.map(fac => ({ value: fac, label: fac }))}
                      value={lec.faculty || facultyOptionsList[0] || ''}
                      onChange={val => handleLectureFieldChange(idx, 'faculty', val)}
                      placeholder="Select Faculty"
                    />

                    {/* Time Slot Selection */}
                    <MobileDropdown
                      label="Timing Selection (From - To) *"
                      title={`Select Time Slot (Lecture #${idx + 1})`}
                      options={DEFAULT_SLOTS.map(slot => {
                        const val = `${slot.fromHour}:${slot.fromMinute} ${slot.fromPeriod} - ${slot.tillHour}:${slot.tillMinute} ${slot.tillPeriod}`;
                        return { value: val, label: val };
                      })}
                      value={`${lec.fromHour}:${lec.fromMinute} ${lec.fromPeriod} - ${lec.tillHour}:${lec.tillMinute} ${lec.tillPeriod}`}
                      onChange={val => handleTimeSlotChange(idx, val)}
                      placeholder="Select Timing"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Sticky Bottom Action Buttons: SAVE and SKIP */}
            <div style={{
              paddingTop: '12px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: '10px',
              marginTop: '10px',
              flexShrink: 0
            }}>
              <button
                type="button"
                onClick={handleSkipDay}
                className="btn-secondary"
                style={{
                  flex: 1,
                  padding: '12px',
                  fontSize: '13px',
                  fontWeight: 700,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <SkipForward size={16} />
                <span>Skip {activeAddDay}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveDay}
                className="btn-primary"
                style={{
                  flex: 1.4,
                  padding: '12px',
                  fontSize: '13px',
                  fontWeight: 800,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Check size={16} />
                <span>
                  {activeAddDay === 'Sun' ? 'Save & Finish' : `Save ${activeAddDay} & Next`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Fixed Bottom Button: Add Timetable covering left to right ── */}
      <div style={{
        padding: '12px 16px',
        paddingBottom: 'calc(12px + var(--safe-area-bottom, env(safe-area-inset-bottom, 0px)))',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        flexShrink: 0
      }}>
        <button
          type="button"
          onClick={handleOpenAddModal}
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
          <span>Add Timetable</span>
        </button>
      </div>
    </div>
  );
}
