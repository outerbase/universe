import '../prism/prism.js';          // Defines the Prism object
import '../prism/prism-sql.min.js';  // Defines tokens for SQL langauge

export class CoreEditor {
    parent = null;
    editor = null;
    visualizer = null;
    codeContainer = null;

    constructor() { }

    init(parent, attributeValue) {
        this.parent = parent;
        this.editor = parent.shadowRoot.querySelector(".editor");
        this.visualizer = parent.shadowRoot.querySelector("code");
        this.codeContainer = parent.shadowRoot.getElementById("code-container");

        let languageAttribute = parent.getAttribute("language");
        this.visualizer.className = `language-${languageAttribute}`;
        
        // Add event listeners for events on the textarea
        parent.shadowRoot.querySelector('textarea').addEventListener('focus', this.onFocus.bind(this));
        parent.shadowRoot.querySelector('textarea').addEventListener('blur', this.onBlur.bind(this));

        this.editor.addEventListener('mousedown', () => {
            this.parent.broadcastEvent(this, 'onMouseDown', true);
        });

        this.editor.addEventListener('mouseup', () => {
            this.parent.broadcastEvent(this, 'onMouseUp', true);
        });

        this.editor.addEventListener('mousemove', () => {
            this.parent.broadcastEvent(this, 'onMouseMove', true);
        });

        this.editor.addEventListener('keydown', (event) => {
            this.parent.broadcastEvent(this, 'onKeyDown', event);
        });

        this.editor.addEventListener('keyup', (event) => {
            this.parent.broadcastEvent(this, 'onKeyUp', event);
        });

        this.editor.addEventListener('input', (event) => {
            this.onInputChange(event.target.value);
        });
    }

    attributeName() {
        return "core";
    }

    css() {
        return `
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
    
        #code-container {
            flex: 1;
            position: relative;
            overflow: scroll;
            min-height: 100%;
    
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    
        #code-container::-webkit-scrollbar { 
            display: none;
        }
    
        textarea, code {
            padding: var(--padding-horizontal);
            white-space: pre;
            overflow-wrap: normal;
            word-wrap: normal;
        }
    
        textarea {
            resize: none;
            outline: none;
            overflow: hidden;
        }
    
        pre, textarea, code {
            margin: 0 !important;
            min-height: 100%;
            min-width: calc(100% - 20px);
            background-color: transparent;
            font-family: var(--font-family-mono);
            font-size: var(--font-size);
            line-height: var(--line-height);
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
    
        .dark .editor {
            caret-color: var(--color-primary-dark);
        }
    
        pre {
            padding: 0;
        }
    
        code {
            pointer-events: none;
            position: absolute;
            top: 0px;
            left: 0px;
            width: calc(100% - 20px);
            height: 100%;
            color: var(--color-primary-light);
        }
        `;
    }

    html() {
        return `
        <div id="code-container">
            <textarea class="editor" spellcheck="false"></textarea>
            <pre><code></code></pre>
        </div>
        `
    }

    location() {
        return "center"
    }

    attributeChangedCallback({ name, oldValue, newValue }) {
        if (name === "code") {
            // If the editor or visualizer is not ready, wait for them to be ready
            if (!this.editor || !this.visualizer) {
                setTimeout(() => {
                    this.onInputChange(newValue);
                }, 100);

                return;
            }

            // Otherwise, call the function immediately
            this.onInputChange(newValue);
        }
    }

    onFocus() {
        // Call onFocus method of each plugin instance when editor gains focus
        this.parent.broadcastEvent(this, 'onFocus', true);
    }

    onBlur() {
        // Call onBlur method of each plugin instance when editor loses focus
        this.parent.broadcastEvent(this, 'onBlur', true);
    }

    onInputChange(value) {
        if (!this.editor || !this.visualizer) return;

        this.editor.value = value;
        this.visualizer.innerHTML = value;
        this._adjustTextAreaSize();

        this.parent.broadcastEvent(this, 'onInputChange', value);
        this.parent.dispatchEvent(new CustomEvent('change', { bubbles: true, composed: true, detail: { value } }));
        
        try {
            Prism.highlightElement(this.visualizer);
        } catch (error) { }
    }

    _adjustTextAreaSize() {
        // Height is number of lines * line height
        const lineHeight = parseFloat(getComputedStyle(this.editor).lineHeight);
        const lineCount = this.editor.value.split("\n").length;
        const height = lineCount * lineHeight;
        const widthPadding = 8;

        // Go through each line of text and calculate the width of the line
        const lines = this.editor.value.split("\n");
        let width = 0;
        let characterWidth = 7.87;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineWidth = line.length * characterWidth;
            width = Math.max(width, lineWidth);
        }

        // Set the editor to the calculated width and height
        this.editor.style.width = `${width + widthPadding}px`;
        this.editor.style.height = `${height}px`;  
    }
}

window.CoreEditor = CoreEditor;
