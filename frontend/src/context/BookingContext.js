import React, { createContext, useContext, useState, useRef, useCallback } from 'react';

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

  // Use refs to avoid stale closures in persist
  const ref = useRef({ searchData, selectedCar, bookingDetails, vehicleResults });
  ref.current = { searchData, selectedCar, bookingDetails, vehicleResults };

  const persist = useCallback((patch) => {
    const cur = ref.current;
    save({
      searchData: patch.searchData !== undefined ? patch.searchData : cur.searchData,
      selectedCar: patch.selectedCar !== undefined ? patch.selectedCar : cur.selectedCar,
      bookingDetails: patch.bookingDetails !== undefined ? patch.bookingDetails : cur.bookingDetails,
      vehicleResults: patch.vehicleResults !== undefined ? patch.vehicleResults : cur.vehicleResults,
    });
  }, []);

  const startBooking = useCallback((data) => {
    setSearchData(data);
    persist({ searchData: data });
  }, [persist]);

  const selectCar = useCallback((car) => {
    setSelectedCar(car);
    persist({ selectedCar: car });
  }, [persist]);

  const completeBooking = useCallback((details) => {
    setBookingDetails(details);
    persist({ bookingDetails: details });
  }, [persist]);

  const setVehicleResultsWrapped = useCallback((results) => {
    setVehicleResults(results);
    persist({ vehicleResults: results });
  }, [persist]);

  const resetBooking = useCallback(() => {
    setSearchData(null);
    setSelectedCar(null);
    setBookingDetails(null);
    setVehicleResults(null);
    try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

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
