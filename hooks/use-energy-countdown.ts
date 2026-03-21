import { useEffect, useRef, useState } from 'react';

import { useToasts } from './use-toast-queue';

const REGEN_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes, must match backend ENERGY_REGEN_INTERVAL_MS

type EnergyCountdown = {
  /** Seconds until next energy tick. null when energy is already at max. */
  secondsUntilRegen: number | null;
  /** Human-readable string like "4:32" or null when at max. */
  regenLabel: string | null;
  /** Live computed energy (stored + ticks since lastEnergyUpdate, capped at max). */
  liveEnergy: number;
};

/**
 * Pure time-based countdown hook for energy regeneration.
 * Mirrors the backend's lazy regen: calculates how far through the current
 * 5-minute tick we are, and counts down to the next regen.
 *
 * Re-calculates every second via setInterval.
 * Returns null when energy is at max (no countdown needed).
 */
export function useEnergyCountdown(
  energy: number | null | undefined,
  energyMax: number | null | undefined,
  lastEnergyUpdate: string | null | undefined,
): EnergyCountdown {
  const [secondsUntilRegen, setSecondsUntilRegen] = useState<number | null>(null);
  const [liveEnergy, setLiveEnergy] = useState<number>(energy ?? 0);
  const prevEnergyRef = useRef<number | null>(null);
  const { addToast } = useToasts();

  useEffect(() => {
    const storedEnergy = energy ?? 0;
    const maxEnergy = energyMax ?? 10;

    if (!lastEnergyUpdate) {
      setLiveEnergy(storedEnergy);
      prevEnergyRef.current = storedEnergy;
      setSecondsUntilRegen(storedEnergy >= maxEnergy ? null : REGEN_INTERVAL_MS / 1000);
      return;
    }

    const calculate = () => {
      const lastUpdate = new Date(lastEnergyUpdate).getTime();
      const now = Date.now();
      const elapsedSinceUpdate = now - lastUpdate;
      const ticksGained = Math.floor(elapsedSinceUpdate / REGEN_INTERVAL_MS);
      const computed = Math.min(maxEnergy, storedEnergy + ticksGained);

      // Fire a toast when energy ticks up passively (but not on initial mount)
      if (prevEnergyRef.current !== null && computed > prevEnergyRef.current) {
        addToast(`⚡ Energy +${computed - prevEnergyRef.current} (${computed}/${maxEnergy})`, 'green');
      }
      prevEnergyRef.current = computed;
      setLiveEnergy(computed);

      if (computed >= maxEnergy) {
        setSecondsUntilRegen(null);
        return;
      }
      const msIntoCurrent = elapsedSinceUpdate % REGEN_INTERVAL_MS;
      const msUntilNext = REGEN_INTERVAL_MS - msIntoCurrent;
      setSecondsUntilRegen(Math.ceil(msUntilNext / 1000));
    };

    calculate();
    const id = setInterval(calculate, 1000);
    return () => clearInterval(id);
  }, [energy, energyMax, lastEnergyUpdate, addToast]);

  const regenLabel =
    secondsUntilRegen !== null
      ? `${Math.floor(secondsUntilRegen / 60)}:${String(secondsUntilRegen % 60).padStart(2, '0')}`
      : null;

  return { secondsUntilRegen, regenLabel, liveEnergy };
}
