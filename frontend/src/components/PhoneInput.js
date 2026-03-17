import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

const COUNTRIES = [
  { code: '+33', flag: '\u{1F1EB}\u{1F1F7}', name: 'France', iso: 'FR' },
  { code: '+374', flag: '\u{1F1E6}\u{1F1F2}', name: 'Armenie', iso: 'AM' },
  { code: '+7', flag: '\u{1F1F7}\u{1F1FA}', name: 'Russie', iso: 'RU' },
  { code: '+49', flag: '\u{1F1E9}\u{1F1EA}', name: 'Allemagne', iso: 'DE' },
  { code: '+1', flag: '\u{1F1FA}\u{1F1F8}', name: 'Etats-Unis', iso: 'US' },
  { code: '+44', flag: '\u{1F1EC}\u{1F1E7}', name: 'Royaume-Uni', iso: 'GB' },
  { code: '+34', flag: '\u{1F1EA}\u{1F1F8}', name: 'Espagne', iso: 'ES' },
  { code: '+39', flag: '\u{1F1EE}\u{1F1F9}', name: 'Italie', iso: 'IT' },
  { code: '+32', flag: '\u{1F1E7}\u{1F1EA}', name: 'Belgique', iso: 'BE' },
  { code: '+41', flag: '\u{1F1E8}\u{1F1ED}', name: 'Suisse', iso: 'CH' },
  { code: '+352', flag: '\u{1F1F1}\u{1F1FA}', name: 'Luxembourg', iso: 'LU' },
  { code: '+377', flag: '\u{1F1F2}\u{1F1E8}', name: 'Monaco', iso: 'MC' },
  { code: '+351', flag: '\u{1F1F5}\u{1F1F9}', name: 'Portugal', iso: 'PT' },
  { code: '+31', flag: '\u{1F1F3}\u{1F1F1}', name: 'Pays-Bas', iso: 'NL' },
  { code: '+43', flag: '\u{1F1E6}\u{1F1F9}', name: 'Autriche', iso: 'AT' },
  { code: '+48', flag: '\u{1F1F5}\u{1F1F1}', name: 'Pologne', iso: 'PL' },
  { code: '+420', flag: '\u{1F1E8}\u{1F1FF}', name: 'Tchequie', iso: 'CZ' },
  { code: '+30', flag: '\u{1F1EC}\u{1F1F7}', name: 'Grece', iso: 'GR' },
  { code: '+45', flag: '\u{1F1E9}\u{1F1F0}', name: 'Danemark', iso: 'DK' },
  { code: '+46', flag: '\u{1F1F8}\u{1F1EA}', name: 'Suede', iso: 'SE' },
  { code: '+47', flag: '\u{1F1F3}\u{1F1F4}', name: 'Norvege', iso: 'NO' },
  { code: '+358', flag: '\u{1F1EB}\u{1F1EE}', name: 'Finlande', iso: 'FI' },
  { code: '+353', flag: '\u{1F1EE}\u{1F1EA}', name: 'Irlande', iso: 'IE' },
  { code: '+40', flag: '\u{1F1F7}\u{1F1F4}', name: 'Roumanie', iso: 'RO' },
  { code: '+36', flag: '\u{1F1ED}\u{1F1FA}', name: 'Hongrie', iso: 'HU' },
  { code: '+90', flag: '\u{1F1F9}\u{1F1F7}', name: 'Turquie', iso: 'TR' },
  { code: '+212', flag: '\u{1F1F2}\u{1F1E6}', name: 'Maroc', iso: 'MA' },
  { code: '+213', flag: '\u{1F1E9}\u{1F1FF}', name: 'Algerie', iso: 'DZ' },
  { code: '+216', flag: '\u{1F1F9}\u{1F1F3}', name: 'Tunisie', iso: 'TN' },
  { code: '+20', flag: '\u{1F1EA}\u{1F1EC}', name: 'Egypte', iso: 'EG' },
  { code: '+966', flag: '\u{1F1F8}\u{1F1E6}', name: 'Arabie Saoudite', iso: 'SA' },
  { code: '+971', flag: '\u{1F1E6}\u{1F1EA}', name: 'Emirats Arabes Unis', iso: 'AE' },
  { code: '+974', flag: '\u{1F1F6}\u{1F1E6}', name: 'Qatar', iso: 'QA' },
  { code: '+86', flag: '\u{1F1E8}\u{1F1F3}', name: 'Chine', iso: 'CN' },
  { code: '+81', flag: '\u{1F1EF}\u{1F1F5}', name: 'Japon', iso: 'JP' },
  { code: '+82', flag: '\u{1F1F0}\u{1F1F7}', name: 'Coree du Sud', iso: 'KR' },
  { code: '+91', flag: '\u{1F1EE}\u{1F1F3}', name: 'Inde', iso: 'IN' },
  { code: '+55', flag: '\u{1F1E7}\u{1F1F7}', name: 'Bresil', iso: 'BR' },
  { code: '+52', flag: '\u{1F1F2}\u{1F1FD}', name: 'Mexique', iso: 'MX' },
  { code: '+54', flag: '\u{1F1E6}\u{1F1F7}', name: 'Argentine', iso: 'AR' },
  { code: '+57', flag: '\u{1F1E8}\u{1F1F4}', name: 'Colombie', iso: 'CO' },
  { code: '+61', flag: '\u{1F1E6}\u{1F1FA}', name: 'Australie', iso: 'AU' },
  { code: '+64', flag: '\u{1F1F3}\u{1F1FF}', name: 'Nouvelle-Zelande', iso: 'NZ' },
  { code: '+27', flag: '\u{1F1FF}\u{1F1E6}', name: 'Afrique du Sud', iso: 'ZA' },
  { code: '+234', flag: '\u{1F1F3}\u{1F1EC}', name: 'Nigeria', iso: 'NG' },
  { code: '+254', flag: '\u{1F1F0}\u{1F1EA}', name: 'Kenya', iso: 'KE' },
  { code: '+225', flag: '\u{1F1E8}\u{1F1EE}', name: 'Cote d\'Ivoire', iso: 'CI' },
  { code: '+221', flag: '\u{1F1F8}\u{1F1F3}', name: 'Senegal', iso: 'SN' },
  { code: '+237', flag: '\u{1F1E8}\u{1F1F2}', name: 'Cameroun', iso: 'CM' },
  { code: '+242', flag: '\u{1F1E8}\u{1F1EC}', name: 'Congo', iso: 'CG' },
  { code: '+995', flag: '\u{1F1EC}\u{1F1EA}', name: 'Georgie', iso: 'GE' },
  { code: '+380', flag: '\u{1F1FA}\u{1F1E6}', name: 'Ukraine', iso: 'UA' },
  { code: '+375', flag: '\u{1F1E7}\u{1F1FE}', name: 'Bielorussie', iso: 'BY' },
  { code: '+972', flag: '\u{1F1EE}\u{1F1F1}', name: 'Israel', iso: 'IL' },
  { code: '+961', flag: '\u{1F1F1}\u{1F1E7}', name: 'Liban', iso: 'LB' },
];

