import './prism/prism.js';
import './prism/prism-sql.min.js';

var templateEditor = document.createElement("template");
templateEditor.innerHTML = `
<style>
    #container {
        height: 100%;
        width: 100%;
        margin: 0;
        overflow: scroll;
    }

    textarea {
        resize: none;
        outline: none;
    }

    pre, textarea, code {
        padding: 0 !important;
        margin: 0 !important;
        min-height: 100%;
        min-width: 100%;
        font-family: Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace;
        font-size: 13px  !important;
        line-height: 16px !important;
        background-color: transparent !important;
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

    code {
        pointer-events: none;
        position: absolute;
        top: 0px;
        left: 0px;
        width: 100%;
        height: 100%;
        color: black;
    }

    .width-measure {
        font-family: monospace;
        font-size: 13px;
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
        color: #808080 !important;
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
        color: #6272A4 !important;
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
</style>

<div id="container" class="dark">
    <textarea class="editor"></textarea>
    <pre><code class=""></code></pre>
    <span class="width-measure"></span>
</div>
`;

export class OuterbaseEditorLite extends HTMLElement {
    container = null;
    code = "";
    editor = null;
    visualizer = null;
    widthMeasure = null;

    static get observedAttributes() {
        return [
            "code",
            "language",
            "theme"
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

        setTimeout(() => {
            this.redrawSyntaxHighlighting();
        }, 100);

        // Add Prism JS
        const script = document.createElement('script');
        script.src = "./universe-editor/prism-lite/prism.js";
        script.onload = () => {
            this.redrawSyntaxHighlighting();
        };
        this.shadow.appendChild(script);

        // Add Prism SQL
        const scriptSQL = document.createElement('script');
        scriptSQL.src = "./universe-editor/prism-lite/prism-sql.min.js";
        this.shadow.appendChild(scriptSQL);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "code") {
            this.shadow.querySelector(".editor").value = newValue;
        }

        if (name === "language") {
            this.shadow.querySelector("code").className = `language-${newValue}`;
        }

        if (name === "theme") {
            this.shadow.querySelector("#container").className = newValue;
        }
    }

    connectedCallback() {
        this.editor.addEventListener("input", (e) => {
            var escapedCode = e.target.value;
            this.visualizer.innerHTML = escapedCode;
            Prism.highlightElement(this.visualizer);
            this.adjustTextareaHeight(this.editor);
            this.adjustTextareaWidth(this.editor);
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

            setTimeout(() => {
                this.dispatchEvent(new CustomEvent('outerbase-editor-event', { bubbles: true, composed: true, detail: { code: this.editor.value } }));
            }, 50);
            
            this.redrawSyntaxHighlighting();
        });

        // Initial adjustment in case of any pre-filled content
        this.adjustTextareaHeight(this.editor);
        this.adjustTextareaWidth(this.editor);
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

    redrawSyntaxHighlighting() {
        // After updating the textarea's value, manually trigger Prism highlighting
        this.visualizer.innerHTML = this.editor.value;
        Prism.highlightElement(this.visualizer);
    }
}

window.customElements.define("outerbase-editor-lite", OuterbaseEditorLite);