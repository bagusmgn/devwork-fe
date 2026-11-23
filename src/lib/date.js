// Semua fungsi memakai tanggal LOKAL (bukan UTC), format YYYY-MM-DD seperti <input type="date">.
const pad = (n) => String(n).padStart(2, '0');
export const toDateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayStr = () => toDateStr(new Date());
const parse = (s) => new Date(`${s}T00:00:00`);

export function addDays(dateStr, n) {
  const d = parse(dateStr);
  d.setDate(d.getDate() + n);
  return toDateStr(d);
}

// Senin sampai Minggu dari minggu yang memuat dateStr.
export function weekRange(dateStr = todayStr()) {
  const diff = (parse(dateStr).getDay() + 6) % 7; // Senin = 0
  const start = addDays(dateStr, -diff);
  return [start, addDays(start, 6)];
}

export function formatMinutes(total) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (!h) return `${m}m`;
  return m ? `${h}j ${m}m` : `${h}j`;
}

export const formatShort = (s) => parse(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
export const formatDay = (s) => parse(s).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
export const formatLongDate = (d = new Date()) =>
  d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
