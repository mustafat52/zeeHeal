/**
 * Returns a real time-of-day greeting instead of a hardcoded "Good
 * morning" — previously every home page said "Good morning" regardless
 * of actual time.
 */
export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}