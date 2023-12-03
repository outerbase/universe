var templateEditor = document.createElement("template");
templateEditor.innerHTML = `
<style>
    #editor-rows {
        padding: 16px 0;
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow-y: scroll;
        background: #171717;
    }
</style>

<div id="editor-rows">

</div>
`;

class OuterbaseEditor extends HTMLElement {
    container = null;
    rowData = [
        // { value: "" },
        // { value: "// What goes here?" },
        // { value: 'var test = "Hello, world!"; // Here is a comment' },
        // { value: "var secret = {{SECRET.AWS_PROD}}" },
        // { value: "" },
        // { value: "var username = {{request.body.username}}" },
        // { value: "" },
        // { value: "/*" },
        // { value: "  A block level comment here." },
        // { value: "*/" },
        // { value: "" },
        // { value: "// Add my Slack bot" },
        // { value: "OB:WASM:1" },
        // { isBlock: true, blockContent: "Slack Bot" },
    ];

    // Drag and drop row support
    draggedElement = null;
    dropTarget = null;

    static get observedAttributes() {
        return [
            "code",
            "read-only"
        ];
    }

    constructor() {
        super();

        this.shadow = this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = templateEditor.innerHTML;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "code") {
            // Parse the code into rows array from string, splitting on `\n` characters
            this.rowData = newValue.split("\\n").map((item, index) => {
                return {
                    value: item,
                    lineNumber: (index + 1).toString(),
                    'read-only': this.getAttribute('read-only') === "true" ? true : false
                };
            });

            this.render();
        } else if (name === "read-only") {
            if (newValue === "true") {
                this.rowData.forEach((item, index) => {
                    item['read-only'] = true;
                });
            } else {
                this.rowData.forEach((item, index) => {
                    item['read-only'] = false;
                });
            }

            this.render();
        }
    }

    connectedCallback() {
        this.render();

        this.container = this.shadow.querySelector("#editor-rows");
    
        this.container.addEventListener('dragstart', (event) => {
            this.draggedElement = event.target.closest('outerbase-editor-row');
            event.dataTransfer.effectAllowed = 'move';
        });
    
        this.container.addEventListener('dragover', (event) => {
            event.preventDefault(); // Necessary to allow dropping
            const target = event.target.closest('outerbase-editor-row');
            if (target && target !== this.draggedElement) {
                this.dropTarget = target;
                event.dataTransfer.dropEffect = 'move';
            }
        });
        
        this.container.addEventListener('dragend', (event) => {
            if (!this.dropTarget) return;
            const targetIndex = this.getRowDataIndex(this.dropTarget);
            const draggedIndex = this.getRowDataIndex(this.draggedElement);

            // Move the dragged element data to the target index
            this.rowData.splice(targetIndex, 0, this.rowData.splice(draggedIndex, 1)[0]);
            
            // Update lineNumber for each rowData item
            this.rowData.forEach((item, index) => {
                item.lineNumber = (index + 1).toString();
            });

            this.render(); // Re-render the UI

            // Reset everything
            this.draggedElement = null;
            this.dropTarget = null;
        });

        this.addEventListener('action-newline', (event) => {
            let lineNumber = event.detail.lineNumber;

            // Insert a new row at the line number
            this.rowData.splice(lineNumber, 0, { value: "" });
            this.render(); 

            // Row shadow root
            let rowElement = this.shadow.querySelector(`outerbase-editor-row[data-index="${lineNumber}"]`)
            if (!rowElement || !rowElement.shadowRoot) return;
            let rowShadowRoot = rowElement.shadowRoot

            // Find the `slot` element in rowElement
            let slotElement = rowShadowRoot.querySelector('slot');

            // Find the `outerbase-editor-row-text` element in slotElement
            let rowTextElement = slotElement.assignedElements()[0].shadowRoot;
            let codeElement = rowTextElement.querySelector('#code');

            // Make codeElement contentEditable
            codeElement.contentEditable = true;
            codeElement.focus();
        });

        this.addEventListener('action-delete', (event) => {
            let lineNumber = event.detail.lineNumber;

            // Delete the row at the line number
            this.rowData.splice(lineNumber - 1, 1);
            this.render(); 

            // Row shadow root
            let rowElement = this.shadow.querySelector(`outerbase-editor-row[data-index="${lineNumber - 2}"]`)
            if (!rowElement || !rowElement.shadowRoot) return;
            let rowShadowRoot = rowElement.shadowRoot
            

            // Find the `slot` element in rowElement
            let slotElement = rowShadowRoot.querySelector('slot');

            // Find the `outerbase-editor-row-text` element in slotElement
            let rowTextElement = slotElement.assignedElements()[0].shadowRoot;
            let codeElement = rowTextElement.querySelector('#code');

            // Make codeElement contentEditable
            codeElement.contentEditable = true;
            codeElement.focus();

            if (codeElement.childNodes.length === 0) return;
            this.moveCursorToPosition(codeElement, codeElement.childNodes[0].length);
        });

        this.addEventListener('action-update', (event) => {
            let lineNumber = event.detail.lineNumber;
            let value = event.detail.value;

            // Update the row at the line number
            this.rowData[lineNumber - 1].value = value;
        });

        this.addEventListener('action-up', (event) => {
            let lineNumber = event.detail.lineNumber;
            let cursorPosition = event.detail.cursorPosition;

            // Row shadow root
            let rowElement = this.shadow.querySelector(`outerbase-editor-row[data-index="${lineNumber - 2}"]`)
            if (!rowElement || !rowElement.shadowRoot) return;
            let rowShadowRoot = rowElement.shadowRoot

            // Find the `slot` element in rowElement
            let slotElement = rowShadowRoot.querySelector('slot');

            // Find the `outerbase-editor-row-text` element in slotElement
            let rowTextElement = slotElement.assignedElements()[0].shadowRoot;

            if (!rowTextElement) return;
            let codeElement = rowTextElement.querySelector('#code');

            // Make codeElement contentEditable
            codeElement.contentEditable = true;
            codeElement.focus();

            // Move the cursor up to the line above at the same position if possible
            this.moveCursorToPosition(codeElement, cursorPosition);
        });

        this.addEventListener('action-down', (event) => {
            let lineNumber = event.detail.lineNumber;
            let cursorPosition = event.detail.cursorPosition;

            // Row shadow root
            let rowElement = this.shadow.querySelector(`outerbase-editor-row[data-index="${lineNumber}"]`)
            if (!rowElement || !rowElement.shadowRoot) return;
            let rowShadowRoot = rowElement.shadowRoot

            // Find the `slot` element in rowElement
            let slotElement = rowShadowRoot.querySelector('slot');

            // Find the `outerbase-editor-row-text` element in slotElement
            let rowTextElement = slotElement.assignedElements()[0].shadowRoot;

            if (!rowTextElement) return;
            let codeElement = rowTextElement.querySelector('#code');

            // Make codeElement contentEditable
            codeElement.contentEditable = true;
            codeElement.focus();

            // Move the cursor up to the line below at the same position if possible
            this.moveCursorToPosition(codeElement, cursorPosition);
        });

        this.addEventListener('action-left', (event) => {
            let lineNumber = event.detail.lineNumber;

            // Row shadow root
            let rowElement = this.shadow.querySelector(`outerbase-editor-row[data-index="${lineNumber - 2}"]`)
            if (!rowElement || !rowElement.shadowRoot) return;
            let rowShadowRoot = rowElement.shadowRoot

            // Find the `slot` element in rowElement
            let slotElement = rowShadowRoot.querySelector('slot');

            // Find the `outerbase-editor-row-text` element in slotElement
            let rowTextElement = slotElement.assignedElements()[0].shadowRoot;

            if (!rowTextElement) return;
            let codeElement = rowTextElement.querySelector('#code');

            // Make codeElement contentEditable
            codeElement.contentEditable = true;
            codeElement.focus();

            // Move the cursor of codeElement to the end of the line
            if (codeElement.childNodes.length === 0) return;
            this.moveCursorToPosition(codeElement, codeElement.childNodes[0].length);
        });

        this.addEventListener('action-right', (event) => {
            let lineNumber = event.detail.lineNumber;

            // Row shadow root
            let rowElement = this.shadow.querySelector(`outerbase-editor-row[data-index="${lineNumber}"]`)
            if (!rowElement || !rowElement.shadowRoot) return;
            let rowShadowRoot = rowElement.shadowRoot

            // Find the `slot` element in rowElement
            let slotElement = rowShadowRoot.querySelector('slot');

            // Find the `outerbase-editor-row-text` element in slotElement
            let rowTextElement = slotElement.assignedElements()[0].shadowRoot;

            if (!rowTextElement) return;
            let codeElement = rowTextElement.querySelector('#code');

            // Make codeElement contentEditable
            codeElement.contentEditable = true;
            codeElement.focus();
        });

        this.addEventListener('action-select-all', (event) => {
            let lineNumber = event.detail.lineNumber;
            
            let container = this.shadow.querySelector("#editor-rows");
            console.log('Select all: ', container);

            this.selectTextInDiv(container);
        });
    }

    selectTextInDiv(divElement) {
        // const selection = this.shadowRoot.getSelection ? this.shadowRoot.getSelection() : window.getSelection();

        // if (window.getSelection && document.createRange) {
            const range = document.createRange();
            range.selectNodeContents(divElement);
    
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        // }
    }

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

    getRowDataIndex(element) {
        const indexAttr = element.getAttribute('data-index');
        return indexAttr ? parseInt(indexAttr, 10) : null;
    }

    render() {
        this.container = this.shadow.querySelector("#editor-rows");
        this.container.innerHTML = ''
        this.rowData.forEach((item, index) => this.createAndAppendRow(item, index));
    }

    createAndAppendRow(data, index) {
        const editorRow = document.createElement("outerbase-editor-row");
        editorRow.setAttribute("line-number", index + 1);
        editorRow.setAttribute("data-index", index.toString());

        // If the text starts with OB:WASM:SOME_ID_HERE, then show the row as a special case
        if (data.value.startsWith("OB:WASM:")) {
            data.isBlock = true;
            
            // Get content after OB:WASM:
            let wasmId = data.value.substring(8);
            data.blockContent = wasmId;

            const specialDiv = document.createElement("div");
            specialDiv.style = "width: 400px; height: 80px; font-family: 'Monaco', 'Courier New', monospace; font-size: 13px; color: white; background-color: rgb(33, 33, 33); border: 1px solid rgb(60, 60, 60); border-radius: 8px; padding: 8px 16px; margin: 8px 0;";
            specialDiv.textContent = data.blockContent;
            specialDiv.setAttribute("line-number", index + 1);
            editorRow.appendChild(specialDiv);
        } else {
            // Create and append the outerbase-editor-row-text element
            const editorRowText = document.createElement("outerbase-editor-row-text");
            editorRowText.setAttribute("line-number", index + 1);
            editorRowText.setAttribute("value", data.value);
            editorRowText.setAttribute("read-only", data['read-only'] ? "true" : "false");
            editorRow.appendChild(editorRowText);
        }

        // Append the row to the container
        this.container.appendChild(editorRow);
        return editorRow;
    }
}

window.customElements.define("outerbase-editor", OuterbaseEditor);