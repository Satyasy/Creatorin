/**
 * Currency utility for Creatorin Coin System
 * 1:1 direct equivalence: 1 Koin = Rp1 (e.g. 200.000 Rupiah = 🪙 200.000)
 * Visual format: "🪙 200.000"
 */

export const COIN_TO_RUPIAH_RATIO = 1;

/**
 * Converts Rupiah to Koin (1:1 ratio)
 */
export function rupiahToCoin(rupiah: number): number {
  if (!rupiah || isNaN(rupiah)) return 0;
  return Math.round(rupiah);
}

/**
 * Converts Koin to Rupiah (1:1 ratio)
 */
export function coinToRupiah(coin: number): number {
  if (!coin || isNaN(coin)) return 0;
  return Math.round(coin);
}

/**
 * Formats a coin amount to standard compact icon format, e.g. "🪙 200.000"
 */
export function formatCoin(coin: number | string): string {
  const num = typeof coin === 'string' ? parseInt(coin.replace(/[^0-9]/g, ''), 10) || 0 : coin;
  return `🪙 ${num.toLocaleString('id-ID')}`;
}

/**
 * Formats a coin amount with coin icon symbol, e.g. "🪙 200.000"
 */
export function formatCoinWithIcon(coin: number | string): string {
  return formatCoin(coin);
}

/**
 * Formats a coin amount with text suffix, e.g. "200.000 Koin"
 */
export function formatCoinText(coin: number | string): string {
  const num = typeof coin === 'string' ? parseInt(coin.replace(/[^0-9]/g, ''), 10) || 0 : coin;
  return `${num.toLocaleString('id-ID')} Koin`;
}
