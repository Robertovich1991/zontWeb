import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { BookingProvider } from "@/context/BookingContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { Toaster } from "@/components/ui/sonner";

// Pages
import Home from "@/pages/Home";
import BecomeDriver from "@/pages/BecomeDriver";
import BecomeClient from "@/pages/BecomeClient";
import Help from "@/pages/Help";
import Countries from "@/pages/Countries";
import CarSelection from "@/pages/CarSelection";
import Checkout from "@/pages/Checkout";
import BookingConfirmation from "@/pages/BookingConfirmation";
import LookingForPartners from "@/pages/LookingForPartners";
import ParisAirportTransfer from "@/pages/ParisAirportTransfer";

// City Pages
import NiceTransfer from "@/pages/cities/Nice";
import MonacoTransfer from "@/pages/cities/Monaco";
import CannesTransfer from "@/pages/cities/Cannes";
import BerlinTransfer from "@/pages/cities/Berlin";
import MunichTransfer from "@/pages/cities/Munich";
import RomeTransfer from "@/pages/cities/Rome";
import MilanTransfer from "@/pages/cities/Milan";
import AlicanteTransfer from "@/pages/cities/Alicante";
import BarcelonaTransfer from "@/pages/cities/Barcelona";
import YerevanTransfer from "@/pages/cities/Yerevan";
import CDGTransfer from "@/pages/cities/CDG";
import OrlyTransfer from "@/pages/cities/Orly";
import BeauvaisTransfer from "@/pages/cities/Beauvais";
import ParisTrainStationTransfer from "@/pages/cities/ParisTrainStation";

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BookingProvider>
          <div className="App">
            <BrowserRouter>
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
                <Route path="/how-it-works" element={<BecomeClient />} />
                <Route path="/hotels-b2b-tours-operators" element={<Help />} />
              </Routes>
            </BrowserRouter>
            <Toaster />
          </div>
        </BookingProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
