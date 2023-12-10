var templateRowContent = document.createElement("template");
templateRowContent.innerHTML = `
<style>
    #container {
        
    }

    ::selection {
        background: rgba(40, 67, 115, 0.4);
    }

    pre {
        margin: 0px;
    }

    #code {
        position: absolute;
        top: 0;
        left: 0;
        height: auto;
        min-height: 100%;
        overflow-y: hidden;
        background: transparent;
        color: transparent;
        border: none;
        outline: none;
        resize: none;
        width: 100%;
        height: 100%;
        caret-color: white;
        cursor: text;
    }

    #highlight {
        pointer-events: none;
        user-select: none;
        color: #9abbef;
    }

    #code, #highlight {
        white-space: pre;
    }

    #code, #highlight {
        font-family: 'Monaco', 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.5;
        font-variant-numeric: tabular-nums;
    }

    #hint {
        position: absolute;
        color: #6a6a6a; /* Light grey color for the ghost text */
        pointer-events: none; /* Makes the hint non-interactive */
        font-family: 'Monaco', 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.5;
        user-select: none;
        opacity: 0;
        transition: opacity 0.2s ease-in-out;
    }

    .dropdown {
        position: absolute;
        border: 1px solid rgb(47, 47, 47);
        background-color: rgb(60, 60, 60);
        z-index: 1000;
        top: 20px;
        left: 0px;
        border-radius: 8px;
        overflow: hidden;
    }

    .dropdown-item {
        padding: 6px 16px;
        min-width: 200px;
        cursor: pointer;
        color: white;
        font-family: 'Monaco', 'Courier New', monospace;
        font-size: 13px;
    }

    .dropdown-item:first-child {
        padding-top: 8px;
    }

    .dropdown-item:last-child {
        padding-bottom: 8px;
    }

    .dropdown-item:hover {
        background-color: rgb(40, 40, 40);
    }

    .dropdown-item.selected {
        background-color: rgb(40, 40, 40);
    }

    .function-name { color: #ff0000; }
    .keyword { color: #98d7c8; }
    .string { color: #d99ad9; }
    .number { color: purple; }
    .boolean { color: green; }
    .null { color: pink; }
    .braces { color: #e4c945; }
    .punctuation { color: indigo; }
    .variable-name { color: white; }
    .comment { color: #6a6a6a !important; }
    .request { 
        color: gray;
        text-decoration: underline;
        text-underline-offset: 4px;
    }
    .secret { 
        color: rgba(0, 0, 0, 0.85);
        -webkit-filter: blur(0px); /* Required, or background color on ::before won't work */
    }
    .secret::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: calc(100% + 4px); /* 4px wider than the container */
        height: calc(100% + 6px); /* 4px taller than the container */
        background-color: #a099e8;
        z-index: -1;
        transform: translate(-50%, -50%); /* Center the pseudo-element */
        border-radius: 4px;
    }

    /* PRISMJS OVERRIDES */
    pre[class*=language-]{padding:0 !important;margin:0 !important;overflow:auto !important}
    pre[class*=language-]{background:transparent !important;}


    .token.request-variable .class-name {
        /* Styles for 'request' */
        color: gray;
        text-decoration: underline;
        text-underline-offset: 4px;
    }
    
    .token.request-variable .property {
        /* Styles for 'NAME' */
        color: gray;
        text-decoration: underline;
        text-underline-offset: 4px;
    }
    
    .token.request-variable .punctuation {
        /* Styles for '.' and '{{}}' */
        color: gray;
        text-decoration: underline;
        text-underline-offset: 4px;
    }
</style>

<div id="container">
    <pre><code class="language-javascript no-whitespace-normalization" id="highlight"></code></pre>
    <div id="code" contentEditable="false" spellcheck="false"></div>

    <!-- Show a line hint when the line is empty and cursor is active -->
    <div id="hint" style="display: block;">Type '/' for a list of code block suggestions.</div>

    <!-- "/" options to show -->
    <div id="dropdown" class="dropdown" style="display: none;">
        <div class="dropdown-item" data-value="OB:WASM:Slack">Slack</div>
        <div class="dropdown-item" data-value="OB:WASM:Mailgun">Mailgun</div>    
    </div>
</div>
`;

