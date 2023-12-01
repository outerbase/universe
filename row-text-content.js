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

    .keyword { color: #98d7c8; }
    .string { color: #d99ad9; }
    .braces { color: #e4c945; }
    .variable-name { color: white; }
    .comment { color: #6a6a6a; }
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
    
</style>

<div id="container">
    <pre><code id="highlight"></code></pre>
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

class OuterbaseEditorRowText extends HTMLElement {
    static get observedAttributes() {
        return [
            "line-number",
            "value"
        ];
    }

    selectedItemIndex = -1;

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

            // If event key is ArrowDown and the character in front of the cursor is a /, then don't do anything
            if ((event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'Enter') && this.codeDiv.innerText.length && this.codeDiv.innerText[this.codeDiv.innerText.length - 1] === '/') {
                event.preventDefault();
                // Do the up/down actions for the dropdown menu instead
                this.navigateDropdown(event.key);
                return;
            }

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
                event.preventDefault();

                let tab = this.codeDiv.innerText + '\u00A0\u00A0\u00A0\u00A0';
                this.codeDiv.innerText = tab;
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
        
        // Enable contentEditable on focus
        this.codeDiv.addEventListener('focus', () => {
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

        // Replace "{{request.type.any_key}}" with a special div
        code = code.replace(/{{request\..+?}}/g, '<span class="request">$&</span>');

        // Braces
        code = code.replace(/(\{|\}|\(|\))/g, '<span class="braces">$&</span>');

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

        var lineNumber = this.getAttribute('line-number');
        this.dispatchEvent(new CustomEvent('action-update', { bubbles: true, composed: true, detail: { lineNumber: lineNumber, value: this.codeDiv.innerText } }));
        this.dispatchEvent(new CustomEvent('action-newline', { bubbles: true, composed: true, detail: { lineNumber: lineNumber } }));
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