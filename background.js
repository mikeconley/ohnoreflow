function reflowListener(windowId, start, stop, stack) {
  OhNoReflow.reflow({
    windowId,
    start,
    stop,
    stack,
  });
}

const DEFAULT_STATE = {
  enabled: true,
  threshold: "0.0",
  sound: false,
  ignoreNative: true,
};

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

  sound: false,
  ignoreNative: true,

  saveState() {
    let state = {
      enabled: this.enabled,
      threshold: this.threshold,
      sound: this.sound,
      ignoreNative: this.ignoreNative,
    };

    browser.storage.local.set({ state });
  },

  init(state, signatureStuff) {
    browser.runtime.onMessage.addListener(this.messageListener.bind(this));
    browser.commands.onCommand.addListener(this.commandListener.bind(this));

    this.threshold = parseFloat(state.threshold, 10);
    if (state.enabled) {
      this.toggle(true);
    }

    this.sound = !!state.sound;
    if (state.ignoreNative !== undefined) {
      this.ignoreNative = !!state.ignoreNative;
    }

    this.sigData = [];
    this.loadSigData(signatureStuff);
  },

  commandListener(command) {
    switch (command) {
      case "Toggle": {
        this.toggle(!this.enabled);
        break;
      }
      case "DumpReport": {
        this.dumpReport();
        break;
      }
    }
  },

  messageListener(msg, sender, sendReply) {
    switch (msg.name) {
      case "get-reflows": {
        sendReply(this.reflowLog);
        break;
      }
      case "get-signature-data": {
        sendReply(this.sigData);
        break;
      }
      case "reset": {
        this.reset();
        break;
      }
      case "get-state": {
        sendReply({
          enabled: this.enabled,
          threshold: this.threshold,
          sound: this.sound,
          ignoreNative: this.ignoreNative,
        });
        break;
      }
      case "toggle": {
        this.toggle(msg.enabled);
        break;
      }
      case "threshold": {
        this.threshold = msg.threshold;
        break;
      }
      case "sound": {
        this.sound = msg.enabled;
        break;
      }
      case "ignoreNative": {
        this.ignoreNative = msg.enabled;
        break;
      }
      case "dumpReport": {
        this.dumpReport();
        break;
      }
    }
  },

  reflow(reflowData) {
    if (this.ignoreNative && !reflowData.stack) {
      return;
    }

    let totalTime = (reflowData.stop - reflowData.start).toFixed(2);
    if (totalTime >= this.threshold) {
      this.reflowLog.push(reflowData);
      if (this.sound) {
        this.playSound();
      }
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

  dumpReport() {
    browser.tabs.create({
      url: "/content/report.html",
    });
  },

  _playTimer: null,
  _soundObj: new Audio("/sounds/sonar-sweep.mp3"),
  playSound() {
    if (this._playTimer) {
      clearTimeout(this._playTimer);
    }
    this._playTimer = setTimeout(() => {
      this._soundObj.play();
      this._playTimer = null;
    }, 500);
  },

  updateBadge() {
    let text = this.enabled ? this.reflowLog.length.toString() : "";
    browser.browserAction.setBadgeText({ text });
  },

  loadSigData(signatureStuff) {
    this.sigData = [];

    for (let sigEntry of signatureStuff.data) {
      let bugs = sigEntry.bugs;
      let signatures = sigEntry.signatures;
      this.sigData.push({ bugs, signatures });
    }
  },
};

browser.storage.local.get("state").then((result) => {
  window.fetch("docs/signatures.json").then((response) => {
    response.json().then((sigs) => {
      OhNoReflow.init(result.state || DEFAULT_STATE, sigs);
    });
  });
});
