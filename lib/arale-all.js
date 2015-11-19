(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("jQuery"));
	else if(typeof define === 'function' && define.amd)
		define(["jQuery"], factory);
	else if(typeof exports === 'object')
		exports["A"] = factory(require("jQuery"));
	else
		root["A"] = factory(root["jQuery"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(103);


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(89)


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Utils = __webpack_require__(18);
	var Exception = __webpack_require__(4)["default"];

	var VERSION = "1.3.0";
	exports.VERSION = VERSION;var COMPILER_REVISION = 4;
	exports.COMPILER_REVISION = COMPILER_REVISION;
	var REVISION_CHANGES = {
	  1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
	  2: '== 1.0.0-rc.3',
	  3: '== 1.0.0-rc.4',
	  4: '>= 1.0.0'
	};
	exports.REVISION_CHANGES = REVISION_CHANGES;
	var isArray = Utils.isArray,
	    isFunction = Utils.isFunction,
	    toString = Utils.toString,
	    objectType = '[object Object]';

	function HandlebarsEnvironment(helpers, partials) {
	  this.helpers = helpers || {};
	  this.partials = partials || {};

	  registerDefaultHelpers(this);
	}

	exports.HandlebarsEnvironment = HandlebarsEnvironment;HandlebarsEnvironment.prototype = {
	  constructor: HandlebarsEnvironment,

	  logger: logger,
	  log: log,

	  registerHelper: function(name, fn, inverse) {
	    if (toString.call(name) === objectType) {
	      if (inverse || fn) { throw new Exception('Arg not supported with multiple helpers'); }
	      Utils.extend(this.helpers, name);
	    } else {
	      if (inverse) { fn.not = inverse; }
	      this.helpers[name] = fn;
	    }
	  },

	  registerPartial: function(name, str) {
	    if (toString.call(name) === objectType) {
	      Utils.extend(this.partials,  name);
	    } else {
	      this.partials[name] = str;
	    }
	  }
	};

	function registerDefaultHelpers(instance) {
	  instance.registerHelper('helperMissing', function(arg) {
	    if(arguments.length === 2) {
	      return undefined;
	    } else {
	      throw new Exception("Missing helper: '" + arg + "'");
	    }
	  });

	  instance.registerHelper('blockHelperMissing', function(context, options) {
	    var inverse = options.inverse || function() {}, fn = options.fn;

	    if (isFunction(context)) { context = context.call(this); }

	    if(context === true) {
	      return fn(this);
	    } else if(context === false || context == null) {
	      return inverse(this);
	    } else if (isArray(context)) {
	      if(context.length > 0) {
	        return instance.helpers.each(context, options);
	      } else {
	        return inverse(this);
	      }
	    } else {
	      return fn(context);
	    }
	  });

	  instance.registerHelper('each', function(context, options) {
	    var fn = options.fn, inverse = options.inverse;
	    var i = 0, ret = "", data;

	    if (isFunction(context)) { context = context.call(this); }

	    if (options.data) {
	      data = createFrame(options.data);
	    }

	    if(context && typeof context === 'object') {
	      if (isArray(context)) {
	        for(var j = context.length; i<j; i++) {
	          if (data) {
	            data.index = i;
	            data.first = (i === 0);
	            data.last  = (i === (context.length-1));
	          }
	          ret = ret + fn(context[i], { data: data });
	        }
	      } else {
	        for(var key in context) {
	          if(context.hasOwnProperty(key)) {
	            if(data) { 
	              data.key = key; 
	              data.index = i;
	              data.first = (i === 0);
	            }
	            ret = ret + fn(context[key], {data: data});
	            i++;
	          }
	        }
	      }
	    }

	    if(i === 0){
	      ret = inverse(this);
	    }

	    return ret;
	  });

	  instance.registerHelper('if', function(conditional, options) {
	    if (isFunction(conditional)) { conditional = conditional.call(this); }

	    // Default behavior is to render the positive path if the value is truthy and not empty.
	    // The `includeZero` option may be set to treat the condtional as purely not empty based on the
	    // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
	    if ((!options.hash.includeZero && !conditional) || Utils.isEmpty(conditional)) {
	      return options.inverse(this);
	    } else {
	      return options.fn(this);
	    }
	  });

	  instance.registerHelper('unless', function(conditional, options) {
	    return instance.helpers['if'].call(this, conditional, {fn: options.inverse, inverse: options.fn, hash: options.hash});
	  });

	  instance.registerHelper('with', function(context, options) {
	    if (isFunction(context)) { context = context.call(this); }

	    if (!Utils.isEmpty(context)) return options.fn(context);
	  });

	  instance.registerHelper('log', function(context, options) {
	    var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
	    instance.log(level, context);
	  });
	}

	var logger = {
	  methodMap: { 0: 'debug', 1: 'info', 2: 'warn', 3: 'error' },

	  // State enum
	  DEBUG: 0,
	  INFO: 1,
	  WARN: 2,
	  ERROR: 3,
	  level: 3,

	  // can be overridden in the host environment
	  log: function(level, obj) {
	    if (logger.level <= level) {
	      var method = logger.methodMap[level];
	      if (typeof console !== 'undefined' && console[method]) {
	        console[method].call(console, obj);
	      }
	    }
	  }
	};
	exports.logger = logger;
	function log(level, obj) { logger.log(level, obj); }

	exports.log = log;var createFrame = function(object) {
	  var obj = {};
	  Utils.extend(obj, object);
	  return obj;
	};
	exports.createFrame = createFrame;

/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";

	var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

	function Exception(message, node) {
	  var line;
	  if (node && node.firstLine) {
	    line = node.firstLine;

	    message += ' - ' + line + ':' + node.firstColumn;
	  }

	  var tmp = Error.prototype.constructor.call(this, message);

	  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
	  for (var idx = 0; idx < errorProps.length; idx++) {
	    this[errorProps[idx]] = tmp[errorProps[idx]];
	  }

	  if (line) {
	    this.lineNumber = line;
	    this.column = node.firstColumn;
	  }
	}

	Exception.prototype = new Error();

	exports["default"] = Exception;

/***/ },
/* 5 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];

		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};

		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(47);


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(26);
	module.exports.Mask = __webpack_require__(63);


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	// Switchable
	// -----------
	// 可切换组件，核心特征是：有一组可切换的面板（Panel），可通过触点（Trigger）来触发。
	// 感谢：
	//  - https://github.com/kissyteam/kissy/tree/6707ecc4cdfddd59e21698c8eb4a50b65dbe7632/src/switchable

	var $ = __webpack_require__(1);
	var Widget = __webpack_require__(2);

	var Effects = __webpack_require__(28);
	var Autoplay = __webpack_require__(74);
	var Circular = __webpack_require__(75);

	var Switchable = Widget.extend({
	  attrs: {

	    // 用户传入的 triggers 和 panels
	    // 可以是 Selector、jQuery 对象、或 DOM 元素集
	    triggers: {
	      value: [],
	      getter: function (val) {
	        return $(val);
	      }
	    },

	    panels: {
	      value: [],
	      getter: function (val) {
	        return $(val);
	      }
	    },

	    classPrefix: 'ui-switchable',

	    // 是否包含 triggers，用于没有传入 triggers 时，是否自动生成的判断标准
	    hasTriggers: true,
	    // 触发类型
	    triggerType: 'hover',
	    // or 'click'
	    // 触发延迟
	    delay: 100,

	    // 初始切换到哪个面板
	    activeIndex: {
	      value: 0,
	      setter: function (val) {
	        return parseInt(val) || 0;
	      }
	    },

	    // 一屏内有多少个 panels
	    step: 1,
	    // 有多少屏
	    length: {
	      readOnly: true,
	      getter: function () {
	        return Math.ceil(this.get('panels').length / this.get('step'));
	      }
	    },

	    // 可见视图区域的大小。一般不需要设定此值，仅当获取值不正确时，用于手工指定大小
	    viewSize: [],

	    activeTriggerClass: {
	      getter: function (val) {
	        return val ? val : this.get("classPrefix") + '-active';
	      }
	    }
	  },

	  setup: function () {
	    this._initConstClass();
	    this._initElement();

	    var role = this._getDatasetRole();
	    this._initPanels(role);
	    // 配置中的 triggers > dataset > 自动生成
	    this._initTriggers(role);
	    this._bindTriggers();
	    this._initPlugins();

	    // 渲染默认初始状态
	    this.render();
	  },

	  _initConstClass: function () {
	    this.CONST = constClass(this.get('classPrefix'));
	  },
	  _initElement: function () {
	    this.element.addClass(this.CONST.UI_SWITCHABLE);
	  },

	  // 从 HTML 标记中获取各个 role, 替代原来的 markupType
	  _getDatasetRole: function () {
	    var self = this;
	    var role = {};
	    var roles = ['trigger', 'panel', 'nav', 'content'];
	    $.each(roles, function (index, key) {
	      var elems = self.$('[data-role=' + key + ']');
	      if (elems.length) {
	        role[key] = elems;
	      }
	    });
	    return role;
	  },

	  _initPanels: function (role) {
	    var panels = this.get('panels');

	    // 先获取 panels 和 content
	    if (panels.length > 0) {} else if (role.panel) {
	      this.set('panels', panels = role.panel);
	    } else if (role.content) {
	      this.set('panels', panels = role.content.find('> *'));
	      this.content = role.content;
	    }

	    if (panels.length === 0) {
	      throw new Error('panels.length is ZERO');
	    }
	    if (!this.content) {
	      this.content = panels.parent();
	    }
	    this.content.addClass(this.CONST.CONTENT_CLASS);
	    this.get('panels').addClass(this.CONST.PANEL_CLASS);
	  },

	  _initTriggers: function (role) {
	    var triggers = this.get('triggers');

	    // 再获取 triggers 和 nav
	    if (triggers.length > 0) {}
	    // attr 里没找到时，才根据 data-role 来解析
	    else if (role.trigger) {
	      this.set('triggers', triggers = role.trigger);
	    } else if (role.nav) {
	      triggers = role.nav.find('> *');

	      // 空的 nav 标记
	      if (triggers.length === 0) {
	        triggers = generateTriggersMarkup(
	        this.get('length'), this.get('activeIndex'), this.get('activeTriggerClass'), true).appendTo(role.nav);
	      }
	      this.set('triggers', triggers);

	      this.nav = role.nav;
	    }
	    // 用户没有传入 triggers，也没有通过 data-role 指定时，如果
	    // hasTriggers 为 true，则自动生成 triggers
	    else if (this.get('hasTriggers')) {
	      this.nav = generateTriggersMarkup(
	      this.get('length'), this.get('activeIndex'), this.get('activeTriggerClass')).appendTo(this.element);
	      this.set('triggers', triggers = this.nav.children());
	    }

	    if (!this.nav && triggers.length) {
	      this.nav = triggers.parent();
	    }

	    this.nav && this.nav.addClass(this.CONST.NAV_CLASS);
	    triggers.addClass(this.CONST.TRIGGER_CLASS).each(function (i, trigger) {
	      $(trigger).data('value', i);
	    });
	  },

	  _bindTriggers: function () {
	    var that = this,
	        triggers = this.get('triggers');

	    if (this.get('triggerType') === 'click') {
	      triggers.click(focus);
	    }
	    // hover
	    else {
	      triggers.hover(focus, leave);
	    }

	    function focus(ev) {
	      that._onFocusTrigger(ev.type, $(this).data('value'));
	    }

	    function leave() {
	      clearTimeout(that._switchTimer);
	    }
	  },

	  _onFocusTrigger: function (type, index) {
	    var that = this;

	    // click or tab 键激活时
	    if (type === 'click') {
	      this.switchTo(index);
	    }

	    // hover
	    else {
	      this._switchTimer = setTimeout(function () {
	        that.switchTo(index);
	      }, this.get('delay'));
	    }
	  },

	  _initPlugins: function () {
	    this._plugins = [];

	    this._plug(Effects);
	    this._plug(Autoplay);
	    this._plug(Circular);
	  },
	  // 切换到指定 index
	  switchTo: function (toIndex) {
	    this.set('activeIndex', toIndex);
	  },

	  // change 事件触发的前提是当前值和先前值不一致, 所以无需验证 toIndex !== fromIndex
	  _onRenderActiveIndex: function (toIndex, fromIndex) {
	    this._switchTo(toIndex, fromIndex);
	  },

	  _switchTo: function (toIndex, fromIndex) {
	    this.trigger('switch', toIndex, fromIndex);
	    this._switchTrigger(toIndex, fromIndex);
	    this._switchPanel(this._getPanelInfo(toIndex, fromIndex));
	    this.trigger('switched', toIndex, fromIndex);

	    // 恢复手工向后切换标识
	    this._isBackward = undefined;
	  },

	  _switchTrigger: function (toIndex, fromIndex) {
	    var triggers = this.get('triggers');
	    if (triggers.length < 1) return;

	    triggers.eq(fromIndex).removeClass(this.get('activeTriggerClass'));
	    triggers.eq(toIndex).addClass(this.get('activeTriggerClass'));
	  },

	  _switchPanel: function (panelInfo) {
	    // 默认是最简单的切换效果：直接隐藏/显示
	    panelInfo.fromPanels.hide();
	    panelInfo.toPanels.show();
	  },

	  _getPanelInfo: function (toIndex, fromIndex) {
	    var panels = this.get('panels').get();
	    var step = this.get('step');

	    var fromPanels, toPanels;

	    // 初始情况下 fromIndex 为 undefined
	    if (fromIndex > -1) {
	      fromPanels = panels.slice(fromIndex * step, (fromIndex + 1) * step);
	    }

	    toPanels = panels.slice(toIndex * step, (toIndex + 1) * step);

	    return {
	      toIndex: toIndex,
	      fromIndex: fromIndex,
	      toPanels: $(toPanels),
	      fromPanels: $(fromPanels)
	    };
	  },

	  // 切换到上一视图
	  prev: function () {
	    //  设置手工向后切换标识, 外部调用 prev 一样
	    this._isBackward = true;

	    var fromIndex = this.get('activeIndex');
	    // 考虑循环切换的情况
	    var index = (fromIndex - 1 + this.get('length')) % this.get('length');
	    this.switchTo(index);
	  },

	  // 切换到下一视图
	  next: function () {
	    this._isBackward = false;

	    var fromIndex = this.get('activeIndex');
	    var index = (fromIndex + 1) % this.get('length');
	    this.switchTo(index);
	  },

	  _plug: function (plugin) {
	    var pluginAttrs = plugin.attrs;

	    if (pluginAttrs) {
	      for (var key in pluginAttrs) {
	        if (pluginAttrs.hasOwnProperty(key) &&
	        // 不覆盖用户传入的配置
	        !(key in this.attrs)) {
	          this.set(key, pluginAttrs[key]);
	        }
	      }
	    }
	    if (!plugin.isNeeded.call(this)) return;


	    if (plugin.install) {
	      plugin.install.call(this);
	    }

	    this._plugins.push(plugin);
	  },


	  destroy: function () {
	    // todo: events
	    var that = this;

	    $.each(this._plugins, function (i, plugin) {
	      if (plugin.destroy) {
	        plugin.destroy.call(that);
	      }
	    });

	    Switchable.superclass.destroy.call(this);
	  }
	});

	module.exports = Switchable;


	// Helpers
	// -------

	function generateTriggersMarkup(length, activeIndex, activeTriggerClass, justChildren) {
	  var nav = $('<ul>');

	  for (var i = 0; i < length; i++) {
	    var className = i === activeIndex ? activeTriggerClass : '';

	    $('<li>', {
	      'class': className,
	      'html': i + 1
	    }).appendTo(nav);
	  }

	  return justChildren ? nav.children() : nav;
	}


	// 内部默认的 className


	function constClass(classPrefix) {
	  return {
	    UI_SWITCHABLE: classPrefix || '',
	    NAV_CLASS: classPrefix ? classPrefix + '-nav' : '',
	    CONTENT_CLASS: classPrefix ? classPrefix + '-content' : '',
	    TRIGGER_CLASS: classPrefix ? classPrefix + '-trigger' : '',
	    PANEL_CLASS: classPrefix ? classPrefix + '-panel' : '',
	    PREV_BTN_CLASS: classPrefix ? classPrefix + '-prev-btn' : '',
	    NEXT_BTN_CLASS: classPrefix ? classPrefix + '-next-btn' : ''
	  }
	}

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(global, module) {//! moment.js
	//! version : 2.9.0
	//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
	//! license : MIT
	//! momentjs.com

	(function (undefined) {
	    /************************************
	        Constants
	    ************************************/

	    var moment,
	        VERSION = '2.9.0',
	        // the global-scope this is NOT the global object in Node.js
	        globalScope = (typeof global !== 'undefined' && (typeof window === 'undefined' || window === global.window)) ? global : this,
	        oldGlobalMoment,
	        round = Math.round,
	        hasOwnProperty = Object.prototype.hasOwnProperty,
	        i,

	        YEAR = 0,
	        MONTH = 1,
	        DATE = 2,
	        HOUR = 3,
	        MINUTE = 4,
	        SECOND = 5,
	        MILLISECOND = 6,

	        // internal storage for locale config files
	        locales = {},

	        // extra moment internal properties (plugins register props here)
	        momentProperties = [],

	        // check for nodeJS
	        hasModule = (typeof module !== 'undefined' && module && module.exports),

	        // ASP.NET json date format regex
	        aspNetJsonRegex = /^\/?Date\((\-?\d+)/i,
	        aspNetTimeSpanJsonRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/,

	        // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
	        // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
	        isoDurationRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/,

	        // format tokens
	        formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|x|X|zz?|ZZ?|.)/g,
	        localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,

	        // parsing token regexes
	        parseTokenOneOrTwoDigits = /\d\d?/, // 0 - 99
	        parseTokenOneToThreeDigits = /\d{1,3}/, // 0 - 999
	        parseTokenOneToFourDigits = /\d{1,4}/, // 0 - 9999
	        parseTokenOneToSixDigits = /[+\-]?\d{1,6}/, // -999,999 - 999,999
	        parseTokenDigits = /\d+/, // nonzero number of digits
	        parseTokenWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i, // any word (or two) characters or numbers including two/three word month in arabic.
	        parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/gi, // +00:00 -00:00 +0000 -0000 or Z
	        parseTokenT = /T/i, // T (ISO separator)
	        parseTokenOffsetMs = /[\+\-]?\d+/, // 1234567890123
	        parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/, // 123456789 123456789.123

	        //strict parsing regexes
	        parseTokenOneDigit = /\d/, // 0 - 9
	        parseTokenTwoDigits = /\d\d/, // 00 - 99
	        parseTokenThreeDigits = /\d{3}/, // 000 - 999
	        parseTokenFourDigits = /\d{4}/, // 0000 - 9999
	        parseTokenSixDigits = /[+-]?\d{6}/, // -999,999 - 999,999
	        parseTokenSignedNumber = /[+-]?\d+/, // -inf - inf

	        // iso 8601 regex
	        // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
	        isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,

	        isoFormat = 'YYYY-MM-DDTHH:mm:ssZ',

	        isoDates = [
	            ['YYYYYY-MM-DD', /[+-]\d{6}-\d{2}-\d{2}/],
	            ['YYYY-MM-DD', /\d{4}-\d{2}-\d{2}/],
	            ['GGGG-[W]WW-E', /\d{4}-W\d{2}-\d/],
	            ['GGGG-[W]WW', /\d{4}-W\d{2}/],
	            ['YYYY-DDD', /\d{4}-\d{3}/]
	        ],

	        // iso time formats and regexes
	        isoTimes = [
	            ['HH:mm:ss.SSSS', /(T| )\d\d:\d\d:\d\d\.\d+/],
	            ['HH:mm:ss', /(T| )\d\d:\d\d:\d\d/],
	            ['HH:mm', /(T| )\d\d:\d\d/],
	            ['HH', /(T| )\d\d/]
	        ],

	        // timezone chunker '+10:00' > ['10', '00'] or '-1530' > ['-', '15', '30']
	        parseTimezoneChunker = /([\+\-]|\d\d)/gi,

	        // getter and setter names
	        proxyGettersAndSetters = 'Date|Hours|Minutes|Seconds|Milliseconds'.split('|'),
	        unitMillisecondFactors = {
	            'Milliseconds' : 1,
	            'Seconds' : 1e3,
	            'Minutes' : 6e4,
	            'Hours' : 36e5,
	            'Days' : 864e5,
	            'Months' : 2592e6,
	            'Years' : 31536e6
	        },

	        unitAliases = {
	            ms : 'millisecond',
	            s : 'second',
	            m : 'minute',
	            h : 'hour',
	            d : 'day',
	            D : 'date',
	            w : 'week',
	            W : 'isoWeek',
	            M : 'month',
	            Q : 'quarter',
	            y : 'year',
	            DDD : 'dayOfYear',
	            e : 'weekday',
	            E : 'isoWeekday',
	            gg: 'weekYear',
	            GG: 'isoWeekYear'
	        },

	        camelFunctions = {
	            dayofyear : 'dayOfYear',
	            isoweekday : 'isoWeekday',
	            isoweek : 'isoWeek',
	            weekyear : 'weekYear',
	            isoweekyear : 'isoWeekYear'
	        },

	        // format function strings
	        formatFunctions = {},

	        // default relative time thresholds
	        relativeTimeThresholds = {
	            s: 45,  // seconds to minute
	            m: 45,  // minutes to hour
	            h: 22,  // hours to day
	            d: 26,  // days to month
	            M: 11   // months to year
	        },

	        // tokens to ordinalize and pad
	        ordinalizeTokens = 'DDD w W M D d'.split(' '),
	        paddedTokens = 'M D H h m s w W'.split(' '),

	        formatTokenFunctions = {
	            M    : function () {
	                return this.month() + 1;
	            },
	            MMM  : function (format) {
	                return this.localeData().monthsShort(this, format);
	            },
	            MMMM : function (format) {
	                return this.localeData().months(this, format);
	            },
	            D    : function () {
	                return this.date();
	            },
	            DDD  : function () {
	                return this.dayOfYear();
	            },
	            d    : function () {
	                return this.day();
	            },
	            dd   : function (format) {
	                return this.localeData().weekdaysMin(this, format);
	            },
	            ddd  : function (format) {
	                return this.localeData().weekdaysShort(this, format);
	            },
	            dddd : function (format) {
	                return this.localeData().weekdays(this, format);
	            },
	            w    : function () {
	                return this.week();
	            },
	            W    : function () {
	                return this.isoWeek();
	            },
	            YY   : function () {
	                return leftZeroFill(this.year() % 100, 2);
	            },
	            YYYY : function () {
	                return leftZeroFill(this.year(), 4);
	            },
	            YYYYY : function () {
	                return leftZeroFill(this.year(), 5);
	            },
	            YYYYYY : function () {
	                var y = this.year(), sign = y >= 0 ? '+' : '-';
	                return sign + leftZeroFill(Math.abs(y), 6);
	            },
	            gg   : function () {
	                return leftZeroFill(this.weekYear() % 100, 2);
	            },
	            gggg : function () {
	                return leftZeroFill(this.weekYear(), 4);
	            },
	            ggggg : function () {
	                return leftZeroFill(this.weekYear(), 5);
	            },
	            GG   : function () {
	                return leftZeroFill(this.isoWeekYear() % 100, 2);
	            },
	            GGGG : function () {
	                return leftZeroFill(this.isoWeekYear(), 4);
	            },
	            GGGGG : function () {
	                return leftZeroFill(this.isoWeekYear(), 5);
	            },
	            e : function () {
	                return this.weekday();
	            },
	            E : function () {
	                return this.isoWeekday();
	            },
	            a    : function () {
	                return this.localeData().meridiem(this.hours(), this.minutes(), true);
	            },
	            A    : function () {
	                return this.localeData().meridiem(this.hours(), this.minutes(), false);
	            },
	            H    : function () {
	                return this.hours();
	            },
	            h    : function () {
	                return this.hours() % 12 || 12;
	            },
	            m    : function () {
	                return this.minutes();
	            },
	            s    : function () {
	                return this.seconds();
	            },
	            S    : function () {
	                return toInt(this.milliseconds() / 100);
	            },
	            SS   : function () {
	                return leftZeroFill(toInt(this.milliseconds() / 10), 2);
	            },
	            SSS  : function () {
	                return leftZeroFill(this.milliseconds(), 3);
	            },
	            SSSS : function () {
	                return leftZeroFill(this.milliseconds(), 3);
	            },
	            Z    : function () {
	                var a = this.utcOffset(),
	                    b = '+';
	                if (a < 0) {
	                    a = -a;
	                    b = '-';
	                }
	                return b + leftZeroFill(toInt(a / 60), 2) + ':' + leftZeroFill(toInt(a) % 60, 2);
	            },
	            ZZ   : function () {
	                var a = this.utcOffset(),
	                    b = '+';
	                if (a < 0) {
	                    a = -a;
	                    b = '-';
	                }
	                return b + leftZeroFill(toInt(a / 60), 2) + leftZeroFill(toInt(a) % 60, 2);
	            },
	            z : function () {
	                return this.zoneAbbr();
	            },
	            zz : function () {
	                return this.zoneName();
	            },
	            x    : function () {
	                return this.valueOf();
	            },
	            X    : function () {
	                return this.unix();
	            },
	            Q : function () {
	                return this.quarter();
	            }
	        },

	        deprecations = {},

	        lists = ['months', 'monthsShort', 'weekdays', 'weekdaysShort', 'weekdaysMin'],

	        updateInProgress = false;

	    // Pick the first defined of two or three arguments. dfl comes from
	    // default.
	    function dfl(a, b, c) {
	        switch (arguments.length) {
	            case 2: return a != null ? a : b;
	            case 3: return a != null ? a : b != null ? b : c;
	            default: throw new Error('Implement me');
	        }
	    }

	    function hasOwnProp(a, b) {
	        return hasOwnProperty.call(a, b);
	    }

	    function defaultParsingFlags() {
	        // We need to deep clone this object, and es5 standard is not very
	        // helpful.
	        return {
	            empty : false,
	            unusedTokens : [],
	            unusedInput : [],
	            overflow : -2,
	            charsLeftOver : 0,
	            nullInput : false,
	            invalidMonth : null,
	            invalidFormat : false,
	            userInvalidated : false,
	            iso: false
	        };
	    }

	    function printMsg(msg) {
	        if (moment.suppressDeprecationWarnings === false &&
	                typeof console !== 'undefined' && console.warn) {
	            console.warn('Deprecation warning: ' + msg);
	        }
	    }

	    function deprecate(msg, fn) {
	        var firstTime = true;
	        return extend(function () {
	            if (firstTime) {
	                printMsg(msg);
	                firstTime = false;
	            }
	            return fn.apply(this, arguments);
	        }, fn);
	    }

	    function deprecateSimple(name, msg) {
	        if (!deprecations[name]) {
	            printMsg(msg);
	            deprecations[name] = true;
	        }
	    }

	    function padToken(func, count) {
	        return function (a) {
	            return leftZeroFill(func.call(this, a), count);
	        };
	    }
	    function ordinalizeToken(func, period) {
	        return function (a) {
	            return this.localeData().ordinal(func.call(this, a), period);
	        };
	    }

	    function monthDiff(a, b) {
	        // difference in months
	        var wholeMonthDiff = ((b.year() - a.year()) * 12) + (b.month() - a.month()),
	            // b is in (anchor - 1 month, anchor + 1 month)
	            anchor = a.clone().add(wholeMonthDiff, 'months'),
	            anchor2, adjust;

	        if (b - anchor < 0) {
	            anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
	            // linear across the month
	            adjust = (b - anchor) / (anchor - anchor2);
	        } else {
	            anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
	            // linear across the month
	            adjust = (b - anchor) / (anchor2 - anchor);
	        }

	        return -(wholeMonthDiff + adjust);
	    }

	    while (ordinalizeTokens.length) {
	        i = ordinalizeTokens.pop();
	        formatTokenFunctions[i + 'o'] = ordinalizeToken(formatTokenFunctions[i], i);
	    }
	    while (paddedTokens.length) {
	        i = paddedTokens.pop();
	        formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);
	    }
	    formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);


	    function meridiemFixWrap(locale, hour, meridiem) {
	        var isPm;

	        if (meridiem == null) {
	            // nothing to do
	            return hour;
	        }
	        if (locale.meridiemHour != null) {
	            return locale.meridiemHour(hour, meridiem);
	        } else if (locale.isPM != null) {
	            // Fallback
	            isPm = locale.isPM(meridiem);
	            if (isPm && hour < 12) {
	                hour += 12;
	            }
	            if (!isPm && hour === 12) {
	                hour = 0;
	            }
	            return hour;
	        } else {
	            // thie is not supposed to happen
	            return hour;
	        }
	    }

	    /************************************
	        Constructors
	    ************************************/

	    function Locale() {
	    }

	    // Moment prototype object
	    function Moment(config, skipOverflow) {
	        if (skipOverflow !== false) {
	            checkOverflow(config);
	        }
	        copyConfig(this, config);
	        this._d = new Date(+config._d);
	        // Prevent infinite loop in case updateOffset creates new moment
	        // objects.
	        if (updateInProgress === false) {
	            updateInProgress = true;
	            moment.updateOffset(this);
	            updateInProgress = false;
	        }
	    }

	    // Duration Constructor
	    function Duration(duration) {
	        var normalizedInput = normalizeObjectUnits(duration),
	            years = normalizedInput.year || 0,
	            quarters = normalizedInput.quarter || 0,
	            months = normalizedInput.month || 0,
	            weeks = normalizedInput.week || 0,
	            days = normalizedInput.day || 0,
	            hours = normalizedInput.hour || 0,
	            minutes = normalizedInput.minute || 0,
	            seconds = normalizedInput.second || 0,
	            milliseconds = normalizedInput.millisecond || 0;

	        // representation for dateAddRemove
	        this._milliseconds = +milliseconds +
	            seconds * 1e3 + // 1000
	            minutes * 6e4 + // 1000 * 60
	            hours * 36e5; // 1000 * 60 * 60
	        // Because of dateAddRemove treats 24 hours as different from a
	        // day when working around DST, we need to store them separately
	        this._days = +days +
	            weeks * 7;
	        // It is impossible translate months into days without knowing
	        // which months you are are talking about, so we have to store
	        // it separately.
	        this._months = +months +
	            quarters * 3 +
	            years * 12;

	        this._data = {};

	        this._locale = moment.localeData();

	        this._bubble();
	    }

	    /************************************
	        Helpers
	    ************************************/


	    function extend(a, b) {
	        for (var i in b) {
	            if (hasOwnProp(b, i)) {
	                a[i] = b[i];
	            }
	        }

	        if (hasOwnProp(b, 'toString')) {
	            a.toString = b.toString;
	        }

	        if (hasOwnProp(b, 'valueOf')) {
	            a.valueOf = b.valueOf;
	        }

	        return a;
	    }

	    function copyConfig(to, from) {
	        var i, prop, val;

	        if (typeof from._isAMomentObject !== 'undefined') {
	            to._isAMomentObject = from._isAMomentObject;
	        }
	        if (typeof from._i !== 'undefined') {
	            to._i = from._i;
	        }
	        if (typeof from._f !== 'undefined') {
	            to._f = from._f;
	        }
	        if (typeof from._l !== 'undefined') {
	            to._l = from._l;
	        }
	        if (typeof from._strict !== 'undefined') {
	            to._strict = from._strict;
	        }
	        if (typeof from._tzm !== 'undefined') {
	            to._tzm = from._tzm;
	        }
	        if (typeof from._isUTC !== 'undefined') {
	            to._isUTC = from._isUTC;
	        }
	        if (typeof from._offset !== 'undefined') {
	            to._offset = from._offset;
	        }
	        if (typeof from._pf !== 'undefined') {
	            to._pf = from._pf;
	        }
	        if (typeof from._locale !== 'undefined') {
	            to._locale = from._locale;
	        }

	        if (momentProperties.length > 0) {
	            for (i in momentProperties) {
	                prop = momentProperties[i];
	                val = from[prop];
	                if (typeof val !== 'undefined') {
	                    to[prop] = val;
	                }
	            }
	        }

	        return to;
	    }

	    function absRound(number) {
	        if (number < 0) {
	            return Math.ceil(number);
	        } else {
	            return Math.floor(number);
	        }
	    }

	    // left zero fill a number
	    // see http://jsperf.com/left-zero-filling for performance comparison
	    function leftZeroFill(number, targetLength, forceSign) {
	        var output = '' + Math.abs(number),
	            sign = number >= 0;

	        while (output.length < targetLength) {
	            output = '0' + output;
	        }
	        return (sign ? (forceSign ? '+' : '') : '-') + output;
	    }

	    function positiveMomentsDifference(base, other) {
	        var res = {milliseconds: 0, months: 0};

	        res.months = other.month() - base.month() +
	            (other.year() - base.year()) * 12;
	        if (base.clone().add(res.months, 'M').isAfter(other)) {
	            --res.months;
	        }

	        res.milliseconds = +other - +(base.clone().add(res.months, 'M'));

	        return res;
	    }

	    function momentsDifference(base, other) {
	        var res;
	        other = makeAs(other, base);
	        if (base.isBefore(other)) {
	            res = positiveMomentsDifference(base, other);
	        } else {
	            res = positiveMomentsDifference(other, base);
	            res.milliseconds = -res.milliseconds;
	            res.months = -res.months;
	        }

	        return res;
	    }

	    // TODO: remove 'name' arg after deprecation is removed
	    function createAdder(direction, name) {
	        return function (val, period) {
	            var dur, tmp;
	            //invert the arguments, but complain about it
	            if (period !== null && !isNaN(+period)) {
	                deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period).');
	                tmp = val; val = period; period = tmp;
	            }

	            val = typeof val === 'string' ? +val : val;
	            dur = moment.duration(val, period);
	            addOrSubtractDurationFromMoment(this, dur, direction);
	            return this;
	        };
	    }

	    function addOrSubtractDurationFromMoment(mom, duration, isAdding, updateOffset) {
	        var milliseconds = duration._milliseconds,
	            days = duration._days,
	            months = duration._months;
	        updateOffset = updateOffset == null ? true : updateOffset;

	        if (milliseconds) {
	            mom._d.setTime(+mom._d + milliseconds * isAdding);
	        }
	        if (days) {
	            rawSetter(mom, 'Date', rawGetter(mom, 'Date') + days * isAdding);
	        }
	        if (months) {
	            rawMonthSetter(mom, rawGetter(mom, 'Month') + months * isAdding);
	        }
	        if (updateOffset) {
	            moment.updateOffset(mom, days || months);
	        }
	    }

	    // check if is an array
	    function isArray(input) {
	        return Object.prototype.toString.call(input) === '[object Array]';
	    }

	    function isDate(input) {
	        return Object.prototype.toString.call(input) === '[object Date]' ||
	            input instanceof Date;
	    }

	    // compare two arrays, return the number of differences
	    function compareArrays(array1, array2, dontConvert) {
	        var len = Math.min(array1.length, array2.length),
	            lengthDiff = Math.abs(array1.length - array2.length),
	            diffs = 0,
	            i;
	        for (i = 0; i < len; i++) {
	            if ((dontConvert && array1[i] !== array2[i]) ||
	                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
	                diffs++;
	            }
	        }
	        return diffs + lengthDiff;
	    }

	    function normalizeUnits(units) {
	        if (units) {
	            var lowered = units.toLowerCase().replace(/(.)s$/, '$1');
	            units = unitAliases[units] || camelFunctions[lowered] || lowered;
	        }
	        return units;
	    }

	    function normalizeObjectUnits(inputObject) {
	        var normalizedInput = {},
	            normalizedProp,
	            prop;

	        for (prop in inputObject) {
	            if (hasOwnProp(inputObject, prop)) {
	                normalizedProp = normalizeUnits(prop);
	                if (normalizedProp) {
	                    normalizedInput[normalizedProp] = inputObject[prop];
	                }
	            }
	        }

	        return normalizedInput;
	    }

	    function makeList(field) {
	        var count, setter;

	        if (field.indexOf('week') === 0) {
	            count = 7;
	            setter = 'day';
	        }
	        else if (field.indexOf('month') === 0) {
	            count = 12;
	            setter = 'month';
	        }
	        else {
	            return;
	        }

	        moment[field] = function (format, index) {
	            var i, getter,
	                method = moment._locale[field],
	                results = [];

	            if (typeof format === 'number') {
	                index = format;
	                format = undefined;
	            }

	            getter = function (i) {
	                var m = moment().utc().set(setter, i);
	                return method.call(moment._locale, m, format || '');
	            };

	            if (index != null) {
	                return getter(index);
	            }
	            else {
	                for (i = 0; i < count; i++) {
	                    results.push(getter(i));
	                }
	                return results;
	            }
	        };
	    }

	    function toInt(argumentForCoercion) {
	        var coercedNumber = +argumentForCoercion,
	            value = 0;

	        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
	            if (coercedNumber >= 0) {
	                value = Math.floor(coercedNumber);
	            } else {
	                value = Math.ceil(coercedNumber);
	            }
	        }

	        return value;
	    }

	    function daysInMonth(year, month) {
	        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
	    }

	    function weeksInYear(year, dow, doy) {
	        return weekOfYear(moment([year, 11, 31 + dow - doy]), dow, doy).week;
	    }

	    function daysInYear(year) {
	        return isLeapYear(year) ? 366 : 365;
	    }

	    function isLeapYear(year) {
	        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
	    }

	    function checkOverflow(m) {
	        var overflow;
	        if (m._a && m._pf.overflow === -2) {
	            overflow =
	                m._a[MONTH] < 0 || m._a[MONTH] > 11 ? MONTH :
	                m._a[DATE] < 1 || m._a[DATE] > daysInMonth(m._a[YEAR], m._a[MONTH]) ? DATE :
	                m._a[HOUR] < 0 || m._a[HOUR] > 24 ||
	                    (m._a[HOUR] === 24 && (m._a[MINUTE] !== 0 ||
	                                           m._a[SECOND] !== 0 ||
	                                           m._a[MILLISECOND] !== 0)) ? HOUR :
	                m._a[MINUTE] < 0 || m._a[MINUTE] > 59 ? MINUTE :
	                m._a[SECOND] < 0 || m._a[SECOND] > 59 ? SECOND :
	                m._a[MILLISECOND] < 0 || m._a[MILLISECOND] > 999 ? MILLISECOND :
	                -1;

	            if (m._pf._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
	                overflow = DATE;
	            }

	            m._pf.overflow = overflow;
	        }
	    }

	    function isValid(m) {
	        if (m._isValid == null) {
	            m._isValid = !isNaN(m._d.getTime()) &&
	                m._pf.overflow < 0 &&
	                !m._pf.empty &&
	                !m._pf.invalidMonth &&
	                !m._pf.nullInput &&
	                !m._pf.invalidFormat &&
	                !m._pf.userInvalidated;

	            if (m._strict) {
	                m._isValid = m._isValid &&
	                    m._pf.charsLeftOver === 0 &&
	                    m._pf.unusedTokens.length === 0 &&
	                    m._pf.bigHour === undefined;
	            }
	        }
	        return m._isValid;
	    }

	    function normalizeLocale(key) {
	        return key ? key.toLowerCase().replace('_', '-') : key;
	    }

	    // pick the locale from the array
	    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
	    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
	    function chooseLocale(names) {
	        var i = 0, j, next, locale, split;

	        while (i < names.length) {
	            split = normalizeLocale(names[i]).split('-');
	            j = split.length;
	            next = normalizeLocale(names[i + 1]);
	            next = next ? next.split('-') : null;
	            while (j > 0) {
	                locale = loadLocale(split.slice(0, j).join('-'));
	                if (locale) {
	                    return locale;
	                }
	                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
	                    //the next array item is better than a shallower substring of this one
	                    break;
	                }
	                j--;
	            }
	            i++;
	        }
	        return null;
	    }

	    function loadLocale(name) {
	        var oldLocale = null;
	        if (!locales[name] && hasModule) {
	            try {
	                oldLocale = moment.locale();
	                !(function webpackMissingModule() { var e = new Error("Cannot find module \"./locale\""); e.code = 'MODULE_NOT_FOUND'; throw e; }());
	                // because defineLocale currently also sets the global locale, we want to undo that for lazy loaded locales
	                moment.locale(oldLocale);
	            } catch (e) { }
	        }
	        return locales[name];
	    }

	    // Return a moment from input, that is local/utc/utcOffset equivalent to
	    // model.
	    function makeAs(input, model) {
	        var res, diff;
	        if (model._isUTC) {
	            res = model.clone();
	            diff = (moment.isMoment(input) || isDate(input) ?
	                    +input : +moment(input)) - (+res);
	            // Use low-level api, because this fn is low-level api.
	            res._d.setTime(+res._d + diff);
	            moment.updateOffset(res, false);
	            return res;
	        } else {
	            return moment(input).local();
	        }
	    }

	    /************************************
	        Locale
	    ************************************/


	    extend(Locale.prototype, {

	        set : function (config) {
	            var prop, i;
	            for (i in config) {
	                prop = config[i];
	                if (typeof prop === 'function') {
	                    this[i] = prop;
	                } else {
	                    this['_' + i] = prop;
	                }
	            }
	            // Lenient ordinal parsing accepts just a number in addition to
	            // number + (possibly) stuff coming from _ordinalParseLenient.
	            this._ordinalParseLenient = new RegExp(this._ordinalParse.source + '|' + /\d{1,2}/.source);
	        },

	        _months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
	        months : function (m) {
	            return this._months[m.month()];
	        },

	        _monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
	        monthsShort : function (m) {
	            return this._monthsShort[m.month()];
	        },

	        monthsParse : function (monthName, format, strict) {
	            var i, mom, regex;

	            if (!this._monthsParse) {
	                this._monthsParse = [];
	                this._longMonthsParse = [];
	                this._shortMonthsParse = [];
	            }

	            for (i = 0; i < 12; i++) {
	                // make the regex if we don't have it already
	                mom = moment.utc([2000, i]);
	                if (strict && !this._longMonthsParse[i]) {
	                    this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
	                    this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
	                }
	                if (!strict && !this._monthsParse[i]) {
	                    regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
	                    this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
	                }
	                // test the regex
	                if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
	                    return i;
	                } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
	                    return i;
	                } else if (!strict && this._monthsParse[i].test(monthName)) {
	                    return i;
	                }
	            }
	        },

	        _weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
	        weekdays : function (m) {
	            return this._weekdays[m.day()];
	        },

	        _weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
	        weekdaysShort : function (m) {
	            return this._weekdaysShort[m.day()];
	        },

	        _weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
	        weekdaysMin : function (m) {
	            return this._weekdaysMin[m.day()];
	        },

	        weekdaysParse : function (weekdayName) {
	            var i, mom, regex;

	            if (!this._weekdaysParse) {
	                this._weekdaysParse = [];
	            }

	            for (i = 0; i < 7; i++) {
	                // make the regex if we don't have it already
	                if (!this._weekdaysParse[i]) {
	                    mom = moment([2000, 1]).day(i);
	                    regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
	                    this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
	                }
	                // test the regex
	                if (this._weekdaysParse[i].test(weekdayName)) {
	                    return i;
	                }
	            }
	        },

	        _longDateFormat : {
	            LTS : 'h:mm:ss A',
	            LT : 'h:mm A',
	            L : 'MM/DD/YYYY',
	            LL : 'MMMM D, YYYY',
	            LLL : 'MMMM D, YYYY LT',
	            LLLL : 'dddd, MMMM D, YYYY LT'
	        },
	        longDateFormat : function (key) {
	            var output = this._longDateFormat[key];
	            if (!output && this._longDateFormat[key.toUpperCase()]) {
	                output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function (val) {
	                    return val.slice(1);
	                });
	                this._longDateFormat[key] = output;
	            }
	            return output;
	        },

	        isPM : function (input) {
	            // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
	            // Using charAt should be more compatible.
	            return ((input + '').toLowerCase().charAt(0) === 'p');
	        },

	        _meridiemParse : /[ap]\.?m?\.?/i,
	        meridiem : function (hours, minutes, isLower) {
	            if (hours > 11) {
	                return isLower ? 'pm' : 'PM';
	            } else {
	                return isLower ? 'am' : 'AM';
	            }
	        },


	        _calendar : {
	            sameDay : '[Today at] LT',
	            nextDay : '[Tomorrow at] LT',
	            nextWeek : 'dddd [at] LT',
	            lastDay : '[Yesterday at] LT',
	            lastWeek : '[Last] dddd [at] LT',
	            sameElse : 'L'
	        },
	        calendar : function (key, mom, now) {
	            var output = this._calendar[key];
	            return typeof output === 'function' ? output.apply(mom, [now]) : output;
	        },

	        _relativeTime : {
	            future : 'in %s',
	            past : '%s ago',
	            s : 'a few seconds',
	            m : 'a minute',
	            mm : '%d minutes',
	            h : 'an hour',
	            hh : '%d hours',
	            d : 'a day',
	            dd : '%d days',
	            M : 'a month',
	            MM : '%d months',
	            y : 'a year',
	            yy : '%d years'
	        },

	        relativeTime : function (number, withoutSuffix, string, isFuture) {
	            var output = this._relativeTime[string];
	            return (typeof output === 'function') ?
	                output(number, withoutSuffix, string, isFuture) :
	                output.replace(/%d/i, number);
	        },

	        pastFuture : function (diff, output) {
	            var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
	            return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);
	        },

	        ordinal : function (number) {
	            return this._ordinal.replace('%d', number);
	        },
	        _ordinal : '%d',
	        _ordinalParse : /\d{1,2}/,

	        preparse : function (string) {
	            return string;
	        },

	        postformat : function (string) {
	            return string;
	        },

	        week : function (mom) {
	            return weekOfYear(mom, this._week.dow, this._week.doy).week;
	        },

	        _week : {
	            dow : 0, // Sunday is the first day of the week.
	            doy : 6  // The week that contains Jan 1st is the first week of the year.
	        },

	        firstDayOfWeek : function () {
	            return this._week.dow;
	        },

	        firstDayOfYear : function () {
	            return this._week.doy;
	        },

	        _invalidDate: 'Invalid date',
	        invalidDate: function () {
	            return this._invalidDate;
	        }
	    });

	    /************************************
	        Formatting
	    ************************************/


	    function removeFormattingTokens(input) {
	        if (input.match(/\[[\s\S]/)) {
	            return input.replace(/^\[|\]$/g, '');
	        }
	        return input.replace(/\\/g, '');
	    }

	    function makeFormatFunction(format) {
	        var array = format.match(formattingTokens), i, length;

	        for (i = 0, length = array.length; i < length; i++) {
	            if (formatTokenFunctions[array[i]]) {
	                array[i] = formatTokenFunctions[array[i]];
	            } else {
	                array[i] = removeFormattingTokens(array[i]);
	            }
	        }

	        return function (mom) {
	            var output = '';
	            for (i = 0; i < length; i++) {
	                output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
	            }
	            return output;
	        };
	    }

	    // format date using native date object
	    function formatMoment(m, format) {
	        if (!m.isValid()) {
	            return m.localeData().invalidDate();
	        }

	        format = expandFormat(format, m.localeData());

	        if (!formatFunctions[format]) {
	            formatFunctions[format] = makeFormatFunction(format);
	        }

	        return formatFunctions[format](m);
	    }

	    function expandFormat(format, locale) {
	        var i = 5;

	        function replaceLongDateFormatTokens(input) {
	            return locale.longDateFormat(input) || input;
	        }

	        localFormattingTokens.lastIndex = 0;
	        while (i >= 0 && localFormattingTokens.test(format)) {
	            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
	            localFormattingTokens.lastIndex = 0;
	            i -= 1;
	        }

	        return format;
	    }


	    /************************************
	        Parsing
	    ************************************/


	    // get the regex to find the next token
	    function getParseRegexForToken(token, config) {
	        var a, strict = config._strict;
	        switch (token) {
	        case 'Q':
	            return parseTokenOneDigit;
	        case 'DDDD':
	            return parseTokenThreeDigits;
	        case 'YYYY':
	        case 'GGGG':
	        case 'gggg':
	            return strict ? parseTokenFourDigits : parseTokenOneToFourDigits;
	        case 'Y':
	        case 'G':
	        case 'g':
	            return parseTokenSignedNumber;
	        case 'YYYYYY':
	        case 'YYYYY':
	        case 'GGGGG':
	        case 'ggggg':
	            return strict ? parseTokenSixDigits : parseTokenOneToSixDigits;
	        case 'S':
	            if (strict) {
	                return parseTokenOneDigit;
	            }
	            /* falls through */
	        case 'SS':
	            if (strict) {
	                return parseTokenTwoDigits;
	            }
	            /* falls through */
	        case 'SSS':
	            if (strict) {
	                return parseTokenThreeDigits;
	            }
	            /* falls through */
	        case 'DDD':
	            return parseTokenOneToThreeDigits;
	        case 'MMM':
	        case 'MMMM':
	        case 'dd':
	        case 'ddd':
	        case 'dddd':
	            return parseTokenWord;
	        case 'a':
	        case 'A':
	            return config._locale._meridiemParse;
	        case 'x':
	            return parseTokenOffsetMs;
	        case 'X':
	            return parseTokenTimestampMs;
	        case 'Z':
	        case 'ZZ':
	            return parseTokenTimezone;
	        case 'T':
	            return parseTokenT;
	        case 'SSSS':
	            return parseTokenDigits;
	        case 'MM':
	        case 'DD':
	        case 'YY':
	        case 'GG':
	        case 'gg':
	        case 'HH':
	        case 'hh':
	        case 'mm':
	        case 'ss':
	        case 'ww':
	        case 'WW':
	            return strict ? parseTokenTwoDigits : parseTokenOneOrTwoDigits;
	        case 'M':
	        case 'D':
	        case 'd':
	        case 'H':
	        case 'h':
	        case 'm':
	        case 's':
	        case 'w':
	        case 'W':
	        case 'e':
	        case 'E':
	            return parseTokenOneOrTwoDigits;
	        case 'Do':
	            return strict ? config._locale._ordinalParse : config._locale._ordinalParseLenient;
	        default :
	            a = new RegExp(regexpEscape(unescapeFormat(token.replace('\\', '')), 'i'));
	            return a;
	        }
	    }

	    function utcOffsetFromString(string) {
	        string = string || '';
	        var possibleTzMatches = (string.match(parseTokenTimezone) || []),
	            tzChunk = possibleTzMatches[possibleTzMatches.length - 1] || [],
	            parts = (tzChunk + '').match(parseTimezoneChunker) || ['-', 0, 0],
	            minutes = +(parts[1] * 60) + toInt(parts[2]);

	        return parts[0] === '+' ? minutes : -minutes;
	    }

	    // function to convert string input to date
	    function addTimeToArrayFromToken(token, input, config) {
	        var a, datePartArray = config._a;

	        switch (token) {
	        // QUARTER
	        case 'Q':
	            if (input != null) {
	                datePartArray[MONTH] = (toInt(input) - 1) * 3;
	            }
	            break;
	        // MONTH
	        case 'M' : // fall through to MM
	        case 'MM' :
	            if (input != null) {
	                datePartArray[MONTH] = toInt(input) - 1;
	            }
	            break;
	        case 'MMM' : // fall through to MMMM
	        case 'MMMM' :
	            a = config._locale.monthsParse(input, token, config._strict);
	            // if we didn't find a month name, mark the date as invalid.
	            if (a != null) {
	                datePartArray[MONTH] = a;
	            } else {
	                config._pf.invalidMonth = input;
	            }
	            break;
	        // DAY OF MONTH
	        case 'D' : // fall through to DD
	        case 'DD' :
	            if (input != null) {
	                datePartArray[DATE] = toInt(input);
	            }
	            break;
	        case 'Do' :
	            if (input != null) {
	                datePartArray[DATE] = toInt(parseInt(
	                            input.match(/\d{1,2}/)[0], 10));
	            }
	            break;
	        // DAY OF YEAR
	        case 'DDD' : // fall through to DDDD
	        case 'DDDD' :
	            if (input != null) {
	                config._dayOfYear = toInt(input);
	            }

	            break;
	        // YEAR
	        case 'YY' :
	            datePartArray[YEAR] = moment.parseTwoDigitYear(input);
	            break;
	        case 'YYYY' :
	        case 'YYYYY' :
	        case 'YYYYYY' :
	            datePartArray[YEAR] = toInt(input);
	            break;
	        // AM / PM
	        case 'a' : // fall through to A
	        case 'A' :
	            config._meridiem = input;
	            // config._isPm = config._locale.isPM(input);
	            break;
	        // HOUR
	        case 'h' : // fall through to hh
	        case 'hh' :
	            config._pf.bigHour = true;
	            /* falls through */
	        case 'H' : // fall through to HH
	        case 'HH' :
	            datePartArray[HOUR] = toInt(input);
	            break;
	        // MINUTE
	        case 'm' : // fall through to mm
	        case 'mm' :
	            datePartArray[MINUTE] = toInt(input);
	            break;
	        // SECOND
	        case 's' : // fall through to ss
	        case 'ss' :
	            datePartArray[SECOND] = toInt(input);
	            break;
	        // MILLISECOND
	        case 'S' :
	        case 'SS' :
	        case 'SSS' :
	        case 'SSSS' :
	            datePartArray[MILLISECOND] = toInt(('0.' + input) * 1000);
	            break;
	        // UNIX OFFSET (MILLISECONDS)
	        case 'x':
	            config._d = new Date(toInt(input));
	            break;
	        // UNIX TIMESTAMP WITH MS
	        case 'X':
	            config._d = new Date(parseFloat(input) * 1000);
	            break;
	        // TIMEZONE
	        case 'Z' : // fall through to ZZ
	        case 'ZZ' :
	            config._useUTC = true;
	            config._tzm = utcOffsetFromString(input);
	            break;
	        // WEEKDAY - human
	        case 'dd':
	        case 'ddd':
	        case 'dddd':
	            a = config._locale.weekdaysParse(input);
	            // if we didn't get a weekday name, mark the date as invalid
	            if (a != null) {
	                config._w = config._w || {};
	                config._w['d'] = a;
	            } else {
	                config._pf.invalidWeekday = input;
	            }
	            break;
	        // WEEK, WEEK DAY - numeric
	        case 'w':
	        case 'ww':
	        case 'W':
	        case 'WW':
	        case 'd':
	        case 'e':
	        case 'E':
	            token = token.substr(0, 1);
	            /* falls through */
	        case 'gggg':
	        case 'GGGG':
	        case 'GGGGG':
	            token = token.substr(0, 2);
	            if (input) {
	                config._w = config._w || {};
	                config._w[token] = toInt(input);
	            }
	            break;
	        case 'gg':
	        case 'GG':
	            config._w = config._w || {};
	            config._w[token] = moment.parseTwoDigitYear(input);
	        }
	    }

	    function dayOfYearFromWeekInfo(config) {
	        var w, weekYear, week, weekday, dow, doy, temp;

	        w = config._w;
	        if (w.GG != null || w.W != null || w.E != null) {
	            dow = 1;
	            doy = 4;

	            // TODO: We need to take the current isoWeekYear, but that depends on
	            // how we interpret now (local, utc, fixed offset). So create
	            // a now version of current config (take local/utc/offset flags, and
	            // create now).
	            weekYear = dfl(w.GG, config._a[YEAR], weekOfYear(moment(), 1, 4).year);
	            week = dfl(w.W, 1);
	            weekday = dfl(w.E, 1);
	        } else {
	            dow = config._locale._week.dow;
	            doy = config._locale._week.doy;

	            weekYear = dfl(w.gg, config._a[YEAR], weekOfYear(moment(), dow, doy).year);
	            week = dfl(w.w, 1);

	            if (w.d != null) {
	                // weekday -- low day numbers are considered next week
	                weekday = w.d;
	                if (weekday < dow) {
	                    ++week;
	                }
	            } else if (w.e != null) {
	                // local weekday -- counting starts from begining of week
	                weekday = w.e + dow;
	            } else {
	                // default to begining of week
	                weekday = dow;
	            }
	        }
	        temp = dayOfYearFromWeeks(weekYear, week, weekday, doy, dow);

	        config._a[YEAR] = temp.year;
	        config._dayOfYear = temp.dayOfYear;
	    }

	    // convert an array to a date.
	    // the array should mirror the parameters below
	    // note: all values past the year are optional and will default to the lowest possible value.
	    // [year, month, day , hour, minute, second, millisecond]
	    function dateFromConfig(config) {
	        var i, date, input = [], currentDate, yearToUse;

	        if (config._d) {
	            return;
	        }

	        currentDate = currentDateArray(config);

	        //compute day of the year from weeks and weekdays
	        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
	            dayOfYearFromWeekInfo(config);
	        }

	        //if the day of the year is set, figure out what it is
	        if (config._dayOfYear) {
	            yearToUse = dfl(config._a[YEAR], currentDate[YEAR]);

	            if (config._dayOfYear > daysInYear(yearToUse)) {
	                config._pf._overflowDayOfYear = true;
	            }

	            date = makeUTCDate(yearToUse, 0, config._dayOfYear);
	            config._a[MONTH] = date.getUTCMonth();
	            config._a[DATE] = date.getUTCDate();
	        }

	        // Default to current date.
	        // * if no year, month, day of month are given, default to today
	        // * if day of month is given, default month and year
	        // * if month is given, default only year
	        // * if year is given, don't default anything
	        for (i = 0; i < 3 && config._a[i] == null; ++i) {
	            config._a[i] = input[i] = currentDate[i];
	        }

	        // Zero out whatever was not defaulted, including time
	        for (; i < 7; i++) {
	            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
	        }

	        // Check for 24:00:00.000
	        if (config._a[HOUR] === 24 &&
	                config._a[MINUTE] === 0 &&
	                config._a[SECOND] === 0 &&
	                config._a[MILLISECOND] === 0) {
	            config._nextDay = true;
	            config._a[HOUR] = 0;
	        }

	        config._d = (config._useUTC ? makeUTCDate : makeDate).apply(null, input);
	        // Apply timezone offset from input. The actual utcOffset can be changed
	        // with parseZone.
	        if (config._tzm != null) {
	            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
	        }

	        if (config._nextDay) {
	            config._a[HOUR] = 24;
	        }
	    }

	    function dateFromObject(config) {
	        var normalizedInput;

	        if (config._d) {
	            return;
	        }

	        normalizedInput = normalizeObjectUnits(config._i);
	        config._a = [
	            normalizedInput.year,
	            normalizedInput.month,
	            normalizedInput.day || normalizedInput.date,
	            normalizedInput.hour,
	            normalizedInput.minute,
	            normalizedInput.second,
	            normalizedInput.millisecond
	        ];

	        dateFromConfig(config);
	    }

	    function currentDateArray(config) {
	        var now = new Date();
	        if (config._useUTC) {
	            return [
	                now.getUTCFullYear(),
	                now.getUTCMonth(),
	                now.getUTCDate()
	            ];
	        } else {
	            return [now.getFullYear(), now.getMonth(), now.getDate()];
	        }
	    }

	    // date from string and format string
	    function makeDateFromStringAndFormat(config) {
	        if (config._f === moment.ISO_8601) {
	            parseISO(config);
	            return;
	        }

	        config._a = [];
	        config._pf.empty = true;

	        // This array is used to make a Date, either with `new Date` or `Date.UTC`
	        var string = '' + config._i,
	            i, parsedInput, tokens, token, skipped,
	            stringLength = string.length,
	            totalParsedInputLength = 0;

	        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

	        for (i = 0; i < tokens.length; i++) {
	            token = tokens[i];
	            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
	            if (parsedInput) {
	                skipped = string.substr(0, string.indexOf(parsedInput));
	                if (skipped.length > 0) {
	                    config._pf.unusedInput.push(skipped);
	                }
	                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
	                totalParsedInputLength += parsedInput.length;
	            }
	            // don't parse if it's not a known token
	            if (formatTokenFunctions[token]) {
	                if (parsedInput) {
	                    config._pf.empty = false;
	                }
	                else {
	                    config._pf.unusedTokens.push(token);
	                }
	                addTimeToArrayFromToken(token, parsedInput, config);
	            }
	            else if (config._strict && !parsedInput) {
	                config._pf.unusedTokens.push(token);
	            }
	        }

	        // add remaining unparsed input length to the string
	        config._pf.charsLeftOver = stringLength - totalParsedInputLength;
	        if (string.length > 0) {
	            config._pf.unusedInput.push(string);
	        }

	        // clear _12h flag if hour is <= 12
	        if (config._pf.bigHour === true && config._a[HOUR] <= 12) {
	            config._pf.bigHour = undefined;
	        }
	        // handle meridiem
	        config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR],
	                config._meridiem);
	        dateFromConfig(config);
	        checkOverflow(config);
	    }

	    function unescapeFormat(s) {
	        return s.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
	            return p1 || p2 || p3 || p4;
	        });
	    }

	    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
	    function regexpEscape(s) {
	        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
	    }

	    // date from string and array of format strings
	    function makeDateFromStringAndArray(config) {
	        var tempConfig,
	            bestMoment,

	            scoreToBeat,
	            i,
	            currentScore;

	        if (config._f.length === 0) {
	            config._pf.invalidFormat = true;
	            config._d = new Date(NaN);
	            return;
	        }

	        for (i = 0; i < config._f.length; i++) {
	            currentScore = 0;
	            tempConfig = copyConfig({}, config);
	            if (config._useUTC != null) {
	                tempConfig._useUTC = config._useUTC;
	            }
	            tempConfig._pf = defaultParsingFlags();
	            tempConfig._f = config._f[i];
	            makeDateFromStringAndFormat(tempConfig);

	            if (!isValid(tempConfig)) {
	                continue;
	            }

	            // if there is any input that was not parsed add a penalty for that format
	            currentScore += tempConfig._pf.charsLeftOver;

	            //or tokens
	            currentScore += tempConfig._pf.unusedTokens.length * 10;

	            tempConfig._pf.score = currentScore;

	            if (scoreToBeat == null || currentScore < scoreToBeat) {
	                scoreToBeat = currentScore;
	                bestMoment = tempConfig;
	            }
	        }

	        extend(config, bestMoment || tempConfig);
	    }

	    // date from iso format
	    function parseISO(config) {
	        var i, l,
	            string = config._i,
	            match = isoRegex.exec(string);

	        if (match) {
	            config._pf.iso = true;
	            for (i = 0, l = isoDates.length; i < l; i++) {
	                if (isoDates[i][1].exec(string)) {
	                    // match[5] should be 'T' or undefined
	                    config._f = isoDates[i][0] + (match[6] || ' ');
	                    break;
	                }
	            }
	            for (i = 0, l = isoTimes.length; i < l; i++) {
	                if (isoTimes[i][1].exec(string)) {
	                    config._f += isoTimes[i][0];
	                    break;
	                }
	            }
	            if (string.match(parseTokenTimezone)) {
	                config._f += 'Z';
	            }
	            makeDateFromStringAndFormat(config);
	        } else {
	            config._isValid = false;
	        }
	    }

	    // date from iso format or fallback
	    function makeDateFromString(config) {
	        parseISO(config);
	        if (config._isValid === false) {
	            delete config._isValid;
	            moment.createFromInputFallback(config);
	        }
	    }

	    function map(arr, fn) {
	        var res = [], i;
	        for (i = 0; i < arr.length; ++i) {
	            res.push(fn(arr[i], i));
	        }
	        return res;
	    }

	    function makeDateFromInput(config) {
	        var input = config._i, matched;
	        if (input === undefined) {
	            config._d = new Date();
	        } else if (isDate(input)) {
	            config._d = new Date(+input);
	        } else if ((matched = aspNetJsonRegex.exec(input)) !== null) {
	            config._d = new Date(+matched[1]);
	        } else if (typeof input === 'string') {
	            makeDateFromString(config);
	        } else if (isArray(input)) {
	            config._a = map(input.slice(0), function (obj) {
	                return parseInt(obj, 10);
	            });
	            dateFromConfig(config);
	        } else if (typeof(input) === 'object') {
	            dateFromObject(config);
	        } else if (typeof(input) === 'number') {
	            // from milliseconds
	            config._d = new Date(input);
	        } else {
	            moment.createFromInputFallback(config);
	        }
	    }

	    function makeDate(y, m, d, h, M, s, ms) {
	        //can't just apply() to create a date:
	        //http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
	        var date = new Date(y, m, d, h, M, s, ms);

	        //the date constructor doesn't accept years < 1970
	        if (y < 1970) {
	            date.setFullYear(y);
	        }
	        return date;
	    }

	    function makeUTCDate(y) {
	        var date = new Date(Date.UTC.apply(null, arguments));
	        if (y < 1970) {
	            date.setUTCFullYear(y);
	        }
	        return date;
	    }

	    function parseWeekday(input, locale) {
	        if (typeof input === 'string') {
	            if (!isNaN(input)) {
	                input = parseInt(input, 10);
	            }
	            else {
	                input = locale.weekdaysParse(input);
	                if (typeof input !== 'number') {
	                    return null;
	                }
	            }
	        }
	        return input;
	    }

	    /************************************
	        Relative Time
	    ************************************/


	    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
	    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
	        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
	    }

	    function relativeTime(posNegDuration, withoutSuffix, locale) {
	        var duration = moment.duration(posNegDuration).abs(),
	            seconds = round(duration.as('s')),
	            minutes = round(duration.as('m')),
	            hours = round(duration.as('h')),
	            days = round(duration.as('d')),
	            months = round(duration.as('M')),
	            years = round(duration.as('y')),

	            args = seconds < relativeTimeThresholds.s && ['s', seconds] ||
	                minutes === 1 && ['m'] ||
	                minutes < relativeTimeThresholds.m && ['mm', minutes] ||
	                hours === 1 && ['h'] ||
	                hours < relativeTimeThresholds.h && ['hh', hours] ||
	                days === 1 && ['d'] ||
	                days < relativeTimeThresholds.d && ['dd', days] ||
	                months === 1 && ['M'] ||
	                months < relativeTimeThresholds.M && ['MM', months] ||
	                years === 1 && ['y'] || ['yy', years];

	        args[2] = withoutSuffix;
	        args[3] = +posNegDuration > 0;
	        args[4] = locale;
	        return substituteTimeAgo.apply({}, args);
	    }


	    /************************************
	        Week of Year
	    ************************************/


	    // firstDayOfWeek       0 = sun, 6 = sat
	    //                      the day of the week that starts the week
	    //                      (usually sunday or monday)
	    // firstDayOfWeekOfYear 0 = sun, 6 = sat
	    //                      the first week is the week that contains the first
	    //                      of this day of the week
	    //                      (eg. ISO weeks use thursday (4))
	    function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
	        var end = firstDayOfWeekOfYear - firstDayOfWeek,
	            daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(),
	            adjustedMoment;


	        if (daysToDayOfWeek > end) {
	            daysToDayOfWeek -= 7;
	        }

	        if (daysToDayOfWeek < end - 7) {
	            daysToDayOfWeek += 7;
	        }

	        adjustedMoment = moment(mom).add(daysToDayOfWeek, 'd');
	        return {
	            week: Math.ceil(adjustedMoment.dayOfYear() / 7),
	            year: adjustedMoment.year()
	        };
	    }

	    //http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
	    function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {
	        var d = makeUTCDate(year, 0, 1).getUTCDay(), daysToAdd, dayOfYear;

	        d = d === 0 ? 7 : d;
	        weekday = weekday != null ? weekday : firstDayOfWeek;
	        daysToAdd = firstDayOfWeek - d + (d > firstDayOfWeekOfYear ? 7 : 0) - (d < firstDayOfWeek ? 7 : 0);
	        dayOfYear = 7 * (week - 1) + (weekday - firstDayOfWeek) + daysToAdd + 1;

	        return {
	            year: dayOfYear > 0 ? year : year - 1,
	            dayOfYear: dayOfYear > 0 ?  dayOfYear : daysInYear(year - 1) + dayOfYear
	        };
	    }

	    /************************************
	        Top Level Functions
	    ************************************/

	    function makeMoment(config) {
	        var input = config._i,
	            format = config._f,
	            res;

	        config._locale = config._locale || moment.localeData(config._l);

	        if (input === null || (format === undefined && input === '')) {
	            return moment.invalid({nullInput: true});
	        }

	        if (typeof input === 'string') {
	            config._i = input = config._locale.preparse(input);
	        }

	        if (moment.isMoment(input)) {
	            return new Moment(input, true);
	        } else if (format) {
	            if (isArray(format)) {
	                makeDateFromStringAndArray(config);
	            } else {
	                makeDateFromStringAndFormat(config);
	            }
	        } else {
	            makeDateFromInput(config);
	        }

	        res = new Moment(config);
	        if (res._nextDay) {
	            // Adding is smart enough around DST
	            res.add(1, 'd');
	            res._nextDay = undefined;
	        }

	        return res;
	    }

	    moment = function (input, format, locale, strict) {
	        var c;

	        if (typeof(locale) === 'boolean') {
	            strict = locale;
	            locale = undefined;
	        }
	        // object construction must be done this way.
	        // https://github.com/moment/moment/issues/1423
	        c = {};
	        c._isAMomentObject = true;
	        c._i = input;
	        c._f = format;
	        c._l = locale;
	        c._strict = strict;
	        c._isUTC = false;
	        c._pf = defaultParsingFlags();

	        return makeMoment(c);
	    };

	    moment.suppressDeprecationWarnings = false;

	    moment.createFromInputFallback = deprecate(
	        'moment construction falls back to js Date. This is ' +
	        'discouraged and will be removed in upcoming major ' +
	        'release. Please refer to ' +
	        'https://github.com/moment/moment/issues/1407 for more info.',
	        function (config) {
	            config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
	        }
	    );

	    // Pick a moment m from moments so that m[fn](other) is true for all
	    // other. This relies on the function fn to be transitive.
	    //
	    // moments should either be an array of moment objects or an array, whose
	    // first element is an array of moment objects.
	    function pickBy(fn, moments) {
	        var res, i;
	        if (moments.length === 1 && isArray(moments[0])) {
	            moments = moments[0];
	        }
	        if (!moments.length) {
	            return moment();
	        }
	        res = moments[0];
	        for (i = 1; i < moments.length; ++i) {
	            if (moments[i][fn](res)) {
	                res = moments[i];
	            }
	        }
	        return res;
	    }

	    moment.min = function () {
	        var args = [].slice.call(arguments, 0);

	        return pickBy('isBefore', args);
	    };

	    moment.max = function () {
	        var args = [].slice.call(arguments, 0);

	        return pickBy('isAfter', args);
	    };

	    // creating with utc
	    moment.utc = function (input, format, locale, strict) {
	        var c;

	        if (typeof(locale) === 'boolean') {
	            strict = locale;
	            locale = undefined;
	        }
	        // object construction must be done this way.
	        // https://github.com/moment/moment/issues/1423
	        c = {};
	        c._isAMomentObject = true;
	        c._useUTC = true;
	        c._isUTC = true;
	        c._l = locale;
	        c._i = input;
	        c._f = format;
	        c._strict = strict;
	        c._pf = defaultParsingFlags();

	        return makeMoment(c).utc();
	    };

	    // creating with unix timestamp (in seconds)
	    moment.unix = function (input) {
	        return moment(input * 1000);
	    };

	    // duration
	    moment.duration = function (input, key) {
	        var duration = input,
	            // matching against regexp is expensive, do it on demand
	            match = null,
	            sign,
	            ret,
	            parseIso,
	            diffRes;

	        if (moment.isDuration(input)) {
	            duration = {
	                ms: input._milliseconds,
	                d: input._days,
	                M: input._months
	            };
	        } else if (typeof input === 'number') {
	            duration = {};
	            if (key) {
	                duration[key] = input;
	            } else {
	                duration.milliseconds = input;
	            }
	        } else if (!!(match = aspNetTimeSpanJsonRegex.exec(input))) {
	            sign = (match[1] === '-') ? -1 : 1;
	            duration = {
	                y: 0,
	                d: toInt(match[DATE]) * sign,
	                h: toInt(match[HOUR]) * sign,
	                m: toInt(match[MINUTE]) * sign,
	                s: toInt(match[SECOND]) * sign,
	                ms: toInt(match[MILLISECOND]) * sign
	            };
	        } else if (!!(match = isoDurationRegex.exec(input))) {
	            sign = (match[1] === '-') ? -1 : 1;
	            parseIso = function (inp) {
	                // We'd normally use ~~inp for this, but unfortunately it also
	                // converts floats to ints.
	                // inp may be undefined, so careful calling replace on it.
	                var res = inp && parseFloat(inp.replace(',', '.'));
	                // apply sign while we're at it
	                return (isNaN(res) ? 0 : res) * sign;
	            };
	            duration = {
	                y: parseIso(match[2]),
	                M: parseIso(match[3]),
	                d: parseIso(match[4]),
	                h: parseIso(match[5]),
	                m: parseIso(match[6]),
	                s: parseIso(match[7]),
	                w: parseIso(match[8])
	            };
	        } else if (duration == null) {// checks for null or undefined
	            duration = {};
	        } else if (typeof duration === 'object' &&
	                ('from' in duration || 'to' in duration)) {
	            diffRes = momentsDifference(moment(duration.from), moment(duration.to));

	            duration = {};
	            duration.ms = diffRes.milliseconds;
	            duration.M = diffRes.months;
	        }

	        ret = new Duration(duration);

	        if (moment.isDuration(input) && hasOwnProp(input, '_locale')) {
	            ret._locale = input._locale;
	        }

	        return ret;
	    };

	    // version number
	    moment.version = VERSION;

	    // default format
	    moment.defaultFormat = isoFormat;

	    // constant that refers to the ISO standard
	    moment.ISO_8601 = function () {};

	    // Plugins that add properties should also add the key here (null value),
	    // so we can properly clone ourselves.
	    moment.momentProperties = momentProperties;

	    // This function will be called whenever a moment is mutated.
	    // It is intended to keep the offset in sync with the timezone.
	    moment.updateOffset = function () {};

	    // This function allows you to set a threshold for relative time strings
	    moment.relativeTimeThreshold = function (threshold, limit) {
	        if (relativeTimeThresholds[threshold] === undefined) {
	            return false;
	        }
	        if (limit === undefined) {
	            return relativeTimeThresholds[threshold];
	        }
	        relativeTimeThresholds[threshold] = limit;
	        return true;
	    };

	    moment.lang = deprecate(
	        'moment.lang is deprecated. Use moment.locale instead.',
	        function (key, value) {
	            return moment.locale(key, value);
	        }
	    );

	    // This function will load locale and then set the global locale.  If
	    // no arguments are passed in, it will simply return the current global
	    // locale key.
	    moment.locale = function (key, values) {
	        var data;
	        if (key) {
	            if (typeof(values) !== 'undefined') {
	                data = moment.defineLocale(key, values);
	            }
	            else {
	                data = moment.localeData(key);
	            }

	            if (data) {
	                moment.duration._locale = moment._locale = data;
	            }
	        }

	        return moment._locale._abbr;
	    };

	    moment.defineLocale = function (name, values) {
	        if (values !== null) {
	            values.abbr = name;
	            if (!locales[name]) {
	                locales[name] = new Locale();
	            }
	            locales[name].set(values);

	            // backwards compat for now: also set the locale
	            moment.locale(name);

	            return locales[name];
	        } else {
	            // useful for testing
	            delete locales[name];
	            return null;
	        }
	    };

	    moment.langData = deprecate(
	        'moment.langData is deprecated. Use moment.localeData instead.',
	        function (key) {
	            return moment.localeData(key);
	        }
	    );

	    // returns locale data
	    moment.localeData = function (key) {
	        var locale;

	        if (key && key._locale && key._locale._abbr) {
	            key = key._locale._abbr;
	        }

	        if (!key) {
	            return moment._locale;
	        }

	        if (!isArray(key)) {
	            //short-circuit everything else
	            locale = loadLocale(key);
	            if (locale) {
	                return locale;
	            }
	            key = [key];
	        }

	        return chooseLocale(key);
	    };

	    // compare moment object
	    moment.isMoment = function (obj) {
	        return obj instanceof Moment ||
	            (obj != null && hasOwnProp(obj, '_isAMomentObject'));
	    };

	    // for typechecking Duration objects
	    moment.isDuration = function (obj) {
	        return obj instanceof Duration;
	    };

	    for (i = lists.length - 1; i >= 0; --i) {
	        makeList(lists[i]);
	    }

	    moment.normalizeUnits = function (units) {
	        return normalizeUnits(units);
	    };

	    moment.invalid = function (flags) {
	        var m = moment.utc(NaN);
	        if (flags != null) {
	            extend(m._pf, flags);
	        }
	        else {
	            m._pf.userInvalidated = true;
	        }

	        return m;
	    };

	    moment.parseZone = function () {
	        return moment.apply(null, arguments).parseZone();
	    };

	    moment.parseTwoDigitYear = function (input) {
	        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
	    };

	    moment.isDate = isDate;

	    /************************************
	        Moment Prototype
	    ************************************/


	    extend(moment.fn = Moment.prototype, {

	        clone : function () {
	            return moment(this);
	        },

	        valueOf : function () {
	            return +this._d - ((this._offset || 0) * 60000);
	        },

	        unix : function () {
	            return Math.floor(+this / 1000);
	        },

	        toString : function () {
	            return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
	        },

	        toDate : function () {
	            return this._offset ? new Date(+this) : this._d;
	        },

	        toISOString : function () {
	            var m = moment(this).utc();
	            if (0 < m.year() && m.year() <= 9999) {
	                if ('function' === typeof Date.prototype.toISOString) {
	                    // native implementation is ~50x faster, use it when we can
	                    return this.toDate().toISOString();
	                } else {
	                    return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
	                }
	            } else {
	                return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
	            }
	        },

	        toArray : function () {
	            var m = this;
	            return [
	                m.year(),
	                m.month(),
	                m.date(),
	                m.hours(),
	                m.minutes(),
	                m.seconds(),
	                m.milliseconds()
	            ];
	        },

	        isValid : function () {
	            return isValid(this);
	        },

	        isDSTShifted : function () {
	            if (this._a) {
	                return this.isValid() && compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray()) > 0;
	            }

	            return false;
	        },

	        parsingFlags : function () {
	            return extend({}, this._pf);
	        },

	        invalidAt: function () {
	            return this._pf.overflow;
	        },

	        utc : function (keepLocalTime) {
	            return this.utcOffset(0, keepLocalTime);
	        },

	        local : function (keepLocalTime) {
	            if (this._isUTC) {
	                this.utcOffset(0, keepLocalTime);
	                this._isUTC = false;

	                if (keepLocalTime) {
	                    this.subtract(this._dateUtcOffset(), 'm');
	                }
	            }
	            return this;
	        },

	        format : function (inputString) {
	            var output = formatMoment(this, inputString || moment.defaultFormat);
	            return this.localeData().postformat(output);
	        },

	        add : createAdder(1, 'add'),

	        subtract : createAdder(-1, 'subtract'),

	        diff : function (input, units, asFloat) {
	            var that = makeAs(input, this),
	                zoneDiff = (that.utcOffset() - this.utcOffset()) * 6e4,
	                anchor, diff, output, daysAdjust;

	            units = normalizeUnits(units);

	            if (units === 'year' || units === 'month' || units === 'quarter') {
	                output = monthDiff(this, that);
	                if (units === 'quarter') {
	                    output = output / 3;
	                } else if (units === 'year') {
	                    output = output / 12;
	                }
	            } else {
	                diff = this - that;
	                output = units === 'second' ? diff / 1e3 : // 1000
	                    units === 'minute' ? diff / 6e4 : // 1000 * 60
	                    units === 'hour' ? diff / 36e5 : // 1000 * 60 * 60
	                    units === 'day' ? (diff - zoneDiff) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
	                    units === 'week' ? (diff - zoneDiff) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
	                    diff;
	            }
	            return asFloat ? output : absRound(output);
	        },

	        from : function (time, withoutSuffix) {
	            return moment.duration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);
	        },

	        fromNow : function (withoutSuffix) {
	            return this.from(moment(), withoutSuffix);
	        },

	        calendar : function (time) {
	            // We want to compare the start of today, vs this.
	            // Getting start-of-today depends on whether we're locat/utc/offset
	            // or not.
	            var now = time || moment(),
	                sod = makeAs(now, this).startOf('day'),
	                diff = this.diff(sod, 'days', true),
	                format = diff < -6 ? 'sameElse' :
	                    diff < -1 ? 'lastWeek' :
	                    diff < 0 ? 'lastDay' :
	                    diff < 1 ? 'sameDay' :
	                    diff < 2 ? 'nextDay' :
	                    diff < 7 ? 'nextWeek' : 'sameElse';
	            return this.format(this.localeData().calendar(format, this, moment(now)));
	        },

	        isLeapYear : function () {
	            return isLeapYear(this.year());
	        },

	        isDST : function () {
	            return (this.utcOffset() > this.clone().month(0).utcOffset() ||
	                this.utcOffset() > this.clone().month(5).utcOffset());
	        },

	        day : function (input) {
	            var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
	            if (input != null) {
	                input = parseWeekday(input, this.localeData());
	                return this.add(input - day, 'd');
	            } else {
	                return day;
	            }
	        },

	        month : makeAccessor('Month', true),

	        startOf : function (units) {
	            units = normalizeUnits(units);
	            // the following switch intentionally omits break keywords
	            // to utilize falling through the cases.
	            switch (units) {
	            case 'year':
	                this.month(0);
	                /* falls through */
	            case 'quarter':
	            case 'month':
	                this.date(1);
	                /* falls through */
	            case 'week':
	            case 'isoWeek':
	            case 'day':
	                this.hours(0);
	                /* falls through */
	            case 'hour':
	                this.minutes(0);
	                /* falls through */
	            case 'minute':
	                this.seconds(0);
	                /* falls through */
	            case 'second':
	                this.milliseconds(0);
	                /* falls through */
	            }

	            // weeks are a special case
	            if (units === 'week') {
	                this.weekday(0);
	            } else if (units === 'isoWeek') {
	                this.isoWeekday(1);
	            }

	            // quarters are also special
	            if (units === 'quarter') {
	                this.month(Math.floor(this.month() / 3) * 3);
	            }

	            return this;
	        },

	        endOf: function (units) {
	            units = normalizeUnits(units);
	            if (units === undefined || units === 'millisecond') {
	                return this;
	            }
	            return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');
	        },

	        isAfter: function (input, units) {
	            var inputMs;
	            units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
	            if (units === 'millisecond') {
	                input = moment.isMoment(input) ? input : moment(input);
	                return +this > +input;
	            } else {
	                inputMs = moment.isMoment(input) ? +input : +moment(input);
	                return inputMs < +this.clone().startOf(units);
	            }
	        },

	        isBefore: function (input, units) {
	            var inputMs;
	            units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
	            if (units === 'millisecond') {
	                input = moment.isMoment(input) ? input : moment(input);
	                return +this < +input;
	            } else {
	                inputMs = moment.isMoment(input) ? +input : +moment(input);
	                return +this.clone().endOf(units) < inputMs;
	            }
	        },

	        isBetween: function (from, to, units) {
	            return this.isAfter(from, units) && this.isBefore(to, units);
	        },

	        isSame: function (input, units) {
	            var inputMs;
	            units = normalizeUnits(units || 'millisecond');
	            if (units === 'millisecond') {
	                input = moment.isMoment(input) ? input : moment(input);
	                return +this === +input;
	            } else {
	                inputMs = +moment(input);
	                return +(this.clone().startOf(units)) <= inputMs && inputMs <= +(this.clone().endOf(units));
	            }
	        },

	        min: deprecate(
	                 'moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548',
	                 function (other) {
	                     other = moment.apply(null, arguments);
	                     return other < this ? this : other;
	                 }
	         ),

	        max: deprecate(
	                'moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548',
	                function (other) {
	                    other = moment.apply(null, arguments);
	                    return other > this ? this : other;
	                }
	        ),

	        zone : deprecate(
	                'moment().zone is deprecated, use moment().utcOffset instead. ' +
	                'https://github.com/moment/moment/issues/1779',
	                function (input, keepLocalTime) {
	                    if (input != null) {
	                        if (typeof input !== 'string') {
	                            input = -input;
	                        }

	                        this.utcOffset(input, keepLocalTime);

	                        return this;
	                    } else {
	                        return -this.utcOffset();
	                    }
	                }
	        ),

	        // keepLocalTime = true means only change the timezone, without
	        // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
	        // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
	        // +0200, so we adjust the time as needed, to be valid.
	        //
	        // Keeping the time actually adds/subtracts (one hour)
	        // from the actual represented time. That is why we call updateOffset
	        // a second time. In case it wants us to change the offset again
	        // _changeInProgress == true case, then we have to adjust, because
	        // there is no such time in the given timezone.
	        utcOffset : function (input, keepLocalTime) {
	            var offset = this._offset || 0,
	                localAdjust;
	            if (input != null) {
	                if (typeof input === 'string') {
	                    input = utcOffsetFromString(input);
	                }
	                if (Math.abs(input) < 16) {
	                    input = input * 60;
	                }
	                if (!this._isUTC && keepLocalTime) {
	                    localAdjust = this._dateUtcOffset();
	                }
	                this._offset = input;
	                this._isUTC = true;
	                if (localAdjust != null) {
	                    this.add(localAdjust, 'm');
	                }
	                if (offset !== input) {
	                    if (!keepLocalTime || this._changeInProgress) {
	                        addOrSubtractDurationFromMoment(this,
	                                moment.duration(input - offset, 'm'), 1, false);
	                    } else if (!this._changeInProgress) {
	                        this._changeInProgress = true;
	                        moment.updateOffset(this, true);
	                        this._changeInProgress = null;
	                    }
	                }

	                return this;
	            } else {
	                return this._isUTC ? offset : this._dateUtcOffset();
	            }
	        },

	        isLocal : function () {
	            return !this._isUTC;
	        },

	        isUtcOffset : function () {
	            return this._isUTC;
	        },

	        isUtc : function () {
	            return this._isUTC && this._offset === 0;
	        },

	        zoneAbbr : function () {
	            return this._isUTC ? 'UTC' : '';
	        },

	        zoneName : function () {
	            return this._isUTC ? 'Coordinated Universal Time' : '';
	        },

	        parseZone : function () {
	            if (this._tzm) {
	                this.utcOffset(this._tzm);
	            } else if (typeof this._i === 'string') {
	                this.utcOffset(utcOffsetFromString(this._i));
	            }
	            return this;
	        },

	        hasAlignedHourOffset : function (input) {
	            if (!input) {
	                input = 0;
	            }
	            else {
	                input = moment(input).utcOffset();
	            }

	            return (this.utcOffset() - input) % 60 === 0;
	        },

	        daysInMonth : function () {
	            return daysInMonth(this.year(), this.month());
	        },

	        dayOfYear : function (input) {
	            var dayOfYear = round((moment(this).startOf('day') - moment(this).startOf('year')) / 864e5) + 1;
	            return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
	        },

	        quarter : function (input) {
	            return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
	        },

	        weekYear : function (input) {
	            var year = weekOfYear(this, this.localeData()._week.dow, this.localeData()._week.doy).year;
	            return input == null ? year : this.add((input - year), 'y');
	        },

	        isoWeekYear : function (input) {
	            var year = weekOfYear(this, 1, 4).year;
	            return input == null ? year : this.add((input - year), 'y');
	        },

	        week : function (input) {
	            var week = this.localeData().week(this);
	            return input == null ? week : this.add((input - week) * 7, 'd');
	        },

	        isoWeek : function (input) {
	            var week = weekOfYear(this, 1, 4).week;
	            return input == null ? week : this.add((input - week) * 7, 'd');
	        },

	        weekday : function (input) {
	            var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
	            return input == null ? weekday : this.add(input - weekday, 'd');
	        },

	        isoWeekday : function (input) {
	            // behaves the same as moment#day except
	            // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
	            // as a setter, sunday should belong to the previous week.
	            return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
	        },

	        isoWeeksInYear : function () {
	            return weeksInYear(this.year(), 1, 4);
	        },

	        weeksInYear : function () {
	            var weekInfo = this.localeData()._week;
	            return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
	        },

	        get : function (units) {
	            units = normalizeUnits(units);
	            return this[units]();
	        },

	        set : function (units, value) {
	            var unit;
	            if (typeof units === 'object') {
	                for (unit in units) {
	                    this.set(unit, units[unit]);
	                }
	            }
	            else {
	                units = normalizeUnits(units);
	                if (typeof this[units] === 'function') {
	                    this[units](value);
	                }
	            }
	            return this;
	        },

	        // If passed a locale key, it will set the locale for this
	        // instance.  Otherwise, it will return the locale configuration
	        // variables for this instance.
	        locale : function (key) {
	            var newLocaleData;

	            if (key === undefined) {
	                return this._locale._abbr;
	            } else {
	                newLocaleData = moment.localeData(key);
	                if (newLocaleData != null) {
	                    this._locale = newLocaleData;
	                }
	                return this;
	            }
	        },

	        lang : deprecate(
	            'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
	            function (key) {
	                if (key === undefined) {
	                    return this.localeData();
	                } else {
	                    return this.locale(key);
	                }
	            }
	        ),

	        localeData : function () {
	            return this._locale;
	        },

	        _dateUtcOffset : function () {
	            // On Firefox.24 Date#getTimezoneOffset returns a floating point.
	            // https://github.com/moment/moment/pull/1871
	            return -Math.round(this._d.getTimezoneOffset() / 15) * 15;
	        }

	    });

	    function rawMonthSetter(mom, value) {
	        var dayOfMonth;

	        // TODO: Move this out of here!
	        if (typeof value === 'string') {
	            value = mom.localeData().monthsParse(value);
	            // TODO: Another silent failure?
	            if (typeof value !== 'number') {
	                return mom;
	            }
	        }

	        dayOfMonth = Math.min(mom.date(),
	                daysInMonth(mom.year(), value));
	        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
	        return mom;
	    }

	    function rawGetter(mom, unit) {
	        return mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]();
	    }

	    function rawSetter(mom, unit, value) {
	        if (unit === 'Month') {
	            return rawMonthSetter(mom, value);
	        } else {
	            return mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
	        }
	    }

	    function makeAccessor(unit, keepTime) {
	        return function (value) {
	            if (value != null) {
	                rawSetter(this, unit, value);
	                moment.updateOffset(this, keepTime);
	                return this;
	            } else {
	                return rawGetter(this, unit);
	            }
	        };
	    }

	    moment.fn.millisecond = moment.fn.milliseconds = makeAccessor('Milliseconds', false);
	    moment.fn.second = moment.fn.seconds = makeAccessor('Seconds', false);
	    moment.fn.minute = moment.fn.minutes = makeAccessor('Minutes', false);
	    // Setting the hour should keep the time, because the user explicitly
	    // specified which hour he wants. So trying to maintain the same hour (in
	    // a new timezone) makes sense. Adding/subtracting hours does not follow
	    // this rule.
	    moment.fn.hour = moment.fn.hours = makeAccessor('Hours', true);
	    // moment.fn.month is defined separately
	    moment.fn.date = makeAccessor('Date', true);
	    moment.fn.dates = deprecate('dates accessor is deprecated. Use date instead.', makeAccessor('Date', true));
	    moment.fn.year = makeAccessor('FullYear', true);
	    moment.fn.years = deprecate('years accessor is deprecated. Use year instead.', makeAccessor('FullYear', true));

	    // add plural methods
	    moment.fn.days = moment.fn.day;
	    moment.fn.months = moment.fn.month;
	    moment.fn.weeks = moment.fn.week;
	    moment.fn.isoWeeks = moment.fn.isoWeek;
	    moment.fn.quarters = moment.fn.quarter;

	    // add aliased format methods
	    moment.fn.toJSON = moment.fn.toISOString;

	    // alias isUtc for dev-friendliness
	    moment.fn.isUTC = moment.fn.isUtc;

	    /************************************
	        Duration Prototype
	    ************************************/


	    function daysToYears (days) {
	        // 400 years have 146097 days (taking into account leap year rules)
	        return days * 400 / 146097;
	    }

	    function yearsToDays (years) {
	        // years * 365 + absRound(years / 4) -
	        //     absRound(years / 100) + absRound(years / 400);
	        return years * 146097 / 400;
	    }

	    extend(moment.duration.fn = Duration.prototype, {

	        _bubble : function () {
	            var milliseconds = this._milliseconds,
	                days = this._days,
	                months = this._months,
	                data = this._data,
	                seconds, minutes, hours, years = 0;

	            // The following code bubbles up values, see the tests for
	            // examples of what that means.
	            data.milliseconds = milliseconds % 1000;

	            seconds = absRound(milliseconds / 1000);
	            data.seconds = seconds % 60;

	            minutes = absRound(seconds / 60);
	            data.minutes = minutes % 60;

	            hours = absRound(minutes / 60);
	            data.hours = hours % 24;

	            days += absRound(hours / 24);

	            // Accurately convert days to years, assume start from year 0.
	            years = absRound(daysToYears(days));
	            days -= absRound(yearsToDays(years));

	            // 30 days to a month
	            // TODO (iskren): Use anchor date (like 1st Jan) to compute this.
	            months += absRound(days / 30);
	            days %= 30;

	            // 12 months -> 1 year
	            years += absRound(months / 12);
	            months %= 12;

	            data.days = days;
	            data.months = months;
	            data.years = years;
	        },

	        abs : function () {
	            this._milliseconds = Math.abs(this._milliseconds);
	            this._days = Math.abs(this._days);
	            this._months = Math.abs(this._months);

	            this._data.milliseconds = Math.abs(this._data.milliseconds);
	            this._data.seconds = Math.abs(this._data.seconds);
	            this._data.minutes = Math.abs(this._data.minutes);
	            this._data.hours = Math.abs(this._data.hours);
	            this._data.months = Math.abs(this._data.months);
	            this._data.years = Math.abs(this._data.years);

	            return this;
	        },

	        weeks : function () {
	            return absRound(this.days() / 7);
	        },

	        valueOf : function () {
	            return this._milliseconds +
	              this._days * 864e5 +
	              (this._months % 12) * 2592e6 +
	              toInt(this._months / 12) * 31536e6;
	        },

	        humanize : function (withSuffix) {
	            var output = relativeTime(this, !withSuffix, this.localeData());

	            if (withSuffix) {
	                output = this.localeData().pastFuture(+this, output);
	            }

	            return this.localeData().postformat(output);
	        },

	        add : function (input, val) {
	            // supports only 2.0-style add(1, 's') or add(moment)
	            var dur = moment.duration(input, val);

	            this._milliseconds += dur._milliseconds;
	            this._days += dur._days;
	            this._months += dur._months;

	            this._bubble();

	            return this;
	        },

	        subtract : function (input, val) {
	            var dur = moment.duration(input, val);

	            this._milliseconds -= dur._milliseconds;
	            this._days -= dur._days;
	            this._months -= dur._months;

	            this._bubble();

	            return this;
	        },

	        get : function (units) {
	            units = normalizeUnits(units);
	            return this[units.toLowerCase() + 's']();
	        },

	        as : function (units) {
	            var days, months;
	            units = normalizeUnits(units);

	            if (units === 'month' || units === 'year') {
	                days = this._days + this._milliseconds / 864e5;
	                months = this._months + daysToYears(days) * 12;
	                return units === 'month' ? months : months / 12;
	            } else {
	                // handle milliseconds separately because of floating point math errors (issue #1867)
	                days = this._days + Math.round(yearsToDays(this._months / 12));
	                switch (units) {
	                    case 'week': return days / 7 + this._milliseconds / 6048e5;
	                    case 'day': return days + this._milliseconds / 864e5;
	                    case 'hour': return days * 24 + this._milliseconds / 36e5;
	                    case 'minute': return days * 24 * 60 + this._milliseconds / 6e4;
	                    case 'second': return days * 24 * 60 * 60 + this._milliseconds / 1000;
	                    // Math.floor prevents floating point math errors here
	                    case 'millisecond': return Math.floor(days * 24 * 60 * 60 * 1000) + this._milliseconds;
	                    default: throw new Error('Unknown unit ' + units);
	                }
	            }
	        },

	        lang : moment.fn.lang,
	        locale : moment.fn.locale,

	        toIsoString : deprecate(
	            'toIsoString() is deprecated. Please use toISOString() instead ' +
	            '(notice the capitals)',
	            function () {
	                return this.toISOString();
	            }
	        ),

	        toISOString : function () {
	            // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
	            var years = Math.abs(this.years()),
	                months = Math.abs(this.months()),
	                days = Math.abs(this.days()),
	                hours = Math.abs(this.hours()),
	                minutes = Math.abs(this.minutes()),
	                seconds = Math.abs(this.seconds() + this.milliseconds() / 1000);

	            if (!this.asSeconds()) {
	                // this is the same as C#'s (Noda) and python (isodate)...
	                // but not other JS (goog.date)
	                return 'P0D';
	            }

	            return (this.asSeconds() < 0 ? '-' : '') +
	                'P' +
	                (years ? years + 'Y' : '') +
	                (months ? months + 'M' : '') +
	                (days ? days + 'D' : '') +
	                ((hours || minutes || seconds) ? 'T' : '') +
	                (hours ? hours + 'H' : '') +
	                (minutes ? minutes + 'M' : '') +
	                (seconds ? seconds + 'S' : '');
	        },

	        localeData : function () {
	            return this._locale;
	        },

	        toJSON : function () {
	            return this.toISOString();
	        }
	    });

	    moment.duration.fn.toString = moment.duration.fn.toISOString;

	    function makeDurationGetter(name) {
	        moment.duration.fn[name] = function () {
	            return this._data[name];
	        };
	    }

	    for (i in unitMillisecondFactors) {
	        if (hasOwnProp(unitMillisecondFactors, i)) {
	            makeDurationGetter(i.toLowerCase());
	        }
	    }

	    moment.duration.fn.asMilliseconds = function () {
	        return this.as('ms');
	    };
	    moment.duration.fn.asSeconds = function () {
	        return this.as('s');
	    };
	    moment.duration.fn.asMinutes = function () {
	        return this.as('m');
	    };
	    moment.duration.fn.asHours = function () {
	        return this.as('h');
	    };
	    moment.duration.fn.asDays = function () {
	        return this.as('d');
	    };
	    moment.duration.fn.asWeeks = function () {
	        return this.as('weeks');
	    };
	    moment.duration.fn.asMonths = function () {
	        return this.as('M');
	    };
	    moment.duration.fn.asYears = function () {
	        return this.as('y');
	    };

	    /************************************
	        Default Locale
	    ************************************/


	    // Set default locale, other locale will inherit from English.
	    moment.locale('en', {
	        ordinalParse: /\d{1,2}(th|st|nd|rd)/,
	        ordinal : function (number) {
	            var b = number % 10,
	                output = (toInt(number % 100 / 10) === 1) ? 'th' :
	                (b === 1) ? 'st' :
	                (b === 2) ? 'nd' :
	                (b === 3) ? 'rd' : 'th';
	            return number + output;
	        }
	    });

	    /* EMBED_LOCALES */

	    /************************************
	        Exposing Moment
	    ************************************/

	    function makeGlobal(shouldDeprecate) {
	        /*global ender:false */
	        if (typeof ender !== 'undefined') {
	            return;
	        }
	        oldGlobalMoment = globalScope.moment;
	        if (shouldDeprecate) {
	            globalScope.moment = deprecate(
	                    'Accessing Moment through the global scope is ' +
	                    'deprecated, and will be removed in an upcoming ' +
	                    'release.',
	                    moment);
	        } else {
	            globalScope.moment = moment;
	        }
	    }

	    // CommonJS module is defined
	    if (hasModule) {
	        module.exports = moment;
	    } else if (true) {
	        !(__WEBPACK_AMD_DEFINE_RESULT__ = function (require, exports, module) {
	            if (module.config && module.config() && module.config().noGlobal === true) {
	                // release the global variable
	                globalScope.moment = oldGlobalMoment;
	            }

	            return moment;
	        }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	        makeGlobal(true);
	    } else {
	        makeGlobal();
	    }
	}).call(this);

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(107)(module)))

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(1);
	var moment = __webpack_require__(9);
	var Widget = __webpack_require__(2);

	var current_date = moment();
	current_date = moment([current_date.year(), current_date.month(), current_date.date()]);

	var BaseColumn = Widget.extend({
	  attrs: {
	    focus: {
	      value: '',
	      getter: function(val) {
	        if (val) {
	          return val;
	        }
	        return current_date;
	      },
	      setter: function(val) {
	        if (!val) {
	          return current_date;
	        }
	        if (moment.isMoment(val)) {
	          return val;
	        }
	        return moment(val, this.get('format'));
	      }
	    },
	    template: null,
	    format: 'YYYY-MM-DD',
	    range: {
	      value: '',
	      getter: function(val) {
	        if (!val) {
	          return null;
	        }
	        if ($.isArray(val)) {
	          var start = val[0];
	          if (start && start.length > 4) {
	            start = moment(start, this.get('format'));
	          }
	          var end = val[1];
	          if (end && end.length > 4) {
	            end = moment(end, this.get('format'));
	          }
	          return [start, end];
	        }
	        return val;
	      }
	    },
	    lang: {}
	  },

	  compileTemplate: function() {
	    // the template is a runtime handlebars function
	    var fn = this.get('template');
	    if (!fn) {
	      return '';
	    }
	    var model = this.get('model');

	    var self = this;
	    var lang = this.get('lang') || {};

	    return fn(model, {
	      helpers: {
	        '_': function(key) {
	          return lang[key] || key;
	        }
	      }
	    });
	  },

	  parseElement: function() {
	    // rewrite parseElement of widget
	    this.element = $(this.compileTemplate());
	  },

	  show: function() {
	    this.render();
	    this.focus();
	  },

	  hide: function() {
	    this.element.hide();
	  },

	  refresh: function() {
	    this.element.html($(this.compileTemplate()).html());
	  }

	});

	module.exports = BaseColumn;

	BaseColumn.isInRange = function(date, range) {
	  if (range == null) {
	    return true;
	  }
	  if ($.isArray(range)) {
	    var start = range[0];
	    var end = range[1];
	    var result = true;
	    if (start) {
	      result = result && date >= start;
	    }
	    if (end) {
	      result = result && date <= end;
	    }
	    return result;
	  }
	  if ($.isFunction(range)) {
	    return range(date);
	  }
	  return true;
	};


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(1);
	var Handlebars = __webpack_require__(91)['default'];

	var compiledTemplates = {};

	// 提供 Template 模板支持，默认引擎是 Handlebars
	module.exports = {

	  // Handlebars 的 helpers
	  templateHelpers: null,

	  // Handlebars 的 partials
	  templatePartials: null,

	  // template 对应的 DOM-like object
	  templateObject: null,

	  // 根据配置的模板和传入的数据，构建 this.element 和 templateElement
	  parseElementFromTemplate: function () {
	    // template 支持 id 选择器
	    var t, template = this.get('template');
	    if (/^#/.test(template) && (t = document.getElementById(template.substring(1)))) {
	      template = t.innerHTML;
	      this.set('template', template);
	    }
	    this.templateObject = convertTemplateToObject(template);
	    this.element = $(this.compile());
	  },

	  // 编译模板，混入数据，返回 html 结果
	  compile: function (template, model) {
	    template || (template = this.get('template'));

	    model || (model = this.get('model')) || (model = {});
	    if (model.toJSON) {
	      model = model.toJSON();
	    }

	    // handlebars runtime，注意 partials 也需要预编译
	    if (isFunction(template)) {
	      return template(model, {
	        helpers: this.templateHelpers,
	        partials: precompile(this.templatePartials)
	      });
	    } else {
	      var helpers = this.templateHelpers;
	      var partials = this.templatePartials;
	      var helper, partial;

	      // 注册 helpers
	      if (helpers) {
	        for (helper in helpers) {
	          if (helpers.hasOwnProperty(helper)) {
	            Handlebars.registerHelper(helper, helpers[helper]);
	          }
	        }
	      }
	      // 注册 partials
	      if (partials) {
	        for (partial in partials) {
	          if (partials.hasOwnProperty(partial)) {
	            Handlebars.registerPartial(partial, partials[partial]);
	          }
	        }
	      }

	      var compiledTemplate = compiledTemplates[template];
	      if (!compiledTemplate) {
	        compiledTemplate = compiledTemplates[template] = Handlebars.compile(template);
	      }

	      // 生成 html
	      var html = compiledTemplate(model);

	      // 卸载 helpers
	      if (helpers) {
	        for (helper in helpers) {
	          if (helpers.hasOwnProperty(helper)) {
	            delete Handlebars.helpers[helper];
	          }
	        }
	      }
	      // 卸载 partials
	      if (partials) {
	        for (partial in partials) {
	          if (partials.hasOwnProperty(partial)) {
	            delete Handlebars.partials[partial];
	          }
	        }
	      }
	      return html;
	    }
	  },

	  // 刷新 selector 指定的局部区域
	  renderPartial: function (selector) {
	    if (this.templateObject) {
	      var template = convertObjectToTemplate(this.templateObject, selector);

	      if (template) {
	        if (selector) {
	          this.$(selector).html(this.compile(template));
	        } else {
	          this.element.html(this.compile(template));
	        }
	      } else {
	        this.element.html(this.compile());
	      }
	    }

	    // 如果 template 已经编译过了，templateObject 不存在
	    else {
	      var all = $(this.compile());
	      var selected = all.find(selector);
	      if (selected.length) {
	        this.$(selector).html(selected.html());
	      } else {
	        this.element.html(all.html());
	      }
	    }

	    return this;
	  }
	};


	// Helpers
	// -------
	var _compile = Handlebars.compile;

	Handlebars.compile = function (template) {
	  return isFunction(template) ? template : _compile.call(Handlebars, template);
	};

	// 将 template 字符串转换成对应的 DOM-like object


	function convertTemplateToObject(template) {
	  return isFunction(template) ? null : $(encode(template));
	}

	// 根据 selector 得到 DOM-like template object，并转换为 template 字符串


	function convertObjectToTemplate(templateObject, selector) {
	  if (!templateObject) return;

	  var element;
	  if (selector) {
	    element = templateObject.find(selector);
	    if (element.length === 0) {
	      throw new Error('Invalid template selector: ' + selector);
	    }
	  } else {
	    element = templateObject;
	  }
	  return decode(element.html());
	}

	function encode(template) {
	  return template
	  // 替换 {{xxx}} 为 <!-- {{xxx}} -->
	  .replace(/({[^}]+}})/g, '<!--$1-->')
	  // 替换 src="{{xxx}}" 为 data-TEMPLATABLE-src="{{xxx}}"
	  .replace(/\s(src|href)\s*=\s*(['"])(.*?\{.+?)\2/g, ' data-templatable-$1=$2$3$2');
	}

	function decode(template) {
	  return template.replace(/(?:<|&lt;)!--({{[^}]+}})--(?:>|&gt;)/g, '$1').replace(/data-templatable-/ig, '');
	}

	function isFunction(obj) {
	  return typeof obj === "function";
	}

	function precompile(partials) {
	  if (!partials) return {};

	  var result = {};
	  for (var name in partials) {
	    var partial = partials[name];
	    result[name] = isFunction(partial) ? partial : Handlebars.compile(partial);
	  }
	  return result;
	};

	// 调用 renderPartial 时，Templatable 对模板有一个约束：
	// ** template 自身必须是有效的 html 代码片段**，比如
	//   1. 代码闭合
	//   2. 嵌套符合规范
	//
	// 总之，要保证在 template 里，将 `{{...}}` 转换成注释后，直接 innerHTML 插入到
	// DOM 中，浏览器不会自动增加一些东西。比如：
	//
	// tbody 里没有 tr：
	//  `<table><tbody>{{#each items}}<td>{{this}}</td>{{/each}}</tbody></table>`
	//
	// 标签不闭合：
	//  `<div><span>{{name}}</div>`


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	// Position
	// --------
	// 定位工具组件，将一个 DOM 节点相对对另一个 DOM 节点进行定位操作。
	// 代码易改，人生难得

	var Position = exports,
	    VIEWPORT = { _id: 'VIEWPORT', nodeType: 1 },
	    $ = __webpack_require__(1),
	    isPinFixed = false,
	    ua = (window.navigator.userAgent || "").toLowerCase(),
	    isIE6 = ua.indexOf("msie 6") !== -1;


	// 将目标元素相对于基准元素进行定位
	// 这是 Position 的基础方法，接收两个参数，分别描述了目标元素和基准元素的定位点
	Position.pin = function(pinObject, baseObject) {

	    // 将两个参数转换成标准定位对象 { element: a, x: 0, y: 0 }
	    pinObject = normalize(pinObject);
	    baseObject = normalize(baseObject);

	    // if pinObject.element is not present
	    // https://github.com/aralejs/position/pull/11
	    if (pinObject.element === VIEWPORT ||
	        pinObject.element._id === 'VIEWPORT') {
	        return;
	    }

	    // 设定目标元素的 position 为绝对定位
	    // 若元素的初始 position 不为 absolute，会影响元素的 display、宽高等属性
	    var pinElement = $(pinObject.element);

	    if (pinElement.css('position') !== 'fixed' || isIE6) {
	        pinElement.css('position', 'absolute');
	        isPinFixed = false;
	    }
	    else {
	        // 定位 fixed 元素的标志位，下面有特殊处理
	        isPinFixed = true;
	    }

	    // 将位置属性归一化为数值
	    // 注：必须放在上面这句 `css('position', 'absolute')` 之后，
	    //    否则获取的宽高有可能不对
	    posConverter(pinObject);
	    posConverter(baseObject);

	    var parentOffset = getParentOffset(pinElement);
	    var baseOffset = baseObject.offset();

	    // 计算目标元素的位置
	    var top = baseOffset.top + baseObject.y -
	            pinObject.y - parentOffset.top;

	    var left = baseOffset.left + baseObject.x -
	            pinObject.x - parentOffset.left;

	    // 定位目标元素
	    pinElement.css({ left: left, top: top });
	};


	// 将目标元素相对于基准元素进行居中定位
	// 接受两个参数，分别为目标元素和定位的基准元素，都是 DOM 节点类型
	Position.center = function(pinElement, baseElement) {
	    Position.pin({
	        element: pinElement,
	        x: '50%',
	        y: '50%'
	    }, {
	        element: baseElement,
	        x: '50%',
	        y: '50%'
	    });
	};


	// 这是当前可视区域的伪 DOM 节点
	// 需要相对于当前可视区域定位时，可传入此对象作为 element 参数
	Position.VIEWPORT = VIEWPORT;


	// Helpers
	// -------

	// 将参数包装成标准的定位对象，形似 { element: a, x: 0, y: 0 }
	function normalize(posObject) {
	    posObject = toElement(posObject) || {};

	    if (posObject.nodeType) {
	        posObject = { element: posObject };
	    }

	    var element = toElement(posObject.element) || VIEWPORT;
	    if (element.nodeType !== 1) {
	        throw new Error('posObject.element is invalid.');
	    }

	    var result = {
	        element: element,
	        x: posObject.x || 0,
	        y: posObject.y || 0
	    };

	    // config 的深度克隆会替换掉 Position.VIEWPORT, 导致直接比较为 false
	    var isVIEWPORT = (element === VIEWPORT || element._id === 'VIEWPORT');

	    // 归一化 offset
	    result.offset = function() {
	        // 若定位 fixed 元素，则父元素的 offset 没有意义
	        if (isPinFixed) {
	            return {
	                left: 0,
	                top: 0
	            };
	        }
	        else if (isVIEWPORT) {
	            return {
	                left: $(document).scrollLeft(),
	                top: $(document).scrollTop()
	            };
	        }
	        else {
	            return getOffset($(element)[0]);
	        }
	    };

	    // 归一化 size, 含 padding 和 border
	    result.size = function() {
	        var el = isVIEWPORT ? $(window) : $(element);
	        return {
	            width: el.outerWidth(),
	            height: el.outerHeight()
	        };
	    };

	    return result;
	}

	// 对 x, y 两个参数为 left|center|right|%|px 时的处理，全部处理为纯数字
	function posConverter(pinObject) {
	    pinObject.x = xyConverter(pinObject.x, pinObject, 'width');
	    pinObject.y = xyConverter(pinObject.y, pinObject, 'height');
	}

	// 处理 x, y 值，都转化为数字
	function xyConverter(x, pinObject, type) {
	    // 先转成字符串再说！好处理
	    x = x + '';

	    // 处理 px
	    x = x.replace(/px/gi, '');

	    // 处理 alias
	    if (/\D/.test(x)) {
	        x = x.replace(/(?:top|left)/gi, '0%')
	             .replace(/center/gi, '50%')
	             .replace(/(?:bottom|right)/gi, '100%');
	    }

	    // 将百分比转为像素值
	    if (x.indexOf('%') !== -1) {
	        //支持小数
	        x = x.replace(/(\d+(?:\.\d+)?)%/gi, function(m, d) {
	            return pinObject.size()[type] * (d / 100.0);
	        });
	    }

	    // 处理类似 100%+20px 的情况
	    if (/[+\-*\/]/.test(x)) {
	        try {
	            // eval 会影响压缩
	            // new Function 方法效率高于 for 循环拆字符串的方法
	            // 参照：http://jsperf.com/eval-newfunction-for
	            x = (new Function('return ' + x))();
	        } catch (e) {
	            throw new Error('Invalid position value: ' + x);
	        }
	    }

	    // 转回为数字
	    return numberize(x);
	}

	// 获取 offsetParent 的位置
	function getParentOffset(element) {
	    var parent = element.offsetParent();

	    // IE7 下，body 子节点的 offsetParent 为 html 元素，其 offset 为
	    // { top: 2, left: 2 }，会导致定位差 2 像素，所以这里将 parent
	    // 转为 document.body
	    if (parent[0] === document.documentElement) {
	        parent = $(document.body);
	    }

	    // 修正 ie6 下 absolute 定位不准的 bug
	    if (isIE6) {
	        parent.css('zoom', 1);
	    }

	    // 获取 offsetParent 的 offset
	    var offset;

	    // 当 offsetParent 为 body，
	    // 而且 body 的 position 是 static 时
	    // 元素并不按照 body 来定位，而是按 document 定位
	    // http://jsfiddle.net/afc163/hN9Tc/2/
	    // 因此这里的偏移值直接设为 0 0
	    if (parent[0] === document.body &&
	        parent.css('position') === 'static') {
	            offset = { top:0, left: 0 };
	    } else {
	        offset = getOffset(parent[0]);
	    }

	    // 根据基准元素 offsetParent 的 border 宽度，来修正 offsetParent 的基准位置
	    offset.top += numberize(parent.css('border-top-width'));
	    offset.left += numberize(parent.css('border-left-width'));

	    return offset;
	}

	function numberize(s) {
	    return parseFloat(s, 10) || 0;
	}

	function toElement(element) {
	    return $(element)[0];
	}

	// fix jQuery 1.7.2 offset
	// document.body 的 position 是 absolute 或 relative 时
	// jQuery.offset 方法无法正确获取 body 的偏移值
	//   -> http://jsfiddle.net/afc163/gMAcp/
	// jQuery 1.9.1 已经修正了这个问题
	//   -> http://jsfiddle.net/afc163/gMAcp/1/
	// 这里先实现一份
	// 参照 kissy 和 jquery 1.9.1
	//   -> https://github.com/kissyteam/kissy/blob/master/src/dom/sub-modules/base/src/base/offset.js#L366
	//   -> https://github.com/jquery/jquery/blob/1.9.1/src/offset.js#L28
	function getOffset(element) {
	    var box = element.getBoundingClientRect(),
	        docElem = document.documentElement;

	    // < ie8 不支持 win.pageXOffset, 则使用 docElem.scrollLeft
	    return {
	        left: box.left + (window.pageXOffset || docElem.scrollLeft) -
	              (docElem.clientLeft || document.body.clientLeft  || 0),
	        top: box.top  + (window.pageYOffset || docElem.scrollTop) -
	             (docElem.clientTop || document.body.clientTop  || 0)
	    };
	}


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	// Create a simple path alias to allow browserify to resolve
	// the runtime on a supported path.
	module.exports = __webpack_require__(104);


/***/ },
/* 14 */
/***/ function(module, exports) {

	// Events
	// -----------------
	// Thanks to:
	//  - https://github.com/documentcloud/backbone/blob/master/backbone.js
	//  - https://github.com/joyent/node/blob/master/lib/events.js


	// Regular expression used to split event strings
	var eventSplitter = /\s+/


	// A module that can be mixed in to *any object* in order to provide it
	// with custom events. You may bind with `on` or remove with `off` callback
	// functions to an event; `trigger`-ing an event fires all callbacks in
	// succession.
	//
	//     var object = new Events();
	//     object.on('expand', function(){ alert('expanded'); });
	//     object.trigger('expand');
	//
	function Events() {
	}


	// Bind one or more space separated events, `events`, to a `callback`
	// function. Passing `"all"` will bind the callback to all events fired.
	Events.prototype.on = function(events, callback, context) {
	  var cache, event, list
	  if (!callback) return this

	  cache = this.__events || (this.__events = {})
	  events = events.split(eventSplitter)

	  while (event = events.shift()) {
	    list = cache[event] || (cache[event] = [])
	    list.push(callback, context)
	  }

	  return this
	}

	Events.prototype.once = function(events, callback, context) {
	  var that = this
	  var cb = function() {
	    that.off(events, cb)
	    callback.apply(context || that, arguments)
	  }
	  return this.on(events, cb, context)
	}

	// Remove one or many callbacks. If `context` is null, removes all callbacks
	// with that function. If `callback` is null, removes all callbacks for the
	// event. If `events` is null, removes all bound callbacks for all events.
	Events.prototype.off = function(events, callback, context) {
	  var cache, event, list, i

	  // No events, or removing *all* events.
	  if (!(cache = this.__events)) return this
	  if (!(events || callback || context)) {
	    delete this.__events
	    return this
	  }

	  events = events ? events.split(eventSplitter) : keys(cache)

	  // Loop through the callback list, splicing where appropriate.
	  while (event = events.shift()) {
	    list = cache[event]
	    if (!list) continue

	    if (!(callback || context)) {
	      delete cache[event]
	      continue
	    }

	    for (i = list.length - 2; i >= 0; i -= 2) {
	      if (!(callback && list[i] !== callback ||
	          context && list[i + 1] !== context)) {
	        list.splice(i, 2)
	      }
	    }
	  }

	  return this
	}


	// Trigger one or many events, firing all bound callbacks. Callbacks are
	// passed the same arguments as `trigger` is, apart from the event name
	// (unless you're listening on `"all"`, which will cause your callback to
	// receive the true name of the event as the first argument).
	Events.prototype.trigger = function(events) {
	  var cache, event, all, list, i, len, rest = [], args, returned = true;
	  if (!(cache = this.__events)) return this

	  events = events.split(eventSplitter)

	  // Fill up `rest` with the callback arguments.  Since we're only copying
	  // the tail of `arguments`, a loop is much faster than Array#slice.
	  for (i = 1, len = arguments.length; i < len; i++) {
	    rest[i - 1] = arguments[i]
	  }

	  // For each event, walk through the list of callbacks twice, first to
	  // trigger the event, then to trigger any `"all"` callbacks.
	  while (event = events.shift()) {
	    // Copy callback lists to prevent modification.
	    if (all = cache.all) all = all.slice()
	    if (list = cache[event]) list = list.slice()

	    // Execute event callbacks except one named "all"
	    if (event !== 'all') {
	      returned = triggerEvents(list, rest, this) && returned
	    }

	    // Execute "all" callbacks.
	    returned = triggerEvents(all, [event].concat(rest), this) && returned
	  }

	  return returned
	}

	Events.prototype.emit = Events.prototype.trigger


	// Helpers
	// -------

	var keys = Object.keys

	if (!keys) {
	  keys = function(o) {
	    var result = []

	    for (var name in o) {
	      if (o.hasOwnProperty(name)) {
	        result.push(name)
	      }
	    }
	    return result
	  }
	}

	// Mix `Events` to object instance or Class function.
	Events.mixTo = function(receiver) {
	  receiver = isFunction(receiver) ? receiver.prototype : receiver
	  var proto = Events.prototype

	  var event = new Events
	  for (var key in proto) {
	    if (proto.hasOwnProperty(key)) {
	      copyProto(key)
	    }
	  }

	  function copyProto(key) {
	    receiver[key] = function() {
	      proto[key].apply(event, Array.prototype.slice.call(arguments))
	      return this
	    }
	  }
	}

	// Execute callbacks
	function triggerEvents(list, args, context) {
	  var pass = true

	  if (list) {
	    var i = 0, l = list.length, a1 = args[0], a2 = args[1], a3 = args[2]
	    // call is faster than apply, optimize less than 3 argu
	    // http://blog.csdn.net/zhengyinhui100/article/details/7837127
	    switch (args.length) {
	      case 0: for (; i < l; i += 2) {pass = list[i].call(list[i + 1] || context) !== false && pass} break;
	      case 1: for (; i < l; i += 2) {pass = list[i].call(list[i + 1] || context, a1) !== false && pass} break;
	      case 2: for (; i < l; i += 2) {pass = list[i].call(list[i + 1] || context, a1, a2) !== false && pass} break;
	      case 3: for (; i < l; i += 2) {pass = list[i].call(list[i + 1] || context, a1, a2, a3) !== false && pass} break;
	      default: for (; i < l; i += 2) {pass = list[i].apply(list[i + 1] || context, args) !== false && pass} break;
	    }
	  }
	  // trigger will return false if one of the callbacks return false
	  return pass;
	}

	function isFunction(func) {
	  return Object.prototype.toString.call(func) === '[object Function]'
	}

	module.exports = Events


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(1);
	var Position = __webpack_require__(12);

	var isIE6 = (window.navigator.userAgent || '').toLowerCase().indexOf('msie 6') !== -1;

	// target 是需要添加垫片的目标元素，可以传 `DOM Element` 或 `Selector`
	function Shim(target) {
	    // 如果选择器选了多个 DOM，则只取第一个
	    this.target = $(target).eq(0);
	}

	// 根据目标元素计算 iframe 的显隐、宽高、定位
	Shim.prototype.sync = function() {
	    var target = this.target;
	    var iframe = this.iframe;

	    // 如果未传 target 则不处理
	    if (!target.length) return this;

	    var height = target.outerHeight();
	    var width = target.outerWidth();

	    // 如果目标元素隐藏，则 iframe 也隐藏
	    // jquery 判断宽高同时为 0 才算隐藏，这里判断宽高其中一个为 0 就隐藏
	    // http://api.jquery.com/hidden-selector/
	    if (!height || !width || target.is(':hidden')) {
	        iframe && iframe.hide();
	    } else {
	        // 第一次显示时才创建：as lazy as possible
	        iframe || (iframe = this.iframe = createIframe(target));

	        iframe.css({
	            'height': height,
	            'width': width
	        });

	        Position.pin(iframe[0], target[0]);
	        iframe.show();
	    }

	    return this;
	};

	// 销毁 iframe 等
	Shim.prototype.destroy = function() {
	    if (this.iframe) {
	        this.iframe.remove();
	        delete this.iframe;
	    }
	    delete this.target;
	};

	if (isIE6) {
	    module.exports = Shim;
	} else {
	    // 除了 IE6 都返回空函数
	    function Noop() {}

	    Noop.prototype.sync = function() {return this};
	    Noop.prototype.destroy = Noop;

	    module.exports = Noop;
	}

	// Helpers

	// 在 target 之前创建 iframe，这样就没有 z-index 问题
	// iframe 永远在 target 下方
	function createIframe(target) {
	    var css = {
	        display: 'none',
	        border: 'none',
	        opacity: 0,
	        position: 'absolute'
	    };

	    // 如果 target 存在 zIndex 则设置
	    var zIndex = target.css('zIndex');
	    if (zIndex && zIndex > 0) {
	        css.zIndex = zIndex - 1;
	    }

	    return $('<iframe>', {
	        src: 'javascript:\'\'', // 不加的话，https 下会弹警告
	        frameborder: 0,
	        css: css
	    }).insertBefore(target);
	}


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(1),

	    rules = {},
	    messages = {};

	function Rule(name, oper) {
	    var self = this;

	    self.name = name;

	    if (oper instanceof RegExp) {
	        self.operator = function (opts, commit) {
	            var rslt = oper.test($(opts.element).val());
	            commit(rslt ? null : opts.rule, _getMsg(opts, rslt));
	        };
	    } else if ($.isFunction(oper)) {
	        self.operator = function (opts, commit) {
	            var rslt = oper.call(this, opts, function (result, msg) {
	                commit(result ? null : opts.rule, msg || _getMsg(opts, result));
	            });
	            // 当是异步判断时, 返回 undefined, 则执行上面的 commit
	            if (rslt !== undefined) {
	                commit(rslt ? null : opts.rule, _getMsg(opts, rslt));
	            }
	        };
	    } else {
	        throw new Error('The second argument must be a regexp or a function.');
	    }
	}

	Rule.prototype.and = function (name, options) {
	    var target = name instanceof Rule ? name : getRule(name, options);

	    if (!target) {
	        throw new Error('No rule with name "' + name + '" found.');
	    }

	    var that = this;
	    var operator = function (opts, commit) {
	        that.operator.call(this, opts, function (err, msg) {
	            if (err) {
	                commit(err, _getMsg(opts, !err));
	            } else {
	                target.operator.call(this, opts, commit);
	            }
	        });
	    };

	    return new Rule(null, operator);
	};
	Rule.prototype.or = function (name, options) {
	    var target = name instanceof Rule ? name : getRule(name, options);

	    if (!target) {
	        throw new Error('No rule with name "' + name + '" found.');
	    }

	    var that = this;
	    var operator = function (opts, commit) {
	        that.operator.call(this, opts, function (err, msg) {
	            if (err) {
	                target.operator.call(this, opts, commit);
	            } else {
	                commit(null, _getMsg(opts, true));
	            }
	        });
	    };

	    return new Rule(null, operator);
	};
	Rule.prototype.not = function (options) {
	    var target = getRule(this.name, options);
	    var operator = function (opts, commit) {
	        target.operator.call(this, opts, function (err, msg) {
	            if (err) {
	                commit(null, _getMsg(opts, true));
	            } else {
	                commit(true, _getMsg(opts, false))
	            }
	        });
	    };

	    return new Rule(null, operator);
	};


	function addRule(name, operator, message) {
	    if ($.isPlainObject(name)) {
	        $.each(name, function (i, v) {
	            if ($.isArray(v))
	                addRule(i, v[0], v[1]);
	            else
	                addRule(i, v);
	        });
	        return this;
	    }

	    if (operator instanceof Rule) {
	        rules[name] = new Rule(name, operator.operator);
	    } else {
	        rules[name] = new Rule(name, operator);
	    }
	    setMessage(name, message);

	    return this;
	}

	function _getMsg(opts, b) {
	    var ruleName = opts.rule;
	    var msgtpl;

	    if (opts.message) { // user specifies a message
	        if ($.isPlainObject(opts.message)) {
	            msgtpl = opts.message[b ? 'success' : 'failure'];
	            // if user's message is undefined，use default
	            typeof msgtpl === 'undefined' && (msgtpl = messages[ruleName][b ? 'success' : 'failure']);
	        } else {//just string
	            msgtpl = b ? '' : opts.message
	        }
	    } else { // use default
	        msgtpl = messages[ruleName][b ? 'success' : 'failure'];
	    }

	    return msgtpl ? compileTpl(opts, msgtpl) : msgtpl;
	}

	function setMessage(name, msg) {
	    if ($.isPlainObject(name)) {
	        $.each(name, function (i, v) {
	            setMessage(i, v);
	        });
	        return this;
	    }

	    if ($.isPlainObject(msg)) {
	        messages[name] = msg;
	    } else {
	        messages[name] = {
	            failure: msg
	        };
	    }
	    return this;
	}



	function getRule(name, opts) {
	    if (opts) {
	        var rule = rules[name];
	        return new Rule(null, function (options, commit) {
	            rule.operator($.extend(null, options, opts), commit);
	        });
	    } else {
	        return rules[name];
	    }
	}

	function compileTpl(obj, tpl) {
	    var result = tpl;

	    var regexp1 = /\{\{[^\{\}]*\}\}/g,
	        regexp2 = /\{\{(.*)\}\}/;

	    var arr = tpl.match(regexp1);
	    arr && $.each(arr, function (i, v) {
	        var key = v.match(regexp2)[1];
	        var value = obj[$.trim(key)];
	        result = result.replace(v, value);
	    });
	    return result;
	}

	addRule('required', function (options) {
	    var element = $(options.element);

	    var t = element.attr('type');
	    switch (t) {
	        case 'checkbox':
	        case 'radio':
	            var checked = false;
	            element.each(function (i, item) {
	                if ($(item).prop('checked')) {
	                    checked = true;
	                    return false;
	                }
	            });
	            return checked;
	        default:
	            return Boolean($.trim(element.val()));
	    }
	}, '请输入{{display}}');

	addRule('email', /^\s*([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,20})\s*$/, '{{display}}的格式不正确');

	addRule('text', /.*/);

	addRule('password', /.*/);

	addRule('radio', /.*/);

	addRule('checkbox', /.*/);

	addRule('url', /^(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/, '{{display}}的格式不正确');

	addRule('number', /^[+-]?[1-9][0-9]*(\.[0-9]+)?([eE][+-][1-9][0-9]*)?$|^[+-]?0?\.[0-9]+([eE][+-][1-9][0-9]*)?$|^0$/, '{{display}}的格式不正确');

	// 00123450 是 digits 但不是 number
	// 1.23 是 number 但不是 digits
	addRule('digits', /^\s*\d+\s*$/, '{{display}}的格式不正确');

	addRule('date', /^\d{4}\-[01]?\d\-[0-3]?\d$|^[01]\d\/[0-3]\d\/\d{4}$|^\d{4}年[01]?\d月[0-3]?\d[日号]$/, '{{display}}的格式不正确');

	addRule('min', function (options) {
	    var element = options.element,
	        min = options.min;
	    return Number(element.val()) >= Number(min);
	}, '{{display}}必须大于或者等于{{min}}');

	addRule('max', function (options) {
	    var element = options.element,
	        max = options.max;
	    return Number(element.val()) <= Number(max);
	}, '{{display}}必须小于或者等于{{max}}');

	addRule('minlength', function (options) {
	    var element = options.element;
	    var l = element.val().length;
	    return l >= Number(options.min);
	}, '{{display}}的长度必须大于或等于{{min}}');

	addRule('maxlength', function (options) {
	    var element = options.element;
	    var l = element.val().length;
	    return l <= Number(options.max);
	}, '{{display}}的长度必须小于或等于{{max}}');

	addRule('mobile', /^1\d{10}$/, '请输入正确的{{display}}');

	addRule('confirmation', function (options) {
	    var element = options.element,
	        target = $(options.target);
	    return element.val() == target.val();
	}, '两次输入的{{display}}不一致，请重新输入');

	module.exports = {
	    addRule: addRule,
	    setMessage: setMessage,
	    getMessage: function(options, isSuccess) {
	        return _getMsg(options, isSuccess);
	    },
	    getRule: getRule,
	    getOperator: function (name) {
	        return rules[name].operator;
	    }
	};


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Exception = __webpack_require__(4)["default"];

	function Compiler() {}

	exports.Compiler = Compiler;// the foundHelper register will disambiguate helper lookup from finding a
	// function in a context. This is necessary for mustache compatibility, which
	// requires that context functions in blocks are evaluated by blockHelperMissing,
	// and then proceed as if the resulting value was provided to blockHelperMissing.

	Compiler.prototype = {
	  compiler: Compiler,

	  disassemble: function() {
	    var opcodes = this.opcodes, opcode, out = [], params, param;

	    for (var i=0, l=opcodes.length; i<l; i++) {
	      opcode = opcodes[i];

	      if (opcode.opcode === 'DECLARE') {
	        out.push("DECLARE " + opcode.name + "=" + opcode.value);
	      } else {
	        params = [];
	        for (var j=0; j<opcode.args.length; j++) {
	          param = opcode.args[j];
	          if (typeof param === "string") {
	            param = "\"" + param.replace("\n", "\\n") + "\"";
	          }
	          params.push(param);
	        }
	        out.push(opcode.opcode + " " + params.join(" "));
	      }
	    }

	    return out.join("\n");
	  },

	  equals: function(other) {
	    var len = this.opcodes.length;
	    if (other.opcodes.length !== len) {
	      return false;
	    }

	    for (var i = 0; i < len; i++) {
	      var opcode = this.opcodes[i],
	          otherOpcode = other.opcodes[i];
	      if (opcode.opcode !== otherOpcode.opcode || opcode.args.length !== otherOpcode.args.length) {
	        return false;
	      }
	      for (var j = 0; j < opcode.args.length; j++) {
	        if (opcode.args[j] !== otherOpcode.args[j]) {
	          return false;
	        }
	      }
	    }

	    len = this.children.length;
	    if (other.children.length !== len) {
	      return false;
	    }
	    for (i = 0; i < len; i++) {
	      if (!this.children[i].equals(other.children[i])) {
	        return false;
	      }
	    }

	    return true;
	  },

	  guid: 0,

	  compile: function(program, options) {
	    this.opcodes = [];
	    this.children = [];
	    this.depths = {list: []};
	    this.options = options;

	    // These changes will propagate to the other compiler components
	    var knownHelpers = this.options.knownHelpers;
	    this.options.knownHelpers = {
	      'helperMissing': true,
	      'blockHelperMissing': true,
	      'each': true,
	      'if': true,
	      'unless': true,
	      'with': true,
	      'log': true
	    };
	    if (knownHelpers) {
	      for (var name in knownHelpers) {
	        this.options.knownHelpers[name] = knownHelpers[name];
	      }
	    }

	    return this.accept(program);
	  },

	  accept: function(node) {
	    var strip = node.strip || {},
	        ret;
	    if (strip.left) {
	      this.opcode('strip');
	    }

	    ret = this[node.type](node);

	    if (strip.right) {
	      this.opcode('strip');
	    }

	    return ret;
	  },

	  program: function(program) {
	    var statements = program.statements;

	    for(var i=0, l=statements.length; i<l; i++) {
	      this.accept(statements[i]);
	    }
	    this.isSimple = l === 1;

	    this.depths.list = this.depths.list.sort(function(a, b) {
	      return a - b;
	    });

	    return this;
	  },

	  compileProgram: function(program) {
	    var result = new this.compiler().compile(program, this.options);
	    var guid = this.guid++, depth;

	    this.usePartial = this.usePartial || result.usePartial;

	    this.children[guid] = result;

	    for(var i=0, l=result.depths.list.length; i<l; i++) {
	      depth = result.depths.list[i];

	      if(depth < 2) { continue; }
	      else { this.addDepth(depth - 1); }
	    }

	    return guid;
	  },

	  block: function(block) {
	    var mustache = block.mustache,
	        program = block.program,
	        inverse = block.inverse;

	    if (program) {
	      program = this.compileProgram(program);
	    }

	    if (inverse) {
	      inverse = this.compileProgram(inverse);
	    }

	    var sexpr = mustache.sexpr;
	    var type = this.classifySexpr(sexpr);

	    if (type === "helper") {
	      this.helperSexpr(sexpr, program, inverse);
	    } else if (type === "simple") {
	      this.simpleSexpr(sexpr);

	      // now that the simple mustache is resolved, we need to
	      // evaluate it by executing `blockHelperMissing`
	      this.opcode('pushProgram', program);
	      this.opcode('pushProgram', inverse);
	      this.opcode('emptyHash');
	      this.opcode('blockValue');
	    } else {
	      this.ambiguousSexpr(sexpr, program, inverse);

	      // now that the simple mustache is resolved, we need to
	      // evaluate it by executing `blockHelperMissing`
	      this.opcode('pushProgram', program);
	      this.opcode('pushProgram', inverse);
	      this.opcode('emptyHash');
	      this.opcode('ambiguousBlockValue');
	    }

	    this.opcode('append');
	  },

	  hash: function(hash) {
	    var pairs = hash.pairs, pair, val;

	    this.opcode('pushHash');

	    for(var i=0, l=pairs.length; i<l; i++) {
	      pair = pairs[i];
	      val  = pair[1];

	      if (this.options.stringParams) {
	        if(val.depth) {
	          this.addDepth(val.depth);
	        }
	        this.opcode('getContext', val.depth || 0);
	        this.opcode('pushStringParam', val.stringModeValue, val.type);

	        if (val.type === 'sexpr') {
	          // Subexpressions get evaluated and passed in
	          // in string params mode.
	          this.sexpr(val);
	        }
	      } else {
	        this.accept(val);
	      }

	      this.opcode('assignToHash', pair[0]);
	    }
	    this.opcode('popHash');
	  },

	  partial: function(partial) {
	    var partialName = partial.partialName;
	    this.usePartial = true;

	    if(partial.context) {
	      this.ID(partial.context);
	    } else {
	      this.opcode('push', 'depth0');
	    }

	    this.opcode('invokePartial', partialName.name);
	    this.opcode('append');
	  },

	  content: function(content) {
	    this.opcode('appendContent', content.string);
	  },

	  mustache: function(mustache) {
	    this.sexpr(mustache.sexpr);

	    if(mustache.escaped && !this.options.noEscape) {
	      this.opcode('appendEscaped');
	    } else {
	      this.opcode('append');
	    }
	  },

	  ambiguousSexpr: function(sexpr, program, inverse) {
	    var id = sexpr.id,
	        name = id.parts[0],
	        isBlock = program != null || inverse != null;

	    this.opcode('getContext', id.depth);

	    this.opcode('pushProgram', program);
	    this.opcode('pushProgram', inverse);

	    this.opcode('invokeAmbiguous', name, isBlock);
	  },

	  simpleSexpr: function(sexpr) {
	    var id = sexpr.id;

	    if (id.type === 'DATA') {
	      this.DATA(id);
	    } else if (id.parts.length) {
	      this.ID(id);
	    } else {
	      // Simplified ID for `this`
	      this.addDepth(id.depth);
	      this.opcode('getContext', id.depth);
	      this.opcode('pushContext');
	    }

	    this.opcode('resolvePossibleLambda');
	  },

	  helperSexpr: function(sexpr, program, inverse) {
	    var params = this.setupFullMustacheParams(sexpr, program, inverse),
	        name = sexpr.id.parts[0];

	    if (this.options.knownHelpers[name]) {
	      this.opcode('invokeKnownHelper', params.length, name);
	    } else if (this.options.knownHelpersOnly) {
	      throw new Exception("You specified knownHelpersOnly, but used the unknown helper " + name, sexpr);
	    } else {
	      this.opcode('invokeHelper', params.length, name, sexpr.isRoot);
	    }
	  },

	  sexpr: function(sexpr) {
	    var type = this.classifySexpr(sexpr);

	    if (type === "simple") {
	      this.simpleSexpr(sexpr);
	    } else if (type === "helper") {
	      this.helperSexpr(sexpr);
	    } else {
	      this.ambiguousSexpr(sexpr);
	    }
	  },

	  ID: function(id) {
	    this.addDepth(id.depth);
	    this.opcode('getContext', id.depth);

	    var name = id.parts[0];
	    if (!name) {
	      this.opcode('pushContext');
	    } else {
	      this.opcode('lookupOnContext', id.parts[0]);
	    }

	    for(var i=1, l=id.parts.length; i<l; i++) {
	      this.opcode('lookup', id.parts[i]);
	    }
	  },

	  DATA: function(data) {
	    this.options.data = true;
	    if (data.id.isScoped || data.id.depth) {
	      throw new Exception('Scoped data references are not supported: ' + data.original, data);
	    }

	    this.opcode('lookupData');
	    var parts = data.id.parts;
	    for(var i=0, l=parts.length; i<l; i++) {
	      this.opcode('lookup', parts[i]);
	    }
	  },

	  STRING: function(string) {
	    this.opcode('pushString', string.string);
	  },

	  INTEGER: function(integer) {
	    this.opcode('pushLiteral', integer.integer);
	  },

	  BOOLEAN: function(bool) {
	    this.opcode('pushLiteral', bool.bool);
	  },

	  comment: function() {},

	  // HELPERS
	  opcode: function(name) {
	    this.opcodes.push({ opcode: name, args: [].slice.call(arguments, 1) });
	  },

	  declare: function(name, value) {
	    this.opcodes.push({ opcode: 'DECLARE', name: name, value: value });
	  },

	  addDepth: function(depth) {
	    if(depth === 0) { return; }

	    if(!this.depths[depth]) {
	      this.depths[depth] = true;
	      this.depths.list.push(depth);
	    }
	  },

	  classifySexpr: function(sexpr) {
	    var isHelper   = sexpr.isHelper;
	    var isEligible = sexpr.eligibleHelper;
	    var options    = this.options;

	    // if ambiguous, we can possibly resolve the ambiguity now
	    if (isEligible && !isHelper) {
	      var name = sexpr.id.parts[0];

	      if (options.knownHelpers[name]) {
	        isHelper = true;
	      } else if (options.knownHelpersOnly) {
	        isEligible = false;
	      }
	    }

	    if (isHelper) { return "helper"; }
	    else if (isEligible) { return "ambiguous"; }
	    else { return "simple"; }
	  },

	  pushParams: function(params) {
	    var i = params.length, param;

	    while(i--) {
	      param = params[i];

	      if(this.options.stringParams) {
	        if(param.depth) {
	          this.addDepth(param.depth);
	        }

	        this.opcode('getContext', param.depth || 0);
	        this.opcode('pushStringParam', param.stringModeValue, param.type);

	        if (param.type === 'sexpr') {
	          // Subexpressions get evaluated and passed in
	          // in string params mode.
	          this.sexpr(param);
	        }
	      } else {
	        this[param.type](param);
	      }
	    }
	  },

	  setupFullMustacheParams: function(sexpr, program, inverse) {
	    var params = sexpr.params;
	    this.pushParams(params);

	    this.opcode('pushProgram', program);
	    this.opcode('pushProgram', inverse);

	    if (sexpr.hash) {
	      this.hash(sexpr.hash);
	    } else {
	      this.opcode('emptyHash');
	    }

	    return params;
	  }
	};

	function precompile(input, options, env) {
	  if (input == null || (typeof input !== 'string' && input.constructor !== env.AST.ProgramNode)) {
	    throw new Exception("You must pass a string or Handlebars AST to Handlebars.precompile. You passed " + input);
	  }

	  options = options || {};
	  if (!('data' in options)) {
	    options.data = true;
	  }

	  var ast = env.parse(input);
	  var environment = new env.Compiler().compile(ast, options);
	  return new env.JavaScriptCompiler().compile(environment, options);
	}

	exports.precompile = precompile;function compile(input, options, env) {
	  if (input == null || (typeof input !== 'string' && input.constructor !== env.AST.ProgramNode)) {
	    throw new Exception("You must pass a string or Handlebars AST to Handlebars.compile. You passed " + input);
	  }

	  options = options || {};

	  if (!('data' in options)) {
	    options.data = true;
	  }

	  var compiled;

	  function compileInput() {
	    var ast = env.parse(input);
	    var environment = new env.Compiler().compile(ast, options);
	    var templateSpec = new env.JavaScriptCompiler().compile(environment, options, undefined, true);
	    return env.template(templateSpec);
	  }

	  // Template is only compiled on first use and cached after that point.
	  return function(context, options) {
	    if (!compiled) {
	      compiled = compileInput();
	    }
	    return compiled.call(this, context, options);
	  };
	}

	exports.compile = compile;

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	/*jshint -W004 */
	var SafeString = __webpack_require__(33)["default"];

	var escape = {
	  "&": "&amp;",
	  "<": "&lt;",
	  ">": "&gt;",
	  '"': "&quot;",
	  "'": "&#x27;",
	  "`": "&#x60;"
	};

	var badChars = /[&<>"'`]/g;
	var possible = /[&<>"'`]/;

	function escapeChar(chr) {
	  return escape[chr] || "&amp;";
	}

	function extend(obj, value) {
	  for(var key in value) {
	    if(Object.prototype.hasOwnProperty.call(value, key)) {
	      obj[key] = value[key];
	    }
	  }
	}

	exports.extend = extend;var toString = Object.prototype.toString;
	exports.toString = toString;
	// Sourced from lodash
	// https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
	var isFunction = function(value) {
	  return typeof value === 'function';
	};
	// fallback for older versions of Chrome and Safari
	if (isFunction(/x/)) {
	  isFunction = function(value) {
	    return typeof value === 'function' && toString.call(value) === '[object Function]';
	  };
	}
	var isFunction;
	exports.isFunction = isFunction;
	var isArray = Array.isArray || function(value) {
	  return (value && typeof value === 'object') ? toString.call(value) === '[object Array]' : false;
	};
	exports.isArray = isArray;

	function escapeExpression(string) {
	  // don't escape SafeStrings, since they're already safe
	  if (string instanceof SafeString) {
	    return string.toString();
	  } else if (!string && string !== 0) {
	    return "";
	  }

	  // Force a string conversion as this will be done by the append regardless and
	  // the regex test will do this transparently behind the scenes, causing issues if
	  // an object's to string has escaped characters in it.
	  string = "" + string;

	  if(!possible.test(string)) { return string; }
	  return string.replace(badChars, escapeChar);
	}

	exports.escapeExpression = escapeExpression;function isEmpty(value) {
	  if (!value && value !== 0) {
	    return true;
	  } else if (isArray(value) && value.length === 0) {
	    return true;
	  } else {
	    return false;
	  }
	}

	exports.isEmpty = isEmpty;

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Utils = __webpack_require__(21);
	var Exception = __webpack_require__(20)["default"];

	var VERSION = "1.3.0";
	exports.VERSION = VERSION;var COMPILER_REVISION = 4;
	exports.COMPILER_REVISION = COMPILER_REVISION;
	var REVISION_CHANGES = {
	  1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
	  2: '== 1.0.0-rc.3',
	  3: '== 1.0.0-rc.4',
	  4: '>= 1.0.0'
	};
	exports.REVISION_CHANGES = REVISION_CHANGES;
	var isArray = Utils.isArray,
	    isFunction = Utils.isFunction,
	    toString = Utils.toString,
	    objectType = '[object Object]';

	function HandlebarsEnvironment(helpers, partials) {
	  this.helpers = helpers || {};
	  this.partials = partials || {};

	  registerDefaultHelpers(this);
	}

	exports.HandlebarsEnvironment = HandlebarsEnvironment;HandlebarsEnvironment.prototype = {
	  constructor: HandlebarsEnvironment,

	  logger: logger,
	  log: log,

	  registerHelper: function(name, fn, inverse) {
	    if (toString.call(name) === objectType) {
	      if (inverse || fn) { throw new Exception('Arg not supported with multiple helpers'); }
	      Utils.extend(this.helpers, name);
	    } else {
	      if (inverse) { fn.not = inverse; }
	      this.helpers[name] = fn;
	    }
	  },

	  registerPartial: function(name, str) {
	    if (toString.call(name) === objectType) {
	      Utils.extend(this.partials,  name);
	    } else {
	      this.partials[name] = str;
	    }
	  }
	};

	function registerDefaultHelpers(instance) {
	  instance.registerHelper('helperMissing', function(arg) {
	    if(arguments.length === 2) {
	      return undefined;
	    } else {
	      throw new Exception("Missing helper: '" + arg + "'");
	    }
	  });

	  instance.registerHelper('blockHelperMissing', function(context, options) {
	    var inverse = options.inverse || function() {}, fn = options.fn;

	    if (isFunction(context)) { context = context.call(this); }

	    if(context === true) {
	      return fn(this);
	    } else if(context === false || context == null) {
	      return inverse(this);
	    } else if (isArray(context)) {
	      if(context.length > 0) {
	        return instance.helpers.each(context, options);
	      } else {
	        return inverse(this);
	      }
	    } else {
	      return fn(context);
	    }
	  });

	  instance.registerHelper('each', function(context, options) {
	    var fn = options.fn, inverse = options.inverse;
	    var i = 0, ret = "", data;

	    if (isFunction(context)) { context = context.call(this); }

	    if (options.data) {
	      data = createFrame(options.data);
	    }

	    if(context && typeof context === 'object') {
	      if (isArray(context)) {
	        for(var j = context.length; i<j; i++) {
	          if (data) {
	            data.index = i;
	            data.first = (i === 0);
	            data.last  = (i === (context.length-1));
	          }
	          ret = ret + fn(context[i], { data: data });
	        }
	      } else {
	        for(var key in context) {
	          if(context.hasOwnProperty(key)) {
	            if(data) { 
	              data.key = key; 
	              data.index = i;
	              data.first = (i === 0);
	            }
	            ret = ret + fn(context[key], {data: data});
	            i++;
	          }
	        }
	      }
	    }

	    if(i === 0){
	      ret = inverse(this);
	    }

	    return ret;
	  });

	  instance.registerHelper('if', function(conditional, options) {
	    if (isFunction(conditional)) { conditional = conditional.call(this); }

	    // Default behavior is to render the positive path if the value is truthy and not empty.
	    // The `includeZero` option may be set to treat the condtional as purely not empty based on the
	    // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
	    if ((!options.hash.includeZero && !conditional) || Utils.isEmpty(conditional)) {
	      return options.inverse(this);
	    } else {
	      return options.fn(this);
	    }
	  });

	  instance.registerHelper('unless', function(conditional, options) {
	    return instance.helpers['if'].call(this, conditional, {fn: options.inverse, inverse: options.fn, hash: options.hash});
	  });

	  instance.registerHelper('with', function(context, options) {
	    if (isFunction(context)) { context = context.call(this); }

	    if (!Utils.isEmpty(context)) return options.fn(context);
	  });

	  instance.registerHelper('log', function(context, options) {
	    var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
	    instance.log(level, context);
	  });
	}

	var logger = {
	  methodMap: { 0: 'debug', 1: 'info', 2: 'warn', 3: 'error' },

	  // State enum
	  DEBUG: 0,
	  INFO: 1,
	  WARN: 2,
	  ERROR: 3,
	  level: 3,

	  // can be overridden in the host environment
	  log: function(level, obj) {
	    if (logger.level <= level) {
	      var method = logger.methodMap[level];
	      if (typeof console !== 'undefined' && console[method]) {
	        console[method].call(console, obj);
	      }
	    }
	  }
	};
	exports.logger = logger;
	function log(level, obj) { logger.log(level, obj); }

	exports.log = log;var createFrame = function(object) {
	  var obj = {};
	  Utils.extend(obj, object);
	  return obj;
	};
	exports.createFrame = createFrame;

/***/ },
/* 20 */
/***/ function(module, exports) {

	"use strict";

	var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

	function Exception(message, node) {
	  var line;
	  if (node && node.firstLine) {
	    line = node.firstLine;

	    message += ' - ' + line + ':' + node.firstColumn;
	  }

	  var tmp = Error.prototype.constructor.call(this, message);

	  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
	  for (var idx = 0; idx < errorProps.length; idx++) {
	    this[errorProps[idx]] = tmp[errorProps[idx]];
	  }

	  if (line) {
	    this.lineNumber = line;
	    this.column = node.firstColumn;
	  }
	}

	Exception.prototype = new Error();

	exports["default"] = Exception;

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	/*jshint -W004 */
	var SafeString = __webpack_require__(34)["default"];

	var escape = {
	  "&": "&amp;",
	  "<": "&lt;",
	  ">": "&gt;",
	  '"': "&quot;",
	  "'": "&#x27;",
	  "`": "&#x60;"
	};

	var badChars = /[&<>"'`]/g;
	var possible = /[&<>"'`]/;

	function escapeChar(chr) {
	  return escape[chr] || "&amp;";
	}

	function extend(obj, value) {
	  for(var key in value) {
	    if(Object.prototype.hasOwnProperty.call(value, key)) {
	      obj[key] = value[key];
	    }
	  }
	}

	exports.extend = extend;var toString = Object.prototype.toString;
	exports.toString = toString;
	// Sourced from lodash
	// https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
	var isFunction = function(value) {
	  return typeof value === 'function';
	};
	// fallback for older versions of Chrome and Safari
	if (isFunction(/x/)) {
	  isFunction = function(value) {
	    return typeof value === 'function' && toString.call(value) === '[object Function]';
	  };
	}
	var isFunction;
	exports.isFunction = isFunction;
	var isArray = Array.isArray || function(value) {
	  return (value && typeof value === 'object') ? toString.call(value) === '[object Array]' : false;
	};
	exports.isArray = isArray;

	function escapeExpression(string) {
	  // don't escape SafeStrings, since they're already safe
	  if (string instanceof SafeString) {
	    return string.toString();
	  } else if (!string && string !== 0) {
	    return "";
	  }

	  // Force a string conversion as this will be done by the append regardless and
	  // the regex test will do this transparently behind the scenes, causing issues if
	  // an object's to string has escaped characters in it.
	  string = "" + string;

	  if(!possible.test(string)) { return string; }
	  return string.replace(badChars, escapeChar);
	}

	exports.escapeExpression = escapeExpression;function isEmpty(value) {
	  if (!value && value !== 0) {
	    return true;
	  } else if (isArray(value) && value.length === 0) {
	    return true;
	  } else {
	    return false;
	  }
	}

	exports.isEmpty = isEmpty;

/***/ },
/* 22 */
/***/ function(module, exports) {

	// Class
	// -----------------
	// Thanks to:
	//  - http://mootools.net/docs/core/Class/Class
	//  - http://ejohn.org/blog/simple-javascript-inheritance/
	//  - https://github.com/ded/klass
	//  - http://documentcloud.github.com/backbone/#Model-extend
	//  - https://github.com/joyent/node/blob/master/lib/util.js
	//  - https://github.com/kissyteam/kissy/blob/master/src/seed/src/kissy.js


	// The base Class implementation.
	function Class(o) {
	  // Convert existed function to Class.
	  if (!(this instanceof Class) && isFunction(o)) {
	    return classify(o)
	  }
	}

	module.exports = Class


	// Create a new Class.
	//
	//  var SuperPig = Class.create({
	//    Extends: Animal,
	//    Implements: Flyable,
	//    initialize: function() {
	//      SuperPig.superclass.initialize.apply(this, arguments)
	//    },
	//    Statics: {
	//      COLOR: 'red'
	//    }
	// })
	//
	Class.create = function(parent, properties) {
	  if (!isFunction(parent)) {
	    properties = parent
	    parent = null
	  }

	  properties || (properties = {})
	  parent || (parent = properties.Extends || Class)
	  properties.Extends = parent

	  // The created class constructor
	  function SubClass() {
	    // Call the parent constructor.
	    parent.apply(this, arguments)

	    // Only call initialize in self constructor.
	    if (this.constructor === SubClass && this.initialize) {
	      this.initialize.apply(this, arguments)
	    }
	  }

	  // Inherit class (static) properties from parent.
	  if (parent !== Class) {
	    mix(SubClass, parent, parent.StaticsWhiteList)
	  }

	  // Add instance properties to the subclass.
	  implement.call(SubClass, properties)

	  // Make subclass extendable.
	  return classify(SubClass)
	}


	function implement(properties) {
	  var key, value

	  for (key in properties) {
	    value = properties[key]

	    if (Class.Mutators.hasOwnProperty(key)) {
	      Class.Mutators[key].call(this, value)
	    } else {
	      this.prototype[key] = value
	    }
	  }
	}


	// Create a sub Class based on `Class`.
	Class.extend = function(properties) {
	  properties || (properties = {})
	  properties.Extends = this

	  return Class.create(properties)
	}


	function classify(cls) {
	  cls.extend = Class.extend
	  cls.implement = implement
	  return cls
	}


	// Mutators define special properties.
	Class.Mutators = {

	  'Extends': function(parent) {
	    var existed = this.prototype
	    var proto = createProto(parent.prototype)

	    // Keep existed properties.
	    mix(proto, existed)

	    // Enforce the constructor to be what we expect.
	    proto.constructor = this

	    // Set the prototype chain to inherit from `parent`.
	    this.prototype = proto

	    // Set a convenience property in case the parent's prototype is
	    // needed later.
	    this.superclass = parent.prototype
	  },

	  'Implements': function(items) {
	    isArray(items) || (items = [items])
	    var proto = this.prototype, item

	    while (item = items.shift()) {
	      mix(proto, item.prototype || item)
	    }
	  },

	  'Statics': function(staticProperties) {
	    mix(this, staticProperties)
	  }
	}


	// Shared empty constructor function to aid in prototype-chain creation.
	function Ctor() {
	}

	// See: http://jsperf.com/object-create-vs-new-ctor
	var createProto = Object.__proto__ ?
	    function(proto) {
	      return { __proto__: proto }
	    } :
	    function(proto) {
	      Ctor.prototype = proto
	      return new Ctor()
	    }


	// Helpers
	// ------------

	function mix(r, s, wl) {
	  // Copy "all" properties including inherited ones.
	  for (var p in s) {
	    if (s.hasOwnProperty(p)) {
	      if (wl && indexOf(wl, p) === -1) continue

	      // 在 iPhone 1 代等设备的 Safari 中，prototype 也会被枚举出来，需排除
	      if (p !== 'prototype') {
	        r[p] = s[p]
	      }
	    }
	  }
	}


	var toString = Object.prototype.toString

	var isArray = Array.isArray || function(val) {
	    return toString.call(val) === '[object Array]'
	}

	var isFunction = function(val) {
	  return toString.call(val) === '[object Function]'
	}

	var indexOf = Array.prototype.indexOf ?
	    function(arr, item) {
	      return arr.indexOf(item)
	    } :
	    function(arr, item) {
	      for (var i = 0, len = arr.length; i < len; i++) {
	        if (arr[i] === item) {
	          return i
	        }
	      }
	      return -1
	    }


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(1),
	    Overlay = __webpack_require__(7),
	    mask = Overlay.Mask,
	    Events = __webpack_require__(14),
	    Templatable = __webpack_require__(11),
	    Messenger = __webpack_require__(25);

	// Dialog
	// ---
	// Dialog 是通用对话框组件，提供显隐关闭、遮罩层、内嵌iframe、内容区域自定义功能。
	// 是所有对话框类型组件的基类。
	var Dialog = Overlay.extend({

	  Implements: Templatable,

	  attrs: {
	    // 模板
	    template: __webpack_require__(38),

	    // 对话框触发点
	    trigger: {
	      value: null,
	      getter: function (val) {
	        return $(val);
	      }
	    },

	    // 统一样式前缀
	    classPrefix: 'ui-dialog',

	    // 指定内容元素，可以是 url 地址
	    content: {
	      value: null,
	      setter: function (val) {
	        // 判断是否是 url 地址
	        if (/^(https?:\/\/|\/|\.\/|\.\.\/)/.test(val)) {
	          this._type = 'iframe';
	          // 用 ajax 的方式而不是 iframe 进行载入
	          if (val.indexOf('?ajax') > 0 || val.indexOf('&ajax') > 0) {
	            this._ajax = true;
	          }
	        }
	        return val;
	      }
	    },

	    // 是否有背景遮罩层
	    hasMask: true,

	    // 关闭按钮可以自定义
	    closeTpl: '×',

	    // 默认宽度
	    width: 500,

	    // 默认高度
	    height: null,

	    // iframe 类型时，dialog 的最初高度
	    initialHeight: 300,

	    // 简单的动画效果 none | fade
	    effect: 'none',

	    // 不用解释了吧
	    zIndex: 999,

	    // 是否自适应高度
	    autoFit: true,

	    // 默认定位左右居中，略微靠上
	    align: {
	      value: {
	        selfXY: ['50%', '50%'],
	        baseXY: ['50%', '42%']
	      },
	      getter: function (val) {
	        // 高度超过窗口的 42/50 浮层头部顶住窗口
	        // https://github.com/aralejs/dialog/issues/41
	        if (this.element.height() > $(window).height() * 0.84) {
	          return {
	            selfXY: ['50%', '0'],
	            baseXY: ['50%', '0']
	          };
	        }
	        return val;
	      }
	    }
	  },


	  parseElement: function () {
	    this.set("model", {
	      classPrefix: this.get('classPrefix')
	    });
	    Dialog.superclass.parseElement.call(this);
	    this.contentElement = this.$('[data-role=content]');

	    // 必要的样式
	    this.contentElement.css({
	      height: '100%',
	      zoom: 1
	    });
	    // 关闭按钮先隐藏
	    // 后面当 onRenderCloseTpl 时，如果 closeTpl 不为空，会显示出来
	    // 这样写是为了回避 arale.base 的一个问题：
	    // 当属性初始值为''时，不会进入 onRender 方法
	    // https://github.com/aralejs/base/issues/7
	    this.$('[data-role=close]').hide();
	  },

	  events: {
	    'click [data-role=close]': function (e) {
	      e.preventDefault();
	      this.hide();
	    }
	  },

	  show: function () {
	    // iframe 要在载入完成才显示
	    if (this._type === 'iframe') {
	      // ajax 读入内容并 append 到容器中
	      if (this._ajax) {
	        this._ajaxHtml();
	      } else {
	        // iframe 还未请求完，先设置一个固定高度
	        !this.get('height') && this.contentElement.css('height', this.get('initialHeight'));
	        this._showIframe();
	      }
	    }

	    Dialog.superclass.show.call(this);
	    return this;
	  },

	  hide: function () {
	    // 把 iframe 状态复原
	    if (this._type === 'iframe' && this.iframe) {
	      // 如果是跨域iframe，会抛出异常，所以需要加一层判断
	      if (!this._isCrossDomainIframe) {
	        this.iframe.attr({
	          src: 'javascript:\'\';'
	        });
	      }
	      // 原来只是将 iframe 的状态复原
	      // 但是发现在 IE6 下，将 src 置为 javascript:''; 会出现 404 页面
	      this.iframe.remove();
	      this.iframe = null;
	    }

	    Dialog.superclass.hide.call(this);
	    clearInterval(this._interval);
	    delete this._interval;
	    return this;
	  },

	  destroy: function () {
	    this.element.remove();
	    this._hideMask();
	    clearInterval(this._interval);
	    return Dialog.superclass.destroy.call(this);
	  },

	  setup: function () {
	    Dialog.superclass.setup.call(this);

	    this._setupTrigger();
	    this._setupMask();
	    this._setupKeyEvents();
	    this._setupFocus();
	    toTabed(this.element);
	    toTabed(this.get('trigger'));

	    // 默认当前触发器
	    this.activeTrigger = this.get('trigger').eq(0);
	  },

	  // onRender
	  // ---
	  _onRenderContent: function (val) {
	    if (this._type !== 'iframe') {
	      var value;
	      // 有些情况会报错
	      try {
	        value = $(val);
	      } catch (e) {
	        value = [];
	      }
	      if (value[0]) {
	        this.contentElement.empty().append(value);
	      } else {
	        this.contentElement.empty().html(val);
	      }
	      // #38 #44
	      this._setPosition();
	    }
	  },

	  _onRenderCloseTpl: function (val) {
	    if (val === '') {
	      this.$('[data-role=close]').html(val).hide();
	    } else {
	      this.$('[data-role=close]').html(val).show();
	    }
	  },

	  // 覆盖 overlay，提供动画
	  _onRenderVisible: function (val) {
	    if (val) {
	      if (this.get('effect') === 'fade') {
	        // 固定 300 的动画时长，暂不可定制
	        this.element.fadeIn(300);
	      } else {
	        this.element.show();
	      }
	    } else {
	      this.element.hide();
	    }
	  },

	  // 私有方法
	  // ---
	  // 绑定触发对话框出现的事件
	  _setupTrigger: function () {
	    this.delegateEvents(this.get('trigger'), 'click', function (e) {
	      e.preventDefault();
	      // 标识当前点击的元素
	      this.activeTrigger = $(e.currentTarget);
	      this.show();
	    });
	  },

	  // 绑定遮罩层事件
	  _setupMask: function () {
	    var that = this;

	    // 存放 mask 对应的对话框
	    mask._dialogs = mask._dialogs || [];

	    this.after('show', function () {
	      if (!this.get('hasMask')) {
	        return;
	      }
	      // not using the z-index
	      // because multiable dialogs may share same mask
	      mask.set('zIndex', that.get('zIndex')).show();
	      mask.element.insertBefore(that.element);

	      // 避免重复存放
	      var existed;
	      for (var i=0; i<mask._dialogs.length; i++) {
	        if (mask._dialogs[i] === that) {
	          existed = mask._dialogs[i];
	        }
	      }
	      if (existed) {
	        // 把已存在的对话框提到最后一个
	        erase(existed, mask._dialogs);
	        mask._dialogs.push(existed);
	      } else {
	        // 存放新的对话框
	        mask._dialogs.push(that);
	      }
	    });

	    this.after('hide', this._hideMask);
	  },

	  // 隐藏 mask
	  _hideMask: function () {
	    if (!this.get('hasMask')) {
	      return;
	    }

	    // 移除 mask._dialogs 当前实例对应的 dialog
	    var dialogLength = mask._dialogs ? mask._dialogs.length : 0;
	    for (var i=0; i<dialogLength; i++) {
	      if (mask._dialogs[i] === this) {
	        erase(this, mask._dialogs);

	        // 如果 _dialogs 为空了，表示没有打开的 dialog 了
	        // 则隐藏 mask
	        if (mask._dialogs.length === 0) {
	          mask.hide();
	        }
	        // 如果移除的是最后一个打开的 dialog
	        // 则相应向下移动 mask
	        else if (i === dialogLength - 1) {
	          var last = mask._dialogs[mask._dialogs.length - 1];
	          mask.set('zIndex', last.get('zIndex'));
	          mask.element.insertBefore(last.element);
	        }
	      }
	    }
	  },

	  // 绑定元素聚焦状态
	  _setupFocus: function () {
	    this.after('show', function () {
	      this.element.focus();
	    });
	    this.after('hide', function () {
	      // 关于网页中浮层消失后的焦点处理
	      // http://www.qt06.com/post/280/
	      this.activeTrigger && this.activeTrigger.focus();
	    });
	  },

	  // 绑定键盘事件，ESC关闭窗口
	  _setupKeyEvents: function () {
	    this.delegateEvents($(document), 'keyup.esc', function (e) {
	      if (e.keyCode === 27) {
	        this.get('visible') && this.hide();
	      }
	    });
	  },

	  _showIframe: function () {
	    var that = this;
	    // 若未创建则新建一个
	    if (!this.iframe) {
	      this._createIframe();
	    }

	    // 开始请求 iframe
	    this.iframe.attr({
	      src: this._fixUrl(),
	      name: 'dialog-iframe' + new Date().getTime()
	    });

	    // 因为在 IE 下 onload 无法触发
	    // http://my.oschina.net/liangrockman/blog/24015
	    // 所以使用 jquery 的 one 函数来代替 onload
	    // one 比 on 好，因为它只执行一次，并在执行后自动销毁
	    this.iframe.one('load', function () {
	      // 如果 dialog 已经隐藏了，就不需要触发 onload
	      if (!that.get('visible')) {
	        return;
	      }

	      // 是否跨域的判断需要放入iframe load之后
	      that._isCrossDomainIframe = isCrossDomainIframe(that.iframe);

	      if (!that._isCrossDomainIframe) {
	        // 绑定自动处理高度的事件
	        if (that.get('autoFit')) {
	          clearInterval(that._interval);
	          that._interval = setInterval(function () {
	            that._syncHeight();
	          }, 300);
	        }
	        that._syncHeight();
	      }

	      that._setPosition();
	      that.trigger('complete:show');
	    });
	  },

	  _fixUrl: function () {
	    var s = this.get('content').match(/([^?#]*)(\?[^#]*)?(#.*)?/);
	    s.shift();
	    s[1] = ((s[1] && s[1] !== '?') ? (s[1] + '&') : '?') + 't=' + new Date().getTime();
	    return s.join('');
	  },

	  _createIframe: function () {
	    var that = this;

	    this.iframe = $('<iframe>', {
	      src: 'javascript:\'\';',
	      scrolling: 'no',
	      frameborder: 'no',
	      allowTransparency: 'true',
	      css: {
	        border: 'none',
	        width: '100%',
	        display: 'block',
	        height: '100%',
	        overflow: 'hidden'
	      }
	    }).appendTo(this.contentElement);

	    // 给 iframe 绑一个 close 事件
	    // iframe 内部可通过 window.frameElement.trigger('close') 关闭
	    Events.mixTo(this.iframe[0]);
	    this.iframe[0].on('close', function () {
	      that.hide();
	    });

	    // 跨域则使用arale-messenger进行通信
	    var m = new Messenger('parent', 'arale-dialog');
	    m.addTarget(this.iframe[0].contentWindow, 'iframe1');
	    m.listen(function (data) {
	      data = JSON.parse(data);
	      switch (data.event) {
	        case 'close':
	          that.hide();
	          break;
	        case 'syncHeight':
	          that._setHeight(data.height.toString().slice(-2) === 'px' ? data.height : data.height + 'px');
	          break;
	        default:
	          break;
	      }
	    });

	  },

	  _setHeight: function (h) {
	    this.contentElement.css('height', h);
	    // force to reflow in ie6
	    // http://44ux.com/blog/2011/08/24/ie67-reflow-bug/
	    this.element[0].className = this.element[0].className;
	  },

	  _syncHeight: function () {
	    var h;
	    // 如果未传 height，才会自动获取
	    if (!this.get('height')) {
	      try {
	        this._errCount = 0;
	        h = getIframeHeight(this.iframe) + 'px';
	      } catch (err) {
	        // 页面跳转也会抛错，最多失败6次
	        this._errCount = (this._errCount || 0) + 1;
	        if (this._errCount >= 6) {
	          // 获取失败则给默认高度 300px
	          // 跨域会抛错进入这个流程
	          h = this.get('initialHeight');
	          clearInterval(this._interval);
	          delete this._interval;
	        }
	      }
	      this._setHeight(h);

	    } else {
	      clearInterval(this._interval);
	      delete this._interval;
	    }
	  },

	  _ajaxHtml: function () {
	    var that = this;
	    this.contentElement.css('height', this.get('initialHeight'));
	    this.contentElement.load(this.get('content'), function () {
	      that._setPosition();
	      that.contentElement.css('height', '');
	      that.trigger('complete:show');
	    });
	  }

	});

	module.exports = Dialog;

	// Helpers
	// ----
	// 让目标节点可以被 Tab
	function toTabed(element) {
	  if (element.attr('tabindex') == null) {
	    element.attr('tabindex', '-1');
	  }
	}

	// 获取 iframe 内部的高度
	function getIframeHeight(iframe) {
	  var D = iframe[0].contentWindow.document;
	  if (D.body.scrollHeight && D.documentElement.scrollHeight) {
	    return Math.min(D.body.scrollHeight, D.documentElement.scrollHeight);
	  } else if (D.documentElement.scrollHeight) {
	    return D.documentElement.scrollHeight;
	  } else if (D.body.scrollHeight) {
	    return D.body.scrollHeight;
	  }
	}


	// iframe 是否和当前页面跨域
	function isCrossDomainIframe(iframe) {
	  var isCrossDomain = false;
	  try {
	    iframe[0].contentWindow.document;
	  } catch (e) {
	    isCrossDomain = true;
	  }
	  return isCrossDomain;
	}

	// erase item from array
	function erase(item, array) {
	  var index = -1;
	  for (var i=0; i<array.length; i++) {
	    if (array[i] === item) {
	      index = i;
	      break;
	    }
	  }
	  if (index !== -1) {
	    array.splice(index, 1);
	  }
	}


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	// Based on Easing Equations (c) 2003 Robert Penner, all rights reserved.
	// This work is subject to the terms in
	// http://www.robertpenner.com/easing_terms_of_use.html
	// Preview: http://www.robertpenner.com/Easing/easing_demo.html
	//
	// Thanks to:
	//  - https://github.com/yui/yui3/blob/master/src/anim/js/anim-easing.js
	//  - https://github.com/gilmoreorless/jquery-easing-molecules


	var PI = Math.PI;
	var pow = Math.pow;
	var sin = Math.sin;
	var MAGIC_NUM = 1.70158; // Penner's magic number


	/**
	 * 和 YUI 的 Easing 相比，这里的 Easing 进行了归一化处理，参数调整为：
	 * @param {Number} t Time value used to compute current value 0 =< t <= 1
	 * @param {Number} b Starting value  b = 0
	 * @param {Number} c Delta between start and end values  c = 1
	 * @param {Number} d Total length of animation d = 1
	 */
	var Easing = {

	    /**
	     * Uniform speed between points.
	     */
	    easeNone: function(t) {
	        return t;
	    },

	    /**
	     * Begins slowly and accelerates towards end. (quadratic)
	     */
	    easeIn: function(t) {
	        return t * t;
	    },

	    /**
	     * Begins quickly and decelerates towards end.  (quadratic)
	     */
	    easeOut: function(t) {
	        return (2 - t) * t;
	    },

	    /**
	     * Begins slowly and decelerates towards end. (quadratic)
	     */
	    easeBoth: function(t) {
	        return (t *= 2) < 1 ?
	                .5 * t * t :
	                .5 * (1 - (--t) * (t - 2));
	    },

	    /**
	     * Begins slowly and accelerates towards end. (quartic)
	     */
	    easeInStrong: function(t) {
	        return t * t * t * t;
	    },
	    /**
	     * Begins quickly and decelerates towards end.  (quartic)
	     */
	    easeOutStrong: function(t) {
	        return 1 - (--t) * t * t * t;
	    },

	    /**
	     * Begins slowly and decelerates towards end. (quartic)
	     */
	    easeBothStrong: function(t) {
	        return (t *= 2) < 1 ?
	                .5 * t * t * t * t :
	                .5 * (2 - (t -= 2) * t * t * t);
	    },

	    /**
	     * Backtracks slightly, then reverses direction and moves to end.
	     */
	    backIn: function(t) {
	        if (t === 1) t -= .001;
	        return t * t * ((MAGIC_NUM + 1) * t - MAGIC_NUM);
	    },

	    /**
	     * Overshoots end, then reverses and comes back to end.
	     */
	    backOut: function(t) {
	        return (t -= 1) * t * ((MAGIC_NUM + 1) * t + MAGIC_NUM) + 1;
	    },

	    /**
	     * Backtracks slightly, then reverses direction, overshoots end,
	     * then reverses and comes back to end.
	     */
	    backBoth: function(t) {
	        var s = MAGIC_NUM;
	        var m = (s *= 1.525) + 1;

	        if ((t *= 2 ) < 1) {
	            return .5 * (t * t * (m * t - s));
	        }
	        return .5 * ((t -= 2) * t * (m * t + s) + 2);
	    },

	    /**
	     * Snap in elastic effect.
	     */
	    elasticIn: function(t) {
	        var p = .3, s = p / 4;
	        if (t === 0 || t === 1) return t;
	        return -(pow(2, 10 * (t -= 1)) * sin((t - s) * (2 * PI) / p));
	    },

	    /**
	     * Snap out elastic effect.
	     */
	    elasticOut: function(t) {
	        var p = .3, s = p / 4;
	        if (t === 0 || t === 1) return t;
	        return pow(2, -10 * t) * sin((t - s) * (2 * PI) / p) + 1;
	    },

	    /**
	     * Snap both elastic effect.
	     */
	    elasticBoth: function(t) {
	        var p = .45, s = p / 4;
	        if (t === 0 || (t *= 2) === 2) return t;

	        if (t < 1) {
	            return -.5 * (pow(2, 10 * (t -= 1)) *
	                    sin((t - s) * (2 * PI) / p));
	        }
	        return pow(2, -10 * (t -= 1)) *
	                sin((t - s) * (2 * PI) / p) * .5 + 1;
	    },

	    /**
	     * Bounce off of start.
	     */
	    bounceIn: function(t) {
	        return 1 - Easing.bounceOut(1 - t);
	    },

	    /**
	     * Bounces off end.
	     */
	    bounceOut: function(t) {
	        var s = 7.5625, r;

	        if (t < (1 / 2.75)) {
	            r = s * t * t;
	        }
	        else if (t < (2 / 2.75)) {
	            r = s * (t -= (1.5 / 2.75)) * t + .75;
	        }
	        else if (t < (2.5 / 2.75)) {
	            r = s * (t -= (2.25 / 2.75)) * t + .9375;
	        }
	        else {
	            r = s * (t -= (2.625 / 2.75)) * t + .984375;
	        }

	        return r;
	    },

	    /**
	     * Bounces off start and end.
	     */
	    bounceBoth: function(t) {
	        if (t < .5) {
	            return Easing.bounceIn(t * 2) * .5;
	        }
	        return Easing.bounceOut(t * 2 - 1) * .5 + .5;
	    }
	};

	// 可以通过 require 获取
	module.exports = Easing;


	// 也可以直接通过 jQuery.easing 来使用
	var $ = __webpack_require__(1);
	$.extend($.easing, Easing);


/***/ },
/* 25 */
/***/ function(module, exports) {

	/**
	 *     __  ___
	 *    /  |/  /___   _____ _____ ___   ____   ____ _ ___   _____
	 *   / /|_/ // _ \ / ___// ___// _ \ / __ \ / __ `// _ \ / ___/
	 *  / /  / //  __/(__  )(__  )/  __// / / // /_/ //  __// /
	 * /_/  /_/ \___//____//____/ \___//_/ /_/ \__, / \___//_/
	 *                                        /____/
	 *
	 * @description MessengerJS, a common cross-document communicate solution.
	 * @author biqing kwok
	 * @version 2.0
	 * @license release under MIT license
	 */

	module.exports = (function(){

	    // 消息前缀, 建议使用自己的项目名, 避免多项目之间的冲突
	    var prefix = "arale-messenger",
	        supportPostMessage = 'postMessage' in window;

	    // Target 类, 消息对象
	    function Target(target, name){
	        var errMsg = '';
	        if(arguments.length < 2){
	            errMsg = 'target error - target and name are both required';
	        } else if (typeof target != 'object'){
	            errMsg = 'target error - target itself must be window object';
	        } else if (typeof name != 'string'){
	            errMsg = 'target error - target name must be string type';
	        }
	        if(errMsg){
	            throw new Error(errMsg);
	        }
	        this.target = target;
	        this.name = name;
	    }

	    // 往 target 发送消息, 出于安全考虑, 发送消息会带上前缀
	    if ( supportPostMessage ){
	        // IE8+ 以及现代浏览器支持
	        Target.prototype.send = function(msg){
	            this.target.postMessage(prefix + msg, '*');
	        };
	    } else {
	        // 兼容IE 6/7
	        Target.prototype.send = function(msg){
	            var targetFunc = window.navigator[prefix + this.name];
	            if ( typeof targetFunc == 'function' ) {
	                targetFunc(prefix + msg, window);
	            } else {
	                throw new Error("target callback function is not defined");
	            }
	        };
	    }

	    // 信使类
	    // 创建Messenger实例时指定, 必须指定Messenger的名字, (可选)指定项目名, 以避免Mashup类应用中的冲突
	    // !注意: 父子页面中projectName必须保持一致, 否则无法匹配
	    function Messenger(messengerName, projectName){
	        this.targets = {};
	        this.name = messengerName;
	        this.listenFunc = [];
	        prefix = projectName || prefix;
	        this.initListen();
	    }

	    // 添加一个消息对象
	    Messenger.prototype.addTarget = function(target, name){
	        var targetObj = new Target(target, name);
	        this.targets[name] = targetObj;
	    };

	    // 初始化消息监听
	    Messenger.prototype.initListen = function(){
	        var self = this;
	        var generalCallback = function(msg){
	            if(typeof msg == 'object' && msg.data){
	                msg = msg.data;
	            }
	            // 剥离消息前缀
	            msg = msg.slice(prefix.length);
	            for(var i = 0; i < self.listenFunc.length; i++){
	                self.listenFunc[i](msg);
	            }
	        };

	        if ( supportPostMessage ){
	            if ( 'addEventListener' in document ) {
	                window.addEventListener('message', generalCallback, false);
	            } else if ( 'attachEvent' in document ) {
	                window.attachEvent('onmessage', generalCallback);
	            }
	        } else {
	            // 兼容IE 6/7
	            window.navigator[prefix + this.name] = generalCallback;
	        }
	    };

	    // 监听消息
	    Messenger.prototype.listen = function(callback){
	        this.listenFunc.push(callback);
	    };
	    // 注销监听
	    Messenger.prototype.clear = function(){
	        this.listenFunc = [];
	    };
	    // 广播消息
	    Messenger.prototype.send = function(msg){
	        var targets = this.targets,
	            target;
	        for(target in targets){
	            if(targets.hasOwnProperty(target)){
	                targets[target].send(msg);
	            }
	        }
	    };

	    return Messenger;

	})();


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(1),
	    Position = __webpack_require__(12),
	    Shim = __webpack_require__(15),
	    Widget = __webpack_require__(2);


	// Overlay
	// -------
	// Overlay 组件的核心特点是可定位（Positionable）和可层叠（Stackable）
	// 是一切悬浮类 UI 组件的基类
	var Overlay = Widget.extend({

	  attrs: {
	    // 基本属性
	    width: null,
	    height: null,
	    zIndex: 99,
	    visible: false,

	    // 定位配置
	    align: {
	      // element 的定位点，默认为左上角
	      selfXY: [0, 0],
	      // 基准定位元素，默认为当前可视区域
	      baseElement: Position.VIEWPORT,
	      // 基准定位元素的定位点，默认为左上角
	      baseXY: [0, 0]
	    },

	    // 父元素
	    parentNode: document.body
	  },

	  show: function () {
	    // 若从未渲染，则调用 render
	    if (!this.rendered) {
	      this.render();
	    }
	    this.set('visible', true);
	    return this;
	  },

	  hide: function () {
	    this.set('visible', false);
	    return this;
	  },

	  setup: function () {
	    var that = this;
	    // 加载 iframe 遮罩层并与 overlay 保持同步
	    this._setupShim();
	    // 窗口resize时，重新定位浮层
	    this._setupResize();

	    this.after('render', function () {
	      var _pos = this.element.css('position');
	      if (_pos === 'static' || _pos === 'relative') {
	        this.element.css({
	          position: 'absolute',
	          left: '-9999px',
	          top: '-9999px'
	        });
	      }
	    });
	    // 统一在显示之后重新设定位置
	    this.after('show', function () {
	      that._setPosition();
	    });
	  },

	  destroy: function () {
	    // 销毁两个静态数组中的实例
	    erase(this, Overlay.allOverlays);
	    erase(this, Overlay.blurOverlays);
	    return Overlay.superclass.destroy.call(this);
	  },

	  // 进行定位
	  _setPosition: function (align) {
	    // 不在文档流中，定位无效
	    if (!isInDocument(this.element[0])) return;

	    align || (align = this.get('align'));

	    // 如果align为空，表示不需要使用js对齐
	    if (!align) return;

	    var isHidden = this.element.css('display') === 'none';

	    // 在定位时，为避免元素高度不定，先显示出来
	    if (isHidden) {
	      this.element.css({
	        visibility: 'hidden',
	        display: 'block'
	      });
	    }

	    Position.pin({
	      element: this.element,
	      x: align.selfXY[0],
	      y: align.selfXY[1]
	    }, {
	      element: align.baseElement,
	      x: align.baseXY[0],
	      y: align.baseXY[1]
	    });

	    // 定位完成后，还原
	    if (isHidden) {
	      this.element.css({
	        visibility: '',
	        display: 'none'
	      });
	    }

	    return this;
	  },

	  // 加载 iframe 遮罩层并与 overlay 保持同步
	  _setupShim: function () {
	    var shim = new Shim(this.element);

	    // 在隐藏和设置位置后，要重新定位
	    // 显示后会设置位置，所以不用绑定 shim.sync
	    this.after('hide _setPosition', shim.sync, shim);

	    // 除了 parentNode 之外的其他属性发生变化时，都触发 shim 同步
	    var attrs = ['width', 'height'];
	    for (var attr in attrs) {
	      if (attrs.hasOwnProperty(attr)) {
	        this.on('change:' + attr, shim.sync, shim);
	      }
	    }

	    // 在销魂自身前要销毁 shim
	    this.before('destroy', shim.destroy, shim);
	  },

	  // resize窗口时重新定位浮层，用这个方法收集所有浮层实例
	  _setupResize: function () {
	    Overlay.allOverlays.push(this);
	  },

	  // 除了 element 和 relativeElements，点击 body 后都会隐藏 element
	  _blurHide: function (arr) {
	    arr = $.makeArray(arr);
	    arr.push(this.element);
	    this._relativeElements = arr;
	    Overlay.blurOverlays.push(this);
	  },

	  // 用于 set 属性后的界面更新
	  _onRenderWidth: function (val) {
	    this.element.css('width', val);
	  },

	  _onRenderHeight: function (val) {
	    this.element.css('height', val);
	  },

	  _onRenderZIndex: function (val) {
	    this.element.css('zIndex', val);
	  },

	  _onRenderAlign: function (val) {
	    this._setPosition(val);
	  },

	  _onRenderVisible: function (val) {
	    this.element[val ? 'show' : 'hide']();
	  }

	});

	// 绑定 blur 隐藏事件
	Overlay.blurOverlays = [];
	$(document).on('click', function (e) {
	  hideBlurOverlays(e);
	});

	// 绑定 resize 重新定位事件
	var timeout;
	var winWidth = $(window).width();
	var winHeight = $(window).height();
	Overlay.allOverlays = [];

	$(window).resize(function () {
	  timeout && clearTimeout(timeout);
	  timeout = setTimeout(function () {
	    var winNewWidth = $(window).width();
	    var winNewHeight = $(window).height();

	    // IE678 莫名其妙触发 resize
	    // http://stackoverflow.com/questions/1852751/window-resize-event-firing-in-internet-explorer
	    if (winWidth !== winNewWidth || winHeight !== winNewHeight) {
	      $(Overlay.allOverlays).each(function (i, item) {
	        // 当实例为空或隐藏时，不处理
	        if (!item || !item.get('visible')) {
	          return;
	        }
	        item._setPosition();
	      });
	    }

	    winWidth = winNewWidth;
	    winHeight = winNewHeight;
	  }, 80);
	});

	module.exports = Overlay;


	// Helpers
	// -------

	function isInDocument(element) {
	  return $.contains(document.documentElement, element);
	}

	function hideBlurOverlays(e) {
	  $(Overlay.blurOverlays).each(function (index, item) {
	    // 当实例为空或隐藏时，不处理
	    if (!item || !item.get('visible')) {
	      return;
	    }

	    // 遍历 _relativeElements ，当点击的元素落在这些元素上时，不处理
	    for (var i = 0; i < item._relativeElements.length; i++) {
	      var el = $(item._relativeElements[i])[0];
	      if (el === e.target || $.contains(el, e.target)) {
	        return;
	      }
	    }

	    // 到这里，判断触发了元素的 blur 事件，隐藏元素
	    item.hide();
	  });
	}

	// 从数组中删除对应元素


	function erase(target, array) {
	  for (var i = 0; i < array.length; i++) {
	    if (target === array[i]) {
	      array.splice(i, 1);
	      return array;
	    }
	  }
	}


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(65);


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(1);

	__webpack_require__(24);

	var SCROLLX = 'scrollx';
	var SCROLLY = 'scrolly';
	var FADE = 'fade';


	// 切换效果插件
	module.exports = {
	  attrs: {
	    // 切换效果，可取 scrollx | scrolly | fade 或直接传入 effect function
	    effect: 'none',
	    easing: 'linear',
	    duration: 500
	  },

	  isNeeded: function () {
	    return this.get('effect') !== 'none';
	  },

	  install: function () {
	    var panels = this.get('panels');

	    // 注：
	    // 1. 所有 panel 的尺寸应该相同
	    //    最好指定第一个 panel 的 width 和 height
	    //    因为 Safari 下，图片未加载时，读取的 offsetHeight 等值会不对
	    // 2. 初始化 panels 样式
	    //    这些特效需要将 panels 都显示出来
	    // 3. 在 CSS 里，需要给 container 设定高宽和 overflow: hidden
	    panels.show();
	    var effect = this.get('effect');
	    var step = this.get('step');

	    var isFunction = $.isFunction(effect);

	    // 初始化滚动效果
	    if (!isFunction && effect.indexOf('scroll') === 0) {
	      var content = this.content;
	      var firstPanel = panels.eq(0);

	      // 设置定位信息，为滚动效果做铺垫
	      content.css('position', 'relative');

	      // 注：content 的父级不一定是 container
	      if (content.parent().css('position') === 'static') {
	        content.parent().css('position', 'relative');
	      }

	      // 水平排列
	      if (effect === SCROLLX) {
	        panels.css('float', 'left');
	        // 设置最大宽度，以保证有空间让 panels 水平排布
	        // 35791197px 为 360 下 width 最大数值
	        content.width('35791197px');
	      }

	      // 只有 scrollX, scrollY 需要设置 viewSize
	      // 其他情况下不需要
	      var viewSize = this.get('viewSize');
	      if (!viewSize[0]) {
	        viewSize[0] = firstPanel.outerWidth() * step;
	        viewSize[1] = firstPanel.outerHeight() * step;
	        this.set('viewSize', viewSize);
	      }

	      if (!viewSize[0]) {
	        throw new Error('Please specify viewSize manually');
	      }
	    }
	    // 初始化淡隐淡出效果
	    else if (!isFunction && effect === FADE) {
	      var activeIndex = this.get('activeIndex');
	      var min = activeIndex * step;
	      var max = min + step - 1;

	      panels.each(function (i, panel) {
	        var isActivePanel = i >= min && i <= max;
	        $(panel).css({
	          opacity: isActivePanel ? 1 : 0,
	          position: 'absolute',
	          zIndex: isActivePanel ? 9 : 1
	        });
	      });
	    }

	    // 覆盖 switchPanel 方法
	    this._switchPanel = function (panelInfo) {
	      var effect = this.get('effect');
	      var fn = $.isFunction(effect) ? effect : Effects[effect];
	      fn.call(this, panelInfo);
	    };
	  }
	};


	// 切换效果方法集
	var Effects = {

	  // 淡隐淡现效果
	  fade: function (panelInfo) {
	    // 简单起见，目前不支持 step > 1 的情景。若需要此效果时，可修改结构来达成。
	    if (this.get('step') > 1) {
	      throw new Error('Effect "fade" only supports step === 1');
	    }

	    var fromPanel = panelInfo.fromPanels.eq(0);
	    var toPanel = panelInfo.toPanels.eq(0);

	    if (this.anim) {
	      // 立刻停止，以开始新的
	      this.anim.stop(false, true);
	    }

	    // 首先显示下一张
	    toPanel.css('opacity', 1);
	    toPanel.show();

	    if (panelInfo.fromIndex > -1) {
	      var that = this;
	      var duration = this.get('duration');
	      var easing = this.get('easing');

	      // 动画切换
	      this.anim = fromPanel.animate({
	        opacity: 0
	      }, duration, easing, function () {
	        that.anim = null; // free
	        // 切换 z-index
	        toPanel.css('zIndex', 9);
	        fromPanel.css('zIndex', 1);
	        fromPanel.css('display', 'none');
	      });
	    }
	    // 初始情况下没有必要动画切换
	    else {
	      toPanel.css('zIndex', 9);
	    }
	  },

	  // 水平/垂直滚动效果
	  scroll: function (panelInfo) {
	    var isX = this.get('effect') === SCROLLX;
	    var diff = this.get('viewSize')[isX ? 0 : 1] * panelInfo.toIndex;

	    var props = {};
	    props[isX ? 'left' : 'top'] = -diff + 'px';

	    if (this.anim) {
	      this.anim.stop();
	    }

	    if (panelInfo.fromIndex > -1) {
	      var that = this;
	      var duration = this.get('duration');
	      var easing = this.get('easing');

	      this.anim = this.content.animate(props, duration, easing, function () {
	        that.anim = null; // free
	      });
	    }
	    else {
	      this.content.css(props);
	    }
	  }
	};

	Effects[SCROLLY] = Effects.scroll;
	Effects[SCROLLX] = Effects.scroll;
	module.exports.Effects = Effects;

/***/ },
/* 29 */
/***/ function(module, exports) {

	var async = {};

	module.exports = async;

	//// cross-browser compatiblity functions ////

	var _forEach = function (arr, iterator) {
	  if (arr.forEach) {
	    return arr.forEach(iterator);
	  }
	  for (var i = 0; i < arr.length; i += 1) {
	    iterator(arr[i], i, arr);
	  }
	};

	var _map = function (arr, iterator) {
	  if (arr.map) {
	    return arr.map(iterator);
	  }
	  var results = [];
	  _forEach(arr, function (x, i, a) {
	    results.push(iterator(x, i, a));
	  });
	  return results;
	};

	var _keys = function (obj) {
	  if (Object.keys) {
	    return Object.keys(obj);
	  }
	  var keys = [];
	  for (var k in obj) {
	    if (obj.hasOwnProperty(k)) {
	      keys.push(k);
	    }
	  }
	  return keys;
	};

	//// exported async module functions ////

	async.forEach = function (arr, iterator, callback) {
	  callback = callback || function () {
	  };
	  if (!arr.length) {
	    return callback();
	  }
	  var completed = 0;
	  _forEach(arr, function (x) {
	    iterator(x, function (err) {
	      if (err) {
	        callback(err);
	        callback = function () {
	        };
	      }
	      else {
	        completed += 1;
	        if (completed === arr.length) {
	          callback(null);
	        }
	      }
	    });
	  });
	};

	async.forEachSeries = function (arr, iterator, callback) {
	  callback = callback || function () {
	  };
	  if (!arr.length) {
	    return callback();
	  }
	  var completed = 0;
	  var iterate = function () {
	    iterator(arr[completed], function (err) {
	      if (err) {
	        callback(err);
	        callback = function () {
	        };
	      }
	      else {
	        completed += 1;
	        if (completed === arr.length) {
	          callback(null);
	        }
	        else {
	          iterate();
	        }
	      }
	    });
	  };
	  iterate();
	};

	var doParallel = function (fn) {
	  return function () {
	    var args = Array.prototype.slice.call(arguments);
	    return fn.apply(null, [async.forEach].concat(args));
	  };
	};
	var doSeries = function (fn) {
	  return function () {
	    var args = Array.prototype.slice.call(arguments);
	    return fn.apply(null, [async.forEachSeries].concat(args));
	  };
	};


	var _asyncMap = function (eachfn, arr, iterator, callback) {
	  var results = [];
	  arr = _map(arr, function (x, i) {
	    return {index: i, value: x};
	  });
	  eachfn(arr, function (x, callback) {
	    iterator(x.value, function (err, v) {
	      results[x.index] = v;
	      callback(err);
	    });
	  }, function (err) {
	    callback(err, results);
	  });
	};
	async.map = doParallel(_asyncMap);
	async.mapSeries = doSeries(_asyncMap);

	async.series = function (tasks, callback) {
	  callback = callback || function () {
	  };
	  if (tasks.constructor === Array) {
	    async.mapSeries(tasks, function (fn, callback) {
	      if (fn) {
	        fn(function (err) {
	          var args = Array.prototype.slice.call(arguments, 1);
	          if (args.length <= 1) {
	            args = args[0];
	          }
	          callback.call(null, err, args);
	        });
	      }
	    }, callback);
	  }
	  else {
	    var results = {};
	    async.forEachSeries(_keys(tasks), function (k, callback) {
	      tasks[k](function (err) {
	        var args = Array.prototype.slice.call(arguments, 1);
	        if (args.length <= 1) {
	          args = args[0];
	        }
	        results[k] = args;
	        callback(err);
	      });
	    }, function (err) {
	      callback(err, results);
	    });
	  }
	};


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(1),
	    Rule = __webpack_require__(16);

	var u_count = 0;
	var helpers = {};


	function unique() {
	    return '__anonymous__' + (u_count++);
	}

	function parseRules(str) {
	    if (!str) return null;

	    return str.match(/[a-zA-Z0-9\-\_]+(\{[^\{\}]*\})?/g);
	}

	function parseDom(field) {
	    var field = $(field);

	    var result = {};
	    var arr = [];

	    //parse required attribute
	    var required = field.attr('required');
	    if (required) {
	        arr.push('required');
	        result.required = true;
	    }

	    //parse type attribute
	    var type = field.attr('type');
	    if (type && type != 'submit' && type != 'cancel' && type != 'checkbox' && type != 'radio' && type != 'select' && type != 'select-one' && type != 'file' && type != 'hidden' && type != 'textarea') {

	        if (!Rule.getRule(type)) {
	            throw new Error('Form field with type "' + type + '" not supported!');
	        }

	        arr.push(type);
	    }

	    //parse min attribute
	    var min = field.attr('min');
	    if (min) {
	        arr.push('min{"min":"' + min + '"}');
	    }

	    //parse max attribute
	    var max = field.attr('max');
	    if (max) {
	        arr.push('max{max:' + max + '}');
	    }

	    //parse minlength attribute
	    var minlength = field.attr('minlength');
	    if (minlength) {
	        arr.push('minlength{min:' + minlength + '}');
	    }

	    //parse maxlength attribute
	    var maxlength = field.attr('maxlength');
	    if (maxlength) {
	        arr.push('maxlength{max:' + maxlength + '}');
	    }

	    //parse pattern attribute
	    var pattern = field.attr('pattern');
	    if (pattern) {
	        var regexp = new RegExp(pattern),
	            name = unique();
	        Rule.addRule(name, regexp);
	        arr.push(name);
	    }

	    //parse data-rule attribute to get custom rules
	    var rules = field.attr('data-rule');
	    rules = rules && parseRules(rules);
	    if (rules)
	        arr = arr.concat(rules);

	    result.rule = arr.length == 0 ? null : arr.join(' ');

	    return result;
	}

	function parseJSON(str) {
	    if (!str)
	        return null;

	    var NOTICE = 'Invalid option object "' + str + '".';

	    // remove braces
	    str = str.slice(1, -1);

	    var result = {};

	    var arr = str.split(',');
	    $.each(arr, function (i, v) {
	        arr[i] = $.trim(v);
	        if (!arr[i])
	            throw new Error(NOTICE);

	        var arr2 = arr[i].split(':');

	        var key = $.trim(arr2[0]),
	            value = $.trim(arr2[1]);

	        if (!key || !value)
	            throw new Error(NOTICE);

	        result[getValue(key)] = $.trim(getValue(value));
	    });

	    // 'abc' -> 'abc'  '"abc"' -> 'abc'
	    function getValue(str) {
	        if (str.charAt(0) == '"' && str.charAt(str.length - 1) == '"' || str.charAt(0) == "'" && str.charAt(str.length - 1) == "'") {
	            return eval(str);
	        }
	        return str;
	    }

	    return result;
	}

	function isHidden (ele) {
	    var w = ele[0].offsetWidth,
	        h = ele[0].offsetHeight,
	        force = (ele.prop('tagName') === 'TR');
	    return (w===0 && h===0 && !force) ? true : (w!==0 && h!==0 && !force) ? false : ele.css('display') === 'none';
	}

	module.exports = {
	    parseRule: function (str) {
	        var match = str.match(/([^{}:\s]*)(\{[^\{\}]*\})?/);

	        // eg. { name: "valueBetween", param: {min: 1, max: 2} }
	        return {
	            name: match[1],
	            param: parseJSON(match[2])
	        };
	    },
	    parseRules: parseRules,
	    parseDom: parseDom,
	    isHidden: isHidden,
	    helper: function (name, fn) {
	        if (fn) {
	            helpers[name] = fn;
	            return this;
	        }

	        return helpers[name];
	    }
	};



/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Exception = __webpack_require__(4)["default"];

	function LocationInfo(locInfo){
	  locInfo = locInfo || {};
	  this.firstLine   = locInfo.first_line;
	  this.firstColumn = locInfo.first_column;
	  this.lastColumn  = locInfo.last_column;
	  this.lastLine    = locInfo.last_line;
	}

	var AST = {
	  ProgramNode: function(statements, inverseStrip, inverse, locInfo) {
	    var inverseLocationInfo, firstInverseNode;
	    if (arguments.length === 3) {
	      locInfo = inverse;
	      inverse = null;
	    } else if (arguments.length === 2) {
	      locInfo = inverseStrip;
	      inverseStrip = null;
	    }

	    LocationInfo.call(this, locInfo);
	    this.type = "program";
	    this.statements = statements;
	    this.strip = {};

	    if(inverse) {
	      firstInverseNode = inverse[0];
	      if (firstInverseNode) {
	        inverseLocationInfo = {
	          first_line: firstInverseNode.firstLine,
	          last_line: firstInverseNode.lastLine,
	          last_column: firstInverseNode.lastColumn,
	          first_column: firstInverseNode.firstColumn
	        };
	        this.inverse = new AST.ProgramNode(inverse, inverseStrip, inverseLocationInfo);
	      } else {
	        this.inverse = new AST.ProgramNode(inverse, inverseStrip);
	      }
	      this.strip.right = inverseStrip.left;
	    } else if (inverseStrip) {
	      this.strip.left = inverseStrip.right;
	    }
	  },

	  MustacheNode: function(rawParams, hash, open, strip, locInfo) {
	    LocationInfo.call(this, locInfo);
	    this.type = "mustache";
	    this.strip = strip;

	    // Open may be a string parsed from the parser or a passed boolean flag
	    if (open != null && open.charAt) {
	      // Must use charAt to support IE pre-10
	      var escapeFlag = open.charAt(3) || open.charAt(2);
	      this.escaped = escapeFlag !== '{' && escapeFlag !== '&';
	    } else {
	      this.escaped = !!open;
	    }

	    if (rawParams instanceof AST.SexprNode) {
	      this.sexpr = rawParams;
	    } else {
	      // Support old AST API
	      this.sexpr = new AST.SexprNode(rawParams, hash);
	    }

	    this.sexpr.isRoot = true;

	    // Support old AST API that stored this info in MustacheNode
	    this.id = this.sexpr.id;
	    this.params = this.sexpr.params;
	    this.hash = this.sexpr.hash;
	    this.eligibleHelper = this.sexpr.eligibleHelper;
	    this.isHelper = this.sexpr.isHelper;
	  },

	  SexprNode: function(rawParams, hash, locInfo) {
	    LocationInfo.call(this, locInfo);

	    this.type = "sexpr";
	    this.hash = hash;

	    var id = this.id = rawParams[0];
	    var params = this.params = rawParams.slice(1);

	    // a mustache is an eligible helper if:
	    // * its id is simple (a single part, not `this` or `..`)
	    var eligibleHelper = this.eligibleHelper = id.isSimple;

	    // a mustache is definitely a helper if:
	    // * it is an eligible helper, and
	    // * it has at least one parameter or hash segment
	    this.isHelper = eligibleHelper && (params.length || hash);

	    // if a mustache is an eligible helper but not a definite
	    // helper, it is ambiguous, and will be resolved in a later
	    // pass or at runtime.
	  },

	  PartialNode: function(partialName, context, strip, locInfo) {
	    LocationInfo.call(this, locInfo);
	    this.type         = "partial";
	    this.partialName  = partialName;
	    this.context      = context;
	    this.strip = strip;
	  },

	  BlockNode: function(mustache, program, inverse, close, locInfo) {
	    LocationInfo.call(this, locInfo);

	    if(mustache.sexpr.id.original !== close.path.original) {
	      throw new Exception(mustache.sexpr.id.original + " doesn't match " + close.path.original, this);
	    }

	    this.type = 'block';
	    this.mustache = mustache;
	    this.program  = program;
	    this.inverse  = inverse;

	    this.strip = {
	      left: mustache.strip.left,
	      right: close.strip.right
	    };

	    (program || inverse).strip.left = mustache.strip.right;
	    (inverse || program).strip.right = close.strip.left;

	    if (inverse && !program) {
	      this.isInverse = true;
	    }
	  },

	  ContentNode: function(string, locInfo) {
	    LocationInfo.call(this, locInfo);
	    this.type = "content";
	    this.string = string;
	  },

	  HashNode: function(pairs, locInfo) {
	    LocationInfo.call(this, locInfo);
	    this.type = "hash";
	    this.pairs = pairs;
	  },

	  IdNode: function(parts, locInfo) {
	    LocationInfo.call(this, locInfo);
	    this.type = "ID";

	    var original = "",
	        dig = [],
	        depth = 0;

	    for(var i=0,l=parts.length; i<l; i++) {
	      var part = parts[i].part;
	      original += (parts[i].separator || '') + part;

	      if (part === ".." || part === "." || part === "this") {
	        if (dig.length > 0) {
	          throw new Exception("Invalid path: " + original, this);
	        } else if (part === "..") {
	          depth++;
	        } else {
	          this.isScoped = true;
	        }
	      } else {
	        dig.push(part);
	      }
	    }

	    this.original = original;
	    this.parts    = dig;
	    this.string   = dig.join('.');
	    this.depth    = depth;

	    // an ID is simple if it only has one part, and that part is not
	    // `..` or `this`.
	    this.isSimple = parts.length === 1 && !this.isScoped && depth === 0;

	    this.stringModeValue = this.string;
	  },

	  PartialNameNode: function(name, locInfo) {
	    LocationInfo.call(this, locInfo);
	    this.type = "PARTIAL_NAME";
	    this.name = name.original;
	  },

	  DataNode: function(id, locInfo) {
	    LocationInfo.call(this, locInfo);
	    this.type = "DATA";
	    this.id = id;
	  },

	  StringNode: function(string, locInfo) {
	    LocationInfo.call(this, locInfo);
	    this.type = "STRING";
	    this.original =
	      this.string =
	      this.stringModeValue = string;
	  },

	  IntegerNode: function(integer, locInfo) {
	    LocationInfo.call(this, locInfo);
	    this.type = "INTEGER";
	    this.original =
	      this.integer = integer;
	    this.stringModeValue = Number(integer);
	  },

	  BooleanNode: function(bool, locInfo) {
	    LocationInfo.call(this, locInfo);
	    this.type = "BOOLEAN";
	    this.bool = bool;
	    this.stringModeValue = bool === "true";
	  },

	  CommentNode: function(comment, locInfo) {
	    LocationInfo.call(this, locInfo);
	    this.type = "comment";
	    this.comment = comment;
	  }
	};

	// Must be exported as an object rather than the root of the module as the jison lexer
	// most modify the object to operate properly.
	exports["default"] = AST;

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var parser = __webpack_require__(94)["default"];
	var AST = __webpack_require__(31)["default"];

	exports.parser = parser;

	function parse(input) {
	  // Just return if an already-compile AST was passed in.
	  if(input.constructor === AST.ProgramNode) { return input; }

	  parser.yy = AST;
	  return parser.parse(input);
	}

	exports.parse = parse;

/***/ },
/* 33 */
/***/ function(module, exports) {

	"use strict";
	// Build out our basic SafeString type
	function SafeString(string) {
	  this.string = string;
	}

	SafeString.prototype.toString = function() {
	  return "" + this.string;
	};

	exports["default"] = SafeString;

/***/ },
/* 34 */
/***/ function(module, exports) {

	"use strict";
	// Build out our basic SafeString type
	function SafeString(string) {
	  this.string = string;
	}

	SafeString.prototype.toString = function() {
	  return "" + this.string;
	};

	exports["default"] = SafeString;

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isIE9 = memoize(function() {
			return /msie 9\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0;

	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isIE9();

		var styles = listToStyles(list);
		addStylesToDom(styles, options);

		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function createStyleElement() {
		var styleElement = document.createElement("style");
		var head = getHeadElement();
		styleElement.type = "text/css";
		head.appendChild(styleElement);
		return styleElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement());
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else {
			styleElement = createStyleElement();
			update = applyToTag.bind(null, styleElement);
			remove = function () {
				styleElement.parentNode.removeChild(styleElement);
			};
		}

		update(obj);

		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	function replaceText(source, id, replacement) {
		var boundaries = ["/** >>" + id + " **/", "/** " + id + "<< **/"];
		var start = source.lastIndexOf(boundaries[0]);
		var wrappedReplacement = replacement
			? (boundaries[0] + replacement + boundaries[1])
			: "";
		if (source.lastIndexOf(boundaries[0]) >= 0) {
			var end = source.lastIndexOf(boundaries[1]) + boundaries[1].length;
			return source.slice(0, start) + wrappedReplacement + source.slice(end);
		} else {
			return source + wrappedReplacement;
		}
	}

	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(styleElement.styleSheet.cssText, index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;

		if(sourceMap && typeof btoa === "function") {
			try {
				css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(JSON.stringify(sourceMap)) + " */";
				css = "@import url(\"data:text/css;base64," + btoa(css) + "\")";
			} catch(e) {}
		}

		if(media) {
			styleElement.setAttribute("media", media)
		}

		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}


/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	var Handlebars = __webpack_require__(13);
	module.exports = (Handlebars["default"] || Handlebars).template(function (Handlebars,depth0,helpers,partials,data) {
	  this.compilerInfo = [4,'>= 1.0.0'];
	helpers = this.merge(helpers, Handlebars.helpers); partials = this.merge(partials, Handlebars.partials); data = data || {};
	  var buffer = "", stack1, helper, self=this, functionType="function", escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;

	function program1(depth0,data,depth1) {
	  
	  var buffer = "", stack1, helper, options;
	  buffer += "\n      <li data-role=\"item\" class=\""
	    + escapeExpression(((stack1 = (depth1 && depth1.classPrefix)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
	    + "-item\">\n        ";
	  stack1 = (helper = helpers.include || (depth1 && depth1.include),options={hash:{
	    'parent': (depth1)
	  },inverse:self.noop,fn:self.program(2, program2, data),data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "include", options));
	  if(stack1 || stack1 === 0) { buffer += stack1; }
	  buffer += "\n      </li>\n    ";
	  return buffer;
	  }
	function program2(depth0,data) {
	  
	  var stack1;
	  stack1 = self.invokePartial(partials.html, 'html', depth0, helpers, partials, data);
	  if(stack1 || stack1 === 0) { return stack1; }
	  else { return ''; }
	  }

	  buffer += "<div class=\"";
	  if (helper = helpers.classPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
	  else { helper = (depth0 && depth0.classPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
	  buffer += escapeExpression(stack1)
	    + "\">\n  <div class=\"";
	  if (helper = helpers.classPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
	  else { helper = (depth0 && depth0.classPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
	  buffer += escapeExpression(stack1)
	    + "-content\">\n    ";
	  stack1 = self.invokePartial(partials.header, 'header', depth0, helpers, partials, data);
	  if(stack1 || stack1 === 0) { buffer += stack1; }
	  buffer += "\n    <ul data-role=\"items\">\n    ";
	  stack1 = helpers.each.call(depth0, (depth0 && depth0.items), {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data});
	  if(stack1 || stack1 === 0) { buffer += stack1; }
	  buffer += "\n    </ul>\n    ";
	  stack1 = self.invokePartial(partials.footer, 'footer', depth0, helpers, partials, data);
	  if(stack1 || stack1 === 0) { buffer += stack1; }
	  buffer += "\n  </div>\n</div>\n";
	  return buffer;
	  });


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	var Handlebars = __webpack_require__(13);
	module.exports = (Handlebars["default"] || Handlebars).template(function (Handlebars,depth0,helpers,partials,data) {
	  this.compilerInfo = [4,'>= 1.0.0'];
	helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
	  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression, self=this;

	function program1(depth0,data) {
	  
	  var buffer = "", stack1, helper;
	  buffer += "\n<div class=\"";
	  if (helper = helpers.classPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
	  else { helper = (depth0 && depth0.classPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
	  buffer += escapeExpression(stack1)
	    + "-title\" data-role=\"title\">";
	  if (helper = helpers.title) { stack1 = helper.call(depth0, {hash:{},data:data}); }
	  else { helper = (depth0 && depth0.title); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
	  if(stack1 || stack1 === 0) { buffer += stack1; }
	  buffer += "</div>\n";
	  return buffer;
	  }

	function program3(depth0,data) {
	  
	  var buffer = "", stack1, helper;
	  buffer += "\n    <div class=\"";
	  if (helper = helpers.classPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
	  else { helper = (depth0 && depth0.classPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
	  buffer += escapeExpression(stack1)
	    + "-operation\" data-role=\"foot\">\n        ";
	  stack1 = helpers['if'].call(depth0, (depth0 && depth0.confirmTpl), {hash:{},inverse:self.noop,fn:self.program(4, program4, data),data:data});
	  if(stack1 || stack1 === 0) { buffer += stack1; }
	  buffer += "\n        ";
	  stack1 = helpers['if'].call(depth0, (depth0 && depth0.cancelTpl), {hash:{},inverse:self.noop,fn:self.program(6, program6, data),data:data});
	  if(stack1 || stack1 === 0) { buffer += stack1; }
	  buffer += "\n    </div>\n    ";
	  return buffer;
	  }
	function program4(depth0,data) {
	  
	  var buffer = "", stack1, helper;
	  buffer += "\n        <div class=\"";
	  if (helper = helpers.classPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
	  else { helper = (depth0 && depth0.classPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
	  buffer += escapeExpression(stack1)
	    + "-confirm\" data-role=\"confirm\">\n            ";
	  if (helper = helpers.confirmTpl) { stack1 = helper.call(depth0, {hash:{},data:data}); }
	  else { helper = (depth0 && depth0.confirmTpl); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
	  if(stack1 || stack1 === 0) { buffer += stack1; }
	  buffer += "\n        </div>\n        ";
	  return buffer;
	  }

	function program6(depth0,data) {
	  
	  var buffer = "", stack1, helper;
	  buffer += "\n        <div class=\"";
	  if (helper = helpers.classPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
	  else { helper = (depth0 && depth0.classPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
	  buffer += escapeExpression(stack1)
	    + "-cancel\" data-role=\"cancel\">\n            ";
	  if (helper = helpers.cancelTpl) { stack1 = helper.call(depth0, {hash:{},data:data}); }
	  else { helper = (depth0 && depth0.cancelTpl); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
	  if(stack1 || stack1 === 0) { buffer += stack1; }
	  buffer += "\n        </div>\n        ";
	  return buffer;
	  }

	  stack1 = helpers['if'].call(depth0, (depth0 && depth0.title), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
	  if(stack1 || stack1 === 0) { buffer += stack1; }
	  buffer += "\n<div class=\"";
	  if (helper = helpers.classPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
	  else { helper = (depth0 && depth0.classPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
	  buffer += escapeExpression(stack1)
	    + "-container\">\n    <div class=\"";
	  if (helper = helpers.classPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
	  else { helper = (depth0 && depth0.classPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
	  buffer += escapeExpression(stack1)
	    + "-message\" data-role=\"message\">";
	  if (helper = helpers.message) { stack1 = helper.call(depth0, {hash:{},data:data}); }
	  else { helper = (depth0 && depth0.message); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
	  if(stack1 || stack1 === 0) { buffer += stack1; }
	  buffer += "</div>\n    ";
	  stack1 = helpers['if'].call(depth0, (depth0 && depth0.hasFoot), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
	  if(stack1 || stack1 === 0) { buffer += stack1; }
	  buffer += "\n</div>\n";
	  return buffer;
	  });


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	var Handlebars = __webpack_require__(13);
	module.exports = (Handlebars["default"] || Handlebars).template(function (Handlebars,depth0,helpers,partials,data) {
	  this.compilerInfo = [4,'>= 1.0.0'];
	helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
	  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression;


	  buffer += "<div class=\"";
	  if (helper = helpers.classPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
	  else { helper = (depth0 && depth0.classPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
	  buffer += escapeExpression(stack1)
	    + "\">\n    <a class=\"";
	  if (helper = helpers.classPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
	  else { helper = (depth0 && depth0.classPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
	  buffer += escapeExpression(stack1)
	    + "-close\" title=\"Close\" href=\"javascript:;\" data-role=\"close\"></a>\n    <div class=\"";
	  if (helper = helpers.classPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
	  else { helper = (depth0 && depth0.classPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
	  buffer += escapeExpression(stack1)
	    + "-content\" data-role=\"content\"></div>\n</div>\n";
	  return buffer;
	  });


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	var Handlebars = __webpack_require__(13);
	module.exports = (Handlebars["default"] || Handlebars).template(function (Handlebars,depth0,helpers,partials,data) {
	  this.compilerInfo = [4,'>= 1.0.0'];
	helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
	  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

	function program1(depth0,data,depth1) {
	  
	  var buffer = "", stack1, helper, options;
	  buffer += "\n        <li data-role=\"item\"\n          class=\""
	    + escapeExpression(((stack1 = (depth1 && depth1.classPrefix)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
	    + "-item ";
	  stack1 = helpers['if'].call(depth0, (depth0 && depth0.disabled), {hash:{},inverse:self.noop,fn:self.programWithDepth(2, program2, data, depth1),data:data});
	  if(stack1 || stack1 === 0) { buffer += stack1; }
	  buffer += "\"\n          data-value=\"";
	  if (helper = helpers.value) { stack1 = helper.call(depth0, {hash:{},data:data}); }
	  else { helper = (depth0 && depth0.value); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
	  buffer += escapeExpression(stack1)
	    + "\"\n          data-defaultSelected=\""
	    + escapeExpression((helper = helpers.output || (depth0 && depth0.output),options={hash:{},data:data},helper ? helper.call(depth0, (depth0 && depth0.defaultSelected), options) : helperMissing.call(depth0, "output", (depth0 && depth0.defaultSelected), options)))
	    + "\"\n          data-selected=\""
	    + escapeExpression((helper = helpers.output || (depth0 && depth0.output),options={hash:{},data:data},helper ? helper.call(depth0, (depth0 && depth0.selected), options) : helperMissing.call(depth0, "output", (depth0 && depth0.selected), options)))
	    + "\"\n          data-disabled=\""
	    + escapeExpression((helper = helpers.output || (depth0 && depth0.output),options={hash:{},data:data},helper ? helper.call(depth0, (depth0 && depth0.disabled), options) : helperMissing.call(depth0, "output", (depth0 && depth0.disabled), options)))
	    + "\">";
	  if (helper = helpers.text) { stack1 = helper.call(depth0, {hash:{},data:data}); }
	  else { helper = (depth0 && depth0.text); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
	  if(stack1 || stack1 === 0) { buffer += stack1; }
	  buffer += "</li>\n        ";
	  return buffer;
	  }
	function program2(depth0,data,depth2) {
	  
	  var buffer = "", stack1;
	  buffer += escapeExpression(((stack1 = (depth2 && depth2.classPrefix)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
	    + "-item-disabled";
	  return buffer;
	  }

	  buffer += "<div class=\"";
	  if (helper = helpers.classPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
	  else { helper = (depth0 && depth0.classPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
	  buffer += escapeExpression(stack1)
	    + "\">\n    <ul class=\"";
	  if (helper = helpers.classPrefix) { stack1 = helper.call(depth0, {hash:{},data:data}); }
	  else { helper = (depth0 && depth0.classPrefix); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
	  buffer += escapeExpression(stack1)
	    + "-content\" data-role=\"content\">\n        ";
	  stack1 = helpers.each.call(depth0, (depth0 && depth0.select), {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data});
	  if(stack1 || stack1 === 0) { buffer += stack1; }
	  buffer += "\n    </ul>\n</div>\n";
	  return buffer;
	  });


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(41);


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(1);
	var Overlay = __webpack_require__(7);
	var Templatable = __webpack_require__(11);
	var DataSource = __webpack_require__(42);
	var Filter = __webpack_require__(43);
	var Input = __webpack_require__(44);

	var IE678 = /\bMSIE [678]\.0\b/.test(navigator.userAgent);
	var template = __webpack_require__(36);

	var AutoComplete = Overlay.extend({

	  Implements: Templatable,

	  attrs: {
	    // 触发元素
	    trigger: null,
	    classPrefix: 'ui-select',
	    align: {
	      baseXY: [0, '100%']
	    },
	    submitOnEnter: true,
	    // 回车是否会提交表单
	    dataSource: { //数据源，支持 Array, URL, Object, Function
	      value: [],
	      getter: function (val) {
	        var that = this;
	        if ($.isFunction(val)) {
	          return function () {
	            return val.apply(that, arguments);
	          };
	        }
	        return val;
	      }
	    },
	    locator: 'data',
	    // 输出过滤
	    filter: null,
	    disabled: false,
	    selectFirst: false,
	    delay: 100,
	    // 以下为模板相关
	    model: {
	      value: {
	        items: []
	      },
	      getter: function (val) {
	        val.classPrefix || (val.classPrefix = this.get('classPrefix'));
	        return val;
	      }
	    },
	    template: template,
	    footer: '',
	    header: '',
	    html: '{{{label}}}',
	    // 以下仅为组件使用
	    selectedIndex: null,
	    data: []
	  },

	  events: {
	    'mousedown [data-role=items]': '_handleMouseDown',
	    'click [data-role=item]': '_handleSelection',
	    'mouseenter [data-role=item]': '_handleMouseMove',
	    'mouseleave [data-role=item]': '_handleMouseMove'
	  },

	  templateHelpers: {
	    // 将匹配的高亮文字加上 hl 的样式
	    highlightItem: highlightItem,
	    include: include
	  },

	  parseElement: function () {
	    var that = this;
	    this.templatePartials || (this.templatePartials = {});
	    $.each(['header', 'footer', 'html'], function (index, item) {
	      that.templatePartials[item] = that.get(item);
	    });
	    AutoComplete.superclass.parseElement.call(this);
	  },

	  setup: function () {
	    AutoComplete.superclass.setup.call(this);

	    this._isOpen = false;
	    this._initInput(); // 初始化输入框
	    this._initDataSource(); // 初始化数据源
	    this._initFilter(); // 初始化过滤器
	    this._bindHandle(); // 绑定事件
	    this._blurHide([$(this.get('trigger'))]);
	    this._tweakAlignDefaultValue();

	    this.on('indexChanged', function (index) {
	      // scroll current item into view
	      //this.currentItem.scrollIntoView();
	      var containerHeight = parseInt(this.get('height'), 10);
	      if (!containerHeight) return;

	      var itemHeight = this.items.parent().height() / this.items.length,
	          itemTop = Math.max(0, itemHeight * (index + 1) - containerHeight);
	      this.element.children().scrollTop(itemTop);
	    });
	  },

	  show: function () {
	    this._isOpen = true;
	    // 无数据则不显示
	    if (this._isEmpty()) return;
	    AutoComplete.superclass.show.call(this);
	  },

	  hide: function () {
	    // 隐藏的时候取消请求或回调
	    if (this._timeout) clearTimeout(this._timeout);
	    this.dataSource.abort();
	    this._hide();
	  },

	  destroy: function () {
	    this._clear();
	    if (this.input) {
	      this.input.destroy();
	      this.input = null;
	    }
	    AutoComplete.superclass.destroy.call(this);
	  },


	  // Public Methods
	  // --------------
	  selectItem: function (index) {
	    if (this.items) {
	      if (index && this.items.length > index && index >= -1) {
	        this.set('selectedIndex', index);
	      }
	      this._handleSelection();
	    }
	  },

	  setInputValue: function (val) {
	    this.input.setValue(val);
	  },

	  // Private Methods
	  // ---------------

	  // 数据源返回，过滤数据
	  _filterData: function (data) {
	    var filter = this.get('filter'),
	        locator = this.get('locator');

	    // 获取目标数据
	    data = locateResult(locator, data);

	    // 进行过滤
	    data = filter.call(this, normalize(data), this.input.get('query'));

	    this.set('data', data);
	  },

	  // 通过数据渲染模板
	  _onRenderData: function (data) {
	    data || (data = []);

	    // 渲染下拉
	    this.set('model', {
	      items: data,
	      query: this.input.get('query'),
	      length: data.length
	    });

	    this.renderPartial();

	    // 初始化下拉的状态
	    this.items = this.$('[data-role=items]').children();

	    if (this.get('selectFirst')) {
	      this.set('selectedIndex', 0);
	    }

	    // 选中后会修改 input 的值并触发下一次渲染，但第二次渲染的结果不应该显示出来。
	    this._isOpen && this.show();
	  },

	  // 键盘控制上下移动
	  _onRenderSelectedIndex: function (index) {
	    var hoverClass = this.get('classPrefix') + '-item-hover';
	    this.items && this.items.removeClass(hoverClass);

	    // -1 什么都不选
	    if (index === -1) return;

	    this.items.eq(index).addClass(hoverClass);
	    this.trigger('indexChanged', index, this.lastIndex);
	    this.lastIndex = index;
	  },

	  // 初始化
	  // ------------
	  _initDataSource: function () {
	    this.dataSource = new DataSource({
	      source: this.get('dataSource')
	    });
	  },

	  _initInput: function () {
	    this.input = new Input({
	      element: this.get('trigger'),
	      delay: this.get('delay')
	    });
	  },

	  _initFilter: function () {
	    var filter = this.get('filter');
	    filter = initFilter(filter, this.dataSource);
	    this.set('filter', filter);
	  },

	  // 事件绑定
	  // ------------
	  _bindHandle: function () {
	    this.dataSource.on('data', this._filterData, this);

	    this.input.on('blur', this.hide, this).on('focus', this._handleFocus, this).on('keyEnter', this._handleSelection, this).on('keyEsc', this.hide, this).on('keyUp keyDown', this.show, this).on('keyUp keyDown', this._handleStep, this).on('queryChanged', this._clear, this).on('queryChanged', this._hide, this).on('queryChanged', this._handleQueryChange, this).on('queryChanged', this.show, this);

	    this.after('hide', function () {
	      this.set('selectedIndex', -1);
	    });

	    // 选中后隐藏浮层
	    this.on('itemSelected', function () {
	      this._hide();
	    });
	  },

	  // 选中的处理器
	  // 1. 鼠标点击触发
	  // 2. 回车触发
	  // 3. selectItem 触发
	  _handleSelection: function (e) {
	    if (!this.items) return;
	    var isMouse = e ? e.type === 'click' : false;
	    var index = isMouse ? this.items.index(e.currentTarget) : this.get('selectedIndex');
	    var item = this.items.eq(index);
	    var data = this.get('data')[index];

	    if (index >= 0 && item && data) {
	      this.input.setValue(data.label);
	      this.set('selectedIndex', index, {
	        silent: true
	      });

	      // 是否阻止回车提交表单
	      if (e && !isMouse && !this.get('submitOnEnter')) e.preventDefault();

	      this.trigger('itemSelected', data, item);
	    }
	  },

	  _handleFocus: function () {
	    this._isOpen = true;
	  },

	  _handleMouseMove: function (e) {
	    var hoverClass = this.get('classPrefix') + '-item-hover';
	    this.items.removeClass(hoverClass);
	    if (e.type === 'mouseenter') {
	      var index = this.items.index(e.currentTarget);
	      this.set('selectedIndex', index, {
	        silent: true
	      });
	      this.items.eq(index).addClass(hoverClass);
	    }
	  },

	  _handleMouseDown: function (e) {
	    if (IE678) {
	      var trigger = this.input.get('element')[0];
	      trigger.onbeforedeactivate = function () {
	        window.event.returnValue = false;
	        trigger.onbeforedeactivate = null;
	      };
	    }
	    e.preventDefault();
	  },

	  _handleStep: function (e) {
	    e.preventDefault();
	    this.get('visible') && this._step(e.type === 'keyUp' ? -1 : 1);
	  },

	  _handleQueryChange: function (val, prev) {
	    if (this.get('disabled')) return;

	    this.dataSource.abort();
	    this.dataSource.getData(val);
	  },

	  // 选项上下移动
	  _step: function (direction) {
	    var currentIndex = this.get('selectedIndex');
	    if (direction === -1) { // 反向
	      if (currentIndex > -1) {
	        this.set('selectedIndex', currentIndex - 1);
	      } else {
	        this.set('selectedIndex', this.items.length - 1);
	      }
	    } else if (direction === 1) { // 正向
	      if (currentIndex < this.items.length - 1) {
	        this.set('selectedIndex', currentIndex + 1);
	      } else {
	        this.set('selectedIndex', -1);
	      }
	    }
	  },

	  _clear: function () {
	    this.$('[data-role=items]').empty();
	    this.set('selectedIndex', -1);
	    delete this.items;
	    delete this.lastIndex;
	  },

	  _hide: function () {
	    this._isOpen = false;
	    AutoComplete.superclass.hide.call(this);
	  },

	  _isEmpty: function () {
	    var data = this.get('data');
	    return !(data && data.length > 0);
	  },

	  // 调整 align 属性的默认值
	  _tweakAlignDefaultValue: function () {
	    var align = this.get('align');
	    align.baseElement = this.get('trigger');
	    this.set('align', align);
	  }
	});

	module.exports = AutoComplete;

	function isString(str) {
	  return Object.prototype.toString.call(str) === '[object String]';
	}

	function isObject(obj) {
	  return Object.prototype.toString.call(obj) === '[object Object]';
	}

	// 通过 locator 找到 data 中的某个属性的值
	// 1. locator 支持 function，函数返回值为结果
	// 2. locator 支持 string，而且支持点操作符寻址
	//     data {
	//       a: {
	//         b: 'c'
	//       }
	//     }
	//     locator 'a.b'
	// 最后的返回值为 c

	function locateResult(locator, data) {
	  if (locator) {
	    if ($.isFunction(locator)) {
	      return locator.call(this, data);
	    } else if (!$.isArray(data) && isString(locator)) {
	      var s = locator.split('.'),
	          p = data;
	      while (s.length) {
	        var v = s.shift();
	        if (!p[v]) {
	          break;
	        }
	        p = p[v];
	      }
	      return p;
	    }
	  }
	  return data;
	}

	// 标准格式，不匹配则忽略
	//
	//   {
	//     label: '', 显示的字段
	//     value: '', 匹配的字段
	//     alias: []  其他匹配的字段
	//   }

	function normalize(data) {
	  var result = [];
	  $.each(data, function (index, item) {
	    if (isString(item)) {
	      result.push({
	        label: item,
	        value: item,
	        alias: []
	      });
	    } else if (isObject(item)) {
	      if (!item.value && !item.label) return;
	      item.value || (item.value = item.label);
	      item.label || (item.label = item.value);
	      item.alias || (item.alias = []);
	      result.push(item);
	    }
	  });
	  return result;
	}

	// 初始化 filter
	// 支持的格式
	//   1. null: 使用默认的 startsWith
	//   2. string: 从 Filter 中找，如果不存在则用 default
	//   3. function: 自定义

	function initFilter(filter, dataSource) {
	  // 字符串
	  if (isString(filter)) {
	    // 从组件内置的 FILTER 获取
	    if (Filter[filter]) {
	      filter = Filter[filter];
	    } else {
	      filter = Filter['default'];
	    }
	  }
	  // 非函数为默认值
	  else if (!$.isFunction(filter)) {
	    // 异步请求的时候不需要过滤器
	    if (dataSource.get('type') === 'url') {
	      filter = Filter['default'];
	    } else {
	      filter = Filter['startsWith'];
	    }
	  }
	  return filter;
	}

	function include(options) {
	  var context = {};

	  mergeContext(this);
	  mergeContext(options.hash);
	  return options.fn(context);

	  function mergeContext(obj) {
	    for (var k in obj) context[k] = obj[k];
	  }
	}

	function highlightItem(label) {
	  var index = this.highlightIndex,
	      classPrefix = this.parent ? this.parent.classPrefix : '',
	      cursor = 0,
	      v = label || this.label || '',
	      h = '';
	  if ($.isArray(index)) {
	    for (var i = 0, l = index.length; i < l; i++) {
	      var j = index[i],
	          start, length;
	      if ($.isArray(j)) {
	        start = j[0];
	        length = j[1] - j[0];
	      } else {
	        start = j;
	        length = 1;
	      }

	      if (start > cursor) {
	        h += v.substring(cursor, start);
	      }
	      if (start < v.length) {
	        var className = classPrefix ? ('class="' + classPrefix + '-item-hl"') : '';
	        h += '<span ' + className + '>' + v.substr(start, length) + '</span>';
	      }
	      cursor = start + length;
	      if (cursor >= v.length) {
	        break;
	      }
	    }
	    if (v.length > cursor) {
	      h += v.substring(cursor, v.length);
	    }
	    return h;
	  }
	  return v;
	}


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	var Base = __webpack_require__(6);
	var $ = __webpack_require__(1);

	var DataSource = Base.extend({

	  attrs: {
	    source: null,
	    type: 'array'
	  },

	  initialize: function (config) {
	    DataSource.superclass.initialize.call(this, config);

	    // 每次发送请求会将 id 记录到 callbacks 中，返回后会从中删除
	    // 如果 abort 会清空 callbacks，之前的请求结果都不会执行
	    this.id = 0;
	    this.callbacks = [];

	    var source = this.get('source');
	    if (isString(source)) {
	      this.set('type', 'url');
	    } else if ($.isArray(source)) {
	      this.set('type', 'array');
	    } else if ($.isPlainObject(source)) {
	      this.set('type', 'object');
	    } else if ($.isFunction(source)) {
	      this.set('type', 'function');
	    } else {
	      throw new Error('Source Type Error');
	    }
	  },

	  getData: function (query) {
	    return this['_get' + capitalize(this.get('type') || '') + 'Data'](query);
	  },

	  abort: function () {
	    this.callbacks = [];
	  },

	  // 完成数据请求，getData => done
	  _done: function (data) {
	    this.trigger('data', data);
	  },

	  _getUrlData: function (query) {
	    var that = this,
	        options;
	    var obj = {
	      query: query ? encodeURIComponent(query) : '',
	      timestamp: new Date().getTime()
	    };
	    var url = this.get('source').replace(/\{\{(.*?)\}\}/g, function (all, match) {
	      return obj[match];
	    });

	    var callbackId = 'callback_' + this.id++;
	    this.callbacks.push(callbackId);

	    if (/^(https?:\/\/)/.test(url)) {
	      options = {
	        dataType: 'jsonp'
	      };
	    } else {
	      options = {
	        dataType: 'json'
	      };
	    }
	    $.ajax(url, options).success(function (data) {
	      if ($.inArray(callbackId, that.callbacks) > -1) {
	        delete that.callbacks[callbackId];
	        that._done(data);
	      }
	    }).error(function () {
	      if ($.inArray(callbackId, that.callbacks) > -1) {
	        delete that.callbacks[callbackId];
	        that._done({});
	      }
	    });
	  },

	  _getArrayData: function () {
	    var source = this.get('source');
	    this._done(source);
	    return source;
	  },

	  _getObjectData: function () {
	    var source = this.get('source');
	    this._done(source);
	    return source;
	  },

	  _getFunctionData: function (query) {
	    var that = this,
	        func = this.get('source');

	    // 如果返回 false 可阻止执行
	    var data = func.call(this, query, done);
	    if (data) {
	      this._done(data);
	    }

	    function done(data) {
	      that._done(data);
	    }
	  }
	});

	module.exports = DataSource;

	function isString(str) {
	  return Object.prototype.toString.call(str) === '[object String]';
	}

	function capitalize(str) {
	  return str.replace(/^([a-z])/, function (f, m) {
	    return m.toUpperCase();
	  });
	}


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(1);

	var Filter = {
	  'default': function (data) {
	    return data;
	  },

	  'startsWith': function (data, query) {
	    query = query || '';
	    var result = [],
	        l = query.length,
	        reg = new RegExp('^' + escapeKeyword(query));

	    if (!l) return [];

	    $.each(data, function (index, item) {
	      var a, matchKeys = [item.value].concat(item.alias);

	      // 匹配 value 和 alias 中的
	      while (a = matchKeys.shift()) {
	        if (reg.test(a)) {
	          // 匹配和显示相同才有必要高亮
	          if (item.label === a) {
	            item.highlightIndex = [
	              [0, l]
	            ];
	          }
	          result.push(item);
	          break;
	        }
	      }
	    });
	    return result;
	  },


	  'stringMatch': function (data, query) {
	    query = query || '';
	    var result = [],
	        l = query.length;

	    if (!l) return [];

	    $.each(data, function (index, item) {
	      var a, matchKeys = [item.value].concat(item.alias);

	      // 匹配 value 和 alias 中的
	      while (a = matchKeys.shift()) {
	        if (a.indexOf(query) > -1) {
	          // 匹配和显示相同才有必要高亮
	          if (item.label === a) {
	            item.highlightIndex = stringMatch(a, query);
	          }
	          result.push(item);
	          break;
	        }
	      }
	    });
	    return result;
	  }
	};

	module.exports = Filter;

	// 转义正则关键字
	var keyword = /(\[|\[|\]|\^|\$|\||\(|\)|\{|\}|\+|\*|\?|\\)/g;

	function escapeKeyword(str) {
	  return (str || '').replace(keyword, '\\$1');
	}

	function stringMatch(matchKey, query) {
	  var r = [],
	      a = matchKey.split('');
	  var queryIndex = 0,
	      q = query.split('');
	  for (var i = 0, l = a.length; i < l; i++) {
	    var v = a[i];
	    if (v === q[queryIndex]) {
	      if (queryIndex === q.length - 1) {
	        r.push([i - q.length + 1, i + 1]);
	        queryIndex = 0;
	        continue;
	      }
	      queryIndex++;
	    } else {
	      queryIndex = 0;
	    }
	  }
	  return r;
	}

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(1);
	var Base = __webpack_require__(6);

	var lteIE9 = /\bMSIE [6789]\.0\b/.test(navigator.userAgent);
	var specialKeyCodeMap = {
	  9: 'tab',
	  27: 'esc',
	  37: 'left',
	  39: 'right',
	  13: 'enter',
	  38: 'up',
	  40: 'down'
	};

	var Input = Base.extend({

	  attrs: {
	    element: {
	      value: null,
	      setter: function (val) {
	        return $(val);
	      }
	    },
	    query: null,
	    delay: 100
	  },

	  initialize: function () {
	    Input.superclass.initialize.apply(this, arguments);

	    // bind events
	    this._bindEvents();

	    // init query
	    this.set('query', this.getValue());
	  },

	  focus: function () {
	    this.get('element').focus();
	  },

	  getValue: function () {
	    return this.get('element').val();
	  },

	  setValue: function (val, silent) {
	    this.get('element').val(val);
	    !silent && this._change();
	  },

	  destroy: function () {
	    Input.superclass.destroy.call(this);
	  },

	  _bindEvents: function () {
	    var timer, input = this.get('element');

	    input.attr('autocomplete', 'off').on('focus.autocomplete', wrapFn(this._handleFocus, this)).on('blur.autocomplete', wrapFn(this._handleBlur, this)).on('keydown.autocomplete', wrapFn(this._handleKeydown, this));

	    // IE678 don't support input event
	    // IE 9 does not fire an input event when the user removes characters from input filled by keyboard, cut, or drag operations.
	    if (!lteIE9) {
	      input.on('input.autocomplete', wrapFn(this._change, this));
	    } else {
	      var that = this,
	          events = ['keydown.autocomplete', 'keypress.autocomplete', 'cut.autocomplete', 'paste.autocomplete'].join(' ');

	      input.on(events, wrapFn(function (e) {
	        if (specialKeyCodeMap[e.which]) return;

	        clearTimeout(timer);
	        timer = setTimeout(function () {
	          that._change.call(that, e);
	        }, this.get('delay'));
	      }, this));
	    }
	  },

	  _change: function () {
	    var newVal = this.getValue();
	    var oldVal = this.get('query');
	    var isSame = compare(oldVal, newVal);
	    var isSameExpectWhitespace = isSame ? (newVal.length !== oldVal.length) : false;

	    if (isSameExpectWhitespace) {
	      this.trigger('whitespaceChanged', oldVal);
	    }
	    if (!isSame) {
	      this.set('query', newVal);
	      this.trigger('queryChanged', newVal, oldVal);
	    }
	  },

	  _handleFocus: function (e) {
	    this.trigger('focus', e);
	  },

	  _handleBlur: function (e) {
	    this.trigger('blur', e);
	  },

	  _handleKeydown: function (e) {
	    var keyName = specialKeyCodeMap[e.which];
	    if (keyName) {
	      var eventKey = 'key' + ucFirst(keyName);
	      this.trigger(e.type = eventKey, e);
	    }
	  }
	});

	module.exports = Input;

	function wrapFn(fn, context) {
	  return function () {
	    fn.apply(context, arguments);
	  };
	}

	function compare(a, b) {
	  a = (a || '').replace(/^\s*/g, '').replace(/\s{2,}/g, ' ');
	  b = (b || '').replace(/^\s*/g, '').replace(/\s{2,}/g, ' ');
	  return a === b;
	}

	function ucFirst(str) {
	  return str.charAt(0).toUpperCase() + str.substring(1);
	}

/***/ },
/* 45 */
/***/ function(module, exports) {

	// Aspect
	// ---------------------
	// Thanks to:
	//  - http://yuilibrary.com/yui/docs/api/classes/Do.html
	//  - http://code.google.com/p/jquery-aop/
	//  - http://lazutkin.com/blog/2008/may/18/aop-aspect-javascript-dojo/


	// 在指定方法执行前，先执行 callback
	exports.before = function(methodName, callback, context) {
	  return weave.call(this, 'before', methodName, callback, context);
	};


	// 在指定方法执行后，再执行 callback
	exports.after = function(methodName, callback, context) {
	  return weave.call(this, 'after', methodName, callback, context);
	};


	// Helpers
	// -------

	var eventSplitter = /\s+/;

	function weave(when, methodName, callback, context) {
	  var names = methodName.split(eventSplitter);
	  var name, method;

	  while (name = names.shift()) {
	    method = getMethod(this, name);
	    if (!method.__isAspected) {
	      wrap.call(this, name);
	    }
	    this.on(when + ':' + name, callback, context);
	  }

	  return this;
	}


	function getMethod(host, methodName) {
	  var method = host[methodName];
	  if (!method) {
	    throw new Error('Invalid method name: ' + methodName);
	  }
	  return method;
	}


	function wrap(methodName) {
	  var old = this[methodName];

	  this[methodName] = function() {
	    var args = Array.prototype.slice.call(arguments);
	    var beforeArgs = ['before:' + methodName].concat(args);

	    // prevent if trigger return false
	    if (this.trigger.apply(this, beforeArgs) === false) return;

	    var ret = old.apply(this, arguments);
	    var afterArgs = ['after:' + methodName, ret].concat(args);
	    this.trigger.apply(this, afterArgs);

	    return ret;
	  };

	  this[methodName].__isAspected = true;
	}


/***/ },
/* 46 */
/***/ function(module, exports) {

	// Attribute
	// -----------------
	// Thanks to:
	//  - http://documentcloud.github.com/backbone/#Model
	//  - http://yuilibrary.com/yui/docs/api/classes/AttributeCore.html
	//  - https://github.com/berzniz/backbone.getters.setters


	// 负责 attributes 的初始化
	// attributes 是与实例相关的状态信息，可读可写，发生变化时，会自动触发相关事件
	exports.initAttrs = function(config) {
	  // initAttrs 是在初始化时调用的，默认情况下实例上肯定没有 attrs，不存在覆盖问题
	  var attrs = this.attrs = {};

	  // Get all inherited attributes.
	  var specialProps = this.propsInAttrs || [];
	  mergeInheritedAttrs(attrs, this, specialProps);

	  // Merge user-specific attributes from config.
	  if (config) {
	    mergeUserValue(attrs, config);
	  }

	  // 对于有 setter 的属性，要用初始值 set 一下，以保证关联属性也一同初始化
	  setSetterAttrs(this, attrs, config);

	  // Convert `on/before/afterXxx` config to event handler.
	  parseEventsFromAttrs(this, attrs);

	  // 将 this.attrs 上的 special properties 放回 this 上
	  copySpecialProps(specialProps, this, attrs, true);
	};


	// Get the value of an attribute.
	exports.get = function(key) {
	  var attr = this.attrs[key] || {};
	  var val = attr.value;
	  return attr.getter ? attr.getter.call(this, val, key) : val;
	};


	// Set a hash of model attributes on the object, firing `"change"` unless
	// you choose to silence it.
	exports.set = function(key, val, options) {
	  var attrs = {};

	  // set("key", val, options)
	  if (isString(key)) {
	    attrs[key] = val;
	  }
	  // set({ "key": val, "key2": val2 }, options)
	  else {
	    attrs = key;
	    options = val;
	  }

	  options || (options = {});
	  var silent = options.silent;
	  var override = options.override;

	  var now = this.attrs;
	  var changed = this.__changedAttrs || (this.__changedAttrs = {});

	  for (key in attrs) {
	    if (!attrs.hasOwnProperty(key)) continue;

	    var attr = now[key] || (now[key] = {});
	    val = attrs[key];

	    if (attr.readOnly) {
	      throw new Error('This attribute is readOnly: ' + key);
	    }

	    // invoke setter
	    if (attr.setter) {
	      val = attr.setter.call(this, val, key);
	    }

	    // 获取设置前的 prev 值
	    var prev = this.get(key);

	    // 获取需要设置的 val 值
	    // 如果设置了 override 为 true，表示要强制覆盖，就不去 merge 了
	    // 都为对象时，做 merge 操作，以保留 prev 上没有覆盖的值
	    if (!override && isPlainObject(prev) && isPlainObject(val)) {
	      val = merge(merge({}, prev), val);
	    }

	    // set finally
	    now[key].value = val;

	    // invoke change event
	    // 初始化时对 set 的调用，不触发任何事件
	    if (!this.__initializingAttrs && !isEqual(prev, val)) {
	      if (silent) {
	        changed[key] = [val, prev];
	      }
	      else {
	        this.trigger('change:' + key, val, prev, key);
	      }
	    }
	  }

	  return this;
	};


	// Call this method to manually fire a `"change"` event for triggering
	// a `"change:attribute"` event for each changed attribute.
	exports.change = function() {
	  var changed = this.__changedAttrs;

	  if (changed) {
	    for (var key in changed) {
	      if (changed.hasOwnProperty(key)) {
	        var args = changed[key];
	        this.trigger('change:' + key, args[0], args[1], key);
	      }
	    }
	    delete this.__changedAttrs;
	  }

	  return this;
	};

	// for test
	exports._isPlainObject = isPlainObject;

	// Helpers
	// -------

	var toString = Object.prototype.toString;
	var hasOwn = Object.prototype.hasOwnProperty;

	/**
	 * Detect the JScript [[DontEnum]] bug:
	 * In IE < 9 an objects own properties, shadowing non-enumerable ones, are
	 * made non-enumerable as well.
	 * https://github.com/bestiejs/lodash/blob/7520066fc916e205ef84cb97fbfe630d7c154158/lodash.js#L134-L144
	 */
	/** Detect if own properties are iterated after inherited properties (IE < 9) */
	var iteratesOwnLast;
	(function() {
	  var props = [];
	  function Ctor() { this.x = 1; }
	  Ctor.prototype = { 'valueOf': 1, 'y': 1 };
	  for (var prop in new Ctor()) { props.push(prop); }
	  iteratesOwnLast = props[0] !== 'x';
	}());

	var isArray = Array.isArray || function(val) {
	  return toString.call(val) === '[object Array]';
	};

	function isString(val) {
	  return toString.call(val) === '[object String]';
	}

	function isFunction(val) {
	  return toString.call(val) === '[object Function]';
	}

	function isWindow(o) {
	  return o != null && o == o.window;
	}

	function isPlainObject(o) {
	  // Must be an Object.
	  // Because of IE, we also have to check the presence of the constructor
	  // property. Make sure that DOM nodes and window objects don't
	  // pass through, as well
	  if (!o || toString.call(o) !== "[object Object]" ||
	      o.nodeType || isWindow(o)) {
	    return false;
	  }

	  try {
	    // Not own constructor property must be Object
	    if (o.constructor &&
	        !hasOwn.call(o, "constructor") &&
	        !hasOwn.call(o.constructor.prototype, "isPrototypeOf")) {
	      return false;
	    }
	  } catch (e) {
	    // IE8,9 Will throw exceptions on certain host objects #9897
	    return false;
	  }

	  var key;

	  // Support: IE<9
	  // Handle iteration over inherited properties before own properties.
	  // http://bugs.jquery.com/ticket/12199
	  if (iteratesOwnLast) {
	    for (key in o) {
	      return hasOwn.call(o, key);
	    }
	  }

	  // Own properties are enumerated firstly, so to speed up,
	  // if last one is own, then all properties are own.
	  for (key in o) {}

	  return key === undefined || hasOwn.call(o, key);
	}

	function isEmptyObject(o) {
	  if (!o || toString.call(o) !== "[object Object]" ||
	      o.nodeType || isWindow(o) || !o.hasOwnProperty) {
	    return false;
	  }

	  for (var p in o) {
	    if (o.hasOwnProperty(p)) return false;
	  }
	  return true;
	}

	function merge(receiver, supplier) {
	  var key, value;

	  for (key in supplier) {
	    if (supplier.hasOwnProperty(key)) {
	      receiver[key] = cloneValue(supplier[key], receiver[key]);
	    }
	  }

	  return receiver;
	}

	// 只 clone 数组和 plain object，其他的保持不变
	function cloneValue(value, prev){
	  if (isArray(value)) {
	    value = value.slice();
	  }
	  else if (isPlainObject(value)) {
	    isPlainObject(prev) || (prev = {});

	    value = merge(prev, value);
	  }

	  return value;
	}

	var keys = Object.keys;

	if (!keys) {
	  keys = function(o) {
	    var result = [];

	    for (var name in o) {
	      if (o.hasOwnProperty(name)) {
	        result.push(name);
	      }
	    }
	    return result;
	  };
	}

	function mergeInheritedAttrs(attrs, instance, specialProps) {
	  var inherited = [];
	  var proto = instance.constructor.prototype;

	  while (proto) {
	    // 不要拿到 prototype 上的
	    if (!proto.hasOwnProperty('attrs')) {
	      proto.attrs = {};
	    }

	    // 将 proto 上的特殊 properties 放到 proto.attrs 上，以便合并
	    copySpecialProps(specialProps, proto.attrs, proto);

	    // 为空时不添加
	    if (!isEmptyObject(proto.attrs)) {
	      inherited.unshift(proto.attrs);
	    }

	    // 向上回溯一级
	    proto = proto.constructor.superclass;
	  }

	  // Merge and clone default values to instance.
	  for (var i = 0, len = inherited.length; i < len; i++) {
	    mergeAttrs(attrs, normalize(inherited[i]));
	  }
	}

	function mergeUserValue(attrs, config) {
	  mergeAttrs(attrs, normalize(config, true), true);
	}

	function copySpecialProps(specialProps, receiver, supplier, isAttr2Prop) {
	  for (var i = 0, len = specialProps.length; i < len; i++) {
	    var key = specialProps[i];

	    if (supplier.hasOwnProperty(key)) {
	      receiver[key] = isAttr2Prop ? receiver.get(key) : supplier[key];
	    }
	  }
	}


	var EVENT_PATTERN = /^(on|before|after)([A-Z].*)$/;
	var EVENT_NAME_PATTERN = /^(Change)?([A-Z])(.*)/;

	function parseEventsFromAttrs(host, attrs) {
	  for (var key in attrs) {
	    if (attrs.hasOwnProperty(key)) {
	      var value = attrs[key].value, m;

	      if (isFunction(value) && (m = key.match(EVENT_PATTERN))) {
	        host[m[1]](getEventName(m[2]), value);
	        delete attrs[key];
	      }
	    }
	  }
	}

	// Converts `Show` to `show` and `ChangeTitle` to `change:title`
	function getEventName(name) {
	  var m = name.match(EVENT_NAME_PATTERN);
	  var ret = m[1] ? 'change:' : '';
	  ret += m[2].toLowerCase() + m[3];
	  return ret;
	}


	function setSetterAttrs(host, attrs, config) {
	  var options = { silent: true };
	  host.__initializingAttrs = true;

	  for (var key in config) {
	    if (config.hasOwnProperty(key)) {
	      if (attrs[key].setter) {
	        host.set(key, config[key], options);
	      }
	    }
	  }

	  delete host.__initializingAttrs;
	}


	var ATTR_SPECIAL_KEYS = ['value', 'getter', 'setter', 'readOnly'];

	// normalize `attrs` to
	//
	//   {
	//      value: 'xx',
	//      getter: fn,
	//      setter: fn,
	//      readOnly: boolean
	//   }
	//
	function normalize(attrs, isUserValue) {
	  var newAttrs = {};

	  for (var key in attrs) {
	    var attr = attrs[key];

	    if (!isUserValue &&
	        isPlainObject(attr) &&
	        hasOwnProperties(attr, ATTR_SPECIAL_KEYS)) {
	      newAttrs[key] = attr;
	      continue;
	    }

	    newAttrs[key] = {
	      value: attr
	    };
	  }

	  return newAttrs;
	}

	var ATTR_OPTIONS = ['setter', 'getter', 'readOnly'];
	// 专用于 attrs 的 merge 方法
	function mergeAttrs(attrs, inheritedAttrs, isUserValue){
	  var key, value;
	  var attr;

	  for (key in inheritedAttrs) {
	    if (inheritedAttrs.hasOwnProperty(key)) {
	      value = inheritedAttrs[key];
	      attr = attrs[key];

	      if (!attr) {
	        attr = attrs[key] = {};
	      }

	      // 从严谨上来说，遍历 ATTR_SPECIAL_KEYS 更好
	      // 从性能来说，直接 人肉赋值 更快
	      // 这里还是选择 性能优先

	      // 只有 value 要复制原值，其他的直接覆盖即可
	      (value['value'] !== undefined) && (attr['value'] = cloneValue(value['value'], attr['value']));

	      // 如果是用户赋值，只要考虑value
	      if (isUserValue) continue;

	      for (var i in ATTR_OPTIONS) {
	        var option = ATTR_OPTIONS[i];
	        if (value[option] !== undefined) {
	          attr[option] = value[option];
	        }
	      }
	    }
	  }

	  return attrs;
	}

	function hasOwnProperties(object, properties) {
	  for (var i = 0, len = properties.length; i < len; i++) {
	    if (object.hasOwnProperty(properties[i])) {
	      return true;
	    }
	  }
	  return false;
	}


	// 对于 attrs 的 value 来说，以下值都认为是空值： null, undefined, '', [], {}
	function isEmptyAttrValue(o) {
	  return o == null || // null, undefined
	      (isString(o) || isArray(o)) && o.length === 0 || // '', []
	      isEmptyObject(o); // {}
	}

	// 判断属性值 a 和 b 是否相等，注意仅适用于属性值的判断，非普适的 === 或 == 判断。
	function isEqual(a, b) {
	  if (a === b) return true;

	  if (isEmptyAttrValue(a) && isEmptyAttrValue(b)) return true;

	  // Compare `[[Class]]` names.
	  var className = toString.call(a);
	  if (className != toString.call(b)) return false;

	  switch (className) {

	    // Strings, numbers, dates, and booleans are compared by value.
	    case '[object String]':
	      // Primitives and their corresponding object wrappers are
	      // equivalent; thus, `"5"` is equivalent to `new String("5")`.
	      return a == String(b);

	    case '[object Number]':
	      // `NaN`s are equivalent, but non-reflexive. An `equal`
	      // comparison is performed for other numeric values.
	      return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);

	    case '[object Date]':
	    case '[object Boolean]':
	      // Coerce dates and booleans to numeric primitive values.
	      // Dates are compared by their millisecond representations.
	      // Note that invalid dates with millisecond representations
	      // of `NaN` are not equivalent.
	      return +a == +b;

	    // RegExps are compared by their source patterns and flags.
	    case '[object RegExp]':
	      return a.source == b.source &&
	          a.global == b.global &&
	          a.multiline == b.multiline &&
	          a.ignoreCase == b.ignoreCase;

	    // 简单判断数组包含的 primitive 值是否相等
	    case '[object Array]':
	      var aString = a.toString();
	      var bString = b.toString();

	      // 只要包含非 primitive 值，为了稳妥起见，都返回 false
	      return aString.indexOf('[object') === -1 &&
	          bString.indexOf('[object') === -1 &&
	          aString === bString;
	  }

	  if (typeof a != 'object' || typeof b != 'object') return false;

	  // 简单判断两个对象是否相等，只判断第一层
	  if (isPlainObject(a) && isPlainObject(b)) {

	    // 键值不相等，立刻返回 false
	    if (!isEqual(keys(a), keys(b))) {
	      return false;
	    }

	    // 键相同，但有值不等，立刻返回 false
	    for (var p in a) {
	      if (a[p] !== b[p]) return false;
	    }

	    return true;
	  }

	  // 其他情况返回 false, 以避免误判导致 change 事件没发生
	  return false;
	}


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	// Base
	// ---------
	// Base 是一个基础类，提供 Class、Events、Attrs 和 Aspect 支持。

	var Class = __webpack_require__(22);
	var Events = __webpack_require__(14);
	var Aspect = __webpack_require__(45);
	var Attribute = __webpack_require__(46);


	module.exports = Class.create({
	  Implements: [Events, Aspect, Attribute],

	  initialize: function(config) {
	    this.initAttrs(config);

	    // Automatically register `this._onChangeAttr` method as
	    // a `change:attr` event handler.
	    parseEventsFromInstance(this, this.attrs);
	  },

	  destroy: function() {
	    this.off();

	    for (var p in this) {
	      if (this.hasOwnProperty(p)) {
	        delete this[p];
	      }
	    }

	    // Destroy should be called only once, generate a fake destroy after called
	    // https://github.com/aralejs/widget/issues/50
	    this.destroy = function() {};
	  }
	});


	function parseEventsFromInstance(host, attrs) {
	  for (var attr in attrs) {
	    if (attrs.hasOwnProperty(attr)) {
	      var m = '_onChange' + ucfirst(attr);
	      if (host[m]) {
	        host.on('change:' + attr, host[m]);
	      }
	    }
	  }
	}

	function ucfirst(str) {
	  return str.charAt(0).toUpperCase() + str.substring(1);
	}


/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(109);
	module.exports = __webpack_require__(50);


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(1);
	var Position = __webpack_require__(12);
	var moment = __webpack_require__(9);
	var Widget = __webpack_require__(2);
	var Shim = __webpack_require__(15);

	var langs = {
	  'zh-cn': __webpack_require__(55),
	  'zh-tw': __webpack_require__(56),
	  'fr': __webpack_require__(53),
	  'ja': __webpack_require__(54),
	  'en': __webpack_require__(52)
	};

	var ua = (window.navigator.userAgent || "").toLowerCase();
	var match = ua.match(/msie\s+(\d+)/);
	var insaneIE = false;
	if (match && match[1]) {
	  // IE < 9
	  insaneIE = parseInt(match[1], 10) < 9;
	}
	if (document.documentMode && document.documentMode < 9) {
	  insaneIE = true;
	}

	var current_date = moment();
	current_date = moment([current_date.year(), current_date.month(), current_date.date()]);

	var BaseCalendar = Widget.extend({
	  attrs: {
	    lang: 'zh-cn',
	    trigger: null,
	    triggerType: 'click',
	    output: {
	      value: '',
	      getter: function(val) {
	        val = val ? val : this.get('trigger');
	        return $(val);
	      }
	    },
	    hideOnSelect: true,

	    focus: {
	      value: '',
	      getter: function(val) {
	        val = val || this._outputTime();
	        if (val) {
	          return moment(val, this.get('format'));
	        }
	        return current_date;
	      },
	      setter: function(val) {
	        if (!val) {
	          return current_date;
	        }
	        return moment(val, this.get('format'));
	      }
	    },

	    format: 'YYYY-MM-DD',

	    startDay: 'Sun',

	    range: {
	      value: null,
	      setter: function(val) {
	        if ($.isArray(val)) {
	          var format = this.get('format');
	          var range = [];
	          $.each(val, function(i, date) {
	            date = date === null ? null : moment(date, format);
	            range.push(date);
	          });
	          return range;
	        }
	        return val;
	      }
	    },

	    process: null,

	    align: {
	      getter: function(val) {
	        if (val) return val;

	        var trigger = $(this.get('trigger'));
	        if (trigger) {
	          return {
	            selfXY: [0, 0],
	            baseElement: trigger,
	            baseXY: [0, '100%']
	          };
	        }
	        return {
	          selfXY: [0, 0],
	          baseXY: [0, 0]
	        };
	      }
	    }
	  },

	  setup: function() {
	    BaseCalendar.superclass.setup.call(this);
	    this.enable();
	    
	    if (typeof this.get('lang') === 'string') {
	      this.set('lang', langs[this.get('lang')]);
	    }

	    this._shim = new Shim(this.element);

	    var self = this;

	    // keep cursor focus in trigger
	    this.element.on('mousedown', function(e) {
	      if (insaneIE) {
	        var trigger = $(self.get('trigger'))[0];
	        trigger.onbeforedeactivate = function() {
	          window.event.returnValue = false;
	          trigger.onbeforedeactivate = null;
	        };
	      }
	      e.preventDefault();
	    });
	  },

	  show: function() {
	    this.trigger('show');
	    if (!this.rendered) {
	      this._pin();
	      this.render();
	    }
	    this._pin();
	    this.element.show();
	  },

	  hide: function() {
	    this.trigger('hide');
	    this.element.hide();
	  },

	  _pin: function(align) {
	    align = align || this.get('align');
	    Position.pin({
	      element: this.element,
	      x: align.selfXY[0],
	      y: align.selfXY[1]
	    }, {
	      element: align.baseElement,
	      x: align.baseXY[0],
	      y: align.baseXY[1]
	    });
	  },

	  _outputTime: function() {
	    // parse time from output value
	    var output = $(this.get('output'));
	    var value = output.val() || output.text();
	    if (value) {
	      value = moment(value, this.get('format'));
	      if (value.isValid()) {
	        return value;
	      }
	    }
	  },

	  output: function(value) {
	    // send value to output
	    var output = this.get('output');
	    if (!output.length) {
	      return;
	    }
	    value = value || this.get('focus');
	    var tagName = output[0].tagName.toLowerCase();
	    if (tagName === 'input' || tagName === 'textarea') {
	      output.val(value);
	    } else {
	      output.text(value);
	    }
	    if (this.get('hideOnSelect')) {
	      this.hide();
	    }
	  },

	  enable: function() {
	    // enable trigger for show calendar
	    var trigger = this.get('trigger');
	    if (!trigger) {
	      return;
	    }
	    var self = this;
	    var $trigger = $(trigger);
	    if ($trigger.attr('type') === 'date') {
	      try {
	        // remove default style for type date
	        $trigger.attr('type', 'text');
	      } catch (e) {
	      }
	    }
	    var event = this.get('triggerType') + '.calendar';
	    $trigger.on(event, function() {
	      self.show();
	      self._shim.sync();
	    });
	    $trigger.on('blur.calendar', function() {
	      self.hide();
	      self._shim.sync();
	    });
	    // enable auto hide feature
	    if ($trigger[0].tagName.toLowerCase() !== 'input') {
	      self.autohide();
	    }
	  },

	  disable: function() {
	    // disable trigger
	    var trigger = this.get('trigger');
	    var self = this;
	    if (trigger) {
	      var $trigger = $(trigger);
	      var event = this.get('triggerType') + '.calendar';
	      $trigger.off(event);
	      $trigger.off('blur.calendar');
	    }
	  },

	  autohide: function() {
	    // autohide when trigger is not input
	    var me = this;

	    var trigger = $(this.get('trigger'))[0];
	    var element = this.element;

	    // click anywhere except calendar and trigger
	    $('body').on('mousedown.calendar', function(e) {
	      // not click on element
	      if (element.find(e.target).length || element[0] === e.target) {
	        return;
	      }
	      // not click on trigger
	      if (trigger !== e.target) {
	        me.hide();
	      }
	    });
	  },

	  destroy: function() {
	    if (this._shim) {
	      this._shim.destroy();
	    }
	    // clean event binding of autohide
	    $('body').off('mousedown.calendar');
	    BaseCalendar.superclass.destroy.call(this);
	  }

	});

	module.exports = BaseCalendar;


/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(1);
	var moment = __webpack_require__(9);

	var BaseCalendar = __webpack_require__(49);
	var DateColumn = __webpack_require__(51);
	var MonthColumn = __webpack_require__(57);
	var YearColumn = __webpack_require__(58);
	var template = [
	  '<div class="ui-calendar">',
	  '<div class="ui-calendar-pannel" data-role="pannel">',
	  '<span class="ui-calendar-control" data-role="prev-year">&lt;&lt;</span>',
	  '<span class="ui-calendar-control" data-role="prev-month">&lt;</span>',
	  '<span class="ui-calendar-control month" data-role="current-month"></span>',
	  '<span class="ui-calendar-control year" data-role="current-year"></span>',
	  '<span class="ui-calendar-control" data-role="next-month">&gt;</span>',
	  '<span class="ui-calendar-control" data-role="next-year">&gt;&gt;</span>',
	  '</div>',
	  '<div class="ui-calendar-container" data-role="container">',
	  '</div>',
	  '</div>'
	].join('');

	var Calendar = BaseCalendar.extend({
	  attrs: {
	    mode: 'dates',
	    template: template
	  },

	  events: {
	    'click [data-role=current-month]': function(ev) {
	      if (this.get('mode') === 'months') {
	        this.renderContainer('dates');
	      } else {
	        this.renderContainer('months');
	      }
	    },
	    'click [data-role=current-year]': function(ev) {
	      if (this.get('mode') === 'years') {
	        this.renderContainer('dates');
	      } else {
	        this.renderContainer('years');
	      }
	    },
	    'click [data-role=prev-year]': function(ev) {
	      var focus = this.years.prev();
	      this.dates.select(focus);
	      this.months.select(focus);
	    },
	    'click [data-role=next-year]': function(ev) {
	      var focus = this.years.next();
	      this.dates.select(focus);
	      this.months.select(focus);
	    },
	    'click [data-role=prev-month]': function(ev) {
	      var focus = this.months.prev();
	      this.dates.select(focus);
	      this.years.select(focus);
	    },
	    'click [data-role=next-month]': function(ev) {
	      var focus = this.months.next();
	      this.dates.select(focus);
	      this.years.select(focus);
	    }
	  },

	  setup: function() {
	    Calendar.superclass.setup.call(this);
	    this.renderPannel();

	    var attrs = {
	      lang: this.get('lang'),
	      focus: this.get('focus'),
	      range: this.get('range'),
	      format: this.get('format'),
	      startDay: this.get('startDay'),
	      process: this.get('process')
	    };

	    this.dates = new DateColumn(attrs);
	    this.months = new MonthColumn(attrs);
	    this.years = new YearColumn(attrs);

	    var self = this;
	    this.dates.on('select', function(value, el) {
	      self.set('focus', value);
	      var focus = self.get('focus');
	      self.months.select(focus);
	      self.years.select(focus);
	      if (el) {
	        self.trigger('selectDate', value);
	        if (moment.isMoment(value)) {
	          value = value.format(this.get('format'));
	        }
	        self.output(value);
	      }
	    });
	    this.months.on('select', function(value, el) {
	      var focus = self.get('focus');
	      focus.month(value);
	      self.set('focus', focus);
	      self.renderPannel();
	      if (el) {
	        self.renderContainer('dates', focus);
	        self.trigger('selectMonth', focus);
	      }
	    });
	    this.years.on('select', function(value, el) {
	      var focus = self.get('focus');
	      focus.year(value);
	      self.set('focus', focus);
	      self.renderPannel();
	      if (el && el.data('role') === 'year') {
	        self.renderContainer('dates', focus);
	        self.trigger('selectYear', focus);
	      }
	    });

	    var container = this.element.find('[data-role=container]');
	    container.append(this.dates.element);
	    container.append(this.months.element);
	    container.append(this.years.element);
	    this.renderContainer('dates');
	  },

	  renderContainer: function(mode, focus) {
	    this.set('mode', mode);

	    focus = focus || this.get('focus');

	    this.dates.hide();
	    this.months.hide();
	    this.years.hide();
	    this.dates.select(focus, null);
	    this.months.select(focus, null);
	    this.years.select(focus, null);

	    if (mode === 'dates') {
	      this.dates.element.show();
	    } else if (mode === 'months') {
	      this.months.element.show();
	    } else if (mode === 'years') {
	      this.years.element.show();
	    }
	    return this;

	  },

	  renderPannel: function() {
	    var focus = this.get('focus');
	    var monthPannel = this.element.find('[data-role=current-month]');
	    var yearPannel = this.element.find('[data-role=current-year]');

	    var MONTHS = [
	      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
	      'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
	    ];

	    var month = MONTHS[focus.month()];
	    month = this.get('lang')[month] || month;

	    monthPannel.text(month);
	    yearPannel.text(focus.year());
	  },

	  focus: function(date) {
	    date = moment(date, this.get('format'));
	    this.dates.focus(date);
	    this.months.focus(date);
	    this.years.focus(date);
	  },

	  range: function(range) {
	    // change range dynamically
	    this.set('range', range);
	    this.dates.set('range', range);
	    this.months.set('range', range);
	    this.years.set('range', range);
	    this.renderContainer(this.get('mode'));
	    this.renderPannel();
	  },

	  show: function() {
	    var value = this._outputTime();
	    if (value) {
	      this.dates.select(value);
	    }
	    Calendar.superclass.show.call(this);
	  },

	  destroy: function() {
	    this.dates.destroy();
	    this.months.destroy();
	    this.years.destroy();
	    Calendar.superclass.destroy.call(this);
	  }
	});

	Calendar.BaseColumn = __webpack_require__(10);
	Calendar.BaseCalendar = BaseCalendar;
	Calendar.DateColumn = DateColumn;
	Calendar.MonthColumn = MonthColumn;
	Calendar.YearColumn = YearColumn;

	module.exports = Calendar;


/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(1);
	var moment = __webpack_require__(9);
	var BaseColumn = __webpack_require__(10);

	var DateColumn = BaseColumn.extend({
	  attrs: {
	    startDay: 'Sun',
	    template: template,
	    range: {
	      value: null,
	      setter: function(val) {
	        if ($.isArray(val)) {
	          var format = this.get('format');
	          var range = [];
	          $.each(val, function(i, date) {
	            date = date === null ? null : moment(date, format);
	            range.push(date);
	          });
	          return range;
	        }
	        return val;
	      }
	    },
	    process: null,
	    model: {
	      getter: function() {
	        var date = createDateModel(
	          this.get('focus'),
	          this.get('startDay'),
	          this.get('range'),
	          this.get('process'),
	          this.get('format')
	        );
	        var day = createDayModel(this.get('startDay'));
	        return {date: date, day: day};
	      }
	    }
	  },

	  events: {
	    'click [data-role=date]': function(ev) {
	      var el = $(ev.target);
	      var value = el.data('value');
	      this.select(value, el);
	    }
	  },

	  prev: function() {
	    var prev = this.get('focus').format(this.get('format'));
	    var focus = this.get('focus').add('days', -1);
	    return this._sync(focus, prev);
	  },

	  next: function() {
	    var prev = this.get('focus').format(this.get('format'));
	    var focus = this.get('focus').add('days', 1);
	    return this._sync(focus, prev);
	  },

	  select: function(value, el) {
	    if (el && el.hasClass('disabled-element')) {
	      this.trigger('selectDisable', value, el);
	      return value;
	    }
	    var prev = this.get('focus').format(this.get('format'));
	    this.set('focus', value);
	    return this._sync(this.get('focus'), prev, el);
	  },

	  focus: function(focus) {
	    focus = focus || this.get('focus');
	    var selector = '[data-value="' + focus.format(this.get('format')) + '"]';
	    this.element.find('.focused-element').removeClass('focused-element');
	    this.element.find(selector).addClass('focused-element');
	  },

	  inRange: function(date) {
	    if (!moment.isMoment(date)) {
	      date = moment(date, this.get('format'));
	    }
	    return BaseColumn.isInRange(date, this.get('range'));
	  },

	  _sync: function(focus, prev, el) {
	    this.set('focus', focus);
	    if (focus.format('YYYY-MM') !== prev) {
	      this.refresh();
	    }
	    this.focus(focus);
	    // if user call select(value, null) it will not trigger an event
	    if (el !== null) {
	      this.trigger('select', focus, el);
	    }
	    return focus;
	  }
	});

	module.exports = DateColumn;

	// helpers
	var DAYS = [
	  'sunday', 'monday', 'tuesday', 'wednesday',
	  'thursday', 'friday', 'saturday'
	];

	function parseStartDay(startDay) {
	  startDay = (startDay || 0).toString().toLowerCase();

	  if ($.isNumeric(startDay)) {
	    startDay = parseInt(startDay, 10);
	    return startDay;
	  }

	  for (var i = 0; i < DAYS.length; i++) {
	    if (DAYS[i].indexOf(startDay) === 0) {
	      startDay = i;
	      break;
	    }
	  }
	  return startDay;
	}

	var DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

	function createDayModel(startDay) {
	  // Translate startDay to number. 0 is Sunday, 6 is Saturday.
	  startDay = parseStartDay(startDay);
	  var items = [];
	  for (var i = startDay; i < 7; i++) {
	    items.push({label: DAY_LABELS[i], value: i});
	  }
	  for (i = 0; i < startDay; i++) {
	    items.push({label: DAY_LABELS[i], value: i});
	  }

	  var current = {
	    value: startDay,
	    label: DAY_LABELS[startDay]
	  };
	  return {current: current, items: items};
	}


	function createDateModel(current, startDay, range, fn, format) {
	  var items = [], delta, d, daysInMonth;
	  startDay = parseStartDay(startDay);

	  var pushData = function(d, className) {
	    var item = {
	      value: d.format(format),
	      label: d.date(),

	      day: d.day(),
	      className: className,
	      available: BaseColumn.isInRange(d, range)
	    };
	    if (fn) {
	      item.type = 'date';
	      item = fn(item);
	    }
	    items.push(item);
	  };

	  // reset to the first date of the month
	  var currentMonth = current.clone().date(1);
	  var previousMonth = currentMonth.clone().add('months', -1);
	  var nextMonth = currentMonth.clone().add('months', 1);

	  // Calculate days of previous month
	  // that should be on current month's sheet
	  delta = currentMonth.day() - startDay;
	  if (delta < 0) delta += 7;
	  if (delta != 0) {
	    daysInMonth = previousMonth.daysInMonth();

	    // *delta - 1**: we need decrease it first
	    for (i = delta - 1; i >= 0; i--) {
	      d = previousMonth.date(daysInMonth - i);
	      pushData(d, 'previous-month');
	    }
	  }

	  daysInMonth = currentMonth.daysInMonth();
	  for (i = 1; i <= daysInMonth; i++) {
	    d = currentMonth.date(i);
	    pushData(d, 'current-month');
	  }

	  // Calculate days of next month
	  // that should be on current month's sheet
	  delta = 35 - items.length;
	  if (delta != 0) {
	    if (delta < 0) delta += 7;
	    for (i = 1; i <= delta; i++) {
	      d = nextMonth.date(i);
	      pushData(d, 'next-month');
	    }
	  }
	  var list = [];
	  for (var i = 0; i < items.length / 7; i++) {
	    list.push(items.slice(i * 7, i * 7 + 7));
	  }

	  var _current = {
	    value: current.format(format),
	    label: current.date()
	  };

	  return {current: _current, items: list};
	}


	/* template in handlebars
	<table class="ui-calendar-date" data-role="date-column">
	  <tr class="ui-calendar-day-column">
	    {{#each day.items}}
	    <th class="ui-calendar-day ui-calendar-day-{{value}}" data-role="day" data-value="{{value}}">{{_ label}}</th>
	    {{/each}}
	  </tr>
	  {{#each date.items}}
	  <tr class="ui-calendar-date-column">
	    {{#each this}}
	    <td class="ui-calendar-day-{{day}} {{className}} {{#unless available}}disabled-element{{/unless}}" data-role="date" data-value="{{value}}">{{label}}</td>
	    {{/each}}
	  </tr>
	  {{/each}}
	</table>
	*/

	function template(model, options) {
	  // keep the same API as handlebars

	  var _ = options.helpers._;
	  var html = '<table class="ui-calendar-date" data-role="date-column">';

	  // day column
	  html += '<tr class="ui-calendar-day-column">';
	  $.each(model.day.items, function(i, item) {
	    html += '<th class="ui-calendar-day ui-calendar-day-' + item.value + '" ';
	    html += 'data-role="day" data-value="' + item.value + '">';
	    html += _(item.label);
	    html += '</th>';
	  });
	  html += '</tr>';

	  // date column
	  $.each(model.date.items, function(i, items) {
	    html += '<tr class="ui-calendar-date-column">'
	    $.each(items, function(i, item) {
	      var className = [
	        'ui-calendar-day-' + item.day,
	        item.className || ''
	      ];
	      if (!item.available) {
	        className.push('disabled-element');
	      }
	      html += '<td class="' + className.join(' ') + '" data-role="date"';
	      html += 'data-value="' + item.value + '">';
	      html += item.label + '</td>';
	    });
	    html += '</tr>';
	  });

	  html += '</table>';
	  return html;
	}


/***/ },
/* 52 */
/***/ function(module, exports) {

	module.exports = {
	  'Su': 'S',
	  'Mo': 'M',
	  'Tu': 'T',
	  'We': 'W',
	  'Th': 'T',
	  'Fr': 'F',
	  'Sa': 'S',
	  'Jan': 'Jan',
	  'Feb': 'Feb',
	  'Mar': 'Mar',
	  'Apr': 'Apr',
	  'May': 'May',
	  'Jun': 'Jun',
	  'Jul': 'Jul',
	  'Aug': 'Aug',
	  'Sep': 'Sep',
	  'Oct': 'Oct',
	  'Nov': 'Nov',
	  'Dec': 'Dec'
	};



/***/ },
/* 53 */
/***/ function(module, exports) {

	module.exports = {
	  'Su': 'Di',
	  'Mo': 'Lu',
	  'Tu': 'Ma',
	  'We': 'Me',
	  'Th': 'Je',
	  'Fr': 'Ve',
	  'Sa': 'Sa',
	  'Jan': 'janv.',
	  'Feb': 'févr.',
	  'Mar': 'mars',
	  'Apr': 'avr.',
	  'May': 'mai',
	  'Jun': 'juin',
	  'Jul': 'juil.',
	  'Aug': 'août',
	  'Sep': 'sept.',
	  'Oct': 'oct.',
	  'Nov': 'nov.',
	  'Dec': 'déc.'
	};


/***/ },
/* 54 */
/***/ function(module, exports) {

	module.exports = {
	  'Su': '日',
	  'Mo': '月',
	  'Tu': '火',
	  'We': '水',
	  'Th': '木',
	  'Fr': '金',
	  'Sa': '土',
	  'Jan': '1月',
	  'Feb': '2月',
	  'Mar': '3月',
	  'Apr': '4月',
	  'May': '5月',
	  'Jun': '6月',
	  'Jul': '7月',
	  'Aug': '8月',
	  'Sep': '9月',
	  'Oct': '10月',
	  'Nov': '11月',
	  'Dec': '12月'
	};


/***/ },
/* 55 */
/***/ function(module, exports) {

	module.exports = {
	  'Su': '日',
	  'Mo': '一',
	  'Tu': '二',
	  'We': '三',
	  'Th': '四',
	  'Fr': '五',
	  'Sa': '六',
	  'Jan': '一月',
	  'Feb': '二月',
	  'Mar': '三月',
	  'Apr': '四月',
	  'May': '五月',
	  'Jun': '六月',
	  'Jul': '七月',
	  'Aug': '八月',
	  'Sep': '九月',
	  'Oct': '十月',
	  'Nov': '十一月',
	  'Dec': '十二月'
	};


/***/ },
/* 56 */
/***/ function(module, exports) {

	module.exports = {
	  'Su': '日',
	  'Mo': '一',
	  'Tu': '二',
	  'We': '三',
	  'Th': '四',
	  'Fr': '五',
	  'Sa': '六',
	  'Jan': '一月',
	  'Feb': '二月',
	  'Mar': '三月',
	  'Apr': '四月',
	  'May': '五月',
	  'Jun': '六月',
	  'Jul': '七月',
	  'Aug': '八月',
	  'Sep': '九月',
	  'Oct': '十月',
	  'Nov': '十一月',
	  'Dec': '十二月'
	};


/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(1);
	var moment = __webpack_require__(9);
	var BaseColumn = __webpack_require__(10);

	var MonthColumn = BaseColumn.extend({
	  attrs: {
	    template: template,
	    process: null,
	    model: {
	      getter: function() {
	        return createMonthModel(
	          this.get('focus'), this.get('process'), this
	        );
	      }
	    }
	  },

	  events: {
	    'click [data-role=month]': function(ev) {
	      var el = $(ev.target);
	      var value = el.data('value');
	      this.select(value, el);
	    }
	  },

	  setup: function() {
	    MonthColumn.superclass.setup.call(this);
	    this.on('change:range', function() {
	      this.element.html($(this.compileTemplate()).html());
	    });
	  },

	  prev: function() {
	    var focus = this.get('focus').add('months', -1);
	    return this._sync(focus);
	  },

	  next: function() {
	    var focus = this.get('focus').add('months', 1);
	    return this._sync(focus);
	  },

	  select: function(value, el) {
	    if (el && el.hasClass('disabled-element')) {
	      this.trigger('selectDisable', value, el);
	      return value;
	    }

	    var focus;
	    if (value.month) {
	      focus = value;
	    } else {
	      focus = this.get('focus').month(value);
	    }
	    return this._sync(focus, el);
	  },

	  focus: function(focus) {
	    focus = focus || this.get('focus');
	    var selector = '[data-value="' + focus.month() + '"]';
	    this.element.find('.focused-element').removeClass('focused-element');
	    this.element.find(selector).addClass('focused-element');
	  },

	  refresh: function() {
	    var focus = this.get('focus').year();
	    var year = this.element.find('[data-year]').data('year');
	    if (parseInt(year, 10) !== focus) {
	      this.element.html($(this.compileTemplate()).html());
	    }
	  },

	  inRange: function(date) {
	    var range = this.get('range');
	    if (date.month) {
	      return isInRange(date, range);
	    }
	    if (date.toString().length < 3) {
	      var time = this.get('focus');
	      return isInRange(time.clone().month(date), range);
	    }
	    return isInRange(moment(date, this.get('format')), range);
	  },

	  _sync: function(focus, el) {
	    this.set('focus', focus);
	    this.refresh();
	    this.focus(focus);
	    // if user call select(value, null) it will not trigger an event
	    if (el !== null) {
	      this.trigger('select', focus.month(), el);
	    }
	    return focus;
	  }
	});

	module.exports = MonthColumn;

	// helpers
	var MONTHS = [
	  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
	  'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
	];

	function createMonthModel(time, fn, ctx) {
	  var month = time.month();
	  var items = [];

	  for (i = 0; i < MONTHS.length; i++) {
	    var item = {
	      value: i,
	      available: ctx.inRange.call(ctx, i),
	      label: MONTHS[i]
	    };
	    if (fn) {
	      item.type = 'month';
	      item = fn(item);
	    }
	    items.push(item);
	  }

	  var current = {
	    year: time.year(),
	    value: month,
	    label: MONTHS[month]
	  };

	  // split [1, 2, .. 12] to [[1, 2, 3, 4], [5, ...]...]
	  var list = [];
	  for (var i = 0; i < items.length / 3; i++) {
	    list.push(items.slice(i * 3, i * 3 + 3));
	  }
	  return {current: current, items: list};
	}

	function isInRange(d, range) {
	  // reset to the first day
	  if (range == null) {
	    return true;
	  }
	  if ($.isArray(range)) {
	    var start = range[0];
	    var end = range[1];
	    var result = true;
	    if (start && start.month) {
	      var lastDate = d.clone().date(d.daysInMonth());
	      lastDate.hour(23).minute(59).second(59).millisecond(999);
	      result = result && lastDate >= start;
	    } else if (start) {
	      result = result && (d.month() + 1) >= start;
	    }
	    if (end && end.month) {
	      var firstDate = d.clone().date(1);
	      firstDate.hour(0).minute(0).second(0).millisecond(0);
	      result = result && firstDate <= end;
	    } else if (end) {
	      result = result && (d.month() + 1) <= end;
	    }
	    return result;
	  } else if ($.isFunction(range)) {
	    return range(d);
	  }
	  return true;
	}

	/* template in handlebars
	<table class="ui-calendar-month" data-role="month-column">
	{{#each items}}
	<tr class="ui-calendar-month-column">
	    {{#each this}}
	    <td class="{{#unless available}}disabled-element{{/unless}}" data-role="month" data-value="{{value}}">{{_ label}}</td>
	    {{/each}}
	</tr>
	{{/each}}
	</table>
	*/

	function template(model, options) {
	  var _ = options.helpers._;
	  var html = '<table class="ui-calendar-month" data-role="month-column">';
	  $.each(model.items, function(i, items) {
	    html += '<tr class="ui-calendar-month-column" data-year="' + model.current.year + '">';
	    $.each(items, function(i, item) {
	      html += '<td data-role="month"';
	      if (!item.available) {
	        html += ' class="disabled-element"';
	      }
	      html += 'data-value="' + item.value + '">';
	      html += _(item.label) + '</td>';
	    });
	    html += '</tr>';
	  });

	  html += '</table>';
	  return html;
	}


/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {var $ = __webpack_require__(1);
	var BaseColumn = __webpack_require__(10);

	var YearColumn = BaseColumn.extend({
	  attrs: {
	    process: null,
	    template: template,
	    model: {
	      getter: function() {
	        return createYearModel(
	          this.get('focus'), this.get('range'), this.get('process')
	        );
	      }
	    }
	  },

	  events: {
	    'click [data-role=year],[data-role=previous-10-year],[data-role=next-10-year]': function(ev) {
	      var el = $(ev.target);
	      var value = el.data('value');
	      this.select(value, el);
	    }
	  },

	  setup: function() {
	    YearColumn.superclass.setup.call(this);
	    this.on('change:range', function() {
	      this.element.html($(this.compileTemplate()).html());
	    });
	  },

	  prev: function() {
	    var focus = this.get('focus').add('years', -1);
	    return this._sync(focus);
	  },

	  next: function() {
	    var focus = this.get('focus').add('years', 1);
	    return this._sync(focus);
	  },

	  select: function(value, el) {
	    if (el && el.hasClass('disabled-element')) {
	      this.trigger('selectDisable', value, el);
	      return value;
	    }
	    var focus;
	    if (value.year) {
	      focus = value;
	    } else {
	      focus = this.get('focus').year(value);
	    }
	    return this._sync(focus, el);
	  },

	  focus: function(focus) {
	    focus = focus || this.get('focus');
	    var selector = '[data-value="' + focus.year() + '"]';
	    this.element.find('.focused-element').removeClass('focused-element');
	    this.element.find(selector).addClass('focused-element');
	  },

	  refresh: function() {
	    var focus = this.get('focus').year();
	    var years = this.element.find('[data-role=year]');
	    if (focus < years.first().data('value') || focus > years.last().data('value')) {
	      this.element.html($(this.compileTemplate()).html());
	    }
	  },

	  inRange: function(date) {
	    return isInRange(date, this.get('range'));
	  },

	  _sync: function(focus, el) {
	    this.set('focus', focus);
	    this.refresh();
	    this.focus(focus);
	    if (el !== null) {
	      this.trigger('select', focus.year(), el);
	    }
	    return focus;
	  }
	});

	module.exports = YearColumn;

	// helpers
	function createYearModel(time, range, fn) {
	  var year = time.year();

	  var items = [process({
	    value: year - 10,
	    label: '. . .',
	    available: true,
	    role: 'previous-10-year'
	  }, fn)];

	  for (var i = year - 6; i < year + 4; i++) {
	    items.push(process({
	      value: i,
	      label: i,
	      available: isInRange(i, range),
	      role: 'year'
	    }, fn));
	  }

	  items.push(process({
	    value: year + 10,
	    label: '. . .',
	    available: true,
	    role: 'next-10-year'
	  }, fn));

	  var list = [];
	  for (i = 0; i < items.length / 3; i++) {
	    list.push(items.slice(i * 3, i * 3 + 3));
	  }

	  var current = {
	    value: year,
	    label: year
	  };

	  return {current: current, items: list};
	}

	function process(item, fn) {
	  if (!fn) {
	    return item;
	  }
	  item.type = 'year';
	  return fn(item);
	}

	function isInRange(date, range) {
	  if (range == null) {
	    return true;
	  }
	  if ($.isArray(range)) {
	    var start = range[0];
	    if (start && start.year) {
	      start = start.year();
	    }
	    var end = range[1];
	    if (end && end.year) {
	      end = end.year();
	    }
	    var result = true;
	    if (start) {
	      result = result && date >= start;
	    }
	    if (end) {
	      result = result && date <= end;
	    }
	    return result;
	  }  else if ($.isFunction(range)) {
	    return range(date);
	  }
	  return true;
	}

	/* template in handlebars
	<table class="ui-calendar-year" data-role="year-column">
	  {{#each items}}
	  <tr class="ui-calendar-year-column">
	    {{#each this}}
	    <td {{#unless available}}class="disabled-element"{{/unless}} data-role="{{role}}" data-value="{{value}}">{{_ label}}</td>
	    {{/each}}
	  </tr>
	  {{/each}}
	</table>
	*/

	function template(model, options) {
	  var _ = options.helpers._;
	  var html = '<table class="ui-calendar-year" data-role="year-column">';

	  $.each(model.items, function(i, items) {
	    html += '<tr class="ui-calendar-year-column">';
	    $.each(items, function(i, item) {
	      html += '<td data-role="' + item.role + '"';
	      if (!item.available) {
	        html += ' class="disabled-element"';
	      }
	      html += 'data-value="' + item.value + '">';
	      html += _(item.label) + '</td>';
	    });
	    html += '</tr>';
	  });

	  html += '</table>';
	  return html;
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(106)))

/***/ },
/* 59 */
/***/ function(module, exports) {

	// Cookie
	// -------------
	// Thanks to:
	//  - http://www.nczonline.net/blog/2009/05/05/http-cookies-explained/
	//  - http://developer.yahoo.com/yui/3/cookie/


	var Cookie = exports;

	var decode = decodeURIComponent;
	var encode = encodeURIComponent;


	/**
	 * Returns the cookie value for the given name.
	 *
	 * @param {String} name The name of the cookie to retrieve.
	 *
	 * @param {Function|Object} options (Optional) An object containing one or
	 *     more cookie options: raw (true/false) and converter (a function).
	 *     The converter function is run on the value before returning it. The
	 *     function is not used if the cookie doesn't exist. The function can be
	 *     passed instead of the options object for conveniently. When raw is
	 *     set to true, the cookie value is not URI decoded.
	 *
	 * @return {*} If no converter is specified, returns a string or undefined
	 *     if the cookie doesn't exist. If the converter is specified, returns
	 *     the value returned from the converter.
	 */
	Cookie.get = function(name, options) {
	    validateCookieName(name);

	    if (typeof options === 'function') {
	        options = { converter: options };
	    }
	    else {
	        options = options || {};
	    }

	    var cookies = parseCookieString(document.cookie, !options['raw']);
	    return (options.converter || same)(cookies[name]);
	};


	/**
	 * Sets a cookie with a given name and value.
	 *
	 * @param {string} name The name of the cookie to set.
	 *
	 * @param {*} value The value to set for the cookie.
	 *
	 * @param {Object} options (Optional) An object containing one or more
	 *     cookie options: path (a string), domain (a string),
	 *     expires (number or a Date object), secure (true/false),
	 *     and raw (true/false). Setting raw to true indicates that the cookie
	 *     should not be URI encoded before being set.
	 *
	 * @return {string} The created cookie string.
	 */
	Cookie.set = function(name, value, options) {
	    validateCookieName(name);

	    options = options || {};
	    var expires = options['expires'];
	    var domain = options['domain'];
	    var path = options['path'];

	    if (!options['raw']) {
	        value = encode(String(value));
	    }

	    var text = name + '=' + value;

	    // expires
	    var date = expires;
	    if (typeof date === 'number') {
	        date = new Date();
	        date.setDate(date.getDate() + expires);
	    }
	    if (date instanceof Date) {
	        text += '; expires=' + date.toUTCString();
	    }

	    // domain
	    if (isNonEmptyString(domain)) {
	        text += '; domain=' + domain;
	    }

	    // path
	    if (isNonEmptyString(path)) {
	        text += '; path=' + path;
	    }

	    // secure
	    if (options['secure']) {
	        text += '; secure';
	    }

	    document.cookie = text;
	    return text;
	};


	/**
	 * Removes a cookie from the machine by setting its expiration date to
	 * sometime in the past.
	 *
	 * @param {string} name The name of the cookie to remove.
	 *
	 * @param {Object} options (Optional) An object containing one or more
	 *     cookie options: path (a string), domain (a string),
	 *     and secure (true/false). The expires option will be overwritten
	 *     by the method.
	 *
	 * @return {string} The created cookie string.
	 */
	Cookie.remove = function(name, options) {
	    options = options || {};
	    options['expires'] = new Date(0);
	    return this.set(name, '', options);
	};


	function parseCookieString(text, shouldDecode) {
	    var cookies = {};

	    if (isString(text) && text.length > 0) {

	        var decodeValue = shouldDecode ? decode : same;
	        var cookieParts = text.split(/;\s/g);
	        var cookieName;
	        var cookieValue;
	        var cookieNameValue;

	        for (var i = 0, len = cookieParts.length; i < len; i++) {

	            // Check for normally-formatted cookie (name-value)
	            cookieNameValue = cookieParts[i].match(/([^=]+)=/i);
	            if (cookieNameValue instanceof Array) {
	                try {
	                    cookieName = decode(cookieNameValue[1]);
	                    cookieValue = decodeValue(cookieParts[i]
	                            .substring(cookieNameValue[1].length + 1));
	                } catch (ex) {
	                    // Intentionally ignore the cookie -
	                    // the encoding is wrong
	                }
	            } else {
	                // Means the cookie does not have an "=", so treat it as
	                // a boolean flag
	                cookieName = decode(cookieParts[i]);
	                cookieValue = '';
	            }

	            if (cookieName) {
	                cookies[cookieName] = cookieValue;
	            }
	        }

	    }

	    return cookies;
	}


	// Helpers

	function isString(o) {
	    return typeof o === 'string';
	}

	function isNonEmptyString(s) {
	    return isString(s) && s !== '';
	}

	function validateCookieName(name) {
	    if (!isNonEmptyString(name)) {
	        throw new TypeError('Cookie name must be a non-empty string');
	    }
	}

	function same(s) {
	    return s;
	}


/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(23);
	module.exports.ConfirmBox = __webpack_require__(61);


/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(1),
	    Dialog = __webpack_require__(23);

	var template = __webpack_require__(37);

	// ConfirmBox
	// -------
	// ConfirmBox 是一个有基础模板和样式的对话框组件。
	var ConfirmBox = Dialog.extend({

	  attrs: {
	    title: '默认标题',

	    confirmTpl: '<a class="ui-dialog-button-orange" href="javascript:;">确定</a>',

	    cancelTpl: '<a class="ui-dialog-button-white" href="javascript:;">取消</a>',

	    message: '默认内容'
	  },

	  setup: function () {
	    ConfirmBox.superclass.setup.call(this);

	    var model = {
	      classPrefix: this.get('classPrefix'),
	      message: this.get('message'),
	      title: this.get('title'),
	      confirmTpl: this.get('confirmTpl'),
	      cancelTpl: this.get('cancelTpl'),
	      hasFoot: this.get('confirmTpl') || this.get('cancelTpl')
	    };
	    this.set('content', template(model));
	  },

	  events: {
	    'click [data-role=confirm]': function (e) {
	      e.preventDefault();
	      this.trigger('confirm');
	    },
	    'click [data-role=cancel]': function (e) {
	      e.preventDefault();
	      this.trigger('cancel');
	      this.hide();
	    }
	  },

	  _onChangeMessage: function (val) {
	    this.$('[data-role=message]').html(val);
	  },

	  _onChangeTitle: function (val) {
	    this.$('[data-role=title]').html(val);
	  },

	  _onChangeConfirmTpl: function (val) {
	    this.$('[data-role=confirm]').html(val);
	  },

	  _onChangeCancelTpl: function (val) {
	    this.$('[data-role=cancel]').html(val);
	  }

	});

	ConfirmBox.alert = function (message, callback, options) {
	  var defaults = {
	    message: message,
	    title: '',
	    cancelTpl: '',
	    closeTpl: '',
	    onConfirm: function () {
	      callback && callback();
	      this.hide();
	    }
	  };
	  new ConfirmBox($.extend(null, defaults, options)).show().after('hide', function () {
	    this.destroy();
	  });
	};

	ConfirmBox.confirm = function (message, title, onConfirm, onCancel, options) {
	  // support confirm(message, title, onConfirm, options)
	  if (typeof onCancel === 'object' && !options) {
	    options = onCancel;
	  }

	  var defaults = {
	    message: message,
	    title: title || '确认框',
	    closeTpl: '',
	    onConfirm: function () {
	      onConfirm && onConfirm();
	      this.hide();
	    },
	    onCancel: function () {
	      onCancel && onCancel();
	      this.hide();
	    }
	  };
	  new ConfirmBox($.extend(null, defaults, options)).show().after('hide', function () {
	    this.destroy();
	  });
	};

	ConfirmBox.show = function (message, callback, options) {
	  var defaults = {
	    message: message,
	    title: '',
	    confirmTpl: false,
	    cancelTpl: false
	  };
	  new ConfirmBox($.extend(null, defaults, options)).show().before('hide', function () {
	    callback && callback();
	  }).after('hide', function () {
	    this.destroy();
	  });
	};

	module.exports = ConfirmBox;


/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	var Dnd = null;

	// 依赖组件
	var $ = __webpack_require__(1);
	var Base = __webpack_require__(6);

	var dndArray = []; // 存储dnd instance的数组
	var uid = 0; // 标识dnd instance的id
	var dnd = null; // 当前拖放的dnd对象
	var element = null; // 当前拖放元素
	var proxy = null; // 当前代理元素
	var drop = null; // 当前可放置容器  note. drops则为设置的可放置容器
	var diffX = 0;
	var diffY = 0; // diffX, diffY记录鼠标点击离源节点的距离
	var dataTransfer = {}; // 存储拖放信息, 在dragstart可设置,在drop中可读取
	var dragPre = false; // 标识预拖放
	var flag = false; // 标识是否正在拖放
	    
	    

	Dnd = Base.extend({
	    attrs: {
	        elements: {
	            value: null,
	            readOnly: true
	        },
	        containment: {
	            value: $(document),
	            setter: function (val) {
	                return $(val).eq(0);
	            }
	        },
	        proxy: {
	            value: null,
	            setter: function (val) {
	                return $(val).eq(0);
	            }  
	        },
	        drops: {
	            value: null,
	            setter: function (val) {
	                return $(val);
	            }  
	        },
	        disabled: false,
	        visible: false,
	        axis: false,
	        revert: false,
	        revertDuration: 500,
	        dragCursor: 'move',
	        dropCursor: 'copy',
	        zIndex: 9999 
	    }, 
	    
	    initialize: function (elem, config) {

	        // 元素不能为空
	        elements = $(elem);
	        if (elements.length === 0) {
	            $.error('element error!');
	        }

	        // 配置初始化
	        config = $.extend({elements: elements}, config);
	        Dnd.superclass.initialize.call(this, config);

	        // 在源节点上存储dnd uid
	        $(elements).data('dnd', uid);
	        dndArray[uid++] = this;
	    }   
	});



	/*
	 * 开启页面Dnd功能,绑定鼠标按下、移动、释放事件
	*/
	Dnd.open = function () {
	    $(document).on('mousedown mousemove mouseup', handleEvent);
	};



	/*
	 * 关闭页面Dnd功能,解绑鼠标按下、移动、释放事件
	*/
	Dnd.close = function () {
	    $(document).off('mousedown mousemove mouseup', handleEvent);
	};



	/*
	 * 核心部分, 处理鼠标按下、移动、释放事件, 实现拖放逻辑
	*/
	function handleEvent(event) {
	    switch(event.type) {
	        case 'mousedown':
	            if (event.which === 1) {

	                // 检测并执行预拖放
	                executeDragPre({
	                    target: event.target, 
	                    pageX: event.pageX,
	                    pageY: event.pageY
	                });

	                // 阻止默认选中文本
	                if (dragPre === true) {
	                    event.preventDefault();
	                }
	            }
	            break;
	        
	        case 'mousemove':
	            if (dragPre === true) {

	                // 开始拖放
	                executeDragStart();
	            } else if (flag === true) {

	                // 根据边界和方向一起判断是否drag并执行
	                executeDrag({
	                    pageX: event.pageX,
	                    pageY: event.pageY
	                });
	                
	                // 根据proxy和可放置容器的相互位置来判断
	                // 是否要dragenter, dragleave和dragover并执行
	                executeDragEnterLeaveOver();
	                
	                // 阻止默认选中文本
	                event.preventDefault();
	            }
	            break;
	        
	        case 'mouseup':
	            if (dragPre === true) {
	                   
	                // 点击而非拖放时
	                proxy.remove();
	                proxy = null;
	                dnd = null;
	                dragPre = false;
	            } else if (flag === true) {
	                flag = false;

	                proxy.css('cursor', 'default');
	                proxy.focus();

	                // 根据当前的可放置容器判断是否drop并执行
	                executeDrop();
	                
	                // 根据revert属性判断是否要返回并执行
	                executeRevert();
	            }
	            break;
	    }
	}



	/*
	 * 鼠标按下触发预拖放
	*/
	function executeDragPre(event) {
	    var targetArray = $(event.target).parents().toArray();
	    
	    // 查找自身和父元素，判断是否为可拖放元素
	    targetArray.unshift(event.target);
	    $.each(targetArray, function (index, elem) {
	        if ($(elem).data('dnd') !== undefined) {
	            dnd = $(elem).data('dnd');

	            if (isNaN(parseInt(dnd, 10)) === false) {
	                dnd = dndArray[parseInt(dnd, 10)];
	                element = $(elem);
	            } else if (dnd === true) {
	                dnd = new Dnd(elem, $(elem).data('config'));
	                element = $(elem);
	            } else if (dnd === false) {

	                // dnd为false标识禁止该元素触发拖放
	                dnd = null;
	            } else {

	                // 继续向上寻找
	                return true;
	            }
	            return false;
	        }
	    });
	            
	    // 不允许拖放则返回
	    if (dnd === null || dnd.get('disabled') === true) return;

	    // 初始化proxy
	    if (dnd.get('proxy') === null) {
	        proxy = element.clone();
	    } else {
	        proxy = dnd.get('proxy');
	    }
	    
	    // 设置代理元素proxy，并将其插入element的父元素中
	    // 这样保证proxy的样式与源节点element一致
	    proxy.css({
	        position: 'absolute',
	        left: 0,
	        top: 0,
	        visibility: 'hidden'
	    });
	    proxy.appendTo(element.parent());

	    // 使代理元素定位到element处
	    proxy.data('originx', proxy.offset().left);
	    proxy.data('originy', proxy.offset().top);
	    proxy.css({
	        left: element.offset().left - proxy.data('originx'), 
	        top: element.offset().top - proxy.data('originy'),
	        width: element.width(),
	        height: element.height()
	    });

	    // 记录鼠标点击位置与源节点element的距离
	    diffX = event.pageX - element.offset().left;
	    diffY = event.pageY - element.offset().top;

	    dragPre = true;
	}



	/*
	 * 鼠标拖动触发拖放
	*/
	function executeDragStart() {
	    var visible = dnd.get('visible');
	    var dragCursor = dnd.get('dragCursor');
	    var zIndex = dnd.get('zIndex');
	    
	    // 按照设置显示或隐藏element
	    if (visible !== true) {
	        element.css('visibility', 'hidden');
	    }

	    // 显示proxy
	    proxy.css({
	        'z-index': zIndex, 
	        visibility: 'visible', 
	        cursor: dragCursor
	    });
	    proxy.focus();
	    
	    dataTransfer = {};
	    dragPre = false;
	    flag = true;
	    dnd.trigger('dragstart', dataTransfer, proxy);
	}



	/*
	 * 根据边界和方向一起判断是否drag并执行
	*/
	function executeDrag(event) {
	    var containment = dnd.get('containment');
	    var axis = dnd.get('axis');
	    var xleft = event.pageX - diffX;
	    var xtop = event.pageY - diffY;
	    var originx = proxy.data('originx');
	    var originy = proxy.data('originy');
	    var offset = containment.offset();
	    
	    // containment is document
	    // 不用 === 是因为 jquery 版本不同，返回值也不同
	    if (!offset) {
	        offset = {left:0, top:0};
	    }
	    
	    // 是否在x方向上移动并执行
	    if (axis !== 'y') {
	        if (xleft >= offset.left &&
	                xleft + proxy.outerWidth() <= offset.left +
	                containment.outerWidth()) {
	            proxy.css('left', xleft - originx);
	        } else {
	            if (xleft <= offset.left) {
	                proxy.css('left', offset.left - originx);
	            } else {
	                proxy.css('left',
	                        offset.left + containment.outerWidth() -  
	                        proxy.outerWidth() - originx);
	            }
	        }
	    }
	    
	    // 是否在y方向上移动并执行
	    if (axis !== 'x') {
	        if (xtop >= offset.top &&
	                xtop + proxy.outerHeight() <= offset.top +
	                containment.outerHeight()) {
	            proxy.css('top', xtop - originy);
	        } else {
	            if (xtop <= offset.top) {
	                proxy.css('top', offset.top - originy);
	            } else {
	                proxy.css('top',
	                        offset.top + containment.outerHeight() -  
	                        proxy.outerHeight() - originy);
	            }
	        }
	    }
	       
	    dnd.trigger('drag', proxy, drop);
	}



	/*
	 * 根据proxy和可放置容器的相互位置来判断是否dragenter,
	 * dragleave和dragover并执行
	*/
	function executeDragEnterLeaveOver() {
	    var drops = dnd.get('drops');
	    var dragCursor = dnd.get('dragCursor');
	    var dropCursor = dnd.get('dropCursor');
	    var xleft = proxy.offset().left + diffX;
	    var xtop = proxy.offset().top + diffY;
	    
	    if (drops === null) {
	        return;
	    }

	    if (drop === null) {
	        $.each(drops, function (index, elem) {
	            if (isContain(elem, xleft, xtop) === true) {
	                proxy.css('cursor', dropCursor);
	                proxy.focus();
	                    
	                drop = $(elem);
	                dnd.trigger('dragenter', proxy, drop);
	                return false; // 跳出each
	            }
	        });
	    } else {
	        if (isContain(drop, xleft, xtop) === false) {
	            proxy.css('cursor', dragCursor);
	            proxy.focus();
	                
	            dnd.trigger('dragleave', proxy, drop);
	            drop = null;
	        } else {
	            dnd.trigger('dragover', proxy, drop);
	        }
	    }
	}



	/*
	 * 根据proxy和当前的可放置容器地相互位置判断是否drop并执行
	 * 当proxy不完全在drop内且不需要revert时, 将proxy置于drop中央
	*/
	function executeDrop() {
	    var revert = dnd.get('revert');
	    var originx = proxy.data('originx');
	    var originy = proxy.data('originy');       
	    
	    if (drop === null) {
	        return;
	    }
	        
	    // 放置时不完全在drop中并且不需要返回的则放置中央
	    if (isContain(drop, proxy) === false && revert === false) {
	        proxy.css('left', drop.offset().left + 
	                (drop.outerWidth() - proxy.outerWidth()) / 2 - originx);
	        proxy.css('top', drop.offset().top +
	                (drop.outerHeight() - proxy.outerHeight()) / 2 - originy);
	    }
	    
	    dnd.trigger('drop', dataTransfer, proxy, drop);
	}



	/*
	 * 根据revert判断是否要返回并执行
	 * 若可放置容器drops不为null且当前可放置容器drop为null, 则自动回到原处
	 * 处理完移除代理元素
	*/
	function executeRevert() {
	    var drops = dnd.get('drops');
	    var revert = dnd.get('revert');
	    var revertDuration = dnd.get('revertDuration');
	    var visible = dnd.get('visible');
	    var zIndex = dnd.get('zIndex');
	    var xleft = proxy.offset().left - element.offset().left;
	    var xtop = proxy.offset().top -  element.offset().top;
	    var originx = proxy.data('originx');
	    var originy = proxy.data('originy');
	        
	    if (revert === true || (drop === null && drops !== null)) {
	        
	        //代理元素返回源节点初始位置
	        proxy.animate({
	            left: element.offset().left - originx,
	            top: element.offset().top - originy
	        }, revertDuration, function () {
	            element.css('visibility', '');
	            proxy.remove();
	            proxy = null;

	            // 触发dragend
	            dnd.trigger('dragend', element, drop);
	            dnd = null;
	            drop = null;
	        });
	    } else {
	        
	        // 源节点移动到代理元素处
	        if (element.css('position') === 'relative') {
	            xleft = (isNaN(parseInt(element.css('left'), 10)) ? 0 : 
	                    parseInt(element.css('left'), 10)) + xleft;
	            xtop = (isNaN(parseInt(element.css('top'), 10)) ? 0 : 
	                    parseInt(element.css('top'), 10)) + xtop;
	        } else if (element.css('position') === 'absolute') {
	            xleft = proxy.offset().left;
	            xtop = proxy.offset().top;
	        } else {
	            element.css('position', 'relative');
	        }
	        
	        if (visible === false) {
	            element.css({
	                left: xleft, 
	                top: xtop, 
	                visibility: '',
	                'z-index': zIndex
	            });
	            proxy.remove();
	            proxy = null;

	            // 触发dragend
	            dnd.trigger('dragend', element, drop);
	            dnd = null;
	            drop = null;
	        } else {
	            
	            // 源节点显示时，动画移动到代理元素处
	            element.animate({
	                left: xleft,
	                top: xtop
	            }, revertDuration, function () {
	                proxy.remove();
	                proxy = null;

	                // 触发dragend
	                dnd.trigger('dragend', element, drop);
	                dnd = null;
	                drop = null;
	            });  
	        }
	    }
	}



	/*
	 * 判断元素B是否位于元素A内部
	 * or 点(B, C)是否位于A内
	*/
	function isContain(A, B, C) {
	    var offset = $(A).offset();
	    
	    // A is document
	    if (!offset) {
	        offset = {left:0, top:0};
	    }
	   
	    if (arguments.length === 2) {
	        return offset.left <= $(B).offset().left &&
	                offset.left + $(A).outerWidth() >= 
	                $(B).offset().left + $(B).outerWidth() &&
	                offset.top <= $(B).offset().top && 
	                offset.top + $(A).outerHeight() >=
	                $(B).offset().top + $(B).outerHeight();
	    } 
	    if (arguments.length === 3) {  
	        return offset.left <= B &&
	                offset.left + $(A).outerWidth() >= B &&
	                offset.top <= C &&
	                offset.top + $(A).outerHeight() >= C;
	    }
	}



	Dnd.open();
	module.exports = Dnd;


/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(1),
	    Overlay = __webpack_require__(26),
	    
	    
	    ua = (window.navigator.userAgent || "").toLowerCase(),
	    isIE6 = ua.indexOf("msie 6") !== -1,
	    
	    
	    body = $(document.body),
	    doc = $(document);


	// Mask
	// ----------
	// 全屏遮罩层组件
	var Mask = Overlay.extend({

	  attrs: {
	    width: isIE6 ? doc.outerWidth(true) : '100%',
	    height: isIE6 ? doc.outerHeight(true) : '100%',

	    className: 'ui-mask',
	    opacity: 0.2,
	    backgroundColor: '#000',
	    style: {
	      position: isIE6 ? 'absolute' : 'fixed',
	      top: 0,
	      left: 0
	    },

	    align: {
	      // undefined 表示相对于当前可视范围定位
	      baseElement: isIE6 ? body : undefined
	    }
	  },

	  show: function () {
	    if (isIE6) {
	      this.set('width', doc.outerWidth(true));
	      this.set('height', doc.outerHeight(true));
	    }
	    return Mask.superclass.show.call(this);
	  },

	  _onRenderBackgroundColor: function (val) {
	    this.element.css('backgroundColor', val);
	  },

	  _onRenderOpacity: function (val) {
	    this.element.css('opacity', val);
	  }
	});

	// 单例
	module.exports = new Mask();

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	// placeholder
	// --------
	// 针对不支持placeholder的浏览器做的模拟支持
	// Thanks to
	// - https://github.com/mathiasbynens/jquery-placeholder

	var $ = __webpack_require__(1),
	    placeholder;

	// 以下代码引用，稍微修改了点
	var ret = (function($){

	    var isInputSupported = 'placeholder' in document.createElement('input'),
	        isTextareaSupported = 'placeholder' in document.createElement('textarea'),
	        // 这里的修改是为了防止修改$.fn
	        // prototype = $.fn,
	        prototype = {},
	        valHooks = $.valHooks,
	        hooks,
	        placeholder;

	    if (isInputSupported && isTextareaSupported) {

	        placeholder = prototype.placeholder = function() {
	            return this;
	        };

	        placeholder.input = placeholder.textarea = true;

	    } else {

	        placeholder = prototype.placeholder = function() {
	            var $this = this;
	            $this
	                .filter((isInputSupported ? 'textarea' : ':input') + '[placeholder]')
	                .unbind({
	                    'focus.placeholder': clearPlaceholder,
	                    'blur.placeholder': setPlaceholder
	                })
	                .bind({
	                    'focus.placeholder': clearPlaceholder,
	                    'blur.placeholder': setPlaceholder
	                })
	                .data('placeholder-enabled', true)
	                .trigger('blur.placeholder');
	            return $this;
	        };

	        placeholder.input = isInputSupported;
	        placeholder.textarea = isTextareaSupported;

	        hooks = {
	            'get': function(element) {
	                var $element = $(element);
	                return $element.data('placeholder-enabled') && $element.hasClass('placeholder') ? '' : element.value;
	            },
	            'set': function(element, value) {
	                var $element = $(element);
	                if (!$element.data('placeholder-enabled')) {
	                    return element.value = value;
	                }
	                if (value == '') {
	                    element.value = value;
	                    // Issue #56: Setting the placeholder causes problems if the element continues to have focus.
	                    if (element != document.activeElement) {
	                        // We can't use `triggerHandler` here because of dummy text/password inputs :(
	                        setPlaceholder.call(element);
	                    }
	                } else if ($element.hasClass('placeholder')) {
	                    clearPlaceholder.call(element, true, value) || (element.value = value);
	                } else {
	                    element.value = value;
	                }
	                // `set` can not return `undefined`; see http://jsapi.info/jquery/1.7.1/val#L2363
	                return $element;
	            }
	        };

	        // 这里的修改是为了防止别的hooks被覆盖
	        if(!isInputSupported){
	            var _old = valHooks.input;

	            if(_old){
	                valHooks.input = {
	                    'get': function(){
	                        if(_old.get){
	                            _old.get.apply(this, arguments);
	                        }

	                        return hooks.get.apply(this, arguments);
	                    },
	                    'set': function(){
	                        if(_old.set){
	                            _old.set.apply(this, arguments);
	                        }

	                        return hooks.set.apply(this, arguments);
	                    }
	                };
	            } else {
	                valHooks.input = hooks;
	            }
	        }
	        if(!isTextareaSupported){
	            var _old = valHooks.textarea;

	            if(_old){
	                valHooks.textarea = {
	                    'get': function(){
	                        if(_old.get){
	                            _old.get.apply(this, arguments);
	                        }

	                        return hooks.get.apply(this, arguments);
	                    },
	                    'set': function(){
	                        if(_old.set){
	                            _old.set.apply(this, arguments);
	                        }	

	                        return hooks.set.apply(this, arguments);
	                    }
	                };
	            } else {
	                valHooks.textarea = hooks;
	            }
	        }

	        $(function() {
	            // Look for forms
	            $(document).delegate('form', 'submit.placeholder', function() {
	                // Clear the placeholder values so they don't get submitted
	                var $inputs = $('.placeholder', this).each(clearPlaceholder);
	                setTimeout(function() {
	                    $inputs.each(setPlaceholder);
	                }, 10);
	            });
	        });

	        // Clear placeholder values upon page reload
	        $(window).bind('beforeunload.placeholder', function() {
	            $('.placeholder').each(function() {
	                this.value = '';
	            });
	        });

	    }

	    function args(elem) {
	        // Return an object of element attributes
	        var newAttrs = {},
	            rinlinejQuery = /^jQuery\d+$/;
	        $.each(elem.attributes, function(i, attr) {
	            if (attr.specified && !rinlinejQuery.test(attr.name)) {
	                newAttrs[attr.name] = attr.value;
	            }
	        });
	        return newAttrs;
	    }

	    function clearPlaceholder(event, value) {
	        var input = this,
	            $input = $(input);

	        // 修改演示四出现的问题
	        if ((input.value == $input.attr('placeholder') || input.value == '')
	            && $input.hasClass('placeholder')) {
	            if ($input.data('placeholder-password')) {
	                $input = $input.hide().next().show().attr('id', $input.removeAttr('id').data('placeholder-id'));
	                // If `clearPlaceholder` was called from `$.valHooks.input.set`
	                if (event === true) {
	                    return $input[0].value = value;
	                }
	                $input.focus();
	            } else {
	                input.value = '';
	                $input.removeClass('placeholder');
	                input == document.activeElement && input.select();
	            }
	        }
	    }

	    function setPlaceholder() {
	        var $replacement,
	            input = this,
	            $input = $(input),
	            $origInput = $input,
	            id = this.id;
	        if ($(input).val() == '') {
	            if (input.type == 'password') {
	                if (!$input.data('placeholder-textinput')) {
	                    try {
	                        $replacement = $input.clone().attr({ 'type': 'text' });
	                    } catch(e) {
	                        $replacement = $('<input>').attr($.extend(args(this), { 'type': 'text' }));
	                    }
	                    $replacement
	                        .removeAttr('name')
	                        .data({
	                            'placeholder-password': true,
	                            'placeholder-id': id
	                        })
	                        .bind('focus.placeholder', clearPlaceholder);
	                    $input
	                        .data({
	                            'placeholder-textinput': $replacement,
	                            'placeholder-id': id
	                        })
	                        .before($replacement);
	                }
	                $input = $input.removeAttr('id').hide().prev().attr('id', id).show();
	                // Note: `$input[0] != input` now!
	            }
	            $input.addClass('placeholder');
	            $input[0].value = $input.attr('placeholder');
	        } else {
	            $input.removeClass('placeholder');
	        }
	    }

	    return placeholder;

	})($);

	// 做简单的api封装
	placeholder = (!ret.input || !ret.textarea) ? function(element){
	    if(!element){
	        element = $('input, textarea');
	    }
	    if(element){
	        ret.call($(element));
	    }
	} : function(){};

	// 默认运行，这样就不需要手动调用
	placeholder();

	// 提供清除 input.value 的方法
	placeholder.clear = function(element) {
	    element = $(element);
	    if (element[0].tagName === 'FORM') {
	        // 寻找表单下所有的 input 元素
	        clearInput(element.find('input.placeholder, textarea.placeholder'));
	    } else {
	        // 清除指定的 input 元素
	        clearInput(element);
	    }
	    function clearInput(input) {
	        input.each(function(i, item) {
	            item = $(item);
	            if (item[0].value === item.attr('placeholder') &&
	                item.hasClass('placeholder')) {
	                item[0].value = ''; // 置空避免表单提交
	            }
	        });
	    }
	};

	module.exports = placeholder;


/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(1);
	var Overlay = __webpack_require__(7);


	// Popup 是可触发 Overlay 型 UI 组件
	var Popup = Overlay.extend({

	  attrs: {
	    // 触发元素
	    trigger: {
	      value: null,
	      // required
	      getter: function (val) {
	        return $(val);
	      }
	    },

	    // 触发类型
	    triggerType: 'hover',
	    // or click or focus
	    // 触发事件委托的对象
	    delegateNode: {
	      value: null,
	      getter: function (val) {
	        return $(val);
	      }
	    },

	    // 默认的定位参数
	    align: {
	      value: {
	        baseXY: [0, '100%'],
	        selfXY: [0, 0]
	      },
	      setter: function (val) {
	        if (!val) {
	          return;
	        }
	        if (val.baseElement) {
	          this._specifiedBaseElement = true;
	        } else if (this.activeTrigger) {
	          // 若给的定位元素未指定基准元素
	          // 就给一个...
	          val.baseElement = this.activeTrigger;
	        }
	        return val;
	      },
	      getter: function (val) {
	        // 若未指定基准元素，则按照当前的触发元素进行定位
	        return $.extend({}, val, this._specifiedBaseElement ? {} : {
	          baseElement: this.activeTrigger
	        });
	      }
	    },

	    // 延迟触发和隐藏时间
	    delay: 70,

	    // 是否能够触发
	    // 可以通过set('disabled', true)关闭
	    disabled: false,

	    // 基本的动画效果，可选 fade|slide
	    effect: '',

	    // 动画的持续时间
	    duration: 250

	  },

	  setup: function () {
	    Popup.superclass.setup.call(this);
	    this._bindTrigger();
	    this._blurHide(this.get('trigger'));

	    // 默认绑定activeTrigger为第一个元素
	    // for https://github.com/aralejs/popup/issues/6
	    this.activeTrigger = this.get('trigger').eq(0);

	    // 当使用委托事件时，_blurHide 方法对于新添加的节点会失效
	    // 这时需要重新绑定
	    var that = this;
	    if (this.get('delegateNode')) {
	      this.before('show', function () {
	        that._relativeElements = that.get('trigger');
	        that._relativeElements.push(that.element);
	      });
	    }
	  },

	  render: function () {
	    Popup.superclass.render.call(this);

	    // 通过 template 生成的元素默认也应该是不可见的
	    // 所以插入元素前强制隐藏元素，#20
	    this.element.hide();
	    return this;
	  },

	  show: function () {
	    if (this.get('disabled')) {
	      return;
	    }
	    return Popup.superclass.show.call(this);
	  },

	  // triggerShimSync 为 true 时
	  // 表示什么都不做，只是触发 hide 的 before/after 绑定方法
	  hide: function (triggerShimSync) {
	    if (!triggerShimSync) {
	      return Popup.superclass.hide.call(this);
	    }
	    return this;
	  },

	  _bindTrigger: function () {
	    var triggerType = this.get('triggerType');

	    if (triggerType === 'click') {
	      this._bindClick();
	    } else if (triggerType === 'focus') {
	      this._bindFocus();
	    } else {
	      // 默认是 hover
	      this._bindHover();
	    }
	  },

	  _bindClick: function () {
	    var that = this;

	    bindEvent('click', this.get('trigger'), function (e) {
	      // this._active 这个变量表明了当前触发元素是激活状态
	      if (this._active === true) {
	        that.hide();
	      } else {
	        // 将当前trigger标为激活状态
	        makeActive(this);
	        that.show();
	      }
	    }, this.get('delegateNode'), this);

	    // 隐藏前清空激活状态
	    this.before('hide', function () {
	      makeActive();
	    });

	    // 处理所有trigger的激活状态
	    // 若 trigger 为空，相当于清除所有元素的激活状态


	    function makeActive(trigger) {
	      if (that.get('disabled')) {
	        return;
	      }
	      that.get('trigger').each(function (i, item) {
	        if (trigger == item) {
	          item._active = true;
	          // 标识当前点击的元素
	          that.activeTrigger = $(item);
	        } else {
	          item._active = false;
	        }
	      });
	    }
	  },

	  _bindFocus: function () {
	    var that = this;

	    bindEvent('focus', this.get('trigger'), function () {
	      // 标识当前点击的元素
	      that.activeTrigger = $(this);
	      that.show();
	    }, this.get('delegateNode'), this);

	    bindEvent('blur', this.get('trigger'), function () {
	      setTimeout(function () {
	        (!that._downOnElement) && that.hide();
	        that._downOnElement = false;
	      }, that.get('delay'));
	    }, this.get('delegateNode'), this);

	    // 为了当input blur时能够选择和操作弹出层上的内容
	    this.delegateEvents("mousedown", function (e) {
	      this._downOnElement = true;
	    });
	  },

	  _bindHover: function () {
	    var trigger = this.get('trigger');
	    var delegateNode = this.get('delegateNode');
	    var delay = this.get('delay');

	    var showTimer, hideTimer;
	    var that = this;

	    // 当 delay 为负数时
	    // popup 变成 tooltip 的效果
	    if (delay < 0) {
	      this._bindTooltip();
	      return;
	    }

	    bindEvent('mouseenter', trigger, function () {
	      clearTimeout(hideTimer);
	      hideTimer = null;

	      // 标识当前点击的元素
	      that.activeTrigger = $(this);
	      showTimer = setTimeout(function () {
	        that.show();
	      }, delay);
	    }, delegateNode, this);

	    bindEvent('mouseleave', trigger, leaveHandler, delegateNode, this);

	    // 鼠标在悬浮层上时不消失
	    this.delegateEvents("mouseenter", function () {
	      clearTimeout(hideTimer);
	    });
	    this.delegateEvents("mouseleave", leaveHandler);

	    this.element.on('mouseleave', 'select', function (e) {
	      e.stopPropagation();
	    });

	    function leaveHandler(e) {
	      clearTimeout(showTimer);
	      showTimer = null;

	      if (that.get('visible')) {
	        hideTimer = setTimeout(function () {
	          that.hide();
	        }, delay);
	      }
	    }
	  },

	  _bindTooltip: function () {
	    var trigger = this.get('trigger');
	    var delegateNode = this.get('delegateNode');
	    var that = this;

	    bindEvent('mouseenter', trigger, function () {
	      // 标识当前点击的元素
	      that.activeTrigger = $(this);
	      that.show();
	    }, delegateNode, this);

	    bindEvent('mouseleave', trigger, function () {
	      that.hide();
	    }, delegateNode, this);
	  },

	  _onRenderVisible: function (val, originVal) {
	    // originVal 为 undefined 时不继续执行
	    if (val === !! originVal) {
	      return;
	    }

	    var fade = (this.get('effect').indexOf('fade') !== -1);
	    var slide = (this.get('effect').indexOf('slide') !== -1);
	    var animConfig = {};
	    slide && (animConfig.height = (val ? 'show' : 'hide'));
	    fade && (animConfig.opacity = (val ? 'show' : 'hide'));

	    // 需要在回调时强制调一下 hide
	    // 来触发 iframe-shim 的 sync 方法
	    // 修复 ie6 下 shim 未隐藏的问题
	    // visible 只有从 true 变为 false 时，才调用这个 hide
	    var that = this;
	    var hideComplete = val ?
	    function () {
	      that.trigger('animated');
	    } : function () {
	      // 参数 true 代表只是为了触发 shim 方法
	      that.hide(true);
	      that.trigger('animated');
	    };

	    if (fade || slide) {
	      this.element.stop(true, true).animate(animConfig, this.get('duration'), hideComplete).css({
	        'visibility': 'visible'
	      });
	    } else {
	      this.element[val ? 'show' : 'hide']();
	    }
	  }

	});

	module.exports = Popup;

	// 一个绑定事件的简单封装


	function bindEvent(type, element, fn, delegateNode, context) {
	  var hasDelegateNode = delegateNode && delegateNode[0];

	  context.delegateEvents(
	  hasDelegateNode ? delegateNode : element, hasDelegateNode ? type + " " + element.selector : type, function (e) {
	    fn.call(e.currentTarget, e);
	  });
	}

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(67);

/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var extend = __webpack_require__(90);
	var qrcodeAlgObjCache = [];
	var QRCodeAlg = __webpack_require__(68);

	/**
	* 计算矩阵点的前景色
	* @param {Obj} config
	* @param {Number} config.row 点x坐标
	* @param {Number} config.col 点y坐标
	* @param {Number} config.count 矩阵大小
	* @param {Number} config.options 组件的options
	* @return {String}
	*/
	var getForeGround = function getForeGround(config) {
	    var options = config.options;
	    if (options.pdground && (config.row > 1 && config.row < 5 && config.col > 1 && config.col < 5 || config.row > config.count - 6 && config.row < config.count - 2 && config.col > 1 && config.col < 5 || config.row > 1 && config.row < 5 && config.col > config.count - 6 && config.col < config.count - 2)) {
	        return options.pdground;
	    }
	    return options.foreground;
	};
	/**
	* 点是否在Position Detection
	* @param  {row} 矩阵行
	* @param  {col} 矩阵列
	* @param  {count} 矩阵大小
	* @return {Boolean}
	*/
	var inPositionDetection = function inPositionDetection(row, col, count) {
	    if (row < 7 && col < 7 || row > count - 8 && col < 7 || row < 7 && col > count - 8) {
	        return true;
	    }
	    return false;
	};
	/**
	* 获取当前屏幕的设备像素比 devicePixelRatio/backingStore
	* @param {context} 当前 canvas 上下文，可以为 window
	*/
	var getPixelRatio = function getPixelRatio(context) {
	    var backingStore = context.backingStorePixelRatio || context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;

	    return (window.devicePixelRatio || 1) / backingStore;
	};

	/**
	 * 二维码构造函数，主要用于绘制
	 * @param  {参数列表} opt 传递参数
	 * @return {}
	 */
	var qrcode = function qrcode(opt) {
	    if (typeof opt === 'string') {
	        // 只编码ASCII字符串
	        opt = {
	            text: opt
	        };
	    }
	    //设置默认参数
	    this.options = extend({}, {
	        text: '',
	        render: '',
	        size: 256,
	        correctLevel: 3,
	        background: '#ffffff',
	        foreground: '#000000',
	        image: '',
	        imageSize: 30
	    }, opt);

	    //使用QRCodeAlg创建二维码结构
	    var qrCodeAlg = null;
	    for (var i = 0, l = qrcodeAlgObjCache.length; i < l; i++) {
	        if (qrcodeAlgObjCache[i].text == this.options.text && qrcodeAlgObjCache[i].text.correctLevel == this.options.correctLevel) {
	            qrCodeAlg = qrcodeAlgObjCache[i].obj;
	            break;
	        }
	    }

	    if (i == l) {
	        qrCodeAlg = new QRCodeAlg(this.options.text, this.options.correctLevel);
	        qrcodeAlgObjCache.push({ text: this.options.text, correctLevel: this.options.correctLevel, obj: qrCodeAlg });
	    }

	    if (this.options.render) {
	        switch (this.options.render) {
	            case 'canvas':
	                return this.createCanvas(qrCodeAlg);
	            case 'table':
	                return this.createTable(qrCodeAlg);
	            case 'svg':
	                return this.createSVG(qrCodeAlg);
	            default:
	                return this.createDefault(qrCodeAlg);
	        }
	    }
	    return this.createDefault(qrCodeAlg);
	};

	extend(qrcode.prototype, {
	    // default create  canvas -> svg -> table
	    createDefault: function createDefault(qrCodeAlg) {
	        var canvas = document.createElement('canvas');
	        if (canvas.getContext) {
	            return this.createCanvas(qrCodeAlg);
	        }
	        var SVG_NS = 'http://www.w3.org/2000/svg';
	        if (!!document.createElementNS && !!document.createElementNS(SVG_NS, 'svg').createSVGRect) {
	            return this.createSVG(qrCodeAlg);
	        }
	        return this.createTable(qrCodeAlg);
	    },
	    // canvas create
	    createCanvas: function createCanvas(qrCodeAlg) {
	        var options = this.options;
	        var canvas = document.createElement('canvas');
	        var ctx = canvas.getContext('2d');
	        var count = qrCodeAlg.getModuleCount();
	        var ratio = getPixelRatio(ctx);
	        var size = options.size;
	        var ratioSize = size * ratio;
	        var ratioImgSize = options.imageSize * ratio;
	        // preload img
	        var loadImage = function loadImage(url, callback) {
	            var img = new Image();
	            img.src = url;
	            img.onload = function () {
	                callback(this);
	                img.onload = null;
	            };
	        };

	        //计算每个点的长宽
	        var tileW = (ratioSize / count).toPrecision(4);
	        var tileH = (ratioSize / count).toPrecision(4);

	        canvas.width = ratioSize;
	        canvas.height = ratioSize;

	        //绘制
	        for (var row = 0; row < count; row++) {
	            for (var col = 0; col < count; col++) {
	                var w = Math.ceil((col + 1) * tileW) - Math.floor(col * tileW);
	                var h = Math.ceil((row + 1) * tileW) - Math.floor(row * tileW);
	                var foreground = getForeGround({
	                    row: row,
	                    col: col,
	                    count: count,
	                    options: options
	                });
	                ctx.fillStyle = qrCodeAlg.modules[row][col] ? foreground : options.background;
	                ctx.fillRect(Math.round(col * tileW), Math.round(row * tileH), w, h);
	            }
	        }
	        if (options.image) {
	            loadImage(options.image, function (img) {
	                var x = ((ratioSize - ratioImgSize) / 2).toFixed(2);
	                var y = ((ratioSize - ratioImgSize) / 2).toFixed(2);
	                ctx.drawImage(img, x, y, ratioImgSize, ratioImgSize);
	            });
	        }
	        canvas.style.width = size + 'px';
	        canvas.style.height = size + 'px';
	        return canvas;
	    },
	    // table create
	    createTable: function createTable(qrCodeAlg) {
	        var options = this.options;
	        var count = qrCodeAlg.getModuleCount();

	        // 计算每个节点的长宽；取整，防止点之间出现分离
	        var tileW = Math.floor(options.size / count);
	        var tileH = Math.floor(options.size / count);
	        if (tileW <= 0) {
	            tileW = count < 80 ? 2 : 1;
	        }
	        if (tileH <= 0) {
	            tileH = count < 80 ? 2 : 1;
	        }

	        //创建table节点
	        //重算码大小
	        var s = [];
	        s.push('<table style="border:0px; margin:0px; padding:0px; border-collapse:collapse; background-color:' + options.background + ';">');

	        // 绘制二维码
	        for (var row = 0; row < count; row++) {
	            s.push('<tr style="border:0px; margin:0px; padding:0px; height:' + tileH + 'px">');
	            for (var col = 0; col < count; col++) {
	                var foreground = getForeGround({
	                    row: row,
	                    col: col,
	                    count: count,
	                    options: options
	                });
	                if (qrCodeAlg.modules[row][col]) {
	                    s.push('<td style="border:0px; margin:0px; padding:0px; width:' + tileW + 'px; background-color:' + foreground + '"></td>');
	                } else {
	                    s.push('<td style="border:0px; margin:0px; padding:0px; width:' + tileW + 'px; background-color:' + options.background + '"></td>');
	                }
	            }
	            s.push('</tr>');
	        }
	        s.push('</table>');

	        if (options.image) {
	            // 计算表格的总大小
	            var width = tileW * count;
	            var height = tileH * count;
	            var x = ((width - options.imageSize) / 2).toFixed(2);
	            var y = ((height - options.imageSize) / 2).toFixed(2);
	            s.unshift('<div style=\'position:relative;\n                        width:' + width + 'px;\n                        height:' + height + 'px;\'>');
	            s.push('<img src=\'' + options.image + '\'\n                        width=\'' + options.imageSize + '\'\n                        height=\'' + options.imageSize + '\'\n                        style=\'position:absolute;left:' + x + 'px; top:' + y + 'px;\'>');
	            s.push('</div>');
	        }

	        var span = document.createElement('span');
	        span.innerHTML = s.join('');

	        return span.firstChild;
	    },
	    // create svg
	    createSVG: function createSVG(qrCodeAlg) {
	        var options = this.options;
	        var count = qrCodeAlg.getModuleCount();
	        var scale = count / options.size;

	        // create svg
	        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	        svg.setAttribute('width', options.size);
	        svg.setAttribute('height', options.size);
	        svg.setAttribute('viewBox', '0 0 ' + count + ' ' + count);

	        for (var row = 0; row < count; row++) {
	            for (var col = 0; col < count; col++) {
	                var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
	                var foreground = getForeGround({
	                    row: row,
	                    col: col,
	                    count: count,
	                    options: options
	                });
	                rect.setAttribute('x', col);
	                rect.setAttribute('y', row);
	                rect.setAttribute('width', 1);
	                rect.setAttribute('height', 1);
	                rect.setAttribute('stroke-width', 0);
	                if (qrCodeAlg.modules[row][col]) {
	                    rect.setAttribute('fill', foreground);
	                } else {
	                    rect.setAttribute('fill', options.background);
	                }
	                svg.appendChild(rect);
	            }
	        }

	        // create image
	        if (options.image) {
	            var img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
	            img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', options.image);
	            img.setAttribute('x', ((count - options.imageSize * scale) / 2).toFixed(2));
	            img.setAttribute('y', ((count - options.imageSize * scale) / 2).toFixed(2));
	            img.setAttribute('width', options.imageSize * scale);
	            img.setAttribute('height', options.imageSize * scale);
	            svg.appendChild(img);
	        }

	        return svg;
	    }
	});
	module.exports = qrcode;

/***/ },
/* 68 */
/***/ function(module, exports) {

	/**
	 * 获取单个字符的utf8编码
	 * unicode BMP平面约65535个字符
	 * @param {num} code
	 * return {array}
	 */
	"use strict";

	function unicodeFormat8(code) {
		// 1 byte
		var c0, c1, c2;
		if (code < 128) {
			return [code];
			// 2 bytes
		} else if (code < 2048) {
				c0 = 192 + (code >> 6);
				c1 = 128 + (code & 63);
				return [c0, c1];
				// 3 bytes
			} else {
					c0 = 224 + (code >> 12);
					c1 = 128 + (code >> 6 & 63);
					c2 = 128 + (code & 63);
					return [c0, c1, c2];
				}
	}

	/**
	 * 获取字符串的utf8编码字节串
	 * @param {string} string
	 * @return {array}
	 */
	function getUTF8Bytes(string) {
		var utf8codes = [];
		for (var i = 0; i < string.length; i++) {
			var code = string.charCodeAt(i);
			var utf8 = unicodeFormat8(code);
			for (var j = 0; j < utf8.length; j++) {
				utf8codes.push(utf8[j]);
			}
		}
		return utf8codes;
	}

	/**
	 * 二维码算法实现
	 * @param {string} data              要编码的信息字符串
	 * @param {num} errorCorrectLevel 纠错等级
	 */
	function QRCodeAlg(data, errorCorrectLevel) {
		this.typeNumber = -1; //版本
		this.errorCorrectLevel = errorCorrectLevel;
		this.modules = null; //二维矩阵，存放最终结果
		this.moduleCount = 0; //矩阵大小
		this.dataCache = null; //数据缓存
		this.rsBlocks = null; //版本数据信息
		this.totalDataCount = -1; //可使用的数据量
		this.data = data;
		this.utf8bytes = getUTF8Bytes(data);
		this.make();
	}

	QRCodeAlg.prototype = {
		constructor: QRCodeAlg,
		/**
	  * 获取二维码矩阵大小
	  * @return {num} 矩阵大小
	  */
		getModuleCount: function getModuleCount() {
			return this.moduleCount;
		},
		/**
	  * 编码
	  */
		make: function make() {
			this.getRightType();
			this.dataCache = this.createData();
			this.createQrcode();
		},
		/**
	  * 设置二位矩阵功能图形
	  * @param  {bool} test 表示是否在寻找最好掩膜阶段
	  * @param  {num} maskPattern 掩膜的版本
	  */
		makeImpl: function makeImpl(maskPattern) {

			this.moduleCount = this.typeNumber * 4 + 17;
			this.modules = new Array(this.moduleCount);

			for (var row = 0; row < this.moduleCount; row++) {

				this.modules[row] = new Array(this.moduleCount);
			}
			this.setupPositionProbePattern(0, 0);
			this.setupPositionProbePattern(this.moduleCount - 7, 0);
			this.setupPositionProbePattern(0, this.moduleCount - 7);
			this.setupPositionAdjustPattern();
			this.setupTimingPattern();
			this.setupTypeInfo(true, maskPattern);

			if (this.typeNumber >= 7) {
				this.setupTypeNumber(true);
			}
			this.mapData(this.dataCache, maskPattern);
		},
		/**
	  * 设置二维码的位置探测图形
	  * @param  {num} row 探测图形的中心横坐标
	  * @param  {num} col 探测图形的中心纵坐标
	  */
		setupPositionProbePattern: function setupPositionProbePattern(row, col) {

			for (var r = -1; r <= 7; r++) {

				if (row + r <= -1 || this.moduleCount <= row + r) continue;

				for (var c = -1; c <= 7; c++) {

					if (col + c <= -1 || this.moduleCount <= col + c) continue;

					if (0 <= r && r <= 6 && (c == 0 || c == 6) || 0 <= c && c <= 6 && (r == 0 || r == 6) || 2 <= r && r <= 4 && 2 <= c && c <= 4) {
						this.modules[row + r][col + c] = true;
					} else {
						this.modules[row + r][col + c] = false;
					}
				}
			}
		},
		/**
	  * 创建二维码
	  * @return {[type]} [description]
	  */
		createQrcode: function createQrcode() {

			var minLostPoint = 0;
			var pattern = 0;
			var bestModules = null;

			for (var i = 0; i < 8; i++) {

				this.makeImpl(i);

				var lostPoint = QRUtil.getLostPoint(this);
				if (i == 0 || minLostPoint > lostPoint) {
					minLostPoint = lostPoint;
					pattern = i;
					bestModules = this.modules;
				}
			}
			this.modules = bestModules;
			this.setupTypeInfo(false, pattern);

			if (this.typeNumber >= 7) {
				this.setupTypeNumber(false);
			}
		},
		/**
	  * 设置定位图形
	  * @return {[type]} [description]
	  */
		setupTimingPattern: function setupTimingPattern() {

			for (var r = 8; r < this.moduleCount - 8; r++) {
				if (this.modules[r][6] != null) {
					continue;
				}
				this.modules[r][6] = r % 2 == 0;

				if (this.modules[6][r] != null) {
					continue;
				}
				this.modules[6][r] = r % 2 == 0;
			}
		},
		/**
	  * 设置矫正图形
	  * @return {[type]} [description]
	  */
		setupPositionAdjustPattern: function setupPositionAdjustPattern() {

			var pos = QRUtil.getPatternPosition(this.typeNumber);

			for (var i = 0; i < pos.length; i++) {

				for (var j = 0; j < pos.length; j++) {

					var row = pos[i];
					var col = pos[j];

					if (this.modules[row][col] != null) {
						continue;
					}

					for (var r = -2; r <= 2; r++) {

						for (var c = -2; c <= 2; c++) {

							if (r == -2 || r == 2 || c == -2 || c == 2 || r == 0 && c == 0) {
								this.modules[row + r][col + c] = true;
							} else {
								this.modules[row + r][col + c] = false;
							}
						}
					}
				}
			}
		},
		/**
	  * 设置版本信息（7以上版本才有）
	  * @param  {bool} test 是否处于判断最佳掩膜阶段
	  * @return {[type]}      [description]
	  */
		setupTypeNumber: function setupTypeNumber(test) {

			var bits = QRUtil.getBCHTypeNumber(this.typeNumber);

			for (var i = 0; i < 18; i++) {
				var mod = !test && (bits >> i & 1) == 1;
				this.modules[Math.floor(i / 3)][i % 3 + this.moduleCount - 8 - 3] = mod;
				this.modules[i % 3 + this.moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
			}
		},
		/**
	  * 设置格式信息（纠错等级和掩膜版本）
	  * @param  {bool} test
	  * @param  {num} maskPattern 掩膜版本
	  * @return {}
	  */
		setupTypeInfo: function setupTypeInfo(test, maskPattern) {

			var data = QRErrorCorrectLevel[this.errorCorrectLevel] << 3 | maskPattern;
			var bits = QRUtil.getBCHTypeInfo(data);

			// vertical
			for (var i = 0; i < 15; i++) {

				var mod = !test && (bits >> i & 1) == 1;

				if (i < 6) {
					this.modules[i][8] = mod;
				} else if (i < 8) {
					this.modules[i + 1][8] = mod;
				} else {
					this.modules[this.moduleCount - 15 + i][8] = mod;
				}

				// horizontal
				var mod = !test && (bits >> i & 1) == 1;

				if (i < 8) {
					this.modules[8][this.moduleCount - i - 1] = mod;
				} else if (i < 9) {
					this.modules[8][15 - i - 1 + 1] = mod;
				} else {
					this.modules[8][15 - i - 1] = mod;
				}
			}

			// fixed module
			this.modules[this.moduleCount - 8][8] = !test;
		},
		/**
	  * 数据编码
	  * @return {[type]} [description]
	  */
		createData: function createData() {
			var buffer = new QRBitBuffer();
			var lengthBits = this.typeNumber > 9 ? 16 : 8;
			buffer.put(4, 4); //添加模式
			buffer.put(this.utf8bytes.length, lengthBits);
			for (var i = 0, l = this.utf8bytes.length; i < l; i++) {
				buffer.put(this.utf8bytes[i], 8);
			}
			if (buffer.length + 4 <= this.totalDataCount * 8) {
				buffer.put(0, 4);
			}

			// padding
			while (buffer.length % 8 != 0) {
				buffer.putBit(false);
			}

			// padding
			while (true) {

				if (buffer.length >= this.totalDataCount * 8) {
					break;
				}
				buffer.put(QRCodeAlg.PAD0, 8);

				if (buffer.length >= this.totalDataCount * 8) {
					break;
				}
				buffer.put(QRCodeAlg.PAD1, 8);
			}
			return this.createBytes(buffer);
		},
		/**
	  * 纠错码编码
	  * @param  {buffer} buffer 数据编码
	  * @return {[type]}
	  */
		createBytes: function createBytes(buffer) {

			var offset = 0;

			var maxDcCount = 0;
			var maxEcCount = 0;

			var length = this.rsBlock.length / 3;

			var rsBlocks = new Array();

			for (var i = 0; i < length; i++) {

				var count = this.rsBlock[i * 3 + 0];
				var totalCount = this.rsBlock[i * 3 + 1];
				var dataCount = this.rsBlock[i * 3 + 2];

				for (var j = 0; j < count; j++) {
					rsBlocks.push([dataCount, totalCount]);
				}
			}

			var dcdata = new Array(rsBlocks.length);
			var ecdata = new Array(rsBlocks.length);

			for (var r = 0; r < rsBlocks.length; r++) {

				var dcCount = rsBlocks[r][0];
				var ecCount = rsBlocks[r][1] - dcCount;

				maxDcCount = Math.max(maxDcCount, dcCount);
				maxEcCount = Math.max(maxEcCount, ecCount);

				dcdata[r] = new Array(dcCount);

				for (var i = 0; i < dcdata[r].length; i++) {
					dcdata[r][i] = 0xff & buffer.buffer[i + offset];
				}
				offset += dcCount;

				var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
				var rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1);

				var modPoly = rawPoly.mod(rsPoly);
				ecdata[r] = new Array(rsPoly.getLength() - 1);
				for (var i = 0; i < ecdata[r].length; i++) {
					var modIndex = i + modPoly.getLength() - ecdata[r].length;
					ecdata[r][i] = modIndex >= 0 ? modPoly.get(modIndex) : 0;
				}
			}

			var data = new Array(this.totalDataCount);
			var index = 0;

			for (var i = 0; i < maxDcCount; i++) {
				for (var r = 0; r < rsBlocks.length; r++) {
					if (i < dcdata[r].length) {
						data[index++] = dcdata[r][i];
					}
				}
			}

			for (var i = 0; i < maxEcCount; i++) {
				for (var r = 0; r < rsBlocks.length; r++) {
					if (i < ecdata[r].length) {
						data[index++] = ecdata[r][i];
					}
				}
			}

			return data;
		},
		/**
	  * 布置模块，构建最终信息
	  * @param  {} data
	  * @param  {} maskPattern
	  * @return {}
	  */
		mapData: function mapData(data, maskPattern) {

			var inc = -1;
			var row = this.moduleCount - 1;
			var bitIndex = 7;
			var byteIndex = 0;

			for (var col = this.moduleCount - 1; col > 0; col -= 2) {

				if (col == 6) col--;

				while (true) {

					for (var c = 0; c < 2; c++) {

						if (this.modules[row][col - c] == null) {

							var dark = false;

							if (byteIndex < data.length) {
								dark = (data[byteIndex] >>> bitIndex & 1) == 1;
							}

							var mask = QRUtil.getMask(maskPattern, row, col - c);

							if (mask) {
								dark = !dark;
							}

							this.modules[row][col - c] = dark;
							bitIndex--;

							if (bitIndex == -1) {
								byteIndex++;
								bitIndex = 7;
							}
						}
					}

					row += inc;

					if (row < 0 || this.moduleCount <= row) {
						row -= inc;
						inc = -inc;
						break;
					}
				}
			}
		}

	};
	/**
	 * 填充字段
	 */
	QRCodeAlg.PAD0 = 0xEC;
	QRCodeAlg.PAD1 = 0x11;

	//---------------------------------------------------------------------
	// 纠错等级对应的编码
	//---------------------------------------------------------------------

	var QRErrorCorrectLevel = [1, 0, 3, 2];

	//---------------------------------------------------------------------
	// 掩膜版本
	//---------------------------------------------------------------------

	var QRMaskPattern = {
		PATTERN000: 0,
		PATTERN001: 1,
		PATTERN010: 2,
		PATTERN011: 3,
		PATTERN100: 4,
		PATTERN101: 5,
		PATTERN110: 6,
		PATTERN111: 7
	};

	//---------------------------------------------------------------------
	// 工具类
	//---------------------------------------------------------------------

	var QRUtil = {

		/*
	 每个版本矫正图形的位置
	  */
		PATTERN_POSITION_TABLE: [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90], [6, 28, 50, 72, 94], [6, 26, 50, 74, 98], [6, 30, 54, 78, 102], [6, 28, 54, 80, 106], [6, 32, 58, 84, 110], [6, 30, 58, 86, 114], [6, 34, 62, 90, 118], [6, 26, 50, 74, 98, 122], [6, 30, 54, 78, 102, 126], [6, 26, 52, 78, 104, 130], [6, 30, 56, 82, 108, 134], [6, 34, 60, 86, 112, 138], [6, 30, 58, 86, 114, 142], [6, 34, 62, 90, 118, 146], [6, 30, 54, 78, 102, 126, 150], [6, 24, 50, 76, 102, 128, 154], [6, 28, 54, 80, 106, 132, 158], [6, 32, 58, 84, 110, 136, 162], [6, 26, 54, 82, 110, 138, 166], [6, 30, 58, 86, 114, 142, 170]],

		G15: 1 << 10 | 1 << 8 | 1 << 5 | 1 << 4 | 1 << 2 | 1 << 1 | 1 << 0,
		G18: 1 << 12 | 1 << 11 | 1 << 10 | 1 << 9 | 1 << 8 | 1 << 5 | 1 << 2 | 1 << 0,
		G15_MASK: 1 << 14 | 1 << 12 | 1 << 10 | 1 << 4 | 1 << 1,

		/*
	 BCH编码格式信息
	  */
		getBCHTypeInfo: function getBCHTypeInfo(data) {
			var d = data << 10;
			while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15) >= 0) {
				d ^= QRUtil.G15 << QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15);
			}
			return (data << 10 | d) ^ QRUtil.G15_MASK;
		},
		/*
	 BCH编码版本信息
	  */
		getBCHTypeNumber: function getBCHTypeNumber(data) {
			var d = data << 12;
			while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18) >= 0) {
				d ^= QRUtil.G18 << QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18);
			}
			return data << 12 | d;
		},
		/*
	 获取BCH位信息
	  */
		getBCHDigit: function getBCHDigit(data) {

			var digit = 0;

			while (data != 0) {
				digit++;
				data >>>= 1;
			}

			return digit;
		},
		/*
	 获取版本对应的矫正图形位置
	  */
		getPatternPosition: function getPatternPosition(typeNumber) {
			return QRUtil.PATTERN_POSITION_TABLE[typeNumber - 1];
		},
		/*
	 掩膜算法
	  */
		getMask: function getMask(maskPattern, i, j) {

			switch (maskPattern) {

				case QRMaskPattern.PATTERN000:
					return (i + j) % 2 == 0;
				case QRMaskPattern.PATTERN001:
					return i % 2 == 0;
				case QRMaskPattern.PATTERN010:
					return j % 3 == 0;
				case QRMaskPattern.PATTERN011:
					return (i + j) % 3 == 0;
				case QRMaskPattern.PATTERN100:
					return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 == 0;
				case QRMaskPattern.PATTERN101:
					return i * j % 2 + i * j % 3 == 0;
				case QRMaskPattern.PATTERN110:
					return (i * j % 2 + i * j % 3) % 2 == 0;
				case QRMaskPattern.PATTERN111:
					return (i * j % 3 + (i + j) % 2) % 2 == 0;

				default:
					throw new Error("bad maskPattern:" + maskPattern);
			}
		},
		/*
	 获取RS的纠错多项式
	  */
		getErrorCorrectPolynomial: function getErrorCorrectPolynomial(errorCorrectLength) {

			var a = new QRPolynomial([1], 0);

			for (var i = 0; i < errorCorrectLength; i++) {
				a = a.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0));
			}

			return a;
		},
		/*
	 获取评价
	  */
		getLostPoint: function getLostPoint(qrCode) {

			var moduleCount = qrCode.getModuleCount(),
			    lostPoint = 0,
			    darkCount = 0;

			for (var row = 0; row < moduleCount; row++) {

				var sameCount = 0;
				var head = qrCode.modules[row][0];

				for (var col = 0; col < moduleCount; col++) {

					var current = qrCode.modules[row][col];

					//level 3 评价
					if (col < moduleCount - 6) {
						if (current && !qrCode.modules[row][col + 1] && qrCode.modules[row][col + 2] && qrCode.modules[row][col + 3] && qrCode.modules[row][col + 4] && !qrCode.modules[row][col + 5] && qrCode.modules[row][col + 6]) {
							if (col < moduleCount - 10) {
								if (qrCode.modules[row][col + 7] && qrCode.modules[row][col + 8] && qrCode.modules[row][col + 9] && qrCode.modules[row][col + 10]) {
									lostPoint += 40;
								}
							} else if (col > 3) {
								if (qrCode.modules[row][col - 1] && qrCode.modules[row][col - 2] && qrCode.modules[row][col - 3] && qrCode.modules[row][col - 4]) {
									lostPoint += 40;
								}
							}
						}
					}

					//level 2 评价
					if (row < moduleCount - 1 && col < moduleCount - 1) {
						var count = 0;
						if (current) count++;
						if (qrCode.modules[row + 1][col]) count++;
						if (qrCode.modules[row][col + 1]) count++;
						if (qrCode.modules[row + 1][col + 1]) count++;
						if (count == 0 || count == 4) {
							lostPoint += 3;
						}
					}

					//level 1 评价
					if (head ^ current) {
						sameCount++;
					} else {
						head = current;
						if (sameCount >= 5) {
							lostPoint += 3 + sameCount - 5;
						}
						sameCount = 1;
					}

					//level 4 评价
					if (current) {
						darkCount++;
					}
				}
			}

			for (var col = 0; col < moduleCount; col++) {

				var sameCount = 0;
				var head = qrCode.modules[0][col];

				for (var row = 0; row < moduleCount; row++) {

					var current = qrCode.modules[row][col];

					//level 3 评价
					if (row < moduleCount - 6) {
						if (current && !qrCode.modules[row + 1][col] && qrCode.modules[row + 2][col] && qrCode.modules[row + 3][col] && qrCode.modules[row + 4][col] && !qrCode.modules[row + 5][col] && qrCode.modules[row + 6][col]) {
							if (row < moduleCount - 10) {
								if (qrCode.modules[row + 7][col] && qrCode.modules[row + 8][col] && qrCode.modules[row + 9][col] && qrCode.modules[row + 10][col]) {
									lostPoint += 40;
								}
							} else if (row > 3) {
								if (qrCode.modules[row - 1][col] && qrCode.modules[row - 2][col] && qrCode.modules[row - 3][col] && qrCode.modules[row - 4][col]) {
									lostPoint += 40;
								}
							}
						}
					}

					//level 1 评价
					if (head ^ current) {
						sameCount++;
					} else {
						head = current;
						if (sameCount >= 5) {
							lostPoint += 3 + sameCount - 5;
						}
						sameCount = 1;
					}
				}
			}

			// LEVEL4

			var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
			lostPoint += ratio * 10;

			return lostPoint;
		}

	};

	//---------------------------------------------------------------------
	// QRMath使用的数学工具
	//---------------------------------------------------------------------

	var QRMath = {
		/*
	 将n转化为a^m
	  */
		glog: function glog(n) {

			if (n < 1) {
				throw new Error("glog(" + n + ")");
			}

			return QRMath.LOG_TABLE[n];
		},
		/*
	 将a^m转化为n
	  */
		gexp: function gexp(n) {

			while (n < 0) {
				n += 255;
			}

			while (n >= 256) {
				n -= 255;
			}

			return QRMath.EXP_TABLE[n];
		},

		EXP_TABLE: new Array(256),

		LOG_TABLE: new Array(256)

	};

	for (var i = 0; i < 8; i++) {
		QRMath.EXP_TABLE[i] = 1 << i;
	}
	for (var i = 8; i < 256; i++) {
		QRMath.EXP_TABLE[i] = QRMath.EXP_TABLE[i - 4] ^ QRMath.EXP_TABLE[i - 5] ^ QRMath.EXP_TABLE[i - 6] ^ QRMath.EXP_TABLE[i - 8];
	}
	for (var i = 0; i < 255; i++) {
		QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]] = i;
	}

	//---------------------------------------------------------------------
	// QRPolynomial 多项式
	//---------------------------------------------------------------------
	/**
	 * 多项式类
	 * @param {Array} num   系数
	 * @param {num} shift a^shift
	 */
	function QRPolynomial(num, shift) {

		if (num.length == undefined) {
			throw new Error(num.length + "/" + shift);
		}

		var offset = 0;

		while (offset < num.length && num[offset] == 0) {
			offset++;
		}

		this.num = new Array(num.length - offset + shift);
		for (var i = 0; i < num.length - offset; i++) {
			this.num[i] = num[i + offset];
		}
	}

	QRPolynomial.prototype = {

		get: function get(index) {
			return this.num[index];
		},

		getLength: function getLength() {
			return this.num.length;
		},
		/**
	  * 多项式乘法
	  * @param  {QRPolynomial} e 被乘多项式
	  * @return {[type]}   [description]
	  */
		multiply: function multiply(e) {

			var num = new Array(this.getLength() + e.getLength() - 1);

			for (var i = 0; i < this.getLength(); i++) {
				for (var j = 0; j < e.getLength(); j++) {
					num[i + j] ^= QRMath.gexp(QRMath.glog(this.get(i)) + QRMath.glog(e.get(j)));
				}
			}

			return new QRPolynomial(num, 0);
		},
		/**
	  * 多项式模运算
	  * @param  {QRPolynomial} e 模多项式
	  * @return {}
	  */
		mod: function mod(e) {
			var tl = this.getLength(),
			    el = e.getLength();
			if (tl - el < 0) {
				return this;
			}
			var num = new Array(tl);
			for (var i = 0; i < tl; i++) {
				num[i] = this.get(i);
			}
			while (num.length >= el) {
				var ratio = QRMath.glog(num[0]) - QRMath.glog(e.get(0));

				for (var i = 0; i < e.getLength(); i++) {
					num[i] ^= QRMath.gexp(QRMath.glog(e.get(i)) + ratio);
				}
				while (num[0] == 0) {
					num.shift();
				}
			}
			return new QRPolynomial(num, 0);
		}
	};

	//---------------------------------------------------------------------
	// RS_BLOCK_TABLE
	//---------------------------------------------------------------------
	/*
	二维码各个版本信息[块数, 每块中的数据块数, 每块中的信息块数]
	 */
	var RS_BLOCK_TABLE = [

	// L
	// M
	// Q
	// H

	// 1
	[1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9],

	// 2
	[1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16],

	// 3
	[1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13],

	// 4
	[1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9],

	// 5
	[1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12],

	// 6
	[2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15],

	// 7
	[2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14],

	// 8
	[2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15],

	// 9
	[2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13],

	// 10
	[2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16],

	// 11
	[4, 101, 81], [1, 80, 50, 4, 81, 51], [4, 50, 22, 4, 51, 23], [3, 36, 12, 8, 37, 13],

	// 12
	[2, 116, 92, 2, 117, 93], [6, 58, 36, 2, 59, 37], [4, 46, 20, 6, 47, 21], [7, 42, 14, 4, 43, 15],

	// 13
	[4, 133, 107], [8, 59, 37, 1, 60, 38], [8, 44, 20, 4, 45, 21], [12, 33, 11, 4, 34, 12],

	// 14
	[3, 145, 115, 1, 146, 116], [4, 64, 40, 5, 65, 41], [11, 36, 16, 5, 37, 17], [11, 36, 12, 5, 37, 13],

	// 15
	[5, 109, 87, 1, 110, 88], [5, 65, 41, 5, 66, 42], [5, 54, 24, 7, 55, 25], [11, 36, 12],

	// 16
	[5, 122, 98, 1, 123, 99], [7, 73, 45, 3, 74, 46], [15, 43, 19, 2, 44, 20], [3, 45, 15, 13, 46, 16],

	// 17
	[1, 135, 107, 5, 136, 108], [10, 74, 46, 1, 75, 47], [1, 50, 22, 15, 51, 23], [2, 42, 14, 17, 43, 15],

	// 18
	[5, 150, 120, 1, 151, 121], [9, 69, 43, 4, 70, 44], [17, 50, 22, 1, 51, 23], [2, 42, 14, 19, 43, 15],

	// 19
	[3, 141, 113, 4, 142, 114], [3, 70, 44, 11, 71, 45], [17, 47, 21, 4, 48, 22], [9, 39, 13, 16, 40, 14],

	// 20
	[3, 135, 107, 5, 136, 108], [3, 67, 41, 13, 68, 42], [15, 54, 24, 5, 55, 25], [15, 43, 15, 10, 44, 16],

	// 21
	[4, 144, 116, 4, 145, 117], [17, 68, 42], [17, 50, 22, 6, 51, 23], [19, 46, 16, 6, 47, 17],

	// 22
	[2, 139, 111, 7, 140, 112], [17, 74, 46], [7, 54, 24, 16, 55, 25], [34, 37, 13],

	// 23
	[4, 151, 121, 5, 152, 122], [4, 75, 47, 14, 76, 48], [11, 54, 24, 14, 55, 25], [16, 45, 15, 14, 46, 16],

	// 24
	[6, 147, 117, 4, 148, 118], [6, 73, 45, 14, 74, 46], [11, 54, 24, 16, 55, 25], [30, 46, 16, 2, 47, 17],

	// 25
	[8, 132, 106, 4, 133, 107], [8, 75, 47, 13, 76, 48], [7, 54, 24, 22, 55, 25], [22, 45, 15, 13, 46, 16],

	// 26
	[10, 142, 114, 2, 143, 115], [19, 74, 46, 4, 75, 47], [28, 50, 22, 6, 51, 23], [33, 46, 16, 4, 47, 17],

	// 27
	[8, 152, 122, 4, 153, 123], [22, 73, 45, 3, 74, 46], [8, 53, 23, 26, 54, 24], [12, 45, 15, 28, 46, 16],

	// 28
	[3, 147, 117, 10, 148, 118], [3, 73, 45, 23, 74, 46], [4, 54, 24, 31, 55, 25], [11, 45, 15, 31, 46, 16],

	// 29
	[7, 146, 116, 7, 147, 117], [21, 73, 45, 7, 74, 46], [1, 53, 23, 37, 54, 24], [19, 45, 15, 26, 46, 16],

	// 30
	[5, 145, 115, 10, 146, 116], [19, 75, 47, 10, 76, 48], [15, 54, 24, 25, 55, 25], [23, 45, 15, 25, 46, 16],

	// 31
	[13, 145, 115, 3, 146, 116], [2, 74, 46, 29, 75, 47], [42, 54, 24, 1, 55, 25], [23, 45, 15, 28, 46, 16],

	// 32
	[17, 145, 115], [10, 74, 46, 23, 75, 47], [10, 54, 24, 35, 55, 25], [19, 45, 15, 35, 46, 16],

	// 33
	[17, 145, 115, 1, 146, 116], [14, 74, 46, 21, 75, 47], [29, 54, 24, 19, 55, 25], [11, 45, 15, 46, 46, 16],

	// 34
	[13, 145, 115, 6, 146, 116], [14, 74, 46, 23, 75, 47], [44, 54, 24, 7, 55, 25], [59, 46, 16, 1, 47, 17],

	// 35
	[12, 151, 121, 7, 152, 122], [12, 75, 47, 26, 76, 48], [39, 54, 24, 14, 55, 25], [22, 45, 15, 41, 46, 16],

	// 36
	[6, 151, 121, 14, 152, 122], [6, 75, 47, 34, 76, 48], [46, 54, 24, 10, 55, 25], [2, 45, 15, 64, 46, 16],

	// 37
	[17, 152, 122, 4, 153, 123], [29, 74, 46, 14, 75, 47], [49, 54, 24, 10, 55, 25], [24, 45, 15, 46, 46, 16],

	// 38
	[4, 152, 122, 18, 153, 123], [13, 74, 46, 32, 75, 47], [48, 54, 24, 14, 55, 25], [42, 45, 15, 32, 46, 16],

	// 39
	[20, 147, 117, 4, 148, 118], [40, 75, 47, 7, 76, 48], [43, 54, 24, 22, 55, 25], [10, 45, 15, 67, 46, 16],

	// 40
	[19, 148, 118, 6, 149, 119], [18, 75, 47, 31, 76, 48], [34, 54, 24, 34, 55, 25], [20, 45, 15, 61, 46, 16]];

	/**
	 * 根据数据获取对应版本
	 * @return {[type]} [description]
	 */
	QRCodeAlg.prototype.getRightType = function () {
		for (var typeNumber = 1; typeNumber < 41; typeNumber++) {
			var rsBlock = RS_BLOCK_TABLE[(typeNumber - 1) * 4 + this.errorCorrectLevel];
			if (rsBlock == undefined) {
				throw new Error("bad rs block @ typeNumber:" + typeNumber + "/errorCorrectLevel:" + this.errorCorrectLevel);
			}
			var length = rsBlock.length / 3;
			var totalDataCount = 0;
			for (var i = 0; i < length; i++) {
				var count = rsBlock[i * 3 + 0];
				var dataCount = rsBlock[i * 3 + 2];
				totalDataCount += dataCount * count;
			}

			var lengthBytes = typeNumber > 9 ? 2 : 1;
			if (this.utf8bytes.length + lengthBytes < totalDataCount || typeNumber == 40) {
				this.typeNumber = typeNumber;
				this.rsBlock = rsBlock;
				this.totalDataCount = totalDataCount;
				break;
			}
		}
	};

	//---------------------------------------------------------------------
	// QRBitBuffer
	//---------------------------------------------------------------------

	function QRBitBuffer() {
		this.buffer = new Array();
		this.length = 0;
	}

	QRBitBuffer.prototype = {

		get: function get(index) {
			var bufIndex = Math.floor(index / 8);
			return this.buffer[bufIndex] >>> 7 - index % 8 & 1;
		},

		put: function put(num, length) {
			for (var i = 0; i < length; i++) {
				this.putBit(num >>> length - i - 1 & 1);
			}
		},

		putBit: function putBit(bit) {

			var bufIndex = Math.floor(this.length / 8);
			if (this.buffer.length <= bufIndex) {
				this.buffer.push(0);
			}

			if (bit) {
				this.buffer[bufIndex] |= 0x80 >>> this.length % 8;
			}

			this.length++;
		}
	};
	module.exports = QRCodeAlg;

/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	
	module.exports = __webpack_require__(70);


/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	var Overlay = __webpack_require__(7);
	var $ = __webpack_require__(1);
	var Templatable = __webpack_require__(11);

	var template = __webpack_require__(39);

	var Select = Overlay.extend({

	    Implements: Templatable,

	    attrs: {
	        trigger: {
	            value: null, // required
	            getter: function(val) {
	                return $(val).eq(0);
	            }
	        },
	        classPrefix: 'ui-select',
	        template: template,
	        // 定位配置
	        align: {
	            baseXY: [0, '100%-1px']
	        },

	        // trigger 的 tpl
	        triggerTpl: '<a href="#"></a>',

	        // 原生 select 的属性
	        name: '',
	        value: '',
	        length: 0,
	        selectedIndex: -1,
	        multiple: false, // TODO
	        disabled: false,
	        maxHeight: null,

	        // 以下不要覆盖
	        selectSource: null // 原生表单项的引用，select/input
	    },

	    events: {
	        'click': function(e){
	            e.stopPropagation();
	        },
	        'click [data-role=item]': function(e) {
	            var target = $(e.currentTarget);
	            if(!target.data('disabled')){
	                this.select(target);
	            }
	        },
	        'mouseenter [data-role=item]': function(e) {
	            var target = $(e.currentTarget);
	            if(!target.data('disabled')){
	                target.addClass(getClassName(this.get('classPrefix'), 'hover'));
	            }
	        },
	        'mouseleave [data-role=item]': function(e) {
	            var target = $(e.currentTarget);
	            if(!target.data('disabled')){
	                target.removeClass(getClassName(this.get('classPrefix'), 'hover'));
	            }
	        }
	    },

	    templateHelpers: {
	        output: function(data) {
	            return data + '';
	        }
	    },

	    // 覆盖父类
	    // --------

	    initAttrs: function(config, dataAttrsConfig) {
	        Select.superclass.initAttrs.call(this, config, dataAttrsConfig);

	        var selectName, trigger = this.get('trigger');
	        trigger.addClass(getClassName(this.get('classPrefix'), 'trigger'));

	        if (trigger[0].tagName.toLowerCase() === 'select') {
	            // 初始化 name
	            // 如果 select 的 name 存在则覆盖 name 属性
	            selectName = trigger.attr('name');
	            if (selectName) {
	                this.set('name', selectName);
	            }

	            // 替换之前把 select 保存起来
	            this.set('selectSource', trigger);
	            // 替换 trigger
	            var newTrigger = $(this.get('triggerTpl')).addClass(getClassName(this.get('classPrefix'), 'trigger'));
	            this.set('trigger', newTrigger);
	            this._initFromSelect = true;

	            // 隐藏原生控件
	            // 不用 hide() 的原因是需要和 arale/validator 的 skipHidden 来配合
	            trigger.after(newTrigger).css({
	                position: 'absolute',
	                left: '-99999px',
	                zIndex: -100
	            });

	            // trigger 如果为 select 则根据 select 的结构生成
	            this.set("model", convertSelect(trigger[0], this.get('classPrefix')));
	        } else {
	            // 如果 name 存在则创建隐藏域
	            selectName = this.get('name');
	            if (selectName) {
	                var input = $('input[name="' + selectName + '"]').eq(0);
	                if (!input[0]) {
	                    input = $(
	                        '<input type="text" id="select-' + selectName.replace(/\./g, '-') +
	                        '" name="' + selectName +
	                        '" />'
	                    ).css({
	                        position: 'absolute',
	                        left: '-99999px',
	                        zIndex: -100
	                    }).insertAfter(trigger);
	                }
	                this.set('selectSource', input);
	            }

	            // trigger 如果为其他 DOM，则由用户提供 model
	            this.set("model", completeModel(this.get("model"), this.get('classPrefix')));
	        }
	    },

	    setup: function() {
	        this._bindEvents();
	        this._initOptions();
	        this._initHeight();
	        this._tweakAlignDefaultValue();
	        // 调用 overlay，点击 body 隐藏
	        this._blurHide(this.get('trigger'));
	        Select.superclass.setup.call(this);
	    },

	    render: function() {
	        Select.superclass.render.call(this);
	        this._setTriggerWidth();
	        return this;
	    },

	    destroy: function() {
	        if (this._initFromSelect) {
	            this.get('trigger').remove();
	        }
	        this.get('selectSource') && this.get('selectSource').remove();
	        this.element.remove();
	        Select.superclass.destroy.call(this);
	    },

	    // 方法接口
	    // --------

	    select: function(option) {
	        var selectIndex = getOptionIndex(option, this.options);
	        var oldSelectIndex = this.get('selectedIndex');
	        this.set('selectedIndex', selectIndex);

	        // 同步 html 到 model
	        var model = this.get('model');
	        if (oldSelectIndex >= 0) {
	            model.select[oldSelectIndex].selected = false;
	        }
	        if (selectIndex >= 0) {
	            model.select[selectIndex].selected = true;
	        }
	        this.set('model', model);

	        // 如果不是原来选中的则触发 change 事件
	        if (oldSelectIndex !== selectIndex) {
	            var current = this.options.eq(selectIndex);
	            var previous  = this.options.eq(oldSelectIndex);
	            this.trigger('change', current, previous);
	        }

	        this.hide();
	        return this;
	    },

	    syncModel: function(model) {
	        this.set("model", completeModel(model, this.get('classPrefix')));
	        this.renderPartial('[data-role=content]');
	        // 同步原来的 select
	        syncSelect(this.get('selectSource'), model);
	        // 渲染后重置 select 的属性
	        this.options = this.$('[data-role=content]').children();
	        this.set('length', this.options.length);
	        this.set('selectedIndex', -1);
	        this.set('value', '');

	        var selectIndex = getOptionIndex('[data-selected=true]', this.options);
	        var oldSelectIndex = this.get('selectedIndex');
	        this.set('selectedIndex', selectIndex);

	        // 重新设置 trigger 宽度
	        this._setTriggerWidth();
	        return this;
	    },

	    getOption: function(option) {
	        var index = getOptionIndex(option, this.options);
	        return this.options.eq(index);
	    },

	    addOption: function(option) {
	        var model = this.get("model").select;
	        model.push(option);
	        this.syncModel(model);
	        return this;
	    },

	    removeOption: function(option) {
	        var removedIndex = getOptionIndex(option, this.options),
	            oldIndex = this.get('selectedIndex'),
	            removedOption = this.options.eq(removedIndex);

	        // 删除 option，更新属性
	        removedOption.remove();
	        this.options = this.$('[data-role=content]').children();
	        this.set('length', this.options.length);

	        // 如果被删除的是当前选中的，则选中第一个
	        if (removedIndex === oldIndex) {
	            this.set('selectedIndex', 0);

	        // 如果被删除的在选中的前面，则选中的索引向前移动一格
	        } else if (removedIndex < oldIndex) {
	            this.set('selectedIndex', oldIndex - 1);
	        }
	        return this;
	    },

	    enableOption: function(option) {
	        var index = getOptionIndex(option, this.options);
	        var model = this.get("model").select;
	        model[index].disabled = false;
	        this.syncModel(model);
	        return this;
	    },

	    disableOption: function(option) {
	        var index = getOptionIndex(option, this.options);
	        var model = this.get("model").select;
	        model[index].disabled = true;
	        this.syncModel(model);
	        return this;
	    },

	    // set 后的回调
	    // ------------

	    _onRenderSelectedIndex: function(index) {
	        if (index === -1) return;

	        var selected = this.options.eq(index),
	            currentItem = this.currentItem,
	            value = selected.attr('data-value');

	        // 如果两个 DOM 相同则不再处理
	        if (currentItem && selected[0] === currentItem[0]) {
	            return;
	        }

	        // 设置原来的表单项
	        var source = this.get('selectSource');
	        if (source) {
	            if (source[0].tagName.toLowerCase() === 'select') {
	                source[0].selectedIndex = index;
	            } else {
	               source[0].value = value;
	            }
	        }

	        // 处理之前选中的元素
	        if (currentItem) {
	            currentItem.attr('data-selected', 'false')
	                .removeClass(getClassName(this.get('classPrefix'), 'selected'));
	        }

	        // 处理当前选中的元素
	        selected.attr('data-selected', 'true')
	            .addClass(getClassName(this.get('classPrefix'), 'selected'));
	        this.set('value', value);

	        // 填入选中内容，位置先找 "data-role"="trigger-content"，再找 trigger
	        var trigger = this.get('trigger');
	        var triggerContent = trigger.find('[data-role=trigger-content]');
	        if (triggerContent.length) {
	            triggerContent.html(selected.html());
	        } else {
	            trigger.html(selected.html());
	        }
	        this.currentItem = selected;
	    },

	    _onRenderDisabled: function(val) {
	        var className = getClassName(this.get('classPrefix'), 'disabled');
	        var trigger = this.get('trigger');
	        trigger[(val ? 'addClass' : 'removeClass')](className);

	        // trigger event
	        var selected = this.options.eq(this.get('selectedIndex'));
	        this.trigger('disabledChange', selected, val);
	    },

	    // 私有方法
	    // ------------

	    _bindEvents: function() {
	        var trigger = this.get('trigger');

	        this.delegateEvents(trigger, "mousedown", this._triggerHandle);
	        this.delegateEvents(trigger, "click", function(e) {
	            e.preventDefault();
	        });
	        this.delegateEvents(trigger, 'mouseenter', function(e) {
	            trigger.addClass(getClassName(this.get('classPrefix'), 'trigger-hover'));
	        });
	        this.delegateEvents(trigger, 'mouseleave', function(e) {
	            trigger.removeClass(getClassName(this.get('classPrefix'), 'trigger-hover'));
	        });
	    },

	    _initOptions: function() {
	        this.options = this.$('[data-role=content]').children();
	        // 初始化 select 的参数
	        // 必须在插入文档流后操作
	        this.select('[data-selected=true]');
	        this.set('length', this.options.length);
	    },

	    // trigger 的宽度和浮层保持一致
	    _setTriggerWidth: function() {
	        var trigger = this.get('trigger');
	        var width = this.element.outerWidth();
	        var pl = parseInt(trigger.css('padding-left'), 10);
	        var pr = parseInt(trigger.css('padding-right'), 10);
	        // maybe 'thin|medium|thick' in IE
	        // just give a 0
	        var bl = parseInt(trigger.css('border-left-width'), 10) || 0;
	        var br = parseInt(trigger.css('border-right-width'), 10) || 0;
	        trigger.css('width', width - pl - pr - bl - br);
	    },

	    // borrow from dropdown
	    // 调整 align 属性的默认值, 在 trigger 下方
	    _tweakAlignDefaultValue: function() {
	        var align = this.get('align');
	        // 默认基准定位元素为 trigger
	        if (align.baseElement._id === 'VIEWPORT') {
	            align.baseElement = this.get('trigger');
	        }
	        this.set('align', align);
	    },

	    _triggerHandle: function(e) {
	        e.preventDefault();
	        if (!this.get('disabled')) {
	            this.get('visible') ? this.hide() : this.show();
	        }
	    },

	    _initHeight: function() {
	        this.after('show', function() {
	            var maxHeight = this.get('maxHeight');
	            if (maxHeight) {
	                var ul = this.$('[data-role=content]');
	                var height = getLiHeight(ul);
	                this.set('height', height > maxHeight ? maxHeight : '');
	                ul.scrollTop(0);
	            }
	        });
	    }
	});

	module.exports = Select;

	// Helper
	// ------

	// 将 select 对象转换为 model
	//
	// <select>
	//   <option value='value1'>text1</option>
	//   <option value='value2' selected>text2</option>
	//   <option value='value3' disabled>text3</option>
	// </select>
	//
	// ------->
	//
	// [
	//   {value: 'value1', text: 'text1',
	//      defaultSelected: false, selected: false, disabled: false}
	//   {value: 'value2', text: 'text2',
	//      defaultSelected: true, selected: true, disabled: false}
	//   {value: 'value3', text: 'text3',
	//      defaultSelected: false, selected: false, disabled: true}
	// ]
	function convertSelect(select, classPrefix) {
	    var i, model = [], options = select.options,
	        l = options.length, hasDefaultSelect = false;
	    for (i = 0; i < l; i++) {
	        var j, o = {}, option = options[i];
	        var fields = ['text', 'value', 'defaultSelected', 'selected', 'disabled'];
	        for (j in fields) {
	            var field = fields[j];
	            o[field] = option[field];
	        }
	        if (option.selected) hasDefaultSelect = true;
	        model.push(o);
	    }
	    // 当所有都没有设置 selected，默认设置第一个
	    if (!hasDefaultSelect && model.length) {
	        model[0].selected = 'true';
	    }
	    return {select: model, classPrefix: classPrefix};
	}

	// 补全 model 对象
	function completeModel(model, classPrefix) {
	    var i, j, l, ll, newModel = [], selectIndexArray = [];
	    for (i = 0, l = model.length; i < l; i++) {
	        var o = $.extend({}, model[i]);
	        if (o.selected) selectIndexArray.push(i);
	        o.selected = o.defaultSelected = !!o.selected;
	        o.disabled = !!o.disabled;
	        newModel.push(o);
	    }
	    if (selectIndexArray.length > 0) {
	        // 如果有多个 selected 则选中最后一个
	        selectIndexArray.pop();
	        for (j = 0, ll = selectIndexArray.length; j < ll; j++) {
	            newModel[selectIndexArray[j]].selected = false;
	        }
	    } else { //当所有都没有设置 selected 则默认设置第一个
	        newModel[0].selected = true;
	    }
	    return {select: newModel, classPrefix: classPrefix};
	}

	function getOptionIndex(option, options) {
	    var index;
	    if ($.isNumeric(option)) { // 如果是索引
	        index = option;
	    } else if (typeof option === 'string') { // 如果是选择器
	        index = options.index(options.parent().find(option));
	    } else { // 如果是 DOM
	        index = options.index(option);
	    }
	    return index;
	}

	function syncSelect(select, model) {
	    if (!(select && select[0])) return;
	    select = select[0];
	    if (select.tagName.toLowerCase() === 'select') {
	        $(select).find('option').remove();
	        for (var i in model) {
	            var m  = model[i];
	            var option = document.createElement("option");
	            option.text = m.text;
	            option.value = m .value;
	            select.add(option);
	        }
	    }
	}

	// 获取 className ，如果 classPrefix 不设置，就返回 ''
	function getClassName(classPrefix, className){
	    if(!classPrefix) return '';
	    return classPrefix + '-' + className;
	}

	// 获取 ul 中所有 li 的高度
	function getLiHeight (ul) {
	    var height = 0;
	    ul.find('li').each(function(index, item) {
	        height += $(item).outerHeight();
	    });
	    return height;
	}


/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(1),
	    doc = $(document),
	    stickyPrefix = ["-webkit-", "-ms-", "-o-", "-moz-", ""],
	    guid = 0,

	    ua = (window.navigator.userAgent || "").toLowerCase(),
	    isIE = ua.indexOf("msie") !== -1,
	    isIE6 = ua.indexOf("msie 6") !== -1;

	var isPositionStickySupported = checkPositionStickySupported(),
	    isPositionFixedSupported = checkPositionFixedSupported();


	// Sticky
	// position: sticky simulator
	function Sticky(options) {
	    this.options = options || {};
	    this.elem = $(this.options.element);        
	    this.callback = options.callback || function() {};
	    this.position = options.position;
	    this._stickyId = guid++;
	}

	Sticky.prototype._prepare = function() {
	    // save element's origin position
	    var offset = this.elem.offset();
	    this._originTop = offset.top;
	    this._originLeft = offset.left;

	    // if is fixed, force to call this_supportFixed
	    if (this.position.top === Number.MAX_VALUE) {
	        this._callFix = true;
	        this.position.top = this._originTop;
	    }

	    // save element's origin style
	    this._originStyles = {
	        position: null,
	        top: null,
	        bottom: null,
	        left: null
	    };
	    for (var style in this._originStyles) {
	        if (this._originStyles.hasOwnProperty(style)) {
	            this._originStyles[style] = this.elem.css(style);
	        }
	    }
	};

	Sticky.prototype.render = function () {
	    var self = this;

	    // only bind once
	    if (!this.elem.length || this.elem.data('bind-sticked')) {
	        return this;
	    }

	    this._prepare();

	    // if other element change height in one page,
	    // or if resize window,
	    // need adjust sticky element's status
	    this.adjust = function() {
	        self._restore();

	        var offset = self.elem.offset();
	        self._originTop = offset.top;
	        self._originLeft = offset.left;

	        scrollFn.call(self);
	    };

	    var scrollFn;
	    if (sticky.isPositionStickySupported && !this._callFix) {
	        scrollFn = this._supportSticky;

	        // set position: sticky directly
	        var tmp = "";
	        for (var i = 0; i < stickyPrefix.length; i++) {
	            tmp += "position:" + stickyPrefix[i] + "sticky;";
	        }
	        if (this.position.top !== undefined) {
	            tmp += "top: " + this.position.top + "px;";
	        }
	        if (this.position.bottom !== undefined) {
	            tmp += "bottom: " + this.position.bottom + "px;";
	        }
	        this.elem[0].style.cssText += tmp;

	        this.adjust = function() {
	            scrollFn.call(self);
	        };
	    } else if (sticky.isPositionFixedSupported) {
	        scrollFn = this._supportFixed;
	    } else {
	        scrollFn = this._supportAbsolute;   // ie6
	        // avoid floatImage Shake for IE6
	        // see: https://github.com/lifesinger/lifesinger.
	        //      github.com/blob/master/lab/2009/ie6sticked_position_v4.html
	        $("<style type='text/css'> * html" +
	          "{ background:url(null) no-repeat fixed; } </style>").appendTo("head");
	    }

	    // first run after document ready
	    scrollFn.call(this);

	    // stickyX is event namespace
	    $(window).on('scroll.sticky' + this._stickyId, function () {
	        if (!self.elem.is(':visible')) return;
	        scrollFn.call(self);
	    });

	    $(window).on('resize.sticky' + this._stickyId, debounce(function() {
	        self.adjust();
	    }, 120));

	    this.elem.data('bind-sticked', true);

	    return this;
	};

	Sticky.prototype._getTopBottom = function(scrollTop, offsetTop) {
	    var top;
	    var bottom;

	    // top is true when the distance from element to top of window <= position.top
	    if (this.position.top !== undefined) {
	        top = offsetTop - scrollTop <= this.position.top;
	    }
	    // bottom is true when the distance is from bottom of element to bottom of window <= position.bottom
	    if (this.position.bottom !== undefined) {
	        bottom = scrollTop + $(window).height() - offsetTop - this.elem.outerHeight() <= this.position.bottom;
	    }

	    return {
	        top: top,
	        bottom: bottom
	    };
	};

	Sticky.prototype._supportFixed = function () {
	    var _sticky = this.elem.data('sticked');
	    var distance = this._getTopBottom(doc.scrollTop(), this._originTop);

	    if (!_sticky &&
	        (distance.top !== undefined && distance.top ||
	            distance.bottom !== undefined && distance.bottom)) {
	        this._addPlaceholder();

	        this.elem.css($.extend({
	            position: 'fixed',
	            left: this._originLeft
	        }, distance.top ? { top: this.position.top } : { bottom: this.position.bottom }));
	        this.elem.data('sticked', true);
	        this.callback.call(this, true);
	    } else if (_sticky && !distance.top && !distance.bottom) {
	        this._restore();
	    }
	};

	Sticky.prototype._supportAbsolute = function () {
	    var scrollTop = doc.scrollTop();
	    var _sticky = this.elem.data('sticked');
	    var distance = this._getTopBottom(scrollTop, this.elem.offset().top);

	    if (distance.top || distance.bottom || this._callFix) {
	        // sticky status change only one time
	        if (!_sticky) {
	            this._addPlaceholder();
	            this.elem.data('sticked', true);
	            this.callback.call(this, true);
	        }
	        // update element's position
	        this.elem.css({
	            position: 'absolute',
	            top: this._callFix ? this._originTop + scrollTop: (distance.top ? this.position.top + scrollTop :
	                scrollTop + $(window).height() - this.position.bottom - this.elem.outerHeight())
	        });
	    } else if (_sticky && !distance.top && !distance.bottom) {
	        this._restore();
	    }
	};

	Sticky.prototype._supportSticky = function () {
	    // sticky status change for callback
	    var _sticky = this.elem.data('sticked');
	    var distance = this._getTopBottom(doc.scrollTop(), this.elem.offset().top);

	    if (!_sticky &&
	        (distance.top !== undefined && distance.top ||
	            distance.bottom !== undefined && distance.bottom)) {
	        this.elem.data('sticked', true);
	        this.callback.call(this, true);
	    } else if (_sticky && !distance.top && !distance.bottom){
	        // don't need restore style and remove placeholder
	        this.elem.data('sticked', false);
	        this.callback.call(this, false);
	    }
	};

	Sticky.prototype._restore = function () {
	    this._removePlaceholder();

	    // set origin style
	    this.elem.css(this._originStyles);

	    this.elem.data('sticked', false);

	    this.callback.call(this, false);
	};

	// need placeholder when: 1) position: static or relative, but expect for display != block
	Sticky.prototype._addPlaceholder = function() {
	    var need = false;
	    var position = this.elem.css("position");

	    if (position === 'static' || position === 'relative') {
	        need = true;
	    }
	    if (this.elem.css("display") !== "block") {
	        need = false;
	    }

	    if (need) {
	        this._placeholder = $('<div style="visibility:hidden;margin:0;padding:0;"></div>');
	        this._placeholder.width(this.elem.outerWidth(true))
	            .height(this.elem.outerHeight(true))
	            .css("float", this.elem.css("float")).insertAfter(this.elem);
	    }
	};

	Sticky.prototype._removePlaceholder = function() {
	    // remove placeholder if has
	    this._placeholder && this._placeholder.remove();
	};

	Sticky.prototype.destroy = function () {
	    this._restore();
	    this.elem.data("bind-sticked", false);
	    $(window).off('scroll.sticky' + this._stickyId);
	    $(window).off('resize.sticky' + this._stickyId);
	};

	// APIs
	// ---

	module.exports = sticky;

	function sticky(elem, position, callback) {
	    if (!$.isPlainObject(position)) {
	        position = {
	            top: position
	        };
	    }
	    if (position.top === undefined && position.bottom === undefined) {
	        position.top = 0;
	    }
	    return (new Sticky({
	        element: elem,
	        position: position,
	        callback: callback
	    })).render();
	}

	// sticky.stick(elem, position, callback)
	sticky.stick = sticky;

	// sticky.fix(elem)
	sticky.fix =  function (elem) {
	    return (new Sticky({
	        element: elem,
	        // position.top is Number.MAX_VALUE means fixed
	        position: {
	            top: Number.MAX_VALUE
	        }
	    })).render();
	};

	// for tc
	sticky.isPositionStickySupported = isPositionStickySupported;
	sticky.isPositionFixedSupported = isPositionFixedSupported;

	// Helper
	// ---
	function checkPositionFixedSupported() {
	    return !isIE6;
	}

	function checkPositionStickySupported() {
	    if (isIE) return false;

	    var container = doc[0].body;

	    if (doc[0].createElement && container && container.appendChild && container.removeChild) {
	        var isSupported,
	            el = doc[0].createElement("div"),
	            getStyle = function (st) {
	                if (window.getComputedStyle) {
	                    return window.getComputedStyle(el).getPropertyValue(st);
	                } else {
	                    return el.currentStyle.getAttribute(st);
	                }
	            };

	        container.appendChild(el);

	        for (var i = 0; i < stickyPrefix.length; i++) {
	            el.style.cssText = "position:" + stickyPrefix[i] + "sticky;visibility:hidden;";
	            if (isSupported = getStyle("position").indexOf("sticky") !== -1) break;
	        }

	        el.parentNode.removeChild(el);
	        return isSupported;
	    }
	}

	// https://github.com/jashkenas/underscore/blob/master/underscore.js#L699
	function getTime() {
	    return (Date.now || function() {
	        return new Date().getTime();
	    })()
	}
	function debounce(func, wait, immediate) {
	    var timeout, args, context, timestamp, result;
	    return function() {
	        context = this;
	        args = arguments;
	        timestamp = getTime();
	        var later = function() {
	            var last = getTime() - timestamp;
	            if (last < wait) {
	                timeout = setTimeout(later, wait - last);
	            } else {
	                timeout = null;
	                if (!immediate) result = func.apply(context, args);
	            }
	        };
	        var callNow = immediate && !timeout;
	        if (!timeout) {
	            timeout = setTimeout(later, wait);
	        }
	        if (callNow) result = func.apply(context, args);
	        return result;
	    };
	}


/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	var Switchable = __webpack_require__(8);


	// 手风琴组件
	var Accordion = Switchable.extend({
	  attrs: {
	    triggerType: 'click',

	    // 是否运行展开多个
	    multiple: false,

	    autoplay: false
	  },
	  switchTo: function (toIndex) {
	    if (this.get('multiple')) {
	      this._switchTo(toIndex, toIndex);
	    } else {
	      Switchable.prototype.switchTo.call(this, toIndex);
	    }
	  },

	  _switchTrigger: function (toIndex, fromIndex) {
	    if (this.get('multiple')) {
	      this.get('triggers').eq(toIndex).toggleClass(this.get('activeTriggerClass'));
	    } else {
	      Switchable.prototype._switchTrigger.call(this, toIndex, fromIndex);
	    }
	  },

	  _switchPanel: function (panelInfo) {
	    if (this.get('multiple')) {
	      panelInfo.toPanels.toggle();
	    } else {
	      Switchable.prototype._switchPanel.call(this, panelInfo);
	    }
	  }
	});

	module.exports = Accordion;

/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	var Switchable = __webpack_require__(8);
	var $ = __webpack_require__(1);

	// 旋转木马组件
	module.exports = Switchable.extend({

	  attrs: {
	    circular: true,

	    prevBtn: {
	      getter: function (val) {
	        return $(val).eq(0);
	      }
	    },

	    nextBtn: {
	      getter: function (val) {
	        return $(val).eq(0);
	      }
	    },
	    disabledBtnClass: {
	      getter: function (val) {
	        return val ? val : this.get("classPrefix") + '-disabled-btn';
	      }
	    }
	  },

	  _initTriggers: function (role) {
	    Switchable.prototype._initTriggers.call(this, role);

	    // attr 里没找到时，才根据 data-role 来解析
	    var prevBtn = this.get('prevBtn');
	    var nextBtn = this.get('nextBtn');

	    if (!prevBtn[0] && role.prev) {
	      prevBtn = role.prev;
	      this.set('prevBtn', prevBtn);
	    }

	    if (!nextBtn[0] && role.next) {
	      nextBtn = role.next;
	      this.set('nextBtn', nextBtn);
	    }

	    prevBtn.addClass(this.CONST.PREV_BTN_CLASS);
	    nextBtn.addClass(this.CONST.NEXT_BTN_CLASS);
	  },

	  _getDatasetRole: function () {
	    var role = Switchable.prototype._getDatasetRole.call(this);

	    var self = this;
	    var roles = ['next', 'prev'];
	    $.each(roles, function (index, key) {
	      var elems = self.$('[data-role=' + key + ']');
	      if (elems.length) {
	        role[key] = elems;
	      }
	    });
	    return role;
	  },

	  _bindTriggers: function () {
	    Switchable.prototype._bindTriggers.call(this);

	    var that = this;
	    var circular = this.get('circular');

	    this.get('prevBtn').click(function (ev) {
	      ev.preventDefault();
	      if (circular || that.get('activeIndex') > 0) {
	        that.prev();
	      }
	    });

	    this.get('nextBtn').click(function (ev) {
	      ev.preventDefault();
	      var len = that.get('length') - 1;
	      if (circular || that.get('activeIndex') < len) {
	        that.next();
	      }
	    });

	    // 注册 switch 事件，处理 prevBtn/nextBtn 的 disable 状态
	    // circular = true 时，无需处理
	    if (!circular) {
	      this.on('switch', function (toIndex) {
	        that._updateButtonStatus(toIndex);
	      });
	    }
	  },

	  _updateButtonStatus: function (toIndex) {
	    var prevBtn = this.get('prevBtn');
	    var nextBtn = this.get('nextBtn');
	    var disabledBtnClass = this.get("disabledBtnClass");

	    prevBtn.removeClass(disabledBtnClass);
	    nextBtn.removeClass(disabledBtnClass);

	    if (toIndex === 0) {
	      prevBtn.addClass(disabledBtnClass);
	    }
	    else if (toIndex === this.get('length') - 1) {
	      nextBtn.addClass(disabledBtnClass);
	    }
	  }
	});

/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(1);
	var win = $(window);

	// 自动播放插件
	module.exports = {

	  attrs: {
	    autoplay: false,

	    // 自动播放的间隔时间
	    interval: 5000
	  },

	  isNeeded: function () {
	    return this.get('autoplay');
	  },

	  install: function () {
	    var element = this.element;
	    var EVENT_NS = '.' + this.cid;
	    var timer;
	    var interval = this.get('interval');
	    var that = this;

	    // start autoplay
	    start();

	    function start() {
	      // 停止之前的
	      stop();

	      // 设置状态
	      that.paused = false;

	      // 开始现在的
	      timer = setInterval(function () {
	        if (that.paused) return;
	        that.next();
	      }, interval);
	    }

	    function stop() {
	      if (timer) {
	        clearInterval(timer);
	        timer = null;
	      }
	      that.paused = true;
	    }

	    // public api
	    this.stop = stop;
	    this.start = start;

	    // 滚出可视区域后，停止自动播放
	    this._scrollDetect = throttle(function () {
	      that[isInViewport(element) ? 'start' : 'stop']();
	    });
	    win.on('scroll' + EVENT_NS, this._scrollDetect);

	    // 鼠标悬停时，停止自动播放
	    this.element.hover(stop, start);
	  },

	  destroy: function () {
	    var EVENT_NS = '.' + this.cid;

	    this.stop && this.stop();

	    if (this._scrollDetect) {
	      this._scrollDetect.stop();
	      win.off('scroll' + EVENT_NS);
	    }
	  }
	};


	// Helpers
	// -------

	function throttle(fn, ms) {
	  ms = ms || 200;
	  var throttleTimer;

	  function f() {
	    f.stop();
	    throttleTimer = setTimeout(fn, ms);
	  }

	  f.stop = function () {
	    if (throttleTimer) {
	      clearTimeout(throttleTimer);
	      throttleTimer = 0;
	    }
	  };

	  return f;
	}


	function isInViewport(element) {
	  var scrollTop = win.scrollTop();
	  var scrollBottom = scrollTop + win.height();
	  var elementTop = element.offset().top;
	  var elementBottom = elementTop + element.height();

	  // 只判断垂直位置是否在可视区域，不判断水平。只有要部分区域在可视区域，就返回 true
	  return elementTop < scrollBottom && elementBottom > scrollTop;
	}

/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(1);

	var SCROLLX = 'scrollx';
	var SCROLLY = 'scrolly';
	var Effects = __webpack_require__(28).Effects;


	// 无缝循环滚动插件
	module.exports = {
	  // 仅在开启滚动效果时需要
	  isNeeded: function () {
	    var effect = this.get('effect');
	    var circular = this.get('circular');
	    return circular && (effect === SCROLLX || effect === SCROLLY);
	  },

	  install: function () {
	    this._scrollType = this.get('effect');
	    this.set('effect', 'scrollCircular');
	  }
	};

	Effects.scrollCircular = function (panelInfo) {
	  var toIndex = panelInfo.toIndex;
	  var fromIndex = panelInfo.fromIndex;
	  var isX = this._scrollType === SCROLLX;
	  var prop = isX ? 'left' : 'top';
	  var viewDiff = this.get('viewSize')[isX ? 0 : 1];
	  var diff = -viewDiff * toIndex;

	  var props = {};
	  props[prop] = diff + 'px';

	  // 开始动画
	  if (fromIndex > -1) {

	    // 开始动画前，先停止掉上一动画
	    if (this.anim) {
	      this.anim.stop(false, true);
	    }

	    var len = this.get('length');
	    // scroll 的 0 -> len-1 应该是正常的从 0->1->2->.. len-1 的切换
	    var isBackwardCritical = fromIndex === 0 && toIndex === len - 1;
	    // len-1 -> 0
	    var isForwardCritical = fromIndex === len - 1 && toIndex === 0;
	    var isBackward = this._isBackward === undefined ? toIndex < fromIndex : this._isBackward;
	    // isBackward 使用下面的判断方式, 会在 nav 上 trigger 从 0 -> len-1 切换时,
	    // 不经过 0->1->2->...-> len-1, 而是 0 反向切换到 len-1;
	    // 而上面的判断方式, nav 上的 trigger 切换是正常的, 只有调用 prev 才从 0 反向切换到 len-1;
	    //var isBackward = isBackwardCritical ||
	    //    (!isForwardCritical && toIndex < fromIndex);
	    // 从第一个反向滚动到最后一个 or 从最后一个正向滚动到第一个
	    var isCritical = (isBackward && isBackwardCritical) || (!isBackward && isForwardCritical);

	    // 在临界点时，先调整 panels 位置
	    if (isCritical) {
	      diff = adjustPosition.call(this, isBackward, prop, viewDiff);
	      props[prop] = diff + 'px';
	    }

	    var duration = this.get('duration');
	    var easing = this.get('easing');
	    var that = this;

	    this.anim = this.content.animate(props, duration, easing, function () {
	      that.anim = null; // free
	      // 复原位置
	      if (isCritical) {
	        resetPosition.call(that, isBackward, prop, viewDiff);
	      }
	    });
	  }
	  // 初始化
	  else {
	    this.content.css(props);
	  }
	};

	// 调整位置


	function adjustPosition(isBackward, prop, viewDiff) {
	  var step = this.get('step');
	  var len = this.get('length');
	  var start = isBackward ? len - 1 : 0;
	  var from = start * step;
	  var to = (start + 1) * step;
	  var diff = isBackward ? viewDiff : -viewDiff * len;
	  var panelDiff = isBackward ? -viewDiff * len : viewDiff * len;

	  // 调整 panels 到下一个视图中
	  var toPanels = $(this.get('panels').get().slice(from, to));
	  toPanels.css('position', 'relative');
	  toPanels.css(prop, panelDiff + 'px');

	  // 返回偏移量
	  return diff;
	}

	// 复原位置


	function resetPosition(isBackward, prop, viewDiff) {
	  var step = this.get('step');
	  var len = this.get('length');
	  var start = isBackward ? len - 1 : 0;
	  var from = start * step;
	  var to = (start + 1) * step;

	  // 滚动完成后，复位到正常状态
	  var toPanels = $(this.get('panels').get().slice(from, to));
	  toPanels.css('position', '');
	  toPanels.css(prop, '');

	  // 瞬移到正常位置
	  this.content.css(prop, isBackward ? -viewDiff * (len - 1) : '');
	}

/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	var Switchable = __webpack_require__(8);

	// 卡盘轮播组件
	module.exports = Switchable.extend({
	  attrs: {
	    autoplay: true,
	    circular: true
	  }
	});

/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	var Switchable = __webpack_require__(8);

	// 展现型标签页组件
	module.exports = Switchable.extend({});

/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(8);
	module.exports.Slide = __webpack_require__(76);
	module.exports.Accordion = __webpack_require__(72);
	module.exports.Carousel = __webpack_require__(73);
	module.exports.Tabs = __webpack_require__(77);


/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	var Popup = __webpack_require__(27);

	// 通用提示组件
	// 兼容站内各类样式
	module.exports = Popup.extend({

	  attrs: {
	    // 提示内容
	    content: null,

	    // 提示框在目标的位置方向 [up|down|left|right]
	    direction: 'up',

	    // 提示框离目标距离(px)
	    distance: 8,

	    // 箭头偏移位置(px)，负数表示箭头位置从最右边或最下边开始算
	    arrowShift: 22,

	    // 箭头指向 trigger 的水平或垂直的位置
	    pointPos: '50%'
	  },

	  _setAlign: function () {
	    var alignObject = {},
	        arrowShift = this.get('arrowShift'),
	        distance = this.get('distance'),
	        pointPos = this.get('pointPos'),
	        direction = this.get('direction');

	    if (arrowShift < 0) {
	      arrowShift = '100%' + arrowShift;
	    }

	    if (direction === 'up') {
	      alignObject.baseXY = [pointPos, 0];
	      alignObject.selfXY = [arrowShift, '100%+' + distance];
	    }
	    else if (direction === 'down') {
	      alignObject.baseXY = [pointPos, '100%+' + distance];
	      alignObject.selfXY = [arrowShift, 0];
	    }
	    else if (direction === 'left') {
	      alignObject.baseXY = [0, pointPos];
	      alignObject.selfXY = ['100%+' + distance, arrowShift];
	    }
	    else if (direction === 'right') {
	      alignObject.baseXY = ['100%+' + distance, pointPos];
	      alignObject.selfXY = [0, arrowShift];
	    }

	    alignObject.comeFromArrowPosition = true;
	    this.set('align', alignObject);
	  },

	  // 用于 set 属性后的界面更新
	  _onRenderContent: function (val) {
	    var ctn = this.$('[data-role="content"]');
	    if (typeof val !== 'string') {
	      val = val.call(this);
	    }
	    ctn && ctn.html(val);
	  }

	});


/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(1);
	var BasicTip = __webpack_require__(79);

	// 依赖样式 alice/poptip@1.1.1
	__webpack_require__(110);

	// 气泡提示弹出组件
	// ---
	var Tip = BasicTip.extend({

	  attrs: {
	    template: __webpack_require__(108),

	    // 提示内容
	    content: 'A TIP BOX',

	    // 箭头位置
	    // 按钟表点位置，目前支持1、2、5、7、10、11点位置
	    // https://i.alipayobjects.com/e/201307/jBty06lQT.png
	    arrowPosition: 7,

	    align: {
	      setter: function (val) {
	        // 用户初始化时主动设置了 align
	        // 且并非来自 arrowPosition 的设置
	        if (val && !val.comeFromArrowPosition) {
	          this._specifiedAlign = true;
	        }
	        return val;
	      }
	    },

	    // 颜色 [yellow|blue|white]
	    theme: 'yellow',

	    // 当弹出层显示在屏幕外时，是否自动转换浮层位置
	    inViewport: false
	  },

	  setup: function () {
	    BasicTip.superclass.setup.call(this);
	    this._originArrowPosition = this.get('arrowPosition');

	    this.after('show', function () {
	      this._makesureInViewport();
	    });
	  },

	  _makesureInViewport: function () {
	    if (!this.get('inViewport')) {
	      return;
	    }
	    var ap = this._originArrowPosition,
	        scrollTop = $(window).scrollTop(),
	        viewportHeight = $(window).outerHeight(),
	        elemHeight = this.element.height() + this.get('distance'),
	        triggerTop = this.get('trigger').offset().top,
	        triggerHeight = this.get('trigger').height(),
	        arrowMap = {
	        '1': 5,
	        '5': 1,
	        '7': 11,
	        '11': 7
	        };

	    if ((ap == 11 || ap == 1) && (triggerTop + triggerHeight > scrollTop + viewportHeight - elemHeight)) {
	      // tip 溢出屏幕下方
	      this.set('arrowPosition', arrowMap[ap]);
	    } else if ((ap == 7 || ap == 5) && (triggerTop < scrollTop + elemHeight)) {
	      // tip 溢出屏幕上方
	      this.set('arrowPosition', arrowMap[ap]);
	    } else {
	      // 复原
	      this.set('arrowPosition', this._originArrowPosition);
	    }
	  },

	  // 用于 set 属性后的界面更新
	  _onRenderArrowPosition: function (val, prev) {
	    val = parseInt(val, 10);
	    var arrow = this.$('.ui-poptip-arrow');
	    arrow.removeClass('ui-poptip-arrow-' + prev).addClass('ui-poptip-arrow-' + val);

	    // 用户设置了 align
	    // 则直接使用 align 表示的位置信息，忽略 arrowPosition
	    if (this._specifiedAlign) {
	      return;
	    }

	    var direction = '',
	        arrowShift = 0;
	    if (val === 10) {
	      direction = 'right';
	      arrowShift = 20;
	    }
	    else if (val === 11) {
	      direction = 'down';
	      arrowShift = 22;
	    }
	    else if (val === 1) {
	      direction = 'down';
	      arrowShift = -22;
	    }
	    else if (val === 2) {
	      direction = 'left';
	      arrowShift = 20;
	    }
	    else if (val === 5) {
	      direction = 'up';
	      arrowShift = -22;
	    }
	    else if (val === 7) {
	      direction = 'up';
	      arrowShift = 22;
	    }
	    this.set('direction', direction);
	    this.set('arrowShift', arrowShift);
	    this._setAlign();
	  },

	  _onRenderWidth: function (val) {
	    this.$('[data-role="content"]').css('width', val);
	  },

	  _onRenderHeight: function (val) {
	    this.$('[data-role="content"]').css('height', val);
	  },

	  _onRenderTheme: function (val, prev) {
	    this.element.removeClass('ui-poptip-' + prev);
	    this.element.addClass('ui-poptip-' + val);
	  }

	});

	module.exports = Tip;


/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(80);


/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(1);
	var iframeCount = 0;

	function Uploader(options) {
	  if (!(this instanceof Uploader)) {
	    return new Uploader(options);
	  }
	  if (isString(options)) {
	    options = {trigger: options};
	  }

	  var settings = {
	    trigger: null,
	    name: null,
	    action: null,
	    data: null,
	    accept: null,
	    change: null,
	    error: null,
	    multiple: true,
	    success: null
	  };
	  if (options) {
	    $.extend(settings, options);
	  }
	  var $trigger = $(settings.trigger);

	  settings.action = settings.action || $trigger.data('action') || '/upload';
	  settings.name = settings.name || $trigger.attr('name') || $trigger.data('name') || 'file';
	  settings.data = settings.data || parse($trigger.data('data'));
	  settings.accept = settings.accept || $trigger.data('accept');
	  settings.success = settings.success || $trigger.data('success');
	  this.settings = settings;

	  this.setup();
	  this.bind();
	}

	// initialize
	// create input, form, iframe
	Uploader.prototype.setup = function() {
	  this.form = $(
	    '<form method="post" enctype="multipart/form-data"'
	    + 'target="" action="' + this.settings.action + '" />'
	  );

	  this.iframe = newIframe();
	  this.form.attr('target', this.iframe.attr('name'));

	  var data = this.settings.data;
	  this.form.append(createInputs(data));
	  if (window.FormData) {
	    this.form.append(createInputs({'_uploader_': 'formdata'}));
	  } else {
	    this.form.append(createInputs({'_uploader_': 'iframe'}));
	  }

	  var input = document.createElement('input');
	  input.type = 'file';
	  input.name = this.settings.name;
	  if (this.settings.accept) {
	    input.accept = this.settings.accept;
	  }
	  if (this.settings.multiple) {
	    input.multiple = true;
	    input.setAttribute('multiple', 'multiple');
	  }
	  this.input = $(input);

	  var $trigger = $(this.settings.trigger);
	  this.input.attr('hidefocus', true).css({
	    position: 'absolute',
	    top: 0,
	    right: 0,
	    opacity: 0,
	    outline: 0,
	    cursor: 'pointer',
	    height: $trigger.outerHeight(),
	    fontSize: Math.max(64, $trigger.outerHeight() * 5)
	  });
	  this.form.append(this.input);
	  this.form.css({
	    position: 'absolute',
	    top: $trigger.offset().top,
	    left: $trigger.offset().left,
	    overflow: 'hidden',
	    width: $trigger.outerWidth(),
	    height: $trigger.outerHeight(),
	    zIndex: findzIndex($trigger) + 10
	  }).appendTo('body');
	  return this;
	};

	// bind events
	Uploader.prototype.bind = function() {
	  var self = this;
	  var $trigger = $(self.settings.trigger);
	  $trigger.mouseenter(function() {
	    self.form.css({
	      top: $trigger.offset().top,
	      left: $trigger.offset().left,
	      width: $trigger.outerWidth(),
	      height: $trigger.outerHeight()
	    });
	  });
	  self.bindInput();
	};

	Uploader.prototype.bindInput = function() {
	  var self = this;
	  self.input.change(function(e) {
	    // ie9 don't support FileList Object
	    // http://stackoverflow.com/questions/12830058/ie8-input-type-file-get-files
	    self._files = this.files || [{
	      name: e.target.value
	    }];
	    var file = self.input.val();
	    if (self.settings.change) {
	      self.settings.change.call(self, self._files);
	    } else if (file) {
	      return self.submit();
	    }
	  });
	};

	// handle submit event
	// prepare for submiting form
	Uploader.prototype.submit = function() {
	  var self = this;
	  if (window.FormData && self._files) {
	    // build a FormData
	    var form = new FormData(self.form.get(0));
	    // use FormData to upload
	    form.append(self.settings.name, self._files);

	    var optionXhr;
	    if (self.settings.progress) {
	      // fix the progress target file
	      var files = self._files;
	      optionXhr = function() {
	        var xhr = $.ajaxSettings.xhr();
	        if (xhr.upload) {
	          xhr.upload.addEventListener('progress', function(event) {
	            var percent = 0;
	            var position = event.loaded || event.position; /*event.position is deprecated*/
	            var total = event.total;
	            if (event.lengthComputable) {
	                percent = Math.ceil(position / total * 100);
	            }
	            self.settings.progress(event, position, total, percent, files);
	          }, false);
	        }
	        return xhr;
	      };
	    }
	    $.ajax({
	      url: self.settings.action,
	      type: 'post',
	      processData: false,
	      contentType: false,
	      data: form,
	      xhr: optionXhr,
	      context: this,
	      success: self.settings.success,
	      error: self.settings.error
	    });
	    return this;
	  } else {
	    // iframe upload
	    self.iframe = newIframe();
	    self.form.attr('target', self.iframe.attr('name'));
	    $('body').append(self.iframe);
	    self.iframe.one('load', function() {
	      // https://github.com/blueimp/jQuery-File-Upload/blob/9.5.6/js/jquery.iframe-transport.js#L102
	      // Fix for IE endless progress bar activity bug
	      // (happens on form submits to iframe targets):
	      $('<iframe src="javascript:false;"></iframe>')
	        .appendTo(self.form)
	        .remove();
	      var response;
	      try {
	        response = $(this).contents().find("body").html();
	      } catch (e) {
	        response = "cross-domain";
	      }
	      $(this).remove();
	      if (!response) {
	        if (self.settings.error) {
	          self.settings.error(self.input.val());
	        }
	      } else {
	        if (self.settings.success) {
	          self.settings.success(response);
	        }
	      }
	    });
	    self.form.submit();
	  }
	  return this;
	};

	Uploader.prototype.refreshInput = function() {
	  //replace the input element, or the same file can not to be uploaded
	  var newInput = this.input.clone();
	  this.input.before(newInput);
	  this.input.off('change');
	  this.input.remove();
	  this.input = newInput;
	  this.bindInput();
	};

	// handle change event
	// when value in file input changed
	Uploader.prototype.change = function(callback) {
	  if (!callback) {
	    return this;
	  }
	  this.settings.change = callback;
	  return this;
	};

	// handle when upload success
	Uploader.prototype.success = function(callback) {
	  var me = this;
	  this.settings.success = function(response) {
	    me.refreshInput();
	    if (callback) {
	      callback(response);
	    }
	  };

	  return this;
	};

	// handle when upload success
	Uploader.prototype.error = function(callback) {
	  var me = this;
	  this.settings.error = function(response) {
	    if (callback) {
	      me.refreshInput();
	      callback(response);
	    }
	  };
	  return this;
	};

	// enable
	Uploader.prototype.enable = function(){
	  this.input.prop('disabled', false);
	  this.input.css('cursor', 'pointer');
	};

	// disable
	Uploader.prototype.disable = function(){
	  this.input.prop('disabled', true);
	  this.input.css('cursor', 'not-allowed');
	};

	// Helpers
	// -------------

	function isString(val) {
	  return Object.prototype.toString.call(val) === '[object String]';
	}

	function createInputs(data) {
	  if (!data) return [];

	  var inputs = [], i;
	  for (var name in data) {
	    i = document.createElement('input');
	    i.type = 'hidden';
	    i.name = name;
	    i.value = data[name];
	    inputs.push(i);
	  }
	  return inputs;
	}

	function parse(str) {
	  if (!str) return {};
	  var ret = {};

	  var pairs = str.split('&');
	  var unescape = function(s) {
	    return decodeURIComponent(s.replace(/\+/g, ' '));
	  };

	  for (var i = 0; i < pairs.length; i++) {
	    var pair = pairs[i].split('=');
	    var key = unescape(pair[0]);
	    var val = unescape(pair[1]);
	    ret[key] = val;
	  }

	  return ret;
	}

	function findzIndex($node) {
	  var parents = $node.parentsUntil('body');
	  var zIndex = 0;
	  for (var i = 0; i < parents.length; i++) {
	    var item = parents.eq(i);
	    if (item.css('position') !== 'static') {
	      zIndex = parseInt(item.css('zIndex'), 10) || zIndex;
	    }
	  }
	  return zIndex;
	}

	function newIframe() {
	  var iframeName = 'iframe-uploader-' + iframeCount;
	  var iframe = $('<iframe name="' + iframeName + '" />').hide();
	  iframeCount += 1;
	  return iframe;
	}

	function MultipleUploader(options) {
	  if (!(this instanceof MultipleUploader)) {
	    return new MultipleUploader(options);
	  }

	  if (isString(options)) {
	    options = {trigger: options};
	  }
	  var $trigger = $(options.trigger);

	  var uploaders = [];
	  $trigger.each(function(i, item) {
	    options.trigger = item;
	    uploaders.push(new Uploader(options));
	  });
	  this._uploaders = uploaders;
	}
	MultipleUploader.prototype.submit = function() {
	  $.each(this._uploaders, function(i, item) {
	    item.submit();
	  });
	  return this;
	};
	MultipleUploader.prototype.change = function(callback) {
	  $.each(this._uploaders, function(i, item) {
	    item.change(callback);
	  });
	  return this;
	};
	MultipleUploader.prototype.success = function(callback) {
	  $.each(this._uploaders, function(i, item) {
	    item.success(callback);
	  });
	  return this;
	};
	MultipleUploader.prototype.error = function(callback) {
	  $.each(this._uploaders, function(i, item) {
	    item.error(callback);
	  });
	  return this;
	};
	MultipleUploader.prototype.enable = function (){
	  $.each(this._uploaders, function (i, item){
	    item.enable();
	  });
	  return this;
	};
	MultipleUploader.prototype.disable = function (){
	  $.each(this._uploaders, function (i, item){
	    item.disable();
	  });
	  return this;
	};
	MultipleUploader.Uploader = Uploader;

	module.exports = MultipleUploader;


/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	
	module.exports = __webpack_require__(86);


/***/ },
/* 84 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(1),
	    async = __webpack_require__(29),
	    Widget = __webpack_require__(2),
	    utils = __webpack_require__(30),
	    Item = __webpack_require__(85);

	var validators = [];

	var setterConfig = {
	    value: $.noop,
	    setter: function (val) {
	        return $.isFunction(val) ? val : utils.helper(val);
	    }
	};

	var Core = Widget.extend({
	    attrs: {
	        triggerType: 'blur',
	        checkOnSubmit: true,    // 是否在表单提交前进行校验，默认进行校验。
	        stopOnError: false,     // 校验整个表单时，遇到错误时是否停止校验其他表单项。
	        autoSubmit: true,       // When all validation passed, submit the form automatically.
	        checkNull: true,        // 除提交前的校验外，input的值为空时是否校验。
	        onItemValidate: setterConfig,
	        onItemValidated: setterConfig,
	        onFormValidate: setterConfig,
	        onFormValidated: setterConfig,
	        // 此函数用来定义如何自动获取校验项对应的 display 字段。
	        displayHelper: function (item) {
	            var labeltext, name;
	            var id = item.element.attr('id');
	            if (id) {
	                labeltext = $('label[for="' + id + '"]').text();
	                if (labeltext) {
	                    labeltext = labeltext.replace(/^[\*\s\:\：]*/, '').replace(/[\*\s\:\：]*$/, '');
	                }
	            }
	            name = item.element.attr('name');
	            return labeltext || name;
	        },
	        showMessage: setterConfig, // specify how to display error messages
	        hideMessage: setterConfig, // specify how to hide error messages
	        autoFocus: true,           // Automatically focus at the first element failed validation if true.
	        failSilently: false,       // If set to true and the given element passed to addItem does not exist, just ignore.
	        skipHidden: false          // 如果 DOM 隐藏是否进行校验
	    },

	    setup: function () {
	        // Validation will be executed according to configurations stored in items.
	        var self = this;

	        self.items = [];

	        // 外层容器是否是 form 元素
	        if (self.element.is("form")) {
	            // 记录 form 原来的 novalidate 的值，因为初始化时需要设置 novalidate 的值，destroy 的时候需要恢复。
	            self._novalidate_old = self.element.attr('novalidate');

	            // disable html5 form validation
	            // see: http://bugs.jquery.com/ticket/12577
	            try {
	                self.element.attr('novalidate', 'novalidate');
	            } catch (e) {}

	            //If checkOnSubmit is true, then bind submit event to execute validation.
	            if (self.get('checkOnSubmit')) {
	                self.element.on("submit.validator", function (e) {
	                    e.preventDefault();
	                    self.execute(function (err) {
	                        !err && self.get('autoSubmit') && self.element.get(0).submit();
	                    });
	                });
	            }
	        }

	        // 当每项校验之后, 根据返回的 err 状态, 显示或隐藏提示信息
	        self.on('itemValidated', function (err, message, element, event) {
	            this.query(element).get(err?'showMessage':'hideMessage').call(this, message, element, event);
	        });

	        validators.push(self);
	    },

	    Statics: $.extend({helper: utils.helper}, __webpack_require__(16), {
	        autoRender: function (cfg) {

	            var validator = new this(cfg);

	            $('input, textarea, select', validator.element).each(function (i, input) {

	                input = $(input);
	                var type = input.attr('type');

	                if (type == 'button' || type == 'submit' || type == 'reset') {
	                    return true;
	                }

	                var options = {};

	                if (type == 'radio' || type == 'checkbox') {
	                    options.element = $('[type=' + type + '][name=' + input.attr('name') + ']', validator.element);
	                } else {
	                    options.element = input;
	                }


	                if (!validator.query(options.element)) {

	                    var obj = utils.parseDom(input);

	                    if (!obj.rule) return true;

	                    $.extend(options, obj);

	                    validator.addItem(options);
	                }
	            });
	        },

	        query: function (selector) {
	            return Widget.query(selector);
	        },

	        // TODO 校验单项静态方法的实现需要优化
	        validate: function (options) {
	            var element = $(options.element);
	            var validator = new Core({
	                element: element.parents()
	            });

	            validator.addItem(options);
	            validator.query(element).execute();
	            validator.destroy();
	        }
	    }),


	    addItem: function (cfg) {
	        var self = this;
	        if ($.isArray(cfg)) {
	            $.each(cfg, function (i, v) {
	                self.addItem(v);
	            });
	            return this;
	        }

	        cfg = $.extend({
	            triggerType: self.get('triggerType'),
	            checkNull: self.get('checkNull'),
	            displayHelper: self.get('displayHelper'),
	            showMessage: self.get('showMessage'),
	            hideMessage: self.get('hideMessage'),
	            failSilently: self.get('failSilently'),
	            skipHidden: self.get('skipHidden')
	        }, cfg);

	        // 当 item 初始化的 element 为 selector 字符串时
	        // 默认到 validator.element 下去找
	        if (typeof cfg.element === 'string') {
	            cfg.element = this.$(cfg.element);
	        }

	        if (!$(cfg.element).length) {
	            if (cfg.failSilently) {
	                return self;
	            } else {
	                throw new Error('element does not exist');
	            }
	        }
	        var item = new Item(cfg);

	        self.items.push(item);
	        // 关联 item 到当前 validator 对象
	        item._validator = self;

	        item.delegateEvents(item.get('triggerType'), function (e) {
	            if (!this.get('checkNull') && !this.element.val()) return;
	            this.execute(null, {event: e});
	        });

	        item.on('all', function (eventName) {
	            this.trigger.apply(this, [].slice.call(arguments));
	        }, self);

	        return self;
	    },

	    removeItem: function (selector) {
	        var self = this,
	            target = selector instanceof Item ? selector : self.query(selector);

	        if (target) {
	            target.get('hideMessage').call(self, null, target.element);
	            erase(target, self.items);
	            target.destroy();
	        }

	        return self;
	    },

	    execute: function (callback) {
	        var self = this,
	            results = [],
	            hasError = false,
	            firstElem = null;

	        // 在表单校验前, 隐藏所有校验项的错误提示
	        $.each(self.items, function (i, item) {
	            item.get('hideMessage').call(self, null, item.element);
	        });
	        self.trigger('formValidate', self.element);

	        async[self.get('stopOnError') ? "forEachSeries" : "forEach" ](self.items, function (item, cb) {  // iterator
	            item.execute(function (err, message, ele) {
	                // 第一个校验错误的元素
	                if (err && !hasError) {
	                    hasError = true;
	                    firstElem = ele;
	                }
	                results.push([].slice.call(arguments, 0));

	                // Async doesn't allow any of tasks to fail, if you want the final callback executed after all tasks finished.
	                // So pass none-error value to task callback instead of the real result.
	                cb(self.get('stopOnError') ? err : null);

	            });
	        }, function () {  // complete callback
	            if (self.get('autoFocus') && hasError) {
	                self.trigger('autoFocus', firstElem);
	                firstElem.focus();
	            }

	            self.trigger('formValidated', hasError, results, self.element);
	            callback && callback(hasError, results, self.element);
	        });

	        return self;
	    },

	    destroy: function () {
	        var self = this,
	            len = self.items.length;

	        if (self.element.is("form")) {
	            try {
	                if (self._novalidate_old == undefined)
	                    self.element.removeAttr('novalidate');
	                else
	                    self.element.attr('novalidate', self._novalidate_old);
	            } catch (e) {
	            }

	            self.element.off('submit.validator');
	        }

	        for (var i = len - 1; i >= 0; i--) {
	            self.removeItem(self.items[i]);
	        }
	        erase(self, validators);

	        Core.superclass.destroy.call(this);
	    },

	    query: function (selector) {
	        return findItemBySelector(this.$(selector), this.items);

	        // 不使用 Widget.query 是因为, selector 有可能是重复, 选择第一个有可能不是属于
	        // 该组件的. 即使 再次使用 this.items 匹配, 也没法找到
	        /*var target = Widget.query(selector),
	            result = null;
	        $.each(this.items, function (i, item) {
	            if (item === target) {
	                result = target;
	                return false;
	            }
	        });
	        return result;*/
	    }
	});

	// 从数组中删除对应元素
	function erase(target, array) {
	    for(var i=0; i<array.length; i++) {
	        if (target === array[i]) {
	            array.splice(i, 1);
	            return array;
	        }
	    }
	}

	function findItemBySelector(target, array) {
	    var ret;
	    $.each(array, function (i, item) {
	        if (target.get(0) === item.element.get(0)) {
	            ret = item;
	            return false;
	        }
	    });
	    return ret;
	}
	module.exports = Core;


/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(1),
	    utils = __webpack_require__(30),
	    Widget = __webpack_require__(2),
	    async = __webpack_require__(29),
	    Rule = __webpack_require__(16);

	var setterConfig = {
	    value: $.noop,
	    setter: function (val) {
	        return $.isFunction(val) ? val : utils.helper(val);
	    }
	};

	function hasRequired(val){
	    return (' ' + val + ' ').indexOf(' required ') >= 0;
	}

	var Item = Widget.extend({
	    attrs: {
	        rule: {
	            value: '',
	            getter: function(val){
	                val = $.trim(val);

	                // 在获取的时候动态判断是否required，来追加或者删除 rule: required
	                if (this.get('required')) {
	                    if (!val || !hasRequired(val)) {
	                        val = $.trim('required ' + val);
	                    }
	                } else {
	                    if (hasRequired(val)) {
	                        val = $.trim((' ' + val + ' ').replace(' required ', ' '));
	                    }
	                }

	                return val;
	            }
	        },
	        display: null,
	        displayHelper: null,
	        triggerType: {
	            getter: function (val) {
	                if (!val)
	                    return val;

	                var element = this.element,
	                    type = element.attr('type');

	                // 将 select, radio, checkbox 的 blur 和 key 事件转成 change
	                var b = element.is("select") || type == 'radio' || type == 'checkbox';
	                if (b && (val.indexOf('blur') > -1 || val.indexOf('key') > -1))
	                    return 'change';
	                return val;
	            }
	        },
	        required: {
	            value: false,
	            getter: function(val) {
	                return $.isFunction(val) ? val() : val;
	            }
	        },
	        checkNull: true,
	        errormessage: null,
	        onItemValidate: setterConfig,
	        onItemValidated: setterConfig,
	        showMessage: setterConfig,
	        hideMessage: setterConfig
	    },

	    setup: function () {
	        if (!this.get('display') && $.isFunction(this.get('displayHelper'))) {
	            this.set('display', this.get('displayHelper')(this));
	        }
	    },

	    // callback 为当这个项校验完后, 通知 form 的 async.forEachSeries 此项校验结束并把结果通知到 async,
	    // 通过 async.forEachSeries 的第二个参数 Fn(item, cb) 的 cb 参数
	    execute: function (callback, context) {
	        var self = this,
	            elemDisabled = !!self.element.attr("disabled");

	        context = context || {};
	        // 如果是设置了不检查不可见元素的话, 直接 callback
	        if (self.get('skipHidden') && utils.isHidden(self.element) || elemDisabled) {
	            callback && callback(null, '', self.element);
	            return self;
	        }

	        self.trigger('itemValidate', self.element, context.event);

	        var rules = utils.parseRules(self.get('rule'));

	        if (rules) {
	            _metaValidate(self, rules, function (err, msg) {
	                self.trigger('itemValidated', err, msg, self.element, context.event);
	                callback && callback(err, msg, self.element);
	            });
	        } else {
	            self.trigger('itemValidated', null, '', self.element, context.event);
	            callback && callback(null, '', self.element);
	        }

	        return self;
	    },
	    getMessage: function(theRule, isSuccess, options) {
	        var message = '',
	            self = this,
	            rules = utils.parseRules(self.get('rule'));

	        isSuccess = !!isSuccess;

	        $.each(rules, function(i, item) {
	            var obj = utils.parseRule(item),
	                ruleName = obj.name,
	                param = obj.param;

	            if (theRule === ruleName) {
	                message = Rule.getMessage($.extend(options || {}, getMsgOptions(param, ruleName, self)), isSuccess);
	            }
	        });
	        return message;
	    }
	});

	function getMsgOptions(param, ruleName, self) {
	    var options = $.extend({}, param, {
	        element: self.element,
	        display: (param && param.display) || self.get('display'),
	        rule: ruleName
	    });

	    var message = self.get('errormessage' + upperFirstLetter(ruleName)) || self.get('errormessage');
	    if (message && !options.message) {
	        options.message = {
	            failure: message
	        };
	    }

	    return options;
	}

	function upperFirstLetter(str) {
	    str = str + "";
	    return str.charAt(0).toUpperCase() + str.slice(1);
	}

	function _metaValidate(self, rules, callback) {
	    var ele = self.element;

	    if (!self.get('required')) {
	        var truly = false;
	        var t = ele.attr('type');
	        switch (t) {
	            case 'checkbox':
	            case 'radio':
	                var checked = false;
	                ele.each(function (i, item) {
	                    if ($(item).prop('checked')) {
	                        checked = true;
	                        return false;
	                    }
	                });
	                truly = checked;
	                break;
	            default:
	                truly = !!ele.val();
	        }

	        // 非必要且没有值的时候, 直接 callback
	        if (!truly) {
	            callback && callback(null, null);
	            return;
	        }
	    }

	    if (!$.isArray(rules))
	        throw new Error('No validation rule specified or not specified as an array.');

	    var tasks = [];

	    $.each(rules, function (i, item) {
	        var obj = utils.parseRule(item),
	            ruleName = obj.name,
	            param = obj.param;

	        var ruleOperator = Rule.getOperator(ruleName);
	        if (!ruleOperator)
	            throw new Error('Validation rule with name "' + ruleName + '" cannot be found.');

	        var options = getMsgOptions(param, ruleName, self);

	        tasks.push(function (cb) {
	            // cb 为 async.series 每个 tasks 函数 的 callback!!
	            // callback(err, results)
	            // self._validator 为当前 Item 对象所在的 Validator 对象
	            ruleOperator.call(self._validator, options, cb);
	        });
	    });


	    // form.execute -> 多个 item.execute -> 多个 rule.operator
	    // 多个 rule 的校验是串行的, 前一个出错, 立即停止
	    // async.series 的 callback fn, 在执行 tasks 结束或某个 task 出错后被调用
	    // 其参数 results 为当前每个 task 执行的结果
	    // 函数内的 callback 回调给项校验
	    async.series(tasks, function (err, results) {
	        callback && callback(err, results[results.length - 1]);
	    });
	}

	module.exports = Item;


/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	var Core = __webpack_require__(84),
	    $ = __webpack_require__(1);

	var Validator = Core.extend({

	  events: {
	    'mouseenter .{{attrs.inputClass}}': 'mouseenter',
	    'mouseleave .{{attrs.inputClass}}': 'mouseleave',
	    'mouseenter .{{attrs.textareaClass}}': 'mouseenter',
	    'mouseleave .{{attrs.textareaClass}}': 'mouseleave',
	    'focus .{{attrs.itemClass}} input,textarea,select': 'focus',
	    'blur .{{attrs.itemClass}} input,textarea,select': 'blur'
	  },

	  attrs: {
	    explainClass: 'ui-form-explain',
	    itemClass: 'ui-form-item',
	    itemHoverClass: 'ui-form-item-hover',
	    itemFocusClass: 'ui-form-item-focus',
	    itemErrorClass: 'ui-form-item-error',
	    inputClass: 'ui-input',
	    textareaClass: 'ui-textarea',

	    showMessage: function (message, element) {
	      this.getExplain(element).html(message);
	      this.getItem(element).addClass(this.get('itemErrorClass'));
	    },

	    hideMessage: function (message, element) {
	      this.getExplain(element).html(element.attr('data-explain') || ' ');
	      this.getItem(element).removeClass(this.get('itemErrorClass'));
	    }
	  },

	  setup: function () {
	    Validator.superclass.setup.call(this);

	    var that = this;

	    this.on('autoFocus', function (ele) {
	      that.set('autoFocusEle', ele);
	    })
	  },

	  addItem: function (cfg) {
	    Validator.superclass.addItem.apply(this, [].slice.call(arguments));
	    var item = this.query(cfg.element);
	    if (item) {
	      this._saveExplainMessage(item);
	    }
	    return this;
	  },

	  _saveExplainMessage: function (item) {
	    var that = this;
	    var ele = item.element;

	    var explain = ele.attr('data-explain');
	    // If explaining message is not specified, retrieve it from data-explain attribute of the target
	    // or from DOM element with class name of the value of explainClass attr.
	    // Explaining message cannot always retrieve from DOM element with class name of the value of explainClass
	    // attr because the initial state of form may contain error messages from server.
	    // ---
	    // Also, If explaining message is under ui-form-item-error className
	    // it could be considered to be a error message from server
	    // that should not be put into data-explain attribute
	    if (explain === undefined && !this.getItem(ele).hasClass(this.get('itemErrorClass'))) {
	      ele.attr('data-explain', this.getExplain(ele).html());
	    }
	  },

	  getExplain: function (ele) {
	    var item = this.getItem(ele);
	    var explain = item.find('.' + this.get('explainClass'));

	    if (explain.length == 0) {
	     explain = $('<div class="' + this.get('explainClass') + '"></div>').appendTo(item);
	    }

	    return explain;
	  },

	  getItem: function (ele) {
	    ele = $(ele);
	    var item = ele.parents('.' + this.get('itemClass'));

	    return item;
	  },

	  mouseenter: function (e) {
	    this.getItem(e.target).addClass(this.get('itemHoverClass'));
	  },

	  mouseleave: function (e) {
	    this.getItem(e.target).removeClass(this.get('itemHoverClass'));
	  },

	  focus: function (e) {
	    var target = e.target,
	        autoFocusEle = this.get('autoFocusEle');

	    if (autoFocusEle && autoFocusEle.has(target)) {
	      var that = this;
	      $(target).keyup(function (e) {
	        that.set('autoFocusEle', null);
	        that.focus({target: target});
	      });
	      return;
	    }
	    this.getItem(target).removeClass(this.get('itemErrorClass'));
	    this.getItem(target).addClass(this.get('itemFocusClass'));
	    this.getExplain(target).html($(target).attr('data-explain') || '');
	  },

	  blur: function (e) {
	    this.getItem(e.target).removeClass(this.get('itemFocusClass'));
	  }
	});


	module.exports = Validator;


/***/ },
/* 87 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(1)
	var DATA_WIDGET_AUTO_RENDERED = 'data-widget-auto-rendered'


	// 自动渲染接口，子类可根据自己的初始化逻辑进行覆盖
	exports.autoRender = function(config) {
	  return new this(config).render()
	}


	// 根据 data-widget 属性，自动渲染所有开启了 data-api 的 widget 组件
	exports.autoRenderAll = function(root, callback) {
	  if (typeof root === 'function') {
	    callback = root
	    root = null
	  }

	  root = $(root || document.body)
	  var modules = []
	  var elements = []

	  root.find('[data-widget]').each(function(i, element) {
	    if (!exports.isDataApiOff(element)) {
	      modules.push(element.getAttribute('data-widget').toLowerCase())
	      elements.push(element)
	    }
	  })

	  if (modules.length) {
	    seajs.use(modules, function() {

	      for (var i = 0; i < arguments.length; i++) {
	        var SubWidget = arguments[i]
	        var element = $(elements[i])

	        // 已经渲染过
	        if (element.attr(DATA_WIDGET_AUTO_RENDERED)) continue

	        var config = {
	          initElement: element,
	          renderType: 'auto'
	        };

	        // data-widget-role 是指将当前的 DOM 作为 role 的属性去实例化，默认的 role 为 element
	        var role = element.attr('data-widget-role')
	        config[role ? role : 'element'] = element

	        // 调用自动渲染接口
	        SubWidget.autoRender && SubWidget.autoRender(config)

	        // 标记已经渲染过
	        element.attr(DATA_WIDGET_AUTO_RENDERED, 'true')
	      }

	      // 在所有自动渲染完成后，执行回调
	      callback && callback()
	    })
	  }
	}


	var isDefaultOff = $(document.body).attr('data-api') === 'off'

	// 是否没开启 data-api
	exports.isDataApiOff = function(element) {
	  var elementDataApi = $(element).attr('data-api')

	  // data-api 默认开启，关闭只有两种方式：
	  //  1. element 上有 data-api="off"，表示关闭单个
	  //  2. document.body 上有 data-api="off"，表示关闭所有
	  return  elementDataApi === 'off' ||
	      (elementDataApi !== 'on' && isDefaultOff)
	}



/***/ },
/* 88 */
/***/ function(module, exports, __webpack_require__) {

	// DAParser
	// --------
	// data api 解析器，提供对单个 element 的解析，可用来初始化页面中的所有 Widget 组件。

	var $ = __webpack_require__(1)


	// 得到某个 DOM 元素的 dataset
	exports.parseElement = function(element, raw) {
	  element = $(element)[0]
	  var dataset = {}

	  // ref: https://developer.mozilla.org/en/DOM/element.dataset
	  if (element.dataset) {
	    // 转换成普通对象
	    dataset = $.extend({}, element.dataset)
	  }
	  else {
	    var attrs = element.attributes

	    for (var i = 0, len = attrs.length; i < len; i++) {
	      var attr = attrs[i]
	      var name = attr.name

	      if (name.indexOf('data-') === 0) {
	        name = camelCase(name.substring(5))
	        dataset[name] = attr.value
	      }
	    }
	  }

	  return raw === true ? dataset : normalizeValues(dataset)
	}


	// Helpers
	// ------

	var RE_DASH_WORD = /-([a-z])/g
	var JSON_LITERAL_PATTERN = /^\s*[\[{].*[\]}]\s*$/
	var parseJSON = this.JSON ? JSON.parse : $.parseJSON

	// 仅处理字母开头的，其他情况转换为小写："data-x-y-123-_A" --> xY-123-_a
	function camelCase(str) {
	  return str.toLowerCase().replace(RE_DASH_WORD, function(all, letter) {
	    return (letter + '').toUpperCase()
	  })
	}

	// 解析并归一化配置中的值
	function normalizeValues(data) {
	  for (var key in data) {
	    if (data.hasOwnProperty(key)) {

	      var val = data[key]
	      if (typeof val !== 'string') continue

	      if (JSON_LITERAL_PATTERN.test(val)) {
	        val = val.replace(/'/g, '"')
	        data[key] = normalizeValues(parseJSON(val))
	      }
	      else {
	        data[key] = normalizeValue(val)
	      }
	    }
	  }

	  return data
	}

	// 将 'false' 转换为 false
	// 'true' 转换为 true
	// '3253.34' 转换为 3253.34
	function normalizeValue(val) {
	  if (val.toLowerCase() === 'false') {
	    val = false
	  }
	  else if (val.toLowerCase() === 'true') {
	    val = true
	  }
	  else if (/\d/.test(val) && /[^a-z]/i.test(val)) {
	    var number = parseFloat(val)
	    if (number + '' === val) {
	      val = number
	    }
	  }

	  return val
	}


/***/ },
/* 89 */
/***/ function(module, exports, __webpack_require__) {

	// Widget
	// ---------
	// Widget 是与 DOM 元素相关联的非工具类组件，主要负责 View 层的管理。
	// Widget 组件具有四个要素：描述状态的 attributes 和 properties，描述行为的 events
	// 和 methods。Widget 基类约定了这四要素创建时的基本流程和最佳实践。

	var Base = __webpack_require__(6)
	var $ = __webpack_require__(1)
	var DAParser = __webpack_require__(88)
	var AutoRender = __webpack_require__(87)

	var DELEGATE_EVENT_NS = '.delegate-events-'
	var ON_RENDER = '_onRender'
	var DATA_WIDGET_CID = 'data-widget-cid'

	// 所有初始化过的 Widget 实例
	var cachedInstances = {}

	var Widget = Base.extend({

	  // config 中的这些键值会直接添加到实例上，转换成 properties
	  propsInAttrs: ['initElement', 'element', 'events'],

	  // 与 widget 关联的 DOM 元素
	  element: null,

	  // 事件代理，格式为：
	  //   {
	  //     'mousedown .title': 'edit',
	  //     'click {{attrs.saveButton}}': 'save'
	  //     'click .open': function(ev) { ... }
	  //   }
	  events: null,

	  // 属性列表
	  attrs: {
	    // 基本属性
	    id: null,
	    className: null,
	    style: null,

	    // 默认模板
	    template: '<div></div>',

	    // 默认数据模型
	    model: null,

	    // 组件的默认父节点
	    parentNode: document.body
	  },

	  // 初始化方法，确定组件创建时的基本流程：
	  // 初始化 attrs --》 初始化 props --》 初始化 events --》 子类的初始化
	  initialize: function(config) {
	    this.cid = uniqueCid()

	    // 初始化 attrs
	    var dataAttrsConfig = this._parseDataAttrsConfig(config)
	    Widget.superclass.initialize.call(this, config ? $.extend(dataAttrsConfig, config) : dataAttrsConfig)

	    // 初始化 props
	    this.parseElement()
	    this.initProps()

	    // 初始化 events
	    this.delegateEvents()

	    // 子类自定义的初始化
	    this.setup()

	    // 保存实例信息
	    this._stamp()

	    // 是否由 template 初始化
	    this._isTemplate = !(config && config.element)
	  },

	  // 解析通过 data-attr 设置的 api
	  _parseDataAttrsConfig: function(config) {
	    var element, dataAttrsConfig
	    if (config) {
	      element = config.initElement ? $(config.initElement) : $(config.element)
	    }

	    // 解析 data-api 时，只考虑用户传入的 element，不考虑来自继承或从模板构建的
	    if (element && element[0] && !AutoRender.isDataApiOff(element)) {
	      dataAttrsConfig = DAParser.parseElement(element)
	    }

	    return dataAttrsConfig
	  },

	  // 构建 this.element
	  parseElement: function() {
	    var element = this.element

	    if (element) {
	      this.element = $(element)
	    }
	    // 未传入 element 时，从 template 构建
	    else if (this.get('template')) {
	      this.parseElementFromTemplate()
	    }

	    // 如果对应的 DOM 元素不存在，则报错
	    if (!this.element || !this.element[0]) {
	      throw new Error('element is invalid')
	    }
	  },

	  // 从模板中构建 this.element
	  parseElementFromTemplate: function() {
	    this.element = $(this.get('template'))
	  },

	  // 负责 properties 的初始化，提供给子类覆盖
	  initProps: function() {
	  },

	  // 注册事件代理
	  delegateEvents: function(element, events, handler) {
	    var argus = trimRightUndefine(Array.prototype.slice.call(arguments));
	    // widget.delegateEvents()
	    if (argus.length === 0) {
	      events = getEvents(this)
	      element = this.element
	    }

	    // widget.delegateEvents({
	    //   'click p': 'fn1',
	    //   'click li': 'fn2'
	    // })
	    else if (argus.length === 1) {
	      events = element
	      element = this.element
	    }

	    // widget.delegateEvents('click p', function(ev) { ... })
	    else if (argus.length === 2) {
	      handler = events
	      events = element
	      element = this.element
	    }

	    // widget.delegateEvents(element, 'click p', function(ev) { ... })
	    else {
	      element || (element = this.element)
	      this._delegateElements || (this._delegateElements = [])
	      this._delegateElements.push($(element))
	    }

	    // 'click p' => {'click p': handler}
	    if (isString(events) && isFunction(handler)) {
	      var o = {}
	      o[events] = handler
	      events = o
	    }

	    // key 为 'event selector'
	    for (var key in events) {
	      if (!events.hasOwnProperty(key)) continue

	      var args = parseEventKey(key, this)
	      var eventType = args.type
	      var selector = args.selector

	      ;(function(handler, widget) {

	        var callback = function(ev) {
	          if (isFunction(handler)) {
	            handler.call(widget, ev)
	          } else {
	            widget[handler](ev)
	          }
	        }

	        // delegate
	        if (selector) {
	          $(element).on(eventType, selector, callback)
	        }
	        // normal bind
	        // 分开写是为了兼容 zepto，zepto 的判断不如 jquery 强劲有力
	        else {
	          $(element).on(eventType, callback)
	        }

	      })(events[key], this)
	    }

	    return this
	  },

	  // 卸载事件代理
	  undelegateEvents: function(element, eventKey) {
	    var argus = trimRightUndefine(Array.prototype.slice.call(arguments));

	    if (!eventKey) {
	      eventKey = element
	      element = null
	    }

	    // 卸载所有
	    // .undelegateEvents()
	    if (argus.length === 0) {
	      var type = DELEGATE_EVENT_NS + this.cid

	      this.element && this.element.off(type)

	      // 卸载所有外部传入的 element
	      if (this._delegateElements) {
	        for (var de in this._delegateElements) {
	          if (!this._delegateElements.hasOwnProperty(de)) continue
	          this._delegateElements[de].off(type)
	        }
	      }

	    } else {
	      var args = parseEventKey(eventKey, this)

	      // 卸载 this.element
	      // .undelegateEvents(events)
	      if (!element) {
	        this.element && this.element.off(args.type, args.selector)
	      }

	      // 卸载外部 element
	      // .undelegateEvents(element, events)
	      else {
	        $(element).off(args.type, args.selector)
	      }
	    }
	    return this
	  },

	  // 提供给子类覆盖的初始化方法
	  setup: function() {
	  },

	  // 将 widget 渲染到页面上
	  // 渲染不仅仅包括插入到 DOM 树中，还包括样式渲染等
	  // 约定：子类覆盖时，需保持 `return this`
	  render: function() {

	    // 让渲染相关属性的初始值生效，并绑定到 change 事件
	    if (!this.rendered) {
	      this._renderAndBindAttrs()
	      this.rendered = true
	    }

	    // 插入到文档流中
	    var parentNode = this.get('parentNode')
	    if (parentNode && !isInDocument(this.element[0])) {
	      // 隔离样式，添加统一的命名空间
	      // https://github.com/aliceui/aliceui.org/issues/9
	      var outerBoxClass = this.constructor.outerBoxClass
	      if (outerBoxClass) {
	        var outerBox = this._outerBox = $('<div></div>').addClass(outerBoxClass)
	        outerBox.append(this.element).appendTo(parentNode)
	      } else {
	        this.element.appendTo(parentNode)
	      }
	    }

	    return this
	  },

	  // 让属性的初始值生效，并绑定到 change:attr 事件上
	  _renderAndBindAttrs: function() {
	    var widget = this
	    var attrs = widget.attrs

	    for (var attr in attrs) {
	      if (!attrs.hasOwnProperty(attr)) continue
	      var m = ON_RENDER + ucfirst(attr)

	      if (this[m]) {
	        var val = this.get(attr)

	        // 让属性的初始值生效。注：默认空值不触发
	        if (!isEmptyAttrValue(val)) {
	          this[m](val, undefined, attr)
	        }

	        // 将 _onRenderXx 自动绑定到 change:xx 事件上
	        (function(m) {
	          widget.on('change:' + attr, function(val, prev, key) {
	            widget[m](val, prev, key)
	          })
	        })(m)
	      }
	    }
	  },

	  _onRenderId: function(val) {
	    this.element.attr('id', val)
	  },

	  _onRenderClassName: function(val) {
	    this.element.addClass(val)
	  },

	  _onRenderStyle: function(val) {
	    this.element.css(val)
	  },

	  // 让 element 与 Widget 实例建立关联
	  _stamp: function() {
	    var cid = this.cid;

	    (this.initElement || this.element).attr(DATA_WIDGET_CID, cid)
	    cachedInstances[cid] = this
	  },

	  // 在 this.element 内寻找匹配节点
	  $: function(selector) {
	    return this.element.find(selector)
	  },

	  destroy: function() {
	    this.undelegateEvents()
	    delete cachedInstances[this.cid]

	    // For memory leak
	    if (this.element && this._isTemplate) {
	      this.element.off()
	      // 如果是 widget 生成的 element 则去除
	      if (this._outerBox) {
	        this._outerBox.remove()
	      } else {
	        this.element.remove()
	      }
	    }
	    this.element = null

	    Widget.superclass.destroy.call(this)
	  }
	})

	// For memory leak
	$(window).unload(function() {
	  for(var cid in cachedInstances) {
	    cachedInstances[cid].destroy()
	  }
	})

	// 查询与 selector 匹配的第一个 DOM 节点，得到与该 DOM 节点相关联的 Widget 实例
	Widget.query = function(selector) {
	  var element = $(selector).eq(0)
	  var cid

	  element && (cid = element.attr(DATA_WIDGET_CID))
	  return cachedInstances[cid]
	}


	Widget.autoRender = AutoRender.autoRender
	Widget.autoRenderAll = AutoRender.autoRenderAll
	Widget.StaticsWhiteList = ['autoRender']

	module.exports = Widget


	// Helpers
	// ------

	var toString = Object.prototype.toString
	var cidCounter = 0

	function uniqueCid() {
	  return 'widget-' + cidCounter++
	}

	function isString(val) {
	  return toString.call(val) === '[object String]'
	}

	function isFunction(val) {
	  return toString.call(val) === '[object Function]'
	}

	// Zepto 上没有 contains 方法
	var contains = $.contains || function(a, b) {
	  //noinspection JSBitwiseOperatorUsage
	  return !!(a.compareDocumentPosition(b) & 16)
	}

	function isInDocument(element) {
	  return contains(document.documentElement, element)
	}

	function ucfirst(str) {
	  return str.charAt(0).toUpperCase() + str.substring(1)
	}


	var EVENT_KEY_SPLITTER = /^(\S+)\s*(.*)$/
	var EXPRESSION_FLAG = /{{([^}]+)}}/g
	var INVALID_SELECTOR = 'INVALID_SELECTOR'

	function getEvents(widget) {
	  if (isFunction(widget.events)) {
	    widget.events = widget.events()
	  }
	  return widget.events
	}

	function parseEventKey(eventKey, widget) {
	  var match = eventKey.match(EVENT_KEY_SPLITTER)
	  var eventType = match[1] + DELEGATE_EVENT_NS + widget.cid

	  // 当没有 selector 时，需要设置为 undefined，以使得 zepto 能正确转换为 bind
	  var selector = match[2] || undefined

	  if (selector && selector.indexOf('{{') > -1) {
	    selector = parseExpressionInEventKey(selector, widget)
	  }

	  return {
	    type: eventType,
	    selector: selector
	  }
	}

	// 解析 eventKey 中的 {{xx}}, {{yy}}
	function parseExpressionInEventKey(selector, widget) {

	  return selector.replace(EXPRESSION_FLAG, function(m, name) {
	    var parts = name.split('.')
	    var point = widget, part

	    while (part = parts.shift()) {
	      if (point === widget.attrs) {
	        point = widget.get(part)
	      } else {
	        point = point[part]
	      }
	    }

	    // 已经是 className，比如来自 dataset 的
	    if (isString(point)) {
	      return point
	    }

	    // 不能识别的，返回无效标识
	    return INVALID_SELECTOR
	  })
	}


	// 对于 attrs 的 value 来说，以下值都认为是空值： null, undefined
	function isEmptyAttrValue(o) {
	  return o == null || o === undefined
	}

	function trimRightUndefine(argus) {
	  for (var i = argus.length - 1; i >= 0; i--) {
	    if (argus[i] === undefined) {
	      argus.pop();
	    } else {
	      break;
	    }
	  }
	  return argus;
	}


/***/ },
/* 90 */
/***/ function(module, exports) {

	
	module.exports = function extend (object) {
	    // Takes an unlimited number of extenders.
	    var args = Array.prototype.slice.call(arguments, 1);

	    // For each extender, copy their properties on our object.
	    for (var i = 0, source; source = args[i]; i++) {
	        if (!source) continue;
	        for (var property in source) {
	            object[property] = source[property];
	        }
	    }

	    return object;
	};

/***/ },
/* 91 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	/*globals Handlebars: true */
	var Handlebars = __webpack_require__(92)["default"];

	// Compiler imports
	var AST = __webpack_require__(31)["default"];
	var Parser = __webpack_require__(32).parser;
	var parse = __webpack_require__(32).parse;
	var Compiler = __webpack_require__(17).Compiler;
	var compile = __webpack_require__(17).compile;
	var precompile = __webpack_require__(17).precompile;
	var JavaScriptCompiler = __webpack_require__(93)["default"];

	var _create = Handlebars.create;
	var create = function() {
	  var hb = _create();

	  hb.compile = function(input, options) {
	    return compile(input, options, hb);
	  };
	  hb.precompile = function (input, options) {
	    return precompile(input, options, hb);
	  };

	  hb.AST = AST;
	  hb.Compiler = Compiler;
	  hb.JavaScriptCompiler = JavaScriptCompiler;
	  hb.Parser = Parser;
	  hb.parse = parse;

	  return hb;
	};

	Handlebars = create();
	Handlebars.create = create;

	exports["default"] = Handlebars;

/***/ },
/* 92 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	/*globals Handlebars: true */
	var base = __webpack_require__(3);

	// Each of these augment the Handlebars object. No need to setup here.
	// (This is done to easily share code between commonjs and browse envs)
	var SafeString = __webpack_require__(33)["default"];
	var Exception = __webpack_require__(4)["default"];
	var Utils = __webpack_require__(18);
	var runtime = __webpack_require__(95);

	// For compatibility and usage outside of module systems, make the Handlebars object a namespace
	var create = function() {
	  var hb = new base.HandlebarsEnvironment();

	  Utils.extend(hb, base);
	  hb.SafeString = SafeString;
	  hb.Exception = Exception;
	  hb.Utils = Utils;

	  hb.VM = runtime;
	  hb.template = function(spec) {
	    return runtime.template(spec, hb);
	  };

	  return hb;
	};

	var Handlebars = create();
	Handlebars.create = create;

	exports["default"] = Handlebars;

/***/ },
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var COMPILER_REVISION = __webpack_require__(3).COMPILER_REVISION;
	var REVISION_CHANGES = __webpack_require__(3).REVISION_CHANGES;
	var log = __webpack_require__(3).log;
	var Exception = __webpack_require__(4)["default"];

	function Literal(value) {
	  this.value = value;
	}

	function JavaScriptCompiler() {}

	JavaScriptCompiler.prototype = {
	  // PUBLIC API: You can override these methods in a subclass to provide
	  // alternative compiled forms for name lookup and buffering semantics
	  nameLookup: function(parent, name /* , type*/) {
	    var wrap,
	        ret;
	    if (parent.indexOf('depth') === 0) {
	      wrap = true;
	    }

	    if (/^[0-9]+$/.test(name)) {
	      ret = parent + "[" + name + "]";
	    } else if (JavaScriptCompiler.isValidJavaScriptVariableName(name)) {
	      ret = parent + "." + name;
	    }
	    else {
	      ret = parent + "['" + name + "']";
	    }

	    if (wrap) {
	      return '(' + parent + ' && ' + ret + ')';
	    } else {
	      return ret;
	    }
	  },

	  compilerInfo: function() {
	    var revision = COMPILER_REVISION,
	        versions = REVISION_CHANGES[revision];
	    return "this.compilerInfo = ["+revision+",'"+versions+"'];\n";
	  },

	  appendToBuffer: function(string) {
	    if (this.environment.isSimple) {
	      return "return " + string + ";";
	    } else {
	      return {
	        appendToBuffer: true,
	        content: string,
	        toString: function() { return "buffer += " + string + ";"; }
	      };
	    }
	  },

	  initializeBuffer: function() {
	    return this.quotedString("");
	  },

	  namespace: "Handlebars",
	  // END PUBLIC API

	  compile: function(environment, options, context, asObject) {
	    this.environment = environment;
	    this.options = options || {};

	    log('debug', this.environment.disassemble() + "\n\n");

	    this.name = this.environment.name;
	    this.isChild = !!context;
	    this.context = context || {
	      programs: [],
	      environments: [],
	      aliases: { }
	    };

	    this.preamble();

	    this.stackSlot = 0;
	    this.stackVars = [];
	    this.registers = { list: [] };
	    this.hashes = [];
	    this.compileStack = [];
	    this.inlineStack = [];

	    this.compileChildren(environment, options);

	    var opcodes = environment.opcodes, opcode;

	    this.i = 0;

	    for(var l=opcodes.length; this.i<l; this.i++) {
	      opcode = opcodes[this.i];

	      if(opcode.opcode === 'DECLARE') {
	        this[opcode.name] = opcode.value;
	      } else {
	        this[opcode.opcode].apply(this, opcode.args);
	      }

	      // Reset the stripNext flag if it was not set by this operation.
	      if (opcode.opcode !== this.stripNext) {
	        this.stripNext = false;
	      }
	    }

	    // Flush any trailing content that might be pending.
	    this.pushSource('');

	    if (this.stackSlot || this.inlineStack.length || this.compileStack.length) {
	      throw new Exception('Compile completed with content left on stack');
	    }

	    return this.createFunctionContext(asObject);
	  },

	  preamble: function() {
	    var out = [];

	    if (!this.isChild) {
	      var namespace = this.namespace;

	      var copies = "helpers = this.merge(helpers, " + namespace + ".helpers);";
	      if (this.environment.usePartial) { copies = copies + " partials = this.merge(partials, " + namespace + ".partials);"; }
	      if (this.options.data) { copies = copies + " data = data || {};"; }
	      out.push(copies);
	    } else {
	      out.push('');
	    }

	    if (!this.environment.isSimple) {
	      out.push(", buffer = " + this.initializeBuffer());
	    } else {
	      out.push("");
	    }

	    // track the last context pushed into place to allow skipping the
	    // getContext opcode when it would be a noop
	    this.lastContext = 0;
	    this.source = out;
	  },

	  createFunctionContext: function(asObject) {
	    var locals = this.stackVars.concat(this.registers.list);

	    if(locals.length > 0) {
	      this.source[1] = this.source[1] + ", " + locals.join(", ");
	    }

	    // Generate minimizer alias mappings
	    if (!this.isChild) {
	      for (var alias in this.context.aliases) {
	        if (this.context.aliases.hasOwnProperty(alias)) {
	          this.source[1] = this.source[1] + ', ' + alias + '=' + this.context.aliases[alias];
	        }
	      }
	    }

	    if (this.source[1]) {
	      this.source[1] = "var " + this.source[1].substring(2) + ";";
	    }

	    // Merge children
	    if (!this.isChild) {
	      this.source[1] += '\n' + this.context.programs.join('\n') + '\n';
	    }

	    if (!this.environment.isSimple) {
	      this.pushSource("return buffer;");
	    }

	    var params = this.isChild ? ["depth0", "data"] : ["Handlebars", "depth0", "helpers", "partials", "data"];

	    for(var i=0, l=this.environment.depths.list.length; i<l; i++) {
	      params.push("depth" + this.environment.depths.list[i]);
	    }

	    // Perform a second pass over the output to merge content when possible
	    var source = this.mergeSource();

	    if (!this.isChild) {
	      source = this.compilerInfo()+source;
	    }

	    if (asObject) {
	      params.push(source);

	      return Function.apply(this, params);
	    } else {
	      var functionSource = 'function ' + (this.name || '') + '(' + params.join(',') + ') {\n  ' + source + '}';
	      log('debug', functionSource + "\n\n");
	      return functionSource;
	    }
	  },
	  mergeSource: function() {
	    // WARN: We are not handling the case where buffer is still populated as the source should
	    // not have buffer append operations as their final action.
	    var source = '',
	        buffer;
	    for (var i = 0, len = this.source.length; i < len; i++) {
	      var line = this.source[i];
	      if (line.appendToBuffer) {
	        if (buffer) {
	          buffer = buffer + '\n    + ' + line.content;
	        } else {
	          buffer = line.content;
	        }
	      } else {
	        if (buffer) {
	          source += 'buffer += ' + buffer + ';\n  ';
	          buffer = undefined;
	        }
	        source += line + '\n  ';
	      }
	    }
	    return source;
	  },

	  // [blockValue]
	  //
	  // On stack, before: hash, inverse, program, value
	  // On stack, after: return value of blockHelperMissing
	  //
	  // The purpose of this opcode is to take a block of the form
	  // `{{#foo}}...{{/foo}}`, resolve the value of `foo`, and
	  // replace it on the stack with the result of properly
	  // invoking blockHelperMissing.
	  blockValue: function() {
	    this.context.aliases.blockHelperMissing = 'helpers.blockHelperMissing';

	    var params = ["depth0"];
	    this.setupParams(0, params);

	    this.replaceStack(function(current) {
	      params.splice(1, 0, current);
	      return "blockHelperMissing.call(" + params.join(", ") + ")";
	    });
	  },

	  // [ambiguousBlockValue]
	  //
	  // On stack, before: hash, inverse, program, value
	  // Compiler value, before: lastHelper=value of last found helper, if any
	  // On stack, after, if no lastHelper: same as [blockValue]
	  // On stack, after, if lastHelper: value
	  ambiguousBlockValue: function() {
	    this.context.aliases.blockHelperMissing = 'helpers.blockHelperMissing';

	    var params = ["depth0"];
	    this.setupParams(0, params);

	    var current = this.topStack();
	    params.splice(1, 0, current);

	    this.pushSource("if (!" + this.lastHelper + ") { " + current + " = blockHelperMissing.call(" + params.join(", ") + "); }");
	  },

	  // [appendContent]
	  //
	  // On stack, before: ...
	  // On stack, after: ...
	  //
	  // Appends the string value of `content` to the current buffer
	  appendContent: function(content) {
	    if (this.pendingContent) {
	      content = this.pendingContent + content;
	    }
	    if (this.stripNext) {
	      content = content.replace(/^\s+/, '');
	    }

	    this.pendingContent = content;
	  },

	  // [strip]
	  //
	  // On stack, before: ...
	  // On stack, after: ...
	  //
	  // Removes any trailing whitespace from the prior content node and flags
	  // the next operation for stripping if it is a content node.
	  strip: function() {
	    if (this.pendingContent) {
	      this.pendingContent = this.pendingContent.replace(/\s+$/, '');
	    }
	    this.stripNext = 'strip';
	  },

	  // [append]
	  //
	  // On stack, before: value, ...
	  // On stack, after: ...
	  //
	  // Coerces `value` to a String and appends it to the current buffer.
	  //
	  // If `value` is truthy, or 0, it is coerced into a string and appended
	  // Otherwise, the empty string is appended
	  append: function() {
	    // Force anything that is inlined onto the stack so we don't have duplication
	    // when we examine local
	    this.flushInline();
	    var local = this.popStack();
	    this.pushSource("if(" + local + " || " + local + " === 0) { " + this.appendToBuffer(local) + " }");
	    if (this.environment.isSimple) {
	      this.pushSource("else { " + this.appendToBuffer("''") + " }");
	    }
	  },

	  // [appendEscaped]
	  //
	  // On stack, before: value, ...
	  // On stack, after: ...
	  //
	  // Escape `value` and append it to the buffer
	  appendEscaped: function() {
	    this.context.aliases.escapeExpression = 'this.escapeExpression';

	    this.pushSource(this.appendToBuffer("escapeExpression(" + this.popStack() + ")"));
	  },

	  // [getContext]
	  //
	  // On stack, before: ...
	  // On stack, after: ...
	  // Compiler value, after: lastContext=depth
	  //
	  // Set the value of the `lastContext` compiler value to the depth
	  getContext: function(depth) {
	    if(this.lastContext !== depth) {
	      this.lastContext = depth;
	    }
	  },

	  // [lookupOnContext]
	  //
	  // On stack, before: ...
	  // On stack, after: currentContext[name], ...
	  //
	  // Looks up the value of `name` on the current context and pushes
	  // it onto the stack.
	  lookupOnContext: function(name) {
	    this.push(this.nameLookup('depth' + this.lastContext, name, 'context'));
	  },

	  // [pushContext]
	  //
	  // On stack, before: ...
	  // On stack, after: currentContext, ...
	  //
	  // Pushes the value of the current context onto the stack.
	  pushContext: function() {
	    this.pushStackLiteral('depth' + this.lastContext);
	  },

	  // [resolvePossibleLambda]
	  //
	  // On stack, before: value, ...
	  // On stack, after: resolved value, ...
	  //
	  // If the `value` is a lambda, replace it on the stack by
	  // the return value of the lambda
	  resolvePossibleLambda: function() {
	    this.context.aliases.functionType = '"function"';

	    this.replaceStack(function(current) {
	      return "typeof " + current + " === functionType ? " + current + ".apply(depth0) : " + current;
	    });
	  },

	  // [lookup]
	  //
	  // On stack, before: value, ...
	  // On stack, after: value[name], ...
	  //
	  // Replace the value on the stack with the result of looking
	  // up `name` on `value`
	  lookup: function(name) {
	    this.replaceStack(function(current) {
	      return current + " == null || " + current + " === false ? " + current + " : " + this.nameLookup(current, name, 'context');
	    });
	  },

	  // [lookupData]
	  //
	  // On stack, before: ...
	  // On stack, after: data, ...
	  //
	  // Push the data lookup operator
	  lookupData: function() {
	    this.pushStackLiteral('data');
	  },

	  // [pushStringParam]
	  //
	  // On stack, before: ...
	  // On stack, after: string, currentContext, ...
	  //
	  // This opcode is designed for use in string mode, which
	  // provides the string value of a parameter along with its
	  // depth rather than resolving it immediately.
	  pushStringParam: function(string, type) {
	    this.pushStackLiteral('depth' + this.lastContext);

	    this.pushString(type);

	    // If it's a subexpression, the string result
	    // will be pushed after this opcode.
	    if (type !== 'sexpr') {
	      if (typeof string === 'string') {
	        this.pushString(string);
	      } else {
	        this.pushStackLiteral(string);
	      }
	    }
	  },

	  emptyHash: function() {
	    this.pushStackLiteral('{}');

	    if (this.options.stringParams) {
	      this.push('{}'); // hashContexts
	      this.push('{}'); // hashTypes
	    }
	  },
	  pushHash: function() {
	    if (this.hash) {
	      this.hashes.push(this.hash);
	    }
	    this.hash = {values: [], types: [], contexts: []};
	  },
	  popHash: function() {
	    var hash = this.hash;
	    this.hash = this.hashes.pop();

	    if (this.options.stringParams) {
	      this.push('{' + hash.contexts.join(',') + '}');
	      this.push('{' + hash.types.join(',') + '}');
	    }

	    this.push('{\n    ' + hash.values.join(',\n    ') + '\n  }');
	  },

	  // [pushString]
	  //
	  // On stack, before: ...
	  // On stack, after: quotedString(string), ...
	  //
	  // Push a quoted version of `string` onto the stack
	  pushString: function(string) {
	    this.pushStackLiteral(this.quotedString(string));
	  },

	  // [push]
	  //
	  // On stack, before: ...
	  // On stack, after: expr, ...
	  //
	  // Push an expression onto the stack
	  push: function(expr) {
	    this.inlineStack.push(expr);
	    return expr;
	  },

	  // [pushLiteral]
	  //
	  // On stack, before: ...
	  // On stack, after: value, ...
	  //
	  // Pushes a value onto the stack. This operation prevents
	  // the compiler from creating a temporary variable to hold
	  // it.
	  pushLiteral: function(value) {
	    this.pushStackLiteral(value);
	  },

	  // [pushProgram]
	  //
	  // On stack, before: ...
	  // On stack, after: program(guid), ...
	  //
	  // Push a program expression onto the stack. This takes
	  // a compile-time guid and converts it into a runtime-accessible
	  // expression.
	  pushProgram: function(guid) {
	    if (guid != null) {
	      this.pushStackLiteral(this.programExpression(guid));
	    } else {
	      this.pushStackLiteral(null);
	    }
	  },

	  // [invokeHelper]
	  //
	  // On stack, before: hash, inverse, program, params..., ...
	  // On stack, after: result of helper invocation
	  //
	  // Pops off the helper's parameters, invokes the helper,
	  // and pushes the helper's return value onto the stack.
	  //
	  // If the helper is not found, `helperMissing` is called.
	  invokeHelper: function(paramSize, name, isRoot) {
	    this.context.aliases.helperMissing = 'helpers.helperMissing';
	    this.useRegister('helper');

	    var helper = this.lastHelper = this.setupHelper(paramSize, name, true);
	    var nonHelper = this.nameLookup('depth' + this.lastContext, name, 'context');

	    var lookup = 'helper = ' + helper.name + ' || ' + nonHelper;
	    if (helper.paramsInit) {
	      lookup += ',' + helper.paramsInit;
	    }

	    this.push(
	      '('
	        + lookup
	        + ',helper '
	          + '? helper.call(' + helper.callParams + ') '
	          + ': helperMissing.call(' + helper.helperMissingParams + '))');

	    // Always flush subexpressions. This is both to prevent the compounding size issue that
	    // occurs when the code has to be duplicated for inlining and also to prevent errors
	    // due to the incorrect options object being passed due to the shared register.
	    if (!isRoot) {
	      this.flushInline();
	    }
	  },

	  // [invokeKnownHelper]
	  //
	  // On stack, before: hash, inverse, program, params..., ...
	  // On stack, after: result of helper invocation
	  //
	  // This operation is used when the helper is known to exist,
	  // so a `helperMissing` fallback is not required.
	  invokeKnownHelper: function(paramSize, name) {
	    var helper = this.setupHelper(paramSize, name);
	    this.push(helper.name + ".call(" + helper.callParams + ")");
	  },

	  // [invokeAmbiguous]
	  //
	  // On stack, before: hash, inverse, program, params..., ...
	  // On stack, after: result of disambiguation
	  //
	  // This operation is used when an expression like `{{foo}}`
	  // is provided, but we don't know at compile-time whether it
	  // is a helper or a path.
	  //
	  // This operation emits more code than the other options,
	  // and can be avoided by passing the `knownHelpers` and
	  // `knownHelpersOnly` flags at compile-time.
	  invokeAmbiguous: function(name, helperCall) {
	    this.context.aliases.functionType = '"function"';
	    this.useRegister('helper');

	    this.emptyHash();
	    var helper = this.setupHelper(0, name, helperCall);

	    var helperName = this.lastHelper = this.nameLookup('helpers', name, 'helper');

	    var nonHelper = this.nameLookup('depth' + this.lastContext, name, 'context');
	    var nextStack = this.nextStack();

	    if (helper.paramsInit) {
	      this.pushSource(helper.paramsInit);
	    }
	    this.pushSource('if (helper = ' + helperName + ') { ' + nextStack + ' = helper.call(' + helper.callParams + '); }');
	    this.pushSource('else { helper = ' + nonHelper + '; ' + nextStack + ' = typeof helper === functionType ? helper.call(' + helper.callParams + ') : helper; }');
	  },

	  // [invokePartial]
	  //
	  // On stack, before: context, ...
	  // On stack after: result of partial invocation
	  //
	  // This operation pops off a context, invokes a partial with that context,
	  // and pushes the result of the invocation back.
	  invokePartial: function(name) {
	    var params = [this.nameLookup('partials', name, 'partial'), "'" + name + "'", this.popStack(), "helpers", "partials"];

	    if (this.options.data) {
	      params.push("data");
	    }

	    this.context.aliases.self = "this";
	    this.push("self.invokePartial(" + params.join(", ") + ")");
	  },

	  // [assignToHash]
	  //
	  // On stack, before: value, hash, ...
	  // On stack, after: hash, ...
	  //
	  // Pops a value and hash off the stack, assigns `hash[key] = value`
	  // and pushes the hash back onto the stack.
	  assignToHash: function(key) {
	    var value = this.popStack(),
	        context,
	        type;

	    if (this.options.stringParams) {
	      type = this.popStack();
	      context = this.popStack();
	    }

	    var hash = this.hash;
	    if (context) {
	      hash.contexts.push("'" + key + "': " + context);
	    }
	    if (type) {
	      hash.types.push("'" + key + "': " + type);
	    }
	    hash.values.push("'" + key + "': (" + value + ")");
	  },

	  // HELPERS

	  compiler: JavaScriptCompiler,

	  compileChildren: function(environment, options) {
	    var children = environment.children, child, compiler;

	    for(var i=0, l=children.length; i<l; i++) {
	      child = children[i];
	      compiler = new this.compiler();

	      var index = this.matchExistingProgram(child);

	      if (index == null) {
	        this.context.programs.push('');     // Placeholder to prevent name conflicts for nested children
	        index = this.context.programs.length;
	        child.index = index;
	        child.name = 'program' + index;
	        this.context.programs[index] = compiler.compile(child, options, this.context);
	        this.context.environments[index] = child;
	      } else {
	        child.index = index;
	        child.name = 'program' + index;
	      }
	    }
	  },
	  matchExistingProgram: function(child) {
	    for (var i = 0, len = this.context.environments.length; i < len; i++) {
	      var environment = this.context.environments[i];
	      if (environment && environment.equals(child)) {
	        return i;
	      }
	    }
	  },

	  programExpression: function(guid) {
	    this.context.aliases.self = "this";

	    if(guid == null) {
	      return "self.noop";
	    }

	    var child = this.environment.children[guid],
	        depths = child.depths.list, depth;

	    var programParams = [child.index, child.name, "data"];

	    for(var i=0, l = depths.length; i<l; i++) {
	      depth = depths[i];

	      if(depth === 1) { programParams.push("depth0"); }
	      else { programParams.push("depth" + (depth - 1)); }
	    }

	    return (depths.length === 0 ? "self.program(" : "self.programWithDepth(") + programParams.join(", ") + ")";
	  },

	  register: function(name, val) {
	    this.useRegister(name);
	    this.pushSource(name + " = " + val + ";");
	  },

	  useRegister: function(name) {
	    if(!this.registers[name]) {
	      this.registers[name] = true;
	      this.registers.list.push(name);
	    }
	  },

	  pushStackLiteral: function(item) {
	    return this.push(new Literal(item));
	  },

	  pushSource: function(source) {
	    if (this.pendingContent) {
	      this.source.push(this.appendToBuffer(this.quotedString(this.pendingContent)));
	      this.pendingContent = undefined;
	    }

	    if (source) {
	      this.source.push(source);
	    }
	  },

	  pushStack: function(item) {
	    this.flushInline();

	    var stack = this.incrStack();
	    if (item) {
	      this.pushSource(stack + " = " + item + ";");
	    }
	    this.compileStack.push(stack);
	    return stack;
	  },

	  replaceStack: function(callback) {
	    var prefix = '',
	        inline = this.isInline(),
	        stack,
	        createdStack,
	        usedLiteral;

	    // If we are currently inline then we want to merge the inline statement into the
	    // replacement statement via ','
	    if (inline) {
	      var top = this.popStack(true);

	      if (top instanceof Literal) {
	        // Literals do not need to be inlined
	        stack = top.value;
	        usedLiteral = true;
	      } else {
	        // Get or create the current stack name for use by the inline
	        createdStack = !this.stackSlot;
	        var name = !createdStack ? this.topStackName() : this.incrStack();

	        prefix = '(' + this.push(name) + ' = ' + top + '),';
	        stack = this.topStack();
	      }
	    } else {
	      stack = this.topStack();
	    }

	    var item = callback.call(this, stack);

	    if (inline) {
	      if (!usedLiteral) {
	        this.popStack();
	      }
	      if (createdStack) {
	        this.stackSlot--;
	      }
	      this.push('(' + prefix + item + ')');
	    } else {
	      // Prevent modification of the context depth variable. Through replaceStack
	      if (!/^stack/.test(stack)) {
	        stack = this.nextStack();
	      }

	      this.pushSource(stack + " = (" + prefix + item + ");");
	    }
	    return stack;
	  },

	  nextStack: function() {
	    return this.pushStack();
	  },

	  incrStack: function() {
	    this.stackSlot++;
	    if(this.stackSlot > this.stackVars.length) { this.stackVars.push("stack" + this.stackSlot); }
	    return this.topStackName();
	  },
	  topStackName: function() {
	    return "stack" + this.stackSlot;
	  },
	  flushInline: function() {
	    var inlineStack = this.inlineStack;
	    if (inlineStack.length) {
	      this.inlineStack = [];
	      for (var i = 0, len = inlineStack.length; i < len; i++) {
	        var entry = inlineStack[i];
	        if (entry instanceof Literal) {
	          this.compileStack.push(entry);
	        } else {
	          this.pushStack(entry);
	        }
	      }
	    }
	  },
	  isInline: function() {
	    return this.inlineStack.length;
	  },

	  popStack: function(wrapped) {
	    var inline = this.isInline(),
	        item = (inline ? this.inlineStack : this.compileStack).pop();

	    if (!wrapped && (item instanceof Literal)) {
	      return item.value;
	    } else {
	      if (!inline) {
	        if (!this.stackSlot) {
	          throw new Exception('Invalid stack pop');
	        }
	        this.stackSlot--;
	      }
	      return item;
	    }
	  },

	  topStack: function(wrapped) {
	    var stack = (this.isInline() ? this.inlineStack : this.compileStack),
	        item = stack[stack.length - 1];

	    if (!wrapped && (item instanceof Literal)) {
	      return item.value;
	    } else {
	      return item;
	    }
	  },

	  quotedString: function(str) {
	    return '"' + str
	      .replace(/\\/g, '\\\\')
	      .replace(/"/g, '\\"')
	      .replace(/\n/g, '\\n')
	      .replace(/\r/g, '\\r')
	      .replace(/\u2028/g, '\\u2028')   // Per Ecma-262 7.3 + 7.8.4
	      .replace(/\u2029/g, '\\u2029') + '"';
	  },

	  setupHelper: function(paramSize, name, missingParams) {
	    var params = [],
	        paramsInit = this.setupParams(paramSize, params, missingParams);
	    var foundHelper = this.nameLookup('helpers', name, 'helper');

	    return {
	      params: params,
	      paramsInit: paramsInit,
	      name: foundHelper,
	      callParams: ["depth0"].concat(params).join(", "),
	      helperMissingParams: missingParams && ["depth0", this.quotedString(name)].concat(params).join(", ")
	    };
	  },

	  setupOptions: function(paramSize, params) {
	    var options = [], contexts = [], types = [], param, inverse, program;

	    options.push("hash:" + this.popStack());

	    if (this.options.stringParams) {
	      options.push("hashTypes:" + this.popStack());
	      options.push("hashContexts:" + this.popStack());
	    }

	    inverse = this.popStack();
	    program = this.popStack();

	    // Avoid setting fn and inverse if neither are set. This allows
	    // helpers to do a check for `if (options.fn)`
	    if (program || inverse) {
	      if (!program) {
	        this.context.aliases.self = "this";
	        program = "self.noop";
	      }

	      if (!inverse) {
	        this.context.aliases.self = "this";
	        inverse = "self.noop";
	      }

	      options.push("inverse:" + inverse);
	      options.push("fn:" + program);
	    }

	    for(var i=0; i<paramSize; i++) {
	      param = this.popStack();
	      params.push(param);

	      if(this.options.stringParams) {
	        types.push(this.popStack());
	        contexts.push(this.popStack());
	      }
	    }

	    if (this.options.stringParams) {
	      options.push("contexts:[" + contexts.join(",") + "]");
	      options.push("types:[" + types.join(",") + "]");
	    }

	    if(this.options.data) {
	      options.push("data:data");
	    }

	    return options;
	  },

	  // the params and contexts arguments are passed in arrays
	  // to fill in
	  setupParams: function(paramSize, params, useRegister) {
	    var options = '{' + this.setupOptions(paramSize, params).join(',') + '}';

	    if (useRegister) {
	      this.useRegister('options');
	      params.push('options');
	      return 'options=' + options;
	    } else {
	      params.push(options);
	      return '';
	    }
	  }
	};

	var reservedWords = (
	  "break else new var" +
	  " case finally return void" +
	  " catch for switch while" +
	  " continue function this with" +
	  " default if throw" +
	  " delete in try" +
	  " do instanceof typeof" +
	  " abstract enum int short" +
	  " boolean export interface static" +
	  " byte extends long super" +
	  " char final native synchronized" +
	  " class float package throws" +
	  " const goto private transient" +
	  " debugger implements protected volatile" +
	  " double import public let yield"
	).split(" ");

	var compilerWords = JavaScriptCompiler.RESERVED_WORDS = {};

	for(var i=0, l=reservedWords.length; i<l; i++) {
	  compilerWords[reservedWords[i]] = true;
	}

	JavaScriptCompiler.isValidJavaScriptVariableName = function(name) {
	  if(!JavaScriptCompiler.RESERVED_WORDS[name] && /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(name)) {
	    return true;
	  }
	  return false;
	};

	exports["default"] = JavaScriptCompiler;

/***/ },
/* 94 */
/***/ function(module, exports) {

	"use strict";
	/* jshint ignore:start */
	/* Jison generated parser */
	var handlebars = (function(){
	var parser = {trace: function trace() { },
	yy: {},
	symbols_: {"error":2,"root":3,"statements":4,"EOF":5,"program":6,"simpleInverse":7,"statement":8,"openInverse":9,"closeBlock":10,"openBlock":11,"mustache":12,"partial":13,"CONTENT":14,"COMMENT":15,"OPEN_BLOCK":16,"sexpr":17,"CLOSE":18,"OPEN_INVERSE":19,"OPEN_ENDBLOCK":20,"path":21,"OPEN":22,"OPEN_UNESCAPED":23,"CLOSE_UNESCAPED":24,"OPEN_PARTIAL":25,"partialName":26,"partial_option0":27,"sexpr_repetition0":28,"sexpr_option0":29,"dataName":30,"param":31,"STRING":32,"INTEGER":33,"BOOLEAN":34,"OPEN_SEXPR":35,"CLOSE_SEXPR":36,"hash":37,"hash_repetition_plus0":38,"hashSegment":39,"ID":40,"EQUALS":41,"DATA":42,"pathSegments":43,"SEP":44,"$accept":0,"$end":1},
	terminals_: {2:"error",5:"EOF",14:"CONTENT",15:"COMMENT",16:"OPEN_BLOCK",18:"CLOSE",19:"OPEN_INVERSE",20:"OPEN_ENDBLOCK",22:"OPEN",23:"OPEN_UNESCAPED",24:"CLOSE_UNESCAPED",25:"OPEN_PARTIAL",32:"STRING",33:"INTEGER",34:"BOOLEAN",35:"OPEN_SEXPR",36:"CLOSE_SEXPR",40:"ID",41:"EQUALS",42:"DATA",44:"SEP"},
	productions_: [0,[3,2],[3,1],[6,2],[6,3],[6,2],[6,1],[6,1],[6,0],[4,1],[4,2],[8,3],[8,3],[8,1],[8,1],[8,1],[8,1],[11,3],[9,3],[10,3],[12,3],[12,3],[13,4],[7,2],[17,3],[17,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,3],[37,1],[39,3],[26,1],[26,1],[26,1],[30,2],[21,1],[43,3],[43,1],[27,0],[27,1],[28,0],[28,2],[29,0],[29,1],[38,1],[38,2]],
	performAction: function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$) {

	var $0 = $$.length - 1;
	switch (yystate) {
	case 1: return new yy.ProgramNode($$[$0-1], this._$); 
	break;
	case 2: return new yy.ProgramNode([], this._$); 
	break;
	case 3:this.$ = new yy.ProgramNode([], $$[$0-1], $$[$0], this._$);
	break;
	case 4:this.$ = new yy.ProgramNode($$[$0-2], $$[$0-1], $$[$0], this._$);
	break;
	case 5:this.$ = new yy.ProgramNode($$[$0-1], $$[$0], [], this._$);
	break;
	case 6:this.$ = new yy.ProgramNode($$[$0], this._$);
	break;
	case 7:this.$ = new yy.ProgramNode([], this._$);
	break;
	case 8:this.$ = new yy.ProgramNode([], this._$);
	break;
	case 9:this.$ = [$$[$0]];
	break;
	case 10: $$[$0-1].push($$[$0]); this.$ = $$[$0-1]; 
	break;
	case 11:this.$ = new yy.BlockNode($$[$0-2], $$[$0-1].inverse, $$[$0-1], $$[$0], this._$);
	break;
	case 12:this.$ = new yy.BlockNode($$[$0-2], $$[$0-1], $$[$0-1].inverse, $$[$0], this._$);
	break;
	case 13:this.$ = $$[$0];
	break;
	case 14:this.$ = $$[$0];
	break;
	case 15:this.$ = new yy.ContentNode($$[$0], this._$);
	break;
	case 16:this.$ = new yy.CommentNode($$[$0], this._$);
	break;
	case 17:this.$ = new yy.MustacheNode($$[$0-1], null, $$[$0-2], stripFlags($$[$0-2], $$[$0]), this._$);
	break;
	case 18:this.$ = new yy.MustacheNode($$[$0-1], null, $$[$0-2], stripFlags($$[$0-2], $$[$0]), this._$);
	break;
	case 19:this.$ = {path: $$[$0-1], strip: stripFlags($$[$0-2], $$[$0])};
	break;
	case 20:this.$ = new yy.MustacheNode($$[$0-1], null, $$[$0-2], stripFlags($$[$0-2], $$[$0]), this._$);
	break;
	case 21:this.$ = new yy.MustacheNode($$[$0-1], null, $$[$0-2], stripFlags($$[$0-2], $$[$0]), this._$);
	break;
	case 22:this.$ = new yy.PartialNode($$[$0-2], $$[$0-1], stripFlags($$[$0-3], $$[$0]), this._$);
	break;
	case 23:this.$ = stripFlags($$[$0-1], $$[$0]);
	break;
	case 24:this.$ = new yy.SexprNode([$$[$0-2]].concat($$[$0-1]), $$[$0], this._$);
	break;
	case 25:this.$ = new yy.SexprNode([$$[$0]], null, this._$);
	break;
	case 26:this.$ = $$[$0];
	break;
	case 27:this.$ = new yy.StringNode($$[$0], this._$);
	break;
	case 28:this.$ = new yy.IntegerNode($$[$0], this._$);
	break;
	case 29:this.$ = new yy.BooleanNode($$[$0], this._$);
	break;
	case 30:this.$ = $$[$0];
	break;
	case 31:$$[$0-1].isHelper = true; this.$ = $$[$0-1];
	break;
	case 32:this.$ = new yy.HashNode($$[$0], this._$);
	break;
	case 33:this.$ = [$$[$0-2], $$[$0]];
	break;
	case 34:this.$ = new yy.PartialNameNode($$[$0], this._$);
	break;
	case 35:this.$ = new yy.PartialNameNode(new yy.StringNode($$[$0], this._$), this._$);
	break;
	case 36:this.$ = new yy.PartialNameNode(new yy.IntegerNode($$[$0], this._$));
	break;
	case 37:this.$ = new yy.DataNode($$[$0], this._$);
	break;
	case 38:this.$ = new yy.IdNode($$[$0], this._$);
	break;
	case 39: $$[$0-2].push({part: $$[$0], separator: $$[$0-1]}); this.$ = $$[$0-2]; 
	break;
	case 40:this.$ = [{part: $$[$0]}];
	break;
	case 43:this.$ = [];
	break;
	case 44:$$[$0-1].push($$[$0]);
	break;
	case 47:this.$ = [$$[$0]];
	break;
	case 48:$$[$0-1].push($$[$0]);
	break;
	}
	},
	table: [{3:1,4:2,5:[1,3],8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],22:[1,13],23:[1,14],25:[1,15]},{1:[3]},{5:[1,16],8:17,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],22:[1,13],23:[1,14],25:[1,15]},{1:[2,2]},{5:[2,9],14:[2,9],15:[2,9],16:[2,9],19:[2,9],20:[2,9],22:[2,9],23:[2,9],25:[2,9]},{4:20,6:18,7:19,8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,21],20:[2,8],22:[1,13],23:[1,14],25:[1,15]},{4:20,6:22,7:19,8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,21],20:[2,8],22:[1,13],23:[1,14],25:[1,15]},{5:[2,13],14:[2,13],15:[2,13],16:[2,13],19:[2,13],20:[2,13],22:[2,13],23:[2,13],25:[2,13]},{5:[2,14],14:[2,14],15:[2,14],16:[2,14],19:[2,14],20:[2,14],22:[2,14],23:[2,14],25:[2,14]},{5:[2,15],14:[2,15],15:[2,15],16:[2,15],19:[2,15],20:[2,15],22:[2,15],23:[2,15],25:[2,15]},{5:[2,16],14:[2,16],15:[2,16],16:[2,16],19:[2,16],20:[2,16],22:[2,16],23:[2,16],25:[2,16]},{17:23,21:24,30:25,40:[1,28],42:[1,27],43:26},{17:29,21:24,30:25,40:[1,28],42:[1,27],43:26},{17:30,21:24,30:25,40:[1,28],42:[1,27],43:26},{17:31,21:24,30:25,40:[1,28],42:[1,27],43:26},{21:33,26:32,32:[1,34],33:[1,35],40:[1,28],43:26},{1:[2,1]},{5:[2,10],14:[2,10],15:[2,10],16:[2,10],19:[2,10],20:[2,10],22:[2,10],23:[2,10],25:[2,10]},{10:36,20:[1,37]},{4:38,8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],20:[2,7],22:[1,13],23:[1,14],25:[1,15]},{7:39,8:17,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,21],20:[2,6],22:[1,13],23:[1,14],25:[1,15]},{17:23,18:[1,40],21:24,30:25,40:[1,28],42:[1,27],43:26},{10:41,20:[1,37]},{18:[1,42]},{18:[2,43],24:[2,43],28:43,32:[2,43],33:[2,43],34:[2,43],35:[2,43],36:[2,43],40:[2,43],42:[2,43]},{18:[2,25],24:[2,25],36:[2,25]},{18:[2,38],24:[2,38],32:[2,38],33:[2,38],34:[2,38],35:[2,38],36:[2,38],40:[2,38],42:[2,38],44:[1,44]},{21:45,40:[1,28],43:26},{18:[2,40],24:[2,40],32:[2,40],33:[2,40],34:[2,40],35:[2,40],36:[2,40],40:[2,40],42:[2,40],44:[2,40]},{18:[1,46]},{18:[1,47]},{24:[1,48]},{18:[2,41],21:50,27:49,40:[1,28],43:26},{18:[2,34],40:[2,34]},{18:[2,35],40:[2,35]},{18:[2,36],40:[2,36]},{5:[2,11],14:[2,11],15:[2,11],16:[2,11],19:[2,11],20:[2,11],22:[2,11],23:[2,11],25:[2,11]},{21:51,40:[1,28],43:26},{8:17,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],20:[2,3],22:[1,13],23:[1,14],25:[1,15]},{4:52,8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],20:[2,5],22:[1,13],23:[1,14],25:[1,15]},{14:[2,23],15:[2,23],16:[2,23],19:[2,23],20:[2,23],22:[2,23],23:[2,23],25:[2,23]},{5:[2,12],14:[2,12],15:[2,12],16:[2,12],19:[2,12],20:[2,12],22:[2,12],23:[2,12],25:[2,12]},{14:[2,18],15:[2,18],16:[2,18],19:[2,18],20:[2,18],22:[2,18],23:[2,18],25:[2,18]},{18:[2,45],21:56,24:[2,45],29:53,30:60,31:54,32:[1,57],33:[1,58],34:[1,59],35:[1,61],36:[2,45],37:55,38:62,39:63,40:[1,64],42:[1,27],43:26},{40:[1,65]},{18:[2,37],24:[2,37],32:[2,37],33:[2,37],34:[2,37],35:[2,37],36:[2,37],40:[2,37],42:[2,37]},{14:[2,17],15:[2,17],16:[2,17],19:[2,17],20:[2,17],22:[2,17],23:[2,17],25:[2,17]},{5:[2,20],14:[2,20],15:[2,20],16:[2,20],19:[2,20],20:[2,20],22:[2,20],23:[2,20],25:[2,20]},{5:[2,21],14:[2,21],15:[2,21],16:[2,21],19:[2,21],20:[2,21],22:[2,21],23:[2,21],25:[2,21]},{18:[1,66]},{18:[2,42]},{18:[1,67]},{8:17,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],20:[2,4],22:[1,13],23:[1,14],25:[1,15]},{18:[2,24],24:[2,24],36:[2,24]},{18:[2,44],24:[2,44],32:[2,44],33:[2,44],34:[2,44],35:[2,44],36:[2,44],40:[2,44],42:[2,44]},{18:[2,46],24:[2,46],36:[2,46]},{18:[2,26],24:[2,26],32:[2,26],33:[2,26],34:[2,26],35:[2,26],36:[2,26],40:[2,26],42:[2,26]},{18:[2,27],24:[2,27],32:[2,27],33:[2,27],34:[2,27],35:[2,27],36:[2,27],40:[2,27],42:[2,27]},{18:[2,28],24:[2,28],32:[2,28],33:[2,28],34:[2,28],35:[2,28],36:[2,28],40:[2,28],42:[2,28]},{18:[2,29],24:[2,29],32:[2,29],33:[2,29],34:[2,29],35:[2,29],36:[2,29],40:[2,29],42:[2,29]},{18:[2,30],24:[2,30],32:[2,30],33:[2,30],34:[2,30],35:[2,30],36:[2,30],40:[2,30],42:[2,30]},{17:68,21:24,30:25,40:[1,28],42:[1,27],43:26},{18:[2,32],24:[2,32],36:[2,32],39:69,40:[1,70]},{18:[2,47],24:[2,47],36:[2,47],40:[2,47]},{18:[2,40],24:[2,40],32:[2,40],33:[2,40],34:[2,40],35:[2,40],36:[2,40],40:[2,40],41:[1,71],42:[2,40],44:[2,40]},{18:[2,39],24:[2,39],32:[2,39],33:[2,39],34:[2,39],35:[2,39],36:[2,39],40:[2,39],42:[2,39],44:[2,39]},{5:[2,22],14:[2,22],15:[2,22],16:[2,22],19:[2,22],20:[2,22],22:[2,22],23:[2,22],25:[2,22]},{5:[2,19],14:[2,19],15:[2,19],16:[2,19],19:[2,19],20:[2,19],22:[2,19],23:[2,19],25:[2,19]},{36:[1,72]},{18:[2,48],24:[2,48],36:[2,48],40:[2,48]},{41:[1,71]},{21:56,30:60,31:73,32:[1,57],33:[1,58],34:[1,59],35:[1,61],40:[1,28],42:[1,27],43:26},{18:[2,31],24:[2,31],32:[2,31],33:[2,31],34:[2,31],35:[2,31],36:[2,31],40:[2,31],42:[2,31]},{18:[2,33],24:[2,33],36:[2,33],40:[2,33]}],
	defaultActions: {3:[2,2],16:[2,1],50:[2,42]},
	parseError: function parseError(str, hash) {
	    throw new Error(str);
	},
	parse: function parse(input) {
	    var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = "", yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
	    this.lexer.setInput(input);
	    this.lexer.yy = this.yy;
	    this.yy.lexer = this.lexer;
	    this.yy.parser = this;
	    if (typeof this.lexer.yylloc == "undefined")
	        this.lexer.yylloc = {};
	    var yyloc = this.lexer.yylloc;
	    lstack.push(yyloc);
	    var ranges = this.lexer.options && this.lexer.options.ranges;
	    if (typeof this.yy.parseError === "function")
	        this.parseError = this.yy.parseError;
	    function popStack(n) {
	        stack.length = stack.length - 2 * n;
	        vstack.length = vstack.length - n;
	        lstack.length = lstack.length - n;
	    }
	    function lex() {
	        var token;
	        token = self.lexer.lex() || 1;
	        if (typeof token !== "number") {
	            token = self.symbols_[token] || token;
	        }
	        return token;
	    }
	    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
	    while (true) {
	        state = stack[stack.length - 1];
	        if (this.defaultActions[state]) {
	            action = this.defaultActions[state];
	        } else {
	            if (symbol === null || typeof symbol == "undefined") {
	                symbol = lex();
	            }
	            action = table[state] && table[state][symbol];
	        }
	        if (typeof action === "undefined" || !action.length || !action[0]) {
	            var errStr = "";
	            if (!recovering) {
	                expected = [];
	                for (p in table[state])
	                    if (this.terminals_[p] && p > 2) {
	                        expected.push("'" + this.terminals_[p] + "'");
	                    }
	                if (this.lexer.showPosition) {
	                    errStr = "Parse error on line " + (yylineno + 1) + ":\n" + this.lexer.showPosition() + "\nExpecting " + expected.join(", ") + ", got '" + (this.terminals_[symbol] || symbol) + "'";
	                } else {
	                    errStr = "Parse error on line " + (yylineno + 1) + ": Unexpected " + (symbol == 1?"end of input":"'" + (this.terminals_[symbol] || symbol) + "'");
	                }
	                this.parseError(errStr, {text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected});
	            }
	        }
	        if (action[0] instanceof Array && action.length > 1) {
	            throw new Error("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol);
	        }
	        switch (action[0]) {
	        case 1:
	            stack.push(symbol);
	            vstack.push(this.lexer.yytext);
	            lstack.push(this.lexer.yylloc);
	            stack.push(action[1]);
	            symbol = null;
	            if (!preErrorSymbol) {
	                yyleng = this.lexer.yyleng;
	                yytext = this.lexer.yytext;
	                yylineno = this.lexer.yylineno;
	                yyloc = this.lexer.yylloc;
	                if (recovering > 0)
	                    recovering--;
	            } else {
	                symbol = preErrorSymbol;
	                preErrorSymbol = null;
	            }
	            break;
	        case 2:
	            len = this.productions_[action[1]][1];
	            yyval.$ = vstack[vstack.length - len];
	            yyval._$ = {first_line: lstack[lstack.length - (len || 1)].first_line, last_line: lstack[lstack.length - 1].last_line, first_column: lstack[lstack.length - (len || 1)].first_column, last_column: lstack[lstack.length - 1].last_column};
	            if (ranges) {
	                yyval._$.range = [lstack[lstack.length - (len || 1)].range[0], lstack[lstack.length - 1].range[1]];
	            }
	            r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);
	            if (typeof r !== "undefined") {
	                return r;
	            }
	            if (len) {
	                stack = stack.slice(0, -1 * len * 2);
	                vstack = vstack.slice(0, -1 * len);
	                lstack = lstack.slice(0, -1 * len);
	            }
	            stack.push(this.productions_[action[1]][0]);
	            vstack.push(yyval.$);
	            lstack.push(yyval._$);
	            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
	            stack.push(newState);
	            break;
	        case 3:
	            return true;
	        }
	    }
	    return true;
	}
	};


	function stripFlags(open, close) {
	  return {
	    left: open.charAt(2) === '~',
	    right: close.charAt(0) === '~' || close.charAt(1) === '~'
	  };
	}

	/* Jison generated lexer */
	var lexer = (function(){
	var lexer = ({EOF:1,
	parseError:function parseError(str, hash) {
	        if (this.yy.parser) {
	            this.yy.parser.parseError(str, hash);
	        } else {
	            throw new Error(str);
	        }
	    },
	setInput:function (input) {
	        this._input = input;
	        this._more = this._less = this.done = false;
	        this.yylineno = this.yyleng = 0;
	        this.yytext = this.matched = this.match = '';
	        this.conditionStack = ['INITIAL'];
	        this.yylloc = {first_line:1,first_column:0,last_line:1,last_column:0};
	        if (this.options.ranges) this.yylloc.range = [0,0];
	        this.offset = 0;
	        return this;
	    },
	input:function () {
	        var ch = this._input[0];
	        this.yytext += ch;
	        this.yyleng++;
	        this.offset++;
	        this.match += ch;
	        this.matched += ch;
	        var lines = ch.match(/(?:\r\n?|\n).*/g);
	        if (lines) {
	            this.yylineno++;
	            this.yylloc.last_line++;
	        } else {
	            this.yylloc.last_column++;
	        }
	        if (this.options.ranges) this.yylloc.range[1]++;

	        this._input = this._input.slice(1);
	        return ch;
	    },
	unput:function (ch) {
	        var len = ch.length;
	        var lines = ch.split(/(?:\r\n?|\n)/g);

	        this._input = ch + this._input;
	        this.yytext = this.yytext.substr(0, this.yytext.length-len-1);
	        //this.yyleng -= len;
	        this.offset -= len;
	        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
	        this.match = this.match.substr(0, this.match.length-1);
	        this.matched = this.matched.substr(0, this.matched.length-1);

	        if (lines.length-1) this.yylineno -= lines.length-1;
	        var r = this.yylloc.range;

	        this.yylloc = {first_line: this.yylloc.first_line,
	          last_line: this.yylineno+1,
	          first_column: this.yylloc.first_column,
	          last_column: lines ?
	              (lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length:
	              this.yylloc.first_column - len
	          };

	        if (this.options.ranges) {
	            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
	        }
	        return this;
	    },
	more:function () {
	        this._more = true;
	        return this;
	    },
	less:function (n) {
	        this.unput(this.match.slice(n));
	    },
	pastInput:function () {
	        var past = this.matched.substr(0, this.matched.length - this.match.length);
	        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
	    },
	upcomingInput:function () {
	        var next = this.match;
	        if (next.length < 20) {
	            next += this._input.substr(0, 20-next.length);
	        }
	        return (next.substr(0,20)+(next.length > 20 ? '...':'')).replace(/\n/g, "");
	    },
	showPosition:function () {
	        var pre = this.pastInput();
	        var c = new Array(pre.length + 1).join("-");
	        return pre + this.upcomingInput() + "\n" + c+"^";
	    },
	next:function () {
	        if (this.done) {
	            return this.EOF;
	        }
	        if (!this._input) this.done = true;

	        var token,
	            match,
	            tempMatch,
	            index,
	            col,
	            lines;
	        if (!this._more) {
	            this.yytext = '';
	            this.match = '';
	        }
	        var rules = this._currentRules();
	        for (var i=0;i < rules.length; i++) {
	            tempMatch = this._input.match(this.rules[rules[i]]);
	            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
	                match = tempMatch;
	                index = i;
	                if (!this.options.flex) break;
	            }
	        }
	        if (match) {
	            lines = match[0].match(/(?:\r\n?|\n).*/g);
	            if (lines) this.yylineno += lines.length;
	            this.yylloc = {first_line: this.yylloc.last_line,
	                           last_line: this.yylineno+1,
	                           first_column: this.yylloc.last_column,
	                           last_column: lines ? lines[lines.length-1].length-lines[lines.length-1].match(/\r?\n?/)[0].length : this.yylloc.last_column + match[0].length};
	            this.yytext += match[0];
	            this.match += match[0];
	            this.matches = match;
	            this.yyleng = this.yytext.length;
	            if (this.options.ranges) {
	                this.yylloc.range = [this.offset, this.offset += this.yyleng];
	            }
	            this._more = false;
	            this._input = this._input.slice(match[0].length);
	            this.matched += match[0];
	            token = this.performAction.call(this, this.yy, this, rules[index],this.conditionStack[this.conditionStack.length-1]);
	            if (this.done && this._input) this.done = false;
	            if (token) return token;
	            else return;
	        }
	        if (this._input === "") {
	            return this.EOF;
	        } else {
	            return this.parseError('Lexical error on line '+(this.yylineno+1)+'. Unrecognized text.\n'+this.showPosition(),
	                    {text: "", token: null, line: this.yylineno});
	        }
	    },
	lex:function lex() {
	        var r = this.next();
	        if (typeof r !== 'undefined') {
	            return r;
	        } else {
	            return this.lex();
	        }
	    },
	begin:function begin(condition) {
	        this.conditionStack.push(condition);
	    },
	popState:function popState() {
	        return this.conditionStack.pop();
	    },
	_currentRules:function _currentRules() {
	        return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules;
	    },
	topState:function () {
	        return this.conditionStack[this.conditionStack.length-2];
	    },
	pushState:function begin(condition) {
	        this.begin(condition);
	    }});
	lexer.options = {};
	lexer.performAction = function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {


	function strip(start, end) {
	  return yy_.yytext = yy_.yytext.substr(start, yy_.yyleng-end);
	}


	var YYSTATE=YY_START
	switch($avoiding_name_collisions) {
	case 0:
	                                   if(yy_.yytext.slice(-2) === "\\\\") {
	                                     strip(0,1);
	                                     this.begin("mu");
	                                   } else if(yy_.yytext.slice(-1) === "\\") {
	                                     strip(0,1);
	                                     this.begin("emu");
	                                   } else {
	                                     this.begin("mu");
	                                   }
	                                   if(yy_.yytext) return 14;
	                                 
	break;
	case 1:return 14;
	break;
	case 2:
	                                   this.popState();
	                                   return 14;
	                                 
	break;
	case 3:strip(0,4); this.popState(); return 15;
	break;
	case 4:return 35;
	break;
	case 5:return 36;
	break;
	case 6:return 25;
	break;
	case 7:return 16;
	break;
	case 8:return 20;
	break;
	case 9:return 19;
	break;
	case 10:return 19;
	break;
	case 11:return 23;
	break;
	case 12:return 22;
	break;
	case 13:this.popState(); this.begin('com');
	break;
	case 14:strip(3,5); this.popState(); return 15;
	break;
	case 15:return 22;
	break;
	case 16:return 41;
	break;
	case 17:return 40;
	break;
	case 18:return 40;
	break;
	case 19:return 44;
	break;
	case 20:// ignore whitespace
	break;
	case 21:this.popState(); return 24;
	break;
	case 22:this.popState(); return 18;
	break;
	case 23:yy_.yytext = strip(1,2).replace(/\\"/g,'"'); return 32;
	break;
	case 24:yy_.yytext = strip(1,2).replace(/\\'/g,"'"); return 32;
	break;
	case 25:return 42;
	break;
	case 26:return 34;
	break;
	case 27:return 34;
	break;
	case 28:return 33;
	break;
	case 29:return 40;
	break;
	case 30:yy_.yytext = strip(1,2); return 40;
	break;
	case 31:return 'INVALID';
	break;
	case 32:return 5;
	break;
	}
	};
	lexer.rules = [/^(?:[^\x00]*?(?=(\{\{)))/,/^(?:[^\x00]+)/,/^(?:[^\x00]{2,}?(?=(\{\{|\\\{\{|\\\\\{\{|$)))/,/^(?:[\s\S]*?--\}\})/,/^(?:\()/,/^(?:\))/,/^(?:\{\{(~)?>)/,/^(?:\{\{(~)?#)/,/^(?:\{\{(~)?\/)/,/^(?:\{\{(~)?\^)/,/^(?:\{\{(~)?\s*else\b)/,/^(?:\{\{(~)?\{)/,/^(?:\{\{(~)?&)/,/^(?:\{\{!--)/,/^(?:\{\{![\s\S]*?\}\})/,/^(?:\{\{(~)?)/,/^(?:=)/,/^(?:\.\.)/,/^(?:\.(?=([=~}\s\/.)])))/,/^(?:[\/.])/,/^(?:\s+)/,/^(?:\}(~)?\}\})/,/^(?:(~)?\}\})/,/^(?:"(\\["]|[^"])*")/,/^(?:'(\\[']|[^'])*')/,/^(?:@)/,/^(?:true(?=([~}\s)])))/,/^(?:false(?=([~}\s)])))/,/^(?:-?[0-9]+(?=([~}\s)])))/,/^(?:([^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=([=~}\s\/.)]))))/,/^(?:\[[^\]]*\])/,/^(?:.)/,/^(?:$)/];
	lexer.conditions = {"mu":{"rules":[4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32],"inclusive":false},"emu":{"rules":[2],"inclusive":false},"com":{"rules":[3],"inclusive":false},"INITIAL":{"rules":[0,1,32],"inclusive":true}};
	return lexer;})()
	parser.lexer = lexer;
	function Parser () { this.yy = {}; }Parser.prototype = parser;parser.Parser = Parser;
	return new Parser;
	})();exports["default"] = handlebars;
	/* jshint ignore:end */

/***/ },
/* 95 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Utils = __webpack_require__(18);
	var Exception = __webpack_require__(4)["default"];
	var COMPILER_REVISION = __webpack_require__(3).COMPILER_REVISION;
	var REVISION_CHANGES = __webpack_require__(3).REVISION_CHANGES;

	function checkRevision(compilerInfo) {
	  var compilerRevision = compilerInfo && compilerInfo[0] || 1,
	      currentRevision = COMPILER_REVISION;

	  if (compilerRevision !== currentRevision) {
	    if (compilerRevision < currentRevision) {
	      var runtimeVersions = REVISION_CHANGES[currentRevision],
	          compilerVersions = REVISION_CHANGES[compilerRevision];
	      throw new Exception("Template was precompiled with an older version of Handlebars than the current runtime. "+
	            "Please update your precompiler to a newer version ("+runtimeVersions+") or downgrade your runtime to an older version ("+compilerVersions+").");
	    } else {
	      // Use the embedded version info since the runtime doesn't know about this revision yet
	      throw new Exception("Template was precompiled with a newer version of Handlebars than the current runtime. "+
	            "Please update your runtime to a newer version ("+compilerInfo[1]+").");
	    }
	  }
	}

	exports.checkRevision = checkRevision;// TODO: Remove this line and break up compilePartial

	function template(templateSpec, env) {
	  if (!env) {
	    throw new Exception("No environment passed to template");
	  }

	  // Note: Using env.VM references rather than local var references throughout this section to allow
	  // for external users to override these as psuedo-supported APIs.
	  var invokePartialWrapper = function(partial, name, context, helpers, partials, data) {
	    var result = env.VM.invokePartial.apply(this, arguments);
	    if (result != null) { return result; }

	    if (env.compile) {
	      var options = { helpers: helpers, partials: partials, data: data };
	      partials[name] = env.compile(partial, { data: data !== undefined }, env);
	      return partials[name](context, options);
	    } else {
	      throw new Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
	    }
	  };

	  // Just add water
	  var container = {
	    escapeExpression: Utils.escapeExpression,
	    invokePartial: invokePartialWrapper,
	    programs: [],
	    program: function(i, fn, data) {
	      var programWrapper = this.programs[i];
	      if(data) {
	        programWrapper = program(i, fn, data);
	      } else if (!programWrapper) {
	        programWrapper = this.programs[i] = program(i, fn);
	      }
	      return programWrapper;
	    },
	    merge: function(param, common) {
	      var ret = param || common;

	      if (param && common && (param !== common)) {
	        ret = {};
	        Utils.extend(ret, common);
	        Utils.extend(ret, param);
	      }
	      return ret;
	    },
	    programWithDepth: env.VM.programWithDepth,
	    noop: env.VM.noop,
	    compilerInfo: null
	  };

	  return function(context, options) {
	    options = options || {};
	    var namespace = options.partial ? options : env,
	        helpers,
	        partials;

	    if (!options.partial) {
	      helpers = options.helpers;
	      partials = options.partials;
	    }
	    var result = templateSpec.call(
	          container,
	          namespace, context,
	          helpers,
	          partials,
	          options.data);

	    if (!options.partial) {
	      env.VM.checkRevision(container.compilerInfo);
	    }

	    return result;
	  };
	}

	exports.template = template;function programWithDepth(i, fn, data /*, $depth */) {
	  var args = Array.prototype.slice.call(arguments, 3);

	  var prog = function(context, options) {
	    options = options || {};

	    return fn.apply(this, [context, options.data || data].concat(args));
	  };
	  prog.program = i;
	  prog.depth = args.length;
	  return prog;
	}

	exports.programWithDepth = programWithDepth;function program(i, fn, data) {
	  var prog = function(context, options) {
	    options = options || {};

	    return fn(context, options.data || data);
	  };
	  prog.program = i;
	  prog.depth = 0;
	  return prog;
	}

	exports.program = program;function invokePartial(partial, name, context, helpers, partials, data) {
	  var options = { partial: true, helpers: helpers, partials: partials, data: data };

	  if(partial === undefined) {
	    throw new Exception("The partial " + name + " could not be found");
	  } else if(partial instanceof Function) {
	    return partial(context, options);
	  }
	}

	exports.invokePartial = invokePartial;function noop() { return ""; }

	exports.noop = noop;

/***/ },
/* 96 */
/***/ function(module, exports) {

	/**
	 * The Sea.js plugin for embedding style text in JavaScript code
	 */


	var RE_NON_WORD = /\W/g;
	var doc = document;
	var head = document.getElementsByTagName('head')[0] ||
	    document.documentElement;
	var styleNode;

	module.exports = importStyle;

	function importStyle(cssText, id) {
	  if (id) {
	    // Convert id to valid string
	    id = id.replace(RE_NON_WORD, '-');

	    // Don't add multiple times
	    if (doc.getElementById(id)) return;
	  }

	  var element;

	  // Don't share styleNode when id is spectied
	  if (!styleNode || id) {
	    element = doc.createElement('style');
	    id && (element.id = id);

	    // Adds to DOM first to avoid the css hack invalid
	    head.appendChild(element);
	  } else {
	    element = styleNode;
	  }

	  // IE
	  if (element.styleSheet) {

	    // http://support.microsoft.com/kb/262161
	    if (doc.getElementsByTagName('style').length > 31) {
	      throw new Error('Exceed the maximal count of style tags in IE');
	    }

	    element.styleSheet.cssText += cssText;
	  }
	  // W3C
	  else {
	    element.appendChild(doc.createTextNode(cssText));
	  }

	  if (!id) {
	    styleNode = element;
	  }
	}


/***/ },
/* 97 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(5)();
	exports.push([module.id, "/* alice.poptip 样式模块 */\n\n.ui-poptip {\n    color: #DB7C22;\n    z-index: 101;\n    font-size: 12px;\n    line-height: 1.5;\n    zoom: 1;\n}\n\n.ui-poptip-shadow {\n    background-color: rgba(229, 169, 107, 0.15);\n    FILTER: progid:DXImageTransform.Microsoft.Gradient(startColorstr=#26e5a96b, endColorstr=#26e5a96b);\n    /* Math.floor(0.15 * 255).toString(16); */\n    border-radius: 2px;\n    padding: 2px;\n    zoom: 1;\n    _display: inline;\n}\n\n.ui-poptip-container {\n    position: relative;\n    background-color: #FFFCEF;\n    border: 1px solid #ffbb76;\n    border-radius: 2px;\n    padding: 5px 15px;\n    zoom: 1;\n    _display: inline;\n}\n\n.ui-poptip:after,\n.ui-poptip-shadow:after,\n.ui-poptip-container:after {\n    visibility: hidden;\n    display: block;\n    font-size: 0;\n    content: \" \";\n    clear: both;\n    height: 0;\n}\n\na.ui-poptip-close {\n    position: absolute;\n    right: 3px;\n    top: 3px;\n    border: 1px solid #ffc891;\n    text-decoration: none;\n    border-radius: 3px;\n    width: 12px;\n    height: 12px;\n    font-family: tahoma;\n    color: #dd7e00;\n    line-height: 10px;\n    *line-height: 12px;\n    text-align: center;\n    font-size: 14px;\n    background: #ffd7af;\n    background: -webkit-gradient(linear, left top, left bottom, from(#FFF0E1), to(#FFE7CD));\n    background: -moz-linear-gradient(top, #FFF0E1, #FFE7CD);\n    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#FFF0E1', endColorstr='#FFE7CD');\n    background: -o-linear-gradient(top, #FFF0E1, #FFE7CD);\n    background: linear-gradient(top, #FFF0E1, #FFE7CD);\n    overflow: hidden;\n}\n\na.ui-poptip-close:hover {\n    border: 1px solid #ffb24c;\n    text-decoration: none;\n    color: #dd7e00;\n    background: #ffd7af;\n    background: -webkit-gradient(linear, left top, left bottom, from(#FFE5CA), to(#FFCC98));\n    background: -moz-linear-gradient(top, #FFE5CA, #FFCC98);\n    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#FFE5CA', endColorstr='#FFCC98');\n    background: -o-linear-gradient(top, #FFE5CA, #FFCC98);\n    background: linear-gradient(top, #FFE5CA, #FFCC98);\n}\n\n\n.ui-poptip-arrow {\n    position: absolute;\n    z-index: 10;\n    *zoom: 1;\n}\n\n.ui-poptip-arrow em, .ui-poptip-arrow span {\n    position: absolute;\n    *zoom: 1;\n    width: 0;\n    height: 0;\n    /* 解决window下firefox的border渲染出深色边框的问题 */\n    /* http://stackoverflow.com/questions/13630886/firefox-17-and-css-borders-based-triangles-not-rendering-properly */\n    border-color: rgba(255, 255, 255, 0);\n    border-color: transparent\\0;\n    *border-color: transparent;\n    _border-color:tomato;\n    _filter:chroma(color=tomato); /* http://blog.sina.com.cn/s/blog_6283c54a0100f7ae.html */\n    border-style: solid;\n    overflow: hidden;\n    top: 0;\n    left: 0;\n}\n\n/* 箭头用 border 实现 http://www.css88.com/demo/border/border1.html */\n\n/* 箭头在左边 10,9 */\n\n.ui-poptip-arrow-10 {\n    left: -6px;\n    top: 10px;\n}\n\n.ui-poptip-arrow-10 em {\n    top: 0;\n    left: -1px;\n    border-right-color: #ffbb76;\n    border-width: 6px 6px 6px 0;\n}\n\n.ui-poptip-arrow-10 span {\n    border-right-color: #FFFCEF;\n    border-width: 6px 6px 6px 0;\n}\n\n.ui-poptip-arrow-9 {\n    left: -6px;\n    top: 50%;\n}\n\n.ui-poptip-arrow-9 em {\n    top: -6px;\n    left: -1px;\n    border-right-color: #ffbb76;\n    border-width: 6px 6px 6px 0;\n}\n\n.ui-poptip-arrow-9 span {\n    top: -6px;\n    border-right-color: #FFFCEF;\n    border-width: 6px 6px 6px 0;\n}\n\n/* 箭头在右边 2,3 */\n\n.ui-poptip-arrow-2 {\n    top: 10px;\n    right: 0;\n}\n\n.ui-poptip-arrow-2 em {\n    top: 0;\n    left: 1px;\n    border-left-color: #ffbb76;\n    border-width: 6px 0 6px 6px;\n}\n\n.ui-poptip-arrow-2 span {\n    border-left-color: #FFFCEF;\n    border-width: 6px 0 6px 6px;\n}\n\n.ui-poptip-arrow-3 {\n    top: 50%;\n    right: 0;\n}\n\n.ui-poptip-arrow-3 em {\n    top: -6px;\n    left: 1px;\n    border-left-color: #ffbb76;\n    border-width: 6px 0 6px 6px;\n}\n\n.ui-poptip-arrow-3 span {\n    top: -6px;\n    border-left-color: #FFFCEF;\n    border-width: 6px 0 6px 6px;\n}\n\n/* 箭头在上边 11,12,1 */\n\n.ui-poptip-arrow-11 em,\n.ui-poptip-arrow-12 em,\n.ui-poptip-arrow-1 em {\n    border-width: 0 6px 6px;\n    border-bottom-color: #ffbb76;\n    top: -1px;\n    left: 0;\n}\n\n.ui-poptip-arrow-11 span,\n.ui-poptip-arrow-12 span,\n.ui-poptip-arrow-1 span {\n    border-width: 0 6px 6px;\n    border-bottom-color: #FFFCEF;\n}\n\n.ui-poptip-arrow-11 {\n    left: 14px;\n    top: -6px;\n}\n\n.ui-poptip-arrow-1 {\n    right: 28px;\n    top: -6px;\n}\n\n.ui-poptip-arrow-12 {\n    left: 50%;\n    top: -6px;\n}\n\n.ui-poptip-arrow-12 em,\n.ui-poptip-arrow-12 span {\n    left: -6px;\n}\n\n/* 箭头在下方 5 6 7 */\n\n.ui-poptip-arrow-5 em,\n.ui-poptip-arrow-6 em,\n.ui-poptip-arrow-7 em {\n    border-width: 6px 6px 0;\n    border-top-color: #ffbb76;\n    top: 1px;\n    left: 0;\n}\n\n.ui-poptip-arrow-5 span,\n.ui-poptip-arrow-6 span,\n.ui-poptip-arrow-7 span {\n    border-width: 6px 6px 0;\n    border-top-color: #FFFCEF;\n}\n\n.ui-poptip-arrow-5 {\n    right: 28px;\n    bottom: 0;\n}\n\n.ui-poptip-arrow-6 {\n    left: 50%;\n    bottom: 0;\n}\n\n.ui-poptip-arrow-7 {\n    left: 14px;\n    bottom: 0;\n}\n\n.ui-poptip-arrow-6 em,\n.ui-poptip-arrow-6 span {\n    left: -6px;\n}\n\n/* ie9 filter */\n:root .ui-poptip-shadow {\n    FILTER: none\\9;\n}\n\n/* 蓝色 */\n.ui-poptip-blue {\n    color: #4d4d4d;\n}\n\n.ui-poptip-blue .ui-poptip-shadow {\n    background-color: rgba(0, 0, 0, 0.05);\n    FILTER: progid:DXImageTransform.Microsoft.Gradient(startColorstr=#0c000000, endColorstr=#0c000000);\n}\n\n.ui-poptip-blue .ui-poptip-container {\n    background-color: #F8FCFF;\n    border: 1px solid #B9C8D3;\n}\n\n.ui-poptip-blue .ui-poptip-arrow-10 em, \n.ui-poptip-blue .ui-poptip-arrow-9 em {\n    border-right-color: #B9C8D3;\n}\n.ui-poptip-blue .ui-poptip-arrow-11 em,\n.ui-poptip-blue .ui-poptip-arrow-12 em,\n.ui-poptip-blue .ui-poptip-arrow-1 em {\n    border-bottom-color: #B9C8D3;\n}\n.ui-poptip-blue .ui-poptip-arrow-2 em,\n.ui-poptip-blue .ui-poptip-arrow-3 em {\n    border-left-color: #B9C8D3;\n}\n.ui-poptip-blue .ui-poptip-arrow-5 em,\n.ui-poptip-blue .ui-poptip-arrow-6 em,\n.ui-poptip-blue .ui-poptip-arrow-7 em {\n    border-top-color: #B9C8D3;\n}\n\n.ui-poptip-blue .ui-poptip-arrow-10 span,\n.ui-poptip-blue .ui-poptip-arrow-9 span {\n    border-right-color: #F8FCFF;\n}\n.ui-poptip-blue .ui-poptip-arrow-11 span,\n.ui-poptip-blue .ui-poptip-arrow-12 span,\n.ui-poptip-blue .ui-poptip-arrow-1 span {\n    border-bottom-color: #F8FCFF;\n}\n.ui-poptip-blue .ui-poptip-arrow-2 span,\n.ui-poptip-blue .ui-poptip-arrow-3 span {\n    border-left-color: #F8FCFF;\n}\n.ui-poptip-blue .ui-poptip-arrow-5 span,\n.ui-poptip-blue .ui-poptip-arrow-6 span,\n.ui-poptip-blue .ui-poptip-arrow-7 span {\n    border-top-color: #F8FCFF;\n}\n\n/* 白色 */\n\n.ui-poptip-white {\n    color: #333;\n}\n\n.ui-poptip-white .ui-poptip-shadow {\n    background-color: rgba(0, 0, 0, 0.05);\n    FILTER: progid:DXImageTransform.Microsoft.Gradient(startColorstr=#0c000000, endColorstr=#0c000000);\n}\n\n.ui-poptip-white .ui-poptip-container {\n    background-color: #fff;\n    border: 1px solid #b1b1b1;\n}\n\n.ui-poptip-white .ui-poptip-arrow-10 em,\n.ui-poptip-white .ui-poptip-arrow-9 em {\n    border-right-color: #b1b1b1;\n}\n.ui-poptip-white .ui-poptip-arrow-11 em,\n.ui-poptip-white .ui-poptip-arrow-12 em,\n.ui-poptip-white .ui-poptip-arrow-1 em {\n    border-bottom-color: #b1b1b1;\n}\n.ui-poptip-white .ui-poptip-arrow-2 em,\n.ui-poptip-white .ui-poptip-arrow-3 em {\n    border-left-color: #b1b1b1;\n}\n.ui-poptip-white .ui-poptip-arrow-5 em,\n.ui-poptip-white .ui-poptip-arrow-6 em,\n.ui-poptip-white .ui-poptip-arrow-7 em {\n    border-top-color: #b1b1b1;\n}\n\n.ui-poptip-white .ui-poptip-arrow-10 span,\n.ui-poptip-white .ui-poptip-arrow-9 span {\n    border-right-color: #fff;\n}\n.ui-poptip-white .ui-poptip-arrow-11 span,\n.ui-poptip-white .ui-poptip-arrow-12 span,\n.ui-poptip-white .ui-poptip-arrow-1 span {\n    border-bottom-color: #fff;\n}\n.ui-poptip-white .ui-poptip-arrow-2 span,\n.ui-poptip-white .ui-poptip-arrow-3 span {\n    border-left-color: #fff;\n}\n.ui-poptip-white .ui-poptip-arrow-5 span,\n.ui-poptip-white .ui-poptip-arrow-6 span,\n.ui-poptip-white .ui-poptip-arrow-7 span {\n    border-top-color: #fff;\n}\n", ""]);

/***/ },
/* 98 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(5)();
	exports.i(__webpack_require__(99), "");
	exports.i(__webpack_require__(100), "");
	exports.i(__webpack_require__(101), "");
	exports.push([module.id, "\n\n\n\n.ui-calendar {\n  position: absolute;\n  font:14px/16px arial,'Hiragino Sans GB', sans-serif;\n  font-weight: bold;\n  background: #f9f9f9;\n  border-spacing: 0;\n  border: 1px solid #dadada;\n  box-shadow: 1px 1px 9px #ccc;\n  text-align: center;\n  width: 238px;\n  z-index: 10;\n  color: #666;\n}\n.ui-calendar .ui-calendar-date,\n.ui-calendar .ui-calendar-month,\n.ui-calendar .ui-calendar-year\n{\n  border: none;\n  box-shadow: none;\n  border-collapse: separate;\n  *border-collapse: collapse;\n  border-spacing: 0;\n  padding: 5px;\n}\n.ui-calendar .ui-calendar-pannel {\n  height: 30px;\n  line-height: 30px;\n  padding: 0;\n  margin: 0;\n  background: #f9f9f9;\n}\n.ui-calendar .ui-calendar-pannel:after,\n.ui-calendar .ui-calendar-pannel:before {\n  display: table;\n  line-height: 0;\n  content: '';\n}\n.ui-calendar .ui-calendar-pannel:after {\n  clear: both;\n}\n.ui-calendar .ui-calendar-control {\n  display: inline-block;\n  float: left;\n  width: 13%;\n  *display: inline;\n  *width: 20px;\n  *zoom: 1;\n  cursor: pointer;\n  font-weight: normal;\n}\n.ui-calendar .ui-calendar-control:hover {\n  background-color: #efefee;\n}\n.ui-calendar .ui-calendar-pannel .month,\n.ui-calendar .ui-calendar-pannel .year {\n  width: 24%;\n  font-weight: bold;\n}\n.ui-calendar-container{\n  border-bottom: 1px solid #dadada;\n  background-color: #fff;\n}\n\n.ui-calendar td.disabled-element {\n  cursor: not-allowed!important;\n}\n", ""]);

/***/ },
/* 99 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(5)();
	exports.push([module.id, "/* date */\n.ui-calendar-date {\n  border: none;\n  box-shadow: none;\n  border-collapse: separate;\n  *border-collapse: collapse;\n  border-spacing: 0;\n}\ntable.ui-calendar-date tr {\n  border: none;\n  margin: 0;\n  padding: 0;\n  width: 100%;\n  background: #fff;\n}\n.ui-calendar-date td, .ui-calendar-date th {\n  width: 34px;\n  height: 30px;\n  line-height: 30px;\n  padding: 0;\n  margin: 0;\n  text-align: center;\n  border: none;\n  cursor: pointer;\n}\n.ui-calendar-date .ui-calendar-day-column {\n  background: #868686;\n  color: #cacaca;\n}\n.ui-calendar-date .ui-calendar-day-column th {\n  border-color: #868686;\n  cursor: default;\n}\n.ui-calendar-date .ui-calendar-date-column .ui-calendar-day-0,\n.ui-calendar-date .ui-calendar-date-column .ui-calendar-day-6 {\n  color: #db693d;\n}\n.ui-calendar-date .ui-calendar-date-column td:hover {\n  cursor: pointer;\n  background-color: #FFDEB8;\n}\n.ui-calendar-date .ui-calendar-date-column td.previous-month,\n.ui-calendar-date .ui-calendar-date-column td.next-month {\n  color: #ccc;\n}\n.ui-calendar-date .ui-calendar-date-column td.previous-month:hover,\n.ui-calendar-date .ui-calendar-date-column td.next-month:hover {\n  cursor: default;\n  border-color: #fff;\n}\n.ui-calendar-date .ui-calendar-date-column td.focused-element {\n  color: #fff;\n  background: #f57403;\n}\n\n.ui-calendar-date .ui-calendar-date-column td.disabled-element {\n  background: #e2e2e2;\n  color: #c3c3c3;\n}\n.ui-calendar-date .ui-calendar-date-column td.disabled-element:hover {\n  border-color: #fff;\n}\n", ""]);

/***/ },
/* 100 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(5)();
	exports.push([module.id, "/* month */\n.ui-calendar-month {\n  border: none;\n  box-shadow: none;\n  border-collapse: separate;\n  *border-collapse: collapse;\n  border-spacing: 0;\n}\ntable.ui-calendar-month tr {\n  border: none;\n  margin: 0;\n  padding: 0;\n  width: 100%;\n  background: #fff;\n}\n.ui-calendar-month .ui-calendar-month-column td {\n  width: 79px;\n  height: 36px;\n  line-height: 36px;\n  padding: 0;\n  margin: 0;\n  text-align: center;\n  border: none;\n  cursor: pointer;\n}\n.ui-calendar-month .ui-calendar-month-column td:hover {\n  cursor: pointer;\n  background-color: #FFDEB8;\n}\n.ui-calendar-month .ui-calendar-month-column td.focused-element {\n  color: #fff;\n  background: #f57403;\n}\n.ui-calendar-month .ui-calendar-month-column td.disabled-element {\n  background: #e2e2e2;\n  color: #c3c3c3;\n}\n.ui-calendar-month .ui-calendar-month-column td.disabled-element:hover {\n  border-color: #fff;\n}\n", ""]);

/***/ },
/* 101 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(5)();
	exports.push([module.id, "/* year */\n.ui-calendar-year {\n  border: none;\n  box-shadow: none;\n  border-collapse: separate;\n  *border-collapse: collapse;\n  border-spacing: 0;\n}\ntable.ui-calendar-year tr {\n  border: none;\n  margin: 0;\n  padding: 0;\n  width: 100%;\n  background: #fff;\n}\n.ui-calendar-year .ui-calendar-year-column td {\n  width: 79px;\n  height: 36px;\n  line-height: 36px;\n  padding: 0;\n  margin: 0;\n  text-align: center;\n  border: none;\n  cursor: pointer;\n}\n.ui-calendar-year .ui-calendar-year-column td:hover {\n  cursor: pointer;\n  background-color: #FFDEB8;\n}\n.ui-calendar-year .ui-calendar-year-column td.focused-element {\n  color: #fff;\n  background: #f57403;\n}\n.ui-calendar-year .ui-calendar-year-column td.disabled-element {\n  background: #e2e2e2;\n  color: #c3c3c3;\n}\n.ui-calendar-year .ui-calendar-year-column td.disabled-element:hover {\n  border-color: #fff;\n}\n", ""]);

/***/ },
/* 102 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(5)();
	exports.i(__webpack_require__(97), "");
	exports.push([module.id, "\n\n.ui-poptip {\n    top: 0;\n    left: 0;\n}\n", ""]);

/***/ },
/* 103 */
/***/ function(module, exports, __webpack_require__) {

	var arale = {}
	arale["base" ] = __webpack_require__(6 )
	arale["messenger" ] = __webpack_require__(25 )
	arale["switchable" ] = __webpack_require__(78 )
	arale["calendar" ] = __webpack_require__(48 )
	arale["easing" ] = __webpack_require__(24 )
	arale["overlay" ] = __webpack_require__(7 )
	arale["validator" ] = __webpack_require__(83 )
	arale["widget" ] = __webpack_require__(2 )
	arale["events" ] = __webpack_require__(14 )
	arale["qrcode" ] = __webpack_require__(66 )
	arale["tip" ] = __webpack_require__(81 )
	arale["autocomplete" ] = __webpack_require__(40 )
	arale["class" ] = __webpack_require__(22 )
	arale["dialog" ] = __webpack_require__(60 )
	arale["dnd" ] = __webpack_require__(62 )
	arale["placeholder" ] = __webpack_require__(64 )
	arale["cookie" ] = __webpack_require__(59 )
	arale["popup" ] = __webpack_require__(27 )
	arale["select" ] = __webpack_require__(69 )
	arale["sticky" ] = __webpack_require__(71 )
	arale["templatable" ] = __webpack_require__(11 )
	arale["upload" ] = __webpack_require__(82 )
	arale["iframe-shim" ] = __webpack_require__(15 )
	arale["position"] = __webpack_require__(12)
	arale["style"] = __webpack_require__(96)
	module.exports = arale;


/***/ },
/* 104 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	/*globals Handlebars: true */
	var base = __webpack_require__(19);

	// Each of these augment the Handlebars object. No need to setup here.
	// (This is done to easily share code between commonjs and browse envs)
	var SafeString = __webpack_require__(34)["default"];
	var Exception = __webpack_require__(20)["default"];
	var Utils = __webpack_require__(21);
	var runtime = __webpack_require__(105);

	// For compatibility and usage outside of module systems, make the Handlebars object a namespace
	var create = function() {
	  var hb = new base.HandlebarsEnvironment();

	  Utils.extend(hb, base);
	  hb.SafeString = SafeString;
	  hb.Exception = Exception;
	  hb.Utils = Utils;

	  hb.VM = runtime;
	  hb.template = function(spec) {
	    return runtime.template(spec, hb);
	  };

	  return hb;
	};

	var Handlebars = create();
	Handlebars.create = create;

	exports["default"] = Handlebars;

/***/ },
/* 105 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Utils = __webpack_require__(21);
	var Exception = __webpack_require__(20)["default"];
	var COMPILER_REVISION = __webpack_require__(19).COMPILER_REVISION;
	var REVISION_CHANGES = __webpack_require__(19).REVISION_CHANGES;

	function checkRevision(compilerInfo) {
	  var compilerRevision = compilerInfo && compilerInfo[0] || 1,
	      currentRevision = COMPILER_REVISION;

	  if (compilerRevision !== currentRevision) {
	    if (compilerRevision < currentRevision) {
	      var runtimeVersions = REVISION_CHANGES[currentRevision],
	          compilerVersions = REVISION_CHANGES[compilerRevision];
	      throw new Exception("Template was precompiled with an older version of Handlebars than the current runtime. "+
	            "Please update your precompiler to a newer version ("+runtimeVersions+") or downgrade your runtime to an older version ("+compilerVersions+").");
	    } else {
	      // Use the embedded version info since the runtime doesn't know about this revision yet
	      throw new Exception("Template was precompiled with a newer version of Handlebars than the current runtime. "+
	            "Please update your runtime to a newer version ("+compilerInfo[1]+").");
	    }
	  }
	}

	exports.checkRevision = checkRevision;// TODO: Remove this line and break up compilePartial

	function template(templateSpec, env) {
	  if (!env) {
	    throw new Exception("No environment passed to template");
	  }

	  // Note: Using env.VM references rather than local var references throughout this section to allow
	  // for external users to override these as psuedo-supported APIs.
	  var invokePartialWrapper = function(partial, name, context, helpers, partials, data) {
	    var result = env.VM.invokePartial.apply(this, arguments);
	    if (result != null) { return result; }

	    if (env.compile) {
	      var options = { helpers: helpers, partials: partials, data: data };
	      partials[name] = env.compile(partial, { data: data !== undefined }, env);
	      return partials[name](context, options);
	    } else {
	      throw new Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
	    }
	  };

	  // Just add water
	  var container = {
	    escapeExpression: Utils.escapeExpression,
	    invokePartial: invokePartialWrapper,
	    programs: [],
	    program: function(i, fn, data) {
	      var programWrapper = this.programs[i];
	      if(data) {
	        programWrapper = program(i, fn, data);
	      } else if (!programWrapper) {
	        programWrapper = this.programs[i] = program(i, fn);
	      }
	      return programWrapper;
	    },
	    merge: function(param, common) {
	      var ret = param || common;

	      if (param && common && (param !== common)) {
	        ret = {};
	        Utils.extend(ret, common);
	        Utils.extend(ret, param);
	      }
	      return ret;
	    },
	    programWithDepth: env.VM.programWithDepth,
	    noop: env.VM.noop,
	    compilerInfo: null
	  };

	  return function(context, options) {
	    options = options || {};
	    var namespace = options.partial ? options : env,
	        helpers,
	        partials;

	    if (!options.partial) {
	      helpers = options.helpers;
	      partials = options.partials;
	    }
	    var result = templateSpec.call(
	          container,
	          namespace, context,
	          helpers,
	          partials,
	          options.data);

	    if (!options.partial) {
	      env.VM.checkRevision(container.compilerInfo);
	    }

	    return result;
	  };
	}

	exports.template = template;function programWithDepth(i, fn, data /*, $depth */) {
	  var args = Array.prototype.slice.call(arguments, 3);

	  var prog = function(context, options) {
	    options = options || {};

	    return fn.apply(this, [context, options.data || data].concat(args));
	  };
	  prog.program = i;
	  prog.depth = args.length;
	  return prog;
	}

	exports.programWithDepth = programWithDepth;function program(i, fn, data) {
	  var prog = function(context, options) {
	    options = options || {};

	    return fn(context, options.data || data);
	  };
	  prog.program = i;
	  prog.depth = 0;
	  return prog;
	}

	exports.program = program;function invokePartial(partial, name, context, helpers, partials, data) {
	  var options = { partial: true, helpers: helpers, partials: partials, data: data };

	  if(partial === undefined) {
	    throw new Exception("The partial " + name + " could not be found");
	  } else if(partial instanceof Function) {
	    return partial(context, options);
	  }
	}

	exports.invokePartial = invokePartial;function noop() { return ""; }

	exports.noop = noop;

/***/ },
/* 106 */
/***/ function(module, exports) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            currentQueue[queueIndex].run();
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	// TODO(shtylman)
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 107 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 108 */
/***/ function(module, exports) {

	module.exports = '<div class="ui-poptip">    <div class="ui-poptip-shadow">    <div class="ui-poptip-container">        <div class="ui-poptip-arrow">            <em></em>            <span></span>        </div>        <div class="ui-poptip-content" data-role="content">        </div>    </div>    </div></div>'

/***/ },
/* 109 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(98);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(35)(content, {});
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		module.hot.accept("!!/usr/local/lib/node_modules/spm/node_modules/spm-webpack/node_modules/css-loader/index.js!!/Users/nimojs/Documents/git/arale/spm_modules/arale-calendar/1.1.2/src/calendar.css", function() {
			var newContent = require("!!/usr/local/lib/node_modules/spm/node_modules/spm-webpack/node_modules/css-loader/index.js!!/Users/nimojs/Documents/git/arale/spm_modules/arale-calendar/1.1.2/src/calendar.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 110 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(102);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(35)(content, {});
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		module.hot.accept("!!/usr/local/lib/node_modules/spm/node_modules/spm-webpack/node_modules/css-loader/index.js!!/Users/nimojs/Documents/git/arale/spm_modules/arale-tip/1.4.1/src/tip.css", function() {
			var newContent = require("!!/usr/local/lib/node_modules/spm/node_modules/spm-webpack/node_modules/css-loader/index.js!!/Users/nimojs/Documents/git/arale/spm_modules/arale-tip/1.4.1/src/tip.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ }
/******/ ])
});
;