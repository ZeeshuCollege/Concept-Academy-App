/**
 * Master Data matching CONCEPT ACADEMY THEME.png exactly
 */

export const DEFAULT_GREY_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128"><rect width="128" height="128" rx="28" fill="%23e2e8f0"/><circle cx="64" cy="48" r="22" fill="%2394a3b8"/><path d="M26 108c0-20.987 17.013-38 38-38s38 17.013 38 38v4H26v-4z" fill="%2394a3b8"/></svg>`;

export const mockUsers = {
  admin: {
    id: 'adm-001',
    name: 'Zeeshan (Admin)',
    role: 'admin',
    email: 'pinjari.work@gmail.com',
    phone: '+917738578685',
    avatar: DEFAULT_GREY_AVATAR
  },
  student: {
    id: 'std-empty',
    name: 'Student',
    role: 'student',
    course: 'JEE',
    rollNumber: 'CONCEPT-101',
    email: '',
    phone: '',
    bloodGroup: '',
    parentName: '',
    parentPhone: '',
    avatar: DEFAULT_GREY_AVATAR,
    overallAttendance: 92,
    overallPerformance: 88
  },
  teacher: {
    id: 'tch-empty',
    name: 'Teacher',
    role: 'teacher',
    subject: '',
    subjects: '',
    designation: 'Faculty',
    department: 'Academics',
    employeeId: '',
    email: '',
    phone: '',
    bloodGroup: '',
    avatar: DEFAULT_GREY_AVATAR,
    assignedBatches: []
  },
  parent: {
    id: 'par-empty',
    name: 'Parent',
    role: 'parent',
    email: '',
    phone: '',
    avatar: DEFAULT_GREY_AVATAR,
    course: 'JEE',
    linkedChild: {
      name: 'Aarav Sharma',
      class: 'JEE',
      course: 'JEE',
      attendance: 92,
      tests: 88,
      performance: 90
    }
  }
};

export const mockSchedule = [];

// Empty initial datasets - populated strictly through dynamic creation / real database
export const mockTests = [];

export const mockStudyMaterials = [];

export const mockBatches = [];

export const mockBatchStudents = [];

export const mockNotices = [];

export const mockLectureAttendance = [];
