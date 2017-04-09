# ohnoreflow
Oh no! Reflow! is a WebExtension to help front-end Firefox engineers detect uninterruptible reflows in the browser UI.

# Installation

First, it is necessary to install the Experimental Reflow WebExtension API. For now, [that's hosted here](https://github.com/mikeconley/reflow-api), and must be done in `about:debugging` manually as a temporary add-on. 

Next, install this add-on. Again, until this is signed and hosted somewhere more convenient, this will have to be done as a temporary add-on from `about:debugging`. This should put a toolbar button in the nav bar which will have a badge that increases count as more uninterruptible reflows are detected in the browser UI.

# TODO

There's lots to do:
* Instead of dumping the reflow stacks to the console, I want the panel to expose a button that opens a tab with a listing of all observed reflows and their stacks.
* I want a way of enabling and disabling the observer
* I want a way of clearing the collected reflows
* I want a way of easily filing bugs from the list of reflows that I display
