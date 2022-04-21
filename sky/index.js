import * as pc from '../src/index'

window.pc = pc;
var ASSET_PREFIX = "";
var SCRIPT_PREFIX = "";
var SCENE_PATH = "1334678.json";
var CONTEXT_OPTIONS = {
  'antialias': true,
  'alpha': false,
  'preserveDrawingBuffer': false,
  'preferWebGl2': true,
  'powerPreference': "default"
};
var SCRIPTS = [68491924, 68491931, 68491936, 68491927, 68544135];
var CONFIG_FILENAME = "config.json";
var INPUT_SETTINGS = {
  useKeyboard: true,
  useMouse: true,
  useGamepads: false,
  useTouch: true
};
pc.script.legacy = false;
var PRELOAD_MODULES = [];


(function() {
  var CANVAS_ID = 'application-canvas';

  var canvas, devices, app;

  var createCanvas = function() {
    canvas = document.createElement('canvas');
    canvas.setAttribute('id', CANVAS_ID);
    canvas.setAttribute('tabindex', 0);
    // canvas.style.visibility = 'hidden';

    // Disable I-bar cursor on click+drag
    canvas.onselectstart = function() { return false; };

    document.body.appendChild(canvas);

    return canvas;
  };

  var createInputDevices = function(canvas) {
    var devices = {
      elementInput: new pc.ElementInput(canvas, {
        useMouse: INPUT_SETTINGS.useMouse,
        useTouch: INPUT_SETTINGS.useTouch
      }),
      keyboard: INPUT_SETTINGS.useKeyboard ? new pc.Keyboard(window) : null,
      mouse: INPUT_SETTINGS.useMouse ? new pc.Mouse(canvas) : null,
      gamepads: INPUT_SETTINGS.useGamepads ? new pc.GamePads() : null,
      touch: INPUT_SETTINGS.useTouch && pc.platform.touch ? new pc.TouchDevice(canvas) : null
    };

    return devices;
  };

  var configureCss = function(fillMode, width, height) {
    // Configure resolution and resize event
    if (canvas.classList) {
      canvas.classList.add('fill-mode-' + fillMode);
    }

    // css media query for aspect ratio changes
    var css = "@media screen and (min-aspect-ratio: " + width + "/" + height + ") {";
    css += "    #application-canvas.fill-mode-KEEP_ASPECT {";
    css += "        width: auto;";
    css += "        height: 100%;";
    css += "        margin: 0 auto;";
    css += "    }";
    css += "}";

    // append css to style
    if (document.head.querySelector) {
      document.head.querySelector('style').innerHTML += css;
    }
  };

  var reflow = function() {
    app.resizeCanvas(canvas.width, canvas.height);
    canvas.style.width = '';
    canvas.style.height = '';

    var fillMode = app._fillMode;

    if (fillMode == pc.FILLMODE_NONE || fillMode == pc.FILLMODE_KEEP_ASPECT) {
      if ((fillMode == pc.FILLMODE_NONE && canvas.clientHeight < window.innerHeight) || (canvas.clientWidth / canvas.clientHeight >= window.innerWidth / window.innerHeight)) {
        canvas.style.marginTop = Math.floor((window.innerHeight - canvas.clientHeight) / 2) + 'px';
      } else {
        canvas.style.marginTop = '';
      }
    }
  };

  var displayError = function(html) {
    var div = document.createElement('div');

    div.innerHTML = [
      '<table style="background-color: #8CE; width: 100%; height: 100%;">',
      '  <tr>',
      '      <td align="center">',
      '          <div style="display: table-cell; vertical-align: middle;">',
      '              <div style="">' + html + '</div>',
      '          </div>',
      '      </td>',
      '  </tr>',
      '</table>'
    ].join('\n');

    document.body.appendChild(div);
  };

  canvas = createCanvas();
  devices = createInputDevices(canvas);

  try {
    app = new pc.Application(canvas, {
      elementInput: devices.elementInput,
      keyboard: devices.keyboard,
      mouse: devices.mouse,
      gamepads: devices.gamepads,
      touch: devices.touch,
      graphicsDeviceOptions: window.CONTEXT_OPTIONS,
      assetPrefix: window.ASSET_PREFIX || "",
      scriptPrefix: window.SCRIPT_PREFIX || "",
      scriptsOrder: window.SCRIPTS || []
    });
    window.app = app;
  } catch (e) {
    if (e instanceof pc.UnsupportedBrowserError) {
      displayError('This page requires a browser that supports WebGL.<br/>' +
        '<a href="http://get.webgl.org">Click here to find out more.</a>');
    } else if (e instanceof pc.ContextCreationError) {
      displayError("It doesn't appear your computer can support WebGL.<br/>" +
        '<a href="http://get.webgl.org/troubleshooting/">Click here for more information.</a>');
    } else {
      displayError('Could not initialize application. Error: ' + e);
    }

    return;
  }

  var configure = function() {
    app.configure(CONFIG_FILENAME, function(err) {
      if (err) {
        console.error(err);
      }

      configureCss(app._fillMode, app._width, app._height);

      // do the first reflow after a timeout because of
      // iOS showing a squished iframe sometimes
      setTimeout(function() {
        // reflow();

        // window.addEventListener('resize', reflow, false);
        // window.addEventListener('orientationchange', reflow, false);

        app.preload(function(err) {
          if (err) {
            console.error(err);
          }

          app.loadScene(SCENE_PATH, function(err, scene) {
            if (err) {
              console.error(err);
            }

            app.start();
          });
        });
      });
    });
  };

  if (PRELOAD_MODULES.length > 0) {
    loadModules(PRELOAD_MODULES, ASSET_PREFIX, configure);
  } else {
    configure();
  }

})();

