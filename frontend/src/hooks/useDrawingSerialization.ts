import { useCallback } from 'react';
import type { IChartApi, ISeriesApi, DrawingToolsManager } from '@pipsend/charts';
import {
  createCircleTool,
  createTextTool,
  createVerticalLineTool,
  createHorizontalLineTool,
  createBrushTool,
  createFibonacciTool,
  createTrendLineTool,
  createRectangleTool,
  createArrowTool,
  createPositionTool,
} from '@pipsend/charts';

export interface SerializedDrawing {
  id?: string;
  type: string;
  options: any;
  points?: any[];
  text?: string;
}

export const useDrawingSerialization = (
  chart: IChartApi | null,
  series: ISeriesApi<any> | null,
  manager: DrawingToolsManager | null
) => {
  const serialize = useCallback(() => {
    if (!manager) return [];

    const tools = manager.getAllTools();
    const serialized: SerializedDrawing[] = [];

    tools.forEach((tool: any) => {
      const type = tool.getType?.() || 'unknown';
      const options = tool.getOptions?.() || {};
      
      let points = null;
      if (tool.getPoints) {
        points = tool.getPoints();
      }

      serialized.push({
        type,
        options,
        points,
      });
    });

    return serialized;
  }, [manager]);

  const deserialize = useCallback(
    (data: SerializedDrawing[], clearFirst = true) => {
      if (!chart || !series || !manager || !data) return;

      if (clearFirst) {
        manager.clearAll();
      }

      data.forEach((item) => {
        try {
          let tool = null;
          switch (item.type) {
            case 'trendline':
            case 'ray':
            case 'extended':
            case 'hray':
            case 'hline':
            case 'vline':
            case 'cross':
            case 'rectangle':
            case 'circle':
            case 'ruler':
            case 'brush':
            case 'text':
            case 'note':
            case 'long_pos':
            case 'short_pos':
            case 'fibonacci':
            case 'fib_ext':
            case 'arrow':
              // The DrawingToolsManager handles instantiation for these via startDrawing
              // But for deserialization we need to manually create and add them.
              // We rely on the manager's internal factories or the generic tools.
              if (item.type === 'trendline' && typeof createTrendLineTool === 'function') {
                tool = createTrendLineTool(series as any, item.options);
              } else if (item.type === 'fibonacci' && typeof createFibonacciTool === 'function') {
                tool = createFibonacciTool(series as any, item.options);
              } else if (item.type === 'vline' && typeof createVerticalLineTool === 'function') {
                tool = createVerticalLineTool(series as any, item.options);
              } else if (item.type === 'hline' && typeof createHorizontalLineTool === 'function') {
                tool = createHorizontalLineTool(series as any, item.options);
              } else if (item.type === 'rectangle' && typeof createRectangleTool === 'function') {
                tool = createRectangleTool(series as any, item.options);
              } else if (item.type === 'circle' && typeof createCircleTool === 'function') {
                tool = createCircleTool(series as any, item.options);
              } else if (item.type === 'brush' && typeof createBrushTool === 'function') {
                tool = createBrushTool(series as any, item.options);
              } else if (item.type === 'text' && typeof createTextTool === 'function') {
                tool = createTextTool(series as any, item.options);
              } else if (item.type === 'arrow' && typeof createArrowTool === 'function') {
                tool = createArrowTool(series as any, item.options);
              } else if (item.type === 'long_pos' && typeof createPositionTool === 'function') {
                tool = createPositionTool(series as any, { ...item.options, side: 'long' });
              } else if (item.type === 'short_pos' && typeof createPositionTool === 'function') {
                tool = createPositionTool(series as any, { ...item.options, side: 'short' });
              } else {
                // Fallback for tools that might not have a dedicated factory export but are known to manager
                try {
                  const id = (manager as any).startDrawing(item.type, item.options);
                  if (id) {
                    const allTools = manager.getAllTools() as any;
                    tool = allTools.get ? allTools.get(id) : allTools[id];
                    (manager as any).stopDrawing(); 
                  }
                } catch (err) {
                  console.warn(`Generic instantiation failed for ${item.type}`, err);
                }
              }
              break;
            default:
              console.warn(`Unsupported tool type: ${item.type}`);
          }

          if (tool) {
            if (item.points && (tool as any).setPoints) {
              (tool as any).setPoints(item.points);
            }
            manager.addTool(tool);
          }
        } catch (e) {
          console.error(`Failed to deserialize tool: ${item.type}`, e);
        }
      });
    },
    [chart, series, manager]
  );

  return { serialize, deserialize };
};
