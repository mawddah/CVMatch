import React, { useState, useEffect } from 'react';
import { Upload, X, FileText, Database, Search, CheckSquare, Square, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Candidate {
    id: number;
    name: string;
    email: string;
    skills: string;
}

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAnalysisComplete: () => Promise<void>;
    currentJdId: number | null;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onAnalysisComplete, currentJdId }) => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'Admin';

    const [files, setFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    
    // Selection Pool states
    const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCandidateIds, setSelectedCandidateIds] = useState<Set<number>>(new Set());

    // Deletion states
    const [deleteState, setDeleteState] = useState<{ isOpen: boolean; type: 'single' | 'bulk'; id?: number }>({ isOpen: false, type: 'single' });
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchAllCandidates();
            // Reset state when opening
            setFiles([]);
            setSearchQuery("");
            setSelectedCandidateIds(new Set());
        }
    }, [isOpen]);

    const fetchAllCandidates = async () => {
        try {
            const data = await api.getAllCandidates();
            setAllCandidates(data);
        } catch (error) {
            console.error("Failed to fetch all candidates:", error);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...newFiles]);
            
            // Automatically store in DB and select them
            setIsUploading(true);
            try {
                for (const file of newFiles) {
                    const newCandidate = await api.storeCV(file);
                    setAllCandidates(prev => [newCandidate, ...prev]);
                    setSelectedCandidateIds(prev => new Set(prev).add(newCandidate.id));
                }
            } catch (error: any) {
                console.error("Failed to auto-store CV:", error);
                const errorMsg = error.response?.data?.detail || error.message || "Unknown error";
                alert(`Failed to upload CV: ${errorMsg}`);
            } finally {
                setIsUploading(false);
            }
        }
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const toggleCandidateSelection = (id: number) => {
        setSelectedCandidateIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const toggleSelectAll = () => {
        if (selectedCandidateIds.size === filteredCandidates.length) {
            setSelectedCandidateIds(new Set());
        } else {
            setSelectedCandidateIds(new Set(filteredCandidates.map(c => c.id)));
        }
    };

    const handleAnalyze = async () => {
        if (!currentJdId) {
            alert("Please select or create a Job Description first.");
            return;
        }
        if (selectedCandidateIds.size === 0) {
            alert("Please select at least one candidate to analyze.");
            return;
        }

        setIsUploading(true);
        try {
            await api.analyzeMatches(currentJdId, Array.from(selectedCandidateIds));
            await onAnalysisComplete();
            onClose();
        } catch (error: any) {
            console.error("Analysis failed:", error);
            const errorMsg = error.response?.data?.detail || error.message || "Unknown error";
            alert(`Analysis failed: ${errorMsg}`);
        } finally {
            setIsUploading(false);
        }
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            if (deleteState.type === 'single' && deleteState.id) {
                await api.deleteCandidate(deleteState.id);
                setSelectedCandidateIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(deleteState.id!);
                    return newSet;
                });
            } else if (deleteState.type === 'bulk') {
                await api.bulkDeleteCandidates(Array.from(selectedCandidateIds));
                setSelectedCandidateIds(new Set());
            }
            await fetchAllCandidates();
            setDeleteState({ isOpen: false, type: 'single' });
        } catch (error: any) {
            console.error("Delete failed:", error);
            const errorMsg = error.response?.data?.detail || error.message || "Unknown error";
            alert(`Delete failed: ${errorMsg}`);
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredCandidates = allCandidates.filter(c => {
        const nameMatch = c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase());
        
        let skillsMatch = false;
        if (c.skills) {
            if (Array.isArray(c.skills)) {
                skillsMatch = c.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
            } else if (typeof c.skills === 'string') {
                skillsMatch = (c.skills as string).toLowerCase().includes(searchQuery.toLowerCase());
            }
        }
        
        return nameMatch || skillsMatch;
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
                <div className="p-8 pb-4 flex-shrink-0">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">Add Candidates to Job</h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <X className="w-6 h-6 text-slate-400" />
                        </button>
                    </div>

                    <div className="flex gap-6">
                        {/* Drag and Drop Zone */}
                        <div className="flex-1 relative border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center transition-colors group hover:border-primary-400">
                            <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                accept=".pdf,.doc,.docx"
                            />
                            <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-500 mb-3 group-hover:scale-110 group-hover:bg-primary-500 group-hover:text-white transition-all">
                                <Upload className="w-6 h-6" />
                            </div>
                            <p className="text-base font-semibold text-slate-900">Upload new CVs</p>
                            <p className="text-xs text-slate-500 mt-1">Supports PDF & DOCX</p>
                            
                            {isUploading && (
                                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                                </div>
                            )}
                        </div>

                        {/* Uploaded Files List (if any) */}
                        {files.length > 0 && (
                            <div className="flex-1 overflow-y-auto max-h-40 pr-2">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Just Uploaded ({files.length})</h3>
                                <div className="space-y-2">
                                    <AnimatePresence>
                                        {files.map((file, index) => (
                                            <motion.div
                                                key={file.name + index}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                className="flex items-center justify-between p-2 bg-slate-50 rounded-xl"
                                            >
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <FileText className="w-4 h-4 text-primary-500 flex-shrink-0" />
                                                    <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                                                </div>
                                                <button onClick={() => removeFile(index)} className="p-1 hover:bg-red-50 rounded-full group">
                                                    <X className="w-3 h-3 text-slate-400 group-hover:text-red-500 transition-colors" />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* CV Selection Pool */}
                <div className="flex-1 overflow-hidden flex flex-col px-8 pb-4">
                    <div className="flex items-center justify-between mt-4 mb-4">
                        <div className="flex items-center gap-4">
                            <h3 className="text-lg font-bold text-slate-800">CV Selection Pool</h3>
                            {isAdmin && selectedCandidateIds.size > 0 && (
                                <button
                                    onClick={() => setDeleteState({ isOpen: true, type: 'bulk' })}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-semibold transition-colors border border-red-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Selected ({selectedCandidateIds.size})
                                </button>
                            )}
                        </div>
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search candidates..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all w-64"
                            />
                        </div>
                    </div>
                    
                    <div className="flex items-center mb-3 px-2 text-sm text-slate-500">
                        <button 
                            onClick={toggleSelectAll} 
                            className="flex items-center gap-2 hover:text-slate-800 transition-colors"
                        >
                            {selectedCandidateIds.size === filteredCandidates.length && filteredCandidates.length > 0 ? (
                                <CheckSquare className="w-4 h-4 text-primary-500" />
                            ) : (
                                <Square className="w-4 h-4" />
                            )}
                            <span className="font-medium">Select All</span>
                        </button>
                        <span className="ml-auto">{selectedCandidateIds.size} selected</span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar border border-slate-100 rounded-xl p-2 bg-slate-50/50">
                        {filteredCandidates.length === 0 ? (
                            <div className="text-center text-slate-500 py-8">
                                No candidates found in the database.
                            </div>
                        ) : (
                            filteredCandidates.map((candidate) => (
                                <div 
                                    key={candidate.id}
                                    className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all border ${
                                        selectedCandidateIds.has(candidate.id) 
                                            ? 'bg-primary-50 border-primary-200 shadow-sm' 
                                            : 'bg-white border-white hover:border-slate-200'
                                    }`}
                                >
                                    <div className="flex-1 flex items-center gap-4 min-w-0" onClick={() => toggleCandidateSelection(candidate.id)}>
                                        {selectedCandidateIds.has(candidate.id) ? (
                                            <CheckSquare className="w-5 h-5 text-primary-500 flex-shrink-0" />
                                        ) : (
                                            <Square className="w-5 h-5 text-slate-300 flex-shrink-0" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-900 truncate">{candidate.name || "Unknown Candidate"}</p>
                                            <p className="text-xs text-slate-500 truncate">{candidate.skills || "No skills extracted"}</p>
                                        </div>
                                    </div>
                                    {isAdmin && (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeleteState({ isOpen: true, type: 'single', id: candidate.id });
                                            }}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                            title="Delete Candidate"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center flex-shrink-0">
                    <button onClick={onClose} className="px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleAnalyze}
                        disabled={selectedCandidateIds.size === 0 || isUploading}
                        className="py-3 px-6 rounded-xl font-semibold bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 transition-all shadow-lg shadow-primary-500/20 flex items-center gap-2"
                    >
                        {isUploading ? "Processing..." : `Start Analyzing (${selectedCandidateIds.size})`}
                    </button>
                </div>

                {/* Confirmation Modal */}
                {deleteState.isOpen && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm rounded-3xl">
                        <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-xl">
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Confirm Deletion</h3>
                            <p className="text-slate-600 mb-6">
                                Are you sure you want to delete {deleteState.type === 'bulk' ? `${selectedCandidateIds.size} selected CVs` : 'this CV'}? This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button 
                                    onClick={() => setDeleteState({ isOpen: false, type: 'single' })}
                                    disabled={isDeleting}
                                    className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    className="px-4 py-2 font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-lg shadow-red-500/20 transition-all flex items-center gap-2"
                                >
                                    {isDeleting ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default UploadModal;
