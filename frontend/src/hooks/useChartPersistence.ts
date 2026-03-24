import { useEffect, useRef } from 'react';
import { useIndicatorSettings } from '../store/useIndicatorSettings';
import { useChartObjects } from '../store/useChartObjects';
import axios from 'axios';

/**
 * Hook to synchronize chart settings, drawings, and templates with the backend.
 * Handles initial load on login and debounced auto-save on changes.
 */
export const useChartPersistence = () => {
    const { settings, setSettings } = useIndicatorSettings();
    const { objects, drawings, setTemplates, setDrawings } = useChartObjects();
    const isInitialLoad = useRef(true);

    // Initial Load: Fetch settings from backend on mount
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const [settingsRes, templatesRes] = await Promise.all([
                    axios.get('/api/user/chart-settings'),
                    axios.get('/api/user/templates')
                ]);

                // Sync stores with backend data
                if (settingsRes.data) {
                    const { indicator_settings, active_drawings } = settingsRes.data;
                    
                    if (indicator_settings && Object.keys(indicator_settings).length > 0) {
                        setSettings(indicator_settings);
                    }
                    
                    if (active_drawings) {
                        setDrawings(active_drawings);
                    }
                }
                
                if (templatesRes.data) {
                    setTemplates(templatesRes.data);
                }
                
                // Small delay to ensure stores have settled before enabling auto-save
                setTimeout(() => {
                    isInitialLoad.current = false;
                }, 1000);
            } catch (error) {
                console.error('Failed to load chart settings from cloud:', error);
                isInitialLoad.current = false;
            }
        };

        loadSettings();
    }, [setSettings, setDrawings, setTemplates]);

    // Auto-save: Debounced sync to backend on state changes
    useEffect(() => {
        // Skip saving during initial load
        if (isInitialLoad.current) return;

        const timeout = setTimeout(async () => {
            const active_indicators = objects
                .filter(o => o.type === 'indicator')
                .map(o => o.id);
            
            try {
                await axios.put('/api/user/chart-settings', {
                    active_indicators,
                    indicator_settings: settings,
                    active_drawings: drawings
                });
                console.log('📊 Chart settings auto-saved to cloud.');
            } catch (error) {
                console.error('Failed to auto-save chart settings:', error);
            }
        }, 3000);

        return () => clearTimeout(timeout);
    }, [objects, settings, drawings]);
};
