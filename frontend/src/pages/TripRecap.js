import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '@/context/BookingContext';
import { useLanguage } from '@/context/LanguageContext';
import { transferService } from '@/services/api';
import { loadGoogleMaps } from '@/components/PlacesAutocomplete';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import {
  MapPin, Clock, Users, Briefcase, Shield, CheckCircle,
  Droplets, UserCheck, Plane, CreditCard, ArrowRight, ChevronLeft, Car
} from 'lucide-react';

const labels = {
  en: {
    seoTitle: 'Trip Summary - Zont',
    title: 'Your Trip Summary',
    subtitle: 'Review your transfer details before proceeding',
    from: 'Pick-up', to: 'Drop-off',
    dateTime: 'Date & Time', vehicle: 'Selected Vehicle',
    duration: 'Est. travel time', distance: 'Distance',
    mins: 'min', km: 'km',
    perksTitle: 'Included in Your Transfer',
    perk1: 'Free waiting time', perk1d: '60 min at airports, 15 min elsewhere',
    perk2: 'Personalized name sign', perk2d: 'Your driver greets you by name',
    perk3: 'Complimentary water', perk3d: 'Fresh water on board',
    perk4: 'Flight tracking', perk4d: 'Real-time delay monitoring',
    perk5: 'Fixed price guaranteed', perk5d: 'No hidden fees, tolls included',
    perk6: 'Free cancellation 24h', perk6d: 'Change plans? No charge',
    continueBtn: 'Continue to Payment',
    changeVehicle: 'Change Vehicle',
    fixedPrice: 'Fixed price',
    step1: 'Vehicle', step2: 'Summary', step3: 'Payment',
    orSimilar: 'or similar',
  },
  fr: {
    seoTitle: 'Resume du Trajet - Zont',
    title: 'Resume de Votre Trajet',
    subtitle: 'Verifiez les details avant de continuer',
    from: 'Depart', to: 'Arrivee',
    dateTime: 'Date & Heure', vehicle: 'Vehicule Selectionne',
    duration: 'Temps estime', distance: 'Distance',
    mins: 'min', km: 'km',
    perksTitle: 'Inclus dans Votre Transfert',
    perk1: 'Attente gratuite', perk1d: '60 min aeroports, 15 min ailleurs',
    perk2: 'Pancarte nominative', perk2d: 'Accueil personnalise a votre nom',
    perk3: 'Eau offerte', perk3d: 'Bouteille d\'eau a bord',
    perk4: 'Suivi de vol', perk4d: 'Surveillance en temps reel',
    perk5: 'Prix fixe garanti', perk5d: 'Pas de frais caches, peages inclus',
    perk6: 'Annulation gratuite 24h', perk6d: 'Changement de plan ? Aucun frais',
    continueBtn: 'Continuer vers le Paiement',
    changeVehicle: 'Changer de Vehicule',
    fixedPrice: 'Prix fixe',
    step1: 'Vehicule', step2: 'Resume', step3: 'Paiement',
    orSimilar: 'ou similaire',
  },
  ru: {
    seoTitle: 'Информация о Поездке - Zont',
    title: 'Информация о Поездке',
    subtitle: 'Проверьте детали перед продолжением',
    from: 'Откуда', to: 'Куда',
    dateTime: 'Дата и Время', vehicle: 'Выбранный Автомобиль',
    duration: 'Время в пути', distance: 'Расстояние',
    mins: 'мин', km: 'км',
    perksTitle: 'Включено в Ваш Трансфер',
    perk1: 'Бесплатное ожидание', perk1d: '60 мин в аэропортах, 15 мин в другом месте',
    perk2: 'Табличка с именем', perk2d: 'Водитель встречает вас по имени',
    perk3: 'Вода в подарок', perk3d: 'Свежая вода на борту',
    perk4: 'Отслеживание рейса', perk4d: 'Мониторинг задержек',
    perk5: 'Фиксированная цена', perk5d: 'Без скрытых платежей',
    perk6: 'Бесплатная отмена 24ч', perk6d: 'Изменились планы? Без доплат',
    continueBtn: 'Продолжить к Оплате',
    changeVehicle: 'Изменить Автомобиль',
    fixedPrice: 'Фикс. цена',
    step1: 'Авто', step2: 'Детали', step3: 'Оплата',
    orSimilar: 'или аналог',
  },
  hy: {
    seoTitle: ' Delays Info - Zont',
    title: ' Delays Մանրամdelays',
    subtitle: 'Ստdelays details',
    from: 'Տdelays', to: 'Delays',
    dateTime: ' Delays & Delays', vehicle: 'Delays Delays',
    duration: 'Delays', distance: 'Delays',
    mins: 'ր', km: 'կ',
    perksTitle: 'Delays Delays',
    perk1: 'Delays delays', perk1d: '60 delays, 15 delays',
    perk2: 'Delays delays', perk2d: 'Delays delays',
    perk3: 'Delays delays', perk3d: 'Delays delays',
    perk4: 'Delays delays', perk4d: 'Delays delays',
    perk5: 'Delays delays', perk5d: 'Delays delays',
    perk6: 'Delays delays', perk6d: 'Delays delays',
    continueBtn: 'Delays',
    changeVehicle: 'Delays',
    fixedPrice: 'Delays',
    step1: 'Delays', step2: 'Delays', step3: 'Delays',
    orSimilar: 'Delays',
  },
};

