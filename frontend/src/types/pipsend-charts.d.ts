declare module '@pipsend/charts' {
  export const createChart: any;
  export const ColorType: any;
  export type IChartApi = any;
  export type ISeriesApi<T> = any;
  export type UTCTimestamp = any;
  export const CandlestickSeries: any;
  export const HistogramSeries: any;
  export const LineSeries: any;
  export class DrawingToolsManager {
    constructor(chart: any, series: any, options?: any);
    startDrawing(toolId: string): void;
    stopDrawing(): void;
    clearAll(): void;
    getAllTools(): any;
    deleteSelected(): boolean;
    getSelectedToolId(): string | null;
    selectTool(id: string): void;
    addTool(tool: any): string;
    removeTool(id: string): void;
    destroy(): void;
  }
  export const createInteractiveLineManager: any;
  export const createArrowTool: any;
  export const createCircleTool: any;
  export const createTextTool: any;
  export const createVerticalLineTool: any;
  export const createHorizontalLineTool: any;
  export const createBrushTool: any;
  export const createFibonacciExtensionTool: any;
  export const createFibonacciTool: any;
  export const createTrendLineTool: any;
  export const createRectangleTool: any;
  export const createPositionTool: any;
  export const createFibonacciFanTool: any;
}
