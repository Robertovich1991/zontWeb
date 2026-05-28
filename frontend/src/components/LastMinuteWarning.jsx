import React, { useMemo } from 'react';
import { AlertTriangle, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const WHATSAPP_URL = 'https://wa.me/33783777027';
const THRESHOLD_HOURS = 6;

const translations = {
  fr: {
    title: 'Réservation moins de 6 h à l\u2019avance',
    body: 'Pour les courses réservées à moins de 6 heures du départ, nous ne pouvons pas garantir à 100\u00a0% la disponibilité d\u2019un chauffeur. Nous vous contacterons rapidement pour confirmer. Pour une garantie immédiate, contactez-nous sur WhatsApp.',
    whatsapp: 'Confirmer par WhatsApp',
  },
  en: {
    title: 'Booking less than 6 hours ahead',
    body: 'For rides booked less than 6 hours before departure, we cannot 100% guarantee driver availability. We will contact you quickly to confirm. For instant confirmation, message us on WhatsApp.',
    whatsapp: 'Confirm on WhatsApp',
  },
  ru: {
    title: 'Бронирование менее чем за 6 часов',
    body: 'При бронировании менее чем за 6 часов до подачи мы не можем 100\u00a0% гарантировать доступность водителя. Мы свяжемся с вами для подтверждения. Для немедленной гарантии напишите нам в WhatsApp.',
    whatsapp: 'Подтвердить в WhatsApp',
  },
  hy: {
    title: 'Ամրագրում 6 ժամից պակաս ժամանակ առաջ',
    body: 'Մեկնելուց 6 ժամից պակաս ժամանակ առաջ կատարված ամրագրումների համար մենք չենք կարող 100\u00a0% երաշխավորել վարորդի առկայությունը: Մենք արագ կկապվենք ձեզ հետ: Անհապաղ հաստատման համար գրեք մեզ WhatsApp-ով:',
    whatsapp: 'Հաստատել WhatsApp-ով',
  },
};

/**
 * Yellow non-blocking warning shown when the requested booking time
 * is less than 6 hours away from "now". Includes a WhatsApp CTA.
 */
const LastMinuteWarning = ({ date, time, compact = false }) => {
  const { language } = useLanguage();
  const t = translations[language] || translations.fr;

  const isLastMinute = useMemo(() => {
    if (!date || !time) return false;
    try {
      const requested = new Date(`${date}T${time}`);
      if (isNaN(requested.getTime())) return false;
      const diffHours = (requested.getTime() - Date.now()) / (1000 * 60 * 60);
      return diffHours > 0 && diffHours < THRESHOLD_HOURS;
    } catch {
      return false;
    }
  }, [date, time]);

  if (!isLastMinute) return null;

  return (
    <div
      className={`bg-yellow-50 border-l-4 border-yellow-400 rounded-md ${compact ? 'p-3' : 'p-4'} ${compact ? '' : 'mt-2'}`}
      data-testid="last-minute-warning"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-yellow-600 flex-shrink-0 mt-0.5`} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-yellow-900 ${compact ? 'text-xs' : 'text-sm'} mb-1`}>{t.title}</p>
          <p className={`text-yellow-800 ${compact ? 'text-xs' : 'text-xs sm:text-sm'} leading-relaxed mb-2`}>{t.body}</p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 bg-[#25D366] text-white ${compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'} rounded-md font-semibold hover:bg-[#1ebe57] transition-colors`}
            data-testid="last-minute-whatsapp-btn"
          >
            <MessageCircle className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} aria-hidden="true" />
            {t.whatsapp}
          </a>
        </div>
      </div>
    </div>
  );
};

export default LastMinuteWarning;
