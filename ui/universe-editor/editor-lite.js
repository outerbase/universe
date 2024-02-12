import './prism-lite/prism.js';
// Styles seem to work appropriate without this included?
// import './prism-lite/prism.css';
import './prism-lite/prism-sql.min.js';
import { attachKeyboardShortcuts } from './prism-lite/keyboard-actions.js';

/**
 * TODO:
 * - Break logical parts of the code into separate files
 * - Width is not properly calculating leaving horizontal scrolling when no long text exists
 * - Try to remove the dependency for parent to pass in the height
 * - Custom scrollbar in our code-editor component
 * - Add support for database schema syntax highlighting
 */

var templateEditor = document.createElement("template");
templateEditor.innerHTML = `
<style>
    :host {
        --font-family-mono: Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace;
        --font-size: 13px;
        --line-height: 18px;
        --padding-horizontal: 0 10px;
        
        --color-neutral-50: #fafafa;
        --color-neutral-200: #e5e5e5;
        --color-neutral-300: #d4d4d4;
        --color-neutral-400: #a3a3a3;
        --color-neutral-600: #525252;
        --color-neutral-700: #404040;
        --color-neutral-800: #262626;
        --color-primary-dark: white;
        --color-primary-light: black;

        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    ::-moz-selection {
        background: var(--color-neutral-300);
    }

    ::selection {
        background: var(--color-neutral-300);
    }

    .dark ::-moz-selection {
        background: var(--color-neutral-700);
    }

    .dark ::selection {
        background: var(--color-neutral-700);
    }

    #container {
        position: relative;
        height: 100%;
        width: 100%;
        margin: 0;
        display: flex;
        flex-direction: row;
        overflow: scroll;
    }

    #line-number-container {
        padding: var(--padding-horizontal);
        font-family: var(--font-family-mono);
        font-size: var(--font-size);
        line-height: var(--line-height);
        color: var(--color-neutral-700);
        text-align: right;
        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }

    .dark #line-number-container {
        color: var(--color-neutral-400);
    }

    #code-container {
        flex: 1;
        position: relative;
        overflow: scroll;
        min-height: 100%;
    }

    textarea, code, .width-measure {
        padding: var(--padding-horizontal) !important;
        white-space: pre;
        overflow-wrap: normal;
        word-wrap: normal;
    }

    textarea {
        resize: none;
        outline: none;
        overflow: hidden;
    }

    pre, textarea, code, .width-measure {
        margin: 0 !important;
        min-height: 100%;
        min-width: calc(100% - 20px) !important;
        background-color: transparent !important;
        font-family: var(--font-family-mono);
        font-size: var(--font-size)  !important;
        line-height: var(--line-height) !important;
    }

    .editor, pre, code {
        z-index: 2;
    }

    .editor {
        color: transparent;
        caret-color: var(--color-primary-light);
        width: 100%;
        height: 100%;
        border: none;
        position: absolute;
        left: 0;
        top: 0;

        overflow-x: hidden;
    }
    
    pre {
        padding: 0 !important;
    }

    code {
        pointer-events: none;
        position: absolute;
        top: 0px;
        left: 0px;
        width: calc(100% - 20px) !important;
        height: 100%;
        color: var(--color-primary-light);
    }

    .background-highlight {
        position: absolute;
        width: 100%;
        height: var(--line-height);
        background-color: var(--color-neutral-200);
        opacity: 0;
        z-index: 1;
        pointer-events: none;
    }

    .dark .background-highlight {
        background-color: var(--color-neutral-800);
    }

    .active-line-number {
        color: var(--color-neutral-800);
    }

    .dark .active-line-number {
        color: var(--color-neutral-50);
    }

    .width-measure {
        font-family: var(--font-family-mono);
        font-size: var(--font-size) !important;
        line-height: var(--line-height) !important;
        visibility: hidden;
        /*white-space: pre;*/
        position: absolute;
        top: 0;
        left: 0;
    }

    .dark .editor {
        caret-color: var(--color-primary-dark);
    }

    .dark code {
        color: #FF0000;
    }

    code[class*="language-"],
    pre[class*="language-"],
    .token.operator {
        color: #24292e !important;
    }

    /* Token Colors */
    .token.invalid {
        color: #ff0000 !important;
    }
    
    .token.keyword {
        color: #7f00ff !important;
    }
    
    .token.comment {
        color: #a3a3a3 !important;
    }
    
    .token.variable,
    .token.function {
        color: #000000 !important;
    }
    
    .token.punctuation {
        color: var(--color-primary-light) !important;
    }
    
    .token.number {
        color: #0000FF !important;
    }
    
    .token.string {
        color: #228B22 !important;
    }

    .dark code[class*="language-"],
    .dark pre[class*="language-"],
    .dark .token.operator {
        color: #f6f8fa !important;
    }

    .dark .token.invalid {
        color: #ff0000 !important;
    }

    .dark .token.keyword {
        color: #BD93F9 !important;
    }

    .dark .token.comment {
        color: var(--color-neutral-600) !important;
    }

    .dark .token.variable,
    .dark .token.function {
        color: #F8F8F2 !important;
    }

    .dark .token.punctuation {
        color: var(--color-primary-dark) !important;
    }

    .dark .token.number {
        color: #8BE9FD !important;
    }

    .dark .token.string {
        color: #50FA7B !important;
    }





    /* Define styles for database schemas */
    .token.db-schema {
        color: #ff79c6;
        font-weight: bold;
    }
</style>

<div style="height: 100%; display: flex; flex-direction: column; overflow: hidden; position: relative;">
    <div id="container" class="dark">
        <!-- The line number container to draw a new number for each line -->
        <div id="line-number-container">
            <div>1</div>
        </div>

        <div id="code-container">
            <!-- The div is used to highlight the active line -->
            <div class="background-highlight"></div>

            <!-- The textarea is used to capture user input -->
            <textarea class="editor"></textarea>

            <!-- The code element is used to display the syntax highlighted code -->
            <pre><code></code></pre>

            <!-- The span is used to measure the width of the textarea's content -->
            <span class="width-measure"></span>
        </div>
    </div>
    
    <div style="height: 16px; width: 100%;"></div>
</div>
`;
// <!-- <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 10px; background-color: #ff0000; z-index: 3;"></div> -->

