var templateRow = document.createElement("template");
templateRow.innerHTML = `
<style>
    #container {
        display: flex;
        flex-direction: row;
        height: 40px;
        width: 100%;
        background-color: yellow;
        gap: 16px;
        align-items: center;
    }

    input {
        flex: 1;
        max-width: 300px;
    }
</style>

<div id="container">
    <div style="width: 16px;"></div>
    <div>HTTP</div>
    <div>GET</div>

    <input type="text" placeholder="Enter URL">
    <div style="flex: 1;"></div>

    <div>Play</div>
    <div style="width: 16px;"></div>
</div>
`;

// export default 
class OuterbaseActionBar extends HTMLElement {
    static get observedAttributes() {
        return [
            
        ];
    }

    constructor() {
        super();

        this.shadow = this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = templateRow.innerHTML;
    }

    connectedCallback() {
        
    }

    attributeChangedCallback(name, oldValue, newValue) {
        
    }

    render() {
        
    }
}

window.customElements.define("outerbase-action-bar", OuterbaseActionBar);