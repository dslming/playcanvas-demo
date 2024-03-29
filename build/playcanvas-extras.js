/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./extras/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./extras/index.js":
/*!*************************!*\
  !*** ./extras/index.js ***!
  \*************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _mini_stats_mini_stats_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./mini-stats/mini-stats.js */ "./extras/mini-stats/mini-stats.js");

window.pcx = {
  MiniStats: _mini_stats_mini_stats_js__WEBPACK_IMPORTED_MODULE_0__["MiniStats"]
};

/***/ }),

/***/ "./extras/mini-stats/cpu-timer.js":
/*!****************************************!*\
  !*** ./extras/mini-stats/cpu-timer.js ***!
  \****************************************/
/*! exports provided: CpuTimer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CpuTimer", function() { return CpuTimer; });
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var CpuTimer = /*#__PURE__*/function () {
  function CpuTimer(app) {
    _classCallCheck(this, CpuTimer);

    this._frameIndex = 0;
    this._frameTimings = [];
    this._timings = [];
    this._prevTimings = [];
    this.unitsName = "ms";
    this.decimalPlaces = 1;
    this.enabled = true;
    app.on('frameupdate', this.begin.bind(this, 'update'));
    app.on('framerender', this.mark.bind(this, 'render'));
    app.on('frameend', this.mark.bind(this, 'other'));
  } // mark the beginning of the frame


  _createClass(CpuTimer, [{
    key: "begin",
    value: function begin(name) {
      if (!this.enabled) {
        return;
      } // end previous frame timings


      if (this._frameIndex < this._frameTimings.length) {
        this._frameTimings.splice(this._frameIndex);
      }

      var tmp = this._prevTimings;
      this._prevTimings = this._timings;
      this._timings = this._frameTimings;
      this._frameTimings = tmp;
      this._frameIndex = 0;
      this.mark(name);
    } // mark

  }, {
    key: "mark",
    value: function mark(name) {
      if (!this.enabled) {
        return;
      }

      var timestamp = pc.now(); // end previous mark

      var prev;

      if (this._frameIndex > 0) {
        prev = this._frameTimings[this._frameIndex - 1];
        prev[1] = timestamp - prev[1];
      } else if (this._timings.length > 0) {
        prev = this._timings[this._timings.length - 1];
        prev[1] = timestamp - prev[1];
      }

      if (this._frameIndex >= this._frameTimings.length) {
        this._frameTimings.push([name, timestamp]);
      } else {
        var timing = this._frameTimings[this._frameIndex];
        timing[0] = name;
        timing[1] = timestamp;
      }

      this._frameIndex++;
    }
  }, {
    key: "timings",
    get: function get() {
      // remove the last time point from the list (which is the time spent outside
      // of playcanvas)
      return this._timings.slice(0, -1).map(function (v) {
        return v[1];
      });
    }
  }]);

  return CpuTimer;
}();



/***/ }),

/***/ "./extras/mini-stats/gpu-timer.js":
/*!****************************************!*\
  !*** ./extras/mini-stats/gpu-timer.js ***!
  \****************************************/
