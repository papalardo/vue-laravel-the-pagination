//
//
//
//
//
//
//
//
//
//

var buildURLQuery = function (obj) { return Object.entries(obj).map(function (pair) { return pair.map(encodeURIComponent).join('='); }).join('&'); };

var script = {
    // name: 'ThePaginatable', // vue component name,
    data: function data() {
        return {
            paginate: {
                data: [],
                current_page: 0,
                last_page: 0,
                per_page: 0,
                total: 0,
            },
            interval: [1],
            buzy: false,
            request: null
        }
    },
    props: {
        limits: {
            type: Array,
            default: function () { return [10, 25, 50, 100]; }
        },
        query: {
            type: Object,
        },
        url: {
            type: String,
            required: true,
        },
        intervalMaxNumbers: {
            type: Number,
            default: function () { return 5; }
        },
        config: {
            type: Object
        }
    },
    computed: {
        _query: function _query() {
            return Object.assign({per_page: this.limits[0]}, this.query)
            // return {
                // per_page: this.limits[0],
                // ...this.query
            // }
        }
    },
    watch: {
        '_query': function _query() {
            this.get(1, true);
        }
    },
    created: function created() {
        this.get();
    },
    methods: {
        getInterval: function getInterval() {
            var totalItens = this.paginate.total;
            var perPage = this.paginate.per_page;
            var currentPage = this.paginate.current_page;
            var maxShowingNumbers = this.intervalMaxNumbers;

            var lastPage = Math.ceil(totalItens / perPage);

            if (totalItens < 0) {
                console.error("Total of itens cant be less or equal than 0");
                return;
            } else if (lastPage > 0 && currentPage > lastPage) {
                console.error(("Current page [" + currentPage + "] cant be bigger than last page [" + lastPage + "]"));
                return;
            }

            function getRange(start, end, step) {
                if ( step === void 0 ) step = 1;

                var len = Math.floor((end - start) / step) + 1;
                return Array(len).fill().map(function (_, idx) { return start + (idx * step); })
            }

            var interval = lastPage > 0 ?
                getRange(
                    Math.max(1, Math.min(lastPage - maxShowingNumbers + 1, currentPage - Math.floor(maxShowingNumbers / 2))),
                    Math.min(lastPage, Math.max(maxShowingNumbers, Math.min(lastPage, currentPage + Math.floor(maxShowingNumbers / 2))))
                ) : [1];

            this.interval = interval;
        },
        get: function get(page, forceRequest) {
            var this$1 = this;
            if ( page === void 0 ) page = 1;

            if(page === this.paginate.current_page && !forceRequest) { return; }

            this.paginate.current_page = page;
            this.getInterval();

            var queryToString = buildURLQuery(Object.assign({page: page}, this._query));
            // let queryToString = buildURLQuery({
            //     page,
            //     ...this._query
            // })

            var url = this.baseURL ? ((this.baseURL) + "/" + (this.url) + "?" + queryToString) : ((this.url) + "?" + queryToString);
            this.makeRequest(url)
                .then(function (res) {
                    this$1.$emit(self.config && self.config.customEventName.getData || 'getData', res.data);

                    this$1.paginate = Object.assign(this$1.paginate,res);
                    // this.paginate = {
                    //     ...this.paginate,
                    //     ...res
                    // }
                    this$1.getInterval();
                });
        },
        makeRequest: function makeRequest(url) {
            var self = this;
            return new Promise(function (resolve, reject) {
                var xhr = typeof XMLHttpRequest != 'undefined' ?
                    new XMLHttpRequest() :
                    new ActiveXObject('Microsoft.XMLHTTP');
                xhr.open('get', url, true);

                xhr.setRequestHeader('Authorization', 'test');

                xhr.onreadystatechange = function() {
                    var status;
                    var data;

                    if (xhr.readyState == 4) { // `DONE`
                        status = xhr.status;
                        if (status == 200) {
                            data = JSON.parse(xhr.responseText);
                            resolve(data);
                        } else {
                            reject(status);
                        }

                        self.request = null;
                        self.$emit(self.config && self.config.customEventName.loading || 'loading', false);
                    }
                };

                self.request && self.request.abort();

                self.request = xhr;
                xhr.send();
                self.$emit(self.config && self.config.customEventName.loading || 'loading', true);

            })
        }
    }
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier
/* server only */
, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
  if (typeof shadowMode !== 'boolean') {
    createInjectorSSR = createInjector;
    createInjector = shadowMode;
    shadowMode = false;
  } // Vue.extend constructor export interop.


  var options = typeof script === 'function' ? script.options : script; // render functions

  if (template && template.render) {
    options.render = template.render;
    options.staticRenderFns = template.staticRenderFns;
    options._compiled = true; // functional template

    if (isFunctionalTemplate) {
      options.functional = true;
    }
  } // scopedId


  if (scopeId) {
    options._scopeId = scopeId;
  }

  var hook;

  if (moduleIdentifier) {
    // server build
    hook = function hook(context) {
      // 2.3 injection
      context = context || // cached call
      this.$vnode && this.$vnode.ssrContext || // stateful
      this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext; // functional
      // 2.2 with runInNewContext: true

      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__;
      } // inject component styles


      if (style) {
        style.call(this, createInjectorSSR(context));
      } // register component module identifier for async chunk inference


      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier);
      }
    }; // used by ssr in case component is cached and beforeCreate
    // never gets called


    options._ssrRegister = hook;
  } else if (style) {
    hook = shadowMode ? function () {
      style.call(this, createInjectorShadow(this.$root.$options.shadowRoot));
    } : function (context) {
      style.call(this, createInjector(context));
    };
  }

  if (hook) {
    if (options.functional) {
      // register for functional component in vue file
      var originalRender = options.render;

      options.render = function renderWithStyleInjection(h, context) {
        hook.call(context);
        return originalRender(h, context);
      };
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate;
      options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
    }
  }

  return script;
}

