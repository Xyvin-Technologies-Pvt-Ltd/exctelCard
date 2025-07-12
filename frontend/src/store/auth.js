import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useAuthStore = create(
    subscribeWithSelector((set, get) => ({
        user: null,
        token: localStorage.getItem('token'),
        isLoading: false,
        isAuthenticated: false,

        // Actions
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        setToken: (token) => {
            if (token) {
                localStorage.setItem('token', token);
            } else {
                localStorage.removeItem('token');
            }
            set({ token });
        },
        setLoading: (isLoading) => set({ isLoading }),

        // Login with email/password (admin)
        login: async (email, password) => {
            set({ isLoading: true });
            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                    credentials: 'include',
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Login failed');
                }

                const { token, user } = data;
                get().setToken(token);
                get().setUser(user);

                return { success: true };
            } catch (error) {
                console.error('Login error:', error);
                return { success: false, error: error.message };
            } finally {
                set({ isLoading: false });
            }
        },

        // SSO Login redirects
        loginWithGoogle: () => {
            window.location.href = `${API_BASE_URL}/auth/google`;
        },

        loginWithMicrosoft: () => {
            window.location.href = `${API_BASE_URL}/auth/microsoft`;
        },

        // Handle SSO callback
        handleSSOCallback: async (token, userData) => {
            try {
                get().setToken(token);

                if (userData) {
                    const user = typeof userData === 'string' ? JSON.parse(userData) : userData;
                    get().setUser(user);
                } else {
                    // Fetch user data with token
                    await get().fetchUser();
                }

                return { success: true };
            } catch (error) {
                console.error('SSO callback error:', error);
                return { success: false, error: error.message };
            }
        },

        // Fetch current user
        fetchUser: async () => {
            const { token } = get();
            if (!token) return { success: false, error: 'No token' };

            try {
                const response = await fetch(`${API_BASE_URL}/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    credentials: 'include',
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to fetch user');
                }

                get().setUser(data.data);
                return { success: true, user: data.data };
            } catch (error) {
                console.error('Fetch user error:', error);
                get().logout();
                return { success: false, error: error.message };
            }
        },

        // Logout
        logout: async () => {
            const { token } = get();

            try {
                if (token) {
                    await fetch(`${API_BASE_URL}/auth/logout`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                        credentials: 'include',
                    });
                }
            } catch (error) {
                console.error('Logout error:', error);
            } finally {
                get().setToken(null);
                get().setUser(null);
                set({ isAuthenticated: false });
            }
        },

        // Update user profile
        updateProfile: async (userData) => {
            const { token, user } = get();
            if (!token || !user) return { success: false, error: 'Not authenticated' };

            set({ isLoading: true });
            try {
                const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(userData),
                    credentials: 'include',
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to update profile');
                }

                get().setUser(data.data);
                return { success: true, user: data.data };
            } catch (error) {
                console.error('Update profile error:', error);
                return { success: false, error: error.message };
            } finally {
                set({ isLoading: false });
            }
        },

        // Initialize auth state
        initialize: async () => {
            const { token } = get();
            if (token) {
                await get().fetchUser();
            }
        },

        // Check if user has specific role
        hasRole: (role) => {
            const { user } = get();
            if (!user) return false;
            return user.role === role;
        },

        // Check if user has any of the specified roles
        hasAnyRole: (roles) => {
            const { user } = get();
            if (!user) return false;
            return roles.includes(user.role);
        },

        // Get API headers with auth
        getAuthHeaders: () => {
            const { token } = get();
            return {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
            };
        },
    }))
);

// Initialize auth on store creation
useAuthStore.getState().initialize(); 