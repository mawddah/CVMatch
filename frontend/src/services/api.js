import axios from 'axios';

// Use environment variable if set; otherwise, use '/api' for production and 'http://localhost:8000' for local dev
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:8000');

const apiClient = axios.create({
  baseURL: API_URL,
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // --- AUTHENTICATION ---
  login: async (email, password) => {
    // OAuth2PasswordRequestForm expects form data, not JSON
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await apiClient.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data;
  },
  register: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await apiClient.post('/auth/register', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data;
  },

  // --- CV & JOBS ---
  uploadJD: async (title, description) => {
    const response = await apiClient.post('/upload-jd/', null, {
      params: { title, description }
    });
    return response.data;
  },
  getJobs: async () => {
    const response = await apiClient.get('/jobs/');
    return response.data;
  },
  deleteJob: async (jdId) => {
    const response = await apiClient.delete(`/jobs/${jdId}`);
    return response.data;
  },
  updateJob: async (jdId, title, description) => {
    const response = await apiClient.put(`/jobs/${jdId}`, null, {
        params: { title, description }
    });
    return response.data;
  },
  uploadCV: async (jdId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(`/upload-cv/?jd_id=${jdId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  storeCV: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(`/store-cv/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  summarizeCandidate: async (id) => {
    const response = await apiClient.post(`/candidates/${id}/summarize`);
    return response.data;
  },
  getCandidates: async (jdId) => {
    const response = await apiClient.get(`/candidates/${jdId}/`);
    return response.data;
  },
  getAllCandidates: async () => {
    const response = await apiClient.get('/candidates/');
    return response.data;
  },
  deleteCandidate: async (candidateId) => {
    const response = await apiClient.delete(`/candidates/${candidateId}`);
    return response.data;
  },
  bulkDeleteCandidates: async (candidateIds) => {
    const response = await apiClient.delete('/candidates/bulk', {
      data: { candidate_ids: candidateIds }
    });
    return response.data;
  },
  analyzeMatches: async (jdId, candidateIds) => {
    const response = await apiClient.post('/analyze-matches/', {
      jd_id: jdId,
      candidate_ids: candidateIds
    });
    return response.data;
  },
  
  // --- REPORTS ---
  getReportSummary: async () => {
    const response = await apiClient.get('/reports/summary');
    return response.data;
  },
  exportReportsExcel: async () => {
    const response = await apiClient.get('/reports/export', {
      responseType: 'blob'
    });
    return response.data;
  },

  // --- USER MANAGEMENT (Admin) ---
  getUsers: async () => {
    const response = await apiClient.get('/users/');
    return response.data;
  },
  updateUserRole: async (userId, role) => {
    const response = await apiClient.put(`/users/${userId}/role`, null, {
      params: { new_role: role }
    });
    return response.data;
  },
  deleteUser: async (userId) => {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  }
};
