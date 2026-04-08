import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const COUNTRIES = [
  { code: '+33', flag: '\u{1F1EB}\u{1F1F7}', iso: 'FR', name: { fr: 'France', en: 'France', ru: '\u0424\u0440\u0430\u043D\u0446\u0438\u044F', hy: '\u0556\u0580\u0561\u0576\u057D\u056B\u0561' } },
  { code: '+374', flag: '\u{1F1E6}\u{1F1F2}', iso: 'AM', name: { fr: 'Arm\u00e9nie', en: 'Armenia', ru: '\u0410\u0440\u043C\u0435\u043D\u0438\u044F', hy: '\u0540\u0561\u0575\u0561\u057D\u057F\u0561\u0576' } },
  { code: '+7', flag: '\u{1F1F7}\u{1F1FA}', iso: 'RU', name: { fr: 'Russie', en: 'Russia', ru: '\u0420\u043E\u0441\u0441\u0438\u044F', hy: '\u054C\u0578\u0582\u057D\u0561\u057D\u057F\u0561\u0576' } },
  { code: '+49', flag: '\u{1F1E9}\u{1F1EA}', iso: 'DE', name: { fr: 'Allemagne', en: 'Germany', ru: '\u0413\u0435\u0440\u043C\u0430\u043D\u0438\u044F', hy: '\u0533\u0565\u0580\u0574\u0561\u0576\u056B\u0561' } },
  { code: '+1', flag: '\u{1F1FA}\u{1F1F8}', iso: 'US', name: { fr: '\u00c9tats-Unis', en: 'United States', ru: '\u0421\u0428\u0410', hy: '\u0531\u0544\u0546' } },
  { code: '+44', flag: '\u{1F1EC}\u{1F1E7}', iso: 'GB', name: { fr: 'Royaume-Uni', en: 'United Kingdom', ru: '\u0412\u0435\u043B\u0438\u043A\u043E\u0431\u0440\u0438\u0442\u0430\u043D\u0438\u044F', hy: '\u0544\u056B\u0561\u0581\u0575\u0561\u056C \u0539\u0561\u0563\u0561\u057E\u0578\u0580\u0578\u0582\u0569\u0575\u0578\u0582\u0576' } },
  { code: '+34', flag: '\u{1F1EA}\u{1F1F8}', iso: 'ES', name: { fr: 'Espagne', en: 'Spain', ru: '\u0418\u0441\u043F\u0430\u043D\u0438\u044F', hy: '\u053B\u057D\u057A\u0561\u0576\u056B\u0561' } },
  { code: '+39', flag: '\u{1F1EE}\u{1F1F9}', iso: 'IT', name: { fr: 'Italie', en: 'Italy', ru: '\u0418\u0442\u0430\u043B\u0438\u044F', hy: '\u053B\u057F\u0561\u056C\u056B\u0561' } },
  { code: '+32', flag: '\u{1F1E7}\u{1F1EA}', iso: 'BE', name: { fr: 'Belgique', en: 'Belgium', ru: '\u0411\u0435\u043B\u044C\u0433\u0438\u044F', hy: '\u0532\u0565\u056C\u0563\u056B\u0561' } },
  { code: '+41', flag: '\u{1F1E8}\u{1F1ED}', iso: 'CH', name: { fr: 'Suisse', en: 'Switzerland', ru: '\u0428\u0432\u0435\u0439\u0446\u0430\u0440\u0438\u044F', hy: '\u0547\u057E\u0565\u0575\u0581\u0561\u0580\u056B\u0561' } },
  { code: '+352', flag: '\u{1F1F1}\u{1F1FA}', iso: 'LU', name: { fr: 'Luxembourg', en: 'Luxembourg', ru: '\u041B\u044E\u043A\u0441\u0435\u043C\u0431\u0443\u0440\u0433', hy: '\u053C\u0575\u0578\u0582\u0584\u057D\u0565\u0574\u0562\u0578\u0582\u0580\u0563' } },
  { code: '+377', flag: '\u{1F1F2}\u{1F1E8}', iso: 'MC', name: { fr: 'Monaco', en: 'Monaco', ru: '\u041C\u043E\u043D\u0430\u043A\u043E', hy: '\u0544\u0578\u0576\u0561\u056F\u0578' } },
  { code: '+351', flag: '\u{1F1F5}\u{1F1F9}', iso: 'PT', name: { fr: 'Portugal', en: 'Portugal', ru: '\u041F\u043E\u0440\u0442\u0443\u0433\u0430\u043B\u0438\u044F', hy: '\u054A\u0578\u0580\u057F\u0578\u0582\u0563\u0561\u056C\u056B\u0561' } },
  { code: '+31', flag: '\u{1F1F3}\u{1F1F1}', iso: 'NL', name: { fr: 'Pays-Bas', en: 'Netherlands', ru: '\u041D\u0438\u0434\u0435\u0440\u043B\u0430\u043D\u0434\u044B', hy: '\u0546\u056B\u0564\u0565\u057C\u056C\u0561\u0576\u0564\u0576\u0565\u0580' } },
  { code: '+43', flag: '\u{1F1E6}\u{1F1F9}', iso: 'AT', name: { fr: 'Autriche', en: 'Austria', ru: '\u0410\u0432\u0441\u0442\u0440\u0438\u044F', hy: '\u0531\u057E\u057D\u057F\u0580\u056B\u0561' } },
  { code: '+48', flag: '\u{1F1F5}\u{1F1F1}', iso: 'PL', name: { fr: 'Pologne', en: 'Poland', ru: '\u041F\u043E\u043B\u044C\u0448\u0430', hy: '\u053C\u0565\u0570\u0561\u057D\u057F\u0561\u0576' } },
  { code: '+420', flag: '\u{1F1E8}\u{1F1FF}', iso: 'CZ', name: { fr: 'Tch\u00e9quie', en: 'Czech Republic', ru: '\u0427\u0435\u0445\u0438\u044F', hy: '\u0549\u0565\u056D\u056B\u0561' } },
  { code: '+30', flag: '\u{1F1EC}\u{1F1F7}', iso: 'GR', name: { fr: 'Gr\u00e8ce', en: 'Greece', ru: '\u0413\u0440\u0435\u0446\u0438\u044F', hy: '\u0540\u0578\u0582\u0576\u0561\u057D\u057F\u0561\u0576' } },
  { code: '+45', flag: '\u{1F1E9}\u{1F1F0}', iso: 'DK', name: { fr: 'Danemark', en: 'Denmark', ru: '\u0414\u0430\u043D\u0438\u044F', hy: '\u0534\u0561\u0576\u056B\u0561' } },
  { code: '+46', flag: '\u{1F1F8}\u{1F1EA}', iso: 'SE', name: { fr: 'Su\u00e8de', en: 'Sweden', ru: '\u0428\u0432\u0435\u0446\u0438\u044F', hy: '\u0547\u057E\u0565\u0564\u056B\u0561' } },
  { code: '+47', flag: '\u{1F1F3}\u{1F1F4}', iso: 'NO', name: { fr: 'Norv\u00e8ge', en: 'Norway', ru: '\u041D\u043E\u0440\u0432\u0435\u0433\u0438\u044F', hy: '\u0546\u0578\u0580\u057E\u0565\u0563\u056B\u0561' } },
  { code: '+358', flag: '\u{1F1EB}\u{1F1EE}', iso: 'FI', name: { fr: 'Finlande', en: 'Finland', ru: '\u0424\u0438\u043D\u043B\u044F\u043D\u0434\u0438\u044F', hy: '\u0556\u056B\u0576\u056C\u0561\u0576\u0564\u056B\u0561' } },
  { code: '+353', flag: '\u{1F1EE}\u{1F1EA}', iso: 'IE', name: { fr: 'Irlande', en: 'Ireland', ru: '\u0418\u0440\u043B\u0430\u043D\u0434\u0438\u044F', hy: '\u053B\u057C\u056C\u0561\u0576\u0564\u056B\u0561' } },
  { code: '+40', flag: '\u{1F1F7}\u{1F1F4}', iso: 'RO', name: { fr: 'Roumanie', en: 'Romania', ru: '\u0420\u0443\u043C\u044B\u043D\u0438\u044F', hy: '\u054C\u0578\u0582\u0574\u056B\u0576\u056B\u0561' } },
  { code: '+36', flag: '\u{1F1ED}\u{1F1FA}', iso: 'HU', name: { fr: 'Hongrie', en: 'Hungary', ru: '\u0412\u0435\u043D\u0433\u0440\u0438\u044F', hy: '\u0540\u0578\u0582\u0576\u0563\u0561\u0580\u056B\u0561' } },
  { code: '+90', flag: '\u{1F1F9}\u{1F1F7}', iso: 'TR', name: { fr: 'Turquie', en: 'Turkey', ru: '\u0422\u0443\u0440\u0446\u0438\u044F', hy: '\u0539\u0578\u0582\u0580\u0584\u056B\u0561' } },
  { code: '+212', flag: '\u{1F1F2}\u{1F1E6}', iso: 'MA', name: { fr: 'Maroc', en: 'Morocco', ru: '\u041C\u0430\u0440\u043E\u043A\u043A\u043E', hy: '\u0544\u0561\u0580\u0578\u056F\u056F\u0578' } },
  { code: '+213', flag: '\u{1F1E9}\u{1F1FF}', iso: 'DZ', name: { fr: 'Alg\u00e9rie', en: 'Algeria', ru: '\u0410\u043B\u0436\u0438\u0440', hy: '\u0531\u056C\u056A\u056B\u0580' } },
  { code: '+216', flag: '\u{1F1F9}\u{1F1F3}', iso: 'TN', name: { fr: 'Tunisie', en: 'Tunisia', ru: '\u0422\u0443\u043D\u0438\u0441', hy: '\u0539\u0578\u0582\u0576\u056B\u057D' } },
  { code: '+20', flag: '\u{1F1EA}\u{1F1EC}', iso: 'EG', name: { fr: '\u00c9gypte', en: 'Egypt', ru: '\u0415\u0433\u0438\u043F\u0435\u0442', hy: '\u0535\u0563\u056B\u057A\u057F\u0578\u057D' } },
  { code: '+966', flag: '\u{1F1F8}\u{1F1E6}', iso: 'SA', name: { fr: 'Arabie Saoudite', en: 'Saudi Arabia', ru: '\u0421\u0430\u0443\u0434\u043E\u0432\u0441\u043A\u0430\u044F \u0410\u0440\u0430\u0432\u0438\u044F', hy: '\u054D\u0561\u0578\u0582\u0564\u0575\u0561\u0576 \u0531\u0580\u0561\u0562\u056B\u0561' } },
  { code: '+971', flag: '\u{1F1E6}\u{1F1EA}', iso: 'AE', name: { fr: '\u00c9mirats Arabes Unis', en: 'United Arab Emirates', ru: '\u041E\u0410\u042D', hy: '\u0531\u0544\u0537' } },
  { code: '+974', flag: '\u{1F1F6}\u{1F1E6}', iso: 'QA', name: { fr: 'Qatar', en: 'Qatar', ru: '\u041A\u0430\u0442\u0430\u0440', hy: '\u053F\u0561\u057F\u0561\u0580' } },
  { code: '+86', flag: '\u{1F1E8}\u{1F1F3}', iso: 'CN', name: { fr: 'Chine', en: 'China', ru: '\u041A\u0438\u0442\u0430\u0439', hy: '\u0549\u056B\u0576\u0561\u057D\u057F\u0561\u0576' } },
  { code: '+81', flag: '\u{1F1EF}\u{1F1F5}', iso: 'JP', name: { fr: 'Japon', en: 'Japan', ru: '\u042F\u043F\u043E\u043D\u0438\u044F', hy: '\u0543\u0561\u057A\u0578\u0576\u056B\u0561' } },
  { code: '+82', flag: '\u{1F1F0}\u{1F1F7}', iso: 'KR', name: { fr: 'Cor\u00e9e du Sud', en: 'South Korea', ru: '\u042E\u0436\u043D\u0430\u044F \u041A\u043E\u0440\u0435\u044F', hy: '\u0540\u0561\u0580\u0561\u057E\u0561\u0575\u056B\u0576 \u053F\u0578\u0580\u0565\u0561' } },
  { code: '+91', flag: '\u{1F1EE}\u{1F1F3}', iso: 'IN', name: { fr: 'Inde', en: 'India', ru: '\u0418\u043D\u0434\u0438\u044F', hy: '\u0540\u0576\u0564\u056F\u0561\u057D\u057F\u0561\u0576' } },
  { code: '+55', flag: '\u{1F1E7}\u{1F1F7}', iso: 'BR', name: { fr: 'Br\u00e9sil', en: 'Brazil', ru: '\u0411\u0440\u0430\u0437\u0438\u043B\u0438\u044F', hy: '\u0532\u0580\u0561\u0566\u056B\u056C\u056B\u0561' } },
  { code: '+52', flag: '\u{1F1F2}\u{1F1FD}', iso: 'MX', name: { fr: 'Mexique', en: 'Mexico', ru: '\u041C\u0435\u043A\u0441\u0438\u043A\u0430', hy: '\u0544\u0565\u0584\u057D\u056B\u056F\u0561' } },
  { code: '+54', flag: '\u{1F1E6}\u{1F1F7}', iso: 'AR', name: { fr: 'Argentine', en: 'Argentina', ru: '\u0410\u0440\u0433\u0435\u043D\u0442\u0438\u043D\u0430', hy: '\u0531\u0580\u0563\u0565\u0576\u057F\u056B\u0576\u0561' } },
  { code: '+57', flag: '\u{1F1E8}\u{1F1F4}', iso: 'CO', name: { fr: 'Colombie', en: 'Colombia', ru: '\u041A\u043E\u043B\u0443\u043C\u0431\u0438\u044F', hy: '\u053F\u0578\u056C\u0578\u0582\u0574\u0562\u056B\u0561' } },
  { code: '+61', flag: '\u{1F1E6}\u{1F1FA}', iso: 'AU', name: { fr: 'Australie', en: 'Australia', ru: '\u0410\u0432\u0441\u0442\u0440\u0430\u043B\u0438\u044F', hy: '\u0531\u057E\u057D\u057F\u0580\u0561\u056C\u056B\u0561' } },
  { code: '+64', flag: '\u{1F1F3}\u{1F1FF}', iso: 'NZ', name: { fr: 'Nouvelle-Z\u00e9lande', en: 'New Zealand', ru: '\u041D\u043E\u0432\u0430\u044F \u0417\u0435\u043B\u0430\u043D\u0434\u0438\u044F', hy: '\u0546\u0578\u0580 \u0536\u0565\u056C\u0561\u0576\u0564\u056B\u0561' } },
  { code: '+27', flag: '\u{1F1FF}\u{1F1E6}', iso: 'ZA', name: { fr: 'Afrique du Sud', en: 'South Africa', ru: '\u042E\u0410\u0420', hy: '\u0540\u0561\u0580\u0561\u057E\u0561\u0575\u056B\u0576 \u0531\u0586\u0580\u056B\u056F\u0561' } },
  { code: '+234', flag: '\u{1F1F3}\u{1F1EC}', iso: 'NG', name: { fr: 'Nigeria', en: 'Nigeria', ru: '\u041D\u0438\u0433\u0435\u0440\u0438\u044F', hy: '\u0546\u056B\u0563\u0565\u0580\u056B\u0561' } },
  { code: '+254', flag: '\u{1F1F0}\u{1F1EA}', iso: 'KE', name: { fr: 'Kenya', en: 'Kenya', ru: '\u041A\u0435\u043D\u0438\u044F', hy: '\u053F\u0565\u0576\u056B\u0561' } },
  { code: '+225', flag: '\u{1F1E8}\u{1F1EE}', iso: 'CI', name: { fr: "C\u00f4te d'Ivoire", en: 'Ivory Coast', ru: '\u041A\u043E\u0442-\u0434\u2019\u0418\u0432\u0443\u0430\u0440', hy: "\u0553\u0572\u0578\u057D\u056F\u0580\u056B \u0531\u0583" } },
  { code: '+221', flag: '\u{1F1F8}\u{1F1F3}', iso: 'SN', name: { fr: 'S\u00e9n\u00e9gal', en: 'Senegal', ru: '\u0421\u0435\u043D\u0435\u0433\u0430\u043B', hy: '\u054D\u0565\u0576\u0565\u0563\u0561\u056C' } },
  { code: '+237', flag: '\u{1F1E8}\u{1F1F2}', iso: 'CM', name: { fr: 'Cameroun', en: 'Cameroon', ru: '\u041A\u0430\u043C\u0435\u0440\u0443\u043D', hy: '\u053F\u0561\u0574\u0565\u0580\u0578\u0582\u0576' } },
  { code: '+242', flag: '\u{1F1E8}\u{1F1EC}', iso: 'CG', name: { fr: 'Congo', en: 'Congo', ru: '\u041A\u043E\u043D\u0433\u043E', hy: '\u053F\u0578\u0576\u0563\u0578' } },
  { code: '+995', flag: '\u{1F1EC}\u{1F1EA}', iso: 'GE', name: { fr: 'G\u00e9orgie', en: 'Georgia', ru: '\u0413\u0440\u0443\u0437\u0438\u044F', hy: '\u054E\u0580\u0561\u057D\u057F\u0561\u0576' } },
  { code: '+380', flag: '\u{1F1FA}\u{1F1E6}', iso: 'UA', name: { fr: 'Ukraine', en: 'Ukraine', ru: '\u0423\u043A\u0440\u0430\u0438\u043D\u0430', hy: '\u0548\u0582\u056F\u0580\u0561\u056B\u0576\u0561' } },
  { code: '+375', flag: '\u{1F1E7}\u{1F1FE}', iso: 'BY', name: { fr: 'Bi\u00e9lorussie', en: 'Belarus', ru: '\u0411\u0435\u043B\u0430\u0440\u0443\u0441\u044C', hy: '\u0532\u0565\u056C\u0561\u057C\u0578\u0582\u057D' } },
  { code: '+972', flag: '\u{1F1EE}\u{1F1F1}', iso: 'IL', name: { fr: 'Isra\u00ebl', en: 'Israel', ru: '\u0418\u0437\u0440\u0430\u0438\u043B\u044C', hy: '\u053B\u057D\u0580\u0561\u0575\u0565\u056C' } },
  { code: '+961', flag: '\u{1F1F1}\u{1F1E7}', iso: 'LB', name: { fr: 'Liban', en: 'Lebanon', ru: '\u041B\u0438\u0432\u0430\u043D', hy: '\u053C\u056B\u0562\u0561\u0576\u0561\u0576' } },
];

