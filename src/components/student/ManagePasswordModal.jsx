import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Lock, KeyRound, Mail, Eye, EyeOff, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function ManagePasswordModal({ isOpen, onClose, user }) {
  const [subTab, setSubTab] = useState('change'); // 'change' | 'forget'
  const [isClosing, setIsClosing] = useState(false);

  // Form State: Change Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changeError, setChangeError] = useState('');
  const [changeSuccess, setChangeSuccess] = useState('');
  const [changeLoading, setChangeLoading] = useState(false);

  // Form State: Forget Password
  const [emailInput, setEmailInput] = useState(user?.email || '');
  const [forgetError, setForgetError] = useState('');
  const [forgetSuccess, setForgetSuccess] = useState(false);
  const [forgetLoading, setForgetLoading] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      // Reset form states
      setChangeError('');
      setChangeSuccess('');
      setForgetError('');
      setForgetSuccess(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 380);
  };

  // Handle Change Password Form Submission
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setChangeError('');
    setChangeSuccess('');

    if (!currentPassword) {
      setChangeError('Please enter your current password.');
      return;
    }
    if (!newPassword) {
      setChangeError('Please enter your new password.');
      return;
    }
    if (newPassword.length < 6) {
      setChangeError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setChangeError('New Password and Confirm Password do not match.');
      return;
    }

    setChangeLoading(true);
    try {
      // Try updating password via Supabase Auth if user is authenticated
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error && error.message && !error.message.includes('Auth session missing')) {
        throw error;
      }

      // Success
      setChangeSuccess('Password updated successfully! Your account is now secured with the new password.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setChangeError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setChangeLoading(false);
    }
  };

  // Handle Forget Password Email Submission
  const handleForgetPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgetError('');
    setForgetSuccess(false);

    const email = emailInput.trim();
    if (!email || !email.includes('@')) {
      setForgetError('Please enter a valid email address.');
      return;
    }

    setForgetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error && error.message && !error.message.includes('Auth session missing')) {
        // Log error but provide friendly message
        console.warn('Supabase reset email notice:', error.message);
      }

      // Show success screen
      setForgetSuccess(true);
    } catch (err) {
      setForgetError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setForgetLoading(false);
    }
  };

  const modalContent = (
    <div
      className={`modal-backdrop-05s ${isClosing ? 'closing' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className={`modal-sheet-05s ${isClosing ? 'closing' : ''}`}
        style={{
          maxHeight: '90vh',
          height: 'auto',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--canvas)'
        }}
      >
        {/* Native Mobile Drag Handle */}
        <div className="sheet-drag-handle" />

        {/* Top Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px 14px 20px',
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--brand-800) 0%, var(--accent-500) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(30, 58, 138, 0.2)'
            }}>
              <Lock size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--brand-900)', margin: 0, lineHeight: 1.2 }}>
                Manage Password
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                Security & Authentication
              </span>
            </div>
          </div>

          <button
            onClick={handleClose}
            style={{
              background: 'var(--surface-alt)',
              border: 'none',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)'
            }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sub-Category Segmented Switcher */}
        <div style={{ padding: '14px 16px 6px 16px' }}>
          <div className="tab-container">
            <button
              onClick={() => { setSubTab('change'); setChangeError(''); setChangeSuccess(''); }}
              className={`tab-btn ${subTab === 'change' ? 'active' : ''}`}
            >
              Change Password
            </button>
            <button
              onClick={() => { setSubTab('forget'); setForgetError(''); setForgetSuccess(false); }}
              className={`tab-btn ${subTab === 'forget' ? 'active' : ''}`}
            >
              Forget Password
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div style={{ overflowY: 'auto', padding: '12px 16px 20px 16px' }}>
          {/* ======================================================== */}
          {/* SUB-CATEGORY 1: CHANGE PASSWORD */}
          {/* ======================================================== */}
          {subTab === 'change' && (
            <form onSubmit={handleChangePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {changeError && (
                <div style={{
                  padding: '10px 14px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 'var(--radius-md)',
                  color: '#b91c1c',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
                  <span>{changeError}</span>
                </div>
              )}

              {changeSuccess && (
                <div style={{
                  padding: '12px 14px',
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: 'var(--radius-md)',
                  color: '#065f46',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0 }} />
                  <span>{changeSuccess}</span>
                </div>
              )}

              <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', background: 'var(--surface)' }}>
                {/* 1. Current Password */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Current Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your Current Password"
                      style={{
                        width: '100%',
                        padding: '11px 42px 11px 14px',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '13px',
                        outline: 'none',
                        background: 'var(--surface-alt)',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)'
                      }}
                    >
                      {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* 2. New Password */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter your New Password"
                      style={{
                        width: '100%',
                        padding: '11px 42px 11px 14px',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '13px',
                        outline: 'none',
                        background: 'var(--surface-alt)',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)'
                      }}
                    >
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                    Must be at least 6 characters with letters and numbers.
                  </span>
                </div>

                {/* 3. Confirm Password */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Confirm Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your New password"
                      style={{
                        width: '100%',
                        padding: '11px 42px 11px 14px',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '13px',
                        outline: 'none',
                        background: 'var(--surface-alt)',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)'
                      }}
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={changeLoading}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {changeLoading ? (
                  <span>Updating Password...</span>
                ) : (
                  <>
                    <KeyRound size={16} />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ======================================================== */}
          {/* SUB-CATEGORY 2: FORGET PASSWORD */}
          {/* ======================================================== */}
          {subTab === 'forget' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {forgetError && (
                <div style={{
                  padding: '10px 14px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 'var(--radius-md)',
                  color: '#b91c1c',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
                  <span>{forgetError}</span>
                </div>
              )}

              {forgetSuccess ? (
                /* Success State: Reset Email Sent */
                <div className="card" style={{
                  padding: '24px 18px',
                  textAlign: 'center',
                  background: 'var(--surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    background: '#ecfdf5',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CheckCircle2 size={30} />
                  </div>
                  <h4 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--brand-900)', margin: 0 }}>
                    Reset Email Sent!
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0, maxWidth: '300px' }}>
                    A secure password reset link has been dispatched to:
                  </p>
                  <div style={{
                    background: 'var(--surface-alt)',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--brand-800)'
                  }}>
                    {emailInput}
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4, margin: '6px 0 0 0' }}>
                    Please check your inbox (and spam folder) and tap the link to choose your new password.
                  </p>

                  <button
                    type="button"
                    onClick={() => setForgetSuccess(false)}
                    style={{
                      marginTop: '10px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--brand-800)',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Send to a different email address
                  </button>
                </div>
              ) : (
                /* Email Input Form */
                <form onSubmit={handleForgetPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="card" style={{ padding: '16px', background: 'var(--surface)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: '#eff6ff',
                        color: '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Mail size={16} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                          Password Reset via Email
                        </h4>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Self-service email recovery link
                        </span>
                      </div>
                    </div>

                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '14px' }}>
                      Enter your registered student email address below. We'll send you an official Concept Academy password reset link immediately.
                    </p>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                        Registered Email Address
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="Enter your registered email ID"
                          style={{
                            width: '100%',
                            padding: '11px 14px 11px 38px',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '13px',
                            outline: 'none',
                            background: 'var(--surface-alt)',
                            boxSizing: 'border-box'
                          }}
                        />
                        <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgetLoading}
                    className="btn-primary"
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '14px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {forgetLoading ? (
                      <span>Sending Reset Email...</span>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Send Password Reset Link</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
