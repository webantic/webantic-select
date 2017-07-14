'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var m = require('mithril');

var Select = function () {
  function Select(input) {
    var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Select);

    var self = this;

    // check input
    if (!self._validateInput(input)) {
      return;
    }

    // default config
    self.config = {
      position: 'fixed',
      search: false,
      text: ''

      // update config
    };Object.assign(self.config, config

    // create root div and prevent propagation
    );self.config.root = self._createRoot(input);
    self.config.root.addEventListener('click', self._stopPropagation

    // store the type (select or input)
    );self.config.type = input.tagName.toLowerCase

    // if a <select> is used, grab the options and setup a text input
    ();if (self.config.type === 'select' && input.options) {
      self.config.options = Array.apply(null, input.options).map(function (option) {
        return {
          value: option.value || option.text,
          text: option.text,
          selected: option.selected
        };
      }
      // _hide input and render text element 
      );input.style.display = 'none';
      self.config.input = self._createInput(input

      // is the input disabled?
      );self.config.disabled = Boolean(input.disabled

      // is it a multi-select?
      );self.config.multiple = Boolean(input.multiple);
    } else {
      self.config.input = input;
    }

    self.config.input.style.display = 'none';

    // grab initial value
    if (self.config.multiple) {
      var values = [];
      self.config.options.forEach(function (option) {
        if (option.selected) {
          values.push(option.value);
        }
      });
      self.config.input.value = JSON.stringify(values);
    } else {
      var selectedOption = self._dedupeSelected() || { value: null, text: '' };
      self.config.input.value = selectedOption.value || selectedOption.text;
      self.config.text = selectedOption.text;
    }
    self.config.placeholder = input.placeholder;

    // render pseudo select
    m.mount(self.config.root, self._renderSelect(self.config));
  }

  _createClass(Select, [{
    key: 'value',
    value: function value() {
      var self = this;
      return self.config.multiple ? JSON.parse(self.config.input.value) : self.config.input.value;
    }
  }, {
    key: '_validateInput',
    value: function _validateInput(input) {
      if (!input) {
        console.warn('you need to pass a DOM node to Select constructor');
        return false;
      }
      if (input.tagName.toLowerCase() !== 'input' && input.tagName.toLowerCase() !== 'select') {
        console.warn('element type should be select or input. got: ' + input.tagName.toLowerCase());
        return false;
      }
      return true;
    }
  }, {
    key: '_createRoot',
    value: function _createRoot(input) {
      var root = document.createElement('div');
      input.parentNode.insertBefore(root, input);
      return root;
    }
  }, {
    key: '_selectOption',
    value: function _selectOption(option, state) {
      var self = this;
      if (self.config.multiple) {
        // for multi-selects
        var values = JSON.parse(self.config.input.value);
        var valueIndex = values.indexOf(String(option.value));
        if (valueIndex > -1) {
          // remove the option if its already set
          values.splice(valueIndex, valueIndex);
          self._unsetOption(option.value);
        } else {
          // add the option to the selected options
          values.push(option.value);
          self._setOption(option.value);
        }
        self.config.input.value = JSON.stringify(values);
      } else {
        // for single selects
        self.config.input.value = option.value;
        self.config.text = option.text;
        self._setOption(option.value);
      }
      self._hide(state);
    }
  }, {
    key: '_setOption',
    value: function _setOption(value) {
      var self = this;
      this.config.options.forEach(function (compare) {
        if (self.config.multiple) {
          compare.selected = String(compare.value) === String(value) ? true : compare.selected;
        } else {
          compare.selected = String(compare.value) === String(value);
        }
      });
    }
  }, {
    key: '_unsetOption',
    value: function _unsetOption(value) {
      this.config.options.forEach(function (compare) {
        compare.selected = String(compare.value) === String(value) ? false : compare.selected;
      });
    }
  }, {
    key: '_hide',
    value: function _hide(state, listener) {
      state.visible = false;
      m.redraw();
      if (listener) {
        document.removeEventListener('click', listener);
      }
    }
  }, {
    key: '_show',
    value: function _show() {
      this.state.visible = true;
    }
  }, {
    key: '_search',
    value: function _search(term, string) {
      return string.substr(0, term.length > 3 ? string.length : term.length).search(new RegExp(term, "i")) > -1;
    }
  }, {
    key: '_setSearchTerm',
    value: function _setSearchTerm(state, vnode) {
      state.searchTerm = String(vnode.dom.value);
    }
  }, {
    key: '_dedupeSelected',
    value: function _dedupeSelected() {
      var selected = false;
      this.config.options.forEach(function (option) {
        if (option.selected) {
          if (selected) {
            option.selected = false;
          } else {
            selected = option;
          }
        }
      });
      return selected;
    }
  }, {
    key: '_createInput',
    value: function _createInput(input) {
      var hiddenInput = document.createElement('input');
      hiddenInput.type = 'hidden';
      hiddenInput.name = input.name;
      input.name += '_original';
      input.parentNode.insertBefore(hiddenInput, input);
      return hiddenInput;
    }
  }, {
    key: '_stopPropagation',
    value: function _stopPropagation(e) {
      e.stopPropagation();
    }
  }, {
    key: '_registerScrollVanish',
    value: function _registerScrollVanish(state) {
      var self = this;
      var _hideOnScroll = function _hideOnScroll(e) {
        state.visible = false;
        window.removeEventListener('scroll', _hideOnScroll, false);
      };
      window.addEventListener('scroll', _hideOnScroll);
    }
  }, {
    key: '_positionFixedly',
    value: function _positionFixedly(vnode, parent) {
      var self = this;

      var inputPosition = parent.getBoundingClientRect();
      if (inputPosition.left < parent.clientWidth) {
        vnode.dom.style.left = inputPosition.left + 'px';
      } else {
        vnode.dom.style.right = window.innerWidth - inputPosition.right + 'px';
      }

      if (parent.getBoundingClientRect().bottom > window.innerHeight * 0.75) {
        vnode.dom.style.bottom = window.innerHeight - inputPosition.top + 'px';
      } else {
        vnode.dom.style.top = inputPosition.top + parent.clientHeight + 'px';
      }
    }
  }, {
    key: '_positionAbsolutely',
    value: function _positionAbsolutely(vnode, parent) {
      var self = this;
      // just in case there's no parent with a non-static position
      document.body.style.position = 'relative';

      var inputPosition = {
        top: parent.offsetTop + parent.offsetHeight,
        left: parent.offsetLeft,
        right: parent.offsetParent.clientWidth - (parent.offsetLeft + parent.offsetWidth),
        bottom: parent.offsetParent.clientHeight - parent.offsetTop
      };
      if (inputPosition.left < parent.clientWidth) {
        vnode.dom.style.left = inputPosition.left + 'px';
      } else {
        vnode.dom.style.right = inputPosition.right + 'px';
      }

      if (parent.getBoundingClientRect().bottom > window.innerHeight * 0.75) {
        vnode.dom.style.bottom = inputPosition.bottom + 'px';
      } else {
        vnode.dom.style.top = inputPosition.top + 'px';
      }
    }
  }, {
    key: '_renderLabels',
    value: function _renderLabels(options, state) {
      var self = this;
      return options.filter(function (option) {
        return option.selected;
      }).map(function (option) {
        return m('span', {
          class: 'label',
          onclick: self._selectOption.bind(self, option, state)
        }, option.text);
      });
    }
  }, {
    key: '_renderOption',
    value: function _renderOption() {
      var self = this;
      return {
        view: function view(vnode) {
          return m('div', {
            class: 'option ' + (vnode.attrs.option.selected ? '-selected' : ''),
            onclick: self._selectOption.bind(self, vnode.attrs.option, vnode.attrs.state)
          }, vnode.attrs.option.text);
        }
      };
    }
  }, {
    key: '_renderOptions',
    value: function _renderOptions() {
      var self = this;
      return {
        view: function view(vnode) {
          return self.config.options.filter(function (option) {
            if (vnode.attrs.searchTerm) {
              return self._search(vnode.attrs.searchTerm, option.text);
            }
            return true;
          }).map(function (option) {
            return m(self._renderOption(), { option: option, state: vnode.attrs });
          });
        }
      };
    }
  }, {
    key: '_renderSelect',
    value: function _renderSelect(state) {
      var self = this;
      var Search = {
        view: function view(vnode) {
          return m('input', {
            class: 'search',
            type: "text",
            placeholder: "search...",
            onkeyup: self._setSearchTerm.bind(this, vnode.attrs, vnode),
            autofocus: true,
            value: vnode.attrs.searchTerm
          });
        }
      };
      var Dropdown = {
        state: {
          searchTerm: null
        },
        oncreate: function oncreate(vnode) {
          vnode.dom.style.width = self.config.clientWidth + 'px';
          vnode.dom.style.position = self.config.position;

          if (self.config.position === 'fixed') {
            self._registerScrollVanish(vnode.attrs);
          }

          if (self.config.position === 'fixed') {
            self._positionFixedly(vnode, vnode.attrs.dom);
          } else {
            self._positionAbsolutely(vnode, vnode.attrs.dom);
          }

          var hide = document.addEventListener('click', self._hide.bind(null, vnode.attrs, hide));
        },
        view: function view(vnode) {
          var contents = [m(self._renderOptions(), this.state)];
          if (self.config.search) {
            contents.unshift(m(Search, this.state));
          }
          return m('div', { class: 'select-options' }, contents);
        }
      };
      return {
        state: state,
        oncreate: function oncreate(vnode) {
          this.state.dom = vnode.dom;
        },
        _showDropdown: function _showDropdown() {
          if (this.state.visible) {
            return m(Dropdown, this.state);
          }
        },
        view: function view(vnode) {
          return [m('div', { class: 'select-value', onclick: self._show.bind(this) }, self.config.multiple ? self._renderLabels(self.config.options, state) : self.config.text), this._showDropdown()];
        }
      };
    }
  }]);

  return Select;
}();

module.exports = Select;