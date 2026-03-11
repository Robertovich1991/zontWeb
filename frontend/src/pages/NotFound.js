import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';

const NotFound = () => (
  <div className="min-h-screen flex flex-col bg-[#1a2332]" data-testid="not-found-page">
    <SEO title="Page Not Found - Zont" description="The page you are looking for does not exist." noindex={true} />
    <Header />
    <main className="flex-1 pt-16 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#2ecc71] mb-4">404</h1>
        <p className="text-xl text-white mb-6">Page not found</p>
        <Link to="/" className="bg-[#2ecc71] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#27ae60] transition-colors" data-testid="back-home-btn">
          Back to Home
        </Link>
      </div>
    </main>
    <Footer />
  </div>
);

export default NotFound;
