import React, { useRef, useEffect, useCallback } from 'react';

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
    const waitForGoogle = () => {
      if (!window.google?.maps?.places || !inputRef.current) {
        setTimeout(waitForGoogle, 200);
        return;
      }
      if (autocompleteRef.current) return;

      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['establishment', 'geocode'],
        fields: ['formatted_address', 'geometry', 'name', 'place_id'],
      });
      autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
    };
    waitForGoogle();

    return () => {
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
