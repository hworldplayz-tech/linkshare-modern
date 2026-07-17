import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  X, 
  Plus, 
  LogIn, 
  LogOut, 
  AlertCircle,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { User } from 'firebase/auth';
import { SiteSettings } from '../types';
import { Button } from './ui/Button';

interface NavbarProps {
  settings: SiteSettings;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onAddClick: () => void;
  authError?: string;
  authLoading?: boolean;
}

export const Navbar = ({ 
  settings, 
  user, 
  onLogin, 
  onLogout, 
  onAddClick,
  authError,
  authLoading 
}: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openMobileMenu, setOpenMobileMenu] = useState<string | null>(null);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          {settings.headerLogoUrl && (
            <img src={settings.headerLogoUrl} alt={settings.headerLogoText} className="h-10 w-auto object-contain" />
          )}
          <span className="text-2xl font-black tracking-tighter text-[#00a884]">{settings.headerLogoText}</span>
        </Link>

        <div className="hidden xl:flex items-center gap-8 text-sm font-medium text-gray-600 flex-nowrap">
          {settings.headerMenus.map((menu, mIndex) => (
            <div key={`${menu.id || mIndex}-${mIndex}`} className="relative group">
              {menu.dropdown && menu.dropdown.length > 0 ? (
                <>
                  <button className="flex items-center gap-1 hover:text-[#00a884] transition-colors whitespace-nowrap py-4">
                    {menu.label}
                    <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform" />
                  </button>
                  <div className="absolute top-full left-0 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-50">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 py-3 min-w-[200px]">
                      {menu.dropdown.map((drop, dIndex) => (
                        drop.href.startsWith('/') ? (
                          <Link 
                            key={`${drop.id || dIndex}-${dIndex}`} 
                            to={drop.href} 
                            className="block px-6 py-2.5 hover:bg-gray-50 hover:text-[#00a884] transition-colors"
                          >
                            {drop.label}
                          </Link>
                        ) : (
                          <a 
                            key={`${drop.id || dIndex}-${dIndex}`} 
                            href={drop.href} 
                            className="block px-6 py-2.5 hover:bg-gray-50 hover:text-[#00a884] transition-colors"
                          >
                            {drop.label}
                          </a>
                        )
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                menu.href.startsWith('/') ? (
                  <Link to={menu.href} className="hover:text-[#00a884] transition-colors whitespace-nowrap py-4 block">{menu.label}</Link>
                ) : (
                  <a href={menu.href} className="hover:text-[#00a884] transition-colors whitespace-nowrap py-4 block">{menu.label}</a>
                )
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {authError && (
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-full border border-red-100 animate-pulse">
              <AlertCircle className="w-3 h-3" /> {authError}
            </div>
          )}
          {user ? (
            <div className="flex items-center gap-3">
              <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-gray-200" />
              <Button variant="ghost" size="sm" onClick={onLogout} className="hidden xl:flex">
                <LogOut className="w-4 h-4" /> Sign Out
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={onLogin} className="hidden xl:flex" disabled={authLoading}>
              {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />} Sign In
            </Button>
          )}
          <Button size="sm" onClick={onAddClick} className="hidden xl:flex whitespace-nowrap">
            <Plus className="w-4 h-4" /> Add Group
          </Button>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 xl:hidden hover:bg-gray-100 rounded-xl transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden bg-white border-t border-gray-100 overflow-y-auto max-h-[calc(100vh-64px)]"
          >
            <div className="p-4 space-y-4">
              {settings.headerMenus.map((menu, mIndex) => (
                <div key={`${menu.id || mIndex}-${mIndex}`}>
                  {menu.dropdown && menu.dropdown.length > 0 ? (
                    <div className="space-y-1">
                      <button 
                        onClick={() => setOpenMobileMenu(openMobileMenu === menu.id ? null : menu.id)}
                        className="w-full flex items-center justify-between px-4 py-3 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-colors"
                      >
                        {menu.label}
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openMobileMenu === menu.id ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {openMobileMenu === menu.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="pl-6 space-y-1 overflow-hidden"
                          >
                            {menu.dropdown.map((drop, dIndex) => (
                              drop.href.startsWith('/') ? (
                                <Link 
                                  key={`${drop.id || dIndex}-${dIndex}`} 
                                  to={drop.href} 
                                  onClick={() => setIsMenuOpen(false)}
                                  className="block px-4 py-2.5 text-gray-500 font-medium hover:text-[#00a884] transition-colors"
                                >
                                  {drop.label}
                                </Link>
                              ) : (
                                <a 
                                  key={`${drop.id || dIndex}-${dIndex}`} 
                                  href={drop.href} 
                                  className="block px-4 py-2.5 text-gray-500 font-medium hover:text-[#00a884] transition-colors"
                                >
                                  {drop.label}
                                </a>
                              )
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    menu.href.startsWith('/') ? (
                      <Link 
                        to={menu.href} 
                        onClick={() => setIsMenuOpen(false)}
                        className="block px-4 py-3 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-colors"
                      >
                        {menu.label}
                      </Link>
                    ) : (
                      <a 
                        href={menu.href} 
                        className="block px-4 py-3 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-colors"
                      >
                        {menu.label}
                      </a>
                    )
                  )}
                </div>
              ))}
              <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-4">
                      <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-10 h-10 rounded-full border border-gray-200" />
                      <span className="font-bold text-gray-800">{user.displayName}</span>
                    </div>
                    <Button variant="ghost" onClick={onLogout} className="w-full justify-start">
                      <LogOut className="w-5 h-5" /> Sign Out
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={onLogin} className="w-full" disabled={authLoading}>
                    {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />} Sign In
                  </Button>
                )}
                <Button onClick={() => {
                  onAddClick();
                  setIsMenuOpen(false);
                }} className="w-full">
                  <Plus className="w-5 h-5" /> Add Group
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
