/**
 * Concept Academy - Complete Institute Data Export Service
 * Collects live institute data into table formats, generates downloadable
 * files (PDF, XLSX, CSV), opens system Print to PDF, and handles mobile phone storage.
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getStoredStudents, getStoredTeachers } from './userAuthStore';
import { getStoredFees } from './feeService';

export const FILE_BASE_NAME = 'Concept Academy Data';

/**
 * Collects all institute data across students, faculty, fees, courses, timetable, tests.
 */
export function collectInstituteTablesData() {
  const students = getStoredStudents() || [];
  const teachers = getStoredTeachers() || [];
  const fees = getStoredFees() || [];

  let timetable = [];
  try {
    timetable = JSON.parse(localStorage.getItem('concept_academy_admin_timetable') || localStorage.getItem('aspire_admin_timetable') || '[]');
  } catch {}

  let tests = [];
  try {
    tests = JSON.parse(localStorage.getItem('concept_academy_tests_list') || localStorage.getItem('aspire_tests_list') || '[]');
  } catch {}

  let courses = [];
  try {
    courses = JSON.parse(localStorage.getItem('concept_academy_courses_list') || localStorage.getItem('aspire_courses_list') || '[]');
  } catch {}

  let studyMaterials = [];
  try {
    studyMaterials = JSON.parse(localStorage.getItem('concept_academy_study_materials') || localStorage.getItem('aspire_study_materials') || '[]');
  } catch {}

  return {
    timestamp: new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    students,
    teachers,
    fees,
    timetable,
    tests,
    courses,
    studyMaterials
  };
}

/**
 * Universal Mobile & Desktop file trigger
 * Tries direct download, data URI fallback, and Web Share API
 */
export async function downloadBlobFile(blob, filename) {
  try {
    // 1. Check if on mobile device with Web Share API supporting files
    if (typeof navigator !== 'undefined' && navigator.canShare && navigator.share) {
      try {
        const file = new File([blob], filename, { type: blob.type });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: filename,
            text: 'Concept Academy Institute Data Report'
          });
          return true;
        }
      } catch (shareErr) {
        // If user cancelled or share failed, fallback to anchor
      }
    }

    // 2. Standard Blob Anchor download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    
    // Give time before revoke for mobile browser download managers
    setTimeout(() => {
      try {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch {}
    }, 2500);

    return true;
  } catch (err) {
    console.error('Download error:', err);
    return false;
  }
}

/**
 * Generate CSV Report with Tables
 */
