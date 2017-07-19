const m = require('mithril')

class Select {
  constructor (input, config = {}) {
    const self = this

    // check input
    if (!self._validateInput(input)) {
      return
    }

    // default config
    self.config = {
      position: 'fixed',
      search: false,
      text: ''
    }

    // update config
    Object.assign(self.config, config)

    // create root div and prevent propagation
    self.config.root = self._createRoot(input)
    self.config.root.addEventListener('click', self._stopPropagation)

    // store the type (select or input)
    self.config.type = input.tagName.toLowerCase()

    // if a <select> is used, grab the options and setup a text input
    if (self.config.type === 'select' && input.options) {
      self.config.original = input
      self.config.options = Array.apply(null, input.options).map((option) => {
        return {
          value: option.value || option.text,
          text: option.text,
          selected: option.selected
        }
      })
      // _hide input and render text element
      input.style.display = 'none'
      self.config.input = self._createInput(input)

      // is the input disabled?
      self.config.disabled = Boolean(input.disabled)

      // is it a multi-select?
      self.config.multiple = Boolean(input.multiple)
    } else {
      self.config.input = input
    }

    self.config.input.style.display = 'none'

    // grab initial value
    self._initOptionsFromArray(self.config.options)

    // render pseudo select
    m.mount(self.config.root, self._renderSelect(self.config))
  }

  value () {
    const self = this
    return self.config.multiple ? JSON.parse(self.config.input.value) : self.config.input.value
  }

  updateOptions (options) {
    const self = this
    if (!options || !Array.isArray(options)) {
      if (self.config.type === 'select') {
        options = Array.apply(null, self.config.original.options).map((option) => {
          return {
            value: option.value || option.text,
            text: option.text,
            selected: option.selected
          }
        })
      } else {
        return
      }
    }
    self._initOptionsFromArray(options)
  }

  _initOptionsFromArray (options) {
    const self = this
    self.config.options = options
    if (self.config.multiple) {
      let values = []
      options.forEach((option) => {
        if (option.selected) {
          values.push(option.value)
        }
      })
      self.config.input.value = JSON.stringify(values)
    } else {
      const selectedOption = self._dedupeSelected() || {value: null, text: ''}
      self.config.input.value = selectedOption.value || selectedOption.text
      self.config.text = selectedOption.text
    }
    m.redraw()
  }

  _validateInput (input) {
    if (!input) {
      console.warn('you need to pass a DOM node to Select constructor')
      return false
    }
    if (input.tagName.toLowerCase() !== 'input' && input.tagName.toLowerCase() !== 'select') {
      console.warn(`element type should be select or input. got: ${input.tagName.toLowerCase()}`)
      return false
    }
    return true
  }

  _createRoot (input) {
    const root = document.createElement('div')
    input.parentNode.insertBefore(root, input)
    return root
  }

  _selectOption (option, state) {
    const self = this
    if (self.config.multiple) {
      // for multi-selects
      let values = JSON.parse(self.config.input.value)
      let valueIndex = values.indexOf(String(option.value))
      if (valueIndex > -1) {
        // remove the option if its already set
        values.splice(valueIndex, valueIndex)
        self._unsetOption(option.value)
      } else {
        // add the option to the selected options
        values.push(option.value)
        self._setOption(option.value)
      }
      self.config.input.value = JSON.stringify(values)
    } else {
      // for single selects
      self.config.input.value = option.value
      self.config.text = option.text
      self._setOption(option.value)
    }
    self._triggerChangeEvent(self.config.input)
    self._hide(state)
  }

  _triggerChangeEvent (element) {
    if (document.createEventObject) {
      // IE
      const event = document.createEventObject()
      element.fireEvent('onchange', event)
    } else {
      const event = document.createEvent('HTMLEvents')
      event.initEvent('change', true, true)
      element.dispatchEvent(event)
    }
  }

  _setOption (value) {
    const self = this
    this.config.options.forEach((compare) => {
      if (self.config.multiple) {
        compare.selected = String(compare.value) === String(value) ? true : compare.selected
      } else {
        compare.selected = (String(compare.value) === String(value))
      }
    })
  }

  _unsetOption (value) {
    this.config.options.forEach((compare) => {
      compare.selected = String(compare.value) === String(value) ? false : compare.selected
    })
  }

  _hide (state, listener) {
    state.visible = false
    m.redraw()
    if (listener) {
      document.removeEventListener('click', listener)
    }
  }

  _show () {
    this.state.visible = true
  }

  _search (term, string) {
    return string.substr(0, term.length > 3 ? string.length : term.length).search(new RegExp(term, 'i')) > -1
  }

  _setSearchTerm (state, vnode) {
    state.searchTerm = String(vnode.dom.value)
  }

  _dedupeSelected () {
    let selected = false
    this.config.options.forEach((option) => {
      if (option.selected) {
        if (selected) {
          option.selected = false
        } else {
          selected = option
        }
      }
    })
    return selected
  }

