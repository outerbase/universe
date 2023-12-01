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
        white-space: pre-wrap;
        word-wrap: break-word;
        user-select: none;
        color: #9abbef;
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
    }

    .dropdown {
        position: absolute;
        border: 1px solid #ccc;
        background-color: white;
        z-index: 1000;
        top: 24px;
        left: 0px;
    }

    .dropdown-item {
        padding: 5px;
        cursor: pointer;
    }

    .dropdown-item:hover {
        background-color: #f0f0f0;
    }

    .keyword { color: #98d7c8; }
    .string { color: #d99ad9; }
    .comment { color: #6a6a6a; }
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
    
</style>

<div id="container">
    <pre><code id="highlight"></code></pre>
    <div id="code" contentEditable="false"></div>

    <!-- Show a line hint when the line is empty and cursor is active -->
    <div id="hint" style="display: none;">Type '/' for a list of code block suggestions.</div>

    <!-- "/" options to show -->
    <div id="dropdown" class="dropdown" style="display: none;">
        <div class="dropdown-item" data-value="Option 1">Option 1</div>
        <div class="dropdown-item" data-value="Option 2">Option 2</div>    
    </div>
</div>
`;

class OuterbaseEditorRowText extends HTMLElement {
    static get observedAttributes() {
        return [
            "line-number",
            "value"
        ];
    }

    constructor() {
        super();

        this.shadow = this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = templateRowContent.innerHTML;
    }

    changeContentEditable(bool) {
        this.contentEditable = bool;
        this.updateHint()
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

            // Detect up arrow key
            if (event.key === 'ArrowUp') {
                event.preventDefault();
                this.dispatchEvent(new CustomEvent('action-up', { bubbles: true, composed: true, detail: { lineNumber: lineNumber } }));
                return;
            }

            if (event.key === 'ArrowDown') {
                event.preventDefault();
                this.dispatchEvent(new CustomEvent('action-down', { bubbles: true, composed: true, detail: { lineNumber: lineNumber } }));
                return;
            }

            // Detect delete key
            if (event.key === 'Backspace') {
                var text = this.codeDiv.innerText;

                if (text === '') {
                    event.preventDefault();
                    this.dispatchEvent(new CustomEvent('action-delete', { bubbles: true, composed: true, detail: { lineNumber: lineNumber } }));
                    return;
                }
            }

            if (event.key === 'Enter') {
                event.preventDefault();
                
                // TODO: Take any characters to the right of the cursor down into a new line with it.
                this.dispatchEvent(new CustomEvent('action-newline', { bubbles: true, composed: true, detail: { lineNumber: lineNumber } }));
                return;
            }

            if (event.key === 'Tab') {
                console.log('Tab pressed')
                event.preventDefault();

                let test = this.codeDiv.innerText + '\u00A0\u00A0\u00A0\u00A0';
                console.log('Test: ', test)
                this.codeDiv.innerText = test;
                this.updateCode();
                this.updateHint();
                
                // Move the cursor 4 positions to the right
                var range = document.createRange();
                var sel = window.getSelection();
                range.setStart(this.codeDiv.childNodes[0], this.codeDiv.childNodes[0].length);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);

                return;
            }
        });
        
        this.codeDiv.addEventListener('scroll', function() {
            this.shadowRoot.querySelector('#hint').style.display = 'none';
        });
        
        // Enable contentEditable on focus
        this.codeDiv.addEventListener('focus', () => {
            this.codeDiv.contentEditable = true;
            this.updateHint()
        });

        // Disable contentEditable on blur (when the user clicks away)
        this.codeDiv.addEventListener('blur', () => {
            this.codeDiv.contentEditable = false;
            this.updateHint()
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

        // Single and double quote strings
        code = code.replace(/(&#039;|&quot;)(.*?)(&#039;|&quot;)/g, '<span class="string">$&</span>');

        // Keywords
        code = code.replace(/(var|let|const|function|return|if|else|for|while|break|continue)/g, '<span class="keyword">$1</span>');

        // Inline comments
        code = code.replace(/(\/\/.*)/g, '<span class="comment">$1</span>');

        // Block comments
        code = code.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>');

        // Replace "{{SECRET.any_key}}" with a special div
        code = code.replace(/{{SECRET\..+?}}/g, '<span class="secret">$&</span>');

        this.shadow.querySelector("#highlight").innerHTML = code;
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    checkForSlash(textarea) {
        var text = textarea.innerText;
        var cursorPos = textarea.selectionStart;
        var textUpToCursor = text.substring(0, cursorPos);
        var currentLine = textUpToCursor.split("\n").pop();

        if (currentLine.trim() === '/') {
            this.showDropdown(textarea);
        } else {
            this.hideDropdown();
        }
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
            hint.style.left = '4px'; // Adjust based on your styling
            hint.style.display = 'block';
        } else {
            hint.style.display = 'none';
        }
    }

    showDropdown() {
        var dropdown = this.shadow.querySelector("#dropdown");
        dropdown.style.display = 'block';
    }

    hideDropdown() {
        var dropdown = this.shadow.querySelector("#dropdown");
        dropdown.style.display = 'none';
    }

    insertText(text) {
        var textarea = this.shadow.querySelector("#code");

        textarea.innerText = text;
        this.hideDropdown();
        this.updateCode(); // Update your code display
    }
}

window.customElements.define("outerbase-editor-row-text", OuterbaseEditorRowText);