/*! exports provided: GpuTimer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GpuTimer", function() { return GpuTimer; });
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var GpuTimer = /*#__PURE__*/function () {
  function GpuTimer(app) {
    _classCallCheck(this, GpuTimer);

    this._gl = app.graphicsDevice.gl;
    this._ext = app.graphicsDevice.extDisjointTimerQuery;
    this._freeQueries = []; // pool of free queries

    this._frameQueries = []; // current frame's queries

    this._frames = []; // list of previous frame queries

    this._timings = [];
    this._prevTimings = [];
    this.enabled = true;
    this.unitsName = "ms";
    this.decimalPlaces = 1;
    app.on('frameupdate', this.begin.bind(this, 'update'));
    app.on('framerender', this.mark.bind(this, 'render'));
    app.on('frameend', this.end.bind(this));
  } // called when context was lost, function releases all context related resources


  _createClass(GpuTimer, [{
    key: "loseContext",
    value: function loseContext() {
      this._freeQueries = []; // pool of free queries

      this._frameQueries = []; // current frame's queries

      this._frames = []; // list of previous frame queries
    } // mark the beginning of the frame

  }, {
    key: "begin",
    value: function begin(name) {
      if (!this.enabled) {
        return;
      } // store previous frame's queries


      if (this._frameQueries.length > 0) {
        this.end();
      } // check if all in-flight queries have been invalidated


      this._checkDisjoint(); // resolve previous frame timings


      if (this._frames.length > 0) {
        if (this._resolveFrameTimings(this._frames[0], this._prevTimings)) {
          // swap
          var tmp = this._prevTimings;
          this._prevTimings = this._timings;
          this._timings = tmp; // free

          this._freeQueries = this._freeQueries.concat(this._frames.splice(0, 1)[0]);
        }
      }

      this.mark(name);
    } // mark

  }, {
    key: "mark",
    value: function mark(name) {
      if (!this.enabled) {
        return;
      } // end previous query


      if (this._frameQueries.length > 0) {
        this._gl.endQuery(this._ext.TIME_ELAPSED_EXT);
      } // allocate new query and begin


      var query = this._allocateQuery();

      query[0] = name;

      this._gl.beginQuery(this._ext.TIME_ELAPSED_EXT, query[1]);

      this._frameQueries.push(query);
    } // end of frame

  }, {
    key: "end",
    value: function end() {
      if (!this.enabled) {
        return;
      }

      this._gl.endQuery(this._ext.TIME_ELAPSED_EXT);

      this._frames.push(this._frameQueries);

      this._frameQueries = [];
    } // check if the gpu has been interrupted thereby invalidating all
    // in-flight queries

  }, {
    key: "_checkDisjoint",
    value: function _checkDisjoint() {
      var disjoint = this._gl.getParameter(this._ext.GPU_DISJOINT_EXT);

      if (disjoint) {
        // return all queries to the free list
        this._freeQueries = [this._frames, [this._frameQueries], [this._freeQueries]].flat(2);
        this._frameQueries = [];
        this._frames = [];
      }
    } // either returns a previously free'd query or if there aren't any allocates a new one

  }, {
    key: "_allocateQuery",
    value: function _allocateQuery() {
      return this._freeQueries.length > 0 ? this._freeQueries.splice(-1, 1)[0] : ["", this._gl.createQuery()];
    } // attempt to resolve one frame's worth of timings

  }, {
    key: "_resolveFrameTimings",
    value: function _resolveFrameTimings(frame, timings) {
      // wait for the last query in the frame to be available
      if (!this._gl.getQueryParameter(frame[frame.length - 1][1], this._gl.QUERY_RESULT_AVAILABLE)) {
        return false;
      }

      for (var i = 0; i < frame.length; ++i) {
        timings[i] = [frame[i][0], this._gl.getQueryParameter(frame[i][1], this._gl.QUERY_RESULT) * 0.000001];
      }

      return true;
    }
  }, {
    key: "timings",
    get: function get() {
      return this._timings.map(function (v) {
        return v[1];
      });
    }
  }]);

  return GpuTimer;
}();



/***/ }),

/***/ "./extras/mini-stats/graph.js":
/*!************************************!*\
  !*** ./extras/mini-stats/graph.js ***!
  \************************************/
/*! exports provided: Graph */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Graph", function() { return Graph; });
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

