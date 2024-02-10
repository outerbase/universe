// import './prism/prism.js';
// import './prism/prism-sql.min.js';

/**
 * TODO:
 * - Add support for database schema syntax highlighting
 * - Eliminate as many `querySelector` calls as possible by using the stored reference instead
 * - Try importing a lighter JS and CSS from Prism
 */

var templateEditor = document.createElement("template");
templateEditor.innerHTML = `
<style>
    #container {
        height: 100%;
        width: 100%;
        margin: 0;
        display: flex;
        flex-direction: row;
        overflow: scroll;
    }

    #line-number-container {
        padding: 0 10px;
        font-family: Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace;
        font-size: 13px  !important;
        line-height: 18px !important;
        text-align: right;
        color: #434684;
    }

    .dark #line-number-container {
        color: #a6a6a6;
    }

    #code-container {
        flex: 1;
        position: relative;
        height: 100%;
    }

    textarea, code {
        padding: 0 10px !important;
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
        font-family: Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace;
        font-size: 13px  !important;
        line-height: 18px !important;
    }

    .editor, pre, code {
        z-index: 2;
    }

    .editor {
        color: transparent;
        caret-color: black;
        width: 100%;
        height: 100%;
        border: none;
        position: absolute;
        left: 0;
        top: 0;
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
        color: black;
    }

    .background-highlight {
        position: absolute;
        width: 100%;
        height: 18px;
        background-color: #e5e5e5;
        opacity: 0;
        z-index: 1;
        pointer-events: none;
    }

    .dark .background-highlight {
        background-color: #262626;
    }

    .active-line-number {
        color: #262626;
    }

    .dark .active-line-number {
        color: #fafafa;
    }

    .width-measure {
        font-family: Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace;
        font-size: 13px  !important;
        line-height: 18px !important;
        visibility: hidden;
        white-space: pre;
        position: absolute;
        top: 0;
        left: 0;
    }

    .dark .editor {
        caret-color: white;
    }

    .dark code {
        color: white;
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
        color: black !important;
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
        color: #525252 !important;
    }

    .dark .token.variable,
    .dark .token.function {
        color: #F8F8F2 !important;
    }

    .dark .token.punctuation {
        color: white !important;
    }

    .dark .token.number {
        color: #8BE9FD !important;
    }

    .dark .token.string {
        color: #50FA7B !important;
    }





    /* Define styles for "user_profile" */
    .token.db-schema {
        color: #ff79c6; /* Pink color; change as needed */
        font-weight: bold;
    }
</style>

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
`;

// export 
class OuterbaseEditorLite extends HTMLElement {
    // The text to display in the editor
    code = "";
    // The DOM element of the textarea
    editor = null;
    // The DOM element where the syntax highlighted code is displayed
    visualizer = null;
    // The DOM element used to measure the width of the textarea's content
    widthMeasure = null;

    /**
        Database schema should maintain a structure such as:
        {
            "public": [
                "user": {
                    "id": "int",
                    "name": "string",
                },
                "session": {
                    "id": "int",
                    "user_id": "int",
                    "token": "string",
                }
            ]
        }
    */
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

        this.shadow = this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = templateEditor.innerHTML;

        this.editor = this.shadow.querySelector(".editor");
        this.visualizer = this.shadow.querySelector("code");
        this.widthMeasure = this.shadow.querySelector(".width-measure");

