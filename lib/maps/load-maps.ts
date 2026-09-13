import { importLibrary, setOptions } from "@googlemaps/js-api-loader";

let mapsReady: Promise<typeof google.maps> | null = null;
let configuredKey: string | null = null;

export async function fetchMapsApiKey(): Promise<string> {
  const res = await fetch("/api/maps/config");
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? "Google Maps is not configured.");
  }
  const data = (await res.json()) as { apiKey?: string };
  if (!data.apiKey?.trim()) {
    throw new Error("Google Maps API key is missing.");
  }
  return data.apiKey.trim();
}

/** Load Maps JS + Places once for the given key. */
export async function loadGoogleMaps(apiKey: string): Promise<typeof google.maps> {
  if (mapsReady && configuredKey === apiKey) return mapsReady;

  configuredKey = apiKey;
  setOptions({ key: apiKey, v: "weekly" });

  mapsReady = (async () => {
    await importLibrary("maps");
    await importLibrary("places");
    return google.maps;
  })();

  try {
    return await mapsReady;
  } catch (err) {
    mapsReady = null;
    configuredKey = null;
    throw err;
  }
}

export async function loadGoogleMapsFromConfig(): Promise<typeof google.maps> {
  const key = await fetchMapsApiKey();
  return loadGoogleMaps(key);
}
