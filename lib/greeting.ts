export type Greeting = "Good morning" | "Good afternoon" | "Good evening";

/** Morning before 12:00, afternoon before 18:00, evening after that. */
export function getGreeting(date: Date): Greeting {
  const hour = date.getHours();

  if (hour < 12) {
    return "Good morning";
  }

  return hour < 18 ? "Good afternoon" : "Good evening";
}

/**
 * Turns the part of an email before the @ into a display name:
 * "jane.doe@example.com" becomes "Jane Doe". Returns null if nothing
 * usable is left.
 */
export function getDisplayName(email: string | null): string | null {
  const localPart = email?.split("@")[0] ?? "";
  const words = localPart.split(/[._+-]+/).filter(Boolean);

  if (words.length === 0) {
    return null;
  }

  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