  _createInput (input) {
    const hiddenInput = document.createElement('input')
    hiddenInput.type = 'hidden'
    hiddenInput.name = input.name
    hiddenInput.className = input.className
    input.name += '_original'
    input.className = ''
    input.parentNode.insertBefore(hiddenInput, input)
    return hiddenInput
  }

  _stopPropagation (e) {
    e.stopPropagation()
  }

  _registerScrollVanish (state) {
    const self = this
    const _hideOnScroll = function (e) {
      state.visible = false
      window.removeEventListener('scroll', _hideOnScroll, false)
    }
    window.addEventListener('scroll', _hideOnScroll)
  }

  _positionFixedly (vnode, parent) {
    const self = this

    const inputPosition = parent.getBoundingClientRect()
    if (inputPosition.left < parent.clientWidth) {
      vnode.dom.style.left = inputPosition.left + 'px'
    } else {
      vnode.dom.style.right = (window.innerWidth - inputPosition.right) + 'px'
    }

    if (parent.getBoundingClientRect().bottom > (window.innerHeight * 0.75)) {
      vnode.dom.style.bottom = (window.innerHeight - inputPosition.top) + 'px'
    } else {
      vnode.dom.style.top = (inputPosition.top + parent.clientHeight) + 'px'
    }
  }

  _positionAbsolutely (vnode, parent) {
    const self = this
    // just in case there's no parent with a non-static position
    document.body.style.position = 'relative'

    const inputPosition = {
      top: parent.offsetTop + parent.offsetHeight,
      left: parent.offsetLeft,
      right: parent.offsetParent.clientWidth - (parent.offsetLeft + parent.offsetWidth),
      bottom: parent.offsetParent.clientHeight - parent.offsetTop
    }
    if (inputPosition.left < parent.clientWidth) {
      vnode.dom.style.left = inputPosition.left + 'px'
    } else {
      vnode.dom.style.right = inputPosition.right + 'px'
    }

    if (parent.getBoundingClientRect().bottom > (window.innerHeight * 0.75)) {
      vnode.dom.style.bottom = inputPosition.bottom + 'px'
    } else {
      vnode.dom.style.top = inputPosition.top + 'px'
    }
  }

  _renderLabels (options, state) {
    const self = this
    return options.filter((option) => {
      return option.selected
    }).map((option) => {
      return m('span', {
        class: `label`,
        onclick: self._selectOption.bind(self, option, state)
      },
        option.text
      )
    })
  }

  _renderOption () {
    const self = this
    return {
      view (vnode) {
        return m('div', {
          class: `option ${vnode.attrs.option.selected ? '-selected' : ''}`,
          onclick: self._selectOption.bind(self, vnode.attrs.option, vnode.attrs.state)
        },
          vnode.attrs.option.text
        )
      }
    }
  }

  _renderOptions () {
    const self = this
    return {
      view (vnode) {
        return self.config.options.filter(option => {
          if (vnode.attrs.searchTerm) {
            return self._search(vnode.attrs.searchTerm, option.text)
          }
          return true
        }).map(option => {
          return m(self._renderOption(), {option: option, state: vnode.attrs})
        })
      }
    }
  }

  _renderSelect (state) {
    const self = this
    const Search = {
      view (vnode) {
        return m('input', {
          class: 'search',
          type: 'text',
          placeholder: 'search...',
          onkeyup: self._setSearchTerm.bind(this, vnode.attrs, vnode),
          autofocus: true,
          value: vnode.attrs.searchTerm
        })
      }
    }
    const Dropdown = {
      state: {
        searchTerm: null
      },
      oncreate (vnode) {
        vnode.dom.style.width = self.config.clientWidth + 'px'
        vnode.dom.style.position = self.config.position

        if (self.config.position === 'fixed') {
          self._registerScrollVanish(vnode.attrs)
        }

        if (self.config.position === 'fixed') {
          self._positionFixedly(vnode, vnode.attrs.dom)
        } else {
          self._positionAbsolutely(vnode, vnode.attrs.dom)
        }

        const hide = document.addEventListener('click', self._hide.bind(null, vnode.attrs, hide))
      },
      view (vnode) {
        let contents = [ m(self._renderOptions(), this.state) ]
        if (self.config.search) {
          contents.unshift(m(Search, this.state))
        }
        return m('div', {class: 'select-options'}, contents)
      }
    }
    return {
      state,
      oncreate (vnode) {
        this.state.dom = vnode.dom
      },
      _showDropdown () {
        if (this.state.visible) {
          return m(Dropdown, this.state)
        }
      },
      view (vnode) {
        return [
          m('div', {class: 'select-value', onclick: self._show.bind(this)}, self.config.multiple ? self._renderLabels(self.config.options, state) : self.config.text),
          this._showDropdown()
        ]
      }
    }
  }
}

module.exports = Select
