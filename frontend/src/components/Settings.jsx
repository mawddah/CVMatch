import React, { useState, useEffect } from 'react';
import { User, Settings, Shield, Bell, Users, Mail, Phone, MapPin, Globe, Camera, Trash2, Edit2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const SettingsView = ({ initialTab = 'profile' }) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { user: currentUser } = useAuth();

    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    useEffect(() => {
        if (activeTab === 'team' && currentUser?.role === 'Admin') {
            fetchUsers();
        }
    }, [activeTab, currentUser]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const data = await api.getUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.updateUserRole(userId, newRole);
            fetchUsers();
        } catch (error) {
            console.error("Failed to update role:", error);
            alert(error.response?.data?.detail || "Failed to update role");
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await api.deleteUser(userId);
            fetchUsers();
        } catch (error) {
            console.error("Failed to delete user:", error);
            alert(error.response?.data?.detail || "Failed to delete user");
        }
    };

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
                            <h3 className="text-xl font-black text-slate-900">{currentUser?.email?.split('@')[0] || "User"}</h3>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">{currentUser?.role || "Viewer"}</p>
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
                                    <input type="text" defaultValue={currentUser?.email?.split('@')[0] || ""} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
                                    <input type="email" defaultValue={currentUser?.email || ""} disabled className="w-full bg-slate-100 border-2 border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-500 cursor-not-allowed" />
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
                            {isLoading ? (
                                <div className="flex justify-center p-8">
                                    <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                                </div>
                            ) : users.length === 0 && currentUser?.role !== 'Admin' ? (
                                <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500">
                                    Access Denied. You must be an Admin to view team members.
                                </div>
                            ) : (
                                users.map(member => (
                                    <div key={member.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-white hover:bg-white hover:shadow-lg transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                                                <User className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{member.email}</p>
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Joined {new Date(member.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            {/* Role Selector */}
                                            <select
                                                value={member.role}
                                                onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                                disabled={member.email === currentUser.email} // Can't change own role easily here
                                                className={`text-xs font-black uppercase tracking-widest px-3 py-2 rounded-lg border-2 appearance-none cursor-pointer focus:outline-none ${member.role === 'Admin' ? 'bg-primary-50 text-primary-600 border-primary-200 focus:border-primary-500' : 'bg-slate-50 text-slate-600 border-slate-200 focus:border-slate-400'}`}
                                            >
                                                <option value="Admin">Admin</option>
                                                <option value="Viewer">Viewer</option>
                                            </select>
                                            
                                            {member.email !== currentUser.email && (
                                                <button 
                                                    onClick={() => handleDeleteUser(member.id)}
                                                    className="p-2 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-500"
                                                    title="Remove User"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsView;