// Realtime performance graph visual
var Graph = /*#__PURE__*/function () {
  function Graph(name, app, watermark, textRefreshRate, timer) {
    _classCallCheck(this, Graph);

    this.name = name;
    this.device = app.graphicsDevice;
    this.timer = timer;
    this.watermark = watermark;
    this.enabled = false;
    this.textRefreshRate = textRefreshRate;
    this.avgTotal = 0;
    this.avgTimer = 0;
    this.avgCount = 0;
    this.timingText = "";
    this.texture = null;
    this.yOffset = 0;
    this.cursor = 0;
    this.sample = new Uint8ClampedArray(4);
    this.sample.set([0, 0, 0, 255]);
    app.on('frameupdate', this.update.bind(this));
    this.counter = 0;
  } // called when context was lost, function releases all context related resources


  _createClass(Graph, [{
    key: "loseContext",
    value: function loseContext() {
      // if timer implements loseContext
      if (this.timer && typeof this.timer.loseContext === 'function') {
        this.timer.loseContext();
      }
    }
  }, {
    key: "update",
    value: function update(ms) {
      var timings = this.timer.timings; // calculate stacked total

      var total = timings.reduce(function (a, v) {
        return a + v;
      }, 0); // update averages

      this.avgTotal += total;
      this.avgTimer += ms;
      this.avgCount++;

      if (this.avgTimer > this.textRefreshRate) {
        this.timingText = (this.avgTotal / this.avgCount).toFixed(this.timer.decimalPlaces);
        this.avgTimer = 0;
        this.avgTotal = 0;
        this.avgCount = 0;
      }

      if (this.enabled) {
        // update timings
        var value = 0;
        var range = 1.5 * this.watermark;

        for (var i = 0; i < timings.length; ++i) {
          // scale the value into the range
          value += Math.floor(timings[i] / range * 255);
          this.sample[i] = value;
        } // .a store watermark


        this.sample[3] = this.watermark / range * 255; // write latest sample to the texture

        var gl = this.device.gl;
        this.device.bindTexture(this.texture);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, this.cursor, this.yOffset, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, this.sample); // update cursor position

        this.cursor++;

        if (this.cursor === this.texture.width) {
          this.cursor = 0;
        }
      }
    }
  }, {
    key: "render",
    value: function render(render2d, x, y, w, h) {
      render2d.quad(this.texture, x + w, y, -w, h, this.cursor, 0.5 + this.yOffset, -w, 0, this.enabled);
    }
  }]);

  return Graph;
}();



/***/ }),

/***/ "./extras/mini-stats/mini-stats.js":
/*!*****************************************!*\
  !*** ./extras/mini-stats/mini-stats.js ***!
  \*****************************************/
/*! exports provided: MiniStats */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MiniStats", function() { return MiniStats; });
/* harmony import */ var _cpu_timer_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./cpu-timer.js */ "./extras/mini-stats/cpu-timer.js");
/* harmony import */ var _gpu_timer_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./gpu-timer.js */ "./extras/mini-stats/gpu-timer.js");
/* harmony import */ var _stats_timer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./stats-timer.js */ "./extras/mini-stats/stats-timer.js");
/* harmony import */ var _graph_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./graph.js */ "./extras/mini-stats/graph.js");
/* harmony import */ var _word_atlas_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./word-atlas.js */ "./extras/mini-stats/word-atlas.js");
/* harmony import */ var _render2d_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./render2d.js */ "./extras/mini-stats/render2d.js");
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }






 // MiniStats rendering of CPU and GPU timing information

