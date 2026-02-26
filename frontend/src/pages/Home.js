import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SearchForm from '@/components/search/SearchForm';
import { MapPin, Clock, Globe } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: <Clock className="w-12 h-12 text-blue-600" />,
      title: 'Tranquility',
      description:
        "You receive all driver's details 3 hours prior to your trip. This will guarantee that your driver will be on time.",
    },
    {
      icon: <MapPin className="w-12 h-12 text-blue-600" />,
      title: 'Car Localisation',
      description:
        'You can see where your car is in real time. This option is available in your mobile application and can be very useful when you are waiting for your driver to come.',
    },
    {
      icon: <Globe className="w-12 h-12 text-blue-600" />,
      title: 'Worldwide Service',
      description:
        'You can book transfers all over the world. By downloading Zont application, you will get rid of stress and waiting while being transported.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Press a Button,
              <br />
              <span className="text-blue-600">Get a Ride</span>
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              Zont is the smartest way to move around your city.
              <br />
              Get the app for iPhone and Android.
            </p>
            <div className="flex justify-center space-x-4 mb-12">
              <a
                href="https://apps.apple.com/am/app/zont-cab/id1468482270"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <div className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2">
                  <span>📱</span>
                  <span>App Store</span>
                </div>
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.zont.rider"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <div className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2">
                  <span>📱</span>
                  <span>Google Play</span>
                </div>
              </a>
            </div>
          </div>

          {/* Search Form */}
          <SearchForm />
        </div>
      </section>

      {/* Book a Zont Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Book a Zont in the City You Plan on Visiting
          </h2>
          <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
            Choose from a range of categories and prices. Zont provides professional ground
            transportation at the lowest rates across the globe. Mobile application Zont will help
            you book an airport transfer or car service in any city worldwide. You can also book
            online for an immediate ride. Our system shows you where the driver is in real time,
            ensuring quality and punctuality.
          </p>
        </div>
      </section>

      {/* Worldwide Network Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Your Best Worldwide Option</h2>
          <p className="text-lg text-gray-700 mb-8 max-w-3xl mx-auto">
            With a global on-demand network already spanning across 120+ cities, we're taking
            transportation and instant ordering to the next level.
          </p>
          <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors">
            Find a City
          </button>
        </div>
      </section>

      {/* Why Zont Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-6">Why Zont?</h2>
          <p className="text-lg text-gray-700 text-center mb-12 max-w-3xl mx-auto">
            Zont is the Best mobile application available worldwide for your transportation and
            transfer. Different car types available for your comfort, highly professional and
            reliable drivers.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-700">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TripAdvisor Section */}
      <section className="py-12 px-4 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-2">Bravo!</h3>
          <p className="text-lg text-gray-700">
            Comfort Cars rated "excellent" by 272 travelers on TripAdvisor
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
