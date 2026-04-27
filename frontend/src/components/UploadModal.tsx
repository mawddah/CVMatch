import React, { useState } from 'react';
import { Upload, X, FileText, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (file: File) => Promise<void>;
    currentJdId: number | null;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUpload, currentJdId }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles([...files, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleAnalyze = async () => {
        if (!currentJdId) {
            alert("Please select or create a Job Description first.");
            return;
        }
        setIsUploading(true);
        try {
            for (const file of files) {
                await onUpload(file);
            }
            onClose();
            setFiles([]);
        } catch (error: any) {
            console.error("Upload failed:", error);
            const errorMsg = error.response?.data?.detail || error.message || "Unknown error";
            alert(`Upload failed: ${errorMsg}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleStoreOnly = async () => {
        setIsUploading(true);
        try {
            for (const file of files) {
                await api.storeCV(file);
            }
            alert("Successfully stored CVs in the database for later analysis!");
            onClose();
            setFiles([]);
        } catch (error: any) {
            console.error("Store failed:", error);
            const errorMsg = error.response?.data?.detail || error.message || "Unknown error";
            alert(`Store failed: ${errorMsg}`);
        } finally {
            setIsUploading(false);
        }
    };

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
                className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
            >
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">Upload CVs</h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <X className="w-6 h-6 text-slate-400" />
                        </button>
                    </div>

                    <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center transition-colors group hover:border-primary-400">
                        <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            accept=".pdf,.doc,.docx"
                        />
                        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-500 mb-4 group-hover:scale-110 group-hover:bg-primary-500 group-hover:text-white transition-all">
                            <Upload className="w-8 h-8" />
                        </div>
                        <p className="text-lg font-semibold text-slate-900">Click or drag CVs here</p>
                        <p className="text-sm text-slate-500">Supports PDF & DOCX up to 10MB each</p>
                    </div>

                    <div className="mt-8">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Files selected ({files.length})</h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            <AnimatePresence>
                                {files.map((file, index) => (
                                    <motion.div
                                        key={file.name + index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                                <FileText className="w-5 h-5 text-primary-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 truncate max-w-[300px]">{file.name}</p>
                                                <p className="text-[10px] text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                        <button onClick={() => removeFile(index)} className="p-1 hover:bg-red-50 rounded-full group">
                                            <X className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
                    <button onClick={onClose} className="px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition-colors">
                        Cancel
                    </button>
                    <div className="flex-1 flex gap-3 justify-end relative">
                        <button
                            onClick={handleStoreOnly}
                            disabled={files.length === 0 || isUploading}
                            className="flex items-center gap-2 py-3 px-6 rounded-xl font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-50 transition-all"
                            title="Save the CV content to database without running JD matching yet."
                        >
                            <Database className="w-4 h-4" />
                            Add to Database
                        </button>
                        <button
                            onClick={handleAnalyze}
                            disabled={files.length === 0 || isUploading}
                            className="py-3 px-6 rounded-xl font-semibold bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 transition-all shadow-lg shadow-primary-500/20"
                        >
                            {isUploading ? "Processing..." : "Start Analyzing"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default UploadModal;
