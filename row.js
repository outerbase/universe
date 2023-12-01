var templateRow = document.createElement("template");
templateRow.innerHTML = `
<style>
    #container {
        display: flex;
    }

    #max-line-number {
        background-color: #171717;
        font-family: 'Monaco', 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.5;
        text-align: right;
        padding: 0px 20px;
        user-select: none;
        margin-right: 16px;
        height: 100%;
        color: transparent;
    }

    #line-number:hover {
        background-color: #292929;
        cursor: pointer;
    }

    #line-number {
        position: absolute;
        right: 16px;
        top: 0;
        width: 100%;
        height: 100%;
        text-align: right;
        padding-right: 10px;
        color: #4f4f4f;
        font-family: 'Monaco', 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.5;
    }

    #row {
        flex: 1;
        padding: 0 0px;
        position: relative;
    }
</style>

<div id="container">
    <!-- Max line number is invisible, but serves a purpose of helping define how wide the element should be so all line numbers match up -->
    <div style="position: relative;">
        <div id="max-line-number">1</div>
        <div id="line-number">1</div>
    </div>

    <!-- Row is the actual content we inject into the slot -->
    <div id="row">
        <slot></slot>
    </div>
</div>
`;

class OuterbaseEditorRow extends HTMLElement {
    static get observedAttributes() {
        return [
            "line-number",
            "max-line-number"
        ];
    }

    constructor() {
        super();

        this.shadow = this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = templateRow.innerHTML;
    }

    connectedCallback() {
        const dragHandle = this.shadowRoot.querySelector('#line-number');

        dragHandle.addEventListener('mousedown', () => {
            this.setAttribute('draggable', 'true');
        });

        this.addEventListener('dragend', () => {
            this.removeAttribute('draggable');
        });
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "line-number" && this.shadow.querySelector("#line-number")) {
            this.shadow.querySelector("#line-number").innerHTML = newValue;
        } else if (name === "max-line-number" && this.shadow.querySelector("#max-line-number")) {
            this.shadow.querySelector("#max-line-number").innerHTML = newValue;
        }
    }
}

window.customElements.define("outerbase-editor-row", OuterbaseEditorRow);