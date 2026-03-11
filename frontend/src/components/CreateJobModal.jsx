import React, { useState } from 'react';
import { X, Briefcase, FileText, Send, Save } from 'lucide-react';
import * as api from '../services/api';

const CreateJobModal = ({ isOpen, onClose, onJobCreated, onJobUpdated, initialData = null }) => {
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description_text || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData) {
                const data = await api.updateJob(initialData.id, title, description);
                onJobUpdated(data);
            } else {
                const data = await api.uploadJD(title, description);
                onJobCreated(data);
            }
            onClose();
            setTitle('');
            setDescription('');
        } catch (error) {
            console.error("Failed to process job:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border-white/20 border-4">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-500">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 leading-tight">
                                {initialData ? 'Edit Job Opening' : 'Create Job Opening'}
                            </h2>
                            <p className="text-slate-500 font-medium">
                                {initialData ? 'Update role details' : 'Define a new role for AI CV matching'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-slate-600 active:scale-90"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 uppercase tracking-widest mb-2">Job Title</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Senior Frontend Engineer"
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 uppercase tracking-widest mb-2">Job Description</label>
                        <textarea
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Paste the detailed JD here..."
                            rows={8}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-black py-5 px-8 rounded-3xl flex items-center justify-center gap-3 shadow-xl shadow-primary-500/30 transition-all active:scale-[0.98] group"
                    >
                        {loading ? 'Processing...' : (
                            <>
                                {initialData ? (
                                    <>
                                        <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        Save Changes
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        Publish Job Opening
                                    </>
                                )}
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateJobModal;
