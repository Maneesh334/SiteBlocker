// Initialize storage with empty arrays and whitelist mode off
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['blockedSites', 'whitelistSites', 'whitelistMode'], function(result) {
    if (!result.blockedSites) {
      chrome.storage.sync.set({ blockedSites: [] });
    }
    if (!result.whitelistSites) {
      chrome.storage.sync.set({ whitelistSites: [] });
    }
    if (result.whitelistMode === undefined) {
      chrome.storage.sync.set({ whitelistMode: false });
    }
  });
});

// Function to update blocking rules
async function updateBlockingRules(blockedSites, whitelistSites, whitelistMode) {
  try {
    const baseRuleId = 1000;
    
    // Get and remove all existing rules
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const existingRuleIds = existingRules.map(rule => rule.id);
    
    if (existingRuleIds.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existingRuleIds
      });
    }

    let rules = [];
    
    if (whitelistMode) {
      // In whitelist mode, block everything except whitelisted sites
      rules = whitelistSites.map((site, index) => {
        const normalizedDomain = site.toLowerCase().replace(/^www\./, '');
        
        return [
          // Allow exact domain
          {
            id: baseRuleId + (index * 3),
            priority: 2,
            action: { type: 'allow' },
            condition: {
              urlFilter: `*://${normalizedDomain}/*`,
              resourceTypes: ['main_frame', 'sub_frame', 'script', 'xmlhttprequest']
            }
          },
          // Allow www subdomain
          {
            id: baseRuleId + (index * 3) + 1,
            priority: 2,
            action: { type: 'allow' },
            condition: {
              urlFilter: `*://www.${normalizedDomain}/*`,
              resourceTypes: ['main_frame', 'sub_frame', 'script', 'xmlhttprequest']
            }
          },
          // Allow all other subdomains
          {
            id: baseRuleId + (index * 3) + 2,
            priority: 2,
            action: { type: 'allow' },
            condition: {
              urlFilter: `*://*.${normalizedDomain}/*`,
              resourceTypes: ['main_frame', 'sub_frame', 'script', 'xmlhttprequest']
            }
          }
        ];
      }).flat();

      // Add a catch-all block rule with lowest priority
      rules.push({
        id: baseRuleId + 9999,
        priority: 1,
        action: { type: 'block' },
        condition: {
          urlFilter: '*',
          resourceTypes: ['main_frame', 'sub_frame', 'script', 'xmlhttprequest']
        }
      });
    } else {
      // In normal mode, block only the blocked sites
      rules = blockedSites.map((site, index) => {
        const normalizedDomain = site.toLowerCase().replace(/^www\./, '');
        
        return [
          // Block exact domain
          {
            id: baseRuleId + (index * 3),
            priority: 1,
            action: { type: 'block' },
            condition: {
              urlFilter: `*://${normalizedDomain}/*`,
              resourceTypes: ['main_frame', 'sub_frame', 'script', 'xmlhttprequest']
            }
          },
          // Block www subdomain
          {
            id: baseRuleId + (index * 3) + 1,
            priority: 1,
            action: { type: 'block' },
            condition: {
              urlFilter: `*://www.${normalizedDomain}/*`,
              resourceTypes: ['main_frame', 'sub_frame', 'script', 'xmlhttprequest']
            }
          },
          // Block all other subdomains
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
    }

    if (rules.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: rules
      });
    }
  } catch (error) {
    console.error('Error updating blocking rules:', error);
  }
}

// Listen for storage changes to update blocking rules
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    chrome.storage.sync.get(['blockedSites', 'whitelistSites', 'whitelistMode'], function(result) {
      updateBlockingRules(
        result.blockedSites || [],
        result.whitelistSites || [],
        result.whitelistMode || false
      );
    });
  }
});

// Initialize rules with current settings
chrome.storage.sync.get(['blockedSites', 'whitelistSites', 'whitelistMode'], function(result) {
  updateBlockingRules(
    result.blockedSites || [],
    result.whitelistSites || [],
    result.whitelistMode || false
  );
}); 