/**
 * Concept Academy - Fee Management Service
 * Manages student fee records, progress calculations, amount formatting (k and L),
 * persistent storage directly in Supabase Backend Database, and alerts dispatch.
 */

import { supabase } from './supabaseClient.js';
import { getStoredStudents } from './userAuthStore.js';
import { broadcastDataChange } from './syncEvents.js';

export const FEES_STORAGE_KEY = 'concept_academy_fees_records_v1';
export const LEGACY_FEES_STORAGE_KEY = 'aspire_fees_records_v1';

/**
 * Format amounts according to Concept Academy rules:
 * - Use 'L' for Lakh (>= 1,00,000) e.g., 100000 -> 1L, 150000 -> 1.5L
 * - Use 'k' for Thousands (>= 1,00,000) e.g., 11000 -> 11k, 20000 -> 20k
 * - Pure numbers for < 1000
 */
export function formatFeeAmount(val) {
  const num = Number(val);
  if (isNaN(num) || num === 0) return '0';

  if (num >= 100000) {
    const inLakhs = num / 100000;
    const formatted = Number.isInteger(inLakhs)
      ? inLakhs.toString()
      : parseFloat(inLakhs.toFixed(2)).toString();
    return `${formatted}L`;
  }

  if (num >= 1000) {
    const inThousands = num / 1000;
    const formatted = Number.isInteger(inThousands)
      ? inThousands.toString()
      : parseFloat(inThousands.toFixed(1)).toString();
    return `${formatted}k`;
  }

  return num.toString();
}

/**
 * Format paid and total into "11k/20k" or "1.5L/2L"
 */
export function formatFeeFraction(paid, total) {
  return `${formatFeeAmount(paid)}/${formatFeeAmount(total)}`;
}

export const COURSE_DEFAULT_FEES_STORAGE_KEY = 'concept_academy_course_default_fees_v1';
export const LEGACY_COURSE_DEFAULT_FEES_STORAGE_KEY = 'aspire_course_default_fees_v1';

export const INITIAL_COURSE_DEFAULT_FEES = {
  'JEE (Mains + Adv)': 60000,
  'JEE': 60000,
  'NEET': 50000,
  'MHT-CET': 35000,
  '12th Science': 40000,
  '11th Science': 35000,
  'Std 10th': 25000,
  '10th': 25000,
  'Std 9th': 20000,
  '9th': 20000
};

/**
 * Retrieve saved default course fees with fallback to initial defaults
 */
export function getCourseDefaultFees() {
  try {
    const raw = localStorage.getItem(COURSE_DEFAULT_FEES_STORAGE_KEY) || localStorage.getItem(LEGACY_COURSE_DEFAULT_FEES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return { ...INITIAL_COURSE_DEFAULT_FEES, ...parsed };
      }
    }
  } catch (e) {}
  return { ...INITIAL_COURSE_DEFAULT_FEES };
}

/**
 * Save updated default fees per course
 */
export function saveCourseDefaultFees(feesMap) {
  try {
    const json = JSON.stringify(feesMap);
    localStorage.setItem(COURSE_DEFAULT_FEES_STORAGE_KEY, json);
    localStorage.setItem(LEGACY_COURSE_DEFAULT_FEES_STORAGE_KEY, json);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('concept_academy:course-fees-updated', { detail: feesMap }));
      window.dispatchEvent(new CustomEvent('aspire:course-fees-updated', { detail: feesMap }));
    }
    broadcastDataChange('fees', { type: 'course-defaults', feesMap });
  } catch (e) {}
}

/**
 * Update a specific course default fee
 */
export function updateCourseDefaultFee(courseName, amount) {
  const current = getCourseDefaultFees();
  current[courseName] = Math.max(0, Number(amount) || 0);
  saveCourseDefaultFees(current);
  return current;
}

/**
 * Resolve the default fee for a course with intelligent name matching
 */
export function getDefaultFeeForCourse(courseName) {
  if (!courseName) return 25000;
  const feesMap = getCourseDefaultFees();

  if (feesMap[courseName] !== undefined) {
    return Number(feesMap[courseName]) || 0;
  }

  const clean = courseName.toLowerCase().trim();
  for (const [key, val] of Object.entries(feesMap)) {
    const kClean = key.toLowerCase().trim();
    if (clean === kClean || clean.includes(kClean) || kClean.includes(clean)) {
      return Number(val) || 0;
    }
  }

  return 25000;
}

/**
 * Default Seed Records
 */
export const DEFAULT_FEE_RECORDS = [];

// In-memory runtime cache for snappy zero-latency UI rendering
let runtimeFeeCache = null;

/**
 * Sync individual record directly into Supabase backend database
 */
