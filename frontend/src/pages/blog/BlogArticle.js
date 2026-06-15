import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import { ChevronRight, Calendar, Loader2 } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const ARTICLE_LABELS = {
  en: { home: 'Home', dateLocale: 'en-US', notFoundH1: 'Article not found', notFoundText: 'The article you are looking for does not exist or was moved.', seeAll: 'See all articles', ctaTitle: 'Need a private transfer in Paris?', ctaSub: 'Flat fare, professional driver, 24/7 service.', ctaBtn: 'Book a transfer', backToBlog: 'Back to blog' },
  fr: { home: 'Accueil', dateLocale: 'fr-FR', notFoundH1: 'Article introuvable', notFoundText: 'L\'article recherché n\'existe pas ou a été déplacé.', seeAll: 'Voir tous les articles', ctaTitle: 'Besoin d\'un transfert privé à Paris ?', ctaSub: 'Prix fixe, chauffeur professionnel, service 24/7.', ctaBtn: 'Réserver un transfert', backToBlog: 'Retour au blog' },
  es: { home: 'Inicio', dateLocale: 'es-ES', notFoundH1: 'Artículo no encontrado', notFoundText: 'El artículo que buscas ya no existe o ha sido movido.', seeAll: 'Ver todos los artículos', ctaTitle: '¿Necesitas un traslado privado en París?', ctaSub: 'Precio fijo, conductor profesional y servicio 24/7.', ctaBtn: 'Reservar un traslado', backToBlog: 'Volver al blog' },
  ru: { home: 'Главная', dateLocale: 'ru-RU', notFoundH1: 'Статья не найдена', notFoundText: 'Запрашиваемая статья не существует или была перемещена.', seeAll: 'Все статьи', ctaTitle: 'Нужен частный трансфер в Париже?', ctaSub: 'Фиксированная цена, профессиональный водитель, сервис 24/7.', ctaBtn: 'Заказать трансфер', backToBlog: 'Назад в блог' },
  hy: { home: 'Գլխավոր', dateLocale: 'hy-AM', notFoundH1: 'Հոդվածը չի գտնվել', notFoundText: 'Որոնված հոդվածը գոյություն չունի կամ տեղափոխվել է։', seeAll: 'Տեսնել բոլոր հոդվածները', ctaTitle: 'Փարիզում մասնավոր տրանսֆեր է պետք?', ctaSub: 'Հաստատուն գին, պրոֆեսիոնալ վարորդ, 24/7 ծառայություն։', ctaBtn: 'Ամրագրել տրանսֆեր', backToBlog: 'Վերադառնալ բլոգ' },
};

const LANG_PREFIX = { en: '', fr: '/fr', es: '/es', ru: '/ru', hy: '/hy' };

/**
 * Single blog article page.
 * Reads /api/blog-articles/:slug and renders the CMS-provided content_html
 * + injects the article's own JSON-LD and FAQ JSON-LD for SEO.
 */
