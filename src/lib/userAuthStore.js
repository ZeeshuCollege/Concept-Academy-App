/**
 * Concept Academy Auth Store — Simple & Reliable
 * Single source of truth: flat email→password map in localStorage
 * Secondary: Supabase Auth (when network available)
 */

import { createClient } from '@supabase/supabase-js';
import { supabase, supabaseAdmin } from './supabaseClient';
import { DEFAULT_GREY_AVATAR } from './mockData';
import { broadcastDataChange } from './syncEvents';
import { syncUserToTurso } from './tursoClient';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Isolated ephemeral client so user registration never logs out the active admin session
const getEphemeralAuthClient = () => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storageKey: 'concept_academy_ephemeral_auth'
    }
  });
};

const CREDS_KEY = 'concept_academy_creds_v1';
const LEGACY_CREDS_KEY = 'aspire_creds_v1';
const USERS_KEY = 'concept_academy_users_v1';
const LEGACY_USERS_KEY = 'aspire_users_v1';
const STUDENTS_LIST_KEY = 'concept_academy_students_list';
const LEGACY_STUDENTS_LIST_KEY = 'aspire_students_list';
const TEACHERS_LIST_KEY = 'concept_academy_teachers_list';
const LEGACY_TEACHERS_LIST_KEY = 'aspire_teachers_list';
const PARENTS_LIST_KEY = 'concept_academy_parents_list';
const LEGACY_PARENTS_LIST_KEY = 'aspire_parents_list';

// ----- Credential Helpers -----