export async function syncFeeToSupabaseBackend(record) {
  if (!record) return;

  try {
    // 1. Try upserting to dedicated student_fees table if available
    const { error: feeErr } = await supabase
      .from('student_fees')
      .upsert({
        id: record.id || `fee-${Date.now()}`,
        name: record.name,
        roll: record.roll || record.rollNumber || '—',
        course: record.course || '12th Science',
        total_fee: Number(record.totalFee) || 0,
        paid_fee: Number(record.paidFee) || 0,
        is_fully_paid: Boolean(record.isFullyPaid),
        last_payment_date: record.lastPaymentDate || '—',
        remarks: record.remarks || '',
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (!feeErr) {
      console.log(`[Supabase Fee DB] Record "${record.name}" synced to student_fees table.`);
    }
  } catch (err) {
    // student_fees table might not be created yet, fallback to profiles table
  }

  try {
    // 2. Sync to Supabase public.profiles table
    const feePayload = {
      totalFee: Number(record.totalFee) || 0,
      paidFee: Number(record.paidFee) || 0,
      isFullyPaid: Boolean(record.isFullyPaid),
      lastPaymentDate: record.lastPaymentDate || '—',
      remarks: record.remarks || ''
    };

    // Update by ID or by name/email
    const query = supabase.from('profiles').update({
      batches: JSON.stringify(feePayload),
      course: record.course || undefined,
      updated_at: new Date().toISOString()
    });

    if (record.id && record.id.includes('-') && record.id.length > 20) {
      await query.eq('id', record.id);
    } else {
      await query.or(`full_name.eq.${record.name},email.eq.${record.email || ''}`);
    }
  } catch (profErr) {
    console.warn('[Supabase Fee DB] Profiles sync notice:', profErr?.message);
  }
}

/**
 * Fetch all fee records live from Supabase Backend Database
 */
export async function fetchFeesFromSupabase() {
  const map = new Map();

  // 1. Populate default records first
  DEFAULT_FEE_RECORDS.forEach(item => {
    map.set(item.id || item.name, { ...item });
  });

  // 2. Fetch from Supabase student_fees table (if created)
  try {
    const { data: dbFees, error: dbErr } = await supabase
      .from('student_fees')
      .select('*')
      .order('created_at', { ascending: false });

    if (!dbErr && Array.isArray(dbFees) && dbFees.length > 0) {
      dbFees.forEach(row => {
        const item = {
          id: row.id,
          name: row.name,
          roll: row.roll || '—',
          rollNumber: row.roll || '—',
          course: row.course || '12th Science',
          totalFee: Number(row.total_fee) || 0,
          paidFee: Number(row.paid_fee) || 0,
          isFullyPaid: Boolean(row.is_fully_paid) || (Number(row.paid_fee) >= Number(row.total_fee) && Number(row.total_fee) > 0),
          lastPaymentDate: row.last_payment_date || '—',
          remarks: row.remarks || ''
        };
        map.set(item.id || item.name, item);
      });
    }
  } catch (e) {}

  // 3. Fetch from Supabase public.profiles table (role = 'student')
  try {
    const { data: profiles, error: pErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student');

    if (!pErr && Array.isArray(profiles)) {
      profiles.forEach(p => {
        const key = p.id || p.full_name;
        const existing = map.get(key);
        let feeData = null;
        if (p.batches) {
          try {
            feeData = JSON.parse(p.batches);
          } catch (e) {}
        }

        const total = feeData?.totalFee !== undefined ? Number(feeData.totalFee) : (existing?.totalFee || 0);
        const paid = feeData?.paidFee !== undefined ? Math.min(total, Number(feeData.paidFee)) : (existing?.paidFee || 0);

        map.set(key, {
          id: p.id,
          name: p.full_name,
          roll: p.roll_number || existing?.roll || '—',
          rollNumber: p.roll_number || existing?.rollNumber || '—',
          course: p.course || existing?.course || 'JEE',
          email: p.email,
          totalFee: total,
          paidFee: paid,
          isFullyPaid: feeData?.isFullyPaid !== undefined ? feeData.isFullyPaid : (paid >= total && total > 0),
          lastPaymentDate: feeData?.lastPaymentDate || existing?.lastPaymentDate || '—',
          remarks: feeData?.remarks || existing?.remarks || 'Enrolled in Supabase'
        });
      });
    }
  } catch (e) {}

  // Also include any locally registered students in auth store
  try {
    const stored = getStoredStudents();
    if (Array.isArray(stored)) {
      stored.forEach(std => {
        const key = std.id || std.name;
        if (!map.has(key)) {
          map.set(key, {
            id: std.id,
            name: std.name,
            roll: std.roll || std.rollNumber || '—',
            rollNumber: std.rollNumber || std.roll || '—',
            course: std.course || 'JEE',
            totalFee: 0,
            paidFee: 0,
            isFullyPaid: false,
            lastPaymentDate: '—',
            remarks: 'New Student'
          });
        }
      });
    }
  } catch (e) {}

  const list = Array.from(map.values());
  runtimeFeeCache = list;
  // Cache copy for instant offline boot
  try {
    const json = JSON.stringify(list);
    localStorage.setItem(FEES_STORAGE_KEY, json);
    localStorage.setItem(LEGACY_FEES_STORAGE_KEY, json);
  } catch (e) {}
  return list;
}

/**
 * Synchronous getter: Returns in-memory cache / persistent snapshot
 */
export function getStoredFees() {
  if (runtimeFeeCache && runtimeFeeCache.length > 0) {
    return runtimeFeeCache;
  }
  try {
    const raw = localStorage.getItem(FEES_STORAGE_KEY) || localStorage.getItem(LEGACY_FEES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        runtimeFeeCache = parsed;
        return parsed;
      }
    }
  } catch (e) {}

  runtimeFeeCache = [];
  return [];
}

/**
 * Save fee list to runtime cache and async persist to Supabase
 */
export function saveStoredFees(feesList) {
  runtimeFeeCache = feesList;
  try {
    const json = JSON.stringify(feesList || []);
    localStorage.setItem(FEES_STORAGE_KEY, json);
    localStorage.setItem(LEGACY_FEES_STORAGE_KEY, json);
    broadcastDataChange('fees', { count: (feesList || []).length });
  } catch (e) {}
}

/**
 * Update a student's fees details (e.g. edit paid fees from 11k to 15k out of 20k)
 * Stores directly in Supabase Backend Database.
 */
export function updateStudentFeeRecord(studentId, updates) {
  const current = getStoredFees();
  let updatedRecord = null;

  const updatedList = current.map(item => {
    if (item.id === studentId || item.name === studentId) {
      const newTotal = updates.totalFee !== undefined ? Math.max(0, Number(updates.totalFee)) : item.totalFee;
      let newPaid = updates.paidFee !== undefined ? Math.max(0, Number(updates.paidFee)) : item.paidFee;
      // Requirement: The maximum value which can be added to paid fees is the total fees value
      if (newPaid > newTotal) {
        newPaid = newTotal;
      }
      const fullPaid = updates.isFullyPaid !== undefined 
        ? updates.isFullyPaid 
        : (newPaid >= newTotal && newTotal > 0);

      updatedRecord = {
        ...item,
        ...updates,
        totalFee: newTotal,
        paidFee: newPaid,
        isFullyPaid: fullPaid,
        lastPaymentDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      };
      return updatedRecord;
    }
    return item;
  });

  saveStoredFees(updatedList);

  // Write directly to Supabase Backend
  if (updatedRecord) {
    syncFeeToSupabaseBackend(updatedRecord);
  }

  return updatedList;
}

/**
 * Mark a student's fees as Full Paid
 * Stores directly in Supabase Backend Database.
 */
export function markStudentAsFullPaid(studentId) {
  const current = getStoredFees();
  let updatedRecord = null;

  const updatedList = current.map(item => {
    if (item.id === studentId || item.name === studentId) {
      updatedRecord = {
        ...item,
        paidFee: item.totalFee,
        isFullyPaid: true,
        lastPaymentDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        remarks: 'Marked Fully Paid by Admin'
      };
      return updatedRecord;
    }
    return item;
  });

  saveStoredFees(updatedList);

  // Write directly to Supabase Backend
  if (updatedRecord) {
    syncFeeToSupabaseBackend(updatedRecord);
  }

  return updatedList;
}

/**
 * Add a new manual fee entry by Admin
 * Stores directly in Supabase Backend Database.
 */
export function addManualFeeRecord(record) {
  const fees = getStoredFees();
  const total = Math.max(0, Number(record.totalFee) || 0);
  const rawPaid = Math.max(0, Number(record.paidFee) || 0);
  // Maximum value which can be added to paid fees is the total fees value
  const paid = Math.min(total, rawPaid);
  const isFull = paid >= total && total > 0;

  const newEntry = {
    id: record.id || `fee-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    name: record.name.trim(),
    roll: record.roll || record.rollNumber || '—',
    rollNumber: record.rollNumber || record.roll || '—',
    course: record.course || 'JEE',
    totalFee: total,
    paidFee: paid,
    isFullyPaid: isFull,
    lastPaymentDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    remarks: record.remarks || 'Manual Admin Entry'
  };

  const updatedList = [newEntry, ...fees];
  saveStoredFees(updatedList);

  // Write directly to Supabase Backend
  syncFeeToSupabaseBackend(newEntry);

  return { updatedList, newEntry };
}

/**
 * Send Fee Alert to Student and Parent
 * Dispatches notice & broadcasts custom events
 */
export function sendFeeNotificationAlert(student) {
  const total = Number(student.totalFee) || 0;
  const paid = Number(student.paidFee) || 0;
  const remaining = Math.max(0, total - paid);
  const isCleared = student.isFullyPaid || paid >= total;
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const totalFormatted = formatFeeAmount(total);
  const paidFormatted = formatFeeAmount(paid);
  const remainingFormatted = formatFeeAmount(remaining);
  const fractionStr = formatFeeFraction(paid, total);

  const notice = {
    id: `fee-alert-${student.id}-${Date.now()}`,
    title: isCleared 
      ? `✅ Fee Clearance Receipt: ${student.name}` 
      : `⚠️ Fee Account Alert: ${student.name}`,
    message: isCleared
      ? `Full Fee Notification for ${student.name} (${student.course}): All fees totaling ₹${total.toLocaleString('en-IN')} (${totalFormatted}) have been fully settled (${fractionStr}). Account is in good standing.`
      : `Institute Fee Notice for ${student.name} (${student.course}): Total Fee: ₹${total.toLocaleString('en-IN')} (${totalFormatted}), Paid: ₹${paid.toLocaleString('en-IN')} (${paidFormatted}), Outstanding Balance: ₹${remaining.toLocaleString('en-IN')} (${remainingFormatted}). Status: ${fractionStr} Paid. Kindly clear the pending balance at institute desk or via online portal.`,
    category: 'Fee',
    priority: isCleared ? 'normal' : 'high',
    timestamp: 'Just now',
    date: today,
    read: false,
    studentId: student.id,
    studentName: student.name,
    courses: [student.course, 'All Courses'],
    feeDetails: {
      totalFee: total,
      paidFee: paid,
      remainingFee: remaining,
      fraction: fractionStr,
      isFullyPaid: isCleared
    }
  };

  // Broadcast event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('concept_academy:fee-alert', {
      detail: { notice, student }
    }));
    window.dispatchEvent(new CustomEvent('aspire:fee-alert', {
      detail: { notice, student }
    }));
  }

  return notice;
}

/**
 * Automatically create or update student fee ledger entry when enrolled
 * Connects directly to the Fees section and Supabase backend.
 */
export function createOrUpdateStudentFeeRecord(studentData) {
  if (!studentData || !studentData.name) return null;
  const currentFees = getStoredFees();

  const total = studentData.totalFee !== undefined && Number(studentData.totalFee) > 0
    ? Number(studentData.totalFee)
    : getDefaultFeeForCourse(studentData.course);

  const rawPaid = Number(studentData.paidFee) || 0;
  const paid = Math.min(total, Math.max(0, rawPaid));
  const isFull = (paid >= total && total > 0) || Boolean(studentData.isFullyPaid);

  const existingIdx = currentFees.findIndex(f => 
    (studentData.id && f.id === studentData.id) || 
    (studentData.roll && (f.roll === studentData.roll || f.rollNumber === studentData.roll)) ||
    f.name.toLowerCase().trim() === studentData.name.toLowerCase().trim()
  );

  let newOrUpdatedRecord;
  let updatedList;

  if (existingIdx >= 0) {
    newOrUpdatedRecord = {
      ...currentFees[existingIdx],
      name: studentData.name.trim(),
      roll: studentData.roll || studentData.rollNumber || currentFees[existingIdx].roll || '—',
      rollNumber: studentData.rollNumber || studentData.roll || currentFees[existingIdx].rollNumber || '—',
      course: studentData.course || currentFees[existingIdx].course || 'JEE',
      totalFee: total,
      paidFee: paid,
      isFullyPaid: isFull,
      lastPaymentDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      remarks: studentData.remarks || currentFees[existingIdx].remarks || 'Student Enrollment'
    };
    updatedList = [...currentFees];
    updatedList[existingIdx] = newOrUpdatedRecord;
  } else {
    newOrUpdatedRecord = {
      id: studentData.id || `fee-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: studentData.name.trim(),
      roll: studentData.roll || studentData.rollNumber || '—',
      rollNumber: studentData.rollNumber || studentData.roll || '—',
      course: studentData.course || 'JEE',
      totalFee: total,
      paidFee: paid,
      isFullyPaid: isFull,
      lastPaymentDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      remarks: studentData.remarks || 'New Student Enrollment'
    };
    updatedList = [newOrUpdatedRecord, ...currentFees];
  }

  saveStoredFees(updatedList);
  syncFeeToSupabaseBackend(newOrUpdatedRecord);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('concept_academy:fee-alert', { detail: { record: newOrUpdatedRecord } }));
    window.dispatchEvent(new CustomEvent('aspire:fee-alert', { detail: { record: newOrUpdatedRecord } }));
    window.dispatchEvent(new Event('storage'));
  }

  return newOrUpdatedRecord;
}