// export default 
class OuterbaseEditorRowText extends HTMLElement {
    static get observedAttributes() {
        return [
            "line-number",
            "value",
            "readonly"
        ];
    }

    selectedItemIndex = -1;

    constructor() {
        super();
    
        this.shadow = this.attachShadow({ mode: "open" });
        this.shadow.innerHTML = templateRowContent.innerHTML;

        const css = `
        /* PrismJS 1.29.0
https://prismjs.com/download.html#themes=prism-tomorrow&languages=css+clike+javascript+css-extras&plugins=inline-color */
code[class*=language-],pre[class*=language-]{color:#ccc;background:0 0;font-family:Consolas,Monaco,'Andale Mono','Ubuntu Mono',monospace;font-size:1em;text-align:left;white-space:pre;word-spacing:normal;word-break:normal;word-wrap:normal;line-height:1.5;-moz-tab-size:4;-o-tab-size:4;tab-size:4;-webkit-hyphens:none;-moz-hyphens:none;-ms-hyphens:none;hyphens:none}pre[class*=language-]{padding:1em;margin:.5em 0;overflow:auto}:not(pre)>code[class*=language-],pre[class*=language-]{background:#2d2d2d}:not(pre)>code[class*=language-]{padding:.1em;border-radius:.3em;white-space:normal}.token.block-comment,.token.cdata,.token.comment,.token.doctype,.token.prolog{color:#999}.token.punctuation{color:#ccc}.token.attr-name,.token.deleted,.token.namespace,.token.tag{color:#e2777a}.token.function-name{color:#6196cc}.token.boolean,.token.function,.token.number{color:#f08d49}.token.class-name,.token.constant,.token.property,.token.symbol{color:#f8c555}.token.atrule,.token.builtin,.token.important,.token.keyword,.token.selector{color:#cc99cd}.token.attr-value,.token.char,.token.regex,.token.string,.token.variable{color:#7ec699}.token.entity,.token.operator,.token.url{color:#67cdcc}.token.bold,.token.important{font-weight:700}.token.italic{font-style:italic}.token.entity{cursor:help}.token.inserted{color:green}
span.inline-color-wrapper{background:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyIDIiPjxwYXRoIGZpbGw9ImdyYXkiIGQ9Ik0wIDBoMnYySDB6Ii8+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0wIDBoMXYxSDB6TTEgMWgxdjFIMXoiLz48L3N2Zz4=);background-position:center;background-size:110%;display:inline-block;height:1.333ch;width:1.333ch;margin:0 .333ch;box-sizing:border-box;border:1px solid #fff;outline:1px solid rgba(0,0,0,.5);overflow:hidden}span.inline-color{display:block;height:120%;width:120%}
`;

        const style = document.createElement('style');
        style.textContent = css;
        this.shadow.appendChild(style);
    
        // Add Prism JS
        const script = document.createElement('script');
        script.src = "./universe-editor/prism/prism.js";
        script.onload = () => {
            // Ensure Prism is available and highlight
            if (typeof Prism !== 'undefined') {
                // Ensure Prism and its JavaScript language are loaded
                if (Prism && Prism.languages && Prism.languages.javascript) {
                    // {{request.TYPE.NAME}} – Create a new token in the JavaScript language for
                    Prism.languages.insertBefore('javascript', 'punctuation', {
                        'request-variable': {
                            pattern: /{{request\.\w+\.\w+}}/,
                            inside: {
                                'variable': {
                                    pattern: /request\.\w+\.\w+/,
                                    inside: {
                                        'class-name': /^request/,
                                        'punctuation': /\./,
                                        'property': /\w+$/
                                    }
                                },
                                'punctuation': /{{|}}/
                            }
                        }
                    });
                }

                Prism.highlightAllUnder(this.shadow);

            }
        };
        this.shadow.appendChild(script);

        this.render();
    }

    changeContentEditable(bool) {
        this.contentEditable = bool;
        this.updateHint()
    }

