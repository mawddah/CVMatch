import React from 'react';
import { User, Settings, Shield, Bell, Users, Mail, Phone, MapPin, Globe, Camera } from 'lucide-react';

const SettingsView = ({ activeTab = 'profile' }) => {
    return (
        <div className="p-8 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-10">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                    {activeTab === 'profile' ? 'Profile Settings' : 'Team Management'}
                </h1>
                <p className="text-slate-500 font-medium mt-1">
                    {activeTab === 'profile' ? 'Manage your personal information and preferences' : 'Manage your team members and their permissions'}
                </p>
            </div>

            {activeTab === 'profile' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="glass p-8 rounded-[2.5rem] border-white/50 border-2 text-center shadow-xl shadow-slate-200/30">
                            <div className="relative inline-block group mb-4">
                                <div className="w-32 h-32 bg-primary-100 rounded-[2.5rem] flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
                                    <User className="w-16 h-16 text-primary-500" />
                                </div>
                                <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-2xl shadow-lg border border-slate-100 flex items-center justify-center text-primary-500 hover:scale-110 active:scale-95 transition-all">
                                    <Camera className="w-5 h-5" />
                                </button>
                            </div>
                            <h3 className="text-xl font-black text-slate-900">Mawaddah</h3>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">HR Manager</p>
                        </div>

                        <div className="glass p-6 rounded-[2rem] border-white/50 border-2 shadow-lg shadow-slate-200/20">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Security Status</h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-600">2FA Enabled</span>
                                    <div className="w-10 h-5 bg-emerald-100 rounded-full relative">
                                        <div className="absolute right-1 top-1 w-3 h-3 bg-emerald-500 rounded-full" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-600">Login Alerts</span>
                                    <div className="w-10 h-5 bg-primary-100 rounded-full relative">
                                        <div className="absolute right-1 top-1 w-3 h-3 bg-primary-500 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-8">
                        <div className="glass p-8 rounded-[2.5rem] border-white/50 border-2 shadow-xl shadow-slate-200/30">
                            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                <div className="w-2 h-6 bg-primary-500 rounded-full" />
                                Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Full Name</label>
                                    <input type="text" defaultValue="Mawaddah" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
                                    <input type="email" defaultValue="mawaddah@cvmatch.ai" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Phone Number</label>
                                    <input type="text" defaultValue="+966 50 000 0000" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Location</label>
                                    <input type="text" defaultValue="Riyadh, Saudi Arabia" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all" />
                                </div>
                            </div>
                            <button className="mt-8 bg-primary-500 hover:bg-primary-600 text-white font-black py-4 px-10 rounded-2xl shadow-lg shadow-primary-500/20 transition-all active:scale-95">
                                Save Profile Changes
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="glass p-8 rounded-[2.5rem] border-white/50 border-2 shadow-xl shadow-slate-200/30">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                <div className="w-2 h-6 bg-primary-500 rounded-full" />
                                Team Members
                            </h3>
                            <button className="bg-primary-500 hover:bg-primary-600 text-white font-black py-3 px-6 rounded-xl text-sm shadow-lg shadow-primary-500/20 transition-all active:scale-95">
                                Add Member
                            </button>
                        </div>

                        <div className="space-y-4">
                            {[
                                { name: 'Sarah Ahmed', role: 'Senior Recruiter', email: 'sarah@cvmatch.ai', status: 'Active' },
                                { name: 'Khalid Mohammed', role: 'Technical Interviewer', email: 'khalid@cvmatch.ai', status: 'Active' },
                                { name: 'Laila Ali', role: 'HR Coordinator', email: 'laila@cvmatch.ai', status: 'Inactive' }
                            ].map(member => (
                                <div key={member.email} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-white hover:bg-white hover:shadow-lg transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{member.name}</p>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{member.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="hidden md:block">
                                            <p className="text-sm font-bold text-slate-600">{member.email}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${member.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                                            {member.status}
                                        </span>
                                        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
                                            <Settings className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsView;
