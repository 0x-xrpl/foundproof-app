import * as Location from "expo-location";

import { createSha256 } from "@/utils/hash";

export type CapturedLocation = {
  latitude: number;
  longitude: number;
  locationLabel: string;
  locationHash: string;
};

function roundCoordinate(value: number, precision = 3) {
  const power = 10 ** precision;
  return Math.round(value * power) / power;
}

function buildFallbackLabel(latitude: number, longitude: number) {
  return `Approx. ${roundCoordinate(latitude, 2)}, ${roundCoordinate(longitude, 2)}`;
}

export async function deriveLocationHash(latitude: number, longitude: number) {
  const roundedLatitude = roundCoordinate(latitude);
  const roundedLongitude = roundCoordinate(longitude);
  return createSha256(`${roundedLatitude}:${roundedLongitude}`);
}

export async function captureCurrentLocation(): Promise<CapturedLocation> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (!permission.granted) {
    throw new Error("Location permission was not granted.");
  }

  const current = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced
  });

  const latitude = current.coords.latitude;
  const longitude = current.coords.longitude;
  const roundedLatitude = roundCoordinate(latitude);
  const roundedLongitude = roundCoordinate(longitude);

  let locationLabel = buildFallbackLabel(latitude, longitude);

  try {
    const places = await Location.reverseGeocodeAsync({
      latitude,
      longitude
    });
    const firstPlace = places[0];

    if (firstPlace) {
      const safeParts = [firstPlace.city, firstPlace.subregion, firstPlace.country].filter(Boolean);
      if (safeParts.length > 0) {
        locationLabel = safeParts.join(", ");
      }
    }
  } catch {
    locationLabel = buildFallbackLabel(latitude, longitude);
  }

  const locationHash = await deriveLocationHash(latitude, longitude);

  return {
    latitude,
    longitude,
    locationLabel,
    locationHash
  };
}
