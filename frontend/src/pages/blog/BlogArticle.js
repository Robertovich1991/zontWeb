import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import { ChevronRight, Calendar, Loader2 } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

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

  const isEs = language === 'es';
  const basePath = isEs ? '/es/blog' : '/blog';

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
            {isEs ? 'Artículo no encontrado' : 'Article not found'}
          </h1>
          <p className="text-gray-600 mb-6">
            {isEs ? 'El artículo que buscas ya no existe o ha sido movido.' : 'The article you are looking for does not exist or was moved.'}
          </p>
          <Link to={basePath} className="bg-[#2ecc71] hover:bg-[#27ae60] text-white px-6 py-3 rounded-xl font-bold">
            {isEs ? 'Ver todos los artículos' : 'See all articles'}
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
    ? new Date(article.createdAt).toLocaleDateString(isEs ? 'es-ES' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
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
              <Link to={isEs ? '/es' : '/'} className="hover:text-white">{isEs ? 'Inicio' : 'Home'}</Link>
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
              {isEs ? '¿Necesitas un traslado privado en París?' : 'Need a private transfer in Paris?'}
            </h2>
            <p className="text-gray-600 mb-5">
              {isEs ? 'Precio fijo, conductor profesional y servicio 24/7.' : 'Flat fare, professional driver, 24/7 service.'}
            </p>
            <Link to={isEs ? '/es' : '/'} className="bg-[#2ecc71] hover:bg-[#27ae60] text-white px-7 py-3.5 rounded-xl font-bold inline-flex items-center gap-2" data-testid="blog-article-cta-book">
              {isEs ? 'Reservar un traslado' : 'Book a transfer'} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Back to blog */}
        <div className="max-w-3xl mx-auto px-5 py-10">
          <Link to={basePath} className="inline-flex items-center gap-2 text-[#2ecc71] font-semibold hover:underline" data-testid="blog-article-back">
            ← {isEs ? 'Volver al blog' : 'Back to blog'}
          </Link>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default BlogArticle;
