import {
  ILayoutRestorer, JupyterFrontEnd, JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  ICommandPalette, MainAreaWidget, WidgetTracker
} from '@jupyterlab/apputils';

/**
 * Activate the APOD widget extension.
 * The extension is automatically loaded, which injects RequireJS into browser if it's not there already
 * The command `apod:open` then does the following:
 *     1. load your WidgetModule from your local http-server (hard-coded to be served on port 7999, can be 
 *          changed in the `npm:dev` script in `package.json`)
 *     2. in the callback for loading the WidgetModule, the usual launch sequence for JLab extension is initiated.
 */
function activate(app: JupyterFrontEnd, palette: ICommandPalette, restorer: ILayoutRestorer) {
  console.log("test my widget");
  (function(d) {
    let hasRequire = false;
    let scripts = d.getElementsByTagName('head')[0].children;
    for (let s of scripts){
      if ((<any>s).src){
         if ((<any>s).src.includes("require.js")){
            hasRequire = true;
            break;
         }
     }}
    
    if (!hasRequire){
      const script = d.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = 'https://requirejs.org/docs/release/2.3.6/comments/require.js';
      d.getElementsByTagName('head')[0].appendChild(script);
    }
  }(window.document));

  // Declare a widget variable
  let widget: MainAreaWidget<any>;

  // Add an application command
  let APODWidget: any = undefined;
  const command: string = 'apod:open';
  app.commands.addCommand(command, {
    label: 'Random Astronomy Picture',
    execute: () => {
      (<any>window).require(["http://localhost:7999/build/bundle.js"], (plugin: any)=>{
        console.log('Loaded plugin from 7779 with RequireJS', plugin);
        APODWidget = plugin.APODWidget;

        if (!widget) {
          // Create a new widget if one does not exist
          const content = new APODWidget();
          widget = new MainAreaWidget({content});
          widget.id = 'apod-jupyterlab';
          widget.title.label = 'Astronomy Picture';
          widget.title.closable = true;
        }
        if (!tracker.has(widget)) {
          // Track the state of the widget for later restoration
          tracker.add(widget);
        }
        if (!widget.isAttached) {
          // Attach the widget to the main work area if it's not there
          app.shell.add(widget, 'main');
        }
        widget.content.update();
  
        // Activate the widget
        app.shell.activateById(widget.id);
      })
    }
  });

  // Add the command to the palette.
  palette.addItem({ command, category: 'Tutorial' });

  // Track and restore the widget state
  let tracker = new WidgetTracker<MainAreaWidget<any>>({
    namespace: 'apod'
  });
  restorer.restore(tracker, {
    command,
    name: () => 'apod'
  });
}

/**
 * Initialization data for the jupyterlab_apod extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'dynext-test-extension',
  autoStart: true,
  requires: [ICommandPalette, ILayoutRestorer],
  activate: activate
};

export default extension;