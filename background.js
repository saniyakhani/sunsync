let focusMode = false;
let blockedSites = [];

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['focusMode', 'blockedSites'], (result) => {
    focusMode = result.focusMode || false;
    blockedSites = result.blockedSites || [];
    updateBlockingRules();
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleFocusMode') {
    focusMode = request.focusMode;
    updateBlockingRules();
  } else if (request.action === 'updateBlockedSites') {
    blockedSites = request.blockedSites;
    updateBlockingRules();
  }
});

function updateBlockingRules() {
  if (focusMode) {
    const rules = blockedSites.map((site, index) => ({
      id: index + 1,
      priority: 1,
      action: { type: 'block' },
      condition: { urlFilter: `*://${site}/*`, resourceTypes: ['main_frame'] }
    }));

    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: rules.map(rule => rule.id),
      addRules: rules
    });
  } else {
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: blockedSites.map((_, index) => index + 1)
    });
  }
}