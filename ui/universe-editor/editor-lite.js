import './prism-lite/prism.js';
import './prism-lite/prism-sql.min.js';
import { attachKeyboardShortcuts } from './prism-lite/keyboard-actions.js';

import defaultStyles from './themes/default.js';
import moondustStyles from './themes/moondust.js';
import invasionStyles from './themes/invasion.js';

// import './themes/moondust.css';
// import './themes/invasion.css';

/**
 * TODO:
 * - Break logical parts of the code into separate files
 * - Width is not properly calculating leaving horizontal scrolling when no long text exists
 * - Custom scrollbar in our code-editor component
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
    
    <!--
    <div style="height: 24px; width: 100%;">
        <button style="width: 24px; height: 24px; border-radius: 12px;">Change Theme</button>
    </div>
    -->
</div>
`;
// <!-- <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 10px; background-color: #ff0000; z-index: 3;"></div> -->

export class OuterbaseEditorLite extends HTMLElement {
    // The DOM element of the outer parent container
    outerContainer = null;
    // The DOM element of the parent container
    container = null;
    //
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
        this.outerContainer = this.shadow.querySelector("#outer-container");
        this.container = this.shadow.querySelector("#container");
        this.codeContainer = this.shadow.querySelector("#code-container");
        this.editor = this.shadow.querySelector(".editor");
        this.visualizer = this.shadow.querySelector("code");
        this.widthMeasure = this.shadow.querySelector(".width-measure");

        // Include the Moondust theme
        // const moondust = document.createElement('link');
        // moondust.setAttribute('rel', 'stylesheet');
        // moondust.setAttribute('href', './universe-editor/themes/moondust.css');
        // this.shadow.appendChild(moondust);

        // // Include the Invasion theme
        // const invasion = document.createElement('link');
        // invasion.setAttribute('rel', 'stylesheet');
        // invasion.setAttribute('href', './universe-editor/themes/invasion.css');
        // this.shadow.appendChild(invasion);

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

        const styleSheet = new CSSStyleSheet();
        styleSheet.replaceSync(defaultStyles); // Assuming defaultStyles is a string containing CSS

        const styleMoondust = new CSSStyleSheet();
        styleMoondust.replaceSync(moondustStyles); // Assuming moondustStyles is another string containing CSS

        const styleInvasion = new CSSStyleSheet();
        styleInvasion.replaceSync(invasionStyles); // Assuming moondustStyles is another string containing CSS

        // Use the CSSStyleSheet objects, not the style strings
        this.shadow.adoptedStyleSheets = [styleSheet, styleMoondust, styleInvasion];
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
            this.outerContainer.className = newValue;
        }

        if (name === "mode") {
            this.container.className = newValue;
        }
    }

    connectedCallback() {
        // setTimeout(() => {
        //     this.style.setProperty('--color-primary-dark', '#ff0000')
        // }, 5000);

        this.container.addEventListener('scroll', () => {
            // Synchronize vertical scroll between line numbers and code editor
            const lineNumberContainer = this.shadow.querySelector('#line-number-container');
            lineNumberContainer.style.top = `${-this.container.scrollTop}px`;
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