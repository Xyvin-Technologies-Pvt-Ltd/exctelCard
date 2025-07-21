import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export const useProfileStore = create(
  subscribeWithSelector((set, get) => ({
    // Copy states for profile sharing
    copyStates: {
      shareLink: false,
    },

    // Set copy state
    setCopyState: (key, value) =>
      set((state) => ({
        copyStates: {
          ...state.copyStates,
          [key]: value,
        },
      })),

    // Reset copy state with timeout
    resetCopyState: (key) => {
      set((state) => ({
        copyStates: {
          ...state.copyStates,
          [key]: true,
        },
      }));
      setTimeout(() => {
        set((state) => ({
          copyStates: {
            ...state.copyStates,
            [key]: false,
          },
        }));
      }, 2000);
    },

    // Form state management
    formState: {
      isDirty: false,
      hasUnsavedChanges: false,
    },

    setFormDirty: (isDirty) =>
      set((state) => ({
        formState: {
          ...state.formState,
          isDirty,
          hasUnsavedChanges: isDirty,
        },
      })),

    clearFormState: () =>
      set({
        formState: {
          isDirty: false,
          hasUnsavedChanges: false,
        },
      }),

    // URL generation helper - simplified to only generate direct shareable URL
    generateUrls: (profile) => {
      const directShareableUrl = `${window.location.origin}/share/${
        profile?.shareId || ""
      }`;

      return {
        directShareableUrl,
        hasShareId: !!profile?.shareId,
      };
    },

    // Copy functionality
    copyToClipboard: async (text, stateKey) => {
      try {
        await navigator.clipboard.writeText(text);
        get().resetCopyState(stateKey);
        return true;
      } catch (err) {
        console.error("Failed to copy: ", err);
        return false;
      }
    },
  }))
);
