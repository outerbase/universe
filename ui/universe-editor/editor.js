import './prism/prism.js' // Defines the Prism object
// -- this line prevents VS code from re-ordering these 2 imports
import './prism/prism-sql.min.js' // Defines tokens for SQL langauge

// Plugins
import { registerKeyboardShortcuts } from './js/keyboard.js'
import { registerHoverKeywords } from './js/hover-keywords.js'

// Styles
import defaultStyles from './styles/default.js'
import lineNumberStyles from './styles/line-number.js'

// Themes
import moondustTheme from './themes/moondust.js'
import invasionTheme from './themes/invasion.js'

/**
 * TODO:
 * - Rename some of the divs such as `outer-container`, `container`, `code-container`, etc.
 * - Can we refactor the other `js` files to inject their HTML + CSS into the shadow DOM like the `hover-keywords.js` file?
 * - Width is not properly calculating leaving horizontal scrolling when no long text exists
 * - Rename scrollbar to be horizontalScrollbar
 * - Add support for database schema syntax highlighting
 * - Add empty DOM zones for plugins to inject themselves either `above` or `below` the editor
 */

/**
 * Tips for writing better SQL to present to users:
 * REF: https://medium.com/learning-sql/12-tips-for-optimizing-sql-queries-for-faster-performance-8c6c092d7af1
 *
 * - Include a WHERE clause to filter down the result set
 * - Use LIMIT to limit the number of rows returned
 * - Do not use SELECT * to select all columns
 * - Minimize the user of wildcard characters such as *, %, and _
 * - Indexes increase READ speed but slow down WRITE speed
 * - Using the correct data type can improve performance on columns, such as using INT instead of VARCHAR
 * - Avoid subqueries and instead use JOINs
 * - Use EXISTS instead of IN
 * - Use STORED PROCEDUREs
 * - Use UNION ALL instead of UNION
 * - Use `IN` instead of `OR` -- WHERE state_id=3 OR state_id=11 OR state_id=34  vs  WHERE state_id IN (3,11,34) -- (IN is faster)
 * - Use TRUNCATE instead of DELETE to remove all rows from a table
 */

