let reflowLog = [];

browser.reflows.onUninterruptableReflow.addListener((windowId, start, stop, stack) => {
  reflowLog.push({
    windowId, start, stop, stack
  });
  console.log(windowId, start, stop, stack);

  browser.browserAction.setBadgeText({
    text: reflowLog.length.toString(),
  });
});