import React, { useState, useEffect } from 'react';
import { CheckCircle2, Download } from 'lucide-react';
import { getStoredFees, formatFeeAmount, formatFeeFraction } from '../../lib/feeService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { downloadBlobFile } from '../../lib/exportDataService';
import { useDataSync } from '../../lib/syncEvents';

export default function ParentFees({ childName = 'Student' }) {
  const [feeRecord, setFeeRecord] = useState(null);

  const loadFees = () => {
    const fees = getStoredFees();
    const match = fees.find(f => (f.name || '').toLowerCase() === (childName || '').toLowerCase()) || fees[0];
    setFeeRecord(match || {
      name: childName,
      totalFee: 0,
      paidFee: 0,
      isFullyPaid: true,
      course: ''
    });
  };

  useDataSync(['fees'], loadFees);

  useEffect(() => {
    loadFees();
  }, [childName]);

  const total = feeRecord ? Number(feeRecord.totalFee) || 0 : 20000;
  const paid = feeRecord ? Number(feeRecord.paidFee) || 0 : 11000;
  const pending = Math.max(0, total - paid);
  const isFull = feeRecord ? (feeRecord.isFullyPaid || (paid >= total && total > 0)) : false;
  const paidPct = total > 0 ? Math.min(100, Math.max(0, Math.round((paid / total) * 100))) : 0;

  const handleDownloadReceipt = async () => {
    try {
      const doc = new jsPDF();
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 35, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text('CONCEPT ACADEMY', 14, 18);
      doc.setFontSize(10);
      doc.setTextColor(203, 213, 225);
      doc.text('FEE PAYMENT OFFICIAL RECEIPT', 14, 27);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(11);
      doc.text(`Receipt No: CA-2025-089`, 14, 45);
      doc.text(`Date: ${feeRecord?.lastPaymentDate || '15 Sep 2026'}`, 14, 52);
      doc.text(`Student Name: ${childName}`, 14, 59);
      doc.text(`Course: ${feeRecord?.course || 'Academic Year 2025-26'}`, 14, 66);

      autoTable(doc, {
        startY: 75,
        head: [['Particulars', 'Total Amount', 'Paid Amount', 'Status']],
        body: [
          [
            'Tuition & Course Fee',
            `Rs. ${total.toLocaleString('en-IN')}`,
            `Rs. ${paid.toLocaleString('en-IN')}`,
            isFull ? 'PAID IN FULL' : `BALANCE: Rs. ${pending.toLocaleString('en-IN')}`
          ]
        ],
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42] }
      });

      const blob = doc.output('blob');
      await downloadBlobFile(blob, `Concept Academy Data - Receipt ${childName}.pdf`);
    } catch (e) {
      console.error('Receipt download error:', e);
    }
  };

  return (
    <div className="view-transition-enter" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '90px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--brand-900)', margin: 0, letterSpacing: '-0.02em' }}>
            Fee Account Ledger
          </h3>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            STUDENT: <b>{feeRecord?.name || childName}</b> ({feeRecord?.course || '12th Science'})
          </span>
        </div>
        {isFull ? (
          <span className="badge badge-success">
            <CheckCircle2 size={12} /> FULL PAID
          </span>
        ) : (
          <span className="badge badge-warning">
            ACTIVE DUES
          </span>
        )}
      </div>

      {/* Main Fee Summary Card - Sharp Box */}
      <div className="card" style={{ padding: '18px', borderLeft: isFull ? '4px solid var(--success)' : '4px solid var(--brand-700)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
            ACADEMIC SESSION (2025-26)
          </span>
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--brand-900)', fontFamily: 'var(--font-mono)' }}>
            {formatFeeFraction(paid, total)}
          </span>
        </div>
        <h2 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--brand-900)', marginTop: '4px', letterSpacing: '-0.02em' }}>
          ₹{total.toLocaleString('en-IN')} <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600 }}>({formatFeeAmount(total)})</span>
        </h2>

        {/* Paid vs Pending Breakdown */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
          <div>
            <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>PAID LEDGER</span>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>
              ₹{paid.toLocaleString('en-IN')}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>OUTSTANDING</span>
            <div style={{ fontSize: '15px', fontWeight: 800, color: isFull ? 'var(--success)' : 'var(--danger)', fontFamily: 'var(--font-mono)' }}>
              ₹{pending.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Smooth Linear Progress Bar */}
        <div style={{ width: '100%', height: '8px', background: 'var(--surface-alt)', borderRadius: '9999px', marginTop: '12px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
          <div style={{ width: `${paidPct}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-600), var(--accent-500))', borderRadius: '9999px', transition: 'width 0.6s cubic-bezier(0.25, 1, 0.5, 1)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {isFull ? 'ALL DUES CLEARED' : `DUE: ₹${pending.toLocaleString('en-IN')}`}
          </span>
          <span style={{ fontSize: '11px', fontWeight: 800, color: isFull ? 'var(--success)' : 'var(--accent-600)', fontFamily: 'var(--font-mono)' }}>
            {paidPct}% SETTLED
          </span>
        </div>
      </div>

      {/* Past Receipts */}
      <div>
        <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--brand-900)', marginBottom: '10px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Payment Receipts // Verified
        </h4>
        <div className="card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--success-tint)', border: '1px solid #a7f3d0', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={18} />
            </div>
            <div>
              <h5 style={{ fontSize: '13px', fontWeight: 800, margin: 0, color: 'var(--brand-900)' }}>Receipt #ASP-2025-089</h5>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {feeRecord?.lastPaymentDate || '15 Sep 2026'} • ₹{paid.toLocaleString('en-IN')} (Desk UPI)
              </span>
            </div>
          </div>
          <button
            onClick={handleDownloadReceipt}
            style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', padding: '7px 9px', borderRadius: '8px', cursor: 'pointer', color: 'var(--brand-900)', transition: 'var(--transition-smooth)' }}
            title="Download Receipt"
          >
            <Download size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
