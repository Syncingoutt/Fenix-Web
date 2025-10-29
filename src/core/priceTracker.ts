import { PriceCheckData } from './logParser';

export function calculateAveragePrice(prices: number[]): number {
  // Skip first 50, take last 50
  const relevantPrices = prices.slice(50, 100);
  const sum = relevantPrices.reduce((acc, price) => acc + price, 0);
  return sum / relevantPrices.length;
}

export function processPriceCheckData(priceData: PriceCheckData): number {
  return calculateAveragePrice(priceData.prices);
}