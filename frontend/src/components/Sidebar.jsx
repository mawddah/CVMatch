import React from 'react';
import { Briefcase, Plus, Users, Settings, LogOut, ChevronRight, FileText, Filter } from 'lucide-react'; // Updated imports based on provided snippet
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ currentJdId, onJobSelect, jobs, onCreateJobOpening }) => {
    const { user } = useAuth();
    return (
        <aside className="w-72 fixed left-0 top-16 bottom-0 p-6 overflow-y-auto border-r border-slate-200 bg-white/30 backdrop-blur-sm">
            {/* The original "Create Job Opening" button is removed as per the instruction's implied replacement */}

            <div className="space-y-6">
                <div>
                    <div className="flex items-center justify-between px-2 mb-4"> {/* Adjusted px-2 from px-3 mb-2 to match original structure */}
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Openings</h3> {/* Kept original h3 styling */}
                        {user?.role === 'Admin' && (
                            <button
                                onClick={onCreateJobOpening}
                                className="p-1 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors"
                                title="Create New Opening"
                            >
                                <Plus size={14} />
                            </button>
                        )}
                    </div>
                    <div className="space-y-1">
                        {jobs.map(job => (
                            <button
                                key={job.id}
                                onClick={() => onJobSelect(job.id)}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300 ${currentJdId === job.id ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-slate-600 hover:bg-slate-100'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <FileText className={`w-4 h-4 ${currentJdId === job.id ? 'text-white' : 'text-primary-500'}`} />
                                    <span className="text-sm font-bold truncate">{job.title}</span>
                                </div>
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-lg ${currentJdId === job.id ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                                    {job.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between px-2 mb-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filters</h3>
                        <button className="text-[10px] text-primary-500 font-bold uppercase tracking-tighter">Reset</button>
                    </div>

                    <div className="space-y-4">
                        <div className="px-2">
                            <label className="text-xs font-semibold text-slate-600 mb-2 block">Match Score</label>
                            <input type="range" className="w-full accent-primary-500" />
                            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                <span>0%</span>
                                <span>100%</span>
                            </div>
                        </div>

                        <div className="px-2">
                            <label className="text-xs font-semibold text-slate-600 mb-2 block">Experience</label>
                            <select className="w-full bg-white border border-slate-200 rounded-lg text-sm p-2 outline-none focus:ring-1 focus:ring-primary-500">
                                <option>All levels</option>
                                <option>Junior (0-2 yrs)</option>
                                <option>Mid (3-5 yrs)</option>
                                <option>Senior (5+ yrs)</option>
                            </select>
                        </div>

                        <div className="px-2">
                            <label className="text-xs font-semibold text-slate-600 mb-2 block">Education</label>
                            <div className="space-y-2">
                                {['Bachelor\'s', 'Master\'s', 'PhD'].map(edu => (
                                    <label key={edu} className="flex items-center gap-2 cursor-pointer group">
                                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500" />
                                        <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{edu}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
