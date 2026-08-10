import { X, Home, BookOpen, HelpCircle, ShieldCheck, FileText, Mail, Coffee } from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';

export type PageView = 'home' | 'resources' | 'faq' | 'contact' | 'privacy' | 'terms';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
}

export function NavigationDrawer({
  isOpen,
  onClose,
  currentPage,
  onNavigate,
}: NavigationDrawerProps) {
  if (!isOpen) return null;

  const navItems: { id: PageView; label: string; icon: typeof Home }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'resources', label: 'Resources & Learn', icon: BookOpen },
    { id: 'faq', label: 'Frequently Asked Questions', icon: HelpCircle },
    { id: 'contact', label: 'Contact Us', icon: Mail },
    { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck },
    { id: 'terms', label: 'Terms & Conditions', icon: FileText },
  ];

  const handleItemClick = (page: PageView) => {
    onNavigate(page);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Heavy Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Solid Opaque Navigation Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-80 sm:w-96 bg-[#090D16] [html[data-theme=light]_&]:bg-white border-l border-white/15 [html[data-theme=light]_&]:border-slate-200 shadow-2xl p-6 flex flex-col justify-between relative z-10 transition-transform duration-300 ease-out">
          
          {/* Drawer Header with Consolidated Branding */}
          <div>
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10 [html[data-theme=light]_&]:border-slate-200">
              <div className="flex items-center">
                <span className="font-sans font-extrabold uppercase text-base sm:text-lg tracking-tighter text-white [html[data-theme=light]_&]:text-[#1D1D1F] leading-none">
                  RELAYO
                </span>
                <span className="text-xs font-mono text-cyan-400 [html[data-theme=light]_&]:text-cyan-600 font-semibold tracking-wide leading-none ml-0.5">
                  .space
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 [html[data-theme=light]_&]:bg-slate-100 hover:bg-white/10 [html[data-theme=light]_&]:hover:bg-slate-200 text-slate-300 [html[data-theme=light]_&]:text-slate-700 transition-colors cursor-pointer"
                title="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation List */}
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer text-left ${
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 [html[data-theme=light]_&]:bg-cyan-50 [html[data-theme=light]_&]:text-cyan-700 [html[data-theme=light]_&]:border-cyan-200 shadow-sm'
                        : 'text-slate-300 [html[data-theme=light]_&]:text-slate-700 hover:bg-white/5 [html[data-theme=light]_&]:hover:bg-slate-100 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400 [html[data-theme=light]_&]:text-cyan-600' : 'text-slate-400 [html[data-theme=light]_&]:text-slate-500'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* Support Us / Buy Me a Coffee */}
              <a
                href="https://www.buymeacoffee.com/relayo"
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer text-left text-slate-300 [html[data-theme=light]_&]:text-slate-700 hover:bg-amber-500/15 hover:text-amber-300 [html[data-theme=light]_&]:hover:bg-amber-50 [html[data-theme=light]_&]:hover:text-amber-700 border border-transparent"
              >
                <Coffee className="w-4 h-4 shrink-0 text-amber-400 [html[data-theme=light]_&]:text-amber-600" />
                <span>Support Us</span>
              </a>
            </nav>
          </div>

          {/* Drawer Footer — Theme Switcher anchored at bottom-right */}
          <div className="pt-6 border-t border-white/10 [html[data-theme=light]_&]:border-slate-200 flex items-center justify-end">
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </div>
  );
}
