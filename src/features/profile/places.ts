/**
 * Bundled list of major cities so location works offline and without a
 * geocoding service. Coordinates are city-centre approximations (±0.05°),
 * which is far more precise than rise/set times or house cusps need.
 * Users can also enter exact coordinates or use device geolocation.
 */
import type { StoredPlace } from "./schema";

type Row = [name: string, country: string, lat: number, lon: number, tz: string];

const ROWS: Row[] = [
  ["Amsterdam", "Netherlands", 52.37, 4.9, "Europe/Amsterdam"],
  ["Athens", "Greece", 37.98, 23.73, "Europe/Athens"],
  ["Auckland", "New Zealand", -36.85, 174.76, "Pacific/Auckland"],
  ["Bangkok", "Thailand", 13.76, 100.5, "Asia/Bangkok"],
  ["Barcelona", "Spain", 41.39, 2.17, "Europe/Madrid"],
  ["Beijing", "China", 39.9, 116.41, "Asia/Shanghai"],
  ["Berlin", "Germany", 52.52, 13.4, "Europe/Berlin"],
  ["Bogotá", "Colombia", 4.71, -74.07, "America/Bogota"],
  ["Boston", "United States", 42.36, -71.06, "America/New_York"],
  ["Brussels", "Belgium", 50.85, 4.35, "Europe/Brussels"],
  ["Bucharest", "Romania", 44.43, 26.1, "Europe/Bucharest"],
  ["Budapest", "Hungary", 47.5, 19.04, "Europe/Budapest"],
  ["Buenos Aires", "Argentina", -34.6, -58.38, "America/Argentina/Buenos_Aires"],
  ["Cairo", "Egypt", 30.04, 31.24, "Africa/Cairo"],
  ["Cape Town", "South Africa", -33.92, 18.42, "Africa/Johannesburg"],
  ["Chicago", "United States", 41.88, -87.63, "America/Chicago"],
  ["Copenhagen", "Denmark", 55.68, 12.57, "Europe/Copenhagen"],
  ["Delhi", "India", 28.61, 77.21, "Asia/Kolkata"],
  ["Denver", "United States", 39.74, -104.99, "America/Denver"],
  ["Dubai", "United Arab Emirates", 25.2, 55.27, "Asia/Dubai"],
  ["Dublin", "Ireland", 53.35, -6.26, "Europe/Dublin"],
  ["Edinburgh", "United Kingdom", 55.95, -3.19, "Europe/London"],
  ["Gdańsk", "Poland", 54.35, 18.65, "Europe/Warsaw"],
  ["Helsinki", "Finland", 60.17, 24.94, "Europe/Helsinki"],
  ["Hong Kong", "China", 22.32, 114.17, "Asia/Hong_Kong"],
  ["Honolulu", "United States", 21.31, -157.86, "Pacific/Honolulu"],
  ["Istanbul", "Türkiye", 41.01, 28.98, "Europe/Istanbul"],
  ["Jakarta", "Indonesia", -6.21, 106.85, "Asia/Jakarta"],
  ["Johannesburg", "South Africa", -26.2, 28.05, "Africa/Johannesburg"],
  ["Kraków", "Poland", 50.06, 19.94, "Europe/Warsaw"],
  ["Kyiv", "Ukraine", 50.45, 30.52, "Europe/Kyiv"],
  ["Lagos", "Nigeria", 6.52, 3.38, "Africa/Lagos"],
  ["Lima", "Peru", -12.05, -77.04, "America/Lima"],
  ["Lisbon", "Portugal", 38.72, -9.14, "Europe/Lisbon"],
  ["London", "United Kingdom", 51.51, -0.13, "Europe/London"],
  ["Los Angeles", "United States", 34.05, -118.24, "America/Los_Angeles"],
  ["Madrid", "Spain", 40.42, -3.7, "Europe/Madrid"],
  ["Manila", "Philippines", 14.6, 120.98, "Asia/Manila"],
  ["Melbourne", "Australia", -37.81, 144.96, "Australia/Melbourne"],
  ["Mexico City", "Mexico", 19.43, -99.13, "America/Mexico_City"],
  ["Miami", "United States", 25.76, -80.19, "America/New_York"],
  ["Milan", "Italy", 45.46, 9.19, "Europe/Rome"],
  ["Montréal", "Canada", 45.5, -73.57, "America/Toronto"],
  ["Moscow", "Russia", 55.76, 37.62, "Europe/Moscow"],
  ["Mumbai", "India", 19.08, 72.88, "Asia/Kolkata"],
  ["Nairobi", "Kenya", -1.29, 36.82, "Africa/Nairobi"],
  ["New York", "United States", 40.71, -74.01, "America/New_York"],
  ["Oslo", "Norway", 59.91, 10.75, "Europe/Oslo"],
  ["Paris", "France", 48.86, 2.35, "Europe/Paris"],
  ["Perth", "Australia", -31.95, 115.86, "Australia/Perth"],
  ["Poznań", "Poland", 52.41, 16.93, "Europe/Warsaw"],
  ["Prague", "Czechia", 50.08, 14.44, "Europe/Prague"],
  ["Reykjavík", "Iceland", 64.15, -21.94, "Atlantic/Reykjavik"],
  ["Rio de Janeiro", "Brazil", -22.91, -43.17, "America/Sao_Paulo"],
  ["Rome", "Italy", 41.9, 12.5, "Europe/Rome"],
  ["San Francisco", "United States", 37.77, -122.42, "America/Los_Angeles"],
  ["Santiago", "Chile", -33.45, -70.67, "America/Santiago"],
  ["São Paulo", "Brazil", -23.55, -46.63, "America/Sao_Paulo"],
  ["Seattle", "United States", 47.61, -122.33, "America/Los_Angeles"],
  ["Seoul", "South Korea", 37.57, 126.98, "Asia/Seoul"],
  ["Shanghai", "China", 31.23, 121.47, "Asia/Shanghai"],
  ["Singapore", "Singapore", 1.35, 103.82, "Asia/Singapore"],
  ["Stockholm", "Sweden", 59.33, 18.07, "Europe/Stockholm"],
  ["Sydney", "Australia", -33.87, 151.21, "Australia/Sydney"],
  ["Taipei", "Taiwan", 25.03, 121.57, "Asia/Taipei"],
  ["Tel Aviv", "Israel", 32.09, 34.78, "Asia/Jerusalem"],
  ["Tokyo", "Japan", 35.68, 139.69, "Asia/Tokyo"],
  ["Toronto", "Canada", 43.65, -79.38, "America/Toronto"],
  ["Vancouver", "Canada", 49.28, -123.12, "America/Vancouver"],
  ["Vienna", "Austria", 48.21, 16.37, "Europe/Vienna"],
  ["Vilnius", "Lithuania", 54.69, 25.28, "Europe/Vilnius"],
  ["Warsaw", "Poland", 52.23, 21.01, "Europe/Warsaw"],
  ["Wrocław", "Poland", 51.11, 17.04, "Europe/Warsaw"],
  ["Zürich", "Switzerland", 47.38, 8.54, "Europe/Zurich"],
];

export interface City extends StoredPlace {
  country: string;
}

export const CITIES: City[] = ROWS.map(([name, country, latitude, longitude, timeZone]) => ({
  name: `${name}, ${country}`,
  country,
  latitude,
  longitude,
  timeZone,
}));

function fold(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function searchCities(query: string, limit = 8): City[] {
  const q = fold(query.trim());
  if (!q) return [];
  return CITIES.filter((c) => fold(c.name).includes(q))
    .sort((a, b) => Number(!fold(a.name).startsWith(q)) - Number(!fold(b.name).startsWith(q)))
    .slice(0, limit);
}
