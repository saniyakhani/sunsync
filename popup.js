let focusMode = false;
let blockedSites = [];

document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('toggle-focus');
  const statusElement = document.getElementById('status');
  const blockedSitesList = document.getElementById('blocked-sites');
  const newSiteInput = document.getElementById('new-site');
  const addSiteButton = document.getElementById('add-site');

  // Load saved state
  chrome.storage.sync.get(['focusMode', 'blockedSites'], (result) => {
    focusMode = result.focusMode || false;
    blockedSites = result.blockedSites || [];
    updateUI();
  });

  toggleButton.addEventListener('click', () => {
    focusMode = !focusMode;
    chrome.storage.sync.set({ focusMode });
    updateUI();
    chrome.runtime.sendMessage({ action: 'toggleFocusMode', focusMode });
  });

  addSiteButton.addEventListener('click', () => {
    const newSite = newSiteInput.value.trim();
    if (newSite && !blockedSites.includes(newSite)) {
      blockedSites.push(newSite);
      chrome.storage.sync.set({ blockedSites });
      updateUI();
      chrome.runtime.sendMessage({ action: 'updateBlockedSites', blockedSites });
      newSiteInput.value = '';
    }
  });

  function updateUI() {
    toggleButton.textContent = focusMode ? 'Stop Focusing' : 'Start Focusing';
    statusElement.textContent = focusMode ? 'Focus mode is ON' : 'Focus mode is OFF';
    
    blockedSitesList.innerHTML = '';
    blockedSites.forEach((site) => {
      const li = document.createElement('li');
      li.textContent = site;
      blockedSitesList.appendChild(li);
    });
  }
});