var templateConsole = document.createElement("template");
templateConsole.innerHTML = `
<style>
    #container {
        display: flex;
        flex-direction: column;
        height: 280px;
        width: 100%;
        background-color: yellow;
    }

    #tabs {
        display: flex;
        flex-direction: row;
        height: 40px;
        width: 100%;
        background-color: red;
    }

    .tab {
        padding: 0 36px;
        background-color: green;
        line-height: 40px;
    }

    .tab:hover {
        cursor: pointer;
        background-color: blue;
    }
</style>

<div id="container">
    <div id="tabs">
        <div class="tab">Logs</div>
        <div class="tab">Errors</div>
        <div class="tab">Deployments</div>
        <div class="tab">Tests</div>
        <div class="tab">Monitor</div>
    </div>

    <div id="contents">
        Contents
    </div>
</div>
`;

// export default 
class OuterbaseConsole extends HTMLElement {
    static get observedAttributes() {
        return [
            
        ];
    }

    constructor() {
        super();

        this.shadow = this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = templateConsole.innerHTML;
    }

    connectedCallback() {
        
    }

    attributeChangedCallback(name, oldValue, newValue) {
        
    }

    render() {
        
    }
}

window.customElements.define("outerbase-console", OuterbaseConsole);