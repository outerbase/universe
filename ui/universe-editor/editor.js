import './prism/prism.js';
import './prism/prism-sql.min.js';

// Plugins
import { registerKeyboardShortcuts } from './js/keyboard.js';
import { registerLineNumbers } from './js/line-number.js';
import { registerScrollbars } from './js/scrollbar.js';

// Styles
import defaultStyles from './styles/default.js';
import scrollbarStyles from './styles/scrollbar.js';
import lineNumberStyles from './styles/line-number.js';

// Themes
import moondustTheme from './themes/moondust.js';
import invasionTheme from './themes/invasion.js';

/**
 * TODO:
 * - No lines should have the background selected row active by default, currently last line is active on load
 * - Break logical parts of the code into separate files
 * - Update the keyboard actions calling to pass in `this` as the first argument and remove unnecessary parameters
 * - Width is not properly calculating leaving horizontal scrolling when no long text exists
 * - Add support for database schema syntax highlighting
 */

var templateEditor = document.createElement("template");
templateEditor.innerHTML = `
<div id="outer-container">
    <div id="container" class="moondust dark">
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

            <!-- The span is used to measure the width of the textarea's content -->
            <span class="width-measure"></span>
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
    // The DOM element used to measure the width of the textarea's content
    widthMeasure = null;
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
        this.widthMeasure = this.shadow.querySelector(".width-measure");

        const styleSheet = new CSSStyleSheet();
        styleSheet.replaceSync(defaultStyles);

        const styleScrollbar = new CSSStyleSheet();
        styleScrollbar.replaceSync(scrollbarStyles);

        const styleLineNumber = new CSSStyleSheet();
        styleLineNumber.replaceSync(lineNumberStyles);

        const styleMoondust = new CSSStyleSheet();
        styleMoondust.replaceSync(moondustTheme);

        const styleInvasion = new CSSStyleSheet();
        styleInvasion.replaceSync(invasionTheme);

        this.shadow.adoptedStyleSheets = [styleSheet, styleScrollbar, styleLineNumber, styleMoondust, styleInvasion];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "code") {
            this.editor.value = newValue;
            this.updateLineNumbers();
            
            // This timeout is necessary to ensure that the syntax highlighting is applied
            // after the web component has initially rendered after code was made available.
            setTimeout(() => {
                this.redrawSyntaxHighlighting();
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
        // Keyboard shortcuts, see `keyboard-actions.js` for details
        registerKeyboardShortcuts(
            this.editor,
            this.container,
            this.codeContainer,
            this.visualizer,
            this.getAttribute("language"),
            () => this.redrawSyntaxHighlighting(),
            () => this.updateLineNumbers(),
            () => this.highlightItems(),
            () => this.adjustTextAreaSize(),
            (direction) => this.indentLine(direction),
            (event) => this.dispatchEvent(event)
        );

        this.editor.addEventListener("mousedown", (e) => {
            // When a user clicks on a row, we want to highlight the active line. A slight
            // delay is required to ensure the active line is highlighted after the click event.
            // Using `click` event instead of `mousedown` will add additional render delay.
            setTimeout(() => {
                this.highlightItems();
            }, 0);
        });

        // Initial adjustment in case of any pre-filled content
        // this.adjustTextAreaSize();
        
        // TODO: This should be optimized with logic rather than lazily using a timeout
        // to give time for the `adjustTextAreaSize` method to calculate the correct width.
        setTimeout(() => {
            registerScrollbars(this);
            registerLineNumbers(this);
        }, 100);
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

        this.highlightItems();
    }    

    adjustTextareaHeight(textarea) {
        // Reset the height to ensure we're not measuring the old content
        textarea.style.height = 'auto';

        // Height is number of lines * line height
        const lineHeight = parseFloat(getComputedStyle(this.editor).lineHeight);
        const lineCount = textarea.value.split("\n").length;
        const height = lineCount * lineHeight;

        textarea.style.height = `${height}px`;
        this.shadow.getElementById("line-number-container").style.height = `${height}px`;
    }

    adjustTextareaWidth(textarea) {
        // Copy textarea content into the widthMeasure span
        this.widthMeasure.textContent = textarea.value || textarea.placeholder;
        // Adjust the textarea width based on the widthMeasure span's width
        textarea.style.width = Math.max(this.widthMeasure.offsetWidth + 1, textarea.scrollWidth) + 'px';    

        // Adjust width of `background-highlight` div to match the width of the textarea
        this.shadow.querySelector(".background-highlight").style.width = textarea.style.width;
    }

    indentLine(direction) {
        var start = this.editor.selectionStart;
        var end = this.editor.selectionEnd;
        var selectedText = this.editor.value.substring(start, end);
        var beforeText = this.editor.value.substring(0, start);
        var afterText = this.editor.value.substring(end);

        // Find the start of the current line
        var lineStart = beforeText.lastIndexOf("\n") + 1;

        if (direction === 'right') {
            // Add a tab (or spaces) at the start of the line
            this.editor.value = beforeText.substring(0, lineStart) + "    " + beforeText.substring(lineStart) + selectedText + afterText;
            // Adjust the cursor position
            this.editor.selectionStart = start + 4; // Assuming 4 spaces or 1 tab
            this.editor.selectionEnd = end + 4;
        } else if (direction === 'left') {
            // Remove a tab (or spaces) from the start of the line if present
            var lineIndent = beforeText.substring(lineStart);
            if (lineIndent.startsWith("    ")) { // Assuming 4 spaces or 1 tab
                this.editor.value = beforeText.substring(0, lineStart) + beforeText.substring(lineStart + 4) + selectedText + afterText;
                // Adjust the cursor position
                this.editor.selectionStart = start - 4 > lineStart ? start - 4 : lineStart;
                this.editor.selectionEnd = end - 4 > lineStart ? end - 4 : lineStart;
            }
        }

        // After updating the textarea's value, manually trigger Prism highlighting
        this.redrawSyntaxHighlighting();
    }

    adjustTextAreaSize() {
        // Update the height & width of the textarea to match the content
        requestAnimationFrame(() => {
            this.adjustTextareaHeight(this.editor);
            this.adjustTextareaWidth(this.editor);
        });
    }

    // Method to highlight the active line
    highlightItems() {
        this.highlightActiveLine();
        this.highlightActiveLineNumber();
    }

    highlightActiveLine() {
        const lineHeight = parseFloat(getComputedStyle(this.editor).lineHeight);
        const lineNumber = this.editor.value.substr(0, this.editor.selectionStart).split("\n").length;
        const highlightPosition = (lineNumber - 1) * lineHeight;
        const backgroundHighlight = this.shadow.querySelector('.background-highlight');
        
        requestAnimationFrame(() => {
            backgroundHighlight.style.top = `${highlightPosition}px`;
            backgroundHighlight.style.opacity = 1;

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
        // After updating the textarea's value, manually trigger Prism highlighting
        this.visualizer.innerHTML = this.editor.value;
        
        try {
            Prism.highlightElement(this.visualizer);
        } catch (error) { }
    }
}

window.customElements.define("outerbase-editor", OuterbaseEditorLite);