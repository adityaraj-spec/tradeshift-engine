import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SerializedDrawing {
  id?: string;
  type: string;
  options: any;
  points?: any[];
  text?: string;
}

export interface DrawingTemplate {
  id: string;
  name: string;
  tags: string[];
  category: string;
  data: SerializedDrawing[]; // Serialized drawing tool state
  thumbnail: string; // Base64 chart snapshot
  timestamp: number;
}

export interface IndicatorTemplate {
  id: string;
  name: string;
  indicatorIds: string[]; // e.g. ['SMA', 'RSI']
  settings: any; // IndicatorSettingsMap
  timestamp: number;
}

export interface ToolTemplate {
  id: string;
  toolId: string; // e.g. 'trendline'
  name: string;
  settings: any;
  timestamp: number;
}

export interface ChartObject {
  id: string;
  type: 'indicator' | 'drawing';
  name: string;
  color: string;
  visible: boolean;
  locked: boolean;
  zIndex: number;
}

interface ChartObjectsState {
  objects: ChartObject[];
  addObject: (obj: ChartObject) => void;
  removeObject: (id: string) => void;
  toggleVisibility: (id: string) => void;
  toggleLock: (id: string) => void;
  updateObject: (id: string, updates: Partial<ChartObject>) => void;
  reorder: (fromIndex: number, toIndex: number) => void;
  syncIndicators: (activeIds: string[], colorMap: Record<string, string>) => void;
  syncDrawings: (drawingIds: string[]) => void;
  clear: () => void;
  
  // Drawing data for persistence
  drawings: SerializedDrawing[];
  setDrawings: (drawings: SerializedDrawing[]) => void;
  
  // Template actions
  templates: DrawingTemplate[];
  indicatorTemplates: IndicatorTemplate[];
  toolTemplates: ToolTemplate[];
  
  setTemplates: (templates: DrawingTemplate[]) => void;
  saveTemplate: (template: DrawingTemplate) => void;
  deleteTemplate: (id: string) => void;
  
  setToolTemplates: (templates: ToolTemplate[]) => void;
  saveToolTemplate: (template: ToolTemplate) => void;
  deleteToolTemplate: (id: string) => void;

  saveIndicatorTemplate: (template: IndicatorTemplate) => void;
  deleteIndicatorTemplate: (id: string) => void;
}

export const useChartObjects = create<ChartObjectsState>()(
  persist(
    (set) => ({
      objects: [],
      drawings: [],

      setDrawings: (drawings: SerializedDrawing[]) => set({ drawings }),

      addObject: (obj: ChartObject) =>
        set((state) => {
          if (state.objects.find((o) => o.id === obj.id)) return state;
          return { objects: [...state.objects, obj] };
        }),

      removeObject: (id) =>
        set((state) => ({ objects: state.objects.filter((o) => o.id !== id) })),

      toggleVisibility: (id) =>
        set((state) => ({
          objects: state.objects.map((o) =>
            o.id === id ? { ...o, visible: !o.visible } : o
          ),
        })),

      toggleLock: (id) =>
        set((state) => ({
          objects: state.objects.map((o) =>
            o.id === id ? { ...o, locked: !o.locked } : o
          ),
        })),

      updateObject: (id, updates) =>
        set((state) => ({
          objects: state.objects.map((o) =>
            o.id === id ? { ...o, ...updates } : o
          ),
        })),

      reorder: (fromIndex, toIndex) =>
        set((state) => {
          const arr = [...state.objects];
          const [moved] = arr.splice(fromIndex, 1);
          arr.splice(toIndex, 0, moved);
          // Recalculate zIndex based on position
          return { objects: arr.map((o, i) => ({ ...o, zIndex: i })) };
        }),

      syncIndicators: (activeIds, colorMap) =>
        set((state) => {
          const existingIndicatorIds = state.objects.filter((o) => o.type === 'indicator').map((o) => o.id);
          const drawings = state.objects.filter((o) => o.type === 'drawing');

          // Remove indicators that are no longer active
          const keptIndicators = state.objects
            .filter((o) => o.type === 'indicator' && activeIds.includes(o.id));

          // Add new indicators
          const newIndicators: ChartObject[] = activeIds
            .filter((id) => !existingIndicatorIds.includes(id))
            .map((id, i) => ({
              id,
              type: 'indicator' as const,
              name: id,
              color: colorMap[id] || '#2196F3',
              visible: true,
              locked: false,
              zIndex: keptIndicators.length + i,
            }));

          return { objects: [...keptIndicators, ...newIndicators, ...drawings] };
        }),

      syncDrawings: (drawingIds) =>
        set((state) => {
          const indicators = state.objects.filter((o) => o.type === 'indicator');
          const existingDrawingIds = state.objects.filter((o) => o.type === 'drawing').map((o) => o.id);

          const keptDrawings = state.objects
            .filter((o) => o.type === 'drawing' && drawingIds.includes(o.id));

          const newDrawings: ChartObject[] = drawingIds
            .filter((id) => !existingDrawingIds.includes(id))
            .map((id, i) => ({
              id,
              type: 'drawing' as const,
              name: `Drawing ${id.slice(0, 6)}`,
              color: '#2196F3',
              visible: true,
              locked: false,
              zIndex: indicators.length + keptDrawings.length + i,
            }));

          return { objects: [...indicators, ...keptDrawings, ...newDrawings] };
        }),

      clear: () => set({ objects: [] }),

      // Template implementation
      templates: [],
      indicatorTemplates: [],
      toolTemplates: [],

      setTemplates: (templates) => set({ templates }),
      saveTemplate: (template) =>
        set((state) => ({
          templates: [template, ...state.templates.filter((t: DrawingTemplate) => t.id !== template.id)],
        })),
      deleteTemplate: (id) =>
        set((state) => ({
          templates: state.templates.filter((t: DrawingTemplate) => t.id !== id),
        })),

      setToolTemplates: (toolTemplates) => set({ toolTemplates }),
      saveToolTemplate: (template) =>
        set((state) => ({
          toolTemplates: [template, ...state.toolTemplates.filter((t) => t.id !== template.id)],
        })),
      deleteToolTemplate: (id) =>
        set((state) => ({
          toolTemplates: state.toolTemplates.filter((t) => t.id !== id),
        })),

      saveIndicatorTemplate: (template) =>
        set((state) => ({
          indicatorTemplates: [template, ...state.indicatorTemplates.filter((t: IndicatorTemplate) => t.id !== template.id)],
        })),
      deleteIndicatorTemplate: (id) =>
        set((state) => ({
          indicatorTemplates: state.indicatorTemplates.filter((t: IndicatorTemplate) => t.id !== id),
        })),
    }),
    {
      name: 'tradeshift-chart-objects',
    }
  )
);
