/**
 * Elering NPS — electricity spot prices for Estonia.
 * https://dashboard.elering.ee/api
 */

const ELERING_URL = 'https://dashboard.elering.ee/api/nps/price';

export const FALLBACK_ENERGY_PRICE = 0.15;

export interface SpotPriceInfo {
  price: number;
  priceMWh: number;
  hourLabel: string;
  isFallback: boolean;
  fetchedAt: string;
}

interface EleringEntry {
  timestamp: number;
  price: number;
}

interface EleringResponse {
  success: boolean;
  data: {
    ee?: EleringEntry[];
  };
}

export async function getSpotPriceEE(): Promise<SpotPriceInfo> {
  try {
    const now = new Date();
    const start = new Date(now);
    start.setMinutes(0, 0, 0);
    const end = new Date(start);
    end.setHours(end.getHours() + 2);

    const url = `${ELERING_URL}?start=${encodeURIComponent(start.toISOString())}&end=${encodeURIComponent(end.toISOString())}`;

    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`Elering API returned HTTP ${res.status}`);
    }

    const json = (await res.json()) as EleringResponse;

    if (!json.success || !Array.isArray(json.data?.ee) || json.data.ee.length === 0) {
      throw new Error('Elering API: no EE price data in response');
    }

    const entry = json.data.ee[0];
    const priceMWh = entry.price;
    const price = priceMWh / 1000;

    return {
      price,
      priceMWh,
      hourLabel: new Date(entry.timestamp * 1000).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isFallback: false,
      fetchedAt: now.toISOString(),
    };
  } catch (err) {
    console.warn('[EnergyAPI] Falling back to static price:', err instanceof Error ? err.message : err);

    return {
      price: FALLBACK_ENERGY_PRICE,
      priceMWh: FALLBACK_ENERGY_PRICE * 1000,
      hourLabel: '',
      isFallback: true,
      fetchedAt: new Date().toISOString(),
    };
  }
}
