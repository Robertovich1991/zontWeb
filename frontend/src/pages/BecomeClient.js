import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import { Smartphone, Search, MapPin, CheckCircle } from 'lucide-react';

const BecomeClient = () => {
  const steps = [
    {
      icon: <Smartphone className="w-16 h-16 text-blue-600" />,
      title: 'Download the App',
      description: 'Get the Zont app for free on iOS or Android devices.',
    },
    {
      icon: <Search className="w-16 h-16 text-blue-600" />,
      title: 'Enter Your Destination',
      description: 'Tell us where you need to go and when you need to be there.',
    },
    {
      icon: <MapPin className="w-16 h-16 text-blue-600" />,
      title: 'Get Matched with a Driver',
      description: 'We\'ll find the best driver for your trip and show you real-time location.',
    },
    {
      icon: <CheckCircle className="w-16 h-16 text-blue-600" />,
      title: 'Enjoy Your Ride',
      description: 'Sit back, relax, and enjoy professional transportation to your destination.',
    },
  ];

  const features = [
    'Transparent pricing - No hidden fees',
    'Professional, vetted drivers',
    'Real-time tracking',
    '24/7 customer support',
    'Multiple payment options',
    'Available in 120+ cities worldwide',
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="How It Works - Book Airport Transfer | Zont"
        description="Learn how to book your airport transfer with Zont in 4 simple steps. Download the app, enter destination, meet your driver and enjoy premium ride."
        canonical="https://zont.cab/become-client"
        noindex={false}
      />
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 bg-gradient-to-br from-indigo-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">How It Works</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Getting around your city has never been easier. Here's how to get started with Zont.
          </p>
          <div className="flex justify-center space-x-4">
            <a
              href="https://apps.apple.com/am/app/zont-cab/id1468482270"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <div className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-semibold">
                📱 Download for iOS
              </div>
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.zont.rider"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <div className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-semibold">
                📱 Download for Android
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">
            Get Started in 4 Simple Steps
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="bg-blue-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  {step.icon}
                </div>
                <div className="absolute top-10 left-1/2 transform translate-x-12 hidden lg:block">
                  {index < steps.length - 1 && (
                    <div className="text-blue-300 text-4xl">→</div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Why Choose Zont?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <span className="text-gray-700 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-700 mb-8">
            Download the Zont app now and get your first ride!
          </p>
          <div className="flex justify-center space-x-4">
            <a
              href="https://apps.apple.com/am/app/zont-cab/id1468482270"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <div className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg">
                Download Now
              </div>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BecomeClient;
