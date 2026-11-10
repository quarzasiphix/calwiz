import { useMemo } from "react";
import { parallacticAngle } from "@/domain/astronomy/moon";
import { useProfile } from "@/features/profile/ProfileProvider";

/**
 * How to orient rendered Moon disks. With a saved location the disk is
 * rotated by the parallactic angle so it matches the observer's sky
 * (zenith up); otherwise celestial north is up.
 */
export function useMoonOrientation(instant: Date): { parallactic: number; label: string } {
  const { profile } = useProfile();
  const loc = profile.location;
  return useMemo(() => {
    if (!loc) return { parallactic: 0, label: "north up" };
    return { parallactic: parallacticAngle(instant, loc.latitude, loc.longitude), label: `as seen from ${loc.name.split(",")[0]}` };
  }, [loc, instant]);
}
