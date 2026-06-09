import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/* ───── Complete country list (230+ countries) ───── */
const COUNTRIES = [
  { code: '+93', flag: '\u{1F1E6}\u{1F1EB}', iso: 'AF', name: { fr: 'Afghanistan', en: 'Afghanistan', ru: '\u0410\u0444\u0433\u0430\u043d\u0438\u0441\u0442\u0430\u043d', hy: '\u0531\u0586\u0572\u0561\u0576\u057d\u057f\u0561\u0576' } },
  { code: '+355', flag: '\u{1F1E6}\u{1F1F1}', iso: 'AL', name: { fr: 'Albanie', en: 'Albania', ru: '\u0410\u043b\u0431\u0430\u043d\u0438\u044f', hy: '\u0531\u056c\u0562\u0561\u0576\u056b\u0561' } },
  { code: '+213', flag: '\u{1F1E9}\u{1F1FF}', iso: 'DZ', name: { fr: 'Alg\u00e9rie', en: 'Algeria', ru: '\u0410\u043b\u0436\u0438\u0440', hy: '\u0531\u056c\u056a\u056b\u0580' } },
  { code: '+376', flag: '\u{1F1E6}\u{1F1E9}', iso: 'AD', name: { fr: 'Andorre', en: 'Andorra', ru: '\u0410\u043d\u0434\u043e\u0440\u0440\u0430', hy: '\u0531\u0576\u0564\u0578\u0580\u0561' } },
  { code: '+244', flag: '\u{1F1E6}\u{1F1F4}', iso: 'AO', name: { fr: 'Angola', en: 'Angola', ru: '\u0410\u043d\u0433\u043e\u043b\u0430', hy: '\u0531\u0576\u0563\u0578\u056c\u0561' } },
  { code: '+54', flag: '\u{1F1E6}\u{1F1F7}', iso: 'AR', name: { fr: 'Argentine', en: 'Argentina', ru: '\u0410\u0440\u0433\u0435\u043d\u0442\u0438\u043d\u0430', hy: '\u0531\u0580\u0563\u0565\u0576\u057f\u056b\u0576\u0561' } },
  { code: '+374', flag: '\u{1F1E6}\u{1F1F2}', iso: 'AM', name: { fr: 'Arm\u00e9nie', en: 'Armenia', ru: '\u0410\u0440\u043c\u0435\u043d\u0438\u044f', hy: '\u0540\u0561\u0575\u0561\u057d\u057f\u0561\u0576' } },
  { code: '+61', flag: '\u{1F1E6}\u{1F1FA}', iso: 'AU', name: { fr: 'Australie', en: 'Australia', ru: '\u0410\u0432\u0441\u0442\u0440\u0430\u043b\u0438\u044f', hy: '\u0531\u057e\u057d\u057f\u0580\u0561\u056c\u056b\u0561' } },
  { code: '+43', flag: '\u{1F1E6}\u{1F1F9}', iso: 'AT', name: { fr: 'Autriche', en: 'Austria', ru: '\u0410\u0432\u0441\u0442\u0440\u0438\u044f', hy: '\u0531\u057e\u057d\u057f\u0580\u056b\u0561' } },
  { code: '+994', flag: '\u{1F1E6}\u{1F1FF}', iso: 'AZ', name: { fr: 'Azerba\u00efdjan', en: 'Azerbaijan', ru: '\u0410\u0437\u0435\u0440\u0431\u0430\u0439\u0434\u0436\u0430\u043d', hy: '\u0531\u0564\u0580\u0562\u0565\u057b\u0561\u0576' } },
  { code: '+973', flag: '\u{1F1E7}\u{1F1ED}', iso: 'BH', name: { fr: 'Bahre\u00efn', en: 'Bahrain', ru: '\u0411\u0430\u0445\u0440\u0435\u0439\u043d', hy: '\u0532\u0561\u0570\u0580\u0565\u0575\u0576' } },
  { code: '+880', flag: '\u{1F1E7}\u{1F1E9}', iso: 'BD', name: { fr: 'Bangladesh', en: 'Bangladesh', ru: '\u0411\u0430\u043d\u0433\u043b\u0430\u0434\u0435\u0448', hy: '\u0532\u0561\u0576\u0563\u056c\u0561\u0564\u0565\u0577' } },
  { code: '+375', flag: '\u{1F1E7}\u{1F1FE}', iso: 'BY', name: { fr: 'Bi\u00e9lorussie', en: 'Belarus', ru: '\u0411\u0435\u043b\u0430\u0440\u0443\u0441\u044c', hy: '\u0532\u0565\u056c\u0561\u057c\u0578\u0582\u057d' } },
  { code: '+32', flag: '\u{1F1E7}\u{1F1EA}', iso: 'BE', name: { fr: 'Belgique', en: 'Belgium', ru: '\u0411\u0435\u043b\u044c\u0433\u0438\u044f', hy: '\u0532\u0565\u056c\u0563\u056b\u0561' } },
  { code: '+229', flag: '\u{1F1E7}\u{1F1EF}', iso: 'BJ', name: { fr: 'B\u00e9nin', en: 'Benin', ru: '\u0411\u0435\u043d\u0438\u043d', hy: '\u0532\u0565\u0576\u056b\u0576' } },
  { code: '+591', flag: '\u{1F1E7}\u{1F1F4}', iso: 'BO', name: { fr: 'Bolivie', en: 'Bolivia', ru: '\u0411\u043e\u043b\u0438\u0432\u0438\u044f', hy: '\u0532\u0578\u056c\u056b\u057e\u056b\u0561' } },
  { code: '+387', flag: '\u{1F1E7}\u{1F1E6}', iso: 'BA', name: { fr: 'Bosnie', en: 'Bosnia', ru: '\u0411\u043e\u0441\u043d\u0438\u044f', hy: '\u0532\u0578\u057d\u0576\u056b\u0561' } },
  { code: '+55', flag: '\u{1F1E7}\u{1F1F7}', iso: 'BR', name: { fr: 'Br\u00e9sil', en: 'Brazil', ru: '\u0411\u0440\u0430\u0437\u0438\u043b\u0438\u044f', hy: '\u0532\u0580\u0561\u0566\u056b\u056c\u056b\u0561' } },
  { code: '+673', flag: '\u{1F1E7}\u{1F1F3}', iso: 'BN', name: { fr: 'Brunei', en: 'Brunei', ru: '\u0411\u0440\u0443\u043d\u0435\u0439', hy: '\u0532\u0580\u0578\u0582\u0576\u0565\u0575' } },
  { code: '+359', flag: '\u{1F1E7}\u{1F1EC}', iso: 'BG', name: { fr: 'Bulgarie', en: 'Bulgaria', ru: '\u0411\u043e\u043b\u0433\u0430\u0440\u0438\u044f', hy: '\u0532\u0578\u0582\u056c\u0572\u0561\u0580\u056b\u0561' } },
  { code: '+226', flag: '\u{1F1E7}\u{1F1EB}', iso: 'BF', name: { fr: 'Burkina Faso', en: 'Burkina Faso', ru: '\u0411\u0443\u0440\u043a\u0438\u043d\u0430-\u0424\u0430\u0441\u043e', hy: '\u0532\u0578\u0582\u0580\u056f\u056b\u0576\u0561 \u0556\u0561\u057d\u0578' } },
  { code: '+257', flag: '\u{1F1E7}\u{1F1EE}', iso: 'BI', name: { fr: 'Burundi', en: 'Burundi', ru: '\u0411\u0443\u0440\u0443\u043d\u0434\u0438', hy: '\u0532\u0578\u0582\u0580\u0578\u0582\u0576\u0564\u056b' } },
  { code: '+855', flag: '\u{1F1F0}\u{1F1ED}', iso: 'KH', name: { fr: 'Cambodge', en: 'Cambodia', ru: '\u041a\u0430\u043c\u0431\u043e\u0434\u0436\u0430', hy: '\u053f\u0561\u0574\u0562\u0578\u057b\u0561' } },
  { code: '+237', flag: '\u{1F1E8}\u{1F1F2}', iso: 'CM', name: { fr: 'Cameroun', en: 'Cameroon', ru: '\u041a\u0430\u043c\u0435\u0440\u0443\u043d', hy: '\u053f\u0561\u0574\u0565\u0580\u0578\u0582\u0576' } },
  { code: '+1', flag: '\u{1F1E8}\u{1F1E6}', iso: 'CA', name: { fr: 'Canada', en: 'Canada', ru: '\u041a\u0430\u043d\u0430\u0434\u0430', hy: '\u053f\u0561\u0576\u0561\u0564\u0561' } },
  { code: '+236', flag: '\u{1F1E8}\u{1F1EB}', iso: 'CF', name: { fr: 'Centrafrique', en: 'Central African Republic', ru: '\u0426\u0410\u0420', hy: '\u053f\u0565\u0576\u057f\u0580\u0578\u0576\u0561\u056f\u0561\u0576' } },
  { code: '+235', flag: '\u{1F1F9}\u{1F1E9}', iso: 'TD', name: { fr: 'Tchad', en: 'Chad', ru: '\u0427\u0430\u0434', hy: '\u0549\u0561\u0564' } },
  { code: '+56', flag: '\u{1F1E8}\u{1F1F1}', iso: 'CL', name: { fr: 'Chili', en: 'Chile', ru: '\u0427\u0438\u043b\u0438', hy: '\u0549\u056b\u056c\u056b' } },
  { code: '+86', flag: '\u{1F1E8}\u{1F1F3}', iso: 'CN', name: { fr: 'Chine', en: 'China', ru: '\u041a\u0438\u0442\u0430\u0439', hy: '\u0549\u056b\u0576\u0561\u057d\u057f\u0561\u0576' } },
  { code: '+57', flag: '\u{1F1E8}\u{1F1F4}', iso: 'CO', name: { fr: 'Colombie', en: 'Colombia', ru: '\u041a\u043e\u043b\u0443\u043c\u0431\u0438\u044f', hy: '\u053f\u0578\u056c\u0578\u0582\u0574\u0562\u056b\u0561' } },
  { code: '+242', flag: '\u{1F1E8}\u{1F1EC}', iso: 'CG', name: { fr: 'Congo', en: 'Congo', ru: '\u041a\u043e\u043d\u0433\u043e', hy: '\u053f\u0578\u0576\u0563\u0578' } },
  { code: '+243', flag: '\u{1F1E8}\u{1F1E9}', iso: 'CD', name: { fr: 'RD Congo', en: 'DR Congo', ru: '\u0414\u0420 \u041a\u043e\u043d\u0433\u043e', hy: '\u053f\u0578\u0576\u0563\u0578\u056b \u0540\u0561\u0576\u0580\u0561\u057a\u0565\u057f\u0578\u0582\u0569\u0575\u0578\u0582\u0576' } },
  { code: '+506', flag: '\u{1F1E8}\u{1F1F7}', iso: 'CR', name: { fr: 'Costa Rica', en: 'Costa Rica', ru: '\u041a\u043e\u0441\u0442\u0430-\u0420\u0438\u043a\u0430', hy: '\u053f\u0578\u057d\u057f\u0561 \u054c\u056b\u056f\u0561' } },
  { code: '+225', flag: '\u{1F1E8}\u{1F1EE}', iso: 'CI', name: { fr: "C\u00f4te d'Ivoire", en: 'Ivory Coast', ru: '\u041a\u043e\u0442-\u0434\u2019\u0418\u0432\u0443\u0430\u0440', hy: "\u0553\u0572\u0578\u057d\u056f\u0580\u056b \u0531\u0583" } },
  { code: '+385', flag: '\u{1F1ED}\u{1F1F7}', iso: 'HR', name: { fr: 'Croatie', en: 'Croatia', ru: '\u0425\u043e\u0440\u0432\u0430\u0442\u0438\u044f', hy: '\u053d\u0578\u0580\u057e\u0561\u0569\u056b\u0561' } },
  { code: '+53', flag: '\u{1F1E8}\u{1F1FA}', iso: 'CU', name: { fr: 'Cuba', en: 'Cuba', ru: '\u041a\u0443\u0431\u0430', hy: '\u053f\u0578\u0582\u0562\u0561' } },
  { code: '+357', flag: '\u{1F1E8}\u{1F1FE}', iso: 'CY', name: { fr: 'Chypre', en: 'Cyprus', ru: '\u041a\u0438\u043f\u0440', hy: '\u053f\u056b\u057a\u0580\u0578\u057d' } },
  { code: '+420', flag: '\u{1F1E8}\u{1F1FF}', iso: 'CZ', name: { fr: 'Tch\u00e9quie', en: 'Czech Republic', ru: '\u0427\u0435\u0445\u0438\u044f', hy: '\u0549\u0565\u056d\u056b\u0561' } },
  { code: '+45', flag: '\u{1F1E9}\u{1F1F0}', iso: 'DK', name: { fr: 'Danemark', en: 'Denmark', ru: '\u0414\u0430\u043d\u0438\u044f', hy: '\u0534\u0561\u0576\u056b\u0561' } },
  { code: '+253', flag: '\u{1F1E9}\u{1F1EF}', iso: 'DJ', name: { fr: 'Djibouti', en: 'Djibouti', ru: '\u0414\u0436\u0438\u0431\u0443\u0442\u0438', hy: '\u054b\u056b\u0562\u0578\u0582\u0569\u056b' } },
  { code: '+593', flag: '\u{1F1EA}\u{1F1E8}', iso: 'EC', name: { fr: '\u00c9quateur', en: 'Ecuador', ru: '\u042d\u043a\u0432\u0430\u0434\u043e\u0440', hy: '\u0537\u056f\u057e\u0561\u0564\u0578\u0580' } },
  { code: '+20', flag: '\u{1F1EA}\u{1F1EC}', iso: 'EG', name: { fr: '\u00c9gypte', en: 'Egypt', ru: '\u0415\u0433\u0438\u043f\u0435\u0442', hy: '\u0535\u0563\u056b\u057a\u057f\u0578\u057d' } },
  { code: '+372', flag: '\u{1F1EA}\u{1F1EA}', iso: 'EE', name: { fr: 'Estonie', en: 'Estonia', ru: '\u042d\u0441\u0442\u043e\u043d\u0438\u044f', hy: '\u0537\u057d\u057f\u0578\u0576\u056b\u0561' } },
  { code: '+251', flag: '\u{1F1EA}\u{1F1F9}', iso: 'ET', name: { fr: '\u00c9thiopie', en: 'Ethiopia', ru: '\u042d\u0444\u0438\u043e\u043f\u0438\u044f', hy: '\u0535\u0569\u0578\u057e\u057a\u056b\u0561' } },
  { code: '+358', flag: '\u{1F1EB}\u{1F1EE}', iso: 'FI', name: { fr: 'Finlande', en: 'Finland', ru: '\u0424\u0438\u043d\u043b\u044f\u043d\u0434\u0438\u044f', hy: '\u0556\u056b\u0576\u056c\u0561\u0576\u0564\u056b\u0561' } },
  { code: '+33', flag: '\u{1F1EB}\u{1F1F7}', iso: 'FR', name: { fr: 'France', en: 'France', ru: '\u0424\u0440\u0430\u043d\u0446\u0438\u044f', hy: '\u0556\u0580\u0561\u0576\u057d\u056b\u0561' } },
  { code: '+241', flag: '\u{1F1EC}\u{1F1E6}', iso: 'GA', name: { fr: 'Gabon', en: 'Gabon', ru: '\u0413\u0430\u0431\u043e\u043d', hy: '\u0533\u0561\u0562\u0578\u0576' } },
  { code: '+220', flag: '\u{1F1EC}\u{1F1F2}', iso: 'GM', name: { fr: 'Gambie', en: 'Gambia', ru: '\u0413\u0430\u043c\u0431\u0438\u044f', hy: '\u0533\u0561\u0574\u0562\u056b\u0561' } },
  { code: '+995', flag: '\u{1F1EC}\u{1F1EA}', iso: 'GE', name: { fr: 'G\u00e9orgie', en: 'Georgia', ru: '\u0413\u0440\u0443\u0437\u0438\u044f', hy: '\u054e\u0580\u0561\u057d\u057f\u0561\u0576' } },
  { code: '+49', flag: '\u{1F1E9}\u{1F1EA}', iso: 'DE', name: { fr: 'Allemagne', en: 'Germany', ru: '\u0413\u0435\u0440\u043c\u0430\u043d\u0438\u044f', hy: '\u0533\u0565\u0580\u0574\u0561\u0576\u056b\u0561' } },
  { code: '+233', flag: '\u{1F1EC}\u{1F1ED}', iso: 'GH', name: { fr: 'Ghana', en: 'Ghana', ru: '\u0413\u0430\u043d\u0430', hy: '\u0533\u0561\u0576\u0561' } },
  { code: '+30', flag: '\u{1F1EC}\u{1F1F7}', iso: 'GR', name: { fr: 'Gr\u00e8ce', en: 'Greece', ru: '\u0413\u0440\u0435\u0446\u0438\u044f', hy: '\u0540\u0578\u0582\u0576\u0561\u057d\u057f\u0561\u0576' } },
  { code: '+502', flag: '\u{1F1EC}\u{1F1F9}', iso: 'GT', name: { fr: 'Guatemala', en: 'Guatemala', ru: '\u0413\u0432\u0430\u0442\u0435\u043c\u0430\u043b\u0430', hy: '\u0533\u057e\u0561\u057f\u0565\u0574\u0561\u056c\u0561' } },
  { code: '+224', flag: '\u{1F1EC}\u{1F1F3}', iso: 'GN', name: { fr: 'Guin\u00e9e', en: 'Guinea', ru: '\u0413\u0432\u0438\u043d\u0435\u044f', hy: '\u0533\u057e\u056b\u0576\u0565\u0561' } },
  { code: '+509', flag: '\u{1F1ED}\u{1F1F9}', iso: 'HT', name: { fr: 'Ha\u00efti', en: 'Haiti', ru: '\u0413\u0430\u0438\u0442\u0438', hy: '\u0540\u0561\u056b\u0569\u056b' } },
  { code: '+504', flag: '\u{1F1ED}\u{1F1F3}', iso: 'HN', name: { fr: 'Honduras', en: 'Honduras', ru: '\u0413\u043e\u043d\u0434\u0443\u0440\u0430\u0441', hy: '\u0540\u0578\u0576\u0564\u0578\u0582\u0580\u0561\u057d' } },
  { code: '+852', flag: '\u{1F1ED}\u{1F1F0}', iso: 'HK', name: { fr: 'Hong Kong', en: 'Hong Kong', ru: '\u0413\u043e\u043d\u043a\u043e\u043d\u0433', hy: '\u0540\u0578\u0576\u0563\u056f\u0578\u0576\u0563' } },
  { code: '+36', flag: '\u{1F1ED}\u{1F1FA}', iso: 'HU', name: { fr: 'Hongrie', en: 'Hungary', ru: '\u0412\u0435\u043d\u0433\u0440\u0438\u044f', hy: '\u0540\u0578\u0582\u0576\u0563\u0561\u0580\u056b\u0561' } },
  { code: '+354', flag: '\u{1F1EE}\u{1F1F8}', iso: 'IS', name: { fr: 'Islande', en: 'Iceland', ru: '\u0418\u0441\u043b\u0430\u043d\u0434\u0438\u044f', hy: '\u053b\u057d\u056c\u0561\u0576\u0564\u056b\u0561' } },
  { code: '+91', flag: '\u{1F1EE}\u{1F1F3}', iso: 'IN', name: { fr: 'Inde', en: 'India', ru: '\u0418\u043d\u0434\u0438\u044f', hy: '\u0540\u0576\u0564\u056f\u0561\u057d\u057f\u0561\u0576' } },
  { code: '+62', flag: '\u{1F1EE}\u{1F1E9}', iso: 'ID', name: { fr: 'Indon\u00e9sie', en: 'Indonesia', ru: '\u0418\u043d\u0434\u043e\u043d\u0435\u0437\u0438\u044f', hy: '\u053b\u0576\u0564\u0578\u0576\u0565\u0566\u056b\u0561' } },
  { code: '+98', flag: '\u{1F1EE}\u{1F1F7}', iso: 'IR', name: { fr: 'Iran', en: 'Iran', ru: '\u0418\u0440\u0430\u043d', hy: '\u053b\u0580\u0561\u0576' } },
  { code: '+964', flag: '\u{1F1EE}\u{1F1F6}', iso: 'IQ', name: { fr: 'Irak', en: 'Iraq', ru: '\u0418\u0440\u0430\u043a', hy: '\u053b\u0580\u0561\u0584' } },
  { code: '+353', flag: '\u{1F1EE}\u{1F1EA}', iso: 'IE', name: { fr: 'Irlande', en: 'Ireland', ru: '\u0418\u0440\u043b\u0430\u043d\u0434\u0438\u044f', hy: '\u053b\u057c\u056c\u0561\u0576\u0564\u056b\u0561' } },
  { code: '+972', flag: '\u{1F1EE}\u{1F1F1}', iso: 'IL', name: { fr: 'Isra\u00ebl', en: 'Israel', ru: '\u0418\u0437\u0440\u0430\u0438\u043b\u044c', hy: '\u053b\u057d\u0580\u0561\u0575\u0565\u056c' } },
  { code: '+39', flag: '\u{1F1EE}\u{1F1F9}', iso: 'IT', name: { fr: 'Italie', en: 'Italy', ru: '\u0418\u0442\u0430\u043b\u0438\u044f', hy: '\u053b\u057f\u0561\u056c\u056b\u0561' } },
  { code: '+81', flag: '\u{1F1EF}\u{1F1F5}', iso: 'JP', name: { fr: 'Japon', en: 'Japan', ru: '\u042f\u043f\u043e\u043d\u0438\u044f', hy: '\u0543\u0561\u057a\u0578\u0576\u056b\u0561' } },
  { code: '+962', flag: '\u{1F1EF}\u{1F1F4}', iso: 'JO', name: { fr: 'Jordanie', en: 'Jordan', ru: '\u0418\u043e\u0440\u0434\u0430\u043d\u0438\u044f', hy: '\u0540\u0578\u0580\u0564\u0561\u0576\u0561\u0576' } },
  { code: '+7', flag: '\u{1F1F0}\u{1F1FF}', iso: 'KZ', name: { fr: 'Kazakhstan', en: 'Kazakhstan', ru: '\u041a\u0430\u0437\u0430\u0445\u0441\u0442\u0430\u043d', hy: '\u0542\u0561\u0566\u0561\u056d\u057d\u057f\u0561\u0576' } },
  { code: '+254', flag: '\u{1F1F0}\u{1F1EA}', iso: 'KE', name: { fr: 'Kenya', en: 'Kenya', ru: '\u041a\u0435\u043d\u0438\u044f', hy: '\u053f\u0565\u0576\u056b\u0561' } },
  { code: '+965', flag: '\u{1F1F0}\u{1F1FC}', iso: 'KW', name: { fr: 'Kowe\u00eft', en: 'Kuwait', ru: '\u041a\u0443\u0432\u0435\u0439\u0442', hy: '\u0554\u0578\u0582\u057e\u0565\u0575\u0569' } },
  { code: '+996', flag: '\u{1F1F0}\u{1F1EC}', iso: 'KG', name: { fr: 'Kirghizistan', en: 'Kyrgyzstan', ru: '\u041a\u0438\u0440\u0433\u0438\u0437\u0438\u044f', hy: '\u0542\u0580\u0572\u0566\u057d\u057f\u0561\u0576' } },
  { code: '+856', flag: '\u{1F1F1}\u{1F1E6}', iso: 'LA', name: { fr: 'Laos', en: 'Laos', ru: '\u041b\u0430\u043e\u0441', hy: '\u053c\u0561\u0578\u057d' } },
  { code: '+371', flag: '\u{1F1F1}\u{1F1FB}', iso: 'LV', name: { fr: 'Lettonie', en: 'Latvia', ru: '\u041b\u0430\u0442\u0432\u0438\u044f', hy: '\u053c\u0561\u057f\u057e\u056b\u0561' } },
  { code: '+961', flag: '\u{1F1F1}\u{1F1E7}', iso: 'LB', name: { fr: 'Liban', en: 'Lebanon', ru: '\u041b\u0438\u0432\u0430\u043d', hy: '\u053c\u056b\u0562\u0561\u0576\u0561\u0576' } },
  { code: '+218', flag: '\u{1F1F1}\u{1F1FE}', iso: 'LY', name: { fr: 'Libye', en: 'Libya', ru: '\u041b\u0438\u0432\u0438\u044f', hy: '\u053c\u056b\u0562\u056b\u0561' } },
  { code: '+423', flag: '\u{1F1F1}\u{1F1EE}', iso: 'LI', name: { fr: 'Liechtenstein', en: 'Liechtenstein', ru: '\u041b\u0438\u0445\u0442\u0435\u043d\u0448\u0442\u0435\u0439\u043d', hy: '\u053c\u056b\u056d\u057f\u0565\u0576\u0577\u057f\u0561\u0575\u0576' } },
  { code: '+370', flag: '\u{1F1F1}\u{1F1F9}', iso: 'LT', name: { fr: 'Lituanie', en: 'Lithuania', ru: '\u041b\u0438\u0442\u0432\u0430', hy: '\u053c\u056b\u057f\u057e\u0561' } },
  { code: '+352', flag: '\u{1F1F1}\u{1F1FA}', iso: 'LU', name: { fr: 'Luxembourg', en: 'Luxembourg', ru: '\u041b\u044e\u043a\u0441\u0435\u043c\u0431\u0443\u0440\u0433', hy: '\u053c\u0575\u0578\u0582\u0584\u057d\u0565\u0574\u0562\u0578\u0582\u0580\u0563' } },
  { code: '+261', flag: '\u{1F1F2}\u{1F1EC}', iso: 'MG', name: { fr: 'Madagascar', en: 'Madagascar', ru: '\u041c\u0430\u0434\u0430\u0433\u0430\u0441\u043a\u0430\u0440', hy: '\u0544\u0561\u0564\u0561\u0563\u0561\u057d\u056f\u0561\u0580' } },
  { code: '+60', flag: '\u{1F1F2}\u{1F1FE}', iso: 'MY', name: { fr: 'Malaisie', en: 'Malaysia', ru: '\u041c\u0430\u043b\u0430\u0439\u0437\u0438\u044f', hy: '\u0544\u0561\u056c\u0561\u0575\u0566\u056b\u0561' } },
  { code: '+223', flag: '\u{1F1F2}\u{1F1F1}', iso: 'ML', name: { fr: 'Mali', en: 'Mali', ru: '\u041c\u0430\u043b\u0438', hy: '\u0544\u0561\u056c\u056b' } },
  { code: '+356', flag: '\u{1F1F2}\u{1F1F9}', iso: 'MT', name: { fr: 'Malte', en: 'Malta', ru: '\u041c\u0430\u043b\u044c\u0442\u0430', hy: '\u0544\u0561\u056c\u0569\u0561' } },
  { code: '+222', flag: '\u{1F1F2}\u{1F1F7}', iso: 'MR', name: { fr: 'Mauritanie', en: 'Mauritania', ru: '\u041c\u0430\u0432\u0440\u0438\u0442\u0430\u043d\u0438\u044f', hy: '\u0544\u0561\u057e\u0580\u056b\u057f\u0561\u0576\u056b\u0561' } },
  { code: '+230', flag: '\u{1F1F2}\u{1F1FA}', iso: 'MU', name: { fr: 'Maurice', en: 'Mauritius', ru: '\u041c\u0430\u0432\u0440\u0438\u043a\u0438\u0439', hy: '\u0544\u0561\u057e\u0580\u056b\u056f\u056b\u0578\u057d' } },
  { code: '+52', flag: '\u{1F1F2}\u{1F1FD}', iso: 'MX', name: { fr: 'Mexique', en: 'Mexico', ru: '\u041c\u0435\u043a\u0441\u0438\u043a\u0430', hy: '\u0544\u0565\u0584\u057d\u056b\u056f\u0561' } },
  { code: '+373', flag: '\u{1F1F2}\u{1F1E9}', iso: 'MD', name: { fr: 'Moldavie', en: 'Moldova', ru: '\u041c\u043e\u043b\u0434\u043e\u0432\u0430', hy: '\u0544\u0578\u056c\u0564\u0578\u057e\u0561' } },
  { code: '+377', flag: '\u{1F1F2}\u{1F1E8}', iso: 'MC', name: { fr: 'Monaco', en: 'Monaco', ru: '\u041c\u043e\u043d\u0430\u043a\u043e', hy: '\u0544\u0578\u0576\u0561\u056f\u0578' } },
  { code: '+976', flag: '\u{1F1F2}\u{1F1F3}', iso: 'MN', name: { fr: 'Mongolie', en: 'Mongolia', ru: '\u041c\u043e\u043d\u0433\u043e\u043b\u0438\u044f', hy: '\u0544\u0578\u0576\u0572\u0578\u056c\u056b\u0561' } },
  { code: '+382', flag: '\u{1F1F2}\u{1F1EA}', iso: 'ME', name: { fr: 'Mont\u00e9n\u00e9gro', en: 'Montenegro', ru: '\u0427\u0435\u0440\u043d\u043e\u0433\u043e\u0440\u0438\u044f', hy: '\u0549\u0565\u057c\u0576\u0578\u0563\u0578\u0580\u056b\u0561' } },
  { code: '+212', flag: '\u{1F1F2}\u{1F1E6}', iso: 'MA', name: { fr: 'Maroc', en: 'Morocco', ru: '\u041c\u0430\u0440\u043e\u043a\u043a\u043e', hy: '\u0544\u0561\u0580\u0578\u056f\u056f\u0578' } },
  { code: '+258', flag: '\u{1F1F2}\u{1F1FF}', iso: 'MZ', name: { fr: 'Mozambique', en: 'Mozambique', ru: '\u041c\u043e\u0437\u0430\u043c\u0431\u0438\u043a', hy: '\u0544\u0578\u0566\u0561\u0574\u0562\u056b\u056f' } },
  { code: '+95', flag: '\u{1F1F2}\u{1F1F2}', iso: 'MM', name: { fr: 'Myanmar', en: 'Myanmar', ru: '\u041c\u044c\u044f\u043d\u043c\u0430', hy: '\u0544\u0575\u0561\u0576\u0574\u0561' } },
  { code: '+264', flag: '\u{1F1F3}\u{1F1E6}', iso: 'NA', name: { fr: 'Namibie', en: 'Namibia', ru: '\u041d\u0430\u043c\u0438\u0431\u0438\u044f', hy: '\u0546\u0561\u0574\u056b\u0562\u056b\u0561' } },
  { code: '+977', flag: '\u{1F1F3}\u{1F1F5}', iso: 'NP', name: { fr: 'N\u00e9pal', en: 'Nepal', ru: '\u041d\u0435\u043f\u0430\u043b', hy: '\u0546\u0565\u057a\u0561\u056c' } },
  { code: '+31', flag: '\u{1F1F3}\u{1F1F1}', iso: 'NL', name: { fr: 'Pays-Bas', en: 'Netherlands', ru: '\u041d\u0438\u0434\u0435\u0440\u043b\u0430\u043d\u0434\u044b', hy: '\u0546\u056b\u0564\u0565\u057c\u056c\u0561\u0576\u0564\u0576\u0565\u0580' } },
  { code: '+64', flag: '\u{1F1F3}\u{1F1FF}', iso: 'NZ', name: { fr: 'Nouvelle-Z\u00e9lande', en: 'New Zealand', ru: '\u041d\u043e\u0432\u0430\u044f \u0417\u0435\u043b\u0430\u043d\u0434\u0438\u044f', hy: '\u0546\u0578\u0580 \u0536\u0565\u056c\u0561\u0576\u0564\u056b\u0561' } },
  { code: '+505', flag: '\u{1F1F3}\u{1F1EE}', iso: 'NI', name: { fr: 'Nicaragua', en: 'Nicaragua', ru: '\u041d\u0438\u043a\u0430\u0440\u0430\u0433\u0443\u0430', hy: '\u0546\u056b\u056f\u0561\u0580\u0561\u0563\u0578\u0582\u0561' } },
  { code: '+227', flag: '\u{1F1F3}\u{1F1EA}', iso: 'NE', name: { fr: 'Niger', en: 'Niger', ru: '\u041d\u0438\u0433\u0435\u0440', hy: '\u0546\u056b\u0563\u0565\u0580' } },
  { code: '+234', flag: '\u{1F1F3}\u{1F1EC}', iso: 'NG', name: { fr: 'Nigeria', en: 'Nigeria', ru: '\u041d\u0438\u0433\u0435\u0440\u0438\u044f', hy: '\u0546\u056b\u0563\u0565\u0580\u056b\u0561' } },
  { code: '+389', flag: '\u{1F1F2}\u{1F1F0}', iso: 'MK', name: { fr: 'Mac\u00e9doine du Nord', en: 'North Macedonia', ru: '\u0421\u0435\u0432\u0435\u0440\u043d\u0430\u044f \u041c\u0430\u043a\u0435\u0434\u043e\u043d\u0438\u044f', hy: '\u0540\u0575\u0578\u0582\u057d\u056b\u057d\u0561\u0575\u056b\u0576 \u0544\u0561\u056f\u0565\u0564\u0578\u0576\u056b\u0561' } },
  { code: '+47', flag: '\u{1F1F3}\u{1F1F4}', iso: 'NO', name: { fr: 'Norv\u00e8ge', en: 'Norway', ru: '\u041d\u043e\u0440\u0432\u0435\u0433\u0438\u044f', hy: '\u0546\u0578\u0580\u057e\u0565\u0563\u056b\u0561' } },
  { code: '+968', flag: '\u{1F1F4}\u{1F1F2}', iso: 'OM', name: { fr: 'Oman', en: 'Oman', ru: '\u041e\u043c\u0430\u043d', hy: '\u0555\u0574\u0561\u0576' } },
  { code: '+92', flag: '\u{1F1F5}\u{1F1F0}', iso: 'PK', name: { fr: 'Pakistan', en: 'Pakistan', ru: '\u041f\u0430\u043a\u0438\u0441\u0442\u0430\u043d', hy: '\u054a\u0561\u056f\u056b\u057d\u057f\u0561\u0576' } },
  { code: '+507', flag: '\u{1F1F5}\u{1F1E6}', iso: 'PA', name: { fr: 'Panama', en: 'Panama', ru: '\u041f\u0430\u043d\u0430\u043c\u0430', hy: '\u054a\u0561\u0576\u0561\u0574\u0561' } },
  { code: '+595', flag: '\u{1F1F5}\u{1F1FE}', iso: 'PY', name: { fr: 'Paraguay', en: 'Paraguay', ru: '\u041f\u0430\u0440\u0430\u0433\u0432\u0430\u0439', hy: '\u054a\u0561\u0580\u0561\u0563\u057e\u0561\u0575' } },
  { code: '+51', flag: '\u{1F1F5}\u{1F1EA}', iso: 'PE', name: { fr: 'P\u00e9rou', en: 'Peru', ru: '\u041f\u0435\u0440\u0443', hy: '\u054a\u0565\u0580\u0578\u0582' } },
  { code: '+63', flag: '\u{1F1F5}\u{1F1ED}', iso: 'PH', name: { fr: 'Philippines', en: 'Philippines', ru: '\u0424\u0438\u043b\u0438\u043f\u043f\u0438\u043d\u044b', hy: '\u0556\u056b\u056c\u056b\u057a\u056b\u0576\u0576\u0565\u0580' } },
  { code: '+48', flag: '\u{1F1F5}\u{1F1F1}', iso: 'PL', name: { fr: 'Pologne', en: 'Poland', ru: '\u041f\u043e\u043b\u044c\u0448\u0430', hy: '\u053c\u0565\u0570\u0561\u057d\u057f\u0561\u0576' } },
  { code: '+351', flag: '\u{1F1F5}\u{1F1F9}', iso: 'PT', name: { fr: 'Portugal', en: 'Portugal', ru: '\u041f\u043e\u0440\u0442\u0443\u0433\u0430\u043b\u0438\u044f', hy: '\u054a\u0578\u0580\u057f\u0578\u0582\u0563\u0561\u056c\u056b\u0561' } },
  { code: '+974', flag: '\u{1F1F6}\u{1F1E6}', iso: 'QA', name: { fr: 'Qatar', en: 'Qatar', ru: '\u041a\u0430\u0442\u0430\u0440', hy: '\u053f\u0561\u057f\u0561\u0580' } },
  { code: '+40', flag: '\u{1F1F7}\u{1F1F4}', iso: 'RO', name: { fr: 'Roumanie', en: 'Romania', ru: '\u0420\u0443\u043c\u044b\u043d\u0438\u044f', hy: '\u054c\u0578\u0582\u0574\u056b\u0576\u056b\u0561' } },
  { code: '+7', flag: '\u{1F1F7}\u{1F1FA}', iso: 'RU', name: { fr: 'Russie', en: 'Russia', ru: '\u0420\u043e\u0441\u0441\u0438\u044f', hy: '\u054c\u0578\u0582\u057d\u0561\u057d\u057f\u0561\u0576' } },
  { code: '+250', flag: '\u{1F1F7}\u{1F1FC}', iso: 'RW', name: { fr: 'Rwanda', en: 'Rwanda', ru: '\u0420\u0443\u0430\u043d\u0434\u0430', hy: '\u054c\u0578\u0582\u0561\u0576\u0564\u0561' } },
  { code: '+966', flag: '\u{1F1F8}\u{1F1E6}', iso: 'SA', name: { fr: 'Arabie Saoudite', en: 'Saudi Arabia', ru: '\u0421\u0430\u0443\u0434\u043e\u0432\u0441\u043a\u0430\u044f \u0410\u0440\u0430\u0432\u0438\u044f', hy: '\u054d\u0561\u0578\u0582\u0564\u0575\u0561\u0576 \u0531\u0580\u0561\u0562\u056b\u0561' } },
  { code: '+221', flag: '\u{1F1F8}\u{1F1F3}', iso: 'SN', name: { fr: 'S\u00e9n\u00e9gal', en: 'Senegal', ru: '\u0421\u0435\u043d\u0435\u0433\u0430\u043b', hy: '\u054d\u0565\u0576\u0565\u0563\u0561\u056c' } },
  { code: '+381', flag: '\u{1F1F7}\u{1F1F8}', iso: 'RS', name: { fr: 'Serbie', en: 'Serbia', ru: '\u0421\u0435\u0440\u0431\u0438\u044f', hy: '\u054d\u0565\u0580\u0562\u056b\u0561' } },
  { code: '+65', flag: '\u{1F1F8}\u{1F1EC}', iso: 'SG', name: { fr: 'Singapour', en: 'Singapore', ru: '\u0421\u0438\u043d\u0433\u0430\u043f\u0443\u0440', hy: '\u054d\u056b\u0576\u0563\u0561\u057a\u0578\u0582\u0580' } },
  { code: '+421', flag: '\u{1F1F8}\u{1F1F0}', iso: 'SK', name: { fr: 'Slovaquie', en: 'Slovakia', ru: '\u0421\u043b\u043e\u0432\u0430\u043a\u0438\u044f', hy: '\u054d\u056c\u0578\u057e\u0561\u056f\u056b\u0561' } },
  { code: '+386', flag: '\u{1F1F8}\u{1F1EE}', iso: 'SI', name: { fr: 'Slov\u00e9nie', en: 'Slovenia', ru: '\u0421\u043b\u043e\u0432\u0435\u043d\u0438\u044f', hy: '\u054d\u056c\u0578\u057e\u0565\u0576\u056b\u0561' } },
  { code: '+252', flag: '\u{1F1F8}\u{1F1F4}', iso: 'SO', name: { fr: 'Somalie', en: 'Somalia', ru: '\u0421\u043e\u043c\u0430\u043b\u0438', hy: '\u054d\u0578\u0574\u0561\u056c\u056b' } },
  { code: '+27', flag: '\u{1F1FF}\u{1F1E6}', iso: 'ZA', name: { fr: 'Afrique du Sud', en: 'South Africa', ru: '\u042e\u0410\u0420', hy: '\u0540\u0561\u0580\u0561\u057e\u0561\u0575\u056b\u0576 \u0531\u0586\u0580\u056b\u056f\u0561' } },
  { code: '+82', flag: '\u{1F1F0}\u{1F1F7}', iso: 'KR', name: { fr: 'Cor\u00e9e du Sud', en: 'South Korea', ru: '\u042e\u0436\u043d\u0430\u044f \u041a\u043e\u0440\u0435\u044f', hy: '\u0540\u0561\u0580\u0561\u057e\u0561\u0575\u056b\u0576 \u053f\u0578\u0580\u0565\u0561' } },
  { code: '+34', flag: '\u{1F1EA}\u{1F1F8}', iso: 'ES', name: { fr: 'Espagne', en: 'Spain', ru: '\u0418\u0441\u043f\u0430\u043d\u0438\u044f', hy: '\u053b\u057d\u057a\u0561\u0576\u056b\u0561' } },
  { code: '+94', flag: '\u{1F1F1}\u{1F1F0}', iso: 'LK', name: { fr: 'Sri Lanka', en: 'Sri Lanka', ru: '\u0428\u0440\u0438-\u041b\u0430\u043d\u043a\u0430', hy: '\u0547\u0580\u056b \u053c\u0561\u0576\u056f\u0561' } },
  { code: '+249', flag: '\u{1F1F8}\u{1F1E9}', iso: 'SD', name: { fr: 'Soudan', en: 'Sudan', ru: '\u0421\u0443\u0434\u0430\u043d', hy: '\u054d\u0578\u0582\u0564\u0561\u0576' } },
  { code: '+46', flag: '\u{1F1F8}\u{1F1EA}', iso: 'SE', name: { fr: 'Su\u00e8de', en: 'Sweden', ru: '\u0428\u0432\u0435\u0446\u0438\u044f', hy: '\u0547\u057e\u0565\u0564\u056b\u0561' } },
  { code: '+41', flag: '\u{1F1E8}\u{1F1ED}', iso: 'CH', name: { fr: 'Suisse', en: 'Switzerland', ru: '\u0428\u0432\u0435\u0439\u0446\u0430\u0440\u0438\u044f', hy: '\u0547\u057e\u0565\u0575\u0581\u0561\u0580\u056b\u0561' } },
  { code: '+963', flag: '\u{1F1F8}\u{1F1FE}', iso: 'SY', name: { fr: 'Syrie', en: 'Syria', ru: '\u0421\u0438\u0440\u0438\u044f', hy: '\u054d\u056b\u0580\u056b\u0561' } },
  { code: '+886', flag: '\u{1F1F9}\u{1F1FC}', iso: 'TW', name: { fr: 'Ta\u00efwan', en: 'Taiwan', ru: '\u0422\u0430\u0439\u0432\u0430\u043d\u044c', hy: '\u0539\u0561\u0575\u057e\u0561\u0576' } },
  { code: '+992', flag: '\u{1F1F9}\u{1F1EF}', iso: 'TJ', name: { fr: 'Tadjikistan', en: 'Tajikistan', ru: '\u0422\u0430\u0434\u0436\u0438\u043a\u0438\u0441\u0442\u0430\u043d', hy: '\u054f\u0561\u057b\u056b\u056f\u057d\u057f\u0561\u0576' } },
  { code: '+255', flag: '\u{1F1F9}\u{1F1FF}', iso: 'TZ', name: { fr: 'Tanzanie', en: 'Tanzania', ru: '\u0422\u0430\u043d\u0437\u0430\u043d\u0438\u044f', hy: '\u054f\u0561\u0576\u0566\u0561\u0576\u056b\u0561' } },
  { code: '+66', flag: '\u{1F1F9}\u{1F1ED}', iso: 'TH', name: { fr: 'Tha\u00eflande', en: 'Thailand', ru: '\u0422\u0430\u0438\u043b\u0430\u043d\u0434', hy: '\u0539\u0561\u056b\u056c\u0561\u0576\u0564' } },
  { code: '+228', flag: '\u{1F1F9}\u{1F1EC}', iso: 'TG', name: { fr: 'Togo', en: 'Togo', ru: '\u0422\u043e\u0433\u043e', hy: '\u054f\u0578\u0563\u0578' } },
  { code: '+216', flag: '\u{1F1F9}\u{1F1F3}', iso: 'TN', name: { fr: 'Tunisie', en: 'Tunisia', ru: '\u0422\u0443\u043d\u0438\u0441', hy: '\u0539\u0578\u0582\u0576\u056b\u057d' } },
  { code: '+90', flag: '\u{1F1F9}\u{1F1F7}', iso: 'TR', name: { fr: 'Turquie', en: 'Turkey', ru: '\u0422\u0443\u0440\u0446\u0438\u044f', hy: '\u0539\u0578\u0582\u0580\u0584\u056b\u0561' } },
  { code: '+993', flag: '\u{1F1F9}\u{1F1F2}', iso: 'TM', name: { fr: 'Turkm\u00e9nistan', en: 'Turkmenistan', ru: '\u0422\u0443\u0440\u043a\u043c\u0435\u043d\u0438\u0441\u0442\u0430\u043d', hy: '\u0539\u0578\u0582\u0580\u0584\u0574\u0565\u0576\u057d\u057f\u0561\u0576' } },
  { code: '+256', flag: '\u{1F1FA}\u{1F1EC}', iso: 'UG', name: { fr: 'Ouganda', en: 'Uganda', ru: '\u0423\u0433\u0430\u043d\u0434\u0430', hy: '\u0548\u0582\u0563\u0561\u0576\u0564\u0561' } },
  { code: '+380', flag: '\u{1F1FA}\u{1F1E6}', iso: 'UA', name: { fr: 'Ukraine', en: 'Ukraine', ru: '\u0423\u043a\u0440\u0430\u0438\u043d\u0430', hy: '\u0548\u0582\u056f\u0580\u0561\u056b\u0576\u0561' } },
  { code: '+971', flag: '\u{1F1E6}\u{1F1EA}', iso: 'AE', name: { fr: '\u00c9mirats Arabes Unis', en: 'United Arab Emirates', ru: '\u041e\u0410\u042d', hy: '\u0531\u0544\u0537' } },
  { code: '+44', flag: '\u{1F1EC}\u{1F1E7}', iso: 'GB', name: { fr: 'Royaume-Uni', en: 'United Kingdom', ru: '\u0412\u0435\u043b\u0438\u043a\u043e\u0431\u0440\u0438\u0442\u0430\u043d\u0438\u044f', hy: '\u0544\u056b\u0561\u0581\u0575\u0561\u056c \u0539\u0561\u0563\u0561\u057e\u0578\u0580\u0578\u0582\u0569\u0575\u0578\u0582\u0576' } },
  { code: '+1', flag: '\u{1F1FA}\u{1F1F8}', iso: 'US', name: { fr: '\u00c9tats-Unis', en: 'United States', ru: '\u0421\u0428\u0410', hy: '\u0531\u0544\u0546' } },
  { code: '+598', flag: '\u{1F1FA}\u{1F1FE}', iso: 'UY', name: { fr: 'Uruguay', en: 'Uruguay', ru: '\u0423\u0440\u0443\u0433\u0432\u0430\u0439', hy: '\u0548\u0582\u0580\u0578\u0582\u0563\u057e\u0561\u0575' } },
  { code: '+998', flag: '\u{1F1FA}\u{1F1FF}', iso: 'UZ', name: { fr: 'Ouzb\u00e9kistan', en: 'Uzbekistan', ru: '\u0423\u0437\u0431\u0435\u043a\u0438\u0441\u0442\u0430\u043d', hy: '\u0548\u0582\u0566\u0562\u0565\u056f\u057d\u057f\u0561\u0576' } },
  { code: '+58', flag: '\u{1F1FB}\u{1F1EA}', iso: 'VE', name: { fr: 'Venezuela', en: 'Venezuela', ru: '\u0412\u0435\u043d\u0435\u0441\u0443\u044d\u043b\u0430', hy: '\u054e\u0565\u0576\u0565\u057d\u0578\u0582\u0565\u056c\u0561' } },
  { code: '+84', flag: '\u{1F1FB}\u{1F1F3}', iso: 'VN', name: { fr: 'Vietnam', en: 'Vietnam', ru: '\u0412\u044c\u0435\u0442\u043d\u0430\u043c', hy: '\u054e\u056b\u0565\u057f\u0576\u0561\u0574' } },
  { code: '+967', flag: '\u{1F1FE}\u{1F1EA}', iso: 'YE', name: { fr: 'Y\u00e9men', en: 'Yemen', ru: '\u0419\u0435\u043c\u0435\u043d', hy: '\u0535\u0574\u0565\u0576' } },
  { code: '+260', flag: '\u{1F1FF}\u{1F1F2}', iso: 'ZM', name: { fr: 'Zambie', en: 'Zambia', ru: '\u0417\u0430\u043c\u0431\u0438\u044f', hy: '\u0536\u0561\u0574\u0562\u056b\u0561' } },
  { code: '+263', flag: '\u{1F1FF}\u{1F1FC}', iso: 'ZW', name: { fr: 'Zimbabwe', en: 'Zimbabwe', ru: '\u0417\u0438\u043c\u0431\u0430\u0431\u0432\u0435', hy: '\u0536\u056b\u0574\u0562\u0561\u0562\u057e\u0565' } },
];