export function generateCSVReport(data) {
  let csv = '\uFEFF'; // UTF-8 BOM
  csv += 'CONCEPT ACADEMY - COMPLETE INSTITUTE DATA REPORT\n';
  csv += `Generated On: ${data.timestamp}\n\n`;

  // Table 1: Students
  csv += '==================================================\n';
  csv += `TABLE 1: REGISTERED STUDENTS (${data.students.length})\n`;
  csv += '==================================================\n';
  csv += 'Roll No,Name,Course,Status,Email,Phone,Parent Name,Parent Phone\n';
  data.students.forEach(s => {
    csv += `"${s.roll || s.rollNumber || ''}","${s.name || ''}","${s.course || ''}","${s.status || 'Active'}","${s.email || ''}","${s.phone || ''}","${s.parentName || ''}","${s.parentPhone || ''}"\n`;
  });

  // Table 2: Faculty
  csv += '\n==================================================\n';
  csv += `TABLE 2: FACULTY / TEACHERS (${data.teachers.length})\n`;
  csv += '==================================================\n';
  csv += 'Name,Subject,Assigned Batches,Status,Email,Phone\n';
  data.teachers.forEach(t => {
    const batches = Array.isArray(t.batches) ? t.batches.join('; ') : (t.batches || '');
    csv += `"${t.name || ''}","${t.subject || ''}","${batches}","${t.status || 'Active'}","${t.email || ''}","${t.phone || ''}"\n`;
  });

  // Table 3: Courses
  csv += '\n==================================================\n';
  csv += `TABLE 3: COURSES & CURRICULUM (${data.courses.length})\n`;
  csv += '==================================================\n';
  csv += 'Code,Course Name,Subjects,Faculty Members\n';
  data.courses.forEach(c => {
    const subs = Array.isArray(c.subjects) ? c.subjects.join('; ') : (c.subjects || '');
    const fac = Array.isArray(c.faculty) ? c.faculty.join('; ') : (c.faculty || '');
    csv += `"${c.code || ''}","${c.name || ''}","${subs}","${fac}"\n`;
  });

  // Table 4: Fees
  csv += '\n==================================================\n';
  csv += `TABLE 4: FEES MANAGEMENT (${data.fees.length})\n`;
  csv += '==================================================\n';
  csv += 'Student Name,Course,Roll No,Total Fee (Rs),Paid Fee (Rs),Pending (Rs),Status\n';
  data.fees.forEach(f => {
    const tot = f.totalAmount || f.totalFee || 0;
    const paid = f.paidAmount || f.paidFee || 0;
    const pending = Math.max(0, tot - paid);
    csv += `"${f.studentName || f.name || ''}","${f.course || ''}","${f.studentRoll || ''}","${tot}","${paid}","${pending}","${f.status || (paid >= tot ? 'Paid' : 'Pending')}"\n`;
  });

  // Table 5: Timetable
  csv += '\n==================================================\n';
  csv += `TABLE 5: TIMETABLE LECTURES (${data.timetable.length})\n`;
  csv += '==================================================\n';
  csv += 'Course,Day,Time,Subject,Faculty\n';
  data.timetable.forEach(l => {
    csv += `"${l.course || ''}","${l.day || ''}","${l.time || ''}","${l.subject || ''}","${l.faculty || ''}"\n`;
  });

  // Table 6: Tests
  csv += '\n==================================================\n';
  csv += `TABLE 6: TESTS & EXAMS (${data.tests.length})\n`;
  csv += '==================================================\n';
  csv += 'Title,Course,Subject,Duration,Max Marks,Date\n';
  data.tests.forEach(t => {
    csv += `"${t.title || ''}","${t.course || ''}","${t.subject || ''}","${t.duration || ''}","${t.maxMarks || ''}","${t.date || ''}"\n`;
  });

  return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
}

/**
 * Generate Excel (.xlsx / HTML Spreadsheet) with formatted tables
 */
