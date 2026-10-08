import { useEffect, useRef } from 'react';

// Central Event Bus for Instant Cross-Dashboard Real-Time Synchronization
export const SYNC_EVENTS = {
  STUDENTS: 'concept_academy:sync:students',
  TEACHERS: 'concept_academy:sync:teachers',
  PARENTS: 'concept_academy:sync:parents',
  COURSES: 'concept_academy:sync:courses',
  FEES: 'concept_academy:sync:fees',
  ATTENDANCE: 'concept_academy:sync:attendance',
  TIMETABLE: 'concept_academy:sync:timetable',
  MATERIALS: 'concept_academy:sync:materials',
  TESTS: 'concept_academy:sync:tests',
  MARKS: 'concept_academy:sync:marks',
  NOTICES: 'concept_academy:sync:notices',
  ALL: 'concept_academy:sync:all'
};

const LEGACY_SYNC_EVENTS = {
  STUDENTS: 'aspire:sync:students',
  TEACHERS: 'aspire:sync:teachers',
  PARENTS: 'aspire:sync:parents',
  COURSES: 'aspire:sync:courses',
  FEES: 'aspire:sync:fees',
  ATTENDANCE: 'aspire:sync:attendance',
  TIMETABLE: 'aspire:sync:timetable',
  MATERIALS: 'aspire:sync:materials',
  TESTS: 'aspire:sync:tests',
  MARKS: 'aspire:sync:marks',
  NOTICES: 'aspire:sync:notices',
  ALL: 'aspire:sync:all'
};

/**
 * Broadcast a data change event to update every active dashboard and component immediately.
 * @param {string} domain - Domain name (e.g. 'students', 'attendance', 'fees', etc.)
 * @param {object} detail - Optional metadata about the change
 */
export function broadcastDataChange(domain, detail = {}) {
  if (typeof window === 'undefined') return;

  const upper = (domain || 'all').toUpperCase();
  const eventName = SYNC_EVENTS[upper] || `concept_academy:sync:${domain.toLowerCase()}`;
  const legacyEventName = LEGACY_SYNC_EVENTS[upper] || `aspire:sync:${domain.toLowerCase()}`;

  const payload = {
    domain,
    timestamp: Date.now(),
    ...detail
  };

  // 1. Dispatch domain-specific event in the current window (both modern & legacy)
  try {
    window.dispatchEvent(new CustomEvent(eventName, { detail: payload }));
    window.dispatchEvent(new CustomEvent(legacyEventName, { detail: payload }));
  } catch (e) {
    console.warn(`Failed to dispatch ${eventName}:`, e);
  }

  // 2. Dispatch global sync event in current window
  try {
    window.dispatchEvent(new CustomEvent(SYNC_EVENTS.ALL, { detail: payload }));
    window.dispatchEvent(new CustomEvent(LEGACY_SYNC_EVENTS.ALL, { detail: payload }));
  } catch (e) {}

  // 3. Trigger cross-tab/cross-window sync via localStorage update
  try {
    const tickData = JSON.stringify({
      domain,
      time: Date.now()
    });
    localStorage.setItem('concept_academy_global_sync_tick', tickData);
    localStorage.setItem('aspire_global_sync_tick', tickData);
  } catch (e) {}
}

/**
 * React hook to listen for real-time data changes and immediately refresh component state.
 * @param {string|string[]} domains - Single domain or array of domains to subscribe to (e.g. 'students', ['fees', 'all'])
 * @param {function} onSync - Callback executed when a relevant data change occurs
 */
export function useDataSync(domains, onSync) {
  const callbackRef = useRef(onSync);
  useEffect(() => {
    callbackRef.current = onSync;
  }, [onSync]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const domainList = Array.isArray(domains) ? domains : [domains];
    const eventNames = [];
    domainList.forEach(d => {
      const upper = (d || '').toUpperCase();
      eventNames.push(SYNC_EVENTS[upper] || `concept_academy:sync:${d.toLowerCase()}`);
      eventNames.push(LEGACY_SYNC_EVENTS[upper] || `aspire:sync:${d.toLowerCase()}`);
    });

    // Always include global ALL event
    if (!eventNames.includes(SYNC_EVENTS.ALL)) {
      eventNames.push(SYNC_EVENTS.ALL);
    }
    if (!eventNames.includes(LEGACY_SYNC_EVENTS.ALL)) {
      eventNames.push(LEGACY_SYNC_EVENTS.ALL);
    }

    const handleEvent = (e) => {
      if (typeof callbackRef.current === 'function') {
        try {
          callbackRef.current(e.detail || {});
        } catch (err) {
          console.error('Error in useDataSync handler:', err);
        }
      }
    };

    // Cross-tab storage listener
    const handleStorage = (e) => {
      if (e.key === 'concept_academy_global_sync_tick' || e.key === 'aspire_global_sync_tick') {
        try {
          const parsed = JSON.parse(e.newValue || '{}');
          if (domainList.includes(parsed.domain) || domainList.includes('all')) {
            if (typeof callbackRef.current === 'function') {
              callbackRef.current(parsed);
            }
          }
        } catch (err) {}
      }
    };

    eventNames.forEach(evt => window.addEventListener(evt, handleEvent));
    window.addEventListener('storage', handleStorage);

    return () => {
      eventNames.forEach(evt => window.removeEventListener(evt, handleEvent));
      window.removeEventListener('storage', handleStorage);
    };
  }, [JSON.stringify(domains)]);
}
