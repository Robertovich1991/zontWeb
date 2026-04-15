import React from 'react';

/**
 * LocaleDateInput — Native date input that works normally,
 * but displays the date in the site's language format.
 */
export const LocaleDateInput = ({ value, onChange, label, language = 'fr', className = '', testId = 'date-input' }) => {
  const formatDisplay = (iso) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    if (language === 'en') return `${m}/${d}/${y}`;
    return `${d}/${m}/${y}`;
  };

  const placeholder = language === 'en' ? 'mm/dd/yyyy' : 'jj/mm/aaaa';

  return (
    <div className={className}>
      {label && <label className="block text-gray-700 font-medium text-sm mb-1">{label}</label>}
      <div className="relative">
        {/* Formatted display overlay — does NOT block clicks (pointer-events: none) */}
        <div className="absolute inset-0 flex items-center px-3 pointer-events-none z-10">
          <span className={`text-sm ${value ? 'text-gray-900' : 'text-gray-400'}`}>
            {value ? formatDisplay(value) : placeholder}
          </span>
        </div>
        {/* Real native input — text invisible, but fully functional */}
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          data-testid={testId}
          className="w-full px-3 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71] text-sm"
          style={{ color: 'transparent', caretColor: 'transparent' }}
        />
      </div>
    </div>
  );
};

/**
 * LocaleTimeInput — Native time input that works normally,
 * but always displays time in 24h format.
 */
export const LocaleTimeInput = ({ value, onChange, label, className = '', testId = 'time-input' }) => {
  return (
    <div className={className}>
      {label && <label className="block text-gray-700 font-medium text-sm mb-1">{label}</label>}
      <div className="relative">
        {/* Formatted 24h display overlay */}
        <div className="absolute inset-0 flex items-center px-3 pointer-events-none z-10">
          <span className={`text-sm ${value ? 'text-gray-900' : 'text-gray-400'}`}>
            {value || 'HH:MM'}
          </span>
        </div>
        {/* Real native input — text invisible, but fully functional */}
        <input
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          data-testid={testId}
          className="w-full px-3 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71] text-sm"
          style={{ color: 'transparent', caretColor: 'transparent' }}
        />
      </div>
    </div>
  );
};
