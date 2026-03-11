import { Briefcase, Users, Calendar, ChevronRight, MoreHorizontal, CheckCircle2, Clock, Edit2, Trash2 } from 'lucide-react';

const JobOpenings = ({ jobs, onViewPipeline, onEditJob, onDeleteJob }) => {
    return (
        <div className="p-8 max-w-7xl mx-auto w-full flex-1 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight underline decoration-primary-500/30 decoration-8 underline-offset-4">Job Openings</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage and track your active recruitment pipelines</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm text-sm font-bold text-slate-600">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        {jobs.length} Active Roles
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {jobs.map(job => (
                    <div key={job.id} className="glass p-6 rounded-[2rem] border-white/50 border-2 hover:border-primary-200 transition-all group cursor-pointer shadow-xl shadow-slate-200/50">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-all duration-500">
                                    <Briefcase className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 group-hover:text-primary-600 transition-colors">{job.title}</h3>
                                    <div className="flex items-center gap-4 mt-1">
                                        <div className="flex items-center gap-1.5 text-slate-400 text-sm font-bold uppercase tracking-wider">
                                            <Calendar className="w-3.5 h-3.5" />
                                            Posted 2 days ago
                                        </div>
                                        <div className="flex items-center gap-1.5 text-emerald-500 text-sm font-bold uppercase tracking-wider">
                                            <Clock className="w-3.5 h-3.5" />
                                            Active
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-10">
                                <div className="text-center">
                                    <p className="text-2xl font-black text-slate-900 leading-none">{job.count}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Candidates</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-black text-emerald-500 leading-none">{Math.floor(job.count * 0.3)}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Qualified</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onViewPipeline(job.id)}
                                        className="bg-slate-900 text-white font-black py-3 px-6 rounded-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2"
                                    >
                                        View Pipeline
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => onEditJob(job)}
                                            className="p-3 hover:bg-primary-50 rounded-xl transition-colors text-slate-400 hover:text-primary-500"
                                            title="Edit Job"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (window.confirm(`Are you sure you want to delete "${job.title}"? This will remove all associated candidates and match results.`)) {
                                                    onDeleteJob(job.id);
                                                }
                                            }}
                                            className="p-3 hover:bg-red-50 rounded-xl transition-colors text-slate-400 hover:text-red-500"
                                            title="Delete Job"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {jobs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-white/50 border border-dashed border-slate-200 rounded-[3rem]">
                    <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300 mb-4">
                        <Briefcase className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">No active job openings</h3>
                    <p className="text-slate-500 mt-1">Click the 'Create Job Opening' button to start hiring</p>
                </div>
            )}
        </div>
    );
};

export default JobOpenings;
