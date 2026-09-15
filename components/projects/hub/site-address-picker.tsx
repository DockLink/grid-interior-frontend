"use client";

import { useEffect, useRef, useState } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import {
  distanceFromOfficeKm,
  isEligibleForFreeConsultation,
} from "@/lib/maps/distance";
import { FREE_CONSULTATION_RADIUS_KM, GRID_OFFICE } from "@/lib/maps/office";
import { loadGoogleMapsFromConfig } from "@/lib/maps/load-maps";

export interface SitePlaceSelection {
  address: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
}

interface SiteAddressPickerProps {
  address: string;
  latitude: number | null;
  longitude: number | null;
  distanceKm: number | null;
  onChange: (next: {
    address: string;
    latitude: number | null;
    longitude: number | null;
    distanceKm: number | null;
  }) => void;
  error?: string;
}

type LatLngLiteral = { lat: number; lng: number };

export function SiteAddressPicker({
  address,
  latitude,
  longitude,
  distanceKm,
  onChange,
  error,
}: SiteAddressPickerProps) {
  const searchHostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const onChangeRef = useRef(onChange);
  const [mapsError, setMapsError] = useState<string | null>(null);
  const [mapsLoading, setMapsLoading] = useState(true);

  onChangeRef.current = onChange;

  const eligibleFree = isEligibleForFreeConsultation(distanceKm);

  const applyPin = (lat: number, lng: number, label: string, map: google.maps.Map) => {
    const km = Math.round(distanceFromOfficeKm(lat, lng) * 10) / 10;
    map.panTo({ lat, lng });
    map.setZoom(15);
    markerRef.current?.setPosition({ lat, lng });
    markerRef.current?.setTitle(label);
    onChangeRef.current({
      address: label,
      latitude: lat,
      longitude: lng,
      distanceKm: km,
    });
    setMapsError(null);
  };

  const reverseGeocodeAndPin = (
    lat: number,
    lng: number,
    map: google.maps.Map,
  ) => {
    const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    const geocoder = geocoderRef.current;
    if (!geocoder) {
      applyPin(lat, lng, fallback, map);
      return;
    }
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      const label =
        status === "OK" && results?.[0]?.formatted_address
          ? results[0].formatted_address
          : fallback;
      applyPin(lat, lng, label, map);
    });
  };

  useEffect(() => {
    let cancelled = false;
    let clickListener: google.maps.MapsEventListener | null = null;
    let dragListener: google.maps.MapsEventListener | null = null;
    let placeAutocomplete: google.maps.places.PlaceAutocompleteElement | null = null;
    let onPlaceSelect: ((event: Event) => void) | null = null;

    async function init() {
      setMapsLoading(true);
      setMapsError(null);
      try {
        const maps = await loadGoogleMapsFromConfig();
        if (cancelled || !mapRef.current || !searchHostRef.current) return;

        const center: LatLngLiteral =
          latitude != null && longitude != null
            ? { lat: latitude, lng: longitude }
            : { lat: GRID_OFFICE.lat, lng: GRID_OFFICE.lng };

        // Map owns this node — never render React children into mapRef.
        const map = new maps.Map(mapRef.current, {
          center,
          zoom: latitude != null ? 14 : 13,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: true,
        });
        mapInstance.current = map;
        geocoderRef.current = new maps.Geocoder();

        markerRef.current = new maps.Marker({
          map,
          position: center,
          draggable: true,
          title: latitude != null ? "Site" : GRID_OFFICE.label,
        });

        new maps.Marker({
          map,
          position: { lat: GRID_OFFICE.lat, lng: GRID_OFFICE.lng },
          title: GRID_OFFICE.label,
          opacity: 0.55,
          icon: {
            path: maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: "#0E7C86",
            fillOpacity: 0.9,
            strokeColor: "#fff",
            strokeWeight: 2,
          },
        });

        clickListener = map.addListener("click", (e: google.maps.MapMouseEvent) => {
          const latLng = e.latLng;
          if (!latLng) return;
          reverseGeocodeAndPin(latLng.lat(), latLng.lng(), map);
        });

        dragListener = markerRef.current.addListener("dragend", () => {
          const pos = markerRef.current?.getPosition();
          if (!pos) return;
          reverseGeocodeAndPin(pos.lat(), pos.lng(), map);
        });

        // PlaceAutocompleteElement is a web component — mount into a host React
        // does not reconcile as a controlled <input>.
        const placesLib = (await google.maps.importLibrary(
          "places",
        )) as google.maps.PlacesLibrary;
        const { PlaceAutocompleteElement } = placesLib;

        placeAutocomplete = new PlaceAutocompleteElement({
          includedRegionCodes: ["lk"],
        });
        placeAutocomplete.id = "site-place-autocomplete";
        placeAutocomplete.style.width = "100%";
        searchHostRef.current.replaceChildren(placeAutocomplete);

        onPlaceSelect = (event: Event) => {
          void (async () => {
            try {
              const placeEvent = event as google.maps.places.PlacePredictionSelectEvent;
              const prediction = placeEvent.placePrediction;
              if (!prediction) {
                setMapsError("Could not resolve that place. Pick another suggestion.");
                return;
              }
              const place = prediction.toPlace();
              await place.fetchFields({
                fields: ["formattedAddress", "location", "displayName"],
              });
              const loc = place.location;
              if (!loc) {
                setMapsError("Could not resolve that place. Pick another suggestion.");
                return;
              }
              const lat = loc.lat();
              const lng = loc.lng();
              const label =
                place.formattedAddress?.trim() ||
                place.displayName?.trim() ||
                `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
              applyPin(lat, lng, label, map);
            } catch (err) {
              setMapsError(
                err instanceof Error ? err.message : "Failed to load place details.",
              );
            }
          })();
        };
        placeAutocomplete.addEventListener("gmp-select", onPlaceSelect);
      } catch (err) {
        if (!cancelled) {
          setMapsError(err instanceof Error ? err.message : "Failed to load Google Maps.");
        }
      } finally {
        if (!cancelled) setMapsLoading(false);
      }
    }

    void init();

    return () => {
      cancelled = true;
      if (clickListener) google.maps.event.removeListener(clickListener);
      if (dragListener) google.maps.event.removeListener(dragListener);
      if (placeAutocomplete && onPlaceSelect) {
        placeAutocomplete.removeEventListener("gmp-select", onPlaceSelect);
      }
      if (searchHostRef.current) searchHostRef.current.replaceChildren();
      markerRef.current?.setMap(null);
      markerRef.current = null;
      mapInstance.current = null;
    };
    // Init once on mount; selection updates via refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <label className="text-[13px] font-medium text-[var(--figma-navy)]">Site Address</label>
        <div
          className="rounded-[10px] border-[1.5px] bg-white px-3 py-2 transition-all"
          style={{
            borderColor: error ? "var(--figma-alert)" : "var(--figma-border)",
            boxShadow: "var(--neu-inset)",
          }}
        >
          <div ref={searchHostRef} className="min-h-10 w-full [&_gmp-place-autocomplete]:w-full" />
        </div>
        {address ? (
          <p className="m-0 text-[12px] text-[var(--figma-navy)]">
            Selected: <span className="font-medium">{address}</span>
          </p>
        ) : null}
        <p className="m-0 text-[11px] text-[var(--figma-gray400)]">
          Search for a place, click the map, or drag the pin to set the site location.
        </p>
        {error && (
          <p className="m-0 flex items-center gap-1 text-[11px] font-medium text-[var(--figma-alert)]">
            <MaterialIcon name="error_outline" outlined size={13} />
            {error}
          </p>
        )}
      </div>

      <div className="relative h-[220px] overflow-hidden rounded-2xl border-[1.5px] border-[var(--figma-border)] bg-[var(--figma-gray50)]">
        {/* Empty host for Maps — overlays must be siblings, not children of mapRef */}
        <div ref={mapRef} className="size-full" />
        {mapsLoading && (
          <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center gap-2 bg-[rgba(232,244,248,0.85)] text-[13px] text-[var(--figma-gray500)]">
            <MaterialIcon name="map" outlined size={22} className="text-[var(--figma-teal)]" />
            Loading map…
          </div>
        )}
        {mapsError && !mapsLoading && (
          <div className="absolute inset-0 z-[1] flex flex-col items-center justify-center gap-2 bg-[rgba(232,244,248,0.92)] px-6 text-center">
            <MaterialIcon name="map" outlined size={28} className="text-[var(--figma-teal)] opacity-60" />
            <span className="text-[13px] text-[var(--figma-gray500)]">{mapsError}</span>
            <span className="text-[11px] text-[var(--figma-gray400)]">
              Enable Maps JavaScript API, Places API (New), and Geocoding API, then restart yarn
              dev.
            </span>
          </div>
        )}
      </div>

      <p className="m-0 text-[11px] text-[var(--figma-gray400)]">
        Teal circle marks the GRID office (
        <a
          href={GRID_OFFICE.mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="text-[var(--figma-teal)] underline-offset-2 hover:underline"
        >
          60 Hill St, Dehiwala
        </a>
        ). Free consultation requires the site within {FREE_CONSULTATION_RADIUS_KM} km.
      </p>

      {distanceKm != null && (
        <div
          className="flex items-center gap-3 rounded-xl border-[1.5px] px-4 py-3.5"
          style={{
            background: eligibleFree ? "rgba(63,166,107,0.06)" : "var(--figma-gray50)",
            borderColor: eligibleFree ? "#3FA66B" : "var(--figma-border)",
          }}
        >
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-[10px]"
            style={{ background: eligibleFree ? "#DCFCE7" : "var(--figma-gray100)" }}
          >
            <MaterialIcon
              name="near_me"
              outlined
              size={20}
              style={{ color: eligibleFree ? "#3FA66B" : "var(--figma-gray400)" }}
            />
          </div>
          <div>
            <div className="mb-0.5 text-[13px] font-semibold text-[var(--figma-navy)]">
              {distanceKm.toFixed(1)} km from Dehiwala office
            </div>
            {eligibleFree ? (
              <div className="flex items-center gap-1 text-[11px] font-semibold text-[#3FA66B]">
                <MaterialIcon name="check_circle" size={13} />
                Eligible for Free Consultation (within {FREE_CONSULTATION_RADIUS_KM} km)
              </div>
            ) : (
              <div className="text-[11px] text-[var(--figma-gray500)]">
                Outside free consultation radius (&gt; {FREE_CONSULTATION_RADIUS_KM} km)
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
