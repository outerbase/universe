const css = `
    :host {
        --font-family-mono: Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace;
        --font-size: 13px;
        --line-height: 18px;
        --padding-horizontal: 0 10px;
        
        --color-neutral-50: #fafafa;
        --color-neutral-200: #e5e5e5;
        --color-neutral-300: #d4d4d4;
        --color-neutral-400: #a3a3a3;
        --color-neutral-500: #737373;
        --color-neutral-600: #525252;
        --color-neutral-700: #404040;
        --color-neutral-800: #262626;
        --color-neutral-900: #171717;
        --color-primary-dark: white;
        --color-primary-light: black;

        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

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

    #outer-container {
        height: 100%; 
        display: flex; 
        flex-direction: column; 
        overflow: hidden; 
        position: relative;
    }

    #container {
        position: relative;
        height: calc(100% - 16px); /* Set the height to full minus pixels to account for custom scrollbar */
        width: 100%;
        margin: 0;
        display: flex;
        flex-direction: row;
    }

    #code-container {
        flex: 1;
        position: relative;
        overflow: scroll;
        min-height: 100%;

        -ms-overflow-style: none;  /* Internet Explorer 10+ */
        scrollbar-width: none;  /* Firefox */
    }

    #code-container::-webkit-scrollbar { 
        display: none;  /* Safari and Chrome */
    }

    textarea, code, .width-measure {
        padding: var(--padding-horizontal) !important;
        white-space: pre;
        overflow-wrap: normal;
        word-wrap: normal;
    }

    textarea {
        resize: none;
        outline: none;
        overflow: hidden;
    }

    pre, textarea, code, .width-measure {
        margin: 0 !important;
        min-height: 100%;
        min-width: calc(100% - 20px) !important;
        background-color: transparent !important;
        font-family: var(--font-family-mono);
        font-size: var(--font-size)  !important;
        line-height: var(--line-height) !important;
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
        padding: 0 !important;
    }

    code {
        pointer-events: none;
        position: absolute;
        top: 0px;
        left: 0px;
        width: calc(100% - 20px) !important;
        height: 100%;
        color: var(--color-primary-light);
    }

    .background-highlight {
        position: absolute;
        width: 100%;
        height: var(--line-height);
        background-color: var(--color-neutral-200);
        opacity: 0;
        z-index: 1;
        pointer-events: none;
        border-radius: 4px;
        transition: transform 0.2s;
    }

    .dark .background-highlight {
        background-color: var(--color-neutral-800);
    }

    .width-measure {
        font-family: var(--font-family-mono);
        font-size: var(--font-size) !important;
        line-height: var(--line-height) !important;
        visibility: hidden;
        /*white-space: pre;*/
        position: absolute;
        top: 0;
        left: 0;
    }
`;
export default css;