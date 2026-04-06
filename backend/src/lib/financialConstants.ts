/** Tariffs for event cost calculation (EUR) */
export const TARIFFS = {
  ENERGY_KWH: 0.18,
  AIR_M3: 0.05,
  LABOR_HOUR: 15,
  OVERHEAD_HOUR: 20,
} as const;

export const COST_PER_HOUR = TARIFFS.LABOR_HOUR + TARIFFS.OVERHEAD_HOUR;
