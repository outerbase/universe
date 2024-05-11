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
