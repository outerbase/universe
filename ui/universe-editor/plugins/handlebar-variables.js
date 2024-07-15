export class HandlebarVariablesPlugin {
    parent = null;
    variables = [];

    constructor() { }

    init(parent, attributeValue) {
        this.parent = parent;
        this.updatePrismLogic();
        
        const variableString = this.parent.getAttribute('plugin-handlebar-variables');
        
        if (variableString !== null) {
            this.variables = JSON.parse(variableString);
            this.updateVariablesMenu();
        }
    }

    updatePrismLogic() {
        if (typeof Prism !== 'undefined') {
            if (Prism.languages.sql) {
                // const schemaPattern = {
                //     'variable-token': { // This is the token name
                //         pattern: /\{\{(.*?)\}\}/, // Matches any text within double curly braces
                //         alias: 'variable-token' // Use 'alias' to apply a special CSS class
                //     }
                // };

                const schemaPattern = {
                    'variable-token': {
                        pattern: /\{(.*?)(?=\s|$)/, // Matches any text within curly braces, stopping at the first space or end of line
                        alias: 'variable-token' // Use 'alias' to apply a special CSS class
                    }
                };
    
                // Insert the new token in the SQL language before 'keyword', or another suitable token
                Prism.languages.insertBefore('sql', 'keyword', schemaPattern);
            }
    
            Prism.highlightAllUnder(this.parent);
        }
    }

    attributeName() {
        return "plugin-handlebar-variables";
    }

    css() {
        return `
            #variables-container {
                padding: 8px 0;
                border-radius: 12px;
                background: var(--color-neutral-800);
                position: absolute;
                display: none;
                z-index: 10;
                margin-top: 20px;
                top: 0;
                left: 0;
                width: 100px;
                min-width: 127px;
                max-height: 166px;
                overflow-y: scroll;
            }

            #variables-container > p {
                margin: 0;
                padding: 8px 12px;
                cursor: pointer;
                line-height: 12px;
                color: var(--color-neutral-100);
                font-family: var(--font-family-mono);
                font-size: var(--font-size);
            }

            #variables-container > p:hover {
                background: var(--color-neutral-700);
            }

            .variable-token { 
                position: relative; 
                color: var(--color-neutral-700);
            }

            .variable-token::before {
                content: "";
                position: absolute;
                left: -4px;
                right: -4px;
                top: -2px;
                bottom: -2px;
                background: var(--color-neutral-200);
                z-index: -1;
                border-radius: 4px;
            }

            .dark .variable-token {
                color: var(--color-neutral-300);
            }

            .dark .variable-token::before {
                background: var(--color-neutral-800);
            }
        `;
    }

    html() {
        return `
            <div id="variables-container">
                <p>Table A</p>
            </div>
        `
    }

    location() {
        return 'center'
    }

    insertAsChild() {
        // Can be a CSS selector, default is false
        return `#code-container`
    }

    onInputChange(value) {
        this.detectCurrentWord();
    }

    onMouseDown() {
        this.detectCurrentWord();
    }

    detectCurrentWord() {
        if (this.variables.length === 0) {
            return
        }

        requestAnimationFrame(() => {
            // Detect what word the cursor is next to in the `#code-editor` textarea
            const editor = this.parent.shadowRoot.querySelector(".editor");
            const variablesContainer = this.parent.shadowRoot.getElementById('variables-container');
            const cursorPosition = editor.selectionStart;
            const text = editor.value;

            // Get the cursror position of the word the cursor starts on
            let start = cursorPosition;
            while (start > 0 && text[start - 1] !== ' ' && text[start - 1] !== '\n') {
                start--;
            }

            // Get the cursror position of the word the cursor ends on
            let end = cursorPosition;
            while (end < text.length && text[end] !== ' '  && text[end] !== '\n') {
                end++;
            }

            // Get the word the cursor is on
            const variable = text.substring(start, end);

            if (!variable.startsWith('{') || !this.variables.length === 0) {
                variablesContainer.style.display = 'none';
                return
            }

            variablesContainer.style.display = 'block';

            // Create a temporary div to measure the position of the word
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '0px';
            tempDiv.style.top = '0px';
            tempDiv.style.width = '100000000px';
            tempDiv.style.whiteSpace = 'pre-wrap';
            tempDiv.style.visibility = 'hidden';
            tempDiv.style.font = getComputedStyle(editor).font;
            tempDiv.style.lineHeight = getComputedStyle(editor).lineHeight;

            // Copy the text up to the cursor's position
            const textBeforeWord = text.slice(0, start);

            // Get `#code-container` div
            const codeContainer = this.parent.shadowRoot.getElementById('code-container');

            // Append the temporary div to the document
            codeContainer.appendChild(tempDiv);

            // Set the content of the temporary div
            tempDiv.textContent = textBeforeWord;

            // Create a span for the word within the temporary div
            const wordSpan = document.createElement('span');
            wordSpan.textContent = text.substring(start, end);
            tempDiv.appendChild(wordSpan);

            // Measure the position of the word
            const spanRect = wordSpan.getBoundingClientRect();

            // Remove the temporary div from the document
            codeContainer.removeChild(tempDiv);

            // Get the position relative to the editor container
            const editorRect = editor.getBoundingClientRect();
            const xPos = spanRect.left - editorRect.left;
            const yPos = spanRect.top - editorRect.top;

            // Change `#variables-container` position to the word's position
            variablesContainer.style.top = `${yPos}px`;
            variablesContainer.style.left = `${xPos}px`;
        });
    }

    updateVariablesMenu() {
        const variablesContainer = this.parent.shadowRoot.getElementById('variables-container');
        variablesContainer.innerHTML = '';

        this.variables.forEach(variable => {
            const p = document.createElement('p');
            p.textContent = `{{${variable}}}`;
            variablesContainer.appendChild(p);
        });

        // On click of any of the `p` elements, insert the variable into the editor
        variablesContainer.querySelectorAll('p').forEach(p => {
            p.addEventListener('click', () => {
                const editor = this.parent.shadowRoot.querySelector(".editor");
                const cursorPosition = editor.selectionStart;
                const text = editor.value;

                // Get the cursror position of the word the cursor starts on
                let start = cursorPosition;
                while (start > 0 && text[start - 1] !== ' ' && text[start - 1] !== '\n') {
                    start--;
                }

                // Get the cursror position of the word the cursor ends on
                let end = cursorPosition;
                while (end < text.length && text[end] !== ' '  && text[end] !== '\n') {
                    end++;
                }

                // Replace the variable with the selected variable
                const contentToReplaceWith = `${p.textContent} `
                const newText = text.substring(0, start) + contentToReplaceWith + text.substring(end);
                editor.value = newText;
                editor.selectionStart = start + contentToReplaceWith.length;
                editor.selectionEnd = start + contentToReplaceWith.length;

                // Update the parent component's value
                this.parent.value = newText;
                this.parent.broadcastEvent(this, 'onInputChange', newText);
            });
        });
    }
}

window.HandlebarVariablesPlugin = HandlebarVariablesPlugin;
