import { atom } from 'nanostores';

export type ThemeMode = 'amoled' | 'light' | 'monochrome';

const savedTheme = (localStorage.getItem('relayo_theme') as ThemeMode) || 'amoled';

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
