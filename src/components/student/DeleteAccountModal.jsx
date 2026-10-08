import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function DeleteAccountModal({ isOpen, onClose, user, onAccountDeleted }) {
  const [confirmed, setConfirmed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (!confirmed) {
      setErrorMsg('Please confirm that you understand this action cannot be undone.');
      return;
    }

    setIsDeleting(true);
    setErrorMsg('');

    try {
      // 1. Delete from Supabase profiles table
      if (user?.id) {
        await supabase
          .from('profiles')
          .delete()
          .eq('id', user.id);
      } else if (user?.email) {
        await supabase
          .from('profiles')
          .delete()
          .eq('email', user.email);
      }

      // 2. Clean up local stored session data
      try {
        localStorage.removeItem('concept_academy_current_user');
        localStorage.removeItem('aspire_current_user');
        localStorage.removeItem('concept_academy_user_role');
        localStorage.removeItem('aspire_user_role');
        const creds = JSON.parse(localStorage.getItem('concept_academy_creds_v1') || localStorage.getItem('aspire_creds_v1') || '{}');
        if (user?.email) {
          delete creds[user.email.toLowerCase()];
          localStorage.setItem('concept_academy_creds_v1', JSON.stringify(creds));
          localStorage.setItem('aspire_creds_v1', JSON.stringify(creds));
        }
      } catch (e) {}

      setSuccessMsg('Your account and associated academic records have been permanently deleted.');

      setTimeout(() => {
        if (onAccountDeleted) {
          onAccountDeleted();
        } else {
          window.location.reload();
        }
      }, 1800);
    } catch (err) {
      console.error('Account deletion error:', err);
      setErrorMsg('Failed to process deletion. Please try again or visit the online deletion portal.');
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="modal-backdrop-05s"
      onClick={(e) => { if (e.target === e.currentTarget && !isDeleting) onClose(); }}
    >
      <div
        className="modal-sheet-05s"
        style={{
          padding: '24px 20px',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <div className="sheet-drag-handle" />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trash2 size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#991b1b', margin: 0 }}>
                Delete Account & Data
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Google Play Data Safety Compliance
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            style={{
              background: 'var(--surface-alt)',
              border: '1px solid var(--border)',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={15} />
          </button>
        </div>

        {successMsg ? (
          <div style={{ textAlign: 'center', padding: '24px 10px' }}>
            <CheckCircle2 size={44} color="#16a34a" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--brand-900)', margin: '0 0 8px 0' }}>
              Account Successfully Deleted
            </h4>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>
              {successMsg} Logging you out...
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              padding: '12px 14px',
              color: '#991b1b',
              fontSize: '12px',
              lineHeight: 1.5
            }}>
              <strong>⚠️ Permanent Action:</strong> Deleting your account will immediately and permanently erase:
              <ul style={{ margin: '6px 0 0 0', paddingLeft: '18px' }}>
                <li>Your profile details and login credentials</li>
                <li>All batch attendance records</li>
                <li>Your test scores, report cards and rankings</li>
                <li>Digital fee payment history and linked child links</li>
              </ul>
            </div>

            {errorMsg && (
              <div style={{ background: '#fff1f2', border: '1px solid #fda4af', padding: '10px 12px', borderRadius: '8px', color: '#be123c', fontSize: '12px' }}>
                {errorMsg}
              </div>
            )}

            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              background: 'var(--surface-alt)',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border)'
            }}>
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                style={{ marginTop: '2px' }}
              />
              <span>
                I understand that this action is irreversible and all my educational records will be wiped from Concept Academy servers.
              </span>
            </label>

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className="btn-secondary"
                style={{ flex: 1, padding: '11px', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={!confirmed || isDeleting}
                style={{
                  flex: 1,
                  padding: '11px',
                  fontSize: '13px',
                  fontWeight: 700,
                  borderRadius: '10px',
                  border: 'none',
                  background: confirmed && !isDeleting ? '#dc2626' : '#fca5a5',
                  color: '#ffffff',
                  cursor: confirmed && !isDeleting ? 'pointer' : 'not-allowed',
                  transition: 'background 0.15s ease'
                }}
              >
                {isDeleting ? 'Deleting...' : 'Delete My Account'}
              </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '4px' }}>
              <a
                href="/delete-account.html"
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '11px', color: 'var(--brand-700)', textDecoration: 'none', fontWeight: 600 }}
              >
                Or visit our Web Deletion Portal &rarr;
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
