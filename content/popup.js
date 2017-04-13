const Panel = {
  get $dumpReport() {
    delete this.$dump;
    return this.$dump = document.getElementById("dump-report");
  },

  get $toggle() {
    delete this.$toggle;
    return this.$toggle = document.getElementById("toggle");
  },

  get $controls() {
    delete this.$controls;
    return this.$controls = document.getElementById("controls");
  },

  init() {
    this.$dumpReport.addEventListener("click", this);
    this.$toggle.addEventListener("click", this);
    browser.runtime.sendMessage({ name: "is-enabled" }).then(enabled => {
      this.$controls.setAttribute("enabled", enabled);
      this.$toggle.checked = enabled;
    });
  },

  handleEvent(event) {
    switch(event.originalTarget.id) {
      case "dump-report": {
        browser.tabs.create({
          url: "/content/report.html",
        });
        window.close();
        break;
      }

      case "toggle": {
        let enabled = event.originalTarget.checked;
        browser.runtime.sendMessage({ name: "toggle", enabled });
        this.$controls.setAttribute("enabled", enabled);
        break;
      }
    }
  }
}


addEventListener("load", function() {
  Panel.init();
});
