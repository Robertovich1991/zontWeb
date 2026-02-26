import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '@/context/BookingContext';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Users, Briefcase } from 'lucide-react';
import AuthModal from '@/components/auth/AuthModal';

const CarSelection = () => {
  const navigate = useNavigate();
  const { searchData, selectCar } = useBooking();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('carclass');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');

  const carClasses = [
    {
      id: 1,
      name: 'Premium',
      description: 'Sedan car with Driver',
      passengers: 4,
      luggage: 4,
      price: 88,
      image: null,
    },
    {
      id: 2,
      name: 'Luxury Sedan',
      description: 'Luxury car with Driver',
      passengers: 2,
      luggage: 2,
      price: 123,
      image: null,
    },
    {
      id: 3,
      name: 'Business Van',
      description: 'Van with Driver',
      passengers: 6,
      luggage: 6,
      price: 156,
      image: null,
    },
  ];

  const handleSelectCar = (car) => {
    selectCar(car);
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      setAuthMode('signin');
      setAuthModalOpen(true);
    }
  };

  if (!searchData) {
    return (
      <div className="min-h-screen flex flex-col bg-[#1a2332]">
        <Header />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center">
            <p className="text-white text-xl mb-4">No search data found</p>
            <button
              onClick={() => navigate('/')}
              className="bg-[#2ecc71] text-white px-6 py-3 rounded hover:bg-[#27ae60]"
            >
              Go back to search
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#1a2332]">
      <Header />

      <main className="flex-1 pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Tabs */}
          <div className="flex justify-center space-x-0 mb-8 border-b border-gray-700">
            <button
              onClick={() => setActiveTab('carclass')}
              className={`px-8 py-4 font-medium transition-colors relative ${
                activeTab === 'carclass'
                  ? 'text-[#2ecc71] border-b-2 border-[#2ecc71]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Car Class
            </button>
            <button
              onClick={() => {
                setAuthMode('signin');
                setAuthModalOpen(true);
              }}
              className={`px-8 py-4 font-medium transition-colors relative ${
                activeTab === 'login'
                  ? 'text-[#2ecc71] border-b-2 border-[#2ecc71]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              className="px-8 py-4 font-medium text-gray-400 hover:text-white transition-colors"
              disabled
            >
              Checkout
            </button>
          </div>

          {/* Car Cards */}
          <div className="space-y-6">
            {carClasses.map((car) => (
              <div
                key={car.id}
                className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div className="flex-1 mb-4 md:mb-0">
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">{car.name}</h3>
                    <p className="text-gray-600 text-lg mb-4">{car.description}</p>
                    <div className="flex items-center space-x-6 text-gray-700">
                      <div className="flex items-center space-x-2">
                        <Users size={20} />
                        <span className="text-lg">{car.passengers}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Briefcase size={20} />
                        <span className="text-lg">{car.luggage}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-bold text-gray-900 mb-2">{car.price} €</div>
                    <p className="text-sm text-gray-500 mb-4">All prices include VAT, fees.</p>
                    <button
                      onClick={() => handleSelectCar(car)}
                      className="bg-[#2ecc71] text-white px-8 py-4 rounded font-semibold text-lg hover:bg-[#27ae60] transition-colors uppercase tracking-wider w-full md:w-auto"
                    >
                      CHOOSE AND CONTINUE
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onSwitchMode={(newMode) => setAuthMode(newMode)}
      />
    </div>
  );
};

export default CarSelection;
