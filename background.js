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
  try {
    const baseRuleId = 1000;
    
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const existingRuleIds = existingRules.map(rule => rule.id);
    
    // Remove all existing rules
    if (existingRuleIds.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existingRuleIds
      });
    }

    const rules = blockedSites.map((site, index) => {
      // Normalize the domain
      const normalizedDomain = site.toLowerCase().replace(/^www\./, '');
      
      return [
        // Rule for exact domain match
        {
          id: baseRuleId + (index * 3),
          priority: 1,
          action: { type: 'block' },
          condition: {
            urlFilter: `*://${normalizedDomain}/*`,
            resourceTypes: ['main_frame', 'sub_frame', 'script', 'xmlhttprequest']
          }
        },
        // Rule for www subdomain
        {
          id: baseRuleId + (index * 3) + 1,
          priority: 1,
          action: { type: 'block' },
          condition: {
            urlFilter: `*://www.${normalizedDomain}/*`,
            resourceTypes: ['main_frame', 'sub_frame', 'script', 'xmlhttprequest']
          }
        },
        // Rule for all other subdomains
        {
          id: baseRuleId + (index * 3) + 2,
          priority: 1,
          action: { type: 'block' },
          condition: {
            urlFilter: `*://*.${normalizedDomain}/*`,
            resourceTypes: ['main_frame', 'sub_frame', 'script', 'xmlhttprequest']
          }
        }
      ];
    }).flat(); 


    if (rules.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: rules
      });
    }
  } catch (error) {
    console.error('Error updating blocking rules:', error);
  }
}


chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.blockedSites) {
    updateBlockingRules(changes.blockedSites.newValue || []);
  }
});


chrome.storage.sync.get(['blockedSites'], function(result) {
  updateBlockingRules(result.blockedSites || []);
}); 