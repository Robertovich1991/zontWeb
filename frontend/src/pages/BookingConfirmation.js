import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '@/context/BookingContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { CheckCircle, Calendar, MapPin } from 'lucide-react';

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const { bookingDetails, searchData, selectedCar, resetBooking } = useBooking();

  const handleNewBooking = () => {
    resetBooking();
    navigate('/');
  };

  if (!bookingDetails) {
    return (
      <div className="min-h-screen flex flex-col bg-[#1a2332]">
        <Header />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center">
            <p className="text-white text-xl mb-4">No booking found</p>
            <button
              onClick={() => navigate('/')}
              className="bg-[#2ecc71] text-white px-6 py-3 rounded hover:bg-[#27ae60]"
            >
              Make a new booking
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
        <div className="max-w-3xl mx-auto px-4 py-12">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-block bg-[#2ecc71] rounded-full p-6 mb-4">
              <CheckCircle size={64} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Booking Confirmed!</h1>
            <p className="text-xl text-gray-300">Your ride has been successfully booked</p>
          </div>

          {/* Booking Details Card */}
          <div className="bg-white rounded-lg p-8 shadow-xl mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Details</h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <MapPin className="text-[#2ecc71] mr-3 mt-1" size={24} />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Route</p>
                  <p className="text-lg font-semibold text-gray-900">{searchData?.pickup}</p>
                  <p className="text-gray-600">↓</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {searchData?.tripType === 'hourly' ? 'Hourly Rental' : searchData?.dropoff}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Calendar className="text-[#2ecc71] mr-3 mt-1" size={24} />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Date & Time</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {searchData?.date} at {searchData?.time}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-600 mb-2">Car</p>
                <p className="text-xl font-bold text-gray-900">{selectedCar?.name}</p>
                <p className="text-gray-600">{selectedCar?.description}</p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <p className="text-xl font-bold text-gray-900">Total Paid</p>
                  <p className="text-3xl font-bold text-[#2ecc71]">{selectedCar?.price} €</p>
                </div>
              </div>
            </div>
          </div>

          {/* Information */}
          <div className="bg-blue-900 bg-opacity-50 border border-blue-700 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-2">What's Next?</h3>
            <ul className="text-gray-300 space-y-2">
              <li>• You will receive a confirmation email shortly</li>
              <li>• Driver details will be sent 3 hours before pickup</li>
              <li>• Track your driver in real-time through the app</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleNewBooking}
              className="flex-1 bg-[#2ecc71] text-white py-4 rounded font-semibold text-lg hover:bg-[#27ae60] transition-colors"
            >
              Book Another Ride
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-700 text-white py-4 rounded font-semibold text-lg hover:bg-gray-600 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingConfirmation;
