import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import { ChevronRight, BookOpen } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

/**
 * Blog index page — lists all articles in a given language.
 * Mounted on /blog (en/fr default) and /es/blog (spanish).
 */
const BlogIndex = ({ language = 'en' }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch(`${API}/api/blog-articles?language=${encodeURIComponent(language)}&limit=50`);
        const data = await resp.json();
        if (!cancelled) setArticles(data.articles || []);
      } catch (e) {
        if (!cancelled) setArticles([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [language]);

  const isEs = language === 'es';
  const basePath = isEs ? '/es/blog' : '/blog';
  const canonical = `https://www.zont.cab${basePath}`;
  const title = isEs
    ? 'Blog ZONT — Consejos de traslado y movilidad en París'
    : 'ZONT Blog — Paris transfer tips & mobility insights';
  const description = isEs
    ? 'Descubre nuestros consejos, guías y novedades sobre traslados privados en París: aeropuertos, estaciones, hoteles y viajes corporativos.'
    : 'Practical tips, guides and updates about private transfers in Paris — airports, train stations, hotels and corporate travel.';

  const hreflang = [
    { lang: 'en', href: 'https://www.zont.cab/blog' },
    { lang: 'es', href: 'https://www.zont.cab/es/blog' },
    { lang: 'x-default', href: 'https://www.zont.cab/blog' },
  ];

  // CollectionPage JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: title,
    description,
    url: canonical,
    publisher: {
      '@type': 'Organization',
      name: 'ZONT',
      url: 'https://www.zont.cab',
      logo: { '@type': 'ImageObject', url: 'https://www.zont.cab/logo.png' },
    },
    blogPost: articles.map(a => ({
      '@type': 'BlogPosting',
      headline: a.title,
      url: `https://www.zont.cab${basePath}/${a.slug}`,
      datePublished: a.createdAt,
      image: a.hero_image_url || undefined,
    })),
  };

  return (
    <>
      <SEO
        title={title}
        description={description}
        canonical={canonical}
        jsonLd={jsonLd}
        hreflang={hreflang}
        ogType="website"
      />
      <Header />
      <main className="bg-white min-h-screen">
        {/* Hero */}
        <section className="bg-gradient-to-b from-[#0b1120] via-[#1a2540] to-[#0b1120] text-white py-16 md:py-24">
          <div className="max-w-5xl mx-auto px-5">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full mb-4 backdrop-blur">
              <BookOpen className="w-3.5 h-3.5" /> {isEs ? 'Blog' : 'Blog'}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight" data-testid="blog-index-h1">
              {isEs ? 'Consejos y guías de movilidad en París' : 'Paris transfer tips & mobility insights'}
            </h1>
            <p className="text-gray-300 text-lg mt-4 max-w-3xl">
              {isEs
                ? 'Lee nuestros últimos artículos sobre traslados privados, aeropuertos, hoteles y viajes corporativos en París.'
                : 'Read our latest articles about private transfers, airports, hotels and corporate travel in Paris.'}
            </p>
          </div>
        </section>

        {/* Article grid */}
        <section className="max-w-6xl mx-auto px-5 py-12">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-gray-100 animate-pulse rounded-2xl h-72" />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-16 text-gray-500" data-testid="blog-index-empty">
              {isEs ? 'Aún no hay artículos publicados. Vuelve pronto.' : 'No articles published yet. Check back soon.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="blog-index-grid">
              {articles.map(article => (
                <Link
                  key={article.slug}
                  to={`${basePath}/${article.slug}`}
                  className="group block bg-white border border-gray-200 hover:border-[#2ecc71] hover:shadow-lg rounded-2xl overflow-hidden transition-all"
                  data-testid={`blog-card-${article.slug}`}
                >
                  {article.hero_image_url ? (
                    <div className="aspect-[16/9] bg-gray-100 overflow-hidden">
                      <img
                        src={article.hero_image_url}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[16/9] bg-gradient-to-br from-[#0b1120] to-[#2ecc71]/30" />
                  )}
                  <div className="p-5">
                    <div className="text-xs text-gray-500 mb-2">
                      {article.createdAt ? new Date(article.createdAt).toLocaleDateString(isEs ? 'es-ES' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 group-hover:text-[#2ecc71] line-clamp-2 mb-2">
                      {article.title}
                    </h2>
                    <p className="text-sm text-gray-600 line-clamp-3">{article.meta_description}</p>
                    <div className="mt-4 inline-flex items-center gap-1 text-[#2ecc71] text-sm font-semibold">
                      {isEs ? 'Leer artículo' : 'Read article'} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
};

export default BlogIndex;
