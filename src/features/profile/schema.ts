/**
 * The user's profile and preferences. Stored only on this device
 * (localStorage); never sent anywhere except, when the user explicitly asks,
 * the parts listed in the AI request preview.
 */
import { z } from "zod";
import { isCivilDate, isValidTimeZone, systemTimeZone } from "@/domain/time/civil";
import { DEFAULT_ORBS } from "@/domain/astrology/aspects";

export const PROFILE_VERSION = 1;

const civil = z.string().refine(isCivilDate, "Invalid date");
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM");
const tz = z.string().refine(isValidTimeZone, "Unknown time zone");

export const placeSchema = z.object({
  name: z.string().min(1).max(120),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timeZone: tz,
});
export type StoredPlace = z.infer<typeof placeSchema>;

export const layersSchema = z.object({
  moon: z.boolean(),
  numbers: z.boolean(),
  events: z.boolean(),
  personal: z.boolean(),
});
export type Layers = z.infer<typeof layersSchema>;

export const profileSchema = z.object({
  version: z.literal(PROFILE_VERSION),
  name: z.string().max(60).optional(),
  birth: z
    .object({
      date: civil,
      /** Omitted when unknown — houses and Ascendant are then not calculated. */
      time: time.optional(),
      place: placeSchema.optional(),
    })
    .optional(),
  /** Where the user observes from (rise/set, Moon orientation). Optional. */
  location: placeSchema.optional(),
  /** The zone the calendar is displayed in. Defaults to the device zone. */
  timeZone: tz,
  /** True until the user explicitly picks a zone; then device changes don't override it. */
  timeZoneFollowsDevice: z.boolean(),
  zodiac: z.enum(["tropical", "sidereal"]),
  houseSystem: z.enum(["wholeSign", "equal"]),
  orbs: z.object({ conjunction: z.number(), sextile: z.number(), square: z.number(), trine: z.number(), opposition: z.number() }),
  weekStartsOn: z.union([z.literal(0), z.literal(1)]),
  theme: z.enum(["system", "dark", "light"]),
  layers: layersSchema,
  onboarded: z.boolean(),
});
export type Profile = z.infer<typeof profileSchema>;

export function defaultWeekStart(): 0 | 1 {
  try {
    const loc = new Intl.Locale(navigator.language) as Intl.Locale & { weekInfo?: { firstDay: number }; getWeekInfo?: () => { firstDay: number } };
    const info = loc.getWeekInfo?.() ?? loc.weekInfo;
    if (info) return info.firstDay === 7 ? 0 : 1;
  } catch {
    /* fall through */
  }
  return 1;
}

export function defaultProfile(): Profile {
  return {
    version: PROFILE_VERSION,
    timeZone: systemTimeZone(),
    timeZoneFollowsDevice: true,
    zodiac: "tropical",
    houseSystem: "wholeSign",
    orbs: { ...DEFAULT_ORBS },
    weekStartsOn: typeof navigator === "undefined" ? 1 : defaultWeekStart(),
    theme: "system",
    layers: { moon: true, numbers: true, events: true, personal: true },
    onboarded: false,
  };
}
