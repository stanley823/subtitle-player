import { useState, useEffect, useCallback } from 'react';
import { defaultSubtitleStyles, defaultVideoSettings } from '../components/SettingsModal';

const STORAGE_KEY = 'subtitle-player-prefs';

const DEFAULTS = {
  videoSettings:  defaultVideoSettings,
  subtitleStyles: defaultSubtitleStyles,
  subtitleMode:   'both',
  progress:       {}, // { [videoId]: seconds }
};

function loadPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const saved = JSON.parse(raw);
    // Deep merge so new default keys are always present
    return {
      videoSettings: { ...DEFAULTS.videoSettings,  ...saved.videoSettings  },
      subtitleStyles: {
        primary:   { ...DEFAULTS.subtitleStyles.primary,   ...saved.subtitleStyles?.primary   },
        secondary: { ...DEFAULTS.subtitleStyles.secondary, ...saved.subtitleStyles?.secondary },
      },
      subtitleMode: saved.subtitleMode ?? DEFAULTS.subtitleMode,
      progress:     saved.progress     ?? {},
    };
  } catch {
    return DEFAULTS;
  }
}

/**
 * Persists user preferences (video settings, subtitle styles, subtitle mode,
 * and per-video playback progress) to localStorage.
 */
export function usePreferences() {
  const [prefs, setPrefs] = useState(loadPrefs);

  // Write to localStorage whenever prefs change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {}
  }, [prefs]);

  const setVideoSettings = useCallback(
    (vs) => setPrefs(p => ({ ...p, videoSettings: vs })), []);

  const setSubtitleStyles = useCallback(
    (ss) => setPrefs(p => ({ ...p, subtitleStyles: ss })), []);

  const setSubtitleMode = useCallback(
    (mode) => setPrefs(p => ({ ...p, subtitleMode: mode })), []);

  /** Save current playback position for a video (ignored if < 5 s). */
  const saveProgress = useCallback((videoId, seconds) => {
    if (!videoId || seconds < 5) return;
    setPrefs(p => ({
      ...p,
      progress: { ...p.progress, [videoId]: Math.floor(seconds) },
    }));
  }, []);

  /** Return the saved playback position for a video (0 if none). */
  const getProgress = useCallback(
    (videoId) => prefs.progress[videoId] ?? 0,
    [prefs.progress]);

  return {
    videoSettings:  prefs.videoSettings,
    subtitleStyles: prefs.subtitleStyles,
    subtitleMode:   prefs.subtitleMode,
    setVideoSettings,
    setSubtitleStyles,
    setSubtitleMode,
    saveProgress,
    getProgress,
  };
}
