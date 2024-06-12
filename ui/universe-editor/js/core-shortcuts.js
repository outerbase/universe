export class CoreKeyboardShortcuts {
    parent = null;
    editor = null;
    codeContainer = null;

    constructor() { }

    init(parent, attributeValue) {
        this.parent = parent;
        this.editor = parent.shadowRoot.querySelector(".editor");
        this.codeContainer = this.parent.shadowRoot.getElementById('code-container')
    }

    attributeName() {
        return "core";
    }

    onKeyDown(event) {
        this._detectKeys(event);
    }

    _detectKeys(e) {
        if (e.key === "Tab") {
            e.preventDefault();
            this._tabLine(e);
        }
        else if (e.metaKey && e.key === "Enter") {
            e.preventDefault();
            this.parent.dispatchEvent(new CustomEvent('universe-event', { bubbles: true, composed: true, detail: { execute: true, value: this.editor.value } }));
        }
        else if (e.key === "Enter") {
            e.preventDefault();
            this._newLine(e);
        }
        else  if (e.metaKey && e.key === ']') {
            e.preventDefault();
            this._indentLine('right');
        }
        else if (e.metaKey && e.key === '[') {
            e.preventDefault();
            this._indentLine('left');
        } 
        else if (e.metaKey && e.key === '/') {
            e.preventDefault();
            e.stopPropagation();
            this._commentLine(e);
        }

        // Likely a material change occurred with your text value from an above case, so we'll broadcast the change
        this.parent.broadcastEvent(this, 'onInputChange', this.editor.value);

        // The shortcuts above may have manipulated the contents of the textarea and the cursor position,
        // so we need to manually trigger the value throughout all plugins in the editor. We'll do this
        // by dispatching a custom event with the updated code value.
        this.parent.broadcastEvent(this, 'attributeChangedCallback', { name: 'value', oldValue: this.editor.value, newValue: e.target.value });
    }

    _tabLine(e) {
        const start = e.target.selectionStart;
        const end = e.target.selectionEnd;

        // Set textarea value to: text before caret + tab + text after caret
        e.target.value = e.target.value.substring(0, start) +
                            "    " + // This is where the tab character or spaces go
                            e.target.value.substring(end);

        // Put caret at right position again
        e.target.selectionStart =
        e.target.selectionEnd = start + 4; // Move the caret after the tab
    }

    _newLine(e) {
        const start = e.target.selectionStart;
        const end = e.target.selectionEnd;
        const beforeText = e.target.value.substring(0, start);
        const afterText = e.target.value.substring(end);

        // Find the start of the current line
        const lineStart = beforeText.lastIndexOf("\n") + 1;

        // Calculate the indentation of the current line
        const indentation = beforeText.substring(lineStart).match(/^(\s*)/)[0];

        // Insert newline and the same indentation
        e.target.value = beforeText + "\n" + indentation + afterText;

        // Update cursor position
        const newPos = start + 1 + indentation.length; // Move cursor after the new line and indentation
        e.target.selectionStart = e.target.selectionEnd = newPos;

        // Scroll code container to the far left
        this.codeContainer.scrollLeft = 0;

        // Check if the cursor is at the end of the text (or on the last line)
        const cursorPosition = this.editor.selectionStart;
        if (cursorPosition === this.editor.value.length) {
            requestAnimationFrame(() => {
                // Scroll the parent container to the bottom
                this.codeContainer.scrollTop = this.codeContainer.scrollHeight;
            });
        }
    }

    _commentLine(e) {
        const start = e.target.selectionStart;
        const end = e.target.selectionEnd;
        const text = e.target.value;
    
        // Find the start and end of the current line
        const lineStart = text.lastIndexOf("\n", start - 1) + 1;
        let lineEnd = text.indexOf("\n", end);
        lineEnd = lineEnd === -1 ? text.length : lineEnd;
    
        const beforeLine = text.substring(0, lineStart);
        const lineText = text.substring(lineStart, lineEnd);
        const afterLine = text.substring(lineEnd);
    
        const commentCharacters = this.parent.getAttribute("language") === "sql" ? "-- " : "// ";
    
        // Check if the line is already commented out
        if (lineText.startsWith(commentCharacters)) {
            // Remove comment characters at the start of the line
            const newLineText = lineText.substring(commentCharacters.length);
            e.target.value = beforeLine + newLineText + afterLine;
    
            // Adjust the cursor position after removing the comment
            e.target.selectionStart = start - commentCharacters.length < lineStart ? lineStart : start - commentCharacters.length;
            e.target.selectionEnd = end - commentCharacters.length;
        } else {
            // Add comment characters at the start of the line
            e.target.value = beforeLine + commentCharacters + lineText + afterLine;
    
            // Adjust the cursor position after adding the comment
            e.target.selectionStart = start + commentCharacters.length;
            e.target.selectionEnd = end + commentCharacters.length;
        }
    }

    _indentLine(direction) {
        const start = this.editor.selectionStart;
        const end = this.editor.selectionEnd;
        const selectedText = this.editor.value.substring(start, end);
        const beforeText = this.editor.value.substring(0, start);
        const afterText = this.editor.value.substring(end);
        const tabLength = 4;
    
        // Find the start of the current line
        const lineStart = beforeText.lastIndexOf("\n") + 1;

        // Create a string with the number of spaces as `tabLength`
        const tab = Array(tabLength).fill(" ").join("");
    
        if (direction === 'right') {
            // Add a tab (or spaces) at the start of the line
            this.editor.value = beforeText.substring(0, lineStart) + tab + beforeText.substring(lineStart) + selectedText + afterText;
            // Adjust the cursor position
            this.editor.selectionStart = start + tabLength;
            this.editor.selectionEnd = end + tabLength;
        } else if (direction === 'left') {
            // Remove a tab (or spaces) from the start of the line if present
            const lineIndent = beforeText.substring(lineStart);
            if (lineIndent.startsWith(tab)) {
                this.editor.value = beforeText.substring(0, lineStart) + beforeText.substring(lineStart + tabLength) + selectedText + afterText;
                // Adjust the cursor position
                this.editor.selectionStart = start - tabLength > lineStart ? start - 4 : lineStart;
                this.editor.selectionEnd = end - tabLength > lineStart ? end - 4 : lineStart;
            }
        }
    }
}

window.CoreKeyboardShortcuts = CoreKeyboardShortcuts;
