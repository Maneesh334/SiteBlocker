// Initialize storage with empty array if not exists
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['blockedSites'], function(result) {
    if (!result.blockedSites) {
      chrome.storage.sync.set({ blockedSites: [] });
    }
  });
});

// Function to update blocking rules
async function updateBlockingRules(blockedSites) {
  // Remove all existing rules
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: blockedSites.map((_, index) => index + 1)
  });

  // Add new rules for each blocked site
  const rules = blockedSites.map((site, index) => ({
    id: index + 1,
    priority: 1,
    action: { type: 'block' },
    condition: {
      urlFilter: `*://*.${site}/*`,
      resourceTypes: ['main_frame', 'sub_frame', 'script', 'xmlhttprequest']
    }
  }));

  // Add the new rules
  await chrome.declarativeNetRequest.updateDynamicRules({
    addRules: rules
  });
}

// Listen for storage changes to update blocking rules
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.blockedSites) {
    updateBlockingRules(changes.blockedSites.newValue || []);
  }
});

// Initialize rules with current blocked sites
chrome.storage.sync.get(['blockedSites'], function(result) {
  updateBlockingRules(result.blockedSites || []);
}); 