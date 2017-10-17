// @ts-check

import { Template } from 'meteor/templating'
import { Tracker } from 'meteor/tracker'

const ENTER_KEY_CODE = 13

Template.tag_component.events({
  /**
   * Event handler for when the user presses "enter" in the search field. Will
   * add a new option to the select if it does not already exist.
   *
   * @param {any} event
   * @param {any} template
   */
  // eslint-disable-next-line
  'keypress .search' (event, template) {
    const keyCode = event.keyCode || event.which
    const target = event.currentTarget

    if (keyCode === ENTER_KEY_CODE) {
      event.preventDefault()

      const values = Template.currentData().tags.get()
      const newTagValue = target.value

      // Check if the entered text matches any of the existing options
      const foundValueIdx = values.findIndex((value) => value.value === newTagValue)

      // If the entered text either doesn't match an existing option, or the
      // existing option is not currently selected
      if (foundValueIdx === -1 || !values[foundValueIdx].selected) {
        // If the entered text is for a new option...
        if (foundValueIdx === -1) {
          // ...add a new option
          values.push({
            value: newTagValue,
            text: newTagValue,
            selected: true
          })
        } else {
          // If the option already exists, mark it as selected
          values[foundValueIdx].selected = true
        }

        // Update the ReactiveVar datasource
        Template.currentData().tags.set(values)

        // Clear the search box
        Tracker.afterFlush(function onAfterFlush () {
          target.value = ''
        })
      }
    }
  },
  /**
   * Event handler for when the select's data changes. Ensures our ReactiveVar
   * datasource is up to date
   * 
   * @param {any} event
   * @param {any} template
   */
  // eslint-disable-next-line
  'change .js-tags' (event, template) {
    // Extract the list of selected options from the select
    const values = template.select.value()

    // Map the current options, setting selected/deselected and then set our
    // ReactiveVar datasource to the result
    Template.currentData().tags.set(Template.currentData().tags.get().map((item) => {
      item.selected = values.includes(item.value)
      return item
    }))
  }
})