let templateEditor, OuterbaseEditorLite
if (typeof document !== 'undefined') {
    templateEditor = document.createElement('template')
    templateEditor.innerHTML = `
<div id="outer-container" class="moondust">
    <outerbase-scrollable axis="vertical" id="vertical-scroller">
        <div id="container" class="dark">
            <!-- The line number container to draw a new number for each line -->
            <div id="line-number-container">
                <div>1</div>
            </div>

            <div id="scrolley-codey">
            <outerbase-scrollable axis="horizontal" id="horizontal-scroller">
                <div id="code-container">
                    <!-- The div is used to highlight the active line -->
                    <div class="background-highlight"></div>

                    <!-- The textarea is used to capture user input -->
                    <textarea class="editor" spellcheck="false"></textarea>

                    <!-- The code element is used to display the syntax highlighted code -->
                    <pre><code></code></pre>
                </div>
                </outerbase-scrollable>
                </div>
        </div>
    </outerbase-scrollable>
</div>
`

    OuterbaseEditorLite = class OuterbaseEditorLite extends HTMLElement {
        // The DOM element of the outer parent container
        outerContainer = null
        // The DOM element of the parent container
        container = null
        //
        codeContainer = null
        // The DOM element of the scrollbar
        scrollbarBottom = null
        // The DOM element of the scrollbar thumb
        scrollbarBottomThumb = null
        // The text to display in the editor
        code = ''
        // The DOM element of the textarea
        editor = null
        // The DOM element where the syntax highlighted code is displayed
        visualizer = null
        // TODO: Needs to be implemented
        schema = {}

        static get observedAttributes() {
            return [
                // The text to display in the editor
                'code',
                // The code language to use for syntax highlighting
                'language',
                // The theme to use for syntax highlighting, such as "Moondust"
                'theme',
                // The secondary theme for light/dark mode, "light" or "dark"
                'mode',
                // The height of the editors parent container
                'height',
                // The database schema to use for syntax highlighting
                'schema',

                //
                'show-line-numbers',
                //
                'show-keyword-tooltips',
            ]
        }

        constructor() {
            super()

            if (!templateEditor) throw new Error('Missing expected templateEditor definition -- are you trying to SSR?')

            this.onMouseDown = this.onMouseDown.bind(this)
            this.onFocus = this.onFocus.bind(this)
            this.onBlur = this.onBlur.bind(this)

            // Default web component setup
            this.attachShadow({ mode: 'open' })
            this.shadowRoot.innerHTML = templateEditor.innerHTML
        }

        attributeChangedCallback(name, _oldValue, newValue) {
            if (name === 'code') {
                this.shadowRoot.querySelector('.editor').value = newValue
                this.updateLineNumbers()

                // This timeout is necessary to ensure that the syntax highlighting is applied
                // after the web component has initially rendered after code was made available.
                setTimeout(() => {
                    this.render(['syntax'])
                }, 0)
            }

            if (name === 'language') {
                this.shadowRoot.querySelector('code').className = `language-${newValue}`
            }

            if (name === 'theme') {
                this.shadowRoot.getElementById('outer-container').className = newValue
            }

            if (name === 'mode') {
                this.shadowRoot.getElementById('container').className = newValue
            }
        }

        onMouseDown(_event) {
            requestAnimationFrame(() => this.render(['line']))
        }

        onFocus(_event) {
            const backgroundHighlight = this.shadowRoot.querySelector('.background-highlight')
            backgroundHighlight.style.opacity = 1
        }

        onBlur(_event) {
            const editor = this.shadowRoot.querySelector('.editor')
            const backgroundHighlight = this.shadowRoot.querySelector('.background-highlight')
            backgroundHighlight.style.opacity = 0
            this.dispatchEvent(
                new CustomEvent('editor-change', {
                    bubbles: true,
                    composed: true,
                    detail: { value: editor.value },
                })
            )
        }

        connectedCallback() {
            const editor = (this.editor = this.shadowRoot.querySelector('.editor'))
            editor.addEventListener('mousedown', this.onMouseDown)
            editor.addEventListener('focus', this.onFocus)
            editor.addEventListener('blur', this.onBlur)

            // Previously we were using `adoptedStyleSheets` to apply the styles to the shadow DOM
            // with `new CSSStyleSheet()` but it's not supported in all browsers yet. So we're using
            // the `applyStyle` method to apply the styles to the shadow DOM instead.
            this.applyStyle(defaultStyles)
            this.applyStyle(lineNumberStyles)
            this.applyStyle(moondustTheme)
            this.applyStyle(invasionTheme)

            // Initial adjustment in case of any pre-filled content
            this.render(['syntax'])

            /**
             * TODO:
             *
             * Need to figure out how to dynamically register plugins that are requested
             * based on their existence, or by allowing the files themselves to register
             * themselves with the editor.
             */

            // Register all plugins
            registerKeyboardShortcuts.apply(this)

            if (this.getAttribute('show-keyword-tooltips') === 'true') {
                registerHoverKeywords.apply(this)
            }
        }

        disconnectedCallback() {
            const editor = this.shadowRoot.querySelector('.editor')
            if (editor) {
                editor.removeEventListener('mousedown', this.onMouseDown)
                editor.removeEventListener('focus', this.onFocus)
                editor.removeEventListener('blur', this.onBlur)
            }
        }

        applyStyle(cssText) {
            const styleEl = document.createElement('style')
            styleEl.textContent = cssText
            this.shadowRoot.appendChild(styleEl)
        }

        /**
         * Controls the rendering updates for the various components of the editor.
         * @param {*} options - An array of options to render updates for, such as `line` or `syntax`
         */
        render(options) {
            // If `options` contains `line`, then we need to highlight the active line
            if (options.includes('line')) {
                this.highlightActiveLine()
                this.highlightActiveLineNumber()
            }

            // If `options` contains `syntax`, then we need to redraw the syntax highlighting
            // related parts to the code editor
            if (options.includes('syntax')) {
                this.redrawSyntaxHighlighting()
                this.adjustTextAreaSize()
            }
        }

        adjustTextAreaSize() {
            const editor = this.shadowRoot.querySelector('.editor')

            // Height is number of lines * line height
            const lineHeight = parseFloat(getComputedStyle(editor).lineHeight)
            const lineCount = editor.value.split('\n').length
            const height = lineCount * lineHeight

            // Set height of elements based on contents
            editor.style.height = `${height}px`

            // TODO what is this for? it makes the container huge when rendered as a plugin
            //
            // Set width of elements based on contents
            // const width = Math.max(editor.offsetWidth + 1, editor.scrollWidth) + 'px'
            // editor.style.width = width
            // this.shadowRoot.querySelector('.background-highlight').style.width = editor.style.width
        }

        updateLineNumbers() {
            const editor = this.shadowRoot.querySelector('.editor')
            const lineCount = editor.value.split('\n').length
            const lineNumberContainer = this.shadowRoot.getElementById('line-number-container')
            lineNumberContainer.innerHTML = '' // Clear existing line numbers

            for (let i = 1; i <= lineCount; i++) {
                const lineNumberDiv = document.createElement('div')
                lineNumberDiv.textContent = i
                lineNumberContainer.appendChild(lineNumberDiv)
            }

            this.render(['line'])
        }

        highlightActiveLine() {
            const editor = this.shadowRoot.querySelector('.editor')
            const lineHeight = parseFloat(getComputedStyle(editor).lineHeight)
            const lineNumber = editor.value.substr(0, editor.selectionStart).split('\n').length
            const highlightPosition = (lineNumber - 1) * lineHeight
            const backgroundHighlight = this.shadowRoot.querySelector('.background-highlight')

            requestAnimationFrame(() => {
                backgroundHighlight.style.top = `${highlightPosition}px`

                // Animate the `backgroundHighlight` component by scaling up and down
                // to create a smooth transition between active lines
                backgroundHighlight.style.transform = 'scaleY(1.25)'
                setTimeout(() => {
                    backgroundHighlight.style.transform = 'scaleY(1)'
                }, 200)
            })
        }

        highlightActiveLineNumber() {
            const editor = this.shadowRoot.querySelector('.editor')
            const lineNumber = editor.value.substr(0, editor.selectionStart).split('\n').length
            const lineNumbers = this.shadowRoot.querySelectorAll('#line-number-container div')

            // Remove the active class from all line numbers
            lineNumbers.forEach((line) => {
                line.classList.remove('active-line-number')
            })

            // Add the active class to the current line number
            if (lineNumbers[lineNumber - 1]) {
                lineNumbers[lineNumber - 1].classList.add('active-line-number')
            }
        }

        redrawSyntaxHighlighting() {
            const editor = this.shadowRoot.querySelector('.editor')
            const visualizer = this.shadowRoot.querySelector('code')
            visualizer.innerHTML = editor.value

            try {
                Prism.highlightElement(visualizer)
            } catch (error) {}
        }
    }

    window.customElements.define('outerbase-editor', OuterbaseEditorLite)
}

export { OuterbaseEditorLite }