var MiniStats = /*#__PURE__*/function () {
  function MiniStats(app, options) {
    _classCallCheck(this, MiniStats);

    var device = app.graphicsDevice; // handle context lost

    this._contextLostHandler = function (event) {
      event.preventDefault();

      if (this.graphs) {
        for (var i = 0; i < this.graphs.length; i++) {
          this.graphs[i].loseContext();
        }
      }
    }.bind(this);

    device.canvas.addEventListener("webglcontextlost", this._contextLostHandler, false);
    options = options || MiniStats.getDefaultOptions(); // create graphs based on options

    var graphs = this.initGraphs(app, device, options); // extract words needed

    var words = ["", "ms", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "."]; // graph names

    graphs.forEach(function (graph) {
      words.push(graph.name);
    }); // stats units

    if (options.stats) {
      options.stats.forEach(function (stat) {
        if (stat.unitsName) words.push(stat.unitsName);
      });
    } // remove duplicates


    words = words.filter(function (item, index) {
      return words.indexOf(item) >= index;
    }); // create word atlas

    var maxWidth = options.sizes.reduce(function (max, v) {
      return v.width > max ? v.width : max;
    }, 0);
    var wordAtlasData = this.initWordAtlas(device, words, maxWidth, graphs.length);
    var texture = wordAtlasData.texture; // assign texture to graphs

    graphs.forEach(function (graph, i) {
      graph.texture = texture;
      graph.yOffset = i;
    });
    this.sizes = options.sizes;
    this._activeSizeIndex = options.startSizeIndex;
    var self = this; // create click region so we can resize

    var div = document.createElement('div');
    div.style.cssText = 'position:fixed;bottom:0;left:0;background:transparent;';
    document.body.appendChild(div);
    div.addEventListener('mouseenter', function (event) {
      self.opacity = 1.0;
    });
    div.addEventListener('mouseleave', function (event) {
      self.opacity = 0.5;
    });
    div.addEventListener('click', function (event) {
      event.preventDefault();

      if (self._enabled) {
        self.activeSizeIndex = (self.activeSizeIndex + 1) % self.sizes.length;
        self.resize(self.sizes[self.activeSizeIndex].width, self.sizes[self.activeSizeIndex].height, self.sizes[self.activeSizeIndex].graphs);
      }
    });
    device.on("resizecanvas", function () {
      self.updateDiv();
    });
    app.on('postrender', function () {
      if (self._enabled) {
        self.render();
      }
    });
    this.device = device;
    this.texture = texture;
    this.wordAtlas = wordAtlasData.atlas;
    this.render2d = new _render2d_js__WEBPACK_IMPORTED_MODULE_5__["Render2d"](device, options.colors);
    this.graphs = graphs;
    this.div = div;
    this.width = 0;
    this.height = 0;
    this.gspacing = 2;
    this.clr = [1, 1, 1, 0.5];
    this._enabled = true; // initial resize

    this.activeSizeIndex = this._activeSizeIndex;
  }

  _createClass(MiniStats, [{
    key: "activeSizeIndex",
    get: function get() {
      return this._activeSizeIndex;
    },
    set: function set(value) {
      this._activeSizeIndex = value;
      this.gspacing = this.sizes[value].spacing;
      this.resize(this.sizes[value].width, this.sizes[value].height, this.sizes[value].graphs);
    }
  }, {
    key: "opacity",
    get: function get() {
      return this.clr[3];
    },
    set: function set(value) {
      this.clr[3] = value;
    }
  }, {
    key: "overallHeight",
    get: function get() {
      var graphs = this.graphs;
      var spacing = this.gspacing;
      return this.height * graphs.length + spacing * (graphs.length - 1);
    }
  }, {
    key: "enabled",
    get: function get() {
      return this._enabled;
    },
    set: function set(value) {
      if (value !== this._enabled) {
        this._enabled = value;

        for (var i = 0; i < this.graphs.length; ++i) {
          this.graphs[i].enabled = value;
          this.graphs[i].timer.enabled = value;
        }
      }
    }
  }, {
    key: "initWordAtlas",
    value: function initWordAtlas(device, words, maxWidth, numGraphs) {
      // create the texture for storing word atlas and graph data
      var texture = new pc.Texture(device, {
        name: 'mini-stats',
        width: pc.math.nextPowerOfTwo(maxWidth),
        height: 64,
        mipmaps: false,
        minFilter: pc.FILTER_NEAREST,
        magFilter: pc.FILTER_NEAREST
      });
      var wordAtlas = new _word_atlas_js__WEBPACK_IMPORTED_MODULE_4__["WordAtlas"](texture, words);
      var dest = texture.lock();

      for (var i = 0; i < texture.width * numGraphs; ++i) {
        dest.set([0, 0, 0, 255], i * 4);
      }

      texture.unlock(); // ensure texture is uploaded

      device.setTexture(texture, 0);
      return {
        atlas: wordAtlas,
        texture: texture
      };
    }
  }, {
    key: "initGraphs",
    value: function initGraphs(app, device, options) {
      var graphs = [];

      if (options.cpu.enabled) {
        graphs.push(new _graph_js__WEBPACK_IMPORTED_MODULE_3__["Graph"]('CPU', app, options.cpu.watermark, options.textRefreshRate, new _cpu_timer_js__WEBPACK_IMPORTED_MODULE_0__["CpuTimer"](app)));
      }

      if (options.gpu.enabled && device.extDisjointTimerQuery) {
        graphs.push(new _graph_js__WEBPACK_IMPORTED_MODULE_3__["Graph"]('GPU', app, options.gpu.watermark, options.textRefreshRate, new _gpu_timer_js__WEBPACK_IMPORTED_MODULE_1__["GpuTimer"](app)));
      }

      if (options.stats) {
        options.stats.forEach(function (entry) {
          graphs.push(new _graph_js__WEBPACK_IMPORTED_MODULE_3__["Graph"](entry.name, app, entry.watermark, options.textRefreshRate, new _stats_timer_js__WEBPACK_IMPORTED_MODULE_2__["StatsTimer"](app, entry.stats, entry.decimalPlaces, entry.unitsName, entry.multiplier)));
        });
      }

      return graphs;
    }
  }, {
    key: "render",
    value: function render() {
      var graphs = this.graphs;
      var wordAtlas = this.wordAtlas;
      var render2d = this.render2d;
      var width = this.width;
      var height = this.height;
      var gspacing = this.gspacing;
      var i, j, x, y, graph;

      for (i = 0; i < graphs.length; ++i) {
        graph = graphs[i];
        y = i * (height + gspacing); // render the graph

        graph.render(render2d, 0, y, width, height); // render the text

        x = 1;
        y += height - 13; // name + space

        x += wordAtlas.render(render2d, graph.name, x, y) + 10; // timing

        var timingText = graph.timingText;

        for (j = 0; j < timingText.length; ++j) {
          x += wordAtlas.render(render2d, timingText[j], x, y);
        } // units


        if (graph.timer.unitsName) {
          x += 3;
          wordAtlas.render(render2d, graph.timer.unitsName, x, y);
        }
      }

      render2d.render(this.clr, height);
    }
  }, {
    key: "resize",
    value: function resize(width, height, showGraphs) {
      var graphs = this.graphs;

      for (var i = 0; i < graphs.length; ++i) {
        graphs[i].enabled = showGraphs;
      }

      this.width = width;
      this.height = height;
      this.updateDiv();
    }
  }, {
    key: "updateDiv",
    value: function updateDiv() {
      var rect = this.device.canvas.getBoundingClientRect();
      this.div.style.left = rect.left + "px";
      this.div.style.bottom = window.innerHeight - rect.bottom + "px";
      this.div.style.width = this.width + "px";
      this.div.style.height = this.overallHeight + "px";
    }
  }], [{
    key: "getDefaultOptions",
    value: function getDefaultOptions() {
      return {
        // sizes of area to render individual graphs in and spacing between indivudual graphs
        sizes: [{
          width: 100,
          height: 16,
          spacing: 0,
          graphs: false
        }, {
          width: 128,
          height: 32,
          spacing: 2,
          graphs: true
        }, {
          width: 256,
          height: 64,
          spacing: 2,
          graphs: true
        }],
        // index into sizes array for initial setting
        startSizeIndex: 0,
        // refresh rate of text stats in ms
        textRefreshRate: 500,
        // colors used to render graphs
        colors: {
          graph0: new pc.Color(0.7, 0.2, 0.2, 1),
          graph1: new pc.Color(0.2, 0.7, 0.2, 1),
          graph2: new pc.Color(0.2, 0.2, 0.7, 1),
          watermark: new pc.Color(0.4, 0.4, 0.2, 1),
          background: new pc.Color(0, 0, 0, 1.0)
        },
        // cpu graph options
        cpu: {
          enabled: true,
          watermark: 33
        },
        // gpu graph options
        gpu: {
          enabled: true,
          watermark: 33
        },
        // array of options to render additional graphs based on stats collected into pc.Application.stats
        stats: [{
          // display name
          name: "Frame",
          // path to data inside pc.Application.stats
          stats: ["frame.ms"],
          // number of decimal places (defaults to none)
          decimalPlaces: 1,
          // units (defaults to "")
          unitsName: "ms",
          // watermark - shown as a line on the graph, useful for displaying a budget
          watermark: 33
        }, // total number of draw calls
        {
          name: "DrawCalls",
          stats: ["drawCalls.total"],
          watermark: 1000
        }]
      };
    }
  }]);

  return MiniStats;
}();



