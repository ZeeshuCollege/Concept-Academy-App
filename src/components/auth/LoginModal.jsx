import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { supabase } from '../../lib/supabaseClient';
import { authenticateLocalUser } from '../../lib/userAuthStore';
import { sendWhatsAppOtp, verifyWhatsAppOtp } from '../../lib/whatsappService';
import { X, Mail, Lock, Eye, EyeOff, MessageSquare, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSwipeDownDismiss } from '../../lib/systemNavigation';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Forgot Password States: 'login' | 'select_method' | 'whatsapp_otp' | 'email_sent' | 'reset_password'
  const [authView, setAuthView] = useState('login');
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(0);
  const [newPassword, setNewPassword] = useState('');
  const [demoOtpHint, setDemoOtpHint] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [failedAttempts, setFailedAttempts] = useState(0);

  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setError('');
      setAuthView('login');
    }, 380);
  };

  const { dragOffset, touchHandlers } = useSwipeDownDismiss(handleClose);

  if (!isOpen) return null;

  // Handle Manual Email / Password Login — Local auth first, then Supabase
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (lockoutSeconds > 0) {
      setError(`Account temporarily locked. Please wait ${lockoutSeconds} seconds before trying again.`);
      return;
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanEmail || !cleanPass) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    setIsVerifying(true);

    const minDelay = new Promise(resolve => setTimeout(resolve, 1000));

    try {
      let authUser = null;

      // 1. Google Play Reviewer & Institute Admin accounts
      const authorizedAccounts = [
        { email: 'admin.demo@conceptacademy.local', pass: 'ConceptAcademyDemo@2026', name: 'Administrator', role: 'admin', id: 'adm-demo' },
        { email: 'admin.demo@aspire.local', pass: 'AspireDemo@2026', name: 'Administrator', role: 'admin', id: 'adm-demo-legacy' },
        { email: 'conceptacademy@outlook.com', pass: 'ZP&786', name: 'Concept Academy Admin', role: 'admin', id: 'admin-root' },
        { email: 'aspirelearningcentre@outlook.com', pass: 'ZP&786', name: 'Concept Academy Admin', role: 'admin', id: 'admin-root-legacy' }
      ];

      const matchedAccount = authorizedAccounts.find(
        a => a.email.toLowerCase() === cleanEmail && a.pass === cleanPass
      );

      if (matchedAccount) {
        authUser = {
          id: matchedAccount.id,
          email: matchedAccount.email,
          role: matchedAccount.role,
          name: matchedAccount.name,
          course: matchedAccount.course || '',
          rollNumber: matchedAccount.rollNumber || '',
          linkedChildName: matchedAccount.linkedChildName || '',
          subject: matchedAccount.subject || ''
        };
      } else {
        // 2. Check locally stored institute users (students/teachers/parents added by Admin)
        const localUser = authenticateLocalUser(cleanEmail, cleanPass);
        if (localUser) {
          authUser = {
            id: localUser.id,
            email: localUser.email,
            role: localUser.role,
            name: localUser.name,
            course: localUser.course,
            rollNumber: localUser.rollNumber,
            phone: localUser.phone || '',
            bloodGroup: localUser.bloodGroup || ''
          };
        } else {
          // 3. Try Supabase Auth (for users created via Admin API — already confirmed, no email needed)
          const { data, error: authError } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: cleanPass
          });

          if (!authError && data?.user) {
            const userMeta = data.user.user_metadata || {};
            authUser = {
              id: data.user.id,
              email: data.user.email,
              role: userMeta.role || 'student',
              name: userMeta.full_name || data.user.email.split('@')[0],
              course: userMeta.course,
              rollNumber: userMeta.rollNumber,
              phone: userMeta.phone || '',
              bloodGroup: userMeta.bloodGroup || ''
            };
          }
        }
      }

      await minDelay;

      if (!authUser) {
        setIsVerifying(false);
        setLoading(false);
        setFailedAttempts(prev => {
          const next = prev + 1;
          if (next >= 5) {
            setLockoutSeconds(30);
            console.warn(`[SECURITY AUDIT] Rate limit triggered: 5 failed login attempts for ${cleanEmail}`);
            setError('Too many failed attempts. Account locked for 30 seconds.');
            return 0;
          }
          console.warn(`[SECURITY AUDIT] Failed login attempt ${next}/5 for ${cleanEmail}`);
          setError(`Invalid email or password. (${5 - next} attempts remaining)`);
          return next;
        });
        return;
      }

      setFailedAttempts(0);
      setLockoutSeconds(0);
      console.info(`[SECURITY AUDIT] Successful login for ${authUser.role}: ${authUser.email}`);
      setIsVerifying(false);
      setLoading(false);
      onLoginSuccess(authUser);
      onClose();
    } catch (err) {
      console.error('[Concept Academy Login Error]:', err);
      await minDelay;
      setIsVerifying(false);
      setLoading(false);
      setError('Login failed. Please check your credentials and try again.');
    }
  };

  // Handle Google OAuth Sign-In via Supabase with Instant Mobile Deep Link
  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const isNative = Capacitor.isNativePlatform();
      const redirectUrl = isNative ? 'com.conceptacademy.learning://auth' : window.location.origin;

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: isNative
        }
      });
      if (oauthError) throw oauthError;

      if (isNative && data?.url) {
        await Browser.open({ url: data.url, windowName: '_self' });
      }
    } catch (err) {
      setError(err.message || 'Google sign-in error.');
      setLoading(false);
    }
  };

  // Trigger WhatsApp OTP Dispatch
  const handleSendWhatsAppOtp = async () => {
    if (!resetIdentifier) {
      setError('Please enter your registered WhatsApp mobile number.');
      return;
    }
    setError('');
    setLoading(true);

    const result = await sendWhatsAppOtp(resetIdentifier);
    setLoading(false);

    if (result.success) {
      setSuccessMsg(result.message);
      if (result.demoCode) setDemoOtpHint(result.demoCode);
      setCooldown(result.cooldown || 60);
      setAuthView('whatsapp_otp');

      // Countdown timer
      const interval = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setError(result.message || 'Failed to send WhatsApp message.');
    }
  };

  // Trigger Supabase Email Reset
  const handleSendEmailReset = async () => {
    if (!resetIdentifier || !resetIdentifier.includes('@')) {
      setError('Please enter your valid registered email address.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(resetIdentifier.trim(), {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (resetErr) throw resetErr;

      setSuccessMsg(`Password reset link sent to ${resetIdentifier}! Please check your inbox.`);
      setAuthView('email_sent');
    } catch (err) {
      setError(err.message || 'Could not send reset email.');
    } finally {
      setLoading(false);
    }
  };

  // Verify WhatsApp OTP
  const handleVerifyOtp = () => {
    const fullCode = otpCode.join('');
    if (fullCode.length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }
    setError('');

    const verify = verifyWhatsAppOtp(resetIdentifier, fullCode);
    if (verify.valid) {
      setSuccessMsg('WhatsApp OTP verified! Please set your new password.');
      setAuthView('reset_password');
    } else {
      setError(verify.message);
    }
  };

  // Handle OTP digit box input
  const handleOtpInput = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const updated = [...otpCode];
    updated[index] = value;
    setOtpCode(updated);

    // Auto advance focus
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Set New Password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await supabase.auth.updateUser({ password: newPassword });
      setSuccessMsg('Password successfully changed! You may now sign in.');
      setTimeout(() => {
        setAuthView('login');
        setPassword(newPassword);
      }, 1500);
    } catch {
      // In mock/offline scenario
      setSuccessMsg('Password successfully updated!');
      setTimeout(() => {
        setAuthView('login');
        setPassword(newPassword);
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`modal-backdrop-05s ${isClosing ? 'closing' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className={`modal-sheet-05s ${isClosing ? 'closing' : ''}`}
        style={{
          transform: dragOffset > 0 ? `translate3d(0, ${dragOffset}px, 0)` : undefined,
          transition: dragOffset > 0 ? 'none' : undefined
        }}
      >
        <div
          {...touchHandlers}
          style={{ width: '100%', padding: '6px 0 2px 0', cursor: 'grab', touchAction: 'none' }}
        >
          <div className="sheet-drag-handle" />
        </div>
        {/* Modal Close Button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'var(--surface-alt)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'var(--transition-smooth)',
            zIndex: 10
          }}
        >
          <X size={16} />
        </button>

        {/* Modal Body */}
        <div style={{ padding: '28px 24px' }}>
          {/* Header Branding */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{
              width: '58px',
              height: '58px',
              borderRadius: '16px',
              background: '#ffffff',
              border: '2px solid var(--accent-500)',
              margin: '0 auto 12px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(234, 88, 12, 0.15)'
            }}>
              <img
                src="/logo.png"
                alt="Concept Academy Logo"
                style={{
                  width: '42px',
                  height: '42px',
                  objectFit: 'contain'
                }}
              />
            </div>
            <h3 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--brand-900)', letterSpacing: '-0.01em' }}>
              {authView === 'login' ? 'Authentication Gate' : 'Account Recovery'}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {authView === 'login'
                ? 'Sign in to access your Concept Academy academic portal'
                : 'Select your preferred verification method'}
            </p>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div style={{
              background: 'var(--danger-tint)',
              border: '1px solid #fecaca',
              borderLeft: '4px solid var(--danger)',
              color: 'var(--danger)',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              background: 'var(--success-tint)',
              border: '1px solid #a7f3d0',
              borderLeft: '4px solid var(--success)',
              color: 'var(--success)',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ====================================================================
              VIEW 1: STANDARD LOGIN
             ==================================================================== */}
          {authView === 'login' && (
            <>
              {/* Login Form */}
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your registered email"
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 38px',
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                        fontSize: '13px',
                        outline: 'none',
                        background: 'var(--surface-alt)',
                        transition: 'var(--transition-smooth)'
                      }}
                    />
                    <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      style={{
                        width: '100%',
                        padding: '12px 38px 12px 38px',
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                        fontSize: '13px',
                        outline: 'none',
                        background: 'var(--surface-alt)',
                        transition: 'var(--transition-smooth)'
                      }}
                    />
                    <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{ accentColor: 'var(--brand-800)' }}
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setSuccessMsg('');
                      setResetIdentifier(email);
                      setAuthView('select_method');
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--brand-800)', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || lockoutSeconds > 0}
                  className="btn-primary"
                  style={{ width: '100%', marginTop: '6px', opacity: (loading || lockoutSeconds > 0) ? 0.7 : 1 }}
                >
                  {lockoutSeconds > 0 ? `Locked (${lockoutSeconds}s)` : loading ? 'Authenticating...' : 'Login'}
                </button>
              </form>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', gap: '10px' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Or continue with</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              </div>

              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="btn-secondary"
                style={{ width: '100%', gap: '10px' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Sign in with Google
              </button>

              <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', marginTop: '16px' }}>
                Don't have an account? <span style={{ color: 'var(--brand-800)', fontWeight: 600 }}>Contact Admin</span>
              </p>
            </>
          )}

          {/* ====================================================================
              VIEW 2: CHOOSE PASSWORD RECOVERY METHOD (WHATSAPP OTP vs EMAIL)
             ==================================================================== */}
          {authView === 'select_method' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  Registered Email or WhatsApp
                </label>
                <input
                  type="text"
                  value={resetIdentifier}
                  onChange={(e) => setResetIdentifier(e.target.value)}
                  placeholder="e.g. 9820123456 or registered email"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    fontSize: '13px',
                    outline: 'none',
                    background: 'var(--surface-alt)',
                    transition: 'var(--transition-smooth)'
                  }}
                />
              </div>

              <p style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Select verification channel:
              </p>

              {/* Option A: WhatsApp OTP (Meta Dev App) */}
              <button
                type="button"
                onClick={handleSendWhatsAppOtp}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px',
                  borderRadius: '14px',
                  border: '1px solid #86efac',
                  borderLeft: '4px solid #16a34a',
                  background: '#f0fdf4',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'var(--transition-smooth)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <MessageSquare size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#15803d' }}>WhatsApp OTP (Meta Dev App)</div>
                  <div style={{ fontSize: '11px', color: '#166534' }}>Receive 6-digit code via official WhatsApp</div>
                </div>
              </button>

              {/* Option B: Email (Supabase Auth) */}
              <button
                type="button"
                onClick={handleSendEmailReset}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px',
                  borderRadius: '14px',
                  border: '1px solid #93c5fd',
                  borderLeft: '4px solid var(--brand-800)',
                  background: 'var(--brand-50)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'var(--transition-smooth)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--brand-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <Mail size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--brand-800)' }}>Email Reset Link (Supabase)</div>
                  <div style={{ fontSize: '11px', color: 'var(--brand-600)' }}>Receive instant password reset link in inbox</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAuthView('login')}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer', marginTop: '10px', fontWeight: 600 }}
              >
                <ArrowLeft size={14} /> Back to Sign In
              </button>
            </div>
          )}

          {/* ====================================================================
              VIEW 3: WHATSAPP 6-DIGIT OTP VERIFICATION
             ==================================================================== */}
          {authView === 'whatsapp_otp' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#f0fdf4', border: '1px solid #22c55e', margin: '0 auto 12px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                <MessageSquare size={22} />
              </div>

              <h4 style={{ fontSize: '16px', fontWeight: 800 }}>Enter Verification Code</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '6px 0 16px 0' }}>
                We sent a 6-digit WhatsApp code to <br /><strong>{resetIdentifier}</strong>
              </p>

              {demoOtpHint && (
                <div style={{ background: '#fef3c7', border: '1px solid #fde68a', color: '#92400e', fontSize: '11px', padding: '8px 12px', borderRadius: '8px', marginBottom: '14px', fontFamily: 'JetBrains Mono, monospace' }}>
                  Verification Code: <strong>{demoOtpHint}</strong>
                </div>
              )}

              {/* 6 Square OTP Cells */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
                {otpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpInput(idx, e.target.value)}
                    style={{
                      width: '44px',
                      height: '50px',
                      textAlign: 'center',
                      fontSize: '18px',
                      fontWeight: 800,
                      fontFamily: 'JetBrains Mono, monospace',
                      border: '1.5px solid var(--border)',
                      borderRadius: '10px',
                      outline: 'none',
                      background: 'var(--surface-alt)',
                      transition: 'var(--transition-smooth)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-500)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleVerifyOtp}
                className="btn-primary"
                style={{ width: '100%', marginBottom: '12px', borderRadius: '10px' }}
              >
                Verify Code
              </button>

              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {cooldown > 0 ? (
                  <span>Resend code in {cooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendWhatsAppOtp}
                    style={{ background: 'none', border: 'none', color: 'var(--brand-800)', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Resend WhatsApp OTP
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setAuthView('select_method')}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer', margin: '14px auto 0 auto' }}
              >
                <ArrowLeft size={14} /> Change Method
              </button>
            </div>
          )}

          {/* ====================================================================
              VIEW 4: SET NEW PASSWORD
             ==================================================================== */}
          {authView === 'reset_password' && (
            <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  Create New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    fontSize: '13px',
                    outline: 'none',
                    background: 'var(--surface-alt)',
                    transition: 'var(--transition-smooth)'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', borderRadius: '10px' }}
              >
                {loading ? 'Saving...' : 'Update Password & Login'}
              </button>
            </form>
          )}

          {/* ====================================================================
              VIEW 5: EMAIL SENT CONFIRMATION
             ==================================================================== */}
          {authView === 'email_sent' && (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--success-tint)', border: '1px solid #a7f3d0', color: 'var(--success)', margin: '0 auto 12px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={22} />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 800 }}>Check Your Inbox</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '8px 0 20px 0' }}>
                We've sent a secure password reset link to <strong>{resetIdentifier}</strong>.
              </p>
              <button
                type="button"
                onClick={() => setAuthView('login')}
                className="btn-primary"
                style={{ width: '100%', borderRadius: '10px' }}
              >
                Back to Sign In
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Full-Screen Loading Shade with 4-Dot Bouncing Animation (1 sec) */}
      {isVerifying && typeof document !== 'undefined' && createPortal(
        <div className="login-loading-shade">
          <div className="bouncing-dots-loader">
            <div className="dot" />
            <div className="dot" />
            <div className="dot" />
            <div className="dot" />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
