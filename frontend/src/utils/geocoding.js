const GEOCODE_CACHE_PREFIX = "voyexa_geo_v1:";
const GEOCODE_TTL_MS = 1000 * 60 * 60 * 24 * 14;

const inMemoryCache = new Map();
const inflightRequests = new Map();

const fallbackCoordinates = {
  mumbai: { lat: 19.076, lon: 72.8777, displayName: "Mumbai, India" },
  paris: { lat: 48.8566, lon: 2.3522, displayName: "Paris, France" },
  london: { lat: 51.5072, lon: -0.1276, displayName: "London, United Kingdom" },
  tokyo: { lat: 35.6762, lon: 139.6503, displayName: "Tokyo, Japan" },
  dubai: { lat: 25.2048, lon: 55.2708, displayName: "Dubai, United Arab Emirates" },
  singapore: { lat: 1.3521, lon: 103.8198, displayName: "Singapore" },
  newyork: { lat: 40.7128, lon: -74.006, displayName: "New York, United States" },
};

const normalizeCityName = (value = "") =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9,\s-]/g, "")
    .replace(/\s+/g, " ");

const toStorageKey = (city) => `${GEOCODE_CACHE_PREFIX}${normalizeCityName(city)}`;

const writeStorageCache = (city, data) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      toStorageKey(city),
      JSON.stringify({
        data,
        cachedAt: Date.now(),
      })
    );
  } catch (error) {
    console.warn("Failed to write geocode cache:", error);
  }
};

const readStorageCache = (city) => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(toStorageKey(city));
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed?.data || typeof parsed.cachedAt !== "number") return null;
    if (Date.now() - parsed.cachedAt > GEOCODE_TTL_MS) return null;

    return parsed.data;
  } catch (error) {
    console.warn("Failed to read geocode cache:", error);
    return null;
  }
};

const parseResult = (result) => {
  const lat = Number(result?.lat);
  const lon = Number(result?.lon);

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    throw new Error("Geocoding response did not include valid coordinates.");
  }

  return {
    lat,
    lon,
    displayName: result?.display_name || "Unknown location",
  };
};

const fetchFromNominatim = async (query) => {
  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    limit: "1",
    addressdetails: "0",
  });

  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Geocoding failed with status ${response.status}.`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload) || payload.length === 0) {
    throw new Error(`No geocoding results for "${query}".`);
  }

  return parseResult(payload[0]);
};

const getFallbackCoordinates = (city) => {
  const normalized = normalizeCityName(city);
  const compact = normalized.replace(/[\s,-]/g, "");
  const shortName = normalized.split(",")[0]?.trim() || normalized;
  const shortCompact = shortName.replace(/[\s,-]/g, "");

  return (
    fallbackCoordinates[normalized] ||
    fallbackCoordinates[compact] ||
    fallbackCoordinates[shortName] ||
    fallbackCoordinates[shortCompact] ||
    null
  );
};

export const resolveCityCoordinates = async (city) => {
  const normalized = normalizeCityName(city);
  if (!normalized) {
    throw new Error("City is required to resolve coordinates.");
  }

  const cachedMemory = inMemoryCache.get(normalized);
  if (cachedMemory) return cachedMemory;

  const cachedStorage = readStorageCache(city);
  if (cachedStorage) {
    inMemoryCache.set(normalized, cachedStorage);
    return cachedStorage;
  }

  if (inflightRequests.has(normalized)) {
    return inflightRequests.get(normalized);
  }

  const shortName = normalized.split(",")[0]?.trim() || normalized;
  const request = (async () => {
    try {
      const resolved = await fetchFromNominatim(city);
      inMemoryCache.set(normalized, resolved);
      writeStorageCache(city, resolved);
      return resolved;
    } catch (primaryError) {
      try {
        if (shortName !== normalized) {
          const resolved = await fetchFromNominatim(shortName);
          inMemoryCache.set(normalized, resolved);
          writeStorageCache(city, resolved);
          return resolved;
        }
      } catch (secondaryError) {
        const fallback = getFallbackCoordinates(city);
        if (fallback) {
          inMemoryCache.set(normalized, fallback);
          writeStorageCache(city, fallback);
          return fallback;
        }
        throw secondaryError;
      }

      const fallback = getFallbackCoordinates(city);
      if (fallback) {
        inMemoryCache.set(normalized, fallback);
        writeStorageCache(city, fallback);
        return fallback;
      }
      throw primaryError;
    } finally {
      inflightRequests.delete(normalized);
    }
  })();

  inflightRequests.set(normalized, request);
  return request;
};

export const resolveCityCoordinatesSync = (city) => {
  const normalized = normalizeCityName(city);
  if (!normalized) return null;

  const cachedMemory = inMemoryCache.get(normalized);
  if (cachedMemory) return cachedMemory;

  const cachedStorage = readStorageCache(city);
  if (cachedStorage) {
    inMemoryCache.set(normalized, cachedStorage);
    return cachedStorage;
  }

  const fallback = getFallbackCoordinates(city);
  if (fallback) {
    inMemoryCache.set(normalized, fallback);
    return fallback;
  }

  return null;
};

