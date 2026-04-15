import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext();
const STORAGE_KEY = 'zont_booking';

const load = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};

const save = (data) => {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const cached = load();
  const [searchData, setSearchData] = useState(cached.searchData || null);
  const [selectedCar, setSelectedCar] = useState(cached.selectedCar || null);
  const [bookingDetails, setBookingDetails] = useState(cached.bookingDetails || null);
  const [vehicleResults, setVehicleResults] = useState(cached.vehicleResults || null);

  const persist = (patch) => {
    const next = {
      searchData: patch.searchData !== undefined ? patch.searchData : searchData,
      selectedCar: patch.selectedCar !== undefined ? patch.selectedCar : selectedCar,
      bookingDetails: patch.bookingDetails !== undefined ? patch.bookingDetails : bookingDetails,
      vehicleResults: patch.vehicleResults !== undefined ? patch.vehicleResults : vehicleResults,
    };
    save(next);
  };

  const startBooking = (data) => {
    setSearchData(data);
    persist({ searchData: data });
  };

  const selectCar = (car) => {
    setSelectedCar(car);
    persist({ selectedCar: car });
  };

  const completeBooking = (details) => {
    setBookingDetails(details);
    persist({ bookingDetails: details });
  };

  const setVehicleResultsWrapped = (results) => {
    setVehicleResults(results);
    persist({ vehicleResults: results });
  };

  const resetBooking = () => {
    setSearchData(null);
    setSelectedCar(null);
    setBookingDetails(null);
    setVehicleResults(null);
    try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
  };

  const value = {
    searchData,
    selectedCar,
    bookingDetails,
    vehicleResults,
    startBooking,
    selectCar,
    completeBooking,
    resetBooking,
    setVehicleResults: setVehicleResultsWrapped,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};
