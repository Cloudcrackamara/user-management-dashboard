import { cn } from "@/lib/cn";

type AvatarProps = {
  /** Full name; the initials are derived from it. */
  name: string;
  /** Any stable number (e.g. an id). Picks the colour deterministically. */
  colorSeed: number;
};

/** The same four tones as the dashboard stat cards. */
const COLOR_CLASSES = [
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
] as const;

/** First letter of the first and last words: "Leanne Graham" gives "LG". */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.charAt(0) ?? "";
  const last = words.length > 1 ? (words.at(-1)?.charAt(0) ?? "") : "";

  return (first + last).toUpperCase();
}

/** Decorative initials badge. Show the name as text next to it. */
export function Avatar({ name, colorSeed }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
        COLOR_CLASSES[Math.abs(colorSeed) % COLOR_CLASSES.length],
      )}
    >
      {getInitials(name)}
    </span>
  );
}
