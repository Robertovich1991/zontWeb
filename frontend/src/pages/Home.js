import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '@/context/BookingContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { CheckCircle, MapPin, Clock, Shield, Star, CreditCard } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { startBooking } = useBooking();
  const { toast } = useToast();
  const [tripType, setTripType] = useState('oneway');
  const [formData, setFormData] = useState({
    pickup: '',
    dropoff: '',
    date: '',
    time: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const searchData = {
        ...formData,
        tripType,
      };
      startBooking(searchData);
      navigate('/car-selection');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while searching',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const features = [
    {
      icon: <CheckCircle className="w-8 h-8 text-[#2ecc71]" />,
      title: 'Confirmed Booking',
      description: 'Get instant confirmation and driver details 3 hours before pickup',
    },
    {
      icon: <MapPin className="w-8 h-8 text-[#2ecc71]" />,
      title: 'Real-Time Tracking',
      description: 'Track your driver in real-time and know exactly when they will arrive',
    },
    {
      icon: <Shield className="w-8 h-8 text-[#2ecc71]" />,
      title: 'Professional Drivers',
      description: 'All drivers are verified, licensed, and highly rated by our community',
    },
    {
      icon: <CreditCard className="w-8 h-8 text-[#2ecc71]" />,
      title: 'Transparent Pricing',
      description: 'No hidden fees. See the exact price before you book',
    },
  ];

  const stats = [
    { number: '120+', label: 'Cities Worldwide' },
    { number: '50K+', label: 'Happy Customers' },
    { number: '10K+', label: 'Professional Drivers' },
    { number: '4.8/5', label: 'Average Rating' },
  ];

  const testimonials = [
    {
      name: 'Marie Dubois',
      location: 'Paris, France',
      rating: 5,
      text: 'Perfect service for airport transfers! The driver was waiting for me with a sign, very professional.',
    },
    {
      name: 'James Wilson',
      location: 'London, UK',
      rating: 5,
      text: 'I use Zont for all my business trips. Reliable, on-time, and the drivers know the best routes.',
    },
    {
      name: 'Anna Petrosyan',
      location: 'Yerevan, Armenia',
      rating: 5,
      text: 'Great prices and excellent service. I highly recommend Zont for anyone visiting Armenia!',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#1a2332]">
      <Header />

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative py-20 px-4 bg-gradient-to-br from-[#1a2332] via-[#1f2937] to-[#1a2332]">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="text-center lg:text-left">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                  Press a Button,<br />
                  <span className="text-[#2ecc71]">Get a Ride</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 mb-8">
                  <span className="font-semibold text-white">Zont</span> is the smartest way to move around your city.
                  <br />
                  Get the app for <span className="font-semibold">iPhone</span> and <span className="font-semibold">Android</span>.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                  <a
                    href="https://apps.apple.com/am/app/zont-cab/id1468482270"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-2xl mr-2">📱</span>
                    <div className="text-left">
                      <div className="text-xs">Download on the</div>
                      <div className="text-lg font-semibold">App Store</div>
                    </div>
                  </a>
                  <a
                    href="https://play.google.com/store/apps/details?id=com.zont.rider"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-2xl mr-2">📱</span>
                    <div className="text-left">
                      <div className="text-xs">GET IT ON</div>
                      <div className="text-lg font-semibold">Google Play</div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Right Content - Phone Mockup */}
              <div className="flex justify-center lg:justify-end">
                <div className="relative">
                  <div className="w-64 h-[500px] bg-gradient-to-br from-gray-900 to-black rounded-3xl shadow-2xl border-8 border-gray-800 flex items-center justify-center">
                    <div className="text-center px-6">
                      <div className="mb-8">
                        <MapPin className="w-24 h-24 mx-auto text-[#2ecc71]" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4">Location</h3>
                      <p className="text-gray-400 text-sm mb-6">
                        We need to know your location to offer you nearby orders
                      </p>
                      <button className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                        Continue
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 px-4 bg-[#2ecc71]">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-sm md:text-base text-green-900 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-[#1a2332]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Why Choose Zont?</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Professional transportation service with the best prices and highest quality standards
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-[#1f2937] rounded-xl p-6 hover:bg-[#252f3f] transition-colors">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Booking Section */}
        <section className="py-20 px-4 bg-[#0f1419]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Book a Zont in the City You Plan on Visiting
              </h2>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto">
                Choose from a range of categories and prices. Zont provides professional ground transportation at the lowest rates across the globe. 
                Book an airport transfer or car service in any city worldwide. Track your driver in real time, ensuring quality and punctuality.
              </p>
            </div>

            <div className="max-w-4xl mx-auto bg-[#1a2332] rounded-2xl p-8 shadow-2xl">
              {/* Trip Type Tabs */}
              <div className="flex justify-center space-x-0 mb-8 border-b border-gray-700">
                <button
                  onClick={() => setTripType('oneway')}
                  className={`px-8 py-4 font-medium transition-colors relative ${
                    tripType === 'oneway'
                      ? 'text-gray-300 border-b-2 border-gray-400'
                      : 'text-gray-500 hover:text-gray-400'
                  }`}
                >
                  One way
                </button>
                <button
                  onClick={() => setTripType('hourly')}
                  className={`px-8 py-4 font-medium transition-colors relative ${
                    tripType === 'hourly'
                      ? 'text-gray-300 border-b-2 border-gray-400'
                      : 'text-gray-500 hover:text-gray-400'
                  }`}
                >
                  Hourly Rental
                </button>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="pickup" className="block text-base font-medium text-white mb-3">
                    Pick up
                  </label>
                  <input
                    type="text"
                    id="pickup"
                    name="pickup"
                    value={formData.pickup}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-4 bg-white text-gray-900 rounded placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2ecc71]"
                    placeholder="From:"
                  />
                </div>

                <div>
                  <label htmlFor="dropoff" className="block text-base font-medium text-white mb-3">
                    Drop off
                  </label>
                  <input
                    type="text"
                    id="dropoff"
                    name="dropoff"
                    value={formData.dropoff}
                    onChange={handleChange}
                    required={tripType === 'oneway'}
                    disabled={tripType === 'hourly'}
                    className="w-full px-4 py-4 bg-white text-gray-900 rounded placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] disabled:bg-gray-300 disabled:cursor-not-allowed"
                    placeholder={tripType === 'hourly' ? 'N/A for hourly rental' : 'To:'}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="date" className="block text-base font-medium text-white mb-3">
                      Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-4 bg-white text-gray-900 rounded focus:outline-none focus:ring-2 focus:ring-[#2ecc71]"
                    />
                  </div>
                  <div>
                    <label htmlFor="time" className="block text-base font-medium text-white mb-3">
                      Time
                    </label>
                    <input
                      type="time"
                      id="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-4 bg-white text-gray-900 rounded focus:outline-none focus:ring-2 focus:ring-[#2ecc71]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2ecc71] text-white py-5 rounded font-semibold text-lg hover:bg-[#27ae60] transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed uppercase tracking-wider"
                >
                  {loading ? 'Searching...' : 'SEARCH'}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-4 bg-[#1a2332]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">What Our Customers Say</h2>
              <p className="text-xl text-gray-300">Trusted by thousands of travelers worldwide</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-[#1f2937] rounded-xl p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4 italic">"{testimonial.text}"</p>
                  <div>
                    <p className="text-white font-semibold">{testimonial.name}</p>
                    <p className="text-gray-500 text-sm">{testimonial.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-[#2ecc71] to-[#27ae60]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Experience Premium Transportation?
            </h2>
            <p className="text-xl text-white mb-8">
              Join thousands of satisfied customers. Book your first ride today!
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-white text-[#2ecc71] px-12 py-5 rounded-full font-bold text-xl hover:bg-gray-100 transition-colors shadow-2xl"
            >
              BOOK NOW
            </button>
          </div>
        </section>

        {/* Worldwide Section */}
        <section className="py-16 px-4 bg-[#0f1419]">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Your Best Worldwide Option</h2>
            <p className="text-lg text-gray-300 mb-8 max-w-3xl mx-auto">
              With a global on-demand network already spanning across <span className="text-[#2ecc71] font-bold">120+ cities</span>, we're taking
              transportation and instant ordering to the next level.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
