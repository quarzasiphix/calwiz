import { useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { Download, Trash2, Upload } from "lucide-react";
import { DEFAULT_ORBS, ASPECT_LABEL, type AspectKind } from "@/domain/astrology/aspects";
import { HOUSE_SYSTEM_LABEL } from "@/domain/astrology/natal";
import { isCivilDate, systemTimeZone } from "@/domain/time/civil";
import { downloadFile } from "@/features/share/ics";
import { InstallHelp } from "@/features/pwa/InstallHelp";
import { Page, PageHeader, Segmented } from "@/ui/primitives";
import { PlacePicker } from "./PlacePicker";
import { useProfile } from "./ProfileProvider";
import { exportProfile, importProfile } from "./storage";

function Group({ id, title, children, note }: { id: string; title: string; children: ReactNode; note?: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-20 border-t border-line/60 py-8">
      <h2 id={`${id}-h`} className="text-xl">
        {title}
      </h2>
      {note && <p className="mt-1 text-sm text-muted">{note}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

function Field({ label, hint, children, htmlFor }: { label: string; hint?: ReactNode; children: ReactNode; htmlFor?: string }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-faint">{hint}</p>}
    </div>
  );
}

export default function ProfilePage() {
  const { profile, update, replace, reset, persisted } = useProfile();
  const [message, setMessage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const zones = useMemo(() => {
    try {
      return (Intl as typeof Intl & { supportedValuesOf: (k: string) => string[] }).supportedValuesOf("timeZone");
    } catch {
      return [profile.timeZone];
    }
  }, [profile.timeZone]);
  const birth = profile.birth;

  return (
    <Page>
      <PageHeader eyebrow="Private · stored only on this device" title="You & settings">
        Everything here is optional. Calwiz works without an account, and nothing you enter leaves this device unless you choose to share it.
        {!persisted && <span className="mt-2 block text-rose">This browser is blocking storage, so changes will be lost when you close the page.</span>}
      </PageHeader>

      <Group id="birth" title="Birth details" note="Used for personal numbers and your birth chart.">
        <Field label="Birth date" htmlFor="bdate">
          <input
            id="bdate"
            type="date"
            className="field"
            value={birth?.date ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              if (!v) update({ birth: undefined });
              else if (isCivilDate(v)) update((p) => ({ birth: { ...p.birth, date: v }, onboarded: true }));
            }}
          />
        </Field>
        {birth && (
          <>
            <Field label="Birth time (optional)" htmlFor="btime" hint="Leave empty if unknown. Without it, Calwiz won't calculate a rising sign or houses rather than guess.">
              <div className="flex gap-2">
                <input
                  id="btime"
                  type="time"
                  className="field"
                  value={birth.time ?? ""}
                  onChange={(e) => update((p) => ({ birth: { ...p.birth!, time: e.target.value || undefined } }))}
                />
                {birth.time && (
                  <button className="btn-ghost" onClick={() => update((p) => ({ birth: { ...p.birth!, time: undefined } }))}>
                    Unknown
                  </button>
                )}
              </div>
            </Field>
            <Field label="Birthplace (optional)" hint="Needed with the birth time for Ascendant and houses. Its time zone converts your birth time to UTC, including historical daylight saving.">
              <PlacePicker label="birthplace" value={birth.place} onChange={(place) => update((p) => ({ birth: { ...p.birth!, place } }))} />
            </Field>
          </>
        )}
      </Group>

      <Group id="location" title="Where you observe from" note="For moonrise, moonset, sunrise and orienting the Moon to your horizon.">
        <PlacePicker label="location" value={profile.location} allowGeolocation onChange={(location) => update({ location })} />
      </Group>

      <Group id="time" title="Time zone">
        <Field label="Show dates and times in" htmlFor="tz" hint={profile.timeZoneFollowsDevice ? `Following this device (${systemTimeZone()}).` : "Pinned — won't change when you travel."}>
          <select
            id="tz"
            className="field"
            value={profile.timeZoneFollowsDevice ? "__device" : profile.timeZone}
            onChange={(e) =>
              e.target.value === "__device"
                ? update({ timeZoneFollowsDevice: true, timeZone: systemTimeZone() })
                : update({ timeZoneFollowsDevice: false, timeZone: e.target.value })
            }
          >
            <option value="__device">Device time zone ({systemTimeZone()})</option>
            {zones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Weeks start on">
          <Segmented
            label="Week start"
            value={String(profile.weekStartsOn) as "0" | "1"}
            onChange={(v) => update({ weekStartsOn: v === "0" ? 0 : 1 })}
            options={[
              { value: "1", label: "Monday" },
              { value: "0", label: "Sunday" },
            ]}
          />
        </Field>
      </Group>

      <Group id="astrology" title="Astrology conventions">
        <Field
          label="Zodiac"
          hint={
            profile.zodiac === "tropical"
              ? "Tropical: signs measured from the March equinox. The Western default."
              : "Sidereal: signs measured against the stars, using the Chitrapaksha ayanamsa (Spica at 0° Libra), ≈24° behind tropical today."
          }
        >
          <Segmented
            label="Zodiac"
            value={profile.zodiac}
            onChange={(zodiac) => update({ zodiac })}
            options={[
              { value: "tropical", label: "Tropical" },
              { value: "sidereal", label: "Sidereal" },
            ]}
          />
        </Field>
        <Field label="House system" hint="Placidus and other quadrant systems aren't supported yet.">
          <Segmented
            label="House system"
            value={profile.houseSystem}
            onChange={(houseSystem) => update({ houseSystem })}
            options={(["wholeSign", "equal"] as const).map((v) => ({ value: v, label: HOUSE_SYSTEM_LABEL[v] }))}
          />
        </Field>
        <Field label="Aspect orbs" hint="How far from exact an angle can be and still count. A matter of tradition.">
          <div className="grid gap-3 sm:grid-cols-2">
            {(Object.keys(DEFAULT_ORBS) as AspectKind[]).map((k) => (
              <label key={k} className="flex items-center gap-3 text-sm">
                <span className="w-24 text-muted">{ASPECT_LABEL[k]}</span>
                <input
                  type="range"
                  min={1}
                  max={12}
                  step={0.5}
                  value={profile.orbs[k]}
                  onChange={(e) => update((p) => ({ orbs: { ...p.orbs, [k]: Number(e.target.value) } }))}
                  className="flex-1 accent-[rgb(var(--gold))]"
                />
                <span className="num w-10 text-right">{profile.orbs[k]}°</span>
              </label>
            ))}
          </div>
          <button className="btn-ghost mt-2 -ml-3" onClick={() => update({ orbs: { ...DEFAULT_ORBS } })}>
            Reset orbs
          </button>
        </Field>
      </Group>

      <Group id="appearance" title="Appearance">
        <Segmented
          label="Theme"
          value={profile.theme}
          onChange={(theme) => update({ theme })}
          options={[
            { value: "system", label: "System" },
            { value: "dark", label: "Night" },
            { value: "light", label: "Paper" },
          ]}
        />
      </Group>

      <Group id="install" title="Install">
        <InstallHelp />
      </Group>

      <Group id="data" title="Your data" note="Stored in this browser's local storage under one key. Export to move it to another device.">
        <div className="flex flex-wrap gap-2">
          <button className="btn-outline" onClick={() => downloadFile("calwiz-profile.json", exportProfile(profile), "application/json")}>
            <Download size={16} aria-hidden /> Export
          </button>
          <button className="btn-outline" onClick={() => fileRef.current?.click()}>
            <Upload size={16} aria-hidden /> Import
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              try {
                replace(importProfile(await f.text()));
                setMessage("Profile imported.");
              } catch (err) {
                setMessage(`Import failed: ${err instanceof Error ? err.message : "invalid file"}`);
              }
            }}
          />
          {!confirmDelete ? (
            <button className="btn-ghost text-rose" onClick={() => setConfirmDelete(true)}>
              <Trash2 size={16} aria-hidden /> Delete all data
            </button>
          ) : (
            <span className="flex flex-wrap items-center gap-2 rounded-full border border-rose/50 px-3 py-1 text-sm">
              Delete birth details, location and settings from this device?
              <button
                className="btn-solid min-h-[36px] bg-rose text-bg"
                onClick={() => {
                  reset();
                  setConfirmDelete(false);
                  setMessage("All Calwiz data on this device was deleted.");
                }}
              >
                Delete
              </button>
              <button className="btn-ghost min-h-[36px]" onClick={() => setConfirmDelete(false)}>
                Cancel
              </button>
            </span>
          )}
        </div>
        {message && (
          <p role="status" className="text-sm text-muted">
            {message}
          </p>
        )}
      </Group>

      <p className="border-t border-line/60 py-8 text-sm text-muted">
        How every number is calculated, and what Calwiz can't do:{" "}
        <Link to="/about" className="link">
          Methods & limitations
        </Link>
        .
      </p>
    </Page>
  );
}
