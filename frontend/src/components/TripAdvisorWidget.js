import React, { useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';

const TRIPADVISOR_WIDGETS = {
  en: {
    id: 'TA_cdswritereviewlg4',
    html: `<ul id="HCzivZ" class="TA_links vyBbnHUnMq"><li id="BALOmnSttUsl" class="NwmT5ODGA"><a target="_blank" href="https://www.tripadvisor.com/Attraction_Review-g187147-d17154566-Reviews-ZONT_Cab-Paris_Ile_de_France.html"><img src="https://static.tacdn.com/img2/brand_refresh/Tripadvisor_lockup_horizontal_secondary_registered.svg" alt="TripAdvisor"/></a></li></ul>`,
    script: 'https://www.jscache.com/wejs?wtype=cdswritereviewlg&uniq=4&locationId=17154566&lang=en_US&display_version=2',
  },
  fr: {
    id: 'TA_cdswritereviewlg722',
    html: `<ul id="aqPsy8tq" class="TA_links iykyYNFkRKU9"><li id="ZHhEgtM" class="i9EfBOIfAe1"><a target="_blank" href="https://www.tripadvisor.fr/Attraction_Review-g187147-d17154566-Reviews-ZONT_Cab-Paris_Ile_de_France.html"><img src="https://static.tacdn.com/img2/brand_refresh/Tripadvisor_lockup_horizontal_secondary_registered.svg" alt="TripAdvisor"/></a></li></ul>`,
    script: 'https://www.jscache.com/wejs?wtype=cdswritereviewlg&uniq=722&locationId=17154566&lang=fr&display_version=2',
  },
  ru: {
    id: 'TA_cdswritereviewlg789',
    html: `<ul id="sZ8jBkl7i6" class="TA_links 6ZeiIHpUV6X"><li id="1p8j95" class="7So8BwwP5W"><a target="_blank" href="https://www.tripadvisor.ru/Attraction_Review-g187147-d17154566-Reviews-ZONT_Cab-Paris_Ile_de_France.html"><img src="https://static.tacdn.com/img2/brand_refresh/Tripadvisor_lockup_horizontal_secondary_registered.svg" alt="TripAdvisor"/></a></li></ul>`,
    script: 'https://www.jscache.com/wejs?wtype=cdswritereviewlg&uniq=789&locationId=17154566&lang=ru&display_version=2',
  },
};

TRIPADVISOR_WIDGETS.hy = TRIPADVISOR_WIDGETS.en;

const labels = {
  en: 'Review us on TripAdvisor',
  fr: 'Donnez votre avis sur TripAdvisor',
  ru: 'Ostavte otzyv na TripAdvisor',
  hy: 'Review us on TripAdvisor',
};

const TripAdvisorWidget = () => {
  const { language } = useLanguage();
  const containerRef = useRef(null);
  const widget = TRIPADVISOR_WIDGETS[language] || TRIPADVISOR_WIDGETS.en;
  const label = labels[language] || labels.en;

  useEffect(() => {
    if (!containerRef.current) return;
    const existing = containerRef.current.querySelector('script');
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.src = widget.script;
    script.async = true;
    containerRef.current.appendChild(script);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, [widget.script]);

  return (
    <div className="flex flex-col items-center gap-3" data-testid="tripadvisor-widget" ref={containerRef}>
      <p className="text-gray-400 text-sm font-medium tracking-wide uppercase">{label}</p>
      <div
        id={widget.id}
        className="TA_cdswritereviewlg"
        dangerouslySetInnerHTML={{ __html: widget.html }}
      />
    </div>
  );
};

export default TripAdvisorWidget;
