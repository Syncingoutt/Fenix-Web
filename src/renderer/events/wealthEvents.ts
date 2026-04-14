// Wealth tracking event handlers

import { setWealthMode, getWealthMode, getIsHourlyActive, getRealtimeElapsedSeconds, getHourlyPaused } from '../state/wealthState.js';
import { formatTime } from '../utils/formatting.js';
import {
  realtimeBtn,
  hourlyBtn,
  hourlyControls,
  startHourlyBtn,
  stopHourlyBtn,
  pauseHourlyBtn,
  resumeHourlyBtn,
  timerEl,
  resetRealtimeBtn
} from '../dom/domElements.js';

let startHourlyTracking: () => void;
let stopHourlyTracking: () => void;
let pauseHourlyTracking: () => void;
let resumeHourlyTracking: () => void;
let resetRealtimeTracking: () => void;
let updateRealtimeWealth: () => void;
let updateHourlyWealth: () => void;
let renderInventory: () => void;
let renderBreakdown: (renderInventoryFn: () => void) => void;
let updateGraph: () => void;
let closeBreakdownModal: () => void;

export function initWealthEvents(
  startHourlyFn: () => void,
  stopHourlyFn: () => void,
  pauseHourlyFn: () => void,
  resumeHourlyFn: () => void,
  resetRealtimeFn: () => void,
  realtimeWealthUpdater: () => void,
  hourlyWealthUpdater: () => void,
  inventoryRenderer: () => void,
  breakdownRenderer: (renderInventoryFn: () => void) => void,
  graphUpdater: () => void,
  breakdownModalCloseFn: () => void
): void {
  startHourlyTracking = startHourlyFn;
  stopHourlyTracking = stopHourlyFn;
  pauseHourlyTracking = pauseHourlyFn;
  resumeHourlyTracking = resumeHourlyFn;
  resetRealtimeTracking = resetRealtimeFn;
  updateRealtimeWealth = realtimeWealthUpdater;
  updateHourlyWealth = hourlyWealthUpdater;
  renderInventory = inventoryRenderer;
  renderBreakdown = breakdownRenderer;
  updateGraph = graphUpdater;
  closeBreakdownModal = breakdownModalCloseFn;
  
  // Mode switching
  realtimeBtn.addEventListener('click', () => {
    setWealthMode('realtime');
    realtimeBtn.classList.add('active');
    hourlyBtn.classList.remove('active');
    hourlyControls.classList.remove('active');
    
    // Show realtime timer and reset button
    timerEl.style.display = 'block';
    resetRealtimeBtn.style.display = 'block';
    timerEl.textContent = formatTime(getRealtimeElapsedSeconds());
    
    // Update display to show realtime values
    updateRealtimeWealth();
    renderInventory(); // Show all items
    renderBreakdown(renderInventory); // Update breakdown for realtime mode
    updateGraph();
  });
  
  hourlyBtn.addEventListener('click', () => {
    setWealthMode('hourly');
    realtimeBtn.classList.remove('active');
    hourlyBtn.classList.add('active');
    hourlyControls.classList.add('active');
    
    // Hide realtime timer and reset button when in hourly mode, show controls
    timerEl.style.display = 'none';
    resetRealtimeBtn.style.display = 'none';
    
    // Update display to show hourly values (if session is active)
    if (getIsHourlyActive()) {
      updateHourlyWealth();
      renderInventory(); // Show only new items
      renderBreakdown(renderInventory); // Update breakdown for hourly mode
    } else {
      const wealthValueEl = document.getElementById('wealthValue');
      const wealthHourlyEl = document.getElementById('wealthHourly');
      if (wealthValueEl) wealthValueEl.textContent = '0.00';
      if (wealthHourlyEl) wealthHourlyEl.textContent = '0.00';
      renderInventory(); // Show all items (no active hourly session)
      renderBreakdown(renderInventory); // Update breakdown (will show 0s if no hourly session)
    }
    updateGraph();
    
  });
  
  startHourlyBtn.addEventListener('click', startHourlyTracking);
  stopHourlyBtn.addEventListener('click', stopHourlyTracking);
  pauseHourlyBtn.addEventListener('click', pauseHourlyTracking);
  resumeHourlyBtn.addEventListener('click', resumeHourlyTracking);
  resetRealtimeBtn.addEventListener('click', resetRealtimeTracking);
  
  // Breakdown modal close button
  document.getElementById('closeBreakdown')?.addEventListener('click', closeBreakdownModal);
}
