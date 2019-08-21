const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");

XPCOMUtils.defineLazyModuleGetter(this, "ExtensionUtils",
                                  "resource://gre/modules/ExtensionUtils.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "ExtensionCommon",
                                  "resource://gre/modules/ExtensionCommon.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "ExtensionParent",
                                  "resource://gre/modules/ExtensionParent.jsm");

this.reflows = class extends ExtensionAPI {
  getAPI(context) {
    const { windowManager } = context.extension;

    let EventManager = ExtensionCommon.EventManager;

    // Weakly maps XUL windows to their reflow observers.
    let windowMap = new WeakMap();

    return {
      reflows: {
        onUninterruptableReflow: new EventManager({
          context,
          name: "reflow-api",
          register: fire => {
            const windowTracker = ExtensionParent.apiManager.global.windowTracker;
            let windows = Array.from(windowManager.getAll(), win => win.window);

            let observeWindow = (win) => {
              let observer = {
                reflow(start, end) {
                  // Grab the stack, but slice off the top frame inside this observer.
                  let stack = new Error().stack.split("\n").slice(1).join("\n");
                  // If the stack string is empty, and a debugger is attached, try to
                  // hit a breakpoint.
                  if (!stack) {
                    let debug = Cc["@mozilla.org/xpcom/debug;1"].getService(Ci.nsIDebug2);
                    if (debug.isDebuggerAttached) {
                      debug.break("api.js", -1);
                    }
                  }

                  let id = windowTracker.getId(win);
                  fire.async(id, start, end, stack);
                },
                reflowInterruptible(start, end) {},
                QueryInterface: ChromeUtils.generateQI([Ci.nsIReflowObserver,
                                                        Ci.nsISupportsWeakReference])
              };

              win.docShell.addWeakReflowObserver(observer);

              windowMap.set(win, observer);
            };

            for (let win of windows) {
              observeWindow(win);
            }

            let windowOpenListener = (win) => {
              observeWindow(win);
            }

            windowTracker.addListener("domwindowopened", windowOpenListener);
            windows = [];

            return () => {
              let windows = Array.from(windowManager.getAll(), win => win.window);
              for (let win of windows) {
                let observer = windowMap.get(win);
                if (observer) {
                  win.docShell.removeWeakReflowObserver(observer);
                }

                windowMap.delete(win);
              }

              windowTracker.removeListener("domwindowopened", windowOpenListener);
            }
          }
        }).api()
      }
    };
  }
}

