import { useStore } from '@nanostores/react';
import { $themeStore, setTheme, type ThemeMode } from '../logic/themeStore';
import { Moon, Sun, MoonStar } from 'lucide-react';

export function ThemeSwitcher() {
  const currentTheme = useStore($themeStore);

  const themes: Array<{ id: ThemeMode; label: string; icon: any }> = [
    { id: 'amoled', label: 'AMOLED', icon: Moon },
    { id: 'dark', label: 'Dark', icon: MoonStar },
    { id: 'light', label: 'Light', icon: Sun },
  ];

  return (
    <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-medium backdrop-blur-md">
      {themes.map((item) => {
        const Icon = item.icon;
        const isActive = currentTheme === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setTheme(item.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              isActive
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title={`Switch to ${item.label} Theme`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
