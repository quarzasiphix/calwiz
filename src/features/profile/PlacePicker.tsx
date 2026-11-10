import { useId, useState } from "react";
import { LocateFixed, MapPin, X } from "lucide-react";
import { systemTimeZone } from "@/domain/time/civil";
import { Disclosure } from "@/ui/primitives";
import { searchCities } from "./places";
import type { StoredPlace } from "./schema";

/** Offline city search + manual coordinates + optional device geolocation. */
export function PlacePicker({
  value,
  onChange,
  allowGeolocation = false,
  label,
}: {
  value: StoredPlace | undefined;
  onChange: (p: StoredPlace | undefined) => void;
  allowGeolocation?: boolean;
  label: string;
}) {
  const [q, setQ] = useState("");
  const [geoError, setGeoError] = useState<string | null>(null);
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const id = useId();
  const results = searchCities(q);

  const locate = () => {
    setGeoError(null);
    if (!("geolocation" in navigator)) return setGeoError("Geolocation isn't available in this browser.");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const la = Math.round(pos.coords.latitude * 100) / 100;
        const lo = Math.round(pos.coords.longitude * 100) / 100;
        onChange({ name: `My location (${la.toFixed(2)}°, ${lo.toFixed(2)}°)`, latitude: la, longitude: lo, timeZone: systemTimeZone() });
      },
      (err) => setGeoError(err.code === err.PERMISSION_DENIED ? "Location permission was denied." : "Couldn't get your location."),
      { maximumAge: 3_600_000, timeout: 15_000 },
    );
  };

  const manual = () => {
    const la = Number(lat);
    const lo = Number(lon);
    if (!Number.isFinite(la) || !Number.isFinite(lo) || Math.abs(la) > 90 || Math.abs(lo) > 180) return setGeoError("Enter latitude −90…90 and longitude −180…180.");
    onChange({ name: `${la.toFixed(2)}°, ${lo.toFixed(2)}°`, latitude: la, longitude: lo, timeZone: systemTimeZone() });
    setGeoError(null);
  };

  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-line px-3 py-2">
        <MapPin size={16} className="text-muted" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm">{value.name}</p>
          <p className="num text-2xs text-muted">
            {value.latitude.toFixed(2)}°, {value.longitude.toFixed(2)}° · {value.timeZone}
          </p>
        </div>
        <button className="icon-btn h-9 w-9" aria-label={`Clear ${label}`} onClick={() => onChange(undefined)}>
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={id} className="sr-only">
        Search {label}
      </label>
      <input id={id} className="field" placeholder="Search a city (works offline)…" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" />
      {results.length > 0 && (
        <ul className="mt-1 overflow-hidden rounded-xl border border-line bg-raised" aria-label="Matching cities">
          {results.map((c) => (
            <li key={c.name}>
              <button
                className="flex min-h-[44px] w-full items-center justify-between px-3 text-left text-sm hover:bg-line/40"
                onClick={() => {
                  onChange({ name: c.name, latitude: c.latitude, longitude: c.longitude, timeZone: c.timeZone });
                  setQ("");
                }}
              >
                {c.name}
                <span className="text-2xs text-faint">{c.timeZone}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {q.length > 1 && !results.length && <p className="mt-2 text-xs text-muted">Not in the offline list — enter coordinates below.</p>}
      <div className="mt-2 flex flex-wrap gap-2">
        {allowGeolocation && (
          <button className="btn-outline min-h-[40px]" onClick={locate}>
            <LocateFixed size={16} aria-hidden /> Use my location
          </button>
        )}
      </div>
      <Disclosure summary="Enter coordinates">
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs text-muted">
            Latitude
            <input className="field mt-1 w-28" inputMode="decimal" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="52.23" />
          </label>
          <label className="text-xs text-muted">
            Longitude
            <input className="field mt-1 w-28" inputMode="decimal" value={lon} onChange={(e) => setLon(e.target.value)} placeholder="21.01" />
          </label>
          <button className="btn-outline" onClick={manual}>
            Set
          </button>
        </div>
        <p className="mt-1 text-2xs text-faint">North and east are positive. The device time zone is used for coordinates.</p>
      </Disclosure>
      {geoError && (
        <p role="alert" className="mt-2 text-xs text-rose">
          {geoError}
        </p>
      )}
    </div>
  );
}
