<div align="center">
    <h1>Universe</h1>
    <a href="https://www.npmjs.com/package/@outerbase/universe"><img src="https://img.shields.io/npm/v/@outerbase/universe.svg?style=flat" /></a>
    <a href="https://github.com/outerbase/universe/blob/main/CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" /></a>
    <a href="https://github.com/"><img src="https://img.shields.io/badge/license-MIT-blue" /></a>
    <a href="https://discord.gg/4M6AXzGG84"><img alt="Discord" src="https://img.shields.io/discord/1123612147704934400?label=Discord"></a>
    <br />
    <br />
    <a href="https://www.outerbase.com/">Website</a>
    <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
    <a href="https://www.docs.outerbase.com/">Docs</a>
    <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
    <a href="https://www.outerbase.com/blog/">Blog</a>
    <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
    <a href="https://discord.gg/4M6AXzGG84">Discord</a>
    <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
    <a href="https://twitter.com/outerbase">Twitter</a>
    <br />
    <hr />
</div>

## What is Universe?

Universe is a lightweight, extensible code editor that can be used anywhere on the web.

-   [**Core Components**](#core-components): Essentials of a code editor.
-   [**Syntax Highlighting**](#syntax-highlighting): Style your code tokens based on your language.
-   [**Theme Support**](#theme-support): Customize how your code syntax looks.
-   [**Custom Plugins**](#custom-plugins): Extend the functionality with custom plugins.

## Usage

You do not need have to build or compile Universe yourself to use it.

-   Load directly from our CDN
-   Host the bundle.js yourself
-   `npm install` into your project

TypeScript support is built-in, **not** required.

Declaring an instance of the editor in your HTML you can do the following:

```html
<universe-editor language="sql" mode="dark" theme="invasion" code="SELECT * FROM table"> </universe-editor>
```

For more advanced scenarios perhaps you need to declare properties more ad-hoc and you can do it with this method as well:

```html
<script>
    document.addEventListener('DOMContentLoaded', function () {
        // Create an instance of OuterbaseEditor
        const outerbaseEditor = document.createElement('universe-editor')
        outerbaseEditor.setAttribute('language', 'sql')
        outerbaseEditor.setAttribute('mode', 'dark')
        outerbaseEditor.setAttribute('theme', 'invasion')
        outerbaseEditor.setAttribute('code', 'SELECT * FROM table;')

        // Create instances of plugins
        const pluginA = new PluginA()
        outerbaseEditor.setAttribute('plugin-a', 'some value that plugin expects')

        // Register plugins with OuterbaseEditor
        outerbaseEditor.registerPlugins([pluginA])

        // Append OuterbaseEditor to the DOM
        document.body.appendChild(outerbaseEditor)

        // Listen to event `change` to get the code from the editor
        outerbaseEditor.addEventListener('change', (event) => {
            console.log(event.detail.code)
        })
    })
</script>
```

## Example

To view an example of Universe in action you can clone this repository and run `npx serve .` and visit the address it provides, then append `/ui/index.html`.

## Core Components

Included in Universe are some core components that by default are utilized to help render necessary visual aspects of our code editor.

-   **Core Editor** - Shows the syntax highlighted code and input area for the user.
-   **Core Line Numbers** - Line numbers that appear to the left of the code editor.
-   **Core Line Highlighting** - A visual indication of what line is currently selected, a basic background div.
-   **Core Shortcuts** - Non-visual keyboard listening class to perform custom actions when key combinations are triggered.

## Syntax Highlighting

Syntax highlighting today is supported by [Prism](https://prismjs.com/download.html). If you look at the `.ui/prism/*` there are default files there to support both Javascript and SQL syntax highlighting. To support additional languages we would advise to download new Prism styles and add them to this folder.

To declare which language you are using with Universe you pass in the language as a property:

```html
<universe-editor language="sql"></universe-editor>
```

> Note: By default we only support `sql` and `javascript` as language values.

## Theme Support

Adding additional themes is made quite easy and mostly driven by CSS stylesheets.

1. Add a new file to the `./ui/themes` folder that exports a CSS string overriding values. Refer to `invasion.js` and `moondust.js` on how we override token value styles. Refer to [Prism](https://prismjs.com) to learn more about what tokens are made available for overriding and it should be dependent on the language you are making themes for.

2. Add your new stylesheet export to the `index.js` file where we already apply the two other default themes

```ts
// Apply styles for themes
this.applyStyle(moondustTheme)
this.applyStyle(invasionTheme)
this.applyStyle(INSERT_YOUR_THEME) // <- Add your styles
```

## Custom Plugins

Extensibility is a primary objective of what we set out to achieve with Universe and we accomplish this by allowing anyone to write their own plugins that add to or alter the behavior of the code editor.

```ts
export class PluginA {
    constructor() {}

    init(parent, attributeValue) {
        // Parent is an instance of the outerbase component
        // attributeValue is the value of the attribute on the outerbase component
    }

    attributeName() {
        return 'plugin-a'
    }

    css() {
        return `.pluginClass { color: red; }`
    }

    html() {
        return `<div class="pluginClass">Hello World</div>`
    }

    location() {
        // Can be 'left', 'right', 'center'
        return 'left'
    }

    insertAsParent() {
        // Can be a CSS selector, default is false
        return false
    }

    insertAsChild() {
        // Can be a CSS selector, default is false
        return false
    }

    insertBefore() {
        // Can be true or false, default is false
        return 1
    }

    attributeChangedCallback({ name, oldValue, newValue }) {
        // Handle attribute changes if desired
    }

    onFocus() {}

    onBlur() {}

    onInputChange(value) {}

    onKeyDown(event) {}

    onMouseDown() {}

    onMouseUp() {}
}

window.PluginA = PluginA
```

## Contributing

If you want to add contributions to this repository, please follow the instructions [here](contributing.md).

## Support

For support join our community on [Discord](https://discord.gg/4M6AXzGG84). For enterprise solutions contact us at [support@outerbase.com](mailto:support@outerbase.com)

## License

This project is licensed under the MIT license. See the [LICENSE](./LICENSE.txt) file for more info.

## Our Contributors

<img align="left" src="https://contributors-img.web.app/image?repo=outerbase/universe"/>
