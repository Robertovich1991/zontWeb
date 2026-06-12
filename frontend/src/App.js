import React, { Suspense, lazy } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { trackPageView } from "@/utils/fbPixel";
import ScrollToTop from "@/components/ScrollToTop";
import { AuthProvider } from "@/context/AuthContext";
import { BookingProvider } from "@/context/BookingContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { Toaster } from "@/components/ui/sonner";
import SmartAppBanner from "@/components/SmartAppBanner";
import { AdminAuthProvider, useAdminAuth } from "@/pages/admin/AdminAuthContext";
import { FleetAuthProvider } from "@/pages/fleet/FleetAuthContext";
import { HotelAuthProvider, useHotelAuth } from "@/pages/hotel/HotelAuthContext";
import { GpsAdminProvider } from "@/pages/gps-admin/GpsAdminAuthContext";

// Core pages (eager load)
import Home from "@/pages/Home";

// Lazy loaded pages
const BecomeDriver = lazy(() => import("@/pages/BecomeDriver"));
const BecomeClient = lazy(() => import("@/pages/BecomeClient"));
const Help = lazy(() => import("@/pages/Help"));
const Countries = lazy(() => import("@/pages/Countries"));
const CarSelection = lazy(() => import("@/pages/CarSelection"));
const TripRecap = lazy(() => import("@/pages/TripRecap"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const MyBookings = lazy(() => import("@/pages/MyBookings"));
const MyAccount = lazy(() => import("@/pages/MyAccount"));
const BookingConfirmation = lazy(() => import("@/pages/BookingConfirmation"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const ReviewForm = lazy(() => import("@/pages/ReviewForm"));

// Redirect component for C# API's forgot password link format
const ForgetPasswordRedirect = lazy(() => import("@/pages/ResetPassword"));

// Kiosk
const KioskPage = lazy(() => import("@/pages/kiosk/KioskPage"));
const LookingForPartners = lazy(() => import("@/pages/LookingForPartners"));
const ParisAirportTransfer = lazy(() => import("@/pages/ParisAirportTransfer"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Admin pages (lazy)
const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("@/pages/admin/AdminLayout"));
const Dashboard = lazy(() => import("@/pages/admin/Dashboard"));
const PagesManager = lazy(() => import("@/pages/admin/PagesManager"));
const PlacesManager = lazy(() => import("@/pages/admin/PlacesManager"));
const HomepageEditor = lazy(() => import("@/pages/admin/HomepageEditor"));
const TrustBlocks = lazy(() => import("@/pages/admin/TrustBlocks"));
const FaqManager = lazy(() => import("@/pages/admin/FaqManager"));
const SeoOverview = lazy(() => import("@/pages/admin/SeoOverview"));
const PartnersManager = lazy(() => import("@/pages/admin/PartnersManager"));
const RidesManager = lazy(() => import("@/pages/admin/RidesManager"));
const HotelsManager = lazy(() => import("@/pages/admin/HotelsManager"));
const HotelsDashboard = lazy(() => import("@/pages/admin/HotelsDashboard"));
const KiosksManager = lazy(() => import("@/pages/admin/KiosksManager"));
const HotelBookingsManager = lazy(() => import("@/pages/admin/HotelBookingsManager"));
const HotelPayments = lazy(() => import("@/pages/admin/HotelPayments"));
const PromoEmails = lazy(() => import("@/pages/admin/PromoEmails"));
const ReviewsManager = lazy(() => import("@/pages/admin/ReviewsManager"));
const LeadsManager = lazy(() => import("@/pages/admin/LeadsManager"));
const ReservationsManager = lazy(() => import("@/pages/admin/ReservationsManager"));

// Hotel Admin Portal
const HotelLogin = lazy(() => import("@/pages/hotel/HotelLogin"));

// Fleet Portal (Societe)
const FleetLogin = lazy(() => import("@/pages/fleet/FleetLogin"));
const FleetLayout = lazy(() => import("@/pages/fleet/FleetLayout"));
const FleetDashboard = lazy(() => import("@/pages/fleet/FleetDashboard"));
const FleetDrivers = lazy(() => import("@/pages/fleet/FleetDrivers"));
const FleetAddDriver = lazy(() => import("@/pages/fleet/FleetAddDriver"));
const FleetAddVehicle = lazy(() => import("@/pages/fleet/FleetAddVehicle"));
const FleetVehicles = lazy(() => import("@/pages/fleet/FleetVehicles"));
const FleetBookings = lazy(() => import("@/pages/fleet/FleetBookings"));
const FleetMyBookings = lazy(() => import("@/pages/fleet/FleetMyBookings"));
const FleetCreateBooking = lazy(() => import("@/pages/fleet/FleetCreateBooking"));
const FleetPlanning = lazy(() => import("@/pages/fleet/FleetPlanning"));
const FleetGeolocation = lazy(() => import("@/pages/fleet/FleetGeolocation"));
const FleetTrips = lazy(() => import("@/pages/fleet/FleetTrips"));
const FleetProfile = lazy(() => import("@/pages/fleet/FleetProfile"));
const FleetDriverProfile = lazy(() => import("@/pages/fleet/FleetDriverProfile"));

// VTC Service Pages
const VTC8Places = lazy(() => import("@/pages/services/VTC8Places"));
const VTC7Places = lazy(() => import("@/pages/services/VTC7Places"));
const DriverAtDisposal = lazy(() => import("@/pages/services/DriverAtDisposal"));
const DisposalVehicle = lazy(() => import("@/pages/services/DisposalVehicle"));
const HotelLayout = lazy(() => import("@/pages/hotel/HotelLayout"));
const HotelDashboard = lazy(() => import("@/pages/hotel/HotelDashboard"));
const HotelBookings = lazy(() => import("@/pages/hotel/HotelBookings"));
const HotelRevenue = lazy(() => import("@/pages/hotel/HotelRevenue"));
const HotelInvoices = lazy(() => import("@/pages/hotel/HotelInvoices"));

// Driver App
const DriverApp = lazy(() => import("@/pages/driver/DriverApp"));

// GPS Admin Portal
const GpsAdminLogin = lazy(() => import("@/pages/gps-admin/GpsAdminLogin"));
const GpsAdminLayout = lazy(() => import("@/pages/gps-admin/GpsAdminLayout"));
const GpsAdminDashboard = lazy(() => import("@/pages/gps-admin/GpsAdminDashboard"));
const GpsAdminDevices = lazy(() => import("@/pages/gps-admin/GpsAdminDevices"));
const GpsAdminCompanies = lazy(() => import("@/pages/gps-admin/GpsAdminCompanies"));
const GpsAdminMap = lazy(() => import("@/pages/gps-admin/GpsAdminMap"));
const GpsAdminHistory = lazy(() => import("@/pages/gps-admin/GpsAdminHistory"));

const AdminGuard = ({ children }) => {
  const { user, loading } = useAdminAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
};

const HotelGuard = ({ children }) => {
  const { isAuthenticated } = useHotelAuth();
  if (!isAuthenticated) return <Navigate to="/hotel/login" replace />;
  return children;
};

// City Pages (lazy)
const NiceTransfer = lazy(() => import("@/pages/cities/Nice"));
const MonacoTransfer = lazy(() => import("@/pages/cities/Monaco"));
const CannesTransfer = lazy(() => import("@/pages/cities/Cannes"));
const BerlinTransfer = lazy(() => import("@/pages/cities/Berlin"));
const MunichTransfer = lazy(() => import("@/pages/cities/Munich"));
const RomeTransfer = lazy(() => import("@/pages/cities/Rome"));
const MilanTransfer = lazy(() => import("@/pages/cities/Milan"));
const AlicanteTransfer = lazy(() => import("@/pages/cities/Alicante"));
const BarcelonaTransfer = lazy(() => import("@/pages/cities/Barcelona"));
const YerevanTransfer = lazy(() => import("@/pages/cities/Yerevan"));
const CDGTransfer = lazy(() => import("@/pages/cities/CDG"));
const OrlyTransfer = lazy(() => import("@/pages/cities/Orly"));
const BeauvaisTransfer = lazy(() => import("@/pages/cities/Beauvais"));
const ParisTrainStationTransfer = lazy(() => import("@/pages/cities/ParisTrainStation"));
const GareDeLyonTransfer = lazy(() => import("@/pages/cities/GareDeLyon"));
const GareDuNordTransfer = lazy(() => import("@/pages/cities/GareDuNord"));
const GareMontparnasseTransfer = lazy(() => import("@/pages/cities/GareMontparnasse"));
const GareSaintLazareTransfer = lazy(() => import("@/pages/cities/GareSaintLazare"));
const GareAusterlitzTransfer = lazy(() => import("@/pages/cities/GareAusterlitz"));
const DisneylandTransfer = lazy(() => import("@/pages/cities/DisneylandParis"));
const DisneyTransferPage = lazy(() => import("@/components/DisneyTransferPage"));
const MICETransportation = lazy(() => import("@/pages/MICETransportation"));

// B2B Pages (lazy)
const Partners = lazy(() => import("@/pages/Partners"));
const TermsOfUse = lazy(() => import("@/pages/TermsOfUse"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TravelAgencies = lazy(() => import("@/pages/b2b/TravelAgencies"));
const TourismAgencies = lazy(() => import("@/pages/b2b/TourismAgencies"));
const HotelsB2B = lazy(() => import("@/pages/b2b/Hotels"));
const ConciergeServices = lazy(() => import("@/pages/b2b/ConciergeServices"));
const EventAgencies = lazy(() => import("@/pages/b2b/EventAgencies"));
const CorporateClients = lazy(() => import("@/pages/b2b/CorporateClients"));
const BusinessPartners = lazy(() => import("@/pages/b2b/BusinessPartners"));
const TourOperators = lazy(() => import("@/pages/b2b/TourOperators"));

const Loading = () => (
  <div className="min-h-screen bg-[#1a2332] flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-[#2ecc71] border-t-transparent rounded-full animate-spin" role="status" aria-label="Loading"></div>
  </div>
);

// Spanish service pages
const EsMinivan = lazy(() => import("@/pages/es/EsMinivan"));
const EsConductorPrivado = lazy(() => import("@/pages/es/EsConductorPrivado"));
const EsSillaInfantil = lazy(() => import("@/pages/es/EsSillaInfantil"));
const EsHoteles = lazy(() => import("@/pages/es/EsHoteles"));

// Track FB Pixel PageView on route changes
function FbPageViewTracker() {
  const location = useLocation();
  React.useEffect(() => { trackPageView(); }, [location.pathname]);
  return null;
}

// Redirect /blog/* to blog subdomain (preserves sub-path)
function BlogRedirect() {
  React.useEffect(() => {
    const p = window.location.pathname || '';
    const rest = p.replace(/^\/blog\/?/, '');
    window.location.replace('https://blog.zont.cab/' + rest + window.location.search + window.location.hash);
  }, []);
  return null;
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BookingProvider>
          <div className="App">
            <BrowserRouter>
              <ScrollToTop />
              <FbPageViewTracker />
              <SmartAppBanner />
              <Suspense fallback={<Loading />}>
                <Routes>
                  {/* /blog/* — redirect to blog subdomain (handled in index.html for direct loads, and here for SPA navigations) */}
                  <Route path="/blog/*" element={<BlogRedirect />} />
                  <Route path="/blog" element={<BlogRedirect />} />
                  <Route path="/" element={<Home />} />
                  <Route path="/fr" element={<Home />} />
                  <Route path="/ru" element={<Home />} />
                  <Route path="/hy" element={<Home />} />
                  <Route path="/es" element={<ParisAirportTransfer />} />
                  {/* Spanish service pages */}
                  <Route path="/es/minivan-traslado-aeropuerto-paris" element={<EsMinivan />} />
                  <Route path="/es/conductor-privado-paris" element={<EsConductorPrivado />} />
                  <Route path="/es/traslado-aeropuerto-paris-silla-infantil" element={<EsSillaInfantil />} />
                  <Route path="/es/traslados-para-hoteles-paris" element={<EsHoteles />} />
                  {/* Paris */}
                  <Route path="/paris-airport-transfer" element={<ParisAirportTransfer />} />
                  <Route path="/transfert-aeroport-paris" element={<ParisAirportTransfer />} />
                  <Route path="/taksi-iz-aeroporta-parij" element={<ParisAirportTransfer />} />
                  <Route path="/transfer-aeroport-parizh" element={<ParisAirportTransfer />} />
                  <Route path="/pariz-odanavakayani-transfer" element={<ParisAirportTransfer />} />
                  {/* CDG */}
                  <Route path="/cdg-airport-transfer" element={<CDGTransfer />} />
                  <Route path="/transfert-aeroport-cdg" element={<CDGTransfer />} />
                  <Route path="/taksi-iz-aeroporta-cdg" element={<CDGTransfer />} />
                  <Route path="/cdg-odanavakayani-transfer" element={<CDGTransfer />} />
                  <Route path="/es/traslado-aeropuerto-charles-de-gaulle" element={<CDGTransfer />} />
                  {/* Orly */}
                  <Route path="/orly-airport-transfer" element={<OrlyTransfer />} />
                  <Route path="/transfert-aeroport-orly" element={<OrlyTransfer />} />
                  <Route path="/taksi-iz-aeroporta-orli" element={<OrlyTransfer />} />
                  <Route path="/orli-odanavakayani-transfer" element={<OrlyTransfer />} />
                  <Route path="/es/traslado-aeropuerto-orly" element={<OrlyTransfer />} />
                  {/* Beauvais */}
                  <Route path="/beauvais-airport-transfer" element={<BeauvaisTransfer />} />
                  <Route path="/transfert-aeroport-beauvais" element={<BeauvaisTransfer />} />
                  <Route path="/taksi-iz-aeroporta-bove" element={<BeauvaisTransfer />} />
                  <Route path="/bove-odanavakayani-transfer" element={<BeauvaisTransfer />} />
                  <Route path="/es/traslado-aeropuerto-beauvais" element={<BeauvaisTransfer />} />
                  {/* Paris Train Station */}
                  <Route path="/paris-train-station-transfer" element={<ParisTrainStationTransfer />} />
                  <Route path="/transfert-gare-paris" element={<ParisTrainStationTransfer />} />
                  <Route path="/transfer-vokzal-parizh" element={<ParisTrainStationTransfer />} />
                  <Route path="/pariz-kayarani-transfer" element={<ParisTrainStationTransfer />} />
                  <Route path="/es/traslado-estaciones-tren-paris" element={<ParisTrainStationTransfer />} />
                  {/* Individual Train Stations */}
                  <Route path="/gare-de-lyon-transfer" element={<GareDeLyonTransfer />} />
                  <Route path="/transfert-gare-de-lyon" element={<GareDeLyonTransfer />} />
                  <Route path="/transfer-gar-de-lion" element={<GareDeLyonTransfer />} />
                  <Route path="/gar-de-lion-transfer" element={<GareDeLyonTransfer />} />
                  <Route path="/gare-du-nord-transfer" element={<GareDuNordTransfer />} />
                  <Route path="/transfert-gare-du-nord" element={<GareDuNordTransfer />} />
                  <Route path="/transfer-gar-dyu-nor" element={<GareDuNordTransfer />} />
                  <Route path="/gar-dyu-nor-transfer" element={<GareDuNordTransfer />} />
                  <Route path="/gare-montparnasse-transfer" element={<GareMontparnasseTransfer />} />
                  <Route path="/transfert-gare-montparnasse" element={<GareMontparnasseTransfer />} />
                  <Route path="/transfer-gar-monparnas" element={<GareMontparnasseTransfer />} />
                  <Route path="/gar-monparnas-transfer" element={<GareMontparnasseTransfer />} />
                  <Route path="/gare-saint-lazare-transfer" element={<GareSaintLazareTransfer />} />
                  <Route path="/transfert-gare-saint-lazare" element={<GareSaintLazareTransfer />} />
                  <Route path="/transfer-gar-sen-lazar" element={<GareSaintLazareTransfer />} />
                  <Route path="/gar-sen-lazar-transfer" element={<GareSaintLazareTransfer />} />
                  <Route path="/gare-austerlitz-transfer" element={<GareAusterlitzTransfer />} />
                  <Route path="/transfert-gare-austerlitz" element={<GareAusterlitzTransfer />} />
                  <Route path="/transfer-gar-osterlits" element={<GareAusterlitzTransfer />} />
                  <Route path="/gar-osterlits-transfer" element={<GareAusterlitzTransfer />} />
                  {/* Disneyland Paris */}
                  <Route path="/disneyland-paris-transfer" element={<DisneylandTransfer />} />
                  <Route path="/transfert-disneyland-paris" element={<DisneylandTransfer />} />
                  <Route path="/transfer-disneylend-parizh" element={<DisneylandTransfer />} />
                  <Route path="/transfer-disneyland-parizh" element={<DisneylandTransfer />} />
                  <Route path="/disneylend-pariz-transfer" element={<DisneylandTransfer />} />
                  <Route path="/es/traslado-disneyland-paris" element={<DisneylandTransfer />} />
                  {/* Disneyland Paris — Route SEO sub-pages */}
                  <Route path="/cdg-to-disneyland-paris-transfer" element={<DisneyTransferPage routeSlug="cdg-to-disneyland-paris-transfer" />} />
                  <Route path="/orly-to-disneyland-paris-transfer" element={<DisneyTransferPage routeSlug="orly-to-disneyland-paris-transfer" />} />
                  <Route path="/beauvais-to-disneyland-paris-transfer" element={<DisneyTransferPage routeSlug="beauvais-to-disneyland-paris-transfer" />} />
                  <Route path="/paris-to-disneyland-paris-transfer" element={<DisneyTransferPage routeSlug="paris-to-disneyland-paris-transfer" />} />
                  <Route path="/disneyland-paris-to-cdg-airport-transfer" element={<DisneyTransferPage routeSlug="disneyland-paris-to-cdg-airport-transfer" />} />
                  <Route path="/disneyland-paris-to-orly-airport-transfer" element={<DisneyTransferPage routeSlug="disneyland-paris-to-orly-airport-transfer" />} />
                  {/* Disneyland Paris — Official Disney Hotels */}
                  <Route path="/disneyland-hotel-transfer" element={<DisneyTransferPage hotelSlug="disneyland-hotel-transfer" />} />
                  <Route path="/disney-hotel-new-york-art-of-marvel-transfer" element={<DisneyTransferPage hotelSlug="disney-hotel-new-york-art-of-marvel-transfer" />} />
                  <Route path="/disney-newport-bay-club-transfer" element={<DisneyTransferPage hotelSlug="disney-newport-bay-club-transfer" />} />
                  <Route path="/disney-sequoia-lodge-transfer" element={<DisneyTransferPage hotelSlug="disney-sequoia-lodge-transfer" />} />
                  <Route path="/disney-hotel-cheyenne-transfer" element={<DisneyTransferPage hotelSlug="disney-hotel-cheyenne-transfer" />} />
                  <Route path="/disney-hotel-santa-fe-transfer" element={<DisneyTransferPage hotelSlug="disney-hotel-santa-fe-transfer" />} />
                  <Route path="/disney-davy-crockett-ranch-transfer" element={<DisneyTransferPage hotelSlug="disney-davy-crockett-ranch-transfer" />} />
                  {/* Disneyland Paris — Partner Hotels */}
                  <Route path="/hotel-elysee-val-d-europe-transfer" element={<DisneyTransferPage hotelSlug="hotel-elysee-val-d-europe-transfer" />} />
                  <Route path="/staycity-aparthotels-disneyland-paris-transfer" element={<DisneyTransferPage hotelSlug="staycity-aparthotels-disneyland-paris-transfer" />} />
                  <Route path="/ki-space-hotel-spa-transfer" element={<DisneyTransferPage hotelSlug="ki-space-hotel-spa-transfer" />} />
                  <Route path="/bb-hotel-disneyland-paris-transfer" element={<DisneyTransferPage hotelSlug="bb-hotel-disneyland-paris-transfer" />} />
                  <Route path="/adagio-val-d-europe-transfer" element={<DisneyTransferPage hotelSlug="adagio-val-d-europe-transfer" />} />
                  <Route path="/explorers-hotel-disneyland-paris-transfer" element={<DisneyTransferPage hotelSlug="explorers-hotel-disneyland-paris-transfer" />} />
                  <Route path="/campanile-val-de-france-transfer" element={<DisneyTransferPage hotelSlug="campanile-val-de-france-transfer" />} />
                  <Route path="/dream-castle-hotel-transfer" element={<DisneyTransferPage hotelSlug="dream-castle-hotel-transfer" />} />
                  <Route path="/grand-magic-hotel-transfer" element={<DisneyTransferPage hotelSlug="grand-magic-hotel-transfer" />} />
                  <Route path="/villages-nature-paris-transfer" element={<DisneyTransferPage hotelSlug="villages-nature-paris-transfer" />} />

                  {/* MICE Transportation Paris — Multi-language */}
                  <Route path="/mice-transportation-paris" element={<MICETransportation />} />
                  <Route path="/transport-mice-paris" element={<MICETransportation />} />
                  <Route path="/mice-transport-parij" element={<MICETransportation />} />
                  {/* Nice */}
                  <Route path="/nice-airport-transfer" element={<NiceTransfer />} />
                  <Route path="/transfert-aeroport-nice" element={<NiceTransfer />} />
                  <Route path="/taksi-iz-aeroporta-nitstsa" element={<NiceTransfer />} />
                  <Route path="/nis-odanavakayani-transfer" element={<NiceTransfer />} />
                  {/* Monaco */}
                  <Route path="/monaco-airport-transfer" element={<MonacoTransfer />} />
                  <Route path="/transfert-aeroport-monaco" element={<MonacoTransfer />} />
                  <Route path="/taksi-iz-aeroporta-monako" element={<MonacoTransfer />} />
                  <Route path="/monako-odanavakayani-transfer" element={<MonacoTransfer />} />
                  {/* Cannes */}
                  <Route path="/cannes-airport-transfer" element={<CannesTransfer />} />
                  <Route path="/transfert-aeroport-cannes" element={<CannesTransfer />} />
                  <Route path="/taksi-iz-aeroporta-kanny" element={<CannesTransfer />} />
                  <Route path="/kann-odanavakayani-transfer" element={<CannesTransfer />} />
                  {/* Berlin */}
                  <Route path="/berlin-airport-transfer" element={<BerlinTransfer />} />
                  <Route path="/transfert-aeroport-berlin" element={<BerlinTransfer />} />
                  <Route path="/taksi-iz-aeroporta-berlin" element={<BerlinTransfer />} />
                  <Route path="/berlin-odanavakayani-transfer" element={<BerlinTransfer />} />
                  {/* Munich */}
                  <Route path="/munich-airport-transfer" element={<MunichTransfer />} />
                  <Route path="/transfert-aeroport-munich" element={<MunichTransfer />} />
                  <Route path="/taksi-iz-aeroporta-munhen" element={<MunichTransfer />} />
                  <Route path="/myunkhen-odanavakayani-transfer" element={<MunichTransfer />} />
                  {/* Rome */}
                  <Route path="/rome-airport-transfer" element={<RomeTransfer />} />
                  <Route path="/transfert-aeroport-rome" element={<RomeTransfer />} />
                  <Route path="/taksi-iz-aeroporta-rim" element={<RomeTransfer />} />
                  <Route path="/hrom-odanavakayani-transfer" element={<RomeTransfer />} />
                  {/* Milan */}
                  <Route path="/milan-airport-transfer" element={<MilanTransfer />} />
                  <Route path="/transfert-aeroport-milan" element={<MilanTransfer />} />
                  <Route path="/taksi-iz-aeroporta-milan" element={<MilanTransfer />} />
                  <Route path="/milan-odanavakayani-transfer" element={<MilanTransfer />} />
                  {/* Alicante */}
                  <Route path="/alicante-airport-transfer" element={<AlicanteTransfer />} />
                  <Route path="/transfert-aeroport-alicante" element={<AlicanteTransfer />} />
                  <Route path="/taksi-iz-aeroporta-alikante" element={<AlicanteTransfer />} />
                  <Route path="/alikante-odanavakayani-transfer" element={<AlicanteTransfer />} />
                  {/* Barcelona */}
                  <Route path="/barcelona-airport-transfer" element={<BarcelonaTransfer />} />
                  <Route path="/transfert-aeroport-barcelone" element={<BarcelonaTransfer />} />
                  <Route path="/taksi-iz-aeroporta-barselona" element={<BarcelonaTransfer />} />
                  <Route path="/barselona-odanavakayani-transfer" element={<BarcelonaTransfer />} />
                  {/* Yerevan */}
                  <Route path="/yerevan-airport-transfer" element={<YerevanTransfer />} />
                  <Route path="/transfert-aeroport-erevan" element={<YerevanTransfer />} />
                  <Route path="/taksi-iz-aeroporta-erevan" element={<YerevanTransfer />} />
                  <Route path="/erevan-odanavakayani-transfer" element={<YerevanTransfer />} />
                  {/* General pages */}
                  <Route path="/car-selection" element={<CarSelection />} />
                  <Route path="/trip-recap" element={<TripRecap />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/my-bookings" element={<MyBookings />} />
                  <Route path="/my-account" element={<MyAccount />} />
                  <Route path="/booking-confirmation" element={<BookingConfirmation />} />
                  <Route path="/kiosk/:slug" element={<KioskPage />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/review" element={<ReviewForm />} />
                  <Route path="/avis" element={<ReviewForm />} />
                  <Route path="/forgetpassword/:token" element={<ResetPassword />} />
                  <Route path="/looking-for-partners" element={<LookingForPartners />} />
                  <Route path="/become-driver" element={<BecomeDriver />} />
                  <Route path="/become-client" element={<BecomeClient />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/countries" element={<Countries />} />
                  {/* B2B Pages */}
                  <Route path="/partners" element={<Partners />} />
                  <Route path="/b2b-airport-transfers" element={<Partners />} />
                  <Route path="/b2b-transferts-aeroport" element={<Partners />} />
                  <Route path="/b2b-transfery-iz-aeroporta" element={<Partners />} />
                  <Route path="/b2b-odanavakayani-transfer" element={<Partners />} />
                  <Route path="/terms" element={<TermsOfUse />} />
                  <Route path="/cgv" element={<TermsOfUse />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  {/* VTC Service Pages */}
                  <Route path="/vtc-8-places" element={<VTC8Places />} />
                  <Route path="/vtc-8-seats" element={<VTC8Places />} />
                  <Route path="/vtc-8-mest" element={<VTC8Places />} />
                  <Route path="/vtc-8-tegh" element={<VTC8Places />} />
                  <Route path="/vtc-7-places" element={<VTC7Places />} />
                  <Route path="/vtc-7-seats" element={<VTC7Places />} />
                  <Route path="/vtc-7-mest" element={<VTC7Places />} />
                  <Route path="/vtc-7-tegh" element={<VTC7Places />} />
                  {/* Driver at Disposal — Mise a disposition */}
                  <Route path="/driver-at-disposal" element={<DriverAtDisposal />} />
                  <Route path="/chauffeur-mis-a-disposition" element={<DriverAtDisposal />} />
                  <Route path="/voditel-s-avtomobilem" element={<DriverAtDisposal />} />
                  <Route path="/varorde-tramadrutyamb" element={<DriverAtDisposal />} />
                  <Route path="/driver-at-disposal/:slug" element={<DisposalVehicle />} />
                  <Route path="/chauffeur-mis-a-disposition/:slug" element={<DisposalVehicle />} />
                  <Route path="/voditel-s-avtomobilem/:slug" element={<DisposalVehicle />} />
                  <Route path="/varorde-tramadrutyamb/:slug" element={<DisposalVehicle />} />
                  <Route path="/travel-agencies" element={<TravelAgencies />} />
                  <Route path="/tourism-agencies" element={<TourismAgencies />} />
                  <Route path="/hotels" element={<HotelsB2B />} />
                  <Route path="/hotel-booking-kiosk" element={<HotelsB2B />} />
                  <Route path="/borne-reservation-hotel" element={<HotelsB2B />} />
                  <Route path="/terminal-bronirovaniya-otel" element={<HotelsB2B />} />
                  <Route path="/hyuranots-kropak" element={<HotelsB2B />} />
                  <Route path="/concierge-services" element={<ConciergeServices />} />
                  <Route path="/event-agencies" element={<EventAgencies />} />
                  <Route path="/corporate-clients" element={<CorporateClients />} />
                  <Route path="/business-partners" element={<BusinessPartners />} />
                  <Route path="/tour-operators" element={<TourOperators />} />
                  {/* Admin Panel */}
                  <Route path="/admin/login" element={<AdminAuthProvider><AdminLogin /></AdminAuthProvider>} />
                  <Route path="/admin" element={<AdminAuthProvider><AdminGuard><AdminLayout /></AdminGuard></AdminAuthProvider>}>
                    <Route index element={<Dashboard />} />
                    <Route path="pages" element={<PagesManager />} />
                    <Route path="places" element={<PlacesManager />} />
                    <Route path="homepage" element={<HomepageEditor />} />
                    <Route path="trust-blocks" element={<TrustBlocks />} />
                    <Route path="faqs" element={<FaqManager />} />
                    <Route path="seo" element={<SeoOverview />} />
                    <Route path="partners" element={<PartnersManager />} />
                    <Route path="rides" element={<RidesManager />} />
                    <Route path="hotels-dashboard" element={<HotelsDashboard />} />
                    <Route path="hotels" element={<HotelsManager />} />
                    <Route path="hotel-kiosks" element={<KiosksManager />} />
                    <Route path="hotel-bookings" element={<HotelBookingsManager />} />
                    <Route path="hotel-payments" element={<HotelPayments />} />
                    <Route path="promo-emails" element={<PromoEmails />} />
                    <Route path="reviews" element={<ReviewsManager />} />
                    <Route path="leads" element={<LeadsManager />} />
                    <Route path="reservations" element={<ReservationsManager />} />
                  </Route>
                  {/* Driver PWA */}
                  <Route path="/driver/*" element={<DriverApp />} />
                  {/* Hotel Admin Portal */}
                  <Route path="/hotel/login" element={<HotelAuthProvider><HotelLogin /></HotelAuthProvider>} />
                  <Route path="/hotel" element={<HotelAuthProvider><HotelGuard><HotelLayout /></HotelGuard></HotelAuthProvider>}>
                    <Route index element={<HotelDashboard />} />
                    <Route path="bookings" element={<HotelBookings />} />
                    <Route path="revenue" element={<HotelRevenue />} />
                    <Route path="invoices" element={<HotelInvoices />} />
                  </Route>
                  {/* Fleet Portal (Societe) */}
                  <Route path="/fleet/login" element={<FleetAuthProvider><FleetLogin /></FleetAuthProvider>} />
                  <Route path="/fleet" element={<FleetAuthProvider><FleetLayout /></FleetAuthProvider>}>
                    <Route index element={<FleetDashboard />} />
                    <Route path="drivers" element={<FleetDrivers />} />
                    <Route path="drivers/add" element={<FleetAddDriver />} />
                    <Route path="drivers/:driverId" element={<FleetDriverProfile />} />
                    <Route path="vehicles" element={<FleetVehicles />} />
                    <Route path="vehicles/add" element={<FleetAddVehicle />} />
                    <Route path="bookings" element={<FleetBookings />} />
                    <Route path="my-bookings" element={<FleetMyBookings />} />
                    <Route path="my-bookings/new" element={<FleetCreateBooking />} />
                    <Route path="planning" element={<FleetPlanning />} />
                    <Route path="geolocation" element={<FleetGeolocation />} />
                    <Route path="trips" element={<FleetTrips />} />
                    <Route path="profile" element={<FleetProfile />} />
                  </Route>
                  {/* GPS Admin Portal */}
                  <Route path="/gps-admin/login" element={<GpsAdminProvider><GpsAdminLogin /></GpsAdminProvider>} />
                  <Route path="/gps-admin" element={<GpsAdminProvider><GpsAdminLayout /></GpsAdminProvider>}>
                    <Route index element={<Navigate to="/gps-admin/dashboard" replace />} />
                    <Route path="dashboard" element={<GpsAdminDashboard />} />
                    <Route path="devices" element={<GpsAdminDevices />} />
                    <Route path="companies" element={<GpsAdminCompanies />} />
                    <Route path="map" element={<GpsAdminMap />} />
                    <Route path="history" element={<GpsAdminHistory />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
            <Toaster />
          </div>
        </BookingProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
