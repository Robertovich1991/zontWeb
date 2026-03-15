import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import { useLanguage } from '@/context/LanguageContext';

const content = {
  en: { title: 'Page Not Found', desc: 'The page you are looking for does not exist.', btn: 'Back to Home' },
  fr: { title: 'Page Introuvable', desc: 'La page que vous recherchez n\'existe pas.', btn: 'Retour a l\'accueil' },
  ru: { title: 'Страница не найдена', desc: 'Запрашиваемая страница не существует.', btn: 'На главную' },
  hy: { title: 'Էջը չի գտնվել', desc: 'Այս էdelays չdelays:', btn: 'Glkhavor ej' },
};

const NotFound = () => {
  const { language } = useLanguage();
  const c = content[language] || content.en;

  return (
    <div className="min-h-screen flex flex-col bg-[#1a2332]" data-testid="not-found-page">
      <SEO title={`${c.title} - Zont`} description={c.desc} noindex={true} />
      <Header />
      <main className="flex-1 pt-16 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-[#2ecc71] mb-4">404</h1>
          <p className="text-xl text-white mb-6">{c.title}</p>
          <Link to="/" className="bg-[#2ecc71] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#27ae60] transition-colors" data-testid="back-home-btn">
            {c.btn}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
