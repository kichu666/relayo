import { atom } from 'nanostores';

export type ThemeMode = 'amoled' | 'dark' | 'light';

const rawSaved = localStorage.getItem('relayo_theme');
const savedTheme: ThemeMode = (rawSaved === 'dark' || rawSaved === 'light' || rawSaved === 'amoled') ? rawSaved : 'amoled';

export const $themeStore = atom<ThemeMode>(savedTheme);

export function setTheme(mode: ThemeMode) {
  $themeStore.set(mode);
  try {
    localStorage.setItem('relayo_theme', mode);
  } catch (e) {
    // ignore
  }
  document.documentElement.setAttribute('data-theme', mode);
}

// Initial theme apply
if (typeof window !== 'undefined') {
  setTheme(savedTheme);
}