    getCursorPosition() {
        const selection = this.shadowRoot.getSelection ? this.shadowRoot.getSelection() : window.getSelection();

        if (!selection || selection.rangeCount === 0) {
            return 0;
        }

        const range = selection.getRangeAt(0);
        const clonedRange = range.cloneRange();
        clonedRange.selectNodeContents(this.codeDiv);
        clonedRange.setEnd(range.endContainer, range.endOffset);

        const position = clonedRange.toString().length;

        return position;
    }

    selectText() {
        // Assuming this.shadowRoot points to the shadow DOM of the element
        const shadowRoot = this.shadowRoot;

        // You might need to adjust the selector based on how your text is structured
        const textContainer = this.codeDiv;

        if (textContainer) {
            const selection = window.getSelection();
            const range = document.createRange();

            range.selectNodeContents(textContainer);

            selection.removeAllRanges();
            selection.addRange(range);
        }
    }

    connectedCallback() {
        this.codeDiv = this.shadowRoot.querySelector('#code');

        this.codeDiv.addEventListener('input', () => {
            var lineNumber = this.getAttribute('line-number');

            this.updateCode()
            this.updateHint()

            // Send an event to the editor to update the rows value
            this.dispatchEvent(new CustomEvent('action-update', { bubbles: true, composed: true, detail: { lineNumber: lineNumber, value: this.codeDiv.innerText } }));
        });

        this.codeDiv.addEventListener('keyup', (event) => this.checkForSlash(event.target));

        this.codeDiv.addEventListener('keydown', (event) => {
            var lineNumber = this.getAttribute('line-number');

            // If event key is ArrowDown and the character in front of the cursor is a /, then don't do anything
            if ((event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'Enter') && 
                this.codeDiv.innerText.length && 
                this.codeDiv.innerText[this.codeDiv.innerText.length - 1] === '/' &&
                // If the dropdown is already showing, don't do anything because Up/Down arrows will control the dropdown menu options
                this.shadow.querySelector('#dropdown').style.display !== 'none'
            ) {
                event.preventDefault();

                // Do the up/down actions for the dropdown menu instead
                this.navigateDropdown(event.key);
                return;
            }

            // Detect up arrow key
            if (event.key === 'ArrowUp') {
                var cursorPos = this.getCursorPosition(this.codeDiv);

                event.preventDefault();
                this.dispatchEvent(new CustomEvent('action-up', { 
                    bubbles: true, 
                    composed: true, 
                    detail: { 
                        lineNumber: lineNumber,
                        cursorPosition: cursorPos
                    } 
                }));
                return;
            }

            if (event.key === 'ArrowDown') {
                event.preventDefault();
                this.dispatchEvent(new CustomEvent('action-down', { 
                    bubbles: true, 
                    composed: true, 
                    detail: { 
                        lineNumber: lineNumber,
                        cursorPosition: this.getCursorPosition(this.codeDiv)
                    } 
                }));
                return;
            }

            if (event.key === 'ArrowLeft') {
                var text = this.codeDiv.innerText;
                var cursorPos = this.getCursorPosition(this.codeDiv);

                if (cursorPos === 0) {
                    event.preventDefault();
                    this.dispatchEvent(new CustomEvent('action-left', { bubbles: true, composed: true, detail: { lineNumber: lineNumber } }));
                    return;
                }
            }

            if (event.key === 'ArrowRight') {
                var text = this.codeDiv.innerText;
                var cursorPos = this.getCursorPosition(this.codeDiv);

                if (cursorPos === text.length) {
                    event.preventDefault();
                    this.dispatchEvent(new CustomEvent('action-right', { bubbles: true, composed: true, detail: { lineNumber: lineNumber } }));
                    return;
                }
            }

            // Detect delete key
            if (event.key === 'Backspace') {
                var text = this.codeDiv.innerText;

                // Get current cursor position
                var cursorPos = this.getCursorPosition(this.codeDiv);

                // Get text after cursor, and text to persist
                var text = this.codeDiv.innerText;
                var textAfterCursor = text.substring(cursorPos);

                let detail = { 
                    lineNumber: lineNumber, 
                    textAfterCursor: textAfterCursor
                }

                // If cursor is at 0 position, send an event to the editor to delete the row
                if (cursorPos === 0) {
                // if (text === '') {
                    event.preventDefault();
                    this.dispatchEvent(new CustomEvent('action-delete', { bubbles: true, composed: true, detail: detail }));
                    return;
                }
            }

            if (event.key === 'Enter') {
                event.preventDefault();
                
                // Get current cursor position
                var cursorPos = this.getCursorPosition(this.codeDiv);

                // Get text after cursor, and text to persist
                var text = this.codeDiv.innerText;
                var textAfterCursor = text.substring(cursorPos);
                var textToPersist = text.substring(0, cursorPos);
                let detail = { 
                    lineNumber: lineNumber, 
                    textAfterCursor: textAfterCursor,
                    textToPersist: textToPersist
                }

                this.dispatchEvent(new CustomEvent('action-newline', { bubbles: true, composed: true, detail: detail }));

                return;
            }

            if (event.key === 'Tab') {
                event.preventDefault();

                // Get current cursor position
                var cursorPos = this.getCursorPosition(this.codeDiv);
                
                // Insert 4 spaces at the cursor position
                var text = this.codeDiv.innerText;
                var textBeforeCursor = text.substring(0, cursorPos);
                var textAfterCursor = text.substring(cursorPos);
                this.codeDiv.innerText = textBeforeCursor + '\u00A0\u00A0\u00A0\u00A0' + textAfterCursor;

                this.updateCode();
                this.updateHint();
                
                // Move the cursor 4 positions to the right
                var range = document.createRange();
                var sel = window.getSelection();
                range.setStart(this.codeDiv.childNodes[0], this.codeDiv.childNodes[0].length);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);

                this.moveCursorToPosition(this.codeDiv, cursorPos + 4);
                this.dispatchEvent(new CustomEvent('action-update', { bubbles: true, composed: true, detail: { lineNumber: lineNumber, value: this.codeDiv.innerText } }));

                return;
            }
        });
        