/***/ }),

/***/ "./extras/mini-stats/render2d.js":
/*!***************************************!*\
  !*** ./extras/mini-stats/render2d.js ***!
  \***************************************/
/*! exports provided: Render2d */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Render2d", function() { return Render2d; });
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

// render 2d textured quads
var Render2d = /*#__PURE__*/function () {
  function Render2d(device, colors) {
    var maxQuads = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 512;

    _classCallCheck(this, Render2d);

    var vertexShader = 'attribute vec3 vertex_position;\n' + // unnormalized
    'attribute vec4 vertex_texCoord0;\n' + // unnormalized texture space uv, normalized uv
    'uniform vec4 screenAndTextureSize;\n' + // xy: screen size, zw: texture size
    'varying vec4 uv0;\n' + 'varying float enabled;\n' + 'void main(void) {\n' + '    vec2 pos = vertex_position.xy / screenAndTextureSize.xy;\n' + '    gl_Position = vec4(pos * 2.0 - 1.0, 0.5, 1.0);\n' + '    uv0 = vec4(vertex_texCoord0.xy / screenAndTextureSize.zw, vertex_texCoord0.zw);\n' + '    enabled = vertex_position.z;\n' + '}\n'; // this fragment shader renders the bits required for text and graphs. The text is identified
    // in the texture by white color. The graph data is specified as a single row of pixels
    // where the R channel denotes the height of the 1st graph and the G channel the height
    // of the second graph and B channel the height of the last graph

    var fragmentShader = 'varying vec4 uv0;\n' + 'varying float enabled;\n' + 'uniform vec4 clr;\n' + 'uniform vec4 col0;\n' + 'uniform vec4 col1;\n' + 'uniform vec4 col2;\n' + 'uniform vec4 watermark;\n' + 'uniform float watermarkSize;\n' + 'uniform vec4 background;\n' + 'uniform sampler2D source;\n' + 'void main (void) {\n' + '    vec4 tex = texture2D(source, uv0.xy);\n' + '    if (!(tex.rgb == vec3(1.0, 1.0, 1.0))) {\n' + // pure white is text
    '       if (enabled < 0.5)\n' + '           tex = background;\n' + '       else if (abs(uv0.w - tex.a) < watermarkSize)\n' + '           tex = watermark;\n' + '       else if (uv0.w < tex.r)\n' + '           tex = col0;\n' + '       else if (uv0.w < tex.g)\n' + '           tex = col1;\n' + '       else if (uv0.w < tex.b)\n' + '           tex = col2;\n' + '       else\n' + '           tex = background;\n' + '    }\n' + '    gl_FragColor = tex * clr;\n' + '}\n';
    var format = new pc.VertexFormat(device, [{
      semantic: pc.SEMANTIC_POSITION,
      components: 3,
      type: pc.TYPE_FLOAT32
    }, {
      semantic: pc.SEMANTIC_TEXCOORD0,
      components: 4,
      type: pc.TYPE_FLOAT32
    }]); // generate quad indices

    var indices = new Uint16Array(maxQuads * 6);

    for (var i = 0; i < maxQuads; ++i) {
      indices[i * 6 + 0] = i * 4;
      indices[i * 6 + 1] = i * 4 + 1;
      indices[i * 6 + 2] = i * 4 + 2;
      indices[i * 6 + 3] = i * 4;
      indices[i * 6 + 4] = i * 4 + 2;
      indices[i * 6 + 5] = i * 4 + 3;
    }

    this.device = device;
    this.shader = pc.shaderChunks.createShaderFromCode(device, vertexShader, fragmentShader, "mini-stats");
    this.buffer = new pc.VertexBuffer(device, format, maxQuads * 4, pc.BUFFER_STREAM);
    this.data = new Float32Array(this.buffer.numBytes / 4);
    this.indexBuffer = new pc.IndexBuffer(device, pc.INDEXFORMAT_UINT16, maxQuads * 6, pc.BUFFER_STATIC, indices);
    this.prims = [];
    this.prim = null;
    this.primIndex = -1;
    this.quads = 0; // colors

    var setupColor = function (name, value) {
      this[name] = new Float32Array([value.r, value.g, value.b, value.a]);
      this[name + "Id"] = device.scope.resolve(name);
    }.bind(this);

    setupColor("col0", colors.graph0);
    setupColor("col1", colors.graph1);
    setupColor("col2", colors.graph2);
    setupColor("watermark", colors.watermark);
    setupColor("background", colors.background);
    this.watermarkSizeId = device.scope.resolve('watermarkSize');
    this.clrId = device.scope.resolve('clr');
    this.clr = new Float32Array(4);
    this.screenTextureSizeId = device.scope.resolve('screenAndTextureSize');
    this.screenTextureSize = new Float32Array(4);
  }

  _createClass(Render2d, [{
    key: "quad",
    value: function quad(texture, x, y, w, h, u, v, uw, uh, enabled) {
      var quad = this.quads++; // update primitive

      var prim = this.prim;

      if (prim && prim.texture === texture) {
        prim.count += 6;
      } else {
        this.primIndex++;

        if (this.primIndex === this.prims.length) {
          prim = {
            type: pc.PRIMITIVE_TRIANGLES,
            indexed: true,
            base: quad * 6,
            count: 6,
            texture: texture
          };
          this.prims.push(prim);
        } else {
          prim = this.prims[this.primIndex];
          prim.base = quad * 6;
          prim.count = 6;
          prim.texture = texture;
        }

        this.prim = prim;
      }

      var x1 = x + w;
      var y1 = y + h;
      var u1 = u + (uw === undefined ? w : uw);
      var v1 = v + (uh === undefined ? h : uh);
      var colorize = enabled ? 1 : 0;
      this.data.set([x, y, colorize, u, v, 0, 0, x1, y, colorize, u1, v, 1, 0, x1, y1, colorize, u1, v1, 1, 1, x, y1, colorize, u, v1, 0, 1], 4 * 7 * quad);
    }
  }, {
    key: "render",
    value: function render(clr, height) {
      var device = this.device;
      var buffer = this.buffer; // set vertex data (swap storage)

      buffer.setData(this.data.buffer);
      device.updateBegin();
      device.setDepthTest(false);
      device.setDepthWrite(false);
      device.setCullMode(pc.CULLFACE_NONE);
      device.setBlending(true);
      device.setBlendFunctionSeparate(pc.BLENDMODE_SRC_ALPHA, pc.BLENDMODE_ONE_MINUS_SRC_ALPHA, pc.BLENDMODE_ONE, pc.BLENDMODE_ONE);
      device.setBlendEquationSeparate(pc.BLENDEQUATION_ADD, pc.BLENDEQUATION_ADD);
      device.setVertexBuffer(buffer, 0);
      device.setIndexBuffer(this.indexBuffer);
      device.setShader(this.shader);
      var pr = Math.min(device.maxPixelRatio, window.devicePixelRatio); // set shader uniforms

      this.clr.set(clr, 0);
      this.clrId.setValue(this.clr);
      this.screenTextureSize[0] = device.width / pr;
      this.screenTextureSize[1] = device.height / pr; // colors

      this.col0Id.setValue(this.col0);
      this.col1Id.setValue(this.col1);
      this.col2Id.setValue(this.col2);
      this.watermarkId.setValue(this.watermark);
      this.backgroundId.setValue(this.background);

      for (var i = 0; i <= this.primIndex; ++i) {
        var prim = this.prims[i];
        this.screenTextureSize[2] = prim.texture.width;
        this.screenTextureSize[3] = prim.texture.height;
        this.screenTextureSizeId.setValue(this.screenTextureSize);
        device.constantTexSource.setValue(prim.texture);
        this.watermarkSizeId.setValue(0.5 / height);
        device.draw(prim);
      }

      device.updateEnd(); // reset

      this.prim = null;
      this.primIndex = -1;
      this.quads = 0;
    }
  }]);

  return Render2d;
}();



