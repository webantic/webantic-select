## Webantic Select

A lightweight, no-css select library. 

Markup generated is super-minimal and confirms to [RSCSS](http://rscss.io) guidelines for easy styling.

### Usage

Install with `npm i --save @webantic/select`

Just require (use something like [browserify](http://browserify.org/)), give it either a text input element or a select element and you're good to go.

```javascript
   var Select = require('@webantic/select')

   var myDropdown = new Select(document.querySelector(".js-select"), {
     options: [
      {
        text: 'One',
        value: 1,
        selected: true
      },
      {
        text: 'Two',
        value: 2
      },
      {
        text: 'Three',
        value: 3
      }
     ]
   })
```

If you use a select element, the options will be parsed automatically and used. So will the `multiple` attribute if present

When you're ready to grab the value from the DOM you can do so by looking for the element with the same name as your original input. You can also use the `.value()` method

e.g. if you used a select with a name of `gender` you should see a gender field in your formData still. (for multi-select elements you'll need to `JSON.parse` the value to get an array)

### Config

You can pass a config object as a second argument to the constructor.

**options**: (required for text inputs). An array of options. e.g.

```javascript
  [ 
    {
      value: 33,
      text: "thirty three",
      selected: true
    },
    {
      value: "Ad0s9a8dS",
      text: "Paul"
    }
  ]
```

**position**: (default fixed) either `"absolute"` or `"fixed"`. Represents the css position type. If fixed is used the dropdown will disappear on scroll. 

**multiple**: (default false) either `true` or `false`, if you want to enable multiple selections

**search**: (default false) either `true` or `false`, whether you want to enable text search in the dropdown - useful for big datasets. 

