import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Download, TrendingUp, Users, CheckCircle, FileText } from 'lucide-react';
import { api } from '../services/api';

const Reports = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReportData();
    }, []);

    const fetchReportData = async () => {
        try {
            const result = await api.getReportSummary();
            setData(result);
        } catch (error) {
            console.error("Failed to fetch report summary:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const blob = await api.exportReportsExcel();
            // Create a link and trigger download
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'cvmatch_report.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Export failed:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    const avgScore = data.length > 0 ? Math.round(data.reduce((acc, curr) => acc + curr.score, 0) / data.length) : 0;
    const topMatches = data.filter(d => d.score >= 80).length;

    return (
        <div className="p-8 max-w-7xl mx-auto w-full flex-1 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight underline decoration-primary-500/30 decoration-8 underline-offset-4">Performance Reports</h1>
                    <p className="text-slate-500 font-medium mt-1">Real-time matching analytics and candidate insights</p>
                </div>

                <button
                    onClick={handleExport}
                    className="bg-primary-500 hover:bg-primary-600 text-white font-black py-4 px-8 rounded-2xl flex items-center gap-3 shadow-xl shadow-primary-500/30 transition-all active:scale-95 group"
                >
                    <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                    Export to Excel
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="glass p-6 rounded-[2rem] border-white/50 border-2">
                    <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-500 mb-4">
                        <Users className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total Scanned</p>
                    <h3 className="text-4xl font-black text-slate-900 mt-1">{data.length} <span className="text-sm text-slate-400 font-bold uppercase">Candidates</span></h3>
                </div>
                <div className="glass p-6 rounded-[2rem] border-white/50 border-2">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-4">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Avg Match %</p>
                    <h3 className="text-4xl font-black text-slate-900 mt-1">{avgScore}%</h3>
                </div>
                <div className="glass p-6 rounded-[2rem] border-white/50 border-2">
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mb-4">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Succesful Matches</p>
                    <h3 className="text-4xl font-black text-slate-900 mt-1">{topMatches} <span className="text-sm text-slate-400 font-bold uppercase">Qualified</span></h3>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass p-8 rounded-[2.5rem] border-white/40 border-2 shadow-2xl shadow-slate-200/50">
                    <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                        <div className="w-2 h-6 bg-primary-500 rounded-full" />
                        Match Percentage by Candidate
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="candidate"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={40}>
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.score >= 80 ? '#10b981' : entry.score >= 50 ? '#0ea5e9' : '#f43f5e'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass p-8 rounded-[2.5rem] border-white/40 border-2 shadow-2xl shadow-slate-200/50">
                    <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                        <div className="w-2 h-6 bg-primary-500 rounded-full" />
                        Job Distribution
                    </h3>
                    <div className="space-y-4">
                        {Array.from(new Set(data.map(d => d.job))).map(job => (
                            <div key={job} className="p-4 bg-white/50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-primary-200 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-500">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{job}</p>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{data.filter(d => d.job === job).length} Candidates</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-slate-900">
                                        {Math.round(data.filter(d => d.job === job).reduce((acc, curr) => acc + curr.score, 0) / data.filter(d => d.job === job).length)}%
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Avg score</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
