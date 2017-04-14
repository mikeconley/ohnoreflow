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
    }
    this._enabled = val;
    this.saveState();
    return this._enabled;
  },

  get enabled() {
    return this._enabled;
  },

  _threshold: 1.0,
  set threshold(val) {
    if (!isNaN(val)) {
      this._threshold = val;
      this.saveState();
    }
    return this._threshold;
  },

  get threshold() {
    return this._threshold;
  },

  saveState() {
    let state = {
      enabled: this.enabled,
      threshold: this.threshold,
    };

    browser.storage.local.set({ state });
  },

  init(state) {
    browser.runtime.onMessage.addListener(this.messageListener.bind(this));
    this.threshold = parseFloat(state.threshold, 10);
    if (state.enabled) {
      this.toggle(true);
    }
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
        sendReply({ enabled: this.enabled, threshold: this.threshold });
        break;
      }
      case "toggle": {
        this.toggle(msg.enabled);
        break;
      }
      case "threshold": {
        this.threshold = msg.threshold;
      }
    }
  },

  reflow(reflowData) {
    // Let's hardcode a threshold for now. Probably will make this
    // configurable at some point.
    let totalTime = (reflowData.stop - reflowData.start).toPrecision(2);
    if (totalTime >= this.threshold) {
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
      let iconSuffix = this.enabled ? "on" : "off";
      let path = `icons/toolbar_${iconSuffix}.png`;
      browser.browserAction.setIcon({ path });
      this.updateBadge();
    }
  },

  updateBadge() {
    let text = this.enabled ? this.reflowLog.length.toString() : "";
    browser.browserAction.setBadgeText({ text });
  },
}

browser.storage.local.get("state").then(result => {
  OhNoReflow.init(result.state);
});