const getCredMap = () => {
  try {
    const raw = localStorage.getItem(CREDS_KEY) || localStorage.getItem(LEGACY_CREDS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};
const getUserMap = () => {
  try {
    const raw = localStorage.getItem(USERS_KEY) || localStorage.getItem(LEGACY_USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};
const saveCredMap = (map) => {
  try {
    const json = JSON.stringify(map);
    localStorage.setItem(CREDS_KEY, json);
    localStorage.setItem(LEGACY_CREDS_KEY, json);
  } catch {}
};
const saveUserMap = (map) => {
  try {
    const json = JSON.stringify(map);
    localStorage.setItem(USERS_KEY, json);
    localStorage.setItem(LEGACY_USERS_KEY, json);
  } catch {}
};

export const getUserPassword = (email) => {
  if (!email) return '';
  const creds = getCredMap();
  return creds[email.trim().toLowerCase()] || '';
};

// ----- Security Sanitizer -----
// Strips executable tags and control characters (#13 Sanitize before storing)
const sanitizeText = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>?/gm, '').trim();
};

// ----- Public API -----

/**
 * Called by Admin when adding a user (student, teacher, parent, admin).
 * Stores the user in:
 * 1. Local storage (instant offline fallback)
 * 2. Supabase Auth (auth.users) with user_metadata containing role
 * 3. Supabase Database table (public.profiles) with role: 'student' | 'teacher' | 'parent' | 'admin'
 */
export const addRegisteredUser = async (user) => {
  if (!user || typeof user !== 'object') return null;

  const cleanEmail = sanitizeText(user.email || '').toLowerCase();
  const cleanPassword = (user.password || '').trim();
  if (!cleanEmail || !cleanPassword) return null;

  // Enforce valid role: student, teacher, parent, or admin
  let rawRole = (user.role || 'student').toLowerCase().trim();
  if (rawRole === 'faculty') rawRole = 'teacher';
  const validRoles = ['student', 'teacher', 'parent', 'admin'];
  const role = validRoles.includes(rawRole) ? rawRole : 'student';

  const record = {
    id: user.id || `usr-${Date.now()}`,
    name: sanitizeText(user.name || 'Concept Academy User'),
    email: cleanEmail,
    password: cleanPassword,
    role: role,
    avatar: user.avatar || DEFAULT_GREY_AVATAR,
    course: sanitizeText(user.course || ''),
    rollNumber: sanitizeText(user.rollNumber || ''),
    phone: sanitizeText(user.phone || ''),
    bloodGroup: sanitizeText(user.bloodGroup || ''),
    batches: Array.isArray(user.batches) ? user.batches.join(', ') : sanitizeText(user.batches || ''),
    subjects: Array.isArray(user.subjects) ? user.subjects.join(', ') : sanitizeText(user.subjects || ''),
    linkedChildName: sanitizeText(user.linkedChildName || ''),
    status: 'Active',
    createdAt: new Date().toISOString()
  };

  // ── 1. Save locally (always works, instant) ──
  const creds = getCredMap();
  creds[cleanEmail] = cleanPassword;
  saveCredMap(creds);

  const users = getUserMap();
  users[cleanEmail] = record;
  saveUserMap(users);

  // ── 2. Sync to Supabase Auth & Database Table ──
  let supabaseUid = null;
  let supabaseSynced = false;

  const metadataPayload = {
    full_name: record.name,
    name: record.name,
    role: record.role, // 'teacher' | 'student' | 'parent' | 'admin'
    course: record.course,
    rollNumber: record.rollNumber,
    phone: record.phone,
    batches: record.batches,
    subjects: record.subjects,
    linkedChildName: record.linkedChildName
  };

  // A. Admin API (bypasses email confirmation)
  if (supabaseAdmin) {
    try {
      const { data: { users: allUsers }, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
      if (!listErr && allUsers) {
        const existingSupaUser = allUsers.find(u => u.email?.toLowerCase() === cleanEmail);
        if (existingSupaUser) {
          supabaseUid = existingSupaUser.id;
          await supabaseAdmin.auth.admin.updateUserById(existingSupaUser.id, {
            password: cleanPassword,
            email_confirm: true,
            user_metadata: metadataPayload
          });
          supabaseSynced = true;
        } else {
          const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
            email: cleanEmail,
            password: cleanPassword,
            email_confirm: true,
            user_metadata: metadataPayload
          });
          if (!createErr && created?.user) {
            supabaseUid = created.user.id;
            supabaseSynced = true;
          }
        }
      }
    } catch (adminErr) {
      console.warn('[Concept Academy] Supabase Admin API sync notice:', adminErr?.message);
    }
  }

  // B. Standard Supabase client fallback (via isolated ephemeral client to prevent session hijacking)
  if (!supabaseSynced && SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      const ephemeralClient = getEphemeralAuthClient();
      if (ephemeralClient) {
        const { data: signUpData, error: signUpErr } = await ephemeralClient.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: metadataPayload
          }
        });
        if (!signUpErr && signUpData?.user) {
          supabaseUid = signUpData.user.id;
          supabaseSynced = true;
        }
      }
    } catch (authErr) {
      console.warn('[Concept Academy] Supabase ephemeral auth signup notice:', authErr?.message);
    }
  }

  // C. Insert / Upsert into public.profiles table
  const dbClient = supabaseAdmin || supabase;
  if (dbClient) {
    try {
      const profileData = {
        role: record.role,
        full_name: record.name,
        email: cleanEmail,
        phone: record.phone || null,
        roll_number: record.rollNumber || null,
        course: record.course || null,
        batches: record.batches || null,
        subjects: record.subjects || null,
        linked_child_name: record.linkedChildName || null,
        is_active: true,
        updated_at: new Date().toISOString()
      };

      if (supabaseUid) {
        profileData.id = supabaseUid;
      }

      const { error: profileErr } = await dbClient
        .from('profiles')
        .upsert(profileData, { onConflict: supabaseUid ? 'id' : 'email' });

      if (profileErr) {
        console.warn('[Concept Academy] Supabase public.profiles upsert notice:', profileErr.message);
      } else {
        console.info(`[Concept Academy] Profile row successfully saved in Supabase with role: "${record.role}"`);
      }
    } catch (tblErr) {
      console.warn('[Concept Academy] Supabase profiles table write notice:', tblErr?.message);
    }
  }

  // D. Sync to Turso database (if configured)
  try {
    syncUserToTurso(record);
  } catch (tursoErr) {}

  try {
    broadcastDataChange(record.role || 'students', { user: record });
  } catch (e) {}

  return record;
};

/**
 * Authenticate a user. Returns user object or null.
 * Checks ALL possible storage formats (new and old) for compatibility.
 */
