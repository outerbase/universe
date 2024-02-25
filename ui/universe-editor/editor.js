import './prism/prism.js';          // Defines the Prism object
import './prism/prism-sql.min.js';  // Defines tokens for SQL langauge

// Plugins
import { registerKeyboardShortcuts } from './js/keyboard.js';
import { registerLineNumbers, updateLineNumbersHeight } from './js/line-number.js';
import { registerScrollbars } from './js/scrollbar.js';
import { registerHoverKeywords } from './js/hover-keywords.js';

// Styles
import defaultStyles from './styles/default.js';
import scrollbarStyles from './styles/scrollbar.js';
import lineNumberStyles from './styles/line-number.js';

// Themes
import moondustTheme from './themes/moondust.js';
import invasionTheme from './themes/invasion.js';

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

var templateEditor = document.createElement("template");
templateEditor.innerHTML = `
<div id="outer-container" class="moondust">
    <div id="container" class="dark">
        <!-- The line number container to draw a new number for each line -->
        <div id="line-number-container">
            <div>1</div>
        </div>

        <div id="code-container">
            <!-- The div is used to highlight the active line -->
            <div class="background-highlight"></div>

            <!-- The textarea is used to capture user input -->
            <textarea class="editor" spellcheck="false"></textarea>

            <!-- The code element is used to display the syntax highlighted code -->
            <pre><code></code></pre>
        </div>
    </div>

    <div id="scrollbar-bottom">
        <div id="scrollbar-bottom-thumb"></div>
    </div>
</div>
`;

export class OuterbaseEditorLite extends HTMLElement {
    // The DOM element of the outer parent container
    outerContainer = null;
    // The DOM element of the parent container
    container = null;
    //
    codeContainer = null;
    // The DOM element of the scrollbar
    scrollbarBottom = null;
    // The DOM element of the scrollbar thumb
    scrollbarBottomThumb = null;
    // The text to display in the editor
    code = "";
    // The DOM element of the textarea
    editor = null;
    // The DOM element where the syntax highlighted code is displayed
    visualizer = null;
    // TODO: Needs to be implemented
    schema = {}

    static get observedAttributes() {
        return [
            // The text to display in the editor
            "code",
            // The code language to use for syntax highlighting
            "language",
            // The theme to use for syntax highlighting, such as "Moondust"
            "theme",
            // The secondary theme for light/dark mode, "light" or "dark"
            "mode",
            // The height of the editors parent container
            "height",
            // The database schema to use for syntax highlighting
            "schema",

            //
            "show-line-numbers",
            //
            "show-keyword-tooltips",
        ];
    }

    constructor() {
        super();

        // Default web component setup
        this.shadow = this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = templateEditor.innerHTML;

        // Preserve the references to the textarea and code elements
        this.outerContainer = this.shadow.getElementById("outer-container");
        this.container = this.shadow.getElementById("container");
        this.codeContainer = this.shadow.getElementById("code-container");
        this.scrollbarBottom = this.shadow.getElementById("scrollbar-bottom");
        this.scrollbarBottomThumb = this.shadow.getElementById("scrollbar-bottom-thumb");
        this.editor = this.shadow.querySelector(".editor");
        this.visualizer = this.shadow.querySelector("code");

        // Import the required styles for the editor
        // const styleSheet = new CSSStyleSheet();
        // styleSheet.replaceSync(defaultStyles);

        // const styleScrollbar = new CSSStyleSheet();
        // styleScrollbar.replaceSync(scrollbarStyles);

        // const styleLineNumber = new CSSStyleSheet();
        // styleLineNumber.replaceSync(lineNumberStyles);

        // // Import the supported themes
        // const styleMoondust = new CSSStyleSheet();
        // styleMoondust.replaceSync(moondustTheme);

        // const styleInvasion = new CSSStyleSheet();
        // styleInvasion.replaceSync(invasionTheme);

        // // Apply the styles to the shadow DOM
        // this.shadow.adoptedStyleSheets = [styleSheet, styleScrollbar, styleLineNumber, styleMoondust, styleInvasion];

        // Previously we were using `adoptedStyleSheets` to apply the styles to the shadow DOM
        // with `new CSSStyleSheet()` but it's not supported in all browsers yet. So we're using
        // the `applyStyle` method to apply the styles to the shadow DOM instead.
        this.applyStyle(this.shadow, defaultStyles);
        this.applyStyle(this.shadow, scrollbarStyles);
        this.applyStyle(this.shadow, lineNumberStyles);
        this.applyStyle(this.shadow, moondustTheme);
        this.applyStyle(this.shadow, invasionTheme);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "code") {
            this.editor.value = newValue;
            this.updateLineNumbers();
            
            // This timeout is necessary to ensure that the syntax highlighting is applied
            // after the web component has initially rendered after code was made available.
            setTimeout(() => {
                this.render(["syntax"]);
            }, 0);
        }

