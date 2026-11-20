// Satu-satunya file yang menyentuh localStorage. Naikkan VERSION jika bentuk data berubah (lalu buat migrasi).
const VERSION = 'v1';
const PREFIX = `devwork:${VERSION}:`;

export function read(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function write(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (err) {
    // Biasanya QuotaExceededError (batas sekitar 5 MB).
    console.error('Gagal menyimpan ke localStorage:', err);
  }
}
