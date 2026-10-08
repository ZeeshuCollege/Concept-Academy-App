import { Capacitor, registerPlugin } from '@capacitor/core';
import { supabase } from './supabaseClient';

const NativeAppPermissions = registerPlugin('AppPermissions');

// BroadcastChannel for instant same-browser cross-tab synchronization
let noticesBroadcastChannel = null;
let legacyNoticesBroadcastChannel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    noticesBroadcastChannel = new BroadcastChannel('concept_academy_notices_channel');
    legacyNoticesBroadcastChannel = new BroadcastChannel('aspire_notices_channel');
  }
} catch (e) {
  console.warn('BroadcastChannel not supported:', e);
}

// Global active Supabase Realtime Channel for instant cross-device broadcast
let activeSupabaseChannel = null;

function getSupabaseLiveChannel() {
  if (activeSupabaseChannel) return activeSupabaseChannel;
  if (!supabase) return null;

  try {
    activeSupabaseChannel = supabase.channel('concept_academy_live_notices', {
      config: {
        broadcast: {
          self: false // Do not echo notice back to the posting device
        }
      }
    });
    activeSupabaseChannel.subscribe((status) => {
      console.log('[Supabase Realtime Channel status]:', status);
    });
    return activeSupabaseChannel;
  } catch (err) {
    console.warn('[NotificationService] Error initializing Supabase channel:', err);
    return null;
  }
}

/**
 * Triggers a real, native OS/system notification pop-up (Heads-up notification banner).
 * On Android: Uses AppPermissionsPlugin NotificationCompat with HIGH importance channel for a heads-up banner pop-up.
 * On Browser: Uses HTML5 Notification API.
 */
export async function sendSystemNotification({ title, message, body, id }) {
  const notifTitle = title || '📢 Concept Academy';
  const notifMessage = message || body || 'New notice posted by Concept Academy';
  const notifId = id
    ? (typeof id === 'number' ? id : Math.abs(String(id).split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0)))
    : Date.now();

  // 1. Android Native via Capacitor bridge
  if (Capacitor.isNativePlatform()) {
    try {
      const res = await NativeAppPermissions.showSystemNotification({
        title: notifTitle,
        message: notifMessage,
        body: notifMessage,
        id: notifId
      });
      return res;
    } catch (err) {
      console.warn('[NotificationService] Native Android notification call failed:', err);
    }
  }

  // 2. Web Notification Fallback
  try {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        const notif = new Notification(notifTitle, {
          body: notifMessage,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: String(notifId),
          vibrate: [200, 100, 200]
        });
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
        return { success: true };
      } else if (Notification.permission !== 'denied') {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          new Notification(notifTitle, {
            body: notifMessage,
            icon: '/favicon.ico',
            tag: String(notifId)
          });
          return { success: true };
        }
      }
    }
  } catch (err) {
    console.warn('[NotificationService] Web notification failed:', err);
  }

  return { success: false };
}

/**
 * Persists a notice to Supabase Cloud so any other device (even if offline or opened later)
 * will fetch and receive it.
 */
export async function saveNoticeToCloud(notice) {
  if (!supabase || !notice) return;

  try {
    const recordId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `00000000-0000-4000-8000-${Date.now().toString().slice(-12).padStart(12, '0')}`;

    const coursesArray = notice.courses || notice.targetCourses || ['All Courses'];

    const cloudRecord = {
      id: recordId,
      batch_id: 'concept_academy_notices',
      batch_name: notice.title || 'Notice',
      subject: JSON.stringify({
        category: notice.category || 'General',
        targetCourses: coursesArray,
        noticeId: notice.id,
        date: notice.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        timestamp: notice.timestamp || 'Just now',
        priority: notice.priority || 'normal'
      }),
      teacher_name: 'Admin',
      student_id: 'notice_payload',
      student_name: notice.message || '',
      roll: 'notice',
      status: 'Present',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      locked: false,
      updated_by: 'admin',
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('attendance_records').insert(cloudRecord);
    if (error) {
      console.warn('[NotificationService] Cloud save warning:', error.message);
    } else {
      console.log('[NotificationService] Notice successfully saved to cloud');
    }
  } catch (err) {
    console.warn('[NotificationService] Exception saving notice to cloud:', err);
  }
}

/**
 * Fetches the latest notices from Supabase Cloud.
 */
export async function fetchNoticesFromCloud() {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .in('batch_id', ['concept_academy_notices', 'aspire_notices'])
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.warn('[NotificationService] fetchNoticesFromCloud error:', error.message);
      return [];
    }

    if (Array.isArray(data)) {
      return data.map(row => {
        let meta = {};
        try {
          meta = JSON.parse(row.subject || '{}');
        } catch (e) {}

        const courses = meta.targetCourses || ['All Courses'];

        return {
          id: meta.noticeId || row.id,
          cloudId: row.id,
          title: row.batch_name || 'Notice',
          message: row.student_name || '',
          category: meta.category || 'General',
          courses: courses,
          targetCourses: courses,
          priority: meta.priority || 'normal',
          date: meta.date || row.date,
          timestamp: meta.timestamp || row.time,
          createdAt: row.created_at,
          read: false
        };
      });
    }
  } catch (err) {
    console.warn('[NotificationService] fetchNoticesFromCloud exception:', err);
  }
  return [];
}

