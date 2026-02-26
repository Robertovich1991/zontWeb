import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Globe, MapPin } from 'lucide-react';

const Countries = () => {
  const countries = [
    {
      name: 'France',
      flag: '🇫🇷',
      cities: ['Paris', 'Lyon', 'Marseille', 'Nice', 'Toulouse', 'Bordeaux'],
    },
    {
      name: 'Armenia',
      flag: '🇦🇲',
      cities: ['Yerevan', 'Gyumri', 'Vanadzor'],
    },
    {
      name: 'Germany',
      flag: '🇩🇪',
      cities: ['Berlin', 'Munich', 'Frankfurt', 'Hamburg'],
    },
    {
      name: 'Spain',
      flag: '🇪🇸',
      cities: ['Madrid', 'Barcelona', 'Valencia', 'Seville'],
    },
    {
      name: 'Italy',
      flag: '🇮🇹',
      cities: ['Rome', 'Milan', 'Venice', 'Florence', 'Naples'],
    },
    {
      name: 'United Kingdom',
      flag: '🇬🇧',
      cities: ['London', 'Manchester', 'Birmingham', 'Edinburgh'],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 bg-gradient-to-br from-green-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <Globe className="w-20 h-20 mx-auto mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Our Locations</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Zont is available in 120+ cities across the globe. Find us in your city!
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="text-5xl font-bold text-blue-600 mb-2">120+</div>
              <div className="text-xl text-gray-700">Cities Worldwide</div>
            </div>
            <div className="p-6">
              <div className="text-5xl font-bold text-green-600 mb-2">40+</div>
              <div className="text-xl text-gray-700">Countries</div>
            </div>
            <div className="p-6">
              <div className="text-5xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-xl text-gray-700">Service Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Countries Grid Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
            Browse by Country
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {countries.map((country, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6"
              >
                <div className="flex items-center mb-4">
                  <span className="text-5xl mr-4">{country.flag}</span>
                  <h3 className="text-2xl font-bold text-gray-900">{country.name}</h3>
                </div>
                <div className="space-y-2">
                  {country.cities.map((city, cityIndex) => (
                    <div key={cityIndex} className="flex items-center text-gray-700">
                      <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                      <span>{city}</span>
                    </div>
                  ))}
                </div>
                <button className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  View All Cities
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Expanding Soon</h2>
          <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
            We're constantly growing our network. Don't see your city? We might be coming soon!
            Sign up to be notified when Zont launches in your area.
          </p>
          <button className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors">
            Get Notified
          </button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Ride?</h2>
          <p className="text-xl mb-8">
            Download the Zont app and start booking rides in your city today!
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

      <Footer />
    </div>
  );
};

export default Countries;