export class OuterbaseEditorLite extends HTMLElement {
    // The DOM element of the parent container
    container = null;

    codeContainer = null;
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
            // The theme to use for syntax highlighting, "light" or "dark"
            "theme",
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
        this.container = this.shadow.querySelector("#container");
        this.codeContainer = this.shadow.querySelector("#code-container");
        this.editor = this.shadow.querySelector(".editor");
        this.visualizer = this.shadow.querySelector("code");
        this.widthMeasure = this.shadow.querySelector(".width-measure");

        // const link = document.createElement('link');
        // link.setAttribute('rel', 'stylesheet');
        // link.setAttribute('href', './universe-editor/prism-lite/prism.css');
        // this.shadow.appendChild(link);

        this.redrawSyntaxHighlighting();

        // Add Prism JS
        // const script = document.createElement('script');
        // script.src = "./universe-editor/prism-lite/prism.js";
        // script.onload = () => {
        //     setTimeout(() => {
        //         this.redrawSyntaxHighlighting();
        //         this.updateLineNumbers();
        //     }, 0);

        //     // if (typeof Prism !== 'undefined') {
        //     //     console.log("Prism is loaded: ", Prism.languages);
        //     //     // Ensure Prism and its languages are loaded
        //     //     // if (Prism.languages.javascript && Prism.languages.sql) {
        //     //         console.log("Prism languages are loaded");
        //     //         // Define a new token for highlighting "user_profile"
        //     //         const schemaPattern = {
        //     //             'db-schema': { // This is the token name
        //     //                 pattern: /\buser_profile\b/, // Matches "user_profile" as a whole word
        //     //                 // alias: 'special-class' // Use 'alias' to apply a special CSS class
        //     //             }
        //     //         };
        
        //     //         // Insert the new token in JavaScript and SQL languages before 'keyword', or another suitable token
        //     //         Prism.languages.insertBefore('javascript', 'keyword', schemaPattern);
        //     //         Prism.languages.insertBefore('sql', 'keyword', schemaPattern);
        //     //     // }
        
        //     //     Prism.highlightAllUnder(this.shadow);
        //     // }
        // };
        // this.shadow.appendChild(script);

        // // Add Prism SQL
        // const scriptSQL = document.createElement('script');
        // scriptSQL.src = "./universe-editor/prism-lite/prism-sql.min.js";
        // this.shadow.appendChild(scriptSQL);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "code") {
            this.editor.value = newValue;
            this.updateLineNumbers();
            
