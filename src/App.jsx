import React, { useState, useEffect, useRef } from 'react';
import { App as CapApp } from '@capacitor/app';
import { mockUsers, DEFAULT_GREY_AVATAR } from './lib/mockData';
import Header from './components/common/Header';
import BottomNav from './components/common/BottomNav';
import ProtectedPdfViewer from './components/common/ProtectedPdfViewer';
import ScreenSlider from './components/common/ScreenSlider';
import LoginModal from './components/auth/LoginModal';
import NotificationsModal from './components/common/NotificationsModal';
import PermissionsModal from './components/common/PermissionsModal';
import OpeningScreen from './components/common/OpeningScreen';
import GlobalMobileAlertModal from './components/common/GlobalMobileAlertModal';
import { isFirstLaunch } from './lib/permissions';
import { Browser } from '@capacitor/browser';
import { supabase } from './lib/supabaseClient';
import ErrorBoundary from './components/common/ErrorBoundary';
import { TopLoadingBar } from './components/common/LoadingSkeleton';
import { sendSystemNotification, subscribeToNoticeBroadcasts, fetchNoticesFromCloud } from './lib/notificationService';
import { useDataSync } from './lib/syncEvents';

// Student Views
import StudentHome from './components/student/StudentHome';
import Timetable from './components/student/Timetable';
import StudyMaterial from './components/student/StudyMaterial';
import TestsView from './components/student/TestsView';
import StudentProfile from './components/student/StudentProfile';

// Teacher Views
import TeacherDashboard from './components/teacher/TeacherDashboard';
import MyBatches from './components/teacher/MyBatches';
import CreateTestModal from './components/teacher/CreateTestModal';
import TeacherPerformance from './components/teacher/TeacherPerformance';

// Parent Views
import ParentHome from './components/parent/ParentHome';
import AttendanceCalendar from './components/parent/AttendanceCalendar';
import ParentPerformance from './components/parent/ParentPerformance';
import ParentFees from './components/parent/ParentFees';

// Admin View (100% Mobile)
import AdminMobileDashboard from './components/admin/AdminMobileDashboard';
import { useSystemNavigation } from './lib/systemNavigation';

