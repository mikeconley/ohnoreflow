# ohnoreflow
Oh no! Reflow! is a WebExtension to help front-end Firefox engineers detect uninterruptible reflows in the browser UI.

# Installation

1. You may need to set `xpinstall.signatures.required` to `false` and `extensions.experiments.enabled` to `true` in `about:config` in order to install.
2. Click here to download [Oh no! Reflow!](https://raw.githubusercontent.com/mikeconley/ohnoreflow/master/ohnoreflow.xpi)
3. Go to `about:addons`, and click "Install Add-on From File", and then via the file picker, find the `ohnoreflow.xpi` you downloaded.

# TODO
* Add ability to coalesce similar stacks
* Hide rows if the number of reflowed frames was actually 0 (depends on Reflow API modification)
* Add ability to update signatures without requiring an add-on update