/**
 * Broadcasts a newly created notice across:
 * 1. Supabase Cloud Database (so other devices can fetch it)
 * 2. Supabase Realtime Channel (so active other devices get it immediately)
 * 3. BroadcastChannel (for other tabs on the same computer)
 * 4. Local CustomEvent (for active components in the current window)
 *
 * NOTE: The posting admin does NOT receive a popup for their own notice.
 */
export function broadcastNotice(notice) {
  if (!notice) return;

  // 1. Persist to Cloud Database
  saveNoticeToCloud(notice);

  // 2. Broadcast via Supabase Realtime channel across physical devices
  try {
    const channel = getSupabaseLiveChannel();
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'new_notice',
        payload: { notice }
      }).catch(err => {
        console.warn('[NotificationService] Supabase broadcast send error:', err);
      });
    }
  } catch (e) {
    console.warn('[NotificationService] Supabase broadcast error:', e);
  }

  // 3. BroadcastChannel for other tabs on the same browser
  if (noticesBroadcastChannel) {
    try {
      noticesBroadcastChannel.postMessage({
        type: 'NEW_NOTICE',
        notice
      });
    } catch (e) {}
  }

  // 4. Local CustomEvent for components in current window
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('concept_academy:new-notice', { detail: { notice } }));
    window.dispatchEvent(new CustomEvent('aspire:new-notice', { detail: { notice } }));
  }
}

/**
 * Listen for notices broadcasted from other devices, tabs, or admin.
 * Connects to:
 * 1. Supabase Realtime WebSocket broadcast
 * 2. BroadcastChannel
 * 3. Local CustomEvent
 */
export function subscribeToNoticeBroadcasts(onNoticeReceived) {
  // 1. Supabase Realtime Cross-Device Listener
  let channel = null;
  try {
    channel = getSupabaseLiveChannel();
    if (channel) {
      channel.on('broadcast', { event: 'new_notice' }, (response) => {
        const incomingNotice = response?.payload?.notice || response?.payload;
        if (incomingNotice) {
          console.log('[NotificationService] Received cross-device notice via Supabase:', incomingNotice);
          onNoticeReceived(incomingNotice);
        }
      });
    }
  } catch (err) {
    console.warn('[NotificationService] Error subscribing to Supabase broadcast:', err);
  }

  // 2. BroadcastChannel (same browser multi-tab)
  const channelListener = (event) => {
    if (event?.data?.type === 'NEW_NOTICE' && event?.data?.notice) {
      onNoticeReceived(event.data.notice);
    }
  };

  // 3. Window CustomEvent
  const windowListener = (event) => {
    if (event?.detail?.notice) {
      onNoticeReceived(event.detail.notice);
    }
  };

  if (noticesBroadcastChannel) {
    noticesBroadcastChannel.addEventListener('message', channelListener);
  }
  if (legacyNoticesBroadcastChannel) {
    legacyNoticesBroadcastChannel.addEventListener('message', channelListener);
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('concept_academy:new-notice', windowListener);
    window.addEventListener('aspire:new-notice', windowListener);
  }

  return () => {
    if (noticesBroadcastChannel) {
      noticesBroadcastChannel.removeEventListener('message', channelListener);
    }
    if (legacyNoticesBroadcastChannel) {
      legacyNoticesBroadcastChannel.removeEventListener('message', channelListener);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('concept_academy:new-notice', windowListener);
      window.removeEventListener('aspire:new-notice', windowListener);
    }
  };
}
