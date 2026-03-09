import { useRef, useCallback, useState } from 'react';
import { GestureResponderEvent } from 'react-native';

export const useDoubleTap = (onDoubleTap: () => void, delay = 300) => {
  const lastTap = useRef<number>(0);

  const handlePress = useCallback((event: GestureResponderEvent) => {
    const now = Date.now();
    if (lastTap.current && now - lastTap.current < delay) {
      onDoubleTap();
    }
    lastTap.current = now;
  }, [onDoubleTap, delay]);

  return handlePress;
};

export const useVideoPlayback = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<any>(null);

  const play = useCallback(() => {
    setIsPlaying(true);
    videoRef.current?.playAsync();
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
    videoRef.current?.pauseAsync();
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  return {
    isPlaying,
    videoRef,
    play,
    pause,
    toggle,
  };
};
