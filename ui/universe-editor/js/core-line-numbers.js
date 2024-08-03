export class CoreLineNumbers {
    parent = null;
    editor = null;
    codeContainer = null;
    isFocused = false;

    constructor() { }

    init(parent, attributeValue) {
        this.parent = parent;
        this.editor = parent.shadowRoot.querySelector(".editor");
        this.codeContainer = this.parent.shadowRoot.getElementById('code-container');
        
        this.codeContainer.addEventListener('scroll', () => {
            // Synchronize vertical scroll between line numbers and code editor
            const lineNumberContainer = this.parent.shadowRoot.getElementById('line-number-container');
            lineNumberContainer.style.marginTop = `${-this.codeContainer.scrollTop}px`;
        });
    }

    attributeName() {
        return "core";
    }

    css() {
        return `
        #line-number-container {
            padding: var(--padding-horizontal);
            font-family: var(--font-family-mono);
            font-size: var(--font-size);
            line-height: var(--line-height);
            color: var(--color-neutral-500);
            text-align: right;
            -webkit-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
    
        .dark #line-number-container {
            color: var(--color-neutral-400);
        }
    
        .active-line-number {
            color: var(--color-neutral-800);
        }
    
        .dark .active-line-number {
            color: var(--color-neutral-50);
        }
        `;
    }

    html() {
        return `
        <div id="line-number-container">
            <div>1</div>
        </div>
        `
    }

    location() {
        return "left"
    }

    onStateChange({ startLineNumber, endLineNumber, lines }) {
        this._updateLineNumbers(lines.length);
        this._highlightActiveLineNumber(startLineNumber + 1, endLineNumber + 1);
    }

    _updateLineNumbers(lineCount) {
        if (typeof window === 'undefined') {
            return
        }

        const lineNumberContainer = this.parent.shadowRoot.getElementById("line-number-container");
        lineNumberContainer.innerHTML = ''; // Clear existing line numbers
    
        for (let i = 1; i <= lineCount; i++) {
            const lineNumberDiv = document.createElement("div");
            lineNumberDiv.textContent = i;
            lineNumberContainer.appendChild(lineNumberDiv);
        }
    }

    _unhighlightAllLineNumbers() {
        const lineNumbers = this.parent.shadowRoot.querySelectorAll("#line-number-container div");
    
        // Remove the active class from all line numbers
        lineNumbers.forEach(line => {
            line.classList.remove('active-line-number');
        });
    }

    _highlightActiveLineNumber(startLineNumber, endLineNumber) {
        const lineNumbers = this.parent.shadowRoot.querySelectorAll("#line-number-container div");
    
        // Before applying a highlight to any line numbers, remove all highlights first
        this._unhighlightAllLineNumbers();
    
        // Add the active class to all line numbers in the selection range
        for (let i = startLineNumber; i <= endLineNumber; i++) {
            const lineNumberDiv = lineNumbers[i - 1];
            if (lineNumberDiv) {
                lineNumberDiv.classList.add('active-line-number');
            }
        }
    }
}

window.CoreLineNumbers = CoreLineNumbers;
