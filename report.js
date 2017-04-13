const ReflowReport = {

  reflows: [],

  get $tableBody() {
    delete this.$tableBody;
    return this.$tableBody = document.getElementById("table-body");
  },

  get $reset() {
    delete this.$reset;
    return this.$reset = document.getElementById("reset");
  },

  get $status() {
    delete this.$status;
    return this.$status = document.getElementById("status");
  },

  init() {
    this.$reset.addEventListener("click", this);

    browser.runtime.sendMessage("get-reflows").then(reflows => {
      if (!reflows) {
        this.$status.textContent = "No reflows detected. Hooray!";
      } else {
        this.reflows = reflows;
        this.injectReport(reflows);
        this.$status.hidden = true;
      }
    });
  },

  injectReport(reflows) {
    let frag = document.createDocumentFragment();
    for (let i = 0; i < reflows.length; ++i) {
      let reflow = reflows[i];
      let row = document.createElement("tr");

      // Reflow sequence number
      let num = document.createElement("td");
      num.textContent = i;
      row.appendChild(num);

      // Total time for reflow in ms
      let time = document.createElement("td");
      time.textContent = (reflow.stop - reflow.start).toPrecision(2) + "ms";
      row.appendChild(time);

      // Number of reflowed frames (coming soon!)
      let frameNum = document.createElement("td");
      frameNum.textContent = "N/A";
      frameNum.classList.add("disabled");
      row.appendChild(frameNum);

      // Stack!
      let stack = document.createElement("td");

      if (reflow.stack) {
        let stackPre = document.createElement("pre");
        stackPre.textContent = reflow.stack;
        stack.appendChild(stackPre);
      } else {
        let anchor = document.createElement("a");
        anchor.href = "#note-on-native-reflow";
        anchor.textContent = "Caused by native code";
        stack.appendChild(anchor);
      }

      row.appendChild(stack);

      frag.appendChild(row);
    }

    this.$tableBody.appendChild(frag);
  },

  reset() {
    if (confirm("Get rid of recordings so far? The report will remain open.")) {
      browser.runtime.sendMessage("reset");
    }
  },

  handleEvent(event) {
    if (event.originalTarget.id == "reset") {
      this.reset();
    }
  }
};

addEventListener("load", function() {
  ReflowReport.init();
});