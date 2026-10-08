import React, { useState, useEffect } from 'react';
import { mockNotices as initialNotices, DEFAULT_GREY_AVATAR } from '../../lib/mockData';
import {
  getStoredStudents, saveStoredStudents, deleteStoredStudent,
  getStoredTeachers, saveStoredTeachers, deleteStoredTeacher,
  getStoredParents, saveStoredParents, deleteStoredParent,
  addRegisteredUser
} from '../../lib/userAuthStore';
import { getStoredFees, getDefaultFeeForCourse, createOrUpdateStudentFeeRecord } from '../../lib/feeService';
import {
  BookOpen, Plus, Search,
  Download, ChevronRight, Calendar, Trash2, Award,
  Eye, EyeOff, IndianRupee, TrendingUp,
  Users, GraduationCap, Bell, UserX, CheckSquare
} from 'lucide-react';
import ScreenSlider from '../common/ScreenSlider';
import AdminStudyMaterialsModal, { COURSE_OPTIONS, SUBJECT_OPTIONS } from './AdminStudyMaterialsModal';
import AdminTestsModal from './AdminTestsModal';
import AdminStudyAndTestMaterialModal from './AdminStudyAndTestMaterialModal';
import AdminTimetableModal from './AdminTimetableModal';
import AdminAttendanceModal from './AdminAttendanceModal';
import AdminMarksModal from './AdminMarksModal';
import AdminFeesModal from './AdminFeesModal';
import AdminStudentPerformanceModal from './AdminStudentPerformanceModal';
import AdminUserDetailsModal from './AdminUserDetailsModal';
import AdminCourseDetailsModal from './AdminCourseDetailsModal';
import AdminExportModal from './AdminExportModal';
import MobileDropdown from '../common/MobileDropdown';
import { broadcastNotice } from '../../lib/notificationService';
import { broadcastDataChange, useDataSync } from '../../lib/syncEvents';

