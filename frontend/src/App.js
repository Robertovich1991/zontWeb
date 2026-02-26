import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";

// Pages
import Home from "@/pages/Home";
import BecomeDriver from "@/pages/BecomeDriver";
import BecomeClient from "@/pages/BecomeClient";
import Help from "@/pages/Help";
import Countries from "@/pages/Countries";

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
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
    </AuthProvider>
  );
}

export default App;
