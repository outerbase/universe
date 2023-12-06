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
        padding: 0px 0px 0px 8px;
        height: 100%;
        color: transparent;
        -webkit-user-select: none; /* Safari */
        -ms-user-select: none; /* IE 10 and IE 11 */
        user-select: none; /* Standard syntax */
    }

    #line-number:hover {
        background-color: #292929;
        cursor: pointer;
    }

    #line-number {
        position: absolute;
        top: 0;
        height: 100%;
        text-align: right;
        color: #4f4f4f;
        font-family: 'Monaco', 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.5;
        -webkit-user-select: none; /* Safari */
        -ms-user-select: none; /* IE 10 and IE 11 */
        user-select: none; /* Standard syntax */
        padding-right: 8px;
    }

    #row {
        flex: 1;
        padding: 0 0px;
        position: relative;
        margin-left: 16px;
    }
</style>

<div id="container">
    <!-- Max line number is invisible, but serves a purpose of helping define how wide the element should be so all line numbers match up -->
    <div id="line-number-container" style="position: relative;">
        <div id="max-line-number">1</div>
        <div id="line-number">1</div>
    </div>

    <!-- Row is the actual content we inject into the slot -->
    <div id="row">
        <slot></slot>
    </div>
</div>
`;

// export default 
class OuterbaseEditorRow extends HTMLElement {
    static get observedAttributes() {
        return [
            "line-number",
            "max-line-number",
            "show-line-numbers",
            "readonly"
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
            if (this.getAttribute('readonly') === 'true') {
                return;
            }

            this.setAttribute('draggable', 'true');
        });

        this.addEventListener('dragend', () => {
            this.removeAttribute('draggable');
        });

        this.render()
    }

    attributeChangedCallback(name, oldValue, newValue) {        
        if (name === "line-number" && this.shadow.querySelector("#line-number")) {
            this.shadow.querySelector("#line-number").innerHTML = newValue;
        } else if (name === "max-line-number" && this.shadow.querySelector("#max-line-number")) {
            this.shadow.querySelector("#max-line-number").innerHTML = newValue;
        } else if (name === "show-line-numbers" && this.shadow.querySelector("#line-number-container")) {
            if (newValue === "true") {
                this.shadow.querySelector("#line-number-container").style.display = "block";
            } else {
                this.shadow.querySelector("#line-number-container").style.display = "none";
            }
        }

        this.render()
    }

    render() {
        // Make `line-number` the same width as `max-line-number`
        this.shadow.querySelector("#line-number").style.width = this.shadow.querySelector("#max-line-number").offsetWidth + "px";
    }
}

window.customElements.define("outerbase-editor-row", OuterbaseEditorRow);