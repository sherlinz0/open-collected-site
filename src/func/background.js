chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(["collectedSites", "settings"], (res) => {
    const collectedSites = res.collectedSites || [];
    const settings = res.settings || {
      language: 'en'
    };

    chrome.storage.sync.set({ collectedSites, settings });
  });
});