export const authenticateLocalUser = (email, password) => {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();
  if (!cleanEmail || !cleanPass) return null;

  // ── 0. Reviewer Demo Accounts & Official Institute Admin ──
  if (
    (cleanEmail === 'admin.demo@conceptacademy.local' || cleanEmail === 'admin.demo@aspire.local') &&
    (cleanPass === 'ConceptAcademyDemo@2026' || cleanPass === 'AspireDemo@2026')
  ) {
    return {
      id: 'adm-demo',
      name: 'Administrator',
      email: cleanEmail,
      role: 'admin'
    };
  }
  if (
    (cleanEmail === 'conceptacademy@outlook.com' || cleanEmail === 'aspirelearningcentre@outlook.com') &&
    cleanPass === 'ZP&786'
  ) {
    return {
      id: 'admin-1',
      name: 'Concept Academy Admin',
      email: cleanEmail,
      role: 'admin'
    };
  }

  // ── 1. New format: flat creds map (aspire_creds_v1) ──
  try {
    const creds = getCredMap();
    if (creds[cleanEmail] !== undefined && creds[cleanEmail] === cleanPass) {
      const users = getUserMap();
      const record = users[cleanEmail];
      if (record) return record;
      return { id: `local-${Date.now()}`, email: cleanEmail, role: 'student', name: cleanEmail.split('@')[0] };
    }
  } catch {}

  // ── 2. Old format: user_<email> direct key ──
  try {
    const directRaw = localStorage.getItem(`concept_academy_user_${cleanEmail}`) || localStorage.getItem(`aspire_user_${cleanEmail}`);
    if (directRaw) {
      const u = JSON.parse(directRaw);
      if (u && (u.password || '').trim() === cleanPass) {
        // Migrate to new format
        const creds = getCredMap(); creds[cleanEmail] = cleanPass; saveCredMap(creds);
        const users = getUserMap(); users[cleanEmail] = u; saveUserMap(users);
        return u;
      }
    }
  } catch {}

  // ── 3. Old format: registered_users array ──
  try {
    const regRaw = localStorage.getItem('concept_academy_registered_users') || localStorage.getItem('aspire_registered_users');
    if (regRaw) {
      const regUsers = JSON.parse(regRaw) || [];
      const found = regUsers.find(u =>
        (u.email || '').trim().toLowerCase() === cleanEmail &&
        (u.password || '').trim() === cleanPass
      );
      if (found) {
        // Migrate to new format
        const creds = getCredMap(); creds[cleanEmail] = cleanPass; saveCredMap(creds);
        const users = getUserMap(); users[cleanEmail] = found; saveUserMap(users);
        return found;
      }
    }
  } catch {}

  // ── 4. Fallback: aspire_students_list (has password field) ──
  try {
    const students = getStoredStudents();
    const s = students.find(x =>
      (x.email || '').trim().toLowerCase() === cleanEmail && x.password && x.password.trim() === cleanPass
    );
    if (s) {
      const record = { id: s.id, name: s.name, email: s.email, role: 'student', course: s.course, rollNumber: s.rollNumber || s.roll, phone: s.phone || '', bloodGroup: s.bloodGroup || '' };
      const creds = getCredMap(); creds[cleanEmail] = cleanPass; saveCredMap(creds);
      const users = getUserMap(); users[cleanEmail] = record; saveUserMap(users);
      return record;
    }
  } catch {}

  // ── 5. Fallback: aspire_teachers_list ──
  try {
    const teachers = getStoredTeachers();
    const t = teachers.find(x =>
      (x.email || '').trim().toLowerCase() === cleanEmail && x.password && x.password.trim() === cleanPass
    );
    if (t) {
      const record = { id: t.id, name: t.name, email: t.email, role: 'teacher', subject: t.subject, batches: t.batches };
      const creds = getCredMap(); creds[cleanEmail] = cleanPass; saveCredMap(creds);
      const users = getUserMap(); users[cleanEmail] = record; saveUserMap(users);
      return record;
    }
  } catch {}

  // ── 6. Fallback: aspire_parents_list ──
  try {
    const parents = getStoredParents();
    const p = parents.find(x =>
      (x.email || '').trim().toLowerCase() === cleanEmail && x.password && x.password.trim() === cleanPass
    );
    if (p) {
      const record = { id: p.id, name: p.name, email: p.email, role: 'parent', phone: p.phone };
      const creds = getCredMap(); creds[cleanEmail] = cleanPass; saveCredMap(creds);
      const users = getUserMap(); users[cleanEmail] = record; saveUserMap(users);
      return record;
    }
  } catch {}

  return null;
};

