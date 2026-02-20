import { useState, useEffect, useRef } from 'react';
import { findSub } from '../utils/parseSRT';

/**
 * Polls the YouTube player every 100ms and returns the currently
 * active primary and secondary subtitle entries.
 *
 * @param {object|null} playerRef - ref to the YouTube player instance
 * @param {Array}  primarySubs
 * @param {Array}  secondarySubs
 * @returns {{ primary: object|null, secondary: object|null, currentTime: number }}
 */
export function useSubtitleSync(playerRef, primarySubs, secondarySubs) {
  const [primary,     setPrimary]     = useState(null);
  const [secondary,   setSecondary]   = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      const player = playerRef.current;
      if (!player) return;

      let t;
      try { t = player.getCurrentTime(); } catch { return; }

      setCurrentTime(t);
      setPrimary(primarySubs.length   ? findSub(primarySubs,   t) : null);
      setSecondary(secondarySubs.length ? findSub(secondarySubs, t) : null);
    }, 100);

    return () => clearInterval(timerRef.current);
  }, [playerRef, primarySubs, secondarySubs]);

  return { primary, secondary, currentTime };
}