            // This timeout is necessary to ensure that the syntax highlighting is applied
            // after the web component has initially rendered.
            setTimeout(() => {
                this.redrawSyntaxHighlighting();
            }, 0);
        }

        if (name === "language") {
            this.visualizer.className = `language-${newValue}`;
        }

        if (name === "theme") {
            this.container.className = newValue;
        }

        // if (name === "height") {
        //     let scrollBarHeight = 10;
        //     let totalHeight = parseInt(newValue) + scrollBarHeight;
        //     this.container.style.height = `${totalHeight}px`;
        // }
    }

    connectedCallback() {
        this.container.addEventListener('scroll', () => {
            // Synchronize vertical scroll between line numbers and code editor
            const lineNumberContainer = this.shadow.querySelector('#line-number-container');
            lineNumberContainer.style.top = `${-this.container.scrollTop}px`;

            console.log('Scroll Left: ', this.container.scrollTop)
        });

        // Keyboard shortcuts, see `keyboard-actions.js` for details
        attachKeyboardShortcuts(
            this.editor,
            this.container,
            this.codeContainer,
            this.visualizer,
            this.getAttribute("language"),
            () => this.redrawSyntaxHighlighting(),
            () => this.updateLineNumbers(),
            () => this.highlightItems(),
            () => this.adjustTextAreaSize(),
            (detail) => this.dispatchEvent(new CustomEvent('outerbase-editor-event', { bubbles: true, composed: true, detail }))
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
        this.adjustTextAreaSize();
    }

    updateLineNumbers() {
        const lineCount = this.editor.value.split("\n").length;
        const lineNumberContainer = this.shadow.querySelector("#line-number-container");
        lineNumberContainer.innerHTML = ''; // Clear existing line numbers
    
        for (let i = 1; i <= lineCount; i++) {
            const lineNumberDiv = document.createElement("div");
            lineNumberDiv.textContent = i;
            lineNumberContainer.appendChild(lineNumberDiv);
        }

        // Change the left margin of the `code-container` to match the width of the line numbers
        // const lineNumberWidth = lineNumberContainer.offsetWidth;
        // this.shadow.querySelector("#code-container").style.marginLeft = `${lineNumberWidth}px`;

        this.highlightItems();
    }    

    adjustTextareaHeight(textarea) {
        // Reset the height to ensure we're not measuring the old content
        textarea.style.height = 'auto';
        // Adjust the height to match the scroll height of the content
        // textarea.style.height = textarea.scrollHeight + 'px';

        console.log('Changing textarea height to: ', textarea.scrollHeight)

        // Height is number of lines * line height
        const lineHeight = 18; // Match this to your actual line height
        const lineCount = textarea.value.split("\n").length;
        const height = lineCount * lineHeight;

        textarea.style.height = `${height}px`;
        this.shadow.querySelector("#line-number-container").style.height = `${height}px`;
        this.shadow.querySelector("#code-container").style.height = `${height}px`;

        // Set textarea height to height of line numbers container
        // textarea.style.height = this.shadow.querySelector("#line-number-container").style.height + 'px';

        // // Set same height for the code container
        // this.shadow.querySelector("#code-container").style.height = textarea.scrollHeight + 'px';
    }

    adjustTextareaWidth(textarea) {
        // Copy textarea content into the widthMeasure span
        this.widthMeasure.textContent = textarea.value || textarea.placeholder;
        // Adjust the textarea width based on the widthMeasure span's width
        textarea.style.width = Math.max(this.widthMeasure.offsetWidth + 1, textarea.scrollWidth) + 'px';    

        // Adjust width of `background-highlight` div to match the width of the textarea
        this.shadow.querySelector(".background-highlight").style.width = textarea.style.width;
    }

    indentLine(textarea, direction) {
        var start = textarea.selectionStart;
        var end = textarea.selectionEnd;
        var selectedText = textarea.value.substring(start, end);
        var beforeText = textarea.value.substring(0, start);
        var afterText = textarea.value.substring(end);

        // Find the start of the current line
        var lineStart = beforeText.lastIndexOf("\n") + 1;

        if (direction === 'right') {
            // Add a tab (or spaces) at the start of the line
            textarea.value = beforeText.substring(0, lineStart) + "    " + beforeText.substring(lineStart) + selectedText + afterText;
            // Adjust the cursor position
            textarea.selectionStart = start + 4; // Assuming 4 spaces or 1 tab
            textarea.selectionEnd = end + 4;
        } else if (direction === 'left') {
            // Remove a tab (or spaces) from the start of the line if present
            var lineIndent = beforeText.substring(lineStart);
            if (lineIndent.startsWith("    ")) { // Assuming 4 spaces or 1 tab
                textarea.value = beforeText.substring(0, lineStart) + beforeText.substring(lineStart + 4) + selectedText + afterText;
                // Adjust the cursor position
                textarea.selectionStart = start - 4 > lineStart ? start - 4 : lineStart;
                textarea.selectionEnd = end - 4 > lineStart ? end - 4 : lineStart;
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
        const lineHeight = 18; // Match this to your actual line height
        const lineNumber = this.editor.value.substr(0, this.editor.selectionStart).split("\n").length;
        const highlightPosition = (lineNumber - 1) * lineHeight;
        const backgroundHighlight = this.shadow.querySelector('.background-highlight');
        
        requestAnimationFrame(() => {
            backgroundHighlight.style.top = `${highlightPosition}px`;
            backgroundHighlight.style.opacity = 1;
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

window.customElements.define("outerbase-editor-lite", OuterbaseEditorLite);