pc.script.createLoadingScreen(function(app) {
  var showSplash = function() {
    // splash wrapper
    var wrapper = document.createElement('div');
    wrapper.id = 'application-splash-wrapper';
    document.body.appendChild(wrapper);

    // splash
    var splash = document.createElement('div');
    splash.id = 'application-splash';
    wrapper.appendChild(splash);
    splash.style.display = 'none';

    var logo = document.createElement('img');
    logo.src = ASSET_PREFIX + 'logo.png';
    splash.appendChild(logo);
    logo.onload = function() {
      splash.style.display = 'block';
    };

    var container = document.createElement('div');
    container.id = 'progress-bar-container';
    splash.appendChild(container);

    var bar = document.createElement('div');
    bar.id = 'progress-bar';
    container.appendChild(bar);

  };

  var hideSplash = function() {
    var splash = document.getElementById('application-splash-wrapper');
    splash.parentElement.removeChild(splash);
  };

  var setProgress = function(value) {
    var bar = document.getElementById('progress-bar');
    if (bar) {
      value = Math.min(1, Math.max(0, value));
      bar.style.width = value * 100 + '%';
    }
  };

  var createCss = function() {
    var css = [
      'body {',
      '    background-color: #283538;',
      '}',

      '#application-splash-wrapper {',
      '    position: absolute;',
      '    top: 0;',
      '    left: 0;',
      '    height: 100%;',
      '    width: 100%;',
      '    background-color: #283538;',
      '}',

      '#application-splash {',
      '    position: absolute;',
      '    top: calc(50% - 28px);',
      '    width: 264px;',
      '    left: calc(50% - 132px);',
      '}',

      '#application-splash img {',
      '    width: 100%;',
      '}',

      '#progress-bar-container {',
      '    margin: 20px auto 0 auto;',
      '    height: 2px;',
      '    width: 100%;',
      '    background-color: #1d292c;',
      '}',

      '#progress-bar {',
      '    width: 0%;',
      '    height: 100%;',
      '    background-color: #f60;',
      '}',
      '@media (max-width: 480px) {',
      '    #application-splash {',
      '        width: 170px;',
      '        left: calc(50% - 85px);',
      '    }',
      '}'

    ].join('\n');

    var style = document.createElement('style');
    style.type = 'text/css';
    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }

    document.head.appendChild(style);
  };


  createCss();

  showSplash();

  app.on('preload:end', function() {
    app.off('preload:progress');
  });
  app.on('preload:progress', setProgress);
  app.on('start', hideSplash);
});
