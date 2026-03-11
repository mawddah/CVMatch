import React from 'react';
import { User, GraduationCap, Briefcase, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const CandidateCard = ({ candidate, onClick }) => {
    const getMatchColor = (score) => {
        if (score >= 80) return 'text-emerald-500 bg-emerald-50 border-emerald-100';
        if (score >= 60) return 'text-amber-500 bg-amber-50 border-amber-100';
        return 'text-red-500 bg-red-50 border-red-100';
    };

    const getMatchBorder = (score) => {
        if (score >= 80) return 'before:bg-emerald-500';
        if (score >= 60) return 'before:bg-amber-500';
        return 'before:bg-red-500';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, shadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
            onClick={onClick}
            className={`relative p-5 glass rounded-2xl cursor-pointer transition-all before:absolute before:left-0 before:top-4 before:bottom-4 before:w-1 ${getMatchBorder(candidate.match_percentage)} before:rounded-r-full shadow-sm`}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex gap-4">
                    <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 overflow-hidden shrink-0">
                        {candidate.avatar ? <img src={candidate.avatar} alt="" /> : <User className="w-8 h-8 text-slate-300" />}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">{candidate.name}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                            <Briefcase className="w-3 h-3" />
                            {candidate.experience_years} Years Experience
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <GraduationCap className="w-3 h-3" />
                            {candidate.education}
                        </p>
                    </div>
                </div>
                <div className={`px-3 py-1.5 rounded-lg border text-sm font-bold flex flex-col items-center ${getMatchColor(candidate.match_percentage)}`}>
                    <span className="text-[10px] font-bold uppercase tracking-tight opacity-70">Match</span>
                    {candidate.match_percentage}%
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                {candidate.skills.slice(0, 4).map(skill => (
                    <span key={skill} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold">
                        {skill}
                    </span>
                ))}
                {candidate.skills.length > 4 && (
                    <span className="px-2 py-1 bg-slate-100 text-slate-400 rounded text-[10px] font-semibold">
                        +{candidate.skills.length - 4} more
                    </span>
                )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100/50">
                <span className="text-[10px] text-slate-400 font-medium">Applied 2 hours ago</span>
                <button className="text-primary-500 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider hover:gap-2 transition-all">
                    View Details
                    <ChevronRight className="w-3 h-3" />
                </button>
            </div>
        </motion.div>
    );
};

export default CandidateCard;
