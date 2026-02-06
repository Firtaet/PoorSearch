chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get({ enabled: true, blockedCount: 0 }, (state) => {
    chrome.storage.local.set({
      enabled: state.enabled ?? true,
      blockedCount: state.blockedCount ?? 0
    });
  });
});
