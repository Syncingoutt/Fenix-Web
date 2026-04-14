// Prices page renderer (desktop-aligned history flow)

import { PriceCache, ItemDatabase, PriceHistoryPoint, PriceHistoryByItem } from '../types.js';
import { webAPI } from '../webAPI.js';

export type { PriceCache, PriceCacheEntry } from '../types.js';
import { FLAME_ELEMENTIUM_ID } from '../constants.js';

interface SparklineHistoryPoint {
  date: string;
  price: number;
}

interface PriceItem {
  baseId: string;
  name: string;
  price: number;
  timestamp: number;
  listingCount?: number;
  trend: 'up' | 'down' | 'neutral';
  trendPercent: number;
  group?: string;
  history?: SparklineHistoryPoint[];
}

let itemDatabase: ItemDatabase = {};
let priceCache: PriceCache = {};
let allPriceItems: PriceItem[] = [];
let filteredPriceItems: PriceItem[] = [];
let sortColumn = 'price';
let sortDirection: 'asc' | 'desc' = 'desc';
let currentGroup = 'currency';
let currentSearchTerm = '';
let currentLeagueId = 's11-vorax';
let selectedBaseId: string | null = null;
let detailChart: any = null;
const detailHistoryCache = new Map<string, PriceHistoryPoint[]>();
let last7DayHistoryByItem: PriceHistoryByItem = {};
let last90DayHistoryByItem: PriceHistoryByItem = {};
let isDetailViewOpen = false;
let selectedHistoryRangeDays: 7 | 30 | 90 = 7;
let detailRequestVersion = 0;
let list7HistoryRequestVersion = 0;
let detail90HistoryRequestVersion = 0;
let last7HistoryLoadedAt = 0;
let last7HistoryLeagueId = '';
let last90HistoryLoadedAt = 0;
let last90HistoryLeagueId = '';
let last90HistoryFetchPromise: Promise<void> | null = null;
const HISTORY_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

declare const Chart: any;

function calculateTrendFromHistory(history: SparklineHistoryPoint[] | undefined): { trend: 'up' | 'down' | 'neutral'; percent: number } {
  if (!history || history.length < 2) return { trend: 'neutral', percent: 0 };
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (first.price <= 0) return { trend: 'neutral', percent: 0 };
  const diff = last.price - first.price;
  const percent = (diff / first.price) * 100;
  if (percent > 0.01) return { trend: 'up', percent };
  if (percent < -0.01) return { trend: 'down', percent };
  return { trend: 'neutral', percent: 0 };
}

