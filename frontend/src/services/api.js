import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_URL,
});

export const uploadJD = async (title, description) => {
    const response = await api.post(`/upload-jd/?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`);
    return response.data;
};

export const getJobs = async () => {
    const response = await api.get('/jobs/');
    return response.data;
};

export const deleteJob = async (jdId) => {
    const response = await api.delete(`/jobs/${jdId}`);
    return response.data;
};

export const updateJob = async (jdId, title, description) => {
    const response = await api.put(`/jobs/${jdId}?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`);
    return response.data;
};

export const uploadCV = async (jdId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/upload-cv/?jd_id=${jdId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getCandidates = async (jdId) => {
    const response = await api.get(`/candidates/${jdId}/`);
    return response.data;
};

export const getReportSummary = async () => {
    const response = await api.get('/reports/summary');
    return response.data;
};

export const downloadReport = async () => {
    const response = await api.get('/reports/export', {
        responseType: 'blob',
    });

    // Create a link and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'cvmatch_report.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
};

export default api;