const UI_TEXTS = {
  fr: { searchPlaceholder: 'Rechercher un pays...', noResult: 'Aucun r\u00e9sultat' },
  en: { searchPlaceholder: 'Search a country...', noResult: 'No results' },
  ru: { searchPlaceholder: '\u041F\u043E\u0438\u0441\u043A \u0441\u0442\u0440\u0430\u043D\u044B...', noResult: '\u041D\u0435\u0442 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u043E\u0432' },
  hy: { searchPlaceholder: '\u0553\u0576\u057F\u0580\u0565\u056C \u0565\u0580\u056F\u056B\u0580...', noResult: '\u0531\u0580\u0564\u0575\u0578\u0582\u0576\u0584 \u0579\u056F\u0561\u0576' },
};

const PhoneInput = ({ value, onChange, onCountryChange, className, error, darkMode = true }) => {
  let lang = 'fr';
  try {
    const ctx = useLanguage();
    if (ctx && ctx.language) lang = ctx.language;
  } catch {}

  const texts = UI_TEXTS[lang] || UI_TEXTS.fr;

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(COUNTRIES[0]);
  const ref = useRef(null);
  const searchRef = useRef(null);

  const getName = (c) => c.name[lang] || c.name.en || c.name.fr;

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
        getName(c).toLowerCase().includes(search.toLowerCase()) ||
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
                placeholder={texts.searchPlaceholder}
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
              <div className="px-4 py-6 text-center text-sm opacity-40">{texts.noResult}</div>
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
                  <span className="flex-1 text-left">{getName(c)}</span>
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
