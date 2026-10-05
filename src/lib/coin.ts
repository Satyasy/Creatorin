/**
 * Currency utility for Creatorin Coin System
 * Ratio: 1 Koin = Rp1.000
 */

export const COIN_TO_RUPIAH_RATIO = 1000;

/**
 * Converts Rupiah to Koin (1 Koin = Rp1.000)
 */
export function rupiahToCoin(rupiah: number): number {
  if (!rupiah || isNaN(rupiah)) return 0;
  return Math.round(rupiah / COIN_TO_RUPIAH_RATIO);
}

/**
 * Converts Koin to Rupiah
 */
export function coinToRupiah(coin: number): number {
  if (!coin || isNaN(coin)) return 0;
  return coin * COIN_TO_RUPIAH_RATIO;
}

/**
 * Formats a coin amount to readable string, e.g. "1.500 Koin"
 */
export function formatCoin(coin: number | string): string {
  const num = typeof coin === 'string' ? parseInt(coin.replace(/[^0-9]/g, ''), 10) || 0 : coin;
  return `${num.toLocaleString('id-ID')} Koin`;
}

/**
 * Formats a coin amount with coin icon symbol, e.g. "🪙 1.500 Koin"
 */
export function formatCoinWithIcon(coin: number | string): string {
  return `🪙 ${formatCoin(coin)}`;
}
