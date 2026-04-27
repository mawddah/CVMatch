import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { ShieldAlert, UserCog, User, Shield, Briefcase, Mail, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserData {
    id: number;
    email: string;
    role: string;
    created_at: string;
}

const TeamManagement: React.FC = () => {
    const { user } = useAuth();
    const [team, setTeam] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.role === 'Admin') {
            loadTeam();
        } else {
            setLoading(false);
        }
    }, [user]);

    const loadTeam = async () => {
        setLoading(true);
        try {
            const data = await api.getUsers();
            setTeam(data);
        } catch (error) {
            console.error("Failed to load team", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: number, newRole: string) => {
        try {
            await api.updateUserRole(userId, newRole);
            loadTeam();
        } catch (error: any) {
            console.error("Failed to update role:", error);
            alert(error.response?.data?.detail || "Failed to update role");
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await api.deleteUser(userId);
            loadTeam();
        } catch (error: any) {
            console.error("Failed to delete user:", error);
            alert(error.response?.data?.detail || "Failed to delete user");
        }
    };

    if (loading) {
        return <div className="p-8 flex justify-center text-slate-400">Loading team data...</div>;
    }

    if (user?.role !== 'Admin') {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[500px]"
            >
                <div className="w-24 h-24 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 mb-6 border border-red-100 shadow-sm shadow-red-100">
                    <ShieldAlert className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">Access Denied</h2>
                <p className="text-slate-500 max-w-md mx-auto text-lg">
                    You do not have the required permissions to view the Team Management page. This area is strictly reserved for Administrators.
                </p>
            </motion.div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto w-full">
            <header className="mb-10 flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <UserCog className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-900">Team Management</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage active members and their access levels.</p>
                </div>
            </header>

            <div className="bg-white border text-center border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8 bg-slate-50">
                    {team.map((member) => (
                        <div key={member.id} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex flex-col hover:border-indigo-100 transition-colors">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl">
                                    {member.email.charAt(0).toUpperCase()}
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${member.role === 'Admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {member.role === 'Admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                    {member.role}
                                </span>
                            </div>
                            
                            <h3 className="text-lg font-bold text-slate-900 truncate" title={member.email}>
                                {member.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1 mb-6 truncate" title={member.email}>
                                <Mail className="w-3.5 h-3.5 shrink-0" />
                                {member.email}
                            </div>
                            
                            <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                                <select
                                    value={member.role}
                                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                    disabled={member.email === user?.email}
                                    className={`text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border-2 appearance-none cursor-pointer focus:outline-none flex-1 ${member.role === 'Admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-100 focus:border-indigo-300' : 'bg-slate-50 text-slate-600 border-slate-200 focus:border-slate-300'}`}
                                >
                                    <option value="Admin">Admin</option>
                                    <option value="Viewer">Viewer</option>
                                </select>

                                {member.email !== user?.email && (
                                    <button 
                                        onClick={() => handleDeleteUser(member.id)}
                                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors border-2 border-transparent hover:border-red-100"
                                        title="Delete User"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <div className="pt-3 flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                                <span>Joined</span>
                                <span>{new Date(member.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TeamManagement;
