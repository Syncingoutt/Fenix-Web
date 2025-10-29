interface InventoryItem {
  itemName: string;
  totalQuantity: number;
  baseId: string;
  price: number | null;
  instances: number;
  lastUpdated: string;
}

interface ElectronAPI {
  getInventory: () => Promise<InventoryItem[]>;
  onInventoryUpdate: (callback: () => void) => void;
}

declare const electronAPI: ElectronAPI;

async function loadInventory() {
  const inventory = await electronAPI.getInventory();
  renderInventory(inventory);
  updateStats(inventory);
}

function renderInventory(items: InventoryItem[]) {
  const container = document.getElementById('inventory');
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = '<div class="loading">No items found. Open the game and sort your stash!</div>';
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="item-row">
      <div class="item-name">
        ${item.itemName}
        ${item.instances > 1 ? `<span style="color: #9ca3af; font-size: 12px;"> (${item.instances} stacks)</span>` : ''}
      </div>
      <div class="item-quantity">${item.totalQuantity.toLocaleString()}</div>
      <div class="item-price ${item.price === null ? 'no-price' : ''}">
        ${item.price !== null ? item.price.toFixed(2) : 'Not Set'}
      </div>
    </div>
  `).join('');
}

function updateStats(items: InventoryItem[]) {
  const totalItems = items.reduce((sum, item) => sum + item.totalQuantity, 0);
  const itemsPriced = items.filter(item => item.price !== null).length;
  const totalValue = items.reduce((sum, item) => {
    if (item.price !== null) {
      return sum + (item.totalQuantity * item.price);
    }
    return sum;
  }, 0);

  const totalItemsEl = document.getElementById('totalItems');
  const itemsPricedEl = document.getElementById('itemsPriced');
  const totalValueEl = document.getElementById('totalValue');

  if (totalItemsEl) totalItemsEl.textContent = totalItems.toLocaleString();
  if (itemsPricedEl) itemsPricedEl.textContent = `${itemsPriced}/${items.length}`;
  if (totalValueEl) totalValueEl.textContent = totalValue > 0 ? totalValue.toFixed(2) : '-';
}

// Initial load
loadInventory();

// Listen for updates
electronAPI.onInventoryUpdate(() => {
  loadInventory();
});