const RouteMap = ({ pickupCoords, dropoffCoords, pickup, dropoff }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!pickupCoords || !dropoffCoords) return;
    let cancelled = false;

    loadGoogleMaps().then(() => {
      if (cancelled || !mapRef.current) return;

      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 12,
        center: { lat: pickupCoords.latitude, lng: pickupCoords.longitude },
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          { featureType: 'poi', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', stylers: [{ visibility: 'off' }] },
        ],
      });
      mapInstanceRef.current = map;

      // Pickup marker
      new window.google.maps.Marker({
        position: { lat: pickupCoords.latitude, lng: pickupCoords.longitude },
        map,
        title: pickup,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#2ecc71',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
      });

      // Dropoff marker
      new window.google.maps.Marker({
        position: { lat: dropoffCoords.latitude, lng: dropoffCoords.longitude },
        map,
        title: dropoff,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#e74c3c',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
      });

      // Draw route
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#2ecc71',
          strokeWeight: 4,
          strokeOpacity: 0.8,
        },
      });

      directionsService.route(
        {
          origin: { lat: pickupCoords.latitude, lng: pickupCoords.longitude },
          destination: { lat: dropoffCoords.latitude, lng: dropoffCoords.longitude },
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK') {
            directionsRenderer.setDirections(result);
          } else {
            // Fallback: fit bounds to show both markers
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend({ lat: pickupCoords.latitude, lng: pickupCoords.longitude });
            bounds.extend({ lat: dropoffCoords.latitude, lng: dropoffCoords.longitude });
            map.fitBounds(bounds, 60);
          }
        }
      );

      setMapReady(true);
    });

    return () => { cancelled = true; };
  }, [pickupCoords, dropoffCoords, pickup, dropoff]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-white/10" data-testid="trip-recap-map">
      <div ref={mapRef} className="w-full h-[240px] sm:h-[300px]" />
      {!mapReady && (
        <div className="absolute inset-0 bg-[#1a2332] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#2ecc71] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

const TripRecap = () => {
  const navigate = useNavigate();
  const { searchData, selectedCar } = useBooking();
  const { language } = useLanguage();
  const c = labels[language] || labels.en;

  if (!searchData || !selectedCar) {
    return (
      <div className="min-h-screen flex flex-col bg-[#1a2332]" data-testid="trip-recap-empty">
        <SEO title={c.seoTitle} noindex />
        <Header />
        <main className="flex-1 pt-16 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Car className="w-10 h-10 text-[#2ecc71]" />
            </div>
            <p className="text-white text-xl font-semibold mb-2">Aucune donnee trouvee</p>
            <button onClick={() => navigate('/')} className="mt-4 bg-[#2ecc71] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#27ae60] transition-colors" data-testid="trip-recap-go-home">
              Nouvelle Recherche
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const imageUrl = transferService.getVehicleImageUrl(selectedCar.imagePath);
  const tripType = (selectedCar.tripType || '').trim();

  const perks = [
    { icon: Clock, title: c.perk1, desc: c.perk1d },
    { icon: UserCheck, title: c.perk2, desc: c.perk2d },
    { icon: Droplets, title: c.perk3, desc: c.perk3d },
    { icon: Plane, title: c.perk4, desc: c.perk4d },
    { icon: CreditCard, title: c.perk5, desc: c.perk5d },
    { icon: Shield, title: c.perk6, desc: c.perk6d },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#1a2332]" data-testid="trip-recap-page">
      <SEO title={c.seoTitle} noindex />
      <Header />

      <main className="flex-1 pt-16">
        {/* Steps */}
        <div className="bg-[#0f1419] border-b border-white/10">
          <div className="max-w-5xl mx-auto px-4 py-3.5">
            <div className="flex items-center justify-center gap-2 sm:gap-6">
              {[c.step1, c.step2, c.step3].map((step, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <div className="w-8 sm:w-12 h-px bg-gray-700" />}
                  <div className={`flex items-center gap-1.5 ${i <= 1 ? 'text-[#2ecc71]' : 'text-gray-600'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      i < 1 ? 'bg-[#2ecc71]/20 text-[#2ecc71]' : i === 1 ? 'bg-[#2ecc71] text-white' : 'border border-gray-700 text-gray-600'
                    }`}>
                      {i < 1 ? <CheckCircle className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className="text-xs font-medium hidden sm:inline">{step}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-6">
          {/* Back button */}
          <button
            onClick={() => navigate('/car-selection')}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-5"
            data-testid="trip-recap-back"
          >
            <ChevronLeft className="w-4 h-4" />
            {c.changeVehicle}
          </button>

          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1" data-testid="trip-recap-title">{c.title}</h1>
          <p className="text-gray-500 text-sm mb-6">{c.subtitle}</p>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left column: Map + Route */}
            <div className="lg:col-span-3 space-y-5">
              {/* Map */}
              {searchData.pickupCoords && searchData.dropoffCoords && (
                <RouteMap
                  pickupCoords={searchData.pickupCoords}
                  dropoffCoords={searchData.dropoffCoords}
                  pickup={searchData.pickup}
                  dropoff={searchData.dropoff}
                />
              )}

              {/* Route details */}
              <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#2ecc71] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-gray-500 uppercase tracking-wide">{c.from}</p>
                    <p className="text-sm text-white font-medium truncate" data-testid="recap-pickup">{searchData.pickup}</p>
                  </div>
                </div>
                <div className="ml-[5px] border-l-2 border-dashed border-gray-700 h-4" />
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-gray-500 uppercase tracking-wide">{c.to}</p>
                    <p className="text-sm text-white font-medium truncate" data-testid="recap-dropoff">{searchData.dropoff}</p>
                  </div>
                </div>

                {(searchData.date || selectedCar.duration || selectedCar.distance) && (
                  <div className="border-t border-white/10 pt-3 mt-3 flex flex-wrap gap-4 text-xs text-gray-400">
                    {searchData.date && searchData.time && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                        <span>{c.dateTime}: <b className="text-white">{searchData.date} - {searchData.time}</b></span>
                      </div>
                    )}
                    {selectedCar.duration > 0 && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-500" />
                        <span>{c.duration}: <b className="text-white">~{selectedCar.duration} {c.mins}</b></span>
                      </div>
                    )}
                    {selectedCar.distance > 0 && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-500" />
                        <span>{c.distance}: <b className="text-white">~{selectedCar.distance} {c.km}</b></span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Premium Perks Grid */}
              <div>
                <h2 className="text-base font-semibold text-white mb-3">{c.perksTitle}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {perks.map((perk, i) => (
                    <div
                      key={i}
                      className="bg-white/[0.03] border border-white/10 rounded-xl p-3 hover:border-[#2ecc71]/30 transition-colors"
                      data-testid={`perk-${i}`}
                    >
                      <perk.icon className="w-5 h-5 text-[#2ecc71] mb-2" />
                      <p className="text-sm text-white font-medium leading-tight">{perk.title}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">{perk.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column: Vehicle + Price + CTA */}
            <div className="lg:col-span-2 space-y-4">
              {/* Vehicle Card */}
              <div className="bg-white/[0.04] border border-white/10 rounded-xl overflow-hidden" data-testid="recap-vehicle-card">
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 flex items-center justify-center p-4">
                  {imageUrl ? (
                    <img src={imageUrl} alt={tripType} className="w-full max-w-[280px] h-auto object-contain" loading="eager" />
                  ) : (
                    <Car className="w-16 h-16 text-gray-500" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white">{tripType}</h3>
                  {selectedCar.description && (
                    <p className="text-xs text-gray-400 mt-0.5">{selectedCar.description} {c.orSimilar}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3">
                    {selectedCar.passenger > 0 && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-300">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span>{selectedCar.passenger}</span>
                      </div>
                    )}
                    {selectedCar.luggage > 0 && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-300">
                        <Briefcase className="w-4 h-4 text-gray-500" />
                        <span>{selectedCar.luggage}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Price Block */}
              <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4" data-testid="recap-price-block">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">{c.fixedPrice}</span>
                  {selectedCar.promoDiscount > 0 && (
                    <span className="text-xs bg-[#2ecc71]/10 text-[#2ecc71] px-2 py-0.5 rounded-full font-medium">
                      -{selectedCar.promoDiscount}%
                    </span>
                  )}
                </div>
                {selectedCar.originalPrice && selectedCar.originalPrice !== selectedCar.price && (
                  <p className="text-lg text-gray-500 line-through">{selectedCar.originalPrice}&euro;</p>
                )}
                <p className="text-3xl font-extrabold text-white" data-testid="recap-price">
                  {selectedCar.price}<span className="text-base font-normal text-gray-400 ml-1">&euro;</span>
                </p>
                <p className="text-[10px] text-gray-500 mt-1">TVA, peages et frais inclus</p>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-[#2ecc71] text-white py-4 rounded-xl font-bold text-base hover:bg-[#27ae60] transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                data-testid="trip-recap-continue-btn"
              >
                {c.continueBtn}
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Trust items */}
              <div className="flex flex-col gap-2 pt-2">
                {[c.perk5, c.perk6, c.perk1].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-gray-400 text-xs">
                    <CheckCircle className="w-3.5 h-3.5 text-[#2ecc71]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Mobile Sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#1a2332]/95 backdrop-blur-sm border-t border-white/10 p-4 z-40">
        <div className="flex items-center justify-between gap-4">
          <div>
            {selectedCar.originalPrice && selectedCar.originalPrice !== selectedCar.price && (
              <p className="text-sm text-gray-500 line-through">{selectedCar.originalPrice}&euro;</p>
            )}
            <p className="text-2xl font-extrabold text-white">{selectedCar.price}<span className="text-sm font-normal text-gray-400 ml-0.5">&euro;</span></p>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="flex-1 max-w-[220px] bg-[#2ecc71] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#27ae60] transition-all flex items-center justify-center gap-2"
            data-testid="trip-recap-mobile-cta"
          >
            {c.continueBtn}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripRecap;