const BlogArticle = ({ language = 'en' }) => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const resp = await fetch(`${API}/api/blog-articles/${encodeURIComponent(slug)}`);
        if (!resp.ok) throw new Error('not found');
        const data = await resp.json();
        if (!cancelled) setArticle(data);
      } catch (e) {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  const labels = ARTICLE_LABELS[language] || ARTICLE_LABELS.en;
  const basePath = `${LANG_PREFIX[language] || ''}/blog`;
  const homePath = LANG_PREFIX[language] || '/';

  // Inject the article's own jsonLd + faqJsonLd as additional <script> tags
  // (SEO component handles the primary jsonLd; we add the FAQ via effect)
  useEffect(() => {
    // Cleanup any existing extra JSON-LD blocks from previous article
    document.querySelectorAll('script[data-seo="blog-jsonld"]').forEach(el => el.remove());
    if (!article) return;

    const blocks = [];
    if (article.json_ld) blocks.push(article.json_ld);
    if (article.faq_json_ld) blocks.push(article.faq_json_ld);

    blocks.forEach((block, idx) => {
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.setAttribute('data-seo', 'blog-jsonld');
      s.textContent = JSON.stringify(block);
      document.head.appendChild(s);
    });

    return () => {
      document.querySelectorAll('script[data-seo="blog-jsonld"]').forEach(el => el.remove());
    };
  }, [article]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center bg-white">
          <Loader2 className="w-8 h-8 animate-spin text-[#2ecc71]" />
        </main>
        <Footer />
      </>
    );
  }

  if (notFound || !article) {
    return (
      <>
        <SEO title="404 — Article not found" description="" noindex />
        <Header />
        <main className="min-h-screen flex flex-col items-center justify-center bg-white px-5 text-center py-20">
          <h1 className="text-3xl font-bold text-gray-900 mb-3" data-testid="blog-article-404">
            {labels.notFoundH1}
          </h1>
          <p className="text-gray-600 mb-6">
            {labels.notFoundText}
          </p>
          <Link to={basePath} className="bg-[#2ecc71] hover:bg-[#27ae60] text-white px-6 py-3 rounded-xl font-bold">
            {labels.seeAll}
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const canonical = `https://www.zont.cab${basePath}/${article.slug}`;
  const hreflang = [
    { lang: article.language_code || 'en', href: canonical },
    { lang: 'x-default', href: `https://www.zont.cab/blog/${article.slug}` },
  ];

  const publishedDate = article.createdAt
    ? new Date(article.createdAt).toLocaleDateString(labels.dateLocale, { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <>
      <SEO
        title={article.meta_title || article.title}
        description={article.meta_description || ''}
        canonical={canonical}
        ogImage={article.hero_image_url || undefined}
        ogType="article"
        hreflang={hreflang}
      />

      <Header />

      <main className="bg-white min-h-screen">
        {/* Hero */}
        <section className="bg-gradient-to-b from-[#0b1120] via-[#1a2540] to-[#0b1120] text-white py-12 md:py-16">
          <div className="max-w-3xl mx-auto px-5">
            <nav className="text-xs text-gray-400 mb-4 flex items-center gap-1.5">
              <Link to={homePath} className="hover:text-white">{labels.home}</Link>
              <ChevronRight className="w-3 h-3" />
              <Link to={basePath} className="hover:text-white">Blog</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white line-clamp-1">{article.title}</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight" data-testid="blog-article-h1">
              {article.title}
            </h1>
            {publishedDate && (
              <div className="text-sm text-gray-400 mt-4 inline-flex items-center gap-2">
                <Calendar className="w-4 h-4" /> {publishedDate}
              </div>
            )}
          </div>
        </section>

        {/* Hero image */}
        {article.hero_image_url && (
          <div className="max-w-4xl mx-auto px-5 -mt-8 mb-10 relative z-10">
            <img
              src={article.hero_image_url}
              alt={article.title}
              className="w-full h-72 md:h-[420px] object-cover rounded-3xl shadow-2xl"
            />
          </div>
        )}

        {/* Article body — render CMS-provided HTML */}
        <article
          className="blog-content max-w-3xl mx-auto px-5 py-8"
          data-testid="blog-article-body"
          dangerouslySetInnerHTML={{ __html: article.content_html || '' }}
        />

        {/* CTA */}
        <section className="bg-gray-50 py-12 mt-8">
          <div className="max-w-3xl mx-auto px-5 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              {labels.ctaTitle}
            </h2>
            <p className="text-gray-600 mb-5">
              {labels.ctaSub}
            </p>
            <Link to={homePath} className="bg-[#2ecc71] hover:bg-[#27ae60] text-white px-7 py-3.5 rounded-xl font-bold inline-flex items-center gap-2" data-testid="blog-article-cta-book">
              {labels.ctaBtn} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Back to blog */}
        <div className="max-w-3xl mx-auto px-5 py-10">
          <Link to={basePath} className="inline-flex items-center gap-2 text-[#2ecc71] font-semibold hover:underline" data-testid="blog-article-back">
            ← {labels.backToBlog}
          </Link>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default BlogArticle;
