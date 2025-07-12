import { useAuthStore } from '../store/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

class ApiClient {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        // Get auth headers from store
        const authHeaders = useAuthStore.getState().getAuthHeaders();

        const config = {
            method: 'GET',
            headers: {
                ...authHeaders,
                ...options.headers,
            },
            credentials: 'include',
            ...options,
        };

        try {
            const response = await fetch(url, config);

            // Handle different response types
            const contentType = response.headers.get('content-type');

            let data;
            if (contentType?.includes('application/json')) {
                data = await response.json();
            } else if (contentType?.includes('text/')) {
                data = await response.text();
            } else {
                data = await response.blob();
            }

            if (!response.ok) {
                // Handle authentication errors
                if (response.status === 401) {
                    useAuthStore.getState().logout();
                    throw new Error('Authentication required');
                }

                const error = new Error(data.message || `HTTP error! status: ${response.status}`);
                error.status = response.status;
                error.data = data;
                throw error;
            }

            return data;
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            throw error;
        }
    }

    // HTTP Methods
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url);
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async patch(endpoint, data) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE',
        });
    }

    // File upload
    async upload(endpoint, formData) {
        const authHeaders = useAuthStore.getState().getAuthHeaders();
        delete authHeaders['Content-Type']; // Let browser set content-type for FormData

        return this.request(endpoint, {
            method: 'POST',
            headers: authHeaders,
            body: formData,
        });
    }

    // Download file
    async download(endpoint, filename) {
        const response = await this.request(endpoint, {
            headers: {
                ...useAuthStore.getState().getAuthHeaders(),
            },
        });

        // Create download link
        const blob = new Blob([response]);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Convenience methods for common API calls
export const api = {
    // Auth
    auth: {
        login: (email, password) => apiClient.post('/auth/login', { email, password }),
        logout: () => apiClient.post('/auth/logout'),
        getMe: () => apiClient.get('/auth/me'),
        refresh: () => apiClient.post('/auth/refresh'),
    },

    // Users
    users: {
        getAll: (params) => apiClient.get('/users', params),
        getById: (id) => apiClient.get(`/users/${id}`),
        update: (id, data) => apiClient.put(`/users/${id}`, data),
        delete: (id) => apiClient.delete(`/users/${id}`),
        toggleCardAccess: (id, hasAccess) => apiClient.put(`/users/${id}/card-access`, { hasCardAccess: hasAccess }),
        updateCardSettings: (id, settings) => apiClient.put(`/users/${id}/card-settings`, { cardSettings: settings }),
        getAnalytics: (id, params) => apiClient.get(`/users/${id}/analytics`, params),
    },

    // Cards
    cards: {
        getBySlug: (companySlug, userId) => apiClient.get(`/cards/${companySlug}/${userId}`),
        generateQR: (userId, params) => apiClient.get(`/cards/${userId}/qr`, params),
        downloadVCard: (userId) => apiClient.download(`/cards/${userId}/vcard`, 'contact.vcf'),
        recordInteraction: (userId, eventType, metadata) =>
            apiClient.post(`/cards/${userId}/interaction`, { eventType, metadata }),
        share: (userId, method, platform) =>
            apiClient.post(`/cards/${userId}/share`, { method, platform }),
    },

    // Analytics
    analytics: {
        getDashboard: (params) => apiClient.get('/analytics/dashboard', params),
        getUserAnalytics: (userId, params) => apiClient.get(`/analytics/users/${userId}`, params),
        export: (params) => apiClient.get('/analytics/export', params),
        getRealTime: (params) => apiClient.get('/analytics/realtime', params),
        getSummary: (params) => apiClient.get('/analytics/summary', params),
    },
};

export default apiClient; 