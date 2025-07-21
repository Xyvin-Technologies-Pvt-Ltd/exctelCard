import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export const useUIStore = create(subscribeWithSelector((set, get) => ({
  // Sidebar state
  isSidebarOpen: false,
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  // Modal states
  modals: {
    activityView: { isOpen: false, data: null },
    shareMenu: { isOpen: false },
    ssoConfig: { isOpen: false },
  },
  
  openModal: (modalName, data = null) => set((state) => ({
    modals: {
      ...state.modals,
      [modalName]: { isOpen: true, data }
    }
  })),
  
  closeModal: (modalName) => set((state) => ({
    modals: {
      ...state.modals,
      [modalName]: { isOpen: false, data: null }
    }
  })),

  // Tab states
  activeTab: {
    admin: 'users',
    qrcode: 'manage',
    activity: 'all'
  },
  
  setActiveTab: (page, tab) => set((state) => ({
    activeTab: {
      ...state.activeTab,
      [page]: tab
    }
  })),

  // Filter states
  filters: {
    activity: { type: 'all', timeRange: 'all' },
    admin: { search: '' }
  },
  
  setFilter: (page, filterKey, value) => set((state) => ({
    filters: {
      ...state.filters,
      [page]: {
        ...state.filters[page],
        [filterKey]: value
      }
    }
  })),

  // Copy states
  copyStates: {
    profileLink: false,
    directLink: false,
    shareLink: false
  },
  
  setCopyState: (key, value) => set((state) => ({
    copyStates: {
      ...state.copyStates,
      [key]: value
    }
  })),

  // Reset copy state after timeout
  resetCopyState: (key) => {
    set((state) => ({
      copyStates: {
        ...state.copyStates,
        [key]: true
      }
    }));
    setTimeout(() => {
      set((state) => ({
        copyStates: {
          ...state.copyStates,
          [key]: false
        }
      }));
    }, 2000);
  }
}))); 