        const css = `
        /* PrismJS 1.29.0
https://prismjs.com/download.html#themes=prism-tomorrow&languages=clike+javascript+sql&plugins=line-numbers+keep-markup+unescaped-markup+normalize-whitespace */
code[class*=language-],pre[class*=language-]{color:#ccc;background:0 0;font-family:Consolas,Monaco,'Andale Mono','Ubuntu Mono',monospace;font-size:1em;text-align:left;white-space:pre;word-spacing:normal;word-break:normal;word-wrap:normal;line-height:1.5;-moz-tab-size:4;-o-tab-size:4;tab-size:4;-webkit-hyphens:none;-moz-hyphens:none;-ms-hyphens:none;hyphens:none}pre[class*=language-]{padding:1em;margin:.5em 0;overflow:auto}:not(pre)>code[class*=language-],pre[class*=language-]{background:#2d2d2d}:not(pre)>code[class*=language-]{padding:.1em;border-radius:.3em;white-space:normal}.token.block-comment,.token.cdata,.token.comment,.token.doctype,.token.prolog{color:#999}.token.punctuation{color:#ccc}.token.attr-name,.token.deleted,.token.namespace,.token.tag{color:#e2777a}.token.function-name{color:#6196cc}.token.boolean,.token.function,.token.number{color:#f08d49}.token.class-name,.token.constant,.token.property,.token.symbol{color:#f8c555}.token.atrule,.token.builtin,.token.important,.token.keyword,.token.selector{color:#cc99cd}.token.attr-value,.token.char,.token.regex,.token.string,.token.variable{color:#7ec699}.token.entity,.token.operator,.token.url{color:#67cdcc}.token.bold,.token.important{font-weight:700}.token.italic{font-style:italic}.token.entity{cursor:help}.token.inserted{color:green}
pre[class*=language-].line-numbers{position:relative;padding-left:3.8em;counter-reset:linenumber}pre[class*=language-].line-numbers>code{position:relative;white-space:inherit}.line-numbers .line-numbers-rows{position:absolute;pointer-events:none;top:0;font-size:100%;left:-3.8em;width:3em;letter-spacing:-1px;border-right:1px solid #999;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.line-numbers-rows>span{display:block;counter-increment:linenumber}.line-numbers-rows>span:before{content:counter(linenumber);color:#999;display:block;padding-right:.8em;text-align:right}
[class*=lang-] script[type='text/plain'],[class*=language-] script[type='text/plain'],script[type='text/plain'][class*=lang-],script[type='text/plain'][class*=language-]{display:block;font:100% Consolas,Monaco,monospace;white-space:pre;overflow:auto}
`;

        const style = document.createElement('style');
        style.textContent = css;
        this.shadow.appendChild(style);

        this.redrawSyntaxHighlighting();

        // Add Prism JS
        const script = document.createElement('script');
        script.src = "./universe-editor/prism-lite/prism.js";
        script.onload = () => {
            this.redrawSyntaxHighlighting();
            this.updateLineNumbers();

            if (typeof Prism !== 'undefined') {
                console.log("Prism is loaded: ", Prism.languages);
                // Ensure Prism and its languages are loaded
                // if (Prism.languages.javascript && Prism.languages.sql) {
                    console.log("Prism languages are loaded");
                    // Define a new token for highlighting "user_profile"
                    const schemaPattern = {
                        'db-schema': { // This is the token name
                            pattern: /\buser_profile\b/, // Matches "user_profile" as a whole word
                            // alias: 'special-class' // Use 'alias' to apply a special CSS class
                        }
                    };
        
                    // Insert the new token in JavaScript and SQL languages before 'keyword', or another suitable token
                    Prism.languages.insertBefore('javascript', 'keyword', schemaPattern);
                    Prism.languages.insertBefore('sql', 'keyword', schemaPattern);
                // }
        
                Prism.highlightAllUnder(this.shadow);
            }
        };
        this.shadow.appendChild(script);