        if (name === "language") {
            this.visualizer.className = `language-${newValue}`;
        }

        if (name === "theme") {
            this.outerContainer.className = newValue;
        }

        if (name === "mode") {
            this.container.className = newValue;
        }
    }

    connectedCallback() {
        this.editor.addEventListener("mousedown", (e) => {
            requestAnimationFrame(() => {
                this.render(["line"]);
            });
        });

        this.editor.addEventListener('focus', () => {
            const backgroundHighlight = this.shadow.querySelector('.background-highlight');
            backgroundHighlight.style.opacity = 1;
        });

        this.editor.addEventListener('blur', () => {
            const backgroundHighlight = this.shadow.querySelector('.background-highlight');
            backgroundHighlight.style.opacity = 0;
        });

        // Initial adjustment in case of any pre-filled content
        this.render(["syntax"]);


        /**
         * TODO:
         * 
         * Need to figure out how to dynamically register plugins that are requested
         * based on their existence, or by allowing the files themselves to register
         * themselves with the editor.
         */

        // Register all plugins
        registerKeyboardShortcuts(this);
        registerLineNumbers(this);
        registerScrollbars(this);

        if (this.getAttribute("show-keyword-tooltips") === "true") {
            registerHoverKeywords(this);
        }
    }

    applyStyle(shadowRoot, cssText) {
        const styleEl = document.createElement('style');
        styleEl.textContent = cssText;
        shadowRoot.appendChild(styleEl);
    }

    /**
     * Controls the rendering updates for the various components of the editor.
     * @param {*} options - An array of options to render updates for, such as `line` or `syntax`
     */
    render(options) {
        // If `options` contains `line`, then we need to highlight the active line
        if (options.includes("line")) {
            this.highlightActiveLine();
            this.highlightActiveLineNumber();
        }

        // If `options` contains `syntax`, then we need to redraw the syntax highlighting
        // related parts to the code editor
        if (options.includes("syntax")) {
            this.redrawSyntaxHighlighting();
            this.adjustTextAreaSize();
        }
    }

    adjustTextAreaSize() {
        // Height is number of lines * line height
        const lineHeight = parseFloat(getComputedStyle(this.editor).lineHeight);
        const lineCount = this.editor.value.split("\n").length;
        const height = lineCount * lineHeight;

        // Set height of elements based on contents
        updateLineNumbersHeight(this, height);
        this.editor.style.height = `${height}px`;
    
        // Set width of elements based on contents
        this.editor.style.width = Math.max(this.editor.offsetWidth + 1, this.editor.scrollWidth) + 'px';    
        this.shadow.querySelector(".background-highlight").style.width = this.editor.style.width;
    }

    updateLineNumbers() {
        const lineCount = this.editor.value.split("\n").length;
        const lineNumberContainer = this.shadow.getElementById("line-number-container");
        lineNumberContainer.innerHTML = ''; // Clear existing line numbers
    
        for (let i = 1; i <= lineCount; i++) {
            const lineNumberDiv = document.createElement("div");
            lineNumberDiv.textContent = i;
            lineNumberContainer.appendChild(lineNumberDiv);
        }

        this.render(["line"]);
    }

    highlightActiveLine() {
        const lineHeight = parseFloat(getComputedStyle(this.editor).lineHeight);
        const lineNumber = this.editor.value.substr(0, this.editor.selectionStart).split("\n").length;
        const highlightPosition = (lineNumber - 1) * lineHeight;
        const backgroundHighlight = this.shadow.querySelector('.background-highlight');
        
        requestAnimationFrame(() => {
            backgroundHighlight.style.top = `${highlightPosition}px`;

            // Animate the `backgroundHighlight` component by scaling up and down
            // to create a smooth transition between active lines
            backgroundHighlight.style.transform = 'scaleY(1.25)';
            setTimeout(() => {
                backgroundHighlight.style.transform = 'scaleY(1)';
            }, 200);
        });
    }

    highlightActiveLineNumber() {
        const lineNumber = this.editor.value.substr(0, this.editor.selectionStart).split("\n").length;
        const lineNumbers = this.shadow.querySelectorAll("#line-number-container div");
    
        // Remove the active class from all line numbers
        lineNumbers.forEach(line => {
            line.classList.remove('active-line-number');
        });
    
        // Add the active class to the current line number
        if (lineNumbers[lineNumber - 1]) {
            lineNumbers[lineNumber - 1].classList.add('active-line-number');
        }
    }

    redrawSyntaxHighlighting() {
        this.visualizer.innerHTML = this.editor.value;
        
        try {
            Prism.highlightElement(this.visualizer);
        } catch (error) { }
    }
}

window.customElements.define("outerbase-editor", OuterbaseEditorLite);