import React, { useRef, useEffect } from 'react';

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

  // KEY FIX: Store onChange in a ref so the Google Maps listener never goes stale.
  // Without this, every parent re-render creates a new onChange reference,
  // which causes useEffect to remove the place_changed listener and never re-add it
  // (because autocompleteRef.current is already set).
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Setup Google Autocomplete ONCE — empty deps, uses refs for latest values
  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps().then(() => {
      if (cancelled || !inputRef.current || autocompleteRef.current) return;

      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        fields: ['formatted_address', 'geometry', 'name', 'place_id'],
      });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        if (!place) return;

        justSelectedRef.current = true;
        const address = place.formatted_address || place.name || inputRef.current?.value || '';
        lastSelectedAddrRef.current = address;

        if (place.geometry) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          onChangeRef.current({ address, latitude: lat, longitude: lng, placeId: place.place_id });
        } else {
          // Some predictions lack geometry — pass placeId for geocoding fallback
          onChangeRef.current({ address, latitude: null, longitude: null, placeId: place.place_id || null });
        }

        setTimeout(() => { justSelectedRef.current = false; }, 3000);
      });
    });

    return () => {
      cancelled = true;
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync external value changes to the uncontrolled input
  useEffect(() => {
    const addr = typeof value === 'string' ? value : value?.address || '';
    if (inputRef.current && addr && inputRef.current.value !== addr) {
      inputRef.current.value = addr;
    }
  }, [value]);

  const handleInputChange = () => {
    // Block onChange during 3s after autocomplete selection (mobile keyboard dismiss events)
    if (justSelectedRef.current) return;

    const currentValue = inputRef.current?.value || '';

    // If value matches last autocomplete selection, don't clear coords
    if (lastSelectedAddrRef.current && currentValue.length > 5) {
      const selPrefix = lastSelectedAddrRef.current.substring(0, 15).toLowerCase();
      const curPrefix = currentValue.substring(0, 15).toLowerCase();
      if (selPrefix === curPrefix) return;
    }

    // User is genuinely typing something new
    lastSelectedAddrRef.current = '';
    onChangeRef.current({ address: currentValue, latitude: null, longitude: null, placeId: null });
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
