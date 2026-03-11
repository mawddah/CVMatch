import React from 'react';
import { X, CheckCircle2, AlertCircle, TrendingUp, Heart, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AnalysisModal = ({ candidate, onClose }) => {
    if (!candidate) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-8">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 30 }}
                className="relative bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]"
            >
                {/* Left Side: Summary & Scores */}
                <div className="w-full md:w-80 bg-slate-50 p-8 border-r border-slate-100 flex flex-col">
                    <div className="flex justify-between items-center mb-8 md:hidden">
                        <h2 className="text-xl font-bold">Analysis</h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full"><X /></button>
                    </div>

                    <div className="text-center mb-8">
                        <div className="relative inline-block">
                            <svg className="w-32 h-32 transform -rotate-90">
                                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200" />
                                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="364.4" strokeDashoffset={364.4 * (1 - candidate.match_percentage / 100)} className="text-primary-500 transition-all duration-1000 ease-out" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black text-slate-900">{candidate.match_percentage}%</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Match</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-primary-600">
                                    <Heart className="w-4 h-4 fill-current" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Culture Fit</span>
                                </div>
                                <span className="text-sm font-bold text-slate-900">{candidate.culture_fit_score}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-primary-500 h-full rounded-full transition-all duration-1000" style={{ width: `${candidate.culture_fit_score}%` }}></div>
                            </div>
                        </div>

                        <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Key Skills Found</h4>
                            <div className="flex flex-wrap gap-2">
                                {candidate.skills.map(skill => (
                                    <span key={skill} className="px-2 py-1 bg-primary-50 text-primary-600 rounded-md text-[10px] font-bold">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-8">
                        <button className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
                            <Download className="w-4 h-4" />
                            Export Report
                        </button>
                    </div>
                </div>

                {/* Right Side: Detailed Analysis */}
                <div className="flex-1 overflow-y-auto p-8 md:p-12 relative">
                    <button onClick={onClose} className="hidden md:flex absolute top-8 right-8 p-2 hover:bg-slate-100 rounded-full transition-colors group">
                        <X className="w-6 h-6 text-slate-400 group-hover:text-slate-900" />
                    </button>

                    <header className="mb-12">
                        <h1 className="text-3xl font-black text-slate-900 mb-2">{candidate.name}</h1>
                        <p className="text-slate-500 font-medium">Applied for Senior React Developer</p>
                    </header>

                    <div className="grid md:grid-cols-2 gap-8 mb-12">
                        <section>
                            <h3 className="flex items-center gap-2 text-emerald-600 font-bold mb-4 uppercase tracking-wider text-sm">
                                <CheckCircle2 className="w-5 h-5" />
                                Key Strengths
                            </h3>
                            <div className="space-y-3">
                                {candidate.strengths.split('\n').map((point, idx) => (
                                    <div key={idx} className="flex gap-3 text-slate-600 text-sm leading-relaxed">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0"></span>
                                        {point.replace(/^- /, '')}
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h3 className="flex items-center gap-2 text-amber-600 font-bold mb-4 uppercase tracking-wider text-sm">
                                <AlertCircle className="w-5 h-5" />
                                Areas for Improvement
                            </h3>
                            <div className="space-y-3">
                                {candidate.weaknesses.split('\n').map((point, idx) => (
                                    <div key={idx} className="flex gap-3 text-slate-600 text-sm leading-relaxed">
                                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 shrink-0"></span>
                                        {point.replace(/^- /, '')}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <section className="bg-primary-50 rounded-3xl p-8 border border-primary-100">
                        <h3 className="flex items-center gap-2 text-primary-600 font-bold mb-4 uppercase tracking-wider text-sm">
                            <TrendingUp className="w-5 h-5" />
                            Soft Skills Analysis
                        </h3>
                        <p className="text-slate-700 text-sm leading-relaxed italic">
                            "{candidate.soft_skills_analysis}"
                        </p>
                    </section>
                </div>
            </motion.div>
        </div>
    );
};

export default AnalysisModal;
