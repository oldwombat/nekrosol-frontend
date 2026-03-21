import { useEffect, useState } from 'react';

const DECAY_INTERVAL_MS = 60 * 60 * 1000; // 60 minutes, must match backend RADIATION_DECAY_INTERVAL_MS

type RadiationCountdown = {
  /** Seconds until next radiation decay tick. null when radiation is already 0. */
  secondsUntilDecay: number | null;
  /** Human-readable string like "45:00" or null when radiation is 0. */
  decayLabel: string | null;
  /** Live computed radiation (stored - ticks since lastRadiationUpdate, floored at 0). */
  liveRadiation: number;
};

/**
 * Pure time-based countdown hook for radiation decay.
 * Mirrors the backend's lazy decay: calculates how far through the current
 * 60-minute tick we are, and counts down to the next decay.
 *
 * Re-calculates every second via setInterval.
 * Returns null when radiation is 0 (no countdown needed).
 */
export function useRadiationCountdown(
  radiation: number | null | undefined,
  lastRadiationUpdate: string | null | undefined,
): RadiationCountdown {
  const [secondsUntilDecay, setSecondsUntilDecay] = useState<number | null>(null);
  const [liveRadiation, setLiveRadiation] = useState<number>(radiation ?? 0);

  useEffect(() => {
    const storedRadiation = radiation ?? 0;

    if (storedRadiation <= 0) {
      setLiveRadiation(0);
      setSecondsUntilDecay(null);
      return;
    }

    if (!lastRadiationUpdate) {
      setLiveRadiation(storedRadiation);
      setSecondsUntilDecay(DECAY_INTERVAL_MS / 1000);
      return;
    }

    const calculate = () => {
      const lastUpdate = new Date(lastRadiationUpdate).getTime();
      const now = Date.now();
      const elapsedSinceUpdate = now - lastUpdate;
      const ticksDecayed = Math.floor(elapsedSinceUpdate / DECAY_INTERVAL_MS);
      const computed = Math.max(0, storedRadiation - ticksDecayed);
      setLiveRadiation(computed);

      if (computed <= 0) {
        setSecondsUntilDecay(null);
        return;
      }
      const msIntoCurrent = elapsedSinceUpdate % DECAY_INTERVAL_MS;
      const msUntilNext = DECAY_INTERVAL_MS - msIntoCurrent;
      setSecondsUntilDecay(Math.ceil(msUntilNext / 1000));
    };

    calculate();
    const id = setInterval(calculate, 1000);
    return () => clearInterval(id);
  }, [radiation, lastRadiationUpdate]);

  const decayLabel =
    secondsUntilDecay !== null
      ? `${Math.floor(secondsUntilDecay / 60)}:${String(secondsUntilDecay % 60).padStart(2, '0')}`
      : null;

  return { secondsUntilDecay, decayLabel, liveRadiation };
}
