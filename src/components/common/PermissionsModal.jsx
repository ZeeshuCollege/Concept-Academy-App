import React, { useState, useEffect } from 'react';
import { Bell, Camera, Mic, HardDrive, ShieldCheck, CheckCircle2, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import {
  checkCurrentPermissions,
  requestAllPermissions,
  requestNotificationPermission,
  requestCameraPermission,
  requestMicrophonePermission,
  markPermissionsCompleted
} from '../../lib/permissions';

export default function PermissionsModal({ isOpen, onClose }) {
  const [statuses, setStatuses] = useState({
    notifications: 'prompt', // 'prompt' | 'requesting' | 'granted' | 'denied'
    camera: 'prompt'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStep, setActiveStep] = useState(null); // 'notifications' | 'camera' | null
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkCurrentPermissions().then(res => {
        setStatuses({
          notifications: res.notifications === 'granted' ? 'granted' : (res.notifications === 'denied' ? 'denied' : 'prompt'),
          camera: res.camera === 'granted' ? 'granted' : (res.camera === 'denied' ? 'denied' : 'prompt')
        });
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGrantAll = async () => {
    setIsProcessing(true);

    await requestAllPermissions((permKey, state) => {
      setActiveStep(permKey);
      setStatuses(prev => ({ ...prev, [permKey]: state }));
    });

    setIsProcessing(false);
    setActiveStep(null);
    setIsDone(true);
  };

  const handleRequestSingle = async (key) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setActiveStep(key);
    setStatuses(prev => ({ ...prev, [key]: 'requesting' }));

    let granted = false;
    if (key === 'notifications') {
      granted = await requestNotificationPermission();
    } else if (key === 'camera') {
      granted = await requestCameraPermission();
    } else if (key === 'microphone') {
      granted = await requestMicrophonePermission();
    }

    setStatuses(prev => ({ ...prev, [key]: granted ? 'granted' : 'denied' }));
    setIsProcessing(false);
    setActiveStep(null);
  };

  const handleFinish = () => {
    markPermissionsCompleted();
    onClose();
  };

  const handleSkip = () => {
    markPermissionsCompleted();
    onClose();
  };

  const getStatusBadge = (statusKey) => {
    const status = statuses[statusKey];
    if (status === 'requesting') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 8px',
          borderRadius: '999px',
          fontSize: '11px',
          fontWeight: 700,
          background: '#fef3c7',
          color: '#d97706'
        }}>
          <Loader2 size={11} className="spin-animation" /> Asking...
        </span>
      );
    }
    if (status === 'granted') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 8px',
          borderRadius: '999px',
          fontSize: '11px',
          fontWeight: 700,
          background: '#dcfce7',
          color: '#16a34a'
        }}>
          <CheckCircle2 size={12} /> Allowed
        </span>
      );
    }
    if (status === 'denied') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 8px',
          borderRadius: '999px',
          fontSize: '11px',
          fontWeight: 700,
          background: '#fee2e2',
          color: '#dc2626'
        }}>
          <AlertCircle size={12} /> Denied
        </span>
      );
    }
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 8px',
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: 600,
        background: 'var(--surface-alt)',
        color: 'var(--text-secondary)'
      }}>
        Required
      </span>
    );
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      animation: 'fadeIn 0.25s ease-out'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: 'var(--surface)',
        borderRadius: '24px 24px 0 0',
        padding: '24px 20px 32px 20px',
        boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        maxHeight: '92vh',
        overflowY: 'auto',
        animation: 'slideUpSheet 0.32s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Top Handle Bar */}
        <div style={{ width: '40px', height: '4px', borderRadius: '4px', background: 'var(--border)', margin: '0 auto -4px auto' }} />

        {/* Header Icon + Title */}
        <div style={{ textAlign: 'center', padding: '6px 0 4px 0' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #1e3a8a 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 8px 20px rgba(14, 165, 233, 0.35)',
            marginBottom: '12px'
          }}>
            <ShieldCheck size={28} />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--brand-900)', margin: '0 0 6px 0' }}>
            Device Permissions
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
            To give you real-time alerts, classroom interaction, and offline study materials, please allow access on this device.
          </p>
        </div>

        {/* Permission List Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Notifications */}
          <div
            onClick={() => handleRequestSingle('notifications')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: '14px',
              background: activeStep === 'notifications' ? '#f0f9ff' : 'var(--surface-alt)',
              border: activeStep === 'notifications' ? '1.5px solid #0ea5e9' : '1px solid var(--border)',
              transition: 'all 0.2s ease',
              cursor: isProcessing ? 'default' : 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, paddingRight: '8px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Bell size={20} />
              </div>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--brand-900)', display: 'block' }}>
                  Notifications
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.3, display: 'block', marginTop: '2px' }}>
                  Lecture reminders, test schedules & announcements
                </span>
              </div>
            </div>
            <div>
              {getStatusBadge('notifications')}
            </div>
          </div>

          {/* Camera */}
          <div
            onClick={() => handleRequestSingle('camera')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: '14px',
              background: activeStep === 'camera' ? '#f0f9ff' : 'var(--surface-alt)',
              border: activeStep === 'camera' ? '1.5px solid #0ea5e9' : '1px solid var(--border)',
              transition: 'all 0.2s ease',
              cursor: isProcessing ? 'default' : 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, paddingRight: '8px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#f0fdf4',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Camera size={20} />
              </div>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--brand-900)', display: 'block' }}>
                  Camera
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.3, display: 'block', marginTop: '2px' }}>
                  Scan QR codes, paper submissions & profile pictures
                </span>
              </div>
            </div>
            <div>
              {getStatusBadge('camera')}
            </div>
          </div>

          {/* Storage / Files */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            borderRadius: '14px',
            background: 'var(--surface-alt)',
            border: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, paddingRight: '8px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#faf5ff',
                color: '#9333ea',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <HardDrive size={20} />
              </div>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--brand-900)', display: 'block' }}>
                  Storage & Cache
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.3, display: 'block', marginTop: '2px' }}>
                  Offline question papers, formulas & PDF downloads
                </span>
              </div>
            </div>
            <div>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 700,
                background: '#dcfce7',
                color: '#16a34a'
              }}>
                <CheckCircle2 size={12} /> Ready
              </span>
            </div>
          </div>
        </div>

        {/* Privacy Note */}
        <div style={{
          padding: '10px 12px',
          background: 'var(--surface-alt)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11px',
          color: 'var(--text-muted)'
        }}>
          <ShieldCheck size={16} color="var(--brand-800)" style={{ flexShrink: 0 }} />
          <span>Your privacy is protected. Concept Academy only activates these permissions during academic features.</span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
          {!isDone ? (
            <>
              <button
                type="button"
                onClick={handleGrantAll}
                disabled={isProcessing}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  fontSize: '15px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(14, 165, 233, 0.4)'
                }}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={18} className="spin-animation" />
                    <span>Please Confirm on Screen...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Grant All Permissions</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSkip}
                disabled={isProcessing}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Maybe Later
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                fontSize: '15px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
              }}
            >
              <CheckCircle2 size={18} />
              <span>Continue to Concept Academy App</span>
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUpSheet {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .spin-animation {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
