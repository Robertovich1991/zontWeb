import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext();

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const [searchData, setSearchData] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);

  const startBooking = (data) => {
    setSearchData(data);
  };

  const selectCar = (car) => {
    setSelectedCar(car);
  };

  const completeBooking = (details) => {
    setBookingDetails(details);
  };

  const resetBooking = () => {
    setSearchData(null);
    setSelectedCar(null);
    setBookingDetails(null);
  };

  const value = {
    searchData,
    selectedCar,
    bookingDetails,
    startBooking,
    selectCar,
    completeBooking,
    resetBooking,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};
