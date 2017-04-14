function reflowListener(windowId, start, stop, stack) {
  OhNoReflow.reflow({
    windowId, start, stop, stack
  });
}

const OhNoReflow = {
  reflowLog: [],

  _enabled: false,
  set enabled(val) {
    if (val) {
      browser.reflows.onUninterruptableReflow.addListener(reflowListener);
    } else {
      browser.reflows.onUninterruptableReflow.removeListener(reflowListener);
      this.reflowLog = [];
    }
    this._enabled = val;
  },

  get enabled() {
    return this._enabled;
  },

  init() {
    browser.runtime.onMessage.addListener(this.messageListener.bind(this));
    this.toggle(true);
  },

  messageListener(msg, sender, sendReply) {
    switch(msg.name) {
      case "get-reflows": {
        sendReply(this.reflowLog);
        break;
      }
      case "reset": {
        this.reset();
        break;
      }
      case "is-enabled": {
        sendReply(this.enabled);
        break;
      }
      case "toggle": {
        this.toggle(msg.enabled);
        break;
      }
    }
  },

  reflow(reflowData) {
    // Let's hardcode a threshold for now. Probably will make this
    // configurable at some point.
    let totalTime = (reflowData.stop - reflowData.start).toPrecision(2);
    if (totalTime > 1.0) {
      this.reflowLog.push(reflowData);
      this.updateBadge();
    }
  },

  reset() {
    this.reflowLog = [];
    this.updateBadge();
  },

  toggle(enabled) {
    if (this.enabled != enabled) {
      this.enabled = enabled;
      this.reset();
      let iconSuffix = this.enabled ? "on" : "off";
      let path = `icons/toolbar_${iconSuffix}.png`;
      console.log("Setting badge icon to " + path);
      browser.browserAction.setIcon({ path });
    }
  },

  updateBadge() {
    let text = this.enabled ? this.reflowLog.length.toString() : "";
    browser.browserAction.setBadgeText({ text });
  },
}

OhNoReflow.init();