export default function App() {
  useSystemNavigation();
  const [currentRole, setCurrentRole] = useState(() => {
    try {
      return localStorage.getItem('concept_academy_user_role') || localStorage.getItem('aspire_user_role') || 'admin';
    } catch (e) {
      return 'admin';
    }
  });
  const [activeTab, setActiveTab] = useState('home');
  const [tabHistory, setTabHistory] = useState(['home']);
  const tabHistoryRef = useRef(['home']);
  useEffect(() => {
    tabHistoryRef.current = tabHistory;
  }, [tabHistory]);
  const [isTabLoading, setIsTabLoading] = useState(false);

  const handleTabChange = (newTab, isBack = false) => {
    if (!newTab) return;
    if (newTab !== activeTab) {
      setIsTabLoading(true);
      setActiveTab(newTab);
      setTimeout(() => {
        setIsTabLoading(false);
      }, 250);

      if (!isBack) {
        setTabHistory(prev => {
          if (newTab === 'home') {
            return ['home'];
          }
          if (prev[prev.length - 1] === newTab) return prev;
          return [...prev, newTab];
        });
        try {
          window.history.pushState({ tab: newTab }, '');
        } catch (e) {}
      }
    }
  };

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCreateTestOpen, setIsCreateTestOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [notices, setNotices] = useState(() => {
    try {
      const saved = localStorage.getItem('concept_academy_notices_list') || localStorage.getItem('aspire_notices_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Completely purge any legacy mock notices (n-1, n-2, n-3, etc)
          const filtered = parsed.filter(n => n && !String(n.id).startsWith('n-'));
          return filtered.map(n => ({
            ...n,
            courses: n.courses || n.targetCourses || ['All Courses']
          }));
        }
      }
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    try {
      const json = JSON.stringify(notices);
      localStorage.setItem('concept_academy_notices_list', json);
      localStorage.setItem('aspire_notices_list', json);
    } catch (e) {}
  }, [notices]);

  useDataSync(['notices'], () => {
    try {
      const saved = localStorage.getItem('concept_academy_notices_list') || localStorage.getItem('aspire_notices_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(n => n && !String(n.id).startsWith('n-'));
          setNotices(filtered.map(n => ({
            ...n,
            courses: n.courses || n.targetCourses || ['All Courses']
          })));
        }
      }
    } catch (e) {}
  });

  const [pdfViewerData, setPdfViewerData] = useState(null);

  // Authentication & Opening Screen States
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      const saved = localStorage.getItem('concept_academy_is_logged_in') ?? localStorage.getItem('aspire_is_logged_in');
      if (saved !== null) return saved === 'true';
      return false;
    } catch (e) {
      return false;
    }
  });

  const [showOpeningScreen, setShowOpeningScreen] = useState(true);
  const [isLandingFade, setIsLandingFade] = useState(false);

  // Profile loading & saving helper for Students, Teachers & Parents
  const getUserForRole = (role) => {
    const base = mockUsers[role] || mockUsers.admin;
    try {
      const saved = localStorage.getItem(`concept_academy_${role}_profile`) || localStorage.getItem(`aspire_${role}_profile`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...base,
          ...parsed,
          avatar: parsed.avatar || base.avatar || DEFAULT_GREY_AVATAR
        };
      }
    } catch (e) {
      console.error(e);
    }
    return { ...base, avatar: base.avatar || DEFAULT_GREY_AVATAR };
  };

  // Active user profile matching current role (persists when logged in)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedAuth = localStorage.getItem('concept_academy_is_logged_in') ?? localStorage.getItem('aspire_is_logged_in');
      if (savedAuth === 'true') {
        const savedRole = localStorage.getItem('concept_academy_user_role') || localStorage.getItem('aspire_user_role') || 'admin';
        return getUserForRole(savedRole);
      }
    } catch (e) {}
    return null;
  });

  const handleUpdateAvatar = (newAvatar) => {
    const userKey = currentUser?.id || currentUser?.email;
    if (userKey) {
      try {
        localStorage.setItem(`concept_academy_avatar_${userKey}`, newAvatar);
        localStorage.setItem(`aspire_avatar_${userKey}`, newAvatar);
      } catch (e) {
        console.error(e);
      }
    }
    setCurrentUser(prev => prev ? { ...prev, avatar: newAvatar } : prev);
  };

  // Update & persist personal details for any role (Student, Teacher, Parent)
  const handleUpdateUser = (updatedData) => {
    setCurrentUser(prev => {
      const updated = { ...prev, ...updatedData };
      try {
        const profStr = JSON.stringify(updated);
        localStorage.setItem(`concept_academy_${currentRole}_profile`, profStr);
        localStorage.setItem(`aspire_${currentRole}_profile`, profStr);
        if (updated.course) {
          localStorage.setItem('concept_academy_user_course', updated.course);
          localStorage.setItem('aspire_user_course', updated.course);
        }
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const [classesSubTab, setClassesSubTab] = useState('schedule');

  // Normalize course strings across all variations (JEE, NEET, MHT-CET, 9th, 10th, 11th, 12th)
  const normalizeCourse = (raw) => {
    if (!raw || typeof raw !== 'string') return '';
    const s = raw.trim().toLowerCase();

    // Specific competitive exams
    if (s.includes('jee')) return 'jee';
    if (s.includes('neet')) return 'neet';
    if (s.includes('mht') || s.includes('cet')) return 'mht-cet';

    // Standard school grades
    if (s.includes('9th') || s === '9' || s.includes('std 9') || s.includes('class 9')) return '9th';
    if (s.includes('10th') || s === '10' || s.includes('std 10') || s.includes('class 10')) return '10th';
    if (s.includes('11th') || s === '11' || s.includes('std 11') || s.includes('class 11')) return '11th';
    if (s.includes('12th') || s === '12' || s.includes('std 12') || s.includes('class 12')) return '12th';

    return s.replace(/[^a-z0-9]/g, '');
  };

  // Filter notices strictly based on role and enrolled course
  const isNoticeForUser = (notice, user, role) => {
    if (!notice) return false;
    // Admins and teachers see all institute notices
    if (role === 'admin' || role === 'teacher') return true;

    const targetCourses = notice.courses || notice.targetCourses;
    // If no course restriction or set to All Courses, visible to everyone
    if (!targetCourses || !Array.isArray(targetCourses) || targetCourses.length === 0) return true;
    if (targetCourses.some(t => {
      const s = String(t).trim().toLowerCase();
      return s === 'all' || s === 'all courses' || s === 'all batches';
    })) {
      return true;
    }

    // Resolve user course strictly for students and parents
    let userCourse = null;
    if (role === 'student') {
      userCourse = user?.course || user?.enrolledCourse;
      if (!userCourse) {
        try {
          const savedProfile = JSON.parse(localStorage.getItem('concept_academy_student_profile') || localStorage.getItem('aspire_student_profile') || '{}');
          userCourse = savedProfile.course;
        } catch (e) {}
      }
      if (!userCourse) {
        userCourse = localStorage.getItem('concept_academy_user_course') || localStorage.getItem('aspire_user_course') || 'JEE';
      }
    } else if (role === 'parent') {
      userCourse = user?.linkedChild?.course || user?.linkedChild?.class || user?.linkedChildCourse || user?.course;
      if (!userCourse) {
        try {
          const savedProfile = JSON.parse(localStorage.getItem('concept_academy_parent_profile') || localStorage.getItem('aspire_parent_profile') || '{}');
          userCourse = savedProfile.linkedChild?.course || savedProfile.linkedChild?.class || savedProfile.linkedChildCourse || savedProfile.course;
        } catch (e) {}
      }
      if (!userCourse) {
        userCourse = localStorage.getItem('concept_academy_parent_child_course') || localStorage.getItem('aspire_parent_child_course') || localStorage.getItem('concept_academy_user_course') || localStorage.getItem('aspire_user_course') || 'JEE';
      }
    }

    if (!userCourse) return false;

    const userCoursesArray = Array.isArray(userCourse) ? userCourse : [userCourse];
    const normalizedUserCourses = userCoursesArray.map(normalizeCourse).filter(Boolean);

    if (normalizedUserCourses.length === 0) return false;

    return targetCourses.some(target => {
      const normTarget = normalizeCourse(target);
      return normalizedUserCourses.includes(normTarget);
    });
  };

  const visibleNotices = notices.filter(n => isNoticeForUser(n, currentUser, currentRole));
  const unreadNoticesCount = visibleNotices.filter(n => !n.read).length;

  const handleMarkAllNoticesRead = () => {
    setNotices(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNoticeClick = (id) => {
    setNotices(prev => prev.map(n => n.id === id ? ({ ...n, read: true }) : n));
  };

  // Teacher submits attendance → generate live notifications for parents & students
  const handleAttendanceSubmit = ({ batchName, subject, time, students }) => {
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const newNotifs = students.map(s => {
      const isAbsent = s.status === 'Absent';
      return {
        id: `att-${s.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: isAbsent ? `⚠️ Attendance Alert: ${s.name} Absent` : `✅ Attendance: ${s.name} Present`,
        message: isAbsent
          ? `Parent Alert: ${s.name} was marked ABSENT for today's ${time} ${subject} class (${batchName}). Please contact institute if this is an error.`
          : `${s.name} attended today's ${time} ${subject} class (${batchName}). Marked by faculty.`,
        category: 'Attendance',
        priority: isAbsent ? 'high' : 'normal',
        timestamp: 'Just now',
        date: today,
        read: false
      };
    });
    setNotices(prev => [...newNotifs, ...prev]);
  };

  // Listen for admin attendance corrections
  useEffect(() => {
    const handleAttendanceChange = (e) => {
      if (e.detail?.updatedBy === 'admin') {
        const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        const { studentId, newStatus } = e.detail;
        setNotices(prev => [{
          id: `admin-att-${studentId}-${Date.now()}`,
          title: `Attendance Corrected by Admin`,
          message: `Attendance status for student #${studentId} was updated to ${newStatus} by Institute Admin.`,
          category: 'Attendance',
          priority: 'normal',
          timestamp: 'Just now',
          date: today,
          read: false
        }, ...prev]);
      }
    };
    window.addEventListener('concept_academy:attendance-updated', handleAttendanceChange);
    window.addEventListener('aspire:attendance-updated', handleAttendanceChange);
    return () => {
      window.removeEventListener('concept_academy:attendance-updated', handleAttendanceChange);
      window.removeEventListener('aspire:attendance-updated', handleAttendanceChange);
    };
  }, []);

  // Listen for admin fee alerts and add notice to notifications board
  useEffect(() => {
    const handleFeeAlert = (e) => {
      if (e.detail?.notice) {
        setNotices(prev => [e.detail.notice, ...prev.filter(n => n.id !== e.detail.notice.id)]);
        sendSystemNotification({
          title: `🔔 ${e.detail.notice.title || 'Fee Alert'}`,
          message: e.detail.notice.message || 'Fee account status update.',
          id: e.detail.notice.id
        });
      }
    };
    window.addEventListener('concept_academy:fee-alert', handleFeeAlert);
    window.addEventListener('aspire:fee-alert', handleFeeAlert);
    return () => {
      window.removeEventListener('concept_academy:fee-alert', handleFeeAlert);
      window.removeEventListener('aspire:fee-alert', handleFeeAlert);
    };
  }, []);

  // Listen for live broadcast notices from Admin (instant cross-device Supabase Realtime + Cloud sync)
  useEffect(() => {
    // Helper to safely trigger notification if user is student/parent and not alerted yet
    const notifyIfApplicable = (notice) => {
      if (!notice) return;
      const activeRole = localStorage.getItem('concept_academy_user_role') || localStorage.getItem('aspire_user_role') || currentRole || 'student';
      if (activeRole === 'admin') return; // Admins don't get popup notifications for notices

      const activeUser = currentUser || getUserForRole(activeRole);
      const applies = isNoticeForUser(notice, activeUser, activeRole);
      if (!applies) return;

      try {
        const alerted = JSON.parse(localStorage.getItem('concept_academy_alerted_notices') || localStorage.getItem('aspire_alerted_notices') || '[]');
        if (!alerted.includes(notice.id)) {
          alerted.push(notice.id);
          const alertedJson = JSON.stringify(alerted.slice(-80));
          localStorage.setItem('concept_academy_alerted_notices', alertedJson);
          localStorage.setItem('aspire_alerted_notices', alertedJson);
          sendSystemNotification({
            title: `📢 ${notice.title || 'Concept Academy Notice'}`,
            message: notice.message || 'New announcement posted by Institute Admin.',
            id: notice.id
          });
        }
      } catch (e) {
        sendSystemNotification({
          title: `📢 ${notice.title || 'Concept Academy Notice'}`,
          message: notice.message || 'New announcement posted by Institute Admin.',
          id: notice.id
        });
      }
    };

    // 1. Supabase Realtime broadcast listener (instant push to other devices)
    const unsubscribe = subscribeToNoticeBroadcasts((incomingNotice) => {
      setNotices(prev => {
        if (prev.some(n => n.id === incomingNotice.id)) return prev;
        return [incomingNotice, ...prev];
      });
      notifyIfApplicable(incomingNotice);
    });

    // 2. Fetch from Supabase Cloud on load and on interval (for offline/newly opened devices)
    const syncCloud = async () => {
      try {
        const cloudNotices = await fetchNoticesFromCloud();
        if (cloudNotices && cloudNotices.length > 0) {
          setNotices(prev => {
            const existingIds = new Set(prev.map(n => n.id));
            const newOnes = cloudNotices.filter(cn => !existingIds.has(cn.id));
            if (newOnes.length === 0) return prev;
            newOnes.forEach(n => notifyIfApplicable(n));
            return [...newOnes, ...prev];
          });
        }
      } catch (err) {
        console.warn('[App] syncCloud error:', err);
      }
    };

    syncCloud();
    const pollInterval = setInterval(syncCloud, 12000); // 12-second background sync fallback
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') syncCloud();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // 3. LocalStorage storage event for multi-tab on same machine
    const handleStorageChange = (e) => {
      if ((e.key === 'concept_academy_notices_list' || e.key === 'aspire_notices_list') && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setNotices(parsed);
          }
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      unsubscribe();
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentUser, currentRole]);

  // State refs for the back button listener to prevent stale closures
  // State refs for the back button listener to prevent stale closures
  const activeTabRef = useRef(activeTab);
  const isLoginOpenRef = useRef(isLoginOpen);
  const isCreateTestOpenRef = useRef(isCreateTestOpen);
  const isNotificationsOpenRef = useRef(isNotificationsOpen);
  const isPermissionsOpenRef = useRef(isPermissionsOpen);
  const pdfViewerDataRef = useRef(pdfViewerData);
  const showOpeningScreenRef = useRef(showOpeningScreen);
  const isLoggedInRef = useRef(isLoggedIn);
  const lastBackHandledTimeRef = useRef(0);
  const lastExitTapTimeRef = useRef(0);
  const [backToastMessage, setBackToastMessage] = useState('');

  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);
  useEffect(() => { isLoginOpenRef.current = isLoginOpen; }, [isLoginOpen]);
  useEffect(() => { isCreateTestOpenRef.current = isCreateTestOpen; }, [isCreateTestOpen]);
  useEffect(() => { isNotificationsOpenRef.current = isNotificationsOpen; }, [isNotificationsOpen]);
  useEffect(() => { isPermissionsOpenRef.current = isPermissionsOpen; }, [isPermissionsOpen]);
  useEffect(() => { pdfViewerDataRef.current = pdfViewerData; }, [pdfViewerData]);
  useEffect(() => { showOpeningScreenRef.current = showOpeningScreen; }, [showOpeningScreen]);
  useEffect(() => { isLoggedInRef.current = isLoggedIn; }, [isLoggedIn]);

  // First-time download/launch check: automatically prompt for mobile device permissions once entered
  useEffect(() => {
    if (isFirstLaunch() && !showOpeningScreen && isLoggedIn) {
      const timer = setTimeout(() => {
        setIsPermissionsOpen(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [showOpeningScreen, isLoggedIn]);



  // Unified Android hardware & swipe-gesture back navigation
  useEffect(() => {
    const handleBackNavigation = () => {
      const now = Date.now();
      // 1. Throttle rapid duplicate events (e.g. Capacitor backButton + WebView popstate within 380ms)
      if (now - lastBackHandledTimeRef.current < 380) {
        return;
      }
      lastBackHandledTimeRef.current = now;

      // 2. Give child modals, sheets, or drill-downs first priority to close
      let handledByChild = false;
      const event = new CustomEvent('app:back', {
        cancelable: true,
        detail: {
          markHandled: () => { handledByChild = true; }
        }
      });
      window.dispatchEvent(event);
      if (handledByChild) {
        lastExitTapTimeRef.current = 0;
        return;
      }

      // 3. Global in-app modals / overlays
      if (isPermissionsOpenRef.current) {
        setIsPermissionsOpen(false);
        lastExitTapTimeRef.current = 0;
        return;
      }
      if (pdfViewerDataRef.current) {
        setPdfViewerData(null);
        lastExitTapTimeRef.current = 0;
        return;
      }
      if (isNotificationsOpenRef.current) {
        setIsNotificationsOpen(false);
        lastExitTapTimeRef.current = 0;
        return;
      }
      if (isCreateTestOpenRef.current) {
        setIsCreateTestOpen(false);
        lastExitTapTimeRef.current = 0;
        return;
      }
      if (isLoginOpenRef.current) {
        setIsLoginOpen(false);
        lastExitTapTimeRef.current = 0;
        return;
      }

      // 4. Welcome / Opening screen
      if (showOpeningScreenRef.current) {
        if (isLoggedInRef.current) {
          setShowOpeningScreen(false);
          setActiveTab('home');
          setTabHistory(['home']);
          tabHistoryRef.current = ['home'];
          lastExitTapTimeRef.current = 0;
          return;
        } else {
          if (now - lastExitTapTimeRef.current < 2000) {
            try {
              CapApp.exitApp();
            } catch (err) {}
          } else {
            lastExitTapTimeRef.current = now;
            setBackToastMessage('Press back again to exit');
            setTimeout(() => setBackToastMessage(''), 2000);
          }
          return;
        }
      }

      // 5. UNWIND SCREEN NAVIGATION HISTORY STEP BY STEP:
      // "When a user backs from a screen he/she will be directed to it's previous screen from where they came.
      // It will go on until the user hits the home screen at the very end and then the app will close."
      const currentStack = tabHistoryRef.current;
      if (currentStack && currentStack.length > 1) {
        const newStack = [...currentStack];
        newStack.pop();
        const prevScreen = newStack[newStack.length - 1] || 'home';

        tabHistoryRef.current = newStack;
        setTabHistory(newStack);

        handleTabChange(prevScreen, true);
        lastExitTapTimeRef.current = 0;
        return;
      }

      // Safety check: if user is not on 'home' but stack length <= 1
      if (activeTabRef.current !== 'home') {
        const homeStack = ['home'];
        tabHistoryRef.current = homeStack;
        setTabHistory(homeStack);
        handleTabChange('home', true);
        lastExitTapTimeRef.current = 0;
        return;
      }

      // 6. User has reached the HOME screen at the very end:
      // Safe exit only after pressing back a second time within 2 seconds
      if (now - lastExitTapTimeRef.current < 2000) {
        try {
          CapApp.exitApp();
        } catch (err) {
          // Web browser fallback
        }
      } else {
        lastExitTapTimeRef.current = now;
        setBackToastMessage('Press back again to exit');
        setTimeout(() => setBackToastMessage(''), 2000);
      }
    };

    // Native Capacitor back button (handles hardware back button + Android gesture back)
    let capBackListener = null;
    try {
      CapApp.addListener('backButton', () => {
        handleBackNavigation();
      }).then(listener => {
        capBackListener = listener;
      }).catch(() => {});
    } catch (e) {}

    // Web / browser popstate listener (for browser back button / swipe back)
    const handlePopState = () => {
      handleBackNavigation();
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      if (capBackListener && capBackListener.remove) {
        capBackListener.remove();
      }
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);


  const handleStudentNavigate = (tab) => {
    if (tab === 'attendance') {
      setClassesSubTab('attendance');
      handleTabChange('classes');
    } else if (tab === 'classes') {
      setClassesSubTab('schedule');
      handleTabChange('classes');
    } else {
      handleTabChange(tab);
    }
  };

  const handleLoginSuccess = (userAuth) => {
    const base = mockUsers[userAuth.role] || mockUsers.student;
    const userIdentifier = userAuth.id || userAuth.email;
    let userAvatar = userAuth.avatar;
    if (!userAvatar && userIdentifier) {
      try {
        userAvatar = localStorage.getItem(`concept_academy_avatar_${userIdentifier}`) || localStorage.getItem(`aspire_avatar_${userIdentifier}`);
      } catch (e) {}
    }
    if (!userAvatar) {
      userAvatar = base.avatar || DEFAULT_GREY_AVATAR;
    }

    let matched = {
      ...base,
      id: userAuth.id || base.id,
      name: userAuth.name || base.name,
      email: userAuth.email || base.email,
      phone: userAuth.phone !== undefined ? userAuth.phone : '',
      bloodGroup: userAuth.bloodGroup !== undefined ? userAuth.bloodGroup : '',
      role: userAuth.role || 'student',
      course: userAuth.course || base.course || 'JEE',
      rollNumber: userAuth.rollNumber || base.rollNumber,
      avatar: userAvatar
    };
    if (matched.course) {
      try {
        localStorage.setItem('concept_academy_user_course', matched.course);
        localStorage.setItem('aspire_user_course', matched.course);
      } catch (e) {}
    }
    setCurrentRole(userAuth.role);
    setCurrentUser(matched);
    setIsLoggedIn(true);
    try {
      localStorage.setItem('concept_academy_is_logged_in', 'true');
      localStorage.setItem('aspire_is_logged_in', 'true');
      localStorage.setItem('concept_academy_user_role', userAuth.role);
      localStorage.setItem('aspire_user_role', userAuth.role);
      const profJson = JSON.stringify(matched);
      localStorage.setItem(`concept_academy_${userAuth.role}_profile`, profJson);
      localStorage.setItem(`aspire_${userAuth.role}_profile`, profJson);
    } catch (e) {}
    setActiveTab('home');
    setTabHistory(['home']);
    tabHistoryRef.current = ['home'];
    setShowOpeningScreen(false);
    setIsLandingFade(true);
    setTimeout(() => {
      setIsLandingFade(false);
    }, 850);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('concept_academy_is_logged_in');
      localStorage.removeItem('aspire_is_logged_in');
    } catch (e) {}
    setIsLoggedIn(false);
    setCurrentUser(null);
    setShowOpeningScreen(true);
    setIsLoginOpen(false);
    setActiveTab('home');
    setTabHistory(['home']);
    tabHistoryRef.current = ['home'];
  };

  // Mobile OAuth redirect deep link listener (com.conceptacademy.learning://auth#access_token=...)
  useEffect(() => {
    let urlListener = null;

    const initOAuthListener = async () => {
      try {
        urlListener = await CapApp.addListener('appUrlOpen', async (data) => {
          try {
            await Browser.close();
          } catch (e) {}

          const rawUrl = data?.url;
          if (!rawUrl) return;

          // Parse hash fragment from OAuth callback
          if (rawUrl.includes('access_token')) {
            const hashIndex = rawUrl.indexOf('#');
            if (hashIndex !== -1) {
              const hash = rawUrl.substring(hashIndex + 1);
              const params = new URLSearchParams(hash);
              const accessToken = params.get('access_token');
              const refreshToken = params.get('refresh_token');

              if (accessToken) {
                const { data: sessionData, error: sessionErr } = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken || ''
                });

                if (!sessionErr && sessionData?.user) {
                  const userMeta = sessionData.user.user_metadata || {};
                  handleLoginSuccess({
                    id: sessionData.user.id,
                    email: sessionData.user.email,
                    role: userMeta.role || 'student',
                    name: userMeta.full_name || sessionData.user.email?.split('@')[0] || 'Concept Academy User',
                    course: userMeta.course || 'JEE'
                  });
                }
              }
            }
          }
        });
      } catch (err) {
        console.error('Deep link listener error:', err);
      }
    };

    initOAuthListener();

    // Supabase auth state change subscription
    const { data: authSub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        const currentSavedRole = localStorage.getItem('concept_academy_user_role') || localStorage.getItem('aspire_user_role');
        const currentSavedLoggedIn = localStorage.getItem('concept_academy_is_logged_in') ?? localStorage.getItem('aspire_is_logged_in');
        const userMeta = session.user.user_metadata || {};
        const incomingRole = userMeta.role || 'student';

        // Retain active Admin session; ignore background auth changes from created students/teachers/parents
        if (currentSavedLoggedIn === 'true' && currentSavedRole === 'admin' && incomingRole !== 'admin') {
          console.info('[Concept Academy] Retaining active Admin session; ignoring background auth event for:', session.user.email);
          return;
        }

        try {
          await Browser.close();
        } catch (e) {}
        handleLoginSuccess({
          id: session.user.id,
          email: session.user.email,
          role: incomingRole,
          name: userMeta.full_name || session.user.email?.split('@')[0] || 'Concept Academy User',
          course: userMeta.course || 'JEE'
        });
      }
    });

    return () => {
      if (urlListener && urlListener.remove) {
        urlListener.remove();
      }
      if (authSub?.subscription) {
        authSub.subscription.unsubscribe();
      }
    };
  }, []);

  // Student Screens (5 Tabs matching BottomNav)
  const studentTabs = [
    {
      id: 'home',
      component: (
        <StudentHome
          user={currentUser || mockUsers.student}
          onNavigate={handleStudentNavigate}
          onOpenTestPaper={(paper) => setPdfViewerData(paper)}
        />
      )
    },
    {
      id: 'classes',
      component: (
        <Timetable initialSubTab={classesSubTab} />
      )
    },
    {
      id: 'tests',
      component: (
        <TestsView onOpenTestPaper={(paper) => setPdfViewerData(paper)} />
      )
    },
    {
      id: 'materials',
      component: (
        <StudyMaterial onOpenViewer={(paper) => setPdfViewerData(paper)} />
      )
    },
    {
      id: 'profile',
      component: (
        <StudentProfile
          user={currentUser || mockUsers.student}
          onLogout={handleLogout}
          onUpdateAvatar={handleUpdateAvatar}
          onUpdateUser={handleUpdateUser}
          onOpenPermissions={() => setIsPermissionsOpen(true)}
        />
      )
    }
  ];

  // Teacher Screens (4 Tabs matching BottomNav)
  const teacherTabs = [
    {
      id: 'home',
      component: (
        <TeacherDashboard
          user={currentUser || mockUsers.teacher}
          onNavigate={handleTabChange}
          onOpenCreateTest={() => setIsCreateTestOpen(true)}
          onOpenUploadMaterial={() => setPdfViewerData({ title: 'Physics Chapter 1 Notes', subtitle: 'Upload & Preview Desk' })}
        />
      )
    },
    {
      id: 'batches',
      component: (
        <MyBatches
          onSelectBatch={() => handleTabChange('performance')}
          onAttendanceSubmit={handleAttendanceSubmit}
        />
      )
    },
    {
      id: 'performance',
      component: (
        <TeacherPerformance />
      )
    },
    {
      id: 'profile',
      component: (
        <StudentProfile
          user={currentUser || mockUsers.teacher}
          onLogout={handleLogout}
          onUpdateUser={handleUpdateUser}
          onOpenPermissions={() => setIsPermissionsOpen(true)}
        />
      )
    }
  ];

  // Parent Screens (5 Tabs matching BottomNav)
  const parentTabs = [
    {
      id: 'home',
      component: (
        <ParentHome
          user={currentUser || mockUsers.parent}
          onNavigate={handleTabChange}
          onOpenTestPaper={(paper) => setPdfViewerData(paper)}
        />
      )
    },
    {
      id: 'child',
      component: (
        <AttendanceCalendar />
      )
    },
    {
      id: 'performance',
      component: (
        <ParentPerformance onOpenTestPaper={(paper) => setPdfViewerData(paper)} />
      )
    },
    {
      id: 'fees',
      component: (
        <ParentFees />
      )
    },
    {
      id: 'profile',
      component: (
        <StudentProfile
          user={currentUser || mockUsers.parent}
          onLogout={handleLogout}
          onUpdateUser={handleUpdateUser}
          onOpenPermissions={() => setIsPermissionsOpen(true)}
        />
      )
    }
  ];

  // Mobile Application Layout for all 4 roles (Student, Teacher, Parent, Admin)
  return (
    <div className="mobile-app-wrapper">
      {/* Sleek Top Loading Bar for smooth function transitions */}
      {isTabLoading && <TopLoadingBar />}

      {/* Universal Header */}
      <Header
        currentRole={currentRole}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadCount={unreadNoticesCount}
      />

      {/* Main Role-Specific Viewport with Hardware-Accelerated Sliding Track */}
      <ErrorBoundary>
        <main
          key={isLandingFade ? 'landing-main' : 'default-main'}
          className={isLandingFade ? 'home-fade-landing' : ''}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}
        >
          {/* STUDENT SCREENS */}
          {currentRole === 'student' && (
            <ScreenSlider
              activeTab={activeTab}
              tabs={studentTabs}
              onNavigate={handleTabChange}
              roleKey="student"
            />
          )}

          {/* TEACHER SCREENS */}
          {currentRole === 'teacher' && (
            <ScreenSlider
              activeTab={activeTab}
              tabs={teacherTabs}
              onNavigate={handleTabChange}
              roleKey="teacher"
            />
          )}

          {/* PARENT SCREENS */}
          {currentRole === 'parent' && (
            <ScreenSlider
              activeTab={activeTab}
              tabs={parentTabs}
              onNavigate={handleTabChange}
              roleKey="parent"
            />
          )}

          {/* ADMIN MOBILE SCREENS */}
          {currentRole === 'admin' && (
            <AdminMobileDashboard
              activeTab={activeTab}
              onNavigate={handleTabChange}
              onLogout={handleLogout}
              notices={notices}
              setNotices={setNotices}
            />
          )}
        </main>
      </ErrorBoundary>


      {/* Role-Specific Floating Mobile Bottom Navigation */}
      <BottomNav
        role={currentRole}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
      />

      {/* In-App Protected PDF Viewer Modal */}
      {pdfViewerData && (
        <ProtectedPdfViewer
          title={pdfViewerData.title}
          subtitle={pdfViewerData.subtitle}
          studentName={currentUser ? currentUser.name : 'Student'}
          rollNo={currentUser?.rollNumber || ''}
          onClose={() => setPdfViewerData(null)}
        />
      )}

      {/* Teacher Create Test Modal */}
      <CreateTestModal
        isOpen={isCreateTestOpen}
        onClose={() => setIsCreateTestOpen(false)}
        onCreated={() => handleTabChange('batches')}
      />

      {/* Authentication & Password Reset Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        defaultRole={currentRole}
      />

      {/* Announcements & Notifications Board Modal (0.5s Bottom-to-Top Pop-up) */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notices={visibleNotices}
        onMarkAllRead={handleMarkAllNoticesRead}
        onNoticeClick={handleNoticeClick}
      />

      {/* Device Permissions Onboarding & Management Modal */}
      <PermissionsModal
        isOpen={isPermissionsOpen}
        onClose={() => setIsPermissionsOpen(false)}
      />

      {/* Opening Screen (Splash / Welcome Screen) */}
      {showOpeningScreen && (
        <OpeningScreen
          isLoggedIn={isLoggedIn}
          onOpenLogin={() => setIsLoginOpen(true)}
          onProceed={() => setShowOpeningScreen(false)}
        />
      )}

      {/* Back to Exit Toast Banner */}
      {backToastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '88px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.94)',
            color: '#ffffff',
            padding: '9px 18px',
            borderRadius: '9999px',
            fontSize: '12.5px',
            fontWeight: 700,
            zIndex: 99999,
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.28)',
            pointerEvents: 'none',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            letterSpacing: '0.01em',
            animation: 'fadeIn 0.18s ease-out',
            whiteSpace: 'nowrap'
          }}
        >
          <span>{backToastMessage}</span>
        </div>
      )}

      {/* Global Compact Mobile-Friendly Alert Modal */}
      <GlobalMobileAlertModal />
    </div>
  );
}
