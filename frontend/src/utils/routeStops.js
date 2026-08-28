export const MAX_EXTRA_STOPS = 2;

export const emptyStop = () => ({ address: '', latitude: null, longitude: null, placeId: null });

export function formatDestinationCoords(coordsList) {
  return coordsList
    .filter((c) => c?.latitude != null && c?.longitude != null)
    .map((c) => `${c.latitude},${c.longitude}`)
    .join('|');
}

export function formatDestinationAddresses(addresses) {
  return addresses.filter(Boolean).join('|');
}

export function formatDestinationDisplay(addresses) {
  return addresses.filter(Boolean).join(' → ');
}

export async function resolveStopCoords(stop, safeRef, geocodeAddress) {
  const addr = stop.address?.trim();
  if (!addr) return null;

  if (safeRef?.current?.latitude != null) {
    const refP = safeRef.current.address.substring(0, 12).toLowerCase();
    const addrP = addr.substring(0, 12).toLowerCase();
    if (refP === addrP) {
      return { latitude: safeRef.current.latitude, longitude: safeRef.current.longitude };
    }
  }

  if (stop.latitude != null) {
    return { latitude: stop.latitude, longitude: stop.longitude };
  }

  return geocodeAddress(addr, safeRef?.current?.placeId || stop.placeId);
}

export function buildRouteSearchData({
  pickupAddr,
  pickupCoords,
  destinationAddresses,
  destinationCoords,
  date,
  time,
  selectedVehicle,
}) {
  const lastCoords = destinationCoords[destinationCoords.length - 1];
  return {
    pickup: pickupAddr,
    pickupCoords,
    dropoff: formatDestinationDisplay(destinationAddresses),
    dropoffCoords: lastCoords,
    destinationCoords,
    destinationAddresses,
    date,
    time,
    ...(selectedVehicle != null ? { selectedVehicle } : {}),
  };
}

export function getDestinationCoords(searchData) {
  if (searchData?.destinationCoords?.length) {
    return searchData.destinationCoords;
  }
  if (searchData?.dropoffCoords) {
    return [searchData.dropoffCoords];
  }
  return [];
}