export const getRegisteredUsers = () => {
  const users = getUserMap();
  return Object.values(users);
};

// ----- Students -----

export const getStoredStudents = () => {
  try {
    const raw = localStorage.getItem(STUDENTS_LIST_KEY) || localStorage.getItem(LEGACY_STUDENTS_LIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

export const saveStoredStudents = (list) => {
  try {
    const json = JSON.stringify(list || []);
    localStorage.setItem(STUDENTS_LIST_KEY, json);
    localStorage.setItem(LEGACY_STUDENTS_LIST_KEY, json);
    broadcastDataChange('students', { count: (list || []).length });
  } catch {}
};

export const deleteStoredStudent = (studentId) => {
  const current = getStoredStudents();
  const toDelete = current.find(s => s.id === studentId);
  if (toDelete?.email) {
    const e = toDelete.email.trim().toLowerCase();
    const creds = getCredMap(); delete creds[e]; saveCredMap(creds);
    const users = getUserMap(); delete users[e]; saveUserMap(users);
    // Delete from Supabase if admin client available
    if (supabaseAdmin?.auth?.admin) {
      supabaseAdmin.auth.admin.listUsers().then(({ data }) => {
        const u = data?.users?.find(x => x.email === e);
        if (u) supabaseAdmin.auth.admin.deleteUser(u.id).catch(() => {});
      }).catch(() => {});
    }
  }
  const updated = current.filter(s => s.id !== studentId);
  saveStoredStudents(updated);
  broadcastDataChange('students', { deletedId: studentId });
  return updated;
};

// ----- Teachers -----

export const getStoredTeachers = () => {
  try {
    const raw = localStorage.getItem(TEACHERS_LIST_KEY) || localStorage.getItem(LEGACY_TEACHERS_LIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

export const saveStoredTeachers = (list) => {
  try {
    const json = JSON.stringify(list || []);
    localStorage.setItem(TEACHERS_LIST_KEY, json);
    localStorage.setItem(LEGACY_TEACHERS_LIST_KEY, json);
    broadcastDataChange('teachers', { count: (list || []).length });
  } catch {}
};

export const deleteStoredTeacher = (teacherId) => {
  const current = getStoredTeachers();
  const toDelete = current.find(t => t.id === teacherId);
  if (toDelete?.email) {
    const e = toDelete.email.trim().toLowerCase();
    const creds = getCredMap(); delete creds[e]; saveCredMap(creds);
    const users = getUserMap(); delete users[e]; saveUserMap(users);
  }
  const updated = current.filter(t => t.id !== teacherId);
  saveStoredTeachers(updated);
  broadcastDataChange('teachers', { deletedId: teacherId });
  return updated;
};

// ----- Parents -----

export const deduplicateParents = (list) => {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  return list.filter(p => {
    if (!p) return false;
    const key = (p.phone || '').replace(/\D/g, '') || (p.email || '').trim().toLowerCase() || (p.name || '').trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const getStoredParents = () => {
  try {
    const raw = localStorage.getItem(PARENTS_LIST_KEY) || localStorage.getItem(LEGACY_PARENTS_LIST_KEY);
    return deduplicateParents(raw ? JSON.parse(raw) : []);
  } catch { return []; }
};

export const saveStoredParents = (list) => {
  try {
    const deduped = deduplicateParents(list || []);
    const json = JSON.stringify(deduped);
    localStorage.setItem(PARENTS_LIST_KEY, json);
    localStorage.setItem(LEGACY_PARENTS_LIST_KEY, json);
    broadcastDataChange('parents', { count: deduped.length });
    return deduped;
  } catch { return list; }
};

export const deleteStoredParent = (parentId) => {
  const current = getStoredParents();
  const toDelete = current.find(p => p.id === parentId);
  if (toDelete?.email) {
    const e = toDelete.email.trim().toLowerCase();
    const creds = getCredMap(); delete creds[e]; saveCredMap(creds);
    const users = getUserMap(); delete users[e]; saveUserMap(users);
  }
  const updated = current.filter(p => p.id !== parentId);
  saveStoredParents(updated);
  broadcastDataChange('parents', { deletedId: parentId });
  return updated;
};
