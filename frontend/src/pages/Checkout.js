import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '@/context/BookingContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { transferService } from '@/services/api';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import { toast } from 'sonner';
import { CreditCard, MapPin, Calendar, Clock, Shield, CheckCircle, Loader2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const STRIPE_PK = 'pk_live_lX3FXPqGIJLP5NgXomcdpcWO';
const stripePromise = loadStripe(STRIPE_PK);

const labels = {
  en: {
    title: 'Complete Your Booking',
    summary: 'Trip Summary',
    from: 'Pick-up',
    to: 'Drop-off',
    dateTime: 'Date & Time',
    vehicle: 'Vehicle',
    total: 'Total',
    vatNote: 'All prices include VAT, fees and tolls.',
    payment: 'Payment Details',
    payBtn: 'Confirm & Pay',
    processing: 'Processing payment...',
    noData: 'No booking data found',
    goBack: 'Start a new booking',
    trustItems: ['Secure payment', 'Fixed price guaranteed', 'Free cancellation 24h'],
    step1: 'Vehicle', step2: 'Details', step3: 'Payment',
    cardError: 'Please check your card details.',
    bookingSuccess: 'Booking confirmed! Your ride has been reserved.',
    bookingError: 'Booking failed. Please try again.',
  },
  fr: {
    title: 'Finalisez Votre Reservation',
    summary: 'Resume du Trajet',
    from: 'Depart',
    to: 'Arrivee',
    dateTime: 'Date & Heure',
    vehicle: 'Vehicule',
    total: 'Total',
    vatNote: 'Tous les prix incluent TVA, frais et peages.',
    payment: 'Paiement',
    payBtn: 'Confirmer & Payer',
    processing: 'Traitement en cours...',
    noData: 'Aucune reservation trouvee',
    goBack: 'Nouvelle recherche',
    trustItems: ['Paiement securise', 'Prix fixe garanti', 'Annulation gratuite 24h'],
    step1: 'Vehicule', step2: 'Details', step3: 'Paiement',
    cardError: 'Veuillez verifier vos informations de carte.',
    bookingSuccess: 'Reservation confirmee ! Votre course a ete reservee.',
    bookingError: 'Erreur lors de la reservation. Veuillez reessayer.',
  },
  ru: {
    title: '\u0417\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u0435 \u0431\u0440\u043e\u043d\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435',
    summary: '\u0418\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f \u043e \u043f\u043e\u0435\u0437\u0434\u043a\u0435',
    from: '\u041e\u0442\u043a\u0443\u0434\u0430', to: '\u041a\u0443\u0434\u0430',
    dateTime: '\u0414\u0430\u0442\u0430 \u0438 \u0432\u0440\u0435\u043c\u044f',
    vehicle: '\u0410\u0432\u0442\u043e\u043c\u043e\u0431\u0438\u043b\u044c',
    total: '\u0418\u0442\u043e\u0433\u043e',
    vatNote: '\u0412\u0441\u0435 \u0446\u0435\u043d\u044b \u0432\u043a\u043b\u044e\u0447\u0430\u044e\u0442 \u041d\u0414\u0421 \u0438 \u0441\u0431\u043e\u0440\u044b.',
    payment: '\u041e\u043f\u043b\u0430\u0442\u0430',
    payBtn: '\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044c \u0438 \u043e\u043f\u043b\u0430\u0442\u0438\u0442\u044c',
    processing: '\u041e\u0431\u0440\u0430\u0431\u043e\u0442\u043a\u0430 \u043f\u043b\u0430\u0442\u0435\u0436\u0430...',
    noData: '\u0414\u0430\u043d\u043d\u044b\u0435 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u044b',
    goBack: '\u041d\u043e\u0432\u044b\u0439 \u043f\u043e\u0438\u0441\u043a',
    trustItems: ['\u0411\u0435\u0437\u043e\u043f\u0430\u0441\u043d\u044b\u0439 \u043f\u043b\u0430\u0442\u0435\u0436', '\u0424\u0438\u043a\u0441. \u0446\u0435\u043d\u0430', '\u0411\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u0430\u044f \u043e\u0442\u043c\u0435\u043d\u0430 24\u0447'],
    step1: '\u0410\u0432\u0442\u043e', step2: '\u0414\u0435\u0442\u0430\u043b\u0438', step3: '\u041e\u043f\u043b\u0430\u0442\u0430',
    cardError: '\u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435 \u0434\u0430\u043d\u043d\u044b\u0435 \u043a\u0430\u0440\u0442\u044b.',
    bookingSuccess: '\u0411\u0440\u043e\u043d\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u043e!',
    bookingError: '\u041e\u0448\u0438\u0431\u043a\u0430. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0441\u043d\u043e\u0432\u0430.',
  },
  hy: {
    title: '\u0531\u057e\u0561\u0580\u057f\u0565\u0584 \u0531\u0574\u0580\u0561\u0563\u0580\u0578\u0582\u0574\u0568',
    summary: '\u0548\u0582\u0572\u0587\u0578\u0580\u0578\u0582\u0569\u0575\u0561\u0576 \u057f\u0565\u0572\u0565\u056f\u0561\u057f\u057e\u0578\u0582\u0569\u0575\u0578\u0582\u0576',
    from: '\u054f\u0565\u0572\u056b\u0581', to: '\u0534\u0565\u057a\u056b',
    dateTime: '\u0531\u0574\u057d\u0561\u0569\u056b\u057e \u0587 \u056a\u0561\u0574',
    vehicle: '\u0544\u0565\u0584\u0565\u0576\u0561',
    total: '\u0538\u0576\u0564\u0561\u0574\u0565\u0576\u0568',
    vatNote: '\u0532\u0578\u056c\u0578\u0580 \u0563\u0576\u0565\u0580\u0568 \u0576\u0565\u0580\u0561\u057c\u0578\u0582\u0574 \u0565\u0576 \u0531\u0531\u054f.',
    payment: '\u054e\u0573\u0561\u0580\u0578\u0582\u0574',
    payBtn: '\u0540\u0561\u057d\u057f\u0561\u057f\u0565\u056c \u0587 \u057e\u0573\u0561\u0580\u0565\u056c',
    processing: '\u054e\u0573\u0561\u0580\u0578\u0582\u0574\u0568 \u0574\u0578\u0582\u057f\u0584\u0561\u0563\u0578\u0580\u056e\u057e\u0578\u0582\u0574 \u0567...',
    noData: '\u054f\u057e\u0575\u0561\u056c\u0576\u0565\u0580 \u0579\u0565\u0576 \u0563\u057f\u0576\u057e\u0565\u056c',
    goBack: '\u0546\u0578\u0580 \u0578\u0580\u0578\u0576\u0578\u0582\u0574',
    trustItems: ['\u0531\u0576\u057e\u057f\u0561\u0576\u0563 \u057e\u0573\u0561\u0580\u0578\u0582\u0574', '\u0540\u0561\u057d\u057f\u0561\u057f \u0563\u056b\u0576', '\u0531\u0576\u057e\u0573\u0561\u0580 \u0579\u0565\u0572\u0561\u0580\u056f\u0578\u0582\u0574 24\u056a'],
    step1: '\u0544\u0565\u0584\u0565\u0576\u0561', step2: '\u054f\u057e\u0575\u0561\u056c\u0576\u0565\u0580', step3: '\u054e\u0573\u0561\u0580\u0578\u0582\u0574',
    cardError: '\u054d\u057f\u0578\u0582\u0563\u0565\u0584 \u0584\u0561\u0580\u057f\u056b \u057f\u057e\u0575\u0561\u056c\u0576\u0565\u0580\u0568.',
    bookingSuccess: '\u0531\u0574\u0580\u0561\u0563\u0580\u0578\u0582\u0574\u0568 \u0570\u0561\u057d\u057f\u0561\u057f\u057e\u0565\u0581!',
    bookingError: '\u054d\u056d\u0561\u056c. \u0553\u0578\u0580\u0571\u0565\u0584 \u056f\u0580\u056f\u056b\u0576.',
  },
};

const cardStyle = {
  style: {
    base: {
      color: '#ffffff',
      fontFamily: '"Inter", system-ui, sans-serif',
      fontSize: '16px',
      '::placeholder': { color: '#6b7280' },
    },
    invalid: { color: '#ef4444' },
  },
};

const formatDateForApi = (date, time) => {
  if (!date || !time) return '';
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year} ${time}:00`;
};

const CheckoutForm = ({ searchData, selectedCar, c }) => {
  const navigate = useNavigate();
  const { completeBooking } = useBooking();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      // Step 1: Get SetupIntent for 3DS authentication
      const token = localStorage.getItem('auth_token');
      const setupResp = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/proxy/booking/setup-intent`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const setupData = await setupResp.json();
      if (!setupResp.ok || !setupData.clientSecret) {
        toast.error(setupData?.detail || c.bookingError);
        setLoading(false);
        return;
      }

      // Step 2: Confirm card setup with 3DS authentication
      const { error: setupError, setupIntent } = await stripe.confirmCardSetup(
        setupData.clientSecret,
        { payment_method: { card: elements.getElement(CardElement) } }
      );

      if (setupError) {
        toast.error(setupError.message || c.cardError);
        setLoading(false);
        return;
      }

      // Step 3: Card is now authenticated - send the confirmed PaymentMethod to C# API
      const bookingPayload = {
        startPointLatitude: searchData.pickupCoords.latitude,
        startPointLongitude: searchData.pickupCoords.longitude,
        clientPrice: selectedCar.price,
        startDate: formatDateForApi(searchData.date, searchData.time),
        startAddress: searchData.pickup,
        endAddress: searchData.dropoff || '',
        destination: searchData.dropoff || '',
        tripType: searchData.tripType === 'hourly' ? 'Hourly' : 'Transfer',
        carType: selectedCar.tripType || '',
        distance: selectedCar.distance ? Math.round(selectedCar.distance) : 0,
        duration: selectedCar.duration ? Math.round(selectedCar.duration) : 0,
        cardId: setupIntent.payment_method,
        utcOffset: new Date().getTimezoneOffset() * -1,
      };

      const result = await transferService.submitBooking(bookingPayload);
      completeBooking({ ...bookingPayload, result });
      toast.success(c.bookingSuccess);
      setTimeout(() => navigate('/booking-confirmation'), 1500);
    } catch (err) {
      toast.error(err.message || c.bookingError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid="checkout-form">
      <div className="bg-[#1e2d3d] border border-white/10 rounded-xl p-5 mb-5">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[#2ecc71]" />
          {c.payment}
        </h2>
        <div className="bg-[#0f1a28] rounded-lg p-4 border border-white/5">
          <CardElement
            options={cardStyle}
            onChange={(e) => setCardComplete(e.complete)}
            data-testid="stripe-card-element"
          />
        </div>
        <div className="flex items-center gap-2 mt-3 text-gray-400 text-xs">
          <Shield className="w-3.5 h-3.5" />
          <span>{c.trustItems[0]} - Stripe</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !stripe || !cardComplete}
        className="w-full bg-[#2ecc71] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#27ae60] transition-all disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        data-testid="checkout-pay-btn"
      >
        {loading ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> {c.processing}</>
        ) : (
          <>{c.payBtn} - {selectedCar.price} EUR</>
        )}
      </button>
    </form>
  );
};