export function generateExcelReport(data) {
  const content = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"/>
      <title>${FILE_BASE_NAME}</title>
      <style>
        body { font-family: Calibri, Arial, sans-serif; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 24px; }
        th { background-color: #0284c7; color: #ffffff; border: 1px solid #94a3b8; padding: 7px 10px; font-weight: bold; text-align: left; }
        td { border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 12px; }
        .hdr { background-color: #0f172a; color: #ffffff; font-size: 14px; font-weight: bold; padding: 8px 10px; }
        .subhdr { background-color: #f1f5f9; color: #475569; font-size: 11px; }
        .success { color: #166534; font-weight: bold; }
        .warning { color: #b45309; font-weight: bold; }
      </style>
    </head>
    <body>
      <h2 style="color: #0f172a; margin-bottom: 2px;">CONCEPT ACADEMY</h2>
      <h4 style="color: #0284c7; margin-top: 0;">Complete Institute Master Data Report</h4>
      <p style="font-size: 11px; color: #64748b;">Generated On: ${data.timestamp} • All Academic Records</p>

      <!-- Students Table -->
      <table border="1">
        <tr class="hdr"><td colspan="8">TABLE 1: STUDENTS DIRECTORY (${data.students.length} Records)</td></tr>
        <tr>
          <th>Roll No</th>
          <th>Name</th>
          <th>Course</th>
          <th>Status</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Parent Name</th>
          <th>Parent Phone</th>
        </tr>
        ${data.students.map(s => `
          <tr>
            <td>${s.roll || s.rollNumber || ''}</td>
            <td><strong>${s.name || ''}</strong></td>
            <td>${s.course || ''}</td>
            <td>${s.status || 'Active'}</td>
            <td>${s.email || ''}</td>
            <td>${s.phone || ''}</td>
            <td>${s.parentName || ''}</td>
            <td>${s.parentPhone || ''}</td>
          </tr>
        `).join('')}
      </table>

      <!-- Faculty Table -->
      <table border="1">
        <tr class="hdr"><td colspan="6">TABLE 2: FACULTY / TEACHERS (${data.teachers.length} Members)</td></tr>
        <tr>
          <th>Name</th>
          <th>Subject Specialization</th>
          <th>Assigned Batches</th>
          <th>Status</th>
          <th>Email</th>
          <th>Phone</th>
        </tr>
        ${data.teachers.map(t => `
          <tr>
            <td><strong>${t.name || ''}</strong></td>
            <td>${t.subject || ''}</td>
            <td>${Array.isArray(t.batches) ? t.batches.join(', ') : (t.batches || '')}</td>
            <td>${t.status || 'Active'}</td>
            <td>${t.email || ''}</td>
            <td>${t.phone || ''}</td>
          </tr>
        `).join('')}
      </table>

      <!-- Courses Table -->
      <table border="1">
        <tr class="hdr"><td colspan="4">TABLE 3: COURSES & CURRICULUM (${data.courses.length} Courses)</td></tr>
        <tr>
          <th>Code</th>
          <th>Course Name</th>
          <th>Subjects Included</th>
          <th>Assigned Faculty</th>
        </tr>
        ${data.courses.map(c => `
          <tr>
            <td><strong>${c.code || ''}</strong></td>
            <td>${c.name || ''}</td>
            <td>${Array.isArray(c.subjects) ? c.subjects.join(', ') : (c.subjects || '')}</td>
            <td>${Array.isArray(c.faculty) ? c.faculty.join(', ') : (c.faculty || '')}</td>
          </tr>
        `).join('')}
      </table>

      <!-- Fees Table -->
      <table border="1">
        <tr class="hdr"><td colspan="7">TABLE 4: FEES MANAGEMENT (${data.fees.length} Accounts)</td></tr>
        <tr>
          <th>Student Name</th>
          <th>Course</th>
          <th>Roll No</th>
          <th>Total Fee (Rs)</th>
          <th>Paid Fee (Rs)</th>
          <th>Pending Fee (Rs)</th>
          <th>Status</th>
        </tr>
        ${data.fees.map(f => {
          const tot = f.totalAmount || f.totalFee || 0;
          const paid = f.paidAmount || f.paidFee || 0;
          const pending = Math.max(0, tot - paid);
          const isPaid = f.status === 'Paid' || paid >= tot;
          return `
            <tr>
              <td><strong>${f.studentName || f.name || ''}</strong></td>
              <td>${f.course || ''}</td>
              <td>${f.studentRoll || ''}</td>
              <td>Rs ${tot}</td>
              <td>Rs ${paid}</td>
              <td>Rs ${pending}</td>
              <td class="${isPaid ? 'success' : 'warning'}">${isPaid ? 'Paid' : 'Pending'}</td>
            </tr>
          `;
        }).join('')}
      </table>

      <!-- Timetable Table -->
      <table border="1">
        <tr class="hdr"><td colspan="5">TABLE 5: TIMETABLE SCHEDULE (${data.timetable.length} Lectures)</td></tr>
        <tr>
          <th>Course</th>
          <th>Day</th>
          <th>Time</th>
          <th>Subject</th>
          <th>Faculty</th>
        </tr>
        ${data.timetable.map(l => `
          <tr>
            <td><strong>${l.course || ''}</strong></td>
            <td>${l.day || ''}</td>
            <td>${l.time || ''}</td>
            <td>${l.subject || ''}</td>
            <td>${l.faculty || ''}</td>
          </tr>
        `).join('')}
      </table>

      <!-- Tests Table -->
      <table border="1">
        <tr class="hdr"><td colspan="6">TABLE 6: TESTS & EXAMINATIONS (${data.tests.length} Papers)</td></tr>
        <tr>
          <th>Title</th>
          <th>Course</th>
          <th>Subject</th>
          <th>Duration</th>
          <th>Max Marks</th>
          <th>Date</th>
        </tr>
        ${data.tests.map(t => `
          <tr>
            <td><strong>${t.title || ''}</strong></td>
            <td>${t.course || ''}</td>
            <td>${t.subject || ''}</td>
            <td>${t.duration || ''}</td>
            <td>${t.maxMarks || ''}</td>
            <td>${t.date || ''}</td>
          </tr>
        `).join('')}
      </table>
    </body>
    </html>
  `;

  return new Blob([content], { type: 'application/vnd.ms-excel;charset=utf-8;' });
}

/**
 * Generate PDF Document using jsPDF and autoTable
 * Creates a fully compliant multi-page PDF with genuine vector tables
 */
export function generatePDFDocument(data) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  // Document Styling Constants
  const brandDark = [15, 23, 42];
  const brandBlue = [2, 132, 199];

  // Cover / Header Bar
  doc.setFillColor(...brandDark);
  doc.rect(0, 0, doc.internal.pageSize.width, 60, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('CONCEPT ACADEMY', 40, 32);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Official Institute Data Report (Tables Format)', 40, 48);

  // Subheader
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.text(`Generated On: ${data.timestamp} | Document Name: ${FILE_BASE_NAME}`, 40, 80);

  let currentY = 95;

  // 1. Students Table
  doc.setTextColor(...brandBlue);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(`1. Students Directory (${data.students.length})`, 40, currentY);
  currentY += 8;

  autoTable(doc, {
    startY: currentY,
    head: [['Roll', 'Name', 'Course', 'Status', 'Email', 'Phone', 'Parent Phone']],
    body: data.students.map(s => [
      s.roll || s.rollNumber || '—',
      s.name || '—',
      s.course || '—',
      s.status || 'Active',
      s.email || '—',
      s.phone || '—',
      s.parentPhone || '—'
    ]),
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 4, textColor: [30, 41, 59] },
    headStyles: { fillColor: brandBlue, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 40, right: 40 }
  });

  currentY = doc.lastAutoTable.finalY + 25;

  // 2. Faculty Table
  doc.setTextColor(...brandBlue);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(`2. Faculty Members (${data.teachers.length})`, 40, currentY);
  currentY += 8;

  autoTable(doc, {
    startY: currentY,
    head: [['Faculty Name', 'Subject', 'Assigned Batches', 'Email', 'Phone']],
    body: data.teachers.map(t => [
      t.name || '—',
      t.subject || '—',
      Array.isArray(t.batches) ? t.batches.join(', ') : (t.batches || '—'),
      t.email || '—',
      t.phone || '—'
    ]),
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 4, textColor: [30, 41, 59] },
    headStyles: { fillColor: [109, 40, 217], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [250, 245, 255] },
    margin: { left: 40, right: 40 }
  });

  currentY = doc.lastAutoTable.finalY + 25;

  // Check page break for Courses
  if (currentY > 680) {
    doc.addPage();
    currentY = 40;
  }

  // 3. Courses Table
  doc.setTextColor(...brandBlue);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(`3. Courses & Curriculum (${data.courses.length})`, 40, currentY);
  currentY += 8;

  autoTable(doc, {
    startY: currentY,
    head: [['Code', 'Course Name', 'Subjects Included', 'Faculty Assigned']],
    body: data.courses.map(c => [
      c.code || '—',
      c.name || '—',
      Array.isArray(c.subjects) ? c.subjects.join(', ') : (c.subjects || '—'),
      Array.isArray(c.faculty) ? c.faculty.join(', ') : (c.faculty || '—')
    ]),
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 4, textColor: [30, 41, 59] },
    headStyles: { fillColor: [5, 150, 105], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [240, 253, 244] },
    margin: { left: 40, right: 40 }
  });

  currentY = doc.lastAutoTable.finalY + 25;

  // Check page break for Fees
  if (currentY > 680) {
    doc.addPage();
    currentY = 40;
  }

  // 4. Fees Table
  doc.setTextColor(...brandBlue);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(`4. Fees Management Accounts (${data.fees.length})`, 40, currentY);
  currentY += 8;

  autoTable(doc, {
    startY: currentY,
    head: [['Student Name', 'Course', 'Roll', 'Total', 'Paid', 'Pending', 'Status']],
    body: data.fees.map(f => {
      const tot = f.totalAmount || f.totalFee || 0;
      const paid = f.paidAmount || f.paidFee || 0;
      const rem = Math.max(0, tot - paid);
      return [
        f.studentName || f.name || '—',
        f.course || '—',
        f.studentRoll || '—',
        `Rs ${tot}`,
        `Rs ${paid}`,
        `Rs ${rem}`,
        (f.status || (paid >= tot ? 'Paid' : 'Pending'))
      ];
    }),
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 4, textColor: [30, 41, 59] },
    headStyles: { fillColor: [217, 119, 6], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [254, 252, 232] },
    margin: { left: 40, right: 40 }
  });

  currentY = doc.lastAutoTable.finalY + 25;

  // Check page break for Timetable & Tests
  if (currentY > 680) {
    doc.addPage();
    currentY = 40;
  }

  // 5. Timetable Table
  doc.setTextColor(...brandBlue);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(`5. Timetable Schedule (${data.timetable.length})`, 40, currentY);
  currentY += 8;

  autoTable(doc, {
    startY: currentY,
    head: [['Course', 'Day', 'Time', 'Subject', 'Faculty']],
    body: data.timetable.map(l => [
      l.course || '—',
      l.day || '—',
      l.time || '—',
      l.subject || '—',
      l.faculty || '—'
    ]),
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 4, textColor: [30, 41, 59] },
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
    margin: { left: 40, right: 40 }
  });

  // Footer on all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Page ${i} of ${pageCount} | Concept Academy Data`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 15,
      { align: 'center' }
    );
  }

  return doc;
}

/**
 * Triggers Native Browser/Mobile Print dialog with clean styled tables.
 * On mobile phones (Android / iOS), this opens the native system print service
 * where the user can directly "Save as PDF" to their phone storage!
 */
export function printDataAsTables(data) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    // If popup blocked, create an invisible iframe to print
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(getPrintableHTML(data));
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 3000);
    }, 500);
    return;
  }

  printWindow.document.open();
  printWindow.document.write(getPrintableHTML(data));
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
}

