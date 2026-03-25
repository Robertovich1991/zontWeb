import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

const TRIPADVISOR_WIDGETS = {
  en: {
    id: 'TA_selfserveprop806',
    html: `<ul id="NHw9OoxBO9" class="TA_links QOzY8iqD"><li id="mt5rqTW0u1GU" class="vY1bK9KN"><a target="_blank" href="https://www.tripadvisor.com/Attraction_Review-g187147-d17154566-Reviews-ZONT_Cab-Paris_Ile_de_France.html"><img src="https://www.tripadvisor.com/img/cdsi/img2/branding/v2/Tripadvisor_lockup_horizontal_secondary_registered-11900-2.svg" alt="TripAdvisor"/></a></li></ul>`,
    script: 'https://www.jscache.com/wejs?wtype=selfserveprop&uniq=806&locationId=17154566&lang=en_US&rating=true&nreviews=4&writereviewlink=true&popIdx=true&iswide=true&border=true&display_version=2',
  },
  fr: {
    id: 'TA_selfserveprop49',
    html: `<ul id="87cTzk7Mza" class="TA_links 6mWQ7k3c8Fgl"><li id="devvde0FrZZ" class="ExBPQb9Np1"><a target="_blank" href="https://www.tripadvisor.fr/Attraction_Review-g187147-d17154566-Reviews-ZONT_Cab-Paris_Ile_de_France.html"><img src="https://www.tripadvisor.fr/img/cdsi/img2/branding/v2/Tripadvisor_lockup_horizontal_secondary_registered-11900-2.svg" alt="TripAdvisor"/></a></li></ul>`,
    script: 'https://www.jscache.com/wejs?wtype=selfserveprop&uniq=49&locationId=17154566&lang=fr&rating=true&nreviews=4&writereviewlink=true&popIdx=true&iswide=true&border=true&display_version=2',
  },
  ru: {
    id: 'TA_selfserveprop570',
    html: `<ul id="8HZwyXVFbWIc" class="TA_links x5gkMJWQ"><li id="AiO6yNjXmUz" class="ZhmtlktRNl8"><a target="_blank" href="https://www.tripadvisor.ru/Attraction_Review-g187147-d17154566-Reviews-ZONT_Cab-Paris_Ile_de_France.html"><img src="https://www.tripadvisor.ru/img/cdsi/img2/branding/v2/Tripadvisor_lockup_horizontal_secondary_registered-11900-2.svg" alt="TripAdvisor"/></a></li></ul>`,
    script: 'https://www.jscache.com/wejs?wtype=selfserveprop&uniq=570&locationId=17154566&lang=ru&rating=true&nreviews=4&writereviewlink=true&popIdx=true&iswide=true&border=true&display_version=2',
  },
};

TRIPADVISOR_WIDGETS.hy = TRIPADVISOR_WIDGETS.en;

const TripAdvisorWidget = () => {
  const { language } = useLanguage();
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const widget = TRIPADVISOR_WIDGETS[language] || TRIPADVISOR_WIDGETS.en;

  // Lazy-load: only trigger when widget scrolls into viewport
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { rootMargin: '200px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Load the TripAdvisor script only after visible
  useEffect(() => {
    if (!isVisible || !containerRef.current) return;
    const existing = containerRef.current.querySelector('script[data-ta]');
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.src = widget.script;
    script.async = true;
    script.setAttribute('data-ta', 'true');
    containerRef.current.appendChild(script);

    return () => { if (script.parentNode) script.parentNode.removeChild(script); };
  }, [isVisible, widget.script]);

  return (
    <div data-testid="tripadvisor-widget" ref={containerRef}
      className="flex flex-col items-center w-full max-w-2xl mx-auto"
      style={{ minHeight: '80px' }}
    >
      <style>{`
        .TA_selfserveprop { width: 100%; max-width: 600px; }
        .TA_selfserveprop img { max-width: 200px; height: auto; }
        .TA_selfserveprop .widSSP { background: #fff; border-radius: 8px; padding: 16px; }
      `}</style>
      <div
        id={widget.id}
        className="TA_selfserveprop"
        dangerouslySetInnerHTML={{ __html: widget.html }}
      />
    </div>
  );
};

export default TripAdvisorWidget;
