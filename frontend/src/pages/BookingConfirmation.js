import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '@/context/BookingContext';
import { useLanguage } from '@/context/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import { CheckCircle, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { trackPurchase } from '@/utils/fbPixel';

const labels = {
  en: {
    title: 'Booking Confirmed!',
    subtitle: 'Your ride has been successfully booked',
    details: 'Booking Details',
    route: 'Route',
    dateTime: 'Date & Time',
    vehicle: 'Vehicle',
    totalPaid: 'Total Paid',
    whatsNext: "What's Next?",
    nextItems: [
      'You will receive a confirmation email shortly',
      'Driver details will be sent 3 hours before pickup',
      'Track your driver in real-time through the app',
    ],
    newBooking: 'Book Another Ride',
    home: 'Back to Home',
    hourly: 'Hourly Rental',
    noBooking: 'No booking found',
    startNew: 'Make a new booking',
  },
  fr: {
    title: 'Reservation Confirmee !',
    subtitle: 'Votre course a ete reservee avec succes',
    details: 'Details de la Reservation',
    route: 'Itineraire',
    dateTime: 'Date & Heure',
    vehicle: 'Vehicule',
    totalPaid: 'Total Paye',
    whatsNext: 'Et maintenant ?',
    nextItems: [
      'Vous recevrez un email de confirmation sous peu',
      'Les details du chauffeur seront envoyes 3h avant le depart',
      'Suivez votre chauffeur en temps reel',
    ],
    newBooking: 'Réserver une autre course',
    home: 'Retour a l\'accueil',
    hourly: 'Location horaire',
    noBooking: 'Aucune reservation trouvee',
    startNew: 'Nouvelle reservation',
  },
  ru: {
    title: 'Бронирование Подтверждено!',
    subtitle: 'Ваша поездка успешно забронирована',
    details: 'Детали Бронирования',
    route: 'Маршрут',
    dateTime: 'Дата и Время',
    vehicle: 'Автомобиль',
    totalPaid: 'Итого Оплачено',
    whatsNext: 'Что дальше?',
    nextItems: [
      'Вы получите подтверждение по электронной почте',
      'Данные водителя будут отправлены за 3 часа до поездки',
      'Отслеживайте водителя в реальном времени',
    ],
    newBooking: 'Забронировать еще',
    home: 'На главную',
    hourly: 'Почасовая аренда',
    noBooking: 'Бронирование не найдено',
    startNew: 'Новое бронирование',
  },
  hy: {
    title: 'Ամրագրումը Հաստատված Է!',
    subtitle: 'Ձեր ուղևորությունը հաջողությամբ ամրագրված է',
    details: 'Ամրագրի Մանրամասներ',
    route: 'Ուղեգիծ',
    dateTime: 'Ամսաթիվ և Ժամ',
    vehicle: 'Մեքենա',
    totalPaid: 'Ընդհանուր Վճարված',
    whatsNext: 'Ինչ է հաջորդը:',
    nextItems: [
      'Դուկ կստանաք հաստատման նամակ',
      'Վարորդի տվյալները 3 ժամ առաջ',
      'Հետևեք վարորդին իրականում',
    ],
    newBooking: 'Այլ ամրագրում',
    home: 'Գլխավոր էջ',
    hourly: 'Ժամայինային վարձույթ',
    noBooking: 'Ամրագրում չի գտնվել',
    startNew: 'Նոր ամրագրում',
  },
};

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const { bookingDetails, searchData, selectedCar, resetBooking } = useBooking();
  const { language } = useLanguage();
  const c = labels[language] || labels.en;

  const handleNewBooking = () => {
    resetBooking();
    navigate('/');
  };

  // Track Purchase on mount
  React.useEffect(() => {
    if (bookingDetails && searchData?.price) {
      trackPurchase({ price: searchData.price, bookingId: bookingDetails.id || bookingDetails.bookingId });
    }
  }, []);

  if (!bookingDetails) {
    return (
      <div className="min-h-screen flex flex-col bg-[#1a2332]">
        <SEO title={`${c.title} - Zont`} noindex={true} />
        <Header />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center">
            <p className="text-white text-xl mb-4" data-testid="no-booking-msg">{c.noBooking}</p>
            <button onClick={() => navigate('/')} className="bg-[#2ecc71] text-white px-6 py-3 rounded-lg hover:bg-[#27ae60]" data-testid="new-booking-btn">
              {c.startNew}
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const carName = selectedCar?.tripType || selectedCar?.name || selectedCar?.description || '';

  return (
    <div className="min-h-screen flex flex-col bg-[#1a2332]">
      <SEO title={`${c.title} - Zont`} noindex={true} />
      <Header />

      <main className="flex-1 pt-16">
        <div className="max-w-3xl mx-auto px-4 py-12">
          {/* Success */}
          <div className="text-center mb-8" data-testid="booking-confirmed">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#2ecc71] rounded-full mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{c.title}</h1>
            <p className="text-lg text-gray-300">{c.subtitle}</p>
          </div>

          {/* Details */}
          <div className="bg-[#1e2d3d] border border-white/10 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-5">{c.details}</h2>
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#2ecc71] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 mb-1">{c.route}</p>
                  <p className="text-white font-medium">{searchData?.pickup}</p>
                  <ArrowRight className="w-4 h-4 text-gray-500 my-1" />
                  <p className="text-white font-medium">
                    {searchData?.tripType === 'hourly' ? c.hourly : searchData?.dropoff}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 mb-1">{c.dateTime}</p>
                  <p className="text-white font-medium">{searchData?.date} - {searchData?.time}</p>
                </div>
              </div>
              {carName && (
                <div className="border-t border-white/10 pt-4">
                  <p className="text-xs text-gray-400 mb-1">{c.vehicle}</p>
                  <p className="text-white font-semibold">{carName}</p>
                </div>
              )}
              <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-bold text-white">{c.totalPaid}</p>
                  <p className="text-2xl font-bold text-[#2ecc71]" data-testid="total-paid">{selectedCar?.price} EUR</p>
                </div>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-[#0f1a28] border border-white/10 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">{c.whatsNext}</h3>
            <ul className="space-y-2">
              {c.nextItems.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                  <CheckCircle className="w-4 h-4 text-[#2ecc71] mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={handleNewBooking} className="flex-1 bg-[#2ecc71] text-white py-4 rounded-xl font-semibold text-lg hover:bg-[#27ae60] transition-colors" data-testid="book-another-btn">
              {c.newBooking}
            </button>
            <button onClick={() => navigate('/')} className="flex-1 bg-white/5 border border-white/10 text-white py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors" data-testid="go-home-btn">
              {c.home}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingConfirmation;
