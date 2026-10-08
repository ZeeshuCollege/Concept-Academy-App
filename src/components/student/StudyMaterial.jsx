import React, { useState } from 'react';
import { Search, FileText, Video, ChevronRight } from 'lucide-react';
import MobileDropdown from '../common/MobileDropdown';
import { useDataSync } from '../../lib/syncEvents';

export default function StudyMaterial({ onOpenViewer }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const [materialsList, setMaterialsList] = useState(() => {
    try {
      const saved = localStorage.getItem('concept_academy_study_materials') || localStorage.getItem('aspire_study_materials');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  useDataSync(['materials'], () => {
    try {
      const saved = localStorage.getItem('concept_academy_study_materials') || localStorage.getItem('aspire_study_materials');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setMaterialsList(parsed);
      } else {
        setMaterialsList([]);
      }
    } catch (e) {}
  });

  const filters = ['All', 'PDF', 'Video'];

  const filtered = materialsList.filter(m => {
    const matchesFilter = selectedFilter === 'All' || (m.type || '').toLowerCase() === selectedFilter.toLowerCase();
    const matchesSearch = (m.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || (m.subject || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="view-transition-enter" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '90px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--brand-900)', margin: 0, letterSpacing: '-0.02em' }}>
            Study Repository
          </h3>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            DIGITAL_ASSETS // SECURE VIEWER
          </span>
        </div>
        <span className="badge badge-accent">
          {filtered.length} Files
        </span>
      </div>

      {/* Search Input - Smooth Pill Box */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search materials, subjects, chapters..."
          style={{
            width: '100%',
            padding: '12px 14px 12px 38px',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            fontSize: '13px',
            outline: 'none',
            background: 'var(--surface)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'var(--transition-smooth)'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-500)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.12)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          }}
        />
        <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
      </div>

      {/* Filter Mobile Dropdown */}
      <div>
        <MobileDropdown
          title="Filter by Material Type"
          options={[
            { value: 'All', label: 'All Formats' },
            { value: 'PDF', label: 'PDF Documents' },
            { value: 'Video', label: 'Video Lectures' }
          ]}
          value={selectedFilter}
          onChange={val => setSelectedFilter(val)}
          placeholder="Filter by Type"
        />
      </div>

      {/* Material List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ padding: '36px 20px', textAlign: 'center', borderRadius: '12px' }}>
            <FileText size={36} color="var(--text-muted)" style={{ margin: '0 auto 10px auto', opacity: 0.5 }} />
            <h4 style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--brand-900)', margin: 0 }}>No Study Materials Available</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Your faculty will upload class notes, question papers, and lecture materials here.
            </p>
          </div>
        ) : (
          filtered.map(mat => (
            <div
              key={mat.id}
              onClick={() => onOpenViewer({ title: mat.title, subtitle: `${mat.subject} • ${mat.chapter} (${mat.size})` })}
              className="card card-hover"
              style={{ padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', borderRadius: '12px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: mat.type === 'PDF' ? '#fff7ed' : 'var(--brand-50)',
                  color: mat.type === 'PDF' ? 'var(--accent-600)' : 'var(--brand-600)',
                  border: mat.type === 'PDF' ? '1px solid #fed7aa' : '1px solid var(--brand-200)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'var(--transition-smooth)'
                }}>
                  {mat.type === 'PDF' ? <FileText size={20} /> : <Video size={20} />}
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--brand-900)', margin: '0 0 2px 0' }}>{mat.title}</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, fontFamily: 'var(--font-mono)' }}>
                    {mat.subject} • {mat.chapter} • {mat.size}
                  </p>
                </div>
              </div>
              <ChevronRight size={16} color="var(--brand-700)" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
