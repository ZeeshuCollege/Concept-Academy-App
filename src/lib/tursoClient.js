import { createClient } from '@libsql/client/web';

const TURSO_DATABASE_URL = import.meta.env.VITE_TURSO_DATABASE_URL || import.meta.env.TURSO_DATABASE_URL || '';
const TURSO_AUTH_TOKEN = import.meta.env.VITE_TURSO_AUTH_TOKEN || import.meta.env.TURSO_AUTH_TOKEN || '';

export const isTursoConfigured = Boolean(
  TURSO_DATABASE_URL &&
  TURSO_AUTH_TOKEN &&
  !TURSO_DATABASE_URL.includes('your-database') &&
  !TURSO_DATABASE_URL.includes('placeholder')
);

// Format URL for web fetch (convert libsql:// to https:// if necessary)
const getNormalizedUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('libsql://')) {
    return url.replace('libsql://', 'https://');
  }
  return url;
};

export const turso = isTursoConfigured
  ? createClient({
      url: getNormalizedUrl(TURSO_DATABASE_URL),
      authToken: TURSO_AUTH_TOKEN
    })
  : null;

/**
 * Execute a SQL statement on Turso
 * @param {string} sql 
 * @param {Array|Object} args 
 * @returns {Promise<{rows: Array, rowsAffected: number}|null>}
 */
export async function executeTurso(sql, args = []) {
  if (!isTursoConfigured || !turso) {
    return null;
  }
  try {
    const result = await turso.execute({ sql, args });
    return result;
  } catch (err) {
    console.warn('[Turso] Execute error:', err?.message || err);
    return null;
  }
}

/**
 * Batch execute multiple SQL statements on Turso inside a transaction
 * @param {Array<{sql: string, args?: Array}>} statements 
 */
export async function batchTurso(statements) {
  if (!isTursoConfigured || !turso) {
    return null;
  }
  try {
    const result = await turso.batch(statements, 'write');
    return result;
  } catch (err) {
    console.warn('[Turso] Batch execution error:', err?.message || err);
    return null;
  }
}

/**
 * Sync user profile to Turso database
 * @param {Object} user 
 */
export async function syncUserToTurso(user) {
  if (!isTursoConfigured || !turso || !user?.email) return false;

  const sql = `
    INSERT INTO profiles (
      id, role, full_name, email, phone, roll_number, course, batches, subjects, linked_child_name, is_active, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now')
    )
    ON CONFLICT(email) DO UPDATE SET
      role = excluded.role,
      full_name = excluded.full_name,
      phone = excluded.phone,
      roll_number = excluded.roll_number,
      course = excluded.course,
      batches = excluded.batches,
      subjects = excluded.subjects,
      linked_child_name = excluded.linked_child_name,
      is_active = excluded.is_active,
      updated_at = datetime('now');
  `;

  const args = [
    user.id || ('u-' + Date.now()),
    user.role || 'student',
    user.name || '',
    user.email.trim().toLowerCase(),
    user.phone || '',
    user.rollNumber || '',
    user.course || '',
    JSON.stringify(user.batches || []),
    JSON.stringify(user.subjects || []),
    user.linkedChildName || '',
    user.isActive !== false ? 1 : 0
  ];

  try {
    await turso.execute({ sql, args });
    console.info(`[Turso] Successfully synced user profile for: ${user.email}`);
    return true;
  } catch (err) {
    console.warn('[Turso] User profile sync failed:', err?.message);
    return false;
  }
}

/**
 * Fetch all user profiles from Turso
 */
export async function fetchTursoUsers() {
  if (!isTursoConfigured || !turso) return [];

  try {
    const res = await turso.execute('SELECT * FROM profiles ORDER BY full_name ASC');
    return res.rows.map(r => ({
      id: r.id,
      role: r.role,
      name: r.full_name,
      email: r.email,
      phone: r.phone,
      rollNumber: r.roll_number,
      course: r.course,
      batches: safeJsonParse(r.batches, []),
      subjects: safeJsonParse(r.subjects, []),
      linkedChildName: r.linked_child_name,
      isActive: Boolean(r.is_active)
    }));
  } catch (err) {
    console.warn('[Turso] Fetch users failed:', err?.message);
    return [];
  }
}

function safeJsonParse(val, fallback) {
  if (!val) return fallback;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

/**
 * Initialize essential database tables in Turso (SQLite compatible)
 */
export async function initTursoTables() {
  if (!isTursoConfigured || !turso) return false;

  const ddlStatements = [
    `CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL CHECK(role IN ('student', 'teacher', 'parent', 'admin')),
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      roll_number TEXT,
      course TEXT,
      batches TEXT,
      subjects TEXT,
      linked_child_name TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );`,
    `CREATE TABLE IF NOT EXISTS student_fees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      roll TEXT,
      course TEXT,
      total_fee REAL NOT NULL DEFAULT 0,
      paid_fee REAL NOT NULL DEFAULT 0,
      is_fully_paid INTEGER DEFAULT 0,
      last_payment_date TEXT,
      remarks TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );`,
    `CREATE TABLE IF NOT EXISTS notices (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      target_courses TEXT,
      created_by TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );`
  ];

  try {
    for (const stmt of ddlStatements) {
      await turso.execute(stmt);
    }
    console.info('[Turso] Database tables initialized successfully.');
    return true;
  } catch (err) {
    console.warn('[Turso] Failed to initialize tables:', err?.message);
    return false;
  }
}
