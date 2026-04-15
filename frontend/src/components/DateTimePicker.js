import React, { useRef } from 'react';

/**
 * Formats a date string YYYY-MM-DD according to site language.
 * FR/RU/HY → dd/mm/yyyy, EN → mm/dd/yyyy
 */
const formatDate = (iso, lang) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (lang === 'en') return `${m}/${d}/${y}`;
  return `${d}/${m}/${y}`;
};

const datePlaceholder = (lang) => {
  if (lang === 'en') return 'mm/dd/yyyy';
  return 'jj/mm/aaaa';
};

/**
 * LocaleDateInput — Shows date in the site's language format (not the browser's).
 * Native date picker opens on click. Value stays YYYY-MM-DD.
 */
export const LocaleDateInput = ({ value, onChange, label, language = 'fr', className = '', testId = 'date-input' }) => {
  const hiddenRef = useRef(null);

  return (
    <div className={className}>
      {label && <label className="block text-gray-700 font-medium text-sm mb-1">{label}</label>}
      <div className="relative">
        {/* Visible formatted display */}
        <div
          onClick={() => hiddenRef.current?.showPicker?.() || hiddenRef.current?.click()}
          className="w-full px-3 py-3 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 focus-within:border-[#2ecc71] focus-within:ring-1 focus-within:ring-[#2ecc71] text-sm cursor-pointer select-none"
          data-testid={testId}
        >
          <span className={value ? 'text-gray-900' : 'text-gray-400'}>
            {value ? formatDate(value, language) : datePlaceholder(language)}
          </span>
        </div>
        {/* Hidden native date input */}
        <input
          ref={hiddenRef}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          className="absolute inset-0 opacity-0 cursor-pointer"
          tabIndex={-1}
        />
      </div>
    </div>
  );
};

/**
 * LocaleTimeInput — Shows time always in 24h format.
 * Native time picker opens on click. Value stays HH:MM.
 */
export const LocaleTimeInput = ({ value, onChange, label, className = '', testId = 'time-input' }) => {
  const hiddenRef = useRef(null);

  return (
    <div className={className}>
      {label && <label className="block text-gray-700 font-medium text-sm mb-1">{label}</label>}
      <div className="relative">
        {/* Visible 24h display */}
        <div
          onClick={() => hiddenRef.current?.showPicker?.() || hiddenRef.current?.click()}
          className="w-full px-3 py-3 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 focus-within:border-[#2ecc71] focus-within:ring-1 focus-within:ring-[#2ecc71] text-sm cursor-pointer select-none"
          data-testid={testId}
        >
          <span className={value ? 'text-gray-900' : 'text-gray-400'}>
            {value || 'HH:MM'}
          </span>
        </div>
        {/* Hidden native time input */}
        <input
          ref={hiddenRef}
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          className="absolute inset-0 opacity-0 cursor-pointer"
          tabIndex={-1}
        />
      </div>
    </div>
  );
};