        // Enable contentEditable on focus
        this.codeDiv.addEventListener('focus', () => {
            // If the editor is readonly, don't allow focus.
            if (this.getAttribute('readonly') === 'true') {
                this.codeDiv.blur();
                return;
            }

            this.codeDiv.contentEditable = true;
            this.updateHint()
        });

        // Disable contentEditable on blur (when the user clicks away)
        this.codeDiv.addEventListener('blur', () => {
            this.codeDiv.contentEditable = false;
            this.updateHint()

            // When the codeDiv loses focus, hide the hint forcefully on a delay
            // in case it happens quickly and `this.updateHint()` doesn't catch it.
            setTimeout(() => {
                var hint = this.shadow.querySelector("#hint");
                hint.style.opacity = '0';
            }, 400);
        });

        this.codeDiv.addEventListener('click', () => {
            this.codeDiv.contentEditable = true;
            
            // Set focus if not already focused
            if (document.activeElement !== this.codeDiv) {
                this.codeDiv.focus();
            }

            this.updateHint()
        });

        // Dropdown options
        var dropdownItems = this.shadowRoot.querySelectorAll('.dropdown-item');

        dropdownItems.forEach(item => {
            item.addEventListener('click', () => {
                var value = item.getAttribute('data-value'); // Use 'item' here
                this.insertText(value);
            });
        });

        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "value") {
            this.shadow.querySelector("#code").innerText = newValue;
        }

        this.render();
    }

    render() {
        this.updateCode()
    }

    updateCode() {
        var code = this.shadow.querySelector("#code").innerText;
        code = this.escapeHtml(code);

        this.shadow.querySelector("#highlight").innerHTML = code;

        if (typeof Prism !== 'undefined' && this.codeDiv) {
            Prism.highlightAllUnder(this.shadow);
        }
    }
        

    /**
     * Required for when users type a string such as '<html>' into the editor, which
     * traditionally would be interpreted as HTML and not displayed as text. This function
     * escapes the HTML so that it is displayed as text.
     * @param {*} unsafe 
     * @returns string
     */
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // TODO: This also exists in `editor.js` and can be centralized somewhere for reusability
    moveCursorToPosition(element, position) {
        var range = document.createRange();
        var sel = window.getSelection();

        if (element && element.childNodes.length === 0) return;

        let lineLength = element.childNodes[0].length;
        range.setStart(element.childNodes[0], position > lineLength ? lineLength : position);

        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }

    checkForSlash(textarea) {
        var text = textarea.innerText;
        var cursorPos = textarea.selectionStart;
        var textUpToCursor = text.substring(0, cursorPos);
        var currentLine = textUpToCursor.split("\n").pop();
        var slashIndex = currentLine.lastIndexOf('/');
    
        if (slashIndex === 0) {
            var filterText = currentLine.substring(slashIndex + 1);
            this.filterAndShowDropdown(filterText);
        } else {
            this.hideDropdown();
        }
    }
    
    filterAndShowDropdown(filterText) {
        var dropdown = this.shadow.querySelector('#dropdown');
        var items = dropdown.getElementsByClassName('dropdown-item');
        var showDropdown = false;
    
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.textContent.toLowerCase().includes(filterText.toLowerCase())) {
                item.style.display = '';
                showDropdown = true;
            } else {
                item.style.display = 'none';
            }
        }
    
        dropdown.style.display = showDropdown ? '' : 'none';
    }

    updateHint() {
        var textarea = this.shadow.querySelector("#code");
        var hint = this.shadow.querySelector("#hint");

        // Get cursor position and current line
        var cursorPos = textarea.selectionStart;
        var textUpToCursor = textarea.innerText.substring(0, cursorPos);
        var currentLine = textUpToCursor.split("\n").pop();

        // Check if current line is empty and adjust hint position and visibility
        if (currentLine.length === 0 && this.codeDiv.contentEditable === 'true') {
            var lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight, 1.5);
            var numberOfLines = textUpToCursor.split("\n").length;
            var hintTop = (numberOfLines - 1) * lineHeight;

            hint.style.top = hintTop + '2px';
            hint.style.left = '4px';

            // Wait 500ms before showing the hint
            setTimeout(() => {
                hint.style.opacity = '1';
            }, 500);
        } else {
            // If the line was empty and the user clicked away, hide the hint
            if (this.codeDiv.contentEditable !== 'true') {
                hint.style.opacity = '0';
                return;
            }

            // If a character was typed, hide the hint
            hint.style.display = 'none';
            hint.style.opacity = '0';

            setTimeout(() => {
                hint.style.display = 'block';
            }, 300);
        }
    }

    showDropdown() {
        this.selectedItemIndex = -1;
        var dropdown = this.shadow.querySelector("#dropdown");
        dropdown.style.display = 'block';
    }

    hideDropdown() {
        var dropdown = this.shadow.querySelector("#dropdown");
        dropdown.style.display = 'none';
    }

    insertText(text) {
        this.codeDiv.innerText = text;

        this.updateCode();
        this.updateHint();
        this.hideDropdown();

        // Get text after cursor, and text to persist
        var lineNumber = this.getAttribute('line-number');
        var text = this.codeDiv.innerText;
        var textToPersist =text;
        let detail = { 
            lineNumber: lineNumber,
            textToPersist: textToPersist
        }


        this.dispatchEvent(new CustomEvent('action-update', { bubbles: true, composed: true, detail: { lineNumber: lineNumber, value: this.codeDiv.innerText } }));
        this.dispatchEvent(new CustomEvent('action-newline', { bubbles: true, composed: true, detail: detail }));

    }

    navigateDropdown(key) {
        const dropdown = this.shadow.querySelector('#dropdown');
        const items = Array.from(dropdown.getElementsByClassName('dropdown-item'));
        const visibleItems = items.filter(item => item.style.display !== 'none');
    
        if (key === 'ArrowDown') {
            this.selectedItemIndex = (this.selectedItemIndex + 1) % visibleItems.length;
        } else if (key === 'ArrowUp') {
            this.selectedItemIndex = (this.selectedItemIndex - 1 + visibleItems.length) % visibleItems.length;
        } else if (key === 'Enter' && this.selectedItemIndex !== -1) {
            let option = visibleItems[this.selectedItemIndex]
            let value = option.getAttribute('data-value');

            this.insertText(value);
            this.hideDropdown();

            return;
        }
    
        visibleItems.forEach((item, index) => {
            item.classList.toggle('selected', index === this.selectedItemIndex);
        });
    }
}

window.customElements.define("outerbase-editor-row-text", OuterbaseEditorRowText);