"use client";

import { useEffect, useRef, useState } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import {
  distanceFromOfficeKm,
  isEligibleForFreeConsultation,
} from "@/lib/maps/distance";
import { GRID_OFFICE } from "@/lib/maps/office";
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
}

export function SiteAddressPicker({
  address,
  latitude,
  longitude,
  distanceKm,
  onChange,
}: SiteAddressPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [mapsError, setMapsError] = useState<string | null>(null);
  const [mapsLoading, setMapsLoading] = useState(true);
  const [focused, setFocused] = useState(false);

  const eligibleFree = isEligibleForFreeConsultation(distanceKm);

  useEffect(() => {
    let cancelled = false;
    let autocomplete: google.maps.places.Autocomplete | null = null;
    let listener: google.maps.MapsEventListener | null = null;

    async function init() {
      setMapsLoading(true);
      setMapsError(null);
      try {
        const maps = await loadGoogleMapsFromConfig();
        if (cancelled || !inputRef.current || !mapRef.current) return;

        const center =
          latitude != null && longitude != null
            ? { lat: latitude, lng: longitude }
            : { lat: GRID_OFFICE.lat, lng: GRID_OFFICE.lng };

        const map = new maps.Map(mapRef.current, {
          center,
          zoom: latitude != null ? 14 : 12,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        mapInstance.current = map;

        markerRef.current = new maps.Marker({
          map,
          position: center,
          title: latitude != null ? "Site" : GRID_OFFICE.label,
        });

        autocomplete = new maps.places.Autocomplete(inputRef.current, {
          fields: ["formatted_address", "geometry", "name"],
          types: ["geocode", "establishment"],
        });
        autocomplete.bindTo("bounds", map);

        listener = autocomplete.addListener("place_changed", () => {
          const place = autocomplete?.getPlace();
          const loc = place?.geometry?.location;
          if (!loc) {
            setMapsError("Could not resolve that place. Pick a suggestion from the list.");
            return;
          }
          const lat = loc.lat();
          const lng = loc.lng();
          const label =
            place.formatted_address?.trim() ||
            place.name?.trim() ||
            `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          const km = Math.round(distanceFromOfficeKm(lat, lng) * 10) / 10;

          map.panTo({ lat, lng });
          map.setZoom(15);
          markerRef.current?.setPosition({ lat, lng });
          markerRef.current?.setTitle(label);

          onChange({
            address: label,
            latitude: lat,
            longitude: lng,
            distanceKm: km,
          });
          setMapsError(null);
        });
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
      if (listener) google.maps.event.removeListener(listener);
    };
    // Init once on mount; place selection updates map via refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <label className="text-[13px] font-medium text-[var(--figma-navy)]">Site Address</label>
        <div
          className="flex items-center gap-2.5 rounded-[10px] border-[1.5px] bg-white px-3.5 py-2.5 transition-all"
          style={{
            borderColor: focused ? "var(--figma-teal)" : "var(--figma-border)",
            boxShadow: focused ? "var(--neu-raised)" : "var(--neu-inset)",
          }}
        >
          <MaterialIcon name="location_on" outlined size={18} className="text-[var(--figma-gray400)]" />
          <input
            ref={inputRef}
            value={address}
            onChange={(e) =>
              onChange({
                address: e.target.value,
                latitude: null,
                longitude: null,
                distanceKm: null,
              })
            }
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search address or place…"
            className="min-w-0 flex-1 border-none bg-transparent text-[14px] text-[var(--figma-navy)] outline-none"
            autoComplete="off"
          />
        </div>
        <p className="m-0 text-[11px] text-[var(--figma-gray400)]">
          Select a Google Places suggestion to pin the site and calculate distance.
        </p>
      </div>

      <div
        ref={mapRef}
        className="relative h-[220px] overflow-hidden rounded-2xl border-[1.5px] border-[var(--figma-border)] bg-[var(--figma-gray50)]"
      >
        {mapsLoading && (
          <div className="absolute inset-0 z-[1] flex items-center justify-center gap-2 bg-[rgba(232,244,248,0.85)] text-[13px] text-[var(--figma-gray500)]">
            <MaterialIcon name="map" outlined size={22} className="text-[var(--figma-teal)]" />
            Loading map…
          </div>
        )}
        {mapsError && !mapsLoading && (
          <div className="absolute inset-0 z-[1] flex flex-col items-center justify-center gap-2 bg-[rgba(232,244,248,0.92)] px-6 text-center">
            <MaterialIcon name="map" outlined size={28} className="text-[var(--figma-teal)] opacity-60" />
            <span className="text-[13px] text-[var(--figma-gray500)]">{mapsError}</span>
            <span className="text-[11px] text-[var(--figma-gray400)]">
              You can still type an address; distance requires a Places selection.
            </span>
          </div>
        )}
      </div>

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
                Eligible for Free Consultation (within 10 km)
              </div>
            ) : (
              <div className="text-[11px] text-[var(--figma-gray500)]">
                Outside free consultation radius (&gt; 10 km)
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
