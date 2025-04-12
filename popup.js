document.addEventListener('DOMContentLoaded', function() {
  const siteInput = document.getElementById('siteInput');
  const addButton = document.getElementById('addSite');
  const blockedSitesList = document.getElementById('blockedSites');

  // Load blocked sites when popup opens
  loadBlockedSites();

  addButton.addEventListener('click', function() {
    const domain = siteInput.value.trim();
    if (domain) {
      addBlockedSite(domain);
      siteInput.value = '';
    }
  });

  function addBlockedSite(domain) {
    chrome.storage.sync.get(['blockedSites'], function(result) {
      const blockedSites = result.blockedSites || [];
      if (!blockedSites.includes(domain)) {
        blockedSites.push(domain);
        chrome.storage.sync.set({ blockedSites: blockedSites }, function() {
          displayBlockedSites(blockedSites);
        });
      }
    });
  }

  function removeBlockedSite(domain) {
    chrome.storage.sync.get(['blockedSites'], function(result) {
      const blockedSites = result.blockedSites || [];
      const index = blockedSites.indexOf(domain);
      if (index > -1) {
        blockedSites.splice(index, 1);
        chrome.storage.sync.set({ blockedSites: blockedSites }, function() {
          displayBlockedSites(blockedSites);
        });
      }
    });
  }

  function displayBlockedSites(sites) {
    blockedSitesList.innerHTML = '';
    sites.forEach(function(domain) {
      const siteItem = document.createElement('div');
      siteItem.className = 'site-item';
      
      const domainText = document.createElement('span');
      domainText.textContent = domain;
      
      const removeButton = document.createElement('button');
      removeButton.className = 'remove-btn';
      removeButton.textContent = 'Remove';
      removeButton.addEventListener('click', function() {
        removeBlockedSite(domain);
      });
      
      siteItem.appendChild(domainText);
      siteItem.appendChild(removeButton);
      blockedSitesList.appendChild(siteItem);
    });
  }

  function loadBlockedSites() {
    chrome.storage.sync.get(['blockedSites'], function(result) {
      const blockedSites = result.blockedSites || [];
      displayBlockedSites(blockedSites);
    });
  }
}); 