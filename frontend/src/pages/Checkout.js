import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '@/context/BookingContext';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import { toast } from 'sonner';
import { CreditCard, Calendar } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const { searchData, selectedCar, completeBooking } = useBooking();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Connect to C# API for payment processing
      const bookingData = {
        user: user,
        searchData: searchData,
        car: selectedCar,
        payment: paymentData,
      };

      completeBooking(bookingData);
      
      toast.success('Booking Confirmed! Your ride has been booked successfully.');

      // Redirect to confirmation page
      setTimeout(() => {
        navigate('/booking-confirmation');
      }, 2000);
    } catch (error) {
      toast.error('An error occurred during checkout');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setPaymentData({ ...paymentData, [e.target.name]: e.target.value });
  };

  if (!searchData || !selectedCar) {
    return (
      <div className="min-h-screen flex flex-col bg-[#1a2332]">
        <SEO title="Checkout - Zont" description="Complete your airport transfer booking." noindex={true} />
        <Header />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center">
            <p className="text-white text-xl mb-4">No booking data found</p>
            <button
              onClick={() => navigate('/')}
              className="bg-[#2ecc71] text-white px-6 py-3 rounded hover:bg-[#27ae60]"
            >
              Start a new booking
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#1a2332]">
      <SEO title="Checkout - Zont" description="Complete your airport transfer booking." noindex={true} />
      <Header />

      <main className="flex-1 pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">Checkout</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Booking Summary */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Summary</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">From</p>
                  <p className="text-lg font-semibold text-gray-900">{searchData.pickup}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">To</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {searchData.tripType === 'hourly' ? 'Hourly Rental' : searchData.dropoff}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Date & Time</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {searchData.date} at {searchData.time}
                  </p>
                </div>
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <p className="text-sm text-gray-600 mb-1">Car Class</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedCar.name}</p>
                  <p className="text-gray-600">{selectedCar.description}</p>
                </div>
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <p className="text-xl font-bold text-gray-900">Total</p>
                    <p className="text-3xl font-bold text-gray-900">{selectedCar.price} €</p>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">All prices include VAT, fees.</p>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <CreditCard className="mr-2" size={28} />
                Payment Details
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={paymentData.cardNumber}
                    onChange={handleChange}
                    required
                    maxLength="19"
                    className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#2ecc71]"
                    placeholder="1234 5678 9012 3456"
                  />
                </div>

                <div>
                  <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    id="cardName"
                    name="cardName"
                    value={paymentData.cardName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#2ecc71]"
                    placeholder="John Doe"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      value={paymentData.expiryDate}
                      onChange={handleChange}
                      required
                      maxLength="5"
                      className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#2ecc71]"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      value={paymentData.cvv}
                      onChange={handleChange}
                      required
                      maxLength="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#2ecc71]"
                      placeholder="123"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2ecc71] text-white py-4 rounded font-semibold text-lg hover:bg-[#27ae60] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mt-6"
                >
                  {loading ? 'Processing...' : `Pay ${selectedCar.price} €`}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
