export const MAX_EXTRA_STOPS = 2;

export const emptyStop = () => ({ address: '', latitude: null, longitude: null, placeId: null });

// "lat,lng|lat,lng|..." for the C# booking `destination` field
export function formatDestinationCoords(coordsList) {
  return coordsList.filter(c => c?.latitude != null).map(c => `${c.latitude},${c.longitude}`).join('|');
}

// "Addr1|Addr2|..." for the C# booking `endAddress` field
export function formatDestinationAddresses(addresses) {
  return addresses.filter(Boolean).join('|');
}

// "Addr1 → Addr2 → Addr3" for on-screen display
export function formatDestinationDisplay(addresses) {
  return addresses.filter(Boolean).join(' → ');
}

// Resolve a stop to coords: safe ref first (autocomplete selection), then state, then geocode
export async function resolveStopCoords(stop, safe, geocodeAddress) {
  if (safe?.latitude != null) {
    const refP = (safe.address || '').substring(0, 12).toLowerCase();
    const addrP = (stop.address || '').substring(0, 12).toLowerCase();
    if (refP === addrP) return { latitude: safe.latitude, longitude: safe.longitude };
  }
  if (stop.latitude != null) return { latitude: stop.latitude, longitude: stop.longitude };
  return geocodeAddress(stop.address, safe?.placeId || stop.placeId);
}

export function buildRouteSearchData({ pickupAddr, pickupCoords, destinationAddresses, destinationCoords, date, time, selectedVehicle }) {
  return {
    pickup: pickupAddr,
    pickupCoords,
    dropoff: formatDestinationDisplay(destinationAddresses),
    dropoffCoords: destinationCoords[destinationCoords.length - 1],
    destinationCoords,
    destinationAddresses,
    date,
    time,
    ...(selectedVehicle != null ? { selectedVehicle } : {}),
  };
}

// Backward compatible: old sessions only have dropoffCoords
export function getDestinationCoords(searchData) {
  if (searchData?.destinationCoords?.length) return searchData.destinationCoords;
  if (searchData?.dropoffCoords) return [searchData.dropoffCoords];
  return [];
}
