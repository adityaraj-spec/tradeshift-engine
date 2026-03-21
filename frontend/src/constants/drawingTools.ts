import { 
  MousePointer2, Dot, Navigation, Eraser, 
  TrendingUp, ArrowUpRight, Minus, MoveVertical, 
  Square, Circle, Pencil, Type, 
  AlignEndHorizontal, 
  Magnet, Lock, EyeOff, Trash2, 
  Ruler, ZoomIn, StickyNote, Target,
  Scaling, ArrowLeftRight, Plus
} from 'lucide-react';

export interface DrawingToolItem {
  id: string;
  name: string;
  icon: any;
  shortcut?: string;
  supported?: boolean;
  section?: string;
  options?: any;
}

export type DrawingToolListItem = DrawingToolItem | { section: string };

export interface DrawingCategory {
  id: string;
  name: string;
  icon: any;
  tools: DrawingToolListItem[];
}

export const DRAWING_CATEGORIES: DrawingCategory[] = [
  {
    id: 'cursor',
    name: 'Cursors',
    icon: MousePointer2,
    tools: [
      { id: 'cursor', name: 'Cross', icon: MousePointer2, supported: true },
      { id: 'dot', name: 'Dot', icon: Dot, supported: true },
      { id: 'arrow_cursor', name: 'Arrow', icon: Navigation, supported: true },
      { id: 'eraser', name: 'Eraser', icon: Eraser, supported: true },
    ]
  },
  {
    id: 'lines',
    name: 'Trend Line Tools',
    icon: TrendingUp,
    tools: [
      { section: 'TRENDING' },
      { id: 'trendline', name: 'Trendline', icon: TrendingUp, shortcut: 'Alt+T', supported: true },
      { id: 'ray', name: 'Ray', icon: ArrowUpRight, supported: true, options: { extendRight: true } },
      { id: 'extended', name: 'Extended Line', icon: ArrowLeftRight, supported: true, options: { extendLeft: true, extendRight: true } },
      { id: 'tangle', name: 'Trend Angle', icon: TrendingUp, supported: false },
      { id: 'hray', name: 'Horizontal Ray', icon: Minus, supported: true, options: { extendRight: true, horizontal: true } },
      
      { section: 'HORIZONTAL/VERTICAL' },
      { id: 'hline', name: 'Horizontal Line', icon: Minus, shortcut: 'Alt+H', supported: true },
      { id: 'vline', name: 'Vertical Line', icon: MoveVertical, shortcut: 'Alt+V', supported: true },
      { id: 'cross', name: 'Cross Line', icon: Plus, shortcut: 'Alt+C', supported: true },
    ]
  },
  {
    id: 'fib',
    name: 'Gann and Fibonacci Tools',
    icon: AlignEndHorizontal,
    tools: [
      { section: 'FIBONACCI' },
      { id: 'fibonacci', name: 'Fib Retracement', icon: AlignEndHorizontal, shortcut: 'Alt+F', supported: true },
      { id: 'fib_ext', name: 'Trend-Based Fib Extension', icon: AlignEndHorizontal, supported: true },
    ]
  },
  {
    id: 'shapes',
    name: 'Geometric Shapes',
    icon: Pencil,
    tools: [
      { section: 'SHAPES' },
      { id: 'brush', name: 'Brush', icon: Pencil, supported: true },
      { id: 'rectangle', name: 'Rectangle', icon: Square, supported: true },
      { id: 'circle', name: 'Circle', icon: Circle, supported: true },
    ]
  },
  {
    id: 'text',
    name: 'Annotation Tools',
    icon: Type,
    tools: [
      { section: 'TEXT' },
      { id: 'text', name: 'Text', icon: Type, supported: true },
      { id: 'note', name: 'Note', icon: StickyNote, supported: true },
    ]
  },
  {
    id: 'prediction',
    name: 'Prediction and Measurement',
    icon: Target,
    tools: [
      { section: 'PREDICTION' },
      { id: 'long_pos', name: 'Long Position', icon: Target, supported: true },
      { id: 'short_pos', name: 'Short Position', icon: Target, supported: true },
      { id: 'forecast', name: 'Forecast', icon: Scaling, supported: false },
    ]
  }
];

export const BOTTOM_TOOLS = [
  { id: 'measure', name: 'Measure', icon: Ruler },
  { id: 'zoom', name: 'Zoom In', icon: ZoomIn },
  { id: 'magnet', name: 'Magnet Mode', icon: Magnet },
  { id: 'lock', name: 'Lock All Drawing Tools', icon: Lock },
  { id: 'hide', name: 'Hide All Drawings', icon: EyeOff },
  { id: 'clear', name: 'Remove Drawings', icon: Trash2 },
];
