import './prism/prism.js' // Defines the Prism object
import './prism/prism-sql.min.js' // Defines tokens for SQL langauge

// Plugins
import { CoreEditor } from './js/core-editor.js'
import { CoreLineNumbers } from './js/core-line-numbers.js'
import { CoreLineHighlight } from './js/core-line-highlight.js'
import { CoreKeyboardShortcuts } from './js/core-shortcuts.js'

// Styles
import defaultStyles from './styles/default.js'

// Themes
import moondustTheme from './themes/moondust.js'
import invasionTheme from './themes/invasion.js'

const templateEditor = document.createElement('template')
templateEditor.innerHTML = `
<div id="container" class="moondust light">
    <div id="layout-container">
        <div id="left"></div>
        <div id="center"></div>
        <div id="right"></div>
    </div>
</div>
`

export class OuterbaseEditor extends HTMLElement {
    static get observedAttributes() {
        return ['code', 'language', 'mode', 'theme']
    }

    plugins = []

    constructor() {
        super()

        this.attachShadow({ mode: 'open' })
        this.shadowRoot.appendChild(templateEditor.content.cloneNode(true))

        // Apply default styles
        this.applyStyle(defaultStyles)

        // Apply styles for themes
        this.applyStyle(moondustTheme)
        this.applyStyle(invasionTheme)

        // Register an empty array of plugins by default
        this.registerPlugins([])
    }

    connectedCallback() {
        // Initialize plugins when the component is attached to the DOM
        this.initPlugins()
    }

    /**
     * Handle attribute changes for the component. This function is called when
     * an attribute is changed on the component. The function broadcasts the
     * attribute change to all registered plugins. The `theme` attribute is used
     * to change the theme of the editor. The `mode` attribute is used to change
     * the editor between `light` or `dark` mode.
     * @param {string} name – The name of the attribute that changed
     * @param {string} oldValue – The previous value of the attribute
     * @param {string} newValue – The new value of the attribute
     * @returns void
     */
    attributeChangedCallback(name, oldValue, newValue) {
        requestAnimationFrame(() => {
            this.broadcastEvent(this, 'attributeChangedCallback', { name, oldValue, newValue })
        })

        if (name === 'theme') {
            this.shadowRoot.querySelector('#container').className = newValue
        }

        if (name === 'mode') {
            this.shadowRoot.querySelector('#layout-container').className = newValue
        }
    }

    /**
     * Initialize each plugin instance that has been registered. This function
     * iterates over each plugin and checks if the plugin has a valid value for
     * the attribute that it is listening for. If the plugin has a valid value,
     * the plugin is initialized and placed in the DOM. The `init` function of
     * each plugin is called after the plugin is placed in the DOM.
     * @returns void
     */
    initPlugins() {
        // Initialize each plugin instance that has been registered. Check
        // if the attribute has a valid value before initializing the plugin.
        this.plugins.forEach((plugin) => {
            if (
                this.containsEvent(plugin.attributeName) &&
                this.getAttribute(plugin.attributeName()) === null &&
                plugin.attributeName() !== 'core'
            ) {
                return
            }

            if (this.containsEvent(plugin.location) && this.containsEvent(plugin.html)) {
                let location = this.shadowRoot.getElementById(plugin.location())
                const insertBefore = this.containsEvent(plugin.insertBefore) ? plugin.insertBefore() : false
                const div = document.createElement('div')
                div.innerHTML = plugin.html()

                // Set an ID for the plugin for future reference, particularly for
                // plugins that need to be a parent of another plugin.
                const random = Math.floor(100000 + Math.random() * 900000)
                div.id = random
                plugin.id = random

                if (this.containsEvent(plugin.insertAsChild) && plugin.insertAsChild()) {
                    location = this.shadowRoot.querySelector(plugin.insertAsChild())
                }

                if (this.containsEvent(plugin.css)) {
                    this.applyStyle(plugin.css())
                }

                if (insertBefore) {
                    location.insertBefore(div, location.childNodes[0])
                } else {
                    location.appendChild(div)
                }
            }

            // Run the `init` function of the plugin after its placed in the DOM
            if (this.containsEvent(plugin.init)) {
                plugin.init(this, this.getAttribute(plugin.attributeName()))
            }

            // Now that all plugins are initialized, we can check if any plugins should be
            // a parent of another plugin. This is useful for plugins that need to wrap
            // other plugins in a container.
            this.plugins.forEach((plugin) => {
                if (this.containsEvent(plugin.insertAsParent) && plugin.insertAsParent()) {
                    const parent = this.shadowRoot.getElementById(plugin.id)
                    const parentOf = this.shadowRoot.querySelector(plugin.insertAsParent())
                    const slot = parent.querySelector('slot')
                    slot.appendChild(parentOf)
                }
            })
        })
    }

    /**
     * Register plugins with the editor. This function accepts an array of plugin
     * instances and sets the `plugins` property to the array. The `corePlugins`
     * property is set to an array of core plugins that are always registered.
     * @param {Array} plugins – An array of plugin instances to register with the editor
     * @returns void
     * @example
     * editor.registerPlugins([new PluginA(), new PluginB()]);
     */
    registerPlugins(plugins) {
        this.corePlugins = [new CoreEditor(), new CoreLineNumbers(), new CoreLineHighlight(), new CoreKeyboardShortcuts()]

        this.plugins = [...this.corePlugins, ...plugins]
    }

    /**
     * Check if the event is a valid and callable function.
     * @param {*} event
     * @returns boolean
     */
    containsEvent(event) {
        return typeof event === 'function'
    }

    /**
     * Broadcast an event to all registered plugins. This function iterates over
     * each plugin and calls the method with the same name as the broadcastName
     * parameter. The event object is passed to the receiving plugin. If the plugin
     * does not have a method with the same name as the broadcastName, the plugin
     * is skipped.
     * Do not broadcast events that start with an underscore. These events are
     * considered private and are not intended to be broadcasted to other plugins.
     * @param {*} fromPlugin – The plugin class instance that is broadcasting the event
     * @param {*} broadcastName – The name of the event to broadcast
     * @param {*} event – The event object to pass to the receiving plugin
     */
    broadcastEvent(fromPlugin, broadcastName, event) {
        if (broadcastName.startsWith('_')) return

        this.plugins.forEach((plugin) => {
            if (this.containsEvent(plugin[broadcastName]) && plugin != fromPlugin) {
                plugin[broadcastName](event)
            }
        })
    }

    /**
     * Apply styles to the shadow DOM from a CSS string. This function creates a
     * style element, sets the CSS text content, and appends it to the shadow DOM.
     * @param {string} cssText – A string containing CSS to apply to the shadow DOM
     */
    applyStyle(cssText) {
        const styleEl = document.createElement('style')
        styleEl.textContent = cssText
        this.shadowRoot.appendChild(styleEl)
    }
}

customElements.define('universe-editor', OuterbaseEditor)
