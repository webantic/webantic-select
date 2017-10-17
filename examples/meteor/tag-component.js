// @ts-check

import Select from '@webantic/select'
import { Template } from 'meteor/templating'

/*
 * Select elements are passed to this component in a ReactiveVar called `tags
 * i.e. {{> tag_component tags=tags}}
 */

Template.tag_component.onRendered(function tag_component_onRendered () {
  /**
   * Get the latest options and other params for the select
   */
  this.getSelectOptions = () => {
    const selectOptions = {
      multiple: Boolean(Template.currentData().multiple),
      options: Template.currentData().tags.get(),
      search: true
    }

    return selectOptions
  }

  // Create the select
  this.select = new Select(
    this.$('.js-tags')[0],
    this.getSelectOptions()
  )

  this.autorun(() => {
    // Whenever Template.currentData().tags changes, the select will be updated
    this.select.updateOptions(Template.currentData().tags.get())
  })
})
