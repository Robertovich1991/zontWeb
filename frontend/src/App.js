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

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BookingProvider>
          <div className="App">
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/paris-airport-transfer" element={<ParisAirportTransfer />} />
                <Route path="/transfert-aeroport-paris" element={<ParisAirportTransfer />} />
                <Route path="/taksi-iz-aeroporta-parij" element={<ParisAirportTransfer />} />
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