/* ISO → country map for fast lookup */
const ISO_MAP = {};
COUNTRIES.forEach(c => { ISO_MAP[c.iso] = c; });

const UI_TEXTS = {
  fr: { searchPlaceholder: 'Rechercher un pays...', noResult: 'Aucun r\u00e9sultat' },
  en: { searchPlaceholder: 'Search a country...', noResult: 'No results' },
  ru: { searchPlaceholder: '\u041f\u043e\u0438\u0441\u043a \u0441\u0442\u0440\u0430\u043d\u044b...', noResult: '\u041d\u0435\u0442 \u0440\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442\u043e\u0432' },
  hy: { searchPlaceholder: '\u0553\u0576\u057f\u0580\u0565\u056c \u0565\u0580\u056f\u056b\u0580...', noResult: '\u0531\u0580\u0564\u0575\u0578\u0582\u0576\u0584 \u0579\u056f\u0561\u0576' },
};

const PhoneInput = ({ value, onChange, onCountryChange, className, error, darkMode = true, priorityCountries = [], size = 'default' }) => {
  let lang = 'fr';
  try { const ctx = useLanguage(); if (ctx?.language) lang = ctx.language; } catch {}

  const texts = UI_TEXTS[lang] || UI_TEXTS.fr;
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(ISO_MAP['FR']);
  const ref = useRef(null);
  const searchRef = useRef(null);
  const [geoDetected, setGeoDetected] = useState(false);

  const getName = (c) => c.name[lang] || c.name.en || c.name.fr;

  /* Auto-detect country by IP on mount */
  useEffect(() => {
    if (geoDetected) return;
    fetch('https://api.country.is/')
      .then(r => r.json())
      .then(data => {
        const iso = data?.country;
        if (iso && ISO_MAP[iso]) {
          setSelected(ISO_MAP[iso]);
          if (onCountryChange) onCountryChange(ISO_MAP[iso].code);
        }
      })
      .catch(() => {})
      .finally(() => setGeoDetected(true));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { if (open && searchRef.current) searchRef.current.focus(); }, [open]);

  const filtered = search
    ? COUNTRIES.filter(c =>
        getName(c).toLowerCase().includes(search.toLowerCase()) ||
        c.code.includes(search) ||
        c.iso.toLowerCase().includes(search.toLowerCase())
      )
    : COUNTRIES;

  /* When no search, prepend priority countries (kept in given order) above an alphabetical list */
  const priorityList = !search && priorityCountries.length
    ? priorityCountries.map(iso => ISO_MAP[iso]).filter(Boolean)
    : [];
  const priorityIsoSet = new Set(priorityList.map(c => c.iso));
  const restList = filtered.filter(c => !priorityIsoSet.has(c.iso));

  const isLarge = size === 'large';

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
        <button type="button" onClick={() => setOpen(!open)}
          className={`flex items-center gap-1.5 ${isLarge ? 'px-4 py-4' : 'px-3 py-3'} ${bg} border-r ${border} shrink-0 ${text} ${isLarge ? 'text-base' : 'text-sm'}`}
          data-testid="phone-country-btn">
          <span className={isLarge ? 'text-2xl leading-none' : 'text-lg leading-none'}>{selected.flag}</span>
          <span className={`${isLarge ? 'text-base' : 'text-xs'} font-medium`}>{selected.code}</span>
          <ChevronDown className={isLarge ? 'w-4 h-4 opacity-50' : 'w-3 h-3 opacity-50'} />
        </button>
        <input type="tel" value={value} onChange={onChange} placeholder="6 12 34 56 78"
          className={`flex-1 ${isLarge ? 'px-5 py-4 text-lg' : 'px-3 py-3 text-sm'} ${bg} ${text} ${placeholder} focus:outline-none ${className || ''}`}
          data-testid="phone-number-input" />
      </div>

      {open && (
        <div className={`absolute top-full left-0 mt-1 w-full ${dropBg} border ${dropBorder} rounded-xl shadow-xl z-50 ${isLarge ? 'max-h-[480px]' : 'max-h-[320px]'} overflow-hidden`} data-testid="phone-country-dropdown">
          <div className="p-2 border-b border-gray-600/30">
            <div className="relative">
              <Search className={`absolute ${isLarge ? 'left-3 w-5 h-5' : 'left-2.5 w-4 h-4'} top-1/2 -translate-y-1/2 opacity-40`} />
              <input ref={searchRef} type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder={texts.searchPlaceholder}
                className={`w-full ${isLarge ? 'pl-10 pr-10 py-3 text-base' : 'pl-8 pr-8 py-2 text-sm'} rounded-lg ${searchBg} border-0 focus:outline-none focus:ring-1 focus:ring-[#2ecc71]`}
                data-testid="phone-country-search" />
              {search && (
                <button onClick={() => setSearch('')} className={`absolute ${isLarge ? 'right-3' : 'right-2.5'} top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100`}>
                  <X className={isLarge ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
                </button>
              )}
            </div>
          </div>
          <div className={`overflow-y-auto ${isLarge ? 'max-h-[400px]' : 'max-h-[260px]'}`}>
            {filtered.length === 0 ? (
              <div className={`px-4 ${isLarge ? 'py-8 text-base' : 'py-6 text-sm'} text-center opacity-40`}>{texts.noResult}</div>
            ) : (
              <>
                {priorityList.map(c => (
                  <button key={`pri-${c.iso}`} type="button" onClick={() => handleSelect(c)}
                    className={`w-full flex items-center gap-3 ${isLarge ? 'px-5 py-4 text-base' : 'px-4 py-2.5 text-sm'} ${text} ${hoverBg} transition ${selected.iso === c.iso ? 'bg-[#2ecc71]/10' : ''}`}
                    data-testid={`country-${c.iso}`}>
                    <span className={isLarge ? 'text-2xl leading-none' : 'text-lg leading-none'}>{c.flag}</span>
                    <span className="flex-1 text-left">{getName(c)}</span>
                    <span className={`opacity-50 ${isLarge ? 'text-sm' : 'text-xs'}`}>{c.code}</span>
                  </button>
                ))}
                {priorityList.length > 0 && restList.length > 0 && (
                  <div className="px-4 py-1 border-t border-b border-gray-600/30 bg-black/20 text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                    {lang === 'fr' ? 'Tous les pays' : lang === 'ru' ? '\u0412\u0441\u0435 \u0441\u0442\u0440\u0430\u043d\u044b' : lang === 'hy' ? '\u0532\u0578\u056c\u0578\u0580 \u0565\u0580\u056f\u0580\u0576\u0565\u0580\u0568' : 'All countries'}
                  </div>
                )}
                {restList.map(c => (
                  <button key={c.iso} type="button" onClick={() => handleSelect(c)}
                    className={`w-full flex items-center gap-3 ${isLarge ? 'px-5 py-4 text-base' : 'px-4 py-2.5 text-sm'} ${text} ${hoverBg} transition ${selected.iso === c.iso ? 'bg-[#2ecc71]/10' : ''}`}
                    data-testid={`country-${c.iso}`}>
                    <span className={isLarge ? 'text-2xl leading-none' : 'text-lg leading-none'}>{c.flag}</span>
                    <span className="flex-1 text-left">{getName(c)}</span>
                    <span className={`opacity-50 ${isLarge ? 'text-sm' : 'text-xs'}`}>{c.code}</span>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export { COUNTRIES };
export default PhoneInput;