export default function AdminMobileDashboard({
  activeTab,
  onNavigate,
  onLogout,
  notices: propNotices,
  setNotices: propSetNotices
}) {
  // Data States
  const [students, setStudents] = useState(getStoredStudents);
  const [teachers, setTeachers] = useState(getStoredTeachers);
  const [parents, setParents] = useState(getStoredParents);
  const [searchTerm, setSearchTerm] = useState('');
  const [parentSearchTerm, setParentSearchTerm] = useState('');

  // KPI Drill-Down Modal States
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [showTeachersModal, setShowTeachersModal] = useState(false);
  const [showAbsentModal, setShowAbsentModal] = useState(false);
  const [selectedAbsentStudent, setSelectedAbsentStudent] = useState(null);
  const [selectedDetailUser, setSelectedDetailUser] = useState(null); // { type: 'student' | 'parent' | 'teacher', data }
  const [showStudyAndTestModal, setShowStudyAndTestModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [showNoticesModal, setShowNoticesModal] = useState(false);
  const [showMaterialsModal, setShowMaterialsModal] = useState(false);
  const [showTestsModal, setShowTestsModal] = useState(false);
  const [showTimetableModal, setShowTimetableModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showMarksModal, setShowMarksModal] = useState(false);
  const [showFeesModal, setShowFeesModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [notices, setNotices] = useState(propNotices || initialNotices);

  useEffect(() => {
    if (propNotices) {
      setNotices(propNotices);
    }
  }, [propNotices]);

  const [showAddNoticeForm, setShowAddNoticeForm] = useState(false);
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeMsg, setNewNoticeMsg] = useState('');
  const [newNoticeCategory, setNewNoticeCategory] = useState('General');
  const [newNoticeCourses, setNewNoticeCourses] = useState(['All Courses']);

  // Add Student Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('');
  const [newStudentCourse, setNewStudentCourse] = useState('JEE');
  const [newStudentTotalFee, setNewStudentTotalFee] = useState(() => getDefaultFeeForCourse('JEE'));
  const [newStudentPaidFee, setNewStudentPaidFee] = useState('');

  useEffect(() => {
    setNewStudentTotalFee(getDefaultFeeForCourse(newStudentCourse));
  }, [newStudentCourse]);

  // Add Parent Modal States
  const [showAddParentModal, setShowAddParentModal] = useState(false);
  const [isParentModalClosing, setIsParentModalClosing] = useState(false);
  const [isSubmittingParent, setIsSubmittingParent] = useState(false);
  const [newParentName, setNewParentName] = useState('');
  const [newParentPhone, setNewParentPhone] = useState('');
  const [newParentEmail, setNewParentEmail] = useState('');
  const [newParentPassword, setNewParentPassword] = useState('');
  const [showParentPassword, setShowParentPassword] = useState(false);
  const [newParentChildName, setNewParentChildName] = useState('');
  const [newParentChildEmail, setNewParentChildEmail] = useState('');
  const [newParentChildRoll, setNewParentChildRoll] = useState('');
  const [newParentChildCourse, setNewParentChildCourse] = useState('JEE');
  const [selectedStudentIdForParent, setSelectedStudentIdForParent] = useState('');

  // Add Faculty Modal States
  const [showAddFacultyModal, setShowAddFacultyModal] = useState(false);
  const [isFacultyModalClosing, setIsFacultyModalClosing] = useState(false);
  const [newFacultyName, setNewFacultyName] = useState('');
  const [newFacultyEmail, setNewFacultyEmail] = useState('');
  const [newFacultyPassword, setNewFacultyPassword] = useState('');
  const [newFacultyBatches, setNewFacultyBatches] = useState([]);
  const [newFacultySubjects, setNewFacultySubjects] = useState([]);
  const [exportFeedback, setExportFeedback] = useState('');

  // Universal Add User Modal States (Student, Teacher, Parent, Admin)
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [isUserModalClosing, setIsUserModalClosing] = useState(false);
  const [newUserRole, setNewUserRole] = useState('student');
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserCourse, setNewUserCourse] = useState('JEE');
  const [newUserBatches, setNewUserBatches] = useState([]);
  const [newUserSubjects, setNewUserSubjects] = useState([]);
  const [newUserChildName, setNewUserChildName] = useState('');
  const [newUserChildRoll, setNewUserChildRoll] = useState('');
  const [newUserTotalFee, setNewUserTotalFee] = useState(() => getDefaultFeeForCourse('JEE'));
  const [newUserPaidFee, setNewUserPaidFee] = useState('');
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);

  useEffect(() => {
    setNewUserTotalFee(getDefaultFeeForCourse(newUserCourse));
  }, [newUserCourse]);

  // Add Course Modal States
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [isCourseModalClosing, setIsCourseModalClosing] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const INITIAL_COURSES = [
    { id: 'c-1', name: 'Std 9th', code: 'STD-9', subjects: ['English (9th)', 'Maths (9th)', 'Science (9th)'], faculty: ['Science Faculty'] },
    { id: 'c-2', name: 'Std 10th', code: 'STD-10', subjects: ['English (10th)', 'Maths (10th)', 'Science (10th)'], faculty: ['Science Faculty'] },
    { id: 'c-3', name: '11th Science', code: 'SCI-11', subjects: ['English (11th)', 'Geography (11th)', 'History (11th)'], faculty: ['Faculty'] },
    { id: 'c-4', name: '12th Science', code: 'SCI-12', subjects: ['English (12th)', 'Geography (12th)', 'History (12th)'], faculty: ['Faculty'] },
    { id: 'c-5', name: 'NEET', code: 'NEET', subjects: ['Physics (NEET)', 'Chemistry (NEET)', 'Biology (NEET)'], faculty: ['Physics Faculty', 'Biology Faculty'] },
    { id: 'c-6', name: 'JEE (Mains + Adv)', code: 'JEE', subjects: ['Physics (JEE)', 'Chemistry (JEE)', 'Maths (JEE)'], faculty: ['Physics Faculty', 'Mathematics Faculty'] },
    { id: 'c-7', name: 'MHT-CET', code: 'MHT-CET', subjects: ['Physics (JEE)', 'Chemistry (JEE)', 'Maths (JEE)'], faculty: ['Physics Faculty'] }
  ];

  const [courses, setCourses] = useState(() => {
    try {
      const saved = localStorage.getItem('concept_academy_courses_list') || localStorage.getItem('aspire_courses_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_COURSES;
  });

  useEffect(() => {
    try {
      const json = JSON.stringify(courses);
      localStorage.setItem('concept_academy_courses_list', json);
      localStorage.setItem('aspire_courses_list', json);
      broadcastDataChange('courses', { count: courses.length });
    } catch {}
  }, [courses]);

  useDataSync(['students', 'teachers', 'parents', 'courses', 'notices'], () => {
    setStudents(getStoredStudents());
    setTeachers(getStoredTeachers());
    setParents(getStoredParents());
    try {
      const saved = localStorage.getItem('concept_academy_courses_list') || localStorage.getItem('aspire_courses_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setCourses(parsed);
      }
    } catch {}
  });

  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseSubjects, setNewCourseSubjects] = useState([]);
  const [newCourseFaculty, setNewCourseFaculty] = useState([]);

  // Animation helper state
  const [closingModal, setClosingModal] = useState(null);

  const NOTICE_CATEGORIES = ['General', 'Test', 'Attendance', 'Fee', 'Holiday', 'Exam'];
  const BATCH_OPTIONS = ['JEE 12-A', 'JEE 12-B', 'NEET 12-A', 'NEET 12-B', 'Class 11-A', 'Class 11-B', 'Class 10-A', 'Class 10-B', 'Foundation 9-A'];
  const FACULTY_OPTIONS = ['Physics Faculty', 'Chemistry Faculty', 'Mathematics Faculty', 'Biology Faculty'];

  const absentStudents = [];

  const toggleFacultyBatch = (b) => setNewFacultyBatches(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);
  const toggleFacultySubject = (s) => setNewFacultySubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleCourseSubject = (s) => setNewCourseSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleCourseFaculty = (f) => setNewCourseFaculty(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);

  const handleToggleAllCourses = () => {
    setNewNoticeCourses(['All Courses']);
  };

  const handleToggleCourse = (course) => {
    setNewNoticeCourses(prev => {
      // If "All Courses" was currently selected, clicking a specific course replaces "All Courses"
      if (prev.includes('All Courses')) {
        return [course];
      }
      if (prev.includes(course)) {
        const next = prev.filter(c => c !== course);
        return next.length === 0 ? ['All Courses'] : next;
      } else {
        const next = [...prev, course];
        // If all individual courses are selected, reset to 'All Courses'
        if (next.length === COURSE_OPTIONS.length) {
          return ['All Courses'];
        }
        return next;
      }
    });
  };

  const handleAddNotice = (e) => {
    e.preventDefault();
    if (!newNoticeTitle.trim() || !newNoticeMsg.trim()) return;

    const targetCourses = newNoticeCourses.includes('All Courses') || newNoticeCourses.length === 0
      ? ['All Courses']
      : newNoticeCourses;

    const newNotice = {
      id: `notif-${Date.now()}`,
      title: newNoticeTitle.trim(),
      message: newNoticeMsg.trim(),
      category: newNoticeCategory,
      courses: targetCourses,
      targetCourses: targetCourses,
      priority: 'normal',
      timestamp: 'Just now',
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      read: false
    };

    if (propSetNotices) {
      propSetNotices(prev => [newNotice, ...prev]);
    }
    setNotices(prev => [newNotice, ...prev]);

    // Dispatch real system notification and broadcast cross-device/cross-tab
    broadcastNotice(newNotice);
    broadcastDataChange('notices', { notice: newNotice });

    setNewNoticeTitle('');
    setNewNoticeMsg('');
    setNewNoticeCategory('General');
    setNewNoticeCourses(['All Courses']);
    setShowAddNoticeForm(false);
  };

  const handleDeleteNotice = (noticeId) => {
    if (propSetNotices) {
      propSetNotices(prev => prev.filter(n => n.id !== noticeId));
    }
    setNotices(prev => prev.filter(n => n.id !== noticeId));
    broadcastDataChange('notices', { deletedNoticeId: noticeId });
  };

  const handleExport = (format) => {
    setExportFormat(format || 'pdf');
    setShowExportModal(true);
  };

  const closeModal = (key, setter) => {
    setClosingModal(key);
    setTimeout(() => { setter(false); setClosingModal(null); }, 380);
  };

  const handleCloseAddModal = () => {
    setIsModalClosing(true);
    setTimeout(() => {
      setShowAddModal(false);
      setIsModalClosing(false);
    }, 380);
  };

  const handleCloseAddParentModal = () => {
    setIsParentModalClosing(true);
    setTimeout(() => {
      setShowAddParentModal(false);
      setIsParentModalClosing(false);
      setIsSubmittingParent(false);
      setNewParentPassword('');
      setShowParentPassword(false);
    }, 380);
  };

  // Auto-fill student details when selected in Add Parent modal
  const handleSelectStudentForParent = (studentId) => {
    setSelectedStudentIdForParent(studentId);
    if (!studentId || studentId === 'custom') {
      return;
    }
    const found = students.find(s => s.id === studentId);
    if (found) {
      setNewParentChildName(found.name || '');
      setNewParentChildRoll(found.roll || '');
      setNewParentChildEmail(found.email || `${(found.name || 'student').toLowerCase().replace(/\s+/g, '')}@conceptacademy.edu`);
      setNewParentChildCourse(found.course || 'JEE');
    }
  };

  const handleAddParent = async (e) => {
    e.preventDefault();
    if (isSubmittingParent) return;
    if (!newParentName || !newParentPhone) return;

    // Prevent duplicate entry by phone or email
    const cleanPhoneDigits = newParentPhone.replace(/\D/g, '');
    const cleanEmail = (newParentEmail || '').trim().toLowerCase();
    const isDuplicate = parents.some(p => {
      const pPhoneDigits = (p.phone || '').replace(/\D/g, '');
      const pEmail = (p.email || '').trim().toLowerCase();
      if (cleanPhoneDigits && pPhoneDigits === cleanPhoneDigits) return true;
      if (cleanEmail && pEmail && pEmail === cleanEmail) return true;
      return false;
    });

    if (isDuplicate) {
      setExportFeedback('⚠️ A parent with this phone or email is already registered.');
      setTimeout(() => setExportFeedback(''), 3000);
      handleCloseAddParentModal();
      return;
    }

    setIsSubmittingParent(true);

    const childName = newParentChildName.trim() || 'Student';
    const childRoll = newParentChildRoll.trim() || (students.length + 101).toString();
    const childEmail = newParentChildEmail.trim() || `${childName.toLowerCase().replace(/\s+/g, '')}@conceptacademy.edu`;
    const childCourse = newParentChildCourse.trim() || 'JEE';

    // Find matching enrolled student
    const matchedStudent = students.find(s =>
      (selectedStudentIdForParent && selectedStudentIdForParent !== 'custom' && s.id === selectedStudentIdForParent) ||
      (s.roll && s.roll === childRoll) ||
      (s.name.toLowerCase() === childName.toLowerCase())
    );

    const parentId = `par-${Date.now()}`;
    const studentId = matchedStudent ? matchedStudent.id : `s-${Date.now()}`;

    const parentEmailClean = (newParentEmail.trim() || `${newParentName.trim().toLowerCase().replace(/\s+/g, '')}@gmail.com`).toLowerCase();
    const parentPassClean = (newParentPassword || '').trim() || newParentPhone.trim() || 'parent@123';

    const newPar = {
      id: parentId,
      name: newParentName.trim(),
      phone: newParentPhone.trim(),
      email: parentEmailClean,
      password: parentPassClean,
      studentId: studentId,
      linkedChildId: studentId,
      linkedChildName: childName,
      linkedChildEmail: childEmail,
      linkedChildRoll: childRoll,
      linkedChildCourse: childCourse,
      status: 'Active',
      avatar: DEFAULT_GREY_AVATAR
    };

    // 1. Update parents list and persist
    setParents(prev => {
      const updated = [newPar, ...prev];
      return saveStoredParents(updated);
    });

    // Register parent credentials
    if (newPar.email) {
      await addRegisteredUser({
        name: newPar.name,
        email: parentEmailClean,
        password: parentPassClean,
        role: 'parent',
        phone: newPar.phone,
        linkedChildName: childName
      });
    }

    // 2. Connect parent details to student in students state
    if (matchedStudent) {
      setStudents(prev => prev.map(s => {
        if (s.id === matchedStudent.id) {
          return {
            ...s,
            parentName: newParentName.trim(),
            parentPhone: newParentPhone.trim(),
            parentEmail: newParentEmail.trim(),
            parentId: parentId,
            parentStatus: 'Linked'
          };
        }
        return s;
      }));
    } else {
      const newStd = {
        id: studentId,
        name: childName,
        roll: childRoll,
        course: childCourse,
        email: childEmail,
        attendance: 'Present',
        score: '85%',
        status: 'Active',
        parentName: newParentName.trim(),
        parentPhone: newParentPhone.trim(),
        parentEmail: newParentEmail.trim(),
        parentId: parentId,
        parentStatus: 'Linked'
      };
      setStudents(prev => [newStd, ...prev]);
    }

    setNewParentName('');
    setNewParentPhone('');
    setNewParentEmail('');
    setNewParentPassword('');
    setShowParentPassword(false);
    setNewParentChildName('');
    setNewParentChildEmail('');
    setNewParentChildRoll('');
    setSelectedStudentIdForParent('');
    handleCloseAddParentModal();

    setExportFeedback(`✓ Parent "${newParentName.trim()}" linked to student "${childName}"!`);
    setTimeout(() => setExportFeedback(''), 3500);
  };

  const handleDeleteParent = (parentId) => {
    const updated = deleteStoredParent(parentId);
    setParents(updated);
    setExportFeedback('Parent removed.');
    setTimeout(() => setExportFeedback(''), 2500);
  };

  const handleDeleteStudent = (studentId) => {
    const updated = deleteStoredStudent(studentId);
    setStudents(updated);
    setExportFeedback('Student removed.');
    setTimeout(() => setExportFeedback(''), 2500);
  };

  const handleDeleteTeacher = (teacherId) => {
    const updated = deleteStoredTeacher(teacherId);
    setTeachers(updated);
    setExportFeedback('Faculty removed.');
    setTimeout(() => setExportFeedback(''), 2500);
  };

  const handleDeleteUserFromModal = (type, data) => {
    if (type === 'student') {
      handleDeleteStudent(data.id);
    } else if (type === 'teacher' || type === 'faculty') {
      handleDeleteTeacher(data.id);
    } else if (type === 'parent') {
      handleDeleteParent(data.id);
    }
    setSelectedDetailUser(null);
  };

  const handleSwitchDetailUser = (newType, newData) => {
    if (newType === 'student') {
      const found = students.find(s => s.id === newData.id || (s.roll && s.roll === newData.roll) || s.name === newData.name);
      setSelectedDetailUser({ type: 'student', data: found || newData });
    } else if (newType === 'parent') {
      const found = parents.find(p => p.id === newData.id || p.name === newData.name || (p.phone && p.phone === newData.phone));
      setSelectedDetailUser({ type: 'parent', data: found || newData });
    } else {
      setSelectedDetailUser({ type: newType, data: newData });
    }
  };

  const handleOpenPerformanceFromModal = (studentData) => {
    setSelectedDetailUser(null);
    setShowPerformanceModal(true);
  };

  const handleCloseAddFacultyModal = () => {
    setIsFacultyModalClosing(true);
    setTimeout(() => {
      setShowAddFacultyModal(false);
      setIsFacultyModalClosing(false);
    }, 380);
  };

  const handleCloseAddCourseModal = () => {
    setIsCourseModalClosing(true);
    setTimeout(() => {
      setShowAddCourseModal(false);
      setIsCourseModalClosing(false);
    }, 380);
  };

  const handleAddCourse = (e) => {
    e.preventDefault();
    if (!newCourseName || newCourseSubjects.length === 0 || newCourseFaculty.length === 0) return;
    const code = newCourseName.slice(0, 3).toUpperCase() + '-' + Date.now().toString().slice(-3);
    const newC = {
      id: `c-${Date.now()}`,
      name: newCourseName,
      code,
      subjects: newCourseSubjects,
      faculty: newCourseFaculty
    };
    setCourses(prev => [newC, ...prev]);
    setNewCourseName('');
    setNewCourseSubjects([]);
    setNewCourseFaculty([]);
    handleCloseAddCourseModal();
  };

  const handleSaveCourse = (updatedCourse) => {
    setCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
    setSelectedCourse(updatedCourse);
    setExportFeedback(`Course "${updatedCourse.name}" updated.`);
    setTimeout(() => setExportFeedback(''), 2500);
  };

  const handleDeleteCourse = (courseId) => {
    setCourses(prev => prev.filter(c => c.id !== courseId));
    setSelectedCourse(null);
    setExportFeedback('Course deleted.');
    setTimeout(() => setExportFeedback(''), 2500);
  };

  // Intercept back action to close open admin bottom-sheets/modals
  useEffect(() => {
    const handleAdminBack = (e) => {
      if (selectedCourse) {
        setSelectedCourse(null);
        e.detail?.markHandled();
        return;
      }
      if (showExportModal) {
        setShowExportModal(false);
        e.detail?.markHandled();
        return;
      }
      if (selectedDetailUser) {
        setSelectedDetailUser(null);
        e.detail?.markHandled();
        return;
      }
      if (showStudyAndTestModal) {
        setShowStudyAndTestModal(false);
        e.detail?.markHandled();
        return;
      }
      if (selectedAbsentStudent) {
        setSelectedAbsentStudent(null);
        e.detail?.markHandled();
        return;
      }
      if (showAddNoticeForm) {
        setShowAddNoticeForm(false);
        e.detail?.markHandled();
        return;
      }
      if (showNoticesModal) {
        setShowNoticesModal(false);
        e.detail?.markHandled();
        return;
      }
      if (showAbsentModal) {
        setShowAbsentModal(false);
        e.detail?.markHandled();
        return;
      }
      if (showFeesModal) {
        setShowFeesModal(false);
        e.detail?.markHandled();
        return;
      }
      if (showPerformanceModal) {
        setShowPerformanceModal(false);
        e.detail?.markHandled();
        return;
      }
      if (showTimetableModal) {
        setShowTimetableModal(false);
        e.detail?.markHandled();
        return;
      }
      if (showMaterialsModal) {
        setShowMaterialsModal(false);
        e.detail?.markHandled();
        return;
      }
      if (showTestsModal) {
        setShowTestsModal(false);
        e.detail?.markHandled();
        return;
      }
      if (showAttendanceModal) {
        setShowAttendanceModal(false);
        e.detail?.markHandled();
        return;
      }
      if (showMarksModal) {
        setShowMarksModal(false);
        e.detail?.markHandled();
        return;
      }
      if (showTeachersModal) {
        setShowTeachersModal(false);
        e.detail?.markHandled();
        return;
      }
      if (showStudentsModal) {
        setShowStudentsModal(false);
        e.detail?.markHandled();
        return;
      }
      if (showAddUserModal) {
        setShowAddUserModal(false);
        e.detail?.markHandled();
        return;
      }
      if (showAddModal) {
        setShowAddModal(false);
        e.detail?.markHandled();
        return;
      }
      if (showAddParentModal) {
        setShowAddParentModal(false);
        e.detail?.markHandled();
        return;
      }
      if (showAddFacultyModal) {
        setShowAddFacultyModal(false);
        e.detail?.markHandled();
        return;
      }
      if (showAddCourseModal) {
        setShowAddCourseModal(false);
        e.detail?.markHandled();
        return;
      }
    };

    window.addEventListener('app:back', handleAdminBack);
    return () => window.removeEventListener('app:back', handleAdminBack);
  }, [
    selectedCourse, showExportModal, selectedDetailUser, showStudyAndTestModal, selectedAbsentStudent, showAddNoticeForm, showNoticesModal,
    showAbsentModal, showTeachersModal, showStudentsModal,
    showAddUserModal, showAddModal, showAddParentModal, showAddFacultyModal, showAddCourseModal,
    showMaterialsModal, showTestsModal, showTimetableModal, showAttendanceModal, showMarksModal,
    showFeesModal, showPerformanceModal
  ]);

  const handleCloseAddUserModal = () => {
    setIsUserModalClosing(true);
    setTimeout(() => {
      setShowAddUserModal(false);
      setIsUserModalClosing(false);
    }, 280);
  };

  const toggleUserBatch = (b) => setNewUserBatches(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);
  const toggleUserSubject = (s) => setNewUserSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleAddUniversalUser = async (e) => {
    e.preventDefault();
    if (isSubmittingUser) return;
    const cleanName = newUserName.trim();
    const cleanEmail = newUserEmail.trim().toLowerCase();
    const cleanPassword = newUserPassword.trim();
    const cleanPhone = newUserPhone.trim();

    if (!cleanName || !cleanEmail || !cleanPassword) {
      alert('Please fill in required fields: Name, Email, and Password.');
      return;
    }

    setIsSubmittingUser(true);

    try {
      const res = await addRegisteredUser({
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword,
        role: newUserRole,
        phone: cleanPhone,
        course: newUserCourse,
        batches: newUserBatches,
        subjects: newUserSubjects,
        linkedChildName: newUserChildName,
        rollNumber: newUserChildRoll || (newUserRole === 'student' ? (students.length + 101).toString() : '')
      });

      if (newUserRole === 'student') {
        const rollNo = (students.length + 101).toString();
        const newStd = {
          id: res?.id || `s-${Date.now()}`,
          name: cleanName,
          email: cleanEmail,
          password: cleanPassword,
          roll: rollNo,
          rollNumber: `CONCEPT-2025-${rollNo}`,
          course: newUserCourse || 'JEE',
          attendance: 'Present',
          score: '85%',
          status: 'Active',
          phone: cleanPhone,
          bloodGroup: '',
          avatar: DEFAULT_GREY_AVATAR
        };
        const updated = [newStd, ...students];
        setStudents(updated);
        saveStoredStudents(updated);

        // Store and connect fees in Fees section
        const totalNum = Number(newUserTotalFee) > 0 ? Number(newUserTotalFee) : getDefaultFeeForCourse(newUserCourse || 'JEE');
        const paidNum = Math.max(0, Number(newUserPaidFee) || 0);
        createOrUpdateStudentFeeRecord({
          id: newStd.id,
          name: cleanName,
          roll: rollNo,
          course: newUserCourse || 'JEE',
          totalFee: totalNum,
          paidFee: paidNum,
          remarks: 'Universal User Registration'
        });
      } else if (newUserRole === 'teacher') {
        const newT = {
          id: res?.id || `t-${Date.now()}`,
          name: cleanName,
          email: cleanEmail,
          password: cleanPassword,
          subject: newUserSubjects.join(', ') || 'General',
          batches: newUserBatches.join(', ') || 'All Batches',
          status: 'Active',
          avatar: DEFAULT_GREY_AVATAR
        };
        setTeachers(prev => {
          const updated = [newT, ...prev];
          saveStoredTeachers(updated);
          return updated;
        });
      } else if (newUserRole === 'parent') {
        const newPar = {
          id: res?.id || `par-${Date.now()}`,
          name: cleanName,
          phone: cleanPhone || '9876543210',
          email: cleanEmail,
          password: cleanPassword,
          linkedChildName: newUserChildName || 'Student',
          linkedChildRoll: newUserChildRoll || '101',
          linkedChildCourse: newUserCourse || 'JEE',
          status: 'Active',
          avatar: DEFAULT_GREY_AVATAR
        };
        setParents(prev => {
          const updated = [newPar, ...prev];
          saveStoredParents(updated);
          return updated;
        });
      }

      setExportFeedback(`✓ User "${cleanName}" (${newUserRole.toUpperCase()}) saved and stored in Supabase!`);
      setTimeout(() => setExportFeedback(''), 4500);

      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserPhone('');
      setNewUserRole('student');
      setNewUserBatches([]);
      setNewUserSubjects([]);
      setNewUserChildName('');
      setNewUserChildRoll('');
      setNewUserPaidFee('');
      handleCloseAddUserModal();
    } catch (err) {
      alert('Error saving user: ' + err.message);
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    if (!newFacultyName.trim() || !newFacultyEmail.trim() || !newFacultyPassword.trim() || newFacultyBatches.length === 0 || newFacultySubjects.length === 0) return;
    const cleanName = newFacultyName.trim();
    const cleanEmail = newFacultyEmail.trim().toLowerCase();
    const cleanPassword = newFacultyPassword.trim();

    const newT = {
      id: `t-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      subject: newFacultySubjects.join(', '),
      batches: newFacultyBatches.join(', '),
      status: 'Active',
      avatar: DEFAULT_GREY_AVATAR
    };
    setTeachers(prev => {
      const updated = [newT, ...prev];
      saveStoredTeachers(updated);
      return updated;
    });

    await addRegisteredUser({
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      role: 'teacher',
      batches: newFacultyBatches,
      subjects: newFacultySubjects
    });

    setNewFacultyName('');
    setNewFacultyEmail('');
    setNewFacultyPassword('');
    setNewFacultyBatches([]);
    setNewFacultySubjects([]);
    handleCloseAddFacultyModal();
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    const trimmedName = newStudentName.trim();
    const trimmedEmail = newStudentEmail.trim().toLowerCase();
    const trimmedPass = newStudentPassword.trim();
    if (!trimmedName || !trimmedEmail || !trimmedPass) {
      alert('Please fill in all fields: Name, Email, and Password.');
      return;
    }
    const rollNo = (students.length + 101).toString();

    const newStd = {
      id: `s-${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail,
      password: trimmedPass,
      roll: rollNo,
      rollNumber: `CONCEPT-2025-${rollNo}`,
      course: newStudentCourse,
      attendance: 'Present',
      score: '85%',
      status: 'Active',
      phone: '',
      bloodGroup: '',
      avatar: DEFAULT_GREY_AVATAR
    };
    const updated = [newStd, ...students];
    setStudents(updated);
    saveStoredStudents(updated);

    // Save credentials so student can log in immediately
    await addRegisteredUser({
      name: trimmedName,
      email: trimmedEmail,
      password: trimmedPass,
      role: 'student',
      course: newStudentCourse,
      rollNumber: `CONCEPT-2025-${rollNo}`,
      phone: '',
      bloodGroup: ''
    });

    // Store and connect fees in Fees section
    const actualTotal = Number(newStudentTotalFee) > 0 ? Number(newStudentTotalFee) : getDefaultFeeForCourse(newStudentCourse);
    const actualPaid = Math.max(0, Number(newStudentPaidFee) || 0);

    createOrUpdateStudentFeeRecord({
      id: newStd.id,
      name: trimmedName,
      roll: rollNo,
      course: newStudentCourse,
      totalFee: actualTotal,
      paidFee: actualPaid,
      remarks: 'Student Enrollment'
    });

    setNewStudentName('');
    setNewStudentEmail('');
    setNewStudentPassword('');
    setNewStudentPaidFee('');
    handleCloseAddModal();

    // Confirm to admin exactly what was saved
    alert(`✅ Student enrolled!\n\nEmail: ${trimmedEmail}\nPassword: ${trimmedPass}\n\nThe student can now log in with these credentials.`);
  };

  const adminTabs = [
    {
      id: 'home',
      component: (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '18px', paddingBottom: '90px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Institute Governance
              </span>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--brand-900)' }}>Admin Portal</h2>
            </div>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="btn-primary"
              style={{ padding: '8px 14px', fontSize: '12px', gap: '6px', display: 'flex', alignItems: 'center', borderRadius: '8px' }}
            >
              <Plus size={15} /> Add User
            </button>
          </div>

          {/* Feedback Toast */}
          {exportFeedback && (
            <div style={{
              padding: '10px 14px',
              background: 'var(--brand-50)',
              border: '1px solid var(--brand-500)',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--brand-900)'
            }}>
              {exportFeedback}
            </div>
          )}

          {/* Quick Actions: Students, Teachers, Notices, Absent, Academics & Governance */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Quick Actions
              </span>
              <span style={{ fontSize: '10px', color: 'var(--brand-700)', fontWeight: 600 }}>
                Administration Hub
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>

              {/* Students Button */}
              <div
                className="card"
                onClick={() => setShowStudentsModal(true)}
                style={{
                  padding: '14px',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
                  border: '1.5px solid #bfdbfe',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  transition: 'transform 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={19} />
                  </div>
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 7px',
                    borderRadius: '999px',
                    fontWeight: 700,
                    background: '#dbeafe',
                    color: '#1d4ed8'
                  }}>
                    {students.length} Total
                  </span>
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--brand-900)', margin: '4px 0 2px 0' }}>
                    Students
                  </h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Profiles, Batch & Details
                  </span>
                </div>
              </div>

              {/* Teachers Button */}
              <div
                className="card"
                onClick={() => setShowTeachersModal(true)}
                style={{
                  padding: '14px',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #f5f3ff 0%, #ffffff 100%)',
                  border: '1.5px solid #ddd6fe',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  transition: 'transform 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <GraduationCap size={19} />
                  </div>
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 7px',
                    borderRadius: '999px',
                    fontWeight: 700,
                    background: '#ede9fe',
                    color: '#6d28d9'
                  }}>
                    {teachers.length} Faculty
                  </span>
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--brand-900)', margin: '4px 0 2px 0' }}>
                    Teachers
                  </h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Staff & Subject Incharge
                  </span>
                </div>
              </div>

              {/* Notices Button */}
              <div
                className="card"
                onClick={() => setShowNoticesModal(true)}
                style={{
                  padding: '14px',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)',
                  border: '1.5px solid #fde68a',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  transition: 'transform 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bell size={19} />
                  </div>
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 7px',
                    borderRadius: '999px',
                    fontWeight: 700,
                    background: '#fef3c7',
                    color: '#b45309'
                  }}>
                    {notices.length} Active
                  </span>
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--brand-900)', margin: '4px 0 2px 0' }}>
                    Notices
                  </h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Broadcast Announcements
                  </span>
                </div>
              </div>

              {/* Absent Button */}
              <div
                className="card"
                onClick={() => setShowAbsentModal(true)}
                style={{
                  padding: '14px',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)',
                  border: '1.5px solid #fecaca',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  transition: 'transform 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserX size={19} />
                  </div>
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 7px',
                    borderRadius: '999px',
                    fontWeight: 700,
                    background: '#fee2e2',
                    color: '#b91c1c'
                  }}>
                    {absentStudents.length} Today
                  </span>
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--brand-900)', margin: '4px 0 2px 0' }}>
                    Absent
                  </h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Today's Absentee List
                  </span>
                </div>
              </div>
              {/* Unified Study and Test Material Button */}
              <div
                className="card"
                onClick={() => setShowStudyAndTestModal(true)}
                style={{
                  gridColumn: '1 / -1',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #f0f9ff 60%, #ffffff 100%)',
                  border: '1.5px solid #7dd3fc',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  transition: 'transform 0.15s ease',
                  boxShadow: '0 2px 6px rgba(2, 132, 199, 0.05)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(2, 132, 199, 0.2)',
                    flexShrink: 0
                  }}>
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--brand-900)', margin: 0 }}>
                        Study and Test Material
                      </h4>
                      <span className="badge badge-info" style={{ fontSize: '9.5px', padding: '1px 6px' }}>
                        3 in 1
                      </span>
                    </div>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                      Study Material • Question Paper • Solutions
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0284c7', fontWeight: 700, fontSize: '12px', flexShrink: 0 }}>
                  <span>Open</span>
                  <ChevronRight size={18} />
                </div>
              </div>

              {/* Timetable Button */}
              <div
                className="card"
                onClick={() => setShowTimetableModal(true)}
                style={{
                  padding: '14px',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #f5f3ff 0%, #ffffff 100%)',
                  border: '1.5px solid #ddd6fe',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  transition: 'transform 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={19} />
                  </div>
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 7px',
                    borderRadius: '999px',
                    fontWeight: 700,
                    background: '#ede9fe',
                    color: '#6d28d9'
                  }}>
                    Classes
                  </span>
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--brand-900)', margin: '4px 0 2px 0' }}>
                    Timetable
                  </h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Add & Delete Lectures
                  </span>
                </div>
              </div>

              {/* Attendance Button */}
              <div
                className="card"
                onClick={() => setShowAttendanceModal(true)}
                style={{
                  padding: '14px',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)',
                  border: '1.5px solid #a7f3d0',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  transition: 'transform 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckSquare size={19} />
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '10px', padding: '2px 7px' }}>
                    Analytics
                  </span>
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--brand-900)', margin: '4px 0 2px 0' }}>
                    Attendance
                  </h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Student, Course & Subject
                  </span>
                </div>
              </div>

              {/* Marks Button */}
              <div
                className="card"
                onClick={() => setShowMarksModal(true)}
                style={{
                  padding: '14px',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #fef3c7 0%, #ffffff 100%)',
                  border: '1.5px solid #fde68a',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  transition: 'transform 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Award size={19} />
                  </div>
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 7px',
                    borderRadius: '999px',
                    fontWeight: 700,
                    background: '#fef3c7',
                    color: '#b45309'
                  }}>
                    Scores
                  </span>
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--brand-900)', margin: '4px 0 2px 0' }}>
                    Marks
                  </h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Upload & Grade Tests
                  </span>
                </div>
              </div>

              {/* Fees Button (Quick Action) */}
              <div
                className="card"
                onClick={() => setShowFeesModal(true)}
                style={{
                  padding: '14px',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
                  border: '1.5px solid #bfdbfe',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  transition: 'transform 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IndianRupee size={19} />
                  </div>
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 7px',
                    borderRadius: '999px',
                    fontWeight: 700,
                    background: '#dbeafe',
                    color: '#1e40af'
                  }}>
                    Finance
                  </span>
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--brand-900)', margin: '4px 0 2px 0' }}>
                    Fees
                  </h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Track, Edit & Alerts
                  </span>
                </div>
              </div>

              {/* Student Performance Button (Quick Action) */}
              <div
                className="card"
                onClick={() => setShowPerformanceModal(true)}
                style={{
                  gridColumn: 'span 2',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
                  border: '1.5px solid #86efac',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  boxShadow: 'var(--shadow-card)',
                  transition: 'transform 0.15s ease, border-color 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#22c55e';
                  e.currentTarget.style.transform = 'translateY(-1.5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#86efac';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #bbf7d0' }}>
                    <TrendingUp size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--brand-900)', margin: 0 }}>
                        Student Performance
                      </h4>
                      <span style={{
                        fontSize: '9.5px',
                        padding: '1px 6px',
                        borderRadius: '999px',
                        fontWeight: 800,
                        background: '#dcfce7',
                        color: '#166534',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        ANALYTICS
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                      Search students, view progress cards & live line graphs
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#15803d', fontWeight: 700, fontSize: '12px', flexShrink: 0 }}>
                  <span>View</span>
                  <ChevronRight size={18} />
                </div>
              </div>
            </div>
          </div>

          {/* Live Classes */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>Ongoing Lectures</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="card" style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h5 style={{ fontSize: '13px', fontWeight: 700 }}>Physics (JEE 12 - A)</h5>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Room 204 • Physics Faculty</span>
                </div>
                <span className="badge badge-success">Ongoing</span>
              </div>

              <div className="card" style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h5 style={{ fontSize: '13px', fontWeight: 700 }}>Chemistry (NEET 12 - B)</h5>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Room 201 • Chemistry Faculty</span>
                </div>
                <span className="badge badge-accent">Ongoing</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'students',
      component: (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '18px', paddingBottom: '90px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-900)' }}>Students ({students.length})</h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
              style={{ padding: '6px 14px', fontSize: '12px', gap: '4px' }}
            >
              <Plus size={14} /> Add Student
            </button>
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search student..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 34px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                fontSize: '13px',
                background: 'var(--surface)'
              }}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          {/* Mobile Student List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(students || [])
              .filter(s =>
                s && (
                  String(s.name || '').toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
                  String(s.roll || s.rollNumber || '').toLowerCase().includes(searchTerm.toLowerCase().trim())
                )
              )
              .map(std => (
                <div
                  key={std.id || std.email || Math.random()}
                  className="card"
                  onClick={() => setSelectedDetailUser({ type: 'student', data: std })}
                  style={{
                    padding: '14px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'transform 0.1s ease, box-shadow 0.15s ease'
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h5 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{std.name || 'Student'}</h5>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Roll #{std.roll || std.rollNumber || '—'} • {std.course || '—'}</span>
                    {std.parentName ? (
                      <div style={{ fontSize: '11.5px', color: 'var(--brand-700)', fontWeight: 600, marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        👨‍👦 Parent: {std.parentName} {std.parentPhone ? `(${std.parentPhone})` : ''}
                      </div>
                    ) : (
                      <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px', fontStyle: 'italic' }}>
                        No parent linked
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span className="badge badge-success">{std.status || 'Active'}</span>
                    <ChevronRight size={16} color="var(--text-muted)" />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )
    },
    {
      id: 'parents',
      component: (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '18px', paddingBottom: '90px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-900)', margin: 0 }}>Parents ({parents.length})</h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Registered Guardians & Linked Students</span>
            </div>
            <button
              onClick={() => setShowAddParentModal(true)}
              className="btn-primary"
              style={{ padding: '6px 14px', fontSize: '12px', gap: '4px', display: 'flex', alignItems: 'center' }}
            >
              <Plus size={14} /> Add Parent
            </button>
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search parent, phone or student..."
              value={parentSearchTerm}
              onChange={e => setParentSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 34px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                fontSize: '13px',
                background: 'var(--surface)'
              }}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          {/* Mobile Parents List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(parents || [])
              .filter(p =>
                p && (
                  String(p.name || '').toLowerCase().includes(parentSearchTerm.toLowerCase().trim()) ||
                  (p.linkedChildName && String(p.linkedChildName).toLowerCase().includes(parentSearchTerm.toLowerCase().trim())) ||
                  String(p.phone || '').includes(parentSearchTerm.trim())
                )
              )
              .map(p => (
                <div
                  key={p.id || p.email || Math.random()}
                  className="card"
                  onClick={() => setSelectedDetailUser({ type: 'parent', data: p })}
                  style={{
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    cursor: 'pointer',
                    transition: 'transform 0.1s ease, box-shadow 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--brand-900)', margin: 0 }}>{p.name || 'Parent'}</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px', marginTop: '3px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                        <span>📞 {p.phone || '—'}</span>
                        {p.email && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>✉️ {p.email}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <span className="badge badge-success">{p.status || 'Active'}</span>
                      <ChevronRight size={16} color="var(--text-muted)" />
                    </div>
                  </div>

                  {/* Linked Child Info Box */}
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Linked Child
                      </span>
                      <h5 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--brand-800)', margin: '1px 0 0 0' }}>
                        {p.linkedChildName || 'Student'}
                      </h5>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        Roll #{p.linkedChildRoll || '—'} • {p.linkedChildCourse || '—'}
                      </span>
                      {p.linkedChildEmail && (
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          ✉️ {p.linkedChildEmail}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <a
                        href={`tel:${String(p.phone || '').replace(/\s+/g, '')}`}
                        style={{
                          padding: '6px 12px',
                          background: '#ffffff',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: 'var(--brand-800)',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}
                      >
                        Call
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteParent(p.id);
                        }}
                        style={{
                          padding: '6px 8px',
                          background: '#fee2e2',
                          border: '1px solid #fca5a5',
                          borderRadius: '6px',
                          color: '#dc2626',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}
                        title="Remove Parent"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

            {(parents || []).filter(p =>
              p && (
                String(p.name || '').toLowerCase().includes(parentSearchTerm.toLowerCase().trim()) ||
                (p.linkedChildName && String(p.linkedChildName).toLowerCase().includes(parentSearchTerm.toLowerCase().trim())) ||
                String(p.phone || '').includes(parentSearchTerm.trim())
              )
            ).length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                No parents found matching "{parentSearchTerm}"
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      id: 'teachers',
      component: (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '18px', paddingBottom: '90px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-900)' }}>Faculty ({teachers.length})</h3>
            <button
              onClick={() => setShowAddFacultyModal(true)}
              className="btn-primary"
              style={{ padding: '6px 14px', fontSize: '12px', gap: '4px' }}
            >
              <Plus size={14} /> Add Faculty
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(teachers || []).map(t => {
              if (!t) return null;
              return (
                <div
                  key={t.id || t.email || Math.random()}
                  className="card"
                  onClick={() => setSelectedDetailUser({ type: 'teacher', data: t })}
                  style={{
                    padding: '14px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'transform 0.1s ease, box-shadow 0.15s ease'
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h5 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>{t.name || 'Faculty'}</h5>
                    <span style={{ fontSize: '11px', color: 'var(--accent-500)', fontWeight: 600 }}>{t.subject || '—'}</span>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', marginBottom: 0 }}>Batches: {t.batches || '—'}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span className="badge badge-success">{t.status || 'Active'}</span>
                    <ChevronRight size={16} color="var(--text-muted)" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )
    },
    {
      id: 'batches',
      component: (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '18px', paddingBottom: '90px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-900)' }}>Courses ({courses.length})</h3>
            <button
              onClick={() => setShowAddCourseModal(true)}
              className="btn-primary"
              style={{ padding: '6px 14px', fontSize: '12px', gap: '4px' }}
            >
              <Plus size={14} /> Add Course
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(courses || []).map(c => {
              if (!c) return null;
              const courseSubjects = Array.isArray(c.subjects) ? c.subjects : [];
              const courseFaculty = Array.isArray(c.faculty) ? c.faculty : [c.faculty].filter(Boolean);
              return (
                <div
                  key={c.id || c.code || c.name}
                  className="card"
                  onClick={() => setSelectedCourse(c)}
                  style={{
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'transform 0.1s ease, box-shadow 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <span className="badge badge-accent">{c.code || 'COURSE'}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-600)', fontSize: '11.5px', fontWeight: 700 }}>
                      <span>Details & Edit</span>
                      <ChevronRight size={15} />
                    </div>
                  </div>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--brand-900)', margin: '2px 0 6px 0' }}>{c.name || 'Course'}</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                    {courseSubjects.slice(0, 3).map((sub, idx) => (
                      <span key={idx} style={{ fontSize: '10.5px', background: '#f1f5f9', color: 'var(--brand-800)', padding: '2px 7px', borderRadius: '6px', fontWeight: 600 }}>
                        {sub}
                      </span>
                    ))}
                    {courseSubjects.length > 3 && (
                      <span style={{ fontSize: '10.5px', background: '#f8fafc', color: 'var(--text-muted)', padding: '2px 6px', borderRadius: '6px', fontWeight: 600 }}>
                        +{courseSubjects.length - 3} more
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                    Faculty: {courseFaculty.length > 0 ? courseFaculty.join(', ') : '—'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )
    },
    {
      id: 'profile',
      component: (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '18px', paddingBottom: '90px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-900)' }}>Settings & Reports</h3>

          {/* Quick Export Cards */}
          <div className="card" style={{ padding: '16px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>Export Institute Data</h4>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>Download full reports in 1-tap:</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => handleExport('csv')} className="btn-secondary" style={{ flex: 1, fontSize: '11px', padding: '8px' }}>
                <Download size={13} /> CSV
              </button>
              <button onClick={() => handleExport('xlsx')} className="btn-secondary" style={{ flex: 1, fontSize: '11px', padding: '8px' }}>
                <Download size={13} /> Excel
              </button>
              <button onClick={() => handleExport('pdf')} className="btn-primary" style={{ flex: 1, fontSize: '11px', padding: '8px' }}>
                <Download size={13} /> PDF
              </button>
            </div>
            {exportFeedback && (
              <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 600, display: 'block', marginTop: '8px', textAlign: 'center' }}>
                {exportFeedback}
              </span>
            )}
          </div>


          <button
            onClick={onLogout}
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: 'var(--danger)',
              borderRadius: 'var(--radius-lg)',
              padding: '12px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            Log Out from Admin
          </button>
        </div>
      )
    }
  ];

  return (
    <>
      <ScreenSlider
        activeTab={activeTab}
        tabs={adminTabs}
        onNavigate={onNavigate}
        roleKey="admin"
      />

      {/* Add Student Modal */}
      {showAddModal && (
        <div
          className={`modal-backdrop-05s ${isModalClosing ? 'closing' : ''}`}
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseAddModal(); }}
        >
          <div className={`modal-sheet-05s ${isModalClosing ? 'closing' : ''}`} style={{ padding: '24px 20px' }}>
            <div className="sheet-drag-handle" />
            <h4 style={{ fontSize: '17px', fontWeight: 800, margin: '8px 0 16px 0', color: 'var(--brand-900)' }}>Add New Student</h4>
            <form onSubmit={handleAddStudent} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Student Name"
                  value={newStudentName}
                  onChange={e => setNewStudentName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', marginTop: '4px', fontSize: '13px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Email ID</label>
                <input
                  type="email"
                  required
                  placeholder="student@email.com"
                  value={newStudentEmail}
                  onChange={e => setNewStudentEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', marginTop: '4px', fontSize: '13px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Password (visible)</label>
                <input
                  type="text"
                  autoComplete="off"
                  required
                  placeholder="Set login password"
                  value={newStudentPassword}
                  onChange={e => setNewStudentPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', marginTop: '4px', fontSize: '13px', fontFamily: 'monospace' }}
                />
              </div>
                <MobileDropdown
                  label="Course"
                  title="Select Enrolled Course"
                  value={newStudentCourse}
                  onChange={setNewStudentCourse}
                  options={COURSE_OPTIONS}
                  placeholder="Select Course"
                />

              {/* Fee Section (Total Fee & Fees Paid) */}
              <div style={{
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--brand-900)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Fee Details (Connected to Fees)
                  </span>
                  <span style={{ fontSize: '10px', background: '#dbeafe', color: '#1e40af', padding: '1px 6px', borderRadius: '6px', fontWeight: 700 }}>
                    Course Default
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Total Course Fee (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newStudentTotalFee}
                      onChange={e => setNewStudentTotalFee(e.target.value)}
                      placeholder="Total Fee"
                      style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', border: '1px solid var(--border)', marginTop: '3px', fontSize: '12.5px', background: '#ffffff', fontWeight: 700 }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Fees Paid (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newStudentPaidFee}
                      onChange={e => setNewStudentPaidFee(e.target.value)}
                      placeholder="e.g. 10000"
                      style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', border: '1.5px solid #93c5fd', marginTop: '3px', fontSize: '12.5px', background: '#ffffff', fontWeight: 700 }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', paddingTop: '6px', borderTop: '1px solid #e2e8f0' }}>
                  <span>Remaining Balance:</span>
                  <strong style={{
                    color: Math.max(0, (Number(newStudentTotalFee) || 0) - (Number(newStudentPaidFee) || 0)) === 0 ? 'var(--success)' : '#ea580c',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    ₹{Math.max(0, (Number(newStudentTotalFee) || 0) - (Number(newStudentPaidFee) || 0)).toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button type="button" onClick={handleCloseAddModal} className="btn-secondary" style={{ flex: 1, fontSize: '13px', padding: '10px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1, fontSize: '13px', padding: '10px' }}>
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Parent Modal */}
      {showAddParentModal && (
        <div
          className={`modal-backdrop-05s ${isParentModalClosing ? 'closing' : ''}`}
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseAddParentModal(); }}
        >
          <div className={`modal-sheet-05s ${isParentModalClosing ? 'closing' : ''}`} style={{ padding: '24px 20px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="sheet-drag-handle" />
            <h4 style={{ fontSize: '17px', fontWeight: 800, margin: '8px 0 16px 0', color: 'var(--brand-900)' }}>
              Add New Parent
            </h4>
            <form onSubmit={handleAddParent} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Parent Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Gupta"
                  value={newParentName}
                  onChange={e => setNewParentName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', marginTop: '4px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98XXX XXXXX"
                  value={newParentPhone}
                  onChange={e => setNewParentPhone(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', marginTop: '4px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Email Address</label>
                <input
                  type="email"
                  placeholder="parent@example.com"
                  value={newParentEmail}
                  onChange={e => setNewParentEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', marginTop: '4px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Set Parent Password *</label>
                <div style={{ position: 'relative', marginTop: '4px' }}>
                  <input
                    type={showParentPassword ? 'text' : 'password'}
                    required
                    placeholder="Set login password for parent"
                    value={newParentPassword}
                    onChange={e => setNewParentPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 42px 10px 12px',
                      borderRadius: '10px',
                      border: '1px solid var(--border)',
                      fontSize: '13px',
                      fontFamily: showParentPassword ? 'inherit' : 'monospace'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowParentPassword(!showParentPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px'
                    }}
                    title={showParentPassword ? 'Hide password' : 'Show password'}
                  >
                    {showParentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--brand-800)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Linked Student Connection
                  </span>
                  {selectedStudentIdForParent && selectedStudentIdForParent !== 'custom' && (
                    <span className="badge badge-success" style={{ fontSize: '9.5px' }}>✓ Linked</span>
                  )}
                </div>

                <MobileDropdown
                  label="Select Enrolled Student to Auto-Link"
                  title="Choose Enrolled Student"
                  value={selectedStudentIdForParent}
                  onChange={handleSelectStudentForParent}
                  options={[
                    { value: '', label: '-- Choose Existing Student --' },
                    ...students.map(std => ({
                      value: std.id,
                      label: `${std.name} (Roll #${std.roll} • ${std.course})`,
                      badge: std.course
                    })),
                    { value: 'custom', label: '+ Enter New Student Manually' }
                  ]}
                  placeholder="-- Choose Existing Student --"
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Student Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aryan Gupta"
                  value={newParentChildName}
                  onChange={e => {
                    setNewParentChildName(e.target.value);
                    if (selectedStudentIdForParent && selectedStudentIdForParent !== 'custom') {
                      setSelectedStudentIdForParent('custom');
                    }
                  }}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', marginTop: '4px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Student Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. aryan.gupta@conceptacademy.edu"
                  value={newParentChildEmail}
                  onChange={e => setNewParentChildEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', marginTop: '4px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Student Roll Number</label>
                <input
                  type="text"
                  placeholder="e.g. 106"
                  value={newParentChildRoll}
                  onChange={e => setNewParentChildRoll(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', marginTop: '4px', fontSize: '13px' }}
                />
              </div>

                <MobileDropdown
                  label="Course / Stream"
                  title="Select Child Course"
                  value={newParentChildCourse}
                  onChange={setNewParentChildCourse}
                  options={COURSE_OPTIONS}
                  placeholder="Select Course"
                />

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button type="button" onClick={handleCloseAddParentModal} className="btn-secondary" style={{ flex: 1, fontSize: '13px', padding: '10px' }}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingParent}
                  className="btn-primary"
                  style={{
                    flex: 1,
                    fontSize: '13px',
                    padding: '10px',
                    opacity: isSubmittingParent ? 0.65 : 1,
                    cursor: isSubmittingParent ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSubmittingParent ? 'Adding...' : 'Add Parent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Faculty Modal */}
      {showAddFacultyModal && (
        <div
          className={`modal-backdrop-05s ${isFacultyModalClosing ? 'closing' : ''}`}
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseAddFacultyModal(); }}
        >
          <div className={`modal-sheet-05s ${isFacultyModalClosing ? 'closing' : ''}`} style={{ padding: '24px 20px', maxHeight: '88vh', overflowY: 'auto' }}>
            <div className="sheet-drag-handle" />
            <h4 style={{ fontSize: '17px', fontWeight: 800, margin: '8px 0 16px 0', color: 'var(--brand-900)' }}>Add New Faculty</h4>
            <form onSubmit={handleAddFaculty} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Teacher Name"
                  value={newFacultyName}
                  onChange={e => setNewFacultyName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', marginTop: '4px', fontSize: '13px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Email ID</label>
                <input
                  type="email"
                  required
                  placeholder="faculty@email.com"
                  value={newFacultyEmail}
                  onChange={e => setNewFacultyEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', marginTop: '4px', fontSize: '13px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Password</label>
                <input
                  type="password"
                  required
                  placeholder="Set login password"
                  value={newFacultyPassword}
                  onChange={e => setNewFacultyPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', marginTop: '4px', fontSize: '13px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Batch <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(select multiple)</span></label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {BATCH_OPTIONS.map(b => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => toggleFacultyBatch(b)}
                      style={{
                        padding: '5px 11px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 600,
                        border: newFacultyBatches.includes(b) ? '2px solid var(--brand-600)' : '1.5px solid var(--border)',
                        background: newFacultyBatches.includes(b) ? 'var(--brand-50)' : 'transparent',
                        color: newFacultyBatches.includes(b) ? 'var(--brand-700)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      {newFacultyBatches.includes(b) ? '✓ ' : ''}{b}
                    </button>
                  ))}
                </div>
                {newFacultyBatches.length === 0 && <p style={{ fontSize: '11px', color: 'var(--error)', marginTop: '4px' }}>Select at least one batch</p>}
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Subject <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(select multiple)</span></label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {SUBJECT_OPTIONS.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleFacultySubject(s)}
                      style={{
                        padding: '5px 11px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 600,
                        border: newFacultySubjects.includes(s) ? '2px solid var(--accent-500)' : '1.5px solid var(--border)',
                        background: newFacultySubjects.includes(s) ? '#f0f9ff' : 'transparent',
                        color: newFacultySubjects.includes(s) ? 'var(--accent-600)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      {newFacultySubjects.includes(s) ? '✓ ' : ''}{s}
                    </button>
                  ))}
                </div>
                {newFacultySubjects.length === 0 && <p style={{ fontSize: '11px', color: 'var(--error)', marginTop: '4px' }}>Select at least one subject</p>}
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button type="button" onClick={handleCloseAddFacultyModal} className="btn-secondary" style={{ flex: 1, fontSize: '13px', padding: '10px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1, fontSize: '13px', padding: '10px' }}>
                  Add Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {showAddCourseModal && (
        <div
          className={`modal-backdrop-05s ${isCourseModalClosing ? 'closing' : ''}`}
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseAddCourseModal(); }}
        >
          <div className={`modal-sheet-05s ${isCourseModalClosing ? 'closing' : ''}`} style={{ padding: '24px 20px', maxHeight: '88vh', overflowY: 'auto' }}>
            <div className="sheet-drag-handle" />
            <h4 style={{ fontSize: '17px', fontWeight: 800, margin: '8px 0 16px 0', color: 'var(--brand-900)' }}>Add New Course</h4>
            <form onSubmit={handleAddCourse} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Course Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. JEE Main + Advanced"
                  value={newCourseName}
                  onChange={e => setNewCourseName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', marginTop: '4px', fontSize: '13px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Subjects <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(select multiple)</span></label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {SUBJECT_OPTIONS.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleCourseSubject(s)}
                      style={{
                        padding: '5px 11px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 600,
                        border: newCourseSubjects.includes(s) ? '2px solid var(--accent-500)' : '1.5px solid var(--border)',
                        background: newCourseSubjects.includes(s) ? '#f0f9ff' : 'transparent',
                        color: newCourseSubjects.includes(s) ? 'var(--accent-600)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      {newCourseSubjects.includes(s) ? '✓ ' : ''}{s}
                    </button>
                  ))}
                </div>
                {newCourseSubjects.length === 0 && <p style={{ fontSize: '11px', color: 'var(--error)', marginTop: '4px' }}>Select at least one subject</p>}
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Faculty <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(select multiple)</span></label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {FACULTY_OPTIONS.map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => toggleCourseFaculty(f)}
                      style={{
                        padding: '5px 11px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 600,
                        border: newCourseFaculty.includes(f) ? '2px solid var(--brand-600)' : '1.5px solid var(--border)',
                        background: newCourseFaculty.includes(f) ? 'var(--brand-50)' : 'transparent',
                        color: newCourseFaculty.includes(f) ? 'var(--brand-700)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      {newCourseFaculty.includes(f) ? '✓ ' : ''}{f}
                    </button>
                  ))}
                </div>
                {newCourseFaculty.length === 0 && <p style={{ fontSize: '11px', color: 'var(--error)', marginTop: '4px' }}>Select at least one faculty member</p>}
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button type="button" onClick={handleCloseAddCourseModal} className="btn-secondary" style={{ flex: 1, fontSize: '13px', padding: '10px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1, fontSize: '13px', padding: '10px' }}>
                  Add Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Students List Modal ── */}
      {showStudentsModal && (
        <div className={`modal-backdrop-05s ${closingModal === 'students' ? 'closing' : ''}`}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal('students', setShowStudentsModal); }}>
          <div className={`modal-sheet-05s ${closingModal === 'students' ? 'closing' : ''}`}
            style={{ padding: '24px 20px', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>
            <div className="sheet-drag-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h4 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--brand-900)' }}>All Students ({students.length})</h4>
              <button onClick={() => closeModal('students', setShowStudentsModal)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>
            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(students || []).map(s => {
                if (!s) return null;
                return (
                  <div
                    key={s.id || s.roll || Math.random()}
                    className="card"
                    onClick={() => setSelectedDetailUser({ type: 'student', data: s })}
                    style={{
                      padding: '12px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h5 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{s.name || 'Student'}</h5>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Roll #{s.roll || s.rollNumber || '—'} • {s.course || '—'}</span>
                      {s.parentName && (
                        <div style={{ fontSize: '11px', color: 'var(--brand-700)', fontWeight: 600, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          Parent: {s.parentName} ({s.parentPhone || 'Linked'})
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span className="badge badge-success">{s.status || 'Active'}</span>
                      <ChevronRight size={16} color="var(--text-muted)" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Teachers List Modal ── */}
      {showTeachersModal && (
        <div className={`modal-backdrop-05s ${closingModal === 'teachers' ? 'closing' : ''}`}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal('teachers', setShowTeachersModal); }}>
          <div className={`modal-sheet-05s ${closingModal === 'teachers' ? 'closing' : ''}`}
            style={{ padding: '24px 20px', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>
            <div className="sheet-drag-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h4 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--brand-900)' }}>All Faculty ({teachers.length})</h4>
              <button onClick={() => closeModal('teachers', setShowTeachersModal)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>
            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(teachers || []).map(t => {
                if (!t) return null;
                return (
                  <div
                    key={t.id || t.email || Math.random()}
                    className="card"
                    onClick={() => setSelectedDetailUser({ type: 'teacher', data: t })}
                    style={{
                      padding: '12px 14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h5 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{t.name || 'Faculty'}</h5>
                      <span style={{ fontSize: '11px', color: 'var(--accent-500)', fontWeight: 600 }}>{t.subject || '—'}</span>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', marginBottom: 0 }}>Batches: {t.batches || '—'}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span className="badge badge-success">{t.status || 'Active'}</span>
                      <ChevronRight size={16} color="var(--text-muted)" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Notices Modal ── */}
      {showNoticesModal && (
        <div className={`modal-backdrop-05s ${closingModal === 'notices' ? 'closing' : ''}`}
          onClick={(e) => { if (e.target === e.currentTarget) { closeModal('notices', setShowNoticesModal); setShowAddNoticeForm(false); } }}>
          <div className={`modal-sheet-05s ${closingModal === 'notices' ? 'closing' : ''}`}
            style={{ padding: '24px 20px', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
            <div className="sheet-drag-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h4 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--brand-900)', margin: 0 }}>Notices ({notices.length})</h4>
                <span className="badge badge-info" style={{ fontSize: '10px', padding: '2px 8px' }}>Institute Board</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setShowAddNoticeForm(f => !f)}
                  className="btn-primary"
                  style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <Plus size={13} /> {showAddNoticeForm ? 'Close' : 'Add Notice'}
                </button>
                <button
                  type="button"
                  onClick={() => { closeModal('notices', setShowNoticesModal); setShowAddNoticeForm(false); }}
                  style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Scrollable Container for Form and Notices — Prevents any box squeezing or clipping */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '2px' }}>
              {showAddNoticeForm && (
                <form
                  onSubmit={handleAddNotice}
                  style={{
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    padding: '16px',
                    background: 'var(--surface-alt)',
                    borderRadius: '14px',
                    border: '1.5px solid var(--border)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                >
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Notice Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. JEE Advanced Mock Test 03 Scheduled"
                      value={newNoticeTitle}
                      onChange={e => setNewNoticeTitle(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '13px', background: 'var(--surface)' }}
                    />
                  </div>

                  <MobileDropdown
                    label="Notice Category"
                    title="Select Notice Category"
                    value={newNoticeCategory}
                    onChange={setNewNoticeCategory}
                    options={NOTICE_CATEGORIES}
                    placeholder="Choose Category"
                  />

                  {/* Multi-Select Course Selection Dropdown */}
                  <div>
                    <MobileDropdown
                      label="Target Courses (Multi-Select)"
                      title="Select Target Courses"
                      value={newNoticeCourses}
                      onChange={setNewNoticeCourses}
                      options={['All Courses', ...COURSE_OPTIONS]}
                      isMulti={true}
                      placeholder="Select Target Courses..."
                    />
                    <p style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '4px', marginBottom: 0, lineHeight: 1.4 }}>
                      {newNoticeCourses.includes('All Courses') || newNoticeCourses.length === 0
                        ? '📢 Notice will be delivered to students and parents across all courses.'
                        : `🎯 Notice will ONLY be delivered to students & parents enrolled in: ${newNoticeCourses.join(', ')}.`}
                    </p>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Notice Message *
                    </label>
                    <textarea
                      required
                      placeholder="Write comprehensive notice message..."
                      value={newNoticeMsg}
                      onChange={e => setNewNoticeMsg(e.target.value)}
                      rows={3}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '13px', resize: 'none', background: 'var(--surface)' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => setShowAddNoticeForm(false)} className="btn-secondary" style={{ flex: 1, fontSize: '12px', padding: '9px' }}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary" style={{ flex: 1, fontSize: '12px', padding: '9px' }}>
                      Publish Notice
                    </button>
                  </div>
                </form>
              )}

              {/* Notice Cards List — Guaranteed flexShrink: 0 and full content height */}
              {notices.map(n => (
                <div
                  key={n.id}
                  className="card"
                  style={{
                    flexShrink: 0,
                    minHeight: 'fit-content',
                    padding: '14px 16px',
                    borderLeft: `4px solid ${n.priority === 'high' ? '#ef4444' : '#f59e0b'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    background: 'var(--surface)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <h5 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)', flex: 1, margin: 0, lineHeight: 1.35 }}>
                      {n.title}
                    </h5>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                      {n.timestamp}
                    </span>
                  </div>

                  <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, wordBreak: 'break-word' }}>
                    {n.message}
                  </p>

                  {/* Course recipient badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center', marginTop: '2px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', marginRight: '2px' }}>Recipients:</span>
                    {(n.courses || n.targetCourses || ['All Courses']).map((c, idx) => (
                      <span
                        key={idx}
                        className="badge"
                        style={{
                          fontSize: '9.5px',
                          padding: '2px 7px',
                          background: c === 'All Courses' || c === 'All' ? 'var(--surface-alt)' : '#eff6ff',
                          color: c === 'All Courses' || c === 'All' ? 'var(--text-secondary)' : '#1d4ed8',
                          border: c === 'All Courses' || c === 'All' ? '1px solid var(--border)' : '1px solid #bfdbfe'
                        }}
                      >
                        {c === 'All Courses' || c === 'All' ? '🌐 All Courses' : `🎯 ${c}`}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', paddingTop: '6px', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                      {n.date} • <strong style={{ color: 'var(--text-secondary)' }}>{n.category}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteNotice(n.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '3px 6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '11px',
                        borderRadius: '4px'
                      }}
                      title="Delete Notice"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Absent Today Modal ── */}
      {showAbsentModal && !selectedAbsentStudent && (
        <div className={`modal-backdrop-05s ${closingModal === 'absent' ? 'closing' : ''}`}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal('absent', setShowAbsentModal); }}>
          <div className={`modal-sheet-05s ${closingModal === 'absent' ? 'closing' : ''}`}
            style={{ padding: '24px 20px', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>
            <div className="sheet-drag-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexShrink: 0 }}>
              <h4 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--brand-900)' }}>Absent Today ({absentStudents.length})</h4>
              <button onClick={() => closeModal('absent', setShowAbsentModal)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {absentStudents.map(s => (
                <div key={s.id} className="card" style={{ flexShrink: 0, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => setSelectedAbsentStudent(s)}>
                  <div>
                    <h5 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{s.name}</h5>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.course}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="badge" style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}>Absent</span>
                    <ChevronRight size={14} color="var(--text-muted)" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Absent Student Detail Modal ── */}
      {showAbsentModal && selectedAbsentStudent && (
        <div className="modal-backdrop-05s"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedAbsentStudent(null); }}>
          <div className="modal-sheet-05s" style={{ padding: '24px 20px' }}>
            <div className="sheet-drag-handle" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <button onClick={() => setSelectedAbsentStudent(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>‹</button>
              <h4 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--brand-900)' }}>Student Info</h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', color: '#fff', fontWeight: 800 }}>
                {selectedAbsentStudent.name.charAt(0)}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>{selectedAbsentStudent.name}</h3>
              <span className="badge" style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}>Absent Today</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Course', value: selectedAbsentStudent.course },
                { label: 'Email ID', value: selectedAbsentStudent.email },
                { label: 'Phone', value: selectedAbsentStudent.phone },
                { label: "Parent's Phone", value: selectedAbsentStudent.parentPhone },
                { label: 'Blood Group', value: selectedAbsentStudent.bloodGroup },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>{row.label}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Unified Study and Test Material Modal (Study Material, Question Paper, Solutions) ── */}
      <AdminStudyAndTestMaterialModal
        isOpen={showStudyAndTestModal || showMaterialsModal || showTestsModal}
        initialSubCategory={showTestsModal ? 'question_paper' : 'study_material'}
        onClose={() => {
          setShowStudyAndTestModal(false);
          setShowMaterialsModal(false);
          setShowTestsModal(false);
        }}
      />

      {/* ── Timetable Modal ── */}
      <AdminTimetableModal
        isOpen={showTimetableModal}
        onClose={() => setShowTimetableModal(false)}
      />

      {/* ── Attendance Analytics Modal ── */}
      <AdminAttendanceModal
        isOpen={showAttendanceModal}
        onClose={() => setShowAttendanceModal(false)}
      />

      {/* ── Marks Management & Upload Modal ── */}
      <AdminMarksModal
        isOpen={showMarksModal}
        onClose={() => setShowMarksModal(false)}
      />

      {/* ── Fees Management & Alerts Modal ── */}
      <AdminFeesModal
        isOpen={showFeesModal}
        onClose={() => setShowFeesModal(false)}
      />

      {/* ── Student Performance Analytics & Line Graph Modal ── */}
      <AdminStudentPerformanceModal
        isOpen={showPerformanceModal}
        onClose={() => setShowPerformanceModal(false)}
        onOpenMarksModal={() => {
          setShowPerformanceModal(false);
          setShowMarksModal(true);
        }}
      />

      {/* ── User Profile Details Modal (Student / Parent / Teacher) ── */}
      <AdminUserDetailsModal
        isOpen={Boolean(selectedDetailUser)}
        onClose={() => setSelectedDetailUser(null)}
        userType={selectedDetailUser?.type}
        userData={selectedDetailUser?.data}
        onDeleteUser={handleDeleteUserFromModal}
        onSwitchUser={handleSwitchDetailUser}
        onOpenPerformance={handleOpenPerformanceFromModal}
      />

      {/* ── Course Details & Edit Modal ── */}
      <AdminCourseDetailsModal
        isOpen={Boolean(selectedCourse)}
        onClose={() => setSelectedCourse(null)}
        course={selectedCourse}
        onSaveCourse={handleSaveCourse}
        onDeleteCourse={handleDeleteCourse}
        availableFaculty={(Array.isArray(teachers) ? teachers : []).map(t => t?.name).filter(Boolean)}
        enrolledStudentsCount={
          selectedCourse
            ? (students || []).filter(s =>
                s && (
                  s.course === selectedCourse.name ||
                  s.course === selectedCourse.code ||
                  (s.course && String(selectedCourse.name || '').toLowerCase().includes(String(s.course).toLowerCase()))
                )
              ).length
            : 0
        }
      />

      {/* ── Institute Data Export Modal ── */}
      <AdminExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        initialFormat={exportFormat}
      />
      {/* ── Add Universal User Modal (Student, Teacher, Parent, Admin) ── */}
      {showAddUserModal && (
        <div
          className={`modal-backdrop-05s ${isUserModalClosing ? 'closing' : ''}`}
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseAddUserModal(); }}
        >
          <div className={`modal-sheet-05s ${isUserModalClosing ? 'closing' : ''}`} style={{ padding: '24px 20px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="sheet-drag-handle" />
            <h4 style={{ fontSize: '18px', fontWeight: 800, margin: '8px 0 16px 0', color: 'var(--brand-900)' }}>
              Add New User to Institute
            </h4>
            <form onSubmit={handleAddUniversalUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Role Selection */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Assign User Role *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {[
                    { id: 'student', label: 'Student', icon: '🎓' },
                    { id: 'teacher', label: 'Teacher', icon: '👨‍🏫' },
                    { id: 'parent', label: 'Parent', icon: '👨‍👩‍👧' },
                    { id: 'admin', label: 'Admin', icon: '🛡️' }
                  ].map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setNewUserRole(r.id)}
                      style={{
                        padding: '10px 4px',
                        borderRadius: '10px',
                        border: newUserRole === r.id ? '2px solid var(--brand-700)' : '1px solid var(--border)',
                        background: newUserRole === r.id ? 'var(--brand-50)' : 'var(--surface)',
                        color: newUserRole === r.id ? 'var(--brand-900)' : 'var(--text-secondary)',
                        fontWeight: newUserRole === r.id ? 800 : 500,
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px',
                        transition: 'all 0.15s'
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>{r.icon}</span>
                      <span>{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', marginTop: '4px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Email ID (Login Username) *</label>
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', marginTop: '4px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Password *</label>
                <input
                  type="text"
                  autoComplete="off"
                  required
                  placeholder="Login password"
                  value={newUserPassword}
                  onChange={e => setNewUserPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', marginTop: '4px', fontSize: '13px', fontFamily: 'monospace' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98XXX XXXXX"
                  value={newUserPhone}
                  onChange={e => setNewUserPhone(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', marginTop: '4px', fontSize: '13px' }}
                />
              </div>

              {newUserRole === 'student' && (
                <>
                  <MobileDropdown
                    label="Enrolled Course"
                    title="Select Student Course"
                    value={newUserCourse}
                    onChange={setNewUserCourse}
                    options={COURSE_OPTIONS}
                    placeholder="Select Course"
                  />

                  {/* Fee Section (Total Fee & Fees Paid) */}
                  <div style={{
                    background: '#f8fafc',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--brand-900)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Fee Details (Connected to Fees)
                      </span>
                      <span style={{ fontSize: '10px', background: '#dbeafe', color: '#1e40af', padding: '1px 6px', borderRadius: '6px', fontWeight: 700 }}>
                        Course Default
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          Total Course Fee (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={newUserTotalFee}
                          onChange={e => setNewUserTotalFee(e.target.value)}
                          placeholder="Total Fee"
                          style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', border: '1px solid var(--border)', marginTop: '3px', fontSize: '12.5px', background: '#ffffff', fontWeight: 700 }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          Fees Paid (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={newUserPaidFee}
                          onChange={e => setNewUserPaidFee(e.target.value)}
                          placeholder="e.g. 10000"
                          style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', border: '1.5px solid #93c5fd', marginTop: '3px', fontSize: '12.5px', background: '#ffffff', fontWeight: 700 }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', paddingTop: '6px', borderTop: '1px solid #e2e8f0' }}>
                      <span>Remaining Balance:</span>
                      <strong style={{
                        color: Math.max(0, (Number(newUserTotalFee) || 0) - (Number(newUserPaidFee) || 0)) === 0 ? 'var(--success)' : '#ea580c',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        ₹{Math.max(0, (Number(newUserTotalFee) || 0) - (Number(newUserPaidFee) || 0)).toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>
                </>
              )}

              {newUserRole === 'teacher' && (
                <>
                  <MobileDropdown
                    label="Assigned Batches (Multi-Select)"
                    title="Select Faculty Batches"
                    value={newUserBatches}
                    onChange={setNewUserBatches}
                    options={BATCH_OPTIONS}
                    isMulti={true}
                    placeholder="Select Batches..."
                  />
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Subjects Taught</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                      {SUBJECT_OPTIONS.slice(0, 10).map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleUserSubject(s)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '16px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            border: newUserSubjects.includes(s) ? '2px solid var(--accent-500)' : '1px solid var(--border)',
                            background: newUserSubjects.includes(s) ? '#f0f9ff' : 'transparent',
                            color: newUserSubjects.includes(s) ? 'var(--accent-600)' : 'var(--text-secondary)',
                            cursor: 'pointer'
                          }}
                        >
                          {newUserSubjects.includes(s) ? '✓ ' : ''}{s}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {newUserRole === 'parent' && (
                <>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Linked Student Name</label>
                    <input
                      type="text"
                      placeholder="Student full name"
                      value={newUserChildName}
                      onChange={e => setNewUserChildName(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', marginTop: '4px', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Student Roll #</label>
                    <input
                      type="text"
                      placeholder="e.g. 101"
                      value={newUserChildRoll}
                      onChange={e => setNewUserChildRoll(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', marginTop: '4px', fontSize: '13px' }}
                    />
                  </div>
                </>
              )}

              {newUserRole === 'admin' && (
                <div style={{ padding: '10px 12px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                  <span style={{ fontSize: '11.5px', color: '#1e40af', fontWeight: 600 }}>
                    🛡️ Admin users have complete access to institute governance, students, faculty, timetables, and marks.
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button type="button" onClick={handleCloseAddUserModal} className="btn-secondary" style={{ flex: 1, fontSize: '13px', padding: '10px' }}>
                  Cancel
                </button>
                <button type="submit" disabled={isSubmittingUser} className="btn-primary" style={{ flex: 1, fontSize: '13px', padding: '10px' }}>
                  {isSubmittingUser ? 'Saving...' : 'Save & Store in Supabase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
