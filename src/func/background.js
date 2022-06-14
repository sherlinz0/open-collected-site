chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(["collectedSites", "settings"], (res) => {
    const collectedSites = res.collectedSites || [{address: 'http://www.baidu.com', description: '一个搜索往网站', id:'a2'}];
    const settings = res.settings || {
      language: 'zh'
    };

    chrome.storage.sync.set({ collectedSites, settings });
  });
});