        // Add Prism SQL
        const scriptSQL = document.createElement('script');
        scriptSQL.src = "./universe-editor/prism-lite/prism-sql.min.js";
        this.shadow.appendChild(scriptSQL);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "code") {
            this.editor.value = newValue;
            this.updateLineNumbers();
            
            // setTimeout(() => {
                this.redrawSyntaxHighlighting();
            // }, 0);
        }

        if (name === "language") {
            this.shadow.querySelector("code").className = `language-${newValue}`;
        }

        if (name === "theme") {
            this.shadow.querySelector("#container").className = newValue;
        }

        if (name === "height") {
            this.shadow.querySelector("#container").style.height = `${newValue}px`;
        }
    }

    connectedCallback() {
        this.editor.addEventListener("keydown", (e) => {
            if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "Enter" || e.key === "Backspace") {
                // For an instant reflection of the active line and line number on key press
                // we use the `keydown` event instead of `keyup` or `input`. It won't be able
                // to calculate the correct details immediately because of `keydown`, so we
                // defer the calculation to the next tick using `setTimeout`.
                setTimeout(() => {
                    this.highlightItems();
                }, 0);
            }
        });

        this.editor.addEventListener("input", (e) => {
            this.visualizer.innerHTML = e.target.value;

            // Update the line numbers
            this.updateLineNumbers(); 

            // Highlight the active line, line number, and code syntax
            Prism.highlightElement(this.visualizer);
            this.highlightItems();

            // Update the height & width of the textarea to match the content
            this.adjustTextAreaSize();
        });

        // Use arrow function here to ensure `this` refers to the class instance
        this.editor.addEventListener("keydown", (e) => {
            if (e.key === "Tab") {
                e.preventDefault(); // Stop the default tab behavior
                var start = e.target.selectionStart;
                var end = e.target.selectionEnd;

                // Set textarea value to: text before caret + tab + text after caret
                e.target.value = e.target.value.substring(0, start) +
                                    "    " + // This is where the tab character or spaces go
                                    e.target.value.substring(end);

                // Put caret at right position again
                e.target.selectionStart =
                e.target.selectionEnd = start + 4; // Move the caret after the tab
            }  
            else if (e.metaKey && e.key === "Enter") {
                e.preventDefault(); // Prevent the default action
                this.dispatchEvent(new CustomEvent('outerbase-editor-event', { bubbles: true, composed: true, detail: { execute: true, code: this.editor.value } }));
            }
            else if (e.key === "Enter") {
                e.preventDefault(); // Prevent the default enter behavior

                var start = e.target.selectionStart;
                var end = e.target.selectionEnd;
                var beforeText = e.target.value.substring(0, start);
                var afterText = e.target.value.substring(end);

                // Find the start of the current line
                var lineStart = beforeText.lastIndexOf("\n") + 1;
                // Calculate the indentation of the current line
                var indentation = beforeText.substring(lineStart).match(/^(\s*)/)[0];

                // Insert newline and the same indentation
                e.target.value = beforeText + "\n" + indentation + afterText;

                // Update cursor position
                var newPos = start + 1 + indentation.length; // Move cursor after the new line and indentation
                e.target.selectionStart = e.target.selectionEnd = newPos;

                // Defer the update of line numbers, required or the line number will be off by 1
                this.updateLineNumbers();
            }
            else  if (e.metaKey && e.key === ']') {
                // Check for CMD + ] for right indent
                e.preventDefault(); // Prevent the default action
                this.indentLine(this.editor, 'right');
            }
            else if (e.metaKey && e.key === '[') {
                // Check for CMD + [ for left indent
                e.preventDefault(); // Prevent the default action
                this.indentLine(this.editor, 'left');
            } 
            else if (e.metaKey && e.key === '/') {
                // Check for CMD + / for commenting
                e.preventDefault(); // Prevent the default action
                var start = e.target.selectionStart;
                var end = e.target.selectionEnd;
                var selectedText = e.target.value.substring(start, end);
                var beforeText = e.target.value.substring(0, start);
                var afterText = e.target.value.substring(end);

                // Find the start of the current line
                var lineStart = beforeText.lastIndexOf("\n") + 1;
                const commentCharacters = this.getAttribute("language") === "sql" ? "-- " : "// ";

                // Check if the line is already commented out
                if (beforeText.substring(lineStart).trim().startsWith(commentCharacters)) {
                    // Remove comment characters at the start of the line
                    e.target.value = beforeText.substring(0, lineStart) + beforeText.substring(lineStart + commentCharacters.length) + selectedText + afterText;
                } else {
                    // Add comment characters at the start of the line
                    e.target.value = beforeText.substring(0, lineStart) + commentCharacters + beforeText.substring(lineStart) + selectedText + afterText;
                }

                // Adjust the cursor position
                e.target.selectionStart = start + 3; // Assuming 3 characters for the comment
                e.target.selectionEnd = end + 3;
            }
            
            setTimeout(() => {
                this.dispatchEvent(new CustomEvent('outerbase-editor-event', { bubbles: true, composed: true, detail: { code: this.editor.value } }));
            }, 50);
            
            // After updating the textarea's value, manually trigger Prism highlighting
            this.redrawSyntaxHighlighting();
        });

        this.editor.addEventListener("click", (e) => {
            this.highlightItems();
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

        this.highlightItems();
    }    

    adjustTextareaHeight(textarea) {
        // Reset the height to ensure we're not measuring the old content
        textarea.style.height = 'auto';
        // Adjust the height to match the scroll height of the content
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    adjustTextareaWidth(textarea) {
        // Copy textarea content into the widthMeasure span
        this.widthMeasure.textContent = textarea.value || textarea.placeholder;
        // Adjust the textarea width based on the widthMeasure span's width
        textarea.style.width = Math.max(this.widthMeasure.offsetWidth + 1, textarea.scrollWidth) + 'px';    
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
    
    // highlightActiveLine() {
    //     const lineHeight = 18; // Match this to your actual line height
    //     const lineNumber = this.editor.value.substr(0, this.editor.selectionStart).split("\n").length;
    //     const highlightPosition = (lineNumber - 1) * lineHeight;
    //     const backgroundHighlight = this.shadow.querySelector('.background-highlight');
    //     backgroundHighlight.style.top = `${highlightPosition}px`;
    //     backgroundHighlight.style.opacity = 1;
    // }

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