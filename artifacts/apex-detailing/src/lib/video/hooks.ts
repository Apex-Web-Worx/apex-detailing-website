import { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    startRecording?: () => void;
    stopRecording?: () => void;
  }
}

export function useVideoPlayer({ durations }: { durations: Record<string, number> }) {
  const [currentScene, setCurrentScene] = useState(0);
  const isFirstPass = useRef(true);
  
  // Convert durations object to arrays for stable indexing
  const sceneKeys = useRef(Object.keys(durations));
  const sceneDurations = useRef(Object.values(durations));

  useEffect(() => {
    // Start recording on first mount
    if (currentScene === 0 && isFirstPass.current) {
      window.startRecording?.();
    }

    const duration = sceneDurations.current[currentScene];
    if (duration === undefined) return;

    const timer = setTimeout(() => {
      setCurrentScene((prev) => {
        const next = prev + 1;
        if (next >= sceneKeys.current.length) {
          // Reached end of loop
          if (isFirstPass.current) {
            isFirstPass.current = false;
            window.stopRecording?.();
          }
          return 0; // Loop back to start
        }
        return next;
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [currentScene]);

  return { currentScene };
}
