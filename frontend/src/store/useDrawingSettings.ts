import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DrawingSettingsState {
  favorites: string[];
  magnetMode: boolean;
  magnetStrength: 'weak' | 'strong';
  snapToIndicators: boolean;
  lockMode: boolean;
  stayInDrawingMode: boolean;
  
  hiddenLayers: {
    drawings: boolean;
    indicators: boolean;
    positions: boolean;
  };
  
  favoritesPosition: { x: number; y: number } | null;
  favoritesOrientation: 'horizontal' | 'vertical';
  isFavoritesCollapsed: boolean;
  
  toggleFavorite: (toolId: string) => void;
  setMagnetMode: (enabled: boolean) => void;
  setMagnetStrength: (strength: 'weak' | 'strong') => void;
  setSnapToIndicators: (enabled: boolean) => void;
  setLockMode: (enabled: boolean) => void;
  setStayInDrawingMode: (enabled: boolean) => void;
  
  setHiddenLayer: (layer: keyof DrawingSettingsState['hiddenLayers'], hidden: boolean) => void;
  hideAll: () => void;

  setFavoritesPosition: (pos: { x: number; y: number } | null) => void;
  setFavoritesOrientation: (orientation: 'horizontal' | 'vertical') => void;
  setIsFavoritesCollapsed: (collapsed: boolean) => void;
}

export const useDrawingSettings = create<DrawingSettingsState>()(
  persist(
    (set) => ({
      favorites: ['trendline', 'hline', 'vline'], // Default favorites
      magnetMode: false,
      magnetStrength: 'strong',
      snapToIndicators: false,
      lockMode: false,
      stayInDrawingMode: false,
      
      hiddenLayers: {
        drawings: false,
        indicators: false,
        positions: false,
      },

      favoritesPosition: null,
      favoritesOrientation: 'horizontal',
      isFavoritesCollapsed: false,

      toggleFavorite: (toolId) =>
        set((state) => ({
          favorites: state.favorites.includes(toolId)
            ? state.favorites.filter((id) => id !== toolId)
            : [...state.favorites, toolId],
        })),
      
      setMagnetMode: (magnetMode) => set({ magnetMode }),
      setMagnetStrength: (magnetStrength) => set({ magnetStrength }),
      setSnapToIndicators: (snapToIndicators) => set({ snapToIndicators }),
      setLockMode: (lockMode) => set({ lockMode }),
      setStayInDrawingMode: (stayInDrawingMode) => set({ stayInDrawingMode }),
      
      setHiddenLayer: (layer, hidden) => 
        set((state) => ({ hiddenLayers: { ...state.hiddenLayers, [layer]: hidden } })),
        
      hideAll: () => 
        set({ hiddenLayers: { drawings: true, indicators: true, positions: true } }),

      setFavoritesPosition: (favoritesPosition) => set({ favoritesPosition }),
      setFavoritesOrientation: (favoritesOrientation) => set({ favoritesOrientation }),
      setIsFavoritesCollapsed: (isFavoritesCollapsed) => set({ isFavoritesCollapsed }),
    }),
    {
      name: 'drawing-settings-storage',
    }
  )
);
