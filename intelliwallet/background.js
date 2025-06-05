// Background service worker for Chrome extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('IntelliWallet extension installed');
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  chrome.action.openPopup();
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getWalletInfo') {
    chrome.storage.local.get(['hasWallet']).then((result) => {
      sendResponse({ hasWallet: result.hasWallet || false });
    });
    return true; // Keep the message channel open for async response
  }
});

