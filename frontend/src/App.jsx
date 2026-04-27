import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import CandidateCard from './components/CandidateCard';
import UploadModal from './components/UploadModal';
import AnalysisModal from './components/AnalysisModal';
import Reports from './components/Reports';
import JobOpenings from './components/JobOpenings';
import SettingsView from './components/Settings';
import CreateJobModal from './components/CreateJobModal';
import TeamManagement from './components/TeamManagement.tsx';
import { Plus, LayoutGrid, List } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { api } from './services/api';

function Dashboard() {
  const { logout, user } = useAuth();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [candidates, setCandidates] = useState([]);
  const [currentJdId, setCurrentJdId] = useState(null);
  const [activePage, setActivePage] = useState('Dashboard');
  const [availableJobs, setAvailableJobs] = useState([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (currentJdId) fetchCandidates();
  }, [currentJdId]);

  const fetchJobs = async () => {
    try {
      const data = await api.getJobs();
      setAvailableJobs(data);
      if (data.length > 0 && !currentJdId) {
        setCurrentJdId(data[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    }
  };

  const fetchCandidates = async () => {
    try {
      const data = await api.getCandidates(currentJdId);
      setCandidates(data);
    } catch (error) {
      console.error("Failed to fetch candidates:", error);
    }
  };

  const handleAnalysisComplete = async () => {
    try {
      await fetchCandidates();
      fetchJobs(); // Update counts
    } catch (error) {
      console.error("Refresh error:", error);
    }
  };

  const handleJobCreated = (newJob) => {
    fetchJobs();
    setCurrentJdId(newJob.id);
    setActivePage('Dashboard');
  };

  const handleJobUpdated = (updatedJob) => {
    fetchJobs();
    setEditingJob(null);
    setIsCreateJobOpen(false);
  };

  const handleDeleteJob = async (id) => {
    try {
      await api.deleteJob(id);
      fetchJobs();
      if (currentJdId === id) {
        setCurrentJdId(availableJobs.find(j => j.id !== id)?.id || null);
      }
    } catch (error) {
      console.error("Delete job error:", error);
    }
  };

  const handleViewPipeline = (id) => {
    setCurrentJdId(id);
    setActivePage('Dashboard');
  };

  const renderContent = () => {
    if (activePage === 'Reports') {
      return <Reports />;
    }

    if (activePage === 'Job Openings') {
      return (
        <JobOpenings
          jobs={availableJobs}
          onViewPipeline={handleViewPipeline}
          onEditJob={(job) => {
            setEditingJob(job);
            setIsCreateJobOpen(true);
          }}
          onDeleteJob={handleDeleteJob}
        />
      );
    }

    if (activePage === 'Profile Settings') {
      return <SettingsView initialTab="profile" />;
    }

    if (activePage === 'Team Management') {
      return <TeamManagement />;
    }

    if (activePage === 'Dashboard' || activePage === 'AI CV Matching') {
      return (
        <div className="p-8 max-w-7xl mx-auto w-full flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                {activePage === 'Dashboard' ? 'Recruitment Dashboard' : 'AI CV Matching'}
              </h1>
              <p className="text-slate-500 font-medium mt-1">
                Screening for: <span className="text-primary-600">{availableJobs.find(j => j.id === currentJdId)?.title || 'Selected Job'}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white border border-slate-200 rounded-xl p-1 flex shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-primary-500/20 transition-all active:scale-95"
              >
                <Plus className="w-5 h-5" />
                Add Candidates
              </button>
            </div>
          </div>

          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            <AnimatePresence>
              {candidates.map(candidate => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  onClick={() => setSelectedCandidate(candidate)}
                />
              ))}
            </AnimatePresence>
          </div>

          {candidates.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 bg-white/50 border border-dashed border-slate-200 rounded-[2rem]">
              <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300 mb-4">
                <Plus className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No candidates yet</h3>
              <p className="text-slate-500 mt-1 mb-6">Upload some CVs to start the AI matching process</p>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="text-primary-600 font-bold hover:underline"
              >
                Upload CVs now
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col items-center justify-center">
        <h2 className="text-3xl font-black text-slate-900">{activePage}</h2>
        <p className="text-slate-500 mt-2">This module is currently under development.</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Header activePage={activePage} onPageChange={setActivePage} onLogout={logout} onUploadClick={() => setIsUploadOpen(true)} selectedJob={currentJdId} />
      <Sidebar
        currentJdId={currentJdId}
        onJobSelect={setCurrentJdId}
        jobs={availableJobs}
        onCreateJobOpening={() => setIsCreateJobOpen(true)}
      />

      <main className="flex-1 pl-72 pt-16 min-h-screen flex flex-col">
        {renderContent()}

        <footer className="p-8 pt-0 max-w-7xl mx-auto w-full text-[10px] text-slate-400 font-medium flex justify-between uppercase tracking-widest">
          <span>&copy; 2026 CVMatch AI Screening Tool</span>
          <span>Powered by Gemini 1.5 Flash</span>
        </footer>
      </main>

      <AnimatePresence>
        {isUploadOpen && (
          <UploadModal
            isOpen={isUploadOpen}
            onClose={() => setIsUploadOpen(false)}
            onAnalysisComplete={handleAnalysisComplete}
            currentJdId={currentJdId}
          />
        )}
        {isCreateJobOpen && (
          <CreateJobModal
            isOpen={isCreateJobOpen}
            onClose={() => {
              setIsCreateJobOpen(false);
              setEditingJob(null);
            }}
            onJobCreated={handleJobCreated}
            onJobUpdated={handleJobUpdated}
            initialData={editingJob}
          />
        )}
        {selectedCandidate && (
          <AnalysisModal candidate={selectedCandidate} onClose={() => setSelectedCandidate(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
