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
  const justSelectedRef = useRef(false);
  const lastSelectedAddrRef = useRef('');
  const hasValidCoordsRef = useRef(false);

  const handlePlaceSelect = useCallback(() => {
    const place = autocompleteRef.current?.getPlace();
    if (!place) return;

    justSelectedRef.current = true;

    const address = place.formatted_address || place.name || inputRef.current?.value || '';
    lastSelectedAddrRef.current = address;

    if (place.geometry) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      hasValidCoordsRef.current = true;
      onChange({ address, latitude: lat, longitude: lng, placeId: place.place_id });
    } else {
      hasValidCoordsRef.current = false;
      onChange({ address, latitude: null, longitude: null, placeId: place.place_id || null });
    }

    // Extended timeout for slow mobile browsers (keyboard dismiss, dropdown animation)
    setTimeout(() => { justSelectedRef.current = false; }, 3000);
  }, [onChange]);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps().then(() => {
      if (cancelled || !inputRef.current || autocompleteRef.current) return;
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
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
    // Guard 1: Timeout-based flag (blocks onChange within 3s of autocomplete selection)
    if (justSelectedRef.current) return;

    const currentValue = inputRef.current?.value || '';

    // Guard 2: Fuzzy match — if first 15 chars match the last autocomplete selection,
    // this is a delayed mobile browser event (keyboard dismiss, auto-formatting), not real typing
    if (lastSelectedAddrRef.current && currentValue.length > 5) {
      const selPrefix = lastSelectedAddrRef.current.substring(0, 15).toLowerCase();
      const curPrefix = currentValue.substring(0, 15).toLowerCase();
      if (selPrefix === curPrefix) return;
    }

    // Guard 3: If coords were recently set and user hasn't typed enough to be "different",
    // don't clear. Only clear if user removed 5+ chars (genuine editing)
    if (hasValidCoordsRef.current && lastSelectedAddrRef.current) {
      const lenDiff = Math.abs(currentValue.length - lastSelectedAddrRef.current.length);
      if (lenDiff < 5) return;
    }

    // User is genuinely typing something new — clear coordinates
    lastSelectedAddrRef.current = '';
    hasValidCoordsRef.current = false;
    onChange({ address: currentValue, latitude: null, longitude: null, placeId: null });
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
