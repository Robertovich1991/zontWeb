import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBooking } from '@/context/BookingContext';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Users, Briefcase, Shield, Clock, CheckCircle, Star, MapPin, Plane } from 'lucide-react';

const CityTransferPage = ({ content, vehicles: vehiclesPrices, popularRoutes: routesPrices }) => {
  const navigate = useNavigate();
  const { startBooking } = useBooking();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const bookingFormRef = useRef(null);
  const [formData, setFormData] = useState({
    pickup: '',
    dropoff: '',
    date: '',
    time: '',
  });

  const c = content[language] || content.en;

  // Set default pickup based on language after content is resolved
  if (!formData.pickup && c.defaultPickup) {
    setFormData(prev => ({ ...prev, pickup: c.defaultPickup }));
  }

  const vehicles = [
    { id: 1, name: c.sedan, desc: c.sedanDesc, passengers: 3, luggage: 3, price: vehiclesPrices?.sedan || 65, image: '🚗' },
    { id: 2, name: c.luxury, desc: c.luxuryDesc, passengers: 3, luggage: 3, price: vehiclesPrices?.luxury || 95, image: '🚙' },
    { id: 3, name: c.minivan, desc: c.minivanDesc, passengers: 6, luggage: 6, price: vehiclesPrices?.minivan || 120, image: '🚐' },
    { id: 4, name: c.minibus, desc: c.minibusDesc, passengers: 8, luggage: 8, price: vehiclesPrices?.minibus || 180, image: '🚌' },
  ];

  const routes = c.routes || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      startBooking({ ...formData, selectedVehicle });
      navigate('/car-selection');
    } catch (error) {
      toast({ title: 'Error', description: 'An error occurred', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1a2332]" data-testid="city-transfer-page">
      <Header />
      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="py-20 px-4 bg-gradient-to-br from-[#1a2332] to-[#1f2937]">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <Plane className="w-16 h-16 text-[#2ecc71]" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6" data-testid="city-hero-title">
              {c.title}
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-4xl mx-auto">
              {c.subtitle}
            </p>
            <div className="flex justify-center space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-[#2ecc71] fill-current" />
              ))}
              <span className="text-white ml-3 text-base">{c.rating}</span>
            </div>
          </div>
        </section>

        {/* SEO Description */}
        <section className="py-12 px-4 bg-[#0f1419]">
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-gray-300 leading-relaxed">{c.description}</p>
            {c.description2 && (
              <p className="text-base text-gray-400 leading-relaxed mt-4">{c.description2}</p>
            )}
          </div>
        </section>

        {/* Why Choose */}
        <section className="py-20 px-4 bg-[#1a2332]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12" data-testid="why-choose-title">{c.whyChoose}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-[#1f2937] rounded-xl p-6">
                <Shield className="w-12 h-12 text-[#2ecc71] mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">{c.feature1Title}</h3>
                <p className="text-gray-400">{c.feature1Desc}</p>
              </div>
              <div className="bg-[#1f2937] rounded-xl p-6">
                <Clock className="w-12 h-12 text-[#2ecc71] mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">{c.feature2Title}</h3>
                <p className="text-gray-400">{c.feature2Desc}</p>
              </div>
              <div className="bg-[#1f2937] rounded-xl p-6">
                <CheckCircle className="w-12 h-12 text-[#2ecc71] mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">{c.feature3Title}</h3>
                <p className="text-gray-400">{c.feature3Desc}</p>
              </div>
              <div className="bg-[#1f2937] rounded-xl p-6">
                <Star className="w-12 h-12 text-[#2ecc71] mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">{c.feature4Title}</h3>
                <p className="text-gray-400">{c.feature4Desc}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Vehicles */}
        <section className="py-20 px-4 bg-[#0f1419]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">{c.vehiclesTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {vehicles.map((v) => (
                <div key={v.id} className="bg-white rounded-xl p-8 hover:shadow-2xl transition-shadow" data-testid={`vehicle-card-${v.id}`}>
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="text-6xl mb-4">{v.image}</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{v.name}</h3>
                      <p className="text-gray-600 mb-4">{v.desc}</p>
                      <div className="flex items-center space-x-6 text-gray-700 mb-4">
                        <div className="flex items-center space-x-2">
                          <Users size={20} />
                          <span>{v.passengers} {c.passengers}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Briefcase size={20} />
                          <span>{v.luggage} {c.luggage}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-4xl font-bold text-gray-900 mb-2">{v.price} &euro;</div>
                      <p className="text-sm text-gray-500 mb-4">{c.allInclusive}</p>
                      <button
                        onClick={() => {
                          setSelectedVehicle(v);
                          bookingFormRef.current?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="bg-[#2ecc71] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#27ae60] transition-colors w-full"
                        data-testid={`book-vehicle-${v.id}`}
                      >
                        {c.bookNow}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4 bg-[#1a2332]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">{c.howItWorks}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[c.step1, c.step2, c.step3].map((step, i) => (
                <div key={i} className="text-center">
                  <div className="w-20 h-20 bg-[#2ecc71] rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6">{i + 1}</div>
                  <h3 className="text-xl font-bold text-white mb-4">{step}</h3>
                  <p className="text-gray-400">{[c.step1Desc, c.step2Desc, c.step3Desc][i]}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Routes */}
        {routes.length > 0 && (
          <section className="py-20 px-4 bg-[#0f1419]">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">{c.popularRoutesTitle}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {routes.map((route, i) => (
                  <div key={i} className="bg-[#1a2332] rounded-lg p-6 border-l-4 border-[#2ecc71]" data-testid={`route-${i}`}>
                    <div className="flex items-center mb-2">
                      <MapPin className="w-5 h-5 text-[#2ecc71] mr-2" />
                      <p className="text-lg text-white font-semibold">{route.name}</p>
                    </div>
                    <p className="text-[#2ecc71] text-2xl font-bold">{c.fromLabel} {route.price} &euro;</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Booking Form */}
        <section className="py-20 px-4 bg-[#1a2332]" ref={bookingFormRef}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-8" data-testid="booking-form-title">{c.bookingForm}</h2>
            {selectedVehicle && (
              <div className="bg-[#2ecc71]/10 border border-[#2ecc71] rounded-xl p-4 mb-6 flex items-center justify-between" data-testid="selected-vehicle-banner">
                <div className="flex items-center space-x-4">
                  <span className="text-4xl">{selectedVehicle.image}</span>
                  <div>
                    <p className="text-white font-bold text-lg">{selectedVehicle.name}</p>
                    <p className="text-gray-400 text-sm">{selectedVehicle.passengers} {c.passengers} / {selectedVehicle.luggage} {c.luggage}</p>
                  </div>
                </div>
                <div className="text-[#2ecc71] text-2xl font-bold">{selectedVehicle.price} &euro;</div>
              </div>
            )}
            <div className="bg-[#0f1419] rounded-2xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6" data-testid="booking-form">
                <div>
                  <label className="block text-white font-medium mb-3">{c.pickupLabel}</label>
                  <input type="text" name="pickup" value={formData.pickup} onChange={handleChange} required
                    className="w-full px-4 py-4 bg-white text-gray-900 rounded" data-testid="pickup-input" />
                </div>
                <div>
                  <label className="block text-white font-medium mb-3">{c.dropoffLabel}</label>
                  <input type="text" name="dropoff" value={formData.dropoff} onChange={handleChange} required
                    className="w-full px-4 py-4 bg-white text-gray-900 rounded" data-testid="dropoff-input" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-3">{c.dateLabel}</label>
                    <input type="date" name="date" value={formData.date} onChange={handleChange} required
                      className="w-full px-4 py-4 bg-white text-gray-900 rounded" data-testid="date-input" />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-3">{c.timeLabel}</label>
                    <input type="time" name="time" value={formData.time} onChange={handleChange} required
                      className="w-full px-4 py-4 bg-white text-gray-900 rounded" data-testid="time-input" />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-[#2ecc71] text-white py-5 rounded font-semibold text-lg hover:bg-[#27ae60] transition-colors uppercase"
                  data-testid="submit-booking-btn">
                  {loading ? '...' : c.bookNow}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Other Cities CTA */}
        <section className="py-16 px-4 bg-[#0f1419]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">{c.otherCitiesTitle}</h2>
            <Link to="/countries" className="inline-block bg-[#2ecc71] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#27ae60] transition-colors" data-testid="view-all-cities-btn">
              {c.otherCitiesBtn}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CityTransferPage;
