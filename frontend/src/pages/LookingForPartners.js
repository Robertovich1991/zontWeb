import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';

const LookingForPartners = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[#1a2332]">
      <SEO
        title="Looking for Partners - Drive with Zont"
        description="Zont needs partners like you. Join our network of professional drivers. Quick and easy signup. Start earning with airport transfers across Europe."
        canonical="https://zont.cab/looking-for-partners"
      />
      <Header />

      <main className="flex-1 pt-16 flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center py-20">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Looking for Partners
          </h1>
          <p className="text-2xl text-gray-300 mb-4">
            <span className="font-semibold">Zont</span> needs partners like you. It's{' '}
            <span className="font-bold">quick</span> and{' '}
            <span className="font-bold">easy</span> to start working and earning with us.
          </p>
          <button
            onClick={() => navigate('/become-driver')}
            className="bg-[#2ecc71] text-white px-12 py-5 rounded-full font-semibold text-xl hover:bg-[#27ae60] transition-colors mt-8 inline-block"
          >
            Sign up
          </button>

          {/* Illustration would go here */}
          <div className="mt-12">
            <div className="w-full h-64 bg-gradient-to-b from-transparent to-[#0f1419] rounded-lg flex items-end justify-center">
              <div className="text-6xl mb-4">🚕</div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LookingForPartners;
