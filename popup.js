document.addEventListener('DOMContentLoaded', function() {
  const blockedSiteInput = document.getElementById('blockedSiteInput');
  const whitelistSiteInput = document.getElementById('whitelistSiteInput');
  const addBlockedSiteButton = document.getElementById('addBlockedSite');
  const addWhitelistSiteButton = document.getElementById('addWhitelistSite');
  const whitelistModeCheckbox = document.getElementById('whitelistMode');
  const blockedSitesList = document.getElementById('blockedSites');
  const whitelistSitesList = document.getElementById('whitelistSites');
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  // Load initial state
  loadState();

  // Tab switching
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tab = button.dataset.tab;
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      button.classList.add('active');
      document.getElementById(`${tab}Tab`).classList.add('active');
    });
  });

  // Whitelist mode toggle
  whitelistModeCheckbox.addEventListener('change', function() {
    chrome.storage.sync.set({ whitelistMode: this.checked });
  });

  // Add blocked site
  addBlockedSiteButton.addEventListener('click', function() {
    const domain = blockedSiteInput.value.trim();
    if (domain) {
      addSite(domain, 'blockedSites');
      blockedSiteInput.value = '';
    }
  });

  // Add whitelist site
  addWhitelistSiteButton.addEventListener('click', function() {
    const domain = whitelistSiteInput.value.trim();
    if (domain) {
      addSite(domain, 'whitelistSites');
      whitelistSiteInput.value = '';
    }
  });

  function addSite(domain, listName) {
    chrome.storage.sync.get([listName], function(result) {
      const sites = result[listName] || [];
      if (!sites.includes(domain)) {
        sites.push(domain);
        chrome.storage.sync.set({ [listName]: sites });
      }
    });
  }

  function removeSite(domain, listName) {
    chrome.storage.sync.get([listName], function(result) {
      const sites = result[listName] || [];
      const index = sites.indexOf(domain);
      if (index > -1) {
        sites.splice(index, 1);
        chrome.storage.sync.set({ [listName]: sites });
      }
    });
  }

  function displaySites(sites, container, listName) {
    container.innerHTML = '';
    sites.forEach(function(domain) {
      const siteItem = document.createElement('div');
      siteItem.className = 'site-item';
      
      const domainText = document.createElement('span');
      domainText.textContent = domain;
      
      const removeButton = document.createElement('button');
      removeButton.className = 'remove-btn';
      removeButton.textContent = 'Remove';
      removeButton.addEventListener('click', function() {
        removeSite(domain, listName);
      });
      
      siteItem.appendChild(domainText);
      siteItem.appendChild(removeButton);
      container.appendChild(siteItem);
    });
  }

  function loadState() {
    chrome.storage.sync.get(['blockedSites', 'whitelistSites', 'whitelistMode'], function(result) {
      // Set whitelist mode checkbox
      whitelistModeCheckbox.checked = result.whitelistMode || false;
      
      // Display blocked sites
      displaySites(result.blockedSites || [], blockedSitesList, 'blockedSites');
      
      // Display whitelist sites
      displaySites(result.whitelistSites || [], whitelistSitesList, 'whitelistSites');
    });
  }

  // Listen for storage changes
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'sync') {
      loadState();
    }
  });
}); 