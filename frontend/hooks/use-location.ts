"use client";

import { useState, useCallback, useEffect } from "react";

export type LocationStatus = "idle" | "requesting" | "ready" | "denied" | "error" | "unsupported";

export interface UserLocation {
  lat: number;
  lng: number;
  label: string;
}

const CACHE_KEY = "mw_user_location";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (apiKey) {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&result_type=locality`
      );
      const data = await res.json();
      const result = data.results?.[0];
      if (result) {
        const locality = result.address_components?.find(
          (c: { types: string[]; long_name: string }) =>
            c.types.includes("locality") || c.types.includes("sublocality_level_1")
        );
        return (
          locality?.long_name ||
          result.formatted_address?.split(",")[0] ||
          `${lat.toFixed(3)}°, ${lng.toFixed(3)}°`
        );
      }
    } catch {
      // fall through to Nominatim
    }
  }

  // Fallback: OpenStreetMap Nominatim — no API key required
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
    { headers: { "Accept-Language": "en" } }
  );
  const data = await res.json();
  return (
    data.address?.suburb ||
    data.address?.city_district ||
    data.address?.city ||
    data.address?.town ||
    data.address?.county ||
    `${lat.toFixed(3)}°, ${lng.toFixed(3)}°`
  );
}

export function useLocation() {
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [location, setLocation] = useState<UserLocation | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const cached: { data: UserLocation; timestamp: number } = JSON.parse(raw);
      if (Date.now() - cached.timestamp < CACHE_TTL_MS) return cached.data;
    } catch {
      /* ignore corrupt cache */
    }
    return null;
  });

  const requestLocation = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unsupported");
      return;
    }
    setStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const label = await reverseGeocode(lat, lng);
          const data: UserLocation = { lat, lng, label };
          setLocation(data);
          setStatus("ready");
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ data, timestamp: Date.now() })
          );
        } catch {
          // geocoding failed — still store raw coords
          const data: UserLocation = {
            lat,
            lng,
            label: `${lat.toFixed(3)}°, ${lng.toFixed(3)}°`,
          };
          setLocation(data);
          setStatus("ready");
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ data, timestamp: Date.now() })
          );
        }
      },
      () => {
        setStatus("denied");
      },
      { timeout: 10_000, maximumAge: 5 * 60 * 1000 }
    );
  }, []);

  // On first mount: use cached location immediately, or kick off a geolocation request
  useEffect(() => {
    if (location) {
      setStatus("ready");
    } else {
      requestLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { location, status, requestLocation };
}
