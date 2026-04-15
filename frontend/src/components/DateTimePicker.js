import React from 'react';

/**
 * DatePicker — three selects (day/month/year) always in European format.
 * Stores value as YYYY-MM-DD (compatible with existing code).
 */
export const DatePicker = ({ value, onChange, label, className = '', testId = 'date-picker' }) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const years = [currentYear, currentYear + 1];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const [y, m, d] = value ? value.split('-') : ['', '', ''];

  const daysInMonth = (month, year) => {
    if (!month || !year) return 31;
    return new Date(parseInt(year), parseInt(month), 0).getDate();
  };
  const maxDays = daysInMonth(m || 1, y || currentYear);
  const days = Array.from({ length: maxDays }, (_, i) => i + 1);

  const update = (newD, newM, newY) => {
    if (newD && newM && newY) {
      onChange(`${newY}-${String(newM).padStart(2, '0')}-${String(newD).padStart(2, '0')}`);
    } else {
      onChange('');
    }
  };

  const selectClass = "bg-gray-50 text-gray-900 rounded-lg border border-gray-200 focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71] text-sm py-3 px-2 appearance-none text-center";

  const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

  return (
    <div className={className}>
      {label && <label className="block text-gray-700 font-medium text-sm mb-1">{label}</label>}
      <div className="grid grid-cols-3 gap-1.5" data-testid={testId}>
        <select
          value={d ? parseInt(d) : ''}
          onChange={(e) => update(e.target.value, m ? parseInt(m) : '', y || '')}
          className={selectClass}
          data-testid={`${testId}-day`}
        >
          <option value="">Jour</option>
          {days.map(day => (
            <option key={day} value={day}>{String(day).padStart(2, '0')}</option>
          ))}
        </select>
        <select
          value={m ? parseInt(m) : ''}
          onChange={(e) => {
            const newM = e.target.value;
            const maxD = daysInMonth(newM, y || currentYear);
            const safeD = d && parseInt(d) > maxD ? maxD : (d ? parseInt(d) : '');
            update(safeD, newM, y || '');
          }}
          className={selectClass}
          data-testid={`${testId}-month`}
        >
          <option value="">Mois</option>
          {months.map(month => (
            <option key={month} value={month}>{monthNames[month - 1]}</option>
          ))}
        </select>
        <select
          value={y || ''}
          onChange={(e) => update(d ? parseInt(d) : '', m ? parseInt(m) : '', e.target.value)}
          className={selectClass}
          data-testid={`${testId}-year`}
        >
          <option value="">Année</option>
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

/**
 * TimePicker — select with 24h time slots every 15 min.
 * Stores value as HH:MM (compatible with existing code).
 */
export const TimePicker = ({ value, onChange, label, className = '', testId = 'time-picker' }) => {
  const slots = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }

  return (
    <div className={className}>
      {label && <label className="block text-gray-700 font-medium text-sm mb-1">{label}</label>}
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-50 text-gray-900 rounded-lg border border-gray-200 focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71] text-sm py-3 px-3 appearance-none"
        data-testid={testId}
      >
        <option value="">HH:MM</option>
        {slots.map(slot => (
          <option key={slot} value={slot}>{slot}</option>
        ))}
      </select>
    </div>
  );
};
