import { useCallback, useRef } from 'react';

interface HistoryEntry {
  toolIds: string[];
  timestamp: number;
}

export const useDrawingHistory = () => {
  const historyRef = useRef<HistoryEntry[]>([]);
  const pointerRef = useRef(-1);

  const pushSnapshot = useCallback((toolIds: string[]) => {
    // Truncate any redo history beyond current pointer
    historyRef.current = historyRef.current.slice(0, pointerRef.current + 1);
    historyRef.current.push({ toolIds: [...toolIds], timestamp: Date.now() });
    pointerRef.current = historyRef.current.length - 1;
  }, []);

  const undo = useCallback((): string[] | null => {
    if (pointerRef.current <= 0) return null;
    pointerRef.current--;
    return historyRef.current[pointerRef.current]?.toolIds ?? null;
  }, []);

  const redo = useCallback((): string[] | null => {
    if (pointerRef.current >= historyRef.current.length - 1) return null;
    pointerRef.current++;
    return historyRef.current[pointerRef.current]?.toolIds ?? null;
  }, []);

  const canUndo = useCallback(() => pointerRef.current > 0, []);
  const canRedo = useCallback(() => pointerRef.current < historyRef.current.length - 1, []);

  return { pushSnapshot, undo, redo, canUndo, canRedo };
};
