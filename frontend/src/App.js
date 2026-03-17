import React, { Suspense, lazy } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { BookingProvider } from "@/context/BookingContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { Toaster } from "@/components/ui/sonner";
import { AdminAuthProvider, useAdminAuth } from "@/pages/admin/AdminAuthContext";
import { HotelAuthProvider, useHotelAuth } from "@/pages/hotel/HotelAuthContext";

// Core pages (eager load)
import Home from "@/pages/Home";

// Lazy loaded pages
const BecomeDriver = lazy(() => import("@/pages/BecomeDriver"));
const BecomeClient = lazy(() => import("@/pages/BecomeClient"));
const Help = lazy(() => import("@/pages/Help"));
const Countries = lazy(() => import("@/pages/Countries"));
const CarSelection = lazy(() => import("@/pages/CarSelection"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const MyBookings = lazy(() => import("@/pages/MyBookings"));
const MyAccount = lazy(() => import("@/pages/MyAccount"));
const BookingConfirmation = lazy(() => import("@/pages/BookingConfirmation"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));

// Redirect component for C# API's forgot password link format
const ForgetPasswordRedirect = lazy(() => import("@/pages/ResetPassword"));
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

// Hotel Admin Portal
const HotelLogin = lazy(() => import("@/pages/hotel/HotelLogin"));

// VTC Service Pages
const VTC8Places = lazy(() => import("@/pages/services/VTC8Places"));
const VTC7Places = lazy(() => import("@/pages/services/VTC7Places"));
const HotelLayout = lazy(() => import("@/pages/hotel/HotelLayout"));
const HotelDashboard = lazy(() => import("@/pages/hotel/HotelDashboard"));
const HotelBookings = lazy(() => import("@/pages/hotel/HotelBookings"));
const HotelRevenue = lazy(() => import("@/pages/hotel/HotelRevenue"));
const HotelInvoices = lazy(() => import("@/pages/hotel/HotelInvoices"));

// Driver App
const DriverApp = lazy(() => import("@/pages/driver/DriverApp"));

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

// B2B Pages (lazy)
const Partners = lazy(() => import("@/pages/Partners"));
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

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BookingProvider>
          <div className="App">
            <BrowserRouter>
              <Suspense fallback={<Loading />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  {/* Paris */}
                  <Route path="/paris-airport-transfer" element={<ParisAirportTransfer />} />
                  <Route path="/transfert-aeroport-paris" element={<ParisAirportTransfer />} />
                  <Route path="/taksi-iz-aeroporta-parij" element={<ParisAirportTransfer />} />
                  {/* CDG */}
                  <Route path="/cdg-airport-transfer" element={<CDGTransfer />} />
                  <Route path="/transfert-aeroport-cdg" element={<CDGTransfer />} />
                  <Route path="/taksi-iz-aeroporta-cdg" element={<CDGTransfer />} />
                  {/* Orly */}
                  <Route path="/orly-airport-transfer" element={<OrlyTransfer />} />
                  <Route path="/transfert-aeroport-orly" element={<OrlyTransfer />} />
                  <Route path="/taksi-iz-aeroporta-orli" element={<OrlyTransfer />} />
                  {/* Beauvais */}
                  <Route path="/beauvais-airport-transfer" element={<BeauvaisTransfer />} />
                  <Route path="/transfert-aeroport-beauvais" element={<BeauvaisTransfer />} />
                  <Route path="/taksi-iz-aeroporta-bove" element={<BeauvaisTransfer />} />
                  {/* Paris Train Station */}
                  <Route path="/paris-train-station-transfer" element={<ParisTrainStationTransfer />} />
                  <Route path="/transfert-gare-paris" element={<ParisTrainStationTransfer />} />
                  <Route path="/transfer-vokzal-parizh" element={<ParisTrainStationTransfer />} />
                  {/* Nice */}
                  <Route path="/nice-airport-transfer" element={<NiceTransfer />} />
                  <Route path="/transfert-aeroport-nice" element={<NiceTransfer />} />
                  <Route path="/taksi-iz-aeroporta-nitstsa" element={<NiceTransfer />} />
                  {/* Monaco */}
                  <Route path="/monaco-airport-transfer" element={<MonacoTransfer />} />
                  <Route path="/transfert-aeroport-monaco" element={<MonacoTransfer />} />
                  <Route path="/taksi-iz-aeroporta-monako" element={<MonacoTransfer />} />
                  {/* Cannes */}
                  <Route path="/cannes-airport-transfer" element={<CannesTransfer />} />
                  <Route path="/transfert-aeroport-cannes" element={<CannesTransfer />} />
                  <Route path="/taksi-iz-aeroporta-kanny" element={<CannesTransfer />} />
                  {/* Berlin */}
                  <Route path="/berlin-airport-transfer" element={<BerlinTransfer />} />
                  <Route path="/transfert-aeroport-berlin" element={<BerlinTransfer />} />
                  <Route path="/taksi-iz-aeroporta-berlin" element={<BerlinTransfer />} />
                  {/* Munich */}
                  <Route path="/munich-airport-transfer" element={<MunichTransfer />} />
                  <Route path="/transfert-aeroport-munich" element={<MunichTransfer />} />
                  <Route path="/taksi-iz-aeroporta-munhen" element={<MunichTransfer />} />
                  {/* Rome */}
                  <Route path="/rome-airport-transfer" element={<RomeTransfer />} />
                  <Route path="/transfert-aeroport-rome" element={<RomeTransfer />} />
                  <Route path="/taksi-iz-aeroporta-rim" element={<RomeTransfer />} />
                  {/* Milan */}
                  <Route path="/milan-airport-transfer" element={<MilanTransfer />} />
                  <Route path="/transfert-aeroport-milan" element={<MilanTransfer />} />
                  <Route path="/taksi-iz-aeroporta-milan" element={<MilanTransfer />} />
                  {/* Alicante */}
                  <Route path="/alicante-airport-transfer" element={<AlicanteTransfer />} />
                  <Route path="/transfert-aeroport-alicante" element={<AlicanteTransfer />} />
                  <Route path="/taksi-iz-aeroporta-alikante" element={<AlicanteTransfer />} />
                  {/* Barcelona */}
                  <Route path="/barcelona-airport-transfer" element={<BarcelonaTransfer />} />
                  <Route path="/transfert-aeroport-barcelone" element={<BarcelonaTransfer />} />
                  <Route path="/taksi-iz-aeroporta-barselona" element={<BarcelonaTransfer />} />
                  {/* Yerevan */}
                  <Route path="/yerevan-airport-transfer" element={<YerevanTransfer />} />
                  <Route path="/transfert-aeroport-erevan" element={<YerevanTransfer />} />
                  <Route path="/taksi-iz-aeroporta-erevan" element={<YerevanTransfer />} />
                  {/* General pages */}
                  <Route path="/car-selection" element={<CarSelection />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/my-bookings" element={<MyBookings />} />
                  <Route path="/my-account" element={<MyAccount />} />
                  <Route path="/booking-confirmation" element={<BookingConfirmation />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/forgetpassword/:token" element={<ResetPassword />} />
                  <Route path="/looking-for-partners" element={<LookingForPartners />} />
                  <Route path="/become-driver" element={<BecomeDriver />} />
                  <Route path="/become-client" element={<BecomeClient />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/countries" element={<Countries />} />
                  {/* B2B Pages */}
                  <Route path="/partners" element={<Partners />} />
                  {/* VTC Service Pages */}
                  <Route path="/vtc-8-places" element={<VTC8Places />} />
                  <Route path="/vtc-8-seats" element={<VTC8Places />} />
                  <Route path="/vtc-8-mest" element={<VTC8Places />} />
                  <Route path="/vtc-7-places" element={<VTC7Places />} />
                  <Route path="/vtc-7-seats" element={<VTC7Places />} />
                  <Route path="/vtc-7-mest" element={<VTC7Places />} />
                  <Route path="/travel-agencies" element={<TravelAgencies />} />
                  <Route path="/tourism-agencies" element={<TourismAgencies />} />
                  <Route path="/hotels" element={<HotelsB2B />} />
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
