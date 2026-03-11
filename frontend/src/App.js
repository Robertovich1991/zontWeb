import React, { Suspense, lazy } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { BookingProvider } from "@/context/BookingContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { Toaster } from "@/components/ui/sonner";

// Core pages (eager load)
import Home from "@/pages/Home";

// Lazy loaded pages
const BecomeDriver = lazy(() => import("@/pages/BecomeDriver"));
const BecomeClient = lazy(() => import("@/pages/BecomeClient"));
const Help = lazy(() => import("@/pages/Help"));
const Countries = lazy(() => import("@/pages/Countries"));
const CarSelection = lazy(() => import("@/pages/CarSelection"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const BookingConfirmation = lazy(() => import("@/pages/BookingConfirmation"));
const LookingForPartners = lazy(() => import("@/pages/LookingForPartners"));
const ParisAirportTransfer = lazy(() => import("@/pages/ParisAirportTransfer"));

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
                  <Route path="/booking-confirmation" element={<BookingConfirmation />} />
                  <Route path="/looking-for-partners" element={<LookingForPartners />} />
                  <Route path="/become-driver" element={<BecomeDriver />} />
                  <Route path="/become-client" element={<BecomeClient />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/countries" element={<Countries />} />
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
