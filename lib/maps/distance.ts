import {
  FREE_CONSULTATION_RADIUS_KM,
  GRID_OFFICE,
} from "@/lib/maps/office";

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Great-circle distance in km between two WGS84 points. */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Distance from GRID Dehiwala office to a site pin. */
export function distanceFromOfficeKm(lat: number, lng: number): number {
  return haversineKm(GRID_OFFICE.lat, GRID_OFFICE.lng, lat, lng);
}

export function isEligibleForFreeConsultation(distanceKm: number | null | undefined): boolean {
  if (distanceKm == null || Number.isNaN(distanceKm)) return false;
  return distanceKm <= FREE_CONSULTATION_RADIUS_KM;
}

/** Compute office distance from stored project coords, or null if missing. */
export function distanceKmFromCoords(
  latitude: number | null | undefined,
  longitude: number | null | undefined,
): number | null {
  if (latitude == null || longitude == null) return null;
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;
  return Math.round(distanceFromOfficeKm(latitude, longitude) * 10) / 10;
}
