import React, { useRef, useEffect, useCallback } from 'react';

// Dynamic Google Maps loader — loads the script only once, on demand
let googleMapsPromise = null;
function loadGoogleMaps() {
  if (window.google?.maps?.places) return Promise.resolve();
  if (googleMapsPromise) return googleMapsPromise;
  googleMapsPromise = new Promise((resolve, reject) => {
    const key = process.env.REACT_APP_GOOGLE_MAPS_KEY;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return googleMapsPromise;
}

// Export for use in geocodeAddress (Home.js, CityTransferPage.js)
export { loadGoogleMaps };

const PlacesAutocomplete = ({ value, onChange, placeholder, className, id, icon, ...props }) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  const handlePlaceSelect = useCallback(() => {
    const place = autocompleteRef.current?.getPlace();
    if (!place || !place.geometry) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    const address = place.formatted_address || place.name || '';

    onChange({ address, latitude: lat, longitude: lng, placeId: place.place_id });
  }, [onChange]);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps().then(() => {
      if (cancelled || !inputRef.current || autocompleteRef.current) return;
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['establishment', 'geocode'],
        fields: ['formatted_address', 'geometry', 'name', 'place_id'],
      });
      autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
    });

    return () => {
      cancelled = true;
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [handlePlaceSelect]);

  // Sync external value changes to the uncontrolled input
  useEffect(() => {
    const addr = typeof value === 'string' ? value : value?.address || '';
    if (inputRef.current && addr && inputRef.current.value !== addr) {
      inputRef.current.value = addr;
    }
  }, [value]);

  const handleInputChange = () => {
    // When user types manually, clear coordinates
    onChange({ address: inputRef.current?.value || '', latitude: null, longitude: null, placeId: null });
  };

  return (
    <div className="relative">
      {icon && <div className="absolute left-3 top-3 pointer-events-none z-10">{icon}</div>}
      <input
        ref={inputRef}
        type="text"
        id={id}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
        data-testid={props['data-testid']}
      />
    </div>
  );
};

export default PlacesAutocomplete;