/***/ }),

/***/ "./extras/mini-stats/stats-timer.js":
/*!******************************************!*\
  !*** ./extras/mini-stats/stats-timer.js ***!
  \******************************************/
/*! exports provided: StatsTimer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "StatsTimer", function() { return StatsTimer; });
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

// Stats timer interface for graph
var StatsTimer = /*#__PURE__*/function () {
  function StatsTimer(app, statNames, decimalPlaces, unitsName, multiplier) {
    _classCallCheck(this, StatsTimer);

    this.app = app;
    this.values = []; // supporting up to 3 stats

    this.statNames = statNames;
    if (this.statNames.length > 3) this.statNames.length = 3;
    this.unitsName = unitsName;
    this.decimalPlaces = decimalPlaces;
    this.multiplier = multiplier || 1;
    var self = this; // recursively look up properties of objects specified in a string

    function resolve(path, obj) {
      return path.split('.').reduce(function (prev, curr) {
        return prev ? prev[curr] : null;
      }, obj || self);
    }

    app.on('frameupdate', function (ms) {
      for (var i = 0; i < self.statNames.length; i++) {
        // read specified stat from app.stats object
        self.values[i] = resolve(self.statNames[i], self.app.stats) * self.multiplier;
      }
    });
  }

  _createClass(StatsTimer, [{
    key: "timings",
    get: function get() {
      return this.values;
    }
  }]);

  return StatsTimer;
}();



