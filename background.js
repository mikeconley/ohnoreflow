let reflowLog = [];

function updateBadge() {
  browser.browserAction.setBadgeText({
    text: reflowLog.length.toString(),
  });
}

browser.reflows.onUninterruptableReflow.addListener((windowId, start, stop, stack) => {
  reflowLog.push({
    windowId, start, stop, stack
  });
  updateBadge();
});

browser.runtime.onMessage.addListener((msg, sender, sendReply) => {
  switch(msg) {
    case "get-reflows": {
      sendReply(reflowLog);
      break;
    }
    case "reset": {
      reflowLog = [];
      updateBadge();
      break;
    }
  }
});