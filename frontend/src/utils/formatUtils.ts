/**
 * Zwraca względny opis daty: "Dzisiaj", "Jutro", "Za X dni" lub datę w formacie krótkim.
 */
export function formatDateRelative(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Dzisiaj';
  if (diffDays === 1) return 'Jutro';
  if (diffDays === -1) return 'Wczoraj';
  if (diffDays > 1 && diffDays <= 7) return `Za ${diffDays} dni`;
  if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} dni temu`;
  return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Formatuje liczbę minut na "~X h Y min" (np. 150 -> "~2 h 30 min").
 */
export function formatDuration(minutes: number | null | undefined): string | null {
  if (minutes == null || minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `~${m} min`;
  if (m === 0) return `~${h} h`;
  return `~${h} h ${m} min`;
}