/***/ }),

/***/ "./extras/mini-stats/word-atlas.js":
/*!*****************************************!*\
  !*** ./extras/mini-stats/word-atlas.js ***!
  \*****************************************/
/*! exports provided: WordAtlas */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WordAtlas", function() { return WordAtlas; });
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

// Word atlas
var WordAtlas = /*#__PURE__*/function () {
  function WordAtlas(texture, words) {
    _classCallCheck(this, WordAtlas);

    var canvas = document.createElement('canvas');
    canvas.width = texture.width;
    canvas.height = texture.height; // configure the context

    var context = canvas.getContext('2d', {
      alpha: true
    });
    context.font = '10px "Lucida Console", Monaco, monospace';
    context.textAlign = "left";
    context.textBaseline = "alphabetic";
    context.fillStyle = "rgb(255, 255, 255)";
    var padding = 5;
    var x = padding;
    var y = padding;
    var placements = [];
    var i;

    for (i = 0; i < words.length; ++i) {
      // measure the word
      var measurement = context.measureText(words[i]);
      var l = Math.ceil(-measurement.actualBoundingBoxLeft);
      var r = Math.ceil(measurement.actualBoundingBoxRight);
      var a = Math.ceil(measurement.actualBoundingBoxAscent);
      var d = Math.ceil(measurement.actualBoundingBoxDescent);
      var w = l + r;
      var h = a + d; // wrap text

      if (x + w >= canvas.width) {
        x = padding;
        y += 16;
      } // digits and '.' are white, the rest grey


      context.fillStyle = words[i].length === 1 ? "rgb(255, 255, 255)" : "rgb(150, 150, 150)"; // render the word

      context.fillText(words[i], x - l, y + a);
      placements.push({
        l: l,
        r: r,
        a: a,
        d: d,
        x: x,
        y: y,
        w: w,
        h: h
      });
      x += w + padding;
    }

    var wordMap = {};
    words.forEach(function (w, i) {
      wordMap[w] = i;
    });
    this.words = words;
    this.wordMap = wordMap;
    this.placements = placements;
    this.texture = texture; // copy pixel data to target

    var source = context.getImageData(0, 0, canvas.width, canvas.height);
    var dest = texture.lock();
    var red, alpha;

    for (y = 0; y < source.height; ++y) {
      for (x = 0; x < source.width; ++x) {
        var offset = (x + y * texture.width) * 4; // set .rgb white to allow shader to identify text

        dest[offset] = 255;
        dest[offset + 1] = 255;
        dest[offset + 2] = 255; // red red and alpha from image

        red = source.data[(x + (source.height - 1 - y) * source.width) * 4];
        alpha = source.data[(x + (source.height - 1 - y) * source.width) * 4 + 3]; // alpha contains greyscale letters, use red to make non-digits darker

        dest[offset + 3] = alpha * (red > 150 ? 1 : 0.7);
      }
    }
  }

  _createClass(WordAtlas, [{
    key: "render",
    value: function render(render2d, word, x, y) {
      var p = this.placements[this.wordMap[word]];

      if (p) {
        var padding = 1;
        render2d.quad(this.texture, x + p.l - padding, y - p.d + padding, p.w + padding * 2, p.h + padding * 2, p.x - padding, 64 - p.y - p.h - padding, undefined, undefined, true);
        return p.w;
      }

      return 0;
    }
  }]);

  return WordAtlas;
}();



/***/ })

/******/ });
//# sourceMappingURL=playcanvas-extras.js.map