var normalizeComponent_1 = normalizeComponent;

var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
function createInjector(context) {
  return function (id, style) {
    return addStyle(id, style);
  };
}
var HEAD = document.head || document.getElementsByTagName('head')[0];
var styles = {};

function addStyle(id, css) {
  var group = isOldIE ? css.media || 'default' : id;
  var style = styles[group] || (styles[group] = {
    ids: new Set(),
    styles: []
  });

  if (!style.ids.has(id)) {
    style.ids.add(id);
    var code = css.source;

    if (css.map) {
      // https://developer.chrome.com/devtools/docs/javascript-debugging
      // this makes source maps inside style tags work properly in Chrome
      code += '\n/*# sourceURL=' + css.map.sources[0] + ' */'; // http://stackoverflow.com/a/26603875

      code += '\n/*# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) + ' */';
    }

    if (!style.element) {
      style.element = document.createElement('style');
      style.element.type = 'text/css';
      if (css.media) { style.element.setAttribute('media', css.media); }
      HEAD.appendChild(style.element);
    }

    if ('styleSheet' in style.element) {
      style.styles.push(code);
      style.element.styleSheet.cssText = style.styles.filter(Boolean).join('\n');
    } else {
      var index = style.ids.size - 1;
      var textNode = document.createTextNode(code);
      var nodes = style.element.childNodes;
      if (nodes[index]) { style.element.removeChild(nodes[index]); }
      if (nodes.length) { style.element.insertBefore(textNode, nodes[index]); }else { style.element.appendChild(textNode); }
    }
  }
}

var browser = createInjector;

/* script */
var __vue_script__ = script;

/* template */
var __vue_render__ = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"pagination"},[_c('button',{staticClass:"pagination__button pagination__button--first-page",attrs:{"disabled":_vm.paginate.current_page <= 1},on:{"click":function($event){return _vm.get()}}}),_vm._v(" "),_c('button',{staticClass:"pagination__button pagination__button--prev-page",attrs:{"disabled":_vm.paginate.current_page <= 1},on:{"click":function($event){return _vm.get(_vm.paginate.current_page - 1)}}}),_vm._v(" "),_vm._l((_vm.interval),function(nr,index){return _c('button',{key:index,staticClass:"pagination__button",class:[{'active': _vm.paginate.current_page == nr}],on:{"click":function($event){return _vm.get(nr)}}},[_vm._v(_vm._s(nr))])}),_vm._v(" "),_c('button',{staticClass:"pagination__button pagination__button--next-page",attrs:{"disabled":_vm.paginate.current_page >= _vm.paginate.last_page},on:{"click":function($event){return _vm.get(_vm.paginate.current_page + 1)}}}),_vm._v(" "),_c('button',{staticClass:"pagination__button pagination__button--last-page",attrs:{"disabled":_vm.paginate.current_page >= _vm.paginate.last_page},on:{"click":function($event){return _vm.get(_vm.paginate.last_page)}}})],2)};
var __vue_staticRenderFns__ = [];

  /* style */
  var __vue_inject_styles__ = function (inject) {
    if (!inject) { return }
    inject("data-v-499fb406_0", { source: ".pagination[data-v-499fb406]{display:inline-block}.pagination__button[data-v-499fb406]{cursor:pointer;color:#000;float:left;padding:8px 16px;text-decoration:none;border:1px solid #ddd;outline:0}.pagination__button[data-v-499fb406]:disabled,.pagination__button[disabled][data-v-499fb406]{background-color:#ccc;border:1px solid #ccc;color:#666;cursor:not-allowed}.pagination__button.active[data-v-499fb406]{background-color:#4caf50;color:#fff;border:1px solid #4caf50}.pagination__button[data-v-499fb406]:hover:not(.active):not(:disabled){background-color:#ddd}.pagination__button[data-v-499fb406]:first-child{border-top-left-radius:5px;border-bottom-left-radius:5px}.pagination__button--first-page[data-v-499fb406]::before{content:'\\00AB'}.pagination__button--next-page[data-v-499fb406]::before{content:'\\203A'}.pagination__button--prev-page[data-v-499fb406]::before{content:'\\2039'}.pagination__button--last-page[data-v-499fb406]::before{content:'\\00BB'}.pagination .pagination__button[data-v-499fb406]:last-child{border-top-right-radius:5px;border-bottom-right-radius:5px}", map: undefined, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__ = "data-v-499fb406";
  /* module identifier */
  var __vue_module_identifier__ = undefined;
  /* functional template */
  var __vue_is_functional_template__ = false;
  /* style inject SSR */
  

  
  var thePaginatable = normalizeComponent_1(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    browser,
    undefined
  );



var components = /*#__PURE__*/Object.freeze({
    ThePaginatable: thePaginatable
});

// Import vue components

// install function executed by Vue.use()
function install(Vue, options) {
    if (install.installed) { return; }
    install.installed = true;
    
    Object.keys(components).forEach(function (componentName) {
        // Vue.component(componentName, components[componentName]);
        Vue.component(componentName, Vue.extend(components[componentName]).extend({
            data: function data() {
                return {
                    baseURL: options.baseURL
                };
            }
        }));
    });
}

// Create module definition for Vue.use()
var plugin = {
    install: install,
};

// To auto-install when vue is found
/* global window global */
var GlobalVue = null;
if (typeof window !== 'undefined') {
    GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
    GlobalVue = global.Vue;
}
if (GlobalVue) {
    GlobalVue.use(plugin);
}

export default plugin;
export { thePaginatable as ThePaginatable };