const Checkout = () => {
  const navigate = useNavigate();
  const { searchData, selectedCar } = useBooking();
  const { language } = useLanguage();
  const c = labels[language] || labels.en;

  if (!searchData || !selectedCar) {
    return (
      <div className="min-h-screen flex flex-col bg-[#1a2332]">
        <SEO title="Checkout - Zont" noindex={true} />
        <Header />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center">
            <p className="text-white text-xl mb-4">{c.noData}</p>
            <button onClick={() => navigate('/')} className="bg-[#2ecc71] text-white px-6 py-3 rounded-lg hover:bg-[#27ae60]" data-testid="checkout-go-back">
              {c.goBack}
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#1a2332]">
      <SEO title="Checkout - Zont" noindex={true} />
      <Header />

      <main className="flex-1 pt-16">
        {/* Steps indicator */}
        <div className="bg-[#0f1419] border-b border-white/10">
          <div className="max-w-5xl mx-auto px-4 py-3.5">
            <div className="flex items-center justify-center gap-2 sm:gap-6">
              {[c.step1, c.step2, c.step3].map((step, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <div className="w-8 sm:w-12 h-px bg-gray-700" />}
                  <div className={`flex items-center gap-1.5 ${i === 2 ? 'text-[#2ecc71]' : 'text-gray-500'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${i < 2 ? 'bg-[#2ecc71]/20 text-[#2ecc71]' : 'bg-[#2ecc71] text-white'}`}>
                      {i < 2 ? <CheckCircle className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className="text-xs font-medium hidden sm:inline">{step}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center" data-testid="checkout-title">
            {c.title}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Trip Summary - left column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-[#1e2d3d] border border-white/10 rounded-xl p-5">
                <h2 className="text-lg font-semibold text-white mb-4">{c.summary}</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-[#2ecc71] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">{c.from}</p>
                      <p className="text-sm text-white font-medium" data-testid="checkout-pickup">{searchData.pickup}</p>
                    </div>
                  </div>
                  {searchData.dropoff && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">{c.to}</p>
                        <p className="text-sm text-white font-medium" data-testid="checkout-dropoff">{searchData.dropoff}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">{c.dateTime}</p>
                      <p className="text-sm text-white font-medium">{searchData.date} - {searchData.time}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">{c.vehicle}</p>
                      <p className="text-sm text-white font-medium">{selectedCar.tripType || selectedCar.description}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 mt-4 pt-4">
                  <div className="flex justify-between items-center">
                    <p className="text-base font-bold text-white">{c.total}</p>
                    <p className="text-2xl font-bold text-[#2ecc71]" data-testid="checkout-price">{selectedCar.price} EUR</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{c.vatNote}</p>
                </div>
              </div>

              {/* Trust items */}
              <div className="hidden lg:flex flex-col gap-2">
                {c.trustItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-gray-400 text-sm">
                    <CheckCircle className="w-4 h-4 text-[#2ecc71]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Form - right column */}
            <div className="lg:col-span-3">
              <Elements stripe={stripePromise}>
                <CheckoutForm searchData={searchData} selectedCar={selectedCar} c={c} />
              </Elements>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