const PhoneInput = ({ value, onChange, onCountryChange, className, error, darkMode = true }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(COUNTRIES[0]);
  const ref = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  const filtered = search
    ? COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.includes(search) ||
        c.iso.toLowerCase().includes(search.toLowerCase())
      )
    : COUNTRIES;

  const handleSelect = (country) => {
    setSelected(country);
    setOpen(false);
    setSearch('');
    if (onCountryChange) onCountryChange(country.code);
  };

  const bg = darkMode ? 'bg-gray-700/50' : 'bg-gray-50';
  const border = error ? 'border-red-500' : darkMode ? 'border-gray-600' : 'border-gray-200';
  const text = darkMode ? 'text-white' : 'text-gray-900';
  const placeholder = darkMode ? 'placeholder-gray-400' : 'placeholder-gray-400';
  const dropBg = darkMode ? 'bg-[#1e2d3d]' : 'bg-white';
  const dropBorder = darkMode ? 'border-gray-600' : 'border-gray-200';
  const hoverBg = darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50';
  const searchBg = darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-gray-50 text-gray-900 placeholder-gray-400';

  return (
    <div className="relative" ref={ref}>
      <div className={`flex rounded-lg border ${border} overflow-hidden`}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-1.5 px-3 py-3 ${bg} border-r ${border} shrink-0 ${text} text-sm`}
          data-testid="phone-country-btn"
        >
          <span className="text-lg leading-none">{selected.flag}</span>
          <span className="text-xs font-medium">{selected.code}</span>
          <ChevronDown className="w-3 h-3 opacity-50" />
        </button>
        <input
          type="tel"
          value={value}
          onChange={onChange}
          placeholder="6 12 34 56 78"
          className={`flex-1 px-3 py-3 ${bg} ${text} ${placeholder} focus:outline-none text-sm ${className || ''}`}
          data-testid="phone-number-input"
        />
      </div>

      {open && (
        <div className={`absolute top-full left-0 mt-1 w-full ${dropBg} border ${dropBorder} rounded-xl shadow-xl z-50 max-h-[320px] overflow-hidden`} data-testid="phone-country-dropdown">
          <div className="p-2 border-b border-gray-600/30">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un pays..."
                className={`w-full pl-8 pr-8 py-2 rounded-lg ${searchBg} text-sm border-0 focus:outline-none focus:ring-1 focus:ring-[#2ecc71]`}
                data-testid="phone-country-search"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          <div className="overflow-y-auto max-h-[260px]">
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm opacity-40">Aucun resultat</div>
            ) : (
              filtered.map(c => (
                <button
                  key={c.iso}
                  type="button"
                  onClick={() => handleSelect(c)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${text} ${hoverBg} transition ${selected.iso === c.iso ? 'bg-[#2ecc71]/10' : ''}`}
                  data-testid={`country-${c.iso}`}
                >
                  <span className="text-lg leading-none">{c.flag}</span>
                  <span className="flex-1 text-left">{c.name}</span>
                  <span className="opacity-50 text-xs">{c.code}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export { COUNTRIES };
export default PhoneInput;
