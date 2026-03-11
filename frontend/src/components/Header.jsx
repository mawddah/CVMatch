import React, { useState } from 'react';
import { Search, Bell, Settings, User, LogOut, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = ({ activePage, onPageChange }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const navItems = ['Dashboard', 'AI CV Matching', 'Job Openings', 'Reports'];

    return (
        <header className="fixed top-0 left-0 right-0 h-16 glass z-50 flex items-center justify-between px-8 border-b border-white/20">
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => onPageChange('Dashboard')}>
                    <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/30">
                        C
                    </div>
                    <span className="text-xl font-black tracking-tight text-slate-900 uppercase">
                        CV<span className="text-primary-500">match</span>
                    </span>
                </div>
                <nav className="hidden md:flex items-center gap-6 text-sm font-bold">
                    {navItems.map(item => (
                        <button
                            key={item}
                            onClick={() => onPageChange(item)}
                            className={`transition-all relative py-1 ${activePage === item ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {item}
                            {activePage === item && (
                                <motion.div
                                    layoutId="navUnderline"
                                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-500 rounded-full"
                                />
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500" />
                    <input
                        type="text"
                        placeholder="Search candidates..."
                        className="pl-10 pr-4 py-2 bg-slate-100/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all w-64"
                    />
                </div>
                <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors relative">
                    <Bell className="w-5 h-5 text-slate-600" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 pl-4 border-l border-slate-200 group transition-all"
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-slate-900 leading-none group-hover:text-primary-600">Mawaddah</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">HR Manager</p>
                        </div>
                        <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center overflow-hidden border border-primary-100 shadow-sm transition-transform active:scale-95">
                            <User className="w-6 h-6 text-primary-500" />
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isProfileOpen && (
                            <>
                                <div className="fixed inset-0 z-[-1]" onClick={() => setIsProfileOpen(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 overflow-hidden"
                                >
                                    <div className="px-4 py-3 border-b border-slate-50 mb-1">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Signed in as</p>
                                        <p className="text-sm font-bold text-slate-900 truncate">mawaddah@cvmatch.ai</p>
                                    </div>
                                    <button
                                        onClick={() => { onPageChange('Profile Settings'); setIsProfileOpen(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary-600 transition-colors"
                                    >
                                        <User className="w-4 h-4" />
                                        Profile Settings
                                    </button>
                                    <button
                                        onClick={() => { onPageChange('Team Management'); setIsProfileOpen(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary-600 transition-colors"
                                    >
                                        <Settings className="w-4 h-4" />
                                        Team Management
                                    </button>
                                    <div className="h-px bg-slate-50 my-1 mx-2" />
                                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-bold">
                                        <LogOut className="w-4 h-4" />
                                        Log Out
                                    </button>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
};

export default Header;
