import { useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

const SEO = ({ title, description, canonical, jsonLd, ogImage, ogType, hreflang, noindex }) => {
  const { language } = useLanguage();

  useEffect(() => {
    if (title) document.title = title;

    document.documentElement.lang = language === 'fr' ? 'fr' : language === 'ru' ? 'ru' : 'en';

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description || '');
    }

    // Meta robots
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', noindex ? 'noindex, nofollow' : 'index, follow');

    // OG title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', title || '');

    // OG description
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute('content', description || '');

    // OG locale
    let ogLocale = document.querySelector('meta[property="og:locale"]');
    if (!ogLocale) {
      ogLocale = document.createElement('meta');
      ogLocale.setAttribute('property', 'og:locale');
      document.head.appendChild(ogLocale);
    }
    ogLocale.setAttribute('content', language === 'fr' ? 'fr_FR' : language === 'ru' ? 'ru_RU' : 'en_US');

    // OG type
    let ogTypeEl = document.querySelector('meta[property="og:type"]');
    if (!ogTypeEl) {
      ogTypeEl = document.createElement('meta');
      ogTypeEl.setAttribute('property', 'og:type');
      document.head.appendChild(ogTypeEl);
    }
    ogTypeEl.setAttribute('content', ogType || 'website');

    // OG url
    if (canonical) {
      let ogUrl = document.querySelector('meta[property="og:url"]');
      if (!ogUrl) {
        ogUrl = document.createElement('meta');
        ogUrl.setAttribute('property', 'og:url');
        document.head.appendChild(ogUrl);
      }
      ogUrl.setAttribute('content', canonical);
    }

    // OG image
    if (ogImage) {
      let ogImg = document.querySelector('meta[property="og:image"]');
      if (!ogImg) {
        ogImg = document.createElement('meta');
        ogImg.setAttribute('property', 'og:image');
        document.head.appendChild(ogImg);
      }
      ogImg.setAttribute('content', ogImage);
    }

    // OG site_name
    let ogSiteName = document.querySelector('meta[property="og:site_name"]');
    if (!ogSiteName) {
      ogSiteName = document.createElement('meta');
      ogSiteName.setAttribute('property', 'og:site_name');
      document.head.appendChild(ogSiteName);
    }
    ogSiteName.setAttribute('content', 'Zont');

    // Canonical
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical);
    }

    // Hreflang tags
    // Remove old hreflang links
    document.querySelectorAll('link[data-seo="hreflang"]').forEach(el => el.remove());
    if (hreflang && Array.isArray(hreflang)) {
      hreflang.forEach(({ lang, href }) => {
        const link = document.createElement('link');
        link.setAttribute('rel', 'alternate');
        link.setAttribute('hreflang', lang);
        link.setAttribute('href', href);
        link.setAttribute('data-seo', 'hreflang');
        document.head.appendChild(link);
      });
      // Add x-default
      const defaultLink = hreflang.find(h => h.lang === 'fr') || hreflang[0];
      if (defaultLink) {
        const xDefault = document.createElement('link');
        xDefault.setAttribute('rel', 'alternate');
        xDefault.setAttribute('hreflang', 'x-default');
        xDefault.setAttribute('href', defaultLink.href);
        xDefault.setAttribute('data-seo', 'hreflang');
        document.head.appendChild(xDefault);
      }
    }

    // JSON-LD
    if (jsonLd) {
      let script = document.querySelector('script[data-seo="jsonld"]');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        script.setAttribute('data-seo', 'jsonld');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    }

    // Cleanup on unmount
    return () => {
      document.querySelectorAll('link[data-seo="hreflang"]').forEach(el => el.remove());
    };
  }, [title, description, canonical, jsonLd, ogImage, ogType, hreflang, noindex, language]);

  return null;
};

export default SEO;
