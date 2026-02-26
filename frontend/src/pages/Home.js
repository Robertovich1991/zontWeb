import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '@/context/BookingContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

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
      
      // Navigate to car selection
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

  return (
    <div className="min-h-screen flex flex-col bg-[#1a2332]">
      <Header />

      {/* Main Content */}
      <main className="flex-1 pt-16">
        {/* Hero Section with Search */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Description */}
            <div className="text-center mb-12">
              <p className="text-gray-300 text-lg leading-relaxed">
                Choose from a range of categories and prices. Zont provides professional ground
                transportation at the lowest rates across the globe. Mobile application Zont will help
                you book an airport transfer or car service in any city worldwide. You can also book
                online for an immediate ride. Our system shows you where the driver is in real time,
                ensuring quality and punctuality.
              </p>
            </div>

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
              {/* Pick up */}
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

              {/* Drop off */}
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

              {/* Date and Time */}
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

              {/* Search Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2ecc71] text-white py-5 rounded font-semibold text-lg hover:bg-[#27ae60] transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed uppercase tracking-wider"
              >
                {loading ? 'Searching...' : 'SEARCH'}
              </button>
            </form>
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
