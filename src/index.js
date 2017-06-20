const m = require('mithril')
const _ = require('lodash')

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
      self.config.options = Array.apply(null, input.options).map((option) => {
        return {
          value: option.value,
          text: option.text,
          selected: option.selected
        }
      })
      // _hide input and render text element 
      input.style.display = 'none'
      self.config.input = self._createInput(input)

    // TODO: grab multiple and disabled attrs
    } else {
      self.config.input = input
    }

    self.config.input.style.display = 'none'

    // grab initial value
    const selectedOption = self._dedupeSelected() || {value: null, text: ''}
    self.config.input.value = selectedOption.value
    self.config.text = selectedOption.text

    // use placeholder as iniital value in leiu of a real one
    if (!self.config.text && input.placeholder) {
      self.config.text = input.placeholder
    }

    // render pseudo select
    m.mount(self.config.root, self._renderSelect(self.config))
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

  _setOption (option, state) {
    const self = this
    self.config.input.value = option.value
    state.text = option.text
    self.config.options.forEach((compare) => {
      compare.selected = compare.value === option.value
    })
    self._hide(state)
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
    hiddenInput.type = 'text'.name
    input.name += '_original'
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

  _renderOption () {
    const self = this
    return {
      view(vnode) {
        return m('div', {
          class: `option ${vnode.attrs.option.selected ? '-selected' : ''}`,
          onclick: self._setOption.bind(self, vnode.attrs.option, vnode.attrs.state)
        },
          vnode.attrs.option.text)
      }
    }
  }

  _renderDropdown () {
    const self = this
    return {
      oncreate(vnode) {
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

        const _hide = document.addEventListener('click', self._hide.bind(null, vnode.attrs, _hide))
      },
      view(vnode) {
        return m('div', {class: 'select-options'}, self.config.options.map(option => {
          return m(self._renderOption(), {option: option, state: vnode.attrs})
        }))
      }
    }
  }

  _renderSelect (state) {
    const self = this
    return {
      state,
      oncreate(vnode) {
        this.state.dom = vnode.dom
      },
      _showDropdown() {
        if (this.state.visible) {
          return m(self._renderDropdown(), this.state)
        }
      },
      view(vnode) {
        return [
          m('div', {class: 'select-input', contenteditable: true,  onclick: self._show.bind(this)}, m.trust(state.text)),
          this._showDropdown()
        ]
      }
    }
  }
}

module.exports = Select
