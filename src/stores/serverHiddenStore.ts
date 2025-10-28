import { create } from 'zustand';
import { dataApi } from '../utils/dataApi';

export interface HiddenPhoto {
  photoId: string;
  eventId: string;
  hiddenAt: string;
  reason?: string;
}

interface ServerHiddenStore {
  hiddenPhotos: Record<string, HiddenPhoto>;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  hidePhoto: (photoId: string, eventId: string, reason?: string) => Promise<void>;
  unhidePhoto: (photoId: string) => Promise<void>;
  isPhotoHidden: (photoId: string) => boolean;
  getHiddenPhotos: (eventId?: string) => HiddenPhoto[];
  togglePhotoHidden: (photoId: string, eventId: string) => Promise<void>;
  
  // Bulk actions
  hideMultiplePhotos: (photoIds: string[], eventId: string, reason?: string) => Promise<void>;
  unhideAll: (eventId?: string) => Promise<void>;
  
  // Data management
  loadFromServer: () => Promise<void>;
  saveToServer: () => Promise<void>;
  
  // Export/Import (still available as backup)
  exportHidden: () => string;
  importHidden: (jsonData: string) => boolean;
}

const useServerHiddenStore = create<ServerHiddenStore>((set, get) => ({
  hiddenPhotos: {},
  isLoading: false,
  error: null,

  loadFromServer: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await dataApi.get<{ hiddenPhotos: Record<string, HiddenPhoto> }>('hidden');
      set({ 
        hiddenPhotos: data.hiddenPhotos || {},
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to load hidden photos from server:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false 
      });
      // Fallback to localStorage if server fails
      const localData = localStorage.getItem('hidden-photos');
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          set({ hiddenPhotos: parsed.state?.hiddenPhotos || {} });
        } catch (e) {
          console.error('Failed to parse local hidden photos:', e);
        }
      }
    }
  },

  saveToServer: async () => {
    try {
      const { hiddenPhotos } = get();
      await dataApi.save('hidden', { hiddenPhotos });
      set({ error: null });
    } catch (error) {
      console.error('Failed to save hidden photos to server:', error);
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  },

  hidePhoto: async (photoId, eventId, reason) => {
    // Optimistic update
    set((state) => ({
      hiddenPhotos: {
        ...state.hiddenPhotos,
        [photoId]: {
          photoId,
          eventId,
          hiddenAt: new Date().toISOString(),
          reason,
        },
      },
    }));

    // Save to server
    try {
      await get().saveToServer();
    } catch (error) {
      // Revert optimistic update on failure
      set((state) => {
        const { [photoId]: removed, ...rest } = state.hiddenPhotos;
        return { hiddenPhotos: rest };
      });
      throw error;
    }
  },

  unhidePhoto: async (photoId) => {
    // Store the removed item for potential rollback
    const removedItem = get().hiddenPhotos[photoId];
    
    // Optimistic update
    set((state) => {
      const { [photoId]: removed, ...rest } = state.hiddenPhotos;
      return { hiddenPhotos: rest };
    });

    // Save to server
    try {
      await get().saveToServer();
    } catch (error) {
      // Revert optimistic update on failure
      if (removedItem) {
        set((state) => ({
          hiddenPhotos: {
            ...state.hiddenPhotos,
            [photoId]: removedItem,
          },
        }));
      }
      throw error;
    }
  },

  isPhotoHidden: (photoId) => {
    return !!get().hiddenPhotos[photoId];
  },

  getHiddenPhotos: (eventId) => {
    const hidden = Object.values(get().hiddenPhotos);
    if (eventId) {
      return hidden.filter(h => h.eventId === eventId);
    }
    return hidden;
  },

  togglePhotoHidden: async (photoId, eventId) => {
    const isHidden = get().isPhotoHidden(photoId);
    if (isHidden) {
      await get().unhidePhoto(photoId);
    } else {
      await get().hidePhoto(photoId, eventId);
    }
  },

  hideMultiplePhotos: async (photoIds, eventId, reason) => {
    const timestamp = new Date().toISOString();
    const previousState = get().hiddenPhotos;
    
    // Optimistic update
    set((state) => {
      const newHidden = { ...state.hiddenPhotos };
      photoIds.forEach(photoId => {
        newHidden[photoId] = {
          photoId,
          eventId,
          hiddenAt: timestamp,
          reason,
        };
      });
      return { hiddenPhotos: newHidden };
    });

    // Save to server
    try {
      await get().saveToServer();
    } catch (error) {
      // Revert to previous state on failure
      set({ hiddenPhotos: previousState });
      throw error;
    }
  },

  unhideAll: async (eventId) => {
    const previousState = get().hiddenPhotos;
    
    // Optimistic update
    if (!eventId) {
      set({ hiddenPhotos: {} });
    } else {
      set((state) => {
        const filtered = Object.entries(state.hiddenPhotos)
          .filter(([_, hidden]) => hidden.eventId !== eventId)
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
        return { hiddenPhotos: filtered };
      });
    }

    // Save to server
    try {
      await get().saveToServer();
    } catch (error) {
      // Revert to previous state on failure
      set({ hiddenPhotos: previousState });
      throw error;
    }
  },

  exportHidden: () => {
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      hiddenPhotos: get().hiddenPhotos,
    };
    return JSON.stringify(data, null, 2);
  },

  importHidden: (jsonData) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.version && data.hiddenPhotos) {
        set({ hiddenPhotos: data.hiddenPhotos });
        // Auto-save to server after import
        get().saveToServer().catch(console.error);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import hidden photos:', error);
      return false;
    }
  },
}));

export default useServerHiddenStore;