/**
 * Generates high-definition printable HTML document with clean tables
 */
function getPrintableHTML(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${FILE_BASE_NAME}</title>
      <style>
        @page { size: A4; margin: 15mm; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 0; padding: 20px; color: #0f172a; }
        .header { border-bottom: 2.5px solid #0284c7; padding-bottom: 12px; margin-bottom: 20px; }
        .title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0; }
        .subtitle { font-size: 13px; color: #0284c7; font-weight: 700; margin: 2px 0 0 0; }
        .meta { font-size: 11px; color: #64748b; margin-top: 6px; }
        .section-title { font-size: 14px; font-weight: 800; color: #0f172a; margin: 20px 0 8px 0; text-transform: uppercase; border-left: 4px solid #0284c7; padding-left: 8px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; page-break-inside: avoid; }
        th { background: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; font-weight: 700; }
        td { border: 1px solid #e2e8f0; padding: 5px 8px; color: #334155; }
        tr:nth-child(even) td { background: #f8fafc; }
        .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9.5px; font-weight: 700; background: #e0f2fe; color: #0369a1; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="title">CONCEPT ACADEMY</h1>
        <div class="subtitle">Complete Institute Master Data Report</div>
        <div class="meta">Generated: ${data.timestamp} • Document: ${FILE_BASE_NAME}</div>
      </div>

      <div class="section-title">1. Students Directory (${data.students.length})</div>
      <table>
        <thead>
          <tr>
            <th>Roll No</th>
            <th>Name</th>
            <th>Course</th>
            <th>Status</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Parent Contact</th>
          </tr>
        </thead>
        <tbody>
          ${data.students.map(s => `
            <tr>
              <td><strong>${s.roll || s.rollNumber || '—'}</strong></td>
              <td>${s.name || '—'}</td>
              <td><span class="badge">${s.course || '—'}</span></td>
              <td>${s.status || 'Active'}</td>
              <td>${s.email || '—'}</td>
              <td>${s.phone || '—'}</td>
              <td>${s.parentName ? `${s.parentName} (${s.parentPhone || ''})` : '—'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="section-title">2. Faculty Members (${data.teachers.length})</div>
      <table>
        <thead>
          <tr>
            <th>Faculty Name</th>
            <th>Subject</th>
            <th>Assigned Batches</th>
            <th>Status</th>
            <th>Email</th>
            <th>Phone</th>
          </tr>
        </thead>
        <tbody>
          ${data.teachers.map(t => `
            <tr>
              <td><strong>${t.name || '—'}</strong></td>
              <td>${t.subject || '—'}</td>
              <td>${Array.isArray(t.batches) ? t.batches.join(', ') : (t.batches || '—')}</td>
              <td>${t.status || 'Active'}</td>
              <td>${t.email || '—'}</td>
              <td>${t.phone || '—'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="section-title">3. Courses & Curriculum (${data.courses.length})</div>
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Course Name</th>
            <th>Subjects</th>
            <th>Faculty</th>
          </tr>
        </thead>
        <tbody>
          ${data.courses.map(c => `
            <tr>
              <td><strong>${c.code || '—'}</strong></td>
              <td>${c.name || '—'}</td>
              <td>${Array.isArray(c.subjects) ? c.subjects.join(', ') : (c.subjects || '—')}</td>
              <td>${Array.isArray(c.faculty) ? c.faculty.join(', ') : (c.faculty || '—')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="section-title">4. Fees Accounts (${data.fees.length})</div>
      <table>
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Course</th>
            <th>Total Fee</th>
            <th>Paid Fee</th>
            <th>Pending</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${data.fees.map(f => {
            const tot = f.totalAmount || f.totalFee || 0;
            const paid = f.paidAmount || f.paidFee || 0;
            const rem = Math.max(0, tot - paid);
            return `
              <tr>
                <td><strong>${f.studentName || f.name || '—'}</strong></td>
                <td>${f.course || '—'}</td>
                <td>Rs ${tot}</td>
                <td>Rs ${paid}</td>
                <td>Rs ${rem}</td>
                <td>${paid >= tot ? 'Paid' : 'Pending'}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <div class="section-title">5. Timetable Schedule (${data.timetable.length})</div>
      <table>
        <thead>
          <tr>
            <th>Course</th>
            <th>Day</th>
            <th>Time</th>
            <th>Subject</th>
            <th>Faculty</th>
          </tr>
        </thead>
        <tbody>
          ${data.timetable.map(l => `
            <tr>
              <td><strong>${l.course || '—'}</strong></td>
              <td>${l.day || '—'}</td>
              <td>${l.time || '—'}</td>
              <td>${l.subject || '—'}</td>
              <td>${l.faculty || '—'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="section-title">6. Tests & Examinations (${data.tests.length})</div>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Course</th>
            <th>Subject</th>
            <th>Duration</th>
            <th>Max Marks</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          ${data.tests.map(t => `
            <tr>
              <td><strong>${t.title || '—'}</strong></td>
              <td>${t.course || '—'}</td>
              <td>${t.subject || '—'}</td>
              <td>${t.duration || '—'}</td>
              <td>${t.maxMarks || '—'}</td>
              <td>${t.date || '—'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;
}