function renderSparkline(canvas: HTMLCanvasElement, prices: number[], trend: 'up' | 'down' | 'neutral'): void {
  const ctx = canvas.getContext('2d');
  if (!ctx || prices.length === 0) return;
  const width = canvas.width;
  const height = canvas.height;
  const padding = 2;
  ctx.clearRect(0, 0, width, height);
  if (prices.length === 1) {
    const y = height / 2;
    ctx.strokeStyle = trend === 'up' ? '#4CAF50' : trend === 'down' ? '#F44336' : '#7E7E7E';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
    return;
  }
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;
  let dataPoints = prices;
  if (prices.length > 50) {
    const step = Math.ceil(prices.length / 50);
    dataPoints = prices.filter((_, i) => i % step === 0 || i === prices.length - 1);
  }
  const isPositive = trend === 'up' || (trend === 'neutral' && dataPoints[dataPoints.length - 1] >= dataPoints[0]);
  ctx.strokeStyle = isPositive ? '#4CAF50' : '#F44336';
  ctx.fillStyle = isPositive ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  const stepX = (width - padding * 2) / (dataPoints.length - 1);
  dataPoints.forEach((price, index) => {
    const x = padding + index * stepX;
    const normalizedPrice = (price - minPrice) / priceRange;
    const y = height - padding - (normalizedPrice * (height - padding * 2));
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.lineTo(width - padding, height - padding);
  ctx.lineTo(padding, height - padding);
  ctx.closePath();
  ctx.fill();
}

function generateSparklineData(history: SparklineHistoryPoint[] | undefined, currentPrice: number): number[] {
  if (history && history.length > 0) {
    const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
    return sorted.map(p => p.price);
  }
  return new Array(7).fill(currentPrice > 0 ? currentPrice : 0);
}

function formatPrice(price: number): string {
  if (price === 0) return '0.00';
  if (price >= 1_000_000) return (price / 1_000_000).toFixed(2) + 'M';
  if (price >= 1_000) return (price / 1_000).toFixed(2) + 'K';
  return price.toFixed(2);
}

function formatUpdatedAt(timestamp: number): string {
  if (!timestamp || Number.isNaN(timestamp)) return '--';
  return new Date(timestamp).toLocaleString();
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function renderPriceRow(item: PriceItem): string {
  const sparklineId = `sparkline-${item.baseId}`;
  const sparklineData = generateSparklineData(item.history, item.price);
  const baseUrl = import.meta.env.BASE_URL || '/';
  const iconPath = `${baseUrl}assets/${item.baseId}.webp`;
  const trendClass = `trend-${item.trend}`;
  const priceClass = item.price > 0 ? '' : 'no-price';
  const trendText = item.price > 0 ? `${item.trendPercent > 0 ? '+' : ''}${item.trendPercent.toFixed(0)}%` : '';
  return `
    <tr class="prices-row" data-base-id="${item.baseId}">
      <td class="prices-col-name">
        <div class="prices-name-cell">
          <img src="${iconPath}" alt="${item.name}" class="prices-item-icon" onerror="this.style.display='none'">
          <span class="prices-item-name">${escapeHtml(item.name)}</span>
        </div>
      </td>
      <td class="prices-col-updated"><span class="prices-updated-at">${formatUpdatedAt(item.timestamp)}</span></td>
      <td class="prices-col-price"><span class="prices-price-value ${priceClass}">${formatPrice(item.price)}</span></td>
      <td class="prices-col-sparkline">
        <div class="prices-sparkline-cell">
          <canvas id="${sparklineId}" class="prices-sparkline" width="80" height="28" data-prices="${sparklineData.join(',')}" data-trend="${item.trend}"></canvas>
          <span class="prices-trend ${trendClass}">${trendText}</span>
        </div>
      </td>
    </tr>
  `;
}

function sortPriceItems(items: PriceItem[], column: string, direction: 'asc' | 'desc'): PriceItem[] {
  return [...items].sort((a, b) => {
    let aVal: any;
    let bVal: any;
    switch (column) {
      case 'name':
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
        break;
      case 'price':
        aVal = a.price;
        bVal = b.price;
        break;
      case 'trend':
        aVal = a.trendPercent;
        bVal = b.trendPercent;
        break;
      default:
        return 0;
    }
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

export function renderPrices(): void {
  const tbody = document.getElementById('pricesTableBody');
  if (!tbody) return;
  const sortedItems = sortPriceItems(filteredPriceItems, sortColumn, sortDirection);
  document.querySelectorAll('.prices-table th').forEach(th => {
    th.classList.remove('sort-asc', 'sort-desc');
    if (th.getAttribute('data-sort') === sortColumn) th.classList.add(`sort-${sortDirection}`);
  });
  const itemCountEl = document.getElementById('pricesItemCount');
  if (itemCountEl) itemCountEl.textContent = `${sortedItems.length} item${sortedItems.length !== 1 ? 's' : ''}`;
  tbody.innerHTML = sortedItems.map(item => renderPriceRow(item)).join('');
  setTimeout(() => {
    sortedItems.forEach(item => {
      const canvas = document.getElementById(`sparkline-${item.baseId}`) as HTMLCanvasElement;
      if (!canvas) return;
      const pricesStr = canvas.getAttribute('data-prices');
      const trend = canvas.getAttribute('data-trend') as 'up' | 'down' | 'neutral';
      if (!pricesStr) return;
      renderSparkline(canvas, pricesStr.split(',').map(p => parseFloat(p)), trend);
    });
  }, 0);
}

function setDetailViewMode(open: boolean): void {
  isDetailViewOpen = open;
  const listView = document.getElementById('pricesListView');
  const detailView = document.getElementById('pricesDetailView');
  if (listView) listView.style.display = open ? 'none' : 'block';
  if (detailView) detailView.style.display = open ? 'block' : 'none';
}

function formatDisplayDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return `rgba(222, 92, 11, ${alpha})`;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getPricesChartTheme(): { primary: string; text: string; border: string; bgShade: string } {
  const styles = getComputedStyle(document.documentElement);
  return {
    primary: styles.getPropertyValue('--primary').trim() || '#DE5C0B',
    text: styles.getPropertyValue('--text').trim() || '#FAFAFA',
    border: styles.getPropertyValue('--border').trim() || '#7E7E7E',
    bgShade: styles.getPropertyValue('--bg-shade').trim() || '#272727'
  };
}

function getRangeFilteredHistory(points: PriceHistoryPoint[], days: 7 | 30 | 90): PriceHistoryPoint[] {
  if (points.length === 0) return points;
  const cutoffMs = Date.now() - days * 24 * 60 * 60 * 1000;
  const filtered = points.filter(point => point.timestamp >= cutoffMs);
  return filtered.length > 0 ? filtered : points.slice(-1);
}

function getDetailHistoryForItem(baseId: string): PriceHistoryPoint[] {
  const history90 = last90DayHistoryByItem[baseId];
  if (history90 && history90.length > 0) return history90;
  const history7 = last7DayHistoryByItem[baseId];
  if (history7 && history7.length > 0) return history7;
  return [];
}

async function ensure90DayHistoryLoaded(): Promise<void> {
  const now = Date.now();
  const isFresh = last90HistoryLeagueId === currentLeagueId
    && now - last90HistoryLoadedAt <= HISTORY_REFRESH_INTERVAL_MS
    && Object.keys(last90DayHistoryByItem).length > 0;
  if (isFresh) return;
  if (last90HistoryFetchPromise) return last90HistoryFetchPromise;

  const requestVersion = ++detail90HistoryRequestVersion;
  last90HistoryFetchPromise = webAPI.getPriceHistoryBatch({ leagueId: currentLeagueId, maxDays: 90 })
    .then(historyByItem => {
      if (requestVersion !== detail90HistoryRequestVersion) return;
      last90DayHistoryByItem = historyByItem ?? {};
      last90HistoryLoadedAt = Date.now();
      last90HistoryLeagueId = currentLeagueId;
      if (selectedBaseId) {
        const history = getDetailHistoryForItem(selectedBaseId);
        detailHistoryCache.set(`${currentLeagueId}:${selectedBaseId}`, history);
        renderDetailChart(getRangeFilteredHistory(history, selectedHistoryRangeDays));
      }
    })
    .catch(error => {
      if (requestVersion !== detail90HistoryRequestVersion) return;
      console.error('Failed to fetch 90-day detail history:', error);
    })
    .finally(() => {
      last90HistoryFetchPromise = null;
    });

  return last90HistoryFetchPromise;
}

function setHistoryRange(rangeDays: 7 | 30 | 90): void {
  selectedHistoryRangeDays = rangeDays;
  [7, 30, 90].forEach(days => {
    const btn = document.querySelector(`.prices-history-range-btn[data-range="${days}"]`) as HTMLButtonElement | null;
    if (btn) btn.classList.toggle('active', days === rangeDays);
  });
  if (!selectedBaseId) return;
  const cacheKey = `${currentLeagueId}:${selectedBaseId}`;
  const history = detailHistoryCache.get(cacheKey) ?? getDetailHistoryForItem(selectedBaseId);
  renderDetailChart(getRangeFilteredHistory(history, selectedHistoryRangeDays));
  if (rangeDays > 7) void ensure90DayHistoryLoaded();
}

function renderDetailChart(points: PriceHistoryPoint[]): void {
  const chartCanvas = document.getElementById('pricesDetailChart') as HTMLCanvasElement | null;
  const emptyEl = document.getElementById('pricesDetailEmpty');
  if (!chartCanvas || !emptyEl) return;
  const theme = getPricesChartTheme();
  if (detailChart) {
    detailChart.destroy();
    detailChart = null;
  }
  if (points.length === 0) {
    emptyEl.textContent = 'No history yet for this item.';
    emptyEl.style.display = 'flex';
    return;
  }
  emptyEl.style.display = 'none';
  const sorted = [...points].sort((a, b) => a.timestamp - b.timestamp);
  const labels = sorted.map(point => formatDisplayDate(point.timestamp));
  const values = sorted.map(point => point.price);
  const tickLabels = labels.map((label, index) => (index === 0 || index === labels.length - 1 || index % 2 === 0 ? label : ''));
  detailChart = new Chart(chartCanvas.getContext('2d'), {
    type: 'line',
    data: {
      labels: tickLabels,
      datasets: [{
        label: 'Price (FE)',
        data: values,
        borderColor: theme.primary,
        backgroundColor: hexToRgba(theme.primary, 0.10),
        fill: true,
        tension: 0.25,
        pointRadius: 3,
        pointHoverRadius: 4,
        pointBackgroundColor: theme.primary,
        pointBorderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: theme.bgShade,
          borderColor: theme.border,
          borderWidth: 1,
          titleColor: theme.text,
          bodyColor: theme.text,
          displayColors: false
        }
      },
      scales: {
        x: { ticks: { color: theme.text, maxRotation: 0, autoSkip: false }, border: { color: theme.border }, grid: { display: false } },
        y: { ticks: { color: theme.text }, border: { color: theme.border }, grid: { display: false }, beginAtZero: false }
      }
    }
  });
}

async function showItemDetail(baseId: string): Promise<void> {
  const selectedItem = allPriceItems.find(item => item.baseId === baseId);
  if (!selectedItem) return;
  selectedBaseId = baseId;
  detailRequestVersion += 1;
  const requestVersion = detailRequestVersion;
  setDetailViewMode(true);

  const detailName = document.getElementById('pricesDetailName');
  const detailDescription = document.getElementById('pricesDetailDescription');
  const detailPrice = document.getElementById('pricesDetailPrice');
  const detailUpdated = document.getElementById('pricesDetailUpdated');
  const detailIcon = document.getElementById('pricesDetailIcon') as HTMLImageElement | null;

  if (detailName) detailName.textContent = selectedItem.name;
  if (detailDescription) detailDescription.textContent = `Placeholder: ${selectedItem.name} description and usage details will be added here.`;
  if (detailPrice) detailPrice.textContent = `Price: ${formatPrice(selectedItem.price)} FE`;
  if (detailUpdated) detailUpdated.textContent = `Updated: ${formatUpdatedAt(selectedItem.timestamp)}`;
  if (detailIcon) {
    const baseUrl = import.meta.env.BASE_URL || '/';
    detailIcon.src = `${baseUrl}assets/${selectedItem.baseId}.webp`;
    detailIcon.alt = selectedItem.name;
    detailIcon.style.display = 'block';
    detailIcon.onerror = () => {
      detailIcon.style.display = 'none';
    };
  }

  const cacheKey = `${currentLeagueId}:${baseId}`;
  const immediateHistory = getDetailHistoryForItem(baseId);
  detailHistoryCache.set(cacheKey, immediateHistory);
  if (requestVersion !== detailRequestVersion || selectedBaseId !== baseId) return;
  renderDetailChart(getRangeFilteredHistory(immediateHistory, selectedHistoryRangeDays));
  void ensure90DayHistoryLoaded();
}

function applyCloud7DayHistoryToTable(): void {
  allPriceItems = allPriceItems.map(item => {
    const cloudHistory = last7DayHistoryByItem[item.baseId];
    if (!cloudHistory || cloudHistory.length === 0) return item;
    const history = cloudHistory.map(point => ({ date: point.date, price: point.price }));
    const trendData = item.price > 0 ? calculateTrendFromHistory(history) : { trend: 'neutral' as const, percent: 0 };
    return { ...item, history, trend: trendData.trend, trendPercent: trendData.percent };
  });
  applyFilters();
  renderPrices();
}

export async function loadPrices(): Promise<void> {
  try {
    const [cache, db] = await Promise.all([webAPI.getPriceCache(), webAPI.getItemDatabase()]);
    itemDatabase = db;
    priceCache = cache;

    const allItemsWithNulls: (PriceItem | null)[] = Object.entries(itemDatabase).map(([baseId, itemData]) => {
      if (baseId === FLAME_ELEMENTIUM_ID) return null;
      if (itemData.tradable === false) return null;
      const name = itemData.name || `Unknown Item (${baseId})`;
      const cachedEntry = priceCache[baseId];
      const price = cachedEntry?.price ?? 0;
      const timestamp = cachedEntry?.timestamp ?? Date.now();
      const listingCount = cachedEntry?.listingCount;
      const cloudHistory = last7DayHistoryByItem[baseId];
      const historyFromCloud = cloudHistory?.map(point => ({ date: point.date, price: point.price }));
      const historyFromLocal = cachedEntry?.history as SparklineHistoryPoint[] | undefined;
      const history = historyFromCloud && historyFromCloud.length > 0 ? historyFromCloud : historyFromLocal;
      const trendData = price > 0 ? calculateTrendFromHistory(history) : { trend: 'neutral' as const, percent: 0 };
      return { baseId, name, price, timestamp, listingCount, trend: trendData.trend, trendPercent: trendData.percent, group: itemData.group, history };
    });

    allPriceItems = allItemsWithNulls.filter((i): i is PriceItem => i !== null).sort((a, b) => a.name.localeCompare(b.name));
    if (selectedBaseId && !allPriceItems.some(i => i.baseId === selectedBaseId)) {
      selectedBaseId = null;
      detailRequestVersion += 1;
      setDetailViewMode(false);
      if (detailChart) {
        detailChart.destroy();
        detailChart = null;
      }
    }
    applyFilters();
    renderPrices();

    const now = Date.now();
    const shouldRefresh7d = last7HistoryLeagueId !== currentLeagueId
      || now - last7HistoryLoadedAt > HISTORY_REFRESH_INTERVAL_MS
      || Object.keys(last7DayHistoryByItem).length === 0;

    if (shouldRefresh7d) {
      const requestVersion = ++list7HistoryRequestVersion;
      void webAPI.getPriceHistoryBatch({ leagueId: currentLeagueId, maxDays: 7 })
        .then(historyByItem => {
          if (requestVersion !== list7HistoryRequestVersion) return;
          last7DayHistoryByItem = historyByItem ?? {};
          last7HistoryLoadedAt = Date.now();
          last7HistoryLeagueId = currentLeagueId;
          applyCloud7DayHistoryToTable();
          if (selectedBaseId) {
            const history = getDetailHistoryForItem(selectedBaseId);
            detailHistoryCache.set(`${currentLeagueId}:${selectedBaseId}`, history);
            renderDetailChart(getRangeFilteredHistory(history, selectedHistoryRangeDays));
          }
        })
        .catch(error => {
          if (requestVersion !== list7HistoryRequestVersion) return;
          console.error('Failed to fetch 7-day table history:', error);
        });
    } else {
      applyCloud7DayHistoryToTable();
    }
  } catch (error) {
    console.error('Failed to load prices:', error);
  }
}

function applyFilters(): void {
  let items = [...allPriceItems];
  if (currentSearchTerm) {
    const term = currentSearchTerm.toLowerCase();
    items = items.filter(item => item.name.toLowerCase().includes(term) || item.baseId.toLowerCase().includes(term));
  } else if (currentGroup !== 'all') {
    items = items.filter(item => item.group === currentGroup);
  }
  filteredPriceItems = items;
}

export function filterPrices(searchTerm: string): void {
  currentSearchTerm = searchTerm.trim();
  applyFilters();
  renderPrices();
}

export function filterByGroup(group: string): void {
  currentGroup = group;
  if (isDetailViewOpen) {
    detailRequestVersion += 1;
    setDetailViewMode(false);
  }
  document.querySelectorAll('.prices-sidebar-item').forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('data-group') === group) item.classList.add('active');
  });
  applyFilters();
  renderPrices();
}

export function handleSort(column: string): void {
  if (sortColumn === column) sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
  else {
    sortColumn = column;
    sortDirection = 'asc';
  }
  document.querySelectorAll('.prices-table th').forEach(th => {
    th.classList.remove('sort-asc', 'sort-desc');
    if (th.getAttribute('data-sort') === column) th.classList.add(`sort-${sortDirection}`);
  });
  renderPrices();
}

export function initPrices(): void {
  const searchInput = document.getElementById('pricesSearchInput') as HTMLInputElement;
  const clearSearch = document.getElementById('pricesClearSearch') as HTMLButtonElement;
  const sortHeaders = document.querySelectorAll('.prices-table th[data-sort]');
  const pricesBody = document.getElementById('pricesTableBody');
  const seasonSelect = document.getElementById('pricesSeasonSelect') as HTMLSelectElement | null;
  const detailBackBtn = document.getElementById('pricesDetailBackBtn');
  const historyRangeButtons = document.querySelectorAll('.prices-history-range-btn');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = (e.target as HTMLInputElement).value;
      filterPrices(term);
      if (clearSearch) clearSearch.style.display = term ? 'block' : 'none';
    });
  }
  if (clearSearch) {
    clearSearch.addEventListener('click', () => {
      if (!searchInput) return;
      searchInput.value = '';
      filterPrices('');
      clearSearch.style.display = 'none';
    });
  }

  sortHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const column = header.getAttribute('data-sort');
      if (column) handleSort(column);
    });
  });

  if (pricesBody) {
    pricesBody.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const row = target.closest('tr[data-base-id]') as HTMLElement | null;
      const baseId = row?.getAttribute('data-base-id');
      if (baseId) void showItemDetail(baseId);
    });
  }

  if (seasonSelect) {
    currentLeagueId = seasonSelect.value;
    seasonSelect.addEventListener('change', () => {
      currentLeagueId = seasonSelect.value;
      detailHistoryCache.clear();
      list7HistoryRequestVersion += 1;
      detail90HistoryRequestVersion += 1;
      last7DayHistoryByItem = {};
      last90DayHistoryByItem = {};
      last7HistoryLoadedAt = 0;
      last7HistoryLeagueId = '';
      last90HistoryLoadedAt = 0;
      last90HistoryLeagueId = '';
      last90HistoryFetchPromise = null;
      void loadPrices();
      if (selectedBaseId) void showItemDetail(selectedBaseId);
    });
  }

  if (detailBackBtn) {
    detailBackBtn.addEventListener('click', () => {
      detailRequestVersion += 1;
      setDetailViewMode(false);
    });
  }

  historyRangeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const range = Number((button as HTMLElement).getAttribute('data-range'));
      if (range === 7 || range === 30 || range === 90) setHistoryRange(range);
    });
  });

  document.querySelectorAll('.prices-sidebar-item').forEach(item => {
    item.addEventListener('click', () => {
      const group = item.getAttribute('data-group');
      if (group) filterByGroup(group);
    });
  });

  const pricesPage = document.getElementById('page-prices');
  if (pricesPage) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          if (pricesPage.classList.contains('active')) void loadPrices();
        }
      });
    });
    observer.observe(pricesPage, { attributes: true });
  }

  setHistoryRange(7);
  setDetailViewMode(false);
  void loadPrices();
  void ensure90DayHistoryLoaded();

  webAPI.onInventoryUpdate(() => {
    const page = document.getElementById('page-prices');
    if (page?.classList.contains('active')) void loadPrices